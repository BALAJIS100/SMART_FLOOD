import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FileText, Download, FileSpreadsheet, Filter, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [district, setDistrict] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/reports/generate', {
        report_type: reportType,
        district: district || undefined,
        status: statusFilter || undefined
      });
      setReportData(res.data);
    } catch (err) {
      showError('Failed to generate dynamic report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.post(
        '/reports/export/pdf',
        { report_type: reportType, district: district || undefined, status: statusFilter || undefined },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Flood_Rescue_Report_${reportType}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('PDF Report downloaded successfully');
    } catch (err) {
      showError('Failed to download PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      const res = await api.post(
        '/reports/export/excel',
        { report_type: reportType, district: district || undefined, status: statusFilter || undefined },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Flood_Rescue_Report_${reportType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel Spreadsheet downloaded successfully');
    } catch (err) {
      showError('Failed to download Excel spreadsheet');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const reportTypes = [
    { id: 'summary', name: 'State Executive Summary' },
    { id: 'incident', name: 'Flood Incidents Log' },
    { id: 'district', name: 'District Breakdown' },
    { id: 'shelter', name: 'Shelter Capacity & Occupancy' },
    { id: 'resource', name: 'Resource Stock & Allocation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">DYNAMIC DISASTER REPORTING & EXPORTS</h2>
          <p className="text-xs text-slate-400">Generate official state disaster logs, PDF summaries, and Excel spreadsheets with one click</p>
        </div>

        {/* One-Click Export Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className={`w-4 h-4 ${downloadingExcel ? 'animate-bounce' : ''}`} />
            <span>{downloadingExcel ? 'Generating Excel...' : 'Download Excel Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Report Type Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {reportTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                reportType === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by district..."
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
          />
          <button
            onClick={fetchReport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Live Generated Report Document Card */}
      {reportData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Banner */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                OFFICIAL DISASTER REPORT LOG
              </span>
              <h1 className="text-2xl font-black text-white mt-1">{reportData.metrics?.report_title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generated: {reportData.metrics?.generated_at} | Officer: {reportData.metrics?.generated_by}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> State Validated
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Total Incidents</span>
              <span className="text-2xl font-black text-white">{reportData.metrics?.total_incidents}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Affected Population</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{reportData.metrics?.total_affected_population?.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Total Rescued</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{reportData.metrics?.total_rescued_persons?.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Shelter Occupancy Rate</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{reportData.metrics?.shelter_occupancy_percentage}%</span>
            </div>
          </div>

          {/* Action Directives & Recommendations */}
          {reportData.recommendations && reportData.recommendations.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Actionable Directives & Recommendations
              </h3>
              <ul className="space-y-1.5 text-xs text-rose-200">
                {reportData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Incident Summary Table */}
          {reportData.incident_summary && reportData.incident_summary.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Flood Incidents Executive Summary</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Incident Name</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Water Level</th>
                      <th className="p-3">Affected Pop.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                    {reportData.incident_summary.map((inc) => (
                      <tr key={inc.id}>
                        <td className="p-3 font-bold text-white">{inc.name}</td>
                        <td className="p-3">{inc.district}</td>
                        <td className="p-3">{inc.severity}</td>
                        <td className="p-3">{inc.status}</td>
                        <td className="p-3 text-cyan-400 font-mono">{inc.water_level}</td>
                        <td className="p-3 font-mono">{inc.population_affected?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shelter Occupancy Table */}
          {reportData.shelter_summary && reportData.shelter_summary.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Relief Shelters Status</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Shelter Name</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Capacity</th>
                      <th className="p-3">Occupancy</th>
                      <th className="p-3">Occupancy %</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                    {reportData.shelter_summary.map((s, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-white">{s.name}</td>
                        <td className="p-3">{s.district}</td>
                        <td className="p-3">{s.capacity}</td>
                        <td className="p-3">{s.occupancy}</td>
                        <td className="p-3 font-bold text-amber-400">{s.occupancy_pct}</td>
                        <td className="p-3">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
