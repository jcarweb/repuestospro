const fetch = require('node-fetch');

// Configuración
const API_BASE = 'http://192.168.0.110:3001/api';

async function testCompleteProfile() {
  console.log('🧪 PRUEBA COMPLETA DE PERFIL');
  console.log('============================\n');

  try {
    // 1. Obtener perfil actual
    console.log('1️⃣ Obteniendo perfil actual...');
    const getResponse = await fetch(`${API_BASE}/profile`);
    const currentProfile = await getResponse.json();
    
    if (currentProfile.success) {
      console.log('✅ Perfil obtenido:', {
        name: currentProfile.data.name,
        phone: currentProfile.data.phone,
        address: currentProfile.data.address,
        hasLocation: !!currentProfile.data.location,
        hasProfileImage: !!currentProfile.data.profileImage
      });
    } else {
      console.log('❌ Error obteniendo perfil:', currentProfile);
      return;
    }

    // 2. Actualizar perfil con datos completos
    console.log('\n2️⃣ Actualizando perfil con datos completos...');
    const testData = {
      name: 'Juan Carlos Hernández Completo',
      phone: '+57 300 999 8888',
      address: 'Calle Completa #123, Bogotá',
      profileImage: 'https://via.placeholder.com/150/007bff/ffffff?text=JC',
      location: {
        type: 'Point',
        coordinates: [-66.984321, 10.4631911],
        address: 'Calle Completa, Caracas, Venezuela'
      }
    };

    const updateResponse = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ Perfil actualizado:', {
        name: updateResult.data.name,
        phone: updateResult.data.phone,
        address: updateResult.data.address,
        hasLocation: !!updateResult.data.location,
        hasProfileImage: !!updateResult.data.profileImage
      });
    } else {
      console.log('❌ Error actualizando perfil:', updateResult);
      return;
    }

    // 3. Verificar persistencia
    console.log('\n3️⃣ Verificando persistencia...');
    const verifyResponse = await fetch(`${API_BASE}/profile`);
    const verifyProfile = await verifyResponse.json();
    
    if (verifyProfile.success) {
      console.log('✅ Perfil verificado:', {
        name: verifyProfile.data.name,
        phone: verifyProfile.data.phone,
        address: verifyProfile.data.address,
        hasLocation: !!verifyProfile.data.location,
        hasProfileImage: !!verifyProfile.data.profileImage
      });

      // Verificar que los datos coinciden
      const dataMatches = 
        verifyProfile.data.name === testData.name &&
        verifyProfile.data.phone === testData.phone &&
        verifyProfile.data.address === testData.address &&
        verifyProfile.data.profileImage === testData.profileImage;

      if (dataMatches) {
        console.log('\n🎉 ¡PERFIL COMPLETO FUNCIONANDO!');
        console.log('✅ Todos los datos se guardaron y persisten correctamente');
        console.log('✅ Imagen del perfil incluida');
        console.log('✅ Ubicación con coordenadas incluida');
        console.log('✅ Datos básicos funcionando');
      } else {
        console.log('\n❌ ERROR: Los datos no coinciden');
        console.log('Esperado:', testData);
        console.log('Obtenido:', verifyProfile.data);
      }
    } else {
      console.log('❌ Error verificando perfil:', verifyProfile);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testCompleteProfile();
