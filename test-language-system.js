// Script de prueba para el sistema de idiomas
const { TranslationService } = require('./src/utils/translations.ts');

// Crear instancia del servicio de traducciones
const translationService = new TranslationService();

// Función para probar traducciones del sidebar
function testSidebarTranslations() {
  console.log('\n=== PRUEBA DE TRADUCCIONES DEL SIDEBAR ===\n');

  const languages = ['es', 'en', 'pt'];
  const sidebarKeys = [
    'sidebar.roles.admin',
    'sidebar.roles.storeManager', 
    'sidebar.roles.delivery',
    'sidebar.roles.client',
    'sidebar.admin.dashboard',
    'sidebar.admin.users',
    'sidebar.admin.products',
    'sidebar.admin.categories',
    'sidebar.admin.promotions',
    'sidebar.admin.sales',
    'sidebar.admin.loyalty',
    'sidebar.admin.analytics',
    'sidebar.admin.registrationCodes',
    'sidebar.admin.searchConfig',
    'sidebar.admin.generateProducts',
    'sidebar.admin.globalSettings',
    'sidebar.storeManager.dashboard',
    'sidebar.storeManager.products',
    'sidebar.storeManager.promotions',
    'sidebar.storeManager.sales',
    'sidebar.storeManager.orders',
    'sidebar.storeManager.delivery',
    'sidebar.storeManager.analytics',
    'sidebar.storeManager.messages',
    'sidebar.storeManager.reviews',
    'sidebar.storeManager.settings',
    'sidebar.delivery.dashboard',
    'sidebar.delivery.assignedOrders',
    'sidebar.delivery.routeMap',
    'sidebar.delivery.deliveryReport',
    'sidebar.delivery.ratings',
    'sidebar.delivery.workSchedule',
    'sidebar.delivery.availabilityStatus',
    'sidebar.delivery.profile',
    'sidebar.client.home',
    'sidebar.client.products',
    'sidebar.client.categories',
    'sidebar.client.cart',
    'sidebar.client.favorites',
    'sidebar.client.loyalty',
    'sidebar.client.myOrders',
    'sidebar.client.profile',
    'sidebar.client.security',
    'sidebar.client.notifications'
  ];

  languages.forEach(lang => {
    console.log(`\n--- IDIOMA: ${lang.toUpperCase()} ---`);
    translationService.setLanguage(lang);
    
    sidebarKeys.forEach(key => {
      const translation = translationService.t(key);
      console.log(`${key}: "${translation}"`);
    });
  });
}

// Función para probar traducciones del AdminDashboard
function testAdminDashboardTranslations() {
  console.log('\n=== PRUEBA DE TRADUCCIONES DEL ADMIN DASHBOARD ===\n');

  const languages = ['es', 'en', 'pt'];
  const dashboardKeys = [
    'adminDashboard.title',
    'adminDashboard.welcome',
    'adminDashboard.stats.users',
    'adminDashboard.stats.products',
    'adminDashboard.stats.sales',
    'adminDashboard.stats.orders',
    'adminDashboard.quickActions.title',
    'adminDashboard.quickActions.manageUsers',
    'adminDashboard.quickActions.manageProducts',
    'adminDashboard.quickActions.settings',
    'adminDashboard.recentActivity.title',
    'adminDashboard.recentActivity.newUser',
    'adminDashboard.recentActivity.productAdded',
    'adminDashboard.recentActivity.orderCompleted',
    'adminDashboard.recentActivity.ago',
    'adminDashboard.recentActivity.minutes',
    'adminDashboard.recentActivity.hour',
    'adminDashboard.stats.title',
    'adminDashboard.stats.monthlySales',
    'adminDashboard.stats.activeUsers',
    'adminDashboard.stats.productsSold'
  ];

  languages.forEach(lang => {
    console.log(`\n--- IDIOMA: ${lang.toUpperCase()} ---`);
    translationService.setLanguage(lang);
    
    dashboardKeys.forEach(key => {
      const translation = translationService.t(key);
      console.log(`${key}: "${translation}"`);
    });
  });
}

// Función para probar traducciones de Home
function testHomeTranslations() {
  console.log('\n=== PRUEBA DE TRADUCCIONES DE HOME ===\n');

  const languages = ['es', 'en', 'pt'];
  const homeKeys = [
    'home.hero.tagline',
    'home.search.placeholder',
    'home.actions.viewCategories',
    'home.actions.specialOffers',
    'home.features.title',
    'home.features.subtitle',
    'home.features.catalog.title',
    'home.features.catalog.description',
    'home.features.shipping.title',
    'home.features.shipping.description',
    'home.features.warranty.title',
    'home.features.warranty.description',
    'home.cta.title',
    'home.cta.subtitle',
    'home.cta.exploreCategories'
  ];

  languages.forEach(lang => {
    console.log(`\n--- IDIOMA: ${lang.toUpperCase()} ---`);
    translationService.setLanguage(lang);
    
    homeKeys.forEach(key => {
      const translation = translationService.t(key);
      console.log(`${key}: "${translation}"`);
    });
  });
}

// Ejecutar todas las pruebas
console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE IDIOMAS\n');

try {
  testSidebarTranslations();
  testAdminDashboardTranslations();
  testHomeTranslations();
  
  console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
  console.log('\n📝 NOTA: Si ves las traducciones correctamente, el problema puede estar en:');
  console.log('1. Los componentes no están usando correctamente useLanguageChange');
  console.log('2. Los eventos de cambio de idioma no se están disparando');
  console.log('3. El LanguageProvider no está envolviendo correctamente los componentes');
  
} catch (error) {
  console.error('❌ ERROR EN LAS PRUEBAS:', error);
}
