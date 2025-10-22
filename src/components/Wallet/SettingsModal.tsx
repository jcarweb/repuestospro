import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, Bell, DollarSign, Shield } from 'lucide-react';
import { WalletService } from '@/services/walletService';

interface SettingsModalProps {
  storeId: string;
  settings: {
    commissionRate: number;
    minimumRechargeAmount: number;
    maximumRechargeAmount: number;
    lowBalanceThreshold: number;
    criticalBalanceThreshold: number;
    autoRechargeEnabled: boolean;
    autoRechargeAmount: number;
    autoRechargeThreshold: number;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  storeId,
  settings,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      await WalletService.updateWalletSettings(storeId, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="amounts" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Montos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Seguridad</span>
              </TabsTrigger>
            </TabsList>

            {/* Configuración General */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Tasa de Comisión (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Porcentaje que se descuenta de cada venta en efectivo
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Configuración de Montos */}
            <TabsContent value="amounts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumRechargeAmount">Monto Mínimo de Recarga (USD)</Label>
                  <Input
                    id="minimumRechargeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumRechargeAmount}
                    onChange={(e) => handleInputChange('minimumRechargeAmount', parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximumRechargeAmount">Monto Máximo de Recarga (USD)</Label>
                  <Input
                    id="maximumRechargeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximumRechargeAmount}
                    onChange={(e) => handleInputChange('maximumRechargeAmount', parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowBalanceThreshold">Umbral de Saldo Bajo (USD)</Label>
                  <Input
                    id="lowBalanceThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.lowBalanceThreshold}
                    onChange={(e) => handleInputChange('lowBalanceThreshold', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Se enviará notificación cuando el saldo esté por debajo de este monto
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criticalBalanceThreshold">Umbral Crítico (USD)</Label>
                  <Input
                    id="criticalBalanceThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.criticalBalanceThreshold}
                    onChange={(e) => handleInputChange('criticalBalanceThreshold', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Los pagos en efectivo se bloquearán cuando el saldo esté por debajo de este monto
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Configuración de Notificaciones */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsEnabled">Notificaciones Habilitadas</Label>
                    <p className="text-sm text-gray-500">
                      Activar/desactivar todas las notificaciones de Wallet
                    </p>
                  </div>
                  <Switch
                    id="notificationsEnabled"
                    checked={formData.notificationsEnabled}
                    onCheckedChange={(checked) => handleInputChange('notificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                    <p className="text-sm text-gray-500">
                      Recibir notificaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    disabled={!formData.notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">Notificaciones por SMS</Label>
                    <p className="text-sm text-gray-500">
                      Recibir notificaciones por mensaje de texto
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                    disabled={!formData.notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                    <p className="text-sm text-gray-500">
                      Recibir notificaciones push en la aplicación
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={formData.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                    disabled={!formData.notificationsEnabled}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Configuración de Seguridad */}
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoRechargeEnabled">Recarga Automática</Label>
                    <p className="text-sm text-gray-500">
                      Habilitar recarga automática cuando el saldo sea bajo
                    </p>
                  </div>
                  <Switch
                    id="autoRechargeEnabled"
                    checked={formData.autoRechargeEnabled}
                    onCheckedChange={(checked) => handleInputChange('autoRechargeEnabled', checked)}
                  />
                </div>

                {formData.autoRechargeEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="autoRechargeAmount">Monto de Recarga Automática (USD)</Label>
                      <Input
                        id="autoRechargeAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.autoRechargeAmount}
                        onChange={(e) => handleInputChange('autoRechargeAmount', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autoRechargeThreshold">Umbral para Recarga Automática (USD)</Label>
                      <Input
                        id="autoRechargeThreshold"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.autoRechargeThreshold}
                        onChange={(e) => handleInputChange('autoRechargeThreshold', parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">
                        Se activará la recarga automática cuando el saldo esté por debajo de este monto
                      </p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
