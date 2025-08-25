const mongoose = require('mongoose');

console.log('🔍 Iniciando prueba de conexión a MongoDB...');

// Intentar conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/piezasya', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conexión a MongoDB establecida exitosamente');
  console.log('✅ Base de datos:', mongoose.connection.db.databaseName);
  console.log('✅ Host:', mongoose.connection.host);
  console.log('✅ Puerto:', mongoose.connection.port);
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
  console.error('❌ Error completo:', error);
})
.finally(() => {
  console.log('🔌 Cerrando conexión...');
  mongoose.disconnect()
    .then(() => {
      console.log('✅ Conexión cerrada exitosamente');
    })
    .catch((error) => {
      console.error('❌ Error cerrando conexión:', error);
    });
});
