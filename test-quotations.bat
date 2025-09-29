@echo off
echo 🧪 Probando Sistema de Cotizaciones
echo ====================================
echo.

echo 📦 Iniciando solo frontend para pruebas...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo 📦 Iniciando backend simple...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 🧪 Pasos para probar:
echo    1. Abre http://localhost:3000 en tu navegador
echo    2. Inicia sesión como vendedor o gestor de tienda
echo    3. Ve a "Cotizaciones" → "Nueva Cotización"
echo    4. Agrega productos a la cotización
echo    5. Selecciona "Enviar por email"
echo    6. El sistema enviará la cotización por email
echo.
echo 💡 Nota: WhatsApp está configurado en modo simple
echo    Las cotizaciones se envían por email automáticamente
echo.
pause
