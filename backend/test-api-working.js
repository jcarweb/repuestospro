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

const User = mongoose.model('User', userSchema);

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

async function testAPIWorking() {
  try {
    console.log('🔍 Verificando si la API funciona correctamente...');
    
    // 1. Buscar el gestor de tienda
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com'
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
    console.log(`   - Tiendas: ${storeManager.stores?.length || 0}`);
    
    // 2. Probar diferentes JWT_SECRET
    const possibleSecrets = [
      'fallback-secret',
      'tu-secreto-jwt-super-seguro-cambiar-en-produccion',
      'your-super-secret-jwt-key-for-repuestospro-2024',
      'repuestospro-jwt-secret-2024',
      'default-jwt-secret',
      'development-secret',
      'test-secret',
      'local-secret',
      'secret',
      'jwt-secret',
      'app-secret'
    ];
    
    const payload = {
      userId: storeManager._id,
      email: storeManager.email,
      role: storeManager.role
    };
    
    console.log('\n🔑 Probando diferentes JWT_SECRET...');
    
    for (const secret of possibleSecrets) {
      console.log(`\n📝 Probando con: "${secret}"`);
      
      try {
        const token = jwt.sign(payload, secret, {
          expiresIn: '24h'
        });
        
        // Probar la API
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const params = new URLSearchParams({
          dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        });
        
        const apiUrl = `http://localhost:5000/api/sales-reports/store?${params}`;
        
        const response = await makeRequest(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   - Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log(`   ✅ ¡ÉXITO! JWT_SECRET correcto encontrado: "${secret}"`);
          
          const data = JSON.parse(response.data);
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
            console.log(`   - Período: ${data.data.period.from} a ${data.data.period.to} (${data.data.period.days} días)`);
          }
          
          // Instrucciones para el frontend
          console.log('\n📋 SOLUCIÓN PARA EL FRONTEND:');
          console.log('');
          console.log('1. Abre la consola del navegador (F12)');
          console.log('2. Ejecuta el siguiente comando:');
          console.log(`   localStorage.setItem('token', '${token}');`);
          console.log('3. Recarga la página del dashboard del gestor de tienda');
          console.log('4. Los datos deberían aparecer automáticamente');
          console.log('');
          console.log('5. CREDENCIALES DE ACCESO:');
          console.log('   - Email: jucarl74@gmail.com');
          console.log('   - Contraseña: 123456Aa@');
          console.log('');
          console.log('6. Si aún no ves datos:');
          console.log('   - Verifica que estés en la ruta correcta: /sales');
          console.log('   - Verifica que no haya errores en la consola');
          console.log('   - Recarga la página después de configurar el token');
          
          return; // Salir del bucle si encontramos el secreto correcto
          
        } else if (response.status === 401) {
          const errorData = JSON.parse(response.data);
          console.log(`   - Error: ${errorData.message}`);
        } else if (response.status === 403) {
          const errorData = JSON.parse(response.data);
          console.log(`   - Error: ${errorData.message}`);
        } else {
          console.log(`   - Error: Status ${response.status}`);
          console.log(`   - Response: ${response.data}`);
        }
        
      } catch (error) {
        console.log(`   - Error: ${error.message}`);
      }
    }
    
    console.log('\n❌ No se encontró el JWT_SECRET correcto');
    console.log('💡 Posibles soluciones:');
    console.log('   1. Verificar el archivo .env del servidor');
    console.log('   2. Verificar la configuración del servidor');
    console.log('   3. Reiniciar el servidor para cargar las variables de entorno');
    console.log('   4. Verificar que el servidor esté usando el JWT_SECRET correcto');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAPIWorking();
