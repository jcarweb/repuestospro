@echo off
echo 🚀 Iniciando PiezasYA - Frontend y Backend
echo.

REM Detener procesos existentes
echo 🛑 Deteniendo procesos existentes...
taskkill /f /im node.exe >nul 2>&1

REM Esperar un momento
timeout /t 2 /nobreak >nul

echo 📦 Iniciando Frontend (Vite) en puerto 3000...
start "Frontend" cmd /k "npm run dev:frontend"

REM Esperar un momento para que el frontend se inicie
timeout /t 3 /nobreak >nul

echo 🔧 Iniciando Backend en puerto 5000...
start "Backend" cmd /k "cd backend && npm run dev"

REM Esperar un momento para que el backend se inicie
timeout /t 3 /nobreak >nul

echo.
echo ✅ Servidores iniciados:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 📋 Para detener los servidores, cierra las ventanas de comandos
echo    o ejecuta: taskkill /f /im node.exe
echo.

REM Mantener la ventana abierta
pause
