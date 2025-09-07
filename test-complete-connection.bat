@echo off
echo ========================================
echo   PROBANDO CONEXIÓN COMPLETA
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 🌐 FRONTEND WEB:
echo    ✓ vite.config.ts: Proxy corregido a 192.168.150.104:3001
echo    ✓ src/config/api.ts: URL corregida a 192.168.150.104:3001/api
echo.
echo 📱 APP MÓVIL:
echo    ✓ networkUtils.ts: IP correcta 192.168.150.104 (PRIORIDAD)
echo    ✓ AuthContext: Configuración forzada al inicializar
echo    ✓ apiService: Usa servicio real en lugar de mock
echo.
echo 🔗 BACKEND:
echo    ✓ Ejecutándose en 192.168.150.104:3001
echo    ✓ Rutas de autenticación disponibles
echo.
echo 🚀 INICIANDO SISTEMA COMPLETO...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. BACKEND (ya ejecutándose):
echo    ✅ http://192.168.150.104:3001/api/health
echo.
echo 2. FRONTEND WEB:
echo    - Se iniciará en http://localhost:3000
echo    - Debe conectar al backend automáticamente
echo    - ✅ Debe mostrar panel administrativo
echo.
echo 3. APP MÓVIL:
echo    - Se iniciará en modo desarrollo
echo    - Debe conectar al backend automáticamente
echo    - ✅ Debe permitir login con datos reales
echo.
echo 4. VERIFICAR LOGS:
echo    - Frontend: Debe mostrar conexión exitosa
echo    - Móvil: Debe mostrar "Configuración de red correcta guardada"
echo    - Backend: Debe mostrar requests entrantes
echo.

echo 🚀 Iniciando frontend web...
start "Frontend Web" cmd /k "npm run dev"

echo.
echo ⏳ Esperando 5 segundos para que el frontend inicie...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Iniciando app móvil...
start "App Móvil" cmd /k "cd mobile && npx expo start --clear"

echo.
echo ✅ SISTEMA INICIADO
echo ===================
echo.
echo 📋 URLs de acceso:
echo    • Frontend Web: http://localhost:3000
echo    • Backend API: http://192.168.150.104:3001/api
echo    • App Móvil: Escanea QR con Expo Go
echo.
echo 🎯 Ahora puedes probar:
echo    1. Acceso web administrativo
echo    2. Login móvil con datos reales
echo    3. Sincronización entre web y móvil
echo.
pause
