@echo off
chcp 65001 >nul
title 🔍 Diagnóstico React Native - App Móvil PiezasYA

echo.
echo ========================================
echo 🔍 DIAGNÓSTICO REACT NATIVE
echo ========================================
echo.
echo 📱 Error: "Failed to download remote update"
echo 🎯 Objetivo: Diagnosticar problema específico de React Native
echo 📁 Ubicación: Carpeta mobile (React Native)
echo.

echo 🚀 INSTRUCCIONES PARA EL DIAGNÓSTICO:
echo.
echo 📱 EN LA APP MÓVIL (React Native):
echo 1. Abre la app móvil en tu dispositivo/emulador
echo 2. Presiona Ctrl+M (Android) o Cmd+D (iOS) para abrir el menú de desarrollo
echo 3. Selecciona "Debug" o "Debug JS Remotely"
echo 4. Se abrirá una ventana del navegador con la consola de React Native
echo 5. En esa consola, copia y pega el contenido de "diagnose-react-native.js"
echo.
echo 🌐 EN EL NAVEGADOR (Expo Web):
echo 1. Abre la app en el navegador (si usas Expo Web)
echo 2. Presiona F12 para abrir las herramientas de desarrollador
echo 3. Ve a la pestaña "Console"
echo 4. Copia y pega el contenido de "diagnose-react-native.js"
echo.
echo 📁 ARCHIVOS DE DIAGNÓSTICO:
echo - mobile/diagnose-react-native.js (Diagnóstico específico de RN)
echo - mobile/diagnose-service-worker.js (Diagnóstico de Service Worker)
echo.
echo 🔧 FUNCIONES DISPONIBLES DESPUÉS DEL DIAGNÓSTICO:
echo - reactNativeDiagnostic.checkEnvironment() - Verificar entorno RN
echo - reactNativeDiagnostic.checkNetwork() - Verificar errores de red
echo - reactNativeDiagnostic.checkBundling() - Verificar errores de bundling
echo - reactNativeDiagnostic.checkServiceWorker() - Verificar Service Worker
echo - reactNativeDiagnostic.checkRemoteUpdate() - Verificar errores de actualización
echo - reactNativeDiagnostic.generateReport() - Generar reporte completo
echo.

echo 📋 PASOS RECOMENDADOS:
echo 1. Ejecuta el diagnóstico completo primero
echo 2. Revisa los logs para identificar el problema específico
echo 3. Si hay errores de Service Worker, usa el script de Service Worker
echo 4. Si hay errores de React Native, revisa la configuración de Metro/Expo
echo 5. Comparte los logs con el equipo de desarrollo
echo.

echo ⏳ Presiona cualquier tecla para cerrar esta ventana...
pause >nul

exit
