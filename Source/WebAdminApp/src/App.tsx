import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { AdminLayout } from '@components/layout/AdminLayout';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { AuditLogsPage } from '@pages/AuditLogsPage';
import { UserListPage } from '@pages/Users/UserListPage';
import { MaintenanceModePage } from '@pages/MaintenanceModePage';
import { ConfigurationPage } from '@pages/ConfigurationPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="maintenance" element={<MaintenanceModePage />} />
        <Route path="config" element={<ConfigurationPage />} />
        <Route path="library" element={<div>Public Library (Coming soon)</div>} />
      </Route>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
