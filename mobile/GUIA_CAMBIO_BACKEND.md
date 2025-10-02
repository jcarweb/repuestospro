# 🔄 Guía de Cambio de Backend - PiezasYA Mobile

## 📋 Resumen
Esta guía te permite cambiar entre diferentes backends (Local, Render, Localhost) de forma manual y segura.

## 🚀 Cómo Cambiar el Backend

### Opción 1: Script Automático (Recomendado)
1. **Abre la terminal** en la carpeta `mobile`
2. **Ejecuta el script**:
   ```bash
   change-backend.bat
   ```
3. **Selecciona el backend** que quieres usar:
   - `1` = Local Development (192.168.0.106:5000)
   - `2` = Render Production (piezasya-back.onrender.com)
   - `3` = Localhost (localhost:5000)
4. **Reinicia la app móvil** para aplicar los cambios

### Opción 2: Script Manual
1. **Abre la terminal** en la carpeta `mobile`
2. **Ejecuta**:
   ```bash
   node change-backend.js 1  # Para Local
   node change-backend.js 2  # Para Render
   node change-backend.js 3  # Para Localhost
   ```
3. **Reinicia la app móvil**

## 🔍 Verificación

### 1. Verificar en la App
- **Abre la app móvil**
- **Ve a la pantalla de login**
- **Revisa los logs** en la terminal de Expo
- **Busca mensajes como**:
  ```
  API Config initialized (DYNAMIC): { baseUrl: 'http://192.168.0.106:5000/api', ... }
  ```

### 2. Verificar en el Backend
- **Revisa los logs del backend** para ver las peticiones entrantes
- **Las peticiones deberían venir de** la app móvil
- **La URL debería coincidir** con la configurada

## 📊 Backends Disponibles

| ID | Nombre | URL | Descripción |
|----|--------|-----|-------------|
| 1 | Local Development | `http://192.168.0.106:5000/api` | Backend local en tu computadora |
| 2 | Render Production | `https://piezasya-back.onrender.com/api` | Backend en producción (Render) |
| 3 | Localhost | `http://localhost:5000/api` | Backend local (localhost) |

## 🛠️ Solución de Problemas

### Error: "No se pudo conectar al servidor"
1. **Verifica que el backend esté corriendo**:
   ```bash
   cd backend
   npm start
   ```
2. **Verifica la IP local**:
   ```bash
   ipconfig
   ```
3. **Actualiza la IP** en `mobile/src/config/api.ts` si es necesario

### Error: "Ruta no encontrada"
1. **Verifica que la URL del backend sea correcta**
2. **Asegúrate de que el backend tenga la ruta `/api`**
3. **Revisa los logs del backend** para ver las peticiones

### La app no cambia de backend
1. **Reinicia completamente la app móvil**
2. **Verifica que el archivo de configuración se haya creado**
3. **Revisa los logs** para confirmar la URL del backend

## 📁 Archivos Importantes

- `mobile/change-backend.bat` - Script principal para Windows
- `mobile/change-backend.js` - Script de configuración
- `mobile/backend-config.json` - Archivo de configuración generado
- `mobile/src/config/api.ts` - Configuración de la API
- `mobile/src/config/environments.ts` - Entornos disponibles

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo Local**: Usa backend `1` (Local Development)
2. **Pruebas**: Usa backend `2` (Render Production)
3. **Debugging**: Usa backend `3` (Localhost)

## 📱 Próximos Pasos

1. **Ejecuta** `change-backend.bat`
2. **Selecciona** el backend que quieres usar
3. **Reinicia** la app móvil
4. **Verifica** que las peticiones vayan al backend correcto
5. **¡Listo!** La app usará el backend seleccionado

## 🆘 Soporte

Si tienes problemas:
1. **Revisa los logs** de la app y del backend
2. **Verifica la conectividad** de red
3. **Confirma que el backend esté corriendo**
4. **Usa el script de cambio** para probar diferentes backends
