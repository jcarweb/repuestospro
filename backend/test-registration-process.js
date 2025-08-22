const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testRegistrationProcess() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    const baseUrl = 'http://localhost:5000/api';
    const code = '5D6F0B2BF6B467E7';
    const testUser = {
      name: 'Juan Carlos Test',
      email: 'jucarl74@gmail.com',
      password: '123456Aa@',
      phone: '1234567890'
    };

    console.log('🔍 Paso 1: Verificar código de registro');
    
    // Paso 1: Verificar código
    try {
      const verifyResponse = await axios.get(`${baseUrl}/registration-codes/verify/${code}`);
      const verifyResult = verifyResponse.data;
      
      if (verifyResult.success) {
        console.log('✅ Código verificado correctamente');
        console.log('- Email:', verifyResult.data.email);
        console.log('- Role:', verifyResult.data.role);
      } else {
        console.log('❌ Error verificando código:', verifyResult.message);
        return;
      }
    } catch (error) {
      console.log('❌ Error en verificación:', error.response?.data?.message || error.message);
      return;
    }

    console.log('\n🔍 Paso 2: Iniciar registro');
    
    // Paso 2: Iniciar registro
    try {
      const startResponse = await axios.post(`${baseUrl}/registration-codes/start-registration`, {
        code
      });
      
      const startResult = startResponse.data;
      
      if (startResult.success) {
        console.log('✅ Registro iniciado correctamente');
      } else {
        console.log('❌ Error iniciando registro:', startResult.message);
        return;
      }
    } catch (error) {
      console.log('❌ Error en inicio de registro:', error.response?.data?.message || error.message);
      return;
    }

    console.log('\n🔍 Paso 3: Registrar usuario');
    console.log('📋 Datos a enviar:', {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      phone: testUser.phone,
      role: 'store_manager'
    });
    
    // Paso 3: Registrar usuario
    let token = '';
    try {
      const registerResponse = await axios.post(`${baseUrl}/auth/register`, {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        phone: testUser.phone,
        role: 'store_manager'
      });
      
      const registerResult = registerResponse.data;
      
      if (registerResult.success) {
        console.log('✅ Usuario registrado correctamente');
        console.log('- User ID:', registerResult.data.user.id);
        console.log('- Token recibido:', registerResult.data.token ? 'Sí' : 'No');
        token = registerResult.data.token;
      } else {
        console.log('❌ Error registrando usuario:', registerResult.message);
        return;
      }
    } catch (error) {
      console.log('❌ Error en registro de usuario:');
      console.log('- Status:', error.response?.status);
      console.log('- Status Text:', error.response?.statusText);
      console.log('- Data:', error.response?.data);
      console.log('- Message:', error.response?.data?.message || error.message);
      
      // Verificar si el usuario ya existe
      const db = mongoose.connection.db;
      const existingUser = await db.collection('users').findOne({ email: testUser.email });
      if (existingUser) {
        console.log('⚠️ Usuario ya existe en la base de datos');
        console.log('- ID:', existingUser._id);
        console.log('- Role:', existingUser.role);
        console.log('- CreatedAt:', existingUser.createdAt);
      }
      
      return;
    }

    console.log('\n🔍 Paso 4: Completar registro con código');
    
    // Paso 4: Completar registro
    try {
      const completeResponse = await axios.post(`${baseUrl}/registration-codes/complete-registration`, {
        code
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const completeResult = completeResponse.data;
      
      if (completeResult.success) {
        console.log('✅ Registro completado correctamente');
      } else {
        console.log('❌ Error completando registro:', completeResult.message);
      }
    } catch (error) {
      console.log('❌ Error en completar registro:', error.response?.data?.message || error.message);
    }

    // Verificar estado final en la base de datos
    console.log('\n🔍 Verificando estado final...');
    const db = mongoose.connection.db;
    
    const finalUser = await db.collection('users').findOne({ email: testUser.email });
    if (finalUser) {
      console.log('✅ Usuario creado en la base de datos');
      console.log('- ID:', finalUser._id);
      console.log('- Role:', finalUser.role);
      console.log('- IsActive:', finalUser.isActive);
    } else {
      console.log('❌ Usuario no encontrado en la base de datos');
    }

    const finalCode = await db.collection('registrationcodes').findOne({ code });
    if (finalCode) {
      console.log('📋 Estado del código después del proceso:');
      console.log('- Status:', finalCode.status);
      console.log('- UsedAt:', finalCode.usedAt);
      console.log('- UsedBy:', finalCode.usedBy);
    }

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testRegistrationProcess();
