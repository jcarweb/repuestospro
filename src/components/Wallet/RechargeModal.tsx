import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { WalletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/currency';

interface RechargeModalProps {
  storeId: string;
  settings: {
    minimumRechargeAmount: number;
    maximumRechargeAmount: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  storeId,
  settings,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    reference: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria', icon: Banknote },
    { value: 'credit_card', label: 'Tarjeta de Crédito', icon: CreditCard },
    { value: 'mobile_payment', label: 'Pago Móvil', icon: Smartphone },
    { value: 'cash', label: 'Efectivo', icon: Banknote }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.paymentMethod) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount < settings.minimumRechargeAmount) {
      setError(`El monto mínimo de recarga es ${formatCurrency(settings.minimumRechargeAmount, 'USD')}`);
      return;
    }

    if (amount > settings.maximumRechargeAmount) {
      setError(`El monto máximo de recarga es ${formatCurrency(settings.maximumRechargeAmount, 'USD')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await WalletService.rechargeWallet(storeId, {
        amount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        description: formData.description || `Recarga de ${formatCurrency(amount, 'USD')}`
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la recarga');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, amount: sanitized }));
  };

  const selectedPaymentMethod = paymentMethods.find(method => method.value === formData.paymentMethod);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recargar Wallet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (USD)</Label>
            <Input
              id="amount"
              type="text"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-gray-500">
              Mínimo: {formatCurrency(settings.minimumRechargeAmount, 'USD')} | 
              Máximo: {formatCurrency(settings.maximumRechargeAmount, 'USD')}
            </p>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un método de pago" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center space-x-2">
                      <method.icon className="h-4 w-4" />
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referencia */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referencia (Opcional)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Número de transacción, comprobante, etc."
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción adicional de la recarga"
              rows={3}
            />
          </div>

          {/* Resumen */}
          {formData.amount && formData.paymentMethod && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de la Recarga</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monto:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span>{selectedPaymentMethod?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nuevo saldo:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(parseFloat(formData.amount) || 0, 'USD')} (estimado)
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Procesando...' : 'Recargar Wallet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
