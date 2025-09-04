@echo off
echo 🔄 REINICIANDO BACKEND PIEZASYAYA
echo ===================================
echo.

echo 🛑 Deteniendo procesos Node.js...
taskkill /F /IM node.exe 2>nul

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Iniciando backend...
cd backend
start "Backend PiezasYA" cmd /k "npm run dev:network"

echo.
echo ✅ Backend reiniciado
echo 📱 Ahora puedes probar la app móvil
echo.

pause
