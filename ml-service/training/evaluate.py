import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from training.feature_engineering import FEATURE_NAMES

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "generated"
MODELS_DIR = BASE_DIR / "models"

def calculate_precision_at_k(y_true, y_pred, k=5, threshold=2.0):
    if len(y_true) == 0:
        return 0.0
    k_eff = min(k, len(y_true))
    top_k_indices = np.argsort(y_pred)[::-1][:k_eff]
    relevant_in_top_k = sum(1 for idx in top_k_indices if y_true[idx] >= threshold)
    return relevant_in_top_k / k_eff

def calculate_ndcg_at_k(y_true, y_pred, k=5):
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

def evaluate_saved_model():
    print("=" * 70)
    print("      STAYWISE INDEPENDENT MODEL EVALUATION REPORT")
    print("=" * 70)

    model_path = MODELS_DIR / "active_model.pkl"
    preproc_path = MODELS_DIR / "active_preprocessor.pkl"
    metadata_path = MODELS_DIR / "model_metadata.json"

    if not model_path.exists() or not preproc_path.exists():
        print("[ERROR] Active model or preprocessor artifact not found!")
        return

    model = joblib.load(model_path)
    preprocessor = joblib.load(preproc_path)
    metadata = {}
    if metadata_path.exists():
        with open(metadata_path, "r") as f:
            metadata = json.load(f)

    print(f"\n[Artifact Info]")
    print(f" - Version     : {metadata.get('version', 'Unknown')}")
    print(f" - Algorithm   : {metadata.get('algorithm', str(type(model).__name__))}")
    print(f" - Trained At  : {metadata.get('trainedAt', 'Unknown')}")

    training_csv = DATA_DIR / "training_dataset.csv"
    if not training_csv.exists():
        training_csv = BASE_DIR / "data" / "training_dataset.csv"

    df = pd.read_csv(training_csv)
    if "user_role" in df.columns:
        df["user_role"] = df["user_role"].apply(lambda r: 1.0 if str(r).strip().lower() in ["working professional", "working_professional", "professional"] else 0.0)

    if "rating_count" not in df.columns:
        df["rating_count"] = 0.0
    if "rent_monthly" not in df.columns and "rent" in df.columns:
        df["rent_monthly"] = df["rent"]

    # Use 20% test partition
    unique_users = np.array(df["user_id"].unique())
    np.random.seed(42)
    np.random.shuffle(unique_users)
    split_u = int(len(unique_users) * 0.8)
    test_users = set(unique_users[split_u:])
    df_test = df[df["user_id"].isin(test_users)].copy()

    X_test_raw = df_test[FEATURE_NAMES].values
    y_test = df_test["relevance_label"].values

    X_test_scaled = preprocessor.transform(X_test_raw)
    y_pred = model.predict(X_test_scaled)
    df_test["y_pred"] = y_pred

    metrics = {f"p_{k}": [] for k in [5, 10]}
    metrics.update({f"ndcg_{k}": [] for k in [5, 10]})

    for _, group in df_test.groupby("user_id"):
        if len(group) < 2:
            continue
        y_t = group["relevance_label"].values
        y_p = group["y_pred"].values
        for k in [5, 10]:
            metrics[f"p_{k}"].append(calculate_precision_at_k(y_t, y_p, k=k))
            metrics[f"ndcg_{k}"].append(calculate_ndcg_at_k(y_t, y_p, k=k))

    p5 = round(float(np.mean(metrics["p_5"])), 4)
    ndcg5 = round(float(np.mean(metrics["ndcg_5"])), 4)
    p10 = round(float(np.mean(metrics["p_10"])), 4)
    ndcg10 = round(float(np.mean(metrics["ndcg_10"])), 4)

    print("\n[Held-Out Test Ranking Evaluation]")
    print(f" - Precision@5  : {p5:.4f}")
    print(f" - NDCG@5       : {ndcg5:.4f}")
    print(f" - Precision@10 : {p10:.4f}")
    print(f" - NDCG@10      : {ndcg10:.4f}")
    print("=" * 70 + "\n")

    return {
        "precision_at_5": p5,
        "ndcg_at_5": ndcg5,
        "precision_at_10": p10,
        "ndcg_at_10": ndcg10
    }

if __name__ == "__main__":
    evaluate_saved_model()
