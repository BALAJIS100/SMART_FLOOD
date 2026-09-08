import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Shield, LogOut, Clock, Activity, AlertTriangle, User as UserIcon, Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Header({ alerts = [], onToggleMobileMenu, isMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Disaster Management Officer': return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Rescue Team Leader': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medical Team Representative': return 'bg-rose-950 text-rose-300 border-rose-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between">
      {/* Brand Title & Hamburger Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Logo size="md" />

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-extrabold text-sm sm:text-lg text-white tracking-tight">SMART FLOOD RESCUE</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE OPS
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">State Disaster Management & Dynamic Reporting Dashboard</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeStr || '12:00:00 PM'}</span>
        </div>

        {/* Emergency Alert Drawer Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsPopover(!showAlertsPopover)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Emergency Alerts"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md shadow-rose-600/50">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts Popover */}
          {showAlertsPopover && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 divide-y divide-slate-800">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-white text-sm">Critical Emergency Alerts</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800">
                  {alerts.length} Active
                </span>
              </div>
              <div className="py-2 max-h-80 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No active critical alerts.</p>
                ) : (
                  alerts.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-rose-400">{a.title}</span>
                        <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all text-left"
          >
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white leading-tight">{user?.full_name || 'Officer'}</div>
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role || 'Viewer'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-sm">
              <div className="p-3 border-b border-slate-800">
                <p className="font-bold text-white text-xs">{user?.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowProfileDropdown(false); navigate('/dashboard/settings'); }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-xs"
              >
                <UserIcon className="w-4 h-4 text-blue-400" /> Account Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 text-xs font-semibold mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
