import mongoose from 'mongoose';
import Brand from '../models/Brand';
import VehicleType from '../models/VehicleType';

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

// Marcas específicas de Venezuela por tipo de vehículo
const venezuelaBrands = {
  automovil: [
    { name: 'Toyota', country: 'Japón', description: 'Fabricante japonés de automóviles' },
    { name: 'Honda', country: 'Japón', description: 'Fabricante japonés de automóviles y motocicletas' },
    { name: 'Ford', country: 'Estados Unidos', description: 'Fabricante estadounidense de automóviles' },
    { name: 'Chevrolet', country: 'Estados Unidos', description: 'Marca de General Motors' },
    { name: 'Nissan', country: 'Japón', description: 'Fabricante japonés de automóviles' },
    { name: 'BMW', country: 'Alemania', description: 'Fabricante alemán de automóviles de lujo' },
    { name: 'Mercedes', country: 'Alemania', description: 'Fabricante alemán de automóviles de lujo' },
    { name: 'Audi', country: 'Alemania', description: 'Fabricante alemán de automóviles de lujo' },
    { name: 'Volkswagen', country: 'Alemania', description: 'Fabricante alemán de automóviles' },
    { name: 'Hyundai', country: 'Corea del Sur', description: 'Fabricante coreano de automóviles' },
    { name: 'Kia', country: 'Corea del Sur', description: 'Fabricante coreano de automóviles' },
    { name: 'Mazda', country: 'Japón', description: 'Fabricante japonés de automóviles' },
    { name: 'Subaru', country: 'Japón', description: 'Fabricante japonés de automóviles' },
    { name: 'Mitsubishi', country: 'Japón', description: 'Fabricante japonés de automóviles' },
    { name: 'Lexus', country: 'Japón', description: 'Marca de lujo de Toyota' },
    { name: 'Peugeot', country: 'Francia', description: 'Fabricante francés de automóviles' },
    { name: 'Renault', country: 'Francia', description: 'Fabricante francés de automóviles' },
    { name: 'Fiat', country: 'Italia', description: 'Fabricante italiano de automóviles' },
    { name: 'Seat', country: 'España', description: 'Fabricante español de automóviles' },
    { name: 'Skoda', country: 'República Checa', description: 'Fabricante checo de automóviles' },
    { name: 'Volvo', country: 'Suecia', description: 'Fabricante sueco de automóviles' },
    { name: 'Jaguar', country: 'Reino Unido', description: 'Fabricante británico de automóviles de lujo' },
    { name: 'Land Rover', country: 'Reino Unido', description: 'Fabricante británico de vehículos todo terreno' },
    { name: 'Datsun', country: 'Japón', description: 'Marca de Nissan para mercados emergentes' },
    { name: 'Dongfeng', country: 'China', description: 'Fabricante chino de automóviles' },
    { name: 'JAC Motors', country: 'China', description: 'Fabricante chino de automóviles' }
  ],
  motocicleta: [
    { name: 'Bera', country: 'Venezuela', description: 'Marca venezolana de motocicletas' },
    { name: 'Empire Keeway', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'Suzuki', country: 'Japón', description: 'Fabricante japonés de motocicletas' },
    { name: 'Yamaha', country: 'Japón', description: 'Fabricante japonés de motocicletas' },
    { name: 'Kawasaki', country: 'Japón', description: 'Fabricante japonés de motocicletas' },
    { name: 'Toro', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'MD', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'Skygo', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'AVA', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'Haojue', country: 'China', description: 'Marca china de motocicletas (Suzuki-Haojue)' },
    { name: 'Vefase', country: 'Venezuela', description: 'Marca venezolana de motocicletas' },
    { name: 'Ducati', country: 'Italia', description: 'Fabricante italiano de motocicletas de lujo' },
    { name: 'Benelli', country: 'Italia', description: 'Fabricante italiano de motocicletas' },
    { name: 'TVS', country: 'India', description: 'Fabricante indio de motocicletas' },
    { name: 'Honda', country: 'Japón', description: 'Fabricante japonés de motocicletas' },
    { name: 'Bajaj', country: 'India', description: 'Fabricante indio de motocicletas' },
    { name: 'Zontes', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'CFMoto', country: 'China', description: 'Marca china de motocicletas' },
    { name: 'KTM', country: 'Austria', description: 'Fabricante austriaco de motocicletas' },
    { name: 'Aprilia', country: 'Italia', description: 'Fabricante italiano de motocicletas' },
    { name: 'Harley-Davidson', country: 'Estados Unidos', description: 'Fabricante estadounidense de motocicletas' },
    { name: 'Triumph', country: 'Reino Unido', description: 'Fabricante británico de motocicletas' }
  ],
  camion: [
    { name: 'Foton', country: 'China', description: 'Fabricante chino de camiones' },
    { name: 'Mack', country: 'Estados Unidos', description: 'Fabricante estadounidense de camiones pesados' },
    { name: 'Volvo', country: 'Suecia', description: 'Fabricante sueco de camiones' },
    { name: 'Iveco', country: 'Italia', description: 'Fabricante italiano de camiones' },
    { name: 'Ford', country: 'Estados Unidos', description: 'Fabricante estadounidense de camiones' },
    { name: 'Chevrolet', country: 'Estados Unidos', description: 'Marca de General Motors para camiones' },
    { name: 'Dongfeng', country: 'China', description: 'Fabricante chino de camiones' },
    { name: 'Dina', country: 'México', description: 'Fabricante mexicano de camiones' },
    { name: 'JAC Motors', country: 'China', description: 'Fabricante chino de camiones' },
    { name: 'Mitsubishi Fuso', country: 'Japón', description: 'Fabricante japonés de camiones' },
    { name: 'Datsun', country: 'Japón', description: 'Marca de Nissan para camiones' },
    { name: 'Mercedes-Benz', country: 'Alemania', description: 'Fabricante alemán de camiones' },
    { name: 'Scania', country: 'Suecia', description: 'Fabricante sueco de camiones' },
    { name: 'MAN', country: 'Alemania', description: 'Fabricante alemán de camiones' },
    { name: 'Freightliner', country: 'Estados Unidos', description: 'Fabricante estadounidense de camiones' },
    { name: 'Kenworth', country: 'Estados Unidos', description: 'Fabricante estadounidense de camiones' },
    { name: 'International', country: 'Estados Unidos', description: 'Fabricante estadounidense de camiones' },
    { name: 'Caterpillar', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria pesada' }
  ],
  maquinaria_agricola: [
    { name: 'John Deere', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria agrícola' },
    { name: 'New Holland', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Massey Ferguson', country: 'Reino Unido', description: 'Fabricante británico de maquinaria agrícola' },
    { name: 'Fendt', country: 'Alemania', description: 'Fabricante alemán de maquinaria agrícola' },
    { name: 'Kubota', country: 'Japón', description: 'Fabricante japonés de maquinaria agrícola' },
    { name: 'Deutz-Fahr', country: 'Alemania', description: 'Fabricante alemán de maquinaria agrícola' },
    { name: 'Case IH', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria agrícola' },
    { name: 'Claas', country: 'Alemania', description: 'Fabricante alemán de maquinaria agrícola' },
    { name: 'JCB', country: 'Reino Unido', description: 'Fabricante británico de maquinaria agrícola' },
    { name: 'Iseki', country: 'Japón', description: 'Fabricante japonés de maquinaria agrícola' },
    { name: 'Valtra', country: 'Finlandia', description: 'Fabricante finlandés de maquinaria agrícola' },
    { name: 'Landini', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'McCormick', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Same', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Lamborghini', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Antonio Carraro', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Goldoni', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Arbos', country: 'Italia', description: 'Fabricante italiano de maquinaria agrícola' },
    { name: 'Solis', country: 'India', description: 'Fabricante indio de maquinaria agrícola' },
    { name: 'Mahindra', country: 'India', description: 'Fabricante indio de maquinaria agrícola' },
    { name: 'Tafe', country: 'India', description: 'Fabricante indio de maquinaria agrícola' }
  ],
  maquinaria_industrial: [
    { name: 'Foton', country: 'China', description: 'Fabricante chino de maquinaria industrial' },
    { name: 'Mack', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria industrial' },
    { name: 'Volvo', country: 'Suecia', description: 'Fabricante sueco de maquinaria industrial' },
    { name: 'Dina', country: 'México', description: 'Fabricante mexicano de maquinaria industrial' },
    { name: 'Iveco', country: 'Italia', description: 'Fabricante italiano de maquinaria industrial' },
    { name: 'Dongfeng', country: 'China', description: 'Fabricante chino de maquinaria industrial' },
    { name: 'JAC', country: 'China', description: 'Fabricante chino de maquinaria industrial' },
    { name: 'Hino', country: 'Japón', description: 'Fabricante japonés de maquinaria industrial' },
    { name: 'Isuzu', country: 'Japón', description: 'Fabricante japonés de maquinaria industrial' },
    { name: 'Maxus', country: 'China', description: 'Fabricante chino de maquinaria industrial' },
    { name: 'Mercedes-Benz', country: 'Alemania', description: 'Fabricante alemán de maquinaria industrial' },
    { name: 'Scania', country: 'Suecia', description: 'Fabricante sueco de maquinaria industrial' },
    { name: 'MAN', country: 'Alemania', description: 'Fabricante alemán de maquinaria industrial' },
    { name: 'Freightliner', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria industrial' },
    { name: 'Kenworth', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria industrial' },
    { name: 'International', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria industrial' },
    { name: 'Caterpillar', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria pesada' },
    { name: 'Chevrolet', country: 'Estados Unidos', description: 'Marca de General Motors para maquinaria industrial' },
    { name: 'Cat', country: 'Estados Unidos', description: 'Abreviatura de Caterpillar' },
    { name: 'Komatsu', country: 'Japón', description: 'Fabricante japonés de maquinaria pesada' },
    { name: 'XCMG', country: 'China', description: 'Fabricante chino de maquinaria pesada' },
    { name: 'John Deere', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria industrial' },
    { name: 'Sany', country: 'China', description: 'Fabricante chino de maquinaria pesada' },
    { name: 'Volvo CE', country: 'Suecia', description: 'División de construcción de Volvo' },
    { name: 'Liebherr', country: 'Alemania', description: 'Fabricante alemán de maquinaria pesada' },
    { name: 'Hitachi', country: 'Japón', description: 'Fabricante japonés de maquinaria pesada' },
    { name: 'Doosan', country: 'Corea del Sur', description: 'Fabricante coreano de maquinaria pesada' },
    { name: 'Hyundai', country: 'Corea del Sur', description: 'Fabricante coreano de maquinaria pesada' },
    { name: 'JCB', country: 'Reino Unido', description: 'Fabricante británico de maquinaria pesada' },
    { name: 'Bobcat', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria compacta' },
    { name: 'Case', country: 'Estados Unidos', description: 'Fabricante estadounidense de maquinaria pesada' },
    { name: 'Miller', country: 'Estados Unidos', description: 'Fabricante estadounidense de equipos de soldadura' },
    { name: 'Hypertherm', country: 'Estados Unidos', description: 'Fabricante estadounidense de equipos de corte' },
    { name: 'ESAB', country: 'Suecia', description: 'Fabricante sueco de equipos de soldadura' },
    { name: 'Lincoln Electric', country: 'Estados Unidos', description: 'Fabricante estadounidense de equipos de soldadura' },
    { name: 'Fronius', country: 'Austria', description: 'Fabricante austriaco de equipos de soldadura' },
    { name: 'Kemppi', country: 'Finlandia', description: 'Fabricante finlandés de equipos de soldadura' },
    { name: 'Agrometal', country: 'Venezuela', description: 'Fabricante venezolano de maquinaria agrícola' },
    { name: 'Bombagua', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' },
    { name: 'Induveca', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' },
    { name: 'INVEVAL', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' },
    { name: 'Metalúrgica Venezolana', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' },
    { name: 'Industrias Venoco', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' },
    { name: 'Maquinarias del Sur', country: 'Venezuela', description: 'Fabricante venezolano de maquinaria' },
    { name: 'Equipos Industriales CA', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales' }
  ]
};

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function getVehicleTypeId(name: string): Promise<string | null> {
  const vehicleType = await VehicleType.findOne({ name: name.toLowerCase() });
  return vehicleType?._id?.toString() || null;
}

async function createOrUpdateBrand(brandData: any, vehicleTypeId: string) {
  try {
    // Buscar si la marca ya existe
    let brand = await Brand.findOne({ name: brandData.name });
    
    if (brand) {
      // Si existe, agregar el tipo de vehículo si no está ya incluido
      if (!brand.vehicleTypes.includes(vehicleTypeId as any)) {
        brand.vehicleTypes.push(vehicleTypeId as any);
        await brand.save();
        console.log(`✅ Marca ${brandData.name} actualizada con tipo de vehículo`);
      } else {
        console.log(`ℹ️  Marca ${brandData.name} ya tiene este tipo de vehículo`);
      }
    } else {
      // Crear nueva marca
      brand = new Brand({
        name: brandData.name,
        description: brandData.description,
        country: brandData.country,
        vehicleTypes: [vehicleTypeId as any],
        isActive: true
      });
      
      await brand.save();
      console.log(`✅ Marca ${brandData.name} creada exitosamente`);
    }
  } catch (error) {
    console.error(`❌ Error procesando marca ${brandData.name}:`, error);
  }
}

async function seedVenezuelaBrands() {
  try {
    await connectToDatabase();
    
    console.log('🚀 Iniciando proceso de carga de marcas venezolanas...\n');
    
    // Obtener IDs de tipos de vehículos (usando los nombres correctos de la interfaz)
    const vehicleTypeIds: { [key: string]: string | null } = {};
    
    // Mapeo de tipos de vehículos: clave del script -> nombre en la base de datos
    const vehicleTypeMapping = {
      'automovil': 'automóviles',
      'motocicleta': 'motos', 
      'camion': 'camiones',
      'maquinaria_agricola': 'maquinaria agrícola',
      'maquinaria_industrial': 'maquinaria industrial'
    };
    
    for (const [scriptKey, dbName] of Object.entries(vehicleTypeMapping)) {
      const id = await getVehicleTypeId(dbName);
      vehicleTypeIds[scriptKey] = id;
      
      if (!id) {
        console.log(`⚠️  Tipo de vehículo '${dbName}' no encontrado en la base de datos`);
      } else {
        console.log(`✅ Tipo de vehículo '${dbName}' encontrado con ID: ${id}`);
      }
    }
    
    console.log('\n📦 Procesando marcas por tipo de vehículo...\n');
    
    // Procesar cada tipo de vehículo
    for (const [vehicleType, brands] of Object.entries(venezuelaBrands)) {
      const vehicleTypeId = vehicleTypeIds[vehicleType];
      
      if (!vehicleTypeId) {
        console.log(`⚠️  Saltando ${vehicleType} - tipo de vehículo no encontrado`);
        continue;
      }
      
      console.log(`\n🏷️  Procesando marcas para ${vehicleType}:`);
      console.log(`   Total de marcas: ${brands.length}`);
      
      for (const brandData of brands) {
        console.log(`   🔍 Procesando marca: ${brandData.name} (${brandData.country})`);
        await createOrUpdateBrand(brandData, vehicleTypeId);
      }
      
      console.log(`✅ Completado ${vehicleType} - ${brands.length} marcas procesadas`);
    }
    
    console.log('\n🎉 Proceso de carga de marcas venezolanas completado exitosamente!');
    
    // Mostrar estadísticas finales
    const totalBrands = await Brand.countDocuments();
    console.log(`\n📊 Estadísticas finales:`);
    console.log(`   Total de marcas en la base de datos: ${totalBrands}`);
    
    // Mostrar marcas por tipo de vehículo
    for (const vehicleType of ['automovil', 'motocicleta', 'camion', 'maquinaria_agricola', 'maquinaria_industrial']) {
      const vehicleTypeId = vehicleTypeIds[vehicleType];
      if (vehicleTypeId) {
        const count = await Brand.countDocuments({ vehicleTypes: vehicleTypeId });
        console.log(`   ${vehicleType}: ${count} marcas`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el proceso de carga:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedVenezuelaBrands();
}

export default seedVenezuelaBrands;
