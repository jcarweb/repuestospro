@echo off
echo 🔧 SOLUCIONANDO BACKEND PIEZASYAYA
echo ===================================
echo.

echo 📋 Verificando dependencias...
cd backend
npm install

echo.
echo 🚀 Iniciando backend en puerto 3001...
echo.

REM Intentar diferentes métodos de inicio
echo Método 1: Inicio simple...
start "Backend Simple" cmd /k "npm run dev:simple"

timeout /t 5 /nobreak >nul

echo.
echo Método 2: Inicio con red específica...
start "Backend Network" cmd /k "npm run dev:network"

echo.
echo ✅ Backend iniciado en segundo plano
echo 📱 Ahora puedes probar la app móvil
echo.
echo 🔍 Para verificar que funciona:
echo    - Abre http://localhost:3001/api/health
echo    - O ejecuta: node mobile/diagnose-network.js
echo.
pause
