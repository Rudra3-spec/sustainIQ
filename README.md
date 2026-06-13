# SustainIQ

SustainIQ is a full-stack sustainability auditing platform for evaluating urban areas and properties. It combines a React dashboard, an Express API, MongoDB-backed user history, and a Flask machine-learning service to generate sustainability scores from 11 normalized environmental and socioeconomic indicators.

## Features

- User registration and JWT-based authentication
- AI-powered sustainability scoring
- Eleven-parameter sustainability audit form
- Location-based parameter estimation using browser geolocation
- Sustainability badge and score report
- Radar-chart comparison against regional benchmarks
- Persistent audit history stored in MongoDB
- Dashboard statistics and score trends
- CSV history export and PDF report download

## Architecture

```text
SUSTAIN_IQ/
|-- frontend/   React 19 + Vite + Tailwind CSS
|-- server/     Node.js + Express + MongoDB API
|-- ML/         Flask prediction API and trained model
`-- README.md
```

The services use these ports by default:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Express API | `http://localhost:5000` |
| Flask ML API | `http://localhost:5001` |

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens
- **Machine learning:** Python, Flask, pandas, NumPy, scikit-learn, joblib
- **Reports:** jsPDF, html2canvas, CSV export

## Prerequisites

- Node.js and npm
- Python 3.9 or newer
- MongoDB, either local or hosted

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd SUSTAIN_IQ
```

### 2. Configure the backend

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/sustainiq
JWT_SECRET=replace_with_a_secure_secret
PORT=5000
```

Install the backend dependencies:

```bash
cd server
npm install
```

### 3. Configure the ML service

From the project root:

```bash
cd ML
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

The trained model and scaler are already included as:

- `ML/sustainability_model.pkl`
- `ML/scaler.pkl`

### 4. Configure the frontend

The frontend uses the local service URLs by default. For custom deployments, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_ML_URL=http://localhost:5001
```

Install the frontend dependencies:

```bash
cd frontend
npm install
```

## Run Locally

Start each service in a separate terminal.

**Terminal 1 - Express API**

```bash
cd server
npm start
```

**Terminal 2 - Flask ML API**

```bash
cd ML
python app.py
```

**Terminal 3 - React frontend**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Sustainability Model

The ML API expects exactly 11 values between `0` and `1`, in this order:

1. Building density
2. Road connectivity
3. Public transit access
4. Air quality index
5. Green cover percentage
6. Carbon footprint
7. Population density
8. Crime rate
9. Average income
10. Renewable energy usage
11. Disaster risk index

Example request:

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d "{\"features\":[0.6,0.7,0.5,0.8,0.4,0.7,0.6,0.8,0.5,0.4,0.7]}"
```

Example response:

```json
{
  "sustainability_score": 0.72
}
```

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth/user` | Get the authenticated user |
| `GET` | `/api/auth/profile` | Get the profile and audit history |
| `POST` | `/api/auth/audit` | Save an audit result |
| `POST` | `/api/geo/fetch-attributes` | Estimate location-based attributes |
| `POST` | `/predict` | Generate a sustainability score |

Protected Express routes require the JWT in the `x-auth-token` request header.

## Available Scripts

From `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

From `server/`:

```bash
npm start
```

## Data Source

The included urban planning dataset is sourced from the [Urban Planning Dataset on Kaggle](https://www.kaggle.com/datasets/shivansh123908/urban-planning-dataset).

## Notes

- Browser location access is required for automatic location-based field population.
- The location endpoint currently produces deterministic estimates from latitude and longitude rather than calling an external geographic data provider.
- MongoDB must be available before starting the Express API.
