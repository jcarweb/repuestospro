import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DeliverySettings {
  _id: string;
  baseRates: {
    minimumDeliveryFee: number;
    baseDeliveryFee: number;
    distanceRate: number;
    timeRate: number;
    peakHoursMultiplier: number;
    weatherMultiplier: number;
  };
  bonuses: {
    performance: {
      enabled: boolean;
      minRating: number;
      bonusAmount: number;
      checkPeriod: string;
    };
    loyalty: {
      enabled: boolean;
      minDeliveries: number;
      bonusAmount: number;
      checkPeriod: string;
    };
    speed: {
      enabled: boolean;
      maxDeliveryTime: number;
      bonusAmount: number;
    };
    volume: {
      enabled: boolean;
      dailyTarget: number;
      weeklyTarget: number;
      dailyBonus: number;
      weeklyBonus: number;
    };
    special: {
      enabled: boolean;
      conditions: Array<{
        name: string;
        description: string;
        bonusAmount: number;
        requirements: any;
      }>;
    };
  };
  withdrawals: {
    minimumAmount: number;
    maximumAmount: number;
    processingFee: number;
    processingTime: number;
    allowedMethods: string[];
  };
  penalties: {
    lateDelivery: {
      enabled: boolean;
      penaltyAmount: number;
      gracePeriod: number;
    };
    cancellation: {
      enabled: boolean;
      penaltyAmount: number;
      maxCancellations: number;
    };
    lowRating: {
      enabled: boolean;
      penaltyAmount: number;
      minRating: number;
    };
  };
  system: {
    autoApproval: boolean;
    maxActiveDeliverys: number;
    commissionDeductionRate: number;
    marketplaceCommissionRate: number;
    isActive: boolean;
  };
  notifications: {
    paymentNotifications: boolean;
    bonusNotifications: boolean;
    penaltyNotifications: boolean;
    withdrawalNotifications: boolean;
    systemAlerts: boolean;
  };
}

const AdminDeliverySettings: React.FC = () => {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rates');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/delivery/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/delivery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const keys = path.split('.');
    let current = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const tabs = [
    { id: 'rates', name: 'Tarifas', icon: CurrencyDollarIcon },
    { id: 'bonuses', name: 'Bonos', icon: GiftIcon },
    { id: 'withdrawals', name: 'Retiros', icon: ClockIcon },
    { id: 'zones', name: 'Zonas', icon: MapPinIcon },
    { id: 'penalties', name: 'Penalizaciones', icon: ExclamationTriangleIcon },
    { id: 'system', name: 'Sistema', icon: CogIcon },
    { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Error cargando configuración</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Deliverys</h1>
        <p className="text-gray-600">Configura las tarifas, bonos y parámetros del sistema de deliverys</p>
      </div>

      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Configuración guardada exitosamente
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tarifas */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Tarifas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa Mínima Garantizada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.baseRates.minimumDeliveryFee}
                    onChange={(e) => updateSettings('baseRates.minimumDeliveryFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa Base por Entrega ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.baseRates.baseDeliveryFee}
                    onChange={(e) => updateSettings('baseRates.baseDeliveryFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa por Kilómetro Adicional ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.baseRates.distanceRate}
                    onChange={(e) => updateSettings('baseRates.distanceRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa por Minuto Adicional ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.baseRates.timeRate}
                    onChange={(e) => updateSettings('baseRates.timeRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multiplicador Horas Pico
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.baseRates.peakHoursMultiplier}
                    onChange={(e) => updateSettings('baseRates.peakHoursMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multiplicador Mal Tiempo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.baseRates.weatherMultiplier}
                    onChange={(e) => updateSettings('baseRates.weatherMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonos */}
          {activeTab === 'bonuses' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Bonos</h3>
              
              {/* Bono por Rendimiento */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Bono por Rendimiento</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.bonuses.performance.enabled}
                      onChange={(e) => updateSettings('bonuses.performance.enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={settings.bonuses.performance.minRating}
                      onChange={(e) => updateSettings('bonuses.performance.minRating', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto del Bono ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.bonuses.performance.bonusAmount}
                      onChange={(e) => updateSettings('bonuses.performance.bonusAmount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período de Verificación
                    </label>
                    <select
                      value={settings.bonuses.performance.checkPeriod}
                      onChange={(e) => updateSettings('bonuses.performance.checkPeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bono por Volumen */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Bono por Volumen</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.bonuses.volume.enabled}
                      onChange={(e) => updateSettings('bonuses.volume.enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Diaria (entregas)
                  </label>
                  <input
                    type="number"
                    value={settings.bonuses.volume.dailyTarget}
                    onChange={(e) => updateSettings('bonuses.volume.dailyTarget', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bono Diario ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.bonuses.volume.dailyBonus}
                    onChange={(e) => updateSettings('bonuses.volume.dailyBonus', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Semanal (entregas)
                  </label>
                  <input
                    type="number"
                    value={settings.bonuses.volume.weeklyTarget}
                    onChange={(e) => updateSettings('bonuses.volume.weeklyTarget', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bono Semanal ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.bonuses.volume.weeklyBonus}
                    onChange={(e) => updateSettings('bonuses.volume.weeklyBonus', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                </div>
              </div>

              {/* Bono por Velocidad */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Bono por Velocidad</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.bonuses.speed.enabled}
                      onChange={(e) => updateSettings('bonuses.speed.enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo Máximo (minutos)
                  </label>
                  <input
                    type="number"
                    value={settings.bonuses.speed.maxDeliveryTime}
                    onChange={(e) => updateSettings('bonuses.speed.maxDeliveryTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto del Bono ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.bonuses.speed.bonusAmount}
                    onChange={(e) => updateSettings('bonuses.speed.bonusAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retiros */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Retiros</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Mínimo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.withdrawals.minimumAmount}
                    onChange={(e) => updateSettings('withdrawals.minimumAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Máximo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.withdrawals.maximumAmount}
                    onChange={(e) => updateSettings('withdrawals.maximumAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión de Procesamiento ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.withdrawals.processingFee}
                    onChange={(e) => updateSettings('withdrawals.processingFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Procesamiento (horas)
                  </label>
                  <input
                    type="number"
                    value={settings.withdrawals.processingTime}
                    onChange={(e) => updateSettings('withdrawals.processingTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sistema */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Aprobación Automática</h4>
                    <p className="text-sm text-gray-600">Aprobar automáticamente nuevos deliverys</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.system.autoApproval}
                      onChange={(e) => updateSettings('system.autoApproval', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Sistema Activo</h4>
                    <p className="text-sm text-gray-600">Habilitar el sistema de deliverys</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.system.isActive}
                      onChange={(e) => updateSettings('system.isActive', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Deliverys Activos
                  </label>
                  <input
                    type="number"
                    value={settings.system.maxActiveDeliverys}
                    onChange={(e) => updateSettings('system.maxActiveDeliverys', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Deducción de Comisión (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.system.commissionDeductionRate * 100}
                    onChange={(e) => updateSettings('system.commissionDeductionRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Comisión del Marketplace (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.system.marketplaceCommissionRate * 100}
                    onChange={(e) => updateSettings('system.marketplaceCommissionRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {key === 'paymentNotifications' ? 'Notificaciones de Pago' :
                         key === 'bonusNotifications' ? 'Notificaciones de Bonos' :
                         key === 'penaltyNotifications' ? 'Notificaciones de Penalizaciones' :
                         key === 'withdrawalNotifications' ? 'Notificaciones de Retiros' :
                         key === 'systemAlerts' ? 'Alertas del Sistema' : key}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {key === 'paymentNotifications' ? 'Notificar pagos recibidos' :
                         key === 'bonusNotifications' ? 'Notificar bonos otorgados' :
                         key === 'penaltyNotifications' ? 'Notificar penalizaciones aplicadas' :
                         key === 'withdrawalNotifications' ? 'Notificar estado de retiros' :
                         key === 'systemAlerts' ? 'Notificar alertas del sistema' : ''}
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSettings(`notifications.${key}`, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón de guardar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliverySettings;
