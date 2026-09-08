import React, { useState } from 'react';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Waves, Users } from 'lucide-react';

export default function LocationStatsMap({ locations = [] }) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const districts = ['All', 'Chennai', 'Cuddalore', 'Thiruvallur', 'Kanyakumari', 'Madurai'];

  const filteredLocations = selectedDistrict === 'All'
    ? locations
    : locations.filter((l) => l.district.toLowerCase() === selectedDistrict.toLowerCase());

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Moderate': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-white text-base">District Inundation & Incident Radar</h3>
          </div>
          <p className="text-xs text-slate-400">Real-time location-wise statistics, population impact, and infrastructure status</p>
        </div>

        {/* District Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDistrict === d
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of District / Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs font-medium">
            No active locations found for this district filter.
          </div>
        ) : (
          filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
                    {loc.district} • {loc.taluk || 'Taluk'}
                  </span>
                  <h4 className="font-bold text-white text-sm">{loc.village}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getSeverityBadge(loc.severity)}`}>
                  {loc.severity || 'High'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Population</span>
                  <span className="font-bold text-white">{loc.population?.toLocaleString() || 0}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Houses Affected</span>
                  <span className="font-bold text-amber-400">{loc.houses_affected?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Electricity:</span>
                  <span className={`font-semibold ${loc.electricity_status === 'Disrupted' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {loc.electricity_status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Water Supply:</span>
                  <span className={`font-semibold ${loc.water_supply_status === 'Disrupted' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {loc.water_supply_status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Comm Network:</span>
                  <span className="font-semibold text-blue-400">{loc.communication_status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
