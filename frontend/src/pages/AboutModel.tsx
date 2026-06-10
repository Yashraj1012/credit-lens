import React, { useState } from 'react';
import {
  FolderTree,
  Database,
  FileCode,
  GitBranch,
  Layers,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  Cpu,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

// ─── Collapsible section wrapper ─────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, iconBg, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{title}</span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Monospace code block ─────────────────────────────────────────────────────
const CodeBlock: React.FC<{ label?: string; children: string }> = ({ label, children }) => (
  <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs font-mono">
    {label && (
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
    )}
    <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
  </div>
);

// ─── Artifact card ────────────────────────────────────────────────────────────
const ArtifactCard: React.FC<{
  filename: string;
  type: string;
  size?: string;
  color: string;
  description: string;
  details: string[];
}> = ({ filename, type, size, color, description, details }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <div>
        <code className={`text-xs font-bold font-mono ${color}`}>{filename}</code>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{type}</span>
          {size && <span className="text-[10px] text-slate-400">· {size}</span>}
        </div>
      </div>
    </div>
    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    <ul className="space-y-1">
      {details.map((d, i) => (
        <li key={i} className="text-[10px] text-slate-500 dark:text-slate-500 flex items-start gap-1.5">
          <span className="mt-0.5 text-slate-400">→</span>
          <span>{d}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Pipeline step ────────────────────────────────────────────────────────────
const PipelineStep: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-[11px]">{n}</div>
      {n < 7 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1" />}
    </div>
    <div className="pb-5 space-y-1.5 flex-1">
      <span className="font-bold text-sm text-slate-900 dark:text-white">{title}</span>
      <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export const AboutModel: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Risk Engine Architecture
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Developer documentation: ML pipeline, artifact specifications, API contracts, and explainability design.
        </p>
      </div>

      {/* ── 1. Architecture Diagram ─────────────────────────────────────────── */}
      <Section
        title="System Architecture"
        subtitle="End-to-end data flow from browser to model and back"
        icon={<GitBranch className="w-5 h-5" />}
        iconBg="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
      >
        <CodeBlock label="architecture diagram">
{`┌─────────────────────────────────────────────────────────┐
│                  BROWSER  (React + TypeScript)          │
│  Dashboard ── RiskAssessment ── ModelAnalytics ── About │
│       ↕               ↕               ↕                 │
│          creditApi  (services/api.ts)                   │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP/JSON  (CORS-enabled)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND  (Python 3.9)              │
│                                                         │
│  POST /api/predict          GET /api/analytics          │
│       │                          │                      │
│  predict.py               analytics.py                  │
│       │                          │                      │
│  PredictionService          loads JSON artefacts        │
│  (services/)                (evaluation_metrics,        │
│       │                      roc_curve,                 │
│       │                      precision_recall_curve)    │
│       ▼                                                 │
│  ┌─────────────────────────────────────────────┐        │
│  │           ML ARTIFACT LAYER                 │        │
│  │                                             │        │
│  │  model.pkl              ← RandomForest      │        │
│  │  feature_columns.pkl    ← column ordering   │        │
│  │  feature_importance.pkl ← global importances│        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘`}
        </CodeBlock>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          The backend maintains a <strong>singleton <code className="text-brand-500">PredictionService</code></strong> that loads all pkl artifacts once at startup.
          Every prediction call preprocesses user input, runs <code className="text-brand-500">predict_proba()</code>, computes tree-path attribution, and assembles a diagnostics payload — all within a single synchronous request cycle.
        </p>
      </Section>

      {/* ── 2. Folder Structure ─────────────────────────────────────────────── */}
      <Section
        title="Project Structure"
        subtitle="Monorepo layout with clean backend/frontend separation"
        icon={<FolderTree className="w-5 h-5" />}
        iconBg="bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
      >
        <CodeBlock label="directory tree">
{`creditRiskPrediction/
├── evaluation_metrics.json       # Test-set metrics (accuracy, AUC, CM)
├── roc_curve.json                # Full ROC curve array (fpr / tpr / threshold)
├── precision_recall_curve.json   # Full PR curve array (precision / recall)
│
├── backend/
│   ├── models/
│   │   ├── README.md             # Artifact specification (this doc)
│   │   ├── model.pkl             # Trained RandomForestClassifier (200 trees)
│   │   ├── feature_columns.pkl   # Ordered list of 22 feature column names
│   │   └── feature_importance.pkl# DataFrame: Feature | Importance (raw)
│   ├── routes/
│   │   ├── analytics.py          # GET /api/analytics — metrics + curves + importance
│   │   └── predict.py            # POST /api/predict  — prediction + diagnostics
│   ├── services/
│   │   └── prediction_service.py # Core ML service: preprocess → predict → explain
│   ├── config.py                 # App settings & CORS origins
│   ├── main.py                   # FastAPI app entrypoint
│   └── requirements.txt          # Python dependencies
│
└── frontend/                     # Vite + React 19 + TypeScript + Tailwind
    └── src/
        ├── components/           # ThemeContext, ThemeToggle
        ├── pages/                # Dashboard, RiskAssessment, ModelAnalytics, About
        ├── services/api.ts       # Typed fetch client
        ├── types/index.ts        # TypeScript interfaces
        └── App.tsx               # Root with sidebar navigation`}
        </CodeBlock>
      </Section>

      {/* ── 3. ML Artifacts ─────────────────────────────────────────────────── */}
      <Section
        title="ML Artifacts"
        subtitle="Six files that power every prediction and analytics view"
        icon={<Database className="w-5 h-5" />}
        iconBg="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArtifactCard
            filename="model.pkl"
            type="joblib binary · sklearn"
            size="82 MB"
            color="text-brand-500"
            description="Trained RandomForestClassifier — the core prediction engine used for every /api/predict call."
            details={[
              'n_estimators=200, max_features="sqrt", max_depth=None',
              'n_features_in=22, n_classes=2 (no-default / default)',
              'Loaded once at startup via joblib.load() into PredictionService',
              'Used for both predict_proba() and tree-path attribution',
            ]}
          />
          <ArtifactCard
            filename="feature_columns.pkl"
            type="joblib binary · Python list"
            size="< 1 KB"
            color="text-indigo-500"
            description="Ordered list of 22 column names defining the exact feature vector layout the model was trained on."
            details={[
              '7 continuous features (age, income, emp_length, loan_amnt, int_rate, pct_income, cred_hist)',
              '4 one-hot: person_home_ownership_{OTHER,OWN,RENT} (MORTGAGE is baseline)',
              '5 one-hot: loan_intent_{EDUCATION,HOMEIMPROVEMENT,MEDICAL,PERSONAL,VENTURE}',
              '6 one-hot: loan_grade_{B,C,D,E,F,G} (A is baseline)',
              '1 binary: cb_person_default_on_file_Y',
            ]}
          />
          <ArtifactCard
            filename="feature_importance.pkl"
            type="joblib binary · pandas DataFrame"
            size="< 2 KB"
            color="text-violet-500"
            description='DataFrame with columns ["Feature", "Importance"] holding mean impurity-decrease importances for all 22 raw columns, sorted descending.'
            details={[
              'Top driver: loan_percent_income (22.4%) — derived feature',
              'Grouped into 8 human-readable UI categories via FEATURE_GROUP_MAP',
              'Serves the Global Model Feature Drivers bar chart on Dashboard',
              'Also seeds the static fallback when tree-attribution fails',
            ]}
          />
          <ArtifactCard
            filename="evaluation_metrics.json"
            type="JSON · test-set scalars"
            size="< 1 KB"
            color="text-emerald-500"
            description="Scalar metrics computed on the 6,517-sample held-out test set at training time."
            details={[
              'accuracy: 0.9314 · precision: 0.9543 · recall: 0.7201 · f1: 0.8208',
              'roc_auc: 0.9317 · test_samples: 6517',
              'confusion_matrix: { tn:5046, fp:49, fn:398, tp:1024 }',
              'Loaded by analytics.py to populate Model Analytics page metrics',
            ]}
          />
          <ArtifactCard
            filename="roc_curve.json"
            type="JSON · curve arrays"
            size="8.5 KB"
            color="text-amber-500"
            description="Full ROC curve computed on the test set: three parallel arrays (fpr, tpr, thresholds) with 190 points."
            details={[
              'Subsampled to ~62 evenly spaced points for chart rendering',
              'Includes threshold array for interactive cut-off exploration',
              'Dashed diagonal reference line rendered by ReferenceLine in recharts',
            ]}
          />
          <ArtifactCard
            filename="precision_recall_curve.json"
            type="JSON · curve arrays"
            size="7.5 KB"
            color="text-red-500"
            description="Full Precision-Recall curve on the test set: precision, recall, and thresholds arrays (204 points)."
            details={[
              'Subsampled to ~67 evenly spaced points for chart rendering',
              'Useful for evaluating model behaviour on imbalanced classes',
              'No baseline reference since baseline depends on class prevalence',
            ]}
          />
        </div>
      </Section>

      {/* ── 4. Training Pipeline ────────────────────────────────────────────── */}
      <Section
        title="Training Pipeline"
        subtitle="How the model was built, evaluated, and serialised"
        icon={<Layers className="w-5 h-5" />}
        iconBg="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
      >
        <div className="space-y-0">
          <PipelineStep n={1} title="Data Loading & Cleaning">
            <p>Read the Lending Club / Credit Risk dataset (CSV). Drop rows with null values in critical columns (<code>person_emp_length</code>, <code>loan_int_rate</code>). Remove outliers where <code>person_age &gt; 100</code> or <code>person_emp_length &gt; 60</code>.</p>
          </PipelineStep>
          <PipelineStep n={2} title="Feature Engineering">
            <p>Derive <code className="text-brand-500 text-[11px]">loan_percent_income = loan_amnt / person_income</code> — the single most important feature (22.4% importance). No external scaling is applied; tree-based models are scale-invariant.</p>
          </PipelineStep>
          <PipelineStep n={3} title="One-Hot Encoding">
            <p>Apply <code>pd.get_dummies(drop_first=True)</code> to three categorical columns:</p>
            <ul className="list-disc ml-4 space-y-0.5 mt-1">
              <li><code>person_home_ownership</code> → 3 binary columns (MORTGAGE dropped as baseline)</li>
              <li><code>loan_intent</code> → 5 binary columns (DEBTCONSOLIDATION dropped)</li>
              <li><code>loan_grade</code> → 6 binary columns (A dropped as lowest-risk baseline)</li>
            </ul>
            <p className="mt-1">The resulting 22-column order is saved to <code className="text-indigo-400 text-[11px]">feature_columns.pkl</code> so the serving layer always produces an identical vector.</p>
          </PipelineStep>
          <PipelineStep n={4} title="Train / Test Split">
            <p>80 / 20 stratified split on the binary target <code>loan_status</code> (0 = no default, 1 = default). Stratification preserves the class imbalance ratio (~22% default rate) in both splits. Test set: <strong>6,517 samples</strong>.</p>
          </PipelineStep>
          <PipelineStep n={5} title="Random Forest Training">
            <p>Fit <code>RandomForestClassifier(n_estimators=200, max_features="sqrt")</code> on the 80% training split. <code>max_features="sqrt"</code> adds randomness per tree for better generalisation. No external StandardScaler is used.</p>
          </PipelineStep>
          <PipelineStep n={6} title="Evaluation & Curve Generation">
            <p>Run <code>model.predict_proba(X_test)</code> on the held-out 20%. Compute accuracy, precision, recall, F1, ROC-AUC, confusion matrix, full ROC array, and full PR array using <code>sklearn.metrics</code>. Save all scalars to <code className="text-emerald-400 text-[11px]">evaluation_metrics.json</code> and curve arrays to the two JSON files.</p>
          </PipelineStep>
          <PipelineStep n={7} title="Artifact Serialisation">
            <p>Save three joblib binaries to <code>backend/models/</code>:</p>
            <CodeBlock>{`import joblib, pandas as pd

# Trained model
joblib.dump(model, "backend/models/model.pkl")

# Column order used during training
joblib.dump(list(X_train.columns), "backend/models/feature_columns.pkl")

# Feature importances (raw, per OHE column)
fi_df = pd.DataFrame({
    "Feature": X_train.columns,
    "Importance": model.feature_importances_
}).sort_values("Importance", ascending=False).reset_index(drop=True)
joblib.dump(fi_df, "backend/models/feature_importance.pkl")`}
            </CodeBlock>
          </PipelineStep>
        </div>
      </Section>

      {/* ── 5. Feature Importance & Risk Drivers ────────────────────────────── */}
      <Section
        title="Feature Importance & Borrower Risk Drivers"
        subtitle="Two distinct computations — global model weights vs. per-prediction attribution"
        icon={<BarChart3 className="w-5 h-5" />}
        iconBg="bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">Global Feature Importance</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Loaded from <code className="text-violet-400">feature_importance.pkl</code> at startup. These are the mean decrease in impurity (MDI) scores averaged across all 200 trees, computed by scikit-learn during training.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              The 22 raw OHE column importances are <strong>grouped into 8 human-readable categories</strong> via <code className="text-violet-400">FEATURE_GROUP_MAP</code> in <code>prediction_service.py</code> and served through <code>/api/analytics</code> to power the Dashboard bar chart.
            </p>
            <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700 mt-2">
              <div>Loan-to-Income Ratio    <span className="text-amber-400">37.4%</span></div>
              <div>Interest Rate &amp; Grade  <span className="text-amber-400">22.3%</span></div>
              <div>Home Ownership         <span className="text-amber-400"> 9.5%</span></div>
              <div>Borrower Age &amp; History <span className="text-amber-400"> 8.6%</span></div>
              <div className="text-slate-600">…</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">Borrower Risk Drivers (Local)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Computed <strong>per prediction</strong> using tree-path attribution inside <code className="text-violet-400">_calculate_local_feature_contribution()</code>. This is a lightweight approximation of SHAP values without an external library.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              For every tree in the forest, the algorithm traces the decision path taken by the input sample and accumulates the change in default probability (<code>node_prob[child] - node_prob[parent]</code>) for each feature used in a split. Contributions are averaged across all 200 trees, then mapped through <code>FEATURE_GROUP_MAP</code> and normalised to 100%.
            </p>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                Because these are per-borrower values, they will differ from global importances — a borrower with <code>previous_defaults=Y</code> will show much higher "Previous Default History" than the global average.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 6. API Contracts ─────────────────────────────────────────────────── */}
      <Section
        title="API Contract Schema"
        subtitle="Request and response shapes for all endpoints"
        icon={<FileCode className="w-5 h-5" />}
        iconBg="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
      >
        {/* POST /api/predict */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-brand-600 text-white font-black text-[10px] uppercase">POST</span>
            <code className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">/api/predict</code>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluates default probability, risk category, per-borrower feature drivers, and a full developer diagnostics payload.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request Body</span>
              <CodeBlock>
{`{
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
}`}
              </CodeBlock>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response JSON</span>
              <CodeBlock>
{`{
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
  "diagnostics": { ... }
}`}
              </CodeBlock>
            </div>
          </div>

          {/* Diagnostics sub-section */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">diagnostics object (expanded)</span>
            <CodeBlock>
{`{
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
      "loan_grade": "C"
    },
    "processed_input": {
      "person_age": 28.0,
      "person_income": 65000.0,
      "person_emp_length": 4.0,
      "loan_amnt": 12000.0,
      "loan_int_rate": 11.5,
      "loan_percent_income": 0.184615,
      "cb_person_cred_hist_length": 6.0,
      "person_home_ownership_OTHER": 0.0,
      "person_home_ownership_OWN": 0.0,
      "person_home_ownership_RENT": 1.0,
      "loan_intent_EDUCATION": 0.0,
      "loan_intent_HOMEIMPROVEMENT": 0.0,
      "loan_intent_MEDICAL": 0.0,
      "loan_intent_PERSONAL": 1.0,
      "loan_intent_VENTURE": 0.0,
      "loan_grade_B": 0.0,
      "loan_grade_C": 1.0,
      "loan_grade_D": 0.0,
      "loan_grade_E": 0.0,
      "loan_grade_F": 0.0,
      "loan_grade_G": 0.0,
      "cb_person_default_on_file_Y": 0.0
    },
    "prediction_output": {
      "default_probability": 0.03,
      "default_probability_pct": "3.00%",
      "prediction_confidence": 0.97,
      "prediction_confidence_pct": "97.00%",
      "risk_score": 3,
      "risk_category": "Low Risk",
      "loan_to_income_ratio": 0.1846,
      "loan_to_income_pct": "18.46%"
    },
    "top_contributions": [
      { "feature": "Loan-to-Income Ratio",       "contribution_pct": 41.4 },
      { "feature": "Interest Rate & Loan Grade",  "contribution_pct": 19.4 },
      { "feature": "Home Ownership",              "contribution_pct": 10.9 },
      { "feature": "Loan Amount",                 "contribution_pct": 10.2 },
      { "feature": "Loan Purpose",                "contribution_pct":  5.4 },
      { "feature": "Borrower Age & History",      "contribution_pct":  5.2 },
      { "feature": "Previous Default History",    "contribution_pct":  4.3 },
      { "feature": "Employment Stability",        "contribution_pct":  3.2 }
    ],
    "model_info": {
      "type": "RandomForestClassifier",
      "n_estimators": 200,
      "n_features": 22,
      "feature_columns_source": "feature_columns.pkl",
      "importance_source": "feature_importance.pkl"
    }
  }
}`}
            </CodeBlock>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* GET /api/analytics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-black text-[10px] uppercase">GET</span>
            <code className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">/api/analytics</code>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Returns model comparison cards, confusion matrix, ROC/PR curves, global feature importances, risk distribution, and monthly assessment trends.
          </p>
          <CodeBlock label="response shape">
{`{
  "model_comparison": [
    { "name": "Logistic Regression", "accuracy": 0.842, "roc_auc": 0.854,
      "status": "Production Sandbox", ... },
    { "name": "Random Forest", "accuracy": 0.9314, "roc_auc": 0.9317,
      "status": "Active (Champion)", "latency_ms": 5.4, ... }
  ],
  "confusion_matrix": {
    "labels": ["Non-Default", "Default"],
    "values": [
      { "actual": "Non-Default", "predicted": "Non-Default", "count": 5046 },
      { "actual": "Non-Default", "predicted": "Default",     "count": 49   },
      { "actual": "Default",     "predicted": "Non-Default", "count": 398  },
      { "actual": "Default",     "predicted": "Default",     "count": 1024 }
    ]
  },
  "roc_curve": [{ "fpr": 0.0, "tpr": 0.0, "threshold": 1.0 }, ...],
  "precision_recall_curve": [{ "recall": 1.0, "precision": 0.218, ... }, ...],
  "global_importance": [
    { "feature": "Loan-to-Income Ratio",      "importance": 0.3735 },
    { "feature": "Interest Rate & Loan Grade", "importance": 0.2232 },
    ...
  ],
  "risk_distribution": [
    { "category": "Low Risk",    "count": 5046, "percentage": 77.4, "color": "#10B981" },
    { "category": "Medium Risk", "count": 447,  "percentage": 6.9,  "color": "#FBBF24" },
    { "category": "High Risk",   "count": 1024, "percentage": 15.7, "color": "#EF4444" }
  ],
  "monthly_trend": [{ "month": "Jan", "low_risk": 465, "med_risk": 32, "high_risk": 93 }, ...],
  "total_assessments": 6517,
  "average_risk_score": 16.9
}`}
          </CodeBlock>
        </div>
      </Section>

      {/* ── 7. Model Performance Summary ────────────────────────────────────── */}
      <Section
        title="Production Model Performance"
        subtitle="Random Forest evaluated on 6,517 held-out test samples"
        icon={<ShieldCheck className="w-5 h-5" />}
        iconBg="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Accuracy',  value: '93.14%', sub: '6,070 / 6,517 correct',       color: 'text-brand-500' },
            { label: 'ROC AUC',   value: '0.9317', sub: 'Excellent discrimination',     color: 'text-indigo-500' },
            { label: 'Precision', value: '95.43%', sub: '1,024 TP / 1,073 predicted +', color: 'text-violet-500' },
            { label: 'Recall',    value: '72.01%', sub: '1,024 TP / 1,422 actual +',   color: 'text-amber-500' },
            { label: 'F1 Score',  value: '0.8208', sub: 'Harmonic mean P/R',           color: 'text-emerald-500' },
            { label: 'True Neg',  value: '5,046',  sub: 'Correctly rejected',           color: 'text-emerald-500' },
            { label: 'False Pos', value: '49',     sub: 'Safe → flagged as default',    color: 'text-red-400' },
            { label: 'False Neg', value: '398',    sub: 'Default → missed (Type II)',   color: 'text-red-500' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <span className="text-[10px] text-slate-400">{sub}</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100/30 text-[11px] text-amber-700 dark:text-amber-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            The 398 False Negatives (missed defaults) represent the primary risk in production. The current thresholds (≥30% → Medium, ≥65% → High) are calibrated conservatively to balance recall against false alarm fatigue. Adjust the thresholds in <code>prediction_service.py</code> based on your portfolio's risk appetite.
          </span>
        </div>
      </Section>

    </div>
  );
};
