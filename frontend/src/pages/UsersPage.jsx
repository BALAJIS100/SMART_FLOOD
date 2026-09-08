import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserCheck, Edit2, Trash2, Shield, Lock } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '', full_name: '', phone: '', role_id: 1, is_active: true, password: ''
  });

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(uRes.data);
      setRoles(rRes.data);
    } catch (err) {
      showError('Failed to fetch user accounts');
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
      email: '', full_name: '', phone: '+91 ', role_id: roles[0]?.id || 1, is_active: true, password: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      email: item.email || '',
      full_name: item.full_name || '',
      phone: item.phone || '',
      role_id: item.role_id || (item.role?.id) || 1,
      is_active: item.is_active ?? true,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/users/${editingItem.id}`, formData);
        showSuccess('User account updated');
      } else {
        await api.post('/users', formData);
        showSuccess('New user account created');
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
      await api.delete(`/users/${deletingId}`);
      showSuccess('User account deleted');
      setDeletingId(null);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const columns = [
    {
      header: 'Full Name & Email',
      key: 'full_name',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.full_name}</div>
          <div className="text-[11px] text-slate-400">{item.email}</div>
        </div>
      )
    },
    {
      header: 'Assigned System Role',
      key: 'role',
      render: (item) => {
        const roleName = item.role?.name || 'Viewer';
        const colors = {
          Admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          'Disaster Management Officer': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          'Rescue Team Leader': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          'Medical Team Representative': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          Viewer: 'bg-slate-800 text-slate-300 border-slate-700'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${colors[roleName] || colors.Viewer}`}>
            {roleName}
          </span>
        );
      }
    },
    { header: 'Phone Contact', key: 'phone' },
    {
      header: 'Account Status',
      key: 'is_active',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
          {item.is_active ? 'Active' : 'Deactivated'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">USER & ROLE MANAGEMENT</h2>
          <p className="text-xs text-slate-400">Configure system user accounts, access permissions, and role assignments</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search name or email..."
        onAddNew={isAdmin ? handleOpenCreate : null}
        addNewLabel="Create User Account"
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            {isAdmin && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Edit Account"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300"
                title="Delete Account"
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
        title={editingItem ? 'Edit User Account' : 'Create User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Role *</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
              <select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {editingItem ? 'New Password (Leave blank to keep unchanged)' : 'Password *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required={!editingItem}
              placeholder="••••••••"
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
              {editingItem ? 'Save Changes' : 'Create User'}
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
