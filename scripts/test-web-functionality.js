#!/usr/bin/env node

/**
 * Script de Pruebas Automatizadas - PiezasYa Web Application
 * Verifica funcionalidades básicas de la aplicación web
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando pruebas de funcionalidad web...\n');

// Configuración
const config = {
  srcDir: './src',
  pagesDir: './src/pages',
  componentsDir: './src/components',
  contextsDir: './src/contexts',
  hooksDir: './src/hooks',
  typesDir: './src/types'
};

// Resultados de las pruebas
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Función para agregar resultado de prueba
function addTestResult(test, status, message = '') {
  testResults.details.push({
    test,
    status,
    message,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'passed') {
    testResults.passed++;
    console.log(`✅ ${test}`);
  } else if (status === 'failed') {
    testResults.failed++;
    console.log(`❌ ${test}: ${message}`);
  } else if (status === 'warning') {
    testResults.warnings++;
    console.log(`⚠️  ${test}: ${message}`);
  }
}

// Función para verificar si un archivo existe
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    addTestResult(`Archivo existe: ${description}`, 'passed');
    return true;
  } else {
    addTestResult(`Archivo existe: ${description}`, 'failed', `Archivo no encontrado: ${filePath}`);
    return false;
  }
}

// Función para verificar contenido de archivo
function checkFileContent(filePath, patterns, description) {
  if (!fs.existsSync(filePath)) {
    addTestResult(`Contenido de archivo: ${description}`, 'failed', 'Archivo no existe');
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allPatternsFound = true;
    const missingPatterns = [];

    patterns.forEach(pattern => {
      if (typeof pattern === 'string') {
        if (!content.includes(pattern)) {
          allPatternsFound = false;
          missingPatterns.push(pattern);
        }
      } else if (pattern instanceof RegExp) {
        if (!pattern.test(content)) {
          allPatternsFound = false;
          missingPatterns.push(pattern.toString());
        }
      }
    });

    if (allPatternsFound) {
      addTestResult(`Contenido de archivo: ${description}`, 'passed');
    } else {
      addTestResult(`Contenido de archivo: ${description}`, 'failed', `Patrones no encontrados: ${missingPatterns.join(', ')}`);
    }
  } catch (error) {
    addTestResult(`Contenido de archivo: ${description}`, 'failed', `Error leyendo archivo: ${error.message}`);
  }
}

// Función para verificar estructura de directorios
function checkDirectoryStructure(dirPath, expectedFiles, description) {
  if (!fs.existsSync(dirPath)) {
    addTestResult(`Estructura de directorio: ${description}`, 'failed', `Directorio no existe: ${dirPath}`);
    return;
  }

  try {
    const files = fs.readdirSync(dirPath);
    const missingFiles = expectedFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length === 0) {
      addTestResult(`Estructura de directorio: ${description}`, 'passed');
    } else {
      addTestResult(`Estructura de directorio: ${description}`, 'warning', `Archivos faltantes: ${missingFiles.join(', ')}`);
    }
  } catch (error) {
    addTestResult(`Estructura de directorio: ${description}`, 'failed', `Error leyendo directorio: ${error.message}`);
  }
}

// Función para verificar imports y exports
function checkImportsExports(filePath, description) {
  if (!fs.existsSync(filePath)) {
    addTestResult(`Imports/Exports: ${description}`, 'failed', 'Archivo no existe');
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar que tiene imports
    const hasImports = /import\s+.*\s+from\s+['"]/.test(content);
    // Verificar que tiene exports
    const hasExports = /export\s+(default\s+)?(function|const|let|var|class)/.test(content);
    
    if (hasImports && hasExports) {
      addTestResult(`Imports/Exports: ${description}`, 'passed');
    } else if (hasImports || hasExports) {
      addTestResult(`Imports/Exports: ${description}`, 'warning', 'Archivo tiene imports o exports, pero no ambos');
    } else {
      addTestResult(`Imports/Exports: ${description}`, 'failed', 'Archivo no tiene imports ni exports válidos');
    }
  } catch (error) {
    addTestResult(`Imports/Exports: ${description}`, 'failed', `Error procesando archivo: ${error.message}`);
  }
}

// Función para verificar sintaxis TypeScript
function checkTypeScriptSyntax(filePath, description) {
  if (!fs.existsSync(filePath)) {
    addTestResult(`Sintaxis TypeScript: ${description}`, 'failed', 'Archivo no existe');
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificaciones básicas de sintaxis TypeScript
    const hasTypeAnnotations = /:\s*(string|number|boolean|object|any|void|never|unknown)/.test(content);
    const hasInterface = /interface\s+\w+/.test(content);
    const hasType = /type\s+\w+\s*=/.test(content);
    const hasGeneric = /<\w+>/.test(content);
    
    if (hasTypeAnnotations || hasInterface || hasType || hasGeneric) {
      addTestResult(`Sintaxis TypeScript: ${description}`, 'passed');
    } else {
      addTestResult(`Sintaxis TypeScript: ${description}`, 'warning', 'Archivo no parece usar características de TypeScript');
    }
  } catch (error) {
    addTestResult(`Sintaxis TypeScript: ${description}`, 'failed', `Error procesando archivo: ${error.message}`);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🔍 Verificando estructura del proyecto...\n');

  // 1. Verificar estructura de directorios principales
  checkDirectoryStructure(config.srcDir, ['pages', 'components', 'contexts', 'hooks', 'types'], 'Directorios principales');
  checkDirectoryStructure(config.pagesDir, [], 'Directorio de páginas');
  checkDirectoryStructure(config.componentsDir, [], 'Directorio de componentes');
  checkDirectoryStructure(config.contextsDir, [], 'Directorio de contextos');
  checkDirectoryStructure(config.hooksDir, [], 'Directorio de hooks');
  checkDirectoryStructure(config.typesDir, [], 'Directorio de tipos');

  console.log('\n📄 Verificando archivos principales...\n');

  // 2. Verificar archivos principales
  checkFileExists('./src/App.tsx', 'App.tsx');
  checkFileExists('./src/main.tsx', 'main.tsx');
  checkFileExists('./src/types/index.ts', 'types/index.ts');
  checkFileExists('./package.json', 'package.json');
  checkFileExists('./vite.config.ts', 'vite.config.ts');
  checkFileExists('./tailwind.config.js', 'tailwind.config.js');

  console.log('\n🔐 Verificando contextos de autenticación...\n');

  // 3. Verificar contextos
  checkFileExists('./src/contexts/AuthContext.tsx', 'AuthContext');
  checkFileExists('./src/contexts/LanguageContext.tsx', 'LanguageContext');
  checkFileExists('./src/contexts/ThemeContext.tsx', 'ThemeContext');
  checkFileExists('./src/contexts/ActiveStoreContext.tsx', 'ActiveStoreContext');

  // Verificar contenido de AuthContext
  checkFileContent('./src/contexts/AuthContext.tsx', [
    'useState',
    'useEffect',
    'createContext',
    'login',
    'logout',
    'register'
  ], 'AuthContext - Funcionalidades básicas');

  console.log('\n👥 Verificando páginas por rol...\n');

  // 4. Verificar páginas de Admin
  const adminPages = [
    'AdminDashboard.tsx',
    'AdminUsers.tsx',
    'AdminStores.tsx',
    'AdminProducts.tsx',
    'AdminOrders.tsx',
    'AdminReports.tsx',
    'AdminMonetization.tsx',
    'AdminLoyalty.tsx',
    'AdminAdvertisements.tsx',
    'AdminAdvertisingPlans.tsx'
  ];

  adminPages.forEach(page => {
    const filePath = `./src/pages/${page}`;
    checkFileExists(filePath, `Admin - ${page}`);
    if (fs.existsSync(filePath)) {
      checkImportsExports(filePath, `Admin - ${page}`);
      checkTypeScriptSyntax(filePath, `Admin - ${page}`);
    }
  });

  // 5. Verificar páginas de Cliente
  const clientPages = [
    'Home.tsx',
    'Products.tsx',
    'ProductDetail.tsx',
    'Cart.tsx',
    'Checkout.tsx',
    'Profile.tsx',
    'Orders.tsx',
    'Favorites.tsx',
    'Loyalty.tsx',
    'ReferralLanding.tsx'
  ];

  clientPages.forEach(page => {
    const filePath = `./src/pages/${page}`;
    checkFileExists(filePath, `Cliente - ${page}`);
    if (fs.existsSync(filePath)) {
      checkImportsExports(filePath, `Cliente - ${page}`);
      checkTypeScriptSyntax(filePath, `Cliente - ${page}`);
    }
  });

  // 6. Verificar páginas de Delivery
  const deliveryPages = [
    'DeliveryDashboard.tsx',
    'DeliveryOrders.tsx',
    'DeliveryStatus.tsx',
    'DeliveryProfile.tsx',
    'DeliveryMap.tsx'
  ];

  deliveryPages.forEach(page => {
    const filePath = `./src/pages/${page}`;
    checkFileExists(filePath, `Delivery - ${page}`);
    if (fs.existsSync(filePath)) {
      checkImportsExports(filePath, `Delivery - ${page}`);
      checkTypeScriptSyntax(filePath, `Delivery - ${page}`);
    }
  });

  // 7. Verificar páginas de Vendedor de Tienda
  const storeManagerPages = [
    'StoreManagerDashboard.tsx',
    'StoreManagerOrders.tsx',
    'StoreManagerAnalytics.tsx',
    'StoreManagerSettings.tsx',
    'StoreManagerInventory.tsx'
  ];

  storeManagerPages.forEach(page => {
    const filePath = `./src/pages/${page}`;
    checkFileExists(filePath, `Vendedor - ${page}`);
    if (fs.existsSync(filePath)) {
      checkImportsExports(filePath, `Vendedor - ${page}`);
      checkTypeScriptSyntax(filePath, `Vendedor - ${page}`);
    }
  });

  console.log('\n🔧 Verificando hooks personalizados...\n');

  // 8. Verificar hooks
  const hooks = [
    'useAuth.ts',
    'useLanguage.ts',
    'useTheme.ts',
    'useSidebarConfig.ts'
  ];

  hooks.forEach(hook => {
    const filePath = `./src/hooks/${hook}`;
    checkFileExists(filePath, `Hook - ${hook}`);
    if (fs.existsSync(filePath)) {
      checkImportsExports(filePath, `Hook - ${hook}`);
      checkTypeScriptSyntax(filePath, `Hook - ${hook}`);
    }
  });

  console.log('\n📦 Verificando package.json...\n');

  // 9. Verificar dependencias en package.json
  if (fs.existsSync('./package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'tailwindcss'
    ];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        addTestResult(`Dependencia: ${dep}`, 'passed');
      } else {
        addTestResult(`Dependencia: ${dep}`, 'failed', 'Dependencia no encontrada');
      }
    });

    // Verificar scripts
    const requiredScripts = ['dev', 'build', 'preview'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        addTestResult(`Script: ${script}`, 'passed');
      } else {
        addTestResult(`Script: ${script}`, 'failed', 'Script no encontrado');
      }
    });
  }

  console.log('\n📊 Generando reporte de pruebas...\n');

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.passed + testResults.failed + testResults.warnings,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)
    },
    details: testResults.details
  };

  // Guardar reporte
  fs.writeFileSync('./test-results.json', JSON.stringify(report, null, 2));

  // Mostrar resumen
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('====================');
  console.log(`✅ Pasaron: ${testResults.passed}`);
  console.log(`❌ Fallaron: ${testResults.failed}`);
  console.log(`⚠️  Advertencias: ${testResults.warnings}`);
  console.log(`📈 Tasa de éxito: ${report.summary.successRate}%`);
  console.log(`📄 Reporte guardado en: test-results.json`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa el reporte para más detalles.');
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error('❌ Error ejecutando pruebas:', error);
  process.exit(1);
});
