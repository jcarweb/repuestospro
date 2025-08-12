import nodemailer from 'nodemailer';
import config from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
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
        <title>Bienvenido a RepuestosPro</title>
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
            <h1>¡Bienvenido a RepuestosPro!</h1>
            <p>Tu plataforma de repuestos automotrices</p>
          </div>
          <div class="content">
            <h2>Hola ${user.name},</h2>
            <p>¡Gracias por registrarte en RepuestosPro! Tu cuenta ha sido creada exitosamente como <strong>${this.getRoleName(role)}</strong>.</p>
            
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
            
            <p>Saludos,<br>El equipo de RepuestosPro</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"RepuestosPro" <${config.EMAIL_USER}>`,
      to: user.email,
      subject: '¡Bienvenido a RepuestosPro!',
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
        <title>Código de Registro - RepuestosPro</title>
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
            <p>RepuestosPro - ${this.getRoleName(role)}</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Has sido invitado a unirte a RepuestosPro como <strong>${this.getRoleName(role)}</strong>.</p>
            
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
            
            <p>Saludos,<br>El equipo de RepuestosPro</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"RepuestosPro" <${config.EMAIL_USER}>`,
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
        <title>Restablecer Contraseña - RepuestosPro</title>
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
            <p>RepuestosPro</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Has solicitado restablecer tu contraseña en RepuestosPro.</p>
            
            <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            
            <a href="${resetUrl}" class="cta">Restablecer Contraseña</a>
            
            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <p>Saludos,<br>El equipo de RepuestosPro</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"RepuestosPro" <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecer Contraseña - RepuestosPro',
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
        <title>Verificar Email - RepuestosPro</title>
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
            <p>RepuestosPro</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Gracias por registrarte en RepuestosPro. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            
            <p>Haz clic en el botón de abajo para verificar tu email:</p>
            
            <a href="${verificationUrl}" class="cta">Verificar Email</a>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <p>Saludos,<br>El equipo de RepuestosPro</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 RepuestosPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"RepuestosPro" <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Verificar tu Email - RepuestosPro',
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