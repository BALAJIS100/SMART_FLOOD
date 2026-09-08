import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RescueTrendChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { date: 'Sep 01', rescued: 120 },
    { date: 'Sep 02', rescued: 240 },
    { date: 'Sep 03', rescued: 380 },
    { date: 'Sep 04', rescued: 450 },
    { date: 'Sep 05', rescued: 510 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Rescue Velocity & Daily Trend</h3>
      <p className="text-[11px] text-slate-400 mb-4">Cumulative rescued individuals over the operational period</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Line type="monotone" dataKey="rescued" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
