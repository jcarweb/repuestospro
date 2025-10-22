import express from 'express';
import SimulationController from '../controllers/SimulationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();
const simulationController = new SimulationController();

// Todas las rutas requieren autenticación y permisos de administrador
router.use(authenticateToken);
router.use(requireAdmin);

// Simulación personalizada
router.post('/custom', simulationController.runCustomSimulation.bind(simulationController));

// Simulación por escenarios
router.post('/scenario/:scenario', simulationController.runScenarioSimulation.bind(simulationController));

// Comparación de escenarios
router.post('/compare', simulationController.compareScenarios.bind(simulationController));

// Reporte de simulación
router.get('/report', simulationController.getSimulationReport.bind(simulationController));

// Exportación de resultados
router.get('/export', simulationController.exportSimulationResults.bind(simulationController));

export default router;
