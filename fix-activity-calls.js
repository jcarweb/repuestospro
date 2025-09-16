const fs = require('fs');
const path = require('path');

// Función para corregir las llamadas a Activity.create
function fixActivityCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Patrón para encontrar llamadas a Activity.create con parámetros separados
  const pattern = /Activity\.create\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/g;
  
  content = content.replace(pattern, (match, userId, type, description, metadata, lastParam) => {
    // Remover comillas del tipo y descripción
    const cleanType = type.trim().replace(/['"]/g, '');
    const cleanDescription = description.trim().replace(/['"]/g, '');
    
    return `Activity.create({
          userId: ${userId},
          type: '${cleanType}',
          description: '${cleanDescription}',
          metadata: ${metadata}
        })`;
  });
  
  // Patrón para encontrar llamadas con 4 parámetros
  const pattern4 = /Activity\.create\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/g;
  
  content = content.replace(pattern4, (match, userId, type, description, metadata) => {
    // Verificar si ya está en formato de objeto
    if (metadata.trim().startsWith('{')) {
      return match; // Ya está corregido
    }
    
    const cleanType = type.trim().replace(/['"]/g, '');
    const cleanDescription = description.trim().replace(/['"]/g, '');
    
    return `Activity.create({
          userId: ${userId},
          type: '${cleanType}',
          description: '${cleanDescription}',
          metadata: ${metadata}
        })`;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed Activity.create calls in ${filePath}`);
}

// Archivos a corregir
const filesToFix = [
  'backend/src/controllers/profileController.ts'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixActivityCalls(file);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Activity.create calls fixed!');
