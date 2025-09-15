@echo off
echo ========================================
echo    PiezasYA - Ecommerce
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
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidores...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Presiona Ctrl+C para detener los servidores
echo.

call npm run dev

pause 