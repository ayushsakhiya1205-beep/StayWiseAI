# StayWise Synthetic Dataset Generation & Documentation

## Overview
The StayWise recommendation system requires structured datasets to train machine learning models (`RandomForestRegressor`) for PG recommendations based on user preferences, geographical distance, price budget, amenity matching, and historical user interaction feedback.

Initial 100-row CSV files (`pg_listings.csv`, `landmarks.csv`, `users.csv`, `interactions.csv`, `training_dataset.csv`) were provided as **reference schemas/templates**. This project includes a Python dataset generator (`ml-service/data/generate_staywise_dataset.py`) that expands these templates into production-grade synthetic datasets.

---

## Output Files & Directory Structure

- **Sample Backup:** `ml-service/data/sample/` (Original template files preserved)
- **Generated Production Datasets:** `ml-service/data/generated/` and `ml-service/data/`
  1. `pg_listings.csv` (~2,500 rows)
  2. `landmarks.csv` (~500 rows)
  3. `users.csv` (~2,000 rows)
  4. `interactions.csv` (~50,000 rows)
  5. `training_dataset.csv` (>= 35,000 rows)

---

## Dataset Generation Details

### 1. Geographic Restriction & Scope
Data is strictly generated for 21 cities across **Gujarat** and **Maharashtra**:
- **Gujarat (11 Cities):** Ahmedabad, Vadodara, Surat, Rajkot, Gandhinagar, Anand, Nadiad, Vapi, Bhavnagar, Jamnagar, Mehsana.
- **Maharashtra (10 Cities):** Pune, Mumbai, Navi Mumbai, Thane, Nagpur, Nashik, Chhatrapati Sambhajinagar, Kolhapur, Nanded, Amravati.

All coordinates (latitude/longitude), areas, street addresses, PG listings, and landmarks are bound strictly to these cities.

### 2. Realistic Domain Relationships
Rather than generating pure random noise, the generator enforces domain-specific probabilistic correlations:
- **City Tiers:** Mumbai and Pune feature higher rental price baselines compared to Tier 2 (Ahmedabad, Surat, Vadodara, Thane, etc.) and Tier 3 cities (Rajkot, Gandhinagar, Anand, etc.).
- **Room & Sharing Types:** Private single rooms have higher rent than shared double/triple rooms and dormitories.
- **Amenities vs Price:** Higher rent PGs have a significantly higher probability of AC availability, full furnishing, and car parking.
- **User Roles:**
  - **Students:** Lower budget ranges, higher preference for shared/dormitory rooms, food, and Wi-Fi.
  - **Working Professionals:** Higher budget ranges, higher preference for private single rooms, AC, car parking, power backup, and furnishing.

### 3. Distance Calculation
Geographical proximity is computed using the **Haversine formula** between the PG's latitude/longitude and the user's selected landmark (college or office) coordinates:
$$\text{dist\_km} = 2 R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)}\right)$$
where $R = 6371\text{ km}$.
The decay distance score is derived as:
$$\text{distance\_score} = \frac{1.0}{1.0 + \frac{\text{distance\_km}}{2.0}}$$

### 4. Interaction Simulation
~50,000 interaction records were generated representing realistic user activity across PGs in their respective cities:
- **Event Distribution:** `VIEW` (most common) > `CLICK` > `WISHLIST` > `ENQUIRY` > `REVIEW`.
- **Suitability Weighting:** Users interact with higher probability with PGs that fit their budget, distance, amenities, and rating, while retaining realistic non-deterministic noise and negative cases.

### 5. Synthetic Relevance Labeling
Relevance labels (0 to 5) in `training_dataset.csv` are derived from simulated interaction history:
- `VIEW` / `CLICK` $\rightarrow$ 1
- `WISHLIST` $\rightarrow$ 2–3
- `ENQUIRY` $\rightarrow$ 4
- `REVIEW` $\rightarrow$ 5

Unobserved user-PG pairs receive synthetic relevance labels derived from probabilistic suitability with introduced variation, ensuring the ML model has realistic non-trivial patterns to learn.

---

## Limitations & Production Roadmap

> [!NOTE]
> **Synthetic Ground Truth Limitation:**
> The current relevance labels are synthetic demo labels designed to simulate user behavior patterns. They provide a strong baseline for model training and evaluation in development.

### Transition to Real User Interaction Data
As StayWise goes live, real user actions (`VIEW`, `CLICK`, `WISHLIST`, `ENQUIRY`, `REVIEW`) captured by the MERN backend (`InteractionLog` MongoDB collection) will naturally populate the `interactions.csv` and `training_dataset.csv` pipelines, replacing synthetic interaction scores with true ground-truth user feedback.

---

## Execution Instructions

To regenerate datasets and re-validate:
```bash
python ml-service/data/generate_staywise_dataset.py
```

To retrain the ML model on the generated dataset:
```bash
python -c "from app.train_model import train_from_csv; train_from_csv()"
```
