# 🚀 Guía de Deploy a Producción - PiezasYA

## ⚠️ IMPORTANTE: Seguridad de Credenciales

**NUNCA subas credenciales al repositorio Git.** Todas las credenciales deben estar en:
- Variables de entorno en Render (Dashboard → Environment)
- Archivos `.env` locales (que están en `.gitignore`)

## 📋 Proceso de Deploy

### Opción 1: Script Automatizado (Recomendado)

Ejecuta el script maestro que hace todo el proceso:

```bash
deploy-production.bat
```

Este script:
1. ✅ Verifica que no haya credenciales expuestas
2. ✅ Muestra los cambios pendientes
3. ✅ Hace commit de los cambios
4. ✅ Sube los cambios a Git
5. ✅ Construye el APK (opcional)

### Opción 2: Proceso Manual

#### Paso 1: Verificar Credenciales

```bash
scripts\check-credentials.bat
```

Este script verifica:
- ❌ No hay archivos `.env` en el repositorio
- ❌ No hay credenciales hardcodeadas
- ✅ `.gitignore` está configurado correctamente
- ✅ No hay archivos sensibles en staging

#### Paso 2: Revisar Cambios

```bash
git status
git diff
```

Revisa cuidadosamente los cambios antes de hacer commit.

#### Paso 3: Hacer Commit

```bash
git add .
git commit -m "Descripción de los cambios"
```

**Mensajes de commit sugeridos:**
- `feat: Optimizaciones de rendimiento en login móvil`
- `fix: Mejora tiempos de respuesta en autenticación`
- `perf: Reduce timeouts y elimina llamadas innecesarias`

#### Paso 4: Subir a Git

```bash
git push
```

#### Paso 5: Construir APK (Opcional)

```bash
cd mobile
build-apk.bat
cd ..
```

El APK se generará en: `mobile\android\app\build\outputs\apk\release\`

## 🔄 Deploy Automático en Render

Render detecta automáticamente los cambios en Git y hace deploy:

1. **Render detecta el push** → Inicia el build automáticamente
2. **Ejecuta `npm install && npm run build`** (según `render.yaml`)
3. **Inicia el servidor** con `npm start`
4. **Verifica el deploy** en el dashboard de Render

### Verificar Deploy en Render

1. Ve a: https://dashboard.render.com
2. Selecciona el servicio: `piezasyaya-backend`
3. Revisa la pestaña **"Logs"** para ver el progreso
4. Verifica que el estado sea **"Live"**

## 🔐 Variables de Entorno en Render

Asegúrate de que estas variables estén configuradas en Render:

### Variables Críticas (Obligatorias)
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MONGODB_URI` = `mongodb+srv://...` (tu URI de MongoDB Atlas)
- `JWT_SECRET` = `tu-secreto-jwt-super-seguro` (mínimo 32 caracteres)

### Variables Opcionales (Según funcionalidades)
- `EMAIL_HOST` = `smtp.gmail.com`
- `EMAIL_PORT` = `587`
- `EMAIL_USER` = `tu-email@gmail.com`
- `EMAIL_PASS` = `tu-contraseña-de-app`
- `GOOGLE_CLIENT_ID` = `tu-google-client-id`
- `GOOGLE_CLIENT_SECRET` = `tu-google-client-secret`
- `CLOUDINARY_CLOUD_NAME` = `tu-cloud-name`
- `CLOUDINARY_API_KEY` = `tu-api-key`
- `CLOUDINARY_API_SECRET` = `tu-api-secret`
- `VAPID_PUBLIC_KEY` = `tu-vapid-public-key`
- `VAPID_PRIVATE_KEY` = `tu-vapid-private-key`

### Cómo Agregar Variables en Render

1. Ve a tu servicio en Render Dashboard
2. Click en **"Environment"** en el menú lateral
3. Click en **"Add Environment Variable"**
4. Agrega cada variable con su valor
5. Guarda los cambios (Render reiniciará automáticamente)

## 📱 Build del APK

### Requisitos Previos

- Node.js instalado
- Expo CLI instalado: `npm install -g expo-cli`
- Android SDK configurado
- Java JDK instalado

### Proceso de Build

```bash
cd mobile
build-apk.bat
```

El script:
1. Limpia el proyecto Android
2. Genera el bundle de JavaScript
3. Copia el bundle a la ubicación correcta
4. Compila el APK
5. Muestra la ubicación del APK generado

### Ubicación del APK

El APK se genera en:
```
mobile\android\app\build\outputs\apk\release\app-release.apk
```

### Instalar APK en Dispositivo

```bash
adb install -r mobile\android\app\build\outputs\apk\release\app-release.apk
```

## ✅ Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] ✅ No hay archivos `.env` en el repositorio
- [ ] ✅ No hay credenciales hardcodeadas en el código
- [ ] ✅ `.gitignore` está actualizado
- [ ] ✅ Todas las variables de entorno están en Render
- [ ] ✅ Los cambios están probados localmente
- [ ] ✅ El mensaje de commit es descriptivo
- [ ] ✅ El build del backend funciona (`npm run build`)
- [ ] ✅ El servidor inicia correctamente (`npm start`)

## 🐛 Troubleshooting

### Error: "Credenciales encontradas"
- Revisa que no haya archivos `.env` en el repositorio
- Verifica que no haya contraseñas o keys hardcodeadas
- Usa `git rm --cached .env` si accidentalmente agregaste un `.env`

### Error: "Build falla en Render"
- Revisa los logs en Render Dashboard
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que `package.json` tenga los scripts correctos

### Error: "APK no se genera"
- Verifica que Android SDK esté instalado
- Revisa que Java JDK esté en el PATH
- Ejecuta `cd android && gradlew clean` manualmente

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Verifica la configuración de variables de entorno
3. Revisa que el código compile localmente antes de hacer push

---

**Última actualización:** Optimizaciones de rendimiento móvil - Diciembre 2024

