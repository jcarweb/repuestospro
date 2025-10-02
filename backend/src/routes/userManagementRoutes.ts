import { Router } from 'express';
import { UserManagementController } from '../controllers/userManagementController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de rol admin a todas las rutas
router.use(roleMiddleware(['admin']));

// Rutas para gestión de usuarios
router.get('/', UserManagementController.getUsers);
router.get('/:userId', UserManagementController.getUserById);
router.post('/', UserManagementController.createUser);
router.put('/:userId', UserManagementController.updateUser);
router.delete('/:userId', UserManagementController.deleteUser);
router.put('/:userId/activate', UserManagementController.activateUser);
router.put('/:userId/deactivate', UserManagementController.deactivateUser);
router.post('/:userId/reset-password', UserManagementController.resetPassword);

export default router;
