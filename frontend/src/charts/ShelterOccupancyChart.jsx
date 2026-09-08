import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ShelterOccupancyChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Velachery School', capacity: 600, occupancy: 480 },
    { name: 'Mudichur Hall', capacity: 400, occupancy: 380 },
    { name: 'Annamalai Gym', capacity: 800, occupancy: 520 },
    { name: 'Ponneri High', capacity: 350, occupancy: 290 },
    { name: 'Vyasarpadi Hall', capacity: 300, occupancy: 260 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-80 flex flex-col">
      <h3 className="font-bold text-white text-sm mb-1">Shelter Capacity vs Occupancy</h3>
      <p className="text-[11px] text-slate-400 mb-4">Relief camp maximum capacity compared with current occupancy</p>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar dataKey="capacity" fill="#334155" name="Total Capacity" radius={[4, 4, 0, 0]} />
            <Bar dataKey="occupancy" fill="#f59e0b" name="Current Occupancy" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
