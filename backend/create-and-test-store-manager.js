const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/repuestos-pro', {
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
  }
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);

// Función para hacer petición HTTP
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(urlObj, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function createAndTestStoreManager() {
  try {
    console.log('🔧 Creando y probando gestor de tienda...');
    
    // 1. Buscar o crear el gestor de tienda
    let storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com'
    });
    
    if (!storeManager) {
      console.log('📝 Creando gestor de tienda...');
      
      // Crear tiendas primero
      const store1 = new Store({
        name: 'Tienda Principal',
        description: 'Tienda principal de repuestos',
        address: 'Av. Principal 123',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-1234567',
        email: 'tienda1@repuestospro.com',
        isMainStore: true
      });
      
      const store2 = new Store({
        name: 'Sucursal Centro',
        description: 'Sucursal en el centro de la ciudad',
        address: 'Calle Centro 456',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-7654321',
        email: 'tienda2@repuestospro.com',
        isMainStore: false
      });
      
      await store1.save();
      await store2.save();
      
      // Crear el gestor de tienda
      storeManager = new User({
        name: 'Juan Carlos',
        email: 'jucarl74@gmail.com',
        password: '123456Aa@', // Esto debería estar hasheado en producción
        role: 'store_manager',
        stores: [store1._id, store2._id],
        isEmailVerified: true,
        isActive: true
      });
      
      await storeManager.save();
      console.log('✅ Gestor de tienda creado exitosamente');
    } else {
      console.log('✅ Gestor de tienda encontrado');
      
      // Actualizar el gestor para asegurar que tenga el rol correcto
      storeManager.role = 'store_manager';
      storeManager.isEmailVerified = true;
      storeManager.isActive = true;
      await storeManager.save();
    }
    
    console.log('📊 Información del gestor:');
    console.log(`   - ID: ${storeManager._id}`);
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Rol: ${storeManager.role}`);
    console.log(`   - Activo: ${storeManager.isActive}`);
    console.log(`   - Email verificado: ${storeManager.isEmailVerified}`);
    
    // 2. Generar token JWT con el mismo secreto que usa el servidor
    const JWT_SECRET = 'tu-secreto-jwt-super-seguro-cambiar-en-produccion';
    
    const payload = {
      userId: storeManager._id,
      email: storeManager.email,
      role: storeManager.role
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h'
    });
    
    console.log('\n🔑 Token generado con JWT_SECRET correcto');
    console.log(`   - JWT_SECRET usado: ${JWT_SECRET}`);
    console.log(`   - Token: ${token.substring(0, 50)}...`);
    
    // 3. Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('\n✅ Token verificado:');
    console.log(`   - userId: ${decoded.userId}`);
    console.log(`   - email: ${decoded.email}`);
    console.log(`   - role: ${decoded.role}`);
    console.log(`   - exp: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    
    // 4. Probar la API
    console.log('\n🌐 Probando API del gestor de tienda...');
    
    // Fechas para los últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const params = new URLSearchParams({
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    });
    
    const apiUrl = `http://localhost:5000/api/sales-reports/store?${params}`;
    
    console.log(`   - URL: ${apiUrl}`);
    console.log(`   - Fechas: ${thirtyDaysAgo.toISOString().split('T')[0]} a ${today.toISOString().split('T')[0]}`);
    
    try {
      const response = await makeRequest(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`\n📊 Respuesta de la API:`);
      console.log(`   - Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = JSON.parse(response.data);
        console.log(`\n✅ Datos recibidos:`);
        console.log(`   - Success: ${data.success}`);
        
        if (data.data && data.data.overview) {
          const overview = data.data.overview;
          console.log(`   - Total Ventas: $${overview.totalSales?.toFixed(2) || '0.00'}`);
          console.log(`   - Total Órdenes: ${overview.totalOrders || 0}`);
          console.log(`   - Valor Promedio: $${overview.averageOrderValue?.toFixed(2) || '0.00'}`);
          console.log(`   - Total Clientes: ${overview.totalCustomers || 0}`);
          console.log(`   - Nuevos Clientes: ${overview.newCustomers || 0}`);
          console.log(`   - Tasa Conversión: ${overview.conversionRate?.toFixed(1) || '0.0'}%`);
          console.log(`   - Items Vendidos: ${overview.totalItemsSold || 0}`);
        }
        
        if (data.data && data.data.period) {
          console.log(`\n📅 Período:`);
          console.log(`   - Desde: ${data.data.period.from}`);
          console.log(`   - Hasta: ${data.data.period.to}`);
          console.log(`   - Días: ${data.data.period.days}`);
        }
        
        console.log('\n🎉 ¡API funcionando correctamente! El dashboard debería mostrar los datos.');
        
      } else {
        console.log(`\n❌ Error en la API:`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Error: ${response.data}`);
        
        if (response.status === 401) {
          console.log('\n💡 Posibles soluciones:');
          console.log('   1. Verificar que el JWT_SECRET esté configurado correctamente');
          console.log('   2. Verificar que el middleware de autenticación esté funcionando');
        }
        
        if (response.status === 403) {
          console.log('\n💡 Posibles soluciones:');
          console.log('   1. Verificar que el usuario tenga el rol correcto');
          console.log('   2. Verificar que el middleware de roles esté funcionando');
        }
      }
      
    } catch (fetchError) {
      console.log(`\n❌ Error de conexión:`);
      console.log(`   - Error: ${fetchError.message}`);
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Asegúrate de que el servidor esté corriendo: npm start');
      console.log('   2. Verifica que el puerto 5000 esté disponible');
    }
    
    // 5. Instrucciones para el frontend
    console.log('\n📋 SOLUCIÓN FINAL PARA EL FRONTEND:');
    console.log('');
    console.log('1. Abre la consola del navegador (F12)');
    console.log('2. Ejecuta el siguiente comando:');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log('3. Recarga la página del dashboard del gestor de tienda');
    console.log('4. Los datos deberían aparecer automáticamente');
    console.log('');
    console.log('5. Si aún no ves datos, verifica:');
    console.log('   - Que no haya errores en la consola del navegador');
    console.log('   - Que estés en la ruta correcta: /sales');
    console.log('   - Que el token se haya guardado correctamente');
    console.log('');
    console.log('6. Para verificar el token:');
    console.log('   console.log(localStorage.getItem("token"));');
    console.log('');
    console.log('7. CREDENCIALES DE ACCESO:');
    console.log('   - Email: jucarl74@gmail.com');
    console.log('   - Contraseña: 123456Aa@');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAndTestStoreManager();
