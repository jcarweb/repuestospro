import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchConfig extends Document {
  _id: mongoose.Types.ObjectId;
  // Configuración de búsqueda semántica
  semanticSearchEnabled: boolean;
  semanticThreshold: number; // 0-1, umbral para considerar coincidencias semánticas
  
  // Configuración de corrección de errores
  typoCorrectionEnabled: boolean;
  maxEditDistance: number; // Distancia de Levenshtein máxima
  minWordLength: number; // Longitud mínima de palabra para aplicar corrección
  
  // Configuración de búsqueda por campos
  searchableFields: string[]; // Campos en los que buscar
  fieldWeights: Record<string, number>; // Peso de cada campo
  
  // Configuración de filtros
  defaultFilters: {
    category: string[];
    priceRange: { min: number; max: number };
    availability: boolean;
  };
  
  // Configuración de resultados
  maxResults: number;
  minRelevanceScore: number;
  
  // Configuración de sinónimos
  synonymsEnabled: boolean;
  synonymGroups: Array<{
    words: string[];
    weight: number;
  }>;
  
  // Configuración de autocompletado
  autocompleteEnabled: boolean;
  autocompleteMinLength: number;
  autocompleteMaxSuggestions: number;
  
  // Configuración de análisis de consultas
  queryAnalysisEnabled: boolean;
  intentRecognitionEnabled: boolean;
  
  // Metadatos
  createdBy: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SearchConfigSchema = new Schema<ISearchConfig>({
  semanticSearchEnabled: {
    type: Boolean,
    default: true
  },
  semanticThreshold: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  typoCorrectionEnabled: {
    type: Boolean,
    default: true
  },
  maxEditDistance: {
    type: Number,
    default: 2,
    min: 1,
    max: 5
  },
  minWordLength: {
    type: Number,
    default: 3,
    min: 2,
    max: 10
  },
  searchableFields: {
    type: [String],
    default: ['name', 'description', 'category', 'brand', 'model', 'partNumber']
  },
  fieldWeights: {
    type: Object,
    default: {
      name: 10,
      partNumber: 8,
      brand: 6,
      model: 6,
      category: 4,
      description: 2
    }
  },
  defaultFilters: {
    category: {
      type: [String],
      default: []
    },
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    availability: {
      type: Boolean,
      default: true
    }
  },
  maxResults: {
    type: Number,
    default: 50,
    min: 10,
    max: 200
  },
  minRelevanceScore: {
    type: Number,
    default: 0.1,
    min: 0,
    max: 1
  },
  synonymsEnabled: {
    type: Boolean,
    default: true
  },
  synonymGroups: [{
    words: [String],
    weight: {
      type: Number,
      default: 1
    }
  }],
  autocompleteEnabled: {
    type: Boolean,
    default: true
  },
  autocompleteMinLength: {
    type: Number,
    default: 2,
    min: 1,
    max: 5
  },
  autocompleteMaxSuggestions: {
    type: Number,
    default: 10,
    min: 5,
    max: 20
  },
  queryAnalysisEnabled: {
    type: Boolean,
    default: true
  },
  intentRecognitionEnabled: {
    type: Boolean,
    default: true
  },
  createdBy: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  updatedBy: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas
SearchConfigSchema.index({ 'createdBy._id': 1 });
SearchConfigSchema.index({ updatedAt: -1 });

export default mongoose.model<ISearchConfig>('SearchConfig', SearchConfigSchema); 