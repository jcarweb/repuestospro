# 🛠 Configuración de Android Studio para React Native

## 📋 Prerrequisitos

### 1. Instalar Android Studio
- Descargar desde: https://developer.android.com/studio
- Instalar con todas las opciones por defecto
- Aceptar licencias durante la instalación

### 2. Configurar SDK
1. Abrir Android Studio
2. Ir a **File > Settings** (o **Android Studio > Preferences** en Mac)
3. Navegar a **Appearance & Behavior > System Settings > Android SDK**
4. Instalar los siguientes componentes:
   - **Android SDK Platform 33** (API Level 33)
   - **Android SDK Platform 31** (API Level 31)
   - **Android SDK Platform 30** (API Level 30)
   - **Android SDK Build-Tools 33.0.0**
   - **Android SDK Build-Tools 31.0.0**
   - **Android SDK Build-Tools 30.0.3**
   - **Android Emulator**
   - **Android SDK Platform-Tools**
   - **Intel x86 Emulator Accelerator (HAXM installer)**

### 3. Configurar Variables de Entorno

#### Windows:
```cmd
# Agregar al PATH del sistema:
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\emulator
%LOCALAPPDATA%\Android\Sdk\tools

# Crear variables de entorno:
ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk
```

#### macOS/Linux:
```bash
# Agregar al ~/.bash_profile o ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4. Crear Emulador Android
1. Abrir Android Studio
2. Ir a **Tools > AVD Manager**
3. Hacer clic en **Create Virtual Device**
4. Seleccionar **Phone > Pixel 4** (o similar)
5. Seleccionar **API Level 31** (Android 12)
6. Configurar nombre: **PiezasYa_Emulator**
7. Hacer clic en **Finish**

## 🔧 Configuración del Proyecto

### 1. Configurar Gradle
Editar `android/gradle.properties`:
```properties
# Gradle
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true

# React Native
newArchEnabled=false
hermesEnabled=true

# Debug
android.debug.obsoleteApi=true
```

### 2. Configurar AndroidManifest.xml
Editar `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.piezasya.mobile">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3. Configurar strings.xml
Editar `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">PiezasYa</string>
</resources>
```

### 4. Configurar build.gradle (app)
Editar `android/app/build.gradle`:
```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"

import com.android.build.OutputFile

def enableSeparateBuildPerCPUArchitecture = false
def enableProguardInReleaseBuilds = false
def jscFlavor = 'org.webkit:android-jsc:+'

android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.piezasya.mobile"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    splits {
        abi {
            reset()
            enable enableSeparateBuildPerCPUArchitecture
            universalApk false
            include "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
        }
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }

    applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def versionCodes = ["armeabi-v7a": 1, "x86": 2, "arm64-v8a": 3, "x86_64": 4]
            def abi = output.getFilter(OutputFile.ABI)
            if (abi != null) {
                output.versionCodeOverride =
                        defaultConfig.versionCode * 1000 + versionCodes.get(abi)
            }
        }
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.facebook.react:react-native:+"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.0.0"
    
    // React Native dependencies
    implementation project(':react-native-vector-icons')
    implementation project(':react-native-svg')
    implementation project(':react-native-maps')
    implementation project(':react-native-image-picker')
    implementation project(':react-native-geolocation-service')
    implementation project(':react-native-device-info')
    implementation project(':react-native-keychain')
    implementation project(':react-native-permissions')
    implementation project(':react-native-async-storage')
    
    debugImplementation("com.facebook.flipper:flipper:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.fbjni'
    }
    debugImplementation("com.facebook.flipper:flipper-network-plugin:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.fbjni'
    }
    debugImplementation("com.facebook.flipper:flipper-fresco-plugin:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.fbjni'
    }
    releaseImplementation("com.facebook.flipper:flipper-noop:${FLIPPER_VERSION}")
}

apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
```

## 🚀 Comandos de Build

### Debug
```bash
# Limpiar y build debug
cd android
./gradlew clean
./gradlew assembleDebug
cd ..

# Instalar en emulador
npx react-native run-android
```

### Release
```bash
# Generar keystore (solo primera vez)
keytool -genkey -v -keystore android/app/my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configurar gradle.properties con:
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****

# Build release
cd android
./gradlew clean
./gradlew assembleRelease
cd ..
```

## 🔍 Troubleshooting

### Error: "SDK location not found"
```bash
# Crear archivo local.properties en android/
echo "sdk.dir=/path/to/android/sdk" > android/local.properties
```

### Error: "Could not find tools.jar"
```bash
# Instalar JDK 11
# Configurar JAVA_HOME
export JAVA_HOME=/path/to/jdk11
```

### Error: "Metro bundler not found"
```bash
# Instalar dependencias
npm install
# Iniciar Metro
npx react-native start
```

### Error: "Emulator not found"
```bash
# Listar emuladores
emulator -list-avds
# Iniciar emulador
emulator -avd PiezasYa_Emulator
```

## 📱 Testing

### 1. Emulador
```bash
# Iniciar emulador
emulator -avd PiezasYa_Emulator

# Ejecutar app
npx react-native run-android
```

### 2. Dispositivo Físico
1. Habilitar **Opciones de desarrollador**
2. Habilitar **Depuración USB**
3. Conectar dispositivo
4. Ejecutar `npx react-native run-android`

## 🎯 Próximos Pasos

1. ✅ Configurar Android Studio
2. ✅ Crear emulador
3. ✅ Configurar proyecto
4. 🔄 Probar build debug
5. 🔄 Probar en emulador
6. 🔄 Probar en dispositivo físico
7. 🔄 Configurar build release
8. 🔄 Deploy a Google Play Store
