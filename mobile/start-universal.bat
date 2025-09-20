@echo off
echo ========================================
echo    PIEZASYA MOBILE - INICIO UNIVERSAL
echo ========================================
echo.

echo Probando diferentes opciones de inicio...
echo.

echo Opcion 1: Tunneling (Recomendado)
echo - Presiona cualquier tecla para probar tunneling
pause >nul

echo.
echo Iniciando con tunneling...
npx expo start --tunnel

echo.
echo ========================================
echo    SI TUNNELING FALLA, USA LOCALHOST
echo ========================================
echo.
echo Si el tunneling no funciona:
echo 1. Presiona Ctrl+C para detener
echo 2. Ejecuta: npx expo start --localhost
echo 3. Conecta tu dispositivo por USB
echo.
pause
