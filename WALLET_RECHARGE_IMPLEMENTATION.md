# 💳 Sistema de Recarga de Wallet - PiezasYa

## 🎯 Resumen del Sistema

Sistema completo de recarga de saldo para wallets de tiendas, con soporte para múltiples métodos de pago, validación automática y manual, y auditoría completa.

## 🏗️ Arquitectura Implementada

### 1. **Modelos de Base de Datos**

#### `RechargeRequest` - Solicitudes de Recarga
- **Campos principales**: storeId, userId, amount, currency, paymentMethod, status
- **Estados**: pending, approved, rejected, cancelled
- **Auditoría**: createdAt, updatedAt, validatedBy, validatedAt
- **Instrucciones**: paymentInstructions (dinámicas por método)

#### `WalletTransaction` - Transacciones de Wallet
- **Tipos**: deposit, withdrawal, payment, refund, commission
- **Estados**: pending, completed, failed, cancelled
- **Trazabilidad**: balanceBefore, balanceAfter, exchangeRate
- **Metadatos**: paymentMethod, transactionId, fees

#### `Wallet` - Wallets de Tiendas
- **Configuración**: límites, comisiones, notificaciones
- **Control**: saldo, estado activo, pagos en efectivo
- **Automatización**: recarga automática, umbrales

### 2. **Servicios Implementados**

#### `ExchangeRateService` - Tasa de Cambio
- **Fuente**: BCV (scraping automático)
- **Fallback**: Tasas por defecto si BCV no disponible
- **Conversión**: USD ↔ VES, EUR → USD → VES
- **Caché**: 5 minutos para optimizar rendimiento

#### `PaymentService` - Integración de Pagos
- **PayPal**: Webhooks, validación automática
- **Stripe**: Payment Intents, webhooks
- **Validación**: Verificación de firmas, antifraude

#### `EmailService` - Notificaciones
- **Templates**: Instrucciones, aprobación, rechazo
- **SMTP**: Configurable (Gmail, SendGrid, etc.)
- **Automático**: Envío en cada cambio de estado

### 3. **Flujo de Recarga Implementado**

#### **Paso 1: Solicitud**
1. Usuario selecciona monto y moneda
2. Sistema calcula conversión con tasa BCV
3. Se crea `RechargeRequest` con estado `pending`
4. Se envían instrucciones de pago por email

#### **Paso 2: Pago**
1. Usuario realiza pago según instrucciones
2. Sube comprobante de pago
3. Sistema notifica a administradores

#### **Paso 3: Validación**
1. **Automática**: PayPal/Stripe (webhooks)
2. **Manual**: Zelle, transferencias, pago móvil
3. Administrador aprueba/rechaza con notas

#### **Paso 4: Acreditación**
1. Si aprobada: se crea `WalletTransaction`
2. Se actualiza saldo de `Wallet`
3. Se notifica al usuario por email

## 💳 Métodos de Pago Soportados

### **Divisas Internacionales (USD/EUR)**
- **PayPal**: Webhook automático, validación instantánea
- **Stripe**: Payment Intents, validación automática
- **Zelle**: Validación manual, instrucciones específicas

### **Bolívares (VES)**
- **Transferencia Bancaria**: Cuenta PiezasYa
- **Pago Móvil**: Número específico, referencia única

## 🔒 Seguridad y Auditoría

### **Validación de Pagos**
- **Firmas de Webhook**: PayPal y Stripe
- **Verificación de API**: Validación con proveedores
- **Comprobantes**: Upload de archivos (imagen/PDF)

### **Auditoría Completa**
- **Trazabilidad**: Cada transacción registrada
- **Usuarios**: Quién aprobó/rechazó cada solicitud
- **Timestamps**: Fechas exactas de cada acción
- **Notas**: Comentarios de administradores

### **Control de Acceso**
- **Roles**: Solo administradores pueden validar
- **Autenticación**: JWT en todas las rutas
- **Autorización**: Middleware de roles

## 🚀 Endpoints Implementados

### **Para Usuarios**
```
POST /api/recharge - Crear solicitud de recarga
GET /api/recharge/user - Obtener solicitudes del usuario
POST /api/recharge/:id/proof - Subir comprobante
```

### **Para Administradores**
```
GET /api/recharge/admin/pending - Solicitudes pendientes
PATCH /api/recharge/:id/validate - Aprobar/rechazar
```

### **Webhooks**
```
POST /api/webhooks/paypal - Webhook de PayPal
POST /api/webhooks/stripe - Webhook de Stripe
```

## 🎨 Frontend Implementado

### **Modal de Recarga**
- **Paso 1**: Selección de monto y moneda
- **Paso 2**: Elección de método de pago
- **Paso 3**: Instrucciones de pago
- **Paso 4**: Upload de comprobante

### **Panel Administrativo**
- **Lista**: Solicitudes pendientes
- **Detalles**: Información completa
- **Acciones**: Aprobar/rechazar con notas
- **Comprobantes**: Visualización de archivos

## ⚙️ Configuración Requerida

### **Variables de Entorno**
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/piezasyaya

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# PayPal
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_key
STRIPE_WEBHOOK_SECRET=whsec_tu_secret
```

### **Dependencias NPM**
```json
{
  "mongoose": "^7.0.0",
  "multer": "^1.4.5",
  "nodemailer": "^6.9.0",
  "axios": "^1.4.0"
}
```

## 🔄 Flujo de Validación

### **Automática (PayPal/Stripe)**
1. Usuario completa pago
2. Webhook notifica al sistema
3. Sistema valida con API del proveedor
4. Si válido: acredita automáticamente
5. Email de confirmación al usuario

### **Manual (Zelle/Transferencias)**
1. Usuario sube comprobante
2. Sistema notifica a administradores
3. Administrador revisa comprobante
4. Aprueba/rechaza con notas
5. Si aprobada: acredita saldo
6. Email de notificación al usuario

## 📊 Métricas y Monitoreo

### **Logs Implementados**
- **Creación**: Solicitudes de recarga
- **Validación**: Aprobaciones/rechazos
- **Errores**: Fallos en webhooks
- **Conversiones**: Tasas de cambio aplicadas

### **Notificaciones**
- **Email**: En cada cambio de estado
- **Admin**: Nuevos comprobantes
- **Usuario**: Confirmaciones y rechazos

## 🎯 Beneficios del Sistema

### **Para PiezasYa**
- **Control total**: Validación antes de acreditar
- **Auditoría completa**: Trazabilidad de cada transacción
- **Flexibilidad**: Múltiples métodos de pago
- **Automatización**: Webhooks para pagos instantáneos

### **Para Tiendas**
- **Facilidad**: Proceso guiado paso a paso
- **Transparencia**: Estado visible en tiempo real
- **Seguridad**: Validación antes de acreditar
- **Velocidad**: Acreditación automática (PayPal/Stripe)

### **Para Administradores**
- **Panel centralizado**: Todas las solicitudes en un lugar
- **Información completa**: Detalles de usuario y transacción
- **Control granular**: Aprobar/rechazar con notas
- **Comprobantes**: Visualización de archivos subidos

## 🚀 Próximos Pasos

### **Fase 1: Implementación Básica**
- [x] Modelos de base de datos
- [x] Servicios de tasa de cambio
- [x] Controladores de recarga
- [x] Frontend básico

### **Fase 2: Integración de Pagos**
- [ ] Configurar PayPal en producción
- [ ] Configurar Stripe en producción
- [ ] Implementar webhooks
- [ ] Testing de integración

### **Fase 3: Optimizaciones**
- [ ] Dashboard de métricas
- [ ] Notificaciones push
- [ ] Recarga automática
- [ ] Análisis de fraude

### **Fase 4: Escalabilidad**
- [ ] Redis para caché
- [ ] Queue para procesamiento
- [ ] Monitoreo avanzado
- [ ] Backup automático

## 📞 Soporte

Para dudas sobre la implementación:
- **Documentación**: Este archivo
- **Logs**: Consola del servidor
- **Email**: admin@piezasyaya.com

---

**Sistema implementado por el equipo de desarrollo de PiezasYa** 🚀
