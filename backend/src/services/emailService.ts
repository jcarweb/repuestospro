import nodemailer from 'nodemailer';
import config from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar transporter según el entorno
    if (config.NODE_ENV === 'production') {
      // Configuración para producción (AWS SES, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST || 'smtp.gmail.com',
        port: config.SMTP_PORT || '587',
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        }
      } as any);
    } else {
      // Configuración para desarrollo (usar Ethereal Email para testing)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }

  // Enviar email de notificación de Wallet
  async sendWalletNotification(
    to: string,
    subject: string,
    template: string,
    data: any = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const htmlContent = this.generateWalletEmailTemplate(template, data);
      
      const mailOptions = {
        from: `"PiezasYa Wallet" <${config.SMTP_USER || 'noreply@piezasya.com'}>`,
        to,
        subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email enviado exitosamente:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // Generar template de email para notificaciones de Wallet
  private generateWalletEmailTemplate(template: string, data: any): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Wallet - PiezasYa</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .alert {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
          }
          .danger {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
          }
          .info-box {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .balance {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
          }
          .balance.low {
            color: #ffc107;
          }
          .balance.insufficient {
            color: #dc3545;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
          }
          .button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 PiezasYa Wallet</h1>
          <p>Gestión de saldo y pagos</p>
        </div>
        
        <div class="content">
          ${this.getTemplateContent(template, data)}
        </div>
        
        <div class="footer">
          <p>Este es un mensaje automático de PiezasYa. No responda a este email.</p>
          <p>© 2024 PiezasYa. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  // Obtener contenido específico del template
  private getTemplateContent(template: string, data: any): string {
    switch (template) {
      case 'low_balance':
        return `
          <div class="alert warning">
            <h2>⚠️ Saldo Bajo en tu Wallet</h2>
            <p>Tu saldo actual es <span class="balance low">$${data.balance || 0}</span>.</p>
            <p>Te recomendamos recargar tu Wallet para evitar interrupciones en los pagos en efectivo.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Recargar Wallet</a>
          </div>
        `;

      case 'insufficient_balance':
        return `
          <div class="alert danger">
            <h2>🚫 Saldo Insuficiente - Pagos Bloqueados</h2>
            <p>Tu saldo actual es <span class="balance insufficient">$${data.balance || 0}</span>.</p>
            <p><strong>Los pagos en efectivo han sido bloqueados</strong> debido a saldo insuficiente.</p>
            <p>Recarga tu Wallet inmediatamente para habilitar nuevamente los pagos en efectivo.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Recargar Wallet</a>
          </div>
        `;

      case 'cash_payment_blocked':
        return `
          <div class="alert danger">
            <h2>🚫 Pagos en Efectivo Bloqueados</h2>
            <p>Los pagos en efectivo han sido bloqueados debido a saldo insuficiente.</p>
            <div class="info-box">
              <p><strong>Saldo actual:</strong> <span class="balance insufficient">$${data.balance || 0}</span></p>
              <p><strong>Umbral crítico:</strong> $${data.threshold || 0}</p>
            </div>
            <p>Recarga tu Wallet para habilitar nuevamente los pagos en efectivo.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Recargar Wallet</a>
          </div>
        `;

      case 'cash_payment_enabled':
        return `
          <div class="alert success">
            <h2>✅ Pagos en Efectivo Habilitados</h2>
            <p>Los pagos en efectivo han sido habilitados nuevamente.</p>
            <div class="info-box">
              <p><strong>Saldo actual:</strong> <span class="balance">$${data.balance || 0}</span></p>
            </div>
            <p>Los clientes pueden pagar en efectivo nuevamente.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Ver Wallet</a>
          </div>
        `;

      case 'recharge_successful':
        return `
          <div class="alert success">
            <h2>✅ Wallet Recargada Exitosamente</h2>
            <p>Tu Wallet ha sido recargada con <strong>$${data.amount || 0}</strong>.</p>
            <div class="info-box">
              <p><strong>Monto recargado:</strong> $${data.amount || 0}</p>
              <p><strong>Método de pago:</strong> ${data.paymentMethod || 'N/A'}</p>
              <p><strong>Nuevo saldo:</strong> <span class="balance">$${data.balance || 0}</span></p>
            </div>
            <a href="${data.dashboardUrl || '#'}" class="button">Ver Wallet</a>
          </div>
        `;

      case 'recharge_failed':
        return `
          <div class="alert danger">
            <h2>❌ Error en Recarga de Wallet</h2>
            <p>No se pudo procesar la recarga de <strong>$${data.amount || 0}</strong>.</p>
            <p>Por favor, verifica los datos e intenta nuevamente.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Intentar Nuevamente</a>
          </div>
        `;

      case 'commission_deducted':
        return `
          <div class="alert">
            <h2>💰 Comisión Descontada</h2>
            <p>Se ha descontado una comisión de <strong>$${data.amount || 0}</strong> por la venta de la orden <strong>${data.orderNumber || ''}</strong>.</p>
            <div class="info-box">
              <p><strong>Comisión descontada:</strong> $${data.amount || 0}</p>
              <p><strong>Orden:</strong> ${data.orderNumber || 'N/A'}</p>
              <p><strong>Saldo actual:</strong> <span class="balance">$${data.balance || 0}</span></p>
            </div>
            <a href="${data.dashboardUrl || '#'}" class="button">Ver Transacciones</a>
          </div>
        `;

      case 'wallet_created':
        return `
          <div class="alert success">
            <h2>🎉 Wallet Creada</h2>
            <p>Tu Wallet ha sido creada exitosamente.</p>
            <p>Comienza recargando saldo para habilitar pagos en efectivo.</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Recargar Wallet</a>
          </div>
        `;

      case 'settings_updated':
        return `
          <div class="alert">
            <h2>⚙️ Configuración Actualizada</h2>
            <p>Las configuraciones de tu Wallet han sido actualizadas.</p>
            <p>Cambios realizados: ${data.changes ? data.changes.join(', ') : 'Configuración general'}</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Ver Configuración</a>
          </div>
        `;

      default:
        return `
          <div class="alert">
            <h2>📧 Notificación de Wallet</h2>
            <p>${data.message || 'Notificación de Wallet'}</p>
            <a href="${data.dashboardUrl || '#'}" class="button">Ver Wallet</a>
          </div>
        `;
    }
  }

  // Verificar configuración del servicio de email
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      console.error('Error verificando conexión SMTP:', error);
      return false;
    }
  }

  // Obtener información del transporter (para debugging)
  getTransporterInfo(): any {
    return {
      host: (this.transporter as any).options?.host,
      port: (this.transporter as any).options?.port,
      secure: (this.transporter as any).options?.secure,
      auth: {
        user: (this.transporter as any).options?.auth?.user,
        pass: (this.transporter as any).options?.auth?.pass ? '***' : undefined
      }
    };
  }

  // Método para enviar código de registro
  async sendRegistrationCodeEmail(
    to: string,
    code: string,
    userName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = 'Código de Registro - PiezasYa';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Código de Registro</h2>
          <p>Hola ${userName},</p>
          <p>Tu código de registro es:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>Este código expira en 10 minutos.</p>
          <p>Si no solicitaste este código, ignora este mensaje.</p>
        </div>
      `;

      return await this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      console.error('Error enviando código de registro:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Método genérico para enviar emails
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: `"PiezasYa" <${config.SMTP_USER || 'noreply@piezasya.com'}>`,
        to,
        subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos adicionales requeridos por los controladores
  async sendAdminPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Restablecer Contraseña - Admin', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Restablecer Contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
      </div>
    `);
  }

  async sendAdvertisementRequestConfirmation(to: string, requestId: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Solicitud de Publicidad Recibida', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Solicitud Recibida</h2>
        <p>Tu solicitud de publicidad ha sido recibida correctamente. ID: ${requestId}</p>
      </div>
    `);
  }

  async sendAdvertisementRequestNotification(to: string, requestId: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Nueva Solicitud de Publicidad', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nueva Solicitud</h2>
        <p>Se ha recibido una nueva solicitud de publicidad. ID: ${requestId}</p>
      </div>
    `);
  }

  async sendAdvertisementApproval(to: string, requestId: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Publicidad Aprobada', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Publicidad Aprobada!</h2>
        <p>Tu solicitud de publicidad ha sido aprobada. ID: ${requestId}</p>
      </div>
    `);
  }

  async sendAdvertisementRejection(to: string, requestId: string, reason: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Publicidad Rechazada', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Publicidad Rechazada</h2>
        <p>Tu solicitud de publicidad ha sido rechazada. ID: ${requestId}</p>
        <p>Razón: ${reason}</p>
      </div>
    `);
  }

  async sendEmailVerificationEmail(to: string, verificationLink: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Verificar Email', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verificar Email</h2>
        <p>Haz clic en el siguiente enlace para verificar tu email:</p>
        <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar Email</a>
      </div>
    `);
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, 'Restablecer Contraseña', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Restablecer Contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
      </div>
    `);
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail(to, '¡Bienvenido a PiezasYa!', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Bienvenido ${userName}!</h2>
        <p>Gracias por unirte a PiezasYa. Estamos emocionados de tenerte con nosotros.</p>
      </div>
    `);
  }
}

export const emailService = new EmailService();