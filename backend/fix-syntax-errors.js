const fs = require('fs');
const path = require('path');

function fixSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corregir errores de sintaxis comunes
    content = content.replace(/\.\(([^)]+) as any\)/g, '.($1 as any)');
    content = content.replace(/\(([^)]+) as any\)\./g, '($1 as any).');
    content = content.replace(/\.\(sort as any\)/g, '.sort');
    content = content.replace(/\.\(length as any\)/g, '.length');
    content = content.replace(/\.\(reasons as any\)/g, '.reasons');
    content = content.replace(/\.\(orders as any\)/g, '.orders');
    content = content.replace(/\.\(total as any\)/g, '.total');
    content = content.replace(/\.\(updateRiderStats as any\)/g, '.updateRiderStats');
    content = content.replace(/\.\(processPendingPhotos as any\)/g, '.processPendingPhotos');

    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalFixed = 0;

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      totalFixed += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      if (fixSyntaxErrors(fullPath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

console.log('🚀 Corrigiendo errores de sintaxis...\n');
const srcPath = path.join(__dirname, 'src');
const totalFixed = processDirectory(srcPath);
console.log(`\n✨ Corrección completada! ${totalFixed} archivos modificados.`);
