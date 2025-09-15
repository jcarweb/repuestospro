import mongoose from 'mongoose';
import Category from '../models/Category';
import { config } from '../config/env';

// Categorías principales de repuestos automotrices
const mainCategories = [
  {
    name: 'Motor',
    description: 'Repuestos relacionados con el motor del vehículo',
    order: 1,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Frenos',
    description: 'Sistema de frenado y componentes relacionados',
    order: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Suspensión',
    description: 'Componentes del sistema de suspensión',
    order: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Eléctrico',
    description: 'Sistema eléctrico y componentes electrónicos',
    order: 4,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Transmisión',
    description: 'Sistema de transmisión y embrague',
    order: 5,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Refrigeración',
    description: 'Sistema de refrigeración del motor',
    order: 6,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Combustible',
    description: 'Sistema de combustible e inyección',
    order: 7,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Escape',
    description: 'Sistema de escape y emisiones',
    order: 8,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Dirección',
    description: 'Sistema de dirección y componentes',
    order: 9,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Iluminación',
    description: 'Sistema de iluminación y faros',
    order: 10,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: 'Accesorios',
    description: 'Accesorios y repuestos adicionales',
    order: 11,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  }
];

// Subcategorías para cada categoría principal
const subcategories = {
  'Motor': [
    { name: 'Aceite de Motor', description: 'Aceites lubricantes para motor', order: 1 },
    { name: 'Filtros de Aceite', description: 'Filtros para el sistema de lubricación', order: 2 },
    { name: 'Bujías', description: 'Bujías de encendido', order: 3 },
    { name: 'Correas', description: 'Correas de distribución y accesorios', order: 4 },
    { name: 'Bombas de Aceite', description: 'Bombas del sistema de lubricación', order: 5 },
    { name: 'Juntas', description: 'Juntas y empaquetaduras del motor', order: 6 }
  ],
  'Frenos': [
    { name: 'Pastillas de Freno', description: 'Pastillas para sistema de frenos', order: 1 },
    { name: 'Discos de Freno', description: 'Discos de freno y componentes', order: 2 },
    { name: 'Líquido de Frenos', description: 'Líquido para sistema hidráulico', order: 3 },
    { name: 'Cilindros', description: 'Cilindros de freno', order: 4 },
    { name: 'Cables', description: 'Cables de freno de mano', order: 5 }
  ],
  'Suspensión': [
    { name: 'Amortiguadores', description: 'Amortiguadores y shock absorbers', order: 1 },
    { name: 'Resortes', description: 'Resortes de suspensión', order: 2 },
    { name: 'Brazos de Control', description: 'Brazos de control y componentes', order: 3 },
    { name: 'Bujes', description: 'Bujes de suspensión', order: 4 },
    { name: 'Rótulas', description: 'Rótulas de dirección y suspensión', order: 5 }
  ],
  'Eléctrico': [
    { name: 'Baterías', description: 'Baterías automotrices', order: 1 },
    { name: 'Alternadores', description: 'Alternadores y generadores', order: 2 },
    { name: 'Arrancadores', description: 'Motores de arranque', order: 3 },
    { name: 'Cables', description: 'Cables eléctricos y conectores', order: 4 },
    { name: 'Fusibles', description: 'Fusibles y relés', order: 5 }
  ],
  'Transmisión': [
    { name: 'Aceite de Transmisión', description: 'Aceites para transmisión', order: 1 },
    { name: 'Embragues', description: 'Discos y kits de embrague', order: 2 },
    { name: 'Diferenciales', description: 'Componentes del diferencial', order: 3 },
    { name: 'Juntas', description: 'Juntas de transmisión', order: 4 }
  ],
  'Refrigeración': [
    { name: 'Radiadores', description: 'Radiadores y componentes', order: 1 },
    { name: 'Bombas de Agua', description: 'Bombas de agua del motor', order: 2 },
    { name: 'Termostatos', description: 'Termostatos del sistema de refrigeración', order: 3 },
    { name: 'Mangueras', description: 'Mangueras de refrigeración', order: 4 },
    { name: 'Anticongelante', description: 'Líquidos refrigerantes', order: 5 }
  ],
  'Combustible': [
    { name: 'Bombas de Combustible', description: 'Bombas de combustible', order: 1 },
    { name: 'Filtros de Combustible', description: 'Filtros del sistema de combustible', order: 2 },
    { name: 'Inyectores', description: 'Inyectores de combustible', order: 3 },
    { name: 'Carburadores', description: 'Carburadores y componentes', order: 4 }
  ],
  'Escape': [
    { name: 'Silenciadores', description: 'Silenciadores y resonadores', order: 1 },
    { name: 'Catalizadores', description: 'Convertidores catalíticos', order: 2 },
    { name: 'Tubos de Escape', description: 'Tubos y tuberías de escape', order: 3 },
    { name: 'Soportes', description: 'Soportes del sistema de escape', order: 4 }
  ],
  'Dirección': [
    { name: 'Cremalleras', description: 'Cremalleras de dirección', order: 1 },
    { name: 'Bombas de Dirección', description: 'Bombas de dirección hidráulica', order: 2 },
    { name: 'Aceite de Dirección', description: 'Aceites para sistema de dirección', order: 3 },
    { name: 'Juntas', description: 'Juntas del sistema de dirección', order: 4 }
  ],
  'Iluminación': [
    { name: 'Bombillas', description: 'Bombillas y lámparas', order: 1 },
    { name: 'Faros', description: 'Faros y componentes', order: 2 },
    { name: 'Pilotos', description: 'Pilotos y luces indicadoras', order: 3 },
    { name: 'Cables de Iluminación', description: 'Cables del sistema de iluminación', order: 4 }
  ],
  'Accesorios': [
    { name: 'Alfombras', description: 'Alfombras para vehículos', order: 1 },
    { name: 'Cubiertas', description: 'Cubiertas y protectores', order: 2 },
    { name: 'Organizadores', description: 'Organizadores y portaobjetos', order: 3 },
    { name: 'Cargadores', description: 'Cargadores y adaptadores', order: 4 }
  ]
};

async function seedCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Limpiar categorías existentes
    await Category.deleteMany({});
    console.log('Categorías existentes eliminadas');

    // Crear categorías principales
    const createdCategories: any = {};
    
    for (const categoryData of mainCategories) {
      const category = await Category.create({
        ...categoryData,
        isActive: true
      });
      createdCategories[categoryData.name] = category;
      console.log(`Categoría creada: ${category.name}`);
    }

    // Crear subcategorías
    for (const [parentName, subcats] of Object.entries(subcategories)) {
      const parentCategory = createdCategories[parentName];
      
      if (parentCategory) {
        for (const subcatData of subcats) {
          const subcategory = await Category.create({
            ...subcatData,
            parentCategory: parentCategory._id,
            isActive: true
          });
          console.log(`Subcategoría creada: ${subcategory.name} (${parentName})`);
        }
      }
    }

    console.log('✅ Categorías sembradas exitosamente');
    
    // Mostrar estadísticas
    const totalCategories = await Category.countDocuments();
    const rootCategories = await Category.countDocuments({ parentCategory: { $exists: false } });
    const subCategories = await Category.countDocuments({ parentCategory: { $exists: true } });
    
    console.log(`📊 Estadísticas:`);
    console.log(`   - Total de categorías: ${totalCategories}`);
    console.log(`   - Categorías principales: ${rootCategories}`);
    console.log(`   - Subcategorías: ${subCategories}`);

  } catch (error) {
    console.error('Error sembrando categorías:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCategories();
}

export default seedCategories;
