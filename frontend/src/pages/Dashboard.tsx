import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar
} from 'recharts';
import { creditApi } from '../services/api';
import type { AnalyticsResponse } from '../types';
import { useTheme } from '../components/ThemeContext';

interface DashboardProps {
  onNavigateToAssessment: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToAssessment }) => {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94A3B8' : '#475569';
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await creditApi.getAnalytics();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Unable to establish connection with the CreditLens Risk Engine. Please verify the FastAPI backend is running on http://localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-transparent"></div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">API Connection Offline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
          {error}
        </p>
        <div className="flex gap-4 pt-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-all focus:outline-none"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
          <button
            onClick={onNavigateToAssessment}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-all focus:outline-none"
          >
            Enter Offline Mode
          </button>
        </div>
      </div>
    );
  }

  // Find distribution metrics
  const getStat = (cat: string) => {
    return data.risk_distribution.find((r) => r.category === cat)?.percentage || 0;
  };

  const getCount = (cat: string) => {
    return data.risk_distribution.find((r) => r.category === cat)?.count || 0;
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Amber, Red

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Portfolio Risk Monitor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and loan credit default probability indicators.
          </p>
        </div>

        <button
          onClick={onNavigateToAssessment}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 focus:ring-2 focus:ring-brand-500/40"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Risk Assessment</span>
        </button>
      </div>

      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Assessed */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              Total Assessments
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.total_assessments.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% from last month</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              Average Risk Score
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.average_risk_score}
            </h3>
            <span className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
              Scale 0 (Safe) to 100 (Default)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Safe Loans ratio */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              Low Risk Ratio
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-500">
              {getStat('Low Risk')}%
            </h3>
            <span className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
              {getCount('Low Risk').toLocaleString()} borrowers classified
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* High Risk Loans */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              High Risk Ratio
            </span>
            <h3 className="text-3xl font-extrabold text-red-500">
              {getStat('High Risk')}%
            </h3>
            <span className="text-[11px] text-slate-450 dark:text-slate-450 font-medium">
              Requires immediate supervisor review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Area chart of monthly volume */}
        <div className="lg:col-span-2 glass-card p-5 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assessment Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Number of borrowers assessed monthly categorized by credit risk level.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Med
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="low_risk" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLow)" name="Low Risk" />
                <Area type="monotone" dataKey="med_risk" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMed)" name="Medium Risk" />
                <Area type="monotone" dataKey="high_risk" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHigh)" name="High Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Chart of current distribution */}
        <div className="glass-card p-5 md:p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Risk Category</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Percentage breakdown of overall active portfolio classifications.
            </p>
          </div>

          <div className="h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '12px' 
                  }} 
                />
                <Pie
                  data={data.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {data.risk_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary */}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                Average
              </span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {data.average_risk_score}
              </p>
              <span className="text-[9px] text-slate-400">score</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {data.risk_distribution.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-350">{item.category}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Feature Importance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Feature Importance */}
        <div className="lg:col-span-2 glass-card p-5 md:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Model Feature Drivers</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              The aggregate weights of parameters influencing the Active Credit Classifier model.
            </p>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.global_importance}
                margin={{ top: 5, right: 10, left: 70, bottom: 5 }}
              >
                <XAxis type="number" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={130} />
                <Tooltip
                  formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="importance" fill="#0C85EB" radius={[0, 6, 6, 0]}>
                  {data.global_importance.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#0C85EB' : index === 1 ? '#4F46E5' : '#6366F1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity feed */}
        <div className="glass-card p-5 md:p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activities</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Latest borrower credit scores generated.
            </p>
          </div>

          <div className="flex-1 space-y-4 pt-4 overflow-y-auto max-h-[220px] pr-1">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">ID: TXN-4910</span>
                <span className="text-[11px] text-slate-400">Income: $84,000 | Amt: $20,000</span>
              </div>
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 font-bold border border-emerald-100/30">
                12% (Low)
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">ID: TXN-4909</span>
                <span className="text-[11px] text-slate-400">Income: $35,000 | Amt: $15,000</span>
              </div>
              <span className="px-2.5 py-1 text-xs rounded-full bg-red-55 dark:bg-red-950/20 text-red-600 dark:text-red-450 font-bold border border-red-100/30">
                72% (High)
              </span>
            </div>

            <div className="flex items-center justify-between pb-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">ID: TXN-4908</span>
                <span className="text-[11px] text-slate-400">Income: $55,000 | Amt: $18,000</span>
              </div>
              <span className="px-2.5 py-1 text-xs rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 font-bold border border-amber-100/30">
                48% (Med)
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToAssessment}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 flex items-center justify-center gap-1 transition-all"
          >
            <span>View assessment console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
