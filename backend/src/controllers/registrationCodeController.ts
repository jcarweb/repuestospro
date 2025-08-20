import { Request, Response } from 'express';
import { RegistrationCodeService } from '../services/registrationCodeService';

export class RegistrationCodeController {
  // Crear código de registro (solo admin)
  static async createCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { email, role, expiresInDays = 7 } = req.body;

      if (!email || !role) {
        res.status(400).json({
          success: false,
          message: 'Email y rol son requeridos'
        });
        return;
      }

      if (!['admin', 'store_manager', 'delivery'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser admin, store_manager o delivery'
        });
        return;
      }

      const registrationCode = await RegistrationCodeService.createRegistrationCode(
        userId.toString(),
        email,
        role,
        expiresInDays
      );

      res.json({
        success: true,
        message: 'Código de registro creado exitosamente',
        data: {
          code: registrationCode.code,
          email: registrationCode.email,
          role: registrationCode.role,
          expiresAt: registrationCode.expiresAt,
          status: registrationCode.status
        }
      });
    } catch (error) {
      console.error('Error creando código de registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Verificar código de registro (público)
  static async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código de registro requerido'
        });
        return;
      }

      const registrationCode = await RegistrationCodeService.verifyRegistrationCode(code);

      if (!registrationCode) {
        res.status(404).json({
          success: false,
          message: 'Código de registro no encontrado o expirado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código de registro válido',
        data: {
          code: registrationCode.code,
          email: registrationCode.email,
          role: registrationCode.role,
          expiresAt: registrationCode.expiresAt,
          status: registrationCode.status
        }
      });
    } catch (error) {
      console.error('Error verificando código de registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Listar códigos de registro (solo admin)
  static async listCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { page = 1, limit = 10, status, role } = req.query;

      const filters: any = { createdBy: userId };
      
      if (status) {
        filters.status = status;
      }
      
      if (role) {
        filters.role = role;
      }

      const codes = await RegistrationCodeService.listRegistrationCodes(
        userId.toString(),
        {
          page: Number(page),
          limit: Number(limit),
          filters
        }
      );

      res.json({
        success: true,
        message: 'Códigos de registro obtenidos exitosamente',
        data: codes
      });
    } catch (error) {
      console.error('Error listando códigos de registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Revocar código de registro (solo admin)
  static async revokeCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { codeId } = req.params;

      if (!codeId) {
        res.status(400).json({
          success: false,
          message: 'ID del código requerido'
        });
        return;
      }

      const result = await RegistrationCodeService.revokeRegistrationCode(
        userId.toString(),
        codeId
      );

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Código de registro no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código de registro revocado exitosamente'
      });
    } catch (error) {
      console.error('Error revocando código de registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de códigos (solo admin)
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

      const stats = await RegistrationCodeService.getRegistrationCodeStats(userId.toString());

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Reenviar código de registro (solo admin)
  static async resendCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { codeId } = req.params;

      if (!codeId) {
        res.status(400).json({
          success: false,
          message: 'ID del código requerido'
        });
        return;
      }

      const result = await RegistrationCodeService.resendRegistrationCode(
        userId.toString(),
        codeId
      );

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Código de registro no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código de registro reenviado exitosamente'
      });
    } catch (error) {
      console.error('Error reenviando código de registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener códigos por rol (solo admin)
  static async getCodesByRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['admin', 'store_manager', 'delivery'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
        return;
      }

      const codes = await RegistrationCodeService.getRegistrationCodesByRole(
        userId.toString(),
        role,
        {
          page: Number(page),
          limit: Number(limit)
        }
      );

      res.json({
        success: true,
        message: `Códigos de registro para rol ${role} obtenidos exitosamente`,
        data: codes
      });
    } catch (error) {
      console.error('Error obteniendo códigos por rol:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Limpiar códigos expirados (solo admin)
  static async cleanExpiredCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

      const result = await RegistrationCodeService.cleanExpiredCodes(userId.toString());

      res.json({
        success: true,
        message: `${result.deletedCount} códigos expirados han sido marcados como expirados`,
        data: result
      });
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los códigos de registro (solo admin)
  static async getAllCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

      const codes = await RegistrationCodeService.getAllRegistrationCodes(userId.toString());

      res.json({
        success: true,
        message: 'Códigos de registro obtenidos exitosamente',
        data: codes
      });
    } catch (error) {
      console.error('Error obteniendo todos los códigos:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Iniciar registro con código (público)
  static async startRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código de registro requerido'
        });
        return;
      }

      const registrationCode = await RegistrationCodeService.startRegistration(code);

      if (!registrationCode) {
        res.status(404).json({
          success: false,
          message: 'Código de registro no encontrado o expirado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Registro iniciado exitosamente',
        data: {
          code: registrationCode.code,
          email: registrationCode.email,
          role: registrationCode.role,
          expiresAt: registrationCode.expiresAt,
          status: registrationCode.status
        }
      });
    } catch (error) {
      console.error('Error iniciando registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Completar registro con código (requiere autenticación)
  static async completeRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código de registro requerido'
        });
        return;
      }

      const success = await RegistrationCodeService.completeRegistration(userId.toString(), code);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Código de registro no encontrado o expirado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Registro completado exitosamente'
      });
    } catch (error) {
      console.error('Error completando registro:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
}