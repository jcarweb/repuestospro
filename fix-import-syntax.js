const fs = require('fs');
const path = require('path');

// Función para buscar archivos recursivamente
function findFiles(dir, pattern, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findFiles(fullPath, pattern, files);
    } else if (stat.isFile() && pattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función para corregir errores de sintaxis en imports
function fixImportSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patrón para encontrar imports mal formateados
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Buscar líneas que contengan "import { API_BASE_URL }" seguidas de "import {"
      if (line.includes('import { API_BASE_URL }') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        
        // Si la siguiente línea es "import {" entonces hay un error de sintaxis
        if (nextLine.trim() === 'import {') {
          // Corregir: mover el import de API_BASE_URL antes del import con {
          const apiImportLine = line;
          const iconImportLine = nextLine;
          
          // Buscar el final del import con {
          let j = i + 2;
          let iconImportContent = [iconImportLine];
          
          while (j < lines.length && !lines[j].includes('}')) {
            iconImportContent.push(lines[j]);
            j++;
          }
          
          if (j < lines.length) {
            iconImportContent.push(lines[j]); // Agregar la línea con }
            j++;
          }
          
          // Agregar el import de API_BASE_URL
          newLines.push(apiImportLine);
          
          // Agregar el import con iconos
          newLines.push(...iconImportContent);
          
          // Saltar las líneas que ya procesamos
          i = j - 1;
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      content = newLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed import syntax: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function main() {
  console.log('🔧 Starting import syntax fix...');
  
  // Buscar archivos TypeScript y JavaScript
  const files = [
    ...findFiles('src', /\.tsx?$/),
    ...findFiles('src', /\.jsx?$/)
  ];
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixImportSyntax(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
}

// Ejecutar
main();
