# CreditLens — Credit Risk Assessment Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-v1.3+-orange.svg)](https://scikit-learn.org/)

CreditLens is a professional, banking-grade credit risk assessment dashboard built with **React 19 + TypeScript** (frontend) and **FastAPI + scikit-learn** (backend). 

Borrower credit risk assessment form inputs are fed into a trained **Random Forest Classifier** to output default probability, credit risk categorization, per-borrower feature attribution (XAI), and a full developer diagnostics payload.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts (responsive charting), Lucide Icons |
| **Backend** | FastAPI (ASGI gateway), Pydantic v2 (validation), Uvicorn (serving) |
| **Machine Learning** | scikit-learn (`RandomForestClassifier`), joblib (serialization), NumPy, pandas |
| **Dev Tools** | ESLint, TypeScript Strict Mode |

---

## 🏗️ Architecture Overview

The platform uses a decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                BROWSER (React + TypeScript)             │
│  Dashboard ── RiskAssessment ── ModelAnalytics ── About │
│                   ↕  creditApi (services/api.ts)        │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP/JSON (CORS-enabled)
                      ▼
┌─────────────────────────────────────────────────────────┐
│            FASTAPI BACKEND (Python 3.9)                 │
│                                                         │
│  POST /api/predict           GET /api/analytics         │
│        │                           │                    │
│  predict.py                 analytics.py                │
│        │                   (loads JSON evaluation       │
│  PredictionService          files at request time)      │
│  (services/)                                            │
│        │                                                │
│  ┌─────────────────────────────────────────┐            │
│  │          ML ARTIFACT LAYER              │            │
│  │  model.pkl              (RandomForest)  │            │
│  │  feature_columns.pkl    (column order)  │            │
│  │  feature_importance.pkl (raw importances)            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 Machine Learning Pipeline

### 1. Data Processing & Cleanup
- Critical missing values are removed (e.g., `person_emp_length`, `loan_int_rate`).
- Outlier filtering is applied to drop impossible records (e.g., `person_age > 100`, `person_emp_length > 60`).
- Derived feature engineering is applied: `loan_percent_income = loan_amount / annual_income`.

### 2. Categorical One-Hot Encoding
Categorical variables are one-hot encoded using `pd.get_dummies(drop_first=True)` to remove reference baselines and prevent multicollinearity:
- **Baseline dropped home ownership**: `MORTGAGE` (retains `RENT`, `OWN`, `OTHER`)
- **Baseline dropped loan intent**: `DEBTCONSOLIDATION` (retains `PERSONAL`, `EDUCATION`, `MEDICAL`, `VENTURE`, `HOMEIMPROVEMENT`)
- **Baseline dropped loan grade**: `A` (retains `B`, `C`, `D`, `E`, `F`, `G`)

The final layout consists of **22 feature columns** saved to `feature_columns.pkl` to guarantee prediction payload consistency.

### 3. Model Training & XAI
- **Model**: `RandomForestClassifier` with `n_estimators=200` and `max_features="sqrt"` for variance reduction.
- **Global Feature Importance**: Calculated via Mean Decrease Impurity (MDI), grouped into 8 human-readable categories.
- **Local Feature Attribution**: Computed live for each request using **tree-path attribution** to trace probability shifts at each split node across all 200 estimators.

---

## 📊 Model Performance Metrics

Evaluated on **6,517 held-out test samples** (stratified 80/20 train/test split):

| Metric | Performance Score |
|---|---|
| **Accuracy** | **93.14%** |
| **ROC AUC** | **0.9317** |
| **Precision** | **95.43%** |
| **Recall (Sensitivity)** | **72.01%** |
| **F1 Score** | **0.8208** |
| **True Negatives (TN)** | 5,046 |
| **False Positives (FP)** | 49 |
| **False Negatives (FN)** | 398 |
| **True Positives (TP)** | 1,024 |

---

## 📂 Project Structure

```
creditRiskPrediction/
├── backend/
│   ├── main.py                     # FastAPI server entry point
│   ├── config.py                   # App configurations and CORS setups
│   ├── models/
│   │   ├── README.md               # Model engineering details
│   │   ├── request.py              # Pydantic request body schemas
│   │   ├── response.py             # Pydantic API response models
│   │   ├── feature_columns.pkl     # List of 22 ordered columns
│   │   ├── feature_importance.pkl  # Global MDI dataframe
│   │   └── model.pkl               # Trained Random Forest joblib model
│   ├── routes/
│   │   ├── predict.py              # /predict endpoint router
│   │   └── analytics.py            # /analytics endpoint router
│   └── services/
│       └── prediction_service.py   # Preprocessing, inference, tree-path attribution
├── frontend/
│   ├── index.html                  # Main HTML template (with inline theme loader)
│   ├── package.json                # Frontend package configurations
│   ├── tailwind.config.js          # Tailwind CSS configurations
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # App router & ThemeContext wrapper
│   │   ├── Sidebar.tsx             # Theme toggle & page navigation
│   │   ├── index.css               # Base Tailwind CSS rules
│   │   ├── components/
│   │   │   ├── ThemeContext.tsx    # Light/Dark context & localStorage sync
│   │   │   └── ThemeToggle.tsx     # Toggle button UI component
│   │   └── pages/
│   │       ├── Dashboard.tsx       # KPI widgets & Global Importance charts
│   │       ├── RiskAssessment.tsx  # Assessment form, diagnostics & gauges
│   │       ├── ModelAnalytics.tsx  # ROC/PR Curves & Confusion Matrix
│   │       └── AboutModel.tsx      # System architecture & pipeline specs
├── screenshots/
│   └── README.md                   # Placeholder and capture guide
├── evaluation_metrics.json         # Static test scalars
├── precision_recall_curve.json     # Subsampled PR points
├── roc_curve.json                  # Subsampled ROC points
└── README.md                       # Root documentation (this file)
```

---

## ⚙️ Installation & Running

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**

### 1. Run the FastAPI Backend
```bash
# Navigate to project root
cd creditRiskPrediction

# Create and activate a virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend service will run on **http://localhost:8000**.*

### 2. Run the React Frontend
```bash
# Open a new terminal and navigate to the frontend directory
cd creditRiskPrediction/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend application will run on **http://localhost:5173** (or http://localhost:5174).*

---

## 🔌 API Interface

### `POST /api/predict`
Calculates loan credit risk classification.

**Request Payload:**
```json
{
  "age": 28,
  "annual_income": 65000.0,
  "employment_length": 4.0,
  "loan_amount": 12000.0,
  "loan_intent": "PERSONAL",
  "home_ownership": "RENT",
  "credit_history_length": 6,
  "previous_defaults": "N",
  "loan_int_rate": 11.5,
  "loan_grade": "B"
}
```

**Response Payload:**
```json
{
  "default_probability": 0.04,
  "risk_score": 4,
  "risk_category": "Low Risk",
  "feature_importance": {
    "Loan-to-Income Ratio": 39.4,
    "Interest Rate & Loan Grade": 19.2,
    "Loan Amount": 11.9,
    "Home Ownership": 10.8,
    "Loan Purpose": 8.5,
    "Previous Default History": 3.6,
    "Employment Stability": 3.3,
    "Borrower Age & History": 3.3
  },
  "diagnostics": {
    "raw_input": {
      "age": 28,
      "annual_income": 65000.0,
      "employment_length": 4.0,
      "loan_amount": 12000.0,
      "loan_intent": "PERSONAL",
      "home_ownership": "RENT",
      "credit_history_length": 6,
      "previous_defaults": "No",
      "loan_int_rate": 11.5,
      "loan_grade": "B"
    },
    "processed_input": {
      "person_age": 28.0,
      "person_income": 65000.0,
      "person_emp_length": 4.0,
      "loan_amnt": 12000.0,
      "loan_int_rate": 11.5,
      "loan_percent_income": 0.184615,
      "cb_person_cred_hist_length": 6.0,
      "person_home_ownership_RENT": 1.0,
      "loan_intent_PERSONAL": 1.0,
      "loan_grade_B": 1.0
    },
    "prediction_output": {
      "default_probability": 0.04,
      "default_probability_pct": "4.00%",
      "prediction_confidence": 0.96,
      "prediction_confidence_pct": "96.00%",
      "risk_score": 4,
      "risk_category": "Low Risk",
      "loan_to_income_pct": "18.46%"
    }
  }
}
```

### `GET /api/analytics`
Returns aggregate statistics, monthly trends, feature importances, and chart data points.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✍️ Author
- **Yashraj Mishra** - [GitHub Profile](https://github.com/yashrajmishra247)
