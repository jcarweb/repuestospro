import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import State from '../models/State';
import Municipality from '../models/Municipality';
import Parish from '../models/Parish';

interface AuthenticatedRequest extends Request {
  user?: any;
}

class LocationController {
  // Actualizar ubicación del usuario
  static async updateLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { latitude, longitude, enabled } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas y deben ser números'
        });
        return;
      }

      // Validar coordenadas
      if (latitude < -90 || latitude > 90) {
        res.status(400).json({
          success: false,
          message: 'Latitud debe estar entre -90 y 90'
        });
        return;
      }

      if (longitude < -180 || longitude > 180) {
        res.status(400).json({
          success: false,
          message: 'Longitud debe estar entre -180 y 180'
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Actualizar ubicación
      user.location = {
        type: 'Point',
        coordinates: [longitude, latitude] // MongoDB usa [longitude, latitude]
      };
      user.locationEnabled = enabled !== undefined ? enabled : true;
      user.lastLocationUpdate = new Date();
      await user.save();

      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'location_update',
        description: 'Ubicación GPS actualizada',
        metadata: { 
          latitude, 
          longitude, 
          enabled: user.locationEnabled,
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        }
      });

      res.json({
        success: true,
        message: 'Ubicación actualizada exitosamente',
        data: {
          location: user.location,
          locationEnabled: user.locationEnabled,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener ubicación actual del usuario
  static async getLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId).select('location locationEnabled lastLocationUpdate');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          location: user.location,
          locationEnabled: user.locationEnabled,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Habilitar/deshabilitar ubicación
  static async toggleLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'El parámetro enabled es requerido y debe ser un booleano'
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      user.locationEnabled = enabled;
      if (!enabled) {
        // Limpiar ubicación si se deshabilita
        user.location = undefined as any;
        user.lastLocationUpdate = undefined as any;
      }
      await user.save();

      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: enabled ? 'location_enabled' : 'location_disabled',
        description: enabled ? 'GPS habilitado' : 'GPS deshabilitado',
        metadata: { 
          enabled,
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        }
      });

      res.json({
        success: true,
        message: enabled ? 'GPS habilitado' : 'GPS deshabilitado',
        data: {
          locationEnabled: user.locationEnabled,
          location: user.location
        }
      });
    } catch (error) {
      console.error('Error cambiando estado de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar si el usuario tiene ubicación habilitada
  static async checkLocationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId).select('locationEnabled location lastLocationUpdate');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          locationEnabled: user.locationEnabled,
          hasLocation: !!user.location,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error verificando estado de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los estados
  async getStates(req: AuthenticatedRequest, res: Response) {
    try {
      const states = await State.find({ isActive: true })
        .select('name code capital region')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: states
      });
    } catch (error) {
      console.error('Error obteniendo estados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener municipios por estado
  async getMunicipalitiesByState(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { stateId } = req.params;

      if (!stateId) {
        res.status(400).json({
          success: false,
          message: 'ID del estado es requerido'
        });
      }

      const municipalities = await Municipality.find({ 
        state: stateId, 
        isActive: true 
      })
        .select('name code capital')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: municipalities
      });
    } catch (error) {
      console.error('Error obteniendo municipios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener parroquias por municipio
  async getParishesByMunicipality(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { municipalityId } = req.params;

      if (!municipalityId) {
        res.status(400).json({
          success: false,
          message: 'ID del municipio es requerido'
        });
      }

      const parishes = await Parish.find({ 
        municipality: municipalityId, 
        isActive: true 
      })
        .select('name code')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: parishes
      });
    } catch (error) {
      console.error('Error obteniendo parroquias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener ubicación completa (Estado, Municipio, Parroquia)
  async getLocationHierarchy(req: AuthenticatedRequest, res: Response) {
    try {
      const { stateId, municipalityId, parishId } = req.params;

      const location = {
        state: null,
        municipality: null,
        parish: null
      };

      if (stateId) {
        location.state = await State.findById(stateId).select('name code capital region') as any;
      }

      if (municipalityId) {
        location.municipality = await Municipality.findById(municipalityId)
          .populate('state', 'name code')
          .select('name code capital state') as any;
      }

      if (parishId) {
        location.parish = await Parish.findById(parishId)
          .populate({
            path: 'municipality',
            select: 'name code capital',
            populate: {
              path: 'state',
              select: 'name code'
            }
          })
          .select('name code municipality') as any;
      }

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error obteniendo jerarquía de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Buscar ubicaciones por texto
  async searchLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { query, type } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query de búsqueda es requerido'
        });
      }

      let results = [];

      switch (type) {
        case 'state':
          results = await State.find({
            $text: { $search: query as string },
            isActive: true
          })
            .select('name code capital region')
            .limit(10);
          break;

        case 'municipality':
          results = await Municipality.find({
            $text: { $search: query as string },
            isActive: true
          })
            .populate('state', 'name code')
            .select('name code capital state')
            .limit(10);
          break;

        case 'parish':
          results = await Parish.find({
            $text: { $search: query as string },
            isActive: true
          })
            .populate({
              path: 'municipality',
              select: 'name code',
              populate: {
                path: 'state',
                select: 'name code'
              }
            })
            .select('name code municipality')
            .limit(10);
          break;

        default:
          // Búsqueda general
          const [states, municipalities, parishes] = await Promise.all([
            State.find({
              $text: { $search: query as string },
              isActive: true
            })
              .select('name code capital region')
              .limit(5),
            Municipality.find({
              $text: { $search: query as string },
              isActive: true
            })
              .populate('state', 'name code')
              .select('name code capital state')
              .limit(5),
            Parish.find({
              $text: { $search: query as string },
              isActive: true
            })
              .populate({
                path: 'municipality',
                select: 'name code',
                populate: {
                  path: 'state',
                  select: 'name code'
                }
              })
              .select('name code municipality')
              .limit(5)
          ]);

          results = [
            ...states.map(s => ({ ...s.toObject(), type: 'state' })),
            ...municipalities.map(m => ({ ...m.toObject(), type: 'municipality' })),
            ...parishes.map(p => ({ ...p.toObject(), type: 'parish' }))
          ];
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error buscando ubicaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default LocationController; 