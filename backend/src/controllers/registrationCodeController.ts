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

      const registrationCode = await RegistrationCodeService.verifyCode(code);

      if (!registrationCode) {
        res.status(404).json({
          success: false,
          message: 'Código de registro inválido o expirado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código válido',
        data: {
          email: registrationCode.email,
          role: registrationCode.role,
          expiresAt: registrationCode.expiresAt,
          status: registrationCode.status
        }
      });
    } catch (error) {
      console.error('Error verificando código:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Iniciar proceso de registro
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

      res.json({
        success: true,
        message: 'Registro iniciado exitosamente',
        data: {
          email: registrationCode.email,
          role: registrationCode.role,
          expiresAt: registrationCode.expiresAt
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

  // Completar registro
  static async completeRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const userId = (req as any).user._id;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código de registro requerido'
        });
        return;
      }

      await RegistrationCodeService.completeRegistration(code, userId.toString());

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

  // Obtener todos los códigos (solo admin)
  static async getAllCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const codes = await RegistrationCodeService.getAllCodes(userId.toString());

      res.json({
        success: true,
        data: codes
      });
    } catch (error) {
      console.error('Error obteniendo códigos:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas (solo admin)
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const stats = await RegistrationCodeService.getCodeStats(userId.toString());

      res.json({
        success: true,
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

  // Revocar código (solo admin)
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

      await RegistrationCodeService.revokeCode(userId.toString(), codeId);

      res.json({
        success: true,
        message: 'Código revocado exitosamente'
      });
    } catch (error) {
      console.error('Error revocando código:', error);
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
      const cleanedCount = await RegistrationCodeService.cleanExpiredCodes();

      res.json({
        success: true,
        message: `${cleanedCount} códigos expirados fueron limpiados`,
        data: { cleanedCount }
      });
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 