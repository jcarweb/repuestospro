@echo off
echo ========================================
echo   SOLUCIÓN SIMPLE DE RED
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🎯 PROBLEMA IDENTIFICADO:
echo    • Backend: 192.168.150.104:3001
echo    • Frontend: 192.168.0.110:3000
echo    • Diferentes subredes = Sin comunicación
echo.

echo 💡 SOLUCIÓN: Usar localhost para ambos
echo.

echo 🔧 Actualizando configuración...
echo.

echo 📝 Actualizando vite.config.ts...
powershell -Command "(Get-Content 'vite.config.ts') -replace '192.168.150.104:3001', 'localhost:3001' | Set-Content 'vite.config.ts'"

echo 📝 Actualizando src/config/api.ts...
powershell -Command "(Get-Content 'src/config/api.ts') -replace '192.168.150.104:3001', 'localhost:3001' | Set-Content 'src/config/api.ts'"

echo 📝 Actualizando mobile/src/utils/networkUtils.ts...
powershell -Command "(Get-Content 'mobile/src/utils/networkUtils.ts') -replace '192.168.150.104:3001', 'localhost:3001' | Set-Content 'mobile/src/utils/networkUtils.ts'"

echo.
echo ✅ CONFIGURACIÓN ACTUALIZADA
echo ============================
echo.
echo 🚀 Iniciando sistema con localhost...
echo.

echo 🔧 Iniciando backend en localhost:3001...
start "Backend" cmd /k "cd backend && node start-localhost.js"

echo.
echo ⏳ Esperando 10 segundos para que el backend inicie...
timeout /t 10 /nobreak >nul

echo.
echo 🔧 Iniciando frontend en localhost:3000...
start "Frontend" cmd /k "npm run dev"

echo.
echo ⏳ Esperando 5 segundos para que el frontend inicie...
timeout /t 5 /nobreak >nul

echo.
echo 🔧 Iniciando app móvil (sin túnel)...
start "App Móvil" cmd /k "cd mobile && npx expo start --clear --localhost"

echo.
echo ✅ SISTEMA INICIADO CON LOCALHOST
echo =================================
echo.
echo 📋 URLs de acceso:
echo    • Frontend Web: http://localhost:3000
echo    • Backend API: http://localhost:3001/api
echo    • App Móvil: http://localhost:8081 (Metro)
echo.
echo 🎯 Ahora debería funcionar:
echo    1. ✅ Frontend web conecta al backend
echo    2. ✅ App móvil conecta al backend
echo    3. ✅ Sin problemas de túnel
echo.
pause
