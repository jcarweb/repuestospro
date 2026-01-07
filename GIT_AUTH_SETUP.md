# 🔐 Configuración de Autenticación Git para GitHub

## Problema
GitHub ya no acepta autenticación con contraseña. Necesitas usar un **Personal Access Token (PAT)**.

## Solución Rápida

### Opción 1: Usar Token de Acceso Personal (Recomendado)

#### Paso 1: Crear un Token en GitHub

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre: `PiezasYA-Deploy`
4. Selecciona los permisos (scopes):
   - ✅ `repo` (acceso completo a repositorios)
   - ✅ `workflow` (si usas GitHub Actions)
5. Click en **"Generate token"**
6. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
   - Ejemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Paso 2: Configurar Git con el Token

**Opción A: Usar el token en la URL (Temporal)**
```bash
git remote set-url origin https://TU_TOKEN@github.com/jcarweb/repuestospro.git
```

**Opción B: Usar Git Credential Manager (Recomendado)**
```bash
# Configurar Git para usar el token
git config --global credential.helper manager-core

# La próxima vez que hagas push, Git te pedirá:
# Username: jcarweb
# Password: [pega aquí tu token]
```

**Opción C: Guardar credenciales en Windows Credential Manager**
```bash
# Al hacer push, cuando pida credenciales:
# Username: jcarweb
# Password: [tu token]
# Windows lo guardará automáticamente
```

### Opción 2: Usar SSH (Más Seguro)

#### Paso 1: Generar clave SSH (si no tienes una)
```bash
ssh-keygen -t ed25519 -C "tu-email@example.com"
```

#### Paso 2: Agregar la clave a GitHub
1. Copia tu clave pública:
   ```bash
   type %USERPROFILE%\.ssh\id_ed25519.pub
   ```
2. Ve a: https://github.com/settings/keys
3. Click en **"New SSH key"**
4. Pega la clave y guarda

#### Paso 3: Cambiar el remote a SSH
```bash
git remote set-url origin git@github.com:jcarweb/repuestospro.git
```

## Verificar Configuración

```bash
# Ver remote actual
git remote -v

# Probar conexión
git fetch
```

## Solución Rápida para Este Deploy

Si necesitas hacer el push ahora mismo:

1. **Crea el token** en GitHub (5 minutos)
2. **Usa este comando:**
   ```bash
   git push https://TU_TOKEN@github.com/jcarweb/repuestospro.git
   ```
   Reemplaza `TU_TOKEN` con tu token real.

3. **O configura el remote temporalmente:**
   ```bash
   git remote set-url origin https://TU_TOKEN@github.com/jcarweb/repuestospro.git
   git push
   ```

## Nota de Seguridad

⚠️ **NUNCA** subas el token al repositorio Git. Si accidentalmente lo haces:
1. Revoca el token inmediatamente en GitHub
2. Crea uno nuevo
3. Usa `git filter-branch` o contacta a GitHub para limpiar el historial

## Troubleshooting

### Error: "Authentication failed"
- Verifica que el token tenga permisos `repo`
- Verifica que el token no haya expirado
- Asegúrate de copiar el token completo (empieza con `ghp_`)

### Error: "Permission denied"
- El token necesita permisos de escritura (`repo` scope)
- Verifica que tengas acceso al repositorio

### Error: "Repository not found"
- Verifica que el nombre del repositorio sea correcto
- Verifica que tengas acceso al repositorio

