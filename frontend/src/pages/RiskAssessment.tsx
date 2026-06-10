import React, { useState } from 'react';
import {
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronLeft,
  Code2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { creditApi } from '../services/api';
import type { BorrowerData, PredictionResult, DiagnosticsPayload } from '../types';

// ─────────────────────────────────────────────────────────────
// DiagnosticsPanel — Developer-facing explainability component
// ─────────────────────────────────────────────────────────────
const DIAG_TABS = [
  { id: 'raw',          label: 'Raw Input',    icon: Terminal },
  { id: 'processed',   label: 'Model Vector', icon: Cpu },
  { id: 'prediction',  label: 'Prediction',   icon: BarChart3 },
  { id: 'contributions', label: 'Features',   icon: Code2 },
] as const;

type DiagTab = (typeof DIAG_TABS)[number]['id'];

interface DiagnosticsPanelProps {
  diagnostics: DiagnosticsPayload;
  riskCategory: string;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ diagnostics, riskCategory }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DiagTab>('raw');
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const riskColor = riskCategory === 'Low Risk'
    ? 'text-emerald-500'
    : riskCategory === 'Medium Risk'
    ? 'text-amber-500'
    : 'text-red-500';

  // Separate non-zero from zero OHE columns for the model vector view
  const processedEntries = Object.entries(diagnostics.processed_input);
  const nonZeroEntries = processedEntries.filter(([, v]) => v !== 0);
  const zeroEntries = processedEntries.filter(([, v]) => v === 0);
  const displayedEntries = showAllFeatures ? processedEntries : nonZeroEntries;

  const { prediction_output: po, top_contributions, raw_input, model_info } = diagnostics;

  // Colour gradient for contribution bars
  const contribColor = (idx: number) =>
    ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF', '#EDE9FE', '#DDD6FE'][idx] ?? '#C4B5FD';

  return (
    <div className="glass-card overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Developer Diagnostics</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Model input vector · prediction pipeline · feature attribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            {model_info.type}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Body — hidden when collapsed */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800/80">

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800/80 px-5 md:px-6 gap-1 pt-3 pb-0 scrollbar-none">
            {DIAG_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6 space-y-4">

            {/* ── TAB: Raw Input ── */}
            {activeTab === 'raw' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Exact values submitted by the user, before any transformation.
                </p>
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">raw_input.json</span>
                    <span className="text-[10px] text-slate-600">{Object.keys(raw_input).length} fields</span>
                  </div>
                  <div className="p-4 text-xs font-mono leading-7 overflow-x-auto">
                    <span className="text-slate-500">{'{'}</span>
                    {Object.entries(raw_input).map(([k, v], i, arr) => (
                      <div key={k} className="ml-4">
                        <span className="text-violet-400">&quot;{k}&quot;</span>
                        <span className="text-slate-500">: </span>
                        <span className={typeof v === 'string' ? 'text-emerald-400' : 'text-amber-400'}>
                          {typeof v === 'string' ? `"${v}"` : v}
                        </span>
                        {i < arr.length - 1 && <span className="text-slate-600">,</span>}
                      </div>
                    ))}
                    <span className="text-slate-500">{'}'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Processed Model Vector ── */}
            {activeTab === 'processed' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Full {model_info.n_features}-feature vector after preprocessing and one-hot encoding, ordered by
                  {' '}<code className="text-violet-400 text-[10px]">feature_columns.pkl</code>.
                </p>

                {/* Non-zero / active features */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {showAllFeatures ? 'all features' : 'active features (non-zero)'}
                    </span>
                    <button
                      onClick={() => setShowAllFeatures(p => !p)}
                      className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors"
                    >
                      {showAllFeatures
                        ? <><EyeOff className="w-3 h-3" /> Hide zeros ({zeroEntries.length})</>
                        : <><Eye className="w-3 h-3" /> Show all ({processedEntries.length})</>}
                    </button>
                  </div>
                  <div className="p-4 text-xs font-mono leading-6 overflow-x-auto max-h-72 overflow-y-auto">
                    <span className="text-slate-500">{'{'}</span>
                    {displayedEntries.map(([col, val], i) => (
                      <div key={col} className="ml-4">
                        <span className={val !== 0 ? 'text-violet-400' : 'text-slate-600'}>
                          &quot;{col}&quot;
                        </span>
                        <span className="text-slate-500">: </span>
                        <span className={val !== 0 ? 'text-amber-400' : 'text-slate-700'}>{val}</span>
                        {i < displayedEntries.length - 1 && <span className="text-slate-600">,</span>}
                      </div>
                    ))}
                    <span className="text-slate-500">{'}'}</span>
                  </div>
                </div>

                {/* Derived feature note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-950/20 border border-violet-900/30 text-[11px] text-violet-400">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>loan_percent_income</strong> is a derived feature computed as{' '}
                    <code className="bg-violet-950/40 px-1 rounded text-[10px]">
                      loan_amnt / person_income = {po.loan_to_income_pct}
                    </code>
                    {' '}and is the #1 model driver.
                  </span>
                </div>
              </div>
            )}

            {/* ── TAB: Prediction Output ── */}
            {activeTab === 'prediction' && (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Derived directly from <code className="text-violet-400 text-[10px]">model.predict_proba()</code> output.
                </p>

                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Default Probability</span>
                    <p className="text-2xl font-black text-red-500">{po.default_probability_pct}</p>
                    <span className="text-[10px] text-slate-400">P(default | features)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Prediction Confidence</span>
                    <p className="text-2xl font-black text-emerald-500">{po.prediction_confidence_pct}</p>
                    <span className="text-[10px] text-slate-400">max(p, 1−p)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Risk Category</span>
                    <p className={`text-lg font-black ${riskColor}`}>{po.risk_category}</p>
                    <span className="text-[10px] text-slate-400">score &lt;30 Low / &lt;65 Med / ≥65 High</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Loan-to-Income</span>
                    <p className="text-2xl font-black text-indigo-500">{po.loan_to_income_pct}</p>
                    <span className="text-[10px] text-slate-400">loan_amnt / person_income</span>
                  </div>
                </div>

                {/* Model info */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-800 bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">model_info</span>
                  </div>
                  <div className="p-4 text-xs font-mono leading-7 overflow-x-auto">
                    <span className="text-slate-500">{'{'}</span>
                    {Object.entries(model_info).map(([k, v], i, arr) => (
                      <div key={k} className="ml-4">
                        <span className="text-violet-400">&quot;{k}&quot;</span>
                        <span className="text-slate-500">: </span>
                        <span className={typeof v === 'string' ? 'text-emerald-400' : 'text-amber-400'}>
                          {typeof v === 'string' ? `"${v}"` : v}
                        </span>
                        {i < arr.length - 1 && <span className="text-slate-600">,</span>}
                      </div>
                    ))}
                    <span className="text-slate-500">{'}'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Feature Contributions ── */}
            {activeTab === 'contributions' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Per-sample tree-path attribution — how each feature group shifted the default probability for this specific borrower.
                </p>
                <div className="space-y-3">
                  {top_contributions.map(({ feature, contribution_pct }, idx) => (
                    <div key={feature} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{feature}</span>
                        <span className="font-bold tabular-nums" style={{ color: contribColor(idx) }}>
                          {contribution_pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(contribution_pct, 100)}%`,
                            backgroundColor: contribColor(idx),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* JSON view for copy-paste */}
                <details className="group">
                  <summary className="cursor-pointer text-[11px] text-violet-500 dark:text-violet-400 font-bold hover:text-violet-600 list-none flex items-center gap-1 pt-1">
                    <Code2 className="w-3.5 h-3.5" />
                    View as JSON
                  </summary>
                  <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                    <div className="p-4 text-xs font-mono leading-6 overflow-x-auto">
                      <span className="text-slate-500">[</span>
                      {top_contributions.map(({ feature, contribution_pct }, i) => (
                        <div key={feature} className="ml-4">
                          <span className="text-slate-500">{'{'}</span>
                          <span className="text-violet-400"> &quot;feature&quot;</span>
                          <span className="text-slate-500">: </span>
                          <span className="text-emerald-400">&quot;{feature}&quot;</span>
                          <span className="text-slate-500">, </span>
                          <span className="text-violet-400">&quot;contribution_pct&quot;</span>
                          <span className="text-slate-500">: </span>
                          <span className="text-amber-400">{contribution_pct.toFixed(2)}</span>
                          <span className="text-slate-500">{'}'}{i < top_contributions.length - 1 ? ',' : ''}</span>
                        </div>
                      ))}
                      <span className="text-slate-500">]</span>
                    </div>
                  </div>
                </details>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};


export const RiskAssessment: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState<Partial<BorrowerData>>({
    age: undefined,
    annual_income: undefined,
    employment_length: undefined,
    loan_amount: undefined,
    loan_intent: 'PERSONAL',
    home_ownership: 'RENT',
    credit_history_length: undefined,
    previous_defaults: 'N',
    loan_int_rate: undefined,
    loan_grade: 'A',
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // App States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear validation error for this field
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  // Validate the inputs
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Age validation
    if (formData.age === undefined) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Age must be between 18 and 120';
    }

    // Income validation
    if (formData.annual_income === undefined) {
      newErrors.annual_income = 'Annual income is required';
    } else if (formData.annual_income <= 0) {
      newErrors.annual_income = 'Income must be greater than 0';
    }

    // Employment length validation
    if (formData.employment_length === undefined) {
      newErrors.employment_length = 'Employment length is required';
    } else if (formData.employment_length < 0 || formData.employment_length > 60) {
      newErrors.employment_length = 'Employment length must be between 0 and 60 years';
    } else if (formData.age !== undefined && (formData.age - formData.employment_length < 14)) {
      newErrors.employment_length = 'Employment length is unrealistic relative to age';
    }

    // Loan amount validation
    if (formData.loan_amount === undefined) {
      newErrors.loan_amount = 'Loan amount is required';
    } else if (formData.loan_amount <= 0) {
      newErrors.loan_amount = 'Loan amount must be greater than 0';
    }

    // Credit history validation
    if (formData.credit_history_length === undefined) {
      newErrors.credit_history_length = 'Credit history length is required';
    } else if (formData.credit_history_length < 0 || formData.credit_history_length > 60) {
      newErrors.credit_history_length = 'Credit history must be between 0 and 60 years';
    } else if (formData.age !== undefined && formData.credit_history_length >= formData.age) {
      newErrors.credit_history_length = 'Credit history length cannot exceed borrower age';
    }

    // Interest rate validation
    if (formData.loan_int_rate === undefined) {
      newErrors.loan_int_rate = 'Interest rate is required';
    } else if (formData.loan_int_rate < 1.0 || formData.loan_int_rate > 35.0) {
      newErrors.loan_int_rate = 'Interest rate must be between 1.0% and 35.0%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);
      // Submit fully validated object
      const payload = formData as BorrowerData;
      const res = await creditApi.predict(payload);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred while communicating with the risk engine.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setApiError(null);
    setFormData({
      age: undefined,
      annual_income: undefined,
      employment_length: undefined,
      loan_amount: undefined,
      loan_intent: 'PERSONAL',
      home_ownership: 'RENT',
      credit_history_length: undefined,
      previous_defaults: 'N',
      loan_int_rate: undefined,
      loan_grade: 'A',
    });
  };

  // Styles based on risk classification
  const getRiskColors = (category: string) => {
    switch (category) {
      case 'Low Risk':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-250 dark:border-emerald-800/40',
          badge: 'bg-emerald-500 text-white',
          glow: 'glow-low'
        };
      case 'Medium Risk':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-250 dark:border-amber-800/40',
          badge: 'bg-amber-500 text-slate-900',
          glow: 'glow-medium'
        };
      case 'High Risk':
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-250 dark:border-red-800/40',
          badge: 'bg-red-500 text-white',
          glow: 'glow-high'
        };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Underwriting & Risk Assessment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter borrower details below to evaluate the credit risk score and default probability using our prediction engine.
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-650 dark:text-red-400 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
          <div className="space-y-1">
            <span className="font-bold">Risk Assessment Service Error:</span>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      {/* Main Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Form (7 Cols if results exist, otherwise 12) */}
        <div className={`${result ? 'lg:col-span-6' : 'lg:col-span-12 max-w-4xl mx-auto'} w-full transition-all duration-300`}>
          <div className="glass-card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Borrower Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Borrower Age (Years)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.age ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.age && <p className="text-[10px] font-bold text-red-500">{errors.age}</p>}
                </div>

                {/* Annual Income */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Annual Income (USD)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="annual_income"
                    value={formData.annual_income ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 60000"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.annual_income ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.annual_income && (
                    <p className="text-[10px] font-bold text-red-500">{errors.annual_income}</p>
                  )}
                </div>

                {/* Employment Length */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Employment Length (Years)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="employment_length"
                    value={formData.employment_length ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.employment_length ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.employment_length && (
                    <p className="text-[10px] font-bold text-red-500">{errors.employment_length}</p>
                  )}
                </div>

                {/* Loan Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Requested Loan Amount (USD)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="loan_amount"
                    value={formData.loan_amount ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.loan_amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.loan_amount && (
                    <p className="text-[10px] font-bold text-red-500">{errors.loan_amount}</p>
                  )}
                </div>

                {/* Home Ownership */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Home Ownership</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="home_ownership"
                    value={formData.home_ownership}
                    onChange={handleChange}
                    disabled={loading || !!result}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    <option value="RENT">Rent</option>
                    <option value="MORTGAGE">Mortgage</option>
                    <option value="OWN">Own</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Loan Intent */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Loan Intent</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="loan_intent"
                    value={formData.loan_intent}
                    onChange={handleChange}
                    disabled={loading || !!result}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="EDUCATION">Education</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="VENTURE">Venture / Business</option>
                    <option value="HOMEIMPROVEMENT">Home Improvement</option>
                    <option value="DEBTCONSOLIDATION">Debt Consolidation</option>
                  </select>
                </div>

                {/* Credit History Length */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Credit History Length (Years)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="credit_history_length"
                    value={formData.credit_history_length ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 8"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.credit_history_length ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.credit_history_length && (
                    <p className="text-[10px] font-bold text-red-500">{errors.credit_history_length}</p>
                  )}
                </div>

                {/* Previous Defaults */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Historical Default History</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="previous_defaults"
                    value={formData.previous_defaults}
                    onChange={handleChange}
                    disabled={loading || !!result}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    <option value="N">No defaults recorded</option>
                    <option value="Y">Has previous defaults</option>
                  </select>
                </div>

                {/* Interest Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Loan Interest Rate (%)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="loan_int_rate"
                    value={formData.loan_int_rate ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 11.5"
                    disabled={loading || !!result}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${
                      errors.loan_int_rate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.loan_int_rate && (
                    <p className="text-[10px] font-bold text-red-500">{errors.loan_int_rate}</p>
                  )}
                </div>

                {/* Loan Grade */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Loan Grade</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="loan_grade"
                    value={formData.loan_grade}
                    onChange={handleChange}
                    disabled={loading || !!result}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    <option value="A">Grade A (Lowest Risk)</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                    <option value="E">Grade E</option>
                    <option value="F">Grade F</option>
                    <option value="G">Grade G (Highest Risk)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {!result ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/10 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating credit profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Credit Assessment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Run Another Risk Evaluation</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Prediction results card & Feature importance (6 Cols if exists) */}
        {result && (
          <div className="lg:col-span-6 w-full space-y-6">
            {/* Assessment results */}
            <div className={`glass-card p-6 md:p-8 space-y-6 transition-all duration-500 border-2 ${getRiskColors(result.risk_category).border} ${getRiskColors(result.risk_category).bg} ${getRiskColors(result.risk_category).glow}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${getRiskColors(result.risk_category).text}`} />
                  <span>Evaluation Completed</span>
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getRiskColors(result.risk_category).badge}`}>
                  {result.risk_category}
                </span>
              </div>

              {/* Gauge Score Display */}
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="relative w-40 h-20 overflow-hidden flex justify-center items-end">
                  {/* Arc Background */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-full border-[12px] border-slate-200 dark:border-slate-800" />
                  {/* Colored Arc overlay */}
                  <div 
                    className={`absolute top-0 left-0 right-0 bottom-0 rounded-t-full border-[12px] border-transparent transition-all duration-1000`}
                    style={{
                      borderColor: result.risk_category === 'Low Risk' ? '#10B981' : result.risk_category === 'Medium Risk' ? '#F59E0B' : '#EF4444',
                      clipPath: `polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)`,
                      transform: `rotate(${(result.risk_score / 100) * 180 - 180}deg)`,
                      transformOrigin: 'bottom center',
                    }}
                  />
                  
                  {/* Score Text */}
                  <div className="absolute text-center z-10">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {result.risk_score}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Risk Score</p>
                  </div>
                </div>

                <div className="flex justify-between w-full text-[10px] text-slate-400 font-bold px-8 pt-1">
                  <span>0 (SAFE)</span>
                  <span>100 (DEFAULT)</span>
                </div>
              </div>

              {/* Progress bar default probability */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span>Probability of Default</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {(result.default_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${result.default_probability * 100}%`,
                      backgroundColor: result.risk_category === 'Low Risk' ? '#10B981' : result.risk_category === 'Medium Risk' ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
              </div>

              {/* Assessment Summary list */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Debt-to-Income (DTI)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formData.loan_amount && formData.annual_income
                      ? ((formData.loan_amount / formData.annual_income) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Monthly Installment Est.</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formData.loan_amount ? `$${(formData.loan_amount / 36).toFixed(2)}` : '0.00'}
                    <span className="text-[9px] text-slate-400 font-normal">/mo (36m)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Importance Panel */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-indigo-500" />
                  <span>Borrower Risk Drivers</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Contribution weights
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(result.feature_importance)
                  .sort((a, b) => b[1] - a[1])
                  .map(([feature, val], index) => (
                    <div key={feature} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {val.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${val}%`,
                            backgroundColor: index === 0 ? '#4F46E5' : index === 1 ? '#6366F1' : '#818CF8'
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-indigo-500" />
                <p className="leading-relaxed">
                  These percentages indicate the relative importance of factors contributing to this specific credit assessment based on model attribution weights.
                </p>
              </div>
            </div>

            {/* Developer Diagnostics Panel */}
            {result.diagnostics && (
              <DiagnosticsPanel
                diagnostics={result.diagnostics}
                riskCategory={result.risk_category}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
