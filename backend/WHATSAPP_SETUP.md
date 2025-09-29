# Configuración de WhatsApp para Venezuela

## 🚀 Opciones Disponibles

### 1. **Simple (Recomendado para Venezuela)**
La opción más estable y confiable para Venezuela.

**Ventajas:**
- ✅ Muy estable
- ✅ No requiere dependencias complejas
- ✅ Fallback automático a email
- ✅ Fácil configuración
- ✅ Sin problemas de compatibilidad

**Configuración:**
```env
WHATSAPP_METHOD=simple
```

**Uso:**
1. Configurar variable: `WHATSAPP_METHOD=simple`
2. Iniciar servidor
3. ¡Listo! El sistema usará email como respaldo

### 2. **Baileys (Avanzado)**
Para usuarios que quieren WhatsApp real.

**Ventajas:**
- ✅ Gratuito
- ✅ No requiere API Key
- ✅ Funciona con cualquier número de WhatsApp
- ✅ Envío de texto y documentos
- ✅ Fácil configuración

**Desventajas:**
- ❌ Requiere dependencias complejas
- ❌ Puede tener problemas de compatibilidad
- ❌ Requiere configuración manual

**Configuración:**
```env
WHATSAPP_METHOD=baileys
```

**Instalación:**
```bash
npm install @whiskeysockets/baileys @hapi/boom pino
```

**Uso:**
1. Al iniciar el servidor, se mostrará un código QR
2. Escanea el código con WhatsApp en tu teléfono
3. ¡Listo! Ya puedes enviar mensajes

### 3. **Twilio (Para empresas con presupuesto)**
Opcional, requiere cuenta de Twilio.

**Ventajas:**
- ✅ Muy confiable
- ✅ API oficial
- ✅ Soporte empresarial
- ✅ Escalable

**Desventajas:**
- ❌ Requiere pago
- ❌ Proceso de verificación complejo para Venezuela

**Configuración:**
```env
WHATSAPP_METHOD=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 4. **WhatsApp Web (Alternativa)**
Usa WhatsApp Web automatizado.

**Ventajas:**
- ✅ Gratuito
- ✅ No requiere API Key
- ✅ Funciona con cualquier número

**Desventajas:**
- ❌ Requiere navegador
- ❌ Menos estable
- ❌ Puede requerir intervención manual

**Configuración:**
```env
WHATSAPP_METHOD=web
WHATSAPP_WEB_ENABLED=true
```

## 🔧 Configuración Recomendada para Venezuela

### Opción 1: Simple (Recomendada)
```env
# .env
WHATSAPP_METHOD=simple
```

**Pasos Automáticos:**
```bash
# Windows
setup-whatsapp-venezuela.bat

# Linux/Mac
chmod +x setup-whatsapp-venezuela.sh
./setup-whatsapp-venezuela.sh
```

**Pasos Manuales:**
1. Configurar variable: `WHATSAPP_METHOD=simple`
2. Iniciar servidor: `npm start`
3. ¡Listo! El sistema usará email como respaldo

### Opción 2: Baileys (Avanzada)
```env
# .env
WHATSAPP_METHOD=baileys
```

**Pasos Manuales:**
1. Instalar dependencias: `npm install @whiskeysockets/baileys @hapi/boom pino`
2. Configurar variable: `WHATSAPP_METHOD=baileys`
3. Iniciar servidor: `npm start`
4. Escanear QR con WhatsApp
5. ¡Listo!

### Opción 3: Solo Email (Sin WhatsApp)
```env
# .env
WHATSAPP_METHOD=none
```

## 📱 Cómo Funciona

### Flujo de Envío de Cotizaciones:
1. **Usuario crea cotización** → Sistema genera PDF
2. **Usuario selecciona envío** → Email, WhatsApp, o ambos
3. **Sistema envía** → Email con PDF adjunto
4. **Si WhatsApp configurado** → Mensaje + PDF por WhatsApp

### Fallback Automático:
- Si WhatsApp falla → Solo se envía por email
- Si email falla → Se muestra error al usuario
- Sistema siempre intenta enviar por email como respaldo

## 🛠️ Solución de Problemas

### Baileys no conecta:
1. Verificar que el QR se escaneó correctamente
2. Reiniciar el servidor
3. Verificar conexión a internet

### Twilio no funciona:
1. Verificar credenciales
2. Verificar que el número esté verificado
3. Revisar saldo de cuenta

### WhatsApp Web falla:
1. Verificar que Chrome esté instalado
2. Verificar permisos del navegador
3. Reiniciar el servicio

## 📞 Soporte

Para problemas específicos de Venezuela:
- Usar Baileys como primera opción
- Email como respaldo siempre
- Considerar servicios de terceros si es necesario

## 🔒 Seguridad

- Los números de teléfono se formatean automáticamente para Venezuela (+58)
- Los mensajes se envían de forma segura
- No se almacenan credenciales de WhatsApp
- Fallback a email si WhatsApp falla
