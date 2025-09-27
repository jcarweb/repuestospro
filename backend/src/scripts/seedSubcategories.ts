import mongoose from 'mongoose';
import Subcategory from '../models/Subcategory';
import Category from '../models/Category';
import { config } from '../config/env';
// Subcategorías específicas para repuestos automotrices
const subcategoriesData = [
  // Motor
  {
    categoryName: 'Motor',
    subcategories: [
      { name: 'Aceite de Motor', description: 'Aceites lubricantes para motor', vehicleType: 'car', order: 1 },
      { name: 'Filtros de Aceite', description: 'Filtros para el sistema de lubricación', vehicleType: 'car', order: 2 },
      { name: 'Bujías', description: 'Bujías de encendido', vehicleType: 'car', order: 3 },
      { name: 'Correas', description: 'Correas de distribución y accesorios', vehicleType: 'car', order: 4 },
      { name: 'Bombas de Aceite', description: 'Bombas del sistema de lubricación', vehicleType: 'car', order: 5 },
      { name: 'Juntas', description: 'Juntas y empaquetaduras del motor', vehicleType: 'car', order: 6 },
      { name: 'Pistones', description: 'Pistones y anillos', vehicleType: 'car', order: 7 },
      { name: 'Válvulas', description: 'Válvulas de admisión y escape', vehicleType: 'car', order: 8 }
    ]
  },
  // Frenos
  {
    categoryName: 'Frenos',
    subcategories: [
      { name: 'Pastillas de Freno', description: 'Pastillas para sistema de frenos', vehicleType: 'car', order: 1 },
      { name: 'Discos de Freno', description: 'Discos de freno y componentes', vehicleType: 'car', order: 2 },
      { name: 'Líquido de Frenos', description: 'Líquido para sistema hidráulico', vehicleType: 'car', order: 3 },
      { name: 'Cilindros', description: 'Cilindros de freno', vehicleType: 'car', order: 4 },
      { name: 'Cables', description: 'Cables de freno de mano', vehicleType: 'car', order: 5 },
      { name: 'Tambores', description: 'Tambores de freno', vehicleType: 'car', order: 6 },
      { name: 'Zapatas', description: 'Zapatas de freno', vehicleType: 'car', order: 7 }
    ]
  },
  // Suspensión
  {
    categoryName: 'Suspensión',
    subcategories: [
      { name: 'Amortiguadores', description: 'Amortiguadores y shock absorbers', vehicleType: 'car', order: 1 },
      { name: 'Resortes', description: 'Resortes de suspensión', vehicleType: 'car', order: 2 },
      { name: 'Brazos de Control', description: 'Brazos de control y componentes', vehicleType: 'car', order: 3 },
      { name: 'Bujes', description: 'Bujes de suspensión', vehicleType: 'car', order: 4 },
      { name: 'Rótulas', description: 'Rótulas de dirección y suspensión', vehicleType: 'car', order: 5 },
      { name: 'Estabilizadores', description: 'Barras estabilizadoras', vehicleType: 'car', order: 6 }
    ]
  },
  // Eléctrico
  {
    categoryName: 'Eléctrico',
    subcategories: [
      { name: 'Baterías', description: 'Baterías automotrices', vehicleType: 'car', order: 1 },
      { name: 'Alternadores', description: 'Alternadores y generadores', vehicleType: 'car', order: 2 },
      { name: 'Arrancadores', description: 'Motores de arranque', vehicleType: 'car', order: 3 },
      { name: 'Cables', description: 'Cables eléctricos y conectores', vehicleType: 'car', order: 4 },
      { name: 'Fusibles', description: 'Fusibles y relés', vehicleType: 'car', order: 5 },
      { name: 'Sensores', description: 'Sensores electrónicos', vehicleType: 'car', order: 6 }
    ]
  },
  // Transmisión
  {
    categoryName: 'Transmisión',
    subcategories: [
      { name: 'Aceite de Transmisión', description: 'Aceites para transmisión', vehicleType: 'car', order: 1 },
      { name: 'Embragues', description: 'Discos y kits de embrague', vehicleType: 'car', order: 2 },
      { name: 'Diferenciales', description: 'Componentes del diferencial', vehicleType: 'car', order: 3 },
      { name: 'Juntas', description: 'Juntas de transmisión', vehicleType: 'car', order: 4 },
      { name: 'Cajas de Cambio', description: 'Componentes de caja de cambios', vehicleType: 'car', order: 5 }
    ]
  },
  // Refrigeración
  {
    categoryName: 'Refrigeración',
    subcategories: [
      { name: 'Radiadores', description: 'Radiadores y componentes', vehicleType: 'car', order: 1 },
      { name: 'Bombas de Agua', description: 'Bombas de agua del motor', vehicleType: 'car', order: 2 },
      { name: 'Termostatos', description: 'Termostatos del sistema de refrigeración', vehicleType: 'car', order: 3 },
      { name: 'Mangueras', description: 'Mangueras de refrigeración', vehicleType: 'car', order: 4 },
      { name: 'Anticongelante', description: 'Líquidos refrigerantes', vehicleType: 'car', order: 5 },
      { name: 'Ventiladores', description: 'Ventiladores de refrigeración', vehicleType: 'car', order: 6 }
    ]
  },
  // Combustible
  {
    categoryName: 'Combustible',
    subcategories: [
      { name: 'Bombas de Combustible', description: 'Bombas de combustible', vehicleType: 'car', order: 1 },
      { name: 'Filtros de Combustible', description: 'Filtros del sistema de combustible', vehicleType: 'car', order: 2 },
      { name: 'Inyectores', description: 'Inyectores de combustible', vehicleType: 'car', order: 3 },
      { name: 'Carburadores', description: 'Carburadores y componentes', vehicleType: 'car', order: 4 },
      { name: 'Tanques', description: 'Tanques de combustible', vehicleType: 'car', order: 5 }
    ]
  },
  // Escape
  {
    categoryName: 'Escape',
    subcategories: [
      { name: 'Silenciadores', description: 'Silenciadores y resonadores', vehicleType: 'car', order: 1 },
      { name: 'Catalizadores', description: 'Convertidores catalíticos', vehicleType: 'car', order: 2 },
      { name: 'Tubos de Escape', description: 'Tubos y tuberías de escape', vehicleType: 'car', order: 3 },
      { name: 'Soportes', description: 'Soportes del sistema de escape', vehicleType: 'car', order: 4 }
    ]
  },
  // Dirección
  {
    categoryName: 'Dirección',
    subcategories: [
      { name: 'Cremalleras', description: 'Cremalleras de dirección', vehicleType: 'car', order: 1 },
      { name: 'Bombas de Dirección', description: 'Bombas de dirección hidráulica', vehicleType: 'car', order: 2 },
      { name: 'Aceite de Dirección', description: 'Aceites para sistema de dirección', vehicleType: 'car', order: 3 },
      { name: 'Juntas', description: 'Juntas del sistema de dirección', vehicleType: 'car', order: 4 },
      { name: 'Terminales', description: 'Terminales de dirección', vehicleType: 'car', order: 5 }
    ]
  },
  // Iluminación
  {
    categoryName: 'Iluminación',
    subcategories: [
      { name: 'Bombillas', description: 'Bombillas y lámparas', vehicleType: 'car', order: 1 },
      { name: 'Faros', description: 'Faros y componentes', vehicleType: 'car', order: 2 },
      { name: 'Pilotos', description: 'Pilotos y luces indicadoras', vehicleType: 'car', order: 3 },
      { name: 'Cables de Iluminación', description: 'Cables del sistema de iluminación', vehicleType: 'car', order: 4 },
      { name: 'Interruptores', description: 'Interruptores de iluminación', vehicleType: 'car', order: 5 }
    ]
  },
  // Accesorios
  {
    categoryName: 'Accesorios',
    subcategories: [
      { name: 'Alfombras', description: 'Alfombras para vehículos', vehicleType: 'car', order: 1 },
      { name: 'Cubiertas', description: 'Cubiertas y protectores', vehicleType: 'car', order: 2 },
      { name: 'Organizadores', description: 'Organizadores y portaobjetos', vehicleType: 'car', order: 3 },
      { name: 'Cargadores', description: 'Cargadores y adaptadores', vehicleType: 'car', order: 4 },
      { name: 'Audio', description: 'Sistemas de audio', vehicleType: 'car', order: 5 },
      { name: 'Seguridad', description: 'Accesorios de seguridad', vehicleType: 'car', order: 6 }
    ]
  }
];
// Subcategorías específicas para motocicletas
const motorcycleSubcategories = [
  {
    categoryName: 'Motor',
    subcategories: [
      { name: 'Aceite de Motor', description: 'Aceites para motocicletas', vehicleType: 'motorcycle', order: 1 },
      { name: 'Filtros de Aire', description: 'Filtros de aire para motos', vehicleType: 'motorcycle', order: 2 },
      { name: 'Bujías', description: 'Bujías para motocicletas', vehicleType: 'motorcycle', order: 3 },
      { name: 'Cadenas', description: 'Cadenas de transmisión', vehicleType: 'motorcycle', order: 4 },
      { name: 'Embragues', description: 'Embragues para motos', vehicleType: 'motorcycle', order: 5 }
    ]
  },
  {
    categoryName: 'Frenos',
    subcategories: [
      { name: 'Pastillas de Freno', description: 'Pastillas para motocicletas', vehicleType: 'motorcycle', order: 1 },
      { name: 'Discos de Freno', description: 'Discos para motos', vehicleType: 'motorcycle', order: 2 },
      { name: 'Líquido de Frenos', description: 'Líquido para frenos de moto', vehicleType: 'motorcycle', order: 3 }
    ]
  }
];
// Subcategorías específicas para camiones
const truckSubcategories = [
  {
    categoryName: 'Motor',
    subcategories: [
      { name: 'Aceite de Motor', description: 'Aceites para camiones', vehicleType: 'truck', order: 1 },
      { name: 'Filtros de Combustible', description: 'Filtros para camiones', vehicleType: 'truck', order: 2 },
      { name: 'Sistemas de Inyección', description: 'Sistemas de inyección diesel', vehicleType: 'truck', order: 3 }
    ]
  },
  {
    categoryName: 'Frenos',
    subcategories: [
      { name: 'Sistemas de Freno de Aire', description: 'Componentes de freno neumático', vehicleType: 'truck', order: 1 },
      { name: 'Compresores', description: 'Compresores de aire', vehicleType: 'truck', order: 2 },
      { name: 'Válvulas de Freno', description: 'Válvulas del sistema de frenos', vehicleType: 'truck', order: 3 }
    ]
  }
];
async function seedSubcategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Conectado a MongoDB');
    // Limpiar subcategorías existentes
    await Subcategory.deleteMany({});
    console.log('Subcategorías existentes eliminadas');
    // Obtener todas las categorías
    const categories = await Category.find({});
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat._id);
    });
    let totalCreated = 0;
    // Crear subcategorías para automóviles
    for (const categoryData of subcategoriesData) {
      const categoryId = categoryMap.get(categoryData.categoryName);
      if (categoryId) {
        for (const subcatData of categoryData.subcategories) {
          await Subcategory.create({
            ...subcatData,
            categoryId,
            isActive: true
          });
          totalCreated++;
          console.log(`Subcategoría creada: ${subcatData.name} (${categoryData.categoryName} - Automóvil)`);
        }
      }
    }
    // Crear subcategorías para motocicletas
    for (const categoryData of motorcycleSubcategories) {
      const categoryId = categoryMap.get(categoryData.categoryName);
      if (categoryId) {
        for (const subcatData of categoryData.subcategories) {
          await Subcategory.create({
            ...subcatData,
            categoryId,
            isActive: true
          });
          totalCreated++;
          console.log(`Subcategoría creada: ${subcatData.name} (${categoryData.categoryName} - Motocicleta)`);
        }
      }
    }
    // Crear subcategorías para camiones
    for (const categoryData of truckSubcategories) {
      const categoryId = categoryMap.get(categoryData.categoryName);
      if (categoryId) {
        for (const subcatData of categoryData.subcategories) {
          await Subcategory.create({
            ...subcatData,
            categoryId,
            isActive: true
          });
          totalCreated++;
          console.log(`Subcategoría creada: ${subcatData.name} (${categoryData.categoryName} - Camión)`);
        }
      }
    }
    // Mostrar estadísticas
    const totalSubcategories = await Subcategory.countDocuments();
    const byVehicleType = await Subcategory.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log(`📊 Estadísticas:`);
    console.log(`   - Total de subcategorías: ${totalSubcategories}`);
    console.log(`   - Por tipo de vehículo:`);
    byVehicleType.forEach(stat => {
      console.log(`     * ${stat._id}: ${stat.count}`);
    });
  } catch (error) {
    console.error('Error sembrando subcategorías:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}
// Ejecutar si se llama directamente
if (require.main === module) {
  seedSubcategories();
}
export default seedSubcategories;