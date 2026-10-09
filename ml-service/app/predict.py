import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

from app.feature_engineering import prepare_feature_matrix, calculate_haversine
from app.model_manager import load_active_model_and_preprocessor
from app.cold_start import compute_cold_start_scores

def format_dynamic_reason(pg: Dict[str, Any], user_prefs: Dict[str, Any], distance_km: float, match_pct: int) -> str:
    """
    Generates dynamic, feature-grounded recommendation explanation.
    """
    rent = float(pg.get("rent", pg.get("rent_monthly", 0)) or 0)
    max_rent = float(user_prefs.get("maxRent", 50000) or 50000)
    min_rent = float(user_prefs.get("minRent", 0) or 0)

    reasons = []

    # Budget reason
    if max_rent > 0 and rent <= max_rent:
        reasons.append(f"Fits ₹{int(rent):,}/mo budget")
    elif min_rent > 0 and rent < min_rent:
        reasons.append(f"Below budget (₹{int(rent):,}/mo)")
    else:
        reasons.append(f"₹{int(rent):,}/mo rent")

    # Proximity reason
    reasons.append(f"{distance_km} km away")

    # Amenities matched
    amenities = []
    if pg.get("acAvailable", pg.get("acType") in ["ac", "both"]):
        amenities.append("AC")
    if pg.get("foodAvailable", pg.get("food_available")):
        amenities.append("Food")
    if pg.get("wifiAvailable", pg.get("wifi_available")):
        amenities.append("Wi-Fi")

    if amenities:
        reasons.append(", ".join(amenities) + " available")

    rating = float(pg.get("ratingAverage", pg.get("rating", 4.0)) or 4.0)
    reasons.append(f"{rating}★ rating")

    return f"✓ " + " | ✓ ".join(reasons)

def predict_and_rank_candidates(candidates: List[Dict[str, Any]], user_prefs: Dict[str, Any], landmark_coords: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Predicts relevance scores using active ML model + preprocessor, sorting candidates by predicted score.
    Falls back gracefully to weighted cold start if ML model is unavailable.
    """
    if not candidates:
        return {"mode": "Smart Match", "results": []}

    model, preprocessor, metadata = load_active_model_and_preprocessor()

    if model is not None and preprocessor is not None:
        try:
            # 1. Feature engineering
            df_features = prepare_feature_matrix(candidates, user_prefs, landmark_coords)

            # 2. Preprocess feature matrix using saved preprocessor
            X_scaled = preprocessor.transform(df_features.values)

            # 3. Predict raw relevance score (0..5 scale)
            raw_predictions = model.predict(X_scaled)

            # 4. Cold start computations for fallback values and distance
            base_results = compute_cold_start_scores(candidates, user_prefs, landmark_coords)
            base_map = {item["id"]: item for item in base_results}

            algorithm_name = metadata.get("algorithm", type(model).__name__) if metadata else type(model).__name__

            min_pred = float(np.min(raw_predictions))
            max_pred = float(np.max(raw_predictions))
            pred_range = max(0.0001, max_pred - min_pred)

            final_results = []
            for idx, pg in enumerate(candidates):
                pg_id = str(pg.get("id", pg.get("_id", idx)))
                base_item = base_map.get(pg_id, {})
                dist_km = base_item.get("distanceKm", 1.5)

                raw_score = float(raw_predictions[idx])

                # Relative & absolute hybrid scaling to produce realistic, smooth 0.50..0.98 match scores
                if len(candidates) > 1 and pred_range > 0.05:
                    rel_ratio = (raw_score - min_pred) / pred_range
                    norm_score = 0.65 + rel_ratio * 0.30
                else:
                    norm_score = min(0.98, max(0.50, raw_score / 5.0 + 0.40))

                match_pct = int(round(norm_score * 100))
                reason_text = format_dynamic_reason(pg, user_prefs, dist_km, match_pct)

                final_results.append({
                    "id": pg_id,
                    "name": pg.get("name"),
                    "score": round(norm_score, 4),
                    "matchScore": match_pct,
                    "distanceKm": dist_km,
                    "indicators": base_item.get("indicators", {}),
                    "reason": reason_text,
                    "featureScores": base_item.get("featureScores", {})
                })

            # Sort descending by prediction score
            final_results.sort(key=lambda x: x["score"], reverse=True)

            # Assign rank 1..N
            for rank_idx, item in enumerate(final_results):
                item["rank"] = rank_idx + 1

            return {
                "mode": f"AI Personalized ({algorithm_name})",
                "results": final_results
            }

        except Exception as e:
            print(f"[ML Prediction Warning] Error during ML inference ({e}). Falling back to Cold Start Engine.")

    # Cold start fallback
    base_results = compute_cold_start_scores(candidates, user_prefs, landmark_coords)
    return {
        "mode": "Smart Match (Cold Start Fallback)",
        "results": base_results
    }
