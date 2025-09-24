@echo off
echo 🔄 Cambio de Backend - PiezasYA Mobile
echo.

echo 📋 Backends disponibles:
echo   1. Local Development (192.168.0.106:5000)
echo   2. Render Production (piezasya-back.onrender.com)
echo   3. Localhost (localhost:5000)
echo.

set /p choice="Selecciona el backend (1-3): "

if "%choice%"=="1" (
    echo ✅ Configurando para backend LOCAL...
    node change-backend.js 1
) else if "%choice%"=="2" (
    echo ✅ Configurando para backend RENDER...
    node change-backend.js 2
) else if "%choice%"=="3" (
    echo ✅ Configurando para backend LOCALHOST...
    node change-backend.js 3
) else (
    echo ❌ Opción inválida, usando LOCAL por defecto
    node change-backend.js 1
)

echo.
echo 📱 Próximos pasos:
echo 1. Reinicia la aplicación móvil
echo 2. La app usará el backend seleccionado
echo 3. Verifica en los logs que las peticiones van al backend correcto
echo.
pause
