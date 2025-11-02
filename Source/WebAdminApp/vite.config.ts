import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
        // Standalone mode - proxy to local Admin API
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
        '/health': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false,
        },
      } : {
        '/api/admin': {
          target: 'https://localhost:7175',
          changeOrigin: true,
          secure: false,
        },
        '/signalr/admin': {
          target: 'https://localhost:5193',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'https://localhost:5193',
          changeOrigin: true,
          secure: false,
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
