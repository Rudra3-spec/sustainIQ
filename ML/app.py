import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Set base directory for pathing
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "sustainability_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

# Load the model and scaler on startup
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("[SUCCESS] Model and Scaler loaded successfully!")
except Exception as e:
    print(f"[ERROR] Error loading files: {e}")

@app.route("/")
def home():
    return {"status": "ML API Running"}
@app.route('/predict', methods=['POST'])

def predict():
    try:
        # 1. Get JSON from request
        content = request.json
        if not content or 'features' not in content:
            return jsonify({'error': 'Missing "features" key in JSON body'}), 400
        
        data = content['features']
        
        # 2. Ensure we have exactly 11 features
        if len(data) != 11:
            return jsonify({'error': f'Expected 11 features, got {len(data)}'}), 400

        # 3. Align names with what the Scaler expects
        feature_names = [
            "building_density", "road_connectivity", "public_transit_access",
            "air_quality_index", "green_cover_percentage", "carbon_footprint",
            "population_density", "crime_rate", "avg_income",
            "renewable_energy_usage", "disaster_risk_index"
        ]
        
        # Convert to DataFrame
        input_df = pd.DataFrame([data], columns=feature_names)
        
        # 4. Scale and Predict
        scaled_data = scaler.transform(input_df)
        prediction = model.predict(scaled_data)
        
        # DEBUG: Print to Python terminal to see if values change
        print(f"Prediction Result: {prediction[0]}")
        
        return jsonify({'sustainability_score': float(prediction[0])})

    except Exception as e:
        print(f"[ERROR] Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 400
if __name__ == "__main__":
    # Running on port 5001 to avoid conflict with Node.js
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)