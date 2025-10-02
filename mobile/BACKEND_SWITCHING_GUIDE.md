# 🔄 Guía de Cambio Dinámico de Backend

## Descripción
Sistema que permite cambiar entre diferentes backends (local, Render, etc.) sin modificar código.

## 🚀 Uso Rápido

### **Método 1: Script Automático**
```bash
# Ejecutar script de selección
start-with-backend.bat
```

### **Método 2: Desde la App**
1. Abrir la aplicación móvil
2. Buscar el selector de backend (ícono de servidor)
3. Seleccionar el backend deseado
4. Probar conectividad automáticamente

## 🌐 Backends Disponibles

### **1. Local Development**
- **URL**: `http://192.168.0.106:5000/api`
- **Descripción**: Backend local en tu computadora
- **Uso**: Desarrollo y pruebas locales

### **2. Render Production**
- **URL**: `https://piezasya-back.onrender.com/api`
- **Descripción**: Backend en producción (Render)
- **Uso**: Pruebas con datos reales

### **3. Localhost**
- **URL**: `http://localhost:5000/api`
- **Descripción**: Backend local (localhost)
- **Uso**: Desarrollo en la misma máquina

## 🔧 Configuración Técnica

### **Archivos Principales**
- `src/config/environments.ts` - Configuración de entornos
- `src/config/api.ts` - Sistema dinámico de API
- `src/components/BackendSelector.tsx` - UI de selección

### **Persistencia**
- La selección se guarda en `AsyncStorage`
- Se mantiene entre sesiones de la app
- Se puede cambiar en cualquier momento

## 🧪 Testing de Conectividad

### **Automático**
- Cada cambio de backend prueba la conectividad
- Muestra estado en tiempo real
- Alerta si no hay conexión

### **Manual**
- Botón de test en el selector
- Verifica endpoint `/api/health`
- Muestra detalles del error

## 📱 Integración en la App

### **En cualquier pantalla:**
```tsx
import { BackendSelector } from '../components/BackendSelector';

// En el JSX
<BackendSelector 
  onEnvironmentChange={(env) => {
    console.log('Backend cambiado a:', env.name);
  }}
/>
```

### **Programáticamente:**
```tsx
import { apiConfig } from '../config/api';

// Cambiar backend
await apiConfig.switchEnvironment('render');

// Obtener backend actual
const current = apiConfig.getCurrentEnvironment();

// Probar conectividad
const isWorking = await apiConfig.testCurrentEnvironment();
```

## 🛠️ Agregar Nuevos Backends

### **1. Editar `environments.ts`:**
```tsx
{
  id: 'staging',
  name: 'Staging Server',
  baseUrl: 'https://staging.piezasya.com/api',
  description: 'Servidor de staging',
  isLocal: false,
  isProduction: false
}
```

### **2. Reiniciar la app**
- El nuevo backend aparecerá automáticamente
- No requiere cambios adicionales

## 🔍 Troubleshooting

### **Problema: No se conecta al backend local**
- Verificar que el backend esté corriendo
- Comprobar la IP de la computadora
- Verificar firewall/antivirus

### **Problema: No se conecta a Render**
- Verificar conexión a internet
- Comprobar que el servicio esté activo
- Revisar logs de Render

### **Problema: La app no cambia de backend**
- Reiniciar la aplicación
- Limpiar cache de AsyncStorage
- Verificar logs de la consola

## 📊 Monitoreo

### **Logs de Conectividad**
```
🔍 Test de conectividad Local Development: ✅ OK
🔍 Test de conectividad Render Production: ❌ FALLO
✅ Entorno cambiado a: Local Development
```

### **Estado en Tiempo Real**
- Indicador visual del backend actual
- Estado de conectividad
- Última prueba realizada

## 🎯 Casos de Uso

### **Desarrollo Local**
1. Seleccionar "Local Development"
2. Asegurar que backend local esté corriendo
3. Probar funcionalidades

### **Testing en Producción**
1. Seleccionar "Render Production"
2. Probar con datos reales
3. Verificar comportamiento

### **Debugging**
1. Cambiar entre backends
2. Comparar respuestas
3. Identificar diferencias

## 🔒 Seguridad

- Las credenciales se mantienen en el backend
- No se almacenan en la app móvil
- Cada backend maneja su propia autenticación
- Cambios de backend no afectan tokens existentes
