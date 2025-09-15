import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react' 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://piezasyaya-backend.onrender.com/api'),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY || ''),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME || 'dsfk4ggr5'),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET || ''),
      'import.meta.env.VITE_VAPID_PUBLIC_KEY': JSON.stringify(env.VITE_VAPID_PUBLIC_KEY || 'BP5Pp6m0x8E3GW6wH32wRAK4Sw8HXbMLLANMPoq1v1_V8TPQmJgGnQ7dqH_5lUrCcMpooyZUTqVsx9fLDr3rgIE')
    }
  }
});
