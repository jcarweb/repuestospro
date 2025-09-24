const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración optimizada para desarrollo
module.exports = {
  ...config,
  
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
