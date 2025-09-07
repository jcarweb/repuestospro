/**
 * Script de verificación del setup de la app móvil
 * Verifica que todos los archivos necesarios existan y estén configurados correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO SETUP DE LA APP MÓVIL');
console.log('=====================================');

// Archivos críticos que deben existir
const criticalFiles = [
  'App.tsx',
  'index.ts',
  'package.json',
  'app.json',
  'src/contexts/AuthContext.tsx',
  'src/contexts/ThemeContext.tsx',
  'src/contexts/ToastContext.tsx',
  'src/contexts/NetworkContext.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/screens/auth/LoginScreen.tsx',
  'src/screens/auth/RegisterScreen.tsx',
  'src/screens/client/ClientHomeScreen.tsx',
  'src/services/api.ts',
  'src/services/apiService.ts',
  'src/config/api.ts',
  'src/utils/networkUtils.ts'
];

// Verificar archivos críticos
console.log('\n📁 VERIFICANDO ARCHIVOS CRÍTICOS');
console.log('==================================');

let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar configuración de package.json
console.log('\n📦 VERIFICANDO PACKAGE.JSON');
console.log('============================');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  console.log(`✅ Nombre: ${packageJson.name}`);
  console.log(`✅ Versión: ${packageJson.version}`);
  console.log(`✅ Main: ${packageJson.main}`);
  
  // Verificar dependencias críticas
  const criticalDeps = [
    'expo',
    'react',
    'react-native',
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    '@react-native-async-storage/async-storage'
  ];
  
  console.log('\n📋 DEPENDENCIAS CRÍTICAS:');
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - FALTANTE`);
      allFilesExist = false;
    }
  });
  
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
  allFilesExist = false;
}

// Verificar configuración de app.json
console.log('\n⚙️ VERIFICANDO APP.JSON');
console.log('========================');

try {
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app.json'), 'utf8'));
  
  console.log(`✅ Nombre: ${appJson.expo.name}`);
  console.log(`✅ Slug: ${appJson.expo.slug}`);
  console.log(`✅ Versión: ${appJson.expo.version}`);
  console.log(`✅ Updates habilitado: ${appJson.expo.updates?.enabled || 'No configurado'}`);
  
} catch (error) {
  console.log('❌ Error leyendo app.json:', error.message);
  allFilesExist = false;
}

// Verificar AuthContext
console.log('\n🔐 VERIFICANDO AUTHCONTEXT');
console.log('===========================');

try {
  const authContextPath = path.join(__dirname, 'src/contexts/AuthContext.tsx');
  const authContextContent = fs.readFileSync(authContextPath, 'utf8');
  
  if (authContextContent.includes('isAuthenticated: false')) {
    console.log('✅ AuthContext configurado para mostrar login primero');
  } else {
    console.log('⚠️ AuthContext NO está forzado a mostrar login');
  }
  
  if (authContextContent.includes('Limpieza forzada')) {
    console.log('✅ Limpieza automática de datos implementada');
  } else {
    console.log('⚠️ Limpieza automática NO implementada');
  }
  
} catch (error) {
  console.log('❌ Error verificando AuthContext:', error.message);
  allFilesExist = false;
}

// Verificar App.tsx
console.log('\n📱 VERIFICANDO APP.TSX');
console.log('========================');

try {
  const appPath = path.join(__dirname, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('AuthProvider')) {
    console.log('✅ AuthProvider configurado');
  } else {
    console.log('❌ AuthProvider NO configurado');
    allFilesExist = false;
  }
  
  if (appContent.includes('AppNavigator')) {
    console.log('✅ AppNavigator configurado');
  } else {
    console.log('❌ AppNavigator NO configurado');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log('❌ Error verificando App.tsx:', error.message);
  allFilesExist = false;
}

// Verificar scripts de limpieza
console.log('\n🧹 VERIFICANDO SCRIPTS DE LIMPIEZA');
console.log('===================================');

const cleanupScripts = [
  'clean-and-restart.bat',
  'nuclear-reset.bat',
  'quick-start.bat'
];

cleanupScripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - FALTANTE`);
    allFilesExist = false;
  }
});

// Resultado final
console.log('\n🎯 RESULTADO FINAL');
console.log('==================');

if (allFilesExist) {
  console.log('✅ SETUP COMPLETO - La app está lista para funcionar');
  console.log('');
  console.log('🚀 PRÓXIMOS PASOS:');
  console.log('1. Ejecuta: quick-start.bat');
  console.log('2. Si hay problemas: clean-and-restart.bat');
  console.log('3. Si persiste: nuclear-reset.bat');
} else {
  console.log('❌ SETUP INCOMPLETO - Hay archivos faltantes o mal configurados');
  console.log('');
  console.log('🔧 ACCIONES REQUERIDAS:');
  console.log('1. Verificar archivos faltantes');
  console.log('2. Reinstalar dependencias');
  console.log('3. Ejecutar: nuclear-reset.bat');
}

console.log('\n📋 Para más información, revisa la documentación en el proyecto.');
