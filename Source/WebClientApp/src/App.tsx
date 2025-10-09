import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { setupGlobalErrorHandling } from '@/utils/errorHandling';
import { LoginPage } from '@/pages/auth/LoginPage';
import { LandingPage } from '@/pages/LandingPage';
import { SceneEditorPage } from '@/pages/SceneEditorPage';
import { AssetLibraryPage } from '@/pages/AssetLibraryPage';
import { ErrorBoundary, NetworkStatus, ServiceUnavailablePage } from '@/components/error';
import { AppLayout } from '@/components/layout';
import { VTTThemeProvider } from '@/components/theme';
import { LoadingOverlay } from '@/components/common';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

// App Content - Wraps everything in Router
function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

// App Routes - Rendered inside Router context
function AppRoutes() {
  const { isInitializing } = useAuth();

  return (
    <>
      {/* Show loading overlay during initial auth check */}
      <LoadingOverlay
        open={isInitializing}
        message="Loading..."
      />

      {/* Main app UI - only renders after auth initialization */}
      {!isInitializing && (
        <AppLayout>
          <Routes>
            {/* Public Routes - Anonymous access */}
            <Route path="/" element={
              <ProtectedRoute authLevel="anonymous">
                <LandingPage />
              </ProtectedRoute>
            } />

            {/* Authentication routes - Anonymous access */}
            <Route path="/login" element={
              <ProtectedRoute authLevel="anonymous">
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute authLevel="anonymous">
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={
              <ProtectedRoute authLevel="anonymous">
                <LoginPage />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Require authentication */}
            <Route path="/assets" element={
              <ProtectedRoute authLevel="authorized">
                <AssetLibraryPage />
              </ProtectedRoute>
            } />

            <Route path="/scene-editor" element={
              <ProtectedRoute authLevel="authorized">
                <SceneEditorPage />
              </ProtectedRoute>
            } />

            {/* Dashboard redirect - landing page IS the dashboard for authenticated users */}
            <Route path="/dashboard" element={
              <ProtectedRoute authLevel="authorized">
                <Navigate to="/" replace />
              </ProtectedRoute>
            } />

            {/* Error pages - Anonymous access */}
            <Route path="/error/service-unavailable" element={
              <ProtectedRoute authLevel="anonymous">
                <ServiceUnavailablePage />
              </ProtectedRoute>
            } />

            {/* Default redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}

      {/* Global error handling components */}
      <NetworkStatus />
      {/* GlobalErrorDisplay disabled - NetworkStatus handles its own display */}
    </>
  );
}

// Main App Component with Redux Provider and Routing
function App() {
  useEffect(() => {
    // Setup global error handling on app initialization
    setupGlobalErrorHandling();
  }, []);

  return (
    <Provider store={store}>
      <VTTThemeProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </VTTThemeProvider>
    </Provider>
  );
}

export default App;