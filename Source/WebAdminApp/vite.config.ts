import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const isStandalone = process.env.VITE_STANDALONE === 'true' || mode === 'standalone';

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: undefined,
        babel: undefined,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@api': resolve(__dirname, 'src/api'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@services': resolve(__dirname, 'src/services'),
        '@store': resolve(__dirname, 'src/store'),
        '@types': resolve(__dirname, 'src/types'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
        '@theme': resolve(__dirname, 'src/theme'),
      },
    },
    define: {
      __ASPIRE_HEALTH__: JSON.stringify(true),
      __STANDALONE_MODE__: JSON.stringify(isStandalone),
    },
    server: {
      port: 5193, // Different port from main app
      // Conditional proxy configuration based on mode
      proxy: isStandalone ? {
        '/api/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/api/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/api/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/library/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/api/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/assets/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/api/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/media/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/api/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/game/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/health/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/admin/, '/health'),
        },
        '/health/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/auth/, '/health'),
        },
        '/health/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/library/, '/health'),
        },
        '/health/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/assets/, '/health'),
        },
        '/health/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/media/, '/health'),
        },
        '/health/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/game/, '/health'),
        },
        '/alive/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/admin/, '/alive'),
        },
        '/alive/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/auth/, '/alive'),
        },
        '/alive/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/library/, '/alive'),
        },
        '/alive/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/assets/, '/alive'),
        },
        '/alive/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/media/, '/alive'),
        },
        '/alive/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/game/, '/alive'),
        },
      } : {
        '/api/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
        },
        '/api/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api'),
        },
        '/api/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/library/, '/api'),
        },
        '/api/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/assets/, '/api'),
        },
        '/api/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/media/, '/api'),
        },
        '/api/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/game/, '/api'),
        },
        '/signalr/admin': {
          target: 'https://localhost:5193',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        '/health/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/admin/, '/health'),
        },
        '/health/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/auth/, '/health'),
        },
        '/health/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/library/, '/health'),
        },
        '/health/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/assets/, '/health'),
        },
        '/health/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/media/, '/health'),
        },
        '/health/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/health\/game/, '/health'),
        },
        '/alive/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/admin/, '/alive'),
        },
        '/alive/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/auth/, '/alive'),
        },
        '/alive/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/library/, '/alive'),
        },
        '/alive/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/assets/, '/alive'),
        },
        '/alive/media': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/media/, '/alive'),
        },
        '/alive/game': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/alive\/game/, '/alive'),
        },
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
            charts: ['recharts'],
            state: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
    },
  };
});
