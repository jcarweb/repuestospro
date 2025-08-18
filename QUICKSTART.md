# 🚀 Guía Rápida - PiezasYA

## ✅ Problema Solucionado

El error `crypto.getRandomValues is not a function` se solucionó cambiando a Node.js 18:

```bash
nvm use 18.20.2
```

## 🏃‍♂️ Inicio Rápido

### 1. Configurar Node.js
```bash
# Asegúrate de usar Node.js 18+
nvm use 18.20.2
node --version  # Debe mostrar v18.x.x
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno
```bash
# En el directorio backend
cp env.example .env
# Editar .env con tus credenciales de MongoDB Atlas
```

### 4. Ejecutar el proyecto
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado:
npm run dev:frontend  # Frontend en http://localhost:3000
npm run dev:backend   # Backend en http://localhost:5000
```

## 🌐 URLs del Proyecto

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **DB Status**: http://localhost:5000/api/db-status

## 🔧 Configuración de MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cluster (M0 gratuito)
3. Configurar Network Access (0.0.0.0/0)
4. Crear usuario de BD
5. Obtener connection string
6. Actualizar `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/repuestos-pro
JWT_SECRET=tu-super-secret-jwt-key
```

## 📱 Funcionalidades Disponibles

### Frontend
- ✅ Página principal con hero section
- ✅ Navegación responsive
- ✅ Catálogo de productos
- ✅ Búsqueda de productos
- ✅ Diseño moderno con Tailwind CSS

### Backend
- ✅ API REST con programación reactiva
- ✅ Autenticación JWT
- ✅ MongoDB Atlas
- ✅ Rate limiting y seguridad
- ✅ Logs estructurados

## 🐛 Solución de Problemas

### Error: crypto.getRandomValues
```bash
# Solución: Usar Node.js 18+
nvm use 18.20.2
```

### Error: Puerto ocupado
```bash
# Cambiar puerto en vite.config.ts
server: {
  port: 3001  # Cambiar a puerto libre
}
```

### Error: MongoDB connection
```bash
# Verificar variables de entorno
cat backend/.env
# Asegurarse de que MONGODB_URI esté configurado
```

## 📊 Estructura del Proyecto

```
repuestos-ecommerce/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── backend/           # Express + RxJS + MongoDB
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   └── ...
│   └── package.json
└── package.json       # Scripts principales
```

## 🎯 Próximos Pasos

1. **Configurar MongoDB Atlas**
2. **Probar endpoints de la API**
3. **Implementar carrito de compras**
4. **Agregar autenticación frontend**
5. **Implementar checkout**

---

¡El proyecto está listo para desarrollo! 🚀 