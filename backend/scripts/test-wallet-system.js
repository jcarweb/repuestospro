const mongoose = require('mongoose');
const config = require('../src/config/env');

// Importar modelos
const Store = require('../src/models/Store').default;
const StoreWallet = require('../src/models/StoreWallet').default;
const WalletTransaction = require('../src/models/WalletTransaction').default;
const WalletSettings = require('../src/models/WalletSettings').default;
const User = require('../src/models/User').default;

// Importar servicios
const { walletService } = require('../src/services/walletService');
const { notificationService } = require('../src/services/notificationService');
const { emailService } = require('../src/services/emailService');

async function testWalletSystem() {
  try {
    console.log('🚀 Iniciando pruebas del sistema de Wallet...\n');

    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Crear una tienda de prueba
    console.log('📦 Creando tienda de prueba...');
    const testStore = new Store({
      name: 'Tienda de Prueba Wallet',
      description: 'Tienda para probar el sistema de Wallet',
      address: 'Calle de Prueba 123',
      city: 'Caracas',
      zipCode: '1010',
      country: 'Venezuela',
      phone: '+584121234567',
      email: 'test@tiendawallet.com',
      coordinates: { latitude: 10.4806, longitude: -66.9036 },
      stateRef: new mongoose.Types.ObjectId(),
      municipalityRef: new mongoose.Types.ObjectId(),
      parishRef: new mongoose.Types.ObjectId(),
      owner: new mongoose.Types.ObjectId(),
      managers: [new mongoose.Types.ObjectId()]
    });

    await testStore.save();
    console.log(`✅ Tienda creada: ${testStore._id}\n`);

    // 2. Crear Wallet para la tienda
    console.log('💰 Creando Wallet...');
    const wallet = await walletService.createWallet(testStore._id.toString());
    console.log(`✅ Wallet creada: ${wallet._id}\n`);

    // 3. Probar recarga de Wallet
    console.log('💳 Probando recarga de Wallet...');
    const rechargeResult = await walletService.rechargeWallet(
      testStore._id.toString(),
      100.00,
      'system',
      {
        paymentMethod: 'bank_transfer',
        reference: 'TEST-001',
        description: 'Recarga de prueba'
      }
    );

    if (rechargeResult.success) {
      console.log(`✅ Recarga exitosa: $${rechargeResult.newBalance}\n`);
    } else {
      console.log(`❌ Error en recarga: ${rechargeResult.message}\n`);
    }

    // 4. Probar descuento de comisión
    console.log('📊 Probando descuento de comisión...');
    const commissionResult = await walletService.deductCommission(
      testStore._id.toString(),
      5.00,
      'test-order-001',
      'ORD-001',
      5.0
    );

    if (commissionResult.success) {
      console.log(`✅ Comisión descontada: $${commissionResult.newBalance}\n`);
    } else {
      console.log(`❌ Error en descuento: ${commissionResult.message}\n`);
    }

    // 5. Probar notificaciones
    console.log('📧 Probando notificaciones...');
    await notificationService.sendWalletNotification(
      testStore._id.toString(),
      'recharge_successful',
      {
        amount: 100,
        balance: 95,
        paymentMethod: 'bank_transfer'
      }
    );
    console.log('✅ Notificación enviada\n');

    // 6. Probar verificación de saldo
    console.log('🔍 Probando verificación de saldo...');
    const canProcess = await walletService.canProcessCashPayment(
      testStore._id.toString(),
      10.00
    );
    console.log(`✅ Puede procesar pago en efectivo: ${canProcess}\n`);

    // 7. Obtener estadísticas
    console.log('📈 Obteniendo estadísticas...');
    const stats = await walletService.getWalletStats(testStore._id.toString());
    console.log('✅ Estadísticas:', stats);
    console.log('');

    // 8. Probar ajuste manual
    console.log('⚙️ Probando ajuste manual...');
    const adjustmentResult = await walletService.manualAdjustment(
      testStore._id.toString(),
      10.00,
      'Ajuste de prueba',
      'system',
      { reason: 'Prueba del sistema' }
    );

    if (adjustmentResult.success) {
      console.log(`✅ Ajuste exitoso: $${adjustmentResult.newBalance}\n`);
    } else {
      console.log(`❌ Error en ajuste: ${adjustmentResult.message}\n`);
    }

    // 9. Probar saldo insuficiente
    console.log('⚠️ Probando saldo insuficiente...');
    const insufficientResult = await walletService.deductCommission(
      testStore._id.toString(),
      200.00, // Monto mayor al saldo
      'test-order-002',
      'ORD-002',
      5.0
    );

    if (!insufficientResult.success) {
      console.log(`✅ Saldo insuficiente detectado correctamente: ${insufficientResult.message}\n`);
    } else {
      console.log(`❌ Error: Debería haber detectado saldo insuficiente\n`);
    }

    // 10. Verificar configuración de email
    console.log('📧 Verificando configuración de email...');
    const emailConfig = emailService.getTransporterInfo();
    console.log('✅ Configuración de email:', emailConfig);
    console.log('');

    // 11. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await StoreWallet.deleteOne({ storeId: testStore._id });
    await WalletTransaction.deleteMany({ storeId: testStore._id });
    await WalletSettings.deleteOne({ storeId: testStore._id });
    await Store.deleteOne({ _id: testStore._id });
    console.log('✅ Datos de prueba eliminados\n');

    console.log('🎉 ¡Todas las pruebas del sistema de Wallet completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testWalletSystem();
}

module.exports = { testWalletSystem };
