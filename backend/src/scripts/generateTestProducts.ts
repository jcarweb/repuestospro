import mongoose from 'mongoose';
import Product from '../models/Product';

// Configuración de la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
} as any);

// Datos de prueba
const brands = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 
  'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus'
];

const categories = [
  'Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Transmisión', 'Refrigeración', 
  'Combustible', 'Escape', 'Dirección', 'Iluminación', 'Accesorios'
];

const subcategories = {
  'Motor': ['Aceite de Motor', 'Filtros de Aceite', 'Bujías', 'Correas', 'Bombas de Aceite', 'Juntas'],
  'Frenos': ['Pastillas de Freno', 'Discos de Freno', 'Líquido de Frenos', 'Cilindros', 'Cables'],
  'Suspensión': ['Amortiguadores', 'Resortes', 'Brazos de Control', 'Bujes', 'Rótulas'],
  'Eléctrico': ['Baterías', 'Alternadores', 'Arrancadores', 'Cables', 'Fusibles'],
  'Transmisión': ['Aceite de Transmisión', 'Embragues', 'Diferenciales', 'Juntas'],
  'Refrigeración': ['Radiadores', 'Bombas de Agua', 'Termostatos', 'Mangueras', 'Anticongelante'],
  'Combustible': ['Bombas de Combustible', 'Filtros de Combustible', 'Inyectores', 'Carburadores'],
  'Escape': ['Silenciadores', 'Catalizadores', 'Tubos de Escape', 'Soportes'],
  'Dirección': ['Cremalleras', 'Bombas de Dirección', 'Aceite de Dirección', 'Juntas'],
  'Iluminación': ['Bombillas', 'Faros', 'Pilotos', 'Cables de Iluminación'],
  'Accesorios': ['Alfombras', 'Cubiertas', 'Organizadores', 'Cargadores']
};

const productNames = {
  'Motor': [
    'Aceite Sintético 5W-30', 'Aceite Mineral 10W-40', 'Filtro de Aceite Premium',
    'Bujía de Platino', 'Bujía de Iridio', 'Correa de Distribución',
    'Bomba de Aceite', 'Junta de Culata', 'Junta de Cárter'
  ],
  'Frenos': [
    'Pastillas de Freno Cerámicas', 'Pastillas de Freno Orgánicas', 'Discos de Freno Ventilados',
    'Líquido de Frenos DOT4', 'Cilindro Maestro', 'Cables de Freno'
  ],
  'Suspensión': [
    'Amortiguador Delantero', 'Amortiguador Trasero', 'Resorte de Suspensión',
    'Brazo de Control Superior', 'Brazo de Control Inferior', 'Buje de Suspensión'
  ],
  'Eléctrico': [
    'Batería de 12V 60Ah', 'Batería de 12V 80Ah', 'Alternador 90A',
    'Arrancador 1.4kW', 'Cable de Batería', 'Fusible de 10A'
  ],
  'Transmisión': [
    'Aceite de Transmisión ATF', 'Embrague de Fricción', 'Diferencial Trasero',
    'Junta de Transmisión', 'Bomba de Transmisión'
  ],
  'Refrigeración': [
    'Radiador de Aluminio', 'Bomba de Agua', 'Termostato 82°C',
    'Manguera de Radiador', 'Anticongelante Verde', 'Anticongelante Rojo'
  ],
  'Combustible': [
    'Bomba de Combustible Eléctrica', 'Filtro de Combustible', 'Inyector de Combustible',
    'Carburador de 2 Bocas', 'Carburador de 4 Bocas'
  ],
  'Escape': [
    'Silenciador Trasero', 'Catalizador Universal', 'Tubo de Escape',
    'Soporte de Escape', 'Junta de Escape'
  ],
  'Dirección': [
    'Cremallera de Dirección', 'Bomba de Dirección Hidráulica', 'Aceite de Dirección',
    'Junta de Dirección', 'Terminal de Dirección'
  ],
  'Iluminación': [
    'Bombilla H4', 'Bombilla H7', 'Faros Delanteros', 'Pilotos Traseros',
    'Cable de Iluminación', 'Interruptor de Luces'
  ],
  'Accesorios': [
    'Alfombras de Goma', 'Cubiertas de Asiento', 'Organizador de Maletero',
    'Cargador USB', 'Porta Vasos', 'Cubre Volante'
  ]
};

const descriptions = {
  'Motor': [
    'Aceite de motor de alta calidad para máxima protección y rendimiento',
    'Filtro de aceite premium que mantiene el motor limpio',
    'Bujía de alta tecnología para mejor combustión',
    'Correa de distribución resistente para larga duración'
  ],
  'Frenos': [
    'Pastillas de freno de alta fricción para frenado seguro',
    'Discos de freno ventilados para mejor disipación de calor',
    'Líquido de frenos de alto punto de ebullición'
  ],
  'Suspensión': [
    'Amortiguador de gas para mejor control de la suspensión',
    'Resorte de suspensión de acero de alta resistencia',
    'Brazo de control de aleación ligera'
  ],
  'Eléctrico': [
    'Batería de larga duración con tecnología AGM',
    'Alternador de alta eficiencia para mejor carga',
    'Arrancador de alta potencia para arranque confiable'
  ],
  'Transmisión': [
    'Aceite de transmisión sintético para mejor lubricación',
    'Embrague de alta fricción para transmisión suave',
    'Diferencial de alta resistencia para mejor tracción'
  ],
  'Refrigeración': [
    'Radiador de aluminio para mejor disipación de calor',
    'Bomba de agua de alta eficiencia',
    'Anticongelante de larga duración'
  ],
  'Combustible': [
    'Bomba de combustible de alta presión',
    'Filtro de combustible de alta capacidad',
    'Inyector de combustible de precisión'
  ],
  'Escape': [
    'Silenciador de acero inoxidable',
    'Catalizador de alta eficiencia',
    'Tubo de escape de acero resistente'
  ],
  'Dirección': [
    'Cremallera de dirección de alta precisión',
    'Bomba de dirección hidráulica de alta presión',
    'Aceite de dirección sintético'
  ],
  'Iluminación': [
    'Bombillas de alta luminosidad',
    'Faros de diseño moderno',
    'Cables de iluminación de alta conductividad'
  ],
  'Accesorios': [
    'Alfombras de goma resistentes al agua',
    'Cubiertas de asiento de tela premium',
    'Organizador de maletero práctico'
  ]
};

// Función para generar un producto aleatorio
function generateRandomProduct() {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const subcategoryList = subcategories[category];
  const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
  
  const productNamesList = productNames[category];
  const productName = productNamesList[Math.floor(Math.random() * productNamesList.length)];
  
  const descriptionsList = descriptions[category];
  const description = descriptionsList[Math.floor(Math.random() * descriptionsList.length)];
  
  const price = Math.floor(Math.random() * 500) + 10; // Precio entre $10 y $510
  const stock = Math.floor(Math.random() * 50) + 1; // Stock entre 1 y 50
  
  return {
    name: `${productName} ${brand}`,
    description: `${description} compatible con vehículos ${brand}`,
    price: price,
    image: `https://via.placeholder.com/300x200/0066cc/ffffff?text=${encodeURIComponent(productName)}`,
    category: category.toLowerCase(),
    brand: brand.toLowerCase(),
    subcategory: subcategory.toLowerCase(),
    sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    stock: stock,
    isActive: true,
    isFeatured: Math.random() > 0.8, // 20% de productos destacados
    tags: [category.toLowerCase(), brand.toLowerCase(), subcategory.toLowerCase()],
    specifications: {
      marca: brand,
      categoria: category,
      subcategoria: subcategory,
      compatibilidad: `${brand}, ${category}`,
      garantia: '12 meses'
    },
    popularity: Math.floor(Math.random() * 100) + 1
  };
}

// Función principal para generar productos
export async function generateTestProducts() {
  try {
    console.log('🚀 Iniciando generación de productos de prueba...');
    
    // Generar 150 productos de prueba
    const products = [];
    for (let i = 0; i < 150; i++) {
      products.push(generateRandomProduct());
    }
    
    // Insertar productos en la base de datos
    const result = await Product.insertMany(products);
    console.log(`✅ Generados ${result.length} productos de prueba exitosamente`);
    
    // Mostrar estadísticas
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);
    
    console.log('\n📊 Estadísticas por categoría:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} productos, precio promedio: $${Math.round(stat.avgPrice)}, stock total: ${stat.totalStock}`);
    });
    
    // Estadísticas por marca
    const brandStats = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏷️  Productos por marca:');
    brandStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} productos`);
    });
    
    console.log('\n🎉 Generación de productos de prueba completada!');
    console.log('💡 Ahora puedes probar el sistema de búsqueda avanzada');
    
  } catch (error) {
    console.error('❌ Error generando productos de prueba:', error);
    throw error;
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  generateTestProducts().then(() => {
    mongoose.connection.close();
  });
} 