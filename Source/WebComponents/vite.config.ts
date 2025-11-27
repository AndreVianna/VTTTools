import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VttToolsWebComponents',
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@mui/material',
                '@mui/icons-material',
                '@mui/x-data-grid',
                '@emotion/react',
                '@emotion/styled',
                '@reduxjs/toolkit',
                'react-redux',
                'react-router-dom',
                'konva',
                'react-konva',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'ReactJsxRuntime',
                    '@mui/material': 'MuiMaterial',
                    '@mui/icons-material': 'MuiIcons',
                    '@emotion/react': 'EmotionReact',
                    '@emotion/styled': 'EmotionStyled',
                    '@reduxjs/toolkit': 'RTK',
                    'react-redux': 'ReactRedux',
                    'react-router-dom': 'ReactRouterDOM',
                    'konva': 'Konva',
                    'react-konva': 'ReactKonva',
                },
                preserveModules: false,
                entryFileNames: '[name].js',
            },
        },
        sourcemap: true,
        minify: false,
        target: 'esnext',
        outDir: 'dist',
        emptyOutDir: true,
    },
});
