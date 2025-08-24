import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Tab, Tabs } from 'react-bootstrap';
import { FaShoppingCart, FaShieldAlt, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-bootstrap-icons';
import CheckoutForm from './CheckoutForm';
import PurchaseGuarantee from '../Warranty/PurchaseGuarantee';
import WarrantyStatus from '../Warranty/WarrantyStatus';
import ClaimForm from '../Warranty/ClaimForm';
import WarrantyAlerts from '../Warranty/WarrantyAlerts';
import ClaimTracker from '../Warranty/ClaimTracker';

const CheckoutIntegrationTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [mockItems, setMockItems] = useState([
    {
      productId: 'mock-product-1',
      productName: 'Filtro de Aceite Premium',
      quantity: 2,
      unitPrice: 25.00,
      totalPrice: 50.00,
      image: 'https://via.placeholder.com/100x100?text=Filtro'
    },
    {
      productId: 'mock-product-2',
      productName: 'Pastillas de Freno',
      quantity: 1,
      unitPrice: 45.00,
      totalPrice: 45.00,
      image: 'https://via.placeholder.com/100x100?text=Pastillas'
    }
  ]);

  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [warrantyLevel, setWarrantyLevel] = useState<'basic' | 'premium' | 'extended' | 'none'>('none');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleWarrantyChange = (enabled: boolean, level: 'basic' | 'premium' | 'extended' | 'none') => {
    setWarrantyEnabled(enabled);
    setWarrantyLevel(level);
  };

  const handleCheckoutSuccess = (id: string) => {
    setTransactionId(id);
    setShowSuccess(true);
    setActiveTab('warranty-status');
  };

  const addMockItem = () => {
    const newItem = {
      productId: `mock-product-${Date.now()}`,
      productName: `Producto ${mockItems.length + 1}`,
      quantity: 1,
      unitPrice: Math.floor(Math.random() * 50) + 10,
      totalPrice: 0,
      image: `https://via.placeholder.com/100x100?text=Producto${mockItems.length + 1}`
    };
    newItem.totalPrice = newItem.quantity * newItem.unitPrice;
    setMockItems([...mockItems, newItem]);
  };

  const removeMockItem = (index: number) => {
    setMockItems(mockItems.filter((_, i) => i !== index));
  };

  const clearMockItems = () => {
    setMockItems([]);
  };

  const resetTest = () => {
    setMockItems([
      {
        productId: 'mock-product-1',
        productName: 'Filtro de Aceite Premium',
        quantity: 2,
        unitPrice: 25.00,
        totalPrice: 50.00,
        image: 'https://via.placeholder.com/100x100?text=Filtro'
      },
      {
        productId: 'mock-product-2',
        productName: 'Pastillas de Freno',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00,
        image: 'https://via.placeholder.com/100x100?text=Pastillas'
      }
    ]);
    setWarrantyEnabled(false);
    setWarrantyLevel('none');
    setTransactionId(null);
    setShowSuccess(false);
    setActiveTab('checkout');
  };

  const subtotal = mockItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <FaShoppingCart className="me-2" />
                Prueba de Integración: Checkout + Sistema de Garantías
              </h3>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'checkout')}
                className="mb-4"
              >
                <Tab eventKey="checkout" title="🛒 Checkout">
                  <Row>
                    <Col lg={8}>
                      <Card className="mb-4">
                        <Card.Header>
                          <h5 className="mb-0">
                            <FaShoppingCart className="me-2" />
                            Productos en Carrito
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          {mockItems.length === 0 ? (
                            <Alert variant="info">
                              No hay productos en el carrito. Agrega algunos productos para continuar.
                            </Alert>
                          ) : (
                            <>
                              {mockItems.map((item, index) => (
                                <div key={index} className="d-flex align-items-center mb-3 p-3 border rounded">
                                  <img 
                                    src={item.image} 
                                    alt={item.productName}
                                    className="me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                  />
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.productName}</h6>
                                    <p className="mb-1 text-muted">
                                      Cantidad: {item.quantity} × ${item.unitPrice.toFixed(2)}
                                    </p>
                                    <Badge bg="primary">${item.totalPrice.toFixed(2)}</Badge>
                                  </div>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeMockItem(index)}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              ))}
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>Subtotal: ${subtotal.toFixed(2)}</strong>
                                </div>
                                <div>
                                  <Button variant="outline-primary" onClick={addMockItem} className="me-2">
                                    Agregar Producto
                                  </Button>
                                  <Button variant="outline-secondary" onClick={clearMockItems}>
                                    Vaciar Carrito
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </Card.Body>
                      </Card>

                      <Card className="mb-4">
                        <Card.Header>
                          <h5 className="mb-0">
                            <FaShieldAlt className="me-2" />
                            Protección de Compra (Preview)
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <PurchaseGuarantee
                            transactionAmount={subtotal}
                            onWarrantyChange={handleWarrantyChange}
                            selectedLevel={warrantyLevel}
                            enabled={warrantyEnabled}
                          />
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4}>
                      <Card className="sticky-top" style={{ top: '2rem' }}>
                        <Card.Header>
                          <h5 className="mb-0">Resumen de Compra</h5>
                        </Card.Header>
                        <Card.Body>
                          {mockItems.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between mb-2">
                              <div>
                                <strong>{item.productName}</strong>
                                <br />
                                <small className="text-muted">
                                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                                </small>
                              </div>
                              <strong>${item.totalPrice.toFixed(2)}</strong>
                            </div>
                          ))}

                          <hr />

                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          
                          <div className="d-flex justify-content-between mb-2">
                            <span>IVA (16%):</span>
                            <span>${(subtotal * 0.16).toFixed(2)}</span>
                          </div>
                          
                          <div className="d-flex justify-content-between mb-2">
                            <span>Comisión (5%):</span>
                            <span>${(subtotal * 0.05).toFixed(2)}</span>
                          </div>
                          
                          {warrantyEnabled && warrantyLevel !== 'none' && (
                            <div className="d-flex justify-content-between mb-2">
                              <span>
                                Protección {warrantyLevel.charAt(0).toUpperCase() + warrantyLevel.slice(1)}:
                              </span>
                              <span>
                                ${(subtotal * (warrantyLevel === 'basic' ? 0.02 : warrantyLevel === 'premium' ? 0.05 : 0.08)).toFixed(2)}
                              </span>
                            </div>
                          )}

                          <hr />

                          <div className="d-flex justify-content-between mb-3">
                            <h5>Total:</h5>
                            <h5>
                              ${(subtotal + (subtotal * 0.16) + (subtotal * 0.05) + 
                                (warrantyEnabled && warrantyLevel !== 'none' ? 
                                  subtotal * (warrantyLevel === 'basic' ? 0.02 : warrantyLevel === 'premium' ? 0.05 : 0.08) : 0)).toFixed(2)}
                            </h5>
                          </div>

                          {warrantyEnabled && warrantyLevel !== 'none' && (
                            <Alert variant="info" className="mb-3">
                              <FaShieldAlt className="me-2" />
                              <strong>Cobertura:</strong> ${(subtotal * (warrantyLevel === 'basic' ? 0.8 : warrantyLevel === 'premium' ? 0.9 : 1)).toFixed(2)}
                            </Alert>
                          )}

                          <div className="d-grid gap-2">
                            <Button
                              variant="primary"
                              size="lg"
                              disabled={mockItems.length === 0}
                              onClick={() => setActiveTab('checkout-form')}
                            >
                              Proceder al Checkout
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="checkout-form" title="💳 Formulario de Pago">
                  {mockItems.length === 0 ? (
                    <Alert variant="warning">
                      <FaExclamationTriangle className="me-2" />
                      No hay productos en el carrito. Regresa a la pestaña "Checkout" para agregar productos.
                    </Alert>
                  ) : (
                    <CheckoutForm
                      items={mockItems}
                      storeId="mock-store-id"
                      onSuccess={handleCheckoutSuccess}
                      onCancel={() => setActiveTab('checkout')}
                    />
                  )}
                </Tab>

                <Tab eventKey="warranty-status" title="🛡️ Estado de Garantías">
                  <WarrantyStatus />
                </Tab>

                <Tab eventKey="claim-form" title="📝 Formulario de Reclamo">
                  <ClaimForm />
                </Tab>

                <Tab eventKey="warranty-alerts" title="🔔 Alertas de Garantía">
                  <WarrantyAlerts />
                </Tab>

                <Tab eventKey="claim-tracker" title="📊 Seguimiento de Reclamos">
                  <ClaimTracker />
                </Tab>
              </Tabs>

              {showSuccess && transactionId && (
                <Alert variant="success" className="mb-4">
                  <FaCheckCircle className="me-2" />
                  <strong>¡Transacción completada exitosamente!</strong>
                  <br />
                  ID de transacción: {transactionId}
                  {warrantyEnabled && (
                    <>
                      <br />
                      Protección de compra activada con nivel: {warrantyLevel}
                    </>
                  )}
                </Alert>
              )}

              <div className="text-center">
                <Button variant="outline-secondary" onClick={resetTest}>
                  Reiniciar Prueba
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutIntegrationTest;
