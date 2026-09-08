import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Home, Edit2, Trash2, Phone, Stethoscope, Utensils, Droplet, Zap } from 'lucide-react';

export default function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    shelter_name: '', location: '', district: 'Chennai', address: '', capacity: 400,
    current_occupancy: 150, male_count: 50, female_count: 70, children_count: 30, elderly_count: 10,
    disabled_count: 2, medical_facility: true, food_available: true, water_available: true,
    electricity_available: true, contact_person: '', contact_number: '', status: 'Available'
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shelters');
      setShelters(res.data);
    } catch (err) {
      showError('Failed to fetch relief shelters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      shelter_name: '', location: 'Velachery Bypass', district: 'Chennai', address: '100ft Road, Velachery',
      capacity: 500, current_occupancy: 0, male_count: 0, female_count: 0, children_count: 0, elderly_count: 0,
      disabled_count: 0, medical_facility: true, food_available: true, water_available: true,
      electricity_available: true, contact_person: '', contact_number: '+91 ', status: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      shelter_name: item.shelter_name || '',
      location: item.location || '',
      district: item.district || 'Chennai',
      address: item.address || '',
      capacity: item.capacity || 100,
      current_occupancy: item.current_occupancy || 0,
      male_count: item.male_count || 0,
      female_count: item.female_count || 0,
      children_count: item.children_count || 0,
      elderly_count: item.elderly_count || 0,
      disabled_count: item.disabled_count || 0,
      medical_facility: item.medical_facility ?? true,
      food_available: item.food_available ?? true,
      water_available: item.water_available ?? true,
      electricity_available: item.electricity_available ?? true,
      contact_person: item.contact_person || '',
      contact_number: item.contact_number || '',
      status: item.status || 'Available'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/shelters/${editingItem.id}`, formData);
        showSuccess('Shelter details updated');
      } else {
        await api.post('/shelters', formData);
        showSuccess('New relief shelter opened');
      }
      setIsModalOpen(false);
      fetchShelters();
    } catch (err) {
      showError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/shelters/${deletingId}`);
      showSuccess('Shelter record deleted');
      setDeletingId(null);
      fetchShelters();
    } catch (err) {
      showError('Failed to delete shelter');
    }
  };

  const columns = [
    {
      header: 'Shelter Name & Location',
      key: 'shelter_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.shelter_name}</div>
          <div className="text-[11px] text-slate-400">{item.location}, {item.district}</div>
        </div>
      )
    },
    {
      header: 'Capacity & Occupancy',
      key: 'occupancy_percentage',
      render: (item) => {
        const pct = item.occupancy_percentage || 0;
        const color = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
        return (
          <div className="w-36">
            <div className="flex justify-between text-[10px] font-semibold mb-1">
              <span className="text-white">{item.current_occupancy} / {item.capacity}</span>
              <span className={pct >= 90 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{pct}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Facilities Available',
      key: 'medical_facility',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Stethoscope className={`w-3.5 h-3.5 ${item.medical_facility ? 'text-rose-400' : 'text-slate-600'}`} title="Medical Facility" />
          <Utensils className={`w-3.5 h-3.5 ${item.food_available ? 'text-amber-400' : 'text-slate-600'}`} title="Food Available" />
          <Droplet className={`w-3.5 h-3.5 ${item.water_available ? 'text-cyan-400' : 'text-slate-600'}`} title="Drinking Water" />
          <Zap className={`w-3.5 h-3.5 ${item.electricity_available ? 'text-yellow-400' : 'text-slate-600'}`} title="Electricity" />
        </div>
      )
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-200 text-xs">{item.contact_person || 'N/A'}</div>
          <div className="text-[11px] text-blue-400">{item.contact_number}</div>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Full' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">RELIEF SHELTERS & CAMPS</h2>
          <p className="text-xs text-slate-400">Monitor shelter occupancy, available capacity, facilities, and contact coordinators</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={shelters}
        searchPlaceholder="Search shelter name or district..."
        onAddNew={hasRole(['Admin', 'Disaster Management Officer']) ? handleOpenCreate : null}
        addNewLabel="Open Relief Shelter"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Shelter"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Close/Delete Shelter"
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
        title={editingItem ? 'Edit Relief Shelter Details' : 'Open New Relief Shelter'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Shelter Name *</label>
              <input
                type="text"
                value={formData.shelter_name}
                onChange={(e) => setFormData({ ...formData, shelter_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Land Mark</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Occupancy</label>
              <input
                type="number"
                value={formData.current_occupancy}
                onChange={(e) => setFormData({ ...formData, current_occupancy: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coordinator Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Available Facilities Checklist</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.medical_facility}
                  onChange={(e) => setFormData({ ...formData, medical_facility: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Medical Desk</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.food_available}
                  onChange={(e) => setFormData({ ...formData, food_available: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Cooked Meals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.water_available}
                  onChange={(e) => setFormData({ ...formData, water_available: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Drinking Water</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.electricity_available}
                  onChange={(e) => setFormData({ ...formData, electricity_available: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Electricity</span>
              </label>
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
              {editingItem ? 'Save Changes' : 'Open Shelter'}
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
