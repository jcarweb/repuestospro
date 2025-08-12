import RegistrationCode, { IRegistrationCode } from '../models/RegistrationCode';
import User from '../models/User';
import crypto from 'crypto';
import emailService from './emailService';
import mongoose from 'mongoose';

export class RegistrationCodeService {
  // Generar código único de registro
  static generateCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  // Crear nuevo código de registro
  static async createRegistrationCode(
    adminId: string,
    email: string,
    role: 'admin' | 'store_manager' | 'delivery',
    expiresInDays: number = 7
  ): Promise<IRegistrationCode> {
    try {
      // Verificar que el usuario sea administrador
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden crear códigos de registro');
      }

      // Verificar que el email no tenga un código pendiente
      const existingCode = await RegistrationCode.findOne({
        email: email.toLowerCase(),
        status: { $in: ['pending'] },
        expiresAt: { $gt: new Date() }
      });

      if (existingCode) {
        throw new Error('Ya existe un código de registro pendiente para este email');
      }

      // Generar código único
      let code = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        code = this.generateCode();
        const existingCode = await RegistrationCode.findOne({ code });
        if (!existingCode) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Error generando código único');
      }

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Crear código de registro
      const registrationCode = new RegistrationCode({
        code,
        email: email.toLowerCase(),
        role,
        expiresAt,
        createdBy: new mongoose.Types.ObjectId(adminId)
      });

      await registrationCode.save();

      // Enviar email con el código de registro
      try {
        await emailService.sendRegistrationCode(
          email,
          code,
          role,
          expiresAt,
          admin.name
        );
      } catch (emailError) {
        console.error('Error enviando email de código de registro:', emailError);
        // No fallar la creación del código si el email falla
      }

      return registrationCode;
    } catch (error) {
      console.error('Error creando código de registro:', error);
      throw error;
    }
  }

  // Verificar código de registro
  static async verifyCode(code: string): Promise<IRegistrationCode | null> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (registrationCode) {
        // Registrar que el código fue clickeado
        registrationCode.clickedAt = new Date();
        await registrationCode.save();
      }

      return registrationCode;
    } catch (error) {
      console.error('Error verificando código:', error);
      throw error;
    }
  }

  // Marcar inicio de registro
  static async startRegistration(code: string): Promise<IRegistrationCode> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (!registrationCode) {
        throw new Error('Código de registro inválido o expirado');
      }

      registrationCode.registrationStartedAt = new Date();
      await registrationCode.save();

      return registrationCode;
    } catch (error) {
      console.error('Error iniciando registro:', error);
      throw error;
    }
  }

  // Completar registro
  static async completeRegistration(code: string, userId: string): Promise<void> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (!registrationCode) {
        throw new Error('Código de registro inválido o expirado');
      }

      // Obtener información del usuario que completó el registro
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      registrationCode.status = 'used';
      registrationCode.usedAt = new Date();
      registrationCode.usedBy = new mongoose.Types.ObjectId(userId);
      registrationCode.registrationCompletedAt = new Date();
      await registrationCode.save();

      // Enviar notificación al administrador que creó el código
      try {
        const admin = await User.findById(registrationCode.createdBy);
        if (admin) {
          await emailService.sendCodeUsedNotification(
            admin.email,
            code,
            user.email,
            user.name,
            registrationCode.role
          );
        }
      } catch (emailError) {
        console.error('Error enviando notificación de código usado:', emailError);
        // No fallar el proceso si el email falla
      }
    } catch (error) {
      console.error('Error completando registro:', error);
      throw error;
    }
  }

  // Revocar código de registro
  static async revokeCode(adminId: string, codeId: string): Promise<void> {
    try {
      // Verificar que el usuario sea administrador
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden revocar códigos');
      }

      const registrationCode = await RegistrationCode.findById(codeId);
      if (!registrationCode) {
        throw new Error('Código de registro no encontrado');
      }

      registrationCode.status = 'revoked';
      await registrationCode.save();
    } catch (error) {
      console.error('Error revocando código:', error);
      throw error;
    }
  }

  // Obtener todos los códigos de registro (para admin)
  static async getAllCodes(adminId: string): Promise<IRegistrationCode[]> {
    try {
      // Verificar que el usuario sea administrador
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden ver todos los códigos');
      }

      return await RegistrationCode.find()
        .populate('createdBy', 'name email')
        .populate('usedBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error obteniendo códigos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de códigos
  static async getCodeStats(adminId: string): Promise<any> {
    try {
      // Verificar que el usuario sea administrador
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden ver estadísticas');
      }

      const totalCodes = await RegistrationCode.countDocuments();
      const pendingCodes = await RegistrationCode.countDocuments({ status: 'pending' });
      const usedCodes = await RegistrationCode.countDocuments({ status: 'used' });
      const expiredCodes = await RegistrationCode.countDocuments({ status: 'expired' });
      const revokedCodes = await RegistrationCode.countDocuments({ status: 'revoked' });

      const roleStats = await RegistrationCode.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            used: {
              $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        total: totalCodes,
        pending: pendingCodes,
        used: usedCodes,
        expired: expiredCodes,
        revoked: revokedCodes,
        roleStats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Limpiar códigos expirados
  static async cleanExpiredCodes(): Promise<number> {
    try {
      // Obtener códigos que van a expirar
      const codesToExpire = await RegistrationCode.find({
        status: 'pending',
        expiresAt: { $lt: new Date() }
      });

      // Enviar notificaciones antes de expirar
      for (const code of codesToExpire) {
        try {
          const admin = await User.findById(code.createdBy);
          if (admin) {
            await emailService.sendCodeExpiredNotification(
              admin.email,
              code.code,
              code.email,
              code.role
            );
          }
        } catch (emailError) {
          console.error('Error enviando notificación de código expirado:', emailError);
        }
      }

      // Marcar códigos como expirados
      const result = await RegistrationCode.updateMany(
        {
          status: 'pending',
          expiresAt: { $lt: new Date() }
        },
        {
          status: 'expired'
        }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      throw error;
    }
  }
} 