// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Plugin to copy static files after build
const copyStaticFilesPlugin = () => ({
  name: 'copy-static-files',
  closeBundle() {
    // Create dist/icons directory
    if (!existsSync('dist/icons')) {
      mkdirSync('dist/icons', { recursive: true });
    }
    
    // Copy manifest.json
    copyFileSync('public/manifest.json', 'dist/manifest.json');
    console.log('✅ Copied manifest.json');
    
    // Copy all icons
    const iconsDir = 'public/icons';
    if (existsSync(iconsDir)) {
      const icons = readdirSync(iconsDir);
      icons.forEach(icon => {
        copyFileSync(`${iconsDir}/${icon}`, `dist/icons/${icon}`);
        console.log(`✅ Copied ${icon}`);
      });
    }
  }
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyStaticFilesPlugin(),
  ],
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});