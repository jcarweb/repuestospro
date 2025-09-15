import express from 'express';
import administrativeDivisionController from '../controllers/administrativeDivisionController';

const router = express.Router();

// Obtener todos los estados
router.get('/states', administrativeDivisionController.getStates);

// Obtener municipios por estado
router.get('/states/:stateId/municipalities', administrativeDivisionController.getMunicipalitiesByState);

// Obtener parroquias por municipio
router.get('/municipalities/:municipalityId/parishes', administrativeDivisionController.getParishesByMunicipality);

// Obtener jerarquía de ubicación completa
router.get('/hierarchy/:stateId?/:municipalityId?/:parishId?', administrativeDivisionController.getLocationHierarchy);

// Buscar ubicaciones por texto
router.get('/search', administrativeDivisionController.searchLocations);

export default router;
