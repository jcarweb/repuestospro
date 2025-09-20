import { Request, Response } from 'express';
import Store from '../models/Store';
import User from '../models/User';
import State from '../models/State';
import Municipality from '../models/Municipality';
import Parish from '../models/Parish';

class StoreController {
  // Obtener usuarios store_manager para asignación de tiendas
  async getStoreManagers(req: Request, res: Response) {
    try {
      const users = await User.find({ 
        role: 'store_manager', 
        isActive: true 
      }).select('name email role isActive').sort({ name: 1 });
      
      // Mapear los usuarios para incluir el campo 'id' además de '_id'
      const mappedUsers = users.map(user => ({
        ...user.toObject(),
        id: (user as any)._id.toString()
      }));
      
      res.json({
        success: true,
        data: mappedUsers
      });
    } catch (error) {
      console.error('Error getting store managers:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

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
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name')
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
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name')
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
      console.log('getUserStores: Usuario ID:', userId);

      const stores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      })
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name')
        .sort({ createdAt: -1 })
        .select('-__v');

      console.log('getUserStores: Tiendas encontradas:', stores.length);
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

  // Debug: Obtener información detallada de tiendas del usuario
  async getUserStoresDebug(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      console.log('getUserStoresDebug: Usuario ID:', userId);

      // Buscar todas las tiendas (sin filtro de isActive)
      const allStores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ]
      }).select('name isActive owner managers');

      // Buscar tiendas activas
      const activeStores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      }).select('name isActive owner managers');

      res.json({
        success: true,
        data: {
          userId,
          totalStores: allStores.length,
          activeStores: activeStores.length,
          allStores,
          activeStores
        }
      });
    } catch (error) {
      console.error('Error en getUserStoresDebug:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Debug: Obtener tiendas completas del usuario
  async getUserStoresComplete(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      console.log('getUserStoresComplete: Usuario ID:', userId);

      const stores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      })
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name')
        .sort({ createdAt: -1 })
        .select('-__v');

      console.log('getUserStoresComplete: Tiendas encontradas:', stores.length);
      res.json({
        success: true,
        data: stores
      });
    } catch (error) {
      console.error('Error en getUserStoresComplete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Debug: Endpoint simple para probar
  async testUserStores(req: Request, res: Response) {
    try {
      console.log('testUserStores: Iniciando...');
      console.log('testUserStores: Headers:', req.headers);
      console.log('testUserStores: User:', (req as any).user);
      
      const userId = (req as any).user?._id;
      console.log('testUserStores: Usuario ID:', userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Buscar tiendas simples sin populate
      const stores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      }).select('name isActive owner managers');

      console.log('testUserStores: Tiendas encontradas:', stores.length);
      
      res.json({
        success: true,
        data: stores,
        debug: {
          userId,
          totalStores: stores.length
        }
      });
    } catch (error) {
      console.error('Error en testUserStores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
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
        stateRef,
        municipalityRef,
        parishRef,
        businessHours,
        settings
      } = req.body;

      // Validaciones básicas
      if (!name || !address || !city || !zipCode || !phone || !email) {
        console.log('Campos faltantes:', { name, address, city, zipCode, phone, email });
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, dirección, ciudad, código postal, teléfono y email son obligatorios'
        });
      }

      // Validar que se haya seleccionado una división administrativa
      if (!stateRef || !municipalityRef || !parishRef) {
        return res.status(400).json({
          success: false,
          message: 'Debe seleccionar estado, municipio y parroquia'
        });
      }

      // Validar que las referencias de divisiones administrativas existan
      if (stateRef) {
        const stateExists = await State.findById(stateRef);
        if (!stateExists) {
          return res.status(400).json({
            success: false,
            message: 'El estado seleccionado no existe'
          });
        }
      }

      if (municipalityRef) {
        const municipalityExists = await Municipality.findById(municipalityRef);
        if (!municipalityExists) {
          return res.status(400).json({
            success: false,
            message: 'El municipio seleccionado no existe'
          });
        }
      }

      if (parishRef) {
        const parishExists = await Parish.findById(parishRef);
        if (!parishExists) {
          return res.status(400).json({
            success: false,
            message: 'La parroquia seleccionada no existe'
          });
        }
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
        zipCode,
        country: country || 'Venezuela',
        phone,
        email,
        website,
        logo,
        banner,
        coordinates: coordinates || { latitude: 0, longitude: 0 },
        stateRef,
        municipalityRef,
        parishRef,
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
        .populate('managers', 'name email')
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name');

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

  // Buscar tiendas por divisiones administrativas
  async searchByAdministrativeDivision(req: Request, res: Response) {
    try {
      const {
        stateId,
        municipalityId,
        parishId,
        page = 1,
        limit = 20,
        search
      } = req.query;

      const filter: any = { isActive: true };

      // Filtros por división administrativa
      if (stateId) filter.stateRef = stateId;
      if (municipalityId) filter.municipalityRef = municipalityId;
      if (parishId) filter.parishRef = parishId;

      // Filtro de búsqueda adicional
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const stores = await Store.find(filter)
        .populate('owner', 'name email')
        .populate('managers', 'name email')
        .populate('stateRef', 'name code')
        .populate('municipalityRef', 'name')
        .populate('parishRef', 'name')
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
      console.error('Error buscando tiendas por división administrativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Toggle status de la tienda (activar/desactivar)
  async toggleStoreStatus(req: Request, res: Response) {
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

      // Solo el owner puede cambiar el status de la tienda
      if (store.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede cambiar el estado de la tienda'
        });
      }

      store.isActive = !store.isActive;
      await store.save();

      const action = store.isActive ? 'activada' : 'desactivada';

      res.json({
        success: true,
        message: `Tienda ${action} exitosamente`,
        data: { isActive: store.isActive }
      });
    } catch (error) {
      console.error('Error cambiando estado de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Establecer tienda como principal
  async setMainStore(req: Request, res: Response) {
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

      // Solo el owner puede establecer la tienda principal
      if (store.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede establecer la tienda principal'
        });
      }

      // Primero, quitar el estado de tienda principal de todas las tiendas del usuario
      await Store.updateMany(
        { 
          owner: userId,
          _id: { $ne: id } // Excluir la tienda actual
        },
        { isMainStore: false }
      );

      // Luego, establecer la tienda seleccionada como principal
      store.isMainStore = true;
      await store.save();

      res.json({
        success: true,
        message: 'Tienda establecida como principal exitosamente',
        data: { isMainStore: true }
      });
    } catch (error) {
      console.error('Error estableciendo tienda principal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener sucursales de la tienda principal
  async getBranches(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      let branches;

      if (userRole === 'admin') {
        // Admin puede ver todas las sucursales
        branches = await Store.find({ 
          isMainStore: false,
          isActive: true 
        })
          .populate('owner', 'name email')
          .populate('managers', 'name email')
          .populate('stateRef', 'name code')
          .populate('municipalityRef', 'name')
          .populate('parishRef', 'name')
          .sort({ name: 1 })
          .select('-__v');
      } else {
        // Store manager solo ve sucursales de su tienda principal
        const mainStore = await Store.findOne({ 
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isMainStore: true,
          isActive: true
        });

        if (!mainStore) {
          return res.status(404).json({
            success: false,
            message: 'No tienes una tienda principal asignada'
          });
        }

        // Obtener todas las sucursales que pertenecen al mismo owner
        branches = await Store.find({ 
          owner: mainStore.owner,
          isMainStore: false,
          isActive: true 
        })
          .populate('owner', 'name email')
          .populate('managers', 'name email')
          .populate('stateRef', 'name code')
          .populate('municipalityRef', 'name')
          .populate('parishRef', 'name')
          .sort({ name: 1 })
          .select('-__v');
      }

      res.json({
        success: true,
        data: branches
      });
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar tienda (solo para admin o propietario con confirmación)
  async deleteStore(req: Request, res: Response) {
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
      const user = (req as any).user;

      // Solo el owner o admin pueden eliminar la tienda
      if (store.owner.toString() !== userId.toString() && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario o un administrador pueden eliminar la tienda'
        });
      }

      // Eliminar la tienda
      await Store.findByIdAndDelete(id);

      // Remover la referencia de la tienda de todos los usuarios managers
      await User.updateMany(
        { stores: id },
        { $pull: { stores: id } }
      );

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
  }
}

const storeController = new StoreController();
export default storeController;
