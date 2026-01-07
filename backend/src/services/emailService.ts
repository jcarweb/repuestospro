import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Enviar email
   */
  async sendEmail({ to, subject, template, data }: EmailData) {
    try {
      const html = this.generateEmailTemplate(template, data);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@piezasyaya.com',
        to,
        subject,
        html
      });

      console.log(`📧 Email enviado a ${to}: ${subject}`);
      return true;
      
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  /**
   * Generar template de email
   */
  private generateEmailTemplate(template: string, data: any): string {
    const templates = {
      'recharge-instructions': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Instrucciones de Pago - Recarga de Wallet</h2>
          
          <p>Hola,</p>
          
          <p>Has solicitado una recarga de <strong>${data.amount} ${data.currency}</strong> 
          que equivale a <strong>${data.convertedAmount} ${data.targetCurrency}</strong> 
          en tu Wallet de PiezasYa.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Instrucciones de Pago:</h3>
            <p><strong>Método:</strong> ${data.paymentMethod.toUpperCase()}</p>
            <p><strong>Referencia:</strong> ${data.reference}</p>
            <p><strong>Instrucciones:</strong> ${data.paymentInstructions.instructions}</p>
        </div>
        
          <p>Una vez realizado el pago, sube el comprobante desde tu panel de usuario.</p>
        
          <p>Saludos,<br>Equipo PiezasYa</p>
        </div>
      `,

      'recharge-approved': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">¡Recarga Aprobada!</h2>
          
          <p>Hola,</p>
          
          <p>Tu recarga de <strong>${data.rechargeRequest.amount} ${data.rechargeRequest.currency}</strong> 
          ha sido aprobada y acreditada a tu Wallet.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la Transacción:</h3>
            <p><strong>Monto acreditado:</strong> ${data.newBalance} ${data.rechargeRequest.targetCurrency}</p>
            <p><strong>Nuevo saldo:</strong> ${data.newBalance} ${data.rechargeRequest.targetCurrency}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Ya puedes usar tu saldo para realizar pagos en efectivo.</p>
          
          <p>Saludos,<br>Equipo PiezasYa</p>
            </div>
      `,

      'recharge-rejected': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Recarga Rechazada</h2>
          
          <p>Hola,</p>
          
          <p>Lamentamos informarte que tu recarga de <strong>${data.rechargeRequest.amount} ${data.rechargeRequest.currency}</strong> 
          ha sido rechazada.</p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Razón del Rechazo:</h3>
            <p>${data.rejectionReason}</p>
          </div>
          
          <p>Si tienes dudas, puedes contactar a nuestro equipo de soporte.</p>
          
          <p>Saludos,<br>Equipo PiezasYa</p>
          </div>
      `,

      'admin-payment-proof': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuevo Comprobante de Pago - Validación Requerida</h2>
          
          <p>Se ha subido un nuevo comprobante de pago que requiere validación.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la Solicitud:</h3>
            <p><strong>ID:</strong> ${data.rechargeRequest._id}</p>
            <p><strong>Usuario:</strong> ${data.user.name} (${data.user.email})</p>
            <p><strong>Monto:</strong> ${data.rechargeRequest.amount} ${data.rechargeRequest.currency}</p>
            <p><strong>Método:</strong> ${data.rechargeRequest.paymentMethod}</p>
            <p><strong>Referencia:</strong> ${data.rechargeRequest.paymentReference}</p>
          </div>
          
          <p>Accede al panel administrativo para validar esta transacción.</p>
        </div>
      `
    };

    return templates[template as keyof typeof templates] || '<p>Email template not found</p>';
  }
}

export const sendEmail = async (emailData: EmailData) => {
  const emailService = new EmailService();
  return await emailService.sendEmail(emailData);
};