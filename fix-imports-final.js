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

// Función para corregir problemas de imports
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patrón 1: "import {" seguido de "import { API_BASE_URL"
    const pattern1 = /import\s*\{\s*\n\s*import\s*\{\s*API_BASE_URL\s*\}\s*from\s*['"][^'"]+['"];?\s*\n/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, (match) => {
        // Extraer el import de API_BASE_URL
        const apiImportMatch = match.match(/import\s*\{\s*API_BASE_URL\s*\}\s*from\s*['"]([^'"]+)['"];?/);
        if (apiImportMatch) {
          const apiImport = `import { API_BASE_URL } from '${apiImportMatch[1]}';\n`;
          // Remover el import de API_BASE_URL del match y agregarlo al inicio
          const cleanMatch = match.replace(/import\s*\{\s*API_BASE_URL\s*\}\s*from\s*['"][^'"]+['"];?\s*\n/, '');
          return apiImport + cleanMatch;
        }
        return match;
      });
      modified = true;
    }
    
    // Patrón 2: Líneas consecutivas con imports problemáticos
    const lines = content.split('\n');
    const newLines = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Buscar línea que empiece con "import {" seguida de línea con "import { API_BASE_URL"
      if (line.trim().startsWith('import {') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        
        if (nextLine.trim().includes('import { API_BASE_URL }')) {
          // Extraer el import de API_BASE_URL
          const apiImportMatch = nextLine.match(/import\s*\{\s*API_BASE_URL\s*\}\s*from\s*['"]([^'"]+)['"];?/);
          if (apiImportMatch) {
            // Agregar el import de API_BASE_URL primero
            newLines.push(`import { API_BASE_URL } from '${apiImportMatch[1]}';`);
            // Agregar la línea original del import
            newLines.push(line);
            // Saltar la línea problemática
            i += 2;
            modified = true;
            continue;
          }
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    if (modified) {
      content = newLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports: ${filePath}`);
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
  console.log('🔧 Starting final import fix...');
  
  // Buscar archivos TypeScript y JavaScript
  const files = [
    ...findFiles('src', /\.tsx?$/),
    ...findFiles('src', /\.jsx?$/)
  ];
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
}

// Ejecutar
main();
