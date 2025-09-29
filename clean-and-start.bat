@echo off
echo 🧹 Limpieza Completa y Reinicio
echo ================================
echo.

echo 🛑 Deteniendo todos los procesos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM brave.exe 2>nul

echo.
echo 🧹 Limpiando cache completo...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
if exist backend\dist rmdir /s /q backend\dist
if exist .vite rmdir /s /q .vite

echo.
echo 📦 Reinstalando dependencias...
npm install

echo.
echo 🔨 Compilando backend...
cd backend
npm run build
cd ..

echo.
echo 🚀 Iniciando sistema limpio...
start "Frontend" cmd /k "npm run dev:frontend"

echo.
echo ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo 📦 Iniciando backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Sistema iniciado completamente limpio!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
pause
