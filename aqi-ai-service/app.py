from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load Artifacts
xgb_model = joblib.load('models/final_model_xgb.pkl')
lgb_model = joblib.load('models/final_model_lgb.pkl')
cat_model = joblib.load('models/final_model_cat.pkl')
weights = joblib.load('models/ensemble_weights.pkl') # [w_cat, w_xgb, w_lgb]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # 1. Convert to DataFrame
        input_df = pd.DataFrame([data])
        
        # 2. MANDATORY: Reorder columns to match the training features
        # This fixes the "At position 0 should be feature X" error
        model_features = cat_model.feature_names_
        
        # Add any missing columns as 0 (e.g., other City_OHE columns)
        for col in model_features:
            if col not in input_df.columns:
                input_df[col] = 0
                
        # Final reorder to match model's expected index positions
        input_df = input_df[model_features]
        
        # 3. Predict
        p_cat = cat_model.predict(input_df)[0]
        p_xgb = xgb_model.predict(input_df)[0]
        p_lgb = lgb_model.predict(input_df)[0]
        
        # 4. Ensemble Logic
        final_aqi = (weights[0] * p_cat) + (weights[1] * p_xgb) + (weights[2] * p_lgb)
        
        return jsonify({
            'prediction': round(float(final_aqi), 2),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'fail'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)