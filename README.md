# PiezasYA - Ecommerce Multiplataforma

Un ecommerce completo para repuestos de vehículos (autos, motos y camiones) construido con **React** y **programación reactiva** en el backend.

## 🚀 Características Principales

### Frontend (React + TypeScript)
- ✅ **Diseño Responsivo**: Optimizado para desktop, tablet y móvil
- ✅ **Interfaz Moderna**: UI/UX intuitiva con Tailwind CSS
- ✅ **TypeScript**: Código tipado para mayor seguridad
- ✅ **React Router**: Navegación SPA
- ✅ **Componentes Reutilizables**: Arquitectura modular
- ✅ **Iconos Lucide**: Iconografía moderna y consistente

### Backend (Express + RxJS + MongoDB Atlas)
- ✅ **Programación Reactiva**: Uso extensivo de RxJS
- ✅ **MongoDB Atlas**: Base de datos en la nube
- ✅ **JWT Authentication**: Sistema de autenticación seguro
- ✅ **Rate Limiting**: Protección contra ataques
- ✅ **Helmet**: Middleware de seguridad
- ✅ **TypeScript**: Código tipado en backend

## 🏗️ Arquitectura del Proyecto

```
repuestos-ecommerce/
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── types/           # Definiciones TypeScript
│   │   ├── data/            # Datos de ejemplo
│   │   └── utils/           # Utilidades
│   └── package.json
├── backend/                  # Express + RxJS + MongoDB
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── controllers/     # Controladores reactivos
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de API
│   │   ├── middleware/      # Middleware de auth
│   │   └── services/        # Servicios de negocio
│   └── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Iconos

### Backend
- **Express.js** - Framework web
- **RxJS** - Programación reactiva
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas
- **Helmet** - Seguridad
- **Morgan** - Logging

## 📦 Instalación y Configuración

### 🚀 Inicio Rápido (Recomendado)

#### Windows:
```bash
# Doble clic en start.bat
# O desde la línea de comandos:
start.bat
```

#### Linux/Mac:
```bash
# Dar permisos de ejecución
chmod +x start.sh

# Ejecutar
./start.sh
```

### 🔧 Instalación Manual

#### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd repuestos-ecommerce
```

#### 2. Configurar Node.js
```bash
# Asegúrate de usar Node.js 18+
nvm use 18.20.2
node --version  # Debe mostrar v18.x.x
```

#### 3. Instalar dependencias
```bash
npm run install:all
```

#### 4. Configurar MongoDB Atlas
```bash
# Sigue las instrucciones en MONGODB_SETUP.md
# O ejecuta:
cd backend
cp env.example .env
# Editar .env con tus credenciales
```

#### 5. Ejecutar el proyecto
```bash
# Ejecutar ambos servidores
npm run dev

# O por separado:
npm run dev:frontend  # Frontend en http://localhost:3000
npm run dev:backend   # Backend en http://localhost:5000
```

### 4. Configurar MongoDB Atlas
1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cluster (M0 gratuito)
3. Configurar Network Access (0.0.0.0/0 para desarrollo)
4. Crear usuario de base de datos
5. Obtener connection string
6. Configurar en `backend/.env`

## 🚀 Scripts de Desarrollo

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting
```

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Build de producción
npm run start        # Iniciar servidor
npm run lint         # Linting
```

## 🔌 API Endpoints

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/search?q=term` - Buscar productos
- `GET /api/products/category/:category` - Productos por categoría
- `GET /api/products/sale` - Productos en oferta
- `GET /api/products/new` - Productos nuevos
- `GET /api/products/:id` - Obtener producto por ID

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil

### Sistema
- `GET /health` - Estado del servidor
- `GET /api/db-status` - Estado de la base de datos

## 📱 Funcionalidades Implementadas

### ✅ Completadas
- [x] Página principal con hero section
- [x] Navegación responsive
- [x] Catálogo de productos por categorías
- [x] Tarjetas de productos con información detallada
- [x] Sistema de búsqueda (UI)
- [x] Carrito de compras (UI)
- [x] Footer con información de contacto
- [x] Diseño responsive completo
- [x] Backend con programación reactiva
- [x] API REST con MongoDB Atlas
- [x] Autenticación JWT
- [x] Middleware de seguridad

### 🚧 En Desarrollo
- [ ] Página de detalle de producto
- [ ] Página de categorías
- [ ] Carrito de compras funcional
- [ ] Sistema de autenticación frontend
- [ ] Checkout y pagos
- [ ] Panel de administración
- [ ] Filtros avanzados
- [ ] Wishlist
- [ ] Reviews y ratings
- [ ] Notificaciones en tiempo real

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary**: Azul (#3B82F6)
- **Secondary**: Gris (#64748B)
- **Success**: Verde (#10B981)
- **Warning**: Amarillo (#F59E0B)
- **Error**: Rojo (#EF4444)

### Componentes Principales
- **Header**: Navegación, búsqueda, carrito
- **ProductCard**: Tarjeta de producto con información
- **Footer**: Enlaces útiles y contacto
- **Hero Section**: Banner principal con CTA

## 🔐 Seguridad

### Frontend
- ✅ Validación de formularios
- ✅ Sanitización de datos
- ✅ HTTPS en producción
- ✅ CORS configurado

### Backend
- ✅ Helmet (headers de seguridad)
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ bcrypt para passwords
- ✅ Validación de entrada
- ✅ Sanitización de datos

## 📊 Base de Datos

### MongoDB Atlas
- **Cluster**: M0 (Gratuito) o superior
- **Database**: repuestos-pro
- **Collections**: products, users, orders

### Modelos Principales
```typescript
// Producto
interface Product {
  name: string;
  description: string;
  price: number;
  category: 'car' | 'motorcycle' | 'truck';
  brand: string;
  stock: number;
  rating: number;
  // ... más campos
}

// Usuario
interface User {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  // ... más campos
}
```

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
# Vercel
vercel --prod

# Netlify
npm run build
netlify deploy --prod --dir=dist
```

### Backend (Heroku/Vercel)
```bash
# Heroku
heroku create repuestos-backend
git push heroku main

# Vercel
vercel --prod
```

## 📈 Monitoreo y Analytics

### Métricas de Rendimiento
- Tiempo de carga de páginas
- Tiempo de respuesta de API
- Uso de memoria y CPU
- Rate limiting hits

### Logs Estructurados
```typescript
// Frontend
console.log('Producto agregado al carrito:', product.name);

// Backend
console.log('✅ Producto creado:', product.name, '(ID:', product._id, ')');
```

## 🧪 Testing

### Frontend
```bash
npm test              # Tests unitarios
npm run test:coverage # Tests con coverage
```

### Backend
```bash
npm test              # Tests unitarios
npm run test:integration # Tests de integración
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Contacto

- **Email**: jcarweb.designer@gmail.com
- **Teléfono**: +58 (412) 012-3044
- **Dirección**: Caracas - Venezuela

## 🙏 Agradecimientos

- **React Team** - Por el increíble framework
- **Tailwind CSS** - Por el sistema de diseño
- **MongoDB Atlas** - Por la base de datos en la nube
- **RxJS Team** - Por la programación reactiva

---

Desarrollado con ❤️ para la comunidad automotriz

**PiezasYA** - Tu tienda de confianza para repuestos de vehículos
