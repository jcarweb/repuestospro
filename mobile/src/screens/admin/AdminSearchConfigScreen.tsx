import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { getBaseURL } from '../../config/api';

interface SearchConfig {
  general: {
    enableSearch: boolean;
    searchTimeout: number;
    maxResults: number;
    enableAutocomplete: boolean;
    enableSuggestions: boolean;
  };
  filters: {
    enableCategoryFilter: boolean;
    enablePriceFilter: boolean;
    enableBrandFilter: boolean;
    enableLocationFilter: boolean;
    enableRatingFilter: boolean;
  };
  sorting: {
    defaultSortBy: string;
    enablePriceSort: boolean;
    enableRatingSort: boolean;
    enableDateSort: boolean;
    enableRelevanceSort: boolean;
  };
  advanced: {
    enableFuzzySearch: boolean;
    enableSynonyms: boolean;
    enableStemming: boolean;
    minSearchLength: number;
    enableSearchHistory: boolean;
  };
}

const AdminSearchConfigScreen: React.FC = () => {
  const [config, setConfig] = useState<SearchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (token) {
      loadSearchConfig();
    }
  }, [token]);

  const loadSearchConfig = async () => {
    try {
      setLoading(true);
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/search-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      } else {
        // Configuración por defecto como fallback
        setConfig({
          general: {
            enableSearch: true,
            searchTimeout: 300,
            maxResults: 50,
            enableAutocomplete: true,
            enableSuggestions: true
          },
          filters: {
            enableCategoryFilter: true,
            enablePriceFilter: true,
            enableBrandFilter: true,
            enableLocationFilter: true,
            enableRatingFilter: true
          },
          sorting: {
            defaultSortBy: 'relevance',
            enablePriceSort: true,
            enableRatingSort: true,
            enableDateSort: true,
            enableRelevanceSort: true
          },
          advanced: {
            enableFuzzySearch: true,
            enableSynonyms: true,
            enableStemming: true,
            minSearchLength: 2,
            enableSearchHistory: true
          }
        });
      }
    } catch (error) {
      console.error('Error loading search config:', error);
      showToast('Error cargando configuración de búsqueda', 'error');
      
      // Configuración por defecto en caso de error
      setConfig({
        general: {
          enableSearch: true,
          searchTimeout: 300,
          maxResults: 50,
          enableAutocomplete: true,
          enableSuggestions: true
        },
        filters: {
          enableCategoryFilter: true,
          enablePriceFilter: true,
          enableBrandFilter: true,
          enableLocationFilter: true,
          enableRatingFilter: true
        },
        sorting: {
          defaultSortBy: 'relevance',
          enablePriceSort: true,
          enableRatingSort: true,
          enableDateSort: true,
          enableRelevanceSort: true
        },
        advanced: {
          enableFuzzySearch: true,
          enableSynonyms: true,
          enableStemming: true,
          minSearchLength: 2,
          enableSearchHistory: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (category: string, key: string, value: any) => {
    try {
      setSaving(true);
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/search-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          key,
          value
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConfig(prev => prev ? {
          ...prev,
          [category]: {
            ...prev[category as keyof SearchConfig],
            [key]: value
          }
        } : null);
        showToast('Configuración actualizada exitosamente', 'success');
      } else {
        showToast(data.message || 'Error actualizando configuración', 'error');
      }
    } catch (error) {
      console.error('Error updating search config:', error);
      showToast('Error actualizando configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigCard = (title: string, children: React.ReactNode) => (
    <View style={styles.configCard}>
      <Text style={styles.configCardTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSwitchSetting = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        disabled={saving}
      />
    </View>
  );

  const renderInputSetting = (
    title: string,
    description: string,
    value: string | number,
    onChangeText: (text: string) => void,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value.toString()}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={!saving}
      />
    </View>
  );

  const renderSelectSetting = (
    title: string,
    description: string,
    value: string,
    options: Array<{ value: string; label: string }>,
    onValueChange: (value: string) => void
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.selectContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              value === option.value && styles.selectOptionSelected
            ]}
            onPress={() => onValueChange(option.value)}
            disabled={saving}
          >
            <Text style={[
              styles.selectOptionText,
              value === option.value && styles.selectOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando configuración de búsqueda...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : insets.top + 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración de Búsqueda</Text>
        <Text style={styles.headerSubtitle}>
          Configura parámetros de búsqueda y filtros
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {config && (
          <>
            {/* Configuración General */}
            {renderConfigCard(
              'Configuración General',
              <View>
                {renderSwitchSetting(
                  'Habilitar Búsqueda',
                  'Activa o desactiva la funcionalidad de búsqueda',
                  config.general.enableSearch,
                  (value) => updateConfig('general', 'enableSearch', value)
                )}
                {renderInputSetting(
                  'Timeout de Búsqueda (ms)',
                  'Tiempo máximo de espera para resultados',
                  config.general.searchTimeout,
                  (value) => updateConfig('general', 'searchTimeout', parseInt(value) || 300),
                  'numeric'
                )}
                {renderInputSetting(
                  'Máximo de Resultados',
                  'Número máximo de resultados por búsqueda',
                  config.general.maxResults,
                  (value) => updateConfig('general', 'maxResults', parseInt(value) || 50),
                  'numeric'
                )}
                {renderSwitchSetting(
                  'Autocompletado',
                  'Muestra sugerencias mientras el usuario escribe',
                  config.general.enableAutocomplete,
                  (value) => updateConfig('general', 'enableAutocomplete', value)
                )}
                {renderSwitchSetting(
                  'Sugerencias',
                  'Muestra sugerencias de búsqueda populares',
                  config.general.enableSuggestions,
                  (value) => updateConfig('general', 'enableSuggestions', value)
                )}
              </View>
            )}

            {/* Filtros */}
            {renderConfigCard(
              'Filtros Disponibles',
              <View>
                {renderSwitchSetting(
                  'Filtro por Categoría',
                  'Permite filtrar productos por categoría',
                  config.filters.enableCategoryFilter,
                  (value) => updateConfig('filters', 'enableCategoryFilter', value)
                )}
                {renderSwitchSetting(
                  'Filtro por Precio',
                  'Permite filtrar productos por rango de precio',
                  config.filters.enablePriceFilter,
                  (value) => updateConfig('filters', 'enablePriceFilter', value)
                )}
                {renderSwitchSetting(
                  'Filtro por Marca',
                  'Permite filtrar productos por marca',
                  config.filters.enableBrandFilter,
                  (value) => updateConfig('filters', 'enableBrandFilter', value)
                )}
                {renderSwitchSetting(
                  'Filtro por Ubicación',
                  'Permite filtrar por ubicación geográfica',
                  config.filters.enableLocationFilter,
                  (value) => updateConfig('filters', 'enableLocationFilter', value)
                )}
                {renderSwitchSetting(
                  'Filtro por Calificación',
                  'Permite filtrar por calificación de productos',
                  config.filters.enableRatingFilter,
                  (value) => updateConfig('filters', 'enableRatingFilter', value)
                )}
              </View>
            )}

            {/* Ordenamiento */}
            {renderConfigCard(
              'Opciones de Ordenamiento',
              <View>
                {renderSelectSetting(
                  'Ordenamiento por Defecto',
                  'Criterio de ordenamiento por defecto para resultados',
                  config.sorting.defaultSortBy,
                  [
                    { value: 'relevance', label: 'Relevancia' },
                    { value: 'price_asc', label: 'Precio (Menor a Mayor)' },
                    { value: 'price_desc', label: 'Precio (Mayor a Menor)' },
                    { value: 'rating', label: 'Calificación' },
                    { value: 'date', label: 'Fecha' }
                  ],
                  (value) => updateConfig('sorting', 'defaultSortBy', value)
                )}
                {renderSwitchSetting(
                  'Ordenar por Precio',
                  'Permite ordenar resultados por precio',
                  config.sorting.enablePriceSort,
                  (value) => updateConfig('sorting', 'enablePriceSort', value)
                )}
                {renderSwitchSetting(
                  'Ordenar por Calificación',
                  'Permite ordenar resultados por calificación',
                  config.sorting.enableRatingSort,
                  (value) => updateConfig('sorting', 'enableRatingSort', value)
                )}
                {renderSwitchSetting(
                  'Ordenar por Fecha',
                  'Permite ordenar resultados por fecha',
                  config.sorting.enableDateSort,
                  (value) => updateConfig('sorting', 'enableDateSort', value)
                )}
                {renderSwitchSetting(
                  'Ordenar por Relevancia',
                  'Permite ordenar resultados por relevancia',
                  config.sorting.enableRelevanceSort,
                  (value) => updateConfig('sorting', 'enableRelevanceSort', value)
                )}
              </View>
            )}

            {/* Configuración Avanzada */}
            {renderConfigCard(
              'Configuración Avanzada',
              <View>
                {renderSwitchSetting(
                  'Búsqueda Difusa',
                  'Permite encontrar resultados con errores de escritura',
                  config.advanced.enableFuzzySearch,
                  (value) => updateConfig('advanced', 'enableFuzzySearch', value)
                )}
                {renderSwitchSetting(
                  'Sinónimos',
                  'Busca resultados usando sinónimos de palabras',
                  config.advanced.enableSynonyms,
                  (value) => updateConfig('advanced', 'enableSynonyms', value)
                )}
                {renderSwitchSetting(
                  'Stemming',
                  'Busca la raíz de las palabras para mejores resultados',
                  config.advanced.enableStemming,
                  (value) => updateConfig('advanced', 'enableStemming', value)
                )}
                {renderInputSetting(
                  'Longitud Mínima de Búsqueda',
                  'Número mínimo de caracteres para iniciar búsqueda',
                  config.advanced.minSearchLength,
                  (value) => updateConfig('advanced', 'minSearchLength', parseInt(value) || 2),
                  'numeric'
                )}
                {renderSwitchSetting(
                  'Historial de Búsqueda',
                  'Guarda el historial de búsquedas del usuario',
                  config.advanced.enableSearchHistory,
                  (value) => updateConfig('advanced', 'enableSearchHistory', value)
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  configCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  configCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    textAlign: 'center',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  selectOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectOptionTextSelected: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminSearchConfigScreen;
