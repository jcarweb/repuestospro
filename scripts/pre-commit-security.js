#!/usr/bin/env node

/**
 * Script de Verificación de Seguridad Pre-Commit
 * Verifica que no se commiteen archivos con información sensible
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patrones de archivos sensibles que no deben ser commiteados
const sensitivePatterns = [
  /\.env$/,
  /\.env\./,
  /secrets\.json$/,
  /credentials\.json$/,
  /.*SECRET.*\.md$/i,
  /.*CREDENTIALS.*\.md$/i,
  /.*PASSWORD.*\.md$/i,
  /.*API_KEY.*\.md$/i,
  /.*TOKEN.*\.md$/i,
  /.*PRIVATE.*\.md$/i,
  /.*CONFIDENTIAL.*\.md$/i
];

// Patrones de contenido sensible en archivos (solo detectar valores reales, no placeholders)
const sensitiveContentPatterns = [
  // Solo detectar contraseñas que parecen reales (no placeholders)
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])password\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template|admin123|password123|test123))[^"'\s]{6,}["']?/i,
  // Solo detectar secretos que parecen reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])secret\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template))[^"'\s]{10,}["']?/i,
  // Solo detectar API keys que parecen reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])api[_-]?key\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template))[^"'\s]{10,}["']?/i,
  // Solo detectar tokens que parecen reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])token\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template))[^"'\s]{10,}["']?/i,
  // Solo detectar URLs de MongoDB con credenciales reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])mongodb\+srv:\/\/[^:]+:(?!.*(?:password|username|user))[^@]+@/i,
  // Solo detectar JWT secrets que parecen reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])jwt[_-]?secret\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template))[^"'\s]{10,}["']?/i,
  // Solo detectar client secrets que parecen reales
  /(?<!\/\/.*)(?<!#.*)(?<!\/\*.*)(?<!\*.*)(?<!```.*)(?<!interface\s+\w+\s*\{)(?<!type\s+\w+\s*=)(?<!const\s+\w+\s*[:=])(?<!let\s+\w+\s*[:=])(?<!var\s+\w+\s*[:=])client[_-]?secret\s*[:=]\s*["']?(?!.*(?:your-|your_|placeholder|example|template))[^"'\s]{10,}["']?/i
];

// Archivos que son seguros y no deben ser verificados (contienen solo definiciones de tipos/interfaces)
const safeFiles = [
  /backend\/src\/models\/.*\.ts$/,  // Modelos de base de datos
  /backend\/src\/controllers\/.*\.ts$/,  // Controladores (contienen lógica de negocio)
  /backend\/src\/scripts\/.*\.js$/,  // Scripts de desarrollo (contienen contraseñas de desarrollo)
  /mobile\/src\/contexts\/.*\.tsx?$/,  // Contextos React
  /mobile\/src\/services\/.*\.ts$/,  // Servicios móviles
  /mobile-backup\/.*\.bat$/,  // Scripts de backup móvil
  /src\/.*\.tsx?$/,  // Componentes React
  /.*\.d\.ts$/,  // Archivos de definición TypeScript
];

// Patrones que indican que el contenido es un ejemplo o documentación
const examplePatterns = [
  /^#.*/,  // Títulos de markdown
  /^\/\/.*/,  // Comentarios de línea
  /^\/\*.*\*\/$/,  // Comentarios de bloque
  /^```.*/,  // Bloques de código
  /interface\s+\w+\s*\{/,  // Interfaces TypeScript
  /type\s+\w+\s*=/,  // Tipos TypeScript
  /const\s+\w+\s*[:=]/,  // Constantes
  /let\s+\w+\s*[:=]/,  // Variables let
  /var\s+\w+\s*[:=]/,  // Variables var
  /your-.*-here/,  // Placeholders comunes
  /your_.*_here/,  // Placeholders con guiones bajos
  /<url-del-repositorio>/,  // Placeholders específicos
  /<url-del-repositorio>/  // Placeholders específicos
];

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('❌ Error obteniendo archivos en staging:', error.message);
    return [];
  }
}

function isSafeFile(filePath) {
  return safeFiles.some(pattern => pattern.test(filePath));
}

function checkSensitiveFiles(stagedFiles) {
  const violations = [];
  
  stagedFiles.forEach(file => {
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(file)) {
        violations.push({
          type: 'file',
          file,
          reason: 'Archivo con patrón sensible detectado'
        });
      }
    });
  });
  
  return violations;
}

function isExampleOrDocumentation(line, filePath) {
  // Verificar si la línea es parte de un ejemplo o documentación
  const lowerLine = line.toLowerCase();
  
  // Si es un archivo de documentación, es más probable que sea un ejemplo
  if (filePath.endsWith('.md') || filePath.endsWith('.txt')) {
    return true;
  }
  
  // Si contiene placeholders comunes, es un ejemplo
  if (lowerLine.includes('your-') || lowerLine.includes('your_') || 
      lowerLine.includes('<url-') || lowerLine.includes('example') ||
      lowerLine.includes('placeholder') || lowerLine.includes('template')) {
    return true;
  }
  
  // Si es un comentario o documentación
  if (line.trim().startsWith('//') || line.trim().startsWith('#') || 
      line.trim().startsWith('*') || line.trim().startsWith('```')) {
    return true;
  }
  
  // Si es parte de una interfaz o tipo TypeScript
  if (line.includes('interface') || line.includes('type ') || 
      line.includes('const ') || line.includes('let ') || line.includes('var ')) {
    return true;
  }
  
  return false;
}

function checkSensitiveContent(stagedFiles) {
  const violations = [];
  
  stagedFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    // Saltar archivos seguros (modelos, controladores, contextos, etc.)
    if (isSafeFile(file)) {
      return;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNumber) => {
        // Saltar líneas que son claramente ejemplos o documentación
        if (isExampleOrDocumentation(line, file)) {
          return;
        }
        
        // Verificar patrones de contenido sensible solo en líneas que no son ejemplos
        sensitiveContentPatterns.forEach(pattern => {
          const matches = line.match(pattern);
          if (matches) {
            // Verificar que no sea un placeholder o ejemplo
            const matchText = matches[0].toLowerCase();
            if (!matchText.includes('your-') && 
                !matchText.includes('your_') && 
                !matchText.includes('example') &&
                !matchText.includes('placeholder') &&
                !matchText.includes('template') &&
                !matchText.includes('username:password') &&
                !matchText.includes('your-super-secret') &&
                !matchText.includes('your-api-key') &&
                !matchText.includes('your-google-client')) {
              
              violations.push({
                type: 'content',
                file,
                reason: `Contenido sensible detectado en línea ${lineNumber + 1}: ${matches[0].substring(0, 50)}...`
              });
            }
          }
        });
      });
    } catch (error) {
      // Ignorar archivos binarios o que no se pueden leer
    }
  });
  
  return violations;
}

function checkGitignore() {
  try {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const requiredPatterns = [
      '.env',
      '*.env',
      '*SECRET*.md',
      '*CREDENTIALS*.md',
      '*PASSWORD*.md',
      '*API_KEY*.md',
      '*TOKEN*.md',
      '*PRIVATE*.md',
      '*CONFIDENTIAL*.md'
    ];
    
    const missingPatterns = requiredPatterns.filter(pattern => 
      !gitignoreContent.includes(pattern)
    );
    
    if (missingPatterns.length > 0) {
      console.log('⚠️  Patrones faltantes en .gitignore:', missingPatterns.join(', '));
    }
    
    return missingPatterns.length === 0;
  } catch (error) {
    console.error('❌ Error verificando .gitignore:', error.message);
    return false;
  }
}

function runSecurityCheck() {
  console.log('🔍 Ejecutando verificación de seguridad pre-commit...\n');
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('✅ No hay archivos en staging area');
    return true;
  }
  
  console.log(`📁 Archivos en staging: ${stagedFiles.length}`);
  
  // Verificar archivos sensibles
  const fileViolations = checkSensitiveFiles(stagedFiles);
  const contentViolations = checkSensitiveContent(stagedFiles);
  const gitignoreOk = checkGitignore();
  
  const allViolations = [...fileViolations, ...contentViolations];
  
  if (allViolations.length > 0) {
    console.log('\n❌ VIOLACIONES DE SEGURIDAD DETECTADAS:\n');
    
    allViolations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.type.toUpperCase()}: ${violation.file}`);
      console.log(`   Razón: ${violation.reason}\n`);
    });
    
    console.log('🚨 COMMIT BLOQUEADO por razones de seguridad');
    console.log('💡 Soluciones:');
    console.log('   - Elimina archivos sensibles del staging: git reset HEAD <archivo>');
    console.log('   - Agrega archivos a .gitignore si es necesario');
    console.log('   - Usa variables de entorno en lugar de hardcodear credenciales');
    console.log('   - Ejecuta: node scripts/security-cleanup.js');
    
    return false;
  }
  
  if (!gitignoreOk) {
    console.log('⚠️  .gitignore necesita actualización');
    console.log('💡 Ejecuta: node scripts/security-cleanup.js');
  }
  
  console.log('✅ Verificación de seguridad completada exitosamente');
  return true;
}

// Ejecutar verificación
if (require.main === module) {
  const success = runSecurityCheck();
  process.exit(success ? 0 : 1);
}

module.exports = { runSecurityCheck };
