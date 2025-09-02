# 🗺️ Sistema de Mapas y Ubicación GPS

## 📱 Características Implementadas

### ✅ **LocationPicker Component**
- **Mapa real** usando OpenStreetMap (gratuito)
- **Selección táctil** en el mapa
- **Ubicación actual** automática
- **Coordenadas manuales** para casos específicos
- **Geocodificación inversa** para obtener direcciones
- **Interfaz intuitiva** con botones de acción

### 🎯 **Funcionalidades del Mapa**
- **Zoom y desplazamiento** táctil
- **Marcador visual** de ubicación seleccionada
- **Información de coordenadas** en tiempo real
- **Dirección automática** basada en coordenadas
- **Animaciones suaves** al cambiar ubicación

## 🚀 **Instalación de Dependencias**

### **Windows**
```bash
install-maps-dependencies.bat
```

### **Linux/Mac**
```bash
chmod +x install-maps-dependencies.sh
./install-maps-dependencies.sh
```

### **Manual**
```bash
npm install react-native-maps expo-location
```

## 🔧 **Configuración**

### **Permisos de Ubicación**
El componente solicita automáticamente:
- `ACCESS_FINE_LOCATION` - Para ubicación precisa
- `ACCESS_COARSE_LOCATION` - Para ubicación aproximada

### **Configuración de Expo**
Asegúrate de que tu `app.json` incluya:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permitir que $(PRODUCT_NAME) use tu ubicación."
        }
      ]
    ]
  }
}
```

## 📍 **Uso del Componente**

### **Importación**
```typescript
import LocationPicker from '../../components/LocationPicker';
```

### **Implementación Básica**
```typescript
const [location, setLocation] = useState<{
  latitude: number;
  longitude: number;
  address: string;
} | null>(null);

<LocationPicker
  onLocationSelect={(newLocation) => setLocation(newLocation)}
  initialLocation={location}
/>
```

### **Propiedades del Componente**
- `onLocationSelect`: Callback cuando se selecciona ubicación
- `initialLocation`: Ubicación inicial (opcional)

## 🎨 **Personalización**

### **Colores del Tema**
El componente usa automáticamente los colores del tema:
- `colors.primary` - Botón principal y marcador
- `colors.info` - Botón de coordenadas manuales
- `colors.error` - Botón de limpiar
- `colors.surface` - Fondo del mapa

### **Estilos Personalizados**
Puedes modificar los estilos en `LocationPicker.tsx`:
- Altura del mapa: `mapContainer.height`
- Tamaño de botones: `actionButton`
- Colores de texto: `coordinatesText`, `addressText`

## 🔍 **Funcionalidades Avanzadas**

### **Geocodificación Inversa**
- Convierte coordenadas en direcciones legibles
- Usa la API nativa de Expo Location
- Fallback a texto genérico si falla

### **Manejo de Errores**
- Permisos de ubicación
- Errores de red
- Coordenadas inválidas
- Fallbacks automáticos

### **Optimizaciones**
- Debounce en selección de mapa
- Caché de ubicaciones recientes
- Animaciones suaves del mapa

## 📱 **Integración en Pantallas**

### **EditProfileScreen**
Ya integrado con:
- Selección de ubicación GPS
- Guardado automático en estado
- Validación de datos

### **Otras Pantallas**
Puedes usar el componente en:
- Configuración de entrega
- Selección de sucursal
- Configuración de ubicación preferida

## 🐛 **Solución de Problemas**

### **Mapa No Se Carga**
1. Verifica que `react-native-maps` esté instalado
2. Revisa permisos de ubicación
3. Asegúrate de tener conexión a internet

### **Ubicación No Se Obtiene**
1. Verifica permisos en configuración del dispositivo
2. Asegúrate de que GPS esté activado
3. Prueba en dispositivo físico (no emulador)

### **Errores de Compilación**
1. Limpia cache: `npx expo start --clear`
2. Reinstala dependencias: `npm install`
3. Verifica versión de Expo SDK

## 🌟 **Ventajas de OpenStreetMap**

- **Gratuito** - Sin costos de API
- **Sin límites** - Uso ilimitado
- **Datos actualizados** - Comunidad activa
- **Personalizable** - Estilos propios
- **Privacía** - No tracking de usuarios

## 🔮 **Próximas Mejoras**

- [ ] **Búsqueda de direcciones** por texto
- [ ] **Historial de ubicaciones** recientes
- [ ] **Favoritos** de ubicaciones
- [ ] **Rutas** entre puntos
- [ ] **Offline maps** para uso sin internet

## 📚 **Recursos Adicionales**

- [Documentación de react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [Documentación de Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Mapas de Venezuela](https://www.openstreetmap.org/search?query=venezuela)

---

**¡El sistema de mapas está listo para usar! 🎉**
