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
import { PasswordResetRequestPage } from '@/pages/auth/PasswordResetRequestPage';
import { ContentLibraryPage } from '@/features/content-library/pages/ContentLibraryPage';
import { AdventureDetailPage } from '@/features/content-library/pages/AdventureDetailPage';
import { AdventureListView } from '@/features/content-library/components/adventures';
import { SecuritySettingsPage } from '@/pages/settings/SecuritySettingsPage';
import { ProfilePage } from '@/pages/settings/ProfilePage';

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

      {!isInitializing && (
        <Routes>
          {/* Public Routes - Anonymous access */}
          <Route path="/" element={
            <AppLayout>
              <ProtectedRoute authLevel="anonymous">
                <LandingPage />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* Authentication routes - No layout (full screen) */}
          <Route path="/login" element={
            <AppLayout>
              <LoginPage />
            </AppLayout>
          } />
          <Route path="/register" element={
            <AppLayout>
              <LoginPage />
            </AppLayout>
          } />
          <Route path="/forgot-password" element={
            <AppLayout>
              <PasswordResetRequestPage />
            </AppLayout>
          } />
          <Route path="/reset-password" element={
            <AppLayout>
              <LoginPage />
            </AppLayout>
          } />

          {/* Protected Routes - Require authentication */}
          <Route path="/assets" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <AssetLibraryPage />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/content-library" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <ContentLibraryPage />
              </ProtectedRoute>
            </AppLayout>
          }>
            <Route path="adventures" element={<AdventureListView />} />
            <Route index element={<Navigate to="adventures" replace />} />
          </Route>

          <Route path="/adventures/:adventureId" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <AdventureDetailPage />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/scene-editor/:sceneId?" element={
            <ProtectedRoute authLevel="authorized">
              <SceneEditorPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <ProfilePage />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/settings" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <ProfilePage />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/settings/security" element={
            <AppLayout>
              <ProtectedRoute authLevel="authorized">
                <SecuritySettingsPage />
              </ProtectedRoute>
            </AppLayout>
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