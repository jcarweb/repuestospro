@echo off
echo ========================================
echo    PiezasYA - Inicio Final
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
echo 📦 Instalando dependencias...
call npm run install:all

echo.
echo 🚀 Iniciando servidores...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.

echo Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo Iniciando Backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados en ventanas separadas
echo.
echo Para probar los servicios:
echo npm run test:servers
echo.
echo Presiona cualquier tecla para salir...
pause 