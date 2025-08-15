import { Request, Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import Store from '../models/Store';
import emailService from '../services/emailService';
import crypto from 'crypto';

// Datos de prueba
const brands = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 
  'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus'
];

const categories = [
  'Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Transmisión', 'Refrigeración', 
  'Combustible', 'Escape', 'Dirección', 'Iluminación', 'Accesorios'
];

const subcategories = {
  'Motor': ['Aceite de Motor', 'Filtros de Aceite', 'Bujías', 'Correas', 'Bombas de Aceite', 'Juntas'],
  'Frenos': ['Pastillas de Freno', 'Discos de Freno', 'Líquido de Frenos', 'Cilindros', 'Cables'],
  'Suspensión': ['Amortiguadores', 'Resortes', 'Brazos de Control', 'Bujes', 'Rótulas'],
  'Eléctrico': ['Baterías', 'Alternadores', 'Arrancadores', 'Cables', 'Fusibles'],
  'Transmisión': ['Aceite de Transmisión', 'Embragues', 'Diferenciales', 'Juntas'],
  'Refrigeración': ['Radiadores', 'Bombas de Agua', 'Termostatos', 'Mangueras', 'Anticongelante'],
  'Combustible': ['Bombas de Combustible', 'Filtros de Combustible', 'Inyectores', 'Carburadores'],
  'Escape': ['Silenciadores', 'Catalizadores', 'Tubos de Escape', 'Soportes'],
  'Dirección': ['Cremalleras', 'Bombas de Dirección', 'Aceite de Dirección', 'Juntas'],
  'Iluminación': ['Bombillas', 'Faros', 'Pilotos', 'Cables de Iluminación'],
  'Accesorios': ['Alfombras', 'Cubiertas', 'Organizadores', 'Cargadores']
};

const productNames = {
  'Motor': [
    'Aceite Sintético 5W-30', 'Aceite Mineral 10W-40', 'Filtro de Aceite Premium',
    'Bujía de Platino', 'Bujía de Iridio', 'Correa de Distribución',
    'Bomba de Aceite', 'Junta de Culata', 'Junta de Cárter'
  ],
  'Frenos': [
    'Pastillas de Freno Cerámicas', 'Pastillas de Freno Orgánicas', 'Discos de Freno Ventilados',
    'Líquido de Frenos DOT4', 'Cilindro Maestro', 'Cables de Freno'
  ],
  'Suspensión': [
    'Amortiguador Delantero', 'Amortiguador Trasero', 'Resorte de Suspensión',
    'Brazo de Control Superior', 'Brazo de Control Inferior', 'Buje de Suspensión'
  ],
  'Eléctrico': [
    'Batería de 12V 60Ah', 'Batería de 12V 80Ah', 'Alternador 90A',
    'Arrancador 1.4kW', 'Cable de Batería', 'Fusible de 10A'
  ],
  'Transmisión': [
    'Aceite de Transmisión ATF', 'Embrague de Fricción', 'Diferencial Trasero',
    'Junta de Transmisión', 'Bomba de Transmisión'
  ],
  'Refrigeración': [
    'Radiador de Aluminio', 'Bomba de Agua', 'Termostato 82°C',
    'Manguera de Radiador', 'Anticongelante Verde', 'Anticongelante Rojo'
  ],
  'Combustible': [
    'Bomba de Combustible Eléctrica', 'Filtro de Combustible', 'Inyector de Combustible',
    'Carburador de 2 Bocas', 'Carburador de 4 Bocas'
  ],
  'Escape': [
    'Silenciador Trasero', 'Catalizador Universal', 'Tubo de Escape',
    'Soporte de Escape', 'Junta de Escape'
  ],
  'Dirección': [
    'Cremallera de Dirección', 'Bomba de Dirección Hidráulica', 'Aceite de Dirección',
    'Junta de Dirección', 'Terminal de Dirección'
  ],
  'Iluminación': [
    'Bombilla H4', 'Bombilla H7', 'Faros Delanteros', 'Pilotos Traseros',
    'Cable de Iluminación', 'Interruptor de Luces'
  ],
  'Accesorios': [
    'Alfombras de Goma', 'Cubiertas de Asiento', 'Organizador de Maletero',
    'Cargador USB', 'Porta Vasos', 'Cubre Volante'
  ]
};

const descriptions = {
  'Motor': [
    'Aceite de motor de alta calidad para máxima protección y rendimiento',
    'Filtro de aceite premium que mantiene el motor limpio',
    'Bujía de alta tecnología para mejor combustión',
    'Correa de distribución resistente para larga duración'
  ],
  'Frenos': [
    'Pastillas de freno de alta fricción para frenado seguro',
    'Discos de freno ventilados para mejor disipación de calor',
    'Líquido de frenos de alto punto de ebullición'
  ],
  'Suspensión': [
    'Amortiguador de gas para mejor control de la suspensión',
    'Resorte de suspensión de acero de alta resistencia',
    'Brazo de control de aleación ligera'
  ],
  'Eléctrico': [
    'Batería de larga duración con tecnología AGM',
    'Alternador de alta eficiencia para mejor carga',
    'Arrancador de alta potencia para arranque confiable'
  ],
  'Transmisión': [
    'Aceite de transmisión sintético para mejor lubricación',
    'Embrague de alta fricción para transmisión suave',
    'Diferencial de alta resistencia para mejor tracción'
  ],
  'Refrigeración': [
    'Radiador de aluminio para mejor disipación de calor',
    'Bomba de agua de alta eficiencia',
    'Anticongelante de larga duración'
  ],
  'Combustible': [
    'Bomba de combustible de alta presión',
    'Filtro de combustible de alta capacidad',
    'Inyector de combustible de precisión'
  ],
  'Escape': [
    'Silenciador de acero inoxidable',
    'Catalizador de alta eficiencia',
    'Tubo de escape de acero resistente'
  ],
  'Dirección': [
    'Cremallera de dirección de alta precisión',
    'Bomba de dirección hidráulica de alta presión',
    'Aceite de dirección sintético'
  ],
  'Iluminación': [
    'Bombillas de alta luminosidad',
    'Faros de diseño moderno',
    'Cables de iluminación de alta conductividad'
  ],
  'Accesorios': [
    'Alfombras de goma resistentes al agua',
    'Cubiertas de asiento de tela premium',
    'Organizador de maletero práctico'
  ]
};

// Función para generar un producto aleatorio
function generateRandomProduct(storeId?: string) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const subcategoryList = (subcategories as any)[category];
  const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
  
  const productNamesList = (productNames as any)[category];
  const productName = productNamesList[Math.floor(Math.random() * productNamesList.length)];
  
  const descriptionsList = (descriptions as any)[category];
  const description = descriptionsList[Math.floor(Math.random() * descriptionsList.length)];
  
  const price = Math.floor(Math.random() * 500) + 10; // Precio entre $10 y $510
  const stock = Math.floor(Math.random() * 50) + 1; // Stock entre 1 y 50
  
  // Generar código de parte original realista
  const originalPartCode = generateOriginalPartCode(brand, category);
  
  // Generar SKU interno del gestor
  const sku = generateInternalSKU(brand, category);
  
  const product: any = {
    name: `${productName} ${brand}`,
    description: `${description} compatible con vehículos ${brand}`,
    price: price,
    images: [
      `https://via.placeholder.com/400x300/0066cc/ffffff?text=${encodeURIComponent(productName)}`,
      `https://via.placeholder.com/400x300/ff6600/ffffff?text=${encodeURIComponent(brand)}`,
      `https://via.placeholder.com/400x300/00cc66/ffffff?text=${encodeURIComponent(category)}`,
      `https://via.placeholder.com/400x300/cc0066/ffffff?text=${encodeURIComponent(subcategory)}`
    ],
    category: category.toLowerCase(),
    brand: brand.toLowerCase(),
    subcategory: subcategory.toLowerCase(),
    sku: sku,
    originalPartCode: originalPartCode,
    stock: stock,
    isActive: true,
    isFeatured: Math.random() > 0.8, // 20% de productos destacados
    tags: [category.toLowerCase(), brand.toLowerCase(), subcategory.toLowerCase()],
    specifications: {
      marca: brand,
      categoria: category,
      subcategoria: subcategory,
      compatibilidad: `${brand}, ${category}`,
      garantia: '12 meses',
      codigoOriginal: originalPartCode,
      skuInterno: sku
    },
    popularity: Math.floor(Math.random() * 100) + 1
  };
  
  // Agregar storeId si se proporciona
  if (storeId) {
    product.store = storeId;
  }
  
  return product;
}

// Función para generar código de parte original realista
function generateOriginalPartCode(brand: string, category: string): string {
  const brandPrefix = brand.substring(0, 3).toUpperCase();
  const categoryPrefix = category.substring(0, 2).toUpperCase();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const year = Math.floor(Math.random() * 20) + 2000;
  
  return `${brandPrefix}-${categoryPrefix}-${randomNum}-${year}`;
}

// Función para generar SKU interno del gestor
function generateInternalSKU(brand: string, category: string): string {
  const brandCode = brand.substring(0, 2).toUpperCase();
  const categoryCode = category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  
  return `SKU-${brandCode}-${categoryCode}-${randomNum}`;
}

// Función para calcular distancia entre dos puntos geográficos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en kilómetros
  return distance;
}

export class AdminController {
  // Generar productos de prueba
  async generateProducts(req: Request, res: Response) {
    try {
      console.log('🚀 Iniciando generación de productos desde API...');
      console.log('📝 Request body:', req.body);
      console.log('👤 Usuario:', (req as any).user);
      
      const { storeId } = req.body;
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID de la tienda para generar productos'
        });
      }
      
      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      console.log(`🏪 Generando productos para tienda: ${store.name} (${store.city})`);
      
      // Limpiar productos existentes de esta tienda
      console.log('🗑️  Limpiando productos existentes de la tienda...');
      const deleteResult = await Product.deleteMany({ store: storeId });
      console.log(`🗑️  Eliminados ${deleteResult.deletedCount} productos existentes de la tienda`);
      
      // Generar 150 productos de prueba para esta tienda
      console.log('🔧 Generando productos...');
      const products = [];
      for (let i = 0; i < 150; i++) {
        const product = generateRandomProduct(storeId);
        products.push(product);
      }
      console.log(`📦 Generados ${products.length} productos en memoria para la tienda`);
      
      // Insertar productos en la base de datos
      console.log('💾 Insertando productos en la base de datos...');
      const result = await Product.insertMany(products);
      console.log(`✅ Generados ${result.length} productos de prueba exitosamente para la tienda`);
      
      // Mostrar ejemplo de producto generado
      if (result.length > 0) {
        const exampleProduct = result[0];
        console.log('📋 Ejemplo de producto generado:');
        console.log(`   Nombre: ${exampleProduct.name}`);
        console.log(`   SKU Interno: ${exampleProduct.sku}`);
        console.log(`   Código Original: ${exampleProduct.originalPartCode}`);
        console.log(`   Categoría: ${exampleProduct.category}`);
        console.log(`   Marca: ${exampleProduct.brand}`);
        console.log(`   Precio: $${exampleProduct.price}`);
        console.log(`   Stock: ${exampleProduct.stock}`);
      }
      
      // Obtener estadísticas
      console.log('📊 Obteniendo estadísticas...');
      const totalProducts = await Product.countDocuments();
      const featuredProducts = await Product.countDocuments({ isFeatured: true });
      
      // Estadísticas por categoría
      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            totalStock: { $sum: '$stock' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Estadísticas por marca
      const brandStats = await Product.aggregate([
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Obtener categorías únicas
      const categories = await Product.distinct('category');
      const brands = await Product.distinct('brand');

      const stats = {
        totalProducts,
        totalCategories: categories.length,
        totalBrands: brands.length,
        featuredProducts,
        categoryStats: categoryStats.map(stat => ({
          category: stat._id,
          count: stat.count,
          avgPrice: Math.round(stat.avgPrice),
          totalStock: stat.totalStock
        })),
        brandStats: brandStats.map(stat => ({
          brand: stat._id,
          count: stat.count
        }))
      };
      
      console.log('📈 Estadísticas obtenidas:', stats);
      
      res.json({
        success: true,
        data: {
          count: result.length,
          stats: stats
        },
        message: 'Productos generados exitosamente'
      });
    } catch (error) {
      console.error('❌ Error generando productos:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar productos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Buscar productos por proximidad geográfica
  static async findProductsByLocation(req: Request, res: Response) {
    try {
      const { latitude, longitude, radius = 10, category, brand, limit = 50 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren coordenadas de latitud y longitud'
        });
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const searchRadius = parseFloat(radius as string);
      const maxResults = parseInt(limit as string);

      // Construir filtro de búsqueda
      const filter: any = {
        isActive: true,
        stock: { $gt: 0 } // Solo productos con stock disponible
      };

      if (category) {
        filter.category = category;
      }

      if (brand) {
        filter.brand = brand;
      }

      // Buscar tiendas dentro del radio especificado
      const nearbyStores = await Store.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat] // MongoDB usa [longitude, latitude]
            },
            $maxDistance: searchRadius * 1000 // Convertir km a metros
          }
        },
        isActive: true
      }).select('_id name city state coordinates');

      if (nearbyStores.length === 0) {
        return res.json({
          success: true,
          data: {
            products: [],
            stores: [],
            total: 0,
            message: 'No se encontraron tiendas cercanas'
          }
        });
      }

      // Obtener IDs de tiendas cercanas
      const storeIds = nearbyStores.map(store => store._id);

      // Buscar productos en tiendas cercanas
      const products = await Product.find({
        ...filter,
        store: { $in: storeIds }
      })
      .populate('store', 'name city state coordinates')
      .limit(maxResults)
      .sort({ popularity: -1, price: 1 });

      // Calcular distancia para cada producto
      const productsWithDistance = products.map(product => {
        const store = product.store as any;
        const distance = calculateDistance(
          lat, lng,
          store.coordinates.latitude,
          store.coordinates.longitude
        );

        return {
          ...product.toObject(),
          distance: Math.round(distance * 100) / 100, // Redondear a 2 decimales
          storeInfo: {
            name: store.name,
            city: store.city,
            state: store.state,
            coordinates: store.coordinates
          }
        };
      });

      // Ordenar por distancia
      productsWithDistance.sort((a, b) => a.distance - b.distance);

      res.json({
        success: true,
        data: {
          products: productsWithDistance,
          stores: nearbyStores.map(store => ({
            id: store._id,
            name: store.name,
            city: store.city,
            state: store.state,
            coordinates: store.coordinates
          })),
          total: productsWithDistance.length,
          searchRadius: searchRadius,
          userLocation: { latitude: lat, longitude: lng }
        }
      });
    } catch (error) {
      console.error('❌ Error buscando productos por ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al buscar productos'
      });
    }
  }

  // Obtener estadísticas de productos
  async getProductStats(req: Request, res: Response) {
    try {
      const totalProducts = await Product.countDocuments();
      const featuredProducts = await Product.countDocuments({ isFeatured: true });
      
      // Estadísticas por categoría
      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            totalStock: { $sum: '$stock' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Estadísticas por marca
      const brandStats = await Product.aggregate([
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Obtener categorías únicas
      const categories = await Product.distinct('category');
      const brands = await Product.distinct('brand');

      const stats = {
        totalProducts,
        totalCategories: categories.length,
        totalBrands: brands.length,
        featuredProducts,
        categoryStats: categoryStats.map(stat => ({
          category: stat._id,
          count: stat.count,
          avgPrice: Math.round(stat.avgPrice),
          totalStock: stat.totalStock
        })),
        brandStats: brandStats.map(stat => ({
          brand: stat._id,
          count: stat.count
        }))
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas'
      });
    }
  }

  // Obtener todos los usuarios
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      
      // Mapear los usuarios para incluir el campo 'id' además de '_id'
      const mappedUsers = users.map(user => ({
        ...user.toObject(),
        id: user._id.toString()
      }));
      
      res.json({
        success: true,
        users: mappedUsers
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener un usuario específico
  static async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Mapear el usuario para incluir el campo 'id'
      const mappedUser = {
        ...user.toObject(),
        id: user._id.toString()
      };
      
      res.json({
        success: true,
        user: mappedUser
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear un nuevo usuario
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, phone, role = 'client' } = req.body;

      // Validaciones
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Generar contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8);

      // Crear el usuario
      const userData = {
        name,
        email,
        phone,
        role,
        password: tempPassword, // Se hasheará automáticamente
        isEmailVerified: false,
        isActive: true,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      const user = new User(userData);

      await user.save();

      // Enviar email con credenciales temporales
      // TODO: Implementar envío de email con credenciales

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        tempPassword: tempPassword // Solo para desarrollo, en producción se enviaría por email
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar un usuario
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, phone, role } = req.body;

      // Validaciones
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos'
        });
      }

      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el email ya existe en otro usuario
      if (email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está registrado por otro usuario'
          });
        }
      }

      // Actualizar el usuario
      user.name = name;
      user.email = email;
      user.phone = phone;
      user.role = role;

      await user.save();

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Desactivar un usuario (borrado lógico)
  static async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No permitir desactivar al usuario actual
      if (user._id.toString() === req.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
      }

      // Desactivar el usuario
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Reactivar un usuario
  static async reactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Reactivar el usuario
      user.isActive = true;
      await user.save();

      res.json({
        success: true,
        message: 'Usuario reactivado exitosamente'
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de usuarios
  static async getUserStats(req: Request, res: Response) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const inactiveUsers = await User.countDocuments({ isActive: false });
      const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
      const pendingUsers = await User.countDocuments({ isEmailVerified: false });

      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentUsers = await User.find({})
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        success: true,
        stats: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          verified: verifiedUsers,
          pending: pendingUsers,
          byRole: usersByRole,
          recent: recentUsers
        }
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Resetear contraseña de usuario desde admin
  static async resetUserPassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Buscar el usuario
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Generar contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
      
      // Generar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Actualizar usuario con nueva contraseña temporal y token
      user.password = tempPassword; // Se hasheará automáticamente
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await user.save();

      // Enviar email con contraseña temporal y enlace para cambiar
      await emailService.sendAdminPasswordResetEmail(user.email, user.name, tempPassword, resetToken);

      res.json({
        success: true,
        message: 'Contraseña reseteada exitosamente. Se ha enviado un email al usuario con la contraseña temporal.',
        tempPassword: tempPassword // Solo para desarrollo, en producción no se debería enviar
      });
    } catch (error) {
      console.error('Error reseteando contraseña de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Método temporal para verificar credenciales de email
  static async checkEmailConfig(req: Request, res: Response) {
    try {
      const emailConfig = {
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
        port: process.env.EMAIL_PORT || process.env.SMTP_PORT,
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        secure: process.env.EMAIL_SECURE,
        // No mostrar la contraseña por seguridad
        hasPassword: !!(process.env.EMAIL_PASS || process.env.SMTP_PASS)
      };

      res.json({
        success: true,
        emailConfig
      });
    } catch (error) {
      console.error('Error verificando configuración de email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Generar tiendas de prueba
  static async generateStores(req: Request, res: Response) {
    try {
      // Datos de tiendas de prueba
      const testStores = [
        {
          name: 'AutoParts Express',
          description: 'Tienda especializada en repuestos automotrices de alta calidad',
          address: 'Av. Principal, Centro Comercial Galerías',
          city: 'Caracas',
          state: 'Distrito Capital',
          zipCode: '1010',
          phone: '+58-212-555-0101',
          email: 'autoparts.caracas@test.com',
          coordinates: { latitude: 10.4806, longitude: -66.9036 }
        },
        {
          name: 'Repuestos Pro',
          description: 'Distribuidor autorizado de repuestos originales',
          address: 'Calle Comercial, Zona Industrial',
          city: 'Valencia',
          state: 'Carabobo',
          zipCode: '2001',
          phone: '+58-241-555-0202',
          email: 'repuestos.valencia@test.com',
          coordinates: { latitude: 10.1579, longitude: -67.9972 }
        },
        {
          name: 'Mega Parts',
          description: 'La tienda más grande de repuestos del occidente',
          address: 'Av. Libertador, Centro Comercial Mega',
          city: 'Maracaibo',
          state: 'Zulia',
          zipCode: '4001',
          phone: '+58-261-555-0303',
          email: 'megaparts.maracaibo@test.com',
          coordinates: { latitude: 10.6427, longitude: -71.6125 }
        },
        {
          name: 'Auto Supply',
          description: 'Suministros automotrices de calidad premium',
          address: 'Calle Principal, Zona Centro',
          city: 'Barquisimeto',
          state: 'Lara',
          zipCode: '3001',
          phone: '+58-251-555-0404',
          email: 'autosupply.barquisimeto@test.com',
          coordinates: { latitude: 10.0731, longitude: -69.3227 }
        },
        {
          name: 'Parts Center',
          description: 'Centro de distribución de repuestos automotrices',
          address: 'Av. Bolívar, Zona Industrial Norte',
          city: 'Maracay',
          state: 'Aragua',
          zipCode: '2101',
          phone: '+58-243-555-0505',
          email: 'partscenter.maracay@test.com',
          coordinates: { latitude: 10.2469, longitude: -67.5958 }
        }
      ];

      // Buscar usuarios con rol store_manager para asignar como propietarios
      const storeManagers = await User.find({ role: 'store_manager' }).limit(5);
      
      // Si no hay store_managers, crear algunos usuarios de prueba
      let owners = storeManagers;
      if (storeManagers.length < 5) {
        const testUsers = [];
        for (let i = 0; i < 5 - storeManagers.length; i++) {
          const testUser = new User({
            name: `Manager ${i + 1}`,
            email: `manager${i + 1}@test.com`,
            password: 'password123',
            role: 'store_manager',
            isEmailVerified: true,
            isActive: true
          });
          await testUser.save();
          testUsers.push(testUser);
        }
        owners = [...storeManagers, ...testUsers];
      }

      // Crear las tiendas
      const createdStores = [];
      for (let i = 0; i < testStores.length; i++) {
        const storeData = testStores[i];
        const owner = owners[i] || owners[0]; // Fallback al primer owner si no hay suficientes

        const store = new Store({
          ...storeData,
          owner: owner._id,
          managers: [owner._id],
          businessHours: {
            monday: { open: '08:00', close: '18:00', isOpen: true },
            tuesday: { open: '08:00', close: '18:00', isOpen: true },
            wednesday: { open: '08:00', close: '18:00', isOpen: true },
            thursday: { open: '08:00', close: '18:00', isOpen: true },
            friday: { open: '08:00', close: '18:00', isOpen: true },
            saturday: { open: '08:00', close: '14:00', isOpen: true },
            sunday: { open: '08:00', close: '14:00', isOpen: false }
          },
          settings: {
            currency: 'USD',
            taxRate: 16.0,
            deliveryRadius: 10,
            minimumOrder: 0,
            autoAcceptOrders: false
          }
        });

        await store.save();
        createdStores.push(store);
      }

      res.json({
        success: true,
        message: 'Tiendas de prueba generadas exitosamente',
        data: {
          count: createdStores.length,
          stores: createdStores.map(store => ({
            id: store._id,
            name: store.name,
            city: store.city,
            state: store.state
          }))
        }
      });
    } catch (error) {
      console.error('Error generando tiendas de prueba:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar tiendas'
      });
    }
  }
}

const adminController = new AdminController();
export default adminController; 