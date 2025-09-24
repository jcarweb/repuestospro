#!/usr/bin/env node

/**
 * Script de Migración de Expo a React Native Puro
 * PiezasYa Mobile App
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando migración de Expo a React Native puro...\n');

// Configuración
const config = {
  projectName: 'PiezasYaMobile',
  template: 'react-native-template-typescript',
  sourceDir: './mobile',
  targetDir: './mobile-rn',
  backupDir: './mobile-backup'
};

// Función para ejecutar comandos
function runCommand(command, options = {}) {
  try {
    console.log(`📦 Ejecutando: ${command}`);
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      ...options 
    });
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Función para crear directorio si no existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${dir}`);
  }
}

// Función para copiar archivos
function copyFiles(source, target, filter = null) {
  if (!fs.existsSync(source)) {
    console.log(`⚠️  Directorio fuente no existe: ${source}`);
    return;
  }

  ensureDir(target);
  
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (filter && !filter(file)) {
      return;
    }
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyFiles(sourcePath, targetPath, filter);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`📄 Copiado: ${file}`);
    }
  });
}

// Función para migrar package.json
function migratePackageJson() {
  console.log('\n📦 Migrando package.json...');
  
  const sourcePackagePath = path.join(config.sourceDir, 'package.json');
  const targetPackagePath = path.join(config.targetDir, 'package.json');
  
  if (!fs.existsSync(sourcePackagePath)) {
    console.log('⚠️  package.json no encontrado en el directorio fuente');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));
  
  // Actualizar dependencias para React Native puro
  const newDependencies = {
    ...packageJson.dependencies,
    // Remover dependencias de Expo
    '@expo/vector-icons': undefined,
    'expo': undefined,
    'expo-status-bar': undefined,
    // Agregar dependencias de React Native
    '@react-navigation/native': '^6.1.7',
    '@react-navigation/stack': '^6.3.17',
    '@react-navigation/bottom-tabs': '^6.5.8',
    '@react-native-async-storage/async-storage': '^1.19.3',
    'react-native-vector-icons': '^10.0.0',
    'react-native-svg': '^13.9.0',
    'react-native-maps': '^1.7.1',
    'react-native-image-picker': '^5.6.0',
    'react-native-geolocation-service': '^5.3.1',
    'react-native-device-info': '^10.8.0',
    'react-native-keychain': '^8.1.2',
    'react-native-permissions': '^3.8.4'
  };
  
  // Limpiar dependencias undefined
  Object.keys(newDependencies).forEach(key => {
    if (newDependencies[key] === undefined) {
      delete newDependencies[key];
    }
  });
  
  const newPackageJson = {
    ...packageJson,
    name: config.projectName,
    dependencies: newDependencies,
    scripts: {
      'android': 'react-native run-android',
      'ios': 'react-native run-ios',
      'start': 'react-native start',
      'test': 'jest',
      'lint': 'eslint . --ext .js,.jsx,.ts,.tsx',
      'build:android:debug': 'cd android && ./gradlew assembleDebug',
      'build:android:release': 'cd android && ./gradlew assembleRelease',
      'build:ios:debug': 'cd ios && xcodebuild -workspace PiezasYaMobile.xcworkspace -scheme PiezasYaMobile -configuration Debug',
      'build:ios:release': 'cd ios && xcodebuild -workspace PiezasYaMobile.xcworkspace -scheme PiezasYaMobile -configuration Release'
    }
  };
  
  fs.writeFileSync(targetPackagePath, JSON.stringify(newPackageJson, null, 2));
  console.log('✅ package.json migrado exitosamente');
}

// Función para migrar código fuente
function migrateSourceCode() {
  console.log('\n📁 Migrando código fuente...');
  
  const sourceSrcPath = path.join(config.sourceDir, 'src');
  const targetSrcPath = path.join(config.targetDir, 'src');
  
  if (!fs.existsSync(sourceSrcPath)) {
    console.log('⚠️  Directorio src no encontrado en el directorio fuente');
    return;
  }
  
  // Crear estructura de directorios
  const dirs = [
    'src/components',
    'src/screens',
    'src/navigation',
    'src/services',
    'src/context',
    'src/hooks',
    'src/utils',
    'src/types',
    'src/assets'
  ];
  
  dirs.forEach(dir => {
    ensureDir(path.join(config.targetDir, dir));
  });
  
  // Copiar archivos fuente
  copyFiles(sourceSrcPath, targetSrcPath, (file) => {
    // Filtrar archivos específicos de Expo
    return !file.includes('expo') && 
           !file.includes('Expo') && 
           !file.endsWith('.expo.js') &&
           !file.endsWith('.expo.ts');
  });
  
  console.log('✅ Código fuente migrado exitosamente');
}

// Función para crear archivos de configuración
function createConfigFiles() {
  console.log('\n⚙️  Creando archivos de configuración...');
  
  // Metro config
  const metroConfig = `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`;
  
  fs.writeFileSync(
    path.join(config.targetDir, 'metro.config.js'), 
    metroConfig
  );
  
  // Babel config
  const babelConfig = `module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@context': './src/context',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};
`;
  
  fs.writeFileSync(
    path.join(config.targetDir, 'babel.config.js'), 
    babelConfig
  );
  
  // TypeScript config
  const tsConfig = `{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@context/*": ["context/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  }
}`;
  
  fs.writeFileSync(
    path.join(config.targetDir, 'tsconfig.json'), 
    tsConfig
  );
  
  console.log('✅ Archivos de configuración creados');
}

// Función para crear README de migración
function createMigrationReadme() {
  console.log('\n📖 Creando documentación de migración...');
  
  const readme = `# PiezasYa Mobile - React Native Puro

## 🚀 Migración Completada

Este proyecto ha sido migrado de Expo a React Native puro para mejorar la estabilidad y el rendimiento.

## 📱 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Instalación de dependencias
\`\`\`bash
npm install
# o
yarn install
\`\`\`

### Android
\`\`\`bash
# Instalar dependencias nativas
cd android && ./gradlew clean && cd ..

# Ejecutar en Android
npm run android
\`\`\`

### iOS
\`\`\`bash
# Instalar dependencias nativas
cd ios && pod install && cd ..

# Ejecutar en iOS
npm run ios
\`\`\`

## 🛠 Scripts Disponibles

- \`npm start\` - Iniciar Metro bundler
- \`npm run android\` - Ejecutar en Android
- \`npm run ios\` - Ejecutar en iOS
- \`npm run build:android:debug\` - Build debug Android
- \`npm run build:android:release\` - Build release Android
- \`npm run build:ios:debug\` - Build debug iOS
- \`npm run build:ios:release\` - Build release iOS

## 📁 Estructura del Proyecto

\`\`\`
src/
├── components/     # Componentes reutilizables
├── screens/        # Pantallas de la app
├── navigation/     # Configuración de navegación
├── services/       # Servicios y APIs
├── context/        # Contextos de React
├── hooks/          # Hooks personalizados
├── utils/          # Utilidades
└── types/          # Tipos TypeScript
\`\`\`

## 🔧 Configuración

### Variables de Entorno
Crear archivo \`.env\` en la raíz del proyecto:
\`\`\`
API_BASE_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
\`\`\`

### Android
- Configurar \`android/app/src/main/res/values/strings.xml\`
- Configurar \`android/app/src/main/AndroidManifest.xml\`

### iOS
- Configurar \`ios/PiezasYaMobile/Info.plist\`
- Configurar esquemas en Xcode

## 🚀 Deployment

### Android
1. Generar keystore
2. Configurar signing en \`android/app/build.gradle\`
3. Ejecutar \`npm run build:android:release\`
4. Subir APK a Google Play Console

### iOS
1. Configurar certificados en Xcode
2. Configurar provisioning profiles
3. Ejecutar \`npm run build:ios:release\`
4. Subir a App Store Connect

## 📞 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
`;
  
  fs.writeFileSync(
    path.join(config.targetDir, 'README.md'), 
    readme
  );
  
  console.log('✅ README de migración creado');
}

// Función principal
async function main() {
  try {
    console.log('🎯 Iniciando proceso de migración...\n');
    
    // 1. Crear backup del proyecto actual
    console.log('1️⃣ Creando backup del proyecto actual...');
    if (fs.existsSync(config.sourceDir)) {
      copyFiles(config.sourceDir, config.backupDir);
      console.log('✅ Backup creado exitosamente');
    } else {
      console.log('⚠️  Directorio fuente no encontrado, continuando...');
    }
    
    // 2. Crear nuevo proyecto React Native
    console.log('\n2️⃣ Creando nuevo proyecto React Native...');
    if (fs.existsSync(config.targetDir)) {
      console.log('⚠️  Directorio destino ya existe, eliminando...');
      fs.rmSync(config.targetDir, { recursive: true, force: true });
    }
    
    const createCommand = `npx react-native init ${config.projectName} --template ${config.template} --directory ${config.targetDir}`;
    if (!runCommand(createCommand)) {
      throw new Error('Error creando proyecto React Native');
    }
    
    // 3. Migrar package.json
    migratePackageJson();
    
    // 4. Migrar código fuente
    migrateSourceCode();
    
    // 5. Crear archivos de configuración
    createConfigFiles();
    
    // 6. Crear documentación
    createMigrationReadme();
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. cd mobile-rn');
    console.log('2. npm install');
    console.log('3. npx react-native run-android (o run-ios)');
    console.log('4. Configurar variables de entorno');
    console.log('5. Probar funcionalidades');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar migración
main();
