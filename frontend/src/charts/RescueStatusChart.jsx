import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function RescueStatusChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Rescued', value: 45 },
    { name: 'In Shelter', value: 30 },
    { name: 'Evacuated', value: 15 },
    { name: 'In Hospital', value: 10 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Rescue Status Distribution</h3>
      <p className="text-[11px] text-slate-400 mb-4">Breakdown of current status of evacuated individuals</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
