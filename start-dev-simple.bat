@echo off
echo 🚀 Iniciando PiezasYA - Modo Simple
echo ====================================
echo.

echo 📦 Iniciando solo frontend...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo 📦 Iniciando backend simple...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 Para detener: Cierra las ventanas de comandos
echo.
pause
