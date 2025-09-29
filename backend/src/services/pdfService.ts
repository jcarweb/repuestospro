import PDFDocument from 'pdfkit';
import { IQuotation } from '../models/Quotation';
import { IQuotationConfig } from '../models/QuotationConfig';

export class PDFService {
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  // Generar PDF de cotización
  static async generateQuotationPDF(quotation: IQuotation, config: IQuotationConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Configurar fuente
        doc.fontSize(12);

        // Encabezado
        this.addHeader(doc, config, quotation);

        // Información de la empresa
        this.addCompanyInfo(doc, config);

        // Información del cliente
        this.addCustomerInfo(doc, quotation);

        // Información de la cotización
        this.addQuotationInfo(doc, quotation);

        // Tabla de productos
        this.addProductsTable(doc, quotation);

        // Totales
        this.addTotals(doc, quotation);

        // Términos y condiciones
        this.addTermsAndConditions(doc, quotation, config);

        // Pie de página
        this.addFooter(doc, config);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static addHeader(doc: PDFDocument, config: IQuotationConfig, quotation: IQuotation): void {
    // Logo (si existe)
    if (config.pdfTemplate.logo) {
      // Aquí se podría agregar el logo si está disponible
    }

    // Título
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(config.pdfTemplate.header, { align: 'center' });

    doc.moveDown(0.5);

    // Número de cotización
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`Cotización: ${quotation.quotationNumber}`, { align: 'center' });

    doc.moveDown(1);
  }

  private static addCompanyInfo(doc: PDFDocument, config: IQuotationConfig): void {
    const companyInfo = config.pdfTemplate.companyInfo;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(companyInfo.name);

    if (companyInfo.address) {
      doc.font('Helvetica')
         .text(companyInfo.address);
    }

    if (companyInfo.phone) {
      doc.text(`Tel: ${companyInfo.phone}`);
    }

    if (companyInfo.email) {
      doc.text(`Email: ${companyInfo.email}`);
    }

    if (companyInfo.website) {
      doc.text(`Web: ${companyInfo.website}`);
    }

    doc.moveDown(1);
  }

  private static addCustomerInfo(doc: PDFDocument, quotation: IQuotation): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Información del Cliente');

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Nombre: ${quotation.customer.name}`);

    if (quotation.customer.email) {
      doc.text(`Email: ${quotation.customer.email}`);
    }

    if (quotation.customer.phone) {
      doc.text(`Teléfono: ${quotation.customer.phone}`);
    }

    if (quotation.customer.company) {
      doc.text(`Empresa: ${quotation.customer.company}`);
    }

    if (quotation.customer.address) {
      doc.text(`Dirección: ${quotation.customer.address}`);
    }

    doc.moveDown(1);
  }

  private static addQuotationInfo(doc: PDFDocument, quotation: IQuotation): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Detalles de la Cotización');

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Fecha: ${quotation.createdAt.toLocaleDateString()}`);
    
    doc.text(`Válido hasta: ${quotation.validUntil.toLocaleDateString()}`);
    
    doc.text(`Estado: ${this.getStatusText(quotation.status)}`);

    if (quotation.description) {
      doc.moveDown(0.5);
      doc.text(`Descripción: ${quotation.description}`);
    }

    doc.moveDown(1);
  }

  private static addProductsTable(doc: PDFDocument, quotation: IQuotation): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Productos');

    doc.moveDown(0.5);

    // Encabezados de la tabla
    const tableTop = doc.y;
    const itemHeight = 20;
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;

    // Dibujar encabezados
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Producto', leftMargin, tableTop)
       .text('SKU', leftMargin + 200, tableTop)
       .text('Cant.', leftMargin + 280, tableTop)
       .text('Precio Unit.', leftMargin + 320, tableTop)
       .text('Total', leftMargin + 420, tableTop);

    // Línea separadora
    doc.moveTo(leftMargin, tableTop + 15)
       .lineTo(rightMargin, tableTop + 15)
       .stroke();

    let currentY = tableTop + 20;

    // Productos
    quotation.items.forEach((item, index) => {
      // Verificar si necesitamos una nueva página
      if (currentY + itemHeight > pageHeight - 100) {
        doc.addPage();
        currentY = 50;
      }

      doc.fontSize(9)
         .font('Helvetica')
         .text(item.productName, leftMargin, currentY, { width: 190 })
         .text(item.productSku, leftMargin + 200, currentY, { width: 70 })
         .text(item.quantity.toString(), leftMargin + 280, currentY, { width: 30, align: 'center' })
         .text(`${quotation.currency} ${item.unitPrice.toFixed(2)}`, leftMargin + 320, currentY, { width: 90, align: 'right' })
         .text(`${quotation.currency} ${item.totalPrice.toFixed(2)}`, leftMargin + 420, currentY, { width: 80, align: 'right' });

      if (item.notes) {
        doc.fontSize(8)
           .text(`Notas: ${item.notes}`, leftMargin, currentY + 12, { width: 400 });
        currentY += 25;
      } else {
        currentY += 15;
      }

      // Línea separadora entre productos
      if (index < quotation.items.length - 1) {
        doc.moveTo(leftMargin, currentY)
           .lineTo(rightMargin, currentY)
           .stroke();
        currentY += 5;
      }
    });

    doc.y = currentY + 10;
  }

  private static addTotals(doc: PDFDocument, quotation: IQuotation): void {
    const rightMargin = doc.page.width - 50;
    const currentY = doc.y;

    doc.fontSize(12)
       .font('Helvetica')
       .text('Subtotal:', rightMargin - 150, currentY, { width: 100, align: 'right' })
       .text(`${quotation.currency} ${quotation.subtotal.toFixed(2)}`, rightMargin - 50, currentY, { width: 80, align: 'right' });

    if (quotation.taxRate > 0) {
      doc.text(`Impuestos (${quotation.taxRate}%):`, rightMargin - 150, currentY + 20, { width: 100, align: 'right' })
         .text(`${quotation.currency} ${quotation.taxAmount.toFixed(2)}`, rightMargin - 50, currentY + 20, { width: 80, align: 'right' });
    }

    if (quotation.discountRate > 0) {
      doc.text(`Descuento (${quotation.discountRate}%):`, rightMargin - 150, currentY + 40, { width: 100, align: 'right' })
         .text(`-${quotation.currency} ${quotation.discountAmount.toFixed(2)}`, rightMargin - 50, currentY + 40, { width: 80, align: 'right' });
    }

    // Línea separadora
    doc.moveTo(rightMargin - 150, currentY + 60)
       .lineTo(rightMargin, currentY + 60)
       .stroke();

    // Total
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTAL:', rightMargin - 150, currentY + 70, { width: 100, align: 'right' })
       .text(`${quotation.currency} ${quotation.total.toFixed(2)}`, rightMargin - 50, currentY + 70, { width: 80, align: 'right' });

    doc.y = currentY + 100;
  }

  private static addTermsAndConditions(doc: PDFDocument, quotation: IQuotation, config: IQuotationConfig): void {
    if (quotation.terms || quotation.conditions) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Términos y Condiciones');

      doc.moveDown(0.5);

      if (quotation.terms) {
        doc.fontSize(10)
           .font('Helvetica')
           .text(quotation.terms, { align: 'justify' });
      }

      if (quotation.conditions) {
        doc.moveDown(0.5);
        doc.text(quotation.conditions, { align: 'justify' });
      }

      doc.moveDown(1);
    }

    if (quotation.notes) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Notas Adicionales');

      doc.moveDown(0.5);

      doc.fontSize(10)
         .font('Helvetica')
         .text(quotation.notes, { align: 'justify' });

      doc.moveDown(1);
    }
  }

  private static addFooter(doc: PDFDocument, config: IQuotationConfig): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;

    doc.fontSize(10)
       .font('Helvetica')
       .text(config.pdfTemplate.footer, { align: 'center' });

    // Número de página
    doc.text(`Página ${doc.page.number}`, { align: 'right' });
  }

  private static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'sent': 'Enviado',
      'viewed': 'Visto',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
      'expired': 'Expirado'
    };

    return statusMap[status] || status;
  }

  // Generar PDF de resumen de cotizaciones
  static async generateQuotationsSummaryPDF(quotations: IQuotation[], config: IQuotationConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Encabezado
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('Resumen de Cotizaciones', { align: 'center' });

        doc.moveDown(1);

        // Tabla de cotizaciones
        const tableTop = doc.y;
        const leftMargin = 50;
        const rightMargin = doc.page.width - 50;

        // Encabezados
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Número', leftMargin, tableTop)
           .text('Cliente', leftMargin + 100, tableTop)
           .text('Fecha', leftMargin + 250, tableTop)
           .text('Total', leftMargin + 350, tableTop)
           .text('Estado', leftMargin + 450, tableTop);

        // Línea separadora
        doc.moveTo(leftMargin, tableTop + 15)
           .lineTo(rightMargin, tableTop + 15)
           .stroke();

        let currentY = tableTop + 20;

        quotations.forEach((quotation, index) => {
          doc.fontSize(9)
             .font('Helvetica')
             .text(quotation.quotationNumber, leftMargin, currentY)
             .text(quotation.customer.name, leftMargin + 100, currentY, { width: 140 })
             .text(quotation.createdAt.toLocaleDateString(), leftMargin + 250, currentY)
             .text(`${quotation.currency} ${quotation.total.toFixed(2)}`, leftMargin + 350, currentY, { width: 90, align: 'right' })
             .text(this.getStatusText(quotation.status), leftMargin + 450, currentY);

          currentY += 15;

          if (index < quotations.length - 1) {
            doc.moveTo(leftMargin, currentY)
               .lineTo(rightMargin, currentY)
               .stroke();
            currentY += 5;
          }
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
