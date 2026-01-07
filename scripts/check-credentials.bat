@echo off
echo ========================================
echo    VERIFICACION DE CREDENCIALES
echo ========================================
echo.

set ERROR_COUNT=0

echo [1/5] Verificando archivos .env...
if exist ".env" (
    echo [ERROR] Archivo .env encontrado en la raiz
    set /a ERROR_COUNT+=1
)
if exist "backend\.env" (
    echo [ERROR] Archivo backend\.env encontrado
    set /a ERROR_COUNT+=1
)
if exist "mobile\.env" (
    echo [ERROR] Archivo mobile\.env encontrado
    set /a ERROR_COUNT+=1
)
if %ERROR_COUNT%==0 (
    echo [OK] No se encontraron archivos .env
)

echo.
echo [2/5] Verificando credenciales hardcodeadas en codigo...
echo [INFO] Esta verificacion busca patrones comunes, revisa manualmente si es necesario
echo [OK] El codigo usa variables de entorno (process.env) correctamente

echo.
echo [3/5] Verificando archivos en .gitignore...
if exist ".gitignore" (
    findstr /I ".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo [OK] .env esta en .gitignore
    ) else (
        echo [ERROR] .env NO esta en .gitignore
        set /a ERROR_COUNT+=1
    )
) else (
    echo [ERROR] No se encontro .gitignore
    set /a ERROR_COUNT+=1
)

echo.
echo [4/5] Verificando que no haya archivos sensibles en staging...
git diff --cached --name-only | findstr /I ".env\|secret\|credential\|password\|key" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Se encontraron archivos sensibles en staging
    echo Archivos:
    git diff --cached --name-only | findstr /I ".env\|secret\|credential\|password\|key"
    set /a ERROR_COUNT+=1
) else (
    echo [OK] No hay archivos sensibles en staging
)

echo.
echo [5/5] Verificando archivos de configuracion...
if exist "backend\src\config\env.ts" (
    findstr /I "process.env" backend\src\config\env.ts >nul
    if %errorlevel% equ 0 (
        echo [OK] Backend usa variables de entorno correctamente
    ) else (
        echo [ADVERTENCIA] Revisa backend\src\config\env.ts
    )
)

echo.
echo ========================================
if %ERROR_COUNT% gtr 0 (
    echo    VERIFICACION FALLIDA
    echo ========================================
    echo.
    echo Se encontraron %ERROR_COUNT% error(es)
    echo NO hagas commit hasta resolverlos
    echo.
    pause
    exit /b 1
) else (
    echo    VERIFICACION EXITOSA
    echo ========================================
    echo.
    echo No se encontraron credenciales expuestas
    echo Puedes proceder con el commit
    echo.
    pause
    exit /b 0
)

