import math

def calculate_haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lon points."""
    if not lat1 or not lon1 or not lat2 or not lon2:
        return 5.0

    R = 6371.0 # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def compute_cold_start_scores(candidates, user_prefs, landmark_coords):
    """
    Computes heuristic recommendation score for candidate PGs.
    """
    user_role = user_prefs.get("userRole", "student")
    min_rent = float(user_prefs.get("minRent", 0))
    max_rent = float(user_prefs.get("maxRent", 50000))
    ac_type = user_prefs.get("acType", "any")
    food_req = user_prefs.get("foodRequired", False)
    wifi_req = user_prefs.get("wifiRequired", False)
    parking_type = user_prefs.get("parkingType", "any")
    laundry_req = user_prefs.get("laundryRequired", False)
    geyser_req = user_prefs.get("geyserRequired", False)

    target_lat = landmark_coords.get("latitude", 23.0225) if landmark_coords else 23.0225
    target_lon = landmark_coords.get("longitude", 72.5714) if landmark_coords else 72.5714

    is_pro = user_role == "working_professional"
    w_dist = 0.25
    w_price = 0.20 if is_pro else 0.30
    w_amenity = 0.35 if is_pro else 0.30
    w_rating = 0.20 if is_pro else 0.15

    results = []

    for pg in candidates:
        pg_lat = pg.get("latitude", 0)
        pg_lon = pg.get("longitude", 0)
        dist_km = calculate_haversine(target_lat, target_lon, pg_lat, pg_lon)

        # 1. Distance score (decay function)
        dist_score = 1.0 / (1.0 + dist_km / 2.0)

        # 2. Price fit score
        rent = float(pg.get("rent", 0))
        price_score = 1.0
        if max_rent > 0:
            if min_rent <= rent <= max_rent:
                price_score = 1.0
            elif rent < min_rent:
                price_score = 0.9
            else:
                overflow = (rent - max_rent) / max_rent
                price_score = max(0.1, 1.0 - overflow * 1.5)

        # 3. Amenity match score
        total_req = 0
        matched = 0

        if ac_type and ac_type != "any":
            total_req += 1
            if pg.get("acType") in [ac_type, "both"]:
                matched += 1

        if food_req:
            total_req += 1
            if pg.get("foodAvailable"):
                matched += 1

        if wifi_req:
            total_req += 1
            if pg.get("wifiAvailable"):
                matched += 1

        if parking_type and parking_type not in ["any", "none"]:
            total_req += 1
            if pg.get("parkingType") in [parking_type, "both"]:
                matched += 1

        if laundry_req:
            total_req += 1
            if pg.get("laundryAvailable"):
                matched += 1

        if geyser_req:
            total_req += 1
            if pg.get("geyserAvailable"):
                matched += 1

        amenity_match_pct = matched / total_req if total_req > 0 else 1.0
        rating_score = (pg.get("ratingAverage", 4.0)) / 5.0

        raw_score = (w_dist * dist_score +
                     w_price * price_score +
                     w_amenity * amenity_match_pct +
                     w_rating * rating_score)

        match_pct = int(round(min(0.99, max(0.40, raw_score)) * 100))

        indicators = {
            "distance": "Excellent" if dist_km <= 1.5 else ("Good" if dist_km <= 3.5 else "Moderate"),
            "budget": "Fits Budget" if rent <= max_rent else "Above Budget",
            "amenities": f"{int(round(amenity_match_pct * 100))}% Matched",
            "rating": f"{pg.get('ratingAverage', 4.0)} ★"
        }

        matched_list = []
        if pg.get("wifiAvailable") and wifi_req:
            matched_list.append("Wi-Fi")
        if pg.get("foodAvailable") and food_req:
            matched_list.append("Food")
        if pg.get("acType") in ["ac", "both"] and ac_type == "ac":
            matched_list.append("AC")

        feat_str = ", ".join(matched_list) if matched_list else "essential facilities"
        reason = f"Excellent match! Only {dist_km} km away, fits your ₹{int(rent):,}/mo budget, matches {feat_str}, and rated {pg.get('ratingAverage', 4.0)}/5."

        results.append({
            "id": pg.get("id"),
            "name": pg.get("name"),
            "score": round(raw_score, 4),
            "matchScore": match_pct,
            "distanceKm": dist_km,
            "indicators": indicators,
            "reason": reason,
            "featureScores": {
                "distanceScore": round(dist_score, 2),
                "priceFitScore": round(price_score, 2),
                "amenityMatchPct": round(amenity_match_pct, 2),
                "ratingScore": round(rating_score, 2)
            }
        })

    # Sort descending
    results.sort(key=lambda x: x["score"], reverse=True)
    for idx, item in enumerate(results):
        item["rank"] = idx + 1

    return results
