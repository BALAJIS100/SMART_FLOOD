import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertOctagon, Eye, Edit2, Trash2, Plus, MapPin, Droplets, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Flash Flood', description: '', start_date: '', status: 'Active', severity: 'High',
    state: 'Tamil Nadu', district: '', taluk: '', village: '', water_level: 1.5, population_affected: 5000,
    infrastructure_damage: '', livestock_affected: 0
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data);
    } catch (err) {
      showError('Failed to fetch flood incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '', type: 'Flash Flood', description: '', start_date: new Date().toISOString().split('T')[0],
      status: 'Active', severity: 'High', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Velachery', village: 'Velachery East',
      water_level: 1.5, population_affected: 10000, infrastructure_damage: '', livestock_affected: 50
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      type: item.type || 'Flash Flood',
      description: item.description || '',
      start_date: item.start_date || '',
      status: item.status || 'Active',
      severity: item.severity || 'High',
      state: item.state || 'Tamil Nadu',
      district: item.district || '',
      taluk: item.taluk || '',
      village: item.village || '',
      water_level: item.water_level || 0.0,
      population_affected: item.population_affected || 0,
      infrastructure_damage: item.infrastructure_damage || '',
      livestock_affected: item.livestock_affected || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/incidents/${editingItem.id}`, formData);
        showSuccess('Incident updated successfully');
      } else {
        await api.post('/incidents', formData);
        showSuccess('New incident logged successfully');
      }
      setIsModalOpen(false);
      fetchIncidents();
    } catch (err) {
      showError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/incidents/${deletingId}`);
      showSuccess('Incident deleted successfully');
      setDeletingId(null);
      fetchIncidents();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete incident');
    }
  };

  const columns = [
    {
      header: 'Incident Name & Location',
      key: 'name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span>{item.district}, {item.village || item.taluk}</span>
          </div>
        </div>
      )
    },
    { header: 'Type', key: 'type' },
    {
      header: 'Severity',
      key: 'severity',
      render: (item) => {
        const colors = {
          Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          Moderate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${colors[item.severity] || colors.High}`}>
            {item.severity}
          </span>
        );
      }
    },
    {
      header: 'Water Level',
      key: 'water_level',
      render: (item) => (
        <span className="font-mono text-cyan-400 font-bold">{item.water_level} m</span>
      )
    },
    {
      header: 'Affected Pop.',
      key: 'population_affected',
      render: (item) => item.population_affected?.toLocaleString() || 0
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {item.status}
        </span>
      )
    }
  ];

  const filterOptions = [
    { label: 'Active Status', value: 'Active' },
    { label: 'Critical Severity', value: 'Critical' },
    { label: 'High Severity', value: 'High' },
    { label: 'Resolved Status', value: 'Resolved' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">FLOOD INCIDENT MANAGEMENT</h2>
          <p className="text-xs text-slate-400">Track disaster events, water levels, severity, and impacted regions</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={incidents}
        searchPlaceholder="Search incident name or district..."
        filterOptions={filterOptions}
        filterKey="status"
        onAddNew={hasRole(['Admin', 'Disaster Management Officer']) ? handleOpenCreate : null}
        addNewLabel="Log New Incident"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => navigate(`/incidents/${item.id}`)}
              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-300"
              title="View Incident Detail"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Incident"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Incident"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Flood Incident' : 'Log New Flood Incident'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Flash Flood">Flash Flood</option>
                <option value="Cyclone / Flash Flood">Cyclone / Flash Flood</option>
                <option value="Riverine Flood">Riverine Flood</option>
                <option value="Coastal Inundation">Coastal Inundation</option>
                <option value="Dam Release Overflow">Dam Release Overflow</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taluk</label>
              <input
                type="text"
                value={formData.taluk}
                onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Village / Location</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Water Level (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.water_level}
                onChange={(e) => setFormData({ ...formData, water_level: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Population</label>
              <input
                type="number"
                value={formData.population_affected}
                onChange={(e) => setFormData({ ...formData, population_affected: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Active">Active</option>
                <option value="Under Control">Under Control</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Infrastructure Damage Notes</label>
            <textarea
              rows={3}
              value={formData.infrastructure_damage}
              onChange={(e) => setFormData({ ...formData, infrastructure_damage: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="Describe road, bridge, power plant damages..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30"
            >
              {editingItem ? 'Save Changes' : 'Log Incident'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
