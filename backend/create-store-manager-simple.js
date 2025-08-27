require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Conectar a MongoDB usando la configuración del .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquemas simplificados
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  isEmailVerified: Boolean,
  isActive: Boolean
});

const storeSchema = new mongoose.Schema({
  name: String,
  description: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  phone: String,
  email: String,
  isMainStore: Boolean,
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);

async function createStoreManager() {
  try {
    console.log('🔍 Iniciando script de creación de usuario...');
    console.log('🔍 Conectando a MongoDB...');
    console.log('🔍 URI de MongoDB:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: 'jucarl74@gmail.com' });
    if (existingUser) {
      console.log('⚠️ El usuario ya existe');
      return;
    }
    
    // Buscar o crear una tienda
    let store = await Store.findOne();
    if (!store) {
      console.log('🏪 Creando tienda de prueba...');
      store = new Store({
        name: 'Tienda Principal',
        description: 'Tienda principal del sistema',
        address: 'Av. Principal 123',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-555-0101',
        email: 'tienda@test.com',
        isMainStore: true,
        managers: [],
        owner: null,
        coordinates: {
          latitude: 10.4806,
          longitude: -66.9036
        }
      });
      await store.save();
      console.log('✅ Tienda creada:', store.name);
    } else {
      console.log('✅ Tienda encontrada:', store.name);
    }
    
    // Crear el usuario gestor de tienda
    const hashedPassword = crypto.createHash('sha256').update('123456Aa@').digest('hex');
    const user = new User({
      name: 'Gestor de Tienda',
      email: 'jucarl74@gmail.com',
      password: hashedPassword,
      role: 'store_manager',
      stores: [store._id],
      isEmailVerified: true,
      isActive: true
    });
    
    await user.save();
    console.log('✅ Usuario creado:', user.email);
    
    // Asignar el usuario como manager de la tienda
    store.managers.push(user._id);
    if (!store.owner) {
      store.owner = user._id;
    }
    await store.save();
    console.log('✅ Usuario asignado como manager de la tienda');
    
    // Verificar el resultado
    const createdUser = await User.findOne({ email: 'jucarl74@gmail.com' }).populate('stores');
    console.log('🔍 Usuario creado:');
    console.log('   - ID:', createdUser._id);
    console.log('   - Nombre:', createdUser.name);
    console.log('   - Email:', createdUser.email);
    console.log('   - Rol:', createdUser.role);
    console.log('   - Tiendas:', createdUser.stores?.length || 0);
    if (createdUser.stores && createdUser.stores.length > 0) {
      createdUser.stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.isMainStore ? 'Principal' : 'Sucursal'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createStoreManager();
