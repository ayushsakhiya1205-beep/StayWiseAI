import os
import sys
import math
import json
import time
import random
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Ensure module path imports work
sys.path.append(str(Path(__file__).resolve().parent.parent))

from training.feature_engineering import FEATURE_NAMES, extract_features

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "generated"
MODELS_DIR = BASE_DIR / "models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

EVENT_WEIGHTS = {
    "VIEW": 1.0,
    "CLICK": 1.5,
    "WISHLIST": 3.0,
    "REVIEW": 4.0,
    "ENQUIRY": 5.0
}

def calculate_precision_at_k(y_true, y_pred, k=5, threshold=2.0):
    """
    Calculates Precision@K metric for a single user's candidates ranking.
    """
    if len(y_true) == 0:
        return 0.0
    k_eff = min(k, len(y_true))
    top_k_indices = np.argsort(y_pred)[::-1][:k_eff]
    relevant_in_top_k = sum(1 for idx in top_k_indices if y_true[idx] >= threshold)
    return relevant_in_top_k / k_eff

def calculate_ndcg_at_k(y_true, y_pred, k=5):
    """
    Calculates NDCG@K metric for a single user's candidates ranking.
    """
    if len(y_true) == 0:
        return 0.0
    k_eff = min(k, len(y_true))
    pred_order = np.argsort(y_pred)[::-1][:k_eff]
    ideal_order = np.argsort(y_true)[::-1][:k_eff]

    dcg = sum((2.0 ** y_true[idx] - 1.0) / np.log2(rank + 2) for rank, idx in enumerate(pred_order))
    idcg = sum((2.0 ** y_true[idx] - 1.0) / np.log2(rank + 2) for rank, idx in enumerate(ideal_order))

    if idcg == 0.0:
        return 1.0
    return dcg / idcg

def evaluate_user_rankings(df_test, model, preprocessor, k_list=[5, 10]):
    """
    Evaluates ranking performance (Precision@K and NDCG@K) grouped by user_id on held-out test data.
    """
    X_test_raw = df_test[FEATURE_NAMES].values
    X_test_scaled = preprocessor.transform(X_test_raw)
    y_pred_all = model.predict(X_test_scaled)
    df_test = df_test.copy()
    df_test["y_pred"] = y_pred_all

    metrics = {f"p_{k}": [] for k in k_list}
    metrics.update({f"ndcg_{k}": [] for k in k_list})

    grouped = df_test.groupby("user_id")
    for user_id, group in grouped:
        if len(group) < 2:
            continue
        y_t = group["relevance_label"].values
        y_p = group["y_pred"].values

        for k in k_list:
            metrics[f"p_{k}"].append(calculate_precision_at_k(y_t, y_p, k=k))
            metrics[f"ndcg_{k}"].append(calculate_ndcg_at_k(y_t, y_p, k=k))

    res = {}
    for k in k_list:
        res[f"precision_at_{k}"] = round(float(np.mean(metrics[f"p_{k}"])), 4) if metrics[f"p_{k}"] else 0.0
        res[f"ndcg_at_{k}"] = round(float(np.mean(metrics[f"ndcg_{k}"])), 4) if metrics[f"ndcg_{k}"] else 0.0

    return res

def run_training_pipeline():
    print("=" * 70)
    print("      STAYWISE ML RECOMMENDER — TRAINING & RANKING EVALUATION")
    print("=" * 70)

    # 1. Load Datasets
    training_csv_path = DATA_DIR / "training_dataset.csv"
    if not training_csv_path.exists():
        training_csv_path = BASE_DIR / "data" / "training_dataset.csv"

    print(f"\n[1/6] Loading training dataset from: {training_csv_path}")
    df = pd.read_csv(training_csv_path)
    print(f"      Total records loaded: {len(df):,}")

    # Column mapping & safety
    if "rent" in df.columns and "rent_monthly" not in df.columns:
        df["rent_monthly"] = df["rent"]
    if "rating_count" not in df.columns:
        df["rating_count"] = 0.0
    if "user_role" in df.columns:
        df["user_role"] = df["user_role"].apply(lambda r: 1.0 if str(r).strip().lower() in ["working professional", "working_professional", "professional"] else 0.0)

    # 2. Target Leakage & Correlation Verification
    print("\n[2/6] TARGET LEAKAGE CHECK & CORRELATION ANALYSIS")
    print("      Verifying interaction_score removal and inspecting feature correlations with relevance_label...")

    # Explicitly verify interaction_score is NOT in FEATURE_NAMES
    assert "interaction_score" not in FEATURE_NAMES, "CRITICAL ERROR: interaction_score found in FEATURE_NAMES!"
    print("      [PASSED] Programmatically verified: 'interaction_score' is NOT in model feature matrix X.")

    # Calculate correlation of all numeric features in df with target
    cols_to_check = [col for col in FEATURE_NAMES if col in df.columns] + (["interaction_score"] if "interaction_score" in df.columns else [])
    correlations = df[cols_to_check].apply(
        lambda col: df["relevance_label"].corr(col)
    )

    print("\n      --- Feature Correlations with Target (relevance_label) ---")
    for feat, corr_val in correlations.items():
        flag = " [LEAKAGE WARNING]" if feat == "interaction_score" or abs(corr_val) > 0.90 else ""
        print(f"      - {feat:<25}: {corr_val:+.4f}{flag}")

    if "interaction_score" in df.columns:
        print(f"\n      Note: interaction_score correlation with target is {correlations['interaction_score']:+.4f}. It is EXCLUDED from model training.")

    # 3. Chronological Train/Test Split
    print("\n[3/6] CHRONOLOGICAL TRAIN/TEST SPLIT")
    interactions_csv = DATA_DIR / "interactions.csv"
    if interactions_csv.exists():
        df_int = pd.read_csv(interactions_csv)
        df_int["timestamp"] = pd.to_datetime(df_int["timestamp"])
        df_int = df_int.sort_values("timestamp")

        split_idx = int(len(df_int) * 0.8)
        train_interactions = set(zip(df_int.iloc[:split_idx]["user_id"], df_int.iloc[:split_idx]["pg_id"]))
        test_interactions = set(zip(df_int.iloc[split_idx:]["user_id"], df_int.iloc[split_idx:]["pg_id"])) - train_interactions

        # Partition df rows based on pair membership
        pair_tuples = list(zip(df["user_id"], df["pg_id"]))
        is_test_mask = [pair in test_interactions for pair in pair_tuples]

        df_train = df[~np.array(is_test_mask)].copy()
        df_test = df[np.array(is_test_mask)].copy()

        # Fallback if partition is unbalanced
        if len(df_test) < 1000:
            print("      Notice: Chronological interaction split yielded small test set. Performing user-stratified split...")
            unique_users = df["user_id"].unique()
            np.random.seed(42)
            np.random.shuffle(unique_users)
            split_u = int(len(unique_users) * 0.8)
            train_users, test_users = set(unique_users[:split_u]), set(unique_users[split_u:])

            df_train = df[df["user_id"].isin(train_users)].copy()
            df_test = df[df["user_id"].isin(test_users)].copy()
    else:
        # User-based split
        unique_users = df["user_id"].unique()
        np.random.seed(42)
        np.random.shuffle(unique_users)
        split_u = int(len(unique_users) * 0.8)
        train_users, test_users = set(unique_users[:split_u]), set(unique_users[split_u:])

        df_train = df[df["user_id"].isin(train_users)].copy()
        df_test = df[df["user_id"].isin(test_users)].copy()

    print(f"      Training set size : {len(df_train):,} rows ({len(df_train)/len(df)*100:.1f}%)")
    print(f"      Testing set size  : {len(df_test):,} rows ({len(df_test)/len(df)*100:.1f}%)")

    X_train = df_train[FEATURE_NAMES].values
    y_train = df_train["relevance_label"].values
    X_test = df_test[FEATURE_NAMES].values
    y_test = df_test["relevance_label"].values

    # 4. Feature Scaling & Preprocessor
    print("\n[4/6] BUILDING PREPROCESSING PIPELINE")
    preprocessor = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    X_train_scaled = preprocessor.fit_transform(X_train)
    X_test_scaled = preprocessor.transform(X_test)
    print("      StandardScaler + SimpleImputer pipeline fitted successfully.")

    # 5. Train Candidates (Random Forest vs Gradient Boosting)
    print("\n[5/6] TRAINING CANDIDATE MODELS")
    print("      Model 1: RandomForestRegressor (n_estimators=100, max_depth=12)")
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_scaled, y_train)

    print("      Model 2: GradientBoostingRegressor (n_estimators=100, max_depth=6, learning_rate=0.1)")
    gbr_model = GradientBoostingRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
    gbr_model.fit(X_train_scaled, y_train)

    # 6. Evaluation & Selection
    print("\n[6/6] MODEL EVALUATION ON HELD-OUT TEST SET")

    # Evaluate RF
    rf_preds = rf_model.predict(X_test_scaled)
    rf_mse = float(mean_squared_error(y_test, rf_preds))
    rf_r2 = float(r2_score(y_test, rf_preds))
    rf_rank_metrics = evaluate_user_rankings(df_test, rf_model, preprocessor, k_list=[5, 10])

    # Evaluate GBR
    gbr_preds = gbr_model.predict(X_test_scaled)
    gbr_mse = float(mean_squared_error(y_test, gbr_preds))
    gbr_r2 = float(r2_score(y_test, gbr_preds))
    gbr_rank_metrics = evaluate_user_rankings(df_test, gbr_model, preprocessor, k_list=[5, 10])

    print("\n" + "=" * 75)
    print(f"{'Model Algorithm':<25} | {'Precision@5':<12} | {'NDCG@5':<10} | {'Precision@10':<12} | {'NDCG@10':<10}")
    print("-" * 75)
    print(f"{'Random Forest':<25} | {rf_rank_metrics['precision_at_5']:<12.4f} | {rf_rank_metrics['ndcg_at_5']:<10.4f} | {rf_rank_metrics['precision_at_10']:<12.4f} | {rf_rank_metrics['ndcg_at_10']:<10.4f}")
    print(f"{'Gradient Boosting':<25} | {gbr_rank_metrics['precision_at_5']:<12.4f} | {gbr_rank_metrics['ndcg_at_5']:<10.4f} | {gbr_rank_metrics['precision_at_10']:<12.4f} | {gbr_rank_metrics['ndcg_at_10']:<10.4f}")
    print("=" * 75)

    # Selection decision: Compare NDCG@5 first, then Precision@5
    if (gbr_rank_metrics['ndcg_at_5'], gbr_rank_metrics['precision_at_5']) >= (rf_rank_metrics['ndcg_at_5'], rf_rank_metrics['precision_at_5']):
        best_model = gbr_model
        best_algo_name = "GradientBoostingRegressor"
        best_metrics = gbr_rank_metrics
        best_r2 = gbr_r2
        best_mse = gbr_mse
    else:
        best_model = rf_model
        best_algo_name = "RandomForestRegressor"
        best_metrics = rf_rank_metrics
        best_r2 = rf_r2
        best_mse = rf_mse

    print(f"\n >>> SELECTED MODEL: {best_algo_name} (NDCG@5: {best_metrics['ndcg_at_5']:.4f}, Precision@5: {best_metrics['precision_at_5']:.4f})")

    # 7. Save Artifacts
    version_str = f"v{int(time.time())}"
    model_path = MODELS_DIR / f"staywise_model_{version_str}.pkl"
    active_model_path = MODELS_DIR / "active_model.pkl"
    staywise_model_path = MODELS_DIR / "staywise_model.pkl"

    preproc_path = MODELS_DIR / f"staywise_preprocessor_{version_str}.pkl"
    active_preproc_path = MODELS_DIR / "active_preprocessor.pkl"
    staywise_preproc_path = MODELS_DIR / "staywise_preprocessor.pkl"

    metadata_path = MODELS_DIR / "model_metadata.json"

    joblib.dump(best_model, model_path)
    joblib.dump(best_model, active_model_path)
    joblib.dump(best_model, staywise_model_path)

    joblib.dump(preprocessor, preproc_path)
    joblib.dump(preprocessor, active_preproc_path)
    joblib.dump(preprocessor, staywise_preproc_path)

    metadata = {
        "version": version_str,
        "algorithm": best_algo_name,
        "trainedAt": str(pd.Timestamp.now()),
        "feature_list": FEATURE_NAMES,
        "sampleCount": len(df),
        "trainRows": len(df_train),
        "testRows": len(df_test),
        "precisionAtK": best_metrics["precision_at_5"],
        "ndcgAtK": best_metrics["ndcg_at_5"],
        "precisionAt10": best_metrics["precision_at_10"],
        "ndcgAt10": best_metrics["ndcg_at_10"],
        "r2Score": round(best_r2, 4),
        "mse": round(best_mse, 4)
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nArtifacts successfully saved to: {MODELS_DIR.resolve()}")
    print(f" - Model        : staywise_model.pkl & active_model.pkl ({version_str})")
    print(f" - Preprocessor : staywise_preprocessor.pkl & active_preprocessor.pkl")
    print(f" - Metadata     : model_metadata.json")
    print("=" * 70 + "\n")

    return metadata

if __name__ == "__main__":
    run_training_pipeline()
