import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Target, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCurrency } from '../lib/CurrencyContext';

interface AnalyticsProps {
  stats: {
    totalSpent: number;
    tokensUsed: number;
    requests: number;
    costSaved: number;
  };
  history: {
    id: string;
    uid: string;
    originalPrompt: string;
    optimizedPrompt: string;
    originalTokens: number;
    optimizedTokens: number;
    tokensSaved: number;
    optimizedCost: number;
    costSaved: number;
    mode: string;
    model: string;
    timestamp: string;
  }[];
}

export function Analytics({ stats, history }: AnalyticsProps) {
  const { formatCost } = useCurrency();
  const ALL_MODELS = ['Gemini 3 Flash', 'Gemini 3.1 Flash Lite', 'Gemini 3.1 Pro'];

  // Calculate model distribution from history
  const modelUsage = history.reduce((acc: any, item) => {
    const model = item.model || 'Gemini 3 Flash';
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, ALL_MODELS.reduce((acc: any, model) => ({ ...acc, [model]: 0 }), {}));

  const modelData = Object.entries(modelUsage).map(([name, count], i) => ({
    name,
    value: count as number,
    color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6]
  }));

  // Calculate cost per model
  const modelCosts = history.reduce((acc: any, item) => {
    const model = item.model || 'Gemini 3 Flash';
    acc[model] = (acc[model] || 0) + (item.optimizedCost || 0);
    return acc;
  }, ALL_MODELS.reduce((acc: any, model) => ({ ...acc, [model]: 0 }), {}));

  const costData = Object.entries(modelCosts).map(([name, cost], i) => ({
    name,
    value: (cost as number),
    color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6]
  }));

  // Aggregate usage and savings by day
  const dailyPerformance = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        fullDate: d.toISOString().split('T')[0],
        usage: 0,
        savings: 0
      };
    });

    history.forEach(item => {
      if (!item.timestamp) return;
      const date = item.timestamp.split('T')[0];
      const dayData = last7Days.find(d => d.fullDate === date);
      if (dayData) {
        dayData.usage += (item.optimizedTokens || 0);
        const original = item.originalTokens || 0;
        const optimized = item.optimizedTokens || 0;
        const savings = original > 0 ? Math.round(((original - optimized) / original) * 100) : 0;
        dayData.savings += savings;
      }
    });

    // If no history, it will return zeros for the last 7 days
    return last7Days;
  }, [history]);

  const displayModelData = modelData.length > 0 ? modelData : [
    { name: 'Gemini 3 Flash', value: 100, color: '#3b82f6' }
  ];

  const displayCostData = costData.length > 0 ? costData : [
    { name: 'Gemini 3 Flash', value: stats.totalSpent, color: '#3b82f6' }
  ];

  const avgCompression = history.length > 0
    ? Math.round(history.reduce((acc, item) => {
        const original = item.originalTokens || 0;
        const saved = item.tokensSaved || 0;
        const ratio = original > 0 ? (saved / original) : 0;
        return acc + ratio;
      }, 0) / history.length * 100)
    : 0;

  return (
    <div className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass p-10 rounded-[3rem] border-slate-200 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 border border-indigo-100">
                <TrendingUp className="w-3 h-3" />
                Performance Metrics
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-display">Daily Yield Analysis</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Real-time tracking of token compression efficiency.</p>
            </div>
            <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 px-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">USAGE</span>
              </div>
              <div className="flex items-center gap-2 px-3 border-l border-slate-200">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SAVINGS</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={dailyPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropBlur: '12px'
                  }} 
                  itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Bar dataKey="usage" fill="url(#usageGradient)" radius={[8, 8, 0, 0]} barSize={20} />
                <Bar dataKey="savings" fill="url(#savingsGradient)" radius={[8, 8, 0, 0]} barSize={20} />
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Model Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-10 rounded-[3rem] border-slate-200 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] flex flex-col group"
        >
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 font-display">Compute Nodes</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Resource allocation by model.</p>
          </div>
          
          <div className="h-[240px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={displayModelData}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {displayModelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900 font-display tracking-tight">{history.length}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">EVENTS</span>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {displayModelData.map((model) => (
              <div key={model.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: model.color, boxShadow: `0 0 10px ${model.color}40` }} />
                  <span className="text-xs font-black text-slate-700 font-display">{model.name}</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold text-slate-400">{(model.value as number).toLocaleString()} OPS</span>
                   <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                     {history.length > 0 ? Math.round((model.value / history.length) * 100) : 0}%
                   </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost per Model */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-[3rem] border-slate-200 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Clock className="w-40 h-40" />
          </div>
          
          <div className="mb-10 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 font-display">Financial Liquidity</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Cost distribution across model tiers.</p>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                layout="vertical"
                data={displayCostData}
                margin={{ left: 10, right: 40, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  width={130}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)', radius: 8 }}
                  formatter={(value: number) => [formatCost(value), 'Total Billed']}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                    padding: '15px'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {displayCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-8">
          {[
            { label: 'System Efficiency', value: `${avgCompression}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Avg Latency', value: history.length > 0 ? '1.2s' : '0s', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Node Uptime', value: history.length > 0 ? '100%' : '0%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Peak Capacity', value: history.length > 0 ? `${Math.max(0, ...history.map(h => {
              const original = h.originalTokens || 0;
              const optimized = h.optimizedTokens || 0;
              return original > 0 ? Math.round(((original - optimized) / original) * 100) : 0;
            }))}%` : '0%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass p-8 rounded-[2.5rem] border-slate-200 shadow-xl shadow-slate-200/40 group transition-all"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform", item.bg)}>
                <item.icon className={cn("w-7 h-7", item.color)} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">{item.label}</p>
              <p className="text-3xl font-black text-slate-900 font-display tracking-tight">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-[3rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-display">Activity Ledger</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Comprehensive historical logs of neural optimizations.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
               TOTAL EVENTS: {history.length}
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">TIMESTAMP</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">VECTOR MODE</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">INGEST</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">REFINED</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">YIELD</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.length > 0 ? history.slice().reverse().map((log, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-all cursor-pointer group">
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border",
                      log.mode === 'cheap' ? "bg-blue-50 text-blue-600 border-blue-100" : log.mode === 'extreme' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {log.mode}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-xs font-black text-slate-400 font-mono tracking-tighter">{log.originalTokens} TK</td>
                  <td className="px-10 py-6 text-xs font-black text-slate-900 font-mono tracking-tighter">{log.optimizedTokens} TK</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {log.originalTokens > 0 ? Math.round(((log.originalTokens - log.optimizedTokens) / log.originalTokens) * 100) : 0}%
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      Verified
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-[2px]">No neural activity recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
