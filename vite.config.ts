import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          title: 'Рыболовный форум',
          description: 'Сообщество рыболовов - форум для обсуждения рыбалки, обмена опытом, поиска рыбных мест и участия в соревнованиях. Присоединяйтесь к нам!',
          yandexVerification: 'd0bc285c0cf20d50'
        }
      },
      minify: true
    })
  ],
  base: './',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
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