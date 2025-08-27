const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'jucarl74@gmail.com';
const TEST_PASSWORD = '123456Aa@';

async function testPromotionFlow() {
  try {
    console.log('🔍 Iniciando prueba de flujo de promociones...\n');

    // 1. Login como gestor de tienda
    console.log('1. Iniciando sesión como gestor de tienda...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('❌ Error en login:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', user?.name || 'Sin nombre', `(${user?.role || 'Sin rol'})`);
    console.log('🏪 Tiendas asignadas:', user?.stores?.length || 0);
    if (user?.stores && user.stores.length > 0) {
      user.stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.isMainStore ? 'Principal' : 'Sucursal'})`);
      });
    }
    console.log('🔍 Datos completos del usuario:', JSON.stringify(user, null, 2));
    console.log('');

    // 2. Verificar acceso a promociones
    console.log('2. Verificando acceso a promociones...');
    const storeId = user?.stores?.[0]?._id;
    console.log('🔍 Store ID para verificación:', storeId);
    if (!storeId) {
      console.log('❌ No hay tienda asignada al usuario');
      return;
    }
    const accessResponse = await fetch(`${BASE_URL}/api/promotions/check-access?storeId=${storeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (accessResponse.ok) {
      const accessData = await accessResponse.json();
      console.log('✅ Acceso verificado:', accessData);
    } else {
      const errorData = await accessResponse.json();
      console.error('❌ Error verificando acceso:', errorData);
    }
    console.log('');

    // 3. Listar promociones existentes
    console.log('3. Listando promociones existentes...');
    const listResponse = await fetch(`${BASE_URL}/api/promotions?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', listResponse.status, listResponse.statusText);

    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('✅ Promociones listadas exitosamente');
      console.log('📋 Total de promociones:', listData.total || 0);
      console.log('📄 Páginas totales:', listData.totalPages || 0);
      console.log('📝 Promociones en esta página:', listData.promotions?.length || 0);
      
      if (listData.promotions && listData.promotions.length > 0) {
        console.log('📋 Primera promoción:');
        const firstPromo = listData.promotions[0];
        console.log('   - ID:', firstPromo._id);
        console.log('   - Nombre:', firstPromo.name);
        console.log('   - Tienda:', firstPromo.store?.name);
        console.log('   - Activa:', firstPromo.isActive);
        console.log('   - Creada por:', firstPromo.createdBy?.name);
      }
    } else {
      const errorData = await listResponse.json();
      console.error('❌ Error listando promociones:', errorData);
    }
    console.log('');

    // 4. Crear una promoción de prueba
    console.log('4. Creando promoción de prueba...');
    const testPromotion = {
      name: 'Promoción de Prueba Debug',
      description: 'Promoción creada para diagnosticar problemas',
      type: 'percentage',
      discountPercentage: 15,
      products: [], // Se llenará después
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      startTime: '00:00',
      endTime: '23:59',
      isActive: true,
      ribbonText: 'PRUEBA',
      ribbonPosition: 'top-left',
      showOriginalPrice: true,
      showDiscountAmount: true,
      scope: 'store'
    };

    // 5. Obtener productos disponibles
    console.log('5. Obteniendo productos disponibles...');
    const productsResponse = await fetch(`${BASE_URL}/api/products/store-manager/all?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      const products = productsData.data?.products || productsData.products || productsData.data || [];
      console.log('✅ Productos obtenidos:', products.length);
      
      if (products.length > 0) {
        testPromotion.products = [products[0]._id];
        console.log('📦 Producto seleccionado:', products[0].name);
      } else {
        console.log('⚠️ No hay productos disponibles');
      }
    } else {
      const errorData = await productsResponse.json();
      console.error('❌ Error obteniendo productos:', errorData);
    }
    console.log('');

    // 6. Crear la promoción
    if (testPromotion.products.length > 0) {
      console.log('6. Enviando promoción de prueba...');
      const createResponse = await fetch(`${BASE_URL}/api/promotions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPromotion)
      });

      console.log('📊 Status de creación:', createResponse.status, createResponse.statusText);

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('✅ Promoción creada exitosamente');
        console.log('🆔 ID de la promoción:', createData.data._id);
        console.log('📝 Nombre:', createData.data.name);
      } else {
        const errorData = await createResponse.json();
        console.error('❌ Error creando promoción:', errorData);
      }
      console.log('');

      // 7. Verificar que la promoción aparece en la lista
      console.log('7. Verificando que la promoción aparece en la lista...');
      const verifyResponse = await fetch(`${BASE_URL}/api/promotions?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Lista actualizada');
        console.log('📋 Total de promociones:', verifyData.total || 0);
        console.log('📝 Promociones en esta página:', verifyData.promotions?.length || 0);
        
        // Buscar la promoción recién creada
        const newPromotion = verifyData.promotions?.find(p => p.name === testPromotion.name);
        if (newPromotion) {
          console.log('✅ Promoción encontrada en la lista:');
          console.log('   - ID:', newPromotion._id);
          console.log('   - Nombre:', newPromotion.name);
          console.log('   - Tienda:', newPromotion.store?.name);
          console.log('   - Activa:', newPromotion.isActive);
        } else {
          console.log('❌ La promoción no aparece en la lista');
          console.log('🔍 Promociones disponibles:');
          verifyData.promotions?.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} (${p.store?.name})`);
          });
        }
      } else {
        const errorData = await verifyResponse.json();
        console.error('❌ Error verificando lista:', errorData);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la prueba
testPromotionFlow();
