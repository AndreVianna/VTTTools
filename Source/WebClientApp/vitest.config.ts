import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

// Custom plugin to mock all MUI icons imports (prevents EMFILE on Windows)
const mockMuiIconsPlugin = (): Plugin => {
  const mockIconPath = path.resolve(__dirname, './src/tests/mocks/muiIcons.tsx');
  const VIRTUAL_PREFIX = '\0virtual:mui-icon:';

  return {
    name: 'mock-mui-icons',
    enforce: 'pre',
    resolveId(id) {
      // Barrel import - use the mock file directly
      if (id === '@mui/icons-material') {
        return mockIconPath;
      }
      // Individual icon import - use virtual module
      if (id.startsWith('@mui/icons-material/')) {
        const iconName = id.replace('@mui/icons-material/', '');
        return VIRTUAL_PREFIX + iconName;
      }
      return null;
    },
    load(id) {
      // Handle virtual module for individual icon imports
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const iconName = id.replace(VIRTUAL_PREFIX, '');
        // Re-export the specific icon as default from the mock file
        const normalizedPath = mockIconPath.split(path.sep).join('/');
        return `export { ${iconName} as default } from '${normalizedPath}';`;
      }
      return null;
    },
  };
};

export default defineConfig({
  plugins: [mockMuiIconsPlugin(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.d.ts', '**/*.config.*', '**/mockData', 'dist/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
