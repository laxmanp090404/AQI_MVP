from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load Models and Weights
xgb_model = joblib.load('models/final_model_xgb.pkl')
lgb_model = joblib.load('models/final_model_lgb.pkl')
cat_model = joblib.load('models/final_model_cat.pkl')
weights = joblib.load('models/ensemble_weights.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data])
        
        # Align features with the 59 training features
        model_features = cat_model.feature_names_
        for col in model_features:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[model_features]
        
        # Ensemble Prediction
        p_cat = cat_model.predict(input_df)[0]
        p_xgb = xgb_model.predict(input_df)[0]
        p_lgb = lgb_model.predict(input_df)[0]
        
        final_aqi = (weights[0] * p_cat) + (weights[1] * p_xgb) + (weights[2] * p_lgb)
        
        return jsonify({
            'prediction': round(float(max(0, final_aqi)), 2),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'fail'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)