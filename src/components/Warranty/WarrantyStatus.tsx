import React, { useState, useEffect } from 'react';
import { Card, Badge, ProgressBar, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldCheck, Clock, DollarSign, ExclamationTriangle, CheckCircle, XCircle } from 'react-bootstrap-icons';

interface Warranty {
  _id: string;
  type: string;
  status: string;
  coverageAmount: number;
  coveragePercentage: number;
  maxCoverageAmount: number;
  activationDate: string;
  expirationDate: string;
  cost: number;
  description: string;
  terms: {
    coversDefectiveProducts: boolean;
    coversNonDelivery: boolean;
    coversNotAsDescribed: boolean;
    coversLateDelivery: boolean;
    returnWindowDays: number;
    claimWindowDays: number;
  };
  transactionId?: string;
  productId?: string;
  storeId: string;
}

interface WarrantyStatusProps {
  userId: string;
  showExpired?: boolean;
  onWarrantyClick?: (warranty: Warranty) => void;
}

const WarrantyStatus: React.FC<WarrantyStatusProps> = ({
  userId,
  showExpired = false,
  onWarrantyClick
}) => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    active: 0,
    expired: 0,
    totalCoverage: 0,
    totalCost: 0
  });

  useEffect(() => {
    fetchWarranties();
  }, [userId, showExpired]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const statusFilter = showExpired ? 'all' : 'active';
      const response = await fetch(`/api/warranties/user?status=${statusFilter}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar garantías');
      }

      const data = await response.json();
      setWarranties(data.warranties || []);
      
      // Calcular estadísticas
      const activeWarranties = data.warranties.filter((w: Warranty) => w.status === 'active');
      const expiredWarranties = data.warranties.filter((w: Warranty) => w.status === 'expired');
      
      setStats({
        active: activeWarranties.length,
        expired: expiredWarranties.length,
        totalCoverage: activeWarranties.reduce((sum: number, w: Warranty) => sum + w.coverageAmount, 0),
        totalCost: data.warranties.reduce((sum: number, w: Warranty) => sum + w.cost, 0)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'secondary';
      case 'cancelled': return 'danger';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Expirada';
      case 'cancelled': return 'Cancelada';
      case 'resolved': return 'Resuelta';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'purchase_protection': return 'Protección de Compra';
      case 'return_guarantee': return 'Garantía de Devolución';
      case 'claim_protection': return 'Protección de Reclamos';
      default: return type;
    }
  };

  const getDaysRemaining = (expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = (expirationDate: string, activationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const activation = new Date(activationDate);
    const totalDuration = expiration.getTime() - activation.getTime();
    const elapsed = now.getTime() - activation.getTime();
    const percentage = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando garantías...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" size="sm" onClick={fetchWarranties}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (warranties.length === 0) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <ShieldCheck size={48} className="text-muted mb-3" />
          <h5>No tienes garantías {showExpired ? '' : 'activas'}</h5>
          <p className="text-muted">
            {showExpired 
              ? 'No se encontraron garantías en tu cuenta.'
              : 'No tienes garantías activas en este momento.'
            }
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="warranty-status">
      {/* Estadísticas */}
      <Row className="mb-3">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <ShieldCheck className="text-success mb-2" size={24} />
              <h6 className="mb-0">{stats.active}</h6>
              <small className="text-muted">Activas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <DollarSign className="text-primary mb-2" size={24} />
              <h6 className="mb-0">{formatCurrency(stats.totalCoverage)}</h6>
              <small className="text-muted">Cobertura Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Clock className="text-warning mb-2" size={24} />
              <h6 className="mb-0">{stats.expired}</h6>
              <small className="text-muted">Expiradas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <DollarSign className="text-info mb-2" size={24} />
              <h6 className="mb-0">{formatCurrency(stats.totalCost)}</h6>
              <small className="text-muted">Costo Total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de Garantías */}
      <div className="warranties-list">
        {warranties.map((warranty) => {
          const daysRemaining = getDaysRemaining(warranty.expirationDate);
          const progressPercentage = getProgressPercentage(warranty.expirationDate, warranty.activationDate);
          const isExpiringSoon = daysRemaining <= 7 && warranty.status === 'active';

          return (
            <Card 
              key={warranty._id} 
              className={`mb-3 warranty-card ${onWarrantyClick ? 'cursor-pointer' : ''}`}
              onClick={() => onWarrantyClick && onWarrantyClick(warranty)}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg={getStatusColor(warranty.status)} className="me-2">
                        {getStatusText(warranty.status)}
                      </Badge>
                      <Badge bg="outline-secondary" className="me-2">
                        {getTypeText(warranty.type)}
                      </Badge>
                      {isExpiringSoon && (
                        <Badge bg="warning" text="dark">
                          <ExclamationTriangle className="me-1" />
                          Expira pronto
                        </Badge>
                      )}
                    </div>
                    
                    <h6 className="mb-1">{warranty.description}</h6>
                    
                    <div className="row text-sm">
                      <div className="col-md-4">
                        <DollarSign className="me-1" />
                        <strong>Cobertura:</strong> {formatCurrency(warranty.coverageAmount)}
                      </div>
                      <div className="col-md-4">
                        <strong>Porcentaje:</strong> {warranty.coveragePercentage}%
                      </div>
                      <div className="col-md-4">
                        <strong>Costo:</strong> {formatCurrency(warranty.cost)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <div className="mb-2">
                      <small className="text-muted">
                        Activada: {formatDate(warranty.activationDate)}
                      </small>
                    </div>
                    <div>
                      <small className="text-muted">
                        Expira: {formatDate(warranty.expirationDate)}
                      </small>
                    </div>
                  </div>
                </div>

                {warranty.status === 'active' && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Progreso de la garantía</small>
                      <small className="text-muted">{daysRemaining} días restantes</small>
                    </div>
                    <ProgressBar 
                      now={progressPercentage} 
                      variant={isExpiringSoon ? 'warning' : 'success'}
                      className="mb-2"
                    />
                    {isExpiringSoon && (
                      <Alert variant="warning" size="sm" className="mb-0">
                        <ExclamationTriangle className="me-1" />
                        Tu garantía expira en {daysRemaining} días
                      </Alert>
                    )}
                  </div>
                )}

                <div className="warranty-terms">
                  <small className="text-muted">
                    <strong>Cubre:</strong>
                    {warranty.terms.coversDefectiveProducts && ' Productos defectuosos,'}
                    {warranty.terms.coversNonDelivery && ' No entrega,'}
                    {warranty.terms.coversNotAsDescribed && ' No como se describe,'}
                    {warranty.terms.coversLateDelivery && ' Entrega tardía'}
                  </small>
                </div>

                {onWarrantyClick && (
                  <div className="mt-3">
                    <Button variant="outline-primary" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WarrantyStatus;
