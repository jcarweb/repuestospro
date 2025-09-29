@echo off
echo 🚀 Iniciando PiezasYA - Modo Simple (Sin WhatsApp)
echo ==================================================
echo.

echo 📦 Iniciando frontend...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo 📦 Iniciando backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 WhatsApp: Configurado en modo simple (solo email)
echo 📧 Las cotizaciones se enviarán por email
echo.
echo 🧪 Para probar:
echo    1. Ve a http://localhost:3000
echo    2. Inicia sesión como vendedor o gestor de tienda
echo    3. Ve a "Cotizaciones" → "Nueva Cotización"
echo    4. Crea una cotización y selecciona "Enviar por email"
echo.
pause
