# Sistema de Internacionalización (i18n)

## Descripción General

El sistema de internacionalización permite cambiar el idioma de toda la aplicación de forma dinámica. Actualmente soporta tres idiomas:
- **Español (es)** - Idioma por defecto
- **Inglés (en)** - English
- **Portugués (pt)** - Português

## Arquitectura del Sistema

### 1. Servicio de Traducciones (`src/utils/translations.ts`)

El archivo principal que contiene todas las traducciones organizadas por categorías:

```typescript
export const translations: Translations = {
  // Navegación
  'nav.home': {
    es: 'Inicio',
    en: 'Home',
    pt: 'Início'
  },
  
  // Botones
  'button.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  
  // Mensajes
  'message.success.saved': {
    es: 'Guardado exitosamente',
    en: 'Saved successfully',
    pt: 'Salvo com sucesso'
  }
};
```

### 2. Contexto de Idioma (`src/contexts/LanguageContext.tsx`)

Proporciona el estado global del idioma y métodos para cambiarlo:

```typescript
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  tWithParams: (key: string, params: Record<string, string>) => string;
}
```

### 3. Selector de Idioma (`src/components/LanguageSelector.tsx`)

Componente UI para cambiar el idioma con banderas y nombres nativos.

## Cómo Usar las Traducciones

### 1. En Componentes Funcionales

```typescript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent: React.FC = () => {
  const { t, tWithParams } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{tWithParams('welcome.message', { name: 'Juan' })}</p>
      <button>{t('button.save')}</button>
    </div>
  );
};
```

### 2. Traducciones con Parámetros

```typescript
// En translations.ts
'welcome.message': {
  es: 'Bienvenido, {{name}}',
  en: 'Welcome, {{name}}',
  pt: 'Bem-vindo, {{name}}'
}

// En el componente
const message = tWithParams('welcome.message', { name: 'Juan' });
// Resultado: "Bienvenido, Juan"
```

### 3. Cambiar Idioma Programáticamente

```typescript
import { useLanguage } from '../contexts/LanguageContext';

const LanguageChanger: React.FC = () => {
  const { setLanguage, currentLanguage } = useLanguage();
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };
  
  return (
    <div>
      <button onClick={() => handleLanguageChange('en')}>
        English
      </button>
      <button onClick={() => handleLanguageChange('es')}>
        Español
      </button>
      <button onClick={() => handleLanguageChange('pt')}>
        Português
      </button>
    </div>
  );
};
```

## Categorías de Traducciones

### Navegación (`nav.*`)
- `nav.home` - Inicio
- `nav.categories` - Categorías
- `nav.products` - Productos
- `nav.cart` - Carrito
- `nav.favorites` - Favoritos
- `nav.profile` - Perfil
- `nav.settings` - Configuración
- `nav.security` - Seguridad
- `nav.loyalty` - Fidelización
- `nav.orders` - Pedidos
- `nav.notifications` - Notificaciones
- `nav.logout` - Cerrar Sesión

### Panel de Administración (`admin.*`)
- `admin.dashboard` - Panel de Control
- `admin.users` - Usuarios
- `admin.stores` - Tiendas
- `admin.products` - Productos
- `admin.categories` - Categorías
- `admin.subcategories` - Subcategorías
- `admin.promotions` - Promociones
- `admin.advertisements` - Anuncios
- `admin.sales` - Ventas
- `admin.loyalty` - Fidelización
- `admin.analytics` - Analíticas
- `admin.registrationCodes` - Códigos de Registro
- `admin.searchConfig` - Configuración de Búsqueda
- `admin.generateProducts` - Generar Productos

### Panel de Gestor de Tienda (`store.*`)
- `store.dashboard` - Panel de Tienda
- `store.products` - Mis Productos
- `store.promotions` - Mis Promociones
- `store.sales` - Mis Ventas
- `store.orders` - Mis Pedidos
- `store.delivery` - Entrega
- `store.analytics` - Analíticas
- `store.messages` - Mensajes
- `store.reviews` - Reseñas
- `store.settings` - Configuración

### Panel de Delivery (`delivery.*`)
- `delivery.dashboard` - Panel de Entrega
- `delivery.orders` - Pedidos
- `delivery.map` - Mapa
- `delivery.report` - Reporte
- `delivery.ratings` - Calificaciones
- `delivery.schedule` - Horario
- `delivery.status` - Estado
- `delivery.profile` - Perfil

### Botones (`button.*`)
- `button.save` - Guardar
- `button.cancel` - Cancelar
- `button.edit` - Editar
- `button.delete` - Eliminar
- `button.add` - Agregar
- `button.create` - Crear
- `button.update` - Actualizar
- `button.search` - Buscar
- `button.filter` - Filtrar
- `button.clear` - Limpiar
- `button.back` - Volver
- `button.next` - Siguiente
- `button.previous` - Anterior
- `button.submit` - Enviar
- `button.confirm` - Confirmar
- `button.approve` - Aprobar
- `button.reject` - Rechazar
- `button.enable` - Habilitar
- `button.disable` - Deshabilitar
- `button.view` - Ver
- `button.download` - Descargar
- `button.upload` - Subir
- `button.export` - Exportar
- `button.import` - Importar

### Estados (`status.*`)
- `status.loading` - Cargando...
- `status.success` - Éxito
- `status.error` - Error
- `status.warning` - Advertencia
- `status.info` - Información
- `status.enabled` - Habilitado
- `status.disabled` - Deshabilitado
- `status.active` - Activo
- `status.inactive` - Inactivo
- `status.pending` - Pendiente
- `status.completed` - Completado
- `status.cancelled` - Cancelado

### Mensajes (`message.*`)
- `message.success.saved` - Guardado exitosamente
- `message.success.updated` - Actualizado exitosamente
- `message.success.deleted` - Eliminado exitosamente
- `message.success.created` - Creado exitosamente
- `message.success.uploaded` - Subido exitosamente
- `message.success.imported` - Importado exitosamente
- `message.success.exported` - Exportado exitosamente
- `message.error.general` - Ha ocurrido un error
- `message.error.network` - Error de conexión
- `message.error.validation` - Error de validación
- `message.error.unauthorized` - No autorizado
- `message.error.forbidden` - Acceso denegado
- `message.error.notFound` - No encontrado
- `message.error.server` - Error del servidor

### Formularios (`form.*`)
- `form.required` - Campo requerido
- `form.invalid` - Campo inválido
- `form.email.invalid` - Email inválido
- `form.password.weak` - Contraseña débil
- `form.password.mismatch` - Las contraseñas no coinciden
- `form.file.tooLarge` - Archivo demasiado grande
- `form.file.invalidType` - Tipo de archivo inválido

### Campos (`field.*`)
- `field.name` - Nombre
- `field.email` - Email
- `field.password` - Contraseña
- `field.confirmPassword` - Confirmar Contraseña
- `field.phone` - Teléfono
- `field.address` - Dirección
- `field.city` - Ciudad
- `field.state` - Estado
- `field.country` - País
- `field.zipCode` - Código Postal
- `field.description` - Descripción
- `field.price` - Precio
- `field.quantity` - Cantidad
- `field.category` - Categoría
- `field.subcategory` - Subcategoría
- `field.brand` - Marca
- `field.image` - Imagen
- `field.status` - Estado
- `field.date` - Fecha
- `field.time` - Hora
- `field.notes` - Notas

### Tablas (`table.*`)
- `table.noData` - No hay datos disponibles
- `table.loading` - Cargando datos...
- `table.actions` - Acciones
- `table.selectAll` - Seleccionar Todo
- `table.selected` - seleccionado(s)
- `table.rowsPerPage` - Filas por página
- `table.of` - de
- `table.previous` - Anterior
- `table.next` - Siguiente

### Modales (`modal.*`)
- `modal.confirm` - Confirmar
- `modal.cancel` - Cancelar
- `modal.close` - Cerrar
- `modal.delete.title` - Confirmar Eliminación
- `modal.delete.message` - ¿Está seguro de que desea eliminar este elemento?
- `modal.unsaved.title` - Cambios Sin Guardar
- `modal.unsaved.message` - Tiene cambios sin guardar. ¿Desea salir sin guardar?

### Configuración (`configuration.*`)
- `configuration.title` - Configuración
- `configuration.subtitle` - Personaliza tu experiencia
- `configuration.loading` - Cargando configuración...

### Apariencia (`appearance.*`)
- `appearance.title` - Apariencia
- `appearance.theme` - Tema
- `appearance.theme.description` - Elige entre tema claro u oscuro
- `appearance.light` - Claro
- `appearance.dark` - Oscuro

### Idioma (`language.*`)
- `language.title` - Idioma
- `language.description` - Selecciona tu idioma preferido
- `language.es` - Español
- `language.en` - Inglés
- `language.pt` - Portugués

### Notificaciones (`notifications.*`)
- `notifications.title` - Notificaciones
- `notifications.email` - Notificaciones por Email
- `notifications.email.description` - Recibe notificaciones importantes por email
- `notifications.push` - Notificaciones Push
- `notifications.push.description` - Notificaciones en tiempo real
- `notifications.sms` - Notificaciones SMS
- `notifications.sms.description` - Mensajes de texto importantes

### Privacidad (`privacy.*`)
- `privacy.title` - Privacidad
- `privacy.profile.visibility` - Visibilidad del Perfil
- `privacy.profile.visibility.description` - Quién puede ver tu perfil
- `privacy.profile.public` - Público
- `privacy.profile.friends` - Solo amigos
- `privacy.profile.private` - Privado

### Actividad (`activity.*`)
- `activity.title` - Historial de Actividades
- `activity.show` - Ver historial
- `activity.hide` - Ocultar

### Elementos Comunes (`common.*`)
- `common.home` - Inicio
- `common.profile` - Perfil
- `common.settings` - Configuración
- `common.logout` - Cerrar Sesión
- `common.search` - Buscar
- `common.cart` - Carrito
- `common.favorites` - Favoritos
- `common.orders` - Pedidos
- `common.notifications` - Notificaciones
- `common.security` - Seguridad
- `common.loyalty` - Fidelización

## Configuración del Sistema

### 1. Agregar el LanguageProvider

El `LanguageProvider` debe envolver toda la aplicación en `App.tsx`:

```typescript
function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
```

### 2. Agregar el LanguageSelector

El componente `LanguageSelector` se puede agregar en cualquier parte de la aplicación, típicamente en el Header:

```typescript
import LanguageSelector from './LanguageSelector';

// En el Header
<div className="flex items-center space-x-4">
  <LanguageSelector />
  {/* Otros elementos */}
</div>
```

## Persistencia del Idioma

El idioma seleccionado se guarda automáticamente en `localStorage` y se recupera al cargar la aplicación. Esto significa que la preferencia del usuario se mantiene entre sesiones.

## Eventos del Sistema

El sistema dispara un evento personalizado `languageChanged` cuando se cambia el idioma, que otros componentes pueden escuchar:

```typescript
useEffect(() => {
  const handleLanguageChange = (event: CustomEvent) => {
    const newLanguage = event.detail;
    // Reaccionar al cambio de idioma
  };

  window.addEventListener('languageChanged', handleLanguageChange);
  
  return () => {
    window.removeEventListener('languageChanged', handleLanguageChange);
  };
}, []);
```

## Mejores Prácticas

### 1. Usar Claves Descriptivas
```typescript
// ✅ Bueno
t('button.save')
t('message.success.saved')

// ❌ Malo
t('btn1')
t('msg1')
```

### 2. Agrupar Traducciones por Contexto
```typescript
// ✅ Organizado por contexto
'admin.users.title'
'admin.users.description'
'admin.users.add'

// ❌ Sin organización
'users.title'
'description.users'
'add.user'
```

### 3. Usar Parámetros para Textos Dinámicos
```typescript
// ✅ Con parámetros
tWithParams('welcome.user', { name: userName })

// ❌ Concatenación manual
t('welcome') + ' ' + userName
```

### 4. Proporcionar Fallbacks
El sistema automáticamente usa español como fallback si no encuentra una traducción:

```typescript
// Si no existe 'button.custom' en inglés, usa español
t('button.custom') // Retorna la versión en español
```

## Agregar Nuevas Traducciones

Para agregar nuevas traducciones:

1. **Agregar la clave en `translations.ts`**:
```typescript
'new.feature.title': {
  es: 'Nueva Funcionalidad',
  en: 'New Feature',
  pt: 'Nova Funcionalidade'
}
```

2. **Usar en el componente**:
```typescript
const { t } = useLanguage();
return <h1>{t('new.feature.title')}</h1>;
```

## Agregar Nuevos Idiomas

Para agregar un nuevo idioma (ej: francés):

1. **Actualizar el tipo Language**:
```typescript
export type Language = 'es' | 'en' | 'pt' | 'fr';
```

2. **Agregar traducciones**:
```typescript
'nav.home': {
  es: 'Inicio',
  en: 'Home',
  pt: 'Início',
  fr: 'Accueil'
}
```

3. **Actualizar LanguageSelector**:
```typescript
const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];
```

## Troubleshooting

### Problema: Las traducciones no se actualizan
**Solución**: Asegúrate de que el componente esté usando `useLanguage()` en lugar de `useTranslation()`.

### Problema: Error "Translation key not found"
**Solución**: Verifica que la clave existe en `translations.ts` y que esté escrita correctamente.

### Problema: El idioma no se guarda
**Solución**: Verifica que el `LanguageProvider` esté envolviendo la aplicación correctamente.

### Problema: Traducciones duplicadas
**Solución**: Verifica que no haya claves duplicadas en `translations.ts`.

## Conclusión

El sistema de internacionalización está diseñado para ser fácil de usar y mantener. Proporciona una experiencia de usuario consistente en múltiples idiomas y se integra perfectamente con la arquitectura existente de la aplicación.
