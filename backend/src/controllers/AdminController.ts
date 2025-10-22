import { Request, Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import Store from '../models/Store';
import Subscription from '../models/Subscription';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
import { Quotation } from '../models/Quotation';
import { SubscriptionService } from '../services/subscriptionService';
import { emailService } from '../services/emailService';
import crypto from 'crypto';
import { getRandomImages } from '../data/repuestoImages';
import cloudinaryCleanupService from '../services/cloudinaryCleanupService';
import imageService from '../services/imageService';
interface AuthenticatedRequest extends Request {
  user?: any;
}
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
// Función para generar un producto aleatorio con imágenes reales
async function generateRandomProduct(storeId?: string) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const subcategoryList = (subcategories as any)[category || ''];
  const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
  const productNamesList = (productNames as any)[category || ''];
  const productName = productNamesList[Math.floor(Math.random() * productNamesList.length)];
  const descriptionsList = (descriptions as any)[category || ''];
  const description = descriptionsList[Math.floor(Math.random() * descriptionsList.length)];
  const price = Math.floor(Math.random() * 500) + 10; // Precio entre $10 y $510
  const stock = Math.floor(Math.random() * 50) + 1; // Stock entre 1 y 50
  // Generar código de parte original realista
  const originalPartCode = generateOriginalPartCode(brand || '', category || '');
  // Generar SKU interno del gestor
  const sku = generateInternalSKU(brand || '', category || '');
  // Obtener imágenes reales de repuestos para la categoría
  const realImages = getRandomImages(category || '', 4);
  // Usar imágenes reales directamente sin procesar
  const productImages = realImages.map((imageUrl, index) => {
    // Si la imagen falla, usar un placeholder específico para la categoría
    return imageUrl || `https://via.placeholder.com/400x300/0066cc/ffffff?text=${encodeURIComponent(category || '')}`;
  });
  const product: any = {
    name: `${productName} ${brand}`,
    description: `${description} compatible con vehículos ${brand}`,
    price: price,
    image: productImages[0], // Usar la primera imagen como imagen principal
    images: productImages, // Mantener todas las imágenes
    category: category?.toLowerCase() || '',
    brand: brand?.toLowerCase() || '',
    subcategory: subcategory.toLowerCase(),
    sku: sku,
    originalPartCode: originalPartCode,
    stock: stock,
    isActive: true,
    isFeatured: Math.random() > 0.8, // 20% de productos destacados
    tags: [category?.toLowerCase() || '', brand?.toLowerCase() || '', subcategory.toLowerCase()],
    specifications: new Map([
      ['marca', brand],
      ['categoria', category],
      ['subcategoria', subcategory],
      ['compatibilidad', `${brand}, ${category}`],
      ['garantia', '12 meses'],
      ['codigoOriginal', originalPartCode],
      ['skuInterno', sku]
    ]),
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
const AdminController = {
  // Generar productos de prueba
  generateProducts: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🚀 Iniciando generación de productos desde API...');
      const { storeId } = req.body;
      if (!storeId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el ID de la tienda para generar productos'
        });
      }
      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      console.log(`🏪 Generando productos para tienda: ${store.name} (${store.city})`);
      // Limpiar productos existentes de esta tienda
      console.log('🗑️  Limpiando productos existentes de la tienda...');
      // Eliminar los productos de la base de datos
      const deleteResult = await Product.deleteMany({ store: storeId });
      console.log(`🗑️  Eliminados ${deleteResult.deletedCount} productos existentes de la tienda`);
      // Generar 150 productos de prueba para esta tienda con imágenes reales optimizadas
      console.log('🔧 Generando productos con imágenes reales optimizadas...');
      const products = [];
      for (let i = 0; i < 150; i++) {
        console.log(`📦 Generando producto ${i + 1}/150...`);
        const product = await generateRandomProduct(storeId);
        products.push(product);
      }
      console.log(`📦 Generados ${products.length} productos en memoria para la tienda`);
      // Insertar productos en la base de datos
      console.log('💾 Insertando productos en la base de datos...');
      const result = await Product.insertMany(products);
      // Obtener estadísticas de los productos generados
      console.log('📊 Obteniendo estadísticas de productos generados...');
      const totalProducts = await Product.countDocuments({ store: storeId });
      const featuredProducts = await Product.countDocuments({ store: storeId, isFeatured: true });
      // Estadísticas por categoría
      const categoryStats = await Product.aggregate([
        { $match: { store: storeId } },
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
        { $match: { store: storeId } },
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
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
  },
  // Regenerar productos con imágenes reales (método de prueba)
  regenerateProductsWithRealImages: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔄 Iniciando regeneración de productos con imágenes reales...');
      const { storeId } = req.body;
      if (!storeId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el ID de la tienda para regenerar productos'
        });
      }
      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      console.log(`🏪 Regenerando productos para tienda: ${store.name} (${store.city})`);
      // Limpiar productos existentes de esta tienda
      console.log('🗑️  Limpiando productos existentes de la tienda...');
      const deleteResult = await Product.deleteMany({ store: storeId });
      console.log(`🗑️  Eliminados ${deleteResult.deletedCount} productos existentes de la tienda`);
      // Generar productos con imágenes reales verificadas
      console.log('🔧 Generando productos con imágenes reales verificadas...');
      const products = [];
      const maxProducts = 50; // Reducir para pruebas
      for (let i = 0; i < maxProducts; i++) {
        console.log(`📦 Generando producto ${i + 1}/${maxProducts}...`);
        const product = await generateRandomProduct(storeId);
        // Verificar que las imágenes sean válidas
        if (product.images && product.images.length > 0) {
          console.log(`🖼️  Producto ${i + 1} tiene ${product.images.length} imágenes`);
        }
        products.push(product);
      }
      console.log(`📦 Generados ${products.length} productos en memoria para la tienda`);
      // Insertar productos en la base de datos
      console.log('💾 Insertando productos en la base de datos...');
      const result = await Product.insertMany(products);
      // Obtener estadísticas básicas
      const totalProducts = await Product.countDocuments({ store: storeId });
      const productsWithImages = await Product.countDocuments({
        store: storeId,
        images: { $exists: true, $ne: [] }
      });
      const stats = {
        totalProducts,
        productsWithImages,
        productsWithoutImages: totalProducts - productsWithImages,
        message: 'Productos regenerados con imágenes reales'
      };
      console.log('📈 Estadísticas de regeneración:', stats);
      res.json({
        success: true,
        data: {
          count: result.length,
          stats: stats
        },
        message: 'Productos regenerados exitosamente con imágenes reales'
      });
    } catch (error) {
      console.error('❌ Error regenerando productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al regenerar productos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  // Buscar productos por proximidad geográfica
  findProductsByLocation: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radius = 10, category, brand, limit = 50 } = req.query;
      if (!latitude || !longitude) {
        res.status(400).json({
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
        res.json({
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
  },
  // Obtener estadísticas de productos
  getProductStats: async (req: AuthenticatedRequest, res: Response) => {
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
  },
  // Obtener todos los usuarios
  getUsers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Obtener parámetros de paginación
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;
      // Filtros opcionales
      const search = req.query['search'] as string || '';
      const role = req.query['role'] as string || '';
      const status = req.query['status'] as string || '';
      const hasId = req.query['hasId'] === 'true';
      // Construir filtros
      let filters: any = {};
      // Filtrar solo usuarios con ID válido si se solicita
      if (hasId) {
        filters._id = { $exists: true, $ne: null };
      }
      // Filtro de búsqueda por nombre o email
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      // Filtro por rol
      if (role) {
        filters.role = role;
      }
      // Filtro por estado
      if (status === 'active') {
        filters.isActive = true;
      } else if (status === 'inactive') {
        filters.isActive = false;
      }
      // Obtener total de usuarios que coinciden con los filtros
      const totalUsers = await User.countDocuments(filters);
      // Obtener usuarios con paginación
      const users = await User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      // Mapear los usuarios para incluir el campo 'id' además de '_id'
      const mappedUsers = users.map(user => ({
        ...user.toObject(),
        id: (user as any)._id.toString()
      }));
      // Calcular información de paginación
      const totalPages = Math.ceil(totalUsers / limit);
      res.json({
        success: true,
        data: mappedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  // Obtener un usuario específico
  getUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // Mapear el usuario para incluir el campo 'id'
      const mappedUser = {
        ...user.toObject(),
        id: (user as any)._id.toString()
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
  },
  // Crear un nuevo usuario
  createUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, email, phone, role = 'client' } = req.body;
      // Validaciones
      if (!name || !email) {
        res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos'
        });
      }
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
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
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: (user as any)._id.toString(),
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
  },
  // Actualizar un usuario
  updateUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email, phone, role } = req.body;
      // Validaciones
      if (!name || !email) {
        res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos'
        });
      }
      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // Verificar si el email ya existe en otro usuario
      if (email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'El email ya está registrado por otro usuario'
          });
          return;
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
          id: (user as any)._id.toString(),
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
  },
  // Desactivar un usuario (borrado lógico)
  deactivateUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // No permitir desactivar al usuario actual
      if ((user as any)._id.toString() === (req as any).user?.id) {
        res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
        return;
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
  },
  // Reactivar un usuario
  reactivateUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // Verificar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
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
  },
  // Obtener estadísticas de usuarios
  getUserStats: async (req: AuthenticatedRequest, res: Response) => {
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
  },
  // Resetear contraseña de usuario desde admin
  resetUserPassword: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      // Buscar el usuario
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
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
      await emailService.sendAdminPasswordResetEmail(user.email, resetToken);
      res.json({
        success: true,
        message: 'Contraseña reseteada exitosamente. Se ha enviado un email al usuario con la contraseña temporal.',
        tempPassword: tempPassword // Solo para desarrollo, en producción no se debería enviar
      });
      return;
    } catch (error) {
      console.error('Error reseteando contraseña de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
      return;
    }
  },
  // Método temporal para verificar credenciales de email
  checkEmailConfig: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const emailConfig = {
        host: process.env['EMAIL_HOST'] || process.env['SMTP_HOST'],
        port: process.env['EMAIL_PORT'] || process.env['SMTP_PORT'],
        user: process.env['EMAIL_USER'] || process.env['SMTP_USER'],
        secure: process.env['EMAIL_SECURE'],
        // No mostrar la contraseña por seguridad
        hasPassword: !!(process.env['EMAIL_PASS'] || process.env['SMTP_PASS'])
      };
      res.json({
        success: true,
        emailConfig
      });
      return;
    } catch (error) {
      console.error('Error verificando configuración de email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
      return;
    }
  },
  // Generar tiendas de prueba
  generateStores: async (req: AuthenticatedRequest, res: Response) => {
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
        if (!owner) {
          console.error(`No hay owner disponible para la tienda ${i}`);
          continue;
        }
        const store = new Store({
          ...storeData,
          owner: owner?._id,
          managers: [owner?._id],
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
  },
  /**
   * Obtiene todas las tiendas con sus suscripciones
   */
  getStoreSubscriptions: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stores = await Store.find()
        .populate('subscription')
        .select('name email phone address subscription subscriptionStatus subscriptionExpiresAt createdAt updatedAt')
        .sort({ createdAt: -1 });
      const storeSubscriptions = stores.map(store => ({
        _id: store._id,
        store: {
          _id: store._id,
          name: store.name,
          email: store.email,
          phone: store.phone,
          address: store.address
        },
        subscription: store.subscription,
        subscriptionStatus: store.subscriptionStatus,
        subscriptionExpiresAt: store.subscriptionExpiresAt,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      }));
      res.json({
        success: true,
        storeSubscriptions
      });
    } catch (error) {
      console.error('Error al obtener suscripciones de tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Asigna una suscripción a una tienda
   */
  assignSubscriptionToStore: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { storeId } = req.params;
      const { subscriptionId, status, expiresAt } = req.body;
      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      // Verificar que la suscripción existe si se proporciona
      if (subscriptionId) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
          res.status(404).json({
            success: false,
            message: 'Plan de suscripción no encontrado'
          });
          return;
        }
      }
      // Actualizar la tienda
      const updateData: any = {
        subscriptionStatus: status
      };
      if (subscriptionId) {
        updateData.subscription = subscriptionId;
      } else {
        updateData.subscription = null;
      }
      if (expiresAt) {
        updateData.subscriptionExpiresAt = new Date(expiresAt);
      } else {
        updateData.subscriptionExpiresAt = null;
      }
      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        updateData,
        { new: true }
      ).populate('subscription');
      res.json({
        success: true,
        message: 'Suscripción asignada exitosamente',
        store: updatedStore
      });
    } catch (error) {
      console.error('Error al asignar suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Actualiza el estado de suscripción de una tienda
   */
  updateStoreSubscriptionStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { storeId } = req.params;
      const { status } = req.body;
      const validStatuses = ['active', 'inactive', 'expired', 'pending'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Estado de suscripción inválido'
        });
        return;
      }
      const store = await Store.findByIdAndUpdate(
        storeId,
        { subscriptionStatus: status },
        { new: true }
      ).populate('subscription');
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      res.json({
        success: true,
        message: 'Estado de suscripción actualizado exitosamente',
        store
      });
    } catch (error) {
      console.error('Error al actualizar estado de suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtiene estadísticas de suscripciones
   */
  getSubscriptionStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stores = await Store.find();
      const stats = {
        totalStores: stores.length,
        activeSubscriptions: 0,
        inactiveSubscriptions: 0,
        expiredSubscriptions: 0,
        pendingSubscriptions: 0,
        basicPlans: 0,
        proPlans: 0,
        elitePlans: 0,
        noPlan: 0
      };
      for (const store of stores) {
        // Contar por estado
        switch (store.subscriptionStatus) {
          case 'active':
            stats.activeSubscriptions++;
            break;
          case 'inactive':
            stats.inactiveSubscriptions++;
            break;
          case 'expired':
            stats.expiredSubscriptions++;
            break;
          case 'pending':
            stats.pendingSubscriptions++;
            break;
        }
        // Contar por tipo de plan
        if (store.subscription) {
          const subscription = await Subscription.findById(store.subscription);
          if (subscription) {
            switch (subscription.type) {
              case 'basic':
                stats.basicPlans++;
                break;
              case 'pro':
                stats.proPlans++;
                break;
              case 'elite':
                stats.elitePlans++;
                break;
            }
          }
        } else {
          stats.noPlan++;
        }
      }
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de suscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtiene tiendas que necesitan renovación
   */
  getStoresNeedingRenewal: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const stores = await Store.find({
        subscriptionStatus: 'active',
        subscriptionExpiresAt: { $lte: thirtyDaysFromNow }
      })
      .populate('subscription')
      .select('name email subscription subscriptionExpiresAt')
      .sort({ subscriptionExpiresAt: 1 });
      res.json({
        success: true,
        stores
      });
    } catch (error) {
      console.error('Error al obtener tiendas que necesitan renovación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Limpiar todas las imágenes de productos de prueba de Cloudinary
   */
  cleanupAllTestImages: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🗑️ Iniciando limpieza de todas las imágenes de productos de prueba...');
      // Limpiar todas las imágenes de Cloudinary
      const cleanupResult = await cloudinaryCleanupService.cleanupAllTestImages();
      if (cleanupResult.errors.length > 0) {
        console.warn('⚠️ Errores durante la limpieza:', cleanupResult.errors);
      }
      res.json({
        success: true,
        message: 'Limpieza de imágenes completada exitosamente',
        data: {
          deletedImages: cleanupResult.deleted,
          errors: cleanupResult.errors
        }
      });
    } catch (error) {
      console.error('❌ Error en limpieza de imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la limpieza de imágenes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Limpiar carpeta específica de Cloudinary
   */
  cleanupCloudinaryFolder: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { folderPath } = req.body;
      if (!folderPath) {
        res.status(400).json({
          success: false,
          message: 'Se requiere la ruta de la carpeta para limpiar'
        });
        return;
      }
      console.log(`🗑️ Iniciando limpieza de carpeta: ${folderPath}`);
      const cleanupResult = await cloudinaryCleanupService.cleanupFolder(folderPath);
      if (cleanupResult.errors.length > 0) {
        console.warn('⚠️ Errores durante la limpieza:', cleanupResult.errors);
      }
      res.json({
        success: true,
        message: 'Limpieza de carpeta completada exitosamente',
        data: {
          deletedResources: cleanupResult.deleted,
          errors: cleanupResult.errors
        }
      });
    } catch (error) {
      console.error('❌ Error en limpieza de carpeta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la limpieza de carpeta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Obtener estadísticas de uso de Cloudinary
   */
  getCloudinaryStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo estadísticas de Cloudinary...');
      const stats = await cloudinaryCleanupService.getUsageStats();
      res.json({
        success: true,
        message: 'Estadísticas de Cloudinary obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de Cloudinary',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Obtener estadísticas generales del dashboard de admin
   */
  getDashboardStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard de admin...');
      // Importar el modelo Order
      const Order = require('../models/Order').default;
      // Obtener estadísticas de usuarios
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      });
      // Obtener estadísticas de productos
      const totalProducts = await Product.countDocuments({ deleted: { $ne: true } });
      const activeProducts = await Product.countDocuments({
        deleted: { $ne: true },
        isActive: true
      });
      const lowStockProducts = await Product.countDocuments({
        deleted: { $ne: true },
        stock: { $lt: 10, $gt: 0 }
      });
      const outOfStockProducts = await Product.countDocuments({
        deleted: { $ne: true },
        stock: 0
      });
      // Obtener estadísticas de tiendas
      const totalStores = await Store.countDocuments();
      const activeStores = await Store.countDocuments({ isActive: true });
      // Obtener estadísticas de órdenes
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({
        orderStatus: { $in: ['pending', 'confirmed', 'processing'] }
      });
      const completedOrders = await Order.countDocuments({
        orderStatus: { $in: ['delivered', 'completed'] }
      });
      // Calcular ingresos totales
      const revenueResult = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
      // Calcular ingresos del mes actual
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlyRevenueResult = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: currentMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].monthlyRevenue : 0;
      // Obtener entregas pendientes (órdenes listas para delivery)
      const pendingDeliveries = await Order.countDocuments({
        orderStatus: { $in: ['ready_for_delivery', 'out_for_delivery'] }
      });
      // Obtener estadísticas por rol de usuario
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      // Obtener estadísticas de productos por categoría (top 5)
      const productsByCategory = await Product.aggregate([
        { $match: { deleted: { $ne: true } } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      // Obtener estadísticas de tiendas por ciudad (top 5)
      const storesByCity = await Store.aggregate([
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      // Obtener órdenes recientes (últimas 5)
      const recentOrders = await Order.find({})
        .populate('userId', 'name email')
        .populate('storeId', 'name city')
        .select('orderNumber totalAmount orderStatus paymentStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(5);
      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          byRole: usersByRole
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          byCategory: productsByCategory
        },
        stores: {
          total: totalStores,
          active: activeStores,
          byCity: storesByCity
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          pendingDeliveries: pendingDeliveries,
          recent: recentOrders
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        }
      };
      res.json({
        success: true,
        data: stats,
        message: 'Estadísticas del dashboard obtenidas exitosamente'
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas del dashboard',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  
  getStoreStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const totalStores = await Store.countDocuments();
      const activeStores = await Store.countDocuments({ isActive: true });
      const inactiveStores = await Store.countDocuments({ isActive: false });
      // Tiendas por ciudad
      const storesByCity = await Store.aggregate([
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      // Tiendas por estado
      const storesByState = await Store.aggregate([
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      res.json({
        success: true,
        data: {
          totalStores,
          activeStores,
          inactiveStores,
          storesByCity,
          storesByState
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener todas las órdenes para admin
   */
  getOrders: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const Order = require('../models/Order').default;
      const { page = 1, limit = 20, search, status, storeId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const query: any = {};
      // Aplicar filtros
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'customerInfo.name': { $regex: search, $options: 'i' } },
          { 'customerInfo.email': { $regex: search, $options: 'i' } }
        ];
      }
      if (status && status !== 'all') {
        query.orderStatus = status;
      }
      if (storeId) {
        query.storeId = storeId;
      }
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('userId', 'name email phone')
          .populate('storeId', 'name city')
          .populate('deliveryInfo.assignedDelivery', 'name email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Order.countDocuments(query)
      ]);
      const totalPages = Math.ceil(total / Number(limit));
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: Number(page),
            totalPages,
            total,
            hasNextPage: Number(page) < totalPages,
            hasPrevPage: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener órdenes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Obtener estadísticas de órdenes
   */
  getOrderStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo estadísticas de órdenes...');
      const Order = require('../models/Order').default;
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({
        orderStatus: { $in: ['pending', 'confirmed', 'processing'] }
      });
      const completedOrders = await Order.countDocuments({
        orderStatus: { $in: ['delivered', 'completed'] }
      });
      const cancelledOrders = await Order.countDocuments({
        orderStatus: 'cancelled'
      });
      // Calcular ingresos totales
      const revenueResult = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
      // Calcular valor promedio de órdenes
      const avgOrderValue = totalOrders > 0 ? totalRevenue / completedOrders : 0;
      // Órdenes por estado
      const ordersByStatus = await Order.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      // Órdenes por tienda
      const ordersByStore = await Order.aggregate([
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'store'
          }
        },
        {
          $unwind: '$store'
        },
        {
          $group: {
            _id: '$store.name',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      const stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        averageOrderValue: avgOrderValue,
        ordersByStatus,
        ordersByStore
      };
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de órdenes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Actualizar estado de orden
   */
  updateOrderStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔄 Actualizando estado de orden...');
      const Order = require('../models/Order').default;
      const { orderId } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
        return;
      }
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          orderStatus: status,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('userId', 'name email')
       .populate('storeId', 'name city');
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }
      res.json({
        success: true,
        data: order,
        message: 'Estado de orden actualizado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error actualizando estado de orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar estado de orden',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Obtener reportes detallados
   */
  getReports: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo reportes detallados...');
      const Order = require('../models/Order').default;
      const { period = '30d' } = req.query;
      // Calcular fechas según el período
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      // Estadísticas de ventas
      const totalRevenue = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]);
      const salesData = totalRevenue.length > 0 ? totalRevenue[0] : { totalRevenue: 0, totalOrders: 0 };
      // Ventas por período (últimos 7 días)
      const revenueByPeriod = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      // Ventas por tienda
      const revenueByStore = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'store'
          }
        },
        {
          $unwind: '$store'
        },
        {
          $group: {
            _id: '$store.name',
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);
      // Estadísticas de usuarios
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate }
      });
      // Usuarios por rol
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      // Usuarios por período (últimos 7 días)
      const usersByPeriod = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      // Estadísticas de productos
      const totalProducts = await Product.countDocuments({ deleted: { $ne: true } });
      const activeProducts = await Product.countDocuments({
        deleted: { $ne: true },
        isActive: true
      });
      const lowStockProducts = await Product.countDocuments({
        deleted: { $ne: true },
        stock: { $lt: 10, $gt: 0 }
      });
      // Productos más vendidos
      const topSellingProducts = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $group: {
            _id: '$product.name',
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 }
      ]);
      // Productos por categoría
      const productsByCategory = await Product.aggregate([
        { $match: { deleted: { $ne: true } } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      // Estadísticas de tiendas
      const totalStores = await Store.countDocuments();
      const activeStores = await Store.countDocuments({ isActive: true });
      // Tiendas con mejor rendimiento
      const topPerformingStores = await Order.aggregate([
        {
          $match: {
            orderStatus: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'store'
          }
        },
        {
          $unwind: '$store'
        },
        {
          $group: {
            _id: '$store.name',
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);
      // Tiendas por ciudad
      const storesByCity = await Store.aggregate([
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      const reportData = {
        sales: {
          totalRevenue: salesData.totalRevenue,
          totalOrders: salesData.totalOrders,
          averageOrderValue: salesData.totalOrders > 0 ? salesData.totalRevenue / salesData.totalOrders : 0,
          revenueByPeriod: revenueByPeriod.map((item: any) => ({
            period: item._id,
            revenue: item.revenue,
            orders: item.orders
          })),
          revenueByStore: revenueByStore.map((item: any) => ({
            storeName: item._id,
            revenue: item.revenue,
            orders: item.orders
          }))
        },
        users: {
          totalUsers,
          newUsers,
          activeUsers,
          usersByRole: usersByRole.map(item => ({
            role: item._id,
            count: item.count
          })),
          usersByPeriod: usersByPeriod.map(item => ({
            period: item._id,
            count: item.count
          }))
        },
        products: {
          totalProducts,
          activeProducts,
          lowStockProducts,
          topSellingProducts: topSellingProducts.map((item: any) => ({
            productName: item._id,
            sales: item.sales,
            revenue: item.revenue
          })),
          productsByCategory: productsByCategory.map(item => ({
            category: item._id,
            count: item.count,
            revenue: 0 // Se puede calcular si es necesario
          }))
        },
        stores: {
          totalStores,
          activeStores,
          topPerformingStores: topPerformingStores.map((item: any) => ({
            storeName: item._id,
            revenue: item.revenue,
            orders: item.orders
          })),
          storesByCity: storesByCity.map(item => ({
            city: item._id,
            count: item.count
          }))
        }
      };
      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      console.error('❌ Error obteniendo reportes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reportes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  /**
   * Obtener configuraciones del sistema
   */
  getSystemSettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('⚙️ Obteniendo configuraciones del sistema...');
      // Configuraciones por defecto
      const defaultSettings = {
        general: {
          appName: 'PiezasYA',
          appVersion: '1.0.0',
          maintenanceMode: false,
          registrationEnabled: true,
          emailVerificationRequired: true
        },
        business: {
          currency: 'USD',
          taxRate: 16,
          deliveryFee: 5.00,
          minimumOrderAmount: 10.00,
          businessHours: {
            open: '08:00',
            close: '18:00'
          }
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          orderNotifications: true,
          marketingNotifications: false
        },
        security: {
          twoFactorAuth: true,
          passwordMinLength: 8,
          sessionTimeout: 30,
          maxLoginAttempts: 5
        },
        integrations: {
          googleMapsApiKey: 'AIzaSyBvOkBw3cLxN6o1I2pQrS3tUvWxYzA1bC2d',
          paymentGateway: 'Stripe',
          emailService: 'SendGrid',
          smsService: 'Twilio'
        }
      };
      res.json({
        success: true,
        data: defaultSettings
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Actualizar configuración del sistema
   */
  updateSystemSettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('⚙️ Actualizando configuración del sistema...');
      const { category, key, value } = req.body;
      if (!category || !key || value === undefined) {
        res.status(400).json({
          success: false,
          message: 'Categoría, clave y valor son requeridos'
        });
        return;
      }
      // En una implementación real, aquí guardarías en la base de datos
      // Por ahora solo confirmamos que se recibió la actualización
      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
          category,
          key,
          value
        }
      });
    } catch (error) {
      console.error('Error actualizando configuración del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Subir foto de tienda con GPS
   */
  uploadStorePhoto: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📸 Subiendo foto de tienda...');
      console.log('📋 Body:', req.body);
      console.log('📁 File:', req.file);
      console.log('👤 User:', req.user);
      console.log('🔑 Headers:', req.headers);
      
      const { name, phone, lat, lng } = req.body;
      
      if (!name || !lat || !lng) {
        res.status(400).json({
          success: false,
          message: 'Nombre, latitud y longitud son requeridos'
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se recibió ninguna imagen'
        });
        return;
      }

      // La imagen ya fue procesada por multer y subida a Cloudinary
      const imageUrl = req.file.path;
      console.log('🖼️ Imagen subida a Cloudinary:', imageUrl);
      
      // Verificar si Cloudinary está configurado
      const { secureConfig } = await import('../config/secureConfig');
      const cloudinaryConfig = secureConfig.get('cloudinary');
      
      if (!cloudinaryConfig.isConfigured) {
        console.log('⚠️ Cloudinary no está configurado, usando URL temporal');
        // Usar una URL temporal para pruebas
        const tempImageUrl = `temp_${Date.now()}_${req.file.originalname}`;
        console.log('🖼️ URL temporal:', tempImageUrl);
      }

      // Importar el modelo StorePhoto
      const StorePhoto = (await import('../models/StorePhoto')).default;
      console.log('📋 Modelo StorePhoto importado correctamente');

      // Verificar datos antes de crear el documento
      const photoData = {
        name: name.trim(),
        phone: phone?.trim() || undefined,
        imageUrl: imageUrl,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        uploadedBy: req.user?._id || req.user?.id,
        status: 'pending'
      };
      
      console.log('📋 Datos a guardar:', photoData);
      console.log('👤 Usuario ID:', req.user?._id || req.user?.id);

      // Crear el documento en la base de datos
      const storePhoto = new StorePhoto(photoData);
      console.log('📋 Documento StorePhoto creado:', storePhoto);

      try {
        const savedPhoto = await storePhoto.save();
        console.log('✅ Foto de tienda guardada exitosamente en base de datos:', savedPhoto._id);
        console.log('📋 Documento guardado completo:', savedPhoto);
      } catch (saveError) {
        console.error('❌ Error guardando en base de datos:', saveError);
        throw saveError;
      }

      res.json({
        success: true,
        message: 'Foto de tienda subida exitosamente',
        data: {
          id: storePhoto._id,
          name: storePhoto.name,
          phone: storePhoto.phone,
          location: {
            latitude: storePhoto.lat,
            longitude: storePhoto.lng
          },
          imageUrl: storePhoto.imageUrl,
          uploadedBy: storePhoto.uploadedBy,
          uploadedAt: storePhoto.createdAt,
          status: storePhoto.status
        }
      });
    } catch (error) {
      console.error('Error subiendo foto de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener fotos de tiendas
   */
  getStorePhotos: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📸 Obteniendo fotos de tiendas...');
      
      // Importar el modelo StorePhoto
      const StorePhoto = (await import('../models/StorePhoto')).default;
      
      const { page = 1, limit = 50, status } = req.query;
      
      const filter: any = {};
      if (status) {
        filter.status = status;
      }
      
      const photos = await StorePhoto.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
      
      const total = await StorePhoto.countDocuments(filter);
      
      // Transformar los datos al formato esperado por el frontend
      const transformedPhotos = photos.map(photo => ({
        id: photo._id,
        name: photo.name,
        phone: photo.phone,
        location: {
          latitude: photo.lat,
          longitude: photo.lng
        },
        imageUrl: photo.imageUrl,
        uploadedBy: photo.uploadedBy,
        uploadedAt: photo.createdAt,
        status: photo.status === 'pending' ? 'pending_processing' : 
                photo.status === 'enriched' ? 'processed' : 
                photo.status
      }));
      
      res.json({
        success: true,
        data: {
          photos: transformedPhotos,
          total: total,
          pagination: {
            current: parseInt(String(page)),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo fotos de tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener todas las tiendas
   */
  getStores: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🏪 Obteniendo tiendas...');
      const Store = require('../models/Store').default;
      const { page = 1, limit = 10, search, city, state, isActive } = req.query;
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }
      if (city && city !== 'all') {
        query.city = city;
      }
      if (state && state !== 'all') {
        query.state = state;
      }
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      const stores = await Store.find(query)
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
      const total = await Store.countDocuments(query);
      res.json({
        success: true,
        data: {
          stores,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            total,
            hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
            hasPrevPage: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Crear nueva tienda
   */
  createStore: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🏪 Creando nueva tienda...');
      const Store = require('../models/Store').default;
      const User = require('../models/User').default;
      const {
        name,
        description,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
        email,
        website,
        owner,
        managers = [],
        coordinates,
        businessHours,
        settings
      } = req.body;
      // Verificar que el propietario existe
      const ownerUser = await User.findById(owner);
      if (!ownerUser) {
        res.status(400).json({
          success: false,
          message: 'Propietario no encontrado'
        });
        return;
      }
      const store = new Store({
        name,
        description,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
        email,
        website,
        owner,
        managers,
        coordinates,
        businessHours,
        settings,
        isActive: true
      });
      await store.save();
      await store.populate('owner', 'name email');
      await store.populate('managers', 'name email');
      res.status(201).json({
        success: true,
        data: store,
        message: 'Tienda creada exitosamente'
      });
    } catch (error) {
      console.error('Error creando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Actualizar tienda
   */
  updateStore: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🏪 Actualizando tienda...');
      const Store = require('../models/Store').default;
      const { storeId } = req.params;
      const store = await Store.findByIdAndUpdate(
        storeId,
        req.body,
        { new: true, runValidators: true }
      ).populate('owner', 'name email').populate('managers', 'name email');
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      res.json({
        success: true,
        data: store,
        message: 'Tienda actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Eliminar tienda
   */
  deleteStore: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🏪 Eliminando tienda...');
      const Store = require('../models/Store').default;
      const { storeId } = req.params;
      const store = await Store.findByIdAndDelete(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      res.json({
        success: true,
        message: 'Tienda eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Cambiar estado de tienda
   */
  toggleStoreStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🏪 Cambiando estado de tienda...');
      const Store = require('../models/Store').default;
      const { storeId } = req.params;
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      store.isActive = !store.isActive;
      await store.save();
      res.json({
        success: true,
        data: store,
        message: `Tienda ${store.isActive ? 'activada' : 'desactivada'} exitosamente`
      });
    } catch (error) {
      console.error('Error cambiando estado de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener propietarios disponibles
   */
  getAvailableOwners: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('👥 Obteniendo propietarios disponibles...');
      const User = require('../models/User').default;
      const owners = await User.find({
        role: { $in: ['admin', 'store_owner'] },
        isActive: true
      }).select('name email role');
      res.json({
        success: true,
        data: owners
      });
    } catch (error) {
      console.error('Error obteniendo propietarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener managers disponibles
   */
  getAvailableManagers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('👥 Obteniendo managers disponibles...');
      const User = require('../models/User').default;
      const managers = await User.find({
        role: { $in: ['store_manager', 'admin'] },
        isActive: true
      }).select('name email role');
      res.json({
        success: true,
        data: managers
      });
    } catch (error) {
      console.error('Error obteniendo managers:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Agregar manager a tienda
   */
  addManager: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('👥 Agregando manager a tienda...');
      const Store = require('../models/Store').default;
      const User = require('../models/User').default;
      const { storeId } = req.params;
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      if (store.managers.includes(user._id)) {
        res.status(400).json({
          success: false,
          message: 'El usuario ya es manager de esta tienda'
        });
        return;
      }
      store.managers.push(user._id);
      await store.save();
      await store.populate('managers', 'name email');
      res.json({
        success: true,
        data: store,
        message: 'Manager agregado exitosamente'
      });
    } catch (error) {
      console.error('Error agregando manager:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Remover manager de tienda
   */
  removeManager: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('👥 Removiendo manager de tienda...');
      const Store = require('../models/Store').default;
      const { storeId, managerId } = req.params;
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }
      store.managers = store.managers.filter((id: any) => id.toString() !== managerId);
      await store.save();
      await store.populate('managers', 'name email');
      res.json({
        success: true,
        data: store,
        message: 'Manager removido exitosamente'
      });
    } catch (error) {
      console.error('Error removiendo manager:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener repartidores de delivery
   */
  getDeliveryDrivers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🚗 Obteniendo repartidores de delivery...');
      const User = require('../models/User').default;
      const drivers = await User.find({
        role: 'delivery',
        isActive: true
      }).select('name email phone vehicle status currentLocation rating totalDeliveries createdAt');
      res.json({
        success: true,
        data: drivers
      });
    } catch (error) {
      console.error('Error obteniendo repartidores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener pedidos de delivery
   */
  getDeliveryOrders: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📦 Obteniendo pedidos de delivery...');
      const Order = require('../models/Order').default;
      const orders = await Order.find({
        deliveryType: 'delivery'
      })
      .populate('customer', 'name phone address')
      .populate('store', 'name address')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error obteniendo pedidos de delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener estadísticas de delivery
   */
  getDeliveryStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo estadísticas de delivery...');
      const User = require('../models/User').default;
      const Order = require('../models/Order').default;
      const totalDrivers = await User.countDocuments({ role: 'delivery' });
      const activeDrivers = await User.countDocuments({ role: 'delivery', isActive: true });
      const totalDeliveries = await Order.countDocuments({ deliveryType: 'delivery' });
      const pendingDeliveries = await Order.countDocuments({
        deliveryType: 'delivery',
        status: { $in: ['pending', 'assigned'] }
      });
      const completedDeliveries = await Order.countDocuments({
        deliveryType: 'delivery',
        status: 'delivered'
      });
      res.json({
        success: true,
        data: {
          totalDrivers,
          activeDrivers,
          totalDeliveries,
          pendingDeliveries,
          completedDeliveries,
          averageDeliveryTime: 35, // Mock data
          totalRevenue: 15680.50 // Mock data
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Cambiar estado de repartidor
   */
  toggleDriverStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🚗 Cambiando estado de repartidor...');
      const User = require('../models/User').default;
      const { driverId } = req.params;
      const driver = await User.findById(driverId);
      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Repartidor no encontrado'
        });
        return;
      }
      driver.isActive = !driver.isActive;
      await driver.save();
      res.json({
        success: true,
        data: driver,
        message: `Repartidor ${driver.isActive ? 'activado' : 'desactivado'} exitosamente`
      });
    } catch (error) {
      console.error('Error cambiando estado de repartidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Asignar repartidor a pedido
   */
  assignDriver: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🚗 Asignando repartidor a pedido...');
      const Order = require('../models/Order').default;
      const { orderId } = req.params;
      const { driverId } = req.body;
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
        return;
      }
      order.driver = driverId;
      order.status = 'assigned';
      await order.save();
      await order.populate('driver', 'name phone');
      res.json({
        success: true,
        data: order,
        message: 'Repartidor asignado exitosamente'
      });
    } catch (error) {
      console.error('Error asignando repartidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Actualizar estado de pedido de delivery
   */
  updateDeliveryOrderStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📦 Actualizando estado de pedido de delivery...');
      const Order = require('../models/Order').default;
      const { orderId } = req.params;
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      ).populate('customer', 'name phone address')
       .populate('store', 'name address')
       .populate('driver', 'name phone');
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
        return;
      }
      res.json({
        success: true,
        data: order,
        message: 'Estado del pedido actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando estado de pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Obtener configuración de búsqueda
   */
  getSearchConfig: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Configuración por defecto
      const defaultConfig = {
        general: {
          enableSearch: true,
          searchTimeout: 300,
          maxResults: 50,
          enableAutocomplete: true,
          enableSuggestions: true
        },
        filters: {
          enableCategoryFilter: true,
          enablePriceFilter: true,
          enableBrandFilter: true,
          enableLocationFilter: true,
          enableRatingFilter: true
        },
        sorting: {
          defaultSortBy: 'relevance',
          enablePriceSort: true,
          enableRatingSort: true,
          enableDateSort: true,
          enableRelevanceSort: true
        },
        advanced: {
          enableFuzzySearch: true,
          enableSynonyms: true,
          enableStemming: true,
          minSearchLength: 2,
          enableSearchHistory: true
        }
      };
      res.json({
        success: true,
        data: defaultConfig
      });
    } catch (error) {
      console.error('Error obteniendo configuración de búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  /**
   * Actualizar configuración de búsqueda
   */
  updateSearchConfig: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { category, key, value } = req.body;
      if (!category || !key || value === undefined) {
        res.status(400).json({
          success: false,
          message: 'Categoría, clave y valor son requeridos'
        });
        return;
      }
      // En una implementación real, aquí guardarías en la base de datos
      // Por ahora solo confirmamos que se recibió la actualización
      res.json({
        success: true,
        message: 'Configuración de búsqueda actualizada exitosamente',
        data: {
          category,
          key,
          value
        }
      });
    } catch (error) {
      console.error('Error actualizando configuración de búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener estadísticas de fotos de tiendas
   */
  getStorePhotosStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Obteniendo estadísticas de fotos de tiendas...');
      
      // Importar el modelo StorePhoto
      const StorePhoto = (await import('../models/StorePhoto')).default;
      
      // Calcular estadísticas reales de la base de datos
      const stats = await StorePhoto.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const total = await StorePhoto.countDocuments();
      
      // Transformar las estadísticas al formato esperado
      const byStatus = {
        pending: 0,
        processing: 0,
        enriched: 0,
        error: 0
      };
      
      stats.forEach(stat => {
        if (stat._id in byStatus) {
          byStatus[stat._id as keyof typeof byStatus] = stat.count;
        }
      });
      
      const realStats = {
        total,
        byStatus,
        isRunning: false // TODO: Implementar verificación del worker
      };
      
      console.log('📊 Estadísticas calculadas:', realStats);
      res.json({
        success: true,
        data: realStats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Ejecutar proceso de enriquecimiento
   */
  runEnrichment: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔄 Iniciando proceso de enriquecimiento...');
      
      // Importar el StorePhotoController para usar la implementación real
      const StorePhotoController = (await import('./storePhotoController'));
      
      // Usar la implementación real del enriquecimiento
      await (StorePhotoController as any).runEnrichment(req, res);
      
    } catch (error) {
      console.error('Error ejecutando enriquecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener todos los productos para admin
   */
  getAllProducts: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 1000, search, category, subcategory, brand, vehicleType, storeId, status } = req.query;
      
      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category && category !== 'all') {
        filters.category = category;
      }
      
      if (subcategory && subcategory !== 'all') {
        filters.subcategory = subcategory;
      }
      
      if (brand && brand !== 'all') {
        filters.brand = brand;
      }
      
      if (vehicleType && vehicleType !== 'all') {
        filters.vehicleType = vehicleType;
      }
      
      if (storeId && storeId !== 'all') {
        filters.store = storeId;
      }
      
      if (status && status !== 'all') {
        filters.isActive = status === 'active';
      }
      
      // Optimizar consulta con select específico y populate limitado
      const products = await Product.find(filters)
        .select('name description price images category brand subcategory sku stock isActive isFeatured store createdBy createdAt updatedAt')
        .populate('store', 'name city state')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean(); // Usar lean() para mejor rendimiento
      
      // Usar countDocuments con el mismo filtro para consistencia
      const total = await Product.countDocuments(filters);
      
      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener estadísticas del vendedor
   */
  getSellerStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Obtener estadísticas del vendedor
      const totalQueries = await Quotation.countDocuments({ seller: userId });
      const successfulSales = await Quotation.countDocuments({ 
        seller: userId, 
        status: 'accepted' 
      });
      
      // Calcular tiempo promedio de respuesta (simulado por ahora)
      const averageResponseTime = 2.3; // En minutos
      
      // Calcular calificación promedio del cliente (simulado por ahora)
      const customerRating = 4.8;
      
      // Obtener mensajes sin leer (simulado por ahora)
      const unreadMessages = 0;
      
      // Obtener cotizaciones pendientes
      const pendingQuotes = await Quotation.countDocuments({ 
        seller: userId, 
        status: 'pending' 
      });
      
      // Obtener consultas de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQueries = await Quotation.countDocuments({ 
        seller: userId, 
        createdAt: { $gte: today } 
      });
      
      // Calcular ventas del mes (simulado por ahora)
      const monthlySales = 0;

      const stats = {
        totalQueries,
        successfulSales,
        averageResponseTime,
        customerRating,
        unreadMessages,
        pendingQuotes,
        todayQueries,
        monthlySales
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener carrito del usuario
   */
  getCart: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, tendrías un modelo Cart
      // Por ahora simulamos con datos mock
      const cartItems = [
        {
          _id: '1',
          product: {
            _id: 'p1',
            name: 'Filtro de Aceite Toyota',
            price: 25.99,
            image: 'https://via.placeholder.com/100',
            stock: 10,
            store: {
              _id: 'store1',
              name: 'Auto Parts Store'
            }
          },
          quantity: 2
        }
      ];

      res.json({
        success: true,
        data: cartItems
      });
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Agregar producto al carrito
   */
  addToCart: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { productId, quantity } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, agregarías el producto al carrito
      console.log(`🛒 Agregando producto ${productId} al carrito del usuario ${userId}, cantidad: ${quantity}`);
      
      res.json({
        success: true,
        message: 'Producto agregado al carrito'
      });
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Actualizar cantidad de producto en el carrito
   */
  updateCartItem: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, actualizarías la cantidad en el carrito
      console.log(`🛒 Actualizando item ${itemId} del carrito del usuario ${userId}, nueva cantidad: ${quantity}`);
      
      res.json({
        success: true,
        message: 'Cantidad actualizada'
      });
    } catch (error) {
      console.error('Error actualizando carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Eliminar producto del carrito
   */
  removeFromCart: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { itemId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, eliminarías el producto del carrito
      console.log(`🛒 Eliminando item ${itemId} del carrito del usuario ${userId}`);
      
      res.json({
        success: true,
        message: 'Producto eliminado del carrito'
      });
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Vaciar carrito
   */
  clearCart: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, vaciarías el carrito
      console.log(`🛒 Vaciando carrito del usuario ${userId}`);
      
      res.json({
        success: true,
        message: 'Carrito vaciado'
      });
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Actualizar estado del repartidor (para el propio repartidor)
   */
  updateDeliveryStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { deliveryStatus } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, actualizarías el estado del repartidor en la base de datos
      console.log(`🚚 Actualizando estado del repartidor ${userId} a: ${deliveryStatus}`);
      
      res.json({
        success: true,
        message: 'Estado actualizado correctamente',
        data: { deliveryStatus }
      });
    } catch (error) {
      console.error('Error actualizando estado del repartidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener órdenes asignadas al repartidor
   */
  getAssignedOrders: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // En una implementación real, buscarías las órdenes asignadas al repartidor
      console.log(`📦 Obteniendo órdenes asignadas al repartidor ${userId}`);
      
      // Datos mock para desarrollo
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customer: {
            name: 'Juan Pérez',
            phone: '+58 412 123 4567',
            address: 'Av. Principal, Caracas'
          },
          products: [
            { name: 'Filtro de Aceite', quantity: 2, price: 25.00 },
            { name: 'Pastillas de Freno', quantity: 1, price: 75.50 }
          ],
          total: 125.50,
          status: 'assigned',
          assignedAt: '2024-01-15T10:30:00Z',
          estimatedDelivery: '2024-01-15T12:00:00Z',
          deliveryAddress: 'Calle 5, Edificio Los Rosales, Apto 3B, Caracas',
          deliveryInstructions: 'Llamar antes de llegar',
          signature: null
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          customer: {
            name: 'María González',
            phone: '+58 414 987 6543',
            address: 'Av. Libertador, Caracas'
          },
          products: [
            { name: 'Bujía', quantity: 4, price: 15.00 },
            { name: 'Aceite Motor', quantity: 1, price: 45.00 }
          ],
          total: 105.00,
          status: 'picked_up',
          assignedAt: '2024-01-15T11:00:00Z',
          estimatedDelivery: '2024-01-15T13:30:00Z',
          deliveryAddress: 'Urbanización El Rosal, Calle 3, Casa 15',
          deliveryInstructions: 'Entregar en portería',
          signature: null
        }
      ];
      
      res.json({
        success: true,
        data: mockOrders,
        message: 'Órdenes asignadas obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo órdenes asignadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener reportes del delivery
   */
  getDeliveryReports: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { dateFrom, dateTo } = req.query;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log(`📊 Obteniendo reportes del delivery ${userId} desde ${dateFrom} hasta ${dateTo}`);
      
      // Datos mock para desarrollo
      const mockData = {
        stats: {
          totalDeliveries: 156,
          completedDeliveries: 142,
          failedDeliveries: 14,
          averageDeliveryTime: 28,
          totalEarnings: 2340.50,
          averageRating: 4.7,
          totalDistance: 1250.75,
          fuelCost: 187.50,
          netEarnings: 2153.00,
        },
        daily: [
          { date: '2024-01-15', deliveries: 8, completed: 7, failed: 1, earnings: 120.50, distance: 65.2, rating: 4.8 },
          { date: '2024-01-14', deliveries: 6, completed: 6, failed: 0, earnings: 95.25, distance: 48.7, rating: 4.9 },
          { date: '2024-01-13', deliveries: 9, completed: 8, failed: 1, earnings: 145.75, distance: 72.1, rating: 4.6 },
          { date: '2024-01-12', deliveries: 7, completed: 7, failed: 0, earnings: 112.00, distance: 58.3, rating: 4.7 },
          { date: '2024-01-11', deliveries: 5, completed: 4, failed: 1, earnings: 78.50, distance: 42.8, rating: 4.5 },
        ],
        weekly: [
          { week: 'Semana 1', totalDeliveries: 35, completedDeliveries: 32, totalEarnings: 451.00, averageRating: 4.7, totalDistance: 287.1 },
          { week: 'Semana 2', totalDeliveries: 42, completedDeliveries: 38, totalEarnings: 567.25, averageRating: 4.8, totalDistance: 345.6 },
          { week: 'Semana 3', totalDeliveries: 38, completedDeliveries: 35, totalEarnings: 512.75, averageRating: 4.6, totalDistance: 298.4 },
          { week: 'Semana 4', totalDeliveries: 41, completedDeliveries: 37, totalEarnings: 589.50, averageRating: 4.9, totalDistance: 319.7 },
        ]
      };
      
      res.json({
        success: true,
        data: mockData,
        message: 'Reportes del delivery obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo reportes del delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener calificaciones del delivery
   */
  getDeliveryRatings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log(`⭐ Obteniendo calificaciones del delivery ${userId}`);
      
      // Datos mock para desarrollo
      const mockData = {
        ratings: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customerName: 'Juan Pérez',
            rating: 5,
            comment: 'Excelente servicio, muy puntual y amable. El repartidor llegó exactamente a la hora acordada y el producto llegó en perfecto estado.',
            date: '2024-01-15T14:30:00Z',
            categories: {
              punctuality: 5,
              service: 5,
              communication: 4,
              packaging: 5
            },
            isVerified: true
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customerName: 'María González',
            rating: 4,
            comment: 'Buen servicio, llegó un poco tarde pero fue muy amable y el producto llegó bien.',
            date: '2024-01-14T16:45:00Z',
            categories: {
              punctuality: 3,
              service: 4,
              communication: 5,
              packaging: 4
            },
            isVerified: true
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            customerName: 'Carlos Rodríguez',
            rating: 5,
            comment: 'Perfecto! Muy profesional y rápido. Definitivamente lo recomiendo.',
            date: '2024-01-13T11:20:00Z',
            categories: {
              punctuality: 5,
              service: 5,
              communication: 5,
              packaging: 5
            },
            isVerified: true
          }
        ],
        stats: {
          averageRating: 4.7,
          totalRatings: 3,
          ratingDistribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 },
          categoryAverages: {
            punctuality: 4.3,
            service: 4.7,
            communication: 4.7,
            packaging: 4.7
          },
          recentTrend: 'up'
        }
      };
      
      res.json({
        success: true,
        data: mockData,
        message: 'Calificaciones del delivery obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo calificaciones del delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener configuración del delivery
   */
  getDeliverySettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log(`⚙️ Obteniendo configuración del delivery ${userId}`);
      
      // Datos mock para desarrollo
      const mockSettings = {
        schedule: {
          isAutoSchedule: false,
          workDays: [
            { day: 'monday', label: 'Lunes', isWorking: true, startTime: '08:00', endTime: '17:00' },
            { day: 'tuesday', label: 'Martes', isWorking: true, startTime: '08:00', endTime: '17:00' },
            { day: 'wednesday', label: 'Miércoles', isWorking: true, startTime: '08:00', endTime: '17:00' },
            { day: 'thursday', label: 'Jueves', isWorking: true, startTime: '08:00', endTime: '17:00' },
            { day: 'friday', label: 'Viernes', isWorking: true, startTime: '08:00', endTime: '17:00' },
            { day: 'saturday', label: 'Sábado', isWorking: false, startTime: '09:00', endTime: '15:00' },
            { day: 'sunday', label: 'Domingo', isWorking: false, startTime: '09:00', endTime: '15:00' },
          ],
          maxHoursPerDay: 8,
          maxHoursPerWeek: 40,
          timeZone: 'America/Caracas',
          notifications: {
            shiftReminder: true,
            breakReminder: true,
            endShiftReminder: true,
          }
        },
        deliveryZone: {
          center: [-66.98422315655894, 10.462530926442378],
          radius: 10
        },
        autoStatusMode: false,
        notifications: {
          newOrder: true,
          orderUpdate: true,
          ratingReceived: true,
          earningsUpdate: true
        }
      };
      
      res.json({
        success: true,
        data: mockSettings,
        message: 'Configuración del delivery obtenida correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo configuración del delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Actualizar configuración del delivery
   */
  updateDeliverySettings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const settings = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log(`⚙️ Actualizando configuración del delivery ${userId}:`, settings);
      
      // En una implementación real, actualizarías la configuración en la base de datos
      // Por ahora, solo logueamos los cambios
      
      res.json({
        success: true,
        data: settings,
        message: 'Configuración del delivery actualizada correctamente'
      });
    } catch (error) {
      console.error('Error actualizando configuración del delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Obtener ganancias del delivery
   */
  getDeliveryEarnings: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { dateFrom, dateTo } = req.query;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log(`💰 Obteniendo ganancias del delivery ${userId} desde ${dateFrom} hasta ${dateTo}`);
      
      // Datos mock para desarrollo
      const mockData = {
        earnings: {
          totalEarnings: 2840.50,
          baseEarnings: 2200.00,
          tips: 340.50,
          bonuses: 300.00,
          deductions: 0,
          netEarnings: 2840.50,
          totalDeliveries: 156,
          averagePerDelivery: 18.21,
          thisWeek: 420.75,
          lastWeek: 380.25,
          thisMonth: 1680.50,
          lastMonth: 1160.00,
        },
        payments: [
          {
            id: '1',
            date: '2024-01-15',
            amount: 420.75,
            type: 'weekly',
            description: 'Pago semanal - Semana del 8-14 Enero',
            status: 'completed',
            method: 'bank_transfer',
            reference: 'TRF-2024-001',
          },
          {
            id: '2',
            date: '2024-01-08',
            amount: 380.25,
            type: 'weekly',
            description: 'Pago semanal - Semana del 1-7 Enero',
            status: 'completed',
            method: 'bank_transfer',
            reference: 'TRF-2024-002',
          }
        ],
        commissions: [
          {
            orderId: '1',
            orderNumber: 'ORD-001',
            date: '2024-01-15',
            baseAmount: 12.50,
            tipAmount: 5.00,
            bonusAmount: 0,
            totalAmount: 17.50,
            status: 'paid',
          },
          {
            orderId: '2',
            orderNumber: 'ORD-002',
            date: '2024-01-14',
            baseAmount: 15.00,
            tipAmount: 3.00,
            bonusAmount: 2.00,
            totalAmount: 20.00,
            status: 'paid',
          }
        ]
      };
      
      res.json({
        success: true,
        data: mockData,
        message: 'Ganancias del delivery obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo ganancias del delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Guardar firma del cliente para entrega
   */
  saveDeliverySignature: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;
      const { signature, customerName, deliveryNotes } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!signature) {
        res.status(400).json({
          success: false,
          message: 'La firma es requerida'
        });
        return;
      }

      console.log(`✍️ Guardando firma del cliente para orden ${orderId} por delivery ${userId}`);
      console.log(`Cliente: ${customerName}, Firma: ${signature.substring(0, 20)}...`);
      
      // En una implementación real, guardarías la firma en la base de datos
      // Por ahora, solo logueamos los datos
      
      res.json({
        success: true,
        data: {
          orderId,
          signature,
          customerName,
          deliveryNotes,
          deliveredAt: new Date().toISOString(),
          deliveredBy: userId
        },
        message: 'Firma del cliente guardada exitosamente'
      });
    } catch (error) {
      console.error('Error guardando firma del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Eliminar foto de tienda
   */
  deleteStorePhoto: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log('🗑️ Eliminando foto de tienda:', id);
      
      // Importar el controlador de StorePhoto para usar la implementación real
      const { StorePhotoController } = await import('./storePhotoController');
      await StorePhotoController.deleteStorePhoto(req, res);
      
    } catch (error) {
      console.error('Error eliminando foto de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  /**
   * Verificar estado de la conexión a la base de datos
   */
  checkDatabaseStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔍 Verificando estado de la base de datos...');
      
      // Importar el servicio de base de datos
      const DatabaseService = (await import('../config/database')).default;
      const dbService = DatabaseService.getInstance();
      
      // Verificar estado de conexión
      const isConnected = dbService.isConnectedToDatabase();
      const connectionState = dbService.getConnectionState();
      
      console.log('📊 Estado de conexión:', { isConnected, connectionState });
      
      // Hacer health check
      const healthCheck = await dbService.healthCheck();
      console.log('🏥 Health check:', healthCheck);
      
      // Verificar mongoose
      const mongoose = (await import('mongoose')).default;
      const mongooseState = mongoose.connection.readyState;
      const mongooseStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      console.log('📊 Estado de Mongoose:', mongooseState, mongooseStates[mongooseState as keyof typeof mongooseStates]);
      
      res.json({
        success: true,
        message: 'Estado de base de datos verificado',
        data: {
          isConnected,
          connectionState,
          mongooseState: mongooseState,
          mongooseStateText: mongooseStates[mongooseState as keyof typeof mongooseStates],
          healthCheck,
          databaseName: mongoose.connection.db?.databaseName || 'No disponible'
        }
      });
    } catch (error) {
      console.error('❌ Error verificando estado de base de datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando estado de base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  /**
   * Probar conexión a base de datos y modelo StorePhoto
   */
  testDatabase: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🧪 Probando conexión a base de datos...');
      
      // Importar el modelo StorePhoto
      const StorePhoto = (await import('../models/StorePhoto')).default;
      console.log('📋 Modelo StorePhoto importado correctamente');
      
      // Probar crear un documento de prueba
      const testData = {
        name: 'Test Store',
        phone: '+584121234567',
        imageUrl: 'https://example.com/test.jpg',
        lat: 10.4806,
        lng: -66.9036,
        uploadedBy: req.user?._id || req.user?.id || '507f1f77bcf86cd799439011', // ID de prueba
        status: 'pending'
      };
      
      console.log('📋 Datos de prueba:', testData);
      
      // Crear documento de prueba
      const testPhoto = new StorePhoto(testData);
      console.log('📋 Documento de prueba creado:', testPhoto);
      
      // Intentar guardar
      const savedPhoto = await testPhoto.save();
      console.log('✅ Documento de prueba guardado exitosamente:', savedPhoto._id);
      
      // Contar documentos en la colección
      const count = await StorePhoto.countDocuments();
      console.log('📊 Total de documentos en la colección:', count);
      
      // Obtener el documento recién guardado
      const retrievedPhoto = await StorePhoto.findById(savedPhoto._id);
      console.log('📋 Documento recuperado:', retrievedPhoto);
      
      // Eliminar el documento de prueba
      await StorePhoto.findByIdAndDelete(savedPhoto._id);
      console.log('🗑️ Documento de prueba eliminado');
      
      res.json({
        success: true,
        message: 'Conexión a base de datos funcionando correctamente',
        data: {
          modelImported: true,
          documentCreated: true,
          documentSaved: true,
          documentRetrieved: !!retrievedPhoto,
          totalDocuments: count,
          testDocumentId: savedPhoto._id
        }
      });
    } catch (error) {
      console.error('❌ Error probando base de datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error en conexión a base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  },

  /**
   * Endpoint simple para probar guardado sin archivo
   */
  testSimpleSave: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🧪 Probando guardado simple sin archivo...');
      console.log('👤 User:', req.user);
      console.log('📋 Body:', req.body);
      
      const { name, phone, lat, lng } = req.body;
      
      if (!name || !lat || !lng) {
        res.status(400).json({
          success: false,
          message: 'Nombre, latitud y longitud son requeridos'
        });
        return;
      }

      // Importar el modelo StorePhoto
      const StorePhoto = (await import('../models/StorePhoto')).default;
      console.log('📋 Modelo StorePhoto importado correctamente');

      // Crear datos de prueba
      const photoData = {
        name: name.trim(),
        phone: phone?.trim() || undefined,
        imageUrl: 'https://example.com/test-image.jpg', // URL de prueba
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        uploadedBy: req.user?._id || req.user?.id,
        status: 'pending'
      };
      
      console.log('📋 Datos a guardar:', photoData);

      // Crear y guardar documento
      const storePhoto = new StorePhoto(photoData);
      const savedPhoto = await storePhoto.save();
      
      console.log('✅ Documento guardado exitosamente:', savedPhoto._id);
      
      res.json({
        success: true,
        message: 'Guardado simple exitoso',
        data: {
          id: savedPhoto._id,
          name: savedPhoto.name,
          phone: savedPhoto.phone,
          location: {
            latitude: savedPhoto.lat,
            longitude: savedPhoto.lng
          },
          imageUrl: savedPhoto.imageUrl,
          uploadedBy: savedPhoto.uploadedBy,
          uploadedAt: savedPhoto.createdAt,
          status: savedPhoto.status
        }
      });
    } catch (error) {
      console.error('❌ Error en guardado simple:', error);
      res.status(500).json({
        success: false,
        message: 'Error en guardado simple',
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  },

  /**
   * Endpoint de prueba simple para diagnosticar problemas
   */
  testEndpoint: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🧪 Endpoint de prueba ejecutado');
      console.log('👤 User:', req.user);
      console.log('📋 Body:', req.body);
      console.log('📁 File:', req.file);
      console.log('🔑 Headers:', req.headers);
      
      res.json({
        success: true,
        message: 'Endpoint de prueba funcionando',
        data: {
          user: req.user,
          hasFile: !!req.file,
          bodyKeys: Object.keys(req.body || {}),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error en endpoint de prueba:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  /**
   * Probar configuración de Cloudinary
   */
  testCloudinaryConfig: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔧 Probando configuración de Cloudinary...');
      
      // Importar configuración segura
      const { secureConfig } = await import('../config/secureConfig');
      const cloudinaryConfig = secureConfig.get('cloudinary');
      
      console.log('📋 Configuración de Cloudinary:', {
        cloudName: cloudinaryConfig.cloudName,
        apiKey: cloudinaryConfig.apiKey ? '***configurado***' : 'no configurado',
        apiSecret: cloudinaryConfig.apiSecret ? '***configurado***' : 'no configurado',
        isConfigured: cloudinaryConfig.isConfigured
      });
      
      if (!cloudinaryConfig.isConfigured) {
        res.json({
          success: false,
          message: 'Cloudinary no está configurado correctamente',
          data: {
            cloudName: cloudinaryConfig.cloudName,
            apiKey: cloudinaryConfig.apiKey,
            apiSecret: cloudinaryConfig.apiSecret,
            isConfigured: cloudinaryConfig.isConfigured,
            error: 'Faltan variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
          }
        });
        return;
      }
      
      // Probar conexión con Cloudinary
      const cloudinary = (await import('../config/cloudinary')).default;
      
      try {
        // Hacer una consulta simple para verificar la conexión
        const result = await cloudinary.api.ping();
        console.log('✅ Conexión con Cloudinary exitosa:', result);
        
        res.json({
          success: true,
          message: 'Cloudinary configurado correctamente',
          data: {
            cloudName: cloudinaryConfig.cloudName,
            isConfigured: cloudinaryConfig.isConfigured,
            connectionTest: 'success',
            pingResult: result
          }
        });
      } catch (cloudinaryError) {
        console.error('❌ Error conectando con Cloudinary:', cloudinaryError);
        res.json({
          success: false,
          message: 'Error conectando con Cloudinary',
          data: {
            cloudName: cloudinaryConfig.cloudName,
            isConfigured: cloudinaryConfig.isConfigured,
            connectionTest: 'failed',
            error: cloudinaryError instanceof Error ? cloudinaryError.message : 'Error desconocido'
          }
        });
      }
    } catch (error) {
      console.error('Error probando configuración de Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};
export default AdminController;