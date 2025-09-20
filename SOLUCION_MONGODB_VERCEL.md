# 🔧 SOLUCIÓN: Conectar MongoDB Atlas con Vercel

## 📋 PROBLEMA IDENTIFICADO

El sistema en Vercel está cargando datos mock porque el backend en Render no puede conectarse a MongoDB Atlas. El error `ECONNABORTED` con timeout de 10 segundos indica problemas de conectividad.

## 🎯 SOLUCIÓN PASO A PASO

### 1. **VERIFICAR MONGODB ATLAS**

#### A. Acceder a MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

#### B. Verificar Network Access
1. En el menú lateral, ve a **"Network Access"**
2. Asegúrate de que tienes una regla que permita acceso desde cualquier IP:
   - **IP Address**: `0.0.0.0/0`
   - **Comment**: "Allow access from anywhere"
3. Si no existe, haz clic en **"Add IP Address"** y agrega la regla

#### C. Verificar Database Access
1. En el menú lateral, ve a **"Database Access"**
2. Verifica que tienes un usuario con permisos de lectura y escritura
3. Si no tienes usuario, crea uno:
   - **Username**: `repuestos-admin`
   - **Password**: Genera una contraseña segura
   - **Database User Privileges**: "Read and write to any database"

#### D. Obtener Connection String
1. En el menú lateral, ve a **"Database"**
2. Haz clic en **"Connect"**
3. Selecciona **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.0 or later
6. Copia el connection string (debería verse así):
   ```
   mongodb+srv://repuestos-admin:<password>@cluster0.xxxxx.mongodb.net/repuestos-pro?retryWrites=true&w=majority
   ```

### 2. **CONFIGURAR RENDER (BACKEND)**

#### A. Acceder a Render Dashboard
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio del backend (`piezasya-back`)

#### B. Configurar Variables de Entorno
1. Ve a **"Environment"** en el menú lateral
2. Agrega o actualiza estas variables:

```env
# MongoDB Atlas
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

#### C. Reiniciar el Servicio
1. Después de agregar las variables, haz clic en **"Manual Deploy"**
2. Selecciona **"Deploy latest commit"**
3. Espera a que el despliegue termine

### 3. **VERIFICAR CONECTIVIDAD**

#### A. Probar Conexión desde Render
1. En Render, ve a **"Logs"**
2. Busca estos mensajes:
   - ✅ `Conectado a MongoDB exitosamente`
   - ❌ `Error conectando a MongoDB`

#### B. Probar desde el Frontend
1. Ve a tu sitio en Vercel: `https://piezasya.vercel.app`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la consola
4. Deberías ver:
   - ✅ `ProfileService: Datos reales cargados desde la base de datos`
   - ❌ `ProfileService: Error de conectividad, usando datos mock`

### 4. **SOLUCIÓN DE PROBLEMAS COMUNES**

#### Problema: "MongoDB connection timeout"
**Solución:**
- Verifica que la IP de Render esté permitida en MongoDB Atlas
- Asegúrate de que el connection string sea correcto
- Verifica que el usuario tenga permisos correctos

#### Problema: "Authentication failed"
**Solución:**
- Verifica el username y password en el connection string
- Asegúrate de que el usuario tenga permisos de lectura/escritura
- Verifica que la base de datos existe

#### Problema: "Network access denied"
**Solución:**
- Agrega la IP de Render a la lista de IPs permitidas
- O mejor aún, usa `0.0.0.0/0` para permitir acceso desde cualquier IP

### 5. **VERIFICACIÓN FINAL**

Una vez configurado correctamente, deberías ver:

1. **En Render Logs:**
   ```
   🔌 Conectando a la base de datos...
   ✅ Conectado a MongoDB exitosamente
   ```

2. **En Vercel Console:**
   ```
   🔧 Configuración de entorno: {
     isVercel: true,
     backendUrl: "https://piezasya-back.onrender.com/api",
     environment: "production"
   }
   ProfileService: Datos reales cargados desde la base de datos
   ```

3. **En la aplicación:**
   - Los datos se cargan desde MongoDB Atlas
   - No aparecen más los datos mock
   - La aplicación funciona normalmente

## 🚨 IMPORTANTE

- **Nunca** expongas tu connection string en el código
- **Siempre** usa variables de entorno para credenciales sensibles
- **Verifica** que las IPs estén configuradas correctamente en MongoDB Atlas
- **Reinicia** el servicio en Render después de cambiar variables de entorno

## 📞 SOPORTE

Si sigues teniendo problemas:

1. Verifica los logs de Render para errores específicos
2. Verifica la consola del navegador para errores de conectividad
3. Asegúrate de que MongoDB Atlas esté funcionando correctamente
4. Verifica que el connection string sea válido

---

**¡Con esta configuración, tu sistema en Vercel debería cargar datos reales de MongoDB Atlas!** 🎉
