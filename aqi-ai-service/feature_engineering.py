import requests
import pandas as pd
from datetime import datetime
from city_coords import cities
import time

def safe_request(url, retries=3):

    for i in range(retries):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                return r.json()
        except requests.exceptions.RequestException:
            pass

        time.sleep(2)

    raise Exception("API request failed after retries")
def fetch_city_data(city):

    lat, lon = cities[city]

    # ---------- AIR QUALITY ----------
    air_url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}"
        f"&hourly=pm2_5"
        f"&past_days=7"
    )

    air_data = safe_request(air_url)

    air_df = pd.DataFrame({
        "time": air_data["hourly"]["time"],
        "pm25": air_data["hourly"]["pm2_5"]
    })

    # ---------- WEATHER ----------
    weather_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,precipitation"
        f"&past_days=7"
    )

    weather_data = safe_request(weather_url)

    weather_df = pd.DataFrame({
        "time": weather_data["hourly"]["time"],
        "temp": weather_data["hourly"]["temperature_2m"],
        "hum": weather_data["hourly"]["relative_humidity_2m"],
        "wind": weather_data["hourly"]["wind_speed_10m"],
        "press": weather_data["hourly"]["pressure_msl"],
        "rain": weather_data["hourly"]["precipitation"]
    })

    # ---------- MERGE ----------
    df = pd.merge(air_df, weather_df, on="time")

    # ---------- CONVERT TIME ----------
    df["time"] = pd.to_datetime(df["time"])
    
    # ---------- CONVERT DATA TYPES ----------
    cols = ["pm25","temp","hum","wind","press","rain"]
    df[cols] = df[cols].astype(float)

    # ---------- HOURLY → DAILY ----------
    df = df.resample("D", on="time").mean().dropna()

    return df
def build_features(city,df):

    f={}

    for i in range(1,8):
        f[f"PM2.5_lag_{i}"]=round(df["pm25"].iloc[-i], 2)

    for i in range(1,4):
        f[f"Temperature_lag_{i}"]=round(df["temp"].iloc[-i], 2)
        f[f"Humidity_lag_{i}"]=round(df["hum"].iloc[-i], 2)
        f[f"Wind_Speed_lag_{i}"]=round(df["wind"].iloc[-i], 2)
        f[f"Pressure_lag_{i}"]=round(df["press"].iloc[-i], 2)
        f[f"Rainfall_lag_{i}"]=round(df["rain"].iloc[-i], 2)

    f["PM2.5_roll_mean_7d"] = df["pm25"].tail(7).mean()
    f["PM2.5_roll_std_7d"]  = df["pm25"].tail(7).std()
    f["PM2.5_roll_min_7d"]  = df["pm25"].tail(7).min()
    f["PM2.5_roll_max_7d"]  = df["pm25"].tail(7).max()

    now=datetime.utcnow()

    f["month"]=now.month
    f["day_of_week"]=now.weekday()
    f["day_of_year"]=now.timetuple().tm_yday
    f["is_weekend"]=1 if now.weekday()>4 else 0

    f["City_Code"]=0

    for c in cities:
        f[f"City_{c}"]=1 if c==city else 0

    f["season_2"]=1 if now.month in [3,4,5] else 0
    f["season_3"]=1 if now.month in [6,7,8,9] else 0
    f["season_4"]=1 if now.month in [10,11] else 0

    return f