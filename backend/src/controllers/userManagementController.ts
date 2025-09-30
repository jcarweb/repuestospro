import { Request, Response } from 'express';
import { UserManagementService } from '../services/userManagementService';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

export class UserManagementController {
  // Obtener todos los usuarios (solo admin)
  static async getUsers(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        status = ''
      } = req.query;

      const result = await UserManagementService.getUsers(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        role as string,
        status as string
      );

      res.json(result);
    } catch (error) {
      console.error('Error en getUsers:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener usuario por ID (solo admin)
  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const result = await UserManagementService.getUserById(userId);
      return res.json(result);
    } catch (error) {
      console.error('Error en getUserById:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Crear nuevo usuario (solo admin)
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role, status, storeId } = req.body;

      // Validaciones
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios'
        });
      }

      if (!['admin', 'store_manager', 'seller'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
      }

      const result = await UserManagementService.createUser({
        name,
        email,
        password,
        role,
        status,
        storeId
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error en createUser:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Actualizar usuario (solo admin)
  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const { name, email, role, status, storeId } = req.body;

      // Validaciones
      if (role && !['admin', 'store_manager', 'seller'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
      }

      if (status && !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const result = await UserManagementService.updateUser(userId, {
        name,
        email,
        role,
        status,
        storeId
      });

      return res.json(result);
    } catch (error) {
      console.error('Error en updateUser:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Eliminar usuario (solo admin)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const result = await UserManagementService.deleteUser(userId);
      return res.json(result);
    } catch (error) {
      console.error('Error en deleteUser:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Activar usuario (solo admin)
  static async activateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const result = await UserManagementService.toggleUserStatus(userId, 'active');
      return res.json(result);
    } catch (error) {
      console.error('Error en activateUser:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Desactivar usuario (solo admin)
  static async deactivateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const result = await UserManagementService.toggleUserStatus(userId, 'inactive');
      return res.json(result);
    } catch (error) {
      console.error('Error en deactivateUser:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Resetear contraseña (solo admin)
  static async resetPassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Nueva contraseña requerida'
        });
      }

      const result = await UserManagementService.resetPassword(userId, newPassword);
      return res.json(result);
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
}
