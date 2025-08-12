# 🗄️ Configuración de MongoDB Atlas

## 📋 Pasos para Configurar MongoDB Atlas

### 1. Crear Cuenta en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Haz clic en "Try Free" o "Sign Up"
3. Completa el registro con tu email y contraseña

### 2. Crear un Cluster
1. **Selecciona el plan gratuito**:
   - Haz clic en "Build a Database"
   - Selecciona "FREE" (M0)
   - Haz clic en "Create"

2. **Configurar el cluster**:
   - **Cloud Provider**: AWS (gratuito)
   - **Region**: Elige la más cercana a tu ubicación
   - **Cluster Name**: `repuestos-pro-cluster` (o el nombre que prefieras)
   - Haz clic en "Create Cluster"

### 3. Configurar Seguridad de Red
1. En el menú lateral, ve a "Network Access"
2. Haz clic en "Add IP Address"
3. Para desarrollo, selecciona "Allow Access from Anywhere" (0.0.0.0/0)
4. Haz clic en "Confirm"

### 4. Crear Usuario de Base de Datos
1. En el menú lateral, ve a "Database Access"
2. Haz clic en "Add New Database User"
3. **Username**: `repuestos-admin` (o el que prefieras)
4. **Password**: Genera una contraseña segura
5. **Database User Privileges**: "Read and write to any database"
6. Haz clic en "Add User"

### 5. Obtener Connection String
1. En el menú lateral, ve a "Database"
2. Haz clic en "Connect"
3. Selecciona "Connect your application"
4. **Driver**: Node.js
5. **Version**: 5.0 or later
6. Copia el connection string

### 6. Configurar Variables de Entorno
1. Ve al directorio `backend`:
   ```bash
   cd backend
   ```

2. Edita el archivo `.env`:
   ```env
   # Configuración del servidor
   PORT=5000
   NODE_ENV=development

   # MongoDB Atlas - Reemplaza con tu connection string
   MONGODB_URI=mongodb+srv://repuestos-admin:tu-password@cluster0.xxxxx.mongodb.net/repuestos-pro?retryWrites=true&w=majority

   # JWT
   JWT_SECRET=tu-super-secret-jwt-key-aqui
   JWT_EXPIRES_IN=7d

   # Configuración de rate limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Configuración de CORS
   CORS_ORIGIN=http://localhost:3000

   # Configuración de seguridad
   BCRYPT_ROUNDS=12
   ```

### 7. Probar la Conexión
1. Inicia el backend:
   ```bash
   npm run dev:backend
   ```

2. Verifica el estado de la BD:
   ```bash
   curl http://localhost:5000/api/db-status
   ```

3. O visita en el navegador:
   ```
   http://localhost:5000/api/db-status
   ```

## 🔧 Estructura de la Base de Datos

### Collections que se crearán automáticamente:
- **products**: Productos del ecommerce
- **users**: Usuarios del sistema
- **orders**: Pedidos (cuando se implemente)

### Índices Optimizados:
```javascript
// Products
{ name: 'text', description: 'text' }
{ category: 1 }
{ brand: 1 }
{ price: 1 }
{ rating: -1 }
{ isOnSale: 1 }
{ isNew: 1 }

// Users
{ email: 1 }
{ role: 1 }
{ isActive: 1 }
```

## 🚨 Solución de Problemas

### Error: "MongoServerError: Authentication failed"
- Verifica que el username y password sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "MongoServerError: Server selection timed out"
- Verifica que la IP esté en la lista blanca de Network Access
- Asegúrate de que el cluster esté activo

### Error: "MongoServerError: Invalid connection string"
- Verifica que el connection string esté completo
- Asegúrate de que no haya espacios extra

### Error: "MongoServerError: Database name contains invalid characters"
- El nombre de la base de datos debe ser: `repuestos-pro`
- No uses caracteres especiales

## 📊 Monitoreo

### Verificar Estado de la BD:
```bash
curl http://localhost:5000/api/db-status
```

### Respuesta esperada:
```json
{
  "success": true,
  "connected": true,
  "state": "connected"
}
```

## 🔒 Seguridad

### Recomendaciones:
1. **Nunca** subas el archivo `.env` a Git
2. Usa contraseñas fuertes para el usuario de BD
3. En producción, restringe las IPs en Network Access
4. Rota las claves JWT regularmente

### Variables de Entorno de Producción:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/repuestos-pro
JWT_SECRET=super-secret-key-very-long-and-random
CORS_ORIGIN=https://tu-dominio.com
```

## 🎯 Próximos Pasos

1. ✅ Configurar MongoDB Atlas
2. ✅ Probar conexión
3. 🔄 Implementar carrito de compras
4. 🔄 Agregar autenticación frontend
5. 🔄 Implementar checkout

---

¡Con esto tendrás tu base de datos funcionando! 🚀 