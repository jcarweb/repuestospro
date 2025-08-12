import mongoose from 'mongoose';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Subcategory from '../models/Subcategory';
import config from '../config/env';

// Datos iniciales para categorías de autos
const carCategories = [
  {
    name: 'Motor',
    description: 'Componentes del motor del vehículo',
    vehicleType: 'car',
    order: 1,
    icon: 'engine'
  },
  {
    name: 'Transmisión',
    description: 'Sistema de transmisión y embrague',
    vehicleType: 'car',
    order: 2,
    icon: 'transmission'
  },
  {
    name: 'Suspensión',
    description: 'Sistema de suspensión y dirección',
    vehicleType: 'car',
    order: 3,
    icon: 'suspension'
  },
  {
    name: 'Frenos',
    description: 'Sistema de frenos',
    vehicleType: 'car',
    order: 4,
    icon: 'brakes'
  },
  {
    name: 'Eléctrico',
    description: 'Sistema eléctrico y electrónico',
    vehicleType: 'car',
    order: 5,
    icon: 'electrical'
  },
  {
    name: 'Carrocería',
    description: 'Partes de la carrocería',
    vehicleType: 'car',
    order: 6,
    icon: 'body'
  },
  {
    name: 'Interior',
    description: 'Componentes del interior del vehículo',
    vehicleType: 'car',
    order: 7,
    icon: 'interior'
  },
  {
    name: 'Climatización',
    description: 'Sistema de aire acondicionado y calefacción',
    vehicleType: 'car',
    order: 8,
    icon: 'climate'
  }
];

// Datos iniciales para marcas de autos
const carBrands = [
  { name: 'Toyota', country: 'Japón', vehicleType: 'car', order: 1 },
  { name: 'Honda', country: 'Japón', vehicleType: 'car', order: 2 },
  { name: 'Nissan', country: 'Japón', vehicleType: 'car', order: 3 },
  { name: 'Mazda', country: 'Japón', vehicleType: 'car', order: 4 },
  { name: 'Mitsubishi', country: 'Japón', vehicleType: 'car', order: 5 },
  { name: 'Subaru', country: 'Japón', vehicleType: 'car', order: 6 },
  { name: 'Suzuki', country: 'Japón', vehicleType: 'car', order: 7 },
  { name: 'Daihatsu', country: 'Japón', vehicleType: 'car', order: 8 },
  { name: 'Lexus', country: 'Japón', vehicleType: 'car', order: 9 },
  { name: 'Infiniti', country: 'Japón', vehicleType: 'car', order: 10 },
  { name: 'Acura', country: 'Japón', vehicleType: 'car', order: 11 },
  { name: 'Volkswagen', country: 'Alemania', vehicleType: 'car', order: 12 },
  { name: 'BMW', country: 'Alemania', vehicleType: 'car', order: 13 },
  { name: 'Mercedes-Benz', country: 'Alemania', vehicleType: 'car', order: 14 },
  { name: 'Audi', country: 'Alemania', vehicleType: 'car', order: 15 },
  { name: 'Porsche', country: 'Alemania', vehicleType: 'car', order: 16 },
  { name: 'Opel', country: 'Alemania', vehicleType: 'car', order: 17 },
  { name: 'Ford', country: 'Estados Unidos', vehicleType: 'car', order: 18 },
  { name: 'Chevrolet', country: 'Estados Unidos', vehicleType: 'car', order: 19 },
  { name: 'Cadillac', country: 'Estados Unidos', vehicleType: 'car', order: 20 },
  { name: 'Buick', country: 'Estados Unidos', vehicleType: 'car', order: 21 },
  { name: 'Chrysler', country: 'Estados Unidos', vehicleType: 'car', order: 22 },
  { name: 'Dodge', country: 'Estados Unidos', vehicleType: 'car', order: 23 },
  { name: 'Jeep', country: 'Estados Unidos', vehicleType: 'car', order: 24 },
  { name: 'Ram', country: 'Estados Unidos', vehicleType: 'car', order: 25 },
  { name: 'Lincoln', country: 'Estados Unidos', vehicleType: 'car', order: 26 },
  { name: 'Pontiac', country: 'Estados Unidos', vehicleType: 'car', order: 27 },
  { name: 'Oldsmobile', country: 'Estados Unidos', vehicleType: 'car', order: 28 },
  { name: 'Plymouth', country: 'Estados Unidos', vehicleType: 'car', order: 29 },
  { name: 'Saturn', country: 'Estados Unidos', vehicleType: 'car', order: 30 },
  { name: 'Hummer', country: 'Estados Unidos', vehicleType: 'car', order: 31 },
  { name: 'Tesla', country: 'Estados Unidos', vehicleType: 'car', order: 32 },
  { name: 'Fiat', country: 'Italia', vehicleType: 'car', order: 33 },
  { name: 'Alfa Romeo', country: 'Italia', vehicleType: 'car', order: 34 },
  { name: 'Lancia', country: 'Italia', vehicleType: 'car', order: 35 },
  { name: 'Maserati', country: 'Italia', vehicleType: 'car', order: 36 },
  { name: 'Ferrari', country: 'Italia', vehicleType: 'car', order: 37 },
  { name: 'Lamborghini', country: 'Italia', vehicleType: 'car', order: 38 },
  { name: 'Peugeot', country: 'Francia', vehicleType: 'car', order: 39 },
  { name: 'Citroën', country: 'Francia', vehicleType: 'car', order: 40 },
  { name: 'Renault', country: 'Francia', vehicleType: 'car', order: 41 },
  { name: 'Alpine', country: 'Francia', vehicleType: 'car', order: 42 },
  { name: 'Bugatti', country: 'Francia', vehicleType: 'car', order: 43 },
  { name: 'Volvo', country: 'Suecia', vehicleType: 'car', order: 44 },
  { name: 'Saab', country: 'Suecia', vehicleType: 'car', order: 45 },
  { name: 'Koenigsegg', country: 'Suecia', vehicleType: 'car', order: 46 },
  { name: 'Hyundai', country: 'Corea del Sur', vehicleType: 'car', order: 47 },
  { name: 'Kia', country: 'Corea del Sur', vehicleType: 'car', order: 48 },
  { name: 'Genesis', country: 'Corea del Sur', vehicleType: 'car', order: 49 },
  { name: 'Daewoo', country: 'Corea del Sur', vehicleType: 'car', order: 50 },
  { name: 'SsangYong', country: 'Corea del Sur', vehicleType: 'car', order: 51 },
  { name: 'Seat', country: 'España', vehicleType: 'car', order: 52 },
  { name: 'Skoda', country: 'República Checa', vehicleType: 'car', order: 53 },
  { name: 'Jaguar', country: 'Reino Unido', vehicleType: 'car', order: 54 },
  { name: 'Land Rover', country: 'Reino Unido', vehicleType: 'car', order: 55 },
  { name: 'Mini', country: 'Reino Unido', vehicleType: 'car', order: 56 },
  { name: 'Rolls-Royce', country: 'Reino Unido', vehicleType: 'car', order: 57 },
  { name: 'Bentley', country: 'Reino Unido', vehicleType: 'car', order: 58 },
  { name: 'Aston Martin', country: 'Reino Unido', vehicleType: 'car', order: 59 },
  { name: 'Lotus', country: 'Reino Unido', vehicleType: 'car', order: 60 },
  { name: 'McLaren', country: 'Reino Unido', vehicleType: 'car', order: 61 },
  { name: 'Caterham', country: 'Reino Unido', vehicleType: 'car', order: 62 },
  { name: 'Morgan', country: 'Reino Unido', vehicleType: 'car', order: 63 },
  { name: 'Noble', country: 'Reino Unido', vehicleType: 'car', order: 64 },
  { name: 'TVR', country: 'Reino Unido', vehicleType: 'car', order: 65 },
  { name: 'MG', country: 'Reino Unido', vehicleType: 'car', order: 66 },
  { name: 'Rover', country: 'Reino Unido', vehicleType: 'car', order: 67 },
  { name: 'Triumph', country: 'Reino Unido', vehicleType: 'car', order: 68 },
  { name: 'Austin', country: 'Reino Unido', vehicleType: 'car', order: 69 },
  { name: 'Morris', country: 'Reino Unido', vehicleType: 'car', order: 70 },
  { name: 'Wolseley', country: 'Reino Unido', vehicleType: 'car', order: 71 },
  { name: 'Riley', country: 'Reino Unido', vehicleType: 'car', order: 72 },
  { name: 'Healey', country: 'Reino Unido', vehicleType: 'car', order: 73 },
  { name: 'Jensen', country: 'Reino Unido', vehicleType: 'car', order: 74 },
  { name: 'Bristol', country: 'Reino Unido', vehicleType: 'car', order: 75 },
  { name: 'Alvis', country: 'Reino Unido', vehicleType: 'car', order: 76 },
  { name: 'Lagonda', country: 'Reino Unido', vehicleType: 'car', order: 77 },
  { name: 'Daimler', country: 'Reino Unido', vehicleType: 'car', order: 78 },
  { name: 'Vauxhall', country: 'Reino Unido', vehicleType: 'car', order: 79 },
  { name: 'Bedford', country: 'Reino Unido', vehicleType: 'car', order: 80 },
  { name: 'Leyland', country: 'Reino Unido', vehicleType: 'car', order: 81 },
  { name: 'Commer', country: 'Reino Unido', vehicleType: 'car', order: 82 },
  { name: 'Karrier', country: 'Reino Unido', vehicleType: 'car', order: 83 },
  { name: 'Guy', country: 'Reino Unido', vehicleType: 'car', order: 84 },
  { name: 'Scammell', country: 'Reino Unido', vehicleType: 'car', order: 85 },
  { name: 'ERF', country: 'Reino Unido', vehicleType: 'car', order: 86 },
  { name: 'Foden', country: 'Reino Unido', vehicleType: 'car', order: 87 },
  { name: 'Seddon', country: 'Reino Unido', vehicleType: 'car', order: 88 },
  { name: 'Atkinson', country: 'Reino Unido', vehicleType: 'car', order: 89 },
  { name: 'Thornycroft', country: 'Reino Unido', vehicleType: 'car', order: 90 },
  { name: 'AEC', country: 'Reino Unido', vehicleType: 'car', order: 91 },
  { name: 'Albion', country: 'Reino Unido', vehicleType: 'car', order: 92 },
  { name: 'Dennis', country: 'Reino Unido', vehicleType: 'car', order: 93 },
  { name: 'Leyland', country: 'Reino Unido', vehicleType: 'car', order: 94 },
  { name: 'Scania', country: 'Suecia', vehicleType: 'car', order: 95 },
  { name: 'MAN', country: 'Alemania', vehicleType: 'car', order: 96 },
  { name: 'Iveco', country: 'Italia', vehicleType: 'car', order: 97 },
  { name: 'DAF', country: 'Países Bajos', vehicleType: 'car', order: 98 },
  { name: 'Volvo Trucks', country: 'Suecia', vehicleType: 'car', order: 99 },
  { name: 'Mercedes-Benz Trucks', country: 'Alemania', vehicleType: 'car', order: 100 }
];

// Función para poblar la base de datos
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando población de base de datos...');

    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a la base de datos');

    // Limpiar colecciones existentes
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('🧹 Colecciones limpiadas');

    // Insertar categorías
    const createdCategories = await Category.insertMany(carCategories);
    console.log(`✅ ${createdCategories.length} categorías insertadas`);

    // Insertar marcas
    const createdBrands = await Brand.insertMany(carBrands);
    console.log(`✅ ${createdBrands.length} marcas insertadas`);

    // Crear algunas subcategorías de ejemplo
    const motorCategory = createdCategories.find(cat => cat.name === 'Motor');
    if (motorCategory) {
      const motorSubcategories = [
        {
          name: 'Pistones',
          description: 'Pistones y anillos del motor',
          categoryId: motorCategory._id,
          vehicleType: 'car',
          order: 1
        },
        {
          name: 'Válvulas',
          description: 'Válvulas de admisión y escape',
          categoryId: motorCategory._id,
          vehicleType: 'car',
          order: 2
        },
        {
          name: 'Bujías',
          description: 'Bujías de encendido',
          categoryId: motorCategory._id,
          vehicleType: 'car',
          order: 3
        },
        {
          name: 'Filtros',
          description: 'Filtros de aceite, aire y combustible',
          categoryId: motorCategory._id,
          vehicleType: 'car',
          order: 4
        }
      ];

      await Subcategory.insertMany(motorSubcategories);
      console.log(`✅ ${motorSubcategories.length} subcategorías de motor insertadas`);
    }

    console.log('🎉 Población de base de datos completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 