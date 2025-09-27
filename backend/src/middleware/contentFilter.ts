import { Request, Response, NextFunction } from 'express';
import ContentFilter from '../models/ContentFilter';
interface ValidationResult {
  isValid: boolean;
  violations: string[];
  blockedContent: string[];
}
export class ContentFilterService {
  private static patterns = {
    phone: /(\+?[0-9]{1,4}[-.\s]?)?[0-9]{7,15}/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    externalLinks: /(https?:\/\/)?(www\.)?(?!piezasya\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g,
    whatsapp: /(whatsapp|wa\.me|t\.me|telegram|instagram|facebook|fb\.com)/gi
  };
  static async validateContent(content: string, contentType: 'product' | 'chat' | 'review'): Promise<ValidationResult> {
    const violations: string[] = [];
    const blockedContent: string[] = [];
    try {
      // Obtener filtros activos de la base de datos
      const filters = await ContentFilter.findOne({ isActive: true });
      if (!filters) {
        console.log('No se encontraron filtros activos, permitiendo contenido');
        return { isValid: true, violations: [], blockedContent: [] };
      }
      // Validar patrones de teléfono
      const phoneMatches = content.match(this.patterns.phone);
      if (phoneMatches) {
        violations.push('Números de teléfono detectados');
        blockedContent.push(...phoneMatches);
      }
      // Validar emails
      const emailMatches = content.match(this.patterns.email);
      if (emailMatches) {
        violations.push('Direcciones de email detectadas');
        blockedContent.push(...emailMatches);
      }
      // Validar enlaces externos
      const linkMatches = content.match(this.patterns.externalLinks);
      if (linkMatches) {
        violations.push('Enlaces externos detectados');
        blockedContent.push(...linkMatches);
      }
      // Validar palabras clave prohibidas
      const lowerContent = content.toLowerCase();
      const forbiddenFound = filters.forbiddenKeywords.filter(keyword =>
        lowerContent.includes(keyword.toLowerCase())
      );
      if (forbiddenFound.length > 0) {
        violations.push('Palabras clave prohibidas detectadas');
        blockedContent.push(...forbiddenFound);
      }
      // Validar patrones de WhatsApp/Telegram
      const socialMatches = content.match(this.patterns.whatsapp);
      if (socialMatches) {
        violations.push('Referencias a redes sociales detectadas');
        blockedContent.push(...socialMatches);
      }
      // Validar patrones de fraude personalizados
      for (const pattern of filters.fraudPatterns) {
        try {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            violations.push('Patrón de fraude detectado');
            blockedContent.push(...matches);
          }
        } catch (error) {
          console.warn(`Patrón de fraude inválido: ${pattern}`);
        }
      }
      return {
        isValid: violations.length === 0,
        violations,
        blockedContent
      };
    } catch (error) {
      console.error('Error validando contenido:', error);
      // En caso de error, permitir el contenido para no bloquear la aplicación
      return { isValid: true, violations: [], blockedContent: [] };
    }
  }
  static async validateProductDescription(description: string): Promise<ValidationResult> {
    return this.validateContent(description, 'product');
  }
  static async validateChatMessage(message: string): Promise<ValidationResult> {
    return this.validateContent(message, 'chat');
  }
  static async validateReviewContent(content: string): Promise<ValidationResult> {
    return this.validateContent(content, 'review');
  }
}
export const contentFilterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, content, message, review } = req.body;
    const textToValidate = description || content || message || review;
    if (!textToValidate || typeof textToValidate !== 'string') {
      return next();
    }
    const validation = await ContentFilterService.validateContent(textToValidate, 'product');
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'El contenido contiene información no permitida',
        violations: validation.violations,
        blockedContent: validation.blockedContent,
        suggestions: [
          'Usa el chat interno de PiezasYA para contactar al vendedor',
          'No incluyas información de contacto personal',
          'No incluyas enlaces externos'
        ]
      });
    }
    next();
  } catch (error) {
    console.error('Error en content filter middleware:', error);
    // En caso de error, permitir el contenido para no bloquear la aplicación
    next();
  }
};
// Middleware específico para productos
export const productContentFilterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;
    if (!description) {
      return next();
    }
    const validation = await ContentFilterService.validateProductDescription(description);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del producto contiene información no permitida',
        violations: validation.violations,
        blockedContent: validation.blockedContent
      });
    }
    next();
  } catch (error) {
    console.error('Error en product content filter middleware:', error);
    next();
  }
};
// Middleware específico para chat
export const chatContentFilterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      return next();
    }
    const validation = await ContentFilterService.validateChatMessage(message);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje contiene información no permitida',
        violations: validation.violations,
        blockedContent: validation.blockedContent
      });
    }
    next();
  } catch (error) {
    console.error('Error en chat content filter middleware:', error);
    next();
  }
};