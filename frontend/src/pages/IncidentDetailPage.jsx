import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, AlertOctagon, MapPin, LifeBuoy, Users, Droplets, Calendar, ShieldCheck } from 'lucide-react';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [locations, setLocations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rescued, setRescued] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [incRes, locRes, teamRes, rescRes] = await Promise.all([
          api.get(`/incidents/${id}`),
          api.get(`/locations?incident_id=${id}`),
          api.get(`/rescue-teams?incident_id=${id}`),
          api.get(`/rescued?incident_id=${id}`)
        ]);
        setIncident(incRes.data);
        setLocations(locRes.data);
        setTeams(teamRes.data);
        setRescued(rescRes.data);
      } catch (err) {
        console.error('Failed to fetch incident details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading incident command details...</div>;
  }

  if (!incident) {
    return <div className="p-8 text-center text-rose-400 text-sm">Incident record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incidents List</span>
      </button>

      {/* Incident Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {incident.severity} SEVERITY
              </span>
              <span className="text-xs text-slate-400 font-mono">• {incident.type}</span>
            </div>
            <h1 className="text-2xl font-black text-white">{incident.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{incident.district}, {incident.village || incident.taluk}, {incident.state}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Water Level</span>
              <span className="text-lg font-black text-cyan-400 font-mono">{incident.water_level}m</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Population Affected</span>
              <span className="text-lg font-black text-white font-mono">{incident.population_affected?.toLocaleString() || 0}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status</span>
              <span className="text-sm font-black text-emerald-400">{incident.status}</span>
            </div>
          </div>
        </div>

        {/* Description & Infrastructure Damage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-slate-300 mb-1">Situation Overview</h4>
            <p className="text-slate-400 leading-relaxed">{incident.description || 'No additional narrative provided.'}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1">Infrastructure Damage Assessment</h4>
            <p className="text-slate-400 leading-relaxed">{incident.infrastructure_damage || 'Assessments ongoing.'}</p>
          </div>
        </div>
      </div>

      {/* Linked Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Affected Villages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Affected Villages ({locations.length})</span>
            </h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white">{loc.village}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Pop: {loc.population?.toLocaleString()} | Houses: {loc.houses_affected}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployed Rescue Teams */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Deployed Teams ({teams.length})</span>
            </h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {teams.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white">{t.team_name} ({t.team_type})</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Leader: {t.team_leader} | Members: {t.members_count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rescued Persons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-cyan-400" />
              <span>Rescued Individuals ({rescued.length})</span>
            </h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {rescued.slice(0, 8).map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{p.person_name} ({p.age}y, {p.gender})</div>
                  <div className="text-[11px] text-slate-400">{p.location}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  {p.current_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
