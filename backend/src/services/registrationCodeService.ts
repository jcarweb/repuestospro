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
    role: 'admin' | 'store_manager' | 'delivery' | 'seller',
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
        await emailService.sendRegistrationCodeEmail(
          email,
          code,
          role,
          expiresAt
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
  static async verifyRegistrationCode(code: string): Promise<IRegistrationCode | null> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      return registrationCode;
    } catch (error) {
      console.error('Error verificando código de registro:', error);
      throw error;
    }
  }

  // Listar códigos de registro
  static async listRegistrationCodes(
    adminId: string,
    options: {
      page: number;
      limit: number;
      filters: any;
    }
  ): Promise<{
    codes: IRegistrationCode[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page, limit, filters } = options;
      const skip = (page - 1) * limit;

      const query = { createdBy: adminId, role: role };
      const total = await RegistrationCode.countDocuments(query);
      const codes = await RegistrationCode.find(query)
        .populate('createdBy', 'name email')
        .populate('usedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        codes,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error obteniendo códigos por rol:', error);
      throw error;
    }
  }

  // Limpiar códigos expirados
  static async cleanExpiredCodes(adminId: string): Promise<{ deletedCount: number }> {
    try {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden limpiar códigos expirados');
      }

      // Actualizar códigos expirados a estado 'expired'
      const updateResult = await RegistrationCode.updateMany(
        {
          createdBy: adminId,
          status: 'pending',
          expiresAt: { $lt: new Date() }
        },
        {
          $set: { status: 'expired' }
        }
      );

      return {
        deletedCount: updateResult.modifiedCount
      };
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      throw error;
    }
  }

  // Obtener todos los códigos de registro (solo admin)
  static async getAllRegistrationCodes(adminId: string): Promise<IRegistrationCode[]> {
    try {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden ver todos los códigos');
      }

      const codes = await RegistrationCode.find({ createdBy: adminId })
        .populate('createdBy', 'name email')
        .populate('usedBy', 'name email')
        .sort({ createdAt: -1 });

      return codes;
    } catch (error) {
      console.error('Error obteniendo todos los códigos:', error);
      throw error;
    }
  }

  // Iniciar registro con código
  static async startRegistration(code: string): Promise<IRegistrationCode | null> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (!registrationCode) {
        return null;
      }

      // Marcar que se inició el registro
      registrationCode.registrationStartedAt = new Date();
      await registrationCode.save();

      return registrationCode;
    } catch (error) {
      console.error('Error iniciando registro:', error);
      throw error;
    }
  }

  // Completar registro con código
  static async completeRegistration(userId: string, code: string): Promise<boolean> {
    try {
      const registrationCode = await RegistrationCode.findOne({
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (!registrationCode) {
        return false;
      }

      // Marcar como usado
      registrationCode.status = 'used';
      registrationCode.usedAt = new Date();
      registrationCode.usedBy = new mongoose.Types.ObjectId(userId);
      registrationCode.registrationCompletedAt = new Date();
      await registrationCode.save();

      return true;
    } catch (error) {
      console.error('Error completando registro:', error);
      throw error;
    }
  }
}