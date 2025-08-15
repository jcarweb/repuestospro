import { Request, Response } from 'express';
import Store from '../models/Store';
import User from '../models/User';

class StoreController {
  // Obtener todas las tiendas (para admin)
  async getAllStores(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        city,
        state,
        isActive
      } = req.query;

      const filter: any = {};

      // Filtros
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }

      if (city) filter.city = city;
      if (state) filter.state = state;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const skip = (Number(page) - 1) * Number(limit);

      const stores = await Store.find(filter)
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip)
        .select('-__v');

      const total = await Store.countDocuments(filter);

      res.json({
        success: true,
        data: {
          stores,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
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
  }

  // Obtener tienda por ID
  async getStoreById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const store = await Store.findById(id)
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .select('-__v');

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      res.json({
        success: true,
        data: store
      });
    } catch (error) {
      console.error('Error obteniendo tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener tiendas del usuario (para gestores de tienda)
  async getUserStores(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const stores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      })
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .sort({ createdAt: -1 })
        .select('-__v');

      res.json({
        success: true,
        data: stores
      });
    } catch (error) {
      console.error('Error obteniendo tiendas del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva tienda
  async createStore(req: Request, res: Response) {
    try {
      console.log('Datos recibidos para crear tienda:', req.body);
      console.log('Usuario autenticado:', (req as any).user);
      
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
        logo,
        banner,
        coordinates,
        businessHours,
        settings
      } = req.body;

      // Validaciones básicas
      if (!name || !address || !city || !state || !zipCode || !phone || !email) {
        console.log('Campos faltantes:', { name, address, city, state, zipCode, phone, email });
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, dirección, ciudad, estado, código postal, teléfono y email son obligatorios'
        });
      }

      // Verificar si el email ya está registrado
      const existingStore = await Store.findOne({ email });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una tienda con este email'
        });
      }

      const userId = (req as any).user._id;

      const store = new Store({
        name,
        description,
        address,
        city,
        state,
        zipCode,
        country: country || 'Venezuela',
        phone,
        email,
        website,
        logo,
        banner,
        coordinates: coordinates || { latitude: 0, longitude: 0 },
        businessHours,
        settings,
        owner: userId,
        managers: [userId] // El creador también es manager
      });

      console.log('Guardando tienda en la base de datos...');
      await store.save();
      console.log('Tienda guardada exitosamente:', store._id);

      // Actualizar el usuario para incluir la tienda
      console.log('Actualizando usuario con la nueva tienda...');
      await User.findByIdAndUpdate(userId, {
        $push: { stores: store._id }
      });
      console.log('Usuario actualizado exitosamente');

      res.status(201).json({
        success: true,
        message: 'Tienda creada exitosamente',
        data: store
      });
    } catch (error) {
      console.error('Error creando tienda:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar tienda
  async updateStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      const userId = (req as any).user._id;

      // Verificar permisos (solo owner o managers pueden actualizar)
      if (store.owner.toString() !== userId.toString() && 
          !store.managers.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar esta tienda'
        });
      }

      // Si se está actualizando el email, verificar que no exista
      if (updateData.email && updateData.email !== store.email) {
        const emailExists = await Store.findOne({ 
          email: updateData.email, 
          _id: { $ne: id } 
        });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una tienda con este email'
          });
        }
      }

      const updatedStore = await Store.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('owner', 'name email')
        .populate('managers', 'name email');

      res.json({
        success: true,
        message: 'Tienda actualizada exitosamente',
        data: updatedStore
      });
    } catch (error) {
      console.error('Error actualizando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Agregar manager a la tienda
  async addManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { managerEmail } = req.body;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      const userId = (req as any).user._id;

      // Solo el owner puede agregar managers
      if (store.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede agregar managers'
        });
      }

      // Buscar el usuario por email
      const manager = await User.findOne({ email: managerEmail });
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que no sea ya manager
      if (store.managers.includes(manager._id)) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya es manager de esta tienda'
        });
      }

      // Agregar manager
      store.managers.push(manager._id);
      await store.save();

      // Actualizar el usuario
      await User.findByIdAndUpdate(manager._id, {
        $push: { stores: store._id }
      });

      res.json({
        success: true,
        message: 'Manager agregado exitosamente'
      });
    } catch (error) {
      console.error('Error agregando manager:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Remover manager de la tienda
  async removeManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { managerId } = req.body;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      const userId = (req as any).user._id;

      // Solo el owner puede remover managers
      if (store.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede remover managers'
        });
      }

      // Verificar que sea manager
      if (!store.managers.includes(managerId)) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no es manager de esta tienda'
        });
      }

      // Remover manager
      store.managers = store.managers.filter(
        manager => manager.toString() !== managerId
      );
      await store.save();

      // Actualizar el usuario
      await User.findByIdAndUpdate(managerId, {
        $pull: { stores: store._id }
      });

      res.json({
        success: true,
        message: 'Manager removido exitosamente'
      });
    } catch (error) {
      console.error('Error removiendo manager:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Desactivar tienda
  async deactivateStore(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      const userId = (req as any).user._id;

      // Solo el owner puede desactivar la tienda
      if (store.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede desactivar la tienda'
        });
      }

      store.isActive = false;
      await store.save();

      res.json({
        success: true,
        message: 'Tienda desactivada exitosamente'
      });
    } catch (error) {
      console.error('Error desactivando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de tiendas
  async getStoreStats(req: Request, res: Response) {
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
  }
}

const storeController = new StoreController();
export default storeController;
