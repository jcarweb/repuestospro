import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [config, setConfig] = useState<SearchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""/api/search/config', {
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
      setMessage({ type: 'error', text: t('adminSearchConfig.errorLoading') });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/search/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: t('adminSearchConfig.configurationSaved') });
      } else {
        setMessage({ type: 'error', text: result.message || t('adminSearchConfig.errorSaving') });
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setMessage({ type: 'error', text: t('adminSearchConfig.errorSaving') });
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminSearchConfig.accessDenied')}</h2>
          <p className="text-gray-600">{t('adminSearchConfig.accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300]"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminSearchConfig.accessDenied')}</h2>
          <p className="text-gray-600">{t('adminSearchConfig.errorLoadingConfig')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Search className="w-8 h-8 text-[#FFC300]" />
          <h1 className="text-3xl font-bold text-gray-900">{t('adminSearchConfig.title')}</h1>
        </div>
        <p className="text-gray-600">
          {t('adminSearchConfig.subtitle')}
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
            <Brain className="w-5 h-5 text-[#FFC300]" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.semanticSearch')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('adminSearchConfig.enableSemanticSearch')}
              </label>
              <input
                type="checkbox"
                checked={config.semanticSearchEnabled}
                onChange={(e) => handleConfigChange('semanticSearchEnabled', e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.semanticThreshold')}
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.semanticThreshold}
                onChange={(e) => handleConfigChange('semanticThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Corrección de Errores */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.errorCorrection')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('adminSearchConfig.enableErrorCorrection')}
              </label>
              <input
                type="checkbox"
                checked={config.typoCorrectionEnabled}
                onChange={(e) => handleConfigChange('typoCorrectionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.maxEditDistance')}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.maxEditDistance}
                onChange={(e) => handleConfigChange('maxEditDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.minWordLength')}
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={config.minWordLength}
                onChange={(e) => handleConfigChange('minWordLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Campos de Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.searchFields')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.searchableFields')}
              </label>
              <input
                type="text"
                value={config.searchableFields.join(', ')}
                onChange={(e) => handleConfigChange('searchableFields', e.target.value.split(',').map(f => f.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                placeholder="name, description, category, brand"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.fieldWeights')}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resultados y Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.resultsAndFilters')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.maxResults')}
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={config.maxResults}
                onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.minRelevanceScore')}
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.minRelevanceScore}
                onChange={(e) => handleConfigChange('minRelevanceScore', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sinónimos */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.synonymGroups')}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.synonymsEnabled}
                onChange={(e) => handleConfigChange('synonymsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
              <span className="text-sm text-gray-600">{t('adminSearchConfig.enableSynonyms')}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {config.synonymGroups.map((group, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminSearchConfig.words')}
                  </label>
                  <input
                    type="text"
                    value={group.words.join(', ')}
                    onChange={(e) => updateSynonymGroup(index, 'words', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                    placeholder="freno, frenos, pastilla"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminSearchConfig.weight')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={group.weight}
                    onChange={(e) => updateSynonymGroup(index, 'weight', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => removeSynonymGroup(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  {t('adminSearchConfig.remove')}
                </button>
              </div>
            ))}
            
            <button
              onClick={addSynonymGroup}
              className="px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] transition-colors"
            >
              {t('adminSearchConfig.addSynonymGroup')}
            </button>
          </div>
        </div>

        {/* Autocompletado */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.autocomplete')}</h2>
            </div>
            <input
              type="checkbox"
              checked={config.autocompleteEnabled}
              onChange={(e) => handleConfigChange('autocompleteEnabled', e.target.checked)}
              className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.minLengthForAutocomplete')}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.autocompleteMinLength}
                onChange={(e) => handleConfigChange('autocompleteMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSearchConfig.maxSuggestions')}
              </label>
              <input
                type="number"
                min="5"
                max="20"
                value={config.autocompleteMaxSuggestions}
                onChange={(e) => handleConfigChange('autocompleteMaxSuggestions', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Análisis de Consultas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminSearchConfig.queryAnalysis')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('adminSearchConfig.enableQueryAnalysis')}
              </label>
              <input
                type="checkbox"
                checked={config.queryAnalysisEnabled}
                onChange={(e) => handleConfigChange('queryAnalysisEnabled', e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('adminSearchConfig.intentRecognition')}
              </label>
              <input
                type="checkbox"
                checked={config.intentRecognitionEnabled}
                onChange={(e) => handleConfigChange('intentRecognitionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
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
          className="flex items-center space-x-2 px-6 py-3 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t('adminSearchConfig.saving')}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('adminSearchConfig.saveConfiguration')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSearchConfig; 