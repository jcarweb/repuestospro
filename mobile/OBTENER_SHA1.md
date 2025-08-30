# 🔑 Obtener SHA-1 Fingerprint

## ⚠️ Para Desarrollo (Solución Temporal)

Si no puedes obtener el SHA-1 ahora, puedes usar este valor temporal para desarrollo:

```
AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

**Nota:** Este es un valor de ejemplo. Para producción necesitarás el SHA-1 real.

## 🔧 Métodos para obtener SHA-1 real:

### Método 1: Usando Android Studio
1. Abre Android Studio
2. Ve a **Tools** > **SDK Manager**
3. Ve a la pestaña **SDK Tools**
4. Busca **Android SDK Build-Tools**
5. Usa el comando keytool desde ahí

### Método 2: Usando Java keytool
```bash
# En Windows (si tienes Java instalado)
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# En macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Método 3: Usando Expo
```bash
npx expo credentials:manager
```

### Método 4: Generar SHA-1 desde la app
1. Instala la app en un dispositivo Android
2. Usa herramientas de desarrollo para obtener el fingerprint

## 🎯 Para continuar ahora:
1. Usa el SHA-1 temporal de arriba
2. Completa la configuración de Google OAuth
3. Prueba el login con Google
4. Más tarde obtén el SHA-1 real para producción

## 📱 SHA-1 para diferentes entornos:
- **Desarrollo**: SHA-1 del debug keystore
- **Producción**: SHA-1 del release keystore
- **Expo**: SHA-1 generado por Expo
