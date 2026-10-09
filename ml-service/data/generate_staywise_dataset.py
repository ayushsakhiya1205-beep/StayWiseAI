import os
import math
import random
import datetime
from pathlib import Path
import numpy as np
import pandas as pd

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
GENERATED_DIR = BASE_DIR / "generated"
PROJECT_DATA_DIR = BASE_DIR.parent.parent / "data"

GENERATED_DIR.mkdir(parents=True, exist_ok=True)
PROJECT_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Geographic Configuration for Gujarat & Maharashtra
CITIES = {
    # GUJARAT
    "Ahmedabad": {
        "state": "Gujarat", "tier": 2, "lat": 23.0225, "lon": 72.5714,
        "areas": ["Navrangpura", "Vastrapur", "Prahlad Nagar", "Bodakdev", "Satellite", "Gota", "Chandkheda", "Ellisbridge", "Ambawadi", "Nikol", "SG Highway", "Maninagar"]
    },
    "Vadodara": {
        "state": "Gujarat", "tier": 2, "lat": 22.3072, "lon": 73.1812,
        "areas": ["Fatehgunj", "Alkapuri", "Gotri", "Vasna", "Akota", "Manjalpur", "Subhanpura", "Sayajigunj", "Waghodia Road", "Karelibaug"]
    },
    "Surat": {
        "state": "Gujarat", "tier": 2, "lat": 21.1702, "lon": 72.8311,
        "areas": ["Adajan", "Vesu", "Piplod", "City Light", "Athwa", "Katargam", "Varachha", "Nana Varachha", "Rander", "Udhna", "Pal"]
    },
    "Rajkot": {
        "state": "Gujarat", "tier": 3, "lat": 22.3039, "lon": 70.8022,
        "areas": ["Race Course", "Kalawad Road", "150 Feet Ring Road", "University Road", "Mavdi", "Raiya Road", "Gondal Road"]
    },
    "Gandhinagar": {
        "state": "Gujarat", "tier": 3, "lat": 23.2156, "lon": 72.6369,
        "areas": ["Sector 7", "Sector 11", "Sector 16", "Sector 21", "Sector 28", "Infocity", "Koba", "Raisan"]
    },
    "Anand": {
        "state": "Gujarat", "tier": 3, "lat": 22.5645, "lon": 72.9289,
        "areas": ["Vallabh Vidyanagar", "Anand-Vidyanagar Road", "Grid Road", "Sardar Gunj"]
    },
    "Nadiad": {
        "state": "Gujarat", "tier": 3, "lat": 22.6916, "lon": 72.8620,
        "areas": ["College Road", "Station Road", "Santram Road"]
    },
    "Vapi": {
        "state": "Gujarat", "tier": 3, "lat": 20.3893, "lon": 72.9106,
        "areas": ["Vapi GIDC", "Chanod", "Silvassa Road", "Gunjan"]
    },
    "Bhavnagar": {
        "state": "Gujarat", "tier": 3, "lat": 21.7645, "lon": 72.1519,
        "areas": ["Waghawadi Road", "Ghogha Circle", "Kaliyabid", "Sardarnagar"]
    },
    "Jamnagar": {
        "state": "Gujarat", "tier": 3, "lat": 22.4707, "lon": 70.0577,
        "areas": ["Pandit Nehru Marg", "Patel Colony", "Digvijay Plot", "Bedi Bandar Road"]
    },
    "Mehsana": {
        "state": "Gujarat", "tier": 3, "lat": 23.6000, "lon": 72.4000,
        "areas": ["Radhanpur Road", "Highway Road", "Modhera Road"]
    },

    # MAHARASHTRA
    "Pune": {
        "state": "Maharashtra", "tier": 1, "lat": 18.5204, "lon": 73.8567,
        "areas": ["Kothrud", "Viman Nagar", "Hinjewadi", "Wakad", "Aundh", "Baner", "Shivaji Nagar", "Magarpatta", "Kharadi", "Katraj", "Kondhwa", "Warje", "Hadapsar", "Deccan Gymkhana", "Pimple Saudagar", "Wagholi"]
    },
    "Mumbai": {
        "state": "Maharashtra", "tier": 1, "lat": 19.0760, "lon": 72.8777,
        "areas": ["Andheri West", "Andheri East", "Bandra", "Powai", "Malad", "Borivali", "Goregaon", "Santacruz", "Vile Parle", "Mulund", "Ghatkopar", "Kurla", "Dadar", "Chembur", "Jogeshwari", "Kandivali"]
    },
    "Navi Mumbai": {
        "state": "Maharashtra", "tier": 2, "lat": 19.0330, "lon": 73.0297,
        "areas": ["Vashi", "Kharghar", "Nerul", "Airoli", "Belapur", "Panvel", "Kopar Khairane"]
    },
    "Thane": {
        "state": "Maharashtra", "tier": 2, "lat": 19.2183, "lon": 72.9781,
        "areas": ["Ghodbunder Road", "Majiwada", "Manpada", "Vartak Nagar", "Naupada", "Kolshet Road", "Thane West"]
    },
    "Nagpur": {
        "state": "Maharashtra", "tier": 2, "lat": 21.1458, "lon": 79.0882,
        "areas": ["Dharampeth", "Ramdaspeth", "Civil Lines", "Sadar", "Wardha Road", "Trimurti Nagar", "Sitabuldi", "Manish Nagar"]
    },
    "Nashik": {
        "state": "Maharashtra", "tier": 2, "lat": 19.9975, "lon": 73.7898,
        "areas": ["College Road", "Gangapur Road", "Indira Nagar", "Panchavati", "Nashik Road", "Sharanpur Road"]
    },
    "Chhatrapati Sambhajinagar": {
        "state": "Maharashtra", "tier": 3, "lat": 19.8762, "lon": 75.3433,
        "areas": ["CIDCO", "Garkheda", "Jalna Road", "Osmanpura", "Cidco N-5"]
    },
    "Kolhapur": {
        "state": "Maharashtra", "tier": 3, "lat": 16.7050, "lon": 74.2433,
        "areas": ["Rajarampuri", "Tarabai Park", "Kawala Naka", "Shivaji University Road"]
    },
    "Nanded": {
        "state": "Maharashtra", "tier": 3, "lat": 19.1383, "lon": 77.3210,
        "areas": ["VIP Road", "Taroda Naka", "Vazirabad", "Nanded GIDC"]
    },
    "Amravati": {
        "state": "Maharashtra", "tier": 3, "lat": 20.9374, "lon": 77.7796,
        "areas": ["Camp Area", "Gadge Nagar", "Rajapeth"]
    }
}

# Helper: Haversine distance
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Name Generators
PG_PREFIXES = ["Happy", "Divine", "Serene", "Royal", "Elite", "Sunshine", "Star", "Golden", "Silver", "Vraj", "Shree", "Krishna", "Radha", "Sai", "Ganesh", "Om", "Modern", "Legacy", "Nest", "Comfort", "Zenith", "Urban", "Metro", "City", "New", "Nirvana", "Blue", "Cozy"]
PG_SUFFIXES = ["Home", "Residency", "Palace", "Heights", "Villa", "Rooms", "PG", "Stay", "Comforts", "Living", "Retreat", "Inn", "Boys Hostel", "Girls Hostel", "House", "Nivas"]

COLLEGE_TEMPLATES = ["Institute of Technology", "Engineering College", "Medical College", "University Campus", "Institute of Management", "College of Commerce & Science", "Polytechnic College", "Law College", "Pharmacy College"]
OFFICE_TEMPLATES = ["IT Park", "Corporate Park", "Business Centre", "Tech Hub", "GIDC SEZ", "Financial District", "Software Park", "Commercial Complex"]

# Owner IDs pool
OWNER_IDS = [f"OWN{i:04d}" for i in range(1, 201)]

# STEP 1: Generate Landmarks (~500 rows)
def generate_landmarks(n_landmarks=500):
    landmarks = []
    lm_id_counter = 1
    
    city_weights = {
        "Mumbai": 65, "Pune": 60, "Ahmedabad": 55, "Surat": 45, "Vadodara": 40,
        "Navi Mumbai": 35, "Thane": 30, "Nagpur": 30, "Nashik": 25, "Rajkot": 20,
        "Gandhinagar": 20, "Chhatrapati Sambhajinagar": 15, "Anand": 12, "Bhavnagar": 12,
        "Jamnagar": 10, "Kolhapur": 10, "Mehsana": 6, "Nadiad": 5, "Vapi": 5, "Amravati": 5, "Nanded": 5
    }
    
    total_w = sum(city_weights.values())
    city_counts = {city: max(3, int(round((w / total_w) * n_landmarks))) for city, w in city_weights.items()}
    
    for city_name, count in city_counts.items():
        city_info = CITIES[city_name]
        state = city_info["state"]
        areas = city_info["areas"]
        
        for i in range(count):
            lm_id = f"LM{lm_id_counter:04d}"
            lm_id_counter += 1
            
            is_college = random.random() < 0.65
            lm_type = "College" if is_college else "Office"
            
            area = random.choice(areas)
            
            if is_college:
                name_prefix = random.choice(["Sardar Patel", "Government", "National", "Mahatma Gandhi", "Dr. B. R. Ambedkar", "Shivaji", "Swami Vivekananda", "Indira Gandhi", "Marwadi", "Charotar", "Pandit Deendayal", "Bhagwan Mahavir", "D. Y. Patil", "Symbiosis", "St. Xavier's"])
                lm_name = f"{name_prefix} {random.choice(COLLEGE_TEMPLATES)} {city_name}"
            else:
                name_prefix = random.choice(["TCS", "Infosys", "Wipro", "Reliance", "Tata", "L&T", "Adani", "Cognizant", "Mindspace", "EON", "GIDC", "Capgemini", "Deloitte"])
                lm_name = f"{name_prefix} {random.choice(OFFICE_TEMPLATES)}"
            
            # Coords: Offset slightly from city center
            lat = round(city_info["lat"] + random.uniform(-0.06, 0.06), 4)
            lon = round(city_info["lon"] + random.uniform(-0.06, 0.06), 4)
            address = f"{random.randint(1, 400)}, {area}, {city_name}, {state}"
            
            landmarks.append({
                "landmark_id": lm_id,
                "landmark_name": lm_name,
                "landmark_type": lm_type,
                "state": state,
                "city": city_name,
                "area": area,
                "address": address,
                "latitude": lat,
                "longitude": lon
            })
            
    df = pd.DataFrame(landmarks)
    return df

# STEP 2: Generate PGs (~2,500 rows)
def generate_pg_listings(n_pgs=2500):
    pgs = []
    
    city_weights = {
        "Mumbai": 350, "Pune": 320, "Ahmedabad": 280, "Surat": 220, "Vadodara": 200,
        "Navi Mumbai": 170, "Thane": 160, "Nagpur": 140, "Nashik": 130, "Rajkot": 100,
        "Gandhinagar": 90, "Chhatrapati Sambhajinagar": 80, "Anand": 60, "Bhavnagar": 50,
        "Jamnagar": 40, "Kolhapur": 40, "Mehsana": 25, "Nadiad": 20, "Vapi": 15, "Amravati": 10, "Nanded": 10
    }
    
    total_w = sum(city_weights.values())
    city_counts = {city: int(round((w / total_w) * n_pgs)) for city, w in city_weights.items()}
    
    pg_counter = 1
    for city_name, count in city_counts.items():
        city_info = CITIES[city_name]
        state = city_info["state"]
        tier = city_info["tier"]
        areas = city_info["areas"]
        
        for _ in range(count):
            pg_id = f"PG{pg_counter:05d}"
            pg_counter += 1
            
            area = random.choice(areas)
            pg_name = f"{random.choice(PG_PREFIXES)} {random.choice(PG_SUFFIXES)}"
            address = f"{random.randint(1, 400)}, {random.choice(['Nagar', 'Complex', 'Society', 'Lane', 'Road', 'Chowk', 'Park', 'Colony', 'Marg'])}, {area}, {city_name}"
            
            lat = round(city_info["lat"] + random.uniform(-0.07, 0.07), 4)
            lon = round(city_info["lon"] + random.uniform(-0.07, 0.07), 4)
            
            room_type = random.choices(["Private", "Shared", "Dormitory"], weights=[0.45, 0.45, 0.10])[0]
            if room_type == "Private":
                sharing_type = random.choice(["Single", "Double"])
            elif room_type == "Shared":
                sharing_type = random.choice(["Double", "Triple"])
            else:
                sharing_type = "Dormitory"
                
            gender_pref = random.choices(["Boys", "Girls", "Coed"], weights=[0.42, 0.42, 0.16])[0]
            
            # Rent Base calculation
            if tier == 1:
                base_rent = 22000 if sharing_type == "Single" else (14000 if sharing_type == "Double" else (9000 if sharing_type == "Triple" else 6000))
            elif tier == 2:
                base_rent = 15000 if sharing_type == "Single" else (9500 if sharing_type == "Double" else (6500 if sharing_type == "Triple" else 4500))
            else:
                base_rent = 10000 if sharing_type == "Single" else (6500 if sharing_type == "Double" else (4500 if sharing_type == "Triple" else 3000))
                
            # AC & Amenities influence rent
            ac_prob = 0.75 if (base_rent > 12000 or tier == 1) else 0.40
            ac_available = 1 if random.random() < ac_prob else 0
            
            food_available = 1 if random.random() < 0.70 else 0
            wifi_available = 1 if random.random() < 0.85 else 0
            bike_parking = 1 if random.random() < 0.75 else 0
            car_parking = 1 if random.random() < (0.40 if tier <= 2 else 0.20) else 0
            laundry_available = 1 if random.random() < 0.60 else 0
            power_backup = 1 if random.random() < 0.65 else 0
            geyser_available = 1 if random.random() < 0.80 else 0
            
            furnished_type = random.choices(["Fully Furnished", "Semi Furnished", "Unfurnished"], weights=[0.55, 0.35, 0.10])[0]
            
            rent_modifier = (2500 if ac_available else 0) + (1500 if furnished_type == "Fully Furnished" else (500 if furnished_type == "Semi Furnished" else 0))
            rent_monthly = int(round((base_rent + rent_modifier + random.uniform(-1500, 2000)) / 100) * 100)
            rent_monthly = max(2500, rent_monthly)
            
            deposit = int(round((rent_monthly * random.choice([1.0, 1.5, 2.0, 3.0])) / 500) * 500)
            rating = round(random.uniform(2.8, 5.0), 1)
            rating_count = random.randint(5, 450)
            availability = random.choices(["Available", "Limited", "Full"], weights=[0.60, 0.25, 0.15])[0]
            owner_id = random.choice(OWNER_IDS)
            
            pgs.append({
                "pg_id": pg_id,
                "pg_name": pg_name,
                "state": state,
                "city": city_name,
                "area": area,
                "address": address,
                "latitude": lat,
                "longitude": lon,
                "rent_monthly": rent_monthly,
                "deposit": deposit,
                "room_type": room_type,
                "sharing_type": sharing_type,
                "gender_preference": gender_pref,
                "ac_available": ac_available,
                "food_available": food_available,
                "wifi_available": wifi_available,
                "bike_parking": bike_parking,
                "car_parking": car_parking,
                "laundry_available": laundry_available,
                "power_backup": power_backup,
                "geyser_available": geyser_available,
                "furnished_type": furnished_type,
                "rating": rating,
                "rating_count": rating_count,
                "availability": availability,
                "owner_id": owner_id
            })
            
    df = pd.DataFrame(pgs)
    return df

# STEP 3: Generate Users (~2,000 rows)
def generate_users(df_landmarks, n_users=2000):
    users = []

    # Map landmarks by city
    landmarks_by_city = df_landmarks.groupby("city")["landmark_id"].apply(list).to_dict()

    city_weights = {
        "Mumbai": 280, "Pune": 260, "Ahmedabad": 220, "Surat": 180, "Vadodara": 160,
        "Navi Mumbai": 140, "Thane": 130, "Nagpur": 120, "Nashik": 110, "Rajkot": 80,
        "Gandhinagar": 70, "Chhatrapati Sambhajinagar": 60, "Anand": 50, "Bhavnagar": 40,
        "Jamnagar": 35, "Kolhapur": 35, "Mehsana": 20, "Nadiad": 15, "Vapi": 15, "Amravati": 10, "Nanded": 10
    }
    
    total_w = sum(city_weights.values())
    city_counts = {city: int(round((w / total_w) * n_users)) for city, w in city_weights.items()}

    user_counter = 1
    for city_name, count in city_counts.items():
        city_info = CITIES[city_name]
        state = city_info["state"]
        tier = city_info["tier"]
        city_lms = landmarks_by_city.get(city_name, ["LM0001"])

        for _ in range(count):
            user_id = f"U{user_counter:04d}"
            user_counter += 1

            role = random.choices(["Student", "Working Professional"], weights=[0.60, 0.40])[0]
            landmark_id = random.choice(city_lms)

            # Budget logic
            if role == "Working Professional":
                base_b_min = 10000 if tier == 1 else (7000 if tier == 2 else 5000)
                budget_min = int(round(random.uniform(base_b_min, base_b_min + 5000) / 100) * 100)
                budget_max = budget_min + int(round(random.uniform(4000, 10000) / 100) * 100)
                preferred_room = random.choices(["Private", "Shared"], weights=[0.65, 0.35])[0]
                ac_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.60, 0.30, 0.10])[0]
                car_park_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.30, 0.40, 0.30])[0]
                furnished_pref = random.choices(["Fully Furnished", "Semi Furnished", "Any"], weights=[0.45, 0.35, 0.20])[0]
            else:
                base_b_min = 5000 if tier == 1 else (3500 if tier == 2 else 2500)
                budget_min = int(round(random.uniform(base_b_min, base_b_min + 3000) / 100) * 100)
                budget_max = budget_min + int(round(random.uniform(2500, 6000) / 100) * 100)
                preferred_room = random.choices(["Shared", "Private", "Dormitory"], weights=[0.60, 0.25, 0.15])[0]
                ac_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.25, 0.45, 0.30])[0]
                car_park_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.05, 0.20, 0.75])[0]
                furnished_pref = random.choices(["Fully Furnished", "Semi Furnished", "Unfurnished", "Any"], weights=[0.30, 0.40, 0.10, 0.20])[0]

            if preferred_room == "Private":
                preferred_sharing = random.choice(["Single", "Double"])
            elif preferred_room == "Shared":
                preferred_sharing = random.choice(["Double", "Triple"])
            else:
                preferred_sharing = "Dormitory"

            gender_pref = random.choices(["Boys", "Girls", "Coed"], weights=[0.42, 0.42, 0.16])[0]

            food_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.55, 0.35, 0.10])[0]
            wifi_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.65, 0.30, 0.05])[0]
            bike_park_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.50, 0.40, 0.10])[0]
            laundry_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.40, 0.45, 0.15])[0]
            power_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.45, 0.45, 0.10])[0]
            geyser_pref = random.choices(["Required", "Preferred", "Not Required"], weights=[0.60, 0.30, 0.10])[0]

            users.append({
                "user_id": user_id,
                "user_role": role,
                "state": state,
                "city": city_name,
                "landmark_id": landmark_id,
                "budget_min": budget_min,
                "budget_max": budget_max,
                "preferred_room_type": preferred_room,
                "preferred_sharing_type": preferred_sharing,
                "preferred_gender": gender_pref,
                "ac_preference": ac_pref,
                "food_preference": food_pref,
                "wifi_preference": wifi_pref,
                "bike_parking_preference": bike_park_pref,
                "car_parking_preference": car_park_pref,
                "laundry_preference": laundry_pref,
                "power_backup_preference": power_pref,
                "geyser_preference": geyser_pref,
                "furnished_preference": furnished_pref
            })

    df = pd.DataFrame(users)
    return df

# STEP 4: Generate Interactions (~50,000 rows)
def generate_interactions(df_users, df_pgs, df_landmarks, n_interactions=50000):
    interactions = []
    
    # Pre-index objects by city
    pgs_by_city = df_pgs.groupby("city").apply(lambda g: g.to_dict("records")).to_dict()
    landmarks_by_id = df_landmarks.set_index("landmark_id").to_dict("index")
    
    users_list = df_users.to_dict("records")
    
    start_date = datetime.datetime(2025, 8, 1)
    
    int_counter = 1
    
    # Probability distribution for event types
    event_types_pool = ["VIEW", "CLICK", "WISHLIST", "ENQUIRY", "REVIEW"]
    
    for i in range(n_interactions):
        int_id = f"INT{int_counter:06d}"
        int_counter += 1
        
        user = random.choice(users_list)
        city = user["city"]
        city_pgs = pgs_by_city.get(city, [])
        if not city_pgs:
            continue
            
        lm_info = landmarks_by_id.get(user["landmark_id"], {"latitude": 23.0225, "longitude": 72.5714})
        
        # Calculate suitability score for candidate PGs to sample realistic interaction targets
        # Sample 10 candidate PGs in city to evaluate
        sample_pgs = random.sample(city_pgs, min(10, len(city_pgs)))
        
        pg_weights = []
        for pg in sample_pgs:
            dist = haversine(lm_info["latitude"], lm_info["longitude"], pg["latitude"], pg["longitude"])
            dist_score = 1.0 / (1.0 + dist / 2.0)
            
            rent = pg["rent_monthly"]
            b_min, b_max = user["budget_min"], user["budget_max"]
            price_score = 1.0 if b_min <= rent <= b_max else (0.8 if rent < b_min else max(0.1, 1.0 - (rent - b_max)/b_max))
            
            # Simple suitability
            suitability = 0.4 * dist_score + 0.3 * price_score + 0.3 * (pg["rating"] / 5.0)
            pg_weights.append(suitability)
            
        sum_w = sum(pg_weights)
        if sum_w > 0:
            norm_w = [w / sum_w for w in pg_weights]
            selected_pg = random.choices(sample_pgs, weights=norm_w)[0]
            selected_suitability = pg_weights[sample_pgs.index(selected_pg)]
        else:
            selected_pg = random.choice(sample_pgs)
            selected_suitability = 0.5
            
        # Event type selection based on suitability
        if selected_suitability > 0.65:
            event_type = random.choices(event_types_pool, weights=[0.40, 0.25, 0.18, 0.12, 0.05])[0]
        elif selected_suitability > 0.40:
            event_type = random.choices(event_types_pool, weights=[0.60, 0.25, 0.10, 0.04, 0.01])[0]
        else:
            event_type = random.choices(event_types_pool, weights=[0.85, 0.12, 0.02, 0.01, 0.00])[0]
            
        random_seconds = random.randint(0, 180 * 24 * 3600)
        timestamp = (start_date + datetime.timedelta(seconds=random_seconds)).strftime("%Y-%m-%d %H:%M:%S")
        
        interactions.append({
            "interaction_id": int_id,
            "user_id": user["user_id"],
            "pg_id": selected_pg["pg_id"],
            "landmark_id": user["landmark_id"],
            "event_type": event_type,
            "timestamp": timestamp
        })
        
    df = pd.DataFrame(interactions)
    return df

# STEP 5: Generate Training Dataset (>=30,000 rows)
def generate_training_dataset(df_users, df_pgs, df_landmarks, df_interactions, n_training=35000):
    training_rows = []

    users_by_id = df_users.set_index("user_id").to_dict("index")
    pgs_by_id = df_pgs.set_index("pg_id").to_dict("index")
    landmarks_by_id = df_landmarks.set_index("landmark_id").to_dict("index")

    # Map max interaction score per user-pg pair
    event_weights = {"VIEW": 1.0, "CLICK": 1.5, "WISHLIST": 3.0, "ENQUIRY": 4.0, "REVIEW": 5.0}
    
    pair_interactions = {}
    for _, row in df_interactions.iterrows():
        key = (row["user_id"], row["pg_id"])
        w = event_weights.get(row["event_type"], 1.0)
        if key not in pair_interactions or w > pair_interactions[key]:
            pair_interactions[key] = w

    # 1. First add all positive interaction pairs
    interaction_pairs = list(pair_interactions.keys())
    
    # 2. Sample additional negative / unobserved user-PG pairs in same city
    pgs_by_city = df_pgs.groupby("city")["pg_id"].apply(list).to_dict()
    
    all_pairs = set(interaction_pairs)
    
    users_list = list(users_by_id.keys())
    
    while len(all_pairs) < n_training:
        u_id = random.choice(users_list)
        u_city = users_by_id[u_id]["city"]
        city_pg_ids = pgs_by_city.get(u_city, [])
        if city_pg_ids:
            p_id = random.choice(city_pg_ids)
            all_pairs.add((u_id, p_id))

    sample_pairs = list(all_pairs)[:n_training]

    for u_id, p_id in sample_pairs:
        user = users_by_id[u_id]
        pg = pgs_by_id[p_id]
        lm = landmarks_by_id.get(user["landmark_id"], {"latitude": pg["latitude"], "longitude": pg["longitude"]})

        dist_km = round(haversine(lm["latitude"], lm["longitude"], pg["latitude"], pg["longitude"]), 3)
        dist_score = round(1.0 / (1.0 + dist_km / 2.0), 4)

        rent = pg["rent_monthly"]
        b_min, b_max = user["budget_min"], user["budget_max"]

        if b_min <= rent <= b_max:
            price_fit_score = 1.0
        elif rent < b_min:
            price_fit_score = 0.9
        else:
            overflow = (rent - b_max) / max(1, b_max)
            price_fit_score = max(0.1, 1.0 - overflow * 1.5)
        price_fit_score = round(price_fit_score, 4)

        # Amenity Matches
        ac_match = 1.0 if (user["ac_preference"] == "Not Required" or (user["ac_preference"] in ["Required", "Preferred"] and pg["ac_available"] == 1)) else 0.0
        food_match = 1.0 if (user["food_preference"] == "Not Required" or (user["food_preference"] in ["Required", "Preferred"] and pg["food_available"] == 1)) else 0.0
        wifi_match = 1.0 if (user["wifi_preference"] == "Not Required" or (user["wifi_preference"] in ["Required", "Preferred"] and pg["wifi_available"] == 1)) else 0.0
        bike_match = 1.0 if (user["bike_parking_preference"] == "Not Required" or (user["bike_parking_preference"] in ["Required", "Preferred"] and pg["bike_parking"] == 1)) else 0.0
        car_match = 1.0 if (user["car_parking_preference"] == "Not Required" or (user["car_parking_preference"] in ["Required", "Preferred"] and pg["car_parking"] == 1)) else 0.0
        laundry_match = 1.0 if (user["laundry_preference"] == "Not Required" or (user["laundry_preference"] in ["Required", "Preferred"] and pg["laundry_available"] == 1)) else 0.0
        power_match = 1.0 if (user["power_backup_preference"] == "Not Required" or (user["power_backup_preference"] in ["Required", "Preferred"] and pg["power_backup"] == 1)) else 0.0
        geyser_match = 1.0 if (user["geyser_preference"] == "Not Required" or (user["geyser_preference"] in ["Required", "Preferred"] and pg["geyser_available"] == 1)) else 0.0

        furnished_match = 1 if (user["furnished_preference"] == "Any" or user["furnished_preference"] == pg["furnished_type"]) else 0
        room_match = 1 if user["preferred_room_type"] == pg["room_type"] else 0
        sharing_match = 1 if user["preferred_sharing_type"] == pg["sharing_type"] else 0
        gender_match = 1 if (user["preferred_gender"] == "Coed" or pg["gender_preference"] in [user["preferred_gender"], "Coed"]) else 0

        matches = [ac_match, food_match, wifi_match, bike_match, car_match, laundry_match, power_match, geyser_match]
        amenity_match_pct = round((sum(matches) / len(matches)) * 100.0, 1)

        rating = pg["rating"]
        rating_score = round(rating / 5.0, 2)

        # Interaction score & relevance label
        max_event_w = pair_interactions.get((u_id, p_id), 0.0)
        interaction_score = round(max_event_w / 5.0, 2)

        if max_event_w >= 5.0:
            relevance_label = 5
        elif max_event_w >= 4.0:
            relevance_label = 4
        elif max_event_w >= 3.0:
            relevance_label = 3
        elif max_event_w >= 1.5:
            relevance_label = 2
        elif max_event_w >= 1.0:
            relevance_label = 1
        else:
            # Synthetic label for unobserved pairs derived probabilistically from suitability
            suitability = 0.35 * dist_score + 0.35 * price_fit_score + 0.15 * (amenity_match_pct / 100.0) + 0.15 * rating_score
            suitability_with_noise = suitability + random.uniform(-0.15, 0.15)
            if suitability_with_noise > 0.85:
                relevance_label = random.choices([2, 3, 4], weights=[0.4, 0.4, 0.2])[0]
            elif suitability_with_noise > 0.60:
                relevance_label = random.choices([1, 2], weights=[0.6, 0.4])[0]
            elif suitability_with_noise > 0.40:
                relevance_label = random.choices([0, 1], weights=[0.7, 0.3])[0]
            else:
                relevance_label = 0

        training_rows.append({
            "user_id": u_id,
            "pg_id": p_id,
            "user_role": user["user_role"],
            "budget_min": b_min,
            "budget_max": b_max,
            "rent_monthly": rent,
            "distance_km": dist_km,
            "distance_score": dist_score,
            "price_fit_score": price_fit_score,
            "ac_match": ac_match,
            "food_match": food_match,
            "wifi_match": wifi_match,
            "bike_parking_match": bike_match,
            "car_parking_match": car_match,
            "laundry_match": laundry_match,
            "power_backup_match": power_match,
            "geyser_match": geyser_match,
            "furnished_match": furnished_match,
            "room_match": room_match,
            "sharing_match": sharing_match,
            "gender_match": gender_match,
            "amenity_match_pct": amenity_match_pct,
            "rating": rating,
            "rating_score": rating_score,
            "rating_count": pg.get("rating_count", 0),
            "interaction_score": interaction_score,
            "relevance_label": relevance_label
        })

    df = pd.DataFrame(training_rows)
    return df

# STEP 6: Validation Report Function
def validate_datasets(df_landmarks, df_pgs, df_users, df_interactions, df_training):
    print("=" * 60)
    print("      STAYWISE DATASET GENERATION VALIDATION REPORT")
    print("=" * 60)
    
    errors = []
    
    # 1. Row counts
    counts = {
        "Landmarks": (len(df_landmarks), 500),
        "PG Listings": (len(df_pgs), 2500),
        "Users": (len(df_users), 2000),
        "Interactions": (len(df_interactions), 50000),
        "Training Dataset": (len(df_training), 30000)
    }
    
    for name, (actual, target) in counts.items():
        status = "PASSED" if actual >= target else "FAILED"
        print(f"[{status}] {name} count: {actual:,} (Target: >={target:,})")
        if actual < target:
            errors.append(f"{name} count below target: {actual} < {target}")
            
    # 2. Duplicate Primary Keys
    pk_checks = [
        ("Landmarks", df_landmarks, "landmark_id"),
        ("PG Listings", df_pgs, "pg_id"),
        ("Users", df_users, "user_id"),
        ("Interactions", df_interactions, "interaction_id")
    ]
    
    for name, df, pk in pk_checks:
        dups = df[pk].duplicated().sum()
        status = "PASSED" if dups == 0 else "FAILED"
        print(f"[{status}] {name} duplicate '{pk}' count: {dups}")
        if dups > 0:
            errors.append(f"Duplicate keys found in {name} column '{pk}': {dups}")
            
    # 3. Missing Values
    dfs = [("Landmarks", df_landmarks), ("PG Listings", df_pgs), ("Users", df_users), ("Interactions", df_interactions), ("Training Dataset", df_training)]
    for name, df in dfs:
        null_count = df.isnull().sum().sum()
        status = "PASSED" if null_count == 0 else "FAILED"
        print(f"[{status}] {name} null values count: {null_count}")
        if null_count > 0:
            errors.append(f"Null values in {name}: {null_count}")

    # 4. Foreign Keys
    valid_lm_ids = set(df_landmarks["landmark_id"])
    valid_user_ids = set(df_users["user_id"])
    valid_pg_ids = set(df_pgs["pg_id"])
    
    broken_user_lms = (~df_users["landmark_id"].isin(valid_lm_ids)).sum()
    broken_int_users = (~df_interactions["user_id"].isin(valid_user_ids)).sum()
    broken_int_pgs = (~df_interactions["pg_id"].isin(valid_pg_ids)).sum()
    broken_train_users = (~df_training["user_id"].isin(valid_user_ids)).sum()
    broken_train_pgs = (~df_training["pg_id"].isin(valid_pg_ids)).sum()
    
    fk_errors = broken_user_lms + broken_int_users + broken_int_pgs + broken_train_users + broken_train_pgs
    status = "PASSED" if fk_errors == 0 else "FAILED"
    print(f"[{status}] Foreign key integrity check: {fk_errors} broken references")
    if fk_errors > 0:
        errors.append(f"Foreign key violations found: {fk_errors}")
        
    # 5. Geographic Bounds
    valid_states = {"Gujarat", "Maharashtra"}
    invalid_states_pg = (~df_pgs["state"].isin(valid_states)).sum()
    invalid_states_lm = (~df_landmarks["state"].isin(valid_states)).sum()
    invalid_states_u = (~df_users["state"].isin(valid_states)).sum()
    
    geo_errors = invalid_states_pg + invalid_states_lm + invalid_states_u
    status = "PASSED" if geo_errors == 0 else "FAILED"
    print(f"[{status}] Geographic state check (Gujarat/Maharashtra): {geo_errors} invalid states")
    if geo_errors > 0:
        errors.append(f"Invalid states found outside Gujarat/Maharashtra: {geo_errors}")
        
    # 6. Negative Rents & Invalid Ratings
    neg_rents = (df_pgs["rent_monthly"] <= 0).sum()
    invalid_ratings = ((df_pgs["rating"] < 1.0) | (df_pgs["rating"] > 5.0)).sum()
    status = "PASSED" if (neg_rents == 0 and invalid_ratings == 0) else "FAILED"
    print(f"[{status}] Numerical sanity check (Negative Rents: {neg_rents}, Invalid Ratings: {invalid_ratings})")
    if neg_rents > 0 or invalid_ratings > 0:
        errors.append(f"Numerical sanity failed (rents: {neg_rents}, ratings: {invalid_ratings})")
        
    print("=" * 60)
    if errors:
        print("VALIDATION FAILED WITH ERRORS:")
        for err in errors:
            print(f" - {err}")
        raise ValueError("Dataset validation failed!")
    else:
        print("ALL DATASET VALIDATION CHECKS PASSED SUCCESSFULLY!")
        print("=" * 60)

# Main Generation Runner
def main():
    print("Starting StayWise Dataset Generation...")
    
    df_landmarks = generate_landmarks(500)
    print(f"Generated {len(df_landmarks):,} Landmarks.")
    
    df_pgs = generate_pg_listings(2500)
    print(f"Generated {len(df_pgs):,} PG Listings.")
    
    df_users = generate_users(df_landmarks, 2000)
    print(f"Generated {len(df_users):,} Users.")
    
    df_interactions = generate_interactions(df_users, df_pgs, df_landmarks, 50000)
    print(f"Generated {len(df_interactions):,} Interactions.")
    
    df_training = generate_training_dataset(df_users, df_pgs, df_landmarks, df_interactions, 35000)
    print(f"Generated {len(df_training):,} Training Rows.")
    
    # Run validation
    validate_datasets(df_landmarks, df_pgs, df_users, df_interactions, df_training)
    
    # Save CSV files to generated directory and project directory
    target_dirs = [GENERATED_DIR, BASE_DIR, PROJECT_DATA_DIR]
    
    datasets = {
        "landmarks.csv": df_landmarks,
        "pg_listings.csv": df_pgs,
        "users.csv": df_users,
        "interactions.csv": df_interactions,
        "training_dataset.csv": df_training
    }
    
    for filename, df in datasets.items():
        for t_dir in target_dirs:
            filepath = t_dir / filename
            df.to_csv(filepath, index=False)
            
    print(f"\nAll datasets successfully written to:")
    for t_dir in target_dirs:
        print(f" - {t_dir.resolve()}")

if __name__ == "__main__":
    main()
