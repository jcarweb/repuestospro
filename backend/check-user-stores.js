require('dotenv').config();
const mongoose = require('mongoose');

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

async function checkUserStores() {
  try {
    console.log('🔍 Verificando usuario jucarl74@gmail.com...');
    
    // Buscar el usuario
    const user = await User.findOne({ email: 'jucarl74@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('   - ID:', user._id);
    console.log('   - Nombre:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Rol:', user.role);
    console.log('   - Tiendas en campo stores:', user.stores?.length || 0);
    
    // Buscar tiendas donde es manager
    const storesAsManager = await Store.find({ managers: user._id });
    console.log('🏪 Tiendas donde es manager:', storesAsManager.length);
    
    if (storesAsManager.length > 0) {
      storesAsManager.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.isMainStore ? 'Principal' : 'Sucursal'})`);
      });
      
      // Actualizar el usuario con las tiendas si no las tiene
      if (!user.stores || user.stores.length === 0) {
        user.stores = storesAsManager.map(store => store._id);
        await user.save();
        console.log('✅ Usuario actualizado con tiendas');
      }
    } else {
      console.log('⚠️ No se encontraron tiendas donde sea manager');
      
      // Buscar todas las tiendas disponibles
      const allStores = await Store.find().limit(5);
      console.log('📋 Tiendas disponibles en el sistema:', allStores.length);
      
      if (allStores.length > 0) {
        // Asignar la primera tienda al usuario
        const firstStore = allStores[0];
        user.stores = [firstStore._id];
        await user.save();
        
        // Agregar el usuario como manager de la tienda
        if (!firstStore.managers.includes(user._id)) {
          firstStore.managers.push(user._id);
          await firstStore.save();
        }
        
        console.log('✅ Usuario asignado a tienda:', firstStore.name);
      }
    }
    
    // Verificar el resultado final
    const updatedUser = await User.findOne({ email: 'jucarl74@gmail.com' }).populate('stores');
    console.log('🔍 Usuario final:');
    console.log('   - Tiendas:', updatedUser.stores?.length || 0);
    if (updatedUser.stores && updatedUser.stores.length > 0) {
      updatedUser.stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.isMainStore ? 'Principal' : 'Sucursal'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserStores();
