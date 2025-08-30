# Sistema de Navegación Basado en Roles

## Resumen

Se ha implementado un sistema unificado de navegación basado en roles que integra perfectamente con el sistema de temas claro/oscuro y traducciones multilingües. El componente `RoleBasedNavigation` proporciona una experiencia de usuario consistente y adaptativa para todos los roles del sistema.

## Características Principales

### 🎨 Integración con Temas
- **Soporte completo para tema claro/oscuro**
- **Transiciones suaves** entre temas
- **Colores específicos por rol** que se adaptan al tema
- **Persistencia** de preferencias de tema

### 🌍 Traducciones Multilingües
- **Traducciones en tiempo real** para español, inglés y portugués
- **Re-renders optimizados** cuando cambia el idioma
- **Descripciones traducidas** para cada elemento del menú
- **Sincronización** con el contexto global de idioma

### 👥 Sistema de Roles
- **4 roles principales**: Admin, Store Manager, Delivery, Client
- **Menús específicos** para cada rol
- **Iconos y colores distintivos** por rol
- **Detección automática** del rol del usuario

### 📱 Responsive Design
- **3 variantes de navegación**: Sidebar, Header, Mobile
- **Adaptación automática** según el dispositivo
- **Overlay móvil** con animaciones suaves
- **Breakpoints optimizados** para diferentes pantallas

## Estructura del Componente

### Props del Componente

```typescript
interface RoleBasedNavigationProps {
  isOpen: boolean;                    // Estado de apertura
  onClose: () => void;               // Función de cierre
  variant?: 'sidebar' | 'header' | 'mobile'; // Variante de navegación
}
```

### Configuración por Rol

```typescript
const roleConfig = {
  admin: {
    title: 'Administrador',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    menuItems: [...]
  },
  store_manager: {
    title: 'Gestor de Tienda',
    icon: Store,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    menuItems: [...]
  },
  delivery: {
    title: 'Delivery',
    icon: Truck,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    menuItems: [...]
  },
  client: {
    title: 'Cliente',
    icon: User,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    menuItems: [...]
  }
};
```

## Menús por Rol

### 🛡️ Administrador
- Dashboard
- Usuarios
- Productos
- Categorías
- Promociones
- Ventas
- Analytics
- Fidelización
- Códigos de Registro
- Configuración Global

### 🏪 Gestor de Tienda
- Dashboard
- Inventario
- Productos
- Promociones
- Ventas
- Pedidos
- Delivery
- Analytics
- Mensajes
- Reseñas
- Configuración

### 🚚 Delivery
- Dashboard
- Pedidos Asignados
- Mapa de Rutas
- Reporte de Entregas
- Calificaciones
- Horario de Trabajo
- Estado de Disponibilidad
- Perfil

### 👤 Cliente
- Inicio
- Productos
- Categorías
- Carrito
- Favoritos
- Fidelización
- Mis Pedidos
- Perfil
- Seguridad
- Notificaciones

## Variantes de Navegación

### 1. Sidebar (Desktop)
- **Ancho fijo**: 256px
- **Posición**: Lateral izquierda
- **Contenido**: Menú completo con iconos y descripciones
- **Footer**: Información del usuario y selectores de tema/idioma

### 2. Header (Tablet)
- **Posición**: Barra horizontal superior
- **Contenido**: Rol actual y selectores de tema/idioma
- **Compacto**: Solo información esencial

### 3. Mobile (Smartphone)
- **Overlay**: Pantalla completa con fondo semitransparente
- **Animación**: Deslizamiento desde la izquierda
- **Contenido**: Menú completo adaptado para touch
- **Cierre**: Tap en overlay o botón X

## Integración con Contextos

### AuthContext
```typescript
const { user, hasRole, hasAnyRole } = useAuth();
```
- **Detección de rol**: `user?.role`
- **Verificación de permisos**: `hasRole('admin')`
- **Múltiples roles**: `hasAnyRole(['admin', 'store_manager'])`

### LanguageContext
```typescript
const { t, currentLanguage, setLanguage } = useLanguage();
```
- **Traducciones**: `t('sidebar.admin.dashboard')`
- **Cambio de idioma**: `setLanguage('en')`
- **Re-renders**: `updateTrigger` para forzar actualizaciones

### ThemeContext
```typescript
const { theme, toggleTheme, isDark } = useTheme();
```
- **Estado del tema**: `theme` (light/dark)
- **Toggle**: `toggleTheme()`
- **Helper**: `isDark` para condicionales

## Traducciones Implementadas

### Claves de Traducción
```typescript
// Roles
'sidebar.roles.admin': { es: 'Administrador', en: 'Administrator', pt: 'Administrador' }
'sidebar.roles.storeManager': { es: 'Gestor de Tienda', en: 'Store Manager', pt: 'Gerente de Loja' }
'sidebar.roles.delivery': { es: 'Delivery', en: 'Delivery', pt: 'Entrega' }
'sidebar.roles.client': { es: 'Cliente', en: 'Client', pt: 'Cliente' }

// Menús de Admin
'sidebar.admin.dashboard': { es: 'Dashboard', en: 'Dashboard', pt: 'Painel' }
'sidebar.admin.users': { es: 'Usuarios', en: 'Users', pt: 'Usuários' }
// ... más elementos

// Descripciones
'sidebar.admin.dashboard.description': { es: 'Panel principal de administración', en: 'Main administration panel', pt: 'Painel principal de administração' }

// Temas
'theme.dark': { es: 'Oscuro', en: 'Dark', pt: 'Escuro' }
'theme.light': { es: 'Claro', en: 'Light', pt: 'Claro' }
'theme.switchToDark': { es: 'Cambiar a modo oscuro', en: 'Switch to dark mode', pt: 'Mudar para modo escuro' }

// Idiomas
'language.es': { es: 'Español', en: 'Spanish', pt: 'Espanhol' }
'language.en': { es: 'Inglés', en: 'English', pt: 'Inglês' }
'language.pt': { es: 'Portugués', en: 'Portuguese', pt: 'Português' }
```

## Uso del Componente

### Implementación Básica
```tsx
import RoleBasedNavigation from './components/RoleBasedNavigation';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <RoleBasedNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="sidebar"
      />
      <main className="flex-1">
        {/* Contenido principal */}
      </main>
    </div>
  );
}
```

### Variante Móvil
```tsx
<RoleBasedNavigation
  isOpen={isMobileMenuOpen}
  onClose={() => setIsMobileMenuOpen(false)}
  variant="mobile"
/>
```

### Variante Header
```tsx
<RoleBasedNavigation
  isOpen={true}
  onClose={() => {}}
  variant="header"
/>
```

## Componente de Demostración

Se incluye `RoleBasedNavigationDemo` que muestra:

- **Selector de variantes**: Cambio entre sidebar, header y móvil
- **Información del usuario**: Rol actual, tema, idioma
- **Características**: Explicación de funcionalidades
- **Instrucciones**: Guía de uso interactiva

### Características del Demo
- **Interactivo**: Cambio en tiempo real de variantes
- **Informativo**: Muestra estado actual del sistema
- **Educativo**: Explica cada característica
- **Responsive**: Adaptable a todos los dispositivos

## Optimizaciones de Performance

### Re-renders Optimizados
- **useEffect** para detectar cambios de idioma
- **forceUpdate** para forzar re-renders cuando es necesario
- **Memoización** de configuraciones por rol

### Lazy Loading
- **Importación dinámica** de iconos
- **Carga condicional** de componentes
- **Bundle splitting** por variante

### Transiciones Suaves
- **CSS transitions** para cambios de tema
- **Transform animations** para móvil
- **Opacity transitions** para overlays

## Personalización

### Colores por Rol
```css
/* Admin - Rojo */
.text-red-600.dark:text-red-400
.bg-red-50.dark:bg-red-900/20

/* Store Manager - Azul */
.text-blue-600.dark:text-blue-400
.bg-blue-50.dark:bg-blue-900/20

/* Delivery - Verde */
.text-green-600.dark:text-green-400
.bg-green-50.dark:bg-green-900/20

/* Client - Púrpura */
.text-purple-600.dark:text-purple-400
.bg-purple-50.dark:bg-purple-900/20
```

### Agregar Nuevos Roles
1. **Definir configuración** en `getMenuConfiguration()`
2. **Agregar traducciones** en `translations.ts`
3. **Actualizar tipos** en `types/index.ts`
4. **Probar** con el componente demo

### Agregar Nuevos Elementos de Menú
1. **Definir estructura** en el array `menuItems`
2. **Agregar traducciones** para título y descripción
3. **Importar icono** de Lucide React
4. **Configurar ruta** y permisos

## Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

### Tecnologías
- ✅ React 18+
- ✅ TypeScript 4.5+
- ✅ Tailwind CSS 3.0+
- ✅ Lucide React

## Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Badges dinámicos** para notificaciones
- [ ] **Búsqueda en menú** para roles con muchos elementos
- [ ] **Favoritos** para elementos de menú frecuentes
- [ ] **Accesos directos** de teclado
- [ ] **Analytics** de uso de navegación

### Optimizaciones Técnicas
- [ ] **Virtual scrolling** para menús largos
- [ ] **Service Worker** para cache de traducciones
- [ ] **Web Components** para mejor reutilización
- [ ] **Testing** con Jest y React Testing Library

## Conclusión

El sistema de navegación basado en roles proporciona una experiencia de usuario consistente y adaptativa que se integra perfectamente con el sistema de temas y traducciones existente. Su arquitectura modular permite fácil extensión y personalización para futuras necesidades del proyecto.

### Beneficios Clave
- **Experiencia unificada** para todos los roles
- **Adaptabilidad completa** a diferentes dispositivos
- **Integración nativa** con temas y traducciones
- **Performance optimizada** con re-renders inteligentes
- **Mantenibilidad** con código modular y bien documentado
