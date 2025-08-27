const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
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

const User = mongoose.model('User', userSchema);

async function generateTokenAndTest() {
  try {
    console.log('🔑 Generando token para el gestor de tienda...');
    
    // 1. Buscar el gestor de tienda
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com',
      role: 'store_manager'
    });
    
    if (!storeManager) {
      console.log('❌ Gestor de tienda no encontrado');
      return;
    }
    
    console.log('✅ Gestor de tienda encontrado:');
    console.log(`   - ID: ${storeManager._id}`);
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Rol: ${storeManager.role}`);
    console.log(`   - Activo: ${storeManager.isActive}`);
    
    // 2. Generar token JWT
    const payload = {
      userId: storeManager._id,
      email: storeManager.email,
      role: storeManager.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });
    
    console.log('\n🔑 Token generado:');
    console.log(`   - Token: ${token.substring(0, 50)}...`);
    console.log(`   - Longitud: ${token.length} caracteres`);
    
    // 3. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('\n✅ Token verificado:');
    console.log(`   - Payload: ${JSON.stringify(decoded, null, 2)}`);
    
    // 4. Simular la llamada a la API
    console.log('\n🌐 Simulando llamada a la API...');
    
    // URL de la API (asumiendo que el servidor está corriendo en puerto 5000)
    const apiUrl = 'http://localhost:5000/api/sales-reports/store';
    
    // Fechas para los últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const params = new URLSearchParams({
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    });
    
    console.log(`   - URL: ${apiUrl}?${params}`);
    console.log(`   - Headers: Authorization: Bearer ${token.substring(0, 20)}...`);
    
    // 5. Instrucciones para probar manualmente
    console.log('\n📋 Instrucciones para probar manualmente:');
    console.log('1. Asegúrate de que el servidor esté corriendo: npm start');
    console.log('2. Usa curl o Postman para hacer la siguiente llamada:');
    console.log('');
    console.log(`curl -X GET "${apiUrl}?${params}" \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    console.log('');
    console.log('3. O usa el token en el frontend:');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log('');
    console.log('4. Luego recarga la página del dashboard del gestor de tienda.');
    
    // 6. Verificar que el token se puede decodificar correctamente
    console.log('\n🔍 Verificación del token:');
    const testDecode = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log(`   - userId: ${testDecode.userId}`);
    console.log(`   - email: ${testDecode.email}`);
    console.log(`   - role: ${testDecode.role}`);
    console.log(`   - exp: ${new Date(testDecode.exp * 1000).toLocaleString()}`);
    
    console.log('\n✅ Token generado exitosamente. Usa este token para autenticar al gestor de tienda.');
    
  } catch (error) {
    console.error('❌ Error generando token:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateTokenAndTest();
