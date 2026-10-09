import numpy as np
import pandas as pd
import math

FEATURE_NAMES = [
    "distance_km",
    "distance_score",
    "rent_monthly",
    "budget_min",
    "budget_max",
    "price_fit_score",
    "ac_match",
    "food_match",
    "wifi_match",
    "bike_parking_match",
    "car_parking_match",
    "laundry_match",
    "power_backup_match",
    "geyser_match",
    "furnished_match",
    "room_match",
    "sharing_match",
    "gender_match",
    "amenity_match_pct",
    "rating",
    "rating_score",
    "rating_count",
    "user_role"
]

def calculate_haversine(lat1, lon1, lat2, lon2):
    """
    Calculates geographic distance using Haversine formula (returns distance in km).
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 5.0

    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
    except (ValueError, TypeError):
        return 5.0

    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 3)

def calculate_price_fit_score(rent, min_rent, max_rent):
    """
    Continuous price fit score calculation (1.0 inside budget, decaying score outside).
    """
    try:
        rent = float(rent)
        min_rent = float(min_rent) if min_rent is not None else 0.0
        max_rent = float(max_rent) if max_rent is not None and float(max_rent) > 0 else 50000.0
    except (ValueError, TypeError):
        return 1.0

    if max_rent > 0:
        if min_rent <= rent <= max_rent:
            return 1.0
        elif rent < min_rent:
            return 0.9
        else:
            overflow = (rent - max_rent) / max(1.0, max_rent)
            return round(max(0.1, 1.0 - overflow * 1.5), 4)
    return 1.0

def extract_features(pg, user_prefs, landmark_coords):
    """
    Extracts feature vector for a single candidate PG given user preferences and target landmark coordinates.
    Seamlessly supports all property name conventions across MongoDB documents and CSV rows.
    """
    user_role_str = str(user_prefs.get("userRole", user_prefs.get("user_role", "student"))).lower()
    user_role_code = 1.0 if user_role_str in ["working professional", "working_professional", "professional"] else 0.0

    min_rent = float(user_prefs.get("minRent", user_prefs.get("budget_min", 0)) or 0)
    max_rent = float(user_prefs.get("maxRent", user_prefs.get("budget_max", 50000)) or 50000)

    target_lat = float(landmark_coords.get("latitude", 23.0225) if landmark_coords else 23.0225)
    target_lon = float(landmark_coords.get("longitude", 72.5714) if landmark_coords else 72.5714)

    pg_lat = float(pg.get("latitude", target_lat) or target_lat)
    pg_lon = float(pg.get("longitude", target_lon) or target_lon)

    dist_km = calculate_haversine(target_lat, target_lon, pg_lat, pg_lon)
    dist_score = round(1.0 / (1.0 + dist_km / 2.0), 4)

    rent = float(pg.get("rent", pg.get("rent_monthly", 0)) or 0)
    price_score = calculate_price_fit_score(rent, min_rent, max_rent)

    # AC Match
    ac_pref = str(user_prefs.get("acType", user_prefs.get("ac_preference", "any"))).lower()
    pg_ac_val = pg.get("acType", pg.get("ac_available", "any"))
    if isinstance(pg_ac_val, (int, float)):
        pg_ac_str = "ac" if pg_ac_val == 1 else "non-ac"
    else:
        pg_ac_str = str(pg_ac_val).lower()
    ac_match = 1.0 if (ac_pref == "any" or pg_ac_str in [ac_pref, "both"]) else 0.0

    # Food Match
    food_req = bool(user_prefs.get("foodRequired", user_prefs.get("food_preference") in ["Required", "Preferred", True]))
    pg_food = bool(pg.get("foodAvailable", pg.get("food_available", False)))
    food_match = 1.0 if (not food_req or pg_food) else 0.0

    # Wi-Fi Match
    wifi_req = bool(user_prefs.get("wifiRequired", user_prefs.get("wifi_preference") in ["Required", "Preferred", True]))
    pg_wifi = bool(pg.get("wifiAvailable", pg.get("wifi_available", False)))
    wifi_match = 1.0 if (not wifi_req or pg_wifi) else 0.0

    # Parking Match
    parking_pref = str(user_prefs.get("parkingType", user_prefs.get("bike_parking_preference", "any"))).lower()
    pg_bike = bool(pg.get("bike_parking", pg.get("parkingType") in ["bike", "both"]))
    pg_car = bool(pg.get("car_parking", pg.get("parkingType") in ["car", "both"]))

    bike_match = 1.0 if (parking_pref not in ["bike", "both"] or pg_bike) else 0.0
    car_match = 1.0 if (parking_pref not in ["car", "both"] or pg_car) else 0.0

    # Laundry Match
    laundry_req = bool(user_prefs.get("laundryRequired", user_prefs.get("laundry_preference") in ["Required", "Preferred", True]))
    pg_laundry = bool(pg.get("laundryAvailable", pg.get("laundry_available", False)))
    laundry_match = 1.0 if (not laundry_req or pg_laundry) else 0.0

    # Power Backup Match
    power_req = bool(user_prefs.get("powerBackupRequired", user_prefs.get("power_backup_preference") in ["Required", "Preferred", True]))
    pg_power = bool(pg.get("powerBackup", pg.get("power_backup", False)))
    power_backup_match = 1.0 if (not power_req or pg_power) else 0.0

    # Geyser Match
    geyser_req = bool(user_prefs.get("geyserRequired", user_prefs.get("geyser_preference") in ["Required", "Preferred", True]))
    pg_geyser = bool(pg.get("geyserAvailable", pg.get("geyser_available", False)))
    geyser_match = 1.0 if (not geyser_req or pg_geyser) else 0.0

    # Furnishing Match
    furnishing_pref = str(user_prefs.get("furnishingType", user_prefs.get("furnished_preference", "any"))).lower()
    pg_furnishing = str(pg.get("furnishingType", pg.get("furnished_type", "any"))).lower()
    furnished_match = 1.0 if (furnishing_pref == "any" or pg_furnishing == furnishing_pref) else 0.0

    # Room Type Match
    room_pref = str(user_prefs.get("roomType", user_prefs.get("preferred_room_type", "any"))).lower()
    pg_room = pg.get("roomType", pg.get("roomTypes", pg.get("room_type", "any")))
    if isinstance(pg_room, list):
        pg_room_strs = [str(r).lower() for r in pg_room]
        room_match = 1.0 if (room_pref == "any" or room_pref in pg_room_strs) else 0.0
    else:
        pg_room_str = str(pg_room).lower()
        room_match = 1.0 if (room_pref == "any" or pg_room_str == room_pref) else 0.0

    # Sharing Match
    sharing_pref = str(user_prefs.get("sharingType", user_prefs.get("preferred_sharing_type", "any"))).lower()
    pg_sharing = str(pg.get("sharingType", pg.get("sharing_type", "any"))).lower()
    sharing_match = 1.0 if (sharing_pref == "any" or pg_sharing == sharing_pref) else 0.0

    # Gender Preference Match
    gender_pref = str(user_prefs.get("genderPreference", user_prefs.get("preferred_gender", "any"))).lower()
    pg_gender = str(pg.get("genderPreference", pg.get("gender_preference", "any"))).lower()
    gender_match = 1.0 if (gender_pref == "any" or pg_gender in [gender_pref, "co-ed", "coed"]) else 0.0

    matches = [ac_match, food_match, wifi_match, bike_match, car_match, laundry_match, power_backup_match, geyser_match, furnished_match, room_match, sharing_match, gender_match]
    amenity_match_pct = round(float(sum(matches) / len(matches)), 4)

    rating = float(pg.get("ratingAverage", pg.get("rating", 4.0)) or 4.0)
    rating_score = round(rating / 5.0, 4)
    rating_count = float(pg.get("ratingCount", pg.get("rating_count", 0)) or 0)

    return [
        dist_km,
        dist_score,
        rent,
        min_rent,
        max_rent,
        price_score,
        ac_match,
        food_match,
        wifi_match,
        bike_match,
        car_match,
        laundry_match,
        power_backup_match,
        geyser_match,
        furnished_match,
        room_match,
        sharing_match,
        gender_match,
        amenity_match_pct,
        rating,
        rating_score,
        rating_count,
        user_role_code
    ]

def prepare_feature_matrix(candidates, user_prefs, landmark_coords):
    """
    Creates Pandas DataFrame of feature vectors for a list of candidate PGs.
    """
    rows = []
    for pg in candidates:
        feat = extract_features(pg, user_prefs, landmark_coords)
        rows.append(feat)
    df = pd.DataFrame(rows, columns=FEATURE_NAMES)
    return df
