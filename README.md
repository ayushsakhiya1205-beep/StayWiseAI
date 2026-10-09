# PG Finder – AI/ML-Based Smart PG Accommodation Recommendation System

> **A Production-Ready Full-Stack Web Application for Student and Working Professional Accommodation Discovery powered by Machine Learning.**

---

## 📌 1. Project Overview & Problem Statement

Searching for PG accommodation near colleges or corporate workplaces is traditionally based only on simple distance or price filters. However:
- A PG that is 300 meters away but costs double your budget and lacks food or Wi-Fi is **not** a good recommendation.
- A PG located 1.2 km away that fits your budget perfectly, offers AC + Food + Wi-Fi, and holds a 4.8 star rating is a **much better** match.

**PG Finder** solves this by using a **Multi-Factor AI/ML Recommendation Engine** that evaluates distance, monthly rent fit, required facilities, room sharing type, and tenant ratings simultaneously.

---

## 🏗️ 2. Technology Stack

- **Frontend**: React.js (Vite), React Router v6, Axios, Lucide React Icons, Modern Responsive Glassmorphism CSS (mobile-ready down to 360px).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Bcrypt password hashing, REST APIs.
- **AI/ML Service**: Python 3.10+, FastAPI, Pandas, NumPy, Scikit-Learn (`RandomForestRegressor`), Joblib for model serialization.

---

## 🧠 3. AI/ML Recommendation Architecture

### Phase 1: Cold-Start Heuristic Engine
When historical interaction data is minimal, the system calculates a multi-factor score:

$$\text{Recommendation Score} = w_1 \cdot \text{distance\_score} + w_2 \cdot \text{price\_fit\_score} + w_3 \cdot \text{amenity\_match\_pct} + w_4 \cdot \text{rating\_score}$$

- **Distance Decay**: $\text{distance\_score} = \frac{1.0}{1.0 + (\text{distance\_km} / 2.0)}$
- **Price Fit**: Evaluates lower & upper budget bounds with graceful overflow penalty.
- **Amenity Match**: Percentage of selected required/preferred amenities matched.
- **Rating Score**: $\text{rating} / 5.0$.

### Phase 2: Supervised Machine Learning Model
Once interaction events (`VIEW`, `CLICK`, `WISHLIST`, `ENQUIRY`, `REVIEW`) accumulate:
1. Implicit feedback signals are weighted: VIEW=1.0, CLICK=1.5, WISHLIST=3.0, REVIEW=4.0, ENQUIRY=5.0.
2. A 18-dimensional feature matrix is prepared by Python FastAPI.
3. A `RandomForestRegressor` predicts candidate relevance.
4. Model evaluation metrics (**Precision@K** and **NDCG@K**) are calculated before deployment.
5. If the Python ML service is offline, the Node.js Express backend automatically falls back to cold-start scoring with zero downtime.

---

## 👥 4. User Roles & Features

### 🎓 Student
- Search PGs near selected College / Institute.
- Set budget, AC/Non-AC, Food, Wi-Fi, laundry, and room sharing preferences.
- Receive ranked results with match percentage badges and match explanations.
- Save PGs to Wishlist and send booking Enquiries.

### 💼 Working Professional
- Search PGs near selected Office / Company / IT Park.
- Filter for Single private rooms, car parking, power backup, AC, and high ratings.
- Receive personalized ML recommendations tuned for corporate employees.

### 🏢 PG Owner
- Add and manage PG properties (Subject to Admin verification).
- Toggle room vacancy/availability (`Available` vs `Full`).
- View tenant enquiries and reply directly to candidates.

### 🛡️ System Admin
- Overview dashboard stats.
- Approve or Reject pending PG listings.
- User management (Suspend / Activate / Delete).
- City and Landmark management.
- **ML Operations Center**: Monitor active model version, view Precision@K & NDCG@K, and trigger model retraining.

---

## 📂 5. Project Monorepo Structure

```
project/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Footer, PGCard, RecommendationBadge, FilterSidebar, MapView
│   │   ├── context/        # AuthContext, CityContext
│   │   ├── pages/          # Home, SearchWizard, PGDetails, Wishlist, Enquiries, Login, Register, OwnerDashboard, AdminDashboard
│   │   ├── services/       # api.js (Axios API client)
│   │   └── App.jsx
├── server/                 # Express Backend Server
│   ├── config/             # db.js
│   ├── controllers/        # auth, pg, owner, admin, enquiry, wishlist, review, interaction
│   ├── middleware/         # authMiddleware (JWT & roles)
│   ├── models/             # User, City, Landmark, PGListing, Review, Enquiry, Wishlist, InteractionLog, ModelVersion
│   ├── routes/             # REST endpoints
│   ├── services/           # mlClient.js, coldStartEngine.js
│   ├── scripts/            # seed.js, testApi.js
│   └── server.js
├── ml-service/             # Python FastAPI ML Engine
│   ├── app/
│   │   ├── main.py         # FastAPI endpoints
│   │   ├── cold_start.py   # Python fallback scoring
│   │   ├── feature_engineering.py # Feature matrix transformer
│   │   ├── train_model.py  # Model trainer with Precision@K & NDCG@K
│   │   ├── model_manager.py# Serialization & versioning
│   ├── models/             # Saved model artifacts (.pkl & metadata)
│   └── requirements.txt
├── package.json
└── README.md
```

---

## 🚀 6. Installation & Execution Guide

### Step 1: Install Dependencies
```bash
# Install root, backend server, and frontend packages
npm run install:all
```

### Step 2: Install Python ML Service Dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### Step 3: Seed Database
```bash
npm run seed
```
*This populates 5 Cities, 10 Landmarks, Admin/Owner/Student/Professional accounts, 30+ PG listings, reviews, and 60 interaction logs.*

### Step 4: Run Services
```bash
# Terminal 1: Start Express Backend (Port 5000)
npm run server

# Terminal 2: Start Python ML Service (Port 8000)
cd ml-service
uvicorn app.main:app --reload --port 8000

# Terminal 3: Start React Frontend (Port 5173)
npm run client
```

---

## 🔑 7. Demo Test Credentials

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@pgfinder.com` | `admin123` |
| **PG Owner 1** | `owner1@pgfinder.com` | `owner123` |
| **PG Owner 2** | `owner2@pgfinder.com` | `owner2@pgfinder.com` |
| **Student** | `student1@pgfinder.com` | `student123` |
| **Working Professional** | `pro1@pgfinder.com` | `pro123` |

---

## 🧪 8. Testing & Verification

Run internal algorithm unit tests:
```bash
npm test
```
*Validates Haversine distance calculations and proves that a slightly further PG with better budget & amenity fit receives a higher score than a closer expensive PG.*
