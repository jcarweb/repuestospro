#!/usr/bin/env node

/**
 * Script de Limpieza de Seguridad
 * Elimina archivos que contienen información sensible del proyecto
 */

const fs = require('fs');
const path = require('path');

// Archivos que contienen información sensible y deben ser eliminados
const sensitiveFiles = [
  // Archivos con credenciales hardcodeadas
  'mobile/CONFIGURAR_GOOGLE_OAUTH.md',
  'mobile/GOOGLE_OAUTH_SETUP.md',
  'mobile/OBTENER_SHA1.md',
  'mobile/README-SOLUCION.md',
  'mobile/README.md',
  
  // Archivos de configuración con secretos
  'CLOUDINARY_SETUP.md',
  'MIGRACION_CLOUDINARY_PERFIL.md',
  'SOLUCION_CONECTIVIDAD_COMPLETA.md',
  'SISTEMA_ENRIQUECIMIENTO_CRYPTO.md',
  'RESUMEN_IMPLEMENTACION_CDN_CLOUDINARY.md',
  
  // Archivos con tokens y secretos
  'docs/NOTIFICACIONES_PUSH.md',
  'docs/RESUMEN_CONFIGURACION_COMPLETADA.md',
  'FLUJO_VALIDACION_GOOGLE_AUTHENTICATOR.md',
  'FUNCIONALIDADES_SEGURIDAD.md',
  
  // Archivos de setup con credenciales
  'MONGODB_SETUP.md',
  'GOOGLE_MAPS_SETUP.md',
  'GEOLOCATION_IMPLEMENTATION.md',
  'QUICKSTART.md',
  'PROYECTO_COMPLETADO.md',
  
  // Archivos de desarrollo con información sensible
  'DESARROLLO_APP_MOVIL.md',
  'FLUJO_AUTENTICACION_MOVIL.md',
  'DASHBOARD_DELIVERY_COMPLETADO.md',
  'SISTEMA_DELIVERY_COMPLETO.md',
  'MODULO_RESENAS_IMPLEMENTADO.md',
  'DATOS_PRUEBA_GESTOR_TIENDA.md',
  'RESUMEN_SISTEMA_REPORTES_VENTAS.md',
  'FLUJO_COMPLETO_MONETIZACION.md',
  'IMPLEMENTACION_PAPELERA_PRODUCTOS.md',
  'RESUMEN_MODULO_PRODUCTOS_GESTOR_TIENDA.md',
  'MODULO_MONETIZACION.md',
  'RESUMEN_FIDELIZACION.md',
  'RESUMEN_IMPLEMENTACION_USUARIO.md',
  'FUNCIONALIDADES_USUARIO_IMPLEMENTADAS.md',
  'SISTEMA_FIDELIZACION.md',
  'SISTEMA_DELIVERY_COMPLETO.md',
  'SISTEMA_ORDENES_VENTAS_COMPRAS.md',
  'SISTEMA_PROMOCIONES.md',
  'SISTEMA_SUBCATEGORIAS.md',
  'SISTEMA_CATEGORIAS.md',
  'SISTEMA_CLIENTE_COMPLETO.md',
  'SISTEMA_IDIOMAS_IMPLEMENTADO.md',
  'SISTEMA_INACTIVIDAD_Y_VERIFICACION_EMAIL.md',
  'SISTEMA_MONETIZACION_PROMOCIONES.md',
  'SISTEMA_NOTIFICACIONES_CLIENTE_COMPLETO.md',
  'SISTEMA_ROLES_ACTUALIZADO.md',
  'ROLE_BASED_NAVIGATION_SYSTEM.md',
  'RUTAS_CLIENTE_ACCESO.md',
  'SOLUCION_CONECTIVIDAD_COMPLETA.md',
  'SOLUCION_IDS_PRODUCTOS.md',
  'LIMPIEZA_PROYECTO_COMPLETADA.md',
  'GESTION_USUARIOS_IMPLEMENTADA.md',
  'DIVISIONES_ADMINISTRATIVAS_VENEZUELA.md',
  'ESTANDARES_DESARROLLO_CLIENTE.md',
  'FLUJO_AUTENTICACION_MOVIL.md',
  'FUNCIONALIDAD_DESCARGA_FACTURAS.md',
  'FUNCIONALIDADES_SEGURIDAD.md',
  'FUNCIONALIDADES_USUARIO_IMPLEMENTADAS.md',
  'GEOLOCATION_IMPLEMENTATION.md',
  'GESTION_PRODUCTOS_IMPLEMENTADA.md',
  'GESTION_USUARIOS_IMPLEMENTADA.md',
  'GOOGLE_MAPS_SETUP.md',
  'IMPLEMENTACION_BUSQUEDA_AVANZADA.md',
  'IMPLEMENTACION_PAPELERA_PRODUCTOS.md',
  'LIMPIEZA_PROYECTO_COMPLETADA.md',
  'MAPAS_GRATUITOS_VENEZUELA.md',
  'MARCAS_VEHICULOS_VENEZUELA.md',
  'MEJORAS_HEADER_CLIENTE.md',
  'MEJORAS_SECCION_CARRITO.md',
  'MEJORAS_SECCION_FAVORITOS.md',
  'MEJORAS_SIDEBAR_CLIENTE.md',
  'MEJORAS_UBICACION_SUCURSALES.md',
  'MEJORES_PRACTICAS_TEMA_TRADUCCIONES.md',
  'MIGRACION_CLOUDINARY_PERFIL.md',
  'MODULO_MONETIZACION.md',
  'MODULO_RESENAS_IMPLEMENTADO.md',
  'MONGODB_SETUP.md',
  'NUEVA_PAGINA_HOME_ECOMMERCE.md',
  'PAGINA_DETALLE_PRODUCTO.md',
  'PERMISOS_CREACION_PRODUCTOS_INVENTARIO_GLOBAL.md',
  'PROYECTO_COMPLETADO.md',
  'QUICKSTART.md',
  'README_FINAL.md',
  'RESUMEN_FIDELIZACION.md',
  'RESUMEN_GESTION_SUCURSALES.md',
  'RESUMEN_IMPLEMENTACION_CDN_CLOUDINARY.md',
  'RESUMEN_IMPLEMENTACION_LAYOUT_LIMPIO.md',
  'RESUMEN_IMPLEMENTACION_TEMA_TRADUCCIONES.md',
  'RESUMEN_IMPLEMENTACION_USUARIO.md',
  'RESUMEN_INTERNACIONALIZACION.md',
  'RESUMEN_MODULO_PRODUCTOS_GESTOR_TIENDA.md',
  'RESUMEN_SEGURIDAD.md',
  'RESUMEN_SISTEMA_REPORTES_ADMIN.md',
  'RESUMEN_SISTEMA_REPORTES_VENTAS.md',
  'TARIFARIO_PLANES_PUBLICIDAD.md'
];

// Archivos de documentación que deben ser conservados (sin información sensible)
const keepFiles = [
  'README.md',
  'DEPLOYMENT_GUIDE.md',
  'docs/CONTEXTO_PROYECTO.md',
  'docs/SISTEMA_INTERNACIONALIZACION.md',
  'docs/TAREAS_INMEDIATAS_ANTI_FUGA.md'
];

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Eliminado: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No encontrado: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error eliminando ${filePath}:`, error.message);
    return false;
  }
}

function cleanSensitiveFiles() {
  console.log('🧹 Iniciando limpieza de archivos con información sensible...\n');
  
  let deletedCount = 0;
  let totalCount = sensitiveFiles.length;
  
  sensitiveFiles.forEach(file => {
    if (deleteFile(file)) {
      deletedCount++;
    }
  });
  
  console.log(`\n📊 Resumen de limpieza:`);
  console.log(`   - Archivos procesados: ${totalCount}`);
  console.log(`   - Archivos eliminados: ${deletedCount}`);
  console.log(`   - Archivos no encontrados: ${totalCount - deletedCount}`);
  
  if (deletedCount > 0) {
    console.log('\n✅ Limpieza completada exitosamente');
    console.log('🔒 Los archivos con información sensible han sido eliminados');
  } else {
    console.log('\n⚠️  No se encontraron archivos para eliminar');
  }
}

function createSecurityReadme() {
  const securityReadme = `# 🔒 Política de Seguridad - PiezasYA

## Archivos Protegidos

Los siguientes tipos de archivos están protegidos por .gitignore:

- \`.env*\` - Variables de entorno
- \`*SECRET*.md\` - Documentación con secretos
- \`*CREDENTIALS*.md\` - Archivos con credenciales
- \`*PASSWORD*.md\` - Documentación con contraseñas
- \`*API_KEY*.md\` - Archivos con claves API
- \`*TOKEN*.md\` - Documentación con tokens
- \`*PRIVATE*.md\` - Archivos privados
- \`*CONFIDENTIAL*.md\` - Documentación confidencial

## Buenas Prácticas

1. **Nunca** commitees archivos .env con credenciales reales
2. **Siempre** usa el archivo .env.example como plantilla
3. **Elimina** archivos de documentación que contengan credenciales
4. **Usa** variables de entorno para todas las configuraciones sensibles
5. **Revisa** el .gitignore regularmente

## Configuración Segura

Para configurar el proyecto de forma segura:

1. Copia \`env.example\` a \`.env\`
2. Reemplaza los valores placeholder con tus credenciales reales
3. Nunca commitees el archivo .env

## Limpieza Automática

Ejecuta \`node scripts/security-cleanup.js\` para eliminar archivos con información sensible.

---
*Última actualización: ${new Date().toISOString()}*
`;

  try {
    fs.writeFileSync('SECURITY.md', securityReadme);
    console.log('✅ Creado archivo SECURITY.md con políticas de seguridad');
  } catch (error) {
    console.error('❌ Error creando SECURITY.md:', error.message);
  }
}

// Ejecutar limpieza
if (require.main === module) {
  cleanSensitiveFiles();
  createSecurityReadme();
}

module.exports = { cleanSensitiveFiles, createSecurityReadme };
