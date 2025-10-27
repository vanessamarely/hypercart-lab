import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
// Removed GitHub Spark imports for standalone operation

import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ? `/${process.env.VITE_BASE_PATH}/` : '/',
  plugins: [
    react(),
    tailwindcss(),
    // Removed GitHub Spark plugins for standalone operation
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Optimize for Vercel deployment
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Force external dependencies to be treated correctly
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar'],
          router: ['react-router-dom']
        },
        // Ensure consistent chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for better performance
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude problematic dependencies from optimization
    exclude: []
  },
  // Ensure proper ESM handling
  esbuild: {
    target: 'es2022'
  }
});
