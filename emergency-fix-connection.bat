@echo off
echo ========================================
echo   CORRECCIÓN DE EMERGENCIA - CONECTIVIDAD
echo ========================================
echo.

echo 🚨 PROBLEMA CRÍTICO: Backend Offline
echo 🔧 APLICANDO CORRECCIÓN DEFINITIVA
echo.

echo 🔧 Paso 1: Deteniendo TODOS los procesos...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im expo.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo.
echo 🔧 Paso 2: Verificando que el backend esté disponible...
netstat -an | findstr :3001
if %errorlevel% equ 0 (
    echo ✅ Puerto 3001 está en uso
) else (
    echo ❌ Puerto 3001 está libre
)

echo.
echo 🔧 Paso 3: Limpiando configuraciones problemáticas...
if exist "mobile\.expo" rmdir /s /q "mobile\.expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist "mobile\node_modules\.cache" rmdir /s /q "mobile\node_modules\.cache"

echo.
echo 🔧 Paso 4: Configurando URLs correctas...

echo 📝 Configurando vite.config.ts...
echo import { defineConfig } from 'vite' > vite.config.ts
echo import react from '@vitejs/plugin-react' >> vite.config.ts
echo. >> vite.config.ts
echo export default defineConfig({ >> vite.config.ts
echo   plugins: [react()], >> vite.config.ts
echo   server: { >> vite.config.ts
echo     port: 3000, >> vite.config.ts
echo     host: true, >> vite.config.ts
echo     proxy: { >> vite.config.ts
echo       '/api': { >> vite.config.ts
echo         target: 'http://localhost:3001', >> vite.config.ts
echo         changeOrigin: true, >> vite.config.ts
echo         secure: false >> vite.config.ts
echo       } >> vite.config.ts
echo     } >> vite.config.ts
echo   } >> vite.config.ts
echo }); >> vite.config.ts

echo 📝 Configurando src/config/api.ts...
echo import axios from 'axios'; > src/config/api.ts
echo. >> src/config/api.ts
echo export const API_BASE_URL = 'http://localhost:3001/api'; >> src/config/api.ts
echo export const api = axios.create({ >> src/config/api.ts
echo   baseURL: API_BASE_URL, >> src/config/api.ts
echo   timeout: 10000, >> src/config/api.ts
echo   headers: { >> src/config/api.ts
echo     'Content-Type': 'application/json', >> src/config/api.ts
echo   }, >> src/config/api.ts
echo }); >> src/config/api.ts

echo.
echo 🔧 Paso 5: Iniciando backend en localhost...
start "Backend Localhost" cmd /k "cd backend && npx ts-node --transpile-only ./src/index.ts"

echo.
echo ⏳ Esperando 15 segundos para que el backend inicie completamente...
timeout /t 15 /nobreak >nul

echo.
echo 🔧 Paso 6: Verificando que el backend responda...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde - reintentando...
    timeout /t 5 /nobreak >nul
    curl -s http://localhost:3001/api/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Backend responde en segundo intento
    ) else (
        echo ❌ Backend sigue sin responder
    )
)

echo.
echo 🔧 Paso 7: Iniciando frontend web...
start "Frontend Web" cmd /k "npm run dev"

echo.
echo ⏳ Esperando 10 segundos para que el frontend inicie...
timeout /t 10 /nobreak >nul

echo.
echo 🔧 Paso 8: Iniciando app móvil (modo localhost)...
start "App Móvil" cmd /k "cd mobile && npx expo start --clear --localhost"

echo.
echo ✅ CORRECCIÓN DE EMERGENCIA COMPLETADA
echo =====================================
echo.
echo 📋 URLs de acceso:
echo    • Frontend Web: http://localhost:3000
echo    • Backend API: http://localhost:3001/api
echo    • App Móvil: http://localhost:8081
echo.
echo 🎯 VERIFICAR:
echo    1. Frontend web debe mostrar panel sin "Backend Offline"
echo    2. App móvil debe permitir login
echo    3. Backend debe responder en http://localhost:3001/api/health
echo.
echo 🚨 Si persiste el problema:
echo    - Verificar que no hay firewall bloqueando
echo    - Verificar que el puerto 3001 no está ocupado por otro proceso
echo    - Reiniciar completamente el sistema
echo.
pause
