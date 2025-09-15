export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  blockedContent: string[];
  suggestions: string[];
}

export class ContentValidator {
  private static patterns = {
    phone: /(\+?[0-9]{1,4}[-.\s]?)?[0-9]{7,15}/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    externalLinks: /(https?:\/\/)?(www\.)?(?!piezasya\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g,
    whatsapp: /(whatsapp|wa\.me|t\.me|telegram|instagram|facebook|fb\.com)/gi
  };

  private static forbiddenKeywords = [
    'whatsapp', 'telegram', 'instagram', 'facebook', 'fuera de la app',
    'contactar directamente', 'llamar', 'escribir', 'mensaje directo',
    'número de teléfono', 'correo electrónico', 'email personal',
    'wa.me', 't.me', 'fb.com', 'ig.com', 'contacto directo',
    'pago fuera', 'transferencia directa', 'efectivo directo',
    'zelle', 'paypal personal', 'venmo', 'cash app'
  ];

  static validateContent(content: string): ValidationResult {
    const violations: string[] = [];
    const blockedContent: string[] = [];
    const suggestions: string[] = [];

    if (!content || typeof content !== 'string') {
      return {
        isValid: true,
        violations: [],
        blockedContent: [],
        suggestions: []
      };
    }

    // Validar patrones de teléfono
    const phoneMatches = content.match(this.patterns.phone);
    if (phoneMatches) {
      violations.push('Números de teléfono detectados');
      blockedContent.push(...phoneMatches);
      suggestions.push('Usa el chat interno de PiezasYA para contactar al vendedor');
    }

    // Validar emails
    const emailMatches = content.match(this.patterns.email);
    if (emailMatches) {
      violations.push('Direcciones de email detectadas');
      blockedContent.push(...emailMatches);
      suggestions.push('Usa el chat interno de PiezasYA para contactar al vendedor');
    }

    // Validar enlaces externos
    const linkMatches = content.match(this.patterns.externalLinks);
    if (linkMatches) {
      violations.push('Enlaces externos detectados');
      blockedContent.push(...linkMatches);
      suggestions.push('No incluyas enlaces externos en las descripciones');
    }

    // Validar palabras clave prohibidas
    const lowerContent = content.toLowerCase();
    const forbiddenFound = this.forbiddenKeywords.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
    
    if (forbiddenFound.length > 0) {
      violations.push('Palabras clave prohibidas detectadas');
      blockedContent.push(...forbiddenFound);
      suggestions.push('Usa el chat interno de PiezasYA para comunicarte');
    }

    // Validar patrones de WhatsApp/Telegram
    const socialMatches = content.match(this.patterns.whatsapp);
    if (socialMatches) {
      violations.push('Referencias a redes sociales detectadas');
      blockedContent.push(...socialMatches);
      suggestions.push('Usa el chat interno de PiezasYA para contactar al vendedor');
    }

    // Validar patrones específicos de fraude
    const fraudPatterns = [
      /contacto\s+directo/gi,
      /pago\s+fuera/gi,
      /transferencia\s+directa/gi,
      /efectivo\s+directo/gi,
      /zelle/gi,
      /paypal\s+personal/gi,
      /venmo/gi,
      /cash\s+app/gi
    ];

    fraudPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        violations.push('Patrón de fraude detectado');
        blockedContent.push(...matches);
        suggestions.push('Usa los métodos de pago seguros de PiezasYA');
      }
    });

    return {
      isValid: violations.length === 0,
      violations,
      blockedContent,
      suggestions
    };
  }

  static getRealTimeFeedback(content: string): ValidationResult {
    return this.validateContent(content);
  }

  static getValidationSummary(content: string): {
    hasViolations: boolean;
    violationCount: number;
    blockedItemsCount: number;
    mainIssue: string | null;
  } {
    const validation = this.validateContent(content);
    
    return {
      hasViolations: !validation.isValid,
      violationCount: validation.violations.length,
      blockedItemsCount: validation.blockedContent.length,
      mainIssue: validation.violations.length > 0 ? validation.violations[0] : null
    };
  }

  static sanitizeContent(content: string): string {
    if (!content) return content;

    let sanitized = content;

    // Remover números de teléfono
    sanitized = sanitized.replace(this.patterns.phone, '[TELÉFONO REMOVIDO]');

    // Remover emails
    sanitized = sanitized.replace(this.patterns.email, '[EMAIL REMOVIDO]');

    // Remover enlaces externos
    sanitized = sanitized.replace(this.patterns.externalLinks, '[ENLACE REMOVIDO]');

    // Remover referencias a redes sociales
    sanitized = sanitized.replace(this.patterns.whatsapp, '[RED SOCIAL REMOVIDA]');

    return sanitized;
  }

  static getSuggestionsForViolation(violation: string): string[] {
    const suggestionMap: { [key: string]: string[] } = {
      'Números de teléfono detectados': [
        'Usa el chat interno de PiezasYA para contactar al vendedor',
        'No incluyas información de contacto personal en las descripciones'
      ],
      'Direcciones de email detectadas': [
        'Usa el chat interno de PiezasYA para contactar al vendedor',
        'La comunicación debe realizarse dentro de la plataforma'
      ],
      'Enlaces externos detectados': [
        'No incluyas enlaces externos en las descripciones',
        'Usa solo enlaces de PiezasYA'
      ],
      'Palabras clave prohibidas detectadas': [
        'Usa el chat interno de PiezasYA para comunicarte',
        'Evita referencias a contactos externos'
      ],
      'Referencias a redes sociales detectadas': [
        'Usa el chat interno de PiezasYA para contactar al vendedor',
        'No incluyas referencias a redes sociales'
      ],
      'Patrón de fraude detectado': [
        'Usa los métodos de pago seguros de PiezasYA',
        'No sugieras pagos fuera de la plataforma'
      ]
    };

    return suggestionMap[violation] || [
      'Usa el chat interno de PiezasYA para contactar al vendedor',
      'Mantén la comunicación dentro de la plataforma'
    ];
  }
}
