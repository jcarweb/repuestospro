@echo off
echo 🚀 Iniciando PiezasYA - Sin WhatsApp
echo ====================================
echo.

echo 🛑 Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo 📦 Iniciando frontend...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo 📦 Iniciando backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Sistema iniciado sin WhatsApp!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 WhatsApp: Deshabilitado temporalmente
echo 📧 Solo email disponible para cotizaciones
echo.
echo 🧪 Para probar:
echo    1. Ve a http://localhost:3000
echo    2. Inicia sesión como vendedor o gestor
echo    3. Ve a "Cotizaciones" → "Nueva Cotización"
echo    4. Crea cotización y selecciona "Enviar por email"
echo.
pause
