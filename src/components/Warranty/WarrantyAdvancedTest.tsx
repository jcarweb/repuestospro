import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Tabs, Tab, Nav } from 'react-bootstrap';
import { ShieldCheck, ExclamationTriangle, FileText, CheckCircle, Bell, Chat } from 'react-bootstrap-icons';
import PurchaseGuarantee from './PurchaseGuarantee';
import WarrantyStatus from './WarrantyStatus';
import ClaimForm from './ClaimForm';
import WarrantyAlerts from './WarrantyAlerts';
import ClaimTracker from './ClaimTracker';

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

interface MockAlert {
  id: string;
  type: 'expiration_warning' | 'activation_success' | 'security_warning' | 'benefit_reminder' | 'protection_lost';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  warrantyId?: string;
  warrantyName?: string;
  daysRemaining?: number;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

const WarrantyAdvancedTest: React.FC = () => {
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedWarrantyForClaim, setSelectedWarrantyForClaim] = useState<string | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState<string | null>(null);
  const [trackingClaimId, setTrackingClaimId] = useState<string | null>(null);
  const [mockAlerts, setMockAlerts] = useState<MockAlert[]>([
    {
      id: '1',
      type: 'expiration_warning',
      title: 'Garantía por expirar',
      message: 'Tu garantía de Protección de Compra Premium expira en 3 días. Considera renovar para mantener tu protección.',
      severity: 'warning',
      warrantyName: 'Protección de Compra Premium',
      daysRemaining: 3,
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'activation_success',
      title: 'Garantía activada exitosamente',
      message: 'Tu garantía de Protección de Compra Básica ha sido activada. Tu compra está ahora protegida.',
      severity: 'success',
      warrantyName: 'Protección de Compra Básica',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 día atrás
    },
    {
      id: '3',
      type: 'security_warning',
      title: 'Advertencia de seguridad',
      message: 'Recuerda que las garantías solo están disponibles para compras dentro de la app. Si sales de la app, pierdes tu protección.',
      severity: 'danger',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
    }
  ]);

  // Datos de ejemplo
  const mockTransactionAmount = 2500000; // $2,500,000 COP
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
    setTrackingClaimId(claimId);
    console.log('Reclamo enviado con ID:', claimId);
  };

  const handleCancelClaim = () => {
    setShowClaimForm(false);
    setSelectedWarrantyForClaim(null);
  };

  const handleAlertClick = (alert: MockAlert) => {
    console.log('Alerta clickeada:', alert);
    // Marcar como leída
    setMockAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, isRead: true } : a
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const simulateClaimTracking = () => {
    const mockClaimId = 'CLM-' + Date.now().toString().slice(-8) + '-TEST';
    setTrackingClaimId(mockClaimId);
    setActiveTab('tracking');
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <ShieldCheck className="me-2" />
              <strong>Sistema de Garantías Avanzado - Demo Completo</strong>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>🎯 Objetivo:</strong> Demostrar todas las funcionalidades avanzadas del sistema de garantías:
                <ul className="mb-0 mt-2">
                  <li>Selección de protección durante el checkout</li>
                  <li>Alertas y notificaciones en tiempo real</li>
                  <li>Seguimiento completo de reclamos</li>
                  <li>Comunicación bidireccional con soporte</li>
                  <li>Dashboard de estado de garantías</li>
                </ul>
              </Alert>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="success" className="me-2">Backend Completo</Badge>
                  <Badge bg="success" className="me-2">Frontend Básico</Badge>
                  <Badge bg="warning" className="me-2">Funcionalidades Avanzadas</Badge>
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

      <Row className="mb-4">
        <Col>
          <WarrantyAlerts
            userId={mockUserId}
            onAlertClick={handleAlertClick}
            showAll={true}
          />
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'overview')}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Vista General">
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
                    <div className="d-flex justify-content-center gap-2">
                      <Button 
                        variant="outline-primary"
                        onClick={() => {
                          setClaimSubmitted(null);
                          setActiveTab('status');
                        }}
                      >
                        Ver Mis Garantías
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={() => {
                          setTrackingClaimId(claimSubmitted);
                          setActiveTab('tracking');
                        }}
                      >
                        <Chat className="me-2" />
                        Seguir Reclamo
                      </Button>
                    </div>
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
                    <div className="d-flex justify-content-center gap-2">
                      <Button 
                        variant="primary"
                        onClick={() => setActiveTab('status')}
                      >
                        Ver Mis Garantías
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={simulateClaimTracking}
                      >
                        Simular Seguimiento
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="tracking" title="Seguimiento de Reclamos">
          <Row>
            <Col>
              {trackingClaimId ? (
                <ClaimTracker
                  claimId={trackingClaimId}
                  onStatusUpdate={(status) => console.log('Estado actualizado:', status)}
                  onCommunication={(message) => console.log('Mensaje enviado:', message)}
                />
              ) : (
                <Card>
                  <Card.Body className="text-center">
                    <Chat size={64} className="text-info mb-3" />
                    <h4>Seguimiento de Reclamos</h4>
                    <p className="text-muted mb-3">
                      Aquí puedes ver el progreso de tus reclamos y comunicarte con soporte.
                    </p>
                    <Button 
                      variant="primary"
                      onClick={simulateClaimTracking}
                    >
                      Simular Reclamo en Proceso
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="features" title="Funcionalidades">
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <strong>Funcionalidades Avanzadas Implementadas</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>🔔 Sistema de Alertas</h6>
                      <ul>
                        <li>Alertas de expiración próxima</li>
                        <li>Notificaciones de activación</li>
                        <li>Advertencias de seguridad</li>
                        <li>Recordatorios de beneficios</li>
                        <li>Marcado como leído</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6>📊 Seguimiento de Reclamos</h6>
                      <ul>
                        <li>Progreso visual del reclamo</li>
                        <li>Comunicación en tiempo real</li>
                        <li>Gestión de evidencia</li>
                        <li>Estados y prioridades</li>
                        <li>Acciones requeridas</li>
                      </ul>
                    </Col>
                  </Row>

                  <hr />

                  <Row>
                    <Col md={6}>
                      <h6>🛡️ Protección Anti-Fuga</h6>
                      <ul>
                        <li>Garantías solo para compras internas</li>
                        <li>Alertas de pérdida de protección</li>
                        <li>Incentivos para mantener transacciones</li>
                        <li>Diferenciación competitiva</li>
                        <li>Reducción de comisiones</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6>📱 Experiencia de Usuario</h6>
                      <ul>
                        <li>Interfaz intuitiva y responsive</li>
                        <li>Validación en tiempo real</li>
                        <li>Estados de carga y feedback</li>
                        <li>Navegación fluida</li>
                        <li>Accesibilidad mejorada</li>
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
          <strong>Logs del Sistema Avanzado</strong>
        </Card.Header>
        <Card.Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.9em' }}>
          <div className="text-success">✓ Backend: Modelos de garantía creados</div>
          <div className="text-success">✓ Backend: Servicios de garantía implementados</div>
          <div className="text-success">✓ Backend: Controladores y rutas configurados</div>
          <div className="text-success">✓ Backend: Script de seed ejecutado</div>
          <div className="text-success">✓ Frontend: Componentes básicos creados</div>
          <div className="text-success">✓ Frontend: Sistema de alertas implementado</div>
          <div className="text-success">✓ Frontend: Seguimiento de reclamos implementado</div>
          <div className="text-info">🔄 Frontend: Integración con páginas existentes pendiente</div>
          <div className="text-info">🔄 Frontend: Testing completo pendiente</div>
          <div className="text-info">🔄 Frontend: Optimización de UX pendiente</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WarrantyAdvancedTest;
