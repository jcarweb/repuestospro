@echo off
echo 🧹 Limpiando y reiniciando PiezasYA
echo ====================================
echo.

echo 🛑 Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo.
echo 📦 Iniciando frontend limpio...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo 📦 Iniciando backend limpio...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Servidores iniciados limpiamente!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 WhatsApp: Modo simple (solo email)
echo 📧 Las cotizaciones se envían por email
echo.
pause
