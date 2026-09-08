import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AffectedPopulationChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { district: 'Chennai', population: 125000 },
    { district: 'Cuddalore', population: 85000 },
    { district: 'Thiruvallur', population: 62000 },
    { district: 'Kanyakumari', population: 24000 },
    { district: 'Madurai', population: 15000 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Affected Population by District</h3>
      <p className="text-[11px] text-slate-400 mb-4">Total estimated population impacted per district</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="district" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#38bdf8' }}
              formatter={(value) => [`${value.toLocaleString()} People`, 'Population']}
            />
            <Bar dataKey="population" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
