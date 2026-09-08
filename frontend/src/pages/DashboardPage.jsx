import React, { useState, useEffect } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import AlertBanner from '../components/AlertBanner';
import LocationStatsMap from '../components/LocationStatsMap';
import RescueStatusChart from '../charts/RescueStatusChart';
import AffectedPopulationChart from '../charts/AffectedPopulationChart';
import RescueTrendChart from '../charts/RescueTrendChart';
import ShelterOccupancyChart from '../charts/ShelterOccupancyChart';
import ResourceRequirementChart from '../charts/ResourceRequirementChart';
import IncidentSeverityChart from '../charts/IncidentSeverityChart';
import {
  AlertOctagon,
  LifeBuoy,
  UserX,
  Home,
  Users,
  Package,
  Stethoscope,
  FileText,
  RefreshCw,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [kpis, setKpis] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [charts, setCharts] = useState({});
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes, locRes] = await Promise.all([
        api.get('/dashboard/kpi'),
        api.get('/dashboard/charts'),
        api.get('/locations')
      ]);
      setKpis(kpiRes.data.kpis || {});
      setAlerts(kpiRes.data.alerts || []);
      setCharts(chartRes.data || {});
      setLocations(locRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 30s auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">FLOOD RESCUE COMMAND CENTER</h2>
          <p className="text-xs text-slate-400">Real-time situational awareness, emergency monitoring & live analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <AlertBanner alerts={alerts} onViewAlerts={() => {}} />

      {/* 10 Key KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard
          title="Active Incidents"
          value={kpis.active_incidents ?? 0}
          subtext={`Total Recorded: ${kpis.total_incidents ?? 0}`}
          icon={AlertOctagon}
          color="rose"
          trend="+1 Critical"
        />
        <KpiCard
          title="Rescued Persons"
          value={(kpis.total_rescued_persons ?? 0).toLocaleString()}
          subtext="Evacuated from flood zones"
          icon={LifeBuoy}
          color="emerald"
          trend="+45 Today"
        />
        <KpiCard
          title="Missing Persons"
          value={kpis.total_missing_persons ?? 0}
          subtext="Search operations running"
          icon={UserX}
          color="amber"
          trend="-2 Traced"
        />
        <KpiCard
          title="Affected Population"
          value={(kpis.total_affected_population ?? 0).toLocaleString()}
          subtext="Across 5 flood districts"
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Active Shelters"
          value={kpis.active_shelters ?? 0}
          subtext={`Cap: ${(kpis.shelter_total_capacity ?? 0).toLocaleString()} people`}
          icon={Home}
          color="purple"
        />
        <KpiCard
          title="Shelter Occupancy"
          value={(kpis.shelter_total_occupancy ?? 0).toLocaleString()}
          subtext={`${kpis.shelter_total_capacity ? Math.round((kpis.shelter_total_occupancy / kpis.shelter_total_capacity)*100) : 0}% Occupancy Rate`}
          icon={Home}
          color="cyan"
        />
        <KpiCard
          title="Active Rescue Teams"
          value={kpis.active_rescue_teams ?? 0}
          subtext={`Total Teams: ${kpis.total_rescue_teams ?? 0}`}
          icon={Users}
          color="emerald"
        />
        <KpiCard
          title="Critical Medical"
          value={kpis.critical_medical_cases ?? 0}
          subtext="Immediate triage needed"
          icon={Stethoscope}
          color="rose"
        />
        <KpiCard
          title="Low Stock Resources"
          value={kpis.low_stock_resources_count ?? 0}
          subtext="Items below min threshold"
          icon={Package}
          color="amber"
        />
        <KpiCard
          title="Operational Readiness"
          value="98.5%"
          subtext="All response units active"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* 6 Recharts Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RescueStatusChart data={charts.rescue_status} />
        <AffectedPopulationChart data={charts.affected_population} />
        <RescueTrendChart data={charts.rescue_trend} />
        <ShelterOccupancyChart data={charts.shelter_occupancy} />
        <ResourceRequirementChart data={charts.resource_requirement} />
        <IncidentSeverityChart data={charts.incident_severity} />
      </div>

      {/* District Location Inundation Radar */}
      <LocationStatsMap locations={locations} />
    </div>
  );
}
