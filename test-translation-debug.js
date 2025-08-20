// Test simple para verificar traducciones
console.log('Testing sidebar translations...');

const translations = {
  'sidebar.admin.users': {
    es: 'Usuarios',
    en: 'Users', 
    pt: 'Usuários'
  }
};

function testT(key, language) {
  const translation = translations[key];
  if (!translation) {
    console.log(`❌ Key not found: ${key}`);
    return key;
  }
  const result = translation[language] || translation['es'] || key;
  console.log(`✅ ${key} (${language}): ${result}`);
  return result;
}

console.log('\n--- Testing Users translation ---');
testT('sidebar.admin.users', 'es');
testT('sidebar.admin.users', 'en');
testT('sidebar.admin.users', 'pt');

console.log('\n✅ Test completed!');
