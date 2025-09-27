import { Request, Response } from 'express';
import AdvertisingPlan, { IAdvertisingPlan } from '../models/AdvertisingPlan';
import { adminMiddleware } from '../middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Obtener todos los planes de publicidad
export const getAdvertisingPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      type,
      category,
      status,
      page = 1,
      limit = 10,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type && type !== 'all') {
      filters.type = type;
    }
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (status && status !== 'all') {
      filters.isActive = status === 'active';
    }

    // Construir opciones de ordenamiento
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);

    // Ejecutar consulta
    const plans = await AdvertisingPlan.find(filters)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await AdvertisingPlan.countDocuments(filters);

      return res.json({
      success: true,
      data: plans,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo planes de publicidad:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un plan específico
export const getAdvertisingPlanById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await AdvertisingPlan.findById(id)
      .populate('createdBy', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

      return res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error obteniendo plan de publicidad:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo plan de publicidad
export const createAdvertisingPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const planData = {
      ...req.body,
      createdBy: req.user?.id
    };

    const plan = new AdvertisingPlan(planData);
    await plan.save();

    await plan.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      data: plan,
      message: 'Plan de publicidad creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando plan de publicidad:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
    
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar plan de publicidad
export const updateAdvertisingPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await AdvertisingPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

      return res.json({
      success: true,
      data: plan,
      message: 'Plan de publicidad actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando plan de publicidad:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
    
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar plan de publicidad
export const deleteAdvertisingPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await AdvertisingPlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

      return res.json({
      success: true,
      message: 'Plan de publicidad eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando plan de publicidad:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Toggle estado del plan
export const toggleAdvertisingPlanStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await AdvertisingPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

      return res.json({
      success: true,
      data: plan,
      message: `Plan ${plan.isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error cambiando estado del plan:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de planes
export const getAdvertisingPlanStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalPlans = await AdvertisingPlan.countDocuments();
    const activePlans = await AdvertisingPlan.countDocuments({ isActive: true });
    const inactivePlans = await AdvertisingPlan.countDocuments({ isActive: false });
    
    // Calcular precio promedio
    const avgPriceResult = await AdvertisingPlan.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgPrice: { $avg: '$pricing.basePrice' } } }
    ]);
    
    const averagePrice = avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0;
    
    // Plan más popular (basado en isPopular)
    const popularPlan = await AdvertisingPlan.findOne({ isPopular: true, isActive: true })
      .select('name');
    
    // Calcular ingresos totales (simulado - en producción vendría de transacciones reales)
    const totalRevenue = await AdvertisingPlan.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$pricing.basePrice' } } }
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    // Tasa de conversión (simulada)
    const conversionRate = Math.random() * 10; // En producción vendría de datos reales

      return res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        inactivePlans,
        averagePrice: Math.round(averagePrice * 100) / 100,
        mostPopularPlan: popularPlan?.name || 'N/A',
        totalRevenue: Math.round(revenue * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de planes:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener planes activos (para tiendas)
export const getActiveAdvertisingPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, category } = req.query;

    let plans;
    
    if (type && category) {
      plans = await (AdvertisingPlan as any).getPlansByTypeAndCategory(type as string, category as string);
    } else if (type) {
      plans = await AdvertisingPlan.find({ type, isActive: true }).sort({ sortOrder: 1, priority: -1 });
    } else {
      plans = await (AdvertisingPlan as any).getActivePlans();
    }

      return res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error obteniendo planes activos:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener planes recomendados
export const getRecommendedPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await (AdvertisingPlan as any).getRecommendedPlans();

      return res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error obteniendo planes recomendados:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener planes populares
export const getPopularPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await (AdvertisingPlan as any).getPopularPlans();

      return res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error obteniendo planes populares:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar si un plan es adecuado para una tienda
export const checkPlanSuitability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, storeId } = req.params;

    const plan = await AdvertisingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

    // En una implementación real, obtendrías los datos de la tienda desde la base de datos
    const store = {
      rating: 4.5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
      category: 'automotive'
    };

    // Check if plan is suitable for store based on store type and plan requirements
    const planData = plan as any;
    const storeData = store as any;
    
    const suitability = {
      isSuitable: (planData.storeTypes || []).includes(storeData.storeType || 'general') && 
                  (planData.minRevenue || 0) <= (storeData.monthlyRevenue || 0) &&
                  (planData.maxRevenue || 999999) >= (storeData.monthlyRevenue || 0),
      reasons: [] as string[]
    };
    
    if (!(planData.storeTypes || []).includes(storeData.storeType || 'general')) {
      suitability.reasons.push(`Plan requires store type: ${(planData.storeTypes || []).join(', ')}`);
    }
    if ((planData.minRevenue || 0) > (storeData.monthlyRevenue || 0)) {
      suitability.reasons.push(`Plan requires minimum revenue: $${planData.minRevenue || 0}`);
    }
    if ((planData.maxRevenue || 999999) < (storeData.monthlyRevenue || 0)) {
      suitability.reasons.push(`Plan maximum revenue exceeded: $${planData.maxRevenue || 999999}`);
    }

      return res.json({
      success: true,
      data: suitability
    });
  } catch (error) {
    console.error('Error verificando adecuación del plan:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Duplicar plan
export const duplicateAdvertisingPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const originalPlan = await AdvertisingPlan.findById(id);
    if (!originalPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de publicidad no encontrado'
      });
    }

    const planData = originalPlan.toObject();
    delete planData._id;
    delete (planData as any).createdAt;
    delete (planData as any).updatedAt;
    
    planData.name = `${planData.name} (Copia)`;
    planData.isActive = false;
    planData.createdBy = req.user?.id;

    const newPlan = new AdvertisingPlan(planData);
    await newPlan.save();

    await newPlan.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      data: newPlan,
      message: 'Plan duplicado exitosamente'
    });
  } catch (error) {
    console.error('Error duplicando plan:', error);
      return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
