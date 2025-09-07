@echo off
echo ========================================
echo   PROBANDO CORRECCIONES DE LAYOUT
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📱 SCROLL FUNCIONAL:
echo    ✓ Envuelto en SafeAreaView y ScrollView
echo    ✓ Scroll vertical habilitado
echo    ✓ Indicador de scroll visible
echo    ✓ Padding inferior para navegación
echo.
echo 📏 MARGEN SUPERIOR:
echo    ✓ SafeAreaView respeta el área segura
echo    ✓ Margen superior agregado al header
echo    ✓ No interfiere con el reloj del celular
echo.
echo 📝 DESBORDAMIENTO DE TEXTO:
echo    ✓ infoValue con flex: 1 y flexWrap
echo    ✓ infoLabel con ancho fijo (120px)
echo    ✓ infoRow con alignItems: flex-start
echo    ✓ Texto largo se ajusta correctamente
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. PROBAR SCROLL:
echo    - Ve a la pantalla de Perfil
echo    - ✅ Debe poder hacer scroll vertical
echo    - ✅ Debe ver el indicador de scroll
echo    - ✅ El contenido debe ser scrolleable
echo.
echo 3. PROBAR MARGEN SUPERIOR:
echo    - ✅ El header no debe interferir con el reloj
echo    - ✅ Debe haber espacio adecuado arriba
echo.
echo 4. PROBAR TEXTO LARGO:
echo    - Ve a Perfil → Editar
echo    - Cambia la dirección por una muy larga
echo    - Guarda y regresa a Perfil
echo    - ✅ El texto debe ajustarse sin desbordarse
echo    - ✅ Debe verse completo en múltiples líneas
echo.

cd mobile
npx expo start --clear
