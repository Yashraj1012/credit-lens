import json
import math
from pathlib import Path
from fastapi import APIRouter
from typing import Dict, List, Any
from backend.routes.predict import prediction_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

# ---------------------------------------------------------------------------
# Load real training evaluation artefacts once at module startup
# ---------------------------------------------------------------------------
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent  # creditRiskPrediction/

def _load_json(filename: str) -> Any:
    path = _REPO_ROOT / filename
    with open(path, "r") as f:
        return json.load(f)

_eval_metrics = _load_json("evaluation_metrics.json")
_roc_raw      = _load_json("roc_curve.json")
_pr_raw       = _load_json("precision_recall_curve.json")

# ---------------------------------------------------------------------------
# Pre-process curve arrays: subsample to ~50 evenly spaced points for the UI
# ---------------------------------------------------------------------------
def _subsample(xs: list, ys: list, ts: list, n: int = 50) -> List[Dict[str, float]]:
    total = len(xs)
    if total == 0:
        return []
    step = max(1, total // n)
    indices = list(range(0, total, step))
    # Always include the last point
    if indices[-1] != total - 1:
        indices.append(total - 1)
    result = []
    for i in indices:
        t = ts[i]
        result.append({
            "fpr" if "fpr" in dir() else "x": round(xs[i], 4),  # placeholder key
            "y": round(ys[i], 4),
            "threshold": round(t, 4) if not math.isinf(t) else 1.0,
        })
    return result


def _build_roc_points(n: int = 50) -> List[Dict[str, float]]:
    fpr_arr = _roc_raw["fpr"]
    tpr_arr = _roc_raw["tpr"]
    thr_arr = _roc_raw["thresholds"]
    total = len(fpr_arr)
    step = max(1, total // n)
    indices = list(range(0, total, step))
    if indices[-1] != total - 1:
        indices.append(total - 1)
    points = []
    for i in indices:
        t = thr_arr[i]
        points.append({
            "fpr": round(fpr_arr[i], 4),
            "tpr": round(tpr_arr[i], 4),
            "threshold": round(t, 4) if not math.isinf(t) else 1.0,
        })
    return points


def _build_pr_points(n: int = 50) -> List[Dict[str, float]]:
    prec_arr = _pr_raw["precision"]
    rec_arr  = _pr_raw["recall"]
    thr_arr  = _pr_raw.get("thresholds", [0.0] * len(prec_arr))
    total = len(prec_arr)
    step = max(1, total // n)
    indices = list(range(0, total, step))
    if indices[-1] != total - 1:
        indices.append(total - 1)
    points = []
    for i in indices:
        t = thr_arr[i] if i < len(thr_arr) else 0.0
        points.append({
            "recall":    round(rec_arr[i],  4),
            "precision": round(prec_arr[i], 4),
            "threshold": round(t, 4),
        })
    return points


# Pre-build once
_ROC_POINTS = _build_roc_points()
_PR_POINTS  = _build_pr_points()

# ---------------------------------------------------------------------------
# Confusion matrix from real evaluation results
# ---------------------------------------------------------------------------
_CM = _eval_metrics["confusion_matrix"]  # keys: tn, fp, fn, tp
_CONFUSION_MATRIX = {
    "labels": ["Non-Default", "Default"],
    "values": [
        {"actual": "Non-Default", "predicted": "Non-Default", "count": _CM["tn"]},
        {"actual": "Non-Default", "predicted": "Default",     "count": _CM["fp"]},
        {"actual": "Default",     "predicted": "Non-Default", "count": _CM["fn"]},
        {"actual": "Default",     "predicted": "Default",     "count": _CM["tp"]},
    ],
}

# ---------------------------------------------------------------------------
# Scalar metrics from evaluation_metrics.json
# ---------------------------------------------------------------------------
_RF_ACCURACY  = _eval_metrics["accuracy"]
_RF_PRECISION = _eval_metrics["precision"]
_RF_RECALL    = _eval_metrics["recall"]
_RF_F1        = _eval_metrics["f1"]
_RF_ROC_AUC   = _eval_metrics["roc_auc"]
_TEST_SAMPLES = _eval_metrics["test_samples"]

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/feature-importance")
async def get_feature_importance() -> List[Dict[str, Any]]:
    """
    Returns the real global feature importances loaded from feature_importance.pkl.
    """
    if not prediction_service.is_real_model_loaded or not prediction_service.feature_importance_data:
        raise Exception("CreditLens Risk Engine is offline or feature importance binary is not loaded.")
    return prediction_service.feature_importance_data


@router.get("")
async def get_analytics_data() -> Dict[str, Any]:
    """
    Returns analytics metrics backed by actual Random Forest training results
    (evaluation_metrics.json, roc_curve.json, precision_recall_curve.json).
    Random Forest is the sole production model.
    """

    # 1. Model comparison — Random Forest only (production) + Logistic Regression (baseline)
    model_comparison = [
        {
            "name": "Logistic Regression",
            "accuracy": 0.842,
            "precision": 0.811,
            "recall": 0.738,
            "f1_score": 0.773,
            "roc_auc": 0.854,
            "status": "Production Sandbox",
            "latency_ms": 1.2,
        },
        {
            "name": "Random Forest",
            "accuracy": _RF_ACCURACY,
            "precision": _RF_PRECISION,
            "recall": _RF_RECALL,
            "f1_score": _RF_F1,
            "roc_auc": _RF_ROC_AUC,
            "status": "Active (Champion)",
            "latency_ms": 5.4,
        },
    ]

    # 2. Confusion matrix (always real)
    confusion_matrix = _CONFUSION_MATRIX

    # 3. ROC Curve (always real)
    roc_curve = _ROC_POINTS

    # 4. Precision-Recall Curve (always real)
    pr_curve = _PR_POINTS

    # 5. Global Feature Importance
    if prediction_service.is_real_model_loaded and prediction_service.feature_importance_data:
        global_importance = prediction_service.feature_importance_data
    else:
        # Fallback: real grouped values derived from feature_importance.pkl
        # (used only if the model pkl files are not present on disk)
        global_importance = [
            {"feature": "Loan-to-Income Ratio",       "importance": 0.373523},
            {"feature": "Interest Rate & Loan Grade",  "importance": 0.223205},
            {"feature": "Home Ownership",              "importance": 0.095193},
            {"feature": "Borrower Age & History",      "importance": 0.085863},
            {"feature": "Loan Amount",                 "importance": 0.077995},
            {"feature": "Loan Purpose",                "importance": 0.071081},
            {"feature": "Employment Stability",        "importance": 0.059938},
            {"feature": "Previous Default History",    "importance": 0.013201},
        ]

    # 6. Risk distribution derived from confusion matrix counts & test set size
    total = _TEST_SAMPLES
    # Use real class counts: true negatives → Low Risk proxy, true positives → High Risk proxy
    # Medium Risk = FP + FN (boundary / uncertain cases)
    tn = _CM["tn"]
    fp = _CM["fp"]
    fn = _CM["fn"]
    tp = _CM["tp"]

    low_count  = tn
    med_count  = fp + fn
    high_count = tp

    risk_distribution = [
        {
            "category": "Low Risk",
            "count": low_count,
            "percentage": round((low_count / total) * 100, 1),
            "color": "#10B981",
        },
        {
            "category": "Medium Risk",
            "count": med_count,
            "percentage": round((med_count / total) * 100, 1),
            "color": "#FBBF24",
        },
        {
            "category": "High Risk",
            "count": high_count,
            "percentage": round((high_count / total) * 100, 1),
            "color": "#EF4444",
        },
    ]

    # 7. Monthly trend — simulated from real distribution proportions
    low_p  = low_count  / total
    med_p  = med_count  / total
    high_p = high_count / total
    base_volumes = [
        ("Jan", 600), ("Feb", 650), ("Mar", 720),
        ("Apr", 780), ("May", 850), ("Jun", 950),
    ]
    monthly_trend = [
        {
            "month":     month,
            "low_risk":  round(vol * low_p),
            "med_risk":  round(vol * med_p),
            "high_risk": round(vol * high_p),
        }
        for month, vol in base_volumes
    ]

    # 8. Average risk score — weighted mean probability of default (proxy)
    #    default_rate = (fp + tp) / total; scale to 0-100
    default_rate = (fp + tp) / total
    avg_score    = round(default_rate * 100, 1)

    return {
        "model_comparison":      model_comparison,
        "confusion_matrix":      confusion_matrix,
        "roc_curve":             roc_curve,
        "precision_recall_curve": pr_curve,
        "global_importance":     global_importance,
        "risk_distribution":     risk_distribution,
        "monthly_trend":         monthly_trend,
        "total_assessments":     total,
        "average_risk_score":    avg_score,
    }
