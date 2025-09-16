import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Advertisement, { IAdvertisement } from '../models/Advertisement';
import Store from '../models/Store';
import User from '../models/User';
import { authenticateToken } from '../middleware';
import { SubscriptionService } from '../services/subscriptionService';

// Obtener todas las publicidades (solo admin)
export const getAllAdvertisements = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      store, 
      displayType, 
      targetPlatform,
      search 
    } = req.query;

    const query: any = {};

    // Filtros
    if (status) query.status = status;
    if (store) query.store = store;
    if (displayType) query.displayType = displayType;
    if (targetPlatform) query.targetPlatform = targetPlatform;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      populate: [
        { path: 'store', select: 'name address city state' },
        { path: 'createdBy', select: 'name email' },
        { path: 'approvedBy', select: 'name email' }
      ],
      sort: { createdAt: -1 }
    };

    const advertisements = await (Advertisement as any).paginate(query, options);

    res.json({
      success: true,
      data: advertisements.docs,
      pagination: {
        total: advertisements.totalDocs,
        page: advertisements.page,
        pages: advertisements.totalPages,
        limit: advertisements.limit
      }
    });
  } catch (error) {
    console.error('Error getting advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar acceso a publicidad
export const checkAdvertisingAccess = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de tienda requerido'
      });
    }

    const advertisingAccess = await SubscriptionService.hasPremiumAccess(storeId as string, 'advertising');
    
    res.json({
      success: true,
      hasAccess: advertisingAccess.hasAccess,
      reason: advertisingAccess.reason,
      subscription: advertisingAccess.subscription,
      requiresUpgrade: !advertisingAccess.hasAccess
    });
  } catch (error) {
    console.error('Error checking advertising access:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener publicidad por ID
export const getAdvertisementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id)
      .populate('store', 'name address city state')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    res.json({
      success: true,
      data: advertisement
    });
  } catch (error) {
    console.error('Error getting advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva publicidad
export const createAdvertisement = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      content,
      imageUrl,
      videoUrl,
      navigationUrl,
      store,
      displayType,
      targetPlatform,
      targetAudience,
      schedule,
      displaySettings
    } = req.body;

    // Validar que la tienda existe
    const storeExists = await Store.findById(store);
    if (!storeExists) {
      return res.status(400).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    // Verificar acceso a publicidad según el plan de suscripción
    const advertisingAccess = await SubscriptionService.hasPremiumAccess(store, 'advertising');
    if (!advertisingAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message: advertisingAccess.reason || 'Acceso a publicidad no disponible en tu plan actual',
        requiresUpgrade: true,
        subscription: advertisingAccess.subscription
      });
    }

    const advertisement = new Advertisement({
      title,
      description,
      content,
      imageUrl,
      videoUrl,
      navigationUrl,
      store,
      displayType,
      targetPlatform,
      targetAudience,
      schedule,
      displaySettings,
      createdBy: (req as AuthenticatedRequest).user?._id
    });

    await advertisement.save();

    const populatedAdvertisement = await Advertisement.findById(advertisement._id)
      .populate('store', 'name address city state')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAdvertisement,
      message: 'Publicidad creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar publicidad
export const updateAdvertisement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔍 Actualizando publicidad:', id);
    console.log('📊 Datos de actualización:', updateData);

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      console.log('❌ Publicidad no encontrada:', id);
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    console.log('✅ Publicidad encontrada:', advertisement.title);

    // Verificar si la publicidad está activa
    if (advertisement.status === 'active') {
      console.log('❌ No se puede editar una publicidad activa');
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una publicidad que está activa. Debes pausarla o cambiar su estado primero.'
      });
    }

    // Permitir actualizar todos los campos excepto el estado
    let dataToUpdate = { ...updateData };
    
    // No permitir cambiar el estado directamente desde aquí
    delete dataToUpdate.status;
    
    console.log('✅ Aplicando cambios:', Object.keys(dataToUpdate));
    console.log('📝 Datos a aplicar:', dataToUpdate);

    // Usar findByIdAndUpdate en lugar de Object.assign
    const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
      id,
      dataToUpdate,
      { new: true, runValidators: true }
    )
      .populate('store', 'name address city state')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    console.log('✅ Publicidad actualizada exitosamente');

    console.log('✅ Publicidad actualizada y poblada:', updatedAdvertisement.title);
    console.log('📊 Datos finales:', JSON.stringify(updatedAdvertisement, null, 2));

    res.json({
      success: true,
      data: updatedAdvertisement,
      message: 'Publicidad actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar publicidad
export const deleteAdvertisement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    // Solo permitir eliminar si está en borrador o rechazada
    if (advertisement.status !== 'draft' && advertisement.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una publicidad que no esté en borrador o rechazada'
      });
    }

    await Advertisement.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Publicidad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar estado de publicidad
export const changeAdvertisementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    advertisement.status = status;
    
    if (status === 'approved') {
      advertisement.approvedBy = new mongoose.Types.ObjectId((req as AuthenticatedRequest).user?._id);
      advertisement.approvedAt = new Date();
    } else if (status === 'rejected') {
      advertisement.rejectionReason = rejectionReason;
    }

    await advertisement.save();

    const updatedAdvertisement = await Advertisement.findById(id)
      .populate('store', 'name address city state')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      data: updatedAdvertisement,
      message: `Estado de publicidad cambiado a ${status}`
    });
  } catch (error) {
    console.error('Error changing advertisement status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de publicidad
export const getAdvertisementStats = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // días
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Estadísticas generales
    const totalAdvertisements = await Advertisement.countDocuments();
    const activeAdvertisements = await Advertisement.countDocuments({ 
      status: 'active',
      'displaySettings.isActive': true 
    });
    const pendingApproval = await Advertisement.countDocuments({ status: 'pending' });
    const draftAdvertisements = await Advertisement.countDocuments({ status: 'draft' });

    // Estadísticas por tipo de display
    const displayTypeStats = await Advertisement.aggregate([
      { $group: { _id: '$displayType', count: { $sum: 1 } } }
    ]);

    // Estadísticas por plataforma
    const platformStats = await Advertisement.aggregate([
      { $group: { _id: '$targetPlatform', count: { $sum: 1 } } }
    ]);

    // Estadísticas de rendimiento
    const performanceStats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$tracking.impressions' },
          totalClicks: { $sum: '$tracking.clicks' },
          totalConversions: { $sum: '$tracking.conversions' },
          totalRevenue: { $sum: '$tracking.revenue' },
          avgCTR: { $avg: '$tracking.ctr' }
        }
      }
    ]);

    // Anuncios más populares
    const topAdvertisements = await Advertisement.find()
      .sort({ 'tracking.impressions': -1 })
      .limit(5)
      .populate('store', 'name')
      .select('title tracking.impressions tracking.clicks tracking.ctr');

    // Anuncios por estado
    const statusStats = await Advertisement.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalAdvertisements,
          active: activeAdvertisements,
          pending: pendingApproval,
          draft: draftAdvertisements
        },
        displayTypes: displayTypeStats,
        platforms: platformStats,
        performance: performanceStats[0] || {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          avgCTR: 0
        },
        topAdvertisements,
        statusBreakdown: statusStats
      }
    });
  } catch (error) {
    console.error('Error getting advertisement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener publicidades activas para mostrar en la app
export const getActiveAdvertisements = async (req: Request, res: Response) => {
  try {
    const { 
      platform, 
      displayType, 
      userRole, 
      loyaltyLevel, 
      location,
      deviceType,
      operatingSystem,
      ageRange,
      interests 
    } = req.query;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.getDay();

    // Construir query para publicidades activas
    const query: any = {
      status: 'active',
      'displaySettings.isActive': true,
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    };

    // Filtro por plataforma
    if (platform) {
      query.$or = [
        { targetPlatform: 'both' },
        { targetPlatform: platform }
      ];
    }

    // Filtro por tipo de display
    if (displayType) {
      query.displayType = displayType;
    }

    // Filtro por audiencia objetivo
    if (userRole) {
      query['targetAudience.userRoles'] = { $in: [userRole] };
    }

    if (loyaltyLevel) {
      query['targetAudience.loyaltyLevels'] = { $in: [loyaltyLevel] };
    }

    if (location) {
      query['targetAudience.locations'] = { $in: [location] };
    }

    if (deviceType) {
      query['targetAudience.deviceTypes'] = { $in: [deviceType] };
    }

    if (operatingSystem) {
      query['targetAudience.operatingSystems'] = { $in: [operatingSystem] };
    }

    if (ageRange) {
      query['targetAudience.ageRanges'] = { $in: [ageRange] };
    }

    if (interests) {
      const interestArray = (interests as string).split(',');
      query['targetAudience.interests'] = { $in: interestArray };
    }

    const advertisements = await Advertisement.find(query)
      .populate('store', 'name address city state')
      .sort({ 'displaySettings.priority': -1, createdAt: -1 })
      .limit(10);

    // Filtrar por horario y días de la semana
    const filteredAdvertisements = advertisements.filter(ad => {
      // Verificar horario general
      if (currentTime < ad.schedule.startTime || currentTime > ad.schedule.endTime) {
        return false;
      }

      // Verificar días de la semana
      if (ad.schedule.daysOfWeek.length > 0 && !ad.schedule.daysOfWeek.includes(currentDay)) {
        return false;
      }

      // Verificar slots de tiempo específicos
      if (ad.schedule.timeSlots.length > 0) {
        const isInTimeSlot = ad.schedule.timeSlots.some(slot => 
          currentTime >= slot.start && currentTime <= slot.end
        );
        if (!isInTimeSlot) {
          return false;
        }
      }

      return true;
    });

    res.json({
      success: true,
      data: filteredAdvertisements
    });
  } catch (error) {
    console.error('Error getting active advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Registrar impresión de publicidad
export const recordImpression = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    // Verificar límites
    if (advertisement.displaySettings.maxImpressions > 0 && 
        advertisement.displaySettings.currentImpressions >= advertisement.displaySettings.maxImpressions) {
      return res.status(400).json({
        success: false,
        message: 'Límite de impresiones alcanzado'
      });
    }

    (advertisement as any).recordImpression(userData);
    await advertisement.save();

    res.json({
      success: true,
      message: 'Impresión registrada exitosamente'
    });
  } catch (error) {
    console.error('Error recording impression:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Registrar click de publicidad
export const recordClick = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Publicidad no encontrada'
      });
    }

    // Verificar límites
    if (advertisement.displaySettings.maxClicks > 0 && 
        advertisement.displaySettings.currentClicks >= advertisement.displaySettings.maxClicks) {
      return res.status(400).json({
        success: false,
        message: 'Límite de clicks alcanzado'
      });
    }

    (advertisement as any).recordClick();
    await advertisement.save();

    res.json({
      success: true,
      message: 'Click registrado exitosamente'
    });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener datos de Google Analytics para segmentación
export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    // Aquí se integraría con Google Analytics API
    // Por ahora retornamos datos de ejemplo
    const analyticsData = {
      deviceBreakdown: {
        android: 65,
        ios: 35
      },
      locationBreakdown: {
        'Caracas': 45,
        'Valencia': 25,
        'Maracaibo': 20,
        'Barquisimeto': 10
      },
      userSegmentBreakdown: {
        'client': 80,
        'store_manager': 15,
        'delivery': 5
      },
      timeBreakdown: {
        '9': 15,
        '10': 20,
        '11': 25,
        '12': 30,
        '13': 25,
        '14': 20,
        '15': 18,
        '16': 22,
        '17': 28,
        '18': 35,
        '19': 30,
        '20': 25
      },
      interests: [
        'Automóviles',
        'Motos',
        'Camiones',
        'Repuestos',
        'Aceites',
        'Llantas',
        'Herramientas',
        'Accesorios'
      ]
    };

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 🚀 MODELO HÍBRIDO - Nuevas funciones para publicidad autogestionada y premium

// Obtener plantillas de publicidad disponibles
export const getAdvertisementTemplates = async (req: Request, res: Response) => {
  try {
    const { category, type } = req.query;
    const AdvertisementTemplate = require('../models/AdvertisementTemplate').default;
    
    const query: any = { isActive: true };
    if (category) query.category = category;
    if (type) query.type = type;

    const templates = await AdvertisementTemplate.find(query)
      .sort({ isDefault: -1, name: 1 });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting advertisement templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear publicidad autogestionada (Nivel 1)
export const createSelfManagedAdvertisement = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?._id;
    const userRole = (req as AuthenticatedRequest).user?.role;
    const advertisementData = req.body;

    // Validar datos requeridos para publicidad autogestionada
    if (!advertisementData.title || !advertisementData.templateId || !advertisementData.store) {
      return res.status(400).json({
        success: false,
        message: 'Título, plantilla y tienda son requeridos'
      });
    }

    // Verificar acceso a publicidad
    const advertisingAccess = await SubscriptionService.hasPremiumAccess(advertisementData.store, 'advertising');
    if (!advertisingAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message: advertisingAccess.reason || 'No tienes acceso a publicidad',
        subscription: advertisingAccess.subscription,
        requiresUpgrade: true
      });
    }

    // Obtener la plantilla
    const AdvertisementTemplate = require('../models/AdvertisementTemplate').default;
    const template = await AdvertisementTemplate.findById(advertisementData.templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Configurar datos de la publicidad autogestionada
    const selfManagedData = {
      ...advertisementData,
      advertisingLevel: 'self_managed',
      templateId: advertisementData.templateId,
      selfManagedConfig: {
        template: template.type,
        colors: advertisementData.colors || template.defaultColors,
        duration: advertisementData.duration || template.minDuration,
        zones: advertisementData.zones || template.zones,
        productId: advertisementData.productId
      },
      status: 'pending', // Requiere aprobación automática
      createdBy: userId
    };

    const advertisement = new Advertisement(selfManagedData);
    await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Publicidad autogestionada creada exitosamente',
      data: advertisement
    });
  } catch (error) {
    console.error('Error creating self-managed advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Solicitar publicidad premium gestionada (Nivel 2)
export const requestPremiumAdvertisement = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?._id;
    const advertisementData = req.body;

    // Validar datos requeridos para publicidad premium
    if (!advertisementData.title || !advertisementData.requirements || !advertisementData.store) {
      return res.status(400).json({
        success: false,
        message: 'Título, requerimientos y tienda son requeridos'
      });
    }

    // Verificar acceso a publicidad
    const advertisingAccess = await SubscriptionService.hasPremiumAccess(advertisementData.store, 'advertising');
    if (!advertisingAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message: advertisingAccess.reason || 'No tienes acceso a publicidad',
        subscription: advertisingAccess.subscription,
        requiresUpgrade: true
      });
    }

    // Configurar datos de la publicidad premium
    const premiumData = {
      ...advertisementData,
      advertisingLevel: 'premium_managed',
      premiumManagedConfig: {
        campaignType: advertisementData.campaignType,
        requirements: advertisementData.requirements,
        budget: advertisementData.budget,
        targetAudience: advertisementData.targetAudience,
        specialFeatures: advertisementData.specialFeatures || []
      },
      status: 'pending', // Requiere revisión manual
      createdBy: userId
    };

    const advertisement = new Advertisement(premiumData);
    await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Solicitud de publicidad premium enviada exitosamente',
      data: advertisement
    });
  } catch (error) {
    console.error('Error requesting premium advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener productos disponibles para publicidad autogestionada
export const getAvailableProductsForAdvertising = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    const Product = require('../models/Product').default;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de tienda requerido'
      });
    }

    const products = await Product.find({ 
      store: storeId, 
      isActive: true 
    })
    .select('name price originalPrice image sku category')
    .populate('category', 'name')
    .limit(50);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting available products:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Calcular precio de publicidad autogestionada
export const calculateSelfManagedPrice = async (req: Request, res: Response) => {
  try {
    const { templateId, duration } = req.body;

    if (!templateId || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Plantilla y duración son requeridos'
      });
    }

    const AdvertisementTemplate = require('../models/AdvertisementTemplate').default;
    const template = await AdvertisementTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    const totalPrice = template.pricing.basePrice + (template.pricing.pricePerDay * duration);

    res.json({
      success: true,
      data: {
        basePrice: template.pricing.basePrice,
        pricePerDay: template.pricing.pricePerDay,
        duration,
        totalPrice,
        currency: template.pricing.currency
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 🚀 GESTIÓN DE SOLICITUDES - Funciones para el administrador

// Obtener todas las solicitudes de publicidad (para admin)
export const getAdvertisementRequests = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      level, 
      priority,
      search 
    } = req.query;

    const query: any = {};

    // Filtros
    if (status) query.status = status;
    if (level) query.advertisingLevel = level;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'store.name': { $regex: search, $options: 'i' } },
        { 'createdBy.name': { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      populate: [
        { path: 'store', select: 'name address city state' },
        { path: 'createdBy', select: 'name email phone' },
        { path: 'assignedTo', select: 'name email' }
      ],
      sort: { 
        priority: -1, // Urgente primero
        createdAt: -1 
      }
    };

    const requests = await (Advertisement as any).paginate(query, options);

    res.json({
      success: true,
      data: requests.docs,
      pagination: {
        total: requests.totalDocs,
        page: requests.page,
        pages: requests.totalPages,
        limit: requests.limit
      }
    });
  } catch (error) {
    console.error('Error getting advertisement requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Aprobar solicitud de publicidad
export const approveAdvertisementRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = (req as AuthenticatedRequest).user?._id;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    advertisement.status = 'approved';
    advertisement.approvedBy = new mongoose.Types.ObjectId(adminId);
    advertisement.approvedAt = new Date();
    
    if (notes) {
      advertisement.notes = advertisement.notes || [];
      advertisement.notes.push(`Aprobado por admin: ${notes}`);
    }

    await advertisement.save();

    res.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
      data: advertisement
    });
  } catch (error) {
    console.error('Error approving advertisement request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Rechazar solicitud de publicidad
export const rejectAdvertisementRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;
    const adminId = (req as AuthenticatedRequest).user?._id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo del rechazo es requerido'
      });
    }

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    advertisement.status = 'rejected';
    advertisement.rejectionReason = rejectionReason;
    advertisement.approvedBy = new mongoose.Types.ObjectId(adminId);
    advertisement.approvedAt = new Date();
    
    if (notes) {
      advertisement.notes = advertisement.notes || [];
      advertisement.notes.push(`Rechazado por admin: ${notes}`);
    }

    await advertisement.save();

    res.json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      data: advertisement
    });
  } catch (error) {
    console.error('Error rejecting advertisement request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Asignar solicitud de publicidad
export const assignAdvertisementRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo, estimatedCompletion, notes } = req.body;
    const adminId = (req as AuthenticatedRequest).user?._id;

    if (!assignedTo || !estimatedCompletion) {
      return res.status(400).json({
        success: false,
        message: 'Responsable y fecha estimada son requeridos'
      });
    }

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    advertisement.status = 'in_progress';
    advertisement.assignedTo = assignedTo;
    advertisement.estimatedCompletion = new Date(estimatedCompletion);
    advertisement.approvedBy = new mongoose.Types.ObjectId(adminId);
    advertisement.approvedAt = new Date();
    
    if (notes) {
      advertisement.notes = advertisement.notes || [];
      advertisement.notes.push(`Asignado por admin: ${notes}`);
    }

    await advertisement.save();

    res.json({
      success: true,
      message: 'Solicitud asignada exitosamente',
      data: advertisement
    });
  } catch (error) {
    console.error('Error assigning advertisement request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar solicitud como completada
export const completeAdvertisementRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = (req as AuthenticatedRequest).user?._id;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    advertisement.status = 'completed';
    advertisement.approvedBy = new mongoose.Types.ObjectId(adminId);
    advertisement.approvedAt = new Date();
    
    if (notes) {
      advertisement.notes = advertisement.notes || [];
      advertisement.notes.push(`Completado por admin: ${notes}`);
    }

    await advertisement.save();

    res.json({
      success: true,
      message: 'Solicitud marcada como completada',
      data: advertisement
    });
  } catch (error) {
    console.error('Error completing advertisement request:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
