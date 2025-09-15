const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección de imports...');

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convertir imports a requires
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, (match, importName, modulePath) => {
      // Si es un import por defecto
      if (importName === 'default' || importName === importName.toLowerCase()) {
        return `const ${importName} = require('${modulePath}');`;
      }
      // Si es un import con destructuring
      return `const { ${importName} } = require('${modulePath}');`;
    });
    
    // Convertir imports con destructuring
    content = content.replace(/import\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, modulePath) => {
      return `const { ${imports} } = require('${modulePath}');`;
    });
    
    // Convertir imports con alias
    content = content.replace(/import\s*{\s*([^}]+)\s+as\s+(\w+)\s*}\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, alias, modulePath) => {
      return `const { ${imports} } = require('${modulePath}'); const ${alias} = ${imports};`;
    });
    
    // Convertir export default
    content = content.replace(/export\s+default\s+/g, 'module.exports = ');
    
    // Convertir export const/function
    content = content.replace(/export\s+(const|function|class)\s+(\w+)/g, 'exports.$2 = ');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corregido: ${filePath}`);
  } catch (error) {
    console.log(`⚠️  Error en ${filePath}: ${error.message}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImportsInFile(filePath);
    }
  });
}

// Procesar directorio dist
if (fs.existsSync('dist')) {
  processDirectory('dist');
  console.log('✅ Corrección de imports completada');
} else {
  console.log('⚠️  Directorio dist no encontrado');
}
