import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authMiddleware);
router.use(adminMiddleware);

// Rutas de usuarios
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUser);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.put('/users/:id/deactivate', AdminController.deactivateUser);
router.put('/users/:id/reactivate', AdminController.reactivateUser);

// Estadísticas
router.get('/users/stats', AdminController.getUserStats);

// Generar productos (mantener la funcionalidad existente)
router.post('/generate-products', async (req, res) => {
  const adminController = new AdminController();
  await adminController.generateProducts(req, res);
});

export default router; 