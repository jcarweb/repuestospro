@echo off
echo ========================================
echo    CONFIGURACION DE AUTENTICACION GIT
echo ========================================
echo.

echo Este script te ayudara a configurar la autenticacion con GitHub
echo.
echo IMPORTANTE: GitHub ya no acepta contraseñas.
echo Necesitas crear un Personal Access Token (PAT)
echo.

echo [1/3] Verificando configuracion actual...
git remote -v
echo.

echo [2/3] Opciones de configuracion:
echo.
echo 1. Usar Token de Acceso Personal (PAT) - Recomendado
echo 2. Configurar SSH
echo 3. Solo mostrar instrucciones
echo.
set /p OPTION="Selecciona una opcion (1-3): "

if "%OPTION%"=="1" goto :setup_token
if "%OPTION%"=="2" goto :setup_ssh
if "%OPTION%"=="3" goto :show_instructions
goto :end

:setup_token
echo.
echo ========================================
echo    CONFIGURAR CON TOKEN
echo ========================================
echo.
echo Para crear un token:
echo 1. Ve a: https://github.com/settings/tokens
echo 2. Click en "Generate new token (classic)"
echo 3. Selecciona el scope "repo"
echo 4. Copia el token generado
echo.
set /p TOKEN="Pega tu token aqui: "
if "%TOKEN%"=="" (
    echo ERROR: Token no puede estar vacio
    pause
    exit /b 1
)

echo.
echo Configurando remote con token...
git remote set-url origin https://%TOKEN%@github.com/jcarweb/repuestospro.git
echo.
echo [OK] Remote configurado
echo.
echo Probando conexion...
git fetch
if %errorlevel% equ 0 (
    echo [OK] Conexion exitosa!
    echo.
    echo NOTA: El token esta en la URL del remote.
    echo Para mayor seguridad, considera usar Git Credential Manager.
) else (
    echo [ERROR] Fallo la conexion. Verifica el token.
)
goto :end

:setup_ssh
echo.
echo ========================================
echo    CONFIGURAR CON SSH
echo ========================================
echo.
echo Verificando si existe clave SSH...
if exist "%USERPROFILE%\.ssh\id_ed25519.pub" (
    echo [OK] Clave SSH encontrada
    echo.
    echo Tu clave publica es:
    type "%USERPROFILE%\.ssh\id_ed25519.pub"
    echo.
    echo Copia esta clave y agregala en:
    echo https://github.com/settings/keys
    echo.
    set /p CONFIRM="Ya agregaste la clave en GitHub? (S/N): "
    if /i "%CONFIRM%"=="S" (
        git remote set-url origin git@github.com:jcarweb/repuestospro.git
        echo [OK] Remote configurado para SSH
        echo.
        echo Probando conexion...
        git fetch
        if %errorlevel% equ 0 (
            echo [OK] Conexion SSH exitosa!
        ) else (
            echo [ERROR] Fallo la conexion SSH. Verifica la clave.
        )
    )
) else (
    echo [INFO] No se encontro clave SSH
    echo.
    echo Para generar una clave SSH:
    echo   ssh-keygen -t ed25519 -C "tu-email@example.com"
    echo.
    echo Luego ejecuta este script nuevamente.
)
goto :end

:show_instructions
echo.
echo ========================================
echo    INSTRUCCIONES
echo ========================================
echo.
echo 1. Crea un token en: https://github.com/settings/tokens
echo 2. Selecciona el scope "repo"
echo 3. Copia el token
echo 4. Usa uno de estos comandos:
echo.
echo    git remote set-url origin https://TU_TOKEN@github.com/jcarweb/repuestospro.git
echo.
echo    O para un push unico:
echo    git push https://TU_TOKEN@github.com/jcarweb/repuestospro.git
echo.
goto :end

:end
echo.
pause

