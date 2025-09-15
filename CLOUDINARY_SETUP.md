# Configuración de Cloudinary para Fotos de Perfil

## ✅ Cambios Implementados

He modificado el sistema de subida de fotos de perfil para usar **Cloudinary** en lugar del almacenamiento local. Esto proporcionará:

- ✅ **Mejor rendimiento**: CDN global de Cloudinary
- ✅ **Optimización automática**: Transformaciones automáticas de imágenes
- ✅ **Escalabilidad**: Sin límites de almacenamiento local
- ✅ **Seguridad**: URLs seguras y control de acceso

## 🔧 Configuración Requerida

### 1. **Crear cuenta en Cloudinary**
1. Ve a [cloudinary.com](https://cloudinary.com)
2. Regístrate para una cuenta gratuita
3. Obtén tus credenciales del Dashboard

### 2. **Configurar Variables de Entorno**

Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Otras configuraciones existentes...
MONGODB_URI=mongodb://localhost:27017/repuestospro
JWT_SECRET=tu_jwt_secret
PORT=5000
```

### 3. **Obtener Credenciales de Cloudinary**

En tu Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Identificador único de tu cuenta
- **API Key**: Clave pública para autenticación
- **API Secret**: Clave privada para autenticación

## 🚀 Funcionalidades Implementadas

### **Subida de Avatar**
- ✅ Subida directa a Cloudinary
- ✅ Transformación automática: 300x300px con crop facial
- ✅ Optimización automática de calidad y formato
- ✅ Eliminación automática del avatar anterior

### **Eliminación de Avatar**
- ✅ Eliminación del archivo en Cloudinary
- ✅ Restablecimiento al avatar por defecto
- ✅ Manejo de errores robusto

### **Visualización**
- ✅ Soporte para URLs de Cloudinary en componentes
- ✅ Fallback automático a avatar por defecto
- ✅ Cache inteligente para mejor rendimiento

## 📁 Estructura de Carpetas en Cloudinary

```
piezasya/
├── profiles/          # Avatares de perfil
├── products/          # Imágenes de productos
├── rewards/           # Imágenes de premios
└── advertisements/    # Imágenes de anuncios
```

## 🔄 Migración de Datos Existentes

Si ya tienes avatares subidos localmente, estos seguirán funcionando hasta que se actualicen. Los nuevos avatares se subirán directamente a Cloudinary.

## 🧪 Pruebas

Para probar la funcionalidad:

1. **Inicia el backend** con las variables de entorno configuradas
2. **Ve a la sección de perfil** en cualquier rol
3. **Sube una nueva foto de perfil**
4. **Verifica que se muestre correctamente**
5. **Prueba eliminar la foto** y verificar que vuelva al avatar por defecto

## ⚠️ Notas Importantes

- **Cuenta gratuita de Cloudinary**: Incluye 25 GB de almacenamiento y 25 GB de ancho de banda mensual
- **Transformaciones**: Las imágenes se optimizan automáticamente para mejor rendimiento
- **Seguridad**: Las URLs de Cloudinary son seguras y no requieren autenticación adicional
- **Backup**: Cloudinary mantiene copias de seguridad automáticas

## 🐛 Solución de Problemas

### **Error: "Cloudinary config not found"**
- Verifica que las variables de entorno estén configuradas correctamente
- Reinicia el servidor después de cambiar las variables

### **Error: "Upload failed"**
- Verifica que las credenciales de Cloudinary sean correctas
- Revisa los logs del servidor para más detalles

### **Imagen no se muestra**
- Verifica que la URL de Cloudinary sea accesible
- Revisa la consola del navegador para errores de carga

## 📈 Beneficios de Cloudinary

1. **Rendimiento**: CDN global con más de 200 ubicaciones
2. **Optimización**: Compresión automática y formatos modernos (WebP)
3. **Transformaciones**: Redimensionado, recorte y filtros automáticos
4. **Escalabilidad**: Sin límites de almacenamiento local
5. **Seguridad**: URLs seguras y control de acceso
6. **Analytics**: Estadísticas de uso y rendimiento
