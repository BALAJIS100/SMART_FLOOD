import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ResourceRequirementChart({ data = [] }) {
  const chartData = data.length > 0 ? data.slice(0, 6) : [
    { name: 'Water Cans', total: 5000, allocated: 3200, available: 1800 },
    { name: 'Food Packets', total: 15000, allocated: 11000, available: 4000 },
    { name: 'Life Jackets', total: 2500, allocated: 1800, available: 700 },
    { name: 'Tarpaulins', total: 3500, allocated: 2800, available: 700 },
    { name: 'First Aid Kits', total: 1200, allocated: 950, available: 250 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Resource Allocation Breakdown</h3>
      <p className="text-[11px] text-slate-400 mb-4">Total stock versus allocated and available emergency inventory</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" stackId="a" />
            <Bar dataKey="available" fill="#10b981" name="Available Stock" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
