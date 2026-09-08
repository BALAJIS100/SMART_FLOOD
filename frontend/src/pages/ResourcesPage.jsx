import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    resource_name: '', category: 'Food Rations', unit: 'Packets', total_quantity: 1000,
    allocated_quantity: 500, used_quantity: 100, minimum_required: 300, location: 'Central Godown',
    supplier: 'State Relief Board'
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources');
      setResources(res.data);
    } catch (err) {
      showError('Failed to fetch emergency inventory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      resource_name: '', category: 'Water & Sanitation', unit: 'Cans', total_quantity: 2000,
      allocated_quantity: 1200, used_quantity: 200, minimum_required: 500, location: 'Tambaram Depot',
      supplier: 'Tamil Nadu Water Board'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      resource_name: item.resource_name || '',
      category: item.category || 'Food Rations',
      unit: item.unit || 'Units',
      total_quantity: item.total_quantity || 0,
      allocated_quantity: item.allocated_quantity || 0,
      used_quantity: item.used_quantity || 0,
      minimum_required: item.minimum_required || 0,
      location: item.location || '',
      supplier: item.supplier || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/resources/${editingItem.id}`, formData);
        showSuccess('Resource inventory updated');
      } else {
        await api.post('/resources', formData);
        showSuccess('New resource item registered');
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      showError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/resources/${deletingId}`);
      showSuccess('Resource record deleted');
      setDeletingId(null);
      fetchResources();
    } catch (err) {
      showError('Failed to delete resource item');
    }
  };

  const columns = [
    {
      header: 'Resource Name & Category',
      key: 'resource_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.resource_name}</div>
          <div className="text-[11px] text-slate-400">{item.category} • Supplier: {item.supplier || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Total Quantity',
      key: 'total_quantity',
      render: (item) => (
        <span className="font-mono text-white font-bold">{item.total_quantity?.toLocaleString()} {item.unit}</span>
      )
    },
    {
      header: 'Allocated / Used',
      key: 'allocated_quantity',
      render: (item) => (
        <span className="text-[11px] text-slate-300">
          Alloc: <span className="text-blue-400 font-semibold">{item.allocated_quantity}</span> | Used: <span className="text-slate-400">{item.used_quantity}</span>
        </span>
      )
    },
    {
      header: 'Available Stock',
      key: 'available_quantity',
      render: (item) => (
        <span className={`font-mono font-extrabold ${item.is_low_stock ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
          {item.available_quantity?.toLocaleString()} {item.unit}
        </span>
      )
    },
    {
      header: 'Min Threshold',
      key: 'minimum_required',
      render: (item) => (
        <span className="font-mono text-slate-400 text-xs">{item.minimum_required} {item.unit}</span>
      )
    },
    {
      header: 'Stock Status',
      key: 'is_low_stock',
      render: (item) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ${
          item.is_low_stock
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        }`}>
          {item.is_low_stock ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          <span>{item.is_low_stock ? 'LOW STOCK' : 'Adequate'}</span>
        </span>
      )
    }
  ];

  const filterOptions = [
    { label: 'Food Rations', value: 'Food Rations' },
    { label: 'Water & Sanitation', value: 'Water & Sanitation' },
    { label: 'Rescue Equipment', value: 'Rescue Equipment' },
    { label: 'Medical Supplies', value: 'Medical Supplies' },
    { label: 'Infrastructure Machinery', value: 'Infrastructure Machinery' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">RESOURCE & INVENTORY MANAGEMENT</h2>
          <p className="text-xs text-slate-400">Monitor emergency supplies, automatic low-stock alerts, and warehouse allocations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={resources}
        searchPlaceholder="Search resource name or supplier..."
        filterOptions={filterOptions}
        filterKey="category"
        onAddNew={hasRole(['Admin', 'Disaster Management Officer']) ? handleOpenCreate : null}
        addNewLabel="Add Resource Stock"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {hasRole(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']) && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Stock"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasRole(['Admin', 'Disaster Management Officer']) && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Stock"
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
        title={editingItem ? 'Edit Emergency Stock' : 'Add New Emergency Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Item Name *</label>
              <input
                type="text"
                value={formData.resource_name}
                onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Food Rations">Food Rations</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Rescue Equipment">Rescue Equipment</option>
                <option value="Safety Gear">Safety Gear</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Infrastructure Machinery">Infrastructure Machinery</option>
                <option value="Comfort & Clothing">Comfort & Clothing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                placeholder="Cans, Packets, Boats, Kg..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Quantity</label>
              <input
                type="number"
                value={formData.total_quantity}
                onChange={(e) => setFormData({ ...formData, total_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Allocated Quantity</label>
              <input
                type="number"
                value={formData.allocated_quantity}
                onChange={(e) => setFormData({ ...formData, allocated_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Required</label>
              <input
                type="number"
                value={formData.minimum_required}
                onChange={(e) => setFormData({ ...formData, minimum_required: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Depot Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Organization</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
              {editingItem ? 'Save Changes' : 'Register Stock'}
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
