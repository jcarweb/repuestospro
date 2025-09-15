const { MongoClient } = require('mongodb');
require('dotenv').config();

const defaultTemplates = [
  {
    name: 'Banner Básico',
    description: 'Banner simple con colores personalizables para promocionar productos',
    type: 'basic_banner',
    category: 'self_managed',
    previewImage: '/images/templates/basic-banner-preview.jpg',
    template: {
      html: `
        <div class="ad-banner" style="background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); padding: 20px; border-radius: 12px; text-align: center;">
          <h3 style="color: {{textColor}}; margin: 0 0 10px 0; font-size: 18px;">{{title}}</h3>
          <p style="color: {{textColor}}; margin: 0; font-size: 14px; opacity: 0.9;">{{description}}</p>
          <button style="background: {{textColor}}; color: {{primaryColor}}; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 10px; cursor: pointer;">Ver más</button>
        </div>
      `,
      css: `
        .ad-banner {
          transition: transform 0.2s ease;
        }
        .ad-banner:hover {
          transform: translateY(-2px);
        }
      `
    },
    defaultColors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      text: '#FFFFFF',
      background: '#F3F4F6'
    },
    customizableFields: ['title', 'description', 'image', 'colors', 'duration', 'zones'],
    zones: ['home', 'search', 'category'],
    maxDuration: 30,
    minDuration: 1,
    pricing: {
      basePrice: 0,
      pricePerDay: 0.50,
      currency: 'USD'
    },
    requirements: {
      minImageWidth: 300,
      minImageHeight: 150,
      maxFileSize: 2,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp']
    },
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Destacado de Producto',
    description: 'Plantilla especializada para destacar un producto específico con imagen y precio',
    type: 'product_highlight',
    category: 'self_managed',
    previewImage: '/images/templates/product-highlight-preview.jpg',
    template: {
      html: `
        <div class="product-highlight" style="background: white; border: 2px solid {{primaryColor}}; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
          <img src="{{productImage}}" alt="{{productName}}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1;">
            <h4 style="color: #1F2937; margin: 0 0 4px 0; font-size: 16px;">{{productName}}</h4>
            <p style="color: #6B7280; margin: 0 0 8px 0; font-size: 14px;">{{description}}</p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: {{primaryColor}}; font-weight: bold; font-size: 18px;">{{price}}</span>
              <span style="color: #9CA3AF; text-decoration: line-through; font-size: 14px;">{{originalPrice}}</span>
            </div>
          </div>
          <button style="background: {{primaryColor}}; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">Comprar</button>
        </div>
      `,
      css: `
        .product-highlight {
          transition: box-shadow 0.2s ease;
        }
        .product-highlight:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `
    },
    defaultColors: {
      primary: '#10B981',
      secondary: '#059669',
      text: '#1F2937',
      background: '#FFFFFF'
    },
    customizableFields: ['title', 'description', 'image', 'colors', 'duration', 'zones', 'product'],
    zones: ['home', 'search', 'product'],
    maxDuration: 14,
    minDuration: 1,
    pricing: {
      basePrice: 5,
      pricePerDay: 1.00,
      currency: 'USD'
    },
    requirements: {
      minImageWidth: 300,
      minImageHeight: 300,
      maxFileSize: 3,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp']
    },
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tarjeta de Promoción',
    description: 'Tarjeta elegante para promociones especiales con descuentos',
    type: 'promotion_card',
    category: 'self_managed',
    previewImage: '/images/templates/promotion-card-preview.jpg',
    template: {
      html: `
        <div class="promotion-card" style="background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}}); border-radius: 16px; padding: 20px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -10px; right: -10px; background: {{textColor}}; color: {{primaryColor}}; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{discount}}%</div>
          <h3 style="color: {{textColor}}; margin: 0 0 8px 0; font-size: 20px;">{{title}}</h3>
          <p style="color: {{textColor}}; margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">{{description}}</p>
          <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <p style="color: {{textColor}}; margin: 0; font-size: 12px;">Válido hasta {{endDate}}</p>
          </div>
          <button style="background: {{textColor}}; color: {{primaryColor}}; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Aprovechar</button>
        </div>
      `,
      css: `
        .promotion-card {
          transition: transform 0.3s ease;
        }
        .promotion-card:hover {
          transform: scale(1.02);
        }
      `
    },
    defaultColors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      text: '#FFFFFF',
      background: '#FEF3C7'
    },
    customizableFields: ['title', 'description', 'image', 'colors', 'duration', 'zones'],
    zones: ['home', 'search', 'category', 'checkout'],
    maxDuration: 7,
    minDuration: 1,
    pricing: {
      basePrice: 10,
      pricePerDay: 2.00,
      currency: 'USD'
    },
    requirements: {
      minImageWidth: 400,
      minImageHeight: 200,
      maxFileSize: 3,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp']
    },
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Item Destacado',
    description: 'Plantilla premium para destacar productos con diseño profesional',
    type: 'featured_item',
    category: 'premium_managed',
    previewImage: '/images/templates/featured-item-preview.jpg',
    template: {
      html: `
        <div class="featured-item" style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
          <div style="position: relative; margin-bottom: 16px;">
            <img src="{{productImage}}" alt="{{productName}}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 16px;">
            <div style="position: absolute; top: -8px; right: -8px; background: {{primaryColor}}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">DESTACADO</div>
          </div>
          <h3 style="color: #1F2937; margin: 0 0 8px 0; font-size: 18px;">{{productName}}</h3>
          <p style="color: #6B7280; margin: 0 0 16px 0; font-size: 14px;">{{description}}</p>
          <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="color: {{primaryColor}}; font-weight: bold; font-size: 24px;">{{price}}</span>
            <span style="color: #9CA3AF; text-decoration: line-through; font-size: 16px;">{{originalPrice}}</span>
          </div>
          <button style="background: {{primaryColor}}; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%;">Ver Detalles</button>
        </div>
      `,
      css: `
        .featured-item {
          transition: all 0.3s ease;
        }
        .featured-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
      `
    },
    defaultColors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      text: '#1F2937',
      background: '#FFFFFF'
    },
    customizableFields: ['title', 'description', 'image', 'colors', 'duration', 'zones', 'product'],
    zones: ['home', 'search', 'product'],
    maxDuration: 30,
    minDuration: 7,
    pricing: {
      basePrice: 25,
      pricePerDay: 3.00,
      currency: 'USD'
    },
    requirements: {
      minImageWidth: 500,
      minImageHeight: 500,
      maxFileSize: 5,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp']
    },
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedTemplates() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🌱 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    const collection = db.collection('advertisementtemplates');
    
    console.log('🗑️ Eliminando plantillas existentes...');
    await collection.deleteMany({});
    console.log('✅ Plantillas existentes eliminadas');
    
    console.log('📝 Insertando nuevas plantillas...');
    const result = await collection.insertMany(defaultTemplates);
    console.log(`✅ ${result.insertedCount} plantillas creadas exitosamente`);
    
    // Mostrar resumen
    console.log('\n📋 Plantillas creadas:');
    for (const template of defaultTemplates) {
      console.log(`  • ${template.name} (${template.type}) - $${template.pricing.basePrice} + $${template.pricing.pricePerDay}/día`);
    }
    
    console.log('\n🎉 Inicialización completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedTemplates();
