import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CogIcon, 
  InformationCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowDownIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

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

const QuotationConfig: React.FC = () => {
  const { user } = useAuth();
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
      const response = await fetch('/api/quotation-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorial = async () => {
    try {
      const response = await fetch('/api/quotation-config/tutorial', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await fetch('/api/quotation-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        alert('Configuración guardada exitosamente');
      } else {
        alert('Error al guardar la configuración: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear la configuración a los valores por defecto?')) {
      return;
    }

    try {
      const response = await fetch('/api/quotation-config/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
        alert('Configuración reseteada exitosamente');
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      alert('Error al resetear la configuración');
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error al cargar la configuración</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Cotizaciones</h1>
          <p className="text-gray-600">Configura los parámetros por defecto para tus cotizaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <InformationCircleIcon className="h-5 w-5" />
            Tutorial
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <CogIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración Básica</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de validez por defecto
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={config.defaultValidityDays}
              onChange={(e) => updateConfig({ defaultValidityDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda por defecto
            </label>
            <select
              value={config.defaultCurrency}
              onChange={(e) => updateConfig({ defaultCurrency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - Dólar Americano</option>
              <option value="VES">VES - Bolívar Venezolano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tasa de impuestos por defecto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={config.defaultTaxRate}
              onChange={(e) => updateConfig({ defaultTaxRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tasa de descuento por defecto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={config.defaultDiscountRate}
              onChange={(e) => updateConfig({ defaultDiscountRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <DocumentTextIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Términos y Condiciones</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Términos por defecto
            </label>
            <textarea
              value={config.defaultTerms}
              onChange={(e) => updateConfig({ defaultTerms: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Este presupuesto posee una validez de {validityDays} días y los precios están sujetos a cambios sin previo aviso."
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes usar variables como {`{validityDays}`}, {`{companyName}`}, {`{customerName}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condiciones por defecto
            </label>
            <textarea
              value={config.defaultConditions}
              onChange={(e) => updateConfig({ defaultConditions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Los precios incluyen IVA. El pago debe realizarse según las condiciones acordadas."
            />
          </div>
        </div>
      </div>

      {/* Email Template */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <EnvelopeIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Plantilla de Email</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto del email
            </label>
            <input
              type="text"
              value={config.emailTemplate.subject}
              onChange={(e) => updateConfig({ 
                emailTemplate: { ...config.emailTemplate, subject: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Presupuesto #{quotationNumber} - {companyName}"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuerpo del email
            </label>
            <textarea
              value={config.emailTemplate.body}
              onChange={(e) => updateConfig({ 
                emailTemplate: { ...config.emailTemplate, body: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Estimado/a {customerName}, adjunto encontrará el presupuesto solicitado..."
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Template */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Plantilla de WhatsApp</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje de WhatsApp
          </label>
          <textarea
            value={config.whatsappTemplate}
            onChange={(e) => updateConfig({ whatsappTemplate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Hola {customerName}, le enviamos su presupuesto #{quotationNumber}..."
          />
        </div>
      </div>

      {/* PDF Template */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Plantilla de PDF</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encabezado del PDF
              </label>
              <input
                type="text"
                value={config.pdfTemplate.header}
                onChange={(e) => updateConfig({ 
                  pdfTemplate: { ...config.pdfTemplate, header: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PRESUPUESTO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie de página del PDF
              </label>
              <input
                type="text"
                value={config.pdfTemplate.footer}
                onChange={(e) => updateConfig({ 
                  pdfTemplate: { ...config.pdfTemplate, footer: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gracias por su confianza"
              />
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Información de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={config.pdfTemplate.companyInfo.name}
                  onChange={(e) => updateConfig({ 
                    pdfTemplate: { 
                      ...config.pdfTemplate, 
                      companyInfo: { ...config.pdfTemplate.companyInfo, name: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="text"
                  value={config.pdfTemplate.companyInfo.phone}
                  onChange={(e) => updateConfig({ 
                    pdfTemplate: { 
                      ...config.pdfTemplate, 
                      companyInfo: { ...config.pdfTemplate.companyInfo, phone: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={config.pdfTemplate.companyInfo.email}
                  onChange={(e) => updateConfig({ 
                    pdfTemplate: { 
                      ...config.pdfTemplate, 
                      companyInfo: { ...config.pdfTemplate.companyInfo, email: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio web
                </label>
                <input
                  type="url"
                  value={config.pdfTemplate.companyInfo.website || ''}
                  onChange={(e) => updateConfig({ 
                    pdfTemplate: { 
                      ...config.pdfTemplate, 
                      companyInfo: { ...config.pdfTemplate.companyInfo, website: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <textarea
                value={config.pdfTemplate.companyInfo.address}
                onChange={(e) => updateConfig({ 
                  pdfTemplate: { 
                    ...config.pdfTemplate, 
                    companyInfo: { ...config.pdfTemplate.companyInfo, address: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <BellIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones por Email</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.emailOnSent}
                  onChange={(e) => updateNotificationSettings({ emailOnSent: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando se envía una cotización</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.emailOnViewed}
                  onChange={(e) => updateNotificationSettings({ emailOnViewed: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando el cliente ve la cotización</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.emailOnAccepted}
                  onChange={(e) => updateNotificationSettings({ emailOnAccepted: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando el cliente acepta</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.emailOnRejected}
                  onChange={(e) => updateNotificationSettings({ emailOnRejected: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando el cliente rechaza</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones por WhatsApp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.whatsappOnSent}
                  onChange={(e) => updateNotificationSettings({ whatsappOnSent: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando se envía una cotización</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notificationSettings.whatsappOnViewed}
                  onChange={(e) => updateNotificationSettings({ whatsappOnViewed: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cuando el cliente ve la cotización</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={handleReset}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
        >
          Resetear a valores por defecto
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && tutorial && (
        <TutorialModal
          tutorial={tutorial}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

// Tutorial Modal Component
const TutorialModal: React.FC<{ tutorial: any; onClose: () => void }> = ({ tutorial, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{tutorial.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          {tutorial.sections.map((section: any, index: number) => (
            <div key={index} className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 mb-3">{section.content}</p>
              {section.fields && (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                  {section.fields.map((field: string, fieldIndex: number) => (
                    <li key={fieldIndex}>{field}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {tutorial.tips && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-blue-900 mb-2">💡 Consejos</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                {tutorial.tips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationConfig;
