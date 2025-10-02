import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface QuotationConfig {
  _id: string;
  defaultValidityDays: number;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  defaultCurrency: string;
  defaultTerms: string;
  defaultConditions: string;
  emailTemplate: {
    subject: string;
    body: string;
  };
  whatsappTemplate: string;
  pdfTemplate: {
    header: string;
    footer: string;
    logo?: string;
    companyInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
      website?: string;
    };
  };
  autoExpireDays: number;
  allowCustomerAcceptance: boolean;
  requireCustomerSignature: boolean;
  notificationSettings: {
    emailOnSent: boolean;
    emailOnViewed: boolean;
    emailOnAccepted: boolean;
    emailOnRejected: boolean;
    emailOnExpired: boolean;
    whatsappOnSent: boolean;
    whatsappOnViewed: boolean;
    whatsappOnAccepted: boolean;
    whatsappOnRejected: boolean;
    whatsappOnExpired: boolean;
  };
}

const QuotationConfigScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [config, setConfig] = useState<QuotationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
    fetchTutorial();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotation-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      Alert.alert('Error', 'No se pudo cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorial = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotation-config/tutorial`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setTutorial(data.data);
      }
    } catch (error) {
      console.error('Error fetching tutorial:', error);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotation-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Configuración guardada exitosamente');
      } else {
        Alert.alert('Error', data.message || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      Alert.alert('Error', 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Confirmar reset',
      '¿Estás seguro de que quieres resetear la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/quotation-config/reset`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              const data = await response.json();
              if (data.success) {
                setConfig(data.data);
                Alert.alert('Éxito', 'Configuración reseteada exitosamente');
              }
            } catch (error) {
              console.error('Error resetting config:', error);
              Alert.alert('Error', 'Error al resetear la configuración');
            }
          },
        },
      ]
    );
  };

  const updateConfig = (updates: Partial<QuotationConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const updateNotificationSettings = (updates: Partial<QuotationConfig['notificationSettings']>) => {
    if (config) {
      setConfig({
        ...config,
        notificationSettings: { ...config.notificationSettings, ...updates }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  if (!config) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar la configuración</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <TouchableOpacity onPress={() => setShowTutorial(true)}>
          <Ionicons name="help-circle" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Días de validez por defecto</Text>
            <TextInput
              style={styles.input}
              value={config.defaultValidityDays.toString()}
              onChangeText={(text) => updateConfig({ defaultValidityDays: parseInt(text) || 30 })}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Moneda por defecto</Text>
            <View style={styles.currencyContainer}>
              {['USD', 'VES', 'EUR'].map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyButton,
                    config.defaultCurrency === currency && styles.currencyButtonActive
                  ]}
                  onPress={() => updateConfig({ defaultCurrency: currency })}
                >
                  <Text style={[
                    styles.currencyButtonText,
                    config.defaultCurrency === currency && styles.currencyButtonTextActive
                  ]}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de impuestos por defecto (%)</Text>
            <TextInput
              style={styles.input}
              value={config.defaultTaxRate.toString()}
              onChangeText={(text) => updateConfig({ defaultTaxRate: parseFloat(text) || 0 })}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de descuento por defecto (%)</Text>
            <TextInput
              style={styles.input}
              value={config.defaultDiscountRate.toString()}
              onChangeText={(text) => updateConfig({ defaultDiscountRate: parseFloat(text) || 0 })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Términos por defecto</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={config.defaultTerms}
              onChangeText={(text) => updateConfig({ defaultTerms: text })}
              placeholder="Este presupuesto posee una validez de {validityDays} días..."
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condiciones por defecto</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={config.defaultConditions}
              onChangeText={(text) => updateConfig({ defaultConditions: text })}
              placeholder="Los precios incluyen IVA..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Email Template */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plantilla de Email</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Asunto del email</Text>
            <TextInput
              style={styles.input}
              value={config.emailTemplate.subject}
              onChangeText={(text) => updateConfig({ 
                emailTemplate: { ...config.emailTemplate, subject: text }
              })}
              placeholder="Presupuesto #{quotationNumber} - {companyName}"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cuerpo del email</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={config.emailTemplate.body}
              onChangeText={(text) => updateConfig({ 
                emailTemplate: { ...config.emailTemplate, body: text }
              })}
              placeholder="Estimado/a {customerName}..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* WhatsApp Template */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plantilla de WhatsApp</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mensaje de WhatsApp</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={config.whatsappTemplate}
              onChangeText={(text) => updateConfig({ whatsappTemplate: text })}
              placeholder="Hola {customerName}..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* PDF Template */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plantilla de PDF</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Encabezado del PDF</Text>
            <TextInput
              style={styles.input}
              value={config.pdfTemplate.header}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { ...config.pdfTemplate, header: text }
              })}
              placeholder="PRESUPUESTO"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pie de página del PDF</Text>
            <TextInput
              style={styles.input}
              value={config.pdfTemplate.footer}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { ...config.pdfTemplate, footer: text }
              })}
              placeholder="Gracias por su confianza"
            />
          </View>
          
          <Text style={styles.subsectionTitle}>Información de la Empresa</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la empresa *</Text>
            <TextInput
              style={styles.input}
              value={config.pdfTemplate.companyInfo.name}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { 
                  ...config.pdfTemplate, 
                  companyInfo: { ...config.pdfTemplate.companyInfo, name: text }
                }
              })}
              placeholder="Nombre de tu empresa"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              value={config.pdfTemplate.companyInfo.phone}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { 
                  ...config.pdfTemplate, 
                  companyInfo: { ...config.pdfTemplate.companyInfo, phone: text }
                }
              })}
              placeholder="+58 412 123 4567"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={config.pdfTemplate.companyInfo.email}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { 
                  ...config.pdfTemplate, 
                  companyInfo: { ...config.pdfTemplate.companyInfo, email: text }
                }
              })}
              placeholder="empresa@ejemplo.com"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={config.pdfTemplate.companyInfo.address}
              onChangeText={(text) => updateConfig({ 
                pdfTemplate: { 
                  ...config.pdfTemplate, 
                  companyInfo: { ...config.pdfTemplate.companyInfo, address: text }
                }
              })}
              placeholder="Dirección completa de la empresa"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Notificaciones</Text>
          
          <Text style={styles.subsectionTitle}>Notificaciones por Email</Text>
          {Object.entries(config.notificationSettings)
            .filter(([key]) => key.startsWith('email'))
            .map(([key, value]) => (
              <View key={key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {key === 'emailOnSent' && 'Cuando se envía una cotización'}
                  {key === 'emailOnViewed' && 'Cuando el cliente ve la cotización'}
                  {key === 'emailOnAccepted' && 'Cuando el cliente acepta'}
                  {key === 'emailOnRejected' && 'Cuando el cliente rechaza'}
                  {key === 'emailOnExpired' && 'Cuando la cotización expira'}
                </Text>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateNotificationSettings({ [key]: newValue })}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            ))}
          
          <Text style={styles.subsectionTitle}>Notificaciones por WhatsApp</Text>
          {Object.entries(config.notificationSettings)
            .filter(([key]) => key.startsWith('whatsapp'))
            .map(([key, value]) => (
              <View key={key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {key === 'whatsappOnSent' && 'Cuando se envía una cotización'}
                  {key === 'whatsappOnViewed' && 'Cuando el cliente ve la cotización'}
                  {key === 'whatsappOnAccepted' && 'Cuando el cliente acepta'}
                  {key === 'whatsappOnRejected' && 'Cuando el cliente rechaza'}
                  {key === 'whatsappOnExpired' && 'Cuando la cotización expira'}
                </Text>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateNotificationSettings({ [key]: newValue })}
                  trackColor={{ false: '#D1D5DB', true: '#25D366' }}
                  thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={20} color="#EF4444" />
          <Text style={styles.resetButtonText}>Resetear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Tutorial Modal */}
      {showTutorial && tutorial && (
        <TutorialModal
          tutorial={tutorial}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </View>
  );
};

// Tutorial Modal Component
const TutorialModal: React.FC<{ tutorial: any; onClose: () => void }> = ({ tutorial, onClose }) => {
  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{tutorial.title}</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.tutorialContent}>
          {tutorial.sections.map((section: any, index: number) => (
            <View key={index} style={styles.tutorialSection}>
              <Text style={styles.tutorialSectionTitle}>{section.title}</Text>
              <Text style={styles.tutorialSectionContent}>{section.content}</Text>
              {section.fields && (
                <View style={styles.tutorialFields}>
                  {section.fields.map((field: string, fieldIndex: number) => (
                    <Text key={fieldIndex} style={styles.tutorialField}>
                      • {field}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
          {tutorial.tips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Consejos</Text>
              {tutorial.tips.map((tip: string, index: number) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  currencyButtonTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  resetButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  tutorialContent: {
    flex: 1,
    padding: 16,
  },
  tutorialSection: {
    marginBottom: 24,
  },
  tutorialSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tutorialSectionContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  tutorialFields: {
    marginTop: 8,
  },
  tutorialField: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tipsContainer: {
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 4,
  },
});

export default QuotationConfigScreen;
