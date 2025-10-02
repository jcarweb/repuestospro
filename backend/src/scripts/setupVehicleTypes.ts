import mongoose from 'mongoose';
import VehicleType from '../models/VehicleType';
// Configuración de conexión a MongoDB
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/repuestospro';
// Tipos de vehículos necesarios
const requiredVehicleTypes = [
  {
    name: 'automovil',
    description: 'Vehículos de pasajeros para uso personal y familiar',
    deliveryType: 'delivery_motorizado' as const,
    icon: '🚗'
  },
  {
    name: 'motocicleta',
    description: 'Vehículos de dos ruedas motorizados',
    deliveryType: 'delivery_motorizado' as const,
    icon: '🏍️'
  },
  {
    name: 'camion',
    description: 'Vehículos de carga pesada para transporte de mercancías',
    deliveryType: 'pickup' as const,
    icon: '🚛'
  },
  {
    name: 'maquinaria_agricola',
    description: 'Maquinaria especializada para actividades agrícolas',
    deliveryType: 'pickup' as const,
    icon: '🚜'
  },
  {
    name: 'maquinaria_industrial',
    description: 'Maquinaria pesada para construcción e industria',
    deliveryType: 'pickup' as const,
    icon: '🏭'
  }
];
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}
async function setupVehicleTypes() {
  try {
    await connectToDatabase();
    console.log('🚀 Iniciando configuración de tipos de vehículos...\n');
    // Verificar tipos de vehículos existentes
    const existingTypes = await VehicleType.find({});
    console.log(`📊 Tipos de vehículos existentes: ${existingTypes.length}`);
    if (existingTypes.length > 0) {
      existingTypes.forEach(type => {
        console.log(`   - ${type.name}: ${type.description}`);
      });
    }
    let createdCount = 0;
    let updatedCount = 0;
    for (const vehicleTypeData of requiredVehicleTypes) {
      try {
        // Buscar si el tipo de vehículo ya existe
        let vehicleType = await VehicleType.findOne({ name: vehicleTypeData.name });
        if (vehicleType) {
          // Actualizar si es necesario
          const needsUpdate =
            vehicleType.description !== vehicleTypeData.description ||
            vehicleType.deliveryType !== vehicleTypeData.deliveryType ||
            vehicleType.icon !== vehicleTypeData.icon;
          if (needsUpdate) {
            vehicleType.description = vehicleTypeData.description;
            vehicleType.deliveryType = vehicleTypeData.deliveryType;
            vehicleType.icon = vehicleTypeData.icon;
            vehicleType.isActive = true;
            await vehicleType.save();
            updatedCount++;
          } else {
            console.log(`ℹ️  Tipo de vehículo '${vehicleTypeData.name}' ya existe y está actualizado`);
          }
        } else {
          // Crear nuevo tipo de vehículo
          vehicleType = new VehicleType({
            name: vehicleTypeData.name,
            description: vehicleTypeData.description,
            deliveryType: vehicleTypeData.deliveryType,
            icon: vehicleTypeData.icon,
            isActive: true
          });
          await vehicleType.save();
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error procesando tipo de vehículo '${vehicleTypeData.name}':`, error);
      }
    }
    console.log('\n🎉 Configuración de tipos de vehículos completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Tipos creados: ${createdCount}`);
    console.log(`   - Tipos actualizados: ${updatedCount}`);
    console.log(`   - Total procesados: ${createdCount + updatedCount}`);
    // Mostrar todos los tipos de vehículos finales
    const finalTypes = await VehicleType.find({}).sort({ name: 1 });
    finalTypes.forEach(type => {
      console.log(`   - ${type.name}: ${type.description} (${type.deliveryType})`);
    });
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}
// Ejecutar el script
if (require.main === module) {
  setupVehicleTypes();
}
export default setupVehicleTypes;