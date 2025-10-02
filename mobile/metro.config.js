const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración optimizada para desarrollo y assets
module.exports = {
  ...config,
  
  // Configuración de resolver
  resolver: {
    ...config.resolver,
    // Resolver módulos de manera más eficiente
    resolverMainFields: ['react-native', 'browser', 'main'],
    // Asegurar que los assets se resuelvan correctamente
    assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'],
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
