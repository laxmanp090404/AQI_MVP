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
if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000)