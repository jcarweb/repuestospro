const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testSimpleRegistration() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    const baseUrl = 'http://localhost:5000/api';
    const testUser = {
      name: 'Test User Simple',
      email: 'test-simple@example.com',
      password: '123456Aa@',
      phone: '1234567890',
      role: 'client'
    };

    console.log('🔍 Probando registro simple...');
    console.log('📋 Datos a enviar:', testUser);
    
    try {
      const response = await axios.post(`${baseUrl}/auth/register`, testUser);
      
      console.log('✅ Registro exitoso:');
      console.log('- Status:', response.status);
      console.log('- Data:', response.data);
      
    } catch (error) {
      console.log('❌ Error en registro:');
      console.log('- Status:', error.response?.status);
      console.log('- Status Text:', error.response?.statusText);
      console.log('- Data:', error.response?.data);
      console.log('- Message:', error.response?.data?.message || error.message);
    }

    // Verificar si el usuario se creó
    console.log('\n🔍 Verificando si el usuario se creó...');
    const db = mongoose.connection.db;
    const createdUser = await db.collection('users').findOne({ email: testUser.email });
    
    if (createdUser) {
      console.log('✅ Usuario encontrado en la base de datos:');
      console.log('- ID:', createdUser._id);
      console.log('- Name:', createdUser.name);
      console.log('- Role:', createdUser.role);
      console.log('- ReferralCode:', createdUser.referralCode);
    } else {
      console.log('❌ Usuario no encontrado en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testSimpleRegistration();
