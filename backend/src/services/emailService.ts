import nodemailer from 'nodemailer';
import config from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
   /* console.log('🔧 Configuración de Email cargada:');
    console.log('   Host:', config.EMAIL_HOST);
    console.log('   Port:', config.EMAIL_PORT);
    console.log('   User:', config.EMAIL_USER);
    console.log('   Secure:', config.EMAIL_SECURE);
    console.log('   Has Password:', !!config.EMAIL_PASS);*/
    
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_SECURE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(user: any, role: string): Promise<void> {
    const roleInfo = this.getRoleInfo(role);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a PiezasYA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
          .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a PiezasYA!</h1>
            <p>Tu plataforma de repuestos automotrices</p>
          </div>
          <div class="content">
            <h2>Hola ${user.name},</h2>
            <p>¡Gracias por registrarte en PiezasYA! Tu cuenta ha sido creada exitosamente como <strong>${this.getRoleName(role)}</strong>.</p>
            
            <h3>${roleInfo.title}</h3>
            <ul>
              ${roleInfo.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <p>Para comenzar a usar todas las funcionalidades disponibles, te recomendamos:</p>
            <ol>
              <li>Completar tu perfil de usuario</li>
              <li>Configurar tus preferencias de seguridad</li>
              <li>Explorar las funcionalidades específicas de tu rol</li>
            </ol>
            
            <a href="${config.FRONTEND_URL}" class="cta">${roleInfo.ctaText}</a>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <p>Saludos,<br>El equipo de PiezasYA</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2025 PiezasYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"PiezasYA" <${config.EMAIL_USER}>`,
      to: user.email,
      subject: '¡Bienvenido a PiezasYA!',
      html
    });
  }

  async sendRegistrationCodeEmail(email: string, code: string, role: string, expiresAt: Date): Promise<void> {
    const roleInfo = this.getRoleInfo(role);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Código de Registro - PiezasYA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #667eea; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0; letter-spacing: 3px; }
          .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Código de Registro</h1>
            <p>PiezasYA - ${this.getRoleName(role)}</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Has sido invitado a unirte a PiezasYA como <strong>${this.getRoleName(role)}</strong>.</p>
            
            <h3>Tu código de registro:</h3>
            <div class="code">${code}</div>
            
            <div class="warning">
              <strong>Importante:</strong> Este código expira el ${expiresAt.toLocaleDateString()} a las ${expiresAt.toLocaleTimeString()}.
            </div>
            
            <h3>${roleInfo.title}</h3>
            <ul>
              ${roleInfo.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <p>Para completar tu registro:</p>
            <ol>
              <li>Haz clic en el botón de abajo</li>
              <li>Ingresa el código de registro</li>
              <li>Completa tu información personal</li>
              <li>Configura tu contraseña</li>
            </ol>
            
            <a href="${config.FRONTEND_URL}/register-with-code" class="cta">Completar Registro</a>
            
            <p>Si no solicitaste este código, puedes ignorar este email.</p>
            
            <p>Saludos,<br>El equipo de PiezasYA</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2025 PiezasYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"PiezasYA" <${config.EMAIL_USER}>`,
      to: email,
      subject: `Código de Registro - ${this.getRoleName(role)}`,
      html
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - PiezasYA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer Contraseña</h1>
            <p>PiezasYA</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Has solicitado restablecer tu contraseña en PiezasYA.</p>
            
            <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            
            <a href="${resetUrl}" class="cta">Restablecer Contraseña</a>
            
            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <p>Saludos,<br>El equipo de PiezasYA</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2025 PiezasYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"PiezasYA" <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecer Contraseña - PiezasYA',
      html
    });
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificar Email - PiezasYA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificar tu Email</h1>
            <p>PiezasYA</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Gracias por registrarte en PiezasYA. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            
            <p>Haz clic en el botón de abajo para verificar tu email:</p>
            
            <a href="${verificationUrl}" class="cta">Verificar Email</a>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <p>Saludos,<br>El equipo de PiezasYA</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2025 PiezasYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"PiezasYA" <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Verificar tu Email - PiezasYA',
      html
    });
  }

  async sendAdminPasswordResetEmail(email: string, userName: string, tempPassword: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contraseña Temporal - PiezasYA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FFC300 0%, #E6B800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta { background: #FFC300; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .temp-password { background: #e8f5e8; border: 2px solid #4CAF50; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Contraseña Temporal</h1>
            <p>PiezasYA - Panel de Administración</p>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Un administrador ha reseteado tu contraseña en PiezasYA.</p>
            
            <div class="temp-password">
              <strong>Tu contraseña temporal es:</strong><br>
              <span style="font-size: 24px; letter-spacing: 2px;">${tempPassword}</span>
            </div>
            
            <p>Por seguridad, te recomendamos cambiar esta contraseña temporal por una nueva:</p>
            
            <a href="${resetUrl}" class="cta">Cambiar Contraseña</a>
            
            <div class="warning">
              <strong>Importante:</strong> 
              <ul>
                <li>Esta contraseña temporal es válida por 1 hora</li>
                <li>Usa el enlace de arriba para establecer una nueva contraseña</li>
                <li>Si no solicitaste este cambio, contacta inmediatamente al administrador</li>
              </ul>
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #FFC300;">${resetUrl}</p>
            
            <p>Saludos,<br>El equipo de PiezasYA</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2025 PiezasYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"PiezasYA" <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Contraseña Temporal - PiezasYA',
      html
    });
  }

  private getRoleName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'store_manager':
        return 'Gestor de Tienda';
      case 'delivery':
        return 'Personal de Delivery';
      case 'client':
        return 'Cliente';
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
            'Gestión completa de usuarios y permisos del sistema',
            'Configuración de productos, categorías y atributos',
            'Monitoreo de ventas y reportes globales',
            'Administración de códigos de registro',
            'Configuración de Google Analytics',
            'Gestión del sistema de lealtad y premios',
            'Configuración de currency, impuestos y tasas',
            'Creación de otros usuarios administradores'
          ],
          ctaText: 'Acceder al Panel de Administración'
        };
      case 'store_manager':
        return {
          title: 'Funciones de Gestor de Tienda',
          features: [
            'Gestión completa del inventario de repuestos',
            'Carga de lotes de productos y gestión individual',
            'Creación y gestión de promociones',
            'Acceso a estadísticas de Google Analytics',
            'Exportación de productos y reportes de ventas',
            'Verificación de estatus de órdenes',
            'Asignación y reasignación de delivery',
            'Configuración de cupones de descuento',
            'Manejo de mensajería privada con clientes',
            'Control de valoraciones y comentarios'
          ],
          ctaText: 'Acceder a la Gestión de Tienda'
        };
      case 'delivery':
        return {
          title: 'Funciones de Delivery',
          features: [
            'Visualización de órdenes asignadas para entrega',
            'Acceso al mapa con rutas de entrega',
            'Reporte de estado de entregas',
            'Configuración de horario de trabajo',
            'Control de disponibilidad (automático/manual)',
            'Visualización de calificaciones recibidas',
            'Configuración del perfil de usuario',
            'Gestión de información del vehículo'
          ],
          ctaText: 'Acceder al Panel de Delivery'
        };
      default:
        return {
          title: 'Funciones de Cliente',
          features: [
            'Exploración del catálogo completo de repuestos',
            'Realización de compras seguras',
            'Sistema de puntos de lealtad',
            'Acceso a descuentos y promociones exclusivas',
            'Configuración de notificaciones y ofertas',
            'Historial completo de compras',
            'Calificación de productos, delivery y tiendas',
            'Configuración de seguridad (2FA, PIN, huella)',
            'Gestión de favoritos y carrito de compras'
          ],
          ctaText: 'Comenzar a Comprar'
        };
    }
  }
}

export default new EmailService(); 