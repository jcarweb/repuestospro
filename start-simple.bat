@echo off
echo ========================================
echo    Iniciando RepuestosPro
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
echo 🚀 Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 🚀 Iniciando Backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados en ventanas separadas
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Presiona cualquier tecla para salir...
pause 