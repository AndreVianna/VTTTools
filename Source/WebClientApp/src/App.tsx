import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth';
import { LoadingOverlay } from '@/components/common';
import { ErrorBoundary, NetworkStatus, ServiceUnavailablePage } from '@/components/error';
import { AppLayout } from '@/components/layout';
import { VTTThemeProvider } from '@/components/theme';
import { AdventureListView } from '@/features/content-library/components/adventures';
import { CampaignListView } from '@/features/content-library/components/campaigns';
import { WorldListView } from '@/features/content-library/components/worlds';
import {
  AdventureDetailPage,
  CampaignDetailPage,
  ContentLibraryPage,
  WorldDetailPage,
} from '@/features/content-library/pages';
import { useAuth } from '@/hooks/useAuth';
import { AssetLibraryPage } from '@/pages/AssetLibraryPage';
import { MediaLibraryPage } from '@/pages/MediaLibraryPage';
import { AssetStudioPage } from '@/pages/AssetStudioPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { PasswordResetRequestPage } from '@/pages/auth/PasswordResetRequestPage';
import { EncounterEditorPage } from '@/pages/EncounterEditorPage';
import { EncounterPage } from '@/pages/EncounterPage';
import { LandingPage } from '@/pages/LandingPage';
import { ProfilePage } from '@/pages/settings/ProfilePage';
import { SecuritySettingsPage } from '@/pages/settings/SecuritySettingsPage';
import { store } from '@/store';
import { setupGlobalErrorHandling } from '@/utils/errorHandling';

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const { isInitializing } = useAuth();

  return (
    <>
      <LoadingOverlay open={isInitializing} message='Loading...' />

      {!isInitializing && (
        <Routes>
          {/* Public Routes - Anonymous access */}
          <Route
            path='/'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='anonymous'>
                  <LandingPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          {/* Authentication routes */}
          <Route
            path='/login'
            element={
              <AppLayout>
                <LoginPage />
              </AppLayout>
            }
          />
          <Route
            path='/register'
            element={
              <AppLayout>
                <LoginPage />
              </AppLayout>
            }
          />
          <Route
            path='/forgot-password'
            element={
              <AppLayout>
                <PasswordResetRequestPage />
              </AppLayout>
            }
          />
          <Route
            path='/reset-password'
            element={
              <AppLayout>
                <LoginPage />
              </AppLayout>
            }
          />

          {/* Protected Routes - Require authentication */}
          <Route
            path='/assets'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <AssetLibraryPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/media'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <MediaLibraryPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/assets/new'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <AssetStudioPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/assets/:id/edit'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <AssetStudioPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/content-library'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <ContentLibraryPage />
                </ProtectedRoute>
              </AppLayout>
            }
          >
            <Route path='worlds' element={<WorldListView />} />
            <Route path='campaigns' element={<CampaignListView />} />
            <Route path='adventures' element={<AdventureListView />} />
            <Route index element={<Navigate to='adventures' replace />} />
          </Route>

          <Route
            path='/worlds/:worldId'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <WorldDetailPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/campaigns/:campaignId'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <CampaignDetailPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/adventures/:adventureId'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <AdventureDetailPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          {/* Encounter Routes - Mode-based */}
          <Route
            path='/encounters/:encounterId/edit'
            element={
              <ProtectedRoute authLevel='authorized'>
                <EncounterEditorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/encounters/:encounterId/play'
            element={
              <ProtectedRoute authLevel='authorized'>
                <EncounterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/profile'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <ProfilePage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/settings'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <ProfilePage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          <Route
            path='/settings/security'
            element={
              <AppLayout>
                <ProtectedRoute authLevel='authorized'>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          {/* Dashboard redirect - landing page IS the dashboard for authenticated users */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute authLevel='authorized'>
                <Navigate to='/' replace />
              </ProtectedRoute>
            }
          />

          {/* Error pages - Anonymous access */}
          <Route
            path='/error/service-unavailable'
            element={
              <ProtectedRoute authLevel='anonymous'>
                <ServiceUnavailablePage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect to landing */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      )}

      {/* Global error handling components */}
      <NetworkStatus />
      {/* GlobalErrorDisplay disabled - NetworkStatus handles its own display */}
    </>
  );
}

function App() {
  useEffect(() => {
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
