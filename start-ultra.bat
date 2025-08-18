@echo off
echo ========================================
echo    PiezasYA - Inicio Ultra-Rápido
echo ========================================
echo.

echo 🚀 Iniciando servidores...
echo.

start "Frontend" cmd /k "npm run dev:frontend"
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Los servidores se están iniciando...
echo Presiona cualquier tecla para salir...
pause 