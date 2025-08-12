import nodemailer from 'nodemailer';
import config from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST || 'smtp.gmail.com',
      port: config.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.SMTP_USER || 'tu-email@gmail.com',
        pass: config.SMTP_PASS || 'tu-password'
      }
    });
  }

  // Enviar código de registro
  async sendRegistrationCode(
    email: string,
    code: string,
    role: string,
    expiresAt: Date,
    adminName: string
  ): Promise<void> {
    const roleName = this.getRoleName(role);
    const registrationUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/register-with-code?code=${code}`;

    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: email,
      subject: 'Código de Registro - RepuestosPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Código de Registro</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido a RepuestosPro!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hola, has sido invitado por <strong>${adminName}</strong> a unirte a RepuestosPro como <strong>${roleName}</strong>.
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #dee2e6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #495057; margin: 0 0 10px 0; font-size: 18px;">Tu Código de Registro</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; display: inline-block; border: 1px solid #ced4da;">
                <code style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${code}</code>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Completar Registro
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Información Importante:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Este código expira el <strong>${expiresAt.toLocaleDateString('es-ES')}</strong></li>
                <li>El código solo puede ser usado una vez</li>
                <li>Si no completas el registro, el código expirará automáticamente</li>
                <li>Tu rol será: <strong>${roleName}</strong></li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Si tienes problemas con el registro, contacta con el administrador del sistema.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de código de registro enviado a ${email}`);
    } catch (error) {
      console.error('❌ Error enviando email de código de registro:', error);
      throw error;
    }
  }

  // Enviar notificación de código usado
  async sendCodeUsedNotification(
    adminEmail: string,
    code: string,
    userEmail: string,
    userName: string,
    role: string
  ): Promise<void> {
    const roleName = this.getRoleName(role);

    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: adminEmail,
      subject: 'Código de Registro Usado - RepuestosPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Código de Registro Usado</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Código de Registro Utilizado!</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0 0 15px 0;">Detalles del Registro:</h3>
              <ul style="color: #155724; margin: 0; padding-left: 20px;">
                <li><strong>Código usado:</strong> ${code}</li>
                <li><strong>Usuario registrado:</strong> ${userName}</li>
                <li><strong>Email:</strong> ${userEmail}</li>
                <li><strong>Rol asignado:</strong> ${roleName}</li>
                <li><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString('es-ES')}</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              El código de registro que creaste ha sido utilizado exitosamente. El nuevo usuario ya tiene acceso al sistema con el rol correspondiente.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Puedes ver todos los códigos de registro en el panel de administración.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificación de código usado enviada a ${adminEmail}`);
    } catch (error) {
      console.error('❌ Error enviando notificación de código usado:', error);
      throw error;
    }
  }

  // Enviar notificación de código expirado
  async sendCodeExpiredNotification(
    adminEmail: string,
    code: string,
    email: string,
    role: string
  ): Promise<void> {
    const roleName = this.getRoleName(role);

    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: adminEmail,
      subject: 'Código de Registro Expirado - RepuestosPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Código de Registro Expirado</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Código de Registro Expirado</h2>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #721c24; margin: 0 0 15px 0;">Detalles del Código:</h3>
              <ul style="color: #721c24; margin: 0; padding-left: 20px;">
                <li><strong>Código expirado:</strong> ${code}</li>
                <li><strong>Email destinatario:</strong> ${email}</li>
                <li><strong>Rol asignado:</strong> ${roleName}</li>
                <li><strong>Fecha de expiración:</strong> ${new Date().toLocaleDateString('es-ES')}</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              El código de registro ha expirado sin ser utilizado. Puedes crear un nuevo código si es necesario.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Puedes gestionar todos los códigos desde el panel de administración.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificación de código expirado enviada a ${adminEmail}`);
    } catch (error) {
      console.error('❌ Error enviando notificación de código expirado:', error);
      throw error;
    }
  }

  // Enviar email de verificación
  async sendEmailVerification(
    email: string,
    verificationToken: string,
    userName: string
  ): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: email,
      subject: 'Verifica tu Email - RepuestosPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Verificación de Email</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Gracias por registrarte en RepuestosPro. Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Verificar Email
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Información Importante:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Este enlace expira en 24 horas</li>
                <li>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</li>
                <li style="word-break: break-all; font-family: monospace; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">${verificationUrl}</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Si no creaste esta cuenta, puedes ignorar este correo.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de verificación enviado a ${email}`);
    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      throw error;
    }
  }

  // Enviar email de bienvenida
  async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<void> {
    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: email,
      subject: '¡Bienvenido a RepuestosPro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">¡Bienvenido!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ¡Gracias por unirte a RepuestosPro! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar nuestra amplia selección de repuestos.
            </p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
              <ul style="color: #666; font-size: 14px;">
                <li>Explorar nuestro catálogo de repuestos</li>
                <li>Configurar métodos de pago</li>
                <li>Guardar tus repuestos favoritos</li>
                <li>Recibir notificaciones de ofertas especiales</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de bienvenida enviado a ${email}`);
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw error;
    }
  }

  private getRoleName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'store_manager':
        return 'Gestor de Tienda';
      case 'delivery':
        return 'Delivery';
      default:
        return 'Usuario';
    }
  }

  private getRoleInfo(role: string): { title: string; features: string[]; ctaText: string } {
    switch (role) {
      case 'admin':
        return {
          title: 'Funciones de Administrador',
          features: [
            'Gestionar usuarios y permisos del sistema',
            'Configurar productos y categorías',
            'Monitorear ventas y reportes',
            'Administrar códigos de registro',
            'Configurar Google Analytics',
            'Gestionar sistema de lealtad y premios'
          ],
          ctaText: 'Acceder al Panel de Administración'
        };
      case 'store_manager':
        return {
          title: 'Funciones de Gestor de Tienda',
          features: [
            'Gestionar inventario de repuestos',
            'Procesar pedidos y envíos',
            'Atender consultas de clientes',
            'Generar reportes de ventas',
            'Administrar promociones y descuentos',
            'Coordinar con el equipo de delivery'
          ],
          ctaText: 'Acceder a la Gestión de Tienda'
        };
      case 'delivery':
        return {
          title: 'Funciones de Delivery',
          features: [
            'Ver pedidos asignados para entrega',
            'Actualizar estado de entregas',
            'Confirmar entregas realizadas',
            'Reportar incidencias de entrega',
            'Optimizar rutas de entrega',
            'Comunicarse con clientes sobre entregas'
          ],
          ctaText: 'Ver Pedidos de Entrega'
        };
      default:
        return {
          title: 'Funciones de Cliente',
          features: [
            'Explorar catálogo de repuestos',
            'Realizar compras de forma segura',
            'Ganar puntos de lealtad',
            'Acceder a descuentos exclusivos',
            'Recibir notificaciones de ofertas',
            'Revisar historial de compras'
          ],
          ctaText: 'Comenzar a Comprar'
        };
    }
  }

  async sendWelcomeEmailByRole(
    email: string,
    userName: string,
    role: string
  ): Promise<void> {
    const roleName = this.getRoleName(role);
    const roleInfo = this.getRoleInfo(role);
    
    const mailOptions = {
      from: `"RepuestosPro" <${config.SMTP_USER || 'noreply@repuestospro.com'}>`,
      to: email,
      subject: `¡Bienvenido a RepuestosPro - ${roleName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">RepuestosPro</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">¡Bienvenido como ${roleName}!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ¡Bienvenido a RepuestosPro! Tu cuenta ha sido verificada exitosamente y ya puedes comenzar a usar todas las funciones de nuestra plataforma como <strong>${roleName}</strong>.
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">${roleInfo.title}</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                ${roleInfo.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL || 'http://localhost:3000'}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${roleInfo.ctaText}
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Consejos de Seguridad:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Nunca compartas tu contraseña</li>
                <li>Mantén tu información de contacto actualizada</li>
                <li>Revisa regularmente tu historial de actividad</li>
                <li>Habilita la autenticación de dos factores para mayor seguridad</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de bienvenida para ${roleName} enviado a ${email}`);
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw error;
    }
  }
}

export default new EmailService(); 