const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración optimizada para desarrollo con tunneling
module.exports = {
  ...config,
  
  // Configuración de servidor
  server: {
    port: 8081,
    // Usar 0.0.0.0 para permitir conexiones externas
    host: '0.0.0.0',
  },
  
  // Configuración de resolver
  resolver: {
    ...config.resolver,
    // Resolver módulos de manera más eficiente
    resolverMainFields: ['react-native', 'browser', 'main'],
  },
  
  // Configuración de transformer
  transformer: {
    ...config.transformer,
    // Optimizar para desarrollo
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
};
