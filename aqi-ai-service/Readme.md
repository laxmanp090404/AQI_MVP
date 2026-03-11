# AQI AI Service (Backend)

## Overview

The **AQI AI Service** is a machine learning microservice that predicts **next-day PM2.5 and AQI values** for Indian cities using historical air quality and weather data.

The service:

* Fetches past **7 days of pollution + weather data**
* Generates **59 engineered features**
* Uses an **ensemble ML model (XGBoost + LightGBM + CatBoost)**
* Converts PM2.5 → **CPCB AQI**
* Stores predictions in **MongoDB**
* Serves predictions via a **REST API**

---

# Architecture

Frontend
↓
Flask API
↓
Feature Engineering
↓
ML Ensemble Prediction
↓
AQI Conversion (CPCB)
↓
MongoDB Storage

External APIs:

* Open-Meteo Weather API
* Open-Meteo Air Quality API

---

# Project Structure

```
aqi-ai-service/
│
├── models/
│   ├── ensemble_weights.pkl
│   ├── final_model_cat.pkl
│   ├── final_model_lgb.pkl
│   └── final_model_xgb.pkl
│
├── app.py
├── feature_engineering.py
├── aqi_utils.py
├── city_coords.py
├── database.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# Features

✔ Next-day AQI prediction
✔ Ensemble ML model
✔ Feature engineering pipeline (59 features)
✔ Automatic AQI category classification
✔ MongoDB prediction storage
✔ Dockerized deployment

---

# API Endpoint

## Predict AQI

POST `/predict`

Request

```json
{
 "city_name": "Delhi"
}
```

Response

```json
{
 "city": "Delhi",
 "predicted_pm25": 84.59,
 "aqi": 181.98,
 "category": "Moderate",
 "color": "#FFFF00",
 "predicted_for": "2026-03-10",
 "generated_at": "2026-03-09T17:02:37Z"
}
```

---

# MongoDB Schema

Example document:

```
{
  city: "Delhi",
  predicted_for: ISODate,
  generated_at: ISODate,

  predicted_pm25: Number,
  aqi: Number,
  category: String,
  color: String,

  features: {...59 engineered features...}
}
```

---

# Running the Service

### 1 Install Docker

https://www.docker.com/

---

### 2 Start containers

```
docker-compose up --build
```

Services started:

* Flask ML API
* MongoDB database

---

### 3 Test API

```
curl -X POST http://localhost:5000/predict \
-H "Content-Type: application/json" \
-d '{"city_name":"Delhi"}'
```

---

# Model Details

Target:

```
Next day PM2.5
```

Features:

```
PM2.5 lag features
Weather lag features
Rolling statistics
Temporal features
City encoding
Season encoding
```

Total features:

```
59
```

Models:

* XGBoost
* LightGBM
* CatBoost

Prediction method:

```
Weighted ensemble
```

---

# Future Improvements

* Predict AQI for **all 26 cities automatically**
* Background scheduler
* AQI trend analytics
* Real-time dashboards


