import React from 'react';
import { AlertTriangle, ChevronRight, Siren } from 'lucide-react';

export default function AlertBanner({ alerts = [], onViewAlerts }) {
  if (alerts.length === 0) return null;

  const topAlert = alerts[0];

  return (
    <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-800/60 rounded-2xl p-4 mb-6 shadow-2xl shadow-rose-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 animate-pulse shrink-0">
          <Siren className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              CRITICAL EMERGENCY ALERT ({alerts.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{topAlert.timestamp}</span>
          </div>
          <h4 className="font-bold text-white text-sm mt-0.5">{topAlert.title}</h4>
          <p className="text-xs text-slate-300 line-clamp-1">{topAlert.message}</p>
        </div>
      </div>

      <button
        onClick={onViewAlerts}
        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-lg shadow-rose-600/30"
      >
        <span>View All Emergency Alerts</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
