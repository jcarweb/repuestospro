import { Request, Response } from 'express';
import State from '../models/State';
import Municipality from '../models/Municipality';
import Parish from '../models/Parish';

class AdministrativeDivisionController {
  // Obtener todos los estados
  async getStates(req: Request, res: Response) {
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
  async getMunicipalitiesByState(req: Request, res: Response) {
    try {
      const { stateId } = req.params;

      if (!stateId) {
        return res.status(400).json({
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
  async getParishesByMunicipality(req: Request, res: Response) {
    try {
      const { municipalityId } = req.params;

      if (!municipalityId) {
        return res.status(400).json({
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
  async getLocationHierarchy(req: Request, res: Response) {
    try {
      const { stateId, municipalityId, parishId } = req.params;

      const location = {
        state: null,
        municipality: null,
        parish: null
      };

      if (stateId) {
        location.state = await State.findById(stateId).select('name code capital region');
      }

      if (municipalityId) {
        location.municipality = await Municipality.findById(municipalityId)
          .populate('state', 'name code')
          .select('name code capital state');
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
          .select('name code municipality');
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
  async searchLocations(req: Request, res: Response) {
    try {
      const { query, type } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query de búsqueda es requerido'
        });
      }

      let results = [];

      switch (type) {
        case 'state':
          results = await State.find({
            $text: { $search: query },
            isActive: true
          })
            .select('name code capital region')
            .limit(10);
          break;

        case 'municipality':
          results = await Municipality.find({
            $text: { $search: query },
            isActive: true
          })
            .populate('state', 'name code')
            .select('name code capital state')
            .limit(10);
          break;

        case 'parish':
          results = await Parish.find({
            $text: { $search: query },
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
              $text: { $search: query },
              isActive: true
            })
              .select('name code capital region')
              .limit(5),
            Municipality.find({
              $text: { $search: query },
              isActive: true
            })
              .populate('state', 'name code')
              .select('name code capital state')
              .limit(5),
            Parish.find({
              $text: { $search: query },
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

export default new AdministrativeDivisionController();
