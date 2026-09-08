import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserX, Edit2, Trash2, Phone, Search } from 'lucide-react';

export default function MissingPersonsPage() {
  const [missing, setMissing] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    person_name: '', age: 30, gender: 'Male', phone: '', address: '',
    last_seen_location: 'Velachery Market', last_seen_date: new Date().toISOString().split('T')[0],
    incident_id: 1, reporter_name: '', reporter_phone: '', status: 'Missing', search_notes: '', assigned_team_id: 1
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [missRes, incRes, teamRes] = await Promise.all([
        api.get('/missing'),
        api.get('/incidents'),
        api.get('/rescue-teams')
      ]);
      setMissing(missRes.data);
      setIncidents(incRes.data);
      setTeams(teamRes.data);
    } catch (err) {
      showError('Failed to fetch missing persons records');
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
      person_name: '', age: 25, gender: 'Male', phone: '+91 ', address: '',
      last_seen_location: 'Velachery 100ft Road', last_seen_date: new Date().toISOString().split('T')[0],
      incident_id: incidents[0]?.id || 1, reporter_name: '', reporter_phone: '+91 ', status: 'Missing',
      search_notes: 'Disappeared during sudden water rise.', assigned_team_id: teams[0]?.id || 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      person_name: item.person_name || '',
      age: item.age || 0,
      gender: item.gender || 'Male',
      phone: item.phone || '',
      address: item.address || '',
      last_seen_location: item.last_seen_location || '',
      last_seen_date: item.last_seen_date || '',
      incident_id: item.incident_id || 1,
      reporter_name: item.reporter_name || '',
      reporter_phone: item.reporter_phone || '',
      status: item.status || 'Missing',
      search_notes: item.search_notes || '',
      assigned_team_id: item.assigned_team_id || 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/missing/${editingItem.id}`, formData);
        showSuccess('Missing person record updated');
      } else {
        await api.post('/missing', formData);
        showSuccess('Missing report filed successfully');
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
      await api.delete(`/missing/${deletingId}`);
      showSuccess('Missing record deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete missing record');
    }
  };

  const columns = [
    {
      header: 'Missing Person Details',
      key: 'person_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.person_name}</div>
          <div className="text-[11px] text-slate-400">
            {item.age ? `${item.age} yrs` : 'Age N/A'}, {item.gender}
          </div>
        </div>
      )
    },
    {
      header: 'Last Seen Location & Date',
      key: 'last_seen_location',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-200 text-xs">{item.last_seen_location}</div>
          <div className="text-[11px] text-slate-400">{item.last_seen_date}</div>
        </div>
      )
    },
    {
      header: 'Reporter Info',
      key: 'reporter_name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-300 text-xs">{item.reporter_name}</div>
          <div className="text-[11px] text-blue-400">{item.reporter_phone}</div>
        </div>
      )
    },
    {
      header: 'Assigned Rescue Unit',
      key: 'assigned_team_name',
      render: (item) => item.assigned_team_name || 'Unassigned'
    },
    {
      header: 'Search Status',
      key: 'status',
      render: (item) => {
        const badgeColors = {
          'Missing': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          'Search In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          'Traced Safe': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${badgeColors[item.status] || badgeColors.Missing}`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  const filterOptions = [
    { label: 'Missing Only', value: 'Missing' },
    { label: 'Search In Progress', value: 'Search In Progress' },
    { label: 'Traced Safe', value: 'Traced Safe' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">MISSING PERSONS REGISTRY</h2>
          <p className="text-xs text-slate-400">File missing person reports, track search operations, and log family contacts</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={missing}
        searchPlaceholder="Search person or location..."
        filterOptions={filterOptions}
        filterKey="status"
        onAddNew={handleOpenCreate}
        addNewLabel="Report Missing Person"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Missing Status"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Record"
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
        title={editingItem ? 'Update Missing Person Status' : 'File Missing Person Report'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Missing Person Name *</label>
              <input
                type="text"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Flood Incident *</label>
              <select
                value={formData.incident_id}
                onChange={(e) => setFormData({ ...formData, incident_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>{inc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Search Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Missing">Missing</option>
                <option value="Search In Progress">Search In Progress</option>
                <option value="Traced Safe">Traced Safe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Seen Location *</label>
              <input
                type="text"
                value={formData.last_seen_location}
                onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Seen Date *</label>
              <input
                type="date"
                value={formData.last_seen_date}
                onChange={(e) => setFormData({ ...formData, last_seen_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reporter Name *</label>
              <input
                type="text"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reporter Phone *</label>
              <input
                type="text"
                value={formData.reporter_phone}
                onChange={(e) => setFormData({ ...formData, reporter_phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Search & Rescue Team</label>
            <select
              value={formData.assigned_team_id}
              onChange={(e) => setFormData({ ...formData, assigned_team_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Search Notes & Observations</label>
            <textarea
              rows={3}
              value={formData.search_notes}
              onChange={(e) => setFormData({ ...formData, search_notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="Enter clothing description, last known direction..."
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
              {editingItem ? 'Update Report' : 'File Missing Report'}
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
