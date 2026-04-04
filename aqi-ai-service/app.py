from flask import Flask,request,jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from database import collection
from datetime import datetime, timedelta, time

from feature_engineering import fetch_city_data,build_features
from aqi_utils import pm25_to_aqi,get_category

app=Flask(__name__)
CORS(app)

xgb=joblib.load("models/final_model_xgb.pkl")
lgb=joblib.load("models/final_model_lgb.pkl")
cat=joblib.load("models/final_model_cat.pkl")
weights=joblib.load("models/ensemble_weights.pkl")

@app.route("/predict", methods=["POST"])
def predict():

    try:

        city = request.json["city_name"]

        df = fetch_city_data(city)

        features = build_features(city, df)

        X = pd.DataFrame([features])
        X = X.reindex(columns=xgb.feature_names_in_, fill_value=0)

        p1 = cat.predict(X)[0]
        p2 = xgb.predict(X)[0]
        p3 = lgb.predict(X)[0]

        pm25 = (weights[0]*p1)+(weights[1]*p2)+(weights[2]*p3)

        aqi = pm25_to_aqi(pm25)
        category,color = get_category(aqi)
        # remove one-hot city fields before storing
        feature_store = {k:v for k,v in features.items() if not k.startswith("City_")}
        now = datetime.utcnow()
        predicted_date = datetime.combine(
    (now + timedelta(days=1)).date(),
    time.min
)
        doc = {
    "city": city,
    "features": feature_store,
    "predicted_pm25": float(pm25),
    "aqi": float(aqi),
    "category": category,
    "color": color,
    "generated_at": now,
    "predicted_for": predicted_date
}
        collection.update_one(
    {
        "city": city,
        "predicted_for": predicted_date
    },
    {"$set": doc},
    upsert=True
)

        return jsonify({
            "city":city,
            "predicted_pm25":round(float(pm25),2),
            "aqi":round(float(aqi),2),
            "category":category,
            "color":color,
            "predicted_for": predicted_date.strftime("%Y-%m-%d"), # Convert to string
            "generated_at": now.isoformat()                      # Convert to string
        })

    except Exception as e:

        return jsonify({
            "error":"Data temporarily unavailable",
            "details":str(e)
        }),500
@app.route("/predictions", methods=["GET"])
def get_predictions():

    try:
        results = list(collection.find({}, {
            "_id":0,
            "city":1,
            "aqi":1,
            "category":1,
            "color":1,
            "predicted_pm25":1,
            "predicted_for":1
        }))

        # convert datetime for JSON
        for r in results:
            r["predicted_for"] = r["predicted_for"].strftime("%Y-%m-%d")

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}),500

@app.route("/history/<city>",methods=["GET"])
def history(city):

    results=list(collection.find(
        {"city":city},
        {"_id":0,"aqi":1,"predicted_for":1}
    ).sort("predicted_for",1))

    for r in results:
        r["predicted_for"]=r["predicted_for"].strftime("%Y-%m-%d")

    return jsonify(results)

@app.route("/latest-predictions", methods=["GET"])
def latest_predictions():

    try:

        pipeline = [
            {
                "$sort": {"generated_at": -1}
            },
            {
                "$group": {
                    "_id": "$city",
                    "doc": {"$first": "$$ROOT"}
                }
            },
            {
                "$replaceRoot": {"newRoot": "$doc"}
            },
            {
                "$project": {
                    "_id": 0,
                    "city": 1,
                    "aqi": 1,
                    "category": 1,
                    "color": 1,
                    "predicted_pm25": 1,
                    "predicted_for": 1
                }
            }
        ]

        results = list(collection.aggregate(pipeline))

        for r in results:
            r["predicted_for"] = r["predicted_for"].strftime("%Y-%m-%d")

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/extensive-report", methods=["GET"])
def extensive_report():

    try:

        pipeline = [
            {"$sort": {"generated_at": -1}},
            {
                "$group": {
                    "_id": "$city",
                    "doc": {"$first": "$$ROOT"}
                }
            },
            {"$replaceRoot": {"newRoot": "$doc"}}
        ]

        docs = list(collection.aggregate(pipeline))

        report = []

        for d in docs:

            f = d["features"]

            row = {

                "city": d["city"],

                # PM2.5 lags (µg/m³)
                "pm25_lag_1": round(f["PM2.5_lag_1"],2),
                "pm25_lag_2": round(f["PM2.5_lag_2"],2),
                "pm25_lag_3": round(f["PM2.5_lag_3"],2),
                "pm25_lag_4": round(f["PM2.5_lag_4"],2),
                "pm25_lag_5": round(f["PM2.5_lag_5"],2),
                "pm25_lag_6": round(f["PM2.5_lag_6"],2),
                "pm25_lag_7": round(f["PM2.5_lag_7"],2),

                # Temperature (°C)
                "temp_lag_1": round(f["Temperature_lag_1"],2),
                "temp_lag_2": round(f["Temperature_lag_2"],2),
                "temp_lag_3": round(f["Temperature_lag_3"],2),

                # Humidity (%)
                "humidity_lag_1": round(f["Humidity_lag_1"],2),
                "humidity_lag_2": round(f["Humidity_lag_2"],2),
                "humidity_lag_3": round(f["Humidity_lag_3"],2),

                # Wind speed (m/s)
                "wind_lag_1": round(f["Wind_Speed_lag_1"],2),
                "wind_lag_2": round(f["Wind_Speed_lag_2"],2),
                "wind_lag_3": round(f["Wind_Speed_lag_3"],2),

                # Pressure (hPa)
                "pressure_lag_1": round(f["Pressure_lag_1"],2),
                "pressure_lag_2": round(f["Pressure_lag_2"],2),
                "pressure_lag_3": round(f["Pressure_lag_3"],2),

                # Rainfall (mm)
                "rain_lag_1": round(f["Rainfall_lag_1"],2),
                "rain_lag_2": round(f["Rainfall_lag_2"],2),
                "rain_lag_3": round(f["Rainfall_lag_3"],2),

                # Rolling stats (µg/m³)
                "pm25_roll_mean": round(f["PM2.5_roll_mean_7d"],2),
                "pm25_roll_std": round(f["PM2.5_roll_std_7d"],2),
                "pm25_roll_min": round(f["PM2.5_roll_min_7d"],2),
                "pm25_roll_max": round(f["PM2.5_roll_max_7d"],2),

                # Temporal
                "month": f["month"],
                "day_of_week": f["day_of_week"],
                "day_of_year": f["day_of_year"],
                "weekend": f["is_weekend"],

                # Predictions
                "predicted_pm25": round(d["predicted_pm25"],2),
                "aqi": round(d["aqi"],2),
                "category": d["category"]
            }

            report.append(row)

        return jsonify(report)

    except Exception as e:
        return jsonify({"error":str(e)}),500

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000)