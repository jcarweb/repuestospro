@echo off
echo ========================================
echo   INICIANDO BACKEND CON DEBUG
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🚀 Iniciando backend...
echo.

cd ..\backend
echo 📁 Directorio actual: %CD%
echo.

echo 🔍 Verificando que el backend existe...
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json en el directorio backend
    pause
    exit /b 1
)

echo ✅ Backend encontrado
echo.

echo 🔍 Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️ node_modules no encontrado, instalando dependencias...
    npm install
)

echo.
echo 🚀 Iniciando backend en modo desarrollo...
echo.
echo 📋 Logs del backend:
echo ===================
echo.

npm run dev

echo.
echo 🎯 Backend detenido
pause
