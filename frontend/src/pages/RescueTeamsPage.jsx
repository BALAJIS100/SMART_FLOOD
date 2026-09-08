import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Edit2, Trash2, Phone, Anchor, Truck } from 'lucide-react';

export default function RescueTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    team_name: '', team_leader: '', contact_number: '', team_type: 'NDRF', members_count: 15,
    assigned_incident_id: 1, current_location: 'Velachery Bridge', vehicle: 'Inflatable Boat & Rescue Truck',
    boat_available: true, medical_support: true, status: 'Available'
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, incRes] = await Promise.all([
        api.get('/rescue-teams'),
        api.get('/incidents')
      ]);
      setTeams(teamRes.data);
      setIncidents(incRes.data);
    } catch (err) {
      showError('Failed to fetch rescue teams deployment records');
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
      team_name: '', team_leader: '', contact_number: '+91 ', team_type: 'NDRF', members_count: 18,
      assigned_incident_id: incidents[0]?.id || 1, current_location: 'Velachery West', vehicle: 'Motorized Boat & Truck',
      boat_available: true, medical_support: true, status: 'Deployed'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      team_name: item.team_name || '',
      team_leader: item.team_leader || '',
      contact_number: item.contact_number || '',
      team_type: item.team_type || 'NDRF',
      members_count: item.members_count || 10,
      assigned_incident_id: item.assigned_incident_id || 1,
      current_location: item.current_location || '',
      vehicle: item.vehicle || '',
      boat_available: item.boat_available ?? false,
      medical_support: item.medical_support ?? false,
      status: item.status || 'Available'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/rescue-teams/${editingItem.id}`, formData);
        showSuccess('Rescue team details updated');
      } else {
        await api.post('/rescue-teams', formData);
        showSuccess('New rescue team registered');
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
      await api.delete(`/rescue-teams/${deletingId}`);
      showSuccess('Rescue team record deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete team record');
    }
  };

  const columns = [
    {
      header: 'Team Name & Unit Type',
      key: 'team_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.team_name}</div>
          <div className="text-[11px] font-semibold text-blue-400">{item.team_type} • {item.members_count} Personnel</div>
        </div>
      )
    },
    {
      header: 'Team Commander',
      key: 'team_leader',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-200 text-xs">{item.team_leader}</div>
          <div className="text-[11px] text-slate-400">{item.contact_number}</div>
        </div>
      )
    },
    { header: 'Assigned Incident', key: 'assigned_incident_name' },
    { header: 'Current Location', key: 'current_location' },
    {
      header: 'Special Equipment',
      key: 'boat_available',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.boat_available && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Anchor className="w-3 h-3" /> Motor Boat
            </span>
          )}
          {item.medical_support && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Medical
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Deployment Status',
      key: 'status',
      render: (item) => {
        const colors = {
          'Deployed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'On Mission': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          'Available': 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${colors[item.status] || colors.Available}`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">RESCUE TEAMS & DISPATCH</h2>
          <p className="text-xs text-slate-400">Manage NDRF, SDRF, Coast Guard, and local volunteer emergency rescue units</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={teams}
        searchPlaceholder="Search team name or commander..."
        onAddNew={hasRole(['Admin', 'Disaster Management Officer']) ? handleOpenCreate : null}
        addNewLabel="Register Rescue Team"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Team"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Team"
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
        title={editingItem ? 'Edit Rescue Team Details' : 'Register Rescue Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name *</label>
              <input
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Type *</label>
              <select
                value={formData.team_type}
                onChange={(e) => setFormData({ ...formData, team_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="NDRF">NDRF (National Disaster Response Force)</option>
                <option value="SDRF">SDRF (State Disaster Response Force)</option>
                <option value="Coast Guard">Indian Coast Guard</option>
                <option value="Fire & Rescue">Fire & Rescue Services</option>
                <option value="Local Fishermen Brigade">Local Fishermen Brigade</option>
                <option value="NGO Volunteer">NGO Volunteer Corps</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Team Commander *</label>
              <input
                type="text"
                value={formData.team_leader}
                onChange={(e) => setFormData({ ...formData, team_leader: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone *</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Members Count</label>
              <input
                type="number"
                value={formData.members_count}
                onChange={(e) => setFormData({ ...formData, members_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Flood Incident</label>
              <select
                value={formData.assigned_incident_id}
                onChange={(e) => setFormData({ ...formData, assigned_incident_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>{inc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Sector / Location</label>
              <input
                type="text"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle / Equipment Description</label>
            <input
              type="text"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="Inflatable Motor Boat, Helicopter, Amphibious Truck..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.boat_available}
                onChange={(e) => setFormData({ ...formData, boat_available: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Rescue Boats Equipped</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.medical_support}
                onChange={(e) => setFormData({ ...formData, medical_support: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Medical Doctor Unit</span>
            </label>
            <div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
              >
                <option value="Available">Available</option>
                <option value="Deployed">Deployed</option>
                <option value="On Mission">On Mission</option>
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
              {editingItem ? 'Save Changes' : 'Register Team'}
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
