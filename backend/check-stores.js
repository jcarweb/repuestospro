const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkStores() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');
    
    const db = client.db();
    const storesCollection = db.collection('stores');
    
    console.log('\n📊 Tiendas existentes:');
    const stores = await storesCollection.find({}).project({
      name: 1,
      city: 1,
      state: 1,
      isActive: 1
    }).toArray();
    
    if (stores.length === 0) {
      console.log('⚠️ No hay tiendas en la base de datos');
    } else {
      stores.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name} (${store.city}, ${store.state}) - ${store.isActive ? 'Activa' : 'Inactiva'}`);
      });
    }
    
    console.log(`\n📈 Total de tiendas: ${stores.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Desconectado');
  }
}

checkStores();
