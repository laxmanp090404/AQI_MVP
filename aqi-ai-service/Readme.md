# AQI AI Service

## Overview
AQI AI Service is a Flask-based machine learning backend that predicts next-day PM2.5 and AQI for supported Indian cities.

The service:
- Fetches 7-day historical weather and air-quality signals from Open-Meteo APIs
- Builds engineered features from lag, rolling, temporal, and city-season indicators
- Runs a weighted ensemble of CatBoost, XGBoost, and LightGBM models
- Converts PM2.5 to AQI and maps AQI to CPCB-style category and color
- Persists predictions and feature snapshots in MongoDB
- Exposes REST endpoints used by the frontend dashboard, map, and report pages

## Installation and Setup

### Prerequisites
- Python 3.10+ (for local run)
- pip
- Docker and Docker Compose (for containerized run)

### Option A: Run with Docker Compose (recommended)
From `aqi-ai-service`:

```bash
docker compose up --build
```

This starts:
- `api` on `http://localhost:5000`
- `mongodb` on `mongodb://localhost:27017`

### Option B: Run locally (without Docker)
1. Create and activate virtual environment
2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Ensure MongoDB is reachable and update `database.py` URI if needed
4. Run app

```bash
python app.py
```

## Architecture

### Runtime flow
Client Request -> Flask Endpoint -> Feature Engineering -> Ensemble Inference -> AQI + Category Mapping -> MongoDB Upsert -> JSON Response

### External dependencies
- Open-Meteo Air Quality API (`pm2_5`, `past_days=7`)
- Open-Meteo Weather API (`temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `pressure_msl`, `precipitation`, `past_days=7`)

### Persistence pattern
- Collection stores one document per city per `predicted_for` date
- `update_one(..., upsert=True)` prevents duplicate records for same city/date key

## File Structure

```text
aqi-ai-service/
  app.py
  aqi_utils.py
  city_coords.py
  database.py
  feature_engineering.py
  requirements.txt
  Dockerfile
  docker-compose.yml
  models/
    ensemble_weights.pkl
    final_model_cat.pkl
    final_model_lgb.pkl
    final_model_xgb.pkl
  Readme.md
```

## Functions of Each File (Extensive)

### `app.py`
Primary HTTP API layer and inference orchestration.

- Global initialization:
  - Creates Flask app and enables CORS
  - Loads 3 model artifacts and ensemble weights

- `predict()` (`POST /predict`)
  - Input: `city_name`
  - Fetches city data -> builds feature vector -> aligns schema with model feature names
  - Gets three model outputs and computes weighted ensemble PM2.5
  - Converts PM2.5 to AQI and category/color
  - Stores feature snapshot and prediction to MongoDB with upsert
  - Returns prediction payload with date fields serialized as strings

- `get_predictions()` (`GET /predictions`)
  - Returns prediction records from collection
  - Includes city, AQI, category, color, PM2.5, and prediction date

- `history(city)` (`GET /history/<city>`)
  - Returns city-specific AQI timeline sorted by `predicted_for`

- `latest_predictions()` (`GET /latest-predictions`)
  - Aggregates latest generated document per city
  - Used by frontend cards and report data fallback

- `extensive_report()` (`GET /extensive-report`)
  - Aggregates latest per city
  - Expands stored feature snapshot into a reporting-friendly flattened schema
  - Returns lag, weather, rolling, temporal, and prediction fields

### `feature_engineering.py`
Feature pipeline and data ingestion logic.

- `safe_request(url, retries=3)`
  - Executes resilient HTTP requests with retry and sleep-based backoff

- `fetch_city_data(city)`
  - Pulls air quality and weather hourly datasets for last 7 days
  - Merges on `time`, casts numeric types, resamples to daily means, and drops NaNs
  - Returns a clean daily dataframe for feature extraction

- `build_features(city, df)`
  - Builds lag features:
    - PM2.5 lag 1-7
    - Temp/Humidity/Wind/Pressure/Rain lag 1-3
  - Builds rolling stats from PM2.5 tail window
  - Adds temporal indicators (`month`, `day_of_week`, `day_of_year`, `is_weekend`)
  - Adds one-hot city columns and seasonal flags
  - Returns complete feature dictionary for inference

### `aqi_utils.py`
AQI conversion and category mapping.

- `pm25_to_aqi(pm25)`
  - Piecewise linear conversion from PM2.5 concentration to AQI

- `get_category(aqi)`
  - Returns tuple `(category, color)` using CPCB-like thresholds:
    - `<=50` Good (`#00B050`)
    - `<=100` Satisfactory (`#92D050`)
    - `<=200` Moderate (`#FFFF00`)
    - `<=300` Poor (`#FFC000`)
    - `<=400` Very Poor (`#FF0000`)
    - `>400` Severe (`#C00000`)

### `database.py`
MongoDB connection and collection binding.

- Creates `MongoClient("mongodb://mongodb:27017")`
- Binds database `aqi_predictions`
- Exposes collection `predictions`

### `city_coords.py`
Static lookup of supported cities and geo coordinates.

- Used by feature data fetch pipeline to pass city lat/long to external APIs

### `Dockerfile`
Container image for API service.

- Uses `python:3.10-slim`
- Installs `libgomp1` (required by some ML runtimes)
- Installs Python requirements
- Exposes port `5000`
- Starts app with `python app.py`

### `docker-compose.yml`
Two-service local stack:

- `api` (builds current directory, maps `5000:5000`)
- `mongodb` (`mongo:7`, maps `27017:27017`)

### `requirements.txt`
Python dependencies for API, data processing, ML runtimes, and MongoDB access.

## Features of AQI AI Service
- Ensemble model prediction pipeline for next-day PM2.5
- AQI conversion and category/color classification
- Persistent prediction store with per-city/per-date upsert behavior
- City timeline retrieval for trend charts
- Latest-per-city aggregation for dashboard cards and map
- Extensive feature report endpoint for analytical visualizations
- Dockerized local deployment

## API Endpoints

Base URL: `http://localhost:5000`

### 1) `POST /predict`

#### Purpose
Generate next-day prediction for one city and persist it.

#### Request structure
```json
{
  "city_name": "Delhi"
}
```

#### Request explanation
- `city_name` (string, required): must exist in `city_coords.py`.

#### Success response structure
```json
{
  "city": "Delhi",
  "predicted_pm25": 73.81,
  "aqi": 146.02,
  "category": "Moderate",
  "color": "#FFFF00",
  "predicted_for": "2026-04-06",
  "generated_at": "2026-04-05T04:05:30.123456"
}
```

#### Success response explanation
- `predicted_pm25`: weighted ensemble PM2.5 prediction
- `aqi`: AQI converted from PM2.5
- `category` and `color`: derived from AQI threshold mapping
- `predicted_for`: next-day date (`YYYY-MM-DD`)
- `generated_at`: UTC generation timestamp

#### Error response (500)
```json
{
  "error": "Data temporarily unavailable",
  "details": "<exception message>"
}
```

### 2) `GET /predictions`

#### Purpose
Return all stored prediction records (used mainly for map layer data).

#### Request structure
- No request body

#### Success response structure
Array of objects:
```json
[
  {
    "city": "Chennai",
    "aqi": 21.72,
    "category": "Good",
    "color": "#00B050",
    "predicted_pm25": 13.03,
    "predicted_for": "2026-04-05"
  }
]
```

#### Response explanation
- May contain multiple records per city across different dates.

#### Error response (500)
```json
{
  "error": "<exception message>"
}
```

### 3) `GET /history/<city>`

#### Purpose
Return historical AQI trend points for one city.

#### Request structure
- Path param: `city` (string)

Example:
`GET /history/Delhi`

#### Success response structure
```json
[
  {
    "aqi": 146.02,
    "predicted_for": "2026-03-15"
  },
  {
    "aqi": 151.34,
    "predicted_for": "2026-04-05"
  }
]
```

#### Response explanation
- Sorted ascending by `predicted_for`.
- Contains only `aqi` and `predicted_for` fields for chart simplicity.

### 4) `GET /latest-predictions`

#### Purpose
Return only the most recently generated prediction per city.

#### Request structure
- No request body

#### Success response structure
```json
[
  {
    "city": "Gurugram",
    "aqi": 301.26,
    "category": "Very Poor",
    "color": "#FF0000",
    "predicted_pm25": 121.64,
    "predicted_for": "2026-03-15"
  }
]
```

#### Response explanation
- Backend aggregation sorts by `generated_at` descending, then groups by city.
- This endpoint is ideal for dashboard cards and summary visuals.

#### Error response (500)
```json
{
  "error": "<exception message>"
}
```

### 5) `GET /extensive-report`

#### Purpose
Return latest per-city flattened feature report used for advanced analytics.

#### Request structure
- No request body

#### Success response structure
Array of rows containing:
- Identity: `city`
- PM2.5 lag fields: `pm25_lag_1` ... `pm25_lag_7`
- Weather lag fields: temp/humidity/wind/pressure/rain lag 1..3
- Rolling metrics: `pm25_roll_mean`, `pm25_roll_std`, `pm25_roll_min`, `pm25_roll_max`
- Temporal fields: `month`, `day_of_week`, `day_of_year`, `weekend`
- Prediction fields: `predicted_pm25`, `aqi`, `category`

Example (truncated):
```json
[
  {
    "city": "Delhi",
    "pm25_lag_1": 76.12,
    "temp_lag_1": 28.4,
    "pm25_roll_mean": 71.02,
    "predicted_pm25": 73.81,
    "aqi": 146.02,
    "category": "Moderate"
  }
]
```

#### Response explanation
- One row per city (latest generated document).
- Designed for chart-heavy report UIs.

#### Error response (500)
```json
{
  "error": "<exception message>"
}
```

## MongoDB Document Shape
Stored document in `aqi_predictions.predictions`:

```json
{
  "city": "Delhi",
  "features": { "PM2.5_lag_1": 76.12, "...": 0 },
  "predicted_pm25": 73.8056,
  "aqi": 146.0186,
  "category": "Moderate",
  "color": "#FFFF00",
  "generated_at": "ISODate",
  "predicted_for": "ISODate"
}
```

## Notes
- `docker-compose.yml` currently includes `version`; Docker warns this field is obsolete but still runs.
- API assumes supported city names exactly match keys in `city_coords.py`.


