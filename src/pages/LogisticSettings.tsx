import React, { useState, useEffect } from 'react';

interface LogisticSettings {
  rates: {
    marketplaceCommissionRate: number;
    logisticFeeBase: number;
    logisticFeeMax: number;
    solidarityPoolRate: number;
    emergencyReserveRate: number;
  };
  deliveryPayments: {
    minimumPayment: number;
    basePayment: number;
    distanceRate: number;
    timeRate: number;
    peakHoursMultiplier: number;
    weatherMultiplier: number;
    priorityMultiplier: number;
  };
  bonusLevels: {
    bronze: {
      threshold: number;
      baseBonus: number;
      multiplier: number;
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    silver: {
      threshold: number;
      baseBonus: number;
      multiplier: number;
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    gold: {
      threshold: number;
      baseBonus: number;
      multiplier: number;
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    elite: {
      threshold: number;
      baseBonus: number;
      multiplier: number;
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
  };
  governance: {
    enabled: boolean;
    minProfitability: number;
    maxLogisticFee: number;
    emergencyThreshold: number;
    surplusThreshold: number;
    adjustmentFrequency: string;
    maxAdjustmentPercent: number;
    autoApprovalThreshold: number;
  };
  withdrawals: {
    minimumAmount: number;
    maximumAmount: number;
    processingFee: number;
    processingTime: number;
    allowedMethods: string[];
    levelLimits: {
      bronze: { dailyLimit: number; weeklyLimit: number };
      silver: { dailyLimit: number; weeklyLimit: number };
      gold: { dailyLimit: number; weeklyLimit: number };
      elite: { dailyLimit: number; weeklyLimit: number };
    };
  };
  notifications: {
    paymentNotifications: boolean;
    bonusNotifications: boolean;
    fundAlerts: boolean;
    governanceChanges: boolean;
    systemAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
}

const LogisticSettings: React.FC = () => {
  const [settings, setSettings] = useState<LogisticSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('rates');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/logistic/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/logistic/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Configuración guardada correctamente');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: string, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof LogisticSettings],
        [field]: value
      }
    });
  };

  const updateNestedSettings = (section: string, subsection: string, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof LogisticSettings],
        [subsection]: {
          ...(settings[section as keyof LogisticSettings] as any)[subsection],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No hay configuración disponible
      </div>
    );
  }

  const tabs = [
    { id: 'rates', name: 'Tasas y Comisiones', icon: '💰' },
    { id: 'payments', name: 'Pagos a Deliverys', icon: '💳' },
    { id: 'bonuses', name: 'Sistema de Bonos', icon: '🎁' },
    { id: 'governance', name: 'Gobernanza', icon: '⚖️' },
    { id: 'withdrawals', name: 'Retiros', icon: '🏧' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema Logístico</h1>
          <p className="text-gray-600">Gestión de parámetros y configuración del fondo logístico</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={fetchSettings}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Recargar
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tasas y Comisiones</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión del Marketplace (%)
                </label>
                <input
                  type="number"
                  value={settings.rates.marketplaceCommissionRate}
                  onChange={(e) => updateSettings('rates', 'marketplaceCommissionRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Logístico Base ($)
                </label>
                <input
                  type="number"
                  value={settings.rates.logisticFeeBase}
                  onChange={(e) => updateSettings('rates', 'logisticFeeBase', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Logístico Máximo ($)
                </label>
                <input
                  type="number"
                  value={settings.rates.logisticFeeMax}
                  onChange={(e) => updateSettings('rates', 'logisticFeeMax', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fondo Solidario (%)
                </label>
                <input
                  type="number"
                  value={settings.rates.solidarityPoolRate}
                  onChange={(e) => updateSettings('rates', 'solidarityPoolRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserva de Emergencia (%)
                </label>
                <input
                  type="number"
                  value={settings.rates.emergencyReserveRate}
                  onChange={(e) => updateSettings('rates', 'emergencyReserveRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Pagos a Deliverys</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pago Mínimo Garantizado ($)
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.minimumPayment}
                  onChange={(e) => updateSettings('deliveryPayments', 'minimumPayment', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pago Base ($)
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.basePayment}
                  onChange={(e) => updateSettings('deliveryPayments', 'basePayment', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por Distancia ($/km)
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.distanceRate}
                  onChange={(e) => updateSettings('deliveryPayments', 'distanceRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por Tiempo ($/min)
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.timeRate}
                  onChange={(e) => updateSettings('deliveryPayments', 'timeRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador Horas Pico
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.peakHoursMultiplier}
                  onChange={(e) => updateSettings('deliveryPayments', 'peakHoursMultiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador Mal Tiempo
                </label>
                <input
                  type="number"
                  value={settings.deliveryPayments.weatherMultiplier}
                  onChange={(e) => updateSettings('deliveryPayments', 'weatherMultiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bonuses' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Sistema de Bonos</h3>
            
            {Object.entries(settings.bonusLevels).map(([level, config]) => (
              <div key={level} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4 capitalize">
                  Nivel {level}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umbral (entregas/semana)
                    </label>
                    <input
                      type="number"
                      value={config.threshold}
                      onChange={(e) => updateNestedSettings('bonusLevels', level, 'threshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bono Base ($)
                    </label>
                    <input
                      type="number"
                      value={config.baseBonus}
                      onChange={(e) => updateNestedSettings('bonusLevels', level, 'baseBonus', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Multiplicador
                    </label>
                    <input
                      type="number"
                      value={config.multiplier}
                      onChange={(e) => updateNestedSettings('bonusLevels', level, 'multiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Beneficios</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.benefits.priorityOrders}
                        onChange={(e) => updateNestedSettings('bonusLevels', level, 'benefits', {
                          ...config.benefits,
                          priorityOrders: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Pedidos Prioritarios</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.benefits.fasterWithdrawals}
                        onChange={(e) => updateNestedSettings('bonusLevels', level, 'benefits', {
                          ...config.benefits,
                          fasterWithdrawals: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Retiros Rápidos</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.benefits.premiumSupport}
                        onChange={(e) => updateNestedSettings('bonusLevels', level, 'benefits', {
                          ...config.benefits,
                          premiumSupport: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Soporte Premium</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Gobernanza Automática</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.governance.enabled}
                  onChange={(e) => updateSettings('governance', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Gobernanza Automática Habilitada
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rentabilidad Mínima (%)
                </label>
                <input
                  type="number"
                  value={settings.governance.minProfitability}
                  onChange={(e) => updateSettings('governance', 'minProfitability', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Logístico Máximo ($)
                </label>
                <input
                  type="number"
                  value={settings.governance.maxLogisticFee}
                  onChange={(e) => updateSettings('governance', 'maxLogisticFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de Emergencia (%)
                </label>
                <input
                  type="number"
                  value={settings.governance.emergencyThreshold}
                  onChange={(e) => updateSettings('governance', 'emergencyThreshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de Superávit (%)
                </label>
                <input
                  type="number"
                  value={settings.governance.surplusThreshold}
                  onChange={(e) => updateSettings('governance', 'surplusThreshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de Ajuste
                </label>
                <select
                  value={settings.governance.adjustmentFrequency}
                  onChange={(e) => updateSettings('governance', 'adjustmentFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Retiros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Mínimo ($)
                </label>
                <input
                  type="number"
                  value={settings.withdrawals.minimumAmount}
                  onChange={(e) => updateSettings('withdrawals', 'minimumAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Máximo ($)
                </label>
                <input
                  type="number"
                  value={settings.withdrawals.maximumAmount}
                  onChange={(e) => updateSettings('withdrawals', 'maximumAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión de Procesamiento ($)
                </label>
                <input
                  type="number"
                  value={settings.withdrawals.processingFee}
                  onChange={(e) => updateSettings('withdrawals', 'processingFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Procesamiento (horas)
                </label>
                <input
                  type="number"
                  value={settings.withdrawals.processingTime}
                  onChange={(e) => updateSettings('withdrawals', 'processingTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métodos Permitidos
              </label>
              <div className="space-y-2">
                {['bank', 'digital', 'crypto'].map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.withdrawals.allowedMethods.includes(method)}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.withdrawals.allowedMethods, method]
                          : settings.withdrawals.allowedMethods.filter(m => m !== method);
                        updateSettings('withdrawals', 'allowedMethods', methods);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticSettings;
