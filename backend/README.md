# Backend Reactivo - PiezasYA

Backend para el ecommerce de repuestos de vehículos construido con **programación reactiva** usando Express.js, RxJS y MongoDB Atlas.

## 🚀 Características

- **Programación Reactiva**: Uso extensivo de RxJS para manejo de eventos y operaciones asíncronas
- **MongoDB Atlas**: Base de datos en la nube con alta disponibilidad
- **TypeScript**: Código tipado para mayor seguridad y mantenibilidad
- **JWT Authentication**: Sistema de autenticación seguro
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Middleware de seguridad para Express
- **CORS**: Configuración para comunicación con frontend
- **Mongoose**: ODM para MongoDB con programación reactiva

## 🛠️ Tecnologías Utilizadas

- **Express.js** - Framework web
- **RxJS** - Programación reactiva
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **TypeScript** - Tipado estático
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas
- **Helmet** - Seguridad
- **Morgan** - Logging
- **CORS** - Cross-origin resource sharing

## 📦 Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/repuestos-pro
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Build para producción**
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Arquitectura Reactiva

### Patrones de Programación Reactiva

1. **Observables para Base de Datos**
   ```typescript
   // Conexión reactiva a MongoDB
   dbService.connect().subscribe({
     next: (connected) => console.log('Conectado:', connected),
     error: (error) => console.error('Error:', error)
   });
   ```

2. **Operaciones CRUD Reactivas**
   ```typescript
   // Buscar productos reactivo
   Product.findProductsReactive(filter).subscribe({
     next: (products) => res.json(products),
     error: (error) => res.status(500).json(error)
   });
   ```

3. **Eventos del Servidor**
   ```typescript
   // Observable para eventos del servidor
   const serverEvents$ = fromEvent(server, 'listening');
   serverEvents$.subscribe(event => console.log('Server event:', event));
   ```

## 📊 Estructura del Proyecto

```
src/
├── config/
│   └── database.ts          # Configuración reactiva de MongoDB
├── controllers/
│   └── productController.ts # Controladores con RxJS
├── middleware/
│   └── authMiddleware.ts    # Middleware de autenticación
├── models/
│   ├── Product.ts          # Modelo de producto reactivo
│   └── User.ts             # Modelo de usuario reactivo
├── routes/
│   └── productRoutes.ts    # Rutas de productos
├── services/               # Servicios de negocio
├── utils/                  # Utilidades
└── index.ts               # Servidor principal
```

## 🔌 API Endpoints

### Productos (Públicos)
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/search?q=term` - Buscar productos
- `GET /api/products/category/:category` - Productos por categoría
- `GET /api/products/sale` - Productos en oferta
- `GET /api/products/new` - Productos nuevos
- `GET /api/products/:id` - Obtener producto por ID

### Productos (Admin)
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `PATCH /api/products/:id/stock` - Actualizar stock

### Sistema
- `GET /health` - Estado del servidor
- `GET /api/db-status` - Estado de la base de datos

## 🔐 Autenticación

### Headers requeridos para rutas protegidas:
```
Authorization: Bearer <jwt-token>
```

### Roles de Usuario:
- **user**: Acceso básico
- **admin**: Acceso completo (CRUD productos)

## 🗄️ Base de Datos

### MongoDB Atlas
- **Cluster**: M0 (Gratuito) o superior
- **Database**: repuestos-pro
- **Collections**: products, users, orders

### Índices Optimizados
```javascript
// Productos
{ name: 'text', description: 'text' }
{ category: 1 }
{ brand: 1 }
{ price: 1 }
{ rating: -1 }
{ isOnSale: 1 }
{ isNew: 1 }

// Usuarios
{ email: 1 }
{ role: 1 }
{ isActive: 1 }
```

## 🔧 Configuración de MongoDB Atlas

1. **Crear cluster en MongoDB Atlas**
2. **Configurar Network Access** (IP 0.0.0.0/0 para desarrollo)
3. **Crear usuario de base de datos**
4. **Obtener connection string**
5. **Configurar en .env**

## 🚀 Despliegue

### Heroku
```bash
# Configurar variables de entorno
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set NODE_ENV=production

# Desplegar
git push heroku main
```

### Vercel
```bash
# Configurar variables de entorno en dashboard
# Desplegar automáticamente desde GitHub
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Monitoreo y Logs

### Logs Estructurados
```typescript
// Logs con información contextual
console.log(`✅ Producto creado: ${product.name} (ID: ${product._id})`);
console.log(`🔍 Búsqueda: "${query}" - ${results.length} resultados`);
```

### Métricas de Rendimiento
- Tiempo de respuesta de API
- Conexiones activas a MongoDB
- Uso de memoria y CPU
- Rate limiting hits

## 🔒 Seguridad

### Implementado:
- ✅ Helmet (headers de seguridad)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ JWT authentication
- ✅ bcrypt para passwords
- ✅ Validación de entrada
- ✅ Sanitización de datos

### Recomendaciones:
- 🔒 HTTPS en producción
- 🔒 Variables de entorno seguras
- 🔒 Logs de auditoría
- 🔒 Backup automático de BD

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests de integración
npm run test:integration
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Build de producción
npm run start        # Iniciar servidor
npm run lint         # Linting
npm run lint:fix     # Linting con auto-fix
npm test             # Tests unitarios
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

- **Email**: backend@PiezasYA.com
- **Documentación**: `/docs`
- **Issues**: GitHub Issues

---

Desarrollado con ❤️ usando programación reactiva 