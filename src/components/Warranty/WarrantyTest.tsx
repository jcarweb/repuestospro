import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { ShieldCheck, ExclamationTriangle, FileText, CheckCircle } from 'react-bootstrap-icons';
import PurchaseGuarantee from './PurchaseGuarantee';
import WarrantyStatus from './WarrantyStatus';
import ClaimForm from './ClaimForm';

interface WarrantyOption {
  type: string;
  level: string;
  coverageAmount: number;
  coveragePercentage: number;
  cost: number;
  durationDays: number;
  description: string;
  terms: {
    coversDefectiveProducts: boolean;
    coversNonDelivery: boolean;
    coversNotAsDescribed: boolean;
    coversLateDelivery: boolean;
    returnWindowDays: number;
    claimWindowDays: number;
  };
}

const WarrantyTest: React.FC = () => {
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption | null>(null);
  const [activeTab, setActiveTab] = useState('purchase');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedWarrantyForClaim, setSelectedWarrantyForClaim] = useState<string | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState<string | null>(null);

  // Datos de ejemplo
  const mockTransactionAmount = 1500000; // $1,500,000 COP
  const mockStoreId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799439012';
  const mockTransactionId = '507f1f77bcf86cd799439013';

  const handleWarrantySelect = (warranty: WarrantyOption | null) => {
    setSelectedWarranty(warranty);
    if (warranty) {
      console.log('Garantía seleccionada:', warranty);
    }
  };

  const handleWarrantyClick = (warranty: any) => {
    console.log('Garantía clickeada:', warranty);
    setSelectedWarrantyForClaim(warranty._id);
    setShowClaimForm(true);
    setActiveTab('claim');
  };

  const handleClaimSubmitted = (claimId: string) => {
    setClaimSubmitted(claimId);
    setShowClaimForm(false);
    setSelectedWarrantyForClaim(null);
    console.log('Reclamo enviado con ID:', claimId);
  };

  const handleCancelClaim = () => {
    setShowClaimForm(false);
    setSelectedWarrantyForClaim(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <ShieldCheck className="me-2" />
              <strong>Sistema de Garantías de Compra - Demo</strong>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>🎯 Objetivo:</strong> Demostrar el sistema completo de garantías de compra que incluye:
                <ul className="mb-0 mt-2">
                  <li>Selección de protección durante el checkout</li>
                  <li>Visualización del estado de garantías activas</li>
                  <li>Creación de reclamos con evidencia</li>
                  <li>Protección anti-fuga de ventas</li>
                </ul>
              </Alert>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="success" className="me-2">Backend Completo</Badge>
                  <Badge bg="warning" className="me-2">Frontend Básico</Badge>
                  <Badge bg="info">En Desarrollo</Badge>
                </div>
                <div className="text-end">
                  <small className="text-muted">
                    Monto de transacción: {formatCurrency(mockTransactionAmount)}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'purchase')}
        className="mb-4"
      >
        <Tab eventKey="purchase" title="Protección de Compra">
          <Row>
            <Col lg={8}>
              <PurchaseGuarantee
                transactionAmount={mockTransactionAmount}
                storeId={mockStoreId}
                onWarrantySelect={handleWarrantySelect}
                selectedWarranty={selectedWarranty}
              />
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <strong>Resumen de Selección</strong>
                </Card.Header>
                <Card.Body>
                  {selectedWarranty ? (
                    <div>
                      <h6 className="text-success">
                        <CheckCircle className="me-2" />
                        Garantía Seleccionada
                      </h6>
                      <p><strong>Tipo:</strong> {selectedWarranty.description}</p>
                      <p><strong>Cobertura:</strong> {formatCurrency(selectedWarranty.coverageAmount)}</p>
                      <p><strong>Costo:</strong> {formatCurrency(selectedWarranty.cost)}</p>
                      <p><strong>Duración:</strong> {selectedWarranty.durationDays} días</p>
                      
                      <Alert variant="success" size="sm">
                        <strong>Total con protección:</strong><br />
                        {formatCurrency(mockTransactionAmount + selectedWarranty.cost)}
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <ShieldCheck size={48} className="mb-3" />
                      <p>No has seleccionado protección</p>
                      <small>Selecciona una opción de la izquierda</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="status" title="Estado de Garantías">
          <Row>
            <Col>
              <WarrantyStatus
                userId={mockUserId}
                showExpired={true}
                onWarrantyClick={handleWarrantyClick}
              />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="claim" title="Crear Reclamo">
          <Row>
            <Col>
              {showClaimForm && selectedWarrantyForClaim ? (
                <ClaimForm
                  warrantyId={selectedWarrantyForClaim}
                  transactionId={mockTransactionId}
                  storeId={mockStoreId}
                  onClaimSubmitted={handleClaimSubmitted}
                  onCancel={handleCancelClaim}
                />
              ) : claimSubmitted ? (
                <Card className="border-success">
                  <Card.Body className="text-center">
                    <CheckCircle size={64} className="text-success mb-3" />
                    <h4 className="text-success">¡Reclamo Enviado Exitosamente!</h4>
                    <p className="mb-3">
                      Tu reclamo ha sido registrado con el ID: <strong>{claimSubmitted}</strong>
                    </p>
                    <p className="text-muted">
                      Recibirás actualizaciones por email y en la app sobre el estado de tu reclamo.
                    </p>
                    <Button 
                      variant="outline-primary"
                      onClick={() => {
                        setClaimSubmitted(null);
                        setActiveTab('status');
                      }}
                    >
                      Ver Mis Garantías
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center">
                    <ExclamationTriangle size={64} className="text-warning mb-3" />
                    <h4>Crear Nuevo Reclamo</h4>
                    <p className="text-muted mb-3">
                      Para crear un reclamo, primero selecciona una garantía activa de la pestaña "Estado de Garantías".
                    </p>
                    <Button 
                      variant="primary"
                      onClick={() => setActiveTab('status')}
                    >
                      Ver Mis Garantías
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="info" title="Información">
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <strong>Información del Sistema de Garantías</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>🎯 Beneficios para el Cliente</h6>
                      <ul>
                        <li>Protección completa contra fraudes</li>
                        <li>Reembolso garantizado si no llega el producto</li>
                        <li>Cobertura por productos defectuosos</li>
                        <li>Protección si el producto no es como se describe</li>
                        <li>Proceso de reclamos simplificado</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6>🛡️ Anti-Fuga de Ventas</h6>
                      <ul>
                        <li>Solo disponible comprando dentro de la app</li>
                        <li>Incentivo para mantener transacciones internas</li>
                        <li>Reducción de comisiones por ventas seguras</li>
                        <li>Mejor reputación para tiendas que cumplen</li>
                        <li>Alertas de seguridad visibles</li>
                      </ul>
                    </Col>
                  </Row>

                  <hr />

                  <Row>
                    <Col md={6}>
                      <h6>📊 Tipos de Garantía</h6>
                      <ul>
                        <li><strong>Básica:</strong> Cobertura hasta $500,000</li>
                        <li><strong>Premium:</strong> Cobertura hasta $2,000,000</li>
                        <li><strong>Extendida:</strong> Cobertura hasta $5,000,000</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6>⏰ Duración</h6>
                      <ul>
                        <li><strong>Protección de Compra:</strong> 30-90 días</li>
                        <li><strong>Garantía de Devolución:</strong> 15-30 días</li>
                        <li><strong>Protección de Reclamos:</strong> 60-90 días</li>
                      </ul>
                    </Col>
                  </Row>

                  <Alert variant="warning" className="mt-3">
                    <strong>⚠️ Importante:</strong> Esta protección solo está disponible cuando compras dentro de la app. 
                    Si sales de la app, pierdes tu garantía de seguridad.
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Logs de consola simulados */}
      <Card className="mt-4">
        <Card.Header>
          <strong>Logs del Sistema</strong>
        </Card.Header>
        <Card.Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.9em' }}>
          <div className="text-success">✓ Backend: Modelos de garantía creados</div>
          <div className="text-success">✓ Backend: Servicios de garantía implementados</div>
          <div className="text-success">✓ Backend: Controladores y rutas configurados</div>
          <div className="text-success">✓ Backend: Script de seed ejecutado</div>
          <div className="text-warning">⚠ Frontend: Componentes básicos creados</div>
          <div className="text-info">🔄 Frontend: Integración con páginas existentes pendiente</div>
          <div className="text-info">🔄 Frontend: Sistema de notificaciones pendiente</div>
          <div className="text-info">🔄 Frontend: Testing completo pendiente</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WarrantyTest;
