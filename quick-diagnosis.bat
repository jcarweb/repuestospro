@echo off
echo ========================================
echo   DIAGNÓSTICO RÁPIDO DE CONECTIVIDAD
echo ========================================
echo.

echo 🔍 Verificando estado del sistema...
echo.

echo 📊 1. Procesos de Node.js ejecutándose:
tasklist | findstr node.exe
if %errorlevel% equ 0 (
    echo ✅ Hay procesos de Node.js ejecutándose
) else (
    echo ❌ No hay procesos de Node.js ejecutándose
)

echo.
echo 📊 2. Puerto 3001 (Backend):
netstat -an | findstr :3001
if %errorlevel% equ 0 (
    echo ✅ Puerto 3001 está en uso
) else (
    echo ❌ Puerto 3001 está libre
)

echo.
echo 📊 3. Puerto 3000 (Frontend):
netstat -an | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Puerto 3000 está en uso
) else (
    echo ❌ Puerto 3000 está libre
)

echo.
echo 📊 4. Puerto 8081 (Metro/Expo):
netstat -an | findstr :8081
if %errorlevel% equ 0 (
    echo ✅ Puerto 8081 está en uso
) else (
    echo ❌ Puerto 8081 está libre
)

echo.
echo 📊 5. Probando conectividad al backend:
curl -s http://localhost:3001/api/health
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde
)

echo.
echo 📊 6. Probando conectividad al frontend:
curl -s http://localhost:3000
if %errorlevel% equ 0 (
    echo ✅ Frontend responde correctamente
) else (
    echo ❌ Frontend no responde
)

echo.
echo 🎯 DIAGNÓSTICO COMPLETADO
echo =========================
echo.
echo 💡 Si hay problemas:
echo    - Ejecutar: emergency-fix-connection.bat
echo    - Verificar firewall de Windows
echo    - Reiniciar completamente el sistema
echo.
pause
