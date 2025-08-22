require('dotenv').config();
const mongoose = require('mongoose');
const { venezuelaStates, venezuelaMunicipalities, venezuelaParishes } = require('./venezuela-complete-data-full');

// Definir los esquemas directamente en el script para evitar problemas de importación
const StateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, required: true, trim: true, unique: true, uppercase: true, maxlength: 2 },
  capital: { type: String, required: true, trim: true },
  region: { type: String, required: true, trim: true, enum: ['Central', 'Occidental', 'Oriental', 'Guayana', 'Los Llanos', 'Insular', 'Zuliana'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MunicipalitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  capital: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ParishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  municipality: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Crear los modelos
const State = mongoose.model('State', StateSchema);
const Municipality = mongoose.model('Municipality', MunicipalitySchema);
const Parish = mongoose.model('Parish', ParishSchema);

// Datos reales de Venezuela (Estados, Municipios y Parroquias)
const venezuelaData = {
  states: venezuelaStates,
  municipalities: venezuelaMunicipalities,
  parishes: venezuelaParishes
};

async function seedVenezuelaData() {
  try {
    console.log('🌱 Iniciando población de datos de Venezuela...');
    console.log('📊 Datos a cargar:');
    console.log(`   - Estados: ${venezuelaData.states.length}`);
    console.log(`   - Municipios: ${venezuelaData.municipalities.length}`);
    console.log(`   - Parroquias: ${venezuelaData.parishes.length}`);

    // Conectar a la base de datos
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI no está configurada en el archivo .env');
      return;
    }
    console.log(`🔌 Conectando a MongoDB Atlas...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a la base de datos');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await State.deleteMany({});
    await Municipality.deleteMany({});
    await Parish.deleteMany({});
    console.log('✅ Datos limpiados');

    // Crear estados
    console.log('🏛️ Creando estados...');
    const createdStates = await State.insertMany(venezuelaData.states);
    console.log(`✅ ${createdStates.length} estados creados`);

    // Crear mapa de códigos de estado para referencias
    const stateCodeMap = {};
    createdStates.forEach(state => {
      stateCodeMap[state.code] = state._id;
    });

    // Crear municipios
    console.log('🏘️ Creando municipios...');
    const municipalitiesWithStateRefs = venezuelaData.municipalities.map(municipality => ({
      ...municipality,
      state: stateCodeMap[municipality.stateCode]
    })).filter(m => m.state); // Filtrar solo los que tienen estado válido

    const createdMunicipalities = await Municipality.insertMany(municipalitiesWithStateRefs);
    console.log(`✅ ${createdMunicipalities.length} municipios creados`);

    // Crear mapa de códigos de municipio para referencias
    const municipalityCodeMap = {};
    createdMunicipalities.forEach(municipality => {
      municipalityCodeMap[municipality.code] = municipality._id;
    });

    // Crear parroquias
    console.log('🏠 Creando parroquias...');
    const parishesWithMunicipalityRefs = venezuelaData.parishes.map(parish => ({
      ...parish,
      municipality: municipalityCodeMap[parish.municipalityCode]
    })).filter(p => p.municipality); // Filtrar solo los que tienen municipio válido

    const createdParishes = await Parish.insertMany(parishesWithMunicipalityRefs);
    console.log(`✅ ${createdParishes.length} parroquias creadas`);

    console.log('🎉 Población de datos de Venezuela completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Estados: ${createdStates.length}`);
    console.log(`   - Municipios: ${createdMunicipalities.length}`);
    console.log(`   - Parroquias: ${createdParishes.length}`);

  } catch (error) {
    console.error('❌ Error durante la población de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando script de población de datos...');
  seedVenezuelaData().then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
}

module.exports = { seedVenezuelaData, venezuelaData };
