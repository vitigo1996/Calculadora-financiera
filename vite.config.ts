import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // recharts ocupa ~500 kB por sí sola; el límite se ajusta para no avisar por esa librería
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separar librerías grandes en archivos propios (mejor caché y carga inicial más liviana)
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
