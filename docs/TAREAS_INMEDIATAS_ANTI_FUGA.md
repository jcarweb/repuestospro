# Tareas Inmediatas: Implementación Anti-Fuga de Ventas

## 🚀 PRÓXIMAS 48 HORAS - TAREAS CRÍTICAS

### 1. Sistema de Filtros de Contenido (Día 1)

#### Backend - Crear Modelo ContentFilter
**Archivo**: `backend/src/models/ContentFilter.ts`
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IContentFilter extends Document {
  name: string;
  description: string;
  phonePatterns: RegExp[];
  emailPatterns: RegExp[];
  externalLinks: RegExp[];
  forbiddenKeywords: string[];
  fraudPatterns: RegExp[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentFilterSchema = new Schema<IContentFilter>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  phonePatterns: [{
    type: String,
    required: true
  }],
  emailPatterns: [{
    type: String,
    required: true
  }],
  externalLinks: [{
    type: String,
    required: true
  }],
  forbiddenKeywords: [{
    type: String,
    required: true,
    lowercase: true
  }],
  fraudPatterns: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IContentFilter>('ContentFilter', ContentFilterSchema);
```

#### Backend - Crear Middleware de Validación
**Archivo**: `backend/src/middleware/contentFilter.ts`
```typescript
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

    // Obtener filtros activos de la base de datos
    const filters = await ContentFilter.findOne({ isActive: true });
    
    if (!filters) {
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

    return {
      isValid: violations.length === 0,
      violations,
      blockedContent
    };
  }
}

export const contentFilterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, content } = req.body;
    const textToValidate = description || content;

    if (!textToValidate) {
      return next();
    }

    const validation = await ContentFilterService.validateContent(textToValidate, 'product');

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'El contenido contiene información no permitida',
        violations: validation.violations,
        blockedContent: validation.blockedContent
      });
    }

    next();
  } catch (error) {
    console.error('Error en content filter middleware:', error);
    next();
  }
};
```

#### Frontend - Crear Utilidad de Validación
**Archivo**: `src/utils/contentValidator.ts`
```typescript
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
    'número de teléfono', 'correo electrónico', 'email personal'
  ];

  static validateContent(content: string): ValidationResult {
    const violations: string[] = [];
    const blockedContent: string[] = [];
    const suggestions: string[] = [];

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
}
```

#### Frontend - Crear Componente de Validación en Tiempo Real
**Archivo**: `src/components/ContentValidationAlert.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ContentValidator, ValidationResult } from '../utils/contentValidator';

interface ContentValidationAlertProps {
  content: string;
  onValidationChange: (isValid: boolean) => void;
  showSuggestions?: boolean;
}

const ContentValidationAlert: React.FC<ContentValidationAlertProps> = ({
  content,
  onValidationChange,
  showSuggestions = true
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    violations: [],
    blockedContent: [],
    suggestions: []
  });

  useEffect(() => {
    if (content.trim()) {
      const result = ContentValidator.getRealTimeFeedback(content);
      setValidation(result);
      onValidationChange(result.isValid);
    } else {
      setValidation({
        isValid: true,
        violations: [],
        blockedContent: [],
        suggestions: []
      });
      onValidationChange(true);
    }
  }, [content, onValidationChange]);

  if (!content.trim()) {
    return null;
  }

  if (validation.isValid) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700">
          El contenido cumple con las políticas de la plataforma
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-red-700">
          Contenido no permitido detectado
        </span>
      </div>

      <div className="space-y-2">
        {validation.violations.map((violation, index) => (
          <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">{violation}</p>
              {showSuggestions && validation.suggestions[index] && (
                <p className="text-yellow-700 mt-1">{validation.suggestions[index]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {validation.blockedContent.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Contenido bloqueado:
          </p>
          <div className="flex flex-wrap gap-1">
            {validation.blockedContent.map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentValidationAlert;
```

### 2. Integrar Validación en Formularios Existentes (Día 1-2)

#### Modificar Formulario de Productos
**Archivo**: `src/components/ProductForm.tsx` (modificar existente)
```typescript
// Agregar import
import ContentValidationAlert from './ContentValidationAlert';

// Agregar estado para validación
const [descriptionValidation, setDescriptionValidation] = useState(true);

// Agregar en el formulario de descripción
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Descripción del Producto
  </label>
  <textarea
    value={formData.description}
    onChange={(e) => handleInputChange('description', e.target.value)}
    rows={4}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
    placeholder="Describe tu producto..."
  />
  <ContentValidationAlert
    content={formData.description}
    onValidationChange={setDescriptionValidation}
  />
</div>

// Modificar el botón de envío
<button
  type="submit"
  disabled={!descriptionValidation || isLoading}
  className="w-full bg-[#FFC300] text-white py-2 px-4 rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? 'Guardando...' : 'Guardar Producto'}
</button>
```

### 3. Crear Script de Datos Iniciales (Día 1)

#### Script de Configuración Inicial
**Archivo**: `backend/scripts/seed-content-filters.js`
```javascript
const mongoose = require('mongoose');
const ContentFilter = require('../src/models/ContentFilter');

const contentFilters = [
  {
    name: 'Filtro Básico Anti-Fuga',
    description: 'Filtro principal para prevenir fugas de venta fuera de la app',
    phonePatterns: [
      '\\+?[0-9]{1,4}[-.\\s]?[0-9]{7,15}',
      '\\([0-9]{3}\\)\\s*[0-9]{3}-[0-9]{4}',
      '[0-9]{3}-[0-9]{3}-[0-9]{4}'
    ],
    emailPatterns: [
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
    ],
    externalLinks: [
      '(https?:\\/\\/)?(www\\.)?(?!piezasya\\.com)[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}'
    ],
    forbiddenKeywords: [
      'whatsapp', 'telegram', 'instagram', 'facebook', 'fuera de la app',
      'contactar directamente', 'llamar', 'escribir', 'mensaje directo',
      'número de teléfono', 'correo electrónico', 'email personal',
      'wa.me', 't.me', 'fb.com', 'ig.com'
    ],
    fraudPatterns: [
      'contacto directo', 'pago fuera', 'transferencia directa',
      'efectivo directo', 'zelle', 'paypal personal'
    ],
    isActive: true,
    createdBy: null // Se asignará al primer admin encontrado
  }
];

async function seedContentFilters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    
    // Buscar un admin para asignar como creador
    const User = require('../src/models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('No se encontró ningún administrador para asignar los filtros');
      return;
    }

    // Eliminar filtros existentes
    await ContentFilter.deleteMany({});
    
    // Crear nuevos filtros
    const filtersWithCreator = contentFilters.map(filter => ({
      ...filter,
      createdBy: admin._id
    }));
    
    const createdFilters = await ContentFilter.insertMany(filtersWithCreator);
    
    console.log(`✅ Se crearon ${createdFilters.length} filtros de contenido`);
    console.log('Filtros creados:', createdFilters.map(f => f.name));
    
  } catch (error) {
    console.error('Error creando filtros de contenido:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedContentFilters();
```

### 4. Actualizar Rutas de Productos (Día 2)

#### Modificar Controlador de Productos
**Archivo**: `backend/src/controllers/productController.ts` (modificar existente)
```typescript
// Agregar import
import { contentFilterMiddleware } from '../middleware/contentFilter';

// Agregar middleware a las rutas de creación y actualización
// En las rutas de productos, agregar:
router.post('/products', contentFilterMiddleware, productController.createProduct);
router.put('/products/:id', contentFilterMiddleware, productController.updateProduct);
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN INMEDIATA

### Día 1 - Mañana
- [ ] Crear modelo `ContentFilter.ts`
- [ ] Crear middleware `contentFilter.ts`
- [ ] Crear utilidad `contentValidator.ts`
- [ ] Crear componente `ContentValidationAlert.tsx`

### Día 1 - Tarde
- [ ] Integrar validación en formulario de productos
- [ ] Crear script de datos iniciales
- [ ] Probar validación en frontend

### Día 2 - Mañana
- [ ] Actualizar rutas de productos con middleware
- [ ] Probar validación en backend
- [ ] Crear datos de prueba

### Día 2 - Tarde
- [ ] Testing completo del sistema
- [ ] Documentar funcionalidad
- [ ] Preparar siguiente fase (Chat Interno)

---

## 🎯 PRÓXIMAS TAREAS (Semana 1)

### Día 3-4: Sistema de Chat Interno
- [ ] Crear modelo `Chat.ts` y `ChatMessage.ts`
- [ ] Implementar WebSocket server
- [ ] Crear servicio `ChatService.ts`

### Día 5-7: Sistema de Garantías
- [ ] Crear modelo `PurchaseGuarantee.ts`
- [ ] Implementar alertas de garantía
- [ ] Crear sistema de promociones exclusivas

---

## 📊 MÉTRICAS DE SEGUIMIENTO

### Métricas Diarias
- [ ] Número de validaciones realizadas
- [ ] Contenido bloqueado por tipo
- [ ] Tasa de éxito de validación
- [ ] Tiempo de respuesta del sistema

### Métricas Semanales
- [ ] Reducción de intentos de contacto externo
- [ ] Adopción de validación por usuarios
- [ ] Efectividad de filtros
- [ ] Feedback de usuarios

---

**Nota**: Este plan está diseñado para implementación inmediata. Cada tarea incluye código específico y puede ejecutarse de forma independiente. Se recomienda seguir el orden establecido para maximizar la efectividad del sistema anti-fuga.
