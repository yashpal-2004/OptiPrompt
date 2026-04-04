import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CostChartProps {
  history: any[];
}

export function CostChart({ history }: CostChartProps) {
  const chartData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        fullDate: d.toISOString().split('T')[0],
        tokens: 0,
        cost: 0
      };
    });

    history.forEach(item => {
      const date = item.timestamp.split('T')[0];
      const dayData = last7Days.find(d => d.fullDate === date);
      if (dayData) {
        dayData.tokens += item.optimizedTokens;
        dayData.cost += item.cost;
      }
    });

    return last7Days;
  }, [history]);

  return (
    <div className="h-[300px] w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Token Usage Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
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
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              padding: '12px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="tokens" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={0.1} 
            fill="#4f46e5" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
