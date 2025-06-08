import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  base: '/',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['lodash', 'axios', 'date-fns']
        }, 
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    cssCodeSplit: true,
    cssMinify: true,
    target: 'es2015',
    sourcemap: false,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});