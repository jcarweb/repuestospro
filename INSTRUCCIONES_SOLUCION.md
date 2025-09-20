# 🚀 INSTRUCCIONES PARA SOLUCIONAR DATOS MOCK EN VERCEL

## 📋 PROBLEMA
El sistema en Vercel está cargando datos mock en lugar de los datos reales de MongoDB Atlas.

## 🎯 SOLUCIÓN RÁPIDA

### **Opción 1: Configuración Automática (Recomendado)**
```bash
node configurar-mongodb-vercel.js
```

### **Opción 2: Diagnóstico Manual**
```bash
# 1. Verificar estado del sistema
node diagnostico-completo.js

# 2. Verificar backend específicamente
node verificar-backend-status.js

# 3. Verificar conectividad general
node verificar-conectividad-mongodb.js
```

## 🔧 CONFIGURACIÓN MANUAL

### **Paso 1: MongoDB Atlas**
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. **Network Access**: Asegúrate de tener `0.0.0.0/0` permitido
3. **Database Access**: Crea un usuario con permisos de lectura/escritura
4. **Connection String**: Copia tu connection string

### **Paso 2: Render (Backend)**
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio `piezasya-back`
3. Ve a "Environment" y agrega:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/repuestos-pro?retryWrites=true&w=majority
PORT=10000
NODE_ENV=production
JWT_SECRET=tu-super-secreto-jwt-muy-seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://piezasya.vercel.app
FRONTEND_URL=https://piezasya.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Reinicia el servicio**: Manual Deploy → Deploy latest commit

### **Paso 3: Verificar**
1. Ve a `https://piezasya.vercel.app`
2. Abre la consola del navegador (F12)
3. Deberías ver: `ProfileService: Datos reales cargados desde la base de datos`

## 📊 SCRIPTS DISPONIBLES

| Script | Propósito |
|--------|-----------|
| `configurar-mongodb-vercel.js` | Configuración automática paso a paso |
| `diagnostico-completo.js` | Diagnóstico completo del sistema |
| `verificar-backend-status.js` | Verificar estado del backend |
| `verificar-conectividad-mongodb.js` | Verificar conectividad general |
| `backend/test-mongodb-connection.js` | Probar conexión MongoDB desde backend |

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Error: "timeout of 10000ms exceeded"**
- **Causa**: Backend no puede conectarse a MongoDB
- **Solución**: Verificar `MONGODB_URI` en Render

### **Error: "ECONNABORTED"**
- **Causa**: Timeout de conexión
- **Solución**: Verificar Network Access en MongoDB Atlas

### **Error: "Authentication failed"**
- **Causa**: Credenciales incorrectas
- **Solución**: Verificar username/password en connection string

### **Error: "Network access denied"**
- **Causa**: IP no permitida
- **Solución**: Agregar `0.0.0.0/0` en Network Access

## ✅ VERIFICACIÓN FINAL

Una vez configurado correctamente, deberías ver:

### **En Render Logs:**
```
🔌 Conectando a la base de datos...
✅ Conectado a MongoDB exitosamente
```

### **En Vercel Console:**
```
ProfileService: Datos reales cargados desde la base de datos
```

### **En la Aplicación:**
- Los datos se cargan desde MongoDB Atlas
- No aparecen más los datos mock
- La aplicación funciona normalmente

## 📚 ARCHIVOS DE REFERENCIA

- `SOLUCION_MONGODB_VERCEL.md` - Guía detallada
- `README_SOLUCION_MONGODB.md` - Instrucciones completas
- `MONGODB_SETUP.md` - Configuración de MongoDB Atlas
- `DEPLOYMENT_GUIDE.md` - Guía de despliegue

## 🆘 SOPORTE

Si sigues teniendo problemas:

1. **Ejecuta el diagnóstico completo**
2. **Revisa los logs de Render**
3. **Verifica la consola del navegador**
4. **Asegúrate de que MongoDB Atlas esté funcionando**

---

**¡Con esta configuración, tu sistema en Vercel debería cargar datos reales de MongoDB Atlas!** 🎉
