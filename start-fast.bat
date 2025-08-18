@echo off
echo ========================================
echo    PiezasYA - Inicio Rápido
echo ========================================
echo.

echo 🔧 Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidores en paralelo...
echo.

echo Iniciando Frontend en puerto 3000...
start "Frontend" cmd /k "npm run dev:frontend"

echo Iniciando Backend en puerto 5000...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Esperando 20 segundos para que los servidores se inicien...
timeout /t 20 /nobreak > nul

echo.
echo 🔍 Probando servicios...
call npm run test:servers

echo.
echo Presiona cualquier tecla para salir...
pause 