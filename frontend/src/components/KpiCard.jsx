import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-950/30 border-blue-800/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      text: 'text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-950/30 border-emerald-800/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-950/30 border-amber-800/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      text: 'text-amber-400',
    },
    rose: {
      bg: 'bg-rose-950/30 border-rose-800/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      text: 'text-rose-400',
    },
    purple: {
      bg: 'bg-purple-950/30 border-purple-800/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      text: 'text-purple-400',
    },
    cyan: {
      bg: 'bg-cyan-950/30 border-cyan-800/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      text: 'text-cyan-400',
    },
  };

  const current = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl ${current.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${current.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {trend && (
          <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
  );
}
