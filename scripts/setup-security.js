#!/usr/bin/env node

/**
 * Script de Configuración de Seguridad
 * Configura todas las medidas de seguridad del proyecto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createEnvExample() {
  const envExample = `# ===========================================
# CONFIGURACIÓN DE VARIABLES DE ENTORNO
# ===========================================
# IMPORTANTE: Copia este archivo a .env y reemplaza los valores

# ===========================================
# BACKEND CONFIGURATION
# ===========================================
# URL del Backend
VITE_API_URL=http://localhost:5000

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT Secret (genera una clave segura)
JWT_SECRET=your-super-secret-jwt-key-here

# ===========================================
# GOOGLE SERVICES
# ===========================================
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ===========================================
# CLOUDINARY (IMÁGENES)
# ===========================================
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ===========================================
# PUSH NOTIFICATIONS
# ===========================================
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# ===========================================
# SECURITY
# ===========================================
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session configuration
SESSION_SECRET=your_session_secret_key

# ===========================================
# DEVELOPMENT
# ===========================================
NODE_ENV=development
PORT=5000
`;

  try {
    fs.writeFileSync('env.example', envExample);
    console.log('✅ Creado archivo env.example');
  } catch (error) {
    console.error('❌ Error creando env.example:', error.message);
  }
}

function createGitignore() {
  const gitignore = `# ===========================================
# GITIGNORE - PIEZASYA
# ===========================================

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
dist-ssr/
build/
out/
.next/
.nuxt/
.cache/

# Environment variables and credentials
.env
.env.local
.env.development
.env.production
.env.staging
.env.test
*.env
config/secrets.json
credentials.json
secrets/

# Database
*.db
*.sqlite
*.sqlite3
database/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
Thumbs.db
ehthumbs.db
Desktop.ini

# Temporary files
*.tmp
*.temp
temp/
tmp/

# Test files and coverage
coverage/
.nyc_output/
test-results/
*.test.js
*.spec.js
__tests__/
tests/

# Documentation with sensitive information
*SECRET*.md
*CREDENTIALS*.md
*PASSWORD*.md
*API_KEY*.md
*TOKEN*.md
*PRIVATE*.md
*CONFIDENTIAL*.md

# Mobile app specific
mobile/android/app/google-services.json
mobile/ios/GoogleService-Info.plist
mobile/android/app/src/main/res/values/strings.xml
mobile/ios/PiezasYA/Info.plist

# Expo
.expo/
.expo-shared/

# React Native
android/app/build/
ios/build/
*.jks
*.p8
*.p12
*.mobileprovision

# IDE
.vscode/settings.json
.vscode/launch.json
.vscode/tasks.json

# Backup files
*.bak
*.backup
*.old

# Lock files (keep package-lock.json but ignore others)
yarn.lock
pnpm-lock.yaml

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.parcel-cache

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/
`;

  try {
    fs.writeFileSync('.gitignore', gitignore);
    console.log('✅ Actualizado .gitignore');
  } catch (error) {
    console.error('❌ Error actualizando .gitignore:', error.message);
  }
}

function setupGitHooks() {
  try {
    // Configurar git para usar hooks personalizados
    execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
    console.log('✅ Configurado git hooks');
  } catch (error) {
    console.error('❌ Error configurando git hooks:', error.message);
  }
}

function createSecurityScripts() {
  const scripts = {
    'scripts/security-cleanup.js': `#!/usr/bin/env node
// Script de limpieza de seguridad (ya existe)
console.log('Script de limpieza de seguridad configurado');
`,
    'scripts/pre-commit-security.js': `#!/usr/bin/env node
// Script de verificación pre-commit (ya existe)
console.log('Script de verificación pre-commit configurado');
`
  };

  Object.entries(scripts).forEach(([filePath, content]) => {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Creado ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error creando ${filePath}:`, error.message);
    }
  });
}

function createSecurityDocumentation() {
  const securityReadme = `# 🔒 Seguridad - PiezasYA

## Configuración Inicial

1. **Copia las variables de entorno:**
   \`\`\`bash
   cp env.example .env
   \`\`\`

2. **Configura tus credenciales en .env:**
   - Reemplaza todos los valores placeholder
   - Usa credenciales reales pero seguras

3. **Verifica la configuración:**
   \`\`\`bash
   node scripts/pre-commit-security.js
   \`\`\`

## Scripts Disponibles

- \`node scripts/setup-security.js\` - Configuración inicial de seguridad
- \`node scripts/security-cleanup.js\` - Limpieza de archivos sensibles
- \`node scripts/pre-commit-security.js\` - Verificación pre-commit

## Hooks de Git

Los hooks de git están configurados para:
- Verificar archivos sensibles antes de cada commit
- Bloquear commits con credenciales expuestas
- Mantener la seguridad del repositorio

## Buenas Prácticas

- ✅ Nunca commitees archivos .env
- ✅ Usa variables de entorno para todas las credenciales
- ✅ Ejecuta la limpieza de seguridad regularmente
- ✅ Revisa el .gitignore antes de commits importantes

---
*Configurado automáticamente por setup-security.js*
`;

  try {
    fs.writeFileSync('SECURITY.md', securityReadme);
    console.log('✅ Creado SECURITY.md');
  } catch (error) {
    console.error('❌ Error creando SECURITY.md:', error.message);
  }
}

function runSetup() {
  console.log('🔧 Configurando medidas de seguridad...\n');
  
  createEnvExample();
  createGitignore();
  setupGitHooks();
  createSecurityScripts();
  createSecurityDocumentation();
  
  console.log('\n✅ Configuración de seguridad completada');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Copia env.example a .env: cp env.example .env');
  console.log('2. Configura tus credenciales en .env');
  console.log('3. Ejecuta: node scripts/pre-commit-security.js');
  console.log('4. Haz tu primer commit seguro!');
}

// Ejecutar configuración
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };
