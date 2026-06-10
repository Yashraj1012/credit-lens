# ML Artifacts — `backend/models/`

This directory holds all trained Machine Learning artifacts required to run the CreditLens prediction engine.
The `PredictionService` loads every file **once at server startup** using `joblib.load()`.

> **No `scaler.pkl` is used.** The production model is a `RandomForestClassifier` — a tree-based ensemble that is
> completely scale-invariant. Features are fed directly after one-hot encoding with no `StandardScaler`
> or `MinMaxScaler` transformation.

---

## Required Files

### 1. `model.pkl`

**Type:** joblib binary — scikit-learn estimator  
**Model:** `RandomForestClassifier(n_estimators=200, max_features="sqrt", random_state=42)`

| Attribute | Value |
|---|---|
| `n_estimators` | 200 |
| `max_features` | `"sqrt"` |
| `max_depth` | `None` (fully grown) |
| `n_features_in_` | 22 |
| `n_classes_` | 2 (0 = no default, 1 = default) |
| `class_weight` | None |

**Requirements:**
- Must implement `predict(X)` and `predict_proba(X)` (standard scikit-learn API).
- The input array `X` must have exactly 22 columns in the order defined by `feature_columns.pkl`.
- Save with: `joblib.dump(model, "backend/models/model.pkl")`

---

### 2. `feature_columns.pkl`

**Type:** joblib binary — Python `list[str]`  
**Length:** 22 elements

Stores the **exact column ordering** used when the model was trained. The serving layer (`preprocess_input()`)
builds a feature dictionary and then reorders it according to this list before passing to the model.

```
Index  Column name                     Type
─────  ──────────────────────────────  ────────────────
  0    person_age                      continuous
  1    person_income                   continuous
  2    person_emp_length               continuous
  3    loan_amnt                       continuous
  4    loan_int_rate                   continuous
  5    loan_percent_income             derived (loan_amnt / person_income)
  6    cb_person_cred_hist_length      continuous
  7    person_home_ownership_OTHER     binary OHE
  8    person_home_ownership_OWN       binary OHE
  9    person_home_ownership_RENT      binary OHE  (MORTGAGE = baseline, dropped)
 10    loan_intent_EDUCATION           binary OHE
 11    loan_intent_HOMEIMPROVEMENT     binary OHE
 12    loan_intent_MEDICAL             binary OHE
 13    loan_intent_PERSONAL            binary OHE
 14    loan_intent_VENTURE             binary OHE  (DEBTCONSOLIDATION = baseline)
 15    loan_grade_B                    binary OHE
 16    loan_grade_C                    binary OHE
 17    loan_grade_D                    binary OHE
 18    loan_grade_E                    binary OHE
 19    loan_grade_F                    binary OHE
 20    loan_grade_G                    binary OHE  (A = lowest-risk baseline)
 21    cb_person_default_on_file_Y     binary
```

Save with: `joblib.dump(list(X_train.columns), "backend/models/feature_columns.pkl")`

---

### 3. `feature_importance.pkl`

**Type:** joblib binary — `pandas.DataFrame`  
**Columns:** `["Feature", "Importance"]`  
**Rows:** 22 (one per raw OHE column, sorted descending by importance)

Holds the **mean decrease in impurity (MDI)** importance scores computed by scikit-learn from all 200 trees.
The serving layer groups these 22 raw scores into 8 human-readable UI categories via `FEATURE_GROUP_MAP`
in `prediction_service.py`.

```
Feature                           Importance   UI Category
──────────────────────────────────────────────────────────────────────
loan_percent_income               0.2235       Loan-to-Income Ratio
person_income                     0.1500       Loan-to-Income Ratio
loan_int_rate                     0.1226       Interest Rate & Loan Grade
loan_amnt                         0.0780       Loan Amount
person_home_ownership_RENT        0.0775       Home Ownership
person_emp_length                 0.0599       Employment Stability
loan_grade_D                      0.0552       Interest Rate & Loan Grade
person_age                        0.0487       Borrower Age & History
cb_person_cred_hist_length        0.0372       Borrower Age & History
loan_grade_C                      0.0185       Interest Rate & Loan Grade
…
cb_person_default_on_file_Y       0.0132       Previous Default History
```

**Grouped category totals:**

| Category | Summed Importance |
|---|---|
| Loan-to-Income Ratio | 37.4% |
| Interest Rate & Loan Grade | 22.3% |
| Home Ownership | 9.5% |
| Borrower Age & History | 8.6% |
| Loan Amount | 7.8% |
| Loan Purpose | 7.1% |
| Employment Stability | 6.0% |
| Previous Default History | 1.3% |

Save with:
```python
import pandas as pd, joblib

fi_df = pd.DataFrame({
    "Feature":    X_train.columns,
    "Importance": model.feature_importances_
}).sort_values("Importance", ascending=False).reset_index(drop=True)

joblib.dump(fi_df, "backend/models/feature_importance.pkl")
```

---

## Evaluation JSON Files (project root)

These files live at the **project root** (not inside `backend/models/`) and are consumed by `analytics.py`.

### `evaluation_metrics.json`

Scalar metrics computed on the 20% held-out test set (6,517 samples):

```json
{
  "accuracy": 0.9314,
  "precision": 0.9543,
  "recall": 0.7201,
  "f1_score": 0.8208,
  "roc_auc": 0.9317,
  "test_samples": 6517,
  "confusion_matrix": {
    "tn": 5046, "fp": 49, "fn": 398, "tp": 1024
  }
}
```

### `roc_curve.json`

Full ROC curve arrays from `sklearn.metrics.roc_curve()`:

```json
{
  "fpr":        [0.0, 0.0003, ...],
  "tpr":        [0.0, 0.0007, ...],
  "thresholds": [1.0, 0.9998, ...]
}
```

### `precision_recall_curve.json`

Full PR curve arrays from `sklearn.metrics.precision_recall_curve()`:

```json
{
  "precision":  [1.0, 1.0, 0.997, ...],
  "recall":     [0.0, 0.0007, ...],
  "thresholds": [0.9998, 0.9997, ...]
}
```

---

## Training & Serialisation — Full Example

```python
import json
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, roc_curve, precision_recall_curve
)

# ── 1. Load & clean ──────────────────────────────────────────────────────────
df = pd.read_csv("credit_risk_dataset.csv")
df = df.dropna(subset=["person_emp_length", "loan_int_rate"])
df = df[(df["person_age"] <= 100) & (df["person_emp_length"] <= 60)]

# ── 2. Feature engineering ───────────────────────────────────────────────────
df["loan_percent_income"] = df["loan_amnt"] / df["person_income"]

# ── 3. One-hot encode (drop_first removes baselines) ─────────────────────────
df = pd.get_dummies(df, columns=[
    "person_home_ownership", "loan_intent",
    "loan_grade", "cb_person_default_on_file"
], drop_first=True)

# ── 4. Split ─────────────────────────────────────────────────────────────────
X = df.drop("loan_status", axis=1)
y = df["loan_status"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── 5. Train (no StandardScaler — trees are scale-invariant) ─────────────────
model = RandomForestClassifier(n_estimators=200, max_features="sqrt", random_state=42)
model.fit(X_train, y_train)

# ── 6. Evaluate ───────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]
cm     = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
fpr, tpr, roc_thr   = roc_curve(y_test, y_prob)
prec, rec, pr_thr   = precision_recall_curve(y_test, y_prob)

# ── 7. Save evaluation JSON files ─────────────────────────────────────────────
json.dump({
    "accuracy":         accuracy_score(y_test, y_pred),
    "precision":        precision_score(y_test, y_pred),
    "recall":           recall_score(y_test, y_pred),
    "f1_score":         f1_score(y_test, y_pred),
    "roc_auc":          roc_auc_score(y_test, y_prob),
    "test_samples":     len(y_test),
    "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
}, open("evaluation_metrics.json", "w"), indent=2)

json.dump({"fpr": fpr.tolist(), "tpr": tpr.tolist(), "thresholds": roc_thr.tolist()},
          open("roc_curve.json", "w"), indent=2)

json.dump({"precision": prec.tolist(), "recall": rec.tolist(), "thresholds": pr_thr.tolist()},
          open("precision_recall_curve.json", "w"), indent=2)

# ── 8. Save ML artifact PKL files ─────────────────────────────────────────────
joblib.dump(model, "backend/models/model.pkl")
joblib.dump(list(X_train.columns), "backend/models/feature_columns.pkl")

fi_df = pd.DataFrame({
    "Feature":    X_train.columns,
    "Importance": model.feature_importances_
}).sort_values("Importance", ascending=False).reset_index(drop=True)
joblib.dump(fi_df, "backend/models/feature_importance.pkl")

print("All 6 artifacts saved successfully.")
```

---

## Serving — How PredictionService Uses These Files

```
Startup:
  joblib.load(model.pkl)             → self.model
  joblib.load(feature_columns.pkl)   → self.feature_columns  (list of 22 names)
  joblib.load(feature_importance.pkl)→ grouped via FEATURE_GROUP_MAP
                                       → self.feature_importance_data  (8 categories)

Per request  POST /api/predict:
  1. preprocess_input(BorrowerData)
       → build dict {col: 0.0 for col in feature_columns}
       → fill numerical values
       → set OHE flags (home_ownership, loan_intent, loan_grade, default_on_file)
       → compute loan_percent_income = loan_amnt / person_income
       → reorder by feature_columns → numpy array (1, 22)

  2. model.predict_proba(X)[0][1]
       → default_probability (float 0–1)
       → risk_score = int(prob * 100)
       → risk_category = "Low" | "Medium" | "High"

  3. _calculate_local_feature_contribution(X)
       → tree-path attribution across all 200 estimators
       → map column indices → FEATURE_GROUP_MAP → 8 UI labels
       → normalise to 100%
       → feature_importance dict

  4. _build_diagnostics(...)
       → raw_input, processed_input, prediction_output,
         top_contributions, model_info

  5. Return PredictionResponse (all fields populated, no mock data)
```
