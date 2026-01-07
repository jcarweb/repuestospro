import React, { useState, useEffect } from 'react';
import { XCircle, CreditCard, Smartphone, Building, DollarSign, Euro, AlertCircle } from 'lucide-react';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  currencies: string[];
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CreditCard,
    currencies: ['USD', 'EUR'],
    description: 'Pago seguro con PayPal'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: CreditCard,
    currencies: ['USD', 'EUR'],
    description: 'Pago con tarjeta de crédito'
  },
  {
    id: 'zelle',
    name: 'Zelle',
    icon: Smartphone,
    currencies: ['USD'],
    description: 'Transferencia instantánea'
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    icon: Building,
    currencies: ['VES'],
    description: 'Transferencia a cuenta bancaria'
  },
  {
    id: 'pago_movil',
    name: 'Pago Móvil',
    icon: Smartphone,
    currencies: ['VES'],
    description: 'Pago móvil interbancario'
  }
];

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose, onSuccess, storeId }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rechargeRequest, setRechargeRequest] = useState<any>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAmount('');
      setCurrency('USD');
      setPaymentMethod('');
      setError('');
      setRechargeRequest(null);
      setPaymentInstructions(null);
    }
  }, [isOpen]);

  const handleAmountSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setStep(2);
  };

  const handlePaymentMethodSubmit = async () => {
    if (!paymentMethod) {
      setError('Selecciona un método de pago');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Creando solicitud de recarga:', {
        storeId,
        amount: parseFloat(amount),
        currency,
        paymentMethod
      });

      const response = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          storeId,
          amount: parseFloat(amount),
          currency,
          paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setRechargeRequest(data.data.rechargeRequest);
        setPaymentInstructions(data.data.rechargeRequest.paymentInstructions);
        setStep(3);
      } else {
        setError(data.message || 'Error creando solicitud de recarga');
      }
    } catch (err) {
      console.error('Error creando solicitud de recarga:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('paymentReference', `REF-${Date.now()}`);

      const response = await fetch(`/api/recharge/${rechargeRequest.id}/proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStep(4);
      } else {
        setError(data.message || 'Error subiendo comprobante');
      }
    } catch (err) {
      console.error('Error subiendo comprobante:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyIcon = (curr: string) => {
    switch (curr) {
      case 'USD': return <DollarSign className="h-4 w-4" />;
      case 'EUR': return <Euro className="h-4 w-4" />;
      case 'VES': return <Building className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAvailableMethods = () => {
    return paymentMethods.filter(method => 
      method.currencies.includes(currency)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recargar Wallet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Paso 1: Monto */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a recargar
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="VES">VES</option>
                </select>
              </div>
            </div>

          {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAmountSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Método de pago */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-4">
                Selecciona método de pago para {amount} {currency}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {getAvailableMethods().map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6" />
                      <div>
                        <h5 className="font-medium">{method.name}</h5>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
          </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
          </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handlePaymentMethodSubmit}
                disabled={!paymentMethod || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Instrucciones de pago */}
        {step === 3 && paymentInstructions && (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-4">Instrucciones de Pago</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Detalles de la transferencia:</h5>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Banco:</strong> {paymentInstructions.bankName}</p>
                  <p><strong>Beneficiario:</strong> {paymentInstructions.beneficiaryName}</p>
                  <p><strong>Cuenta:</strong> {paymentInstructions.accountNumber}</p>
                  <p><strong>Referencia:</strong> {paymentInstructions.reference}</p>
                  <p><strong>Monto:</strong> {amount} {currency}</p>
                </div>
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm font-medium">Instrucciones:</p>
                  <p className="text-sm text-gray-700">{paymentInstructions.instructions}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir comprobante de pago
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handlePaymentProofUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
              </div>
            </div>
          )}

        {/* Paso 4: Confirmación */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-green-600 mb-2">
                ¡Comprobante Subido!
              </h4>
              <p className="text-gray-600">
                Tu comprobante de pago ha sido enviado para validación. 
                Recibirás una notificación por email cuando sea procesado.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Resumen de la solicitud:</h5>
              <div className="text-sm space-y-1">
                <p><strong>Monto:</strong> {amount} {currency}</p>
                <p><strong>Método:</strong> {paymentMethod}</p>
                <p><strong>Estado:</strong> Pendiente de validación</p>
                <p><strong>Referencia:</strong> {rechargeRequest?.id}</p>
              </div>
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeModal;