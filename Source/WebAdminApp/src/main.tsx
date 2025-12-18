import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@store/store';
import { AdminThemeProvider } from './theme';
import { ErrorBoundary } from '@components/error/ErrorBoundary';
import { configureApiClient } from '@api/client';
import App from './App';

configureApiClient({
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <AdminThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AdminThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
