# 🚀 Guía de Despliegue - PiezasYA v1.4.0

**Versión**: 1.4.0  
**Desarrollador**: Juan Hernandez  
**Empresa**: LDJ Digital Solutions  
**Equipo de Desarrollo**: PiezasYA  
**Última actualización**: Octubre 2025

## 📋 Resumen
Esta guía te ayudará a desplegar la aplicación PiezasYA v1.4.0 en servidores gratuitos:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Base de datos**: MongoDB Atlas (gratuito)

## 🎯 Estructura de Ramas
```
main (producción)
├── qa (testing/staging) ← Despliegue automático
└── develop (desarrollo) ← Trabajo diario
```

## 📝 Pasos de Despliegue

### 1. Crear rama QA
```bash
git checkout develop
git pull origin develop
git checkout -b qa
git push -u origin qa
```

### 2. Configurar Vercel (Frontend)
1. Ir a [vercel.com](https://vercel.com)
2. Conectar repositorio GitHub
3. Configurar:
   - **Framework**: Vite
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `dist`
   - **Branch**: `qa`
4. Agregar variables de entorno:
   ```
   VITE_API_URL=https://piezasyaya-backend.onrender.com
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset
   ```

### 3. Configurar Render (Backend)
1. Ir a [render.com](https://render.com)
2. Crear Web Service
3. Configurar:
   - **Repository**: `repuestospro`
   - **Branch**: `qa`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Agregar variables de entorno (ver `backend/env.example`)

### 4. Configurar MongoDB Atlas
1. Crear cluster gratuito
2. Configurar acceso de red (0.0.0.0/0)
3. Crear usuario de base de datos
4. Obtener cadena de conexión

### 5. Configurar Cloudinary (Opcional)
1. Crear cuenta gratuita
2. Obtener credenciales
3. Crear Upload Preset

## 🔄 Flujo de Trabajo

### Desarrollo diario
```bash
# Trabajar en develop
git checkout develop
# ... hacer cambios ...
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop
```

### Actualizar QA para testing
```bash
# Merge develop a qa
git checkout qa
git merge develop
git push origin qa
# Esto activa el despliegue automático
```

### Desplegar a producción
```bash
# Merge qa a main
git checkout main
git merge qa
git push origin main
```

## 🔍 Verificación

### URLs de acceso
- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://piezasyaya-backend.onrender.com`

### Endpoints de verificación
- **Health Check**: `GET /api/health`
- **API Status**: `GET /api/status`

## 📊 Monitoreo

### Vercel
- Logs: Dashboard > Functions > View Function Logs
- Analytics: Dashboard > Analytics

### Render
- Logs: Dashboard > Service > Logs
- Metrics: Dashboard > Service > Metrics

## 🛠️ Solución de Problemas

### Error de CORS
- Verificar que `CORS_ORIGIN` en Render apunte al dominio de Vercel

### Error de conexión a BD
- Verificar `MONGODB_URI` en Render
- Verificar acceso de red en MongoDB Atlas

### Error de build
- Verificar que todas las dependencias estén en `package.json`
- Verificar scripts de build

## 📞 Soporte
Para problemas específicos, revisar:
1. Logs de Vercel/Render
2. Variables de entorno
3. Configuración de CORS
4. Conexión a base de datos
