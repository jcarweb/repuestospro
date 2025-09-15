# PiezasYA Mobile App

Aplicación móvil de PiezasYA construida con React Native y Expo, diseñada para ser lo más similar posible a la aplicación web.

## 🚀 Características

### ✅ **Autenticación Completa**
- Login con email y contraseña
- Registro de usuarios (solo perfil cliente)
- Login con Google (preparado)
- Login con huella dactilar (preparado)
- Gestión de tokens JWT
- Persistencia de sesión

### ✅ **Diseño Idéntico al Web**
- Pantallas de login y registro con el mismo diseño
- Logo de PiezasYA integrado
- Paleta de colores consistente (#FFC300 como color principal)
- Experiencia de usuario uniforme

### ✅ **Navegación Intuitiva**
- Navegación por tabs en la aplicación principal
- Stack navigation para pantallas de autenticación
- Transiciones suaves entre pantallas

### ✅ **Pantallas Implementadas**
- **LoginScreen**: Pantalla de inicio de sesión
- **RegisterScreen**: Pantalla de registro
- **HomeScreen**: Pantalla principal del ecommerce
- **Placeholder Screens**: Para categorías, carrito, perfil, etc.

## 📱 Estructura del Proyecto

```
mobile/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/           # Contextos de React (AuthContext)
│   ├── navigation/         # Configuración de navegación
│   ├── screens/           # Pantallas de la aplicación
│   │   ├── auth/          # Pantallas de autenticación
│   │   └── main/          # Pantallas principales
│   ├── services/          # Servicios de API
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── assets/                # Imágenes y recursos
├── App.tsx               # Componente principal
└── app.json              # Configuración de Expo
```

## 🛠️ Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación entre pantallas
- **AsyncStorage**: Almacenamiento local
- **Expo Vector Icons**: Iconos de la aplicación

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo macOS)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   cd mobile
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el backend**
   - Asegúrate de que el backend esté ejecutándose en `http://localhost:5000`
   - O modifica la URL en `src/services/api.ts`

4. **Ejecutar la aplicación**
   ```bash
   # Para desarrollo web
   npm run web
   
   # Para desarrollo Android
   npm run android
   
   # Para desarrollo iOS (solo macOS)
   npm run ios
   ```

## 🔌 Configuración de la API

La aplicación se conecta al backend de PiezasYA. Para cambiar la URL de la API:

1. Abre `src/services/api.ts`
2. Modifica la constante `API_BASE_URL`:
   ```typescript
   const API_BASE_URL = 'http://tu-servidor:puerto/api';
   ```

## 📱 Pantallas Disponibles

### Autenticación
- **Login**: Inicio de sesión con email/contraseña
- **Register**: Registro de nuevos usuarios

### Principal
- **Home**: Pantalla principal con productos destacados y categorías
- **Categories**: Lista de categorías (placeholder)
- **Cart**: Carrito de compras (placeholder)
- **Profile**: Perfil del usuario (placeholder)

### Navegación
- **Search**: Búsqueda de productos (placeholder)
- **ProductDetail**: Detalle de producto (placeholder)
- **Orders**: Historial de pedidos (placeholder)
- **Stores**: Lista de tiendas (placeholder)
- **Support**: Soporte al cliente (placeholder)

## 🎨 Diseño y UX

### Colores Principales
- **Amarillo Principal**: #FFC300
- **Gris Oscuro**: #111827
- **Gris Medio**: #6B7280
- **Gris Claro**: #F9FAFB
- **Blanco**: #FFFFFF

### Tipografía
- **Títulos**: 24-28px, bold
- **Subtítulos**: 16px, normal
- **Texto**: 14-16px, normal
- **Etiquetas**: 12-14px, medium

### Componentes
- **Botones**: Fondo amarillo (#FFC300), texto oscuro
- **Inputs**: Bordes grises, padding consistente
- **Cards**: Sombras sutiles, bordes redondeados
- **Iconos**: Ionicons, colores consistentes

## 🔐 Autenticación

### Flujo de Login
1. Usuario ingresa email y contraseña
2. Se valida la información
3. Se envía petición al backend
4. Se almacena el token JWT
5. Se redirige a la pantalla principal

### Flujo de Registro
1. Usuario completa el formulario
2. Se validan los campos
3. Se envía petición al backend
4. Se crea la cuenta automáticamente
5. Se inicia sesión automáticamente

### Persistencia
- Los tokens se almacenan en AsyncStorage
- La sesión persiste entre reinicios de la app
- Se verifica automáticamente el estado de autenticación

## 🚀 Próximas Funcionalidades

### Autenticación
- [ ] Login con Google OAuth
- [ ] Login con huella dactilar
- [ ] Recuperación de contraseña
- [ ] Verificación de email

### Ecommerce
- [ ] Lista completa de productos
- [ ] Detalle de productos
- [ ] Carrito de compras funcional
- [ ] Proceso de checkout
- [ ] Historial de pedidos

### Funcionalidades Adicionales
- [ ] Notificaciones push
- [ ] Geolocalización
- [ ] Modo offline
- [ ] Favoritos
- [ ] Reseñas de productos

## 🐛 Solución de Problemas

### Error de Conexión
- Verifica que el backend esté ejecutándose
- Revisa la URL de la API en `src/services/api.ts`
- Asegúrate de que no haya problemas de red

### Error de Dependencias
```bash
npm install --legacy-peer-deps
```

### Error de Metro Bundler
```bash
npx expo start --clear
```

## 📄 Licencia

Este proyecto es parte de la aplicación PiezasYA y está bajo la misma licencia que el proyecto principal.

## 🤝 Contribución

Para contribuir al desarrollo de la aplicación móvil:

1. Crea una rama para tu feature
2. Implementa los cambios
3. Prueba exhaustivamente
4. Crea un pull request

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación móvil, contacta al equipo de desarrollo de PiezasYA.
