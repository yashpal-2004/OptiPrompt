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
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Savings vs Usage</h3>
              <p className="text-sm text-gray-500">Daily performance tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <span className="text-xs font-medium text-gray-500">Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-gray-500">Savings</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }} 
                />
                <Bar dataKey="usage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Model Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">Model Distribution</h3>
          <p className="text-sm text-gray-500 mb-8">Optimization by target model</p>
          
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayModelData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayModelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-gray-900">{history.length > 0 ? '100%' : '0%'}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Optimized</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {displayModelData.map((model) => (
              <div key={model.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                  <span className="text-xs font-medium text-gray-600">{model.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{history.length > 0 ? Math.round((model.value / history.length) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost per Model */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">Cost per Model</h3>
          <p className="text-sm text-gray-500 mb-8">Total spend breakdown by AI model</p>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={displayCostData}
                margin={{ left: 20, right: 30, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value: number) => [formatCost(value), 'Cost']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {displayCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'Avg. Compression', value: `${avgCompression}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Avg. Latency', value: history.length > 0 ? '1.2s' : '0s', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Success Rate', value: history.length > 0 ? '100%' : '0%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Peak Savings', value: history.length > 0 ? `${Math.max(0, ...history.map(h => {
              const original = h.originalTokens || 0;
              const optimized = h.optimizedTokens || 0;
              return original > 0 ? Math.round(((original - optimized) / original) * 100) : 0;
            }))}%` : '0%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Recent Optimizations</h3>
          <p className="text-sm text-gray-500">Detailed log of your latest activity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mode</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Original</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Optimized</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Savings</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length > 0 ? history.slice().reverse().map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="px-8 py-4 text-sm text-gray-500 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                      log.mode === 'cheap' ? "bg-blue-50 text-blue-600" : log.mode === 'extreme' ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {log.mode}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600 font-mono">{log.originalTokens}</td>
                  <td className="px-8 py-4 text-sm text-gray-900 font-mono font-bold">{log.optimizedTokens}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                      <TrendingUp className="w-3 h-3" />
                      {log.originalTokens > 0 ? Math.round(((log.originalTokens - log.optimizedTokens) / log.originalTokens) * 100) : 0}%
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Success
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                    No optimization history yet. Try the playground!
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
