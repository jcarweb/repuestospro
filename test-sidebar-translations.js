// Script de prueba para verificar traducciones del sidebar
const translations = {
  'sidebar.admin.users': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'sidebar.admin.dashboard': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'sidebar.roles.admin': {
    es: 'Administrador',
    en: 'Administrator',
    pt: 'Administrador'
  }
};

function testTranslation(key, language) {
  const translation = translations[key];
  if (!translation) {
    console.log(`❌ Translation key not found: ${key}`);
    return key;
  }
  const result = translation[language] || translation['es'] || key;
  console.log(`✅ ${key} (${language}): ${result}`);
  return result;
}

console.log('🧪 Testing Sidebar Translations...\n');

// Probar traducciones para diferentes idiomas
const languages = ['es', 'en', 'pt'];
const keys = ['sidebar.admin.users', 'sidebar.admin.dashboard', 'sidebar.roles.admin'];

languages.forEach(lang => {
  console.log(`\n📝 Language: ${lang}`);
  console.log('='.repeat(30));
  keys.forEach(key => {
    testTranslation(key, lang);
  });
});

console.log('\n🎯 Test completed!');
