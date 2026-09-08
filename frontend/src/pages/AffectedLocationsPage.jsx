import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Edit2, Trash2, Zap, Droplet, Wifi } from 'lucide-react';

export default function AffectedLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    incident_id: 1, state: 'Tamil Nadu', district: 'Chennai', taluk: 'Velachery', village: 'Velachery West',
    population: 25000, houses_affected: 3000, roads_damaged: 5, bridges_damaged: 0, schools_affected: 2,
    hospitals_affected: 1, electricity_status: 'Disrupted', water_supply_status: 'Disrupted',
    communication_status: 'Partial', severity: 'High', remarks: ''
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, incRes] = await Promise.all([
        api.get('/locations'),
        api.get('/incidents')
      ]);
      setLocations(locRes.data);
      setIncidents(incRes.data);
      if (incRes.data.length > 0 && !formData.incident_id) {
        setFormData((prev) => ({ ...prev, incident_id: incRes.data[0].id }));
      }
    } catch (err) {
      showError('Failed to fetch affected locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      incident_id: incidents[0]?.id || 1, state: 'Tamil Nadu', district: 'Chennai', taluk: 'Velachery', village: 'Velachery East',
      population: 15000, houses_affected: 1800, roads_damaged: 4, bridges_damaged: 0, schools_affected: 1,
      hospitals_affected: 0, electricity_status: 'Disrupted', water_supply_status: 'Disrupted',
      communication_status: 'Partial', severity: 'High', remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      incident_id: item.incident_id || 1,
      state: item.state || 'Tamil Nadu',
      district: item.district || '',
      taluk: item.taluk || '',
      village: item.village || '',
      population: item.population || 0,
      houses_affected: item.houses_affected || 0,
      roads_damaged: item.roads_damaged || 0,
      bridges_damaged: item.bridges_damaged || 0,
      schools_affected: item.schools_affected || 0,
      hospitals_affected: item.hospitals_affected || 0,
      electricity_status: item.electricity_status || 'Disrupted',
      water_supply_status: item.water_supply_status || 'Disrupted',
      communication_status: item.communication_status || 'Partial',
      severity: item.severity || 'High',
      remarks: item.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/locations/${editingItem.id}`, formData);
        showSuccess('Location updated successfully');
      } else {
        await api.post('/locations', formData);
        showSuccess('New affected location added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/locations/${deletingId}`);
      showSuccess('Location record deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete location');
    }
  };

  const columns = [
    {
      header: 'Village & District',
      key: 'village',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.village}</div>
          <div className="text-[11px] text-slate-400">{item.district} ({item.taluk || 'Taluk'})</div>
        </div>
      )
    },
    { header: 'Linked Flood Incident', key: 'incident_name' },
    {
      header: 'Population Impact',
      key: 'population',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.population?.toLocaleString() || 0}</div>
          <div className="text-[11px] text-slate-400">{item.houses_affected} Houses</div>
        </div>
      )
    },
    {
      header: 'Infra Damage',
      key: 'roads_damaged',
      render: (item) => (
        <div className="text-[11px] text-slate-300">
          <div>Roads: <span className="text-amber-400 font-bold">{item.roads_damaged}</span> | Bridges: <span className="text-rose-400 font-bold">{item.bridges_damaged}</span></div>
        </div>
      )
    },
    {
      header: 'Utility Status',
      key: 'electricity_status',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px]">
            <Zap className={`w-3 h-3 ${item.electricity_status === 'Disrupted' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className={item.electricity_status === 'Disrupted' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              Power: {item.electricity_status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <Droplet className={`w-3 h-3 ${item.water_supply_status === 'Disrupted' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className={item.water_supply_status === 'Disrupted' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              Water: {item.water_supply_status}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Severity',
      key: 'severity',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {item.severity}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">AFFECTED LOCATIONS & VILLAGES</h2>
          <p className="text-xs text-slate-400">Detailed location-wise population impact, infrastructure damage, and essential utilities status</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        searchPlaceholder="Search village or district..."
        onAddNew={hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) ? handleOpenCreate : null}
        addNewLabel="Add Affected Location"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Location"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Location"
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
        title={editingItem ? 'Edit Affected Location' : 'Register Affected Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Flood Incident *</label>
            <select
              value={formData.incident_id}
              onChange={(e) => setFormData({ ...formData, incident_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.name} ({inc.district})
                </option>
              ))}
            </select>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Village Name *</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Population</label>
              <input
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Houses Affected</label>
              <input
                type="number"
                value={formData.houses_affected}
                onChange={(e) => setFormData({ ...formData, houses_affected: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Roads Damaged</label>
              <input
                type="number"
                value={formData.roads_damaged}
                onChange={(e) => setFormData({ ...formData, roads_damaged: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bridges Damaged</label>
              <input
                type="number"
                value={formData.bridges_damaged}
                onChange={(e) => setFormData({ ...formData, bridges_damaged: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Electricity Status</label>
              <select
                value={formData.electricity_status}
                onChange={(e) => setFormData({ ...formData, electricity_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Disrupted">Disrupted</option>
                <option value="Partial">Partial</option>
                <option value="Functional">Functional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Water Supply Status</label>
              <select
                value={formData.water_supply_status}
                onChange={(e) => setFormData({ ...formData, water_supply_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Disrupted">Disrupted</option>
                <option value="Partial">Partial</option>
                <option value="Functional">Functional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Rating</label>
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
              {editingItem ? 'Save Changes' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
