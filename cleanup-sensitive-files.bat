@echo off
echo 🔒 Limpiando archivos sensibles del proyecto...
echo.

echo 📋 Eliminando documentos de seguridad...
del /Q SECURITY_*.md 2>nul
del /Q *SECURITY*.md 2>nul
del /Q *IMPROVEMENTS*.md 2>nul
del /Q *CORRECTION*.md 2>nul
del /Q *SUMMARY*.md 2>nul
del /Q *EJECUTIVO*.md 2>nul
del /Q *PROFESIONAL*.md 2>nul
del /Q *IMPLEMENTACION*.md 2>nul
del /Q *GUIDELINES*.md 2>nul
del /Q *CONTEXTO*.md 2>nul
del /Q *ROLES*.md 2>nul
del /Q *SISTEMA*.md 2>nul
del /Q *TAREAS*.md 2>nul
del /Q *PLAN*.md 2>nul
del /Q *INTEGRACION*.md 2>nul
del /Q *INTERNACIONALIZACION*.md 2>nul
del /Q *BACKEND*.md 2>nul
del /Q *TUNNEL*.md 2>nul
del /Q *GUIA*.md 2>nul
del /Q *INSTRUCCIONES*.md 2>nul
del /Q *DIAGNOSTICO*.md 2>nul
del /Q *TROUBLESHOOTING*.md 2>nul

echo 📋 Eliminando scripts de debug...
del /Q backend\src\scripts\debug*.js 2>nul
del /Q backend\src\scripts\test*.js 2>nul
del /Q backend\src\scripts\fix*.js 2>nul
del /Q backend\src\scripts\force*.js 2>nul
del /Q backend\src\scripts\simple*.js 2>nul
del /Q backend\src\scripts\check*.js 2>nul
del /Q backend\src\scripts\reset*.js 2>nul
del /Q backend\src\scripts\diagnose*.js 2>nul
del /Q backend\test-*.js 2>nul
del /Q backend\verify-*.js 2>nul
del /Q backend\check-*.js 2>nul
del /Q backend\debug-*.js 2>nul
del /Q backend\create-*.js 2>nul
del /Q backend\search-*.js 2>nul
del /Q backend\start-with-specific-ip.js 2>nul
del /Q backend\setup-env.js 2>nul
del /Q fix-env-vars.js 2>nul

echo 📋 Eliminando datos reales...
del /Q backend\real-*.csv 2>nul
del /Q backend\productos-ejemplo.csv 2>nul
del /Q backend\profile-data.json 2>nul
del /Q backend\*-data.json 2>nul
del /Q backend\*-example.csv 2>nul
del /Q backend\*-sample.csv 2>nul

echo 📋 Eliminando archivos temporales...
del /Q backend\*.backup 2>nul
del /Q backend\*.bak 2>nul
del /Q backend\*.old 2>nul
del /Q backend\*.tmp 2>nul
del /Q backend\*.temp 2>nul
del /Q backend\{ 2>nul
del /Q backend\} 2>nul

echo 📋 Eliminando scripts de mobile debug...
del /Q mobile\test-*.bat 2>nul
del /Q mobile\start-*.bat 2>nul
del /Q mobile\force-*.bat 2>nul
del /Q mobile\clear-*.bat 2>nul
del /Q mobile\disable-*.js 2>nul
del /Q mobile\diagnose-*.js 2>nul
del /Q mobile\check-*.js 2>nul
del /Q mobile\backend-*.js 2>nul
del /Q mobile\change-*.js 2>nul

echo 📋 Eliminando directorio mobile-backup...
rmdir /S /Q mobile-backup 2>nul

echo 📋 Eliminando scripts de setup...
del /Q scripts\setup-*.js 2>nul
del /Q scripts\security-*.js 2>nul
del /Q scripts\pre-commit-*.js 2>nul
del /Q scripts\migrate-*.js 2>nul
del /Q scripts\*-cleanup.js 2>nul
del /Q scripts\*-security.js 2>nul

echo.
echo ✅ Limpieza completada!
echo.
echo 📋 Archivos eliminados:
echo   - Documentos de seguridad con información sensible
echo   - Scripts de debug y testing
echo   - Datos reales de usuarios y productos
echo   - Archivos temporales y de backup
echo   - Scripts de mobile debug
echo.
echo 🔒 El proyecto está ahora limpio y listo para commit
echo.
pause
