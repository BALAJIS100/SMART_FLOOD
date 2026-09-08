import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AffectedLocationsPage from './pages/AffectedLocationsPage';
import RescuedPersonsPage from './pages/RescuedPersonsPage';
import MissingPersonsPage from './pages/MissingPersonsPage';
import SheltersPage from './pages/SheltersPage';
import RescueTeamsPage from './pages/RescueTeamsPage';
import ResourcesPage from './pages/ResourcesPage';
import MedicalRequirementsPage from './pages/MedicalRequirementsPage';
import ReliefActivitiesPage from './pages/ReliefActivitiesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Command Center Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="locations" element={<AffectedLocationsPage />} />
              <Route path="rescued" element={<RescuedPersonsPage />} />
              <Route path="missing" element={<MissingPersonsPage />} />
              <Route path="shelters" element={<SheltersPage />} />
              <Route path="rescue-teams" element={<RescueTeamsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="medical" element={<MedicalRequirementsPage />} />
              <Route path="relief" element={<ReliefActivitiesPage />} />
              <Route path="reports" element={<ReportsPage />} />

              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Disaster Management Officer']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Disaster Management Officer']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
