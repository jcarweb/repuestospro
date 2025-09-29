import { Request, Response } from 'express';
import { QuotationConfig, IQuotationConfig } from '../models/QuotationConfig';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class QuotationConfigController {
  // Obtener configuración de cotizaciones
  async getConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      let config = await QuotationConfig.findOne({ store: user.store });
      
      // Si no existe configuración, crear una por defecto
      if (!config) {
        config = new QuotationConfig({
          store: user.store,
          createdBy: userId,
          updatedBy: userId
        });
        await config.save();
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuración de cotizaciones
  async updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const updateData = req.body;
      updateData.updatedBy = userId;

      const config = await QuotationConfig.findOneAndUpdate(
        { store: user.store },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        data: config,
        message: 'Configuración actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Resetear configuración a valores por defecto
  async resetConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const defaultConfig = {
        store: user.store,
        defaultValidityDays: 30,
        defaultTaxRate: 0,
        defaultDiscountRate: 0,
        defaultCurrency: 'USD',
        defaultTerms: 'Este presupuesto posee una validez de {validityDays} días y los precios están sujetos a cambios sin previo aviso.',
        defaultConditions: 'Los precios incluyen IVA. El pago debe realizarse según las condiciones acordadas. Los productos están sujetos a disponibilidad.',
        emailTemplate: {
          subject: 'Presupuesto #{quotationNumber} - {companyName}',
          body: 'Estimado/a {customerName},\n\nAdjunto encontrará el presupuesto solicitado.\n\nDetalles:\n- Número: {quotationNumber}\n- Total: {total}\n- Válido hasta: {validUntil}\n\nSaludos cordiales,\n{companyName}'
        },
        whatsappTemplate: 'Hola {customerName}, le enviamos su presupuesto #{quotationNumber} por un total de {total}. Válido hasta {validUntil}. Para más información, contáctenos.',
        pdfTemplate: {
          header: 'PRESUPUESTO',
          footer: 'Gracias por su confianza',
          companyInfo: {
            name: '',
            address: '',
            phone: '',
            email: '',
            website: ''
          }
        },
        autoExpireDays: 7,
        allowCustomerAcceptance: true,
        requireCustomerSignature: false,
        notificationSettings: {
          emailOnSent: true,
          emailOnViewed: false,
          emailOnAccepted: true,
          emailOnRejected: true,
          emailOnExpired: true,
          whatsappOnSent: false,
          whatsappOnViewed: false,
          whatsappOnAccepted: false,
          whatsappOnRejected: false,
          whatsappOnExpired: false
        },
        createdBy: userId,
        updatedBy: userId
      };

      const config = await QuotationConfig.findOneAndUpdate(
        { store: user.store },
        defaultConfig,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        data: config,
        message: 'Configuración reseteada exitosamente'
      });
    } catch (error) {
      console.error('Error reseteando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener tutorial de configuración
  async getTutorial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tutorial = {
        title: 'Tutorial de Configuración de Cotizaciones',
        sections: [
          {
            title: 'Configuración Básica',
            content: 'Aquí puedes configurar los valores por defecto para tus cotizaciones, como días de validez, impuestos y descuentos.',
            fields: [
              'defaultValidityDays: Número de días que será válida la cotización',
              'defaultTaxRate: Porcentaje de impuestos aplicado por defecto',
              'defaultDiscountRate: Porcentaje de descuento aplicado por defecto',
              'defaultCurrency: Moneda por defecto para las cotizaciones'
            ]
          },
          {
            title: 'Términos y Condiciones',
            content: 'Define los términos y condiciones que aparecerán en todas tus cotizaciones. Puedes usar variables como {validityDays} para personalizar el contenido.',
            fields: [
              'defaultTerms: Términos generales de la cotización',
              'defaultConditions: Condiciones específicas de venta'
            ]
          },
          {
            title: 'Plantillas de Comunicación',
            content: 'Personaliza los mensajes que se enviarán por email y WhatsApp a tus clientes.',
            fields: [
              'emailTemplate: Plantilla para emails con variables como {customerName}, {quotationNumber}, {total}',
              'whatsappTemplate: Plantilla para mensajes de WhatsApp'
            ]
          },
          {
            title: 'Plantilla PDF',
            content: 'Configura la apariencia de los PDFs de cotización con tu información de empresa.',
            fields: [
              'header: Encabezado del PDF',
              'footer: Pie de página del PDF',
              'companyInfo: Información de tu empresa (nombre, dirección, teléfono, email)'
            ]
          },
          {
            title: 'Configuración de Notificaciones',
            content: 'Define cuándo quieres recibir notificaciones sobre el estado de tus cotizaciones.',
            fields: [
              'emailOnSent: Notificar cuando se envía una cotización',
              'emailOnViewed: Notificar cuando el cliente ve la cotización',
              'emailOnAccepted: Notificar cuando el cliente acepta la cotización',
              'whatsappOnSent: Enviar notificación por WhatsApp cuando se envía'
            ]
          }
        ],
        tips: [
          'Usa variables como {customerName}, {quotationNumber}, {total}, {validUntil} en tus plantillas',
          'Configura bien la información de tu empresa para que aparezca correctamente en los PDFs',
          'Ajusta los días de validez según el tipo de productos que vendes',
          'Activa las notificaciones que consideres importantes para tu negocio'
        ]
      };

      res.json({
        success: true,
        data: tutorial
      });
    } catch (error) {
      console.error('Error obteniendo tutorial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
