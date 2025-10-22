import { Request, Response } from 'express';
import { Quotation, IQuotation } from '../models/Quotation';
import { QuotationConfig } from '../models/QuotationConfig';
import Product from '../models/Product';
import User from '../models/User';
import Store from '../models/Store';
import { emailService } from '../services/emailService';
import { WhatsAppService } from '../services/whatsappService';
import { PDFService } from '../services/pdfService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class QuotationController {
  // Crear nueva cotización
  async createQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        customer,
        items,
        validityDays,
        notes,
        terms,
        conditions
      } = req.body;

      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Obtener configuración de la tienda
      const config = await QuotationConfig.findOne({ store: user.stores?.[0] });
      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración de cotizaciones no encontrada'
        });
        return;
      }

      // Validar productos
      const productIds = items.map((item: any) => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      
      if (products.length !== productIds.length) {
        res.status(400).json({
          success: false,
          message: 'Uno o más productos no encontrados'
        });
        return;
      }

      // Crear items de cotización
      const quotationItems = items.map((item: any) => {
        const product = products.find((p: any) => p._id.toString() === item.product);
        if (!product) throw new Error('Producto no encontrado');
        
        return {
          product: product._id,
          productName: product.name,
          productSku: product.sku,
          productOriginalCode: product.originalPartCode,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
          specifications: item.specifications || {},
          notes: item.notes
        };
      });

      // Crear cotización
      const quotation = new Quotation({
        title,
        description,
        customer,
        items: quotationItems,
        validityDays: validityDays || config.defaultValidityDays,
        notes,
        terms: terms || config.defaultTerms,
        conditions: conditions || config.defaultConditions,
        createdBy: userId,
        store: user.stores?.[0]
      });

      await quotation.save();

      res.status(201).json({
        success: true,
        data: quotation,
        message: 'Cotización creada exitosamente'
      });
    } catch (error) {
      console.error('Error creando cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener cotizaciones del usuario
  async getQuotations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const filter: any = { createdBy: userId };
      
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { quotationNumber: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } }
        ];
      }

      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);
      const quotations = await Quotation.find(filter)
        .sort(sort)
        .limit(Number(limit))
        .skip(skip)
        .populate('items.product', 'name sku originalPartCode price images')
        .select('-__v');

      const total = await Quotation.countDocuments(filter);

      res.json({
        success: true,
        data: {
          quotations,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo cotizaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener cotización por ID
  async getQuotationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const quotation = await Quotation.findOne({ _id: id, createdBy: userId })
        .populate('items.product', 'name sku originalPartCode price images description')
        .populate('store', 'name address phone email')
        .populate('createdBy', 'name email');

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: quotation
      });
    } catch (error) {
      console.error('Error obteniendo cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar cotización
  async updateQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const quotation = await Quotation.findOne({ _id: id, createdBy: userId });
      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      if (quotation.status !== 'draft') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden editar cotizaciones en estado borrador'
        });
        return;
      }

      // Si se actualizan los items, recalcular totales
      if (updateData.items) {
        const productIds = updateData.items.map((item: any) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        
        updateData.items = updateData.items.map((item: any) => {
          const product = products.find((p: any) => p._id.toString() === item.product);
          if (!product) throw new Error('Producto no encontrado');
          
          return {
            product: product._id,
            productName: product.name,
            productSku: product.sku,
            productOriginalCode: product.originalPartCode,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
            specifications: item.specifications || {},
            notes: item.notes
          };
        });
      }

      const updatedQuotation = await Quotation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('items.product', 'name sku originalPartCode price images');

      res.json({
        success: true,
        data: updatedQuotation,
        message: 'Cotización actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Enviar cotización
  async sendQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { method, message } = req.body; // method: 'email' | 'whatsapp' | 'both'
      const userId = req.user.id;

      const quotation = await Quotation.findOne({ _id: id, createdBy: userId })
        .populate('store', 'name address phone email')
        .populate('createdBy', 'name email');

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      if (quotation.status !== 'draft') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden enviar cotizaciones en estado borrador'
        });
        return;
      }

      // Obtener configuración
      const config = await QuotationConfig.findOne({ store: quotation.store });
      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración de cotizaciones no encontrada'
        });
        return;
      }

      // Generar PDF
      const pdfBuffer = await PDFService.generateQuotationPDF(quotation, config);

      // Enviar por email
      if (method === 'email' || method === 'both') {
        const emailSubject = config.emailTemplate.subject
          .replace('{quotationNumber}', quotation.quotationNumber)
          .replace('{companyName}', config.pdfTemplate.companyInfo.name);

        const emailBody = config.emailTemplate.body
          .replace('{customerName}', quotation.customer.name)
          .replace('{quotationNumber}', quotation.quotationNumber)
          .replace('{total}', `${quotation.currency} ${quotation.total.toFixed(2)}`)
          .replace('{validUntil}', quotation.validUntil.toLocaleDateString())
          .replace('{companyName}', config.pdfTemplate.companyInfo.name);

        await emailService.sendEmail(
          quotation.customer.email,
          `Cotización ${quotation.quotationNumber}`,
          `Estimado ${quotation.customer.name}, adjunto encontrará la cotización solicitada.`
        );
      }

      // Enviar por WhatsApp
      if (method === 'whatsapp' || method === 'both') {
        const whatsappMessage = config.whatsappTemplate
          .replace('{customerName}', quotation.customer.name)
          .replace('{quotationNumber}', quotation.quotationNumber)
          .replace('{total}', `${quotation.currency} ${quotation.total.toFixed(2)}`)
          .replace('{validUntil}', quotation.validUntil.toLocaleDateString());

        await WhatsAppService.sendQuotationMessage(
          quotation.customer.phone || '',
          whatsappMessage,
          pdfBuffer,
          quotation.quotationNumber
        );
      }

      // Actualizar estado
      quotation.status = 'sent';
      quotation.sentAt = new Date();
      await quotation.save();

      res.json({
        success: true,
        message: 'Cotización enviada exitosamente'
      });
    } catch (error) {
      console.error('Error enviando cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar cotización
  async deleteQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const quotation = await Quotation.findOne({ _id: id, createdBy: userId });
      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      if (quotation.status !== 'draft') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar cotizaciones en estado borrador'
        });
        return;
      }

      await Quotation.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Cotización eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Descargar PDF de cotización
  async downloadQuotationPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const quotation = await Quotation.findOne({ _id: id, createdBy: userId })
        .populate('store', 'name address phone email')
        .populate('createdBy', 'name email');

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      const config = await QuotationConfig.findOne({ store: quotation.store });
      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración de cotizaciones no encontrada'
        });
        return;
      }

      const pdfBuffer = await PDFService.generateQuotationPDF(quotation, config);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="cotizacion-${quotation.quotationNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de cotizaciones
  async getQuotationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;

      const stats = await Quotation.aggregate([
        { $match: { createdBy: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$total' }
          }
        }
      ]);

      const totalQuotations = await Quotation.countDocuments({ createdBy: userId });
      const totalValue = await Quotation.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      res.json({
        success: true,
        data: {
          totalQuotations,
          totalValue: totalValue[0]?.total || 0,
          byStatus: stats
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
