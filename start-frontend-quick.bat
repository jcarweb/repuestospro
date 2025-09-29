@echo off
echo 🚀 Inicio Rápido - Solo Frontend
echo =================================
echo.

echo 🛑 Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo 🧹 Limpiando cache de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo 📦 Iniciando solo frontend...
echo 💡 Para navegar por la interfaz sin backend
echo.

start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ✅ Frontend iniciado!
echo.
echo 🌐 URL: http://localhost:3000
echo.
echo 💡 Nota: Sin backend, algunas funciones no estarán disponibles
echo    Pero puedes navegar por la interfaz y ver las cotizaciones
echo.
pause
