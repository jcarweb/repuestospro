@echo off
echo 🔧 SOLUCIONANDO CONEXIÓN DE RED APP MÓVIL
echo ==========================================
echo.

echo 📋 Problema identificado:
echo    - Backend funcionando en: 192.168.0.110:3001
echo    - App móvil intentando conectar a IPs incorrectas
echo    - Escaneo automático causando colapso
echo.

echo 🧹 Limpiando caché de red...
node clear-network-cache.js

echo.
echo ✅ Configuración actualizada:
echo    - IP fija configurada: 192.168.0.110:3001
echo    - Escaneo automático desactivado
echo    - Modo offline desactivado
echo.

echo 🚀 Para aplicar los cambios:
echo    1. Cierra completamente la app móvil
echo    2. Reinicia la app móvil
echo    3. La app debería conectarse directamente al backend
echo.

echo 🔍 Para verificar:
echo    - Abre el perfil en la app
echo    - No debería haber logs de escaneo de red
echo    - Debería conectarse directamente a 192.168.0.110:3001
echo.

pause
