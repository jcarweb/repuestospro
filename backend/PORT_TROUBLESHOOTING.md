# Solución de Problemas de Puerto

## Problema: Puerto 5000 en uso

Si ves el error `EADDRINUSE: address already in use :::5000`, significa que otro proceso está usando el puerto 5000.

## Soluciones

### 1. Automática (Recomendada)
El servidor ahora detecta automáticamente si el puerto está ocupado y busca uno disponible. Si el puerto 5000 está ocupado, usará el siguiente puerto disponible (5001, 5002, etc.).

### 2. Manual - Liberar el puerto
```bash
# Verificar qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Terminar el proceso (reemplaza XXXX con el PID)
taskkill /PID XXXX /F

# O usar el script automático
npm run free-port
```

### 3. Usar un puerto diferente
Puedes cambiar el puerto en el archivo `.env`:
```
PORT=5000
```

## Scripts Útiles

### Verificar estado de puertos
```bash
npm run check-port
```

### Liberar puerto 5000
```bash
npm run free-port
```

### Verificar puerto específico
```bash
node check-ports.js 5000
```

## Prevención

1. **Cerrar procesos anteriores**: Siempre cierra el servidor con `Ctrl+C` antes de iniciarlo nuevamente
2. **Usar diferentes puertos**: Si trabajas en múltiples proyectos, usa puertos diferentes
3. **Script de inicio**: Usa `npm run dev` que maneja automáticamente los conflictos de puerto

## Verificación

Para verificar que el servidor está funcionando:
```bash
# Health check
curl http://localhost:5000/health

# Database status
curl http://localhost:5000/api/db-status
```

## Logs Útiles

El servidor mostrará mensajes como:
- `🚀 Servidor iniciado en puerto 5000` - Puerto configurado disponible
- `⚠️ Puerto 5000 estaba ocupado, usando puerto 5001` - Puerto cambiado automáticamente
- `❌ Error iniciando servidor: No se pudo encontrar un puerto disponible` - Error crítico 