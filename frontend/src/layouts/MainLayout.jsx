import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function MainLayout() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/dashboard/kpi');
        setAlerts(res.data.alerts || []);
      } catch (err) {
        console.error('Failed to fetch header alerts:', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header alerts={alerts} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
