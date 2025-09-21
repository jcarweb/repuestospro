# 🔒 Política de Seguridad - PiezasYA

## Archivos Protegidos

Los siguientes tipos de archivos están protegidos por .gitignore:

- `.env*` - Variables de entorno
- `*SECRET*.md` - Documentación con secretos
- `*CREDENTIALS*.md` - Archivos con credenciales
- `*PASSWORD*.md` - Documentación con contraseñas
- `*API_KEY*.md` - Archivos con claves API
- `*TOKEN*.md` - Documentación con tokens
- `*PRIVATE*.md` - Archivos privados
- `*CONFIDENTIAL*.md` - Documentación confidencial

## Buenas Prácticas

1. **Nunca** commitees archivos .env con credenciales reales
2. **Siempre** usa el archivo .env.example como plantilla
3. **Elimina** archivos de documentación que contengan credenciales
4. **Usa** variables de entorno para todas las configuraciones sensibles
5. **Revisa** el .gitignore regularmente

## Configuración Segura

Para configurar el proyecto de forma segura:

1. Copia `env.example` a `.env`
2. Reemplaza los valores placeholder con tus credenciales reales
3. Nunca commitees el archivo .env

## Limpieza Automática

Ejecuta `node scripts/security-cleanup.js` para eliminar archivos con información sensible.

---
*Última actualización: 2025-09-21T22:18:48.823Z*
