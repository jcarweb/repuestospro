import express from 'express';
import { authMiddleware as authenticateToken, adminMiddleware as requireAdmin } from '../middleware/authMiddleware';
import Store from '../models/Store';
import Product from '../models/Product';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
import { SubscriptionService } from '../services/subscriptionService';
import emailService from '../services/emailService';
import crypto from 'crypto';
import { getRandomImages } from '../data/repuestoImages';
import cloudinaryCleanupService from '../services/cloudinaryCleanupService';
import imageService from '../services/imageService';

// AdminController definido directamente en este archivo para evitar problemas de importación
class AdminController {
  // Métodos simplificados del AdminController
  static async getUsers(req: any, res: any) {
    try {
      const users = await User.find().select('-password').populate('storeId', 'name address');
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
  }

  static async getUser(req: any, res: any) {
    try {
      const user = await User.findById(req.params.id).select('-password').populate('storeId', 'name address');
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener usuario' });
    }
  }

  static async createUser(req: any, res: any) {
    try {
      const { name, email, password, role, storeId } = req.body;
      const user = new User({ name, email, password, role, storeId });
      await user.save();
      res.status(201).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear usuario' });
    }
  }

  static async updateUser(req: any, res: any) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
    }
  }

  static async deactivateUser(req: any, res: any) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, message: 'Usuario desactivado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al desactivar usuario' });
    }
  }

  static async reactivateUser(req: any, res: any) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, message: 'Usuario reactivado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al reactivar usuario' });
    }
  }

  // Métodos simplificados para otras funcionalidades
  static async generateStores(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de generación de tiendas no implementada' });
  }

  static async getStoreStats(req: any, res: any) {
    try {
      const totalStores = await Store.countDocuments();
      const activeStores = await Store.countDocuments({ isActive: true });
      res.json({ success: true, stats: { totalStores, activeStores } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  static async getStoreSubscriptions(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de suscripciones no implementada' });
  }

  static async assignSubscriptionToStore(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de asignación no implementada' });
  }

  static async updateStoreSubscriptionStatus(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de actualización no implementada' });
  }

  static async getSubscriptionStats(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de estadísticas no implementada' });
  }

  static async getStoresNeedingRenewal(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de renovación no implementada' });
  }

  static async generateProducts(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de generación no implementada' });
  }

  static async regenerateProductsWithRealImages(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de regeneración no implementada' });
  }

  static async findProductsByLocation(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de búsqueda no implementada' });
  }

  static async getProductStats(req: any, res: any) {
    try {
      const totalProducts = await Product.countDocuments();
      res.json({ success: true, stats: { totalProducts } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  static async cleanupAllTestImages(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de limpieza no implementada' });
  }

  static async cleanupCloudinaryFolder(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de limpieza no implementada' });
  }

  static async getCloudinaryStats(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de estadísticas no implementada' });
  }

  static async getUserStats(req: any, res: any) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      res.json({ success: true, stats: { totalUsers, activeUsers } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  static async resetUserPassword(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de reset no implementada' });
  }

  static async checkEmailConfig(req: any, res: any) {
    res.json({ success: true, message: 'Funcionalidad de email no implementada' });
  }

  static async getDashboardStats(req: any, res: any) {
    try {
      const totalUsers = await User.countDocuments();
      const totalStores = await Store.countDocuments();
      const totalProducts = await Product.countDocuments();
      res.json({ 
        success: true, 
        stats: { 
          totalUsers, 
          totalStores, 
          totalProducts 
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }
}

const router = express.Router();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticateToken, requireAdmin);

// ===== GESTIÓN DE USUARIOS =====

// Obtener todos los usuarios
router.get('/users', AdminController.getUsers);

// Obtener usuario por ID
router.get('/users/:id', AdminController.getUser);

// Crear nuevo usuario
router.post('/users', AdminController.createUser);

// Actualizar usuario
router.put('/users/:id', AdminController.updateUser);

// Desactivar usuario
router.patch('/users/:id/deactivate', AdminController.deactivateUser);

// Reactivar usuario
router.patch('/users/:id/reactivate', AdminController.reactivateUser);

// ===== GESTIÓN DE TIENDAS =====

// Generar tiendas de prueba
router.post('/stores/generate', AdminController.generateStores);

// Obtener estadísticas de tiendas
router.get('/stores/stats', AdminController.getStoreStats);

// ===== GESTIÓN DE SUSCRIPCIONES DE TIENDAS =====

// Obtener todas las tiendas con sus suscripciones
router.get('/store-subscriptions', AdminController.getStoreSubscriptions);

// Asignar suscripción a una tienda
router.put('/store-subscriptions/:storeId/assign', AdminController.assignSubscriptionToStore);

// Actualizar estado de suscripción de una tienda
router.put('/store-subscriptions/:storeId/status', AdminController.updateStoreSubscriptionStatus);

// Obtener estadísticas de suscripciones
router.get('/subscription-stats', AdminController.getSubscriptionStats);

// Obtener tiendas que necesitan renovación
router.get('/stores-needing-renewal', AdminController.getStoresNeedingRenewal);

// ===== GESTIÓN DE PRODUCTOS =====

// Generar productos de prueba
router.post('/products/generate', AdminController.generateProducts);

// Regenerar productos con imágenes reales (método de prueba)
router.post('/products/regenerate-images', AdminController.regenerateProductsWithRealImages);

// Buscar productos por ubicación
router.get('/products/by-location', AdminController.findProductsByLocation);

// Obtener estadísticas de productos
router.get('/products/stats', AdminController.getProductStats);

// ===== GESTIÓN DE CLOUDINARY =====

// Limpiar todas las imágenes de productos de prueba
router.delete('/cloudinary/cleanup-all-images', AdminController.cleanupAllTestImages);

// Limpiar carpeta específica de Cloudinary
router.delete('/cloudinary/cleanup-folder', AdminController.cleanupCloudinaryFolder);

// Obtener estadísticas de uso de Cloudinary
router.get('/cloudinary/stats', AdminController.getCloudinaryStats);

// ===== GESTIÓN DE USUARIOS ADICIONALES =====

// Obtener estadísticas de usuarios
router.get('/users/stats', AdminController.getUserStats);

// Resetear contraseña de usuario
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

// Verificar configuración de email
router.get('/email-config', AdminController.checkEmailConfig);

// Endpoint para limpiar datos de prueba
router.delete('/clean-test-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testStoreNames = [
      'AutoParts Express',
      'Mega Repuestos', 
      'Super Auto Parts',
      'Elite Repuestos',
      'Premium Auto Parts'
    ];

    // Buscar tiendas de prueba
    const testStores = await Store.find({ name: { $in: testStoreNames } });
    const testStoreIds = testStores.map(store => store._id);

    if (testStoreIds.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron tiendas de prueba para eliminar',
        deletedStores: 0,
        deletedProducts: 0
      });
    }

    // Eliminar productos de estas tiendas
    const deletedProducts = await Product.deleteMany({ store: { $in: testStoreIds } });
    
    // Eliminar las tiendas de prueba
    const deletedStores = await Store.deleteMany({ _id: { $in: testStoreIds } });

    // Obtener tiendas restantes
    const remainingStores = await Store.find({}).select('name city state isActive');

    res.json({
      success: true,
      message: 'Datos de prueba eliminados exitosamente',
      deletedStores: deletedStores.deletedCount,
      deletedProducts: deletedProducts.deletedCount,
      remainingStores: remainingStores
    });

  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al limpiar datos de prueba'
    });
  }
});

// ===== ESTADÍSTICAS Y REPORTES =====

// Obtener estadísticas generales del dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Obtener estadísticas de tiendas
router.get('/store-stats', AdminController.getStoreStats);

// Las estadísticas están disponibles en las rutas específicas:
// - /users/stats para estadísticas de usuarios
// - /products/stats para estadísticas de productos
// - /subscription-stats para estadísticas de suscripciones

export default router; 