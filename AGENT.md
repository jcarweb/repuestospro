# 🤖 AGENT.md - Reglas del Proyecto PiezasYA

## 📋 Información del Proyecto

**Versión**: 1.4.0  
**Última actualización**: Octubre 2025  
**Desarrollador**: Juan Hernandez  
**Empresa**: LDJ Digital Solutions  
**Equipo de Desarrollo**: PiezasYA

## 📋 Resumen del Proyecto

**PiezasYA** es una plataforma de ecommerce especializada en repuestos de vehículos (autos, motos y camiones) que conecta clientes con tiendas especializadas. El proyecto implementa un sistema robusto de roles, autenticación multimodal y estrategias anti-fuga de ventas.

---

## 🎯 Reglas Generales del Proyecto

### 1. **Arquitectura del Sistema**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + MongoDB Atlas
- **Mobile**: React Native (sin Expo) para aplicaciones móviles
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JWT + múltiples métodos (email, Google OAuth, PIN, biométrico)

### 2. **Sistema de Roles Implementado**
El proyecto maneja **5 roles principales** con permisos específicos:

#### 🔧 **Administrador (admin)**
- Gestión completa del sistema
- Creación de usuarios (admin, delivery, gestor de tienda, vendedor)
- Configuración de productos, categorías y atributos
- Acceso a Google Analytics y reportes globales
- Gestión del sistema de lealtad y premios
- Configuración de currency, impuestos y tasas de delivery
- **Búsquedas Avanzadas**: Acceso completo a knowledge base y n8n workflows
- **Gestión de Knowledge Base**: Administración de manuales y catálogos
- **Configuración n8n**: Gestión de workflows y automatizaciones

#### 👤 **Cliente (client)**
- Exploración del catálogo completo
- Realización de compras seguras
- Sistema de puntos de lealtad
- Configuración de seguridad (2FA, PIN, huella)
- Gestión de favoritos y carrito
- Calificación de productos, delivery y tiendas

#### 🚚 **Delivery (delivery)**
- Visualización de órdenes asignadas
- Acceso al mapa con rutas de entrega
- Control de disponibilidad (automático/manual)
- Configuración de horario de trabajo
- Gestión de información del vehículo
- Estados: "No disponible", "Disponible", "Ocupado", "En Ruta", "En retorno"

#### 🏪 **Gestor de Tienda (store_manager)**
- Gestión completa del inventario
- Carga de lotes de productos y gestión individual
- Creación y gestión de promociones
- Acceso a estadísticas de Google Analytics
- Asignación y reasignación de delivery
- Mensajería privada con clientes
- **Búsquedas Avanzadas**: Acceso a knowledge base para asesoramiento técnico
- **Gestión de Vendedores**: Supervisión de asesoramiento técnico del equipo
- **Reportes Técnicos**: Análisis de consultas y respuestas técnicas

#### 💼 **Vendedor (seller)**
- Consulta de precios y disponibilidad de productos
- Chat directo con clientes para consultas
- Creación y gestión de cotizaciones personalizadas
- Acceso a productos asignados por categoría
- Gestión de clientes asignados
- Dashboard de rendimiento y métricas
- Configuración de horario de trabajo
- Permisos específicos por tienda y sucursal
- **Búsquedas Avanzadas**: Acceso a knowledge base con manuales técnicos
- **Asesoramiento Técnico**: Respuestas precisas basadas en documentación oficial
- **Identificación de Piezas**: Encuentra repuestos correctos con códigos OEM
- **Compatibilidad**: Verificación de piezas compatibles para vehículos específicos

---

## 🔒 Reglas de Seguridad y Autenticación

### 1. **Verificación de Ubicación GPS Obligatoria**
- **REQUISITO**: Todos los usuarios deben permitir acceso a GPS antes de autenticarse
- **IMPLEMENTACIÓN**: Modal de permisos obligatorio
- **VALIDACIÓN**: Sin ubicación no se permite acceso a la aplicación
- **PERSISTENCIA**: Almacenamiento local de ubicación para sesiones futuras

### 2. **Métodos de Autenticación Soportados**
- **Email y Contraseña**: Formulario tradicional con validación
- **Google OAuth**: Integración con Google OAuth 2.0
- **PIN**: PIN de 4-6 dígitos numéricos (configuración opcional)
- **Biométrico**: Soporte para WebAuthn API (huella dactilar)

### 3. **Configuración de Seguridad**
- **2FA**: Doble factor de autenticación con Google Authenticator
- **PIN**: Configuración opcional en perfil de usuario
- **Biométrico**: Compatible con dispositivos móviles Android/iOS
- **Encriptación**: Almacenamiento seguro de credenciales

---

## 🛡️ Reglas Anti-Fuga de Ventas

### 1. **Política de Comunicación Segura**
- **PROHIBIDO**: Publicar teléfonos, correos o links en descripciones de productos
- **IMPLEMENTADO**: Filtros automáticos que detectan y bloquean información de contacto externa
- **CHAT INTERNO**: Sistema de chat interno con filtros automáticos (similar a Uber/Rappi)
- **AUDITORÍA**: Registro completo de conversaciones para auditoría y seguridad

### 2. **Incentivos al Comprador**
- **GARANTÍA**: Protección de pago, devolución o reclamo únicamente si se paga dentro de la app
- **PROMOCIONES**: Cashback automático y puntos de fidelidad con mayor valor en compras internas
- **ALERTAS**: "⚠️ Si sales de la app, pierdes tu garantía de seguridad"
- **BENEFICIOS**: Ofertas especiales solo disponibles para usuarios que compran internamente

### 3. **Incentivos al Vendedor**
- **VISIBILIDAD**: Mayor visibilidad en búsquedas para tiendas que cumplen políticas
- **REPUTACIÓN**: Sistema de estrellas, calificaciones y badges especiales
- **COMISIONES**: Comisiones más bajas para tiendas con buen historial de ventas internas
- **RANKING**: Posicionamiento destacado en categorías y búsquedas populares

### 4. **Tecnología Anti-Trampa**
- **DETECCIÓN**: Chat con detección automática de patrones de fraude
- **ANÁLISIS**: Identificación de números de teléfono, palabras clave como "WhatsApp", "fuera de la app"
- **MACHINE LEARNING**: Análisis de lenguaje natural para detectar intentos de contacto externo
- **SANCIONES**: Sistema progresivo de advertencias, reducción de visibilidad y suspensiones

---

## 📦 Reglas para Gestión de Insumos y Productos

### 1. **Sistema de Inventario**
- **TIPOS**: Global, Separado, Híbrido
- **STOCK**: Cantidad principal, reservada, disponible, mínimo y máximo
- **TRAZABILIDAD**: Historial completo de movimientos de stock
- **ALERTAS**: Notificaciones automáticas de stock bajo, agotado o exceso

### 2. **Gestión de Productos**
- **CATEGORÍAS**: Autos, Motos, Camiones
- **ATRIBUTOS**: Marca, modelo, año, SKU, código original
- **VARIACIONES**: Productos simples, variables y variaciones
- **BÚSQUEDA**: Sistema semántico con corrección de errores tipográficos

### 3. **Reglas de Publicación**
- **CONTENIDO**: Descripciones detalladas sin información de contacto externa
- **IMÁGENES**: Múltiples imágenes por producto
- **PRECIOS**: Precios competitivos y transparentes
- **DISPONIBILIDAD**: Stock actualizado en tiempo real

---

## 🔍 Reglas para Consultas de Referencias

### 1. **Sistema de Búsqueda Inteligente**
- **SEMÁNTICA**: Búsqueda por significado, no solo palabras exactas
- **CORRECCIÓN**: Corrección automática de errores tipográficos
- **SINÓNIMOS**: Generación automática de sinónimos y variaciones
- **AUTOCOMPLETADO**: Sugerencias en tiempo real mientras se escribe

### 2. **Filtros y Categorización**
- **DISPONIBILIDAD**: Filtro por productos en stock
- **PRECIO**: Rango de precios configurable
- **CATEGORÍA**: Filtros por tipo de vehículo y categoría de repuesto
- **UBICACIÓN**: Filtros por proximidad geográfica

### 3. **Relevancia y Ranking**
- **SCORING**: Algoritmo de relevancia basado en múltiples factores
- **PESOS**: Campos con diferentes pesos (nombre, descripción, categoría, marca)
- **PERSONALIZACIÓN**: Resultados adaptados al historial del usuario
- **ANÁLISIS**: Análisis de intención de búsqueda

---

## 🤖 Sistema de Búsquedas Avanzadas con n8n y Knowledge Base

### 1. **Arquitectura del Sistema**
- **n8n Workflow**: Automatización de procesos de búsqueda avanzada
- **Knowledge Base**: Base de conocimiento con manuales y catálogos
- **Integración API**: Conexión entre PiezasYA y n8n
- **Procesamiento IA**: Análisis inteligente de consultas complejas

### 2. **Contenido de la Knowledge Base**
- **Manuales Técnicos**: Documentación completa de vehículos
  - Manuales de autos (todas las marcas y modelos)
  - Manuales de motos (todas las marcas y modelos)
  - Manuales de camiones (todas las marcas y modelos)
- **Catálogos de Partes**: Especificaciones técnicas detalladas
  - Códigos de piezas originales (OEM)
  - Códigos de piezas alternativas (Aftermarket)
  - Especificaciones técnicas y compatibilidad
  - Diagramas de ensamble y despiece

### 3. **Funcionalidades del Workflow n8n**
- **Procesamiento de Consultas**: Análisis automático de preguntas complejas
- **Búsqueda Semántica**: Encontrar información relevante en manuales
- **Matching de Códigos**: Identificación automática de códigos de piezas
- **Generación de Respuestas**: Respuestas contextuales y precisas
- **Aprendizaje Continuo**: Mejora automática basada en interacciones

### 4. **Tipos de Consultas Soportadas**
- **Identificación de Piezas**: "¿Qué pieza necesito para...?"
- **Compatibilidad**: "¿Esta pieza es compatible con...?"
- **Especificaciones Técnicas**: "¿Cuáles son las especificaciones de...?"
- **Códigos Alternativos**: "¿Qué código alternativo puedo usar para...?"
- **Diagramas de Ensamble**: "¿Cómo se instala esta pieza?"

### 5. **Flujo de Trabajo del Sistema**
```
1. Cliente/Vendedor hace consulta compleja
2. Sistema analiza la consulta con IA
3. n8n workflow procesa la búsqueda
4. Knowledge base retorna información relevante
5. Sistema genera respuesta contextual
6. Vendedor recibe asesoramiento preciso
7. Cliente obtiene información técnica detallada
```

### 6. **Beneficios para Vendedores**
- **Asesoramiento Técnico**: Respuestas precisas basadas en manuales oficiales
- **Identificación Rápida**: Encuentra piezas correctas sin experiencia previa
- **Códigos Precisos**: Acceso a códigos OEM y alternativos
- **Especificaciones Técnicas**: Datos exactos de compatibilidad
- **Confianza del Cliente**: Respuestas profesionales y documentadas

### 7. **Beneficios para Clientes**
- **Información Técnica**: Acceso a manuales y especificaciones
- **Códigos de Piezas**: Identificación precisa de repuestos necesarios
- **Compatibilidad**: Verificación de piezas compatibles
- **Instalación**: Guías de instalación y diagramas
- **Garantía de Precisión**: Información basada en documentación oficial

### 8. **Implementación Técnica**
- **n8n Nodes**: Configuración de workflows automatizados
- **API Integration**: Conexión con base de datos de PiezasYA
- **Vector Database**: Almacenamiento de embeddings de documentos
- **LLM Integration**: Procesamiento de lenguaje natural
- **Response Generation**: Generación automática de respuestas

### 9. **Estructura de Datos**
```typescript
interface KnowledgeBaseEntry {
  id: string;
  type: 'manual' | 'catalog' | 'specification' | 'diagram';
  vehicleType: 'car' | 'motorcycle' | 'truck';
  brand: string;
  model: string;
  year?: string;
  partCode: string;
  alternativeCodes: string[];
  specifications: Record<string, any>;
  compatibility: string[];
  installationGuide?: string;
  diagramUrl?: string;
  content: string;
  embeddings: number[];
}
```

### 10. **Configuración del Workflow n8n**
- **Trigger**: Webhook desde PiezasYA
- **Processing**: Análisis de consulta con IA
- **Search**: Búsqueda en knowledge base
- **Response**: Generación de respuesta contextual
- **Logging**: Registro de consultas y respuestas
- **Learning**: Mejora continua del sistema

### 11. **Métricas y Monitoreo**
- **Precisión**: Porcentaje de respuestas correctas
- **Tiempo de Respuesta**: Latencia del sistema
- **Satisfacción**: Rating de vendedores y clientes
- **Uso**: Frecuencia de consultas por tipo
- **Mejora**: Evolución de la precisión del sistema

### 12. **Escalabilidad y Mantenimiento**
- **Actualización Automática**: Sincronización con nuevos manuales
- **Versionado**: Control de versiones de documentación
- **Backup**: Respaldo de knowledge base
- **Performance**: Optimización de búsquedas
- **Expansión**: Adición de nuevas marcas y modelos

### 13. **Permisos de Acceso por Rol**

#### **Administrador (admin)**
- **Acceso Completo**: Todas las funcionalidades de búsquedas avanzadas
- **Gestión de Knowledge Base**: Agregar, editar y eliminar manuales
- **Configuración n8n**: Crear y modificar workflows
- **Monitoreo**: Acceso a métricas y logs del sistema
- **Administración**: Gestión de usuarios y permisos

#### **Gestor de Tienda (store_manager)**
- **Búsquedas Avanzadas**: Acceso completo a consultas técnicas
- **Supervisión**: Monitoreo de vendedores y sus consultas
- **Reportes**: Análisis de consultas técnicas del equipo
- **Gestión Limitada**: Acceso a manuales sin capacidad de edición
- **Sin Configuración**: No puede modificar workflows n8n

#### **Vendedor (seller)**
- **Búsquedas Avanzadas**: Acceso a consultas técnicas
- **Asesoramiento**: Uso de knowledge base para clientes
- **Identificación**: Búsqueda de piezas y códigos
- **Solo Consulta**: No puede modificar contenido
- **Restricciones**: Acceso limitado según tienda asignada

---

## 🚀 Reglas de Desarrollo y Deployment

### 1. **Estructura de Ramas**
```
main (producción) - v1.4.0
├── qa (testing/staging) ← Despliegue automático
└── develop (desarrollo) ← Trabajo diario
```

### 1.1. **Información de Versión**
- **Versión Actual**: 1.4.0
- **Fecha de Release**: Octubre 2025
- **Desarrollador**: Juan Hernandez
- **Empresa**: LDJ Digital Solutions

### 2. **Scripts de Desarrollo**
- **Frontend**: `npm run dev`, `npm run build`, `npm run preview`
- **Backend**: `npm run dev`, `npm run build`, `npm run start`
- **Mobile**: Scripts específicos para React Native

### 3. **Variables de Entorno Requeridas**
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/PiezasYA

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@PiezasYA.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URLs
VITE_API_URL=http://localhost:5000/api

# Configuración de Temas e Idiomas
DEFAULT_THEME=light
DEFAULT_LANGUAGE=es
SUPPORTED_LANGUAGES=es,en,pt
SUPPORTED_THEMES=light,dark

# Configuración n8n y Knowledge Base
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/piezasyaya
N8N_API_KEY=your-n8n-api-key
KNOWLEDGE_BASE_URL=https://your-knowledge-base.com/api
KNOWLEDGE_BASE_API_KEY=your-knowledge-base-key
VECTOR_DATABASE_URL=your-vector-db-url
LLM_API_KEY=your-llm-api-key
LLM_MODEL=gpt-4
```

---

## 📱 Reglas para Aplicación Móvil

### 1. **Estrategia de Migración**
- **OBJETIVO**: Migrar de Expo a React Native puro
- **RAZÓN**: Evitar problemas de build y deployment
- **BENEFICIOS**: Control total, mejor rendimiento, menos dependencias

### 2. **Funcionalidades por Rol en Móvil**
- **Cliente**: Catálogo, carrito, compras, historial, favoritos
- **Delivery**: Dashboard, órdenes, mapa GPS, reportes
- **Vendedor**: Consulta de precios, chat con clientes, cotizaciones, productos asignados
- **Gestor de Tienda**: Inventario, pedidos, analytics, comunicación

### 3. **Tecnologías Móviles**
- **Navegación**: React Navigation
- **Estado**: Context API + AsyncStorage
- **Mapas**: React Native Maps
- **Notificaciones**: Push notifications
- **Cámara**: React Native Camera

---

## 🌐 Reglas de Internacionalización y Traducciones

### 1. **Sistema de Idiomas Soportados**
- **Español (es)**: Idioma principal y por defecto
- **Inglés (en)**: Idioma secundario para mercado internacional
- **Portugués (pt)**: Idioma para expansión a Brasil

### 2. **Implementación de Traducciones**
- **Servicio Centralizado**: `TranslationService` con más de 12,000 claves de traducción
- **Persistencia**: Almacenamiento en localStorage y sincronización con backend
- **Context API**: `LanguageContext` para gestión global del idioma
- **Hook Personalizado**: `useTranslation()` para fácil uso en componentes

### 3. **Funcionalidades de Traducción**
- **Cambio Dinámico**: Cambio de idioma sin recargar la página
- **Sincronización Backend**: Preferencias guardadas en perfil de usuario
- **Traducciones con Parámetros**: Soporte para interpolación de variables
- **Fallback Automático**: Si no existe traducción, usa español por defecto

### 4. **Estructura de Traducciones**
```typescript
// Ejemplo de estructura
'nav.home': {
  es: 'Inicio',
  en: 'Home', 
  pt: 'Início'
}
```

---

## 🎨 Reglas de Diseño y UX

### 1. **Sistema de Temas**
- **Tema Claro (light)**: Tema por defecto para mejor legibilidad
- **Tema Oscuro (dark)**: Tema alternativo para uso nocturno
- **Persistencia**: Configuración guardada en localStorage y backend
- **Aplicación Inmediata**: Cambio de tema sin recargar la página

### 2. **Implementación de Temas**
- **Context API**: `ThemeContext` para gestión global del tema
- **Tailwind CSS**: Clases `dark:` para estilos condicionales
- **Sincronización**: Preferencias sincronizadas con perfil de usuario
- **Aplicación Automática**: Tema aplicado al cargar la página

### 3. **Paleta de Colores Corporativa**
- **Amarillo Racing**: `#FFC300` - Rapidez, energía
- **Gris Carbón**: `#333333` - Profesionalismo, confianza
- **Negro Onix**: `#000000` - Solidez, elegancia
- **Rojo Alerta**: `#E63946` - Urgencia, acción
- **Blanco Nieve**: `#FFFFFF` - Limpieza, modernidad

### 4. **Principios de Diseño**
- **RESPONSIVE**: Optimizado para desktop, tablet y móvil
- **INTUITIVO**: UI/UX clara y fácil de usar
- **CONSISTENTE**: Iconografía moderna con Lucide React
- **ACCESIBLE**: Cumplimiento con estándares de accesibilidad
- **ADAPTATIVO**: Soporte completo para temas claro y oscuro

---

## 🔧 Reglas Técnicas Específicas

### 1. **Middlewares de Autorización**
```typescript
// Middlewares específicos por rol
adminMiddleware: Verifica rol 'admin'
clientMiddleware: Verifica rol 'client'
deliveryMiddleware: Verifica rol 'delivery'
storeManagerMiddleware: Verifica rol 'store_manager'
sellerMiddleware: Verifica rol 'seller'

// Middlewares combinados
adminOrStoreManagerMiddleware: Permite 'admin' o 'store_manager'
adminOrDeliveryMiddleware: Permite 'admin' o 'delivery'
adminOrSellerMiddleware: Permite 'admin' o 'seller'
storeManagerOrSellerMiddleware: Permite 'store_manager' o 'seller'
advancedSearchMiddleware: Permite 'admin', 'store_manager' o 'seller'
knowledgeBaseMiddleware: Permite 'admin' o 'store_manager'
n8nWorkflowMiddleware: Solo 'admin'
staffMiddleware: Permite cualquier rol excepto 'client'
```

### 2. **Rutas Protegidas**
- **Admin**: `/admin/*` - Panel de administración completo
  - `/admin/advanced-search` - Búsquedas avanzadas con knowledge base
  - `/admin/knowledge-base` - Gestión de manuales y catálogos
  - `/admin/n8n-workflows` - Configuración de workflows n8n
- **Store Manager**: `/store-manager/*` - Gestión de tienda
  - `/store-manager/advanced-search` - Búsquedas avanzadas con knowledge base
  - `/store-manager/technical-support` - Asesoramiento técnico con manuales
  - `/store-manager/seller-performance` - Supervisión de vendedores
- **Delivery**: `/delivery/*` - Gestión de entregas
- **Seller**: `/seller/*` - Panel de vendedor
  - `/seller/dashboard` - Dashboard principal
  - `/seller/prices` - Consulta de precios
  - `/seller/chat` - Chat con clientes
  - `/seller/quotes` - Gestión de cotizaciones
  - `/seller/products` - Productos asignados
  - `/seller/customers` - Gestión de clientes
  - `/seller/performance` - Métricas de rendimiento
  - `/seller/advanced-search` - Búsquedas avanzadas con knowledge base
  - `/seller/technical-support` - Asesoramiento técnico con manuales
  - `/seller/part-identification` - Identificación de piezas por códigos
- **Client**: `/cart`, `/profile`, `/orders` - Funcionalidades de cliente

### 3. **Validaciones de Contenido**
```typescript
interface ContentFilter {
  phonePatterns: RegExp[];
  emailPatterns: RegExp[];
  externalLinks: RegExp[];
  forbiddenKeywords: string[];
  fraudPatterns: RegExp[];
}
```

---

## 📊 Reglas de Monitoreo y Analytics

### 1. **Métricas Principales v1.4.0**
- **Tasa de Conversión Interna**: >85% de transacciones dentro de la app
- **Reducción de Intentos Externos**: <5% de intentos de contacto externo
- **Adopción de Chat Interno**: >90% de comunicaciones por chat oficial
- **Satisfacción de Usuarios**: >4.5/5 en encuestas
- **Precisión de Búsquedas Avanzadas**: >90% de respuestas correctas
- **Tiempo de Respuesta n8n**: <3 segundos promedio

### 2. **Sistema de Reputación**
- **Scoring**: Puntuación 0-100 basada en ventas internas y cumplimiento
- **Badges**: "Tienda Premium", "Vendedor Confiable", "Entrega Rápida"
- **Comisiones**: Tiers basados en volumen y cumplimiento de políticas
- **Visibilidad**: Multiplicador de visibilidad en búsquedas

---

## 🚨 Reglas de Sanciones y Cumplimiento

### 1. **Sistema de Sanciones Progresivas**
- **Primera infracción**: Advertencia automática
- **Segunda infracción**: Reducción de visibilidad en búsquedas
- **Infracciones repetidas**: Suspensión temporal de la cuenta
- **Infracciones graves**: Suspensión permanente

### 2. **Detección Automática**
- **Patrones**: Detección de números de teléfono, emails, enlaces externos
- **Lenguaje**: Análisis de palabras clave como "WhatsApp", "fuera de la app"
- **Comportamiento**: Análisis de patrones sospechosos en tiempo real
- **Machine Learning**: Mejora continua de la detección

---

## 📞 Reglas de Soporte y Contacto

### 1. **Información de Contacto**
- **Desarrollador**: Juan Hernandez
- **Empresa**: LDJ Digital Solutions
- **Email**: jcarweb.designer@gmail.com
- **Teléfono**: +58 (412) 012-3044
- **Ubicación**: Caracas - Venezuela
- **Equipo**: PiezasYA Development Team

### 2. **Documentación**
- **Técnica**: Documentación completa en `/docs`
- **Usuario**: Manuales específicos por rol
- **API**: Documentación de endpoints y servicios
- **Deployment**: Guías de despliegue y configuración

---

## 🔄 Reglas de Actualización y Mantenimiento

### 1. **Ciclo de Desarrollo**
- **Desarrollo**: Rama `develop` para trabajo diario
- **Testing**: Rama `qa` para pruebas y staging
- **Producción**: Rama `main` para releases estables

### 2. **Monitoreo Continuo**
- **Logs**: Registro detallado de todas las operaciones
- **Alertas**: Notificaciones automáticas para anomalías
- **Métricas**: Dashboard de salud del sistema
- **Reportes**: Análisis semanales de métricas

### 3. **Actualizaciones**
- **Mensual**: Revisión de patrones de fraude
- **Trimestral**: Actualización de filtros de contenido
- **Anual**: Optimización de algoritmos de detección
- **Continua**: Mejoras basadas en feedback de usuarios

---

**Versión**: 1.4.0  
**Última actualización**: Octubre 2025  
**Desarrollador**: Juan Hernandez  
**Empresa**: LDJ Digital Solutions  
**Equipo de Desarrollo**: PiezasYA

---

*Este documento define las reglas actuales del proyecto PiezasYA para insumos y consultas de referencias. Se actualiza regularmente según las necesidades del negocio y las mejoras técnicas implementadas.*
