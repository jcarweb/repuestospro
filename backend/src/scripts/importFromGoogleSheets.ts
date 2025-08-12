import mongoose from 'mongoose';
import { google } from 'googleapis';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Subcategory from '../models/Subcategory';
import config from '../config/env';

// Configuración de Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: './google-credentials.json', // Necesitarás crear este archivo
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

interface GoogleSheetData {
  categories: any[];
  brands: any[];
  subcategories: any[];
}

async function readGoogleSheet(spreadsheetId: string): Promise<GoogleSheetData> {
  try {
    console.log('📖 Leyendo datos del Google Sheet...');
    
    // Leer la pestaña "maestros"
    const maestrosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'maestros!A:B', // Solo columnas A y B
    });

    // Leer la pestaña de subcategorías
    const subcategoriesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'subcategorias!A:B', // Solo columnas A y B
    });

    const maestrosData = maestrosResponse.data.values || [];
    const subcategoriesData = subcategoriesResponse.data.values || [];

    // Procesar datos de maestros (categorías y marcas)
    const categories: any[] = [];
    const brands: any[] = [];

    // Saltar la primera fila (encabezados)
    for (let i = 1; i < maestrosData.length; i++) {
      const row = maestrosData[i];
      
      if (row.length >= 2) {
        const categoria = row[0]?.trim();
        const marca = row[1]?.trim();
        
        // Agregar categoría si existe y no está duplicada
        if (categoria && categoria !== '') {
          const existingCategory = categories.find(cat => cat.name === categoria);
          if (!existingCategory) {
            categories.push({
              name: categoria,
              description: `Categoría de ${categoria.toLowerCase()}`,
              vehicleType: 'car',
              order: categories.length + 1,
              isActive: true,
              icon: getIconForCategory(categoria)
            });
          }
        }
        
        // Agregar marca si existe y no está duplicada
        if (marca && marca !== '') {
          const existingBrand = brands.find(brand => brand.name === marca);
          if (!existingBrand) {
            brands.push({
              name: marca,
              description: `Fabricante de automóviles ${marca}`,
              vehicleType: 'car',
              order: brands.length + 1,
              isActive: true,
              country: getCountryForBrand(marca),
              website: '',
              logo: ''
            });
          }
        }
      }
    }

    // Procesar subcategorías
    const subcategories: any[] = [];
    for (let i = 1; i < subcategoriesData.length; i++) {
      const row = subcategoriesData[i];
      
      if (row.length >= 2) {
        const categoryName = row[0]?.trim();
        const subcategoryName = row[1]?.trim();
        
        if (categoryName && subcategoryName && categoryName !== '' && subcategoryName !== '') {
          subcategories.push({
            name: subcategoryName,
            description: `Subcategoría de ${subcategoryName.toLowerCase()}`,
            categoryName: categoryName, // Nombre de la categoría padre
            vehicleType: 'car',
            order: subcategories.length + 1,
            isActive: true,
            icon: getIconForSubcategory(subcategoryName),
            image: ''
          });
        }
      }
    }

    return { categories, brands, subcategories };
  } catch (error) {
    console.error('❌ Error leyendo Google Sheet:', error);
    throw error;
  }
}

// Función para asignar iconos según la categoría
function getIconForCategory(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    'Neumaticos y productos relacionados': 'tires',
    'Frenos': 'brakes',
    'Filtros': 'filter',
    'Aceite y líquidos': 'oil',
    'Motor': 'engine',
    'Carroceria': 'body',
    'Suspensión y brazos': 'suspension',
    'Amortiguación': 'shock-absorber',
    'Limpieza de Cristales': 'glass-cleaner',
    'Sistemas de Escape': 'exhaust',
    'Accesorios': 'accessories',
    'Sistema de encendido e incandecencia': 'ignition',
    'Interior y confort': 'interior',
    'Correas cadenas': 'belt',
    'Iluminación': 'lighting',
    'Sistema eléctrico': 'electrical',
    'Sistema de refrigeración de motor': 'cooling',
    'tripoides': 'tripod',
    'Productos de cuidado para el carro': 'care',
    'Herramientas': 'tools',
    'Aire acondicionado': 'air-conditioning',
    'Sistema de Combustible': 'fuel',
    'Dirección': 'steering',
    'Transmisión': 'transmission',
    'Sujeciones': 'fasteners',
    'Mangueras': 'hoses',
    'Juntas y retenes': 'gaskets',
    'Calefacción / Ventilación': 'heating',
    'Suspensión Neumática': 'air-suspension',
    'Sensores Reles Unidades de control': 'sensors',
    'Kit de reparación': 'repair-kit',
    'Arboles de transmisión y diferenciales': 'driveshaft',
    'Remolque / Piezas adicionales': 'trailer'
  };
  
  return iconMap[categoryName] || 'default';
}

// Función para asignar iconos según la subcategoría
function getIconForSubcategory(subcategoryName: string): string {
  const iconMap: { [key: string]: string } = {
    'Bomba de agua + Kit de distribución': 'water-pump',
    'KIT DE DISTRIBUCIÓN': 'timing-belt',
    'KIT DE MONTAJE DE LA CADENA DE DISTRIBUCIÓN': 'timing-chain',
    'TACO DE MOTOR': 'engine-mount',
    'CORREA DE DISTRIBUCIÓN': 'timing-belt',
    'CORREA POLY V': 'poly-v-belt',
    'KIT DE CORREA POLY V': 'poly-v-kit',
    'POLEA TENSORA,CORREA DENTADA': 'tensioner'
  };
  
  return iconMap[subcategoryName] || 'default';
}

// Función para asignar países según la marca
function getCountryForBrand(brandName: string): string {
  const countryMap: { [key: string]: string } = {
    'Abarth': 'Italia',
    'BMW': 'Alemania',
    'Dacia': 'Rumania',
    'Infiniti': 'Japón',
    'Kia': 'Corea del Sur',
    'Land Rover': 'Reino Unido',
    'Mercedes-Benz': 'Alemania',
    'Opel': 'Alemania',
    'Rolls-Royce': 'Reino Unido',
    'Subaru': 'Japón',
    'Volkswagen': 'Alemania',
    'Alfa Romeo': 'Italia',
    'Cadillac': 'Estados Unidos',
    'Ferrari': 'Italia',
    'Isuzu': 'Japón',
    'KTM': 'Austria',
    'Lexus': 'Japón',
    'Mini': 'Reino Unido',
    'Peugeot': 'Francia',
    'Seat': 'España',
    'Suzuki': 'Japón',
    'Volvo': 'Suecia',
    'Aston Martin': 'Reino Unido',
    'Caterham': 'Reino Unido',
    'Fiat': 'Italia',
    'Iveco': 'Italia',
    'Lada': 'Rusia',
    'Lotus': 'Reino Unido',
    'Mitsubishi': 'Japón',
    'Piaggio': 'Italia',
    'Skoda': 'República Checa',
    'Tata': 'India',
    'Audi': 'Alemania',
    'Chevrolet': 'Estados Unidos',
    'Ford': 'Estados Unidos',
    'Jaguar': 'Reino Unido',
    'Lamborghini': 'Italia',
    'Maserati': 'Italia',
    'Morgan': 'Reino Unido',
    'Porsche': 'Alemania',
    'Smart': 'Alemania',
    'Tesla': 'Estados Unidos',
    'Bentley': 'Reino Unido',
    'Citroen': 'Francia',
    'Honda': 'Japón',
    'Jeep': 'Estados Unidos',
    'Lancia': 'Italia',
    'Mazda': 'Japón',
    'Nissan': 'Japón',
    'Renault': 'Francia',
    'SsangYong': 'Corea del Sur',
    'Toyota': 'Japón',
    'JAC': 'China',
    'Chery': 'China'
  };
  
  return countryMap[brandName] || '';
}

async function importToMongoDB(data: GoogleSheetData): Promise<void> {
  try {
    console.log('🗄️ Importando datos a MongoDB...');

    // Limpiar colecciones existentes
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('🧹 Colecciones limpiadas');

    // Insertar categorías
    if (data.categories.length > 0) {
      const createdCategories = await Category.insertMany(data.categories);
      console.log(`✅ ${createdCategories.length} categorías insertadas`);
    }

    // Insertar marcas
    if (data.brands.length > 0) {
      const createdBrands = await Brand.insertMany(data.brands);
      console.log(`✅ ${createdBrands.length} marcas insertadas`);
    }

    // Insertar subcategorías (necesitamos mapear categoryName a categoryId)
    if (data.subcategories.length > 0) {
      const categories = await Category.find({});
      const categoryMap = new Map(categories.map(cat => [cat.name, cat._id]));

      const subcategoriesWithIds = data.subcategories.map(sub => ({
        ...sub,
        categoryId: categoryMap.get(sub.categoryName),
      })).filter(sub => sub.categoryId); // Solo incluir si se encontró la categoría

      if (subcategoriesWithIds.length > 0) {
        await Subcategory.insertMany(subcategoriesWithIds);
        console.log(`✅ ${subcategoriesWithIds.length} subcategorías insertadas`);
      }

      // Mostrar subcategorías que no se pudieron mapear
      const unmappedSubcategories = data.subcategories.filter(sub => 
        !categoryMap.has(sub.categoryName)
      );
      if (unmappedSubcategories.length > 0) {
        console.log(`⚠️ ${unmappedSubcategories.length} subcategorías no se pudieron mapear:`);
        unmappedSubcategories.forEach(sub => {
          console.log(`   - ${sub.name} (categoría: ${sub.categoryName})`);
        });
      }
    }

    console.log('🎉 Importación completada exitosamente');
  } catch (error) {
    console.error('❌ Error importando a MongoDB:', error);
    throw error;
  }
}

async function importFromGoogleSheets(spreadsheetId: string): Promise<void> {
  try {
    console.log('🚀 Iniciando importación desde Google Sheets...');

    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a la base de datos');

    // Leer datos del Google Sheet
    const data = await readGoogleSheet(spreadsheetId);

    // Importar a MongoDB
    await importToMongoDB(data);

  } catch (error) {
    console.error('❌ Error en la importación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const spreadsheetId = process.argv[2];
  if (!spreadsheetId) {
    console.error('❌ Debes proporcionar el ID del Google Sheet como argumento');
    console.log('Uso: npm run import-sheets <SPREADSHEET_ID>');
    process.exit(1);
  }
  importFromGoogleSheets(spreadsheetId);
}

export default importFromGoogleSheets; 