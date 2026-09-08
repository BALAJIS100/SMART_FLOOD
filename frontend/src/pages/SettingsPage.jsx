import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, User, Database, Server, Key, Waves } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">SYSTEM SETTINGS & PERMISSIONS MATRIX</h2>
        <p className="text-xs text-slate-400">System parameters, active user profile, and role authorization reference</p>
      </div>

      {/* User Profile Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Active Session Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block font-semibold">User Name</span>
            <span className="font-bold text-white text-sm">{user?.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Email Address</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Assigned System Role</span>
            <span className="font-bold text-blue-400 text-sm">{user?.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Security Token Status</span>
            <span className="font-bold text-emerald-400 text-sm">Active JWT Session</span>
          </div>
        </div>
      </div>

      {/* System Parameter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" /> Backend API Architecture
        </h3>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Framework & ORM</span>
            <span className="font-mono text-cyan-400 font-bold">FastAPI 0.110 + SQLAlchemy 2.0 ORM</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Database Storage Mode</span>
            <span className="font-mono text-emerald-400 font-bold">PostgreSQL with Automatic SQLite Fallback</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Export Engines</span>
            <span className="font-mono text-purple-400 font-bold">ReportLab PDF Exporter + openpyxl Excel Exporter</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Security & Audit</span>
            <span className="font-mono text-amber-400 font-bold">OAuth2 Bearer JWT + Full Audit Logging</span>
          </div>
        </div>
      </div>

      {/* Role Permission Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" /> Role Access Control Matrix
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Role Title</th>
                <th className="p-3">Incidents & Locations</th>
                <th className="p-3">Rescue & Shelters</th>
                <th className="p-3">Medical & Relief</th>
                <th className="p-3">Users & Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              <tr>
                <td className="p-3 font-bold text-purple-300">Admin</td>
                <td className="p-3 text-emerald-400 font-bold">Full CRUD</td>
                <td className="p-3 text-emerald-400 font-bold">Full CRUD</td>
                <td className="p-3 text-emerald-400 font-bold">Full CRUD</td>
                <td className="p-3 text-emerald-400 font-bold">Full CRUD</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-300">Disaster Relief Officer</td>
                <td className="p-3 text-emerald-400 font-bold">Create/Edit/Delete</td>
                <td className="p-3 text-emerald-400 font-bold">Create/Edit/Delete</td>
                <td className="p-3 text-emerald-400 font-bold">Create/Edit/Delete</td>
                <td className="p-3 text-slate-500">Read Only</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-300">Rescue Team Leader</td>
                <td className="p-3 text-blue-400 font-bold">Create/Edit Locations</td>
                <td className="p-3 text-emerald-400 font-bold">Register Rescued</td>
                <td className="p-3 text-blue-400 font-bold">Log Activities</td>
                <td className="p-3 text-slate-500">No Access</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-rose-300">Medical Team Rep</td>
                <td className="p-3 text-slate-500">Read Only</td>
                <td className="p-3 text-slate-500">Read Only</td>
                <td className="p-3 text-emerald-400 font-bold">Log/Edit Triage</td>
                <td className="p-3 text-slate-500">No Access</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-300">Viewer</td>
                <td className="p-3 text-slate-400">Read Only</td>
                <td className="p-3 text-slate-400">Read Only</td>
                <td className="p-3 text-slate-400">Read Only</td>
                <td className="p-3 text-slate-500">No Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
