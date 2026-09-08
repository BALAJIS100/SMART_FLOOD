import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Waves,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertOctagon,
  LifeBuoy,
  Home as HomeIcon,
  FileSpreadsheet,
  Zap,
  MapPin,
  CheckCircle2,
  Lock,
  PhoneCall
} from 'lucide-react';
import Logo from '../components/Logo';


export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">SMART FLOOD RESCUE</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider block uppercase">Disaster Management Command Center</span>
            </div>
          </Link>


          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <span>Go to Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
                >
                  <LogIn className="w-4 h-4 text-blue-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Official State Disaster Relief Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Centralized Flood Rescue Data Management & <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Dynamic Reporting</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Empowering government authorities, NDRF/SDRF rescue teams, NGOs, and medical coordinators with real-time inundation tracking, shelter occupancy analytics, and automated PDF/Excel reports.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm rounded-2xl flex items-center gap-2.5 transition-all shadow-lg"
            >
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <span>Register New User</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <AlertOctagon className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">5 Active</div>
              <div className="text-xs text-slate-400">Flood Incidents</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <LifeBuoy className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">30+ Rescued</div>
              <div className="text-xs text-slate-400">Citizens Safely Sheltered</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <HomeIcon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">8 Camps</div>
              <div className="text-xs text-slate-400">Relief Shelters Monitored</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <FileSpreadsheet className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">PDF & Excel</div>
              <div className="text-xs text-slate-400">Dynamic 1-Click Exports</div>
            </div>
          </div>
        </div>
      </section>



      {/* Feature Highlights Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Enterprise Disaster Management Capabilities</h2>
            <p className="text-xs sm:text-sm text-slate-400">Built for mission-critical disaster response and public transparency</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">OTP & Password Authentication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure dual login methods: Standard password auth or 6-digit OTP code verification for rapid field officer sign-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Village Inundation Radar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track population impact, damaged roads/bridges, power plant disruptions, and clean water availability per district.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Dynamic PDF & Excel Generator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate official executive reports with automated recommendations and export formatted ReportLab PDFs and multi-tab openpyxl Excel files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-8 px-6 text-center text-xs text-slate-500">
        <p className="font-mono">State Flood Rescue Command Center • Tamil Nadu Disaster Authority • PostgreSQL Active</p>
      </footer>
    </div>
  );
}
