import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';
import { ClipboardList, Shield, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      showError('Failed to fetch system audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      key: 'timestamp',
      render: (item) => (
        <span className="font-mono text-slate-400 text-xs">{new Date(item.timestamp).toLocaleString()}</span>
      )
    },
    {
      header: 'User Name',
      key: 'user_name',
      render: (item) => (
        <span className="font-bold text-white text-xs">{item.user_name}</span>
      )
    },
    {
      header: 'Action Performed',
      key: 'action',
      render: (item) => {
        const actionColors = {
          CREATE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          UPDATE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          DELETE: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          LOGIN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          GENERATE_REPORT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          EXPORT_PDF: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          EXPORT_EXCEL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${actionColors[item.action] || 'bg-slate-800 text-slate-300'}`}>
            {item.action}
          </span>
        );
      }
    },
    { header: 'Target Module', key: 'module' },
    {
      header: 'Audit Operation Details',
      key: 'details',
      render: (item) => (
        <span className="text-slate-300 text-xs font-mono">{item.details}</span>
      )
    }
  ];

  const filterOptions = [
    { label: 'CREATE Actions', value: 'CREATE' },
    { label: 'UPDATE Actions', value: 'UPDATE' },
    { label: 'DELETE Actions', value: 'DELETE' },
    { label: 'LOGIN Actions', value: 'LOGIN' },
    { label: 'REPORT Actions', value: 'GENERATE_REPORT' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">SYSTEM AUDIT LOGS</h2>
          <p className="text-xs text-slate-400">Immutable security logging, user activity tracking, and system operational trail</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search log details or user..."
        filterOptions={filterOptions}
        filterKey="action"
        pageSize={15}
      />
    </div>
  );
}
