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
    if (existsSync('public/manifest.json')) {
      copyFileSync('public/manifest.json', 'dist/manifest.json');
      console.log('✅ Copied manifest.json');
    }

    // Copy all icons
    const iconsDir = 'public/icons';
    if (existsSync(iconsDir)) {
      const icons = readdirSync(iconsDir);
      icons.forEach((icon) => {
        copyFileSync(`${iconsDir}/${icon}`, `dist/icons/${icon}`);
        console.log(`✅ Copied ${icon}`);
      });
    }
  },
});

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      copyStaticFilesPlugin(),
    ],

    build: {
      outDir: 'dist',
      emptyDirBeforeWrite: true,

      // ✅ Minification ONLY (allowed by Chrome Web Store)
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,     // Remove console.log
              drop_debugger: true,    // Remove debugger statements
              pure_funcs: ['console.log', 'console.debug', 'console.info'],
              passes: 2,             // Multiple compression passes
            },
            mangle: {
              toplevel: false,        // Don't mangle top-level names
            },
            format: {
              comments: false,        // Remove all comments
            },
          }
        : undefined,

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

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  };
});