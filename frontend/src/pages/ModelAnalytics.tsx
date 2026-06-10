import React, { useEffect, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { 
  Cpu, 
  CheckSquare, 
  Zap, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { creditApi } from '../services/api';
import type { AnalyticsResponse } from '../types';
import { useTheme } from '../components/ThemeContext';

export const ModelAnalytics: React.FC = () => {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94A3B8' : '#475569';
  const labelColor = theme === 'dark' ? '#64748B' : '#334155';
  const gridColor = theme === 'dark' ? '#334155' : '#CBD5E1';
  const gridOpacity = theme === 'dark' ? 0.35 : 0.6;
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await creditApi.getAnalytics();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load model analytics. Check that the backend FastAPI server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-650">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics Service Offline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error}
        </p>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-all focus:outline-none"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Get Confusion Matrix items helper
  const getMatrixCount = (actual: string, predicted: string) => {
    return data.confusion_matrix.values.find(
      (v) => v.actual === actual && v.predicted === predicted
    )?.count || 0;
  };

  const tn = getMatrixCount('Non-Default', 'Non-Default');
  const fp = getMatrixCount('Non-Default', 'Default');
  const fn = getMatrixCount('Default', 'Non-Default');
  const tp = getMatrixCount('Default', 'Default');
  const totalMatrix = tn + fp + fn + tp;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Model Analytics & Evaluation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Evaluate offline metrics, model comparison performance cards, confusion matrix grids, and ROC curves.
        </p>
      </div>

      {/* Model Performance Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.model_comparison.map((model) => {
          const isActive = model.status.includes('Active');
          return (
            <div 
              key={model.name} 
              className={`glass-card p-5 md:p-6 flex flex-col justify-between relative overflow-hidden border-2 ${
                isActive ? 'border-brand-500 dark:border-brand-550 shadow-md shadow-brand-500/5 bg-brand-50/5 dark:bg-brand-950/5' : 'border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl">
                  ACTIVE CHAMPION
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">{model.name}</h3>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold tracking-wide uppercase">
                      {model.status}
                    </span>
                  </div>
                </div>

                {/* Score stats grid */}
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-bold">Accuracy</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {(model.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-bold">ROC AUC</span>
                    <p className="text-lg font-extrabold text-indigo-500">
                      {model.roc_auc.toFixed(3)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-bold">Precision</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {(model.precision * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-bold">Recall (TPR)</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {(model.recall * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* F1 & Latency info */}
              <div className="flex justify-between items-center pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  F1 Score: {model.f1_score.toFixed(3)}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {model.latency_ms} ms latency
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs Section: ROC and PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROC Curve */}
        <div className="glass-card p-5 md:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receiver Operating Characteristic (ROC)</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              False Positive Rate vs True Positive Rate (Sensitivity) across classification thresholds. <span className="text-brand-500 text-[10px] block mt-0.5 font-semibold">Generated from model evaluation dataset</span>
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.roc_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={gridOpacity} />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: labelColor, fontSize: 10 }} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 10, fill: labelColor, fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '12px'
                  }} 
                />
                {/* Random Guess line */}
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#64748B" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="tpr" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Random Forest" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve */}
        <div className="glass-card p-5 md:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Precision-Recall Curve</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Precision vs Recall (Sensitivity) showcasing trade-offs on skewed data distribution. <span className="text-brand-500 text-[10px] block mt-0.5 font-semibold">Generated from model evaluation dataset</span>
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.precision_recall_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={gridOpacity} />
                <XAxis dataKey="recall" type="number" domain={[0, 1]} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Recall (Sensitivity)', position: 'insideBottom', offset: -5, fill: labelColor, fontSize: 10 }} />
                <YAxis dataKey="precision" type="number" domain={[0, 1]} stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Precision (PPV)', angle: -90, position: 'insideLeft', offset: 10, fill: labelColor, fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Random Forest" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Heatmap Matrix */}
        <div className="lg:col-span-2 glass-card p-5 md:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confusion Matrix (Random Forest)</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Evaluated classification outputs comparing actual loan outcomes vs model predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* 2x2 Heatmap */}
            <div className="sm:col-span-8 grid grid-cols-3 gap-2 text-center text-sm font-semibold max-w-sm mx-auto w-full">
              {/* Header spacer */}
              <div></div>
              <div className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 pb-1">Pred Non-Default</div>
              <div className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 pb-1">Pred Default</div>

              {/* Row 1 */}
              <div className="flex items-center justify-end text-xs font-black uppercase text-slate-450 dark:text-slate-500 pr-2">Actual Safe</div>
              <div className="p-6 rounded-xl border border-emerald-250 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col justify-center items-center">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-450">{tn}</span>
                <span className="text-[9px] text-slate-450 uppercase font-medium">True Neg</span>
              </div>
              <div className="p-6 rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5 flex flex-col justify-center items-center">
                <span className="text-xl font-extrabold text-red-500">{fp}</span>
                <span className="text-[9px] text-slate-450 uppercase font-medium">False Pos</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-end text-xs font-black uppercase text-slate-450 dark:text-slate-500 pr-2">Actual Default</div>
              <div className="p-6 rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5 flex flex-col justify-center items-center">
                <span className="text-xl font-extrabold text-red-500">{fn}</span>
                <span className="text-[9px] text-slate-450 uppercase font-medium">False Neg</span>
              </div>
              <div className="p-6 rounded-xl border border-emerald-250 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col justify-center items-center">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-450">{tp}</span>
                <span className="text-[9px] text-slate-450 uppercase font-medium">True Pos</span>
              </div>
            </div>

            {/* Matrix summary stats */}
            <div className="sm:col-span-4 space-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-xl space-y-2.5">
                <div className="flex justify-between">
                  <span>Type I Error (FPR):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {((fp / (tn + fp)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type II Error (FNR):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {((fn / (tp + fn)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-850 pt-2 font-bold text-slate-800 dark:text-slate-200">
                  <span>Total test size:</span>
                  <span>{totalMatrix} samples</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics context note */}
        <div className="glass-card p-5 md:p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Performance Context
          </h3>
          <div className="space-y-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <p>
              The <strong>ROC AUC score</strong> of <strong>0.932</strong> indicates excellent model discriminative power between defaulting borrowers and non-defaulting ones.
            </p>
            <p>
              In credit scoring applications, minimizing False Negatives (Type II Errors - classifying a high-risk default borrower as safe) is critical to prevent loan portfolio losses.
            </p>
            <p>
              Thresholds are configured with a conservative bias: a probability above <strong>25%</strong> flags the loan as Medium Risk, and above <strong>60%</strong> as High Risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
