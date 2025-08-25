console.log('🔍 Verificando imports del controlador de productos...');

try {
  console.log('📦 Importando mongoose...');
  const mongoose = require('mongoose');
  console.log('✅ mongoose importado correctamente');

  console.log('📦 Importando express...');
  const express = require('express');
  console.log('✅ express importado correctamente');

  console.log('📦 Verificando modelos...');
  
  try {
    const Product = require('./src/models/Product');
    console.log('✅ Modelo Product importado correctamente');
  } catch (error) {
    console.error('❌ Error importando Product:', error.message);
  }

  try {
    const Store = require('./src/models/Store');
    console.log('✅ Modelo Store importado correctamente');
  } catch (error) {
    console.error('❌ Error importando Store:', error.message);
  }

  try {
    const ContentFilter = require('./src/models/ContentFilter');
    console.log('✅ Modelo ContentFilter importado correctamente');
  } catch (error) {
    console.error('❌ Error importando ContentFilter:', error.message);
  }

  try {
    const InventoryConfig = require('./src/models/InventoryConfig');
    console.log('✅ Modelo InventoryConfig importado correctamente');
  } catch (error) {
    console.error('❌ Error importando InventoryConfig:', error.message);
  }

  console.log('📦 Verificando servicios...');
  
  try {
    const imageService = require('./src/services/imageService');
    console.log('✅ imageService importado correctamente');
  } catch (error) {
    console.error('❌ Error importando imageService:', error.message);
  }

  try {
    const { ContentFilterService } = require('./src/middleware/contentFilter');
    console.log('✅ ContentFilterService importado correctamente');
  } catch (error) {
    console.error('❌ Error importando ContentFilterService:', error.message);
  }

  console.log('📦 Verificando configuración...');
  
  try {
    const cloudinary = require('./src/config/cloudinary');
    console.log('✅ cloudinary config importado correctamente');
  } catch (error) {
    console.error('❌ Error importando cloudinary config:', error.message);
  }

  console.log('🎉 Verificación de imports completada');

} catch (error) {
  console.error('❌ Error general:', error);
  console.error('❌ Stack trace:', error.stack);
}
