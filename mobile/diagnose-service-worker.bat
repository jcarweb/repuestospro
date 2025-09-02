@echo off
chcp 65001 >nul
title 🔍 Diagnóstico Service Worker - App Móvil PiezasYA

echo.
echo ========================================
echo 🔍 DIAGNÓSTICO SERVICE WORKER
echo ========================================
echo.
echo 📱 Error: "Failed to download remote update"
echo 🎯 Objetivo: Diagnosticar problema en app móvil React Native
echo 📁 Ubicación: Carpeta mobile (React Native)
echo.

echo 🚀 Abriendo navegador para diagnóstico...
echo.

REM Abrir la página principal en el navegador (ajustar URL según tu configuración)
start "" "http://localhost:8081"

echo ✅ Navegador abierto
echo.
echo 📋 INSTRUCCIONES PARA EL DIAGNÓSTICO:
echo.
echo 1. En el navegador que se abrió, presiona F12 para abrir las herramientas de desarrollador
echo 2. Ve a la pestaña "Console"
echo 3. Copia y pega el contenido del archivo "diagnose-service-worker.js"
echo 4. Presiona Enter para ejecutar el diagnóstico
echo 5. Revisa los logs que aparecen en la consola
echo 6. Si hay errores, ejecuta: serviceWorkerDiagnostic.forceClean()
echo 7. Luego ejecuta: serviceWorkerDiagnostic.registerNew()
echo.
echo 📁 Archivo de diagnóstico: mobile/diagnose-service-worker.js
echo 🌐 URL de desarrollo: http://localhost:8081 (ajustar según tu configuración)
echo.

echo ⏳ Presiona cualquier tecla para cerrar esta ventana...
pause >nul

exit
