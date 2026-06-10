# CreditLens — Credit Risk Assessment Dashboard

A banking-grade credit risk assessment platform built with **React 19 + TypeScript** (frontend) and **FastAPI + scikit-learn** (backend). Enter borrower details to get an instant default probability, risk category, per-borrower feature attribution, and a full developer diagnostics payload — all powered by a trained **Random Forest** model with a **93.1% accuracy** and **0.932 ROC AUC**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [ML Model & Artifacts](#ml-model--artifacts)
4. [Training Pipeline](#training-pipeline)
5. [Feature Importance & Risk Drivers](#feature-importance--risk-drivers)
6. [API Reference](#api-reference)
7. [Running Locally](#running-locally)
8. [Tech Stack](#tech-stack)

---

## Project Overview

| Page               | Description                                                                                          |
|--------------------|------------------------------------------------------------------------------------------------------|
| **Dashboard**      | Live KPI cards, global feature importance bar chart, confusion matrix heat-map, risk distribution    |
| **Risk Assessment**| Borrower form → prediction → risk gauge, per-borrower drivers, Developer Diagnostics panel          |
| **Model Analytics**| ROC curve, Precision-Recall curve, model comparison table, confusion matrix                          |
| **About / Docs**   | Architecture diagram, artifact specs, API contracts, training pipeline, performance summary          |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                BROWSER (React + TypeScript)             │
│  Dashboard ── RiskAssessment ── ModelAnalytics ── About │
│                   ↕  creditApi (services/api.ts)        │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP/JSON  (CORS-enabled)
                      ▼
┌─────────────────────────────────────────────────────────┐
│            FASTAPI BACKEND  (Python 3.9)                │
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
│  │  feature_importance.pkl (raw importances│            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## ML Model & Artifacts

All artifacts live in `backend/models/`. They are loaded once at server startup by `PredictionService`.

| File | Type | Purpose |
|---|---|---|
| `model.pkl` | joblib · sklearn | `RandomForestClassifier(n_estimators=200, max_features="sqrt")` — the core prediction engine |
| `feature_columns.pkl` | joblib · list | Ordered list of 22 feature column names defining the exact input vector layout |
| `feature_importance.pkl` | joblib · DataFrame | `["Feature", "Importance"]` — mean impurity-decrease scores for all 22 raw OHE columns |
| `evaluation_metrics.json` | JSON · scalars | Accuracy, precision, recall, F1, ROC AUC, confusion matrix (test set, 6,517 samples) |
| `roc_curve.json` | JSON · arrays | Full ROC curve: `fpr`, `tpr`, `thresholds` (190 points, subsampled for rendering) |
| `precision_recall_curve.json` | JSON · arrays | Full PR curve: `precision`, `recall`, `thresholds` (204 points, subsampled) |

> **No `scaler.pkl` is used.** Random Forest is scale-invariant; inputs are fed directly after one-hot encoding with no `StandardScaler` transformation.

### Feature Vector (22 columns, as stored in `feature_columns.pkl`)

```
[0]  person_age                    continuous
[1]  person_income                 continuous
[2]  person_emp_length             continuous
[3]  loan_amnt                     continuous
[4]  loan_int_rate                 continuous
[5]  loan_percent_income           derived  (loan_amnt / person_income)
[6]  cb_person_cred_hist_length    continuous
[7]  person_home_ownership_OTHER   binary OHE
[8]  person_home_ownership_OWN     binary OHE
[9]  person_home_ownership_RENT    binary OHE
[10] loan_intent_EDUCATION         binary OHE
[11] loan_intent_HOMEIMPROVEMENT   binary OHE
[12] loan_intent_MEDICAL           binary OHE
[13] loan_intent_PERSONAL          binary OHE
[14] loan_intent_VENTURE           binary OHE
[15] loan_grade_B                  binary OHE
[16] loan_grade_C                  binary OHE
[17] loan_grade_D                  binary OHE
[18] loan_grade_E                  binary OHE
[19] loan_grade_F                  binary OHE
[20] loan_grade_G                  binary OHE
[21] cb_person_default_on_file_Y   binary
```

Baselines dropped during `get_dummies(drop_first=True)`: `MORTGAGE`, `DEBTCONSOLIDATION`, `loan_grade_A`.

---

## Training Pipeline

```python
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, roc_curve, precision_recall_curve

# 1. Load & clean
df = pd.read_csv("credit_risk_dataset.csv")
df = df.dropna(subset=["person_emp_length", "loan_int_rate"])
df = df[df["person_age"] <= 100]
df = df[df["person_emp_length"] <= 60]

# 2. Feature engineering — derived feature (most important)
df["loan_percent_income"] = df["loan_amnt"] / df["person_income"]

# 3. One-hot encoding (drop_first=True removes baselines)
df = pd.get_dummies(df, columns=[
    "person_home_ownership", "loan_intent",
    "loan_grade", "cb_person_default_on_file"
], drop_first=True)

# 4. Train / test split (80/20, stratified on default label)
X = df.drop("loan_status", axis=1)
y = df["loan_status"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 5. Train — no StandardScaler (trees are scale-invariant)
model = RandomForestClassifier(n_estimators=200, max_features="sqrt", random_state=42)
model.fit(X_train, y_train)

# 6. Evaluate
y_prob = model.predict_proba(X_test)[:, 1]
fpr, tpr, thr    = roc_curve(y_test, y_prob)
prec, rec, pthr  = precision_recall_curve(y_test, y_prob)

# 7. Serialise artifacts
joblib.dump(model,                 "backend/models/model.pkl")
joblib.dump(list(X_train.columns), "backend/models/feature_columns.pkl")

fi_df = pd.DataFrame({
    "Feature":    X_train.columns,
    "Importance": model.feature_importances_
}).sort_values("Importance", ascending=False).reset_index(drop=True)
joblib.dump(fi_df, "backend/models/feature_importance.pkl")
```

---

## Feature Importance & Risk Drivers

### Global Feature Importance (Dashboard bar chart)

Loaded from `feature_importance.pkl` at startup. The 22 raw OHE column importances are **grouped into 8 human-readable categories** via `FEATURE_GROUP_MAP` in `prediction_service.py` and served through `GET /api/analytics`:

| Category | Grouped Importance |
|---|---|
| Loan-to-Income Ratio | **37.4%** |
| Interest Rate & Loan Grade | **22.3%** |
| Home Ownership | 9.5% |
| Borrower Age & History | 8.6% |
| Loan Amount | 7.8% |
| Loan Purpose | 7.1% |
| Employment Stability | 6.0% |
| Previous Default History | 1.3% |

### Borrower Risk Drivers (per-prediction, Risk Assessment panel)

Computed live for every `POST /api/predict` call using **tree-path attribution** (`_calculate_local_feature_contribution`):

1. For each of the 200 trees, trace the decision path taken by the input sample.
2. At every split node, record `Δprob = node_prob[child] − node_prob[parent]` for the feature used.
3. Accumulate `|Δprob|` per feature index, then average across all trees.
4. Map raw column indices → 8 UI category labels via `FEATURE_GROUP_MAP`.
5. Normalise to sum to 100%.

Because these are **per-borrower** values, they differ from global importances. A borrower with `previous_defaults=Y` will show significantly higher "Previous Default History" weight than the global 1.3% average.

---

## API Reference

### `POST /api/predict`

**Request:**
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
  "loan_grade": "C"
}
```

**Response:**
```json
{
  "default_probability": 0.03,
  "risk_score": 3,
  "risk_category": "Low Risk",
  "feature_importance": {
    "Loan-to-Income Ratio":       41.4,
    "Interest Rate & Loan Grade": 19.4,
    "Home Ownership":             10.9,
    "Loan Amount":                10.2,
    "Loan Purpose":                5.4,
    "Borrower Age & History":      5.2,
    "Previous Default History":    4.3,
    "Employment Stability":        3.2
  },
  "diagnostics": {
    "raw_input": {
      "age": 28, "annual_income": 65000.0, "loan_amount": 12000.0,
      "loan_intent": "PERSONAL", "home_ownership": "RENT",
      "previous_defaults": "No", "loan_int_rate": 11.5, "loan_grade": "C"
    },
    "processed_input": {
      "person_age": 28.0, "person_income": 65000.0,
      "loan_percent_income": 0.184615,
      "person_home_ownership_RENT": 1.0,
      "loan_intent_PERSONAL": 1.0,
      "loan_grade_C": 1.0
    },
    "prediction_output": {
      "default_probability": 0.03,
      "default_probability_pct": "3.00%",
      "prediction_confidence": 0.97,
      "prediction_confidence_pct": "97.00%",
      "risk_score": 3,
      "risk_category": "Low Risk",
      "loan_to_income_pct": "18.46%"
    },
    "top_contributions": [
      { "feature": "Loan-to-Income Ratio",       "contribution_pct": 41.4 },
      { "feature": "Interest Rate & Loan Grade",  "contribution_pct": 19.4 }
    ],
    "model_info": {
      "type": "RandomForestClassifier",
      "n_estimators": 200,
      "n_features": 22,
      "feature_columns_source": "feature_columns.pkl",
      "importance_source": "feature_importance.pkl"
    }
  }
}
```

**Risk category thresholds:**

| Risk Score | Category |
|---|---|
| 0 – 29 | Low Risk |
| 30 – 64 | Medium Risk |
| 65 – 100 | High Risk |

`confidence = max(probability, 1 − probability)`

---

### `GET /api/analytics`

Returns model metrics, confusion matrix, ROC/PR curves, global feature importance, risk distribution, and monthly trend data. All scalar metrics come from `evaluation_metrics.json`; curve data from `roc_curve.json` and `precision_recall_curve.json`.

---

## Running Locally

### Prerequisites

- Python 3.9+
- Node.js 18+

### Backend

```bash
cd creditRiskPrediction
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# Start FastAPI on port 8000 with hot-reload
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Vite dev server on http://localhost:5174
```

Ensure `backend/models/` contains all three pkl files and the three JSON evaluation files at the project root.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| ML | scikit-learn `RandomForestClassifier`, joblib, NumPy, pandas |
| Dev tools | ESLint, TypeScript strict mode, Vite HMR |

---

## Model Performance

Evaluated on **6,517 held-out test samples**:

| Metric | Score |
|---|---|
| Accuracy | 93.14% |
| ROC AUC | 0.9317 |
| Precision | 95.43% |
| Recall | 72.01% |
| F1 Score | 0.8208 |
| True Negatives | 5,046 |
| False Positives | 49 |
| False Negatives | 398 |
| True Positives | 1,024 |
