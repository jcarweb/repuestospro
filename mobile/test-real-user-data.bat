@echo off
echo ========================================
echo   PROBANDO DATOS REALES DEL USUARIO
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 🔗 SERVICIO DE API REAL:
echo    ✓ Cambiado de offlineApiService a apiService
echo    ✓ Agregados métodos getUserProfile y updateUserProfile
echo    ✓ Conexión real con MongoDB
echo.
echo 🔗 AUTHCONTEXT:
echo    ✓ Usa apiService en lugar de offlineApiService
echo    ✓ Agregada función loadUserProfile
echo    ✓ Carga datos reales del backend
echo.
echo 🔗 EDITPROFILESCREEN:
echo    ✓ Usa apiService.updateUserProfile
echo    ✓ Guarda datos reales en MongoDB
echo    ✓ Mantiene datos locales como backup
echo.
echo 🔗 PROFILESCREEN:
echo    ✓ Carga datos reales del backend primero
echo    ✓ Usa datos locales como fallback
echo    ✓ Logs detallados del proceso
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN CON USUARIO ADMIN:
echo    - Login: somoselson@gmail.com / 123456Aa@
echo    - ✅ Debe cargar datos reales del usuario
echo    - ✅ Debe mostrar nombre real del usuario
echo    - ✅ Debe mostrar rol Admin
echo    - ✅ Debe mostrar foto real si existe
echo.
echo 2. VERIFICAR PERFIL:
echo    - Ve a Perfil
echo    - ✅ Debe mostrar datos reales de MongoDB
echo    - ✅ Debe mostrar coordenadas reales
echo    - ✅ Debe mostrar información completa
echo.
echo 3. EDITAR PERFIL:
echo    - Ve a Editar Perfil
echo    - ✅ Debe cargar datos reales
echo    - ✅ Debe permitir editar y guardar
echo    - ✅ Debe guardar en MongoDB
echo.
echo 4. VERIFICAR LOGS:
echo    - Revisa la consola
echo    - ✅ Debe mostrar "Cargando datos reales del usuario desde el backend"
echo    - ✅ Debe mostrar "Perfil del usuario cargado desde backend"
echo    - ✅ Debe mostrar datos reales del usuario
echo.

cd mobile
npx expo start --clear
