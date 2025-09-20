# 🔧 SOLUCIÓN: Sistema Cargando Datos Mock en Vercel

## 📋 PROBLEMA IDENTIFICADO

El sistema en Vercel está cargando datos mock en lugar de los datos reales de MongoDB Atlas. Esto se debe a que el backend en Render no puede conectarse a la base de datos.

**Error visible en la consola:**
```
ProfileService: Error de conectividad, usando datos mock
AxiosError: timeout of 10000ms exceeded
```

## 🎯 SOLUCIÓN RÁPIDA

### 1. **Ejecutar Diagnóstico**
```bash
node diagnostico-completo.js
```

### 2. **Verificar Backend**
```bash
node verificar-backend-status.js
```

### 3. **Probar Conexión MongoDB**
```bash
cd backend
node test-mongodb-connection.js
```

## 🔧 CONFIGURACIÓN REQUERIDA

### **Paso 1: Configurar MongoDB Atlas**

1. **Acceder a MongoDB Atlas**
   - Ve a [MongoDB Atlas](https://cloud.mongodb.com)
   - Inicia sesión con tu cuenta

2. **Verificar Network Access**
   - Ve a "Network Access" en el menú lateral
   - Asegúrate de tener una regla que permita acceso desde cualquier IP:
     - **IP Address**: `0.0.0.0/0`
     - **Comment**: "Allow access from anywhere"

3. **Verificar Database Access**
   - Ve a "Database Access" en el menú lateral
   - Asegúrate de tener un usuario con permisos de lectura/escritura
   - Si no tienes usuario, crea uno:
     - **Username**: `repuestos-admin`
     - **Password**: Genera una contraseña segura
     - **Database User Privileges**: "Read and write to any database"

4. **Obtener Connection String**
   - Ve a "Database" en el menú lateral
   - Haz clic en "Connect"
   - Selecciona "Connect your application"
   - **Driver**: Node.js
   - **Version**: 5.0 or later
   - Copia el connection string

### **Paso 2: Configurar Render (Backend)**

1. **Acceder a Render Dashboard**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Selecciona tu servicio del backend (`piezasya-back`)

2. **Configurar Variables de Entorno**
   - Ve a "Environment" en el menú lateral
   - Agrega o actualiza estas variables:

```env
# MongoDB Atlas (REEMPLAZAR CON TU CONNECTION STRING)
MONGODB_URI=mongodb+srv://repuestos-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/repuestos-pro?retryWrites=true&w=majority

# Configuración del servidor
PORT=10000
NODE_ENV=production

# JWT
JWT_SECRET=tu-super-secreto-jwt-muy-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://piezasya.vercel.app

# Frontend URL
FRONTEND_URL=https://piezasya.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Reiniciar el Servicio**
   - Después de agregar las variables, haz clic en "Manual Deploy"
   - Selecciona "Deploy latest commit"
   - Espera a que el despliegue termine

### **Paso 3: Verificar Configuración**

1. **Verificar Backend**
   ```bash
   node verificar-backend-status.js
   ```

2. **Verificar Frontend**
   - Ve a tu sitio en Vercel: `https://piezasya.vercel.app`
   - Abre las herramientas de desarrollador (F12)
   - Ve a la consola
   - Deberías ver: `ProfileService: Datos reales cargados desde la base de datos`

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Problema: "MongoDB connection timeout"**
**Solución:**
- Verifica que la IP de Render esté permitida en MongoDB Atlas
- Asegúrate de que el connection string sea correcto
- Verifica que el usuario tenga permisos correctos

### **Problema: "Authentication failed"**
**Solución:**
- Verifica el username y password en el connection string
- Asegúrate de que el usuario tenga permisos de lectura/escritura
- Verifica que la base de datos existe

### **Problema: "Network access denied"**
**Solución:**
- Agrega la IP de Render a la lista de IPs permitidas
- O mejor aún, usa `0.0.0.0/0` para permitir acceso desde cualquier IP

### **Problema: "CORS error"**
**Solución:**
- Verifica que `CORS_ORIGIN` esté configurado correctamente en Render
- Asegúrate de que el frontend esté en la lista de orígenes permitidos

## 📊 VERIFICACIÓN FINAL

Una vez configurado correctamente, deberías ver:

### **En Render Logs:**
```
🔌 Conectando a la base de datos...
✅ Conectado a MongoDB exitosamente
```

### **En Vercel Console:**
```
🔧 Configuración de entorno: {
  isVercel: true,
  backendUrl: "https://piezasya-back.onrender.com/api",
  environment: "production"
}
ProfileService: Datos reales cargados desde la base de datos
```

### **En la Aplicación:**
- Los datos se cargan desde MongoDB Atlas
- No aparecen más los datos mock
- La aplicación funciona normalmente

## 🔍 SCRIPTS DE DIAGNÓSTICO

### **Diagnóstico Completo**
```bash
node diagnostico-completo.js
```

### **Verificar Backend**
```bash
node verificar-backend-status.js
```

### **Verificar Conectividad**
```bash
node verificar-conectividad-mongodb.js
```

### **Probar MongoDB**
```bash
cd backend
node test-mongodb-connection.js
```

## 📚 ARCHIVOS DE REFERENCIA

- `SOLUCION_MONGODB_VERCEL.md` - Guía detallada de solución
- `MONGODB_SETUP.md` - Configuración de MongoDB Atlas
- `DEPLOYMENT_GUIDE.md` - Guía de despliegue
- `backend/env.example` - Variables de entorno del backend

## 🆘 SOPORTE

Si sigues teniendo problemas:

1. **Ejecuta el diagnóstico completo**
2. **Revisa los logs de Render**
3. **Verifica la consola del navegador**
4. **Asegúrate de que MongoDB Atlas esté funcionando**

---

**¡Con esta configuración, tu sistema en Vercel debería cargar datos reales de MongoDB Atlas!** 🎉
