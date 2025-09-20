import { Request, Response } from 'express';
import Rider, { IRider } from '../models/Rider';
import User from '../models/User';
import * as argon2 from 'argon2';

export class RiderController {
  
  /**
   * Crear un nuevo rider
   */
  static async createRider(req: Request, res: Response) {
    try {
      const {
        type,
        firstName,
        lastName,
        email,
        phone,
        idNumber,
        dateOfBirth,
        vehicle,
        documents,
        serviceAreas,
        externalProvider,
        assignmentConfig
      } = req.body;

      // Verificar si el email ya existe
      const existingRider = await Rider.findOne({ email });
      if (existingRider) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Verificar si el número de identificación ya existe
      const existingId = await Rider.findOne({ idNumber });
      if (existingId) {
        return res.status(400).json({ message: 'El número de identificación ya está registrado' });
      }

      // Crear el rider
      const rider = new Rider({
        type,
        firstName,
        lastName,
        email,
        phone,
        idNumber,
        dateOfBirth: new Date(dateOfBirth),
        vehicle,
        documents,
        serviceAreas,
        externalProvider,
        assignmentConfig
      });

      // Si es rider interno, crear usuario asociado
      if (type === 'internal') {
        const user = new User({
          firstName,
          lastName,
          email,
          phone,
          role: 'rider',
          password: await argon2.hash('123456'), // Contraseña temporal
          isActive: true
        });

        await user.save();
        rider.userId = user._id;
      }

      await rider.save();

      res.status(201).json({
        success: true,
        data: rider,
        message: 'Rider creado exitosamente'
      });

    } catch (error) {
      console.error('Error creando rider:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener todos los riders con filtros
   */
  static async getRiders(req: Request, res: Response) {
    try {
      const {
        type,
        status,
        storeId,
        page = 1,
        limit = 20,
        search
      } = req.query;

      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;

      // Búsqueda por nombre, email o teléfono
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const riders = await Rider.find(filter)
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Rider.countDocuments(filter);

      res.json({
        success: true,
        data: riders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error obteniendo riders:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener un rider específico
   */
  static async getRider(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const rider = await Rider.findById(id)
        .populate('userId');

      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      res.json({
        success: true,
        data: rider
      });

    } catch (error) {
      console.error('Error obteniendo rider:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar rider
   */
  static async updateRider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      // Verificar email único si se está actualizando
      if (updateData.email && updateData.email !== rider.email) {
        const existingRider = await Rider.findOne({ email: updateData.email });
        if (existingRider) {
          return res.status(400).json({ message: 'El email ya está registrado' });
        }
      }

      // Verificar ID único si se está actualizando
      if (updateData.idNumber && updateData.idNumber !== rider.idNumber) {
        const existingId = await Rider.findOne({ idNumber: updateData.idNumber });
        if (existingId) {
          return res.status(400).json({ message: 'El número de identificación ya está registrado' });
        }
      }

      // Actualizar rider
      Object.assign(rider, updateData);
      await rider.save();

      res.json({
        success: true,
        data: rider,
        message: 'Rider actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando rider:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar estado del rider
   */
  static async updateRiderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      await rider.updateStatus(status, reason, req.user?.email);

      res.json({
        success: true,
        data: rider,
        message: `Estado actualizado a: ${status}`
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar disponibilidad del rider
   */
  static async updateRiderAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isOnline, isAvailable, currentLocation } = req.body;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      rider.availability.isOnline = isOnline;
      rider.availability.isAvailable = isAvailable;
      
      if (currentLocation) {
        rider.availability.currentLocation = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          timestamp: new Date()
        };
      }

      await rider.save();

      res.json({
        success: true,
        data: rider,
        message: 'Disponibilidad actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener estadísticas del rider
   */
  static async getRiderStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dateFrom, dateTo } = req.query;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      // Aquí se pueden agregar cálculos adicionales de estadísticas
      // basados en los deliveries del rider

      res.json({
        success: true,
        data: {
          rider,
          stats: rider.stats,
          rating: rider.rating
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener estadísticas generales de riders
   */
  static async getRidersStats(req: Request, res: Response) {
    try {
      const [
        totalRiders,
        activeRiders,
        internalRiders,
        externalRiders,
        onlineRiders,
        availableRiders
      ] = await Promise.all([
        Rider.countDocuments(),
        Rider.countDocuments({ status: 'active' }),
        Rider.countDocuments({ type: 'internal' }),
        Rider.countDocuments({ type: 'external' }),
        Rider.countDocuments({ 'availability.isOnline': true }),
        Rider.countDocuments({ 'availability.isAvailable': true })
      ]);

      // Calcular promedio de calificación
      const ridersWithRating = await Rider.find({ 'rating.totalReviews': { $gt: 0 } });
      const averageRating = ridersWithRating.length > 0 
        ? ridersWithRating.reduce((sum, rider) => sum + rider.rating.average, 0) / ridersWithRating.length
        : 0;

      res.json({
        success: true,
        data: {
          totalRiders,
          activeRiders,
          internalRiders,
          externalRiders,
          onlineRiders,
          availableRiders,
          averageRating: Math.round(averageRating * 100) / 100
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Eliminar rider
   */
  static async deleteRider(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      // Verificar que no tenga deliveries activos
      // Aquí se debería verificar si hay deliveries en proceso

      await Rider.findByIdAndDelete(id);

      // Si es rider interno, eliminar usuario asociado
      if (rider.userId) {
        await User.findByIdAndDelete(rider.userId);
      }

      res.json({
        success: true,
        message: 'Rider eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando rider:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Verificar documentos del rider
   */
  static async verifyRiderDocuments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { documentType, verified } = req.body;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      // Actualizar verificación del documento
      if (rider.documents[documentType]) {
        rider.documents[documentType].verified = verified;
      }

      await rider.save();

      res.json({
        success: true,
        data: rider,
        message: `Documento ${documentType} ${verified ? 'verificado' : 'rechazado'}`
      });

    } catch (error) {
      console.error('Error verificando documentos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Configurar zonas de servicio del rider
   */
  static async updateServiceAreas(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { serviceAreas } = req.body;

      const rider = await Rider.findById(id);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      rider.serviceAreas = serviceAreas;
      await rider.save();

      res.json({
        success: true,
        data: rider,
        message: 'Zonas de servicio actualizadas exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando zonas de servicio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default RiderController;
