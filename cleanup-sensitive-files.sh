#!/bin/bash

echo "🔒 Limpiando archivos sensibles del proyecto..."
echo

echo "📋 Eliminando documentos de seguridad..."
rm -f SECURITY_*.md
rm -f *SECURITY*.md
rm -f *IMPROVEMENTS*.md
rm -f *CORRECTION*.md
rm -f *SUMMARY*.md
rm -f *EJECUTIVO*.md
rm -f *PROFESIONAL*.md
rm -f *IMPLEMENTACION*.md
rm -f *GUIDELINES*.md
rm -f *CONTEXTO*.md
rm -f *ROLES*.md
rm -f *SISTEMA*.md
rm -f *TAREAS*.md
rm -f *PLAN*.md
rm -f *INTEGRACION*.md
rm -f *INTERNACIONALIZACION*.md
rm -f *BACKEND*.md
rm -f *TUNNEL*.md
rm -f *GUIA*.md
rm -f *INSTRUCCIONES*.md
rm -f *DIAGNOSTICO*.md
rm -f *TROUBLESHOOTING*.md

echo "📋 Eliminando scripts de debug..."
rm -f backend/src/scripts/debug*.js
rm -f backend/src/scripts/test*.js
rm -f backend/src/scripts/fix*.js
rm -f backend/src/scripts/force*.js
rm -f backend/src/scripts/simple*.js
rm -f backend/src/scripts/check*.js
rm -f backend/src/scripts/reset*.js
rm -f backend/src/scripts/diagnose*.js
rm -f backend/test-*.js
rm -f backend/verify-*.js
rm -f backend/check-*.js
rm -f backend/debug-*.js
rm -f backend/create-*.js
rm -f backend/search-*.js
rm -f backend/start-with-specific-ip.js
rm -f backend/setup-env.js
rm -f fix-env-vars.js

echo "📋 Eliminando datos reales..."
rm -f backend/real-*.csv
rm -f backend/productos-ejemplo.csv
rm -f backend/profile-data.json
rm -f backend/*-data.json
rm -f backend/*-example.csv
rm -f backend/*-sample.csv

echo "📋 Eliminando archivos temporales..."
rm -f backend/*.backup
rm -f backend/*.bak
rm -f backend/*.old
rm -f backend/*.tmp
rm -f backend/*.temp
rm -f backend/{
rm -f backend/}

echo "📋 Eliminando scripts de mobile debug..."
rm -f mobile/test-*.bat
rm -f mobile/start-*.bat
rm -f mobile/force-*.bat
rm -f mobile/clear-*.bat
rm -f mobile/disable-*.js
rm -f mobile/diagnose-*.js
rm -f mobile/check-*.js
rm -f mobile/backend-*.js
rm -f mobile/change-*.js

echo "📋 Eliminando directorio mobile-backup..."
rm -rf mobile-backup

echo "📋 Eliminando scripts de setup..."
rm -f scripts/setup-*.js
rm -f scripts/security-*.js
rm -f scripts/pre-commit-*.js
rm -f scripts/migrate-*.js
rm -f scripts/*-cleanup.js
rm -f scripts/*-security.js

echo
echo "✅ Limpieza completada!"
echo
echo "📋 Archivos eliminados:"
echo "   - Documentos de seguridad con información sensible"
echo "   - Scripts de debug y testing"
echo "   - Datos reales de usuarios y productos"
echo "   - Archivos temporales y de backup"
echo "   - Scripts de mobile debug"
echo
echo "🔒 El proyecto está ahora limpio y listo para commit"
echo
