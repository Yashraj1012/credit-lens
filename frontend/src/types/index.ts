export interface BorrowerData {
  age: number;
  annual_income: number;
  employment_length: number;
  loan_amount: number;
  loan_intent: 'PERSONAL' | 'EDUCATION' | 'MEDICAL' | 'VENTURE' | 'HOMEIMPROVEMENT' | 'DEBTCONSOLIDATION';
  home_ownership: 'RENT' | 'MORTGAGE' | 'OWN' | 'OTHER';
  credit_history_length: number;
  previous_defaults: 'Y' | 'N';
  loan_int_rate: number;
  loan_grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}

export interface DiagnosticsContribution {
  feature: string;
  contribution_pct: number;
}

export interface DiagnosticsPredictionOutput {
  default_probability: number;
  default_probability_pct: string;
  prediction_confidence: number;
  prediction_confidence_pct: string;
  risk_score: number;
  risk_category: string;
  loan_to_income_ratio: number;
  loan_to_income_pct: string;
}

export interface DiagnosticsModelInfo {
  type: string;
  n_estimators: number;
  n_features: number;
  feature_columns_source: string;
  importance_source: string;
}

export interface DiagnosticsPayload {
  raw_input: Record<string, string | number>;
  processed_input: Record<string, number>;
  prediction_output: DiagnosticsPredictionOutput;
  top_contributions: DiagnosticsContribution[];
  model_info: DiagnosticsModelInfo;
}

export interface PredictionResult {
  default_probability: number;
  risk_score: number;
  risk_category: 'Low Risk' | 'Medium Risk' | 'High Risk';
  feature_importance: Record<string, number>;
  diagnostics?: DiagnosticsPayload;
}


export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  status: string;
  latency_ms: number;
}

export interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  count: number;
}

export interface ConfusionMatrixData {
  labels: string[];
  values: ConfusionMatrixCell[];
}

export interface CurvePoint {
  fpr?: number;
  tpr?: number;
  recall?: number;
  precision?: number;
  threshold: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface RiskDistributionItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  low_risk: number;
  med_risk: number;
  high_risk: number;
}

export interface AnalyticsResponse {
  model_comparison: ModelMetrics[];
  confusion_matrix: ConfusionMatrixData;
  roc_curve: CurvePoint[];
  precision_recall_curve: CurvePoint[];
  global_importance: FeatureImportanceItem[];
  risk_distribution: RiskDistributionItem[];
  monthly_trend: MonthlyTrendItem[];
  total_assessments: number;
  average_risk_score: number;
}
