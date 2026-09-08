import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981'];

export default function IncidentSeverityChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Critical', value: 1 },
    { name: 'High', value: 2 },
    { name: 'Moderate', value: 1 },
    { name: 'Low', value: 1 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Incident Severity Distribution</h3>
      <p className="text-[11px] text-slate-400 mb-4">Classification of active and historical flood incidents by severity</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
