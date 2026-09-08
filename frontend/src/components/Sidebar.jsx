import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertOctagon,
  MapPin,
  LifeBuoy,
  UserX,
  Home,
  Users,
  Package,
  Stethoscope,
  HeartHandshake,
  FileSpreadsheet,
  UserCheck,
  ClipboardList,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { hasRole, isAdmin, isOfficer } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Core' },
    { label: 'Flood Incidents', path: '/dashboard/incidents', icon: AlertOctagon, category: 'Operations' },
    { label: 'Affected Locations', path: '/dashboard/locations', icon: MapPin, category: 'Operations' },
    { label: 'Rescued Persons', path: '/dashboard/rescued', icon: LifeBuoy, category: 'People Management' },
    { label: 'Missing Persons', path: '/dashboard/missing', icon: UserX, category: 'People Management' },
    { label: 'Relief Shelters', path: '/dashboard/shelters', icon: Home, category: 'Facilities & Teams' },
    { label: 'Rescue Teams', path: '/dashboard/rescue-teams', icon: Users, category: 'Facilities & Teams' },
    { label: 'Resource Inventory', path: '/dashboard/resources', icon: Package, category: 'Logistics & Medical' },
    { label: 'Medical Requirements', path: '/dashboard/medical', icon: Stethoscope, category: 'Logistics & Medical' },
    { label: 'Relief Activities', path: '/dashboard/relief', icon: HeartHandshake, category: 'Logistics & Medical' },
    { label: 'Dynamic Reports', path: '/dashboard/reports', icon: FileSpreadsheet, category: 'Reporting & Admin' },
  ];

  if (isAdmin || isOfficer) {
    navItems.push(
      { label: 'User Management', path: '/dashboard/users', icon: UserCheck, category: 'Reporting & Admin' },
      { label: 'Audit Logs', path: '/dashboard/audit-logs', icon: ClipboardList, category: 'Reporting & Admin' }
    );
  }

  navItems.push({ label: 'Settings', path: '/dashboard/settings', icon: Settings, category: 'Reporting & Admin' });

  const categories = ['Core', 'Operations', 'People Management', 'Facilities & Teams', 'Logistics & Medical', 'Reporting & Admin'];

  const sidebarContent = (
    <div className="space-y-6">
      {/* Mobile Drawer Title Header */}
      <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-800">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Navigation Menu</span>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {categories.map((cat) => {
        const items = navItems.filter((item) => item.category === cat);
        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
              {cat}
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Slide-over Mobile Drawer / Desktop Sticky Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-full bg-slate-900 border-r border-slate-800 p-4 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:z-auto lg:w-64 lg:h-[calc(100vh-65px)] lg:sticky lg:top-[65px] lg:p-3 lg:block`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
