import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LifeBuoy, Edit2, Trash2, Home, UserCheck, Stethoscope } from 'lucide-react';

export default function RescuedPersonsPage() {
  const [rescued, setRescued] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    incident_id: 1, person_name: '', age: 30, gender: 'Male', phone: '', address: '',
    location: 'Velachery', rescue_date: new Date().toISOString().split('T')[0], rescue_time: '10:00 AM',
    rescue_team_id: 1, current_status: 'Rescued', medical_condition: 'Stable', shelter_id: 1,
    identification_status: 'Identified', remarks: ''
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, incRes, teamRes, sheltRes] = await Promise.all([
        api.get('/rescued'),
        api.get('/incidents'),
        api.get('/rescue-teams'),
        api.get('/shelters')
      ]);
      setRescued(resRes.data);
      setIncidents(incRes.data);
      setTeams(teamRes.data);
      setShelters(sheltRes.data);
    } catch (err) {
      showError('Failed to fetch rescued persons registry');
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
      incident_id: incidents[0]?.id || 1, person_name: '', age: 28, gender: 'Female', phone: '+91 ', address: '',
      location: 'Velachery West', rescue_date: new Date().toISOString().split('T')[0], rescue_time: '11:30 AM',
      rescue_team_id: teams[0]?.id || 1, current_status: 'Rescued', medical_condition: 'Stable',
      shelter_id: shelters[0]?.id || 1, identification_status: 'Identified', remarks: 'Evacuated by boat'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      incident_id: item.incident_id || 1,
      person_name: item.person_name || '',
      age: item.age || 0,
      gender: item.gender || 'Male',
      phone: item.phone || '',
      address: item.address || '',
      location: item.location || '',
      rescue_date: item.rescue_date || '',
      rescue_time: item.rescue_time || '',
      rescue_team_id: item.rescue_team_id || 1,
      current_status: item.current_status || 'Rescued',
      medical_condition: item.medical_condition || 'Stable',
      shelter_id: item.shelter_id || 1,
      identification_status: item.identification_status || 'Identified',
      remarks: item.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/rescued/${editingItem.id}`, formData);
        showSuccess('Rescued person record updated');
      } else {
        await api.post('/rescued', formData);
        showSuccess('New rescued person registered successfully');
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
      await api.delete(`/rescued/${deletingId}`);
      showSuccess('Rescued person record deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete record');
    }
  };

  const columns = [
    {
      header: 'Person Name & Demographics',
      key: 'person_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.person_name}</div>
          <div className="text-[11px] text-slate-400">
            {item.age ? `${item.age} yrs` : 'Age N/A'}, {item.gender} • <span className="text-blue-400">{item.identification_status}</span>
          </div>
        </div>
      )
    },
    { header: 'Rescue Location', key: 'location' },
    {
      header: 'Rescue Team',
      key: 'rescue_team_name',
      render: (item) => item.rescue_team_name || 'N/A'
    },
    {
      header: 'Shelter Allocated',
      key: 'shelter_name',
      render: (item) => (
        <span className="text-emerald-400 font-semibold">{item.shelter_name || 'Unallocated'}</span>
      )
    },
    {
      header: 'Medical Status',
      key: 'medical_condition',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.medical_condition?.includes('Critical') ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {item.medical_condition || 'Stable'}
        </span>
      )
    },
    { header: 'Date', key: 'rescue_date' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">RESCUED PERSONS REGISTRY</h2>
          <p className="text-xs text-slate-400">Centralized log of evacuated citizens, shelter allocations, and medical conditions</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rescued}
        searchPlaceholder="Search person name or location..."
        onAddNew={hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader', 'Medical Team Representative']) ? handleOpenCreate : null}
        addNewLabel="Register Rescued Person"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader', 'Medical Team Representative']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Record"
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
        title={editingItem ? 'Edit Rescued Person Record' : 'Register Rescued Individual'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Person Name *</label>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Identification</label>
              <select
                value={formData.identification_status}
                onChange={(e) => setFormData({ ...formData, identification_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Identified">Identified</option>
                <option value="Unidentified">Unidentified</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rescue Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Rescue Team</label>
              <select
                value={formData.rescue_team_id}
                onChange={(e) => setFormData({ ...formData, rescue_team_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Allocated Relief Shelter</label>
              <select
                value={formData.shelter_id}
                onChange={(e) => setFormData({ ...formData, shelter_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>{s.shelter_name} ({s.district})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Medical Condition</label>
              <input
                type="text"
                value={formData.medical_condition}
                onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                placeholder="Stable, Hypothermia, Fracture..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Status</label>
              <select
                value={formData.current_status}
                onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Rescued">Rescued</option>
                <option value="In Shelter">In Shelter</option>
                <option value="Evacuated">Evacuated</option>
                <option value="In Hospital">In Hospital</option>
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
              {editingItem ? 'Save Changes' : 'Register Rescued Person'}
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
