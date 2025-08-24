# Configuración de Cloudinary para PiezasYA

## 🚀 Configuración Inicial

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com)
2. Regístrate para una cuenta gratuita
3. Obtén tus credenciales del Dashboard

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env` en el backend:

```env
# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME=dsfk4ggr5
CLOUDINARY_API_KEY=482663336593621
CLOUDINARY_API_SECRET=7ckTZt6eOVn8nzX4enu2WwAmHkM
```

### 3. Obtener Credenciales

1. Ve al Dashboard de Cloudinary
2. En la sección "Account Details" encontrarás:
   - **Cloud Name**: Tu nombre de nube
   - **API Key**: Tu clave de API
   - **API Secret**: Tu secreto de API

## 📁 Estructura de Carpetas en Cloudinary

El sistema está configurado para organizar las imágenes en las siguientes carpetas:

- `piezasya/products/` - Imágenes de productos
- `piezasya/profiles/` - Avatares de perfil
- `piezasya/rewards/` - Imágenes de premios de fidelización
- `piezasya/advertisements/` - Imágenes de anuncios

## 🔧 Características Implementadas

### Optimización Automática
- **Redimensionamiento**: Las imágenes se redimensionan automáticamente
- **Compresión**: Optimización automática de calidad
- **Formato**: Conversión automática a WebP cuando es posible

### Configuraciones por Tipo

#### Productos
- Máximo: 800x600px
- Formato: JPG, PNG, GIF, WebP
- Tamaño máximo: 10MB

#### Perfiles
- Máximo: 300x300px
- Recorte: Fill con detección de rostro
- Tamaño máximo: 5MB

#### Premios
- Máximo: 400x300px
- Tamaño máximo: 5MB

#### Anuncios
- Máximo: 1200x600px
- Tamaño máximo: 10MB

## 📤 Uso en el Frontend

### Subir Imágenes Base64

```typescript
// Ejemplo de subida de imagen
const handleImageUpload = async (base64Image: string) => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Producto',
        description: 'Descripción',
        price: 100,
        category: 'Motor',
        sku: 'SKU-001',
        images: [base64Image] // Array de imágenes base64
      })
    });
    
    const result = await response.json();
    console.log('Producto creado:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Convertir Archivo a Base64

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

## 🔒 Seguridad

### Validaciones Implementadas
- Verificación de tipos de archivo
- Límites de tamaño
- Validación de formato base64
- Sanitización de nombres de archivo

### Permisos
- Solo usuarios autenticados pueden subir imágenes
- Los gestores de tienda solo pueden subir para sus tiendas
- Los administradores pueden subir para cualquier tienda

## 📊 Plan Gratuito de Cloudinary

### Límites
- **Almacenamiento**: 25 GB
- **Ancho de banda**: 25 GB/mes
- **Transformaciones**: 25,000/mes
- **Subidas**: 25,000/mes

### Recomendaciones
- Comprimir imágenes antes de subir
- Usar formatos optimizados (WebP)
- Implementar lazy loading en el frontend
- Considerar CDN para producción

## 🛠️ Comandos Útiles

### Instalar Dependencias
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### Verificar Configuración
```bash
# Verificar que las variables de entorno estén configuradas
node -e "console.log('Cloudinary config:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'FALTA')"
```

## 🔍 Troubleshooting

### Error: "Invalid API Key"
- Verifica que las credenciales estén correctas
- Asegúrate de que la cuenta esté activa

### Error: "File too large"
- Reduce el tamaño de la imagen
- Comprime antes de subir

### Error: "Invalid file type"
- Verifica que el archivo sea una imagen válida
- Asegúrate de que el formato esté soportado

## 📈 Monitoreo

### Dashboard de Cloudinary
- Ve al Dashboard para monitorear uso
- Revisa estadísticas de almacenamiento
- Monitorea ancho de banda consumido

### Logs del Servidor
- Los errores se registran en la consola
- Revisa los logs para debugging
