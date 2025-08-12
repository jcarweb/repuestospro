import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Filter,
  Target,
  Zap,
  Brain
} from 'lucide-react';

interface SearchConfig {
  semanticSearchEnabled: boolean;
  semanticThreshold: number;
  typoCorrectionEnabled: boolean;
  maxEditDistance: number;
  minWordLength: number;
  searchableFields: string[];
  fieldWeights: Record<string, number>;
  defaultFilters: {
    category: string[];
    priceRange: { min: number; max: number };
    availability: boolean;
  };
  maxResults: number;
  minRelevanceScore: number;
  synonymsEnabled: boolean;
  synonymGroups: Array<{
    words: string[];
    weight: number;
  }>;
  autocompleteEnabled: boolean;
  autocompleteMinLength: number;
  autocompleteMaxSuggestions: number;
  queryAnalysisEnabled: boolean;
  intentRecognitionEnabled: boolean;
}

const AdminSearchConfig: React.FC = () => {
  const { user, token } = useAuth();
  const [config, setConfig] = useState<SearchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      setMessage({ type: 'error', text: 'Error cargando configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/search/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error guardando configuración' });
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setMessage({ type: 'error', text: 'Error guardando configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    if (!config) return;

    setConfig(prev => {
      if (!prev) return prev;

      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof SearchConfig],
            [child]: value
          }
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  const addSynonymGroup = () => {
    if (!config) return;

    setConfig(prev => ({
      ...prev!,
      synonymGroups: [...prev!.synonymGroups, { words: [''], weight: 1 }]
    }));
  };

  const updateSynonymGroup = (index: number, field: string, value: any) => {
    if (!config) return;

    const updatedGroups = [...config.synonymGroups];
    if (field === 'words') {
      updatedGroups[index] = { ...updatedGroups[index], words: value.split(',').map((w: string) => w.trim()) };
    } else {
      updatedGroups[index] = { ...updatedGroups[index], [field]: value };
    }

    setConfig(prev => ({
      ...prev!,
      synonymGroups: updatedGroups
    }));
  };

  const removeSynonymGroup = (index: number) => {
    if (!config) return;

    setConfig(prev => ({
      ...prev!,
      synonymGroups: prev!.synonymGroups.filter((_, i) => i !== index)
    }));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">No se pudo cargar la configuración de búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Search className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Búsqueda</h1>
        </div>
        <p className="text-gray-600">
          Configura los parámetros del sistema de búsqueda inteligente similar a Algolia
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Búsqueda Semántica */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Búsqueda Semántica</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar búsqueda semántica
              </label>
              <input
                type="checkbox"
                checked={config.semanticSearchEnabled}
                onChange={(e) => handleConfigChange('semanticSearchEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umbral semántico (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.semanticThreshold}
                onChange={(e) => handleConfigChange('semanticThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Corrección de Errores */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Corrección de Errores</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar corrección de errores
              </label>
              <input
                type="checkbox"
                checked={config.typoCorrectionEnabled}
                onChange={(e) => handleConfigChange('typoCorrectionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distancia máxima de edición
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.maxEditDistance}
                onChange={(e) => handleConfigChange('maxEditDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud mínima de palabra
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={config.minWordLength}
                onChange={(e) => handleConfigChange('minWordLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Campos de Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Campos de Búsqueda</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campos buscables (separados por comas)
              </label>
              <input
                type="text"
                value={config.searchableFields.join(', ')}
                onChange={(e) => handleConfigChange('searchableFields', e.target.value.split(',').map(f => f.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="name, description, category, brand"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso de campos (JSON)
              </label>
              <textarea
                value={JSON.stringify(config.fieldWeights, null, 2)}
                onChange={(e) => {
                  try {
                    const weights = JSON.parse(e.target.value);
                    handleConfigChange('fieldWeights', weights);
                  } catch (error) {
                    // Ignorar errores de JSON inválido
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resultados y Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resultados y Filtros</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de resultados
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={config.maxResults}
                onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puntuación mínima de relevancia (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.minRelevanceScore}
                onChange={(e) => handleConfigChange('minRelevanceScore', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sinónimos */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">Grupos de Sinónimos</h2>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.synonymsEnabled}
                onChange={(e) => handleConfigChange('synonymsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Habilitar sinónimos</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {config.synonymGroups.map((group, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Palabras (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={group.words.join(', ')}
                    onChange={(e) => updateSynonymGroup(index, 'words', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="freno, frenos, pastilla"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={group.weight}
                    onChange={(e) => updateSynonymGroup(index, 'weight', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => removeSynonymGroup(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            ))}
            
            <button
              onClick={addSynonymGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Grupo de Sinónimos
            </button>
          </div>
        </div>

        {/* Autocompletado */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Autocompletado</h2>
            </div>
            <input
              type="checkbox"
              checked={config.autocompleteEnabled}
              onChange={(e) => handleConfigChange('autocompleteEnabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud mínima para autocompletado
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.autocompleteMinLength}
                onChange={(e) => handleConfigChange('autocompleteMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de sugerencias
              </label>
              <input
                type="number"
                min="5"
                max="20"
                value={config.autocompleteMaxSuggestions}
                onChange={(e) => handleConfigChange('autocompleteMaxSuggestions', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Análisis de Consultas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Análisis de Consultas</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar análisis de consultas
              </label>
              <input
                type="checkbox"
                checked={config.queryAnalysisEnabled}
                onChange={(e) => handleConfigChange('queryAnalysisEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Reconocimiento de intención
              </label>
              <input
                type="checkbox"
                checked={config.intentRecognitionEnabled}
                onChange={(e) => handleConfigChange('intentRecognitionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSearchConfig; 