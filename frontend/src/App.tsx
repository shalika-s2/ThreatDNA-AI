import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertAnalysisPage } from './pages/AlertAnalysisPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { MetricsPage } from './pages/MetricsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LiveNetworkPage } from './pages/LiveNetworkPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-mono-tech text-xs text-textSecondary">
        <span>INITIALIZING SOC WORKSTATION...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="analysis" element={<AlertAnalysisPage />} />
            <Route path="datasets" element={<DatasetsPage />} />
            <Route path="experiments" element={<ExperimentsPage />} />
            <Route path="metrics" element={<MetricsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="network" element={<LiveNetworkPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
