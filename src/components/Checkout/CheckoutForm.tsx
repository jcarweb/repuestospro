import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FaShieldAlt, FaCreditCard, FaTruck, FaCheckCircle, FaExclamationTriangle } from 'react-bootstrap-icons';
import PurchaseGuarantee from '../Warranty/PurchaseGuarantee';

interface CheckoutItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface CheckoutSummary {
  subtotal: number;
  taxAmount: number;
  commissionAmount: number;
  warrantyTotal: number;
  totalAmount: number;
  warrantyCoverage: number;
  breakdown: {
    subtotal: number;
    tax: { amount: number; rate: number; description: string };
    commission: { amount: number; rate: number; description: string };
    warranty: { 
      amount: number; 
      level: string;
      coverage: number;
      description: string;
    };
  };
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  storeId: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  items, 
  storeId, 
  onSuccess, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Formulario de envío
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Venezuela',
    phone: ''
  });

  // Información de pago
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [notes, setNotes] = useState('');

  // Garantía
  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [warrantyLevel, setWarrantyLevel] = useState<'basic' | 'premium' | 'extended' | 'none'>('none');

  // Resumen de checkout
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);

  // Calcular resumen inicial
  useEffect(() => {
    calculateCheckoutSummary();
  }, [items, warrantyEnabled, warrantyLevel]);

  const calculateCheckoutSummary = async () => {
    try {
      const response = await fetch('/api/transactions/calculate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          warrantyEnabled,
          warrantyLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCheckoutSummary(data.data);
      } else {
        console.error('Error calculando resumen de checkout');
      }
    } catch (error) {
      console.error('Error calculando resumen de checkout:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar formulario
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
        throw new Error('Por favor completa todos los campos de dirección de envío');
      }

      if (!paymentMethod) {
        throw new Error('Por favor selecciona un método de pago');
      }

      // Crear transacción
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          storeId,
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            warrantyIncluded: warrantyEnabled,
            warrantyType: warrantyLevel
          })),
          shippingAddress,
          paymentMethod,
          warrantyEnabled,
          warrantyLevel,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTransactionId(data.data.transaction.id);
        setSuccess(true);
        if (onSuccess) {
          onSuccess(data.data.transaction.id);
        }
      } else {
        throw new Error(data.message || 'Error al procesar la transacción');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleWarrantyChange = (enabled: boolean, level: 'basic' | 'premium' | 'extended' | 'none') => {
    setWarrantyEnabled(enabled);
    setWarrantyLevel(level);
  };

  if (success && transactionId) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="border-success">
              <Card.Body className="text-center">
                <FaCheckCircle className="text-success mb-3" size={48} />
                <h3 className="text-success mb-3">¡Transacción Completada!</h3>
                <p className="text-muted mb-4">
                  Tu transacción ha sido procesada exitosamente con el número: <strong>{transactionId}</strong>
                </p>
                
                {warrantyEnabled && (
                  <Alert variant="info" className="mb-4">
                    <FaShieldAlt className="me-2" />
                    <strong>Protección de Compra Activada</strong>
                    <br />
                    Tu compra está protegida con garantía {warrantyLevel}. 
                    Recibirás notificaciones sobre el estado de tu protección.
                  </Alert>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/orders')}
                  >
                    Ver Mis Pedidos
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/')}
                  >
                    Continuar Comprando
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">
                <FaTruck className="me-2" />
                Información de Envío
              </h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección de Calle *</Form.Label>
                      <Form.Control
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciudad *</Form.Label>
                      <Form.Control
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado *</Form.Label>
                      <Form.Control
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código Postal *</Form.Label>
                      <Form.Control
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">
                <FaCreditCard className="me-2" />
                Método de Pago
              </h4>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Check
                  type="radio"
                  id="transfer"
                  name="paymentMethod"
                  label="Transferencia Bancaria"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="cash"
                  name="paymentMethod"
                  label="Efectivo"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  label="Tarjeta de Crédito/Débito"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">
                <FaShieldAlt className="me-2" />
                Protección de Compra
              </h4>
            </Card.Header>
            <Card.Body>
              <PurchaseGuarantee
                transactionAmount={checkoutSummary?.subtotal || 0}
                onWarrantyChange={handleWarrantyChange}
                selectedLevel={warrantyLevel}
                enabled={warrantyEnabled}
              />
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Notas Adicionales</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Instrucciones especiales de entrega, comentarios adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '2rem' }}>
            <Card.Header>
              <h5 className="mb-0">Resumen de Compra</h5>
            </Card.Header>
            <Card.Body>
              {items.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{item.productName}</strong>
                    <br />
                    <small className="text-muted">
                      Cantidad: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </small>
                  </div>
                  <strong>${item.totalPrice.toFixed(2)}</strong>
                </div>
              ))}

              <hr />

              {checkoutSummary && (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${checkoutSummary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>IVA (16%):</span>
                    <span>${checkoutSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Comisión (5%):</span>
                    <span>${checkoutSummary.commissionAmount.toFixed(2)}</span>
                  </div>
                  
                  {warrantyEnabled && warrantyLevel !== 'none' && (
                    <div className="d-flex justify-content-between mb-2">
                      <span>
                        Protección {warrantyLevel.charAt(0).toUpperCase() + warrantyLevel.slice(1)}:
                      </span>
                      <span>${checkoutSummary.warrantyTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <hr />

                  <div className="d-flex justify-content-between mb-3">
                    <h5>Total:</h5>
                    <h5>${checkoutSummary.totalAmount.toFixed(2)}</h5>
                  </div>

                  {warrantyEnabled && warrantyLevel !== 'none' && (
                    <Alert variant="info" className="mb-3">
                      <FaShieldAlt className="me-2" />
                      <strong>Cobertura de Protección:</strong> ${checkoutSummary.warrantyCoverage.toFixed(2)}
                    </Alert>
                  )}
                </>
              )}

              {error && (
                <Alert variant="danger" className="mb-3">
                  <FaExclamationTriangle className="me-2" />
                  {error}
                </Alert>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar Compra'}
                </Button>
                
                {onCancel && (
                  <Button
                    variant="outline-secondary"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  Al confirmar tu compra, aceptas nuestros términos y condiciones.
                  {warrantyEnabled && ' Tu compra estará protegida con garantía.'}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutForm;
