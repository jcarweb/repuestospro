# Contexto del Proyecto - Ecommerce de Repuestos

## Directriz: Contexto General del Sistema

Este es un proyecto de ecommerce multiplataforma para la venta de repuestos de vehículos desarrollado con las siguientes tecnologías:

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: MongoDB
- **Autenticación**: JWT + Passport.js
- **Iconos**: Lucide React
- **Rutas**: React Router DOM

### Estructura del Proyecto
```
repuestospro/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── contexts/          # Contextos de React (Auth, Cart, Favorites)
│   ├── hooks/             # Hooks personalizados
│   └── data/              # Datos estáticos
├── backend/               # Servidor Express
│   ├── src/
│   │   ├── controllers/   # Controladores de la API
│   │   ├── models/        # Modelos de MongoDB
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middlewares
│   │   ├── services/      # Servicios de negocio
│   │   └── config/        # Configuraciones
│   └── scripts/           # Scripts de utilidad
└── docs/                  # Documentación del proyecto
```

### Funcionalidades Principales

#### Frontend
- **Autenticación**: Login, registro, verificación de email
- **Catálogo**: Productos organizados por categorías y subcategorías
- **Carrito de Compras**: Gestión de productos en carrito
- **Favoritos**: Lista de productos favoritos
- **Perfil de Usuario**: Gestión de información personal
- **Búsqueda Avanzada**: Filtros por marca, categoría, precio
- **Panel de Administración**: Gestión completa del sistema

#### Backend
- **API RESTful**: Endpoints para todas las funcionalidades
- **Autenticación JWT**: Sistema seguro de autenticación
- **Gestión de Productos**: CRUD completo de productos
- **Sistema de Categorías**: Jerarquía de categorías y subcategorías
- **Sistema de Marcas**: Gestión de marcas de vehículos
- **Promociones**: Sistema de descuentos y ofertas
- **Analytics**: Seguimiento de métricas y Google Analytics
- **Sistema de Lealtad**: Puntos y recompensas
- **Códigos de Registro**: Sistema de invitaciones

### Estado Actual del Desarrollo

El proyecto está en desarrollo activo con las siguientes características implementadas:

1. **Sistema de Autenticación**: Completo con JWT y verificación de email
2. **Gestión de Productos**: CRUD completo con imágenes y metadatos
3. **Sistema de Categorías**: Jerarquía completa implementada
4. **Panel de Administración**: Dashboard con todas las funcionalidades
5. **Sistema de Búsqueda**: Búsqueda avanzada con filtros
6. **Carrito y Favoritos**: Funcionalidades básicas implementadas
7. **Sistema de Promociones**: Gestión de descuentos y ofertas
8. **Analytics**: Integración con Google Analytics
9. **Sistema de Lealtad**: Puntos y recompensas
10. **Códigos de Registro**: Sistema de invitaciones

### Archivos de Configuración Importantes

- `package.json`: Dependencias y scripts del frontend
- `backend/package.json`: Dependencias y scripts del backend
- `vite.config.ts`: Configuración de Vite
- `tailwind.config.js`: Configuración de Tailwind CSS
- `tsconfig.json`: Configuración de TypeScript
- `.gitignore`: Archivos excluidos del control de versiones

### Scripts de Desarrollo

- `npm run dev`: Ejecuta frontend y backend simultáneamente
- `npm run dev:frontend`: Solo frontend en puerto 3000
- `npm run dev:backend`: Solo backend
- `npm run build`: Construye frontend y backend
- `npm run install:all`: Instala dependencias de frontend y backend

### Base de Datos

El proyecto utiliza MongoDB con las siguientes colecciones principales:
- Users: Información de usuarios
- Products: Catálogo de productos
- Categories: Categorías de productos
- Subcategories: Subcategorías
- Brands: Marcas de vehículos
- Promotions: Promociones y descuentos
- Reviews: Reseñas de productos
- Orders: Pedidos (en desarrollo)
- Analytics: Métricas y estadísticas

### Configuración de Entorno

El proyecto requiere las siguientes variables de entorno:
- `MONGODB_URI`: Conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `GOOGLE_CLIENT_ID`: ID de cliente de Google OAuth
- `GOOGLE_CLIENT_SECRET`: Secreto de cliente de Google OAuth
- `EMAIL_SERVICE`: Configuración de email
- `FRONTEND_URL`: URL del frontend

---

## Recapitulemos: Estado de Desarrollo Actual

El proyecto es un ecommerce completo de repuestos de vehículos con frontend en React/TypeScript y backend en Node.js/Express. Tiene implementado un sistema robusto de autenticación, gestión de productos, categorías, panel de administración, sistema de búsqueda, carrito de compras, favoritos, promociones, analytics y sistema de lealtad. La aplicación está estructurada de manera modular y escalable, con separación clara entre frontend y backend. El sistema de autenticación incluye JWT, verificación de email y integración con Google OAuth. El panel de administración permite la gestión completa del catálogo, usuarios, promociones y métricas del sistema. 