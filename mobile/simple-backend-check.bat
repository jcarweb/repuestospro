@echo off
echo Verificando estado del backend...
netstat -an | findstr :3001
echo.
echo Verificando procesos de Node.js...
tasklist | findstr node.exe
echo.
echo Verificando directorio backend...
dir ..\backend
echo.
pause
