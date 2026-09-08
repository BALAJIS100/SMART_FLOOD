import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Stethoscope, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MedicalRequirementsPage() {
  const [medical, setMedical] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    incident_id: 1, location: 'Velachery Camp', patient_name: '', age: 40, gender: 'Male',
    medical_condition: 'Asthma Attack', severity: 'Critical', medicine_required: 'Nebulizer & Salbutamol',
    quantity: 1, doctor_team: 'Dr. Priya Unit', hospital: 'KMC GH', status: 'Pending', remarks: ''
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, incRes] = await Promise.all([
        api.get('/medical'),
        api.get('/incidents')
      ]);
      setMedical(medRes.data);
      setIncidents(incRes.data);
    } catch (err) {
      showError('Failed to fetch medical requirements records');
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
      incident_id: incidents[0]?.id || 1, location: 'Velachery Relief Camp', patient_name: '', age: 50, gender: 'Female',
      medical_condition: 'Severe Fever', severity: 'High', medicine_required: 'Paracetamol & IV Fluids',
      quantity: 5, doctor_team: 'Mobile Medical Corps 1', hospital: 'Tambaram GH', status: 'Pending', remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      incident_id: item.incident_id || 1,
      location: item.location || '',
      patient_name: item.patient_name || '',
      age: item.age || 0,
      gender: item.gender || 'Male',
      medical_condition: item.medical_condition || '',
      severity: item.severity || 'Moderate',
      medicine_required: item.medicine_required || '',
      quantity: item.quantity || 1,
      doctor_team: item.doctor_team || '',
      hospital: item.hospital || '',
      status: item.status || 'Pending',
      remarks: item.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/medical/${editingItem.id}`, formData);
        showSuccess('Medical requirement updated');
      } else {
        await api.post('/medical', formData);
        showSuccess('New medical request logged');
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
      await api.delete(`/medical/${deletingId}`);
      showSuccess('Medical record deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete medical record');
    }
  };

  const columns = [
    {
      header: 'Medicine Required & Patient',
      key: 'medicine_required',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.medicine_required} (Qty: {item.quantity})</div>
          <div className="text-[11px] text-slate-400">
            Patient: {item.patient_name || 'Group/Community'} • {item.location}
          </div>
        </div>
      )
    },
    {
      header: 'Diagnosis / Condition',
      key: 'medical_condition',
      render: (item) => <span className="text-slate-300 font-semibold">{item.medical_condition}</span>
    },
    {
      header: 'Assigned Doctor / Hospital',
      key: 'doctor_team',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-200 text-xs">{item.doctor_team || 'Unassigned'}</div>
          <div className="text-[11px] text-slate-400">{item.hospital || 'GH'}</div>
        </div>
      )
    },
    {
      header: 'Triage Severity',
      key: 'severity',
      render: (item) => {
        const colors = {
          Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          Moderate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[item.severity] || colors.Moderate}`}>
            {item.severity}
          </span>
        );
      }
    },
    {
      header: 'Fulfillment Status',
      key: 'status',
      render: (item) => {
        const colors = {
          Pending: 'bg-rose-500/20 text-rose-300',
          'In Progress': 'bg-amber-500/20 text-amber-300',
          Resolved: 'bg-emerald-500/20 text-emerald-300'
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors[item.status] || colors.Pending}`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  const filterOptions = [
    { label: 'Critical Severity', value: 'Critical' },
    { label: 'Pending Requests', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved Requests', value: 'Resolved' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">MEDICAL REQUIREMENTS & TRIAGE</h2>
          <p className="text-xs text-slate-400">Emergency drug requests, medical triage severity, doctor team dispatch, and hospital referrals</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={medical}
        searchPlaceholder="Search medicine name, patient, or location..."
        filterOptions={filterOptions}
        filterKey="status"
        onAddNew={hasRole(['Admin', 'Disaster Management Officer', 'Medical Team Representative', 'Rescue Team Leader']) ? handleOpenCreate : null}
        addNewLabel="Log Medical Requirement"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Medical Team Representative']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Request"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer', 'Medical Team Representative']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Request"
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
        title={editingItem ? 'Edit Medical Request' : 'Log Medical Requirement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Medicine / Equipment Required *</label>
              <input
                type="text"
                value={formData.medicine_required}
                onChange={(e) => setFormData({ ...formData, medicine_required: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Camp *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name (Optional)</label>
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Medical Condition *</label>
              <input
                type="text"
                value={formData.medical_condition}
                onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Doctor Team</label>
              <input
                type="text"
                value={formData.doctor_team}
                onChange={(e) => setFormData({ ...formData, doctor_team: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Referred Hospital</label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
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
              {editingItem ? 'Save Changes' : 'Log Requirement'}
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
