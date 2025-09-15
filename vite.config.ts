import { defineConfig } from 'vite' 
import react from '@vitejs/plugin-react' 

export default defineConfig({ 
  plugins: [react()], 
  server: { 
    port: 3000, 
    host: true, 
    proxy: { 
      '/api': { 
        target: 'http://localhost:3001', 
        changeOrigin: true, 
        secure: false 
      } 
    } 
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://piezasyaya-backend.onrender.com')
  }
});
