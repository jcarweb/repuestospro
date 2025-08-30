# Solución Problemas Expo Login e Iconos

## Problemas Identificados

### 1. Error de Icono
```
Unable to resolve asset "./public/icon.png" from "icon" in your app.json or app.config.js
```

### 2. Requerimiento de Login de Expo
```
An Expo user account is required to proceed.
? Email or username » Log in to EAS with email or username
```

## Soluciones Implementadas

### 1. Verificación de Iconos
- **Problema**: El `app.json` referenciaba `"./public/icon.png"` pero el archivo se llama `piezasya.png`
- **Solución**: ✅ Los iconos ya están correctamente configurados en `app.json`
- **Archivos existentes**:
  - `mobile/public/piezasya.png` (41KB)
  - `mobile/public/logo-piezasya-light.png` (56KB)

### 2. Scripts de Inicio Sin Login

#### Script Simple (`start-simple.js`)
```bash
cd mobile
npm run simple
```
- Inicia con configuración mínima
- Usa `--localhost --no-dev-client` para evitar login
- Tiene fallbacks automáticos

#### Script Offline (`start-offline.js`)
```bash
cd mobile
npm run offline
```
- Inicia en modo offline
- Evita completamente la necesidad de login
- Configuración `EXPO_OFFLINE=1`

### 3. Configuración de Expo Local
- **Archivo**: `mobile/expo.config.js`
- **Configuraciones**:
  - `owner: "local"` - Evita login
  - `updates.url: "http://localhost:8081"` - Servidor local
  - `extra.eas.projectId: "local-development"` - Proyecto local

## Comandos Disponibles

### Para Desarrollo Local (Sin Login)
```bash
cd mobile
npm run simple      # Inicio simple sin login
npm run offline     # Modo offline completo
npm run clean       # Limpieza básica
npm run reset       # Reset completo
```

### Para Desarrollo con Login (Opcional)
```bash
cd mobile
npm start           # Inicio normal (requiere login)
npm run android     # Android específico
npm run ios         # iOS específico
```

## Configuración de Red

### Opciones de Conectividad
1. **Localhost** (`--localhost`): Solo red local
2. **LAN** (`--lan`): Red local ampliada
3. **Tunnel** (`--tunnel`): Túnel público (requiere login)
4. **Offline** (`--offline`): Sin conexión externa

### Recomendado para Desarrollo
```bash
npm run simple
```
- Usa localhost por defecto
- No requiere login
- Funciona en red local
- Fallbacks automáticos

## Verificación de la Solución

### 1. Verificar Iconos
```bash
ls mobile/public/
# Debe mostrar:
# - piezasya.png
# - logo-piezasya-light.png
```

### 2. Verificar Configuración
```bash
cat mobile/app.json | grep icon
# Debe mostrar rutas correctas a ./public/piezasya.png
```

### 3. Probar Inicio
```bash
cd mobile
npm run simple
# Debe iniciar sin solicitar login
```

## Troubleshooting

### Si Persiste el Error de Login
1. **Usar modo offline**:
   ```bash
   npm run offline
   ```

2. **Limpiar caché**:
   ```bash
   npm run clean-cache
   ```

3. **Reset completo**:
   ```bash
   npm run reset
   ```

### Si Persiste el Error de Iconos
1. **Verificar archivos**:
   ```bash
   ls -la mobile/public/
   ```

2. **Regenerar iconos** (si es necesario):
   ```bash
   # Copiar un icono existente como icon.png
   cp mobile/public/piezasya.png mobile/public/icon.png
   ```

## Configuración Recomendada para Desarrollo

### Para Desarrollo Local
```json
{
  "scripts": {
    "dev": "npm run simple",
    "dev-offline": "npm run offline",
    "clean": "npm run clean-cache"
  }
}
```

### Variables de Entorno
```bash
export EXPO_OFFLINE=1
export EXPO_NO_DEV_CLIENT=1
```

## Estado de la Solución
✅ **COMPLETADA** - Scripts creados y configurados para desarrollo sin login.

### Próximos Pasos
1. Ejecutar `npm run simple` para iniciar sin problemas
2. Usar `npm run offline` si hay problemas de conectividad
3. Configurar el entorno de desarrollo según las necesidades
