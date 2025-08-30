const fetch = require('node-fetch');

async function testAnalyticsEndpoint() {
  try {
    console.log('🔍 Probando endpoint de analytics...\n');

    // Primero hacer login para obtener token
    console.log('🔑 Haciendo login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jucarl74@gmail.com',
        password: '123456Aa@'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('✅ Login exitoso');
    console.log('🔑 Token obtenido');

    // Probar con la tienda que SÍ tiene suscripción Pro
    const storeId = '68a8e0d44da9f15705c90a27'; // "prueba de tienda"
    
    console.log(`\n🔍 Probando analytics para tienda: ${storeId}`);
    console.log('📡 URL:', `http://localhost:5000/api/analytics/check-access?storeId=${storeId}`);

    const analyticsResponse = await fetch(`http://localhost:5000/api/analytics/check-access?storeId=${storeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status:', analyticsResponse.status);
    console.log('📊 OK:', analyticsResponse.ok);

    if (analyticsResponse.ok) {
      const data = await analyticsResponse.json();
      console.log('\n✅ Respuesta de analytics:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.hasAccess) {
        console.log('\n🎉 ACCESO PERMITIDO - Debería mostrar analytics');
      } else {
        console.log('\n🔒 ACCESO DENEGADO - Debería mostrar restricción');
        console.log('📋 Razón:', data.reason);
      }
    } else {
      const errorText = await analyticsResponse.text();
      console.log('\n❌ Error en la respuesta:');
      console.log('Status:', analyticsResponse.status);
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el backend esté corriendo en puerto 5000');
  }
}

testAnalyticsEndpoint();
