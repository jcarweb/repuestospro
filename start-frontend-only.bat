@echo off
echo 🚀 Iniciando Solo Frontend - PiezasYA
echo =====================================
echo.

echo 🛑 Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo 📦 Iniciando solo frontend...
echo 💡 Para pruebas rápidas sin backend
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
