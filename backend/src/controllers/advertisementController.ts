import { Request, Response } from 'express';
import Advertisement, { IAdvertisement } from '../models/Advertisement';
import Store from '../models/Store';
import User from '../models/User';
import { authenticateToken } from '../middleware';

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

    const advertisements = await Advertisement.paginate(query, options);

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
      createdBy: req.user?._id
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
      advertisement.approvedBy = req.user?._id;
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

    advertisement.recordImpression(userData);
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

    advertisement.recordClick();
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
