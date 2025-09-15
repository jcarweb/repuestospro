@echo off
echo ========================================
echo   VERIFICANDO ESTADO DEL BACKEND
echo ========================================
echo.

echo 🔍 Verificando si el backend está ejecutándose...
netstat -an | findstr :3001
if %errorlevel% equ 0 (
    echo ✅ Backend está ejecutándose en el puerto 3001
) else (
    echo ❌ Backend NO está ejecutándose en el puerto 3001
)

echo.
echo 🔍 Verificando procesos de Node.js...
tasklist | findstr node.exe
if %errorlevel% equ 0 (
    echo ✅ Hay procesos de Node.js ejecutándose
) else (
    echo ❌ No hay procesos de Node.js ejecutándose
)

echo.
echo 🔍 Verificando si el directorio backend existe...
if exist "..\backend" (
    echo ✅ Directorio backend existe
) else (
    echo ❌ Directorio backend NO existe
)

echo.
echo 🔍 Verificando package.json del backend...
if exist "..\backend\package.json" (
    echo ✅ package.json del backend existe
) else (
    echo ❌ package.json del backend NO existe
)

echo.
echo 🔍 Verificando node_modules del backend...
if exist "..\backend\node_modules" (
    echo ✅ node_modules del backend existe
) else (
    echo ❌ node_modules del backend NO existe
)

echo.
echo 🔍 Verificando archivos compilados del backend...
if exist "..\backend\dist" (
    echo ✅ Directorio dist del backend existe
) else (
    echo ❌ Directorio dist del backend NO existe
)

echo.
echo 🎯 VERIFICACIÓN COMPLETADA
echo ==========================
echo.
pause
