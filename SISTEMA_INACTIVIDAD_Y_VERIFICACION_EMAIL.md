# Sistema de Inactividad y Verificación de Email

## Funcionalidades Implementadas

### 1. Cierre Automático de Sesión por Inactividad

#### Características:
- **Detección de actividad**: Monitorea eventos del usuario (mouse, teclado, scroll, touch)
- **Timer configurable**: Tiempo de inactividad ajustable (por defecto 30 minutos)
- **Advertencia previa**: Muestra una advertencia 5 minutos antes del cierre
- **Interfaz de configuración**: Permite ajustar los tiempos de inactividad
- **Notificación de cierre**: Muestra una notificación cuando se cierra la sesión

#### Componentes:
- `useInactivityTimeout.ts`: Hook personalizado para manejar la inactividad
- `InactivityWarning.tsx`: Modal de advertencia antes del cierre
- `SessionTimeoutNotification.tsx`: Notificación de cierre de sesión
- `InactivityProvider.tsx`: Proveedor que envuelve la aplicación
- `InactivitySettings.tsx`: Configuración de tiempos de inactividad

#### Configuración:
- **Tiempo de inactividad**: 5-120 minutos (por defecto 30)
- **Tiempo de advertencia**: 1-119 minutos (por defecto 5)
- **Eventos monitoreados**: mousedown, mousemove, keypress, scroll, touchstart, click, focus

### 2. Protección de Rutas de Verificación de Email

#### Características:
- **Prevención de acceso**: Impide que usuarios logueados accedan a páginas de verificación
- **Redirección automática**: Redirige según el rol del usuario
- **Layout completamente limpio**: Sin Header, Sidebar, Footer ni elementos de sesión
- **Detección en tiempo real**: Verifica el estado de autenticación constantemente

#### Componentes:
- `EmailVerificationRoute.tsx`: Componente de ruta protegida
- `CleanLayout.tsx`: Layout completamente limpio para verificación de email

#### Rutas Protegidas:
- `/verify-email`
- `/email-verification`
- `/google-callback/verify-email`
- `/google-callback/register-with-code`

#### Redirecciones por Rol:
- **Admin**: `/admin/dashboard`
- **Store Manager**: `/store-manager/dashboard`
- **Delivery**: `/delivery/dashboard`
- **Cliente**: `/`

## Implementación Técnica

### Hook de Inactividad (`useInactivityTimeout`)

```typescript
const {
  showWarning,
  timeRemaining,
  extendSession,
  forceLogout,
  resetTimer
} = useInactivityTimeout({
  timeoutMinutes: 30,
  warningMinutes: 5,
  onTimeout: () => console.log('Sesión cerrada')
});
```

### Layout Limpio (`CleanLayout`)

```typescript
<CleanLayout>
  <VerifyEmail />
</CleanLayout>
```

### Uso en App.tsx

```typescript
<Router>
  <InactivityProvider timeoutMinutes={30} warningMinutes={5}>
    <Routes>
      <Route path="/verify-email" element={<EmailVerificationRoute />} />
      <Route path="/email-verification" element={<EmailVerificationRoute />} />
      {/* Otras rutas */}
    </Routes>
  </InactivityProvider>
</Router>
```

## Flujo de Usuario

### Cierre por Inactividad:
1. Usuario está inactivo por 25 minutos (30 - 5)
2. Se muestra advertencia con countdown de 5 minutos
3. Usuario puede:
   - Hacer clic en "Continuar sesión" para extender
   - Hacer clic en "Cerrar sesión" para salir
   - Esperar a que expire el tiempo
4. Si expira, se cierra la sesión y se muestra notificación

### Verificación de Email y Registro:
1. Usuario logueado intenta acceder a `/verify-email`, `/email-verification`, `/google-callback/verify-email` o `/google-callback/register-with-code`
2. Sistema detecta usuario autenticado
3. Redirige automáticamente según su rol (solo para verificación de email)
4. Si no hay usuario logueado, muestra página con layout completamente limpio
5. No se muestran elementos de sesión (Header, Sidebar, Footer, configuración de inactividad)

## Configuración

### Tiempos de Inactividad:
- **Desarrollo**: 5 minutos (para pruebas)
- **Producción**: 30 minutos (recomendado)
- **Configuración personalizada**: A través del componente de configuración

### Eventos de Actividad:
- Movimiento del mouse
- Clics
- Pulsaciones de teclado
- Scroll
- Touch (dispositivos móviles)
- Focus en elementos

## Seguridad

### Beneficios:
- **Prevención de acceso no autorizado**: Sesiones largas sin supervisión
- **Protección de datos sensibles**: Cierre automático en áreas administrativas
- **Cumplimiento de políticas**: Configuración de tiempos según políticas de seguridad

### Consideraciones:
- **Experiencia de usuario**: Advertencia previa para evitar pérdida de trabajo
- **Configuración flexible**: Diferentes tiempos según el contexto
- **Detección precisa**: Múltiples eventos para detectar actividad real

## Mantenimiento

### Archivos Principales:
- `src/hooks/useInactivityTimeout.ts`
- `src/components/InactivityProvider.tsx`
- `src/components/EmailVerificationRoute.tsx`
- `src/components/CleanLayout.tsx`

### Configuración:
- Tiempos ajustables en `InactivityProvider`
- Eventos monitoreados en `useInactivityTimeout`
- Rutas protegidas en `EmailVerificationRoute`
- Layout limpio en `CleanLayout`

### Personalización:
- Modificar tiempos por defecto
- Agregar nuevos eventos de actividad
- Cambiar rutas de redirección
- Personalizar mensajes de advertencia
