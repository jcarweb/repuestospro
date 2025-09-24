# 🔄 Sistema de Backend Dinámico - PiezasYA Mobile

## ✅ **Estado Actual: FUNCIONANDO**

### **🎯 Funcionalidades Implementadas:**

1. **✅ Cambio Dinámico de Backend**: Sin modificar código
2. **✅ Persistencia de Configuración**: Se mantiene entre sesiones
3. **✅ Testing de Conectividad**: Verificación automática
4. **✅ Selector Visual**: Interfaz intuitiva en pantalla de login
5. **✅ Configuración Robusta**: Manejo de errores mejorado

### **🌐 Backends Configurados:**

| Backend | URL | Descripción | Estado |
|---------|-----|-------------|--------|
| **Local Development** | `http://192.168.0.106:5000/api` | Tu computadora | ✅ Funcionando |
| **Render Production** | `https://piezasya-back.onrender.com/api` | Servidor en la nube | ✅ Funcionando |
| **Localhost** | `http://localhost:5000/api` | Misma máquina | ✅ Funcionando |

## 🚀 **Cómo Usar:**

### **1. Cambiar Backend desde la App:**
1. **Abre la app móvil**
2. **Ve a la pantalla de login**
3. **Busca el selector de backend** (ícono de servidor 🔧)
4. **Toca el selector** para abrir el modal
5. **Selecciona el backend** que quieras usar
6. **Prueba la conectividad** automáticamente
7. **¡Listo!** La app se conectará al backend seleccionado

### **2. Cambiar Backend con Script:**
```bash
cd mobile
start-with-backend.bat
```

## 📱 **Ubicación del Selector:**

- **Pantalla de Login**: Debajo del título "Iniciar Sesión"
- **Apariencia**: Botón con ícono de servidor y nombre del backend
- **Funcionalidad**: Modal con opciones y testing de conectividad

## 🔧 **Archivos del Sistema:**

### **Configuración:**
- `src/config/environments.ts` - Configuración de backends
- `src/config/api.ts` - Sistema dinámico de API

### **Componentes:**
- `src/components/SimpleBackendSelector.tsx` - Selector visual
- `src/components/SimpleBackendStatus.tsx` - Indicador de estado (deshabilitado temporalmente)

### **Hooks:**
- `src/hooks/useAPIConfig.ts` - Gestión de configuración

### **Scripts:**
- `start-with-backend.bat` - Script de selección automática

## 🧪 **Testing:**

### **Verificar Conectividad:**
1. **Abre el selector de backend**
2. **Toca el botón de test** (ícono de WiFi)
3. **Verifica el resultado** en el modal

### **Cambiar y Probar:**
1. **Selecciona "Render Production"**
2. **Haz login** con tus credenciales
3. **Verifica en los logs** que las peticiones van a Render
4. **Cambia a "Local Development"**
5. **Verifica** que las peticiones van al local

## 📊 **Logs de Verificación:**

### **Backend Local:**
```
🌐 Making request to: http://192.168.0.106:5000/api/auth/login
```

### **Backend Render:**
```
🌐 Making request to: https://piezasya-back.onrender.com/api/auth/login
```

## 🔍 **Troubleshooting:**

### **Problema: No aparece el selector**
- **Solución**: Reinicia la app móvil
- **Verificar**: Que el archivo `SimpleBackendSelector.tsx` esté importado en `LoginScreen.tsx`

### **Problema: Error al cambiar backend**
- **Solución**: Verifica la conectividad a internet
- **Verificar**: Que el backend de destino esté funcionando

### **Problema: No se mantiene la selección**
- **Solución**: Verifica que AsyncStorage esté funcionando
- **Verificar**: Que no haya errores en la consola

### **Problema: App crashea**
- **Solución**: El componente `SimpleBackendStatus` está deshabilitado temporalmente
- **Verificar**: Que no haya errores de importación

## 🎯 **Casos de Uso:**

### **Desarrollo Local:**
1. Selecciona "Local Development"
2. Asegúrate de que el backend local esté corriendo
3. Desarrolla y prueba funcionalidades

### **Testing en Producción:**
1. Selecciona "Render Production"
2. Prueba con datos reales
3. Verifica comportamiento en producción

### **Debugging:**
1. Cambia entre backends
2. Compara respuestas
3. Identifica diferencias

## 🔒 **Seguridad:**

- ✅ **Credenciales seguras**: Se mantienen en el backend
- ✅ **No exposición**: Las credenciales no se almacenan en la app
- ✅ **Autenticación independiente**: Cada backend maneja su propia auth
- ✅ **Tokens seguros**: Los tokens se mantienen por backend

## 📈 **Próximas Mejoras:**

- [ ] Indicador de estado en pantalla de perfil
- [ ] Historial de backends usados
- [ ] Configuración de timeouts personalizados
- [ ] Métricas de rendimiento por backend
- [ ] Backup automático de configuración

## 🆘 **Soporte:**

Si encuentras problemas:
1. **Revisa los logs** de la consola
2. **Verifica la conectividad** a internet
3. **Reinicia la aplicación**
4. **Usa el script** `start-with-backend.bat` como alternativa

---

**✅ Sistema funcionando correctamente - Listo para usar!**
