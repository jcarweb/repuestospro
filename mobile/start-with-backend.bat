@echo off
echo 🚀 Iniciando PiezasYA Mobile con selección de backend
echo.

echo 📋 Backends disponibles:
echo   1. Local (192.168.0.106:5000)
echo   2. Render (https://piezasya-back.onrender.com)
echo   3. Localhost (localhost:5000)
echo.

set /p choice="Selecciona el backend (1-3): "

if "%choice%"=="1" (
    echo ✅ Configurando para backend LOCAL...
    set EXPO_BACKEND_ENV=local
) else if "%choice%"=="2" (
    echo ✅ Configurando para backend RENDER...
    set EXPO_BACKEND_ENV=render
) else if "%choice%"=="3" (
    echo ✅ Configurando para backend LOCALHOST...
    set EXPO_BACKEND_ENV=localhost
) else (
    echo ❌ Opción inválida, usando LOCAL por defecto
    set EXPO_BACKEND_ENV=local
)

echo.
echo 🌐 Iniciando Expo con backend: %EXPO_BACKEND_ENV%
echo.

npx expo start --lan

pause
