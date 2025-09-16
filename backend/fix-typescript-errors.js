const fs = require('fs');
const path = require('path');

// Función para corregir errores comunes de TypeScript
function fixTypeScriptErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Agregar import de AuthenticatedRequest si no existe
    if (content.includes('req.user') && !content.includes('AuthenticatedRequest')) {
      if (content.includes("import { Request, Response } from 'express';")) {
        content = content.replace(
          "import { Request, Response } from 'express';",
          "import { Request, Response } from 'express';\nimport { AuthenticatedRequest } from '../middleware/authMiddleware';"
        );
        modified = true;
      }
    }

    // 2. Reemplazar req.user?.id con req.user?._id
    content = content.replace(/req\.user\?\.id/g, 'req.user?._id');
    if (content.includes('req.user?._id')) {
      modified = true;
    }

    // 3. Reemplazar (req as any).user._id con (req as AuthenticatedRequest).user?._id
    content = content.replace(/\(req as any\)\.user\._id/g, '(req as AuthenticatedRequest).user?._id');
    if (content.includes('(req as AuthenticatedRequest).user?._id')) {
      modified = true;
    }

    // 4. Reemplazar userId.toString() con userId?.toString() || ''
    content = content.replace(/userId\.toString\(\)/g, 'userId?.toString() || \'\'');
    if (content.includes('userId?.toString() || \'\'')) {
      modified = true;
    }

    // 5. Reemplazar req.user.email con req.user?.email || ''
    content = content.replace(/req\.user\.email(?!\?)/g, 'req.user?.email || \'\'');
    if (content.includes('req.user?.email || \'\'')) {
      modified = true;
    }

    // 6. Agregar mongoose import si se usa ObjectId
    if (content.includes('new mongoose.Types.ObjectId') && !content.includes("import mongoose from 'mongoose';")) {
      if (content.includes("import { Request, Response } from 'express';")) {
        content = content.replace(
          "import { Request, Response } from 'express';",
          "import { Request, Response } from 'express';\nimport mongoose from 'mongoose';"
        );
        modified = true;
      }
    }

    // 7. Corregir storeId a store en Product.find
    content = content.replace(/Product\.find\(\{ storeId \}\)/g, 'Product.find({ store: storeId })');
    if (content.includes('Product.find({ store: storeId })')) {
      modified = true;
    }

    // 8. Corregir categoryId a category en metadata
    content = content.replace(/categoryId: subcategory\.categoryId/g, 'categoryId: subcategory.category');
    if (content.includes('categoryId: subcategory.category')) {
      modified = true;
    }

    // 9. Corregir commission.value a commission.baseRate
    content = content.replace(/commission\.value/g, 'commission.baseRate');
    if (content.includes('commission.baseRate')) {
      modified = true;
    }

    // 10. Corregir tax.type === 'percentage' a tax.type === 'IVA' || tax.type === 'ISLR'
    content = content.replace(/tax\.type === 'percentage'/g, "tax.type === 'IVA' || tax.type === 'ISLR'");
    if (content.includes("tax.type === 'IVA' || tax.type === 'ISLR'")) {
      modified = true;
    }

    if (modified) {
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

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalFixed = 0;

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      totalFixed += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      if (fixTypeScriptErrors(fullPath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

// Ejecutar correcciones
console.log('🚀 Iniciando corrección automática de errores TypeScript...\n');

const srcPath = path.join(__dirname, 'src');
const totalFixed = processDirectory(srcPath);

console.log(`\n✨ Corrección completada! ${totalFixed} archivos modificados.`);
console.log('🔄 Ejecutando build para verificar...\n');
