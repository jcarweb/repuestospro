# 🔒 Guías de Seguridad - PiezasYA

## ⚠️ IMPORTANTE: Protección de Credenciales

### Archivos Protegidos por .gitignore

Los siguientes tipos de archivos están **AUTOMÁTICAMENTE EXCLUIDOS** del control de versiones:

```
# Variables de entorno
.env
.env.local
.env.development
.env.production
.env.staging
.env.test
*.env

# Archivos de credenciales
config/secrets.json
credentials.json
secrets/

# Documentación sensible
*SECRET*.md
*CREDENTIALS*.md
*PASSWORD*.md
*API_KEY*.md
*TOKEN*.md
*PRIVATE*.md
*CONFIDENTIAL*.md
```

## 🛡️ Buenas Prácticas de Seguridad

### 1. Variables de Entorno
- ✅ **SIEMPRE** usa variables de entorno para credenciales
- ✅ **NUNCA** hardcodees secretos en el código
- ✅ **USA** el archivo `env.example` como plantilla
- ❌ **NUNCA** commitees archivos `.env` con credenciales reales

### 2. Documentación
- ✅ **ELIMINA** archivos .md que contengan credenciales
- ✅ **USA** placeholders en la documentación
- ✅ **REVISA** el .gitignore regularmente
- ❌ **NUNCA** publiques secretos en documentación

### 3. Configuración del Proyecto

#### Frontend (React/Vite)
```bash
# Copiar plantilla
cp env.example .env

# Editar con credenciales reales
nano .env
```

#### Backend (Node.js/Express)
```bash
# Variables requeridas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Limpieza Automática

Ejecuta el script de limpieza para eliminar archivos sensibles:

```bash
node scripts/security-cleanup.js
```

## 🔍 Verificación de Seguridad

### Antes de cada commit:
1. Verifica que no hay archivos `.env` en el staging area
2. Revisa que no hay credenciales hardcodeadas
3. Confirma que la documentación no contiene secretos
4. Ejecuta el script de limpieza si es necesario

### Comandos útiles:
```bash
# Verificar archivos en staging
git status

# Buscar credenciales en el código
grep -r "password\|secret\|token\|api_key" src/ --exclude-dir=node_modules

# Verificar .gitignore
git check-ignore .env
```

## 🚨 Incidentes de Seguridad

Si accidentalmente se commitean credenciales:

1. **INMEDIATAMENTE** revoca las credenciales expuestas
2. **ELIMINA** el archivo del historial de git
3. **ACTUALIZA** las credenciales en todos los entornos
4. **REVISA** el .gitignore para evitar futuros incidentes

## 📋 Checklist de Seguridad

- [ ] Archivos `.env` están en `.gitignore`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] La documentación no contiene secretos
- [ ] Se usa `env.example` como plantilla
- [ ] Las credenciales están rotadas regularmente
- [ ] El script de limpieza se ejecuta periódicamente

---
*Última actualización: ${new Date().toISOString()}*
