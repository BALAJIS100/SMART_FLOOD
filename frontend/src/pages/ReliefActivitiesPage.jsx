import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HeartHandshake, Edit2, Trash2, Users } from 'lucide-react';

export default function ReliefActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    incident_id: 1, activity_type: 'Food & Water Distribution', description: '', location: 'Velachery West',
    date: new Date().toISOString().split('T')[0], responsible_org: 'GCC Relief Wing', team_id: 1,
    people_served: 2500, resources_used: '3000 Food Packets, 500 Water Cans', status: 'Completed', remarks: ''
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actRes, incRes, teamRes] = await Promise.all([
        api.get('/relief'),
        api.get('/incidents'),
        api.get('/rescue-teams')
      ]);
      setActivities(actRes.data);
      setIncidents(incRes.data);
      setTeams(teamRes.data);
    } catch (err) {
      showError('Failed to fetch relief activities log');
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
      incident_id: incidents[0]?.id || 1, activity_type: 'Food & Water Distribution', description: 'Dry ration and water drop',
      location: 'Velachery West', date: new Date().toISOString().split('T')[0], responsible_org: 'GCC Task Force',
      team_id: teams[0]?.id || 1, people_served: 1500, resources_used: '2000 Packets', status: 'In Progress', remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      incident_id: item.incident_id || 1,
      activity_type: item.activity_type || '',
      description: item.description || '',
      location: item.location || '',
      date: item.date || '',
      responsible_org: item.responsible_org || '',
      team_id: item.team_id || 1,
      people_served: item.people_served || 0,
      resources_used: item.resources_used || '',
      status: item.status || 'In Progress',
      remarks: item.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/relief/${editingItem.id}`, formData);
        showSuccess('Relief activity updated');
      } else {
        await api.post('/relief', formData);
        showSuccess('New relief activity recorded');
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
      await api.delete(`/relief/${deletingId}`);
      showSuccess('Relief activity deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete activity');
    }
  };

  const columns = [
    {
      header: 'Activity Type & Location',
      key: 'activity_type',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.activity_type}</div>
          <div className="text-[11px] text-slate-400">{item.location} • Date: {item.date}</div>
        </div>
      )
    },
    { header: 'Responsible Organization', key: 'responsible_org' },
    {
      header: 'People Served',
      key: 'people_served',
      render: (item) => (
        <span className="font-bold text-emerald-400 font-mono text-xs">{item.people_served?.toLocaleString() || 0} Citizens</span>
      )
    },
    { header: 'Resources Used', key: 'resources_used' },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">RELIEF ACTIVITIES & DISPATCH LOG</h2>
          <p className="text-xs text-slate-400">Record food distribution, dewatering pumping, medical camps, and citizens served</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={activities}
        searchPlaceholder="Search activity or location..."
        onAddNew={hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) ? handleOpenCreate : null}
        addNewLabel="Record Relief Activity"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Activity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Activity"
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
        title={editingItem ? 'Edit Relief Activity' : 'Record Relief Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Type *</label>
              <select
                value={formData.activity_type}
                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Food & Water Distribution">Food & Water Distribution</option>
                <option value="Boat Evacuation Operation">Boat Evacuation Operation</option>
                <option value="Medical Health Camp">Medical Health Camp</option>
                <option value="Dewatering Pumping Operation">Dewatering Pumping Operation</option>
                <option value="Dry Ration Kit Distribution">Dry Ration Kit Distribution</option>
                <option value="Helicopter Search & Rescue">Helicopter Search & Rescue</option>
                <option value="Sanitation & Bleaching Spray">Sanitation & Bleaching Spray</option>
              </select>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operation Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">People Served</label>
              <input
                type="number"
                value={formData.people_served}
                onChange={(e) => setFormData({ ...formData, people_served: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Responsible Organization *</label>
              <input
                type="text"
                value={formData.responsible_org}
                onChange={(e) => setFormData({ ...formData, responsible_org: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resources Utilized</label>
            <input
              type="text"
              value={formData.resources_used}
              onChange={(e) => setFormData({ ...formData, resources_used: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="e.g. 5000 Food Packets, 6 Dewatering Pumps"
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
              {editingItem ? 'Save Changes' : 'Record Activity'}
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
