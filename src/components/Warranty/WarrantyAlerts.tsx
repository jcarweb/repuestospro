import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button, Card, Collapse, ListGroup } from 'react-bootstrap';
import { Bell, ExclamationTriangle, ShieldCheck, Clock, CheckCircle, XCircle } from 'react-bootstrap-icons';

interface WarrantyAlert {
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

interface WarrantyAlertsProps {
  userId: string;
  onAlertClick?: (alert: WarrantyAlert) => void;
  showAll?: boolean;
  maxAlerts?: number;
}

const WarrantyAlerts: React.FC<WarrantyAlertsProps> = ({
  userId,
  onAlertClick,
  showAll = false,
  maxAlerts = 5
}) => {
  const [alerts, setAlerts] = useState<WarrantyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warranties/user/alerts?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar alertas');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/warranties/user/alerts/${alertId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
      }
    } catch (err) {
      console.error('Error al marcar alerta como leída:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/warranties/user/alerts/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
      }
    } catch (err) {
      console.error('Error al marcar todas las alertas como leídas:', err);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expiration_warning':
        return <Clock className="text-warning" />;
      case 'activation_success':
        return <CheckCircle className="text-success" />;
      case 'security_warning':
        return <ExclamationTriangle className="text-danger" />;
      case 'benefit_reminder':
        return <ShieldCheck className="text-info" />;
      case 'protection_lost':
        return <XCircle className="text-danger" />;
      default:
        return <Bell className="text-secondary" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'expiration_warning':
        return <Badge bg="warning" text="dark">Expiración</Badge>;
      case 'activation_success':
        return <Badge bg="success">Activación</Badge>;
      case 'security_warning':
        return <Badge bg="danger">Seguridad</Badge>;
      case 'benefit_reminder':
        return <Badge bg="info">Beneficio</Badge>;
      case 'protection_lost':
        return <Badge bg="danger">Protección Perdida</Badge>;
      default:
        return <Badge bg="secondary">General</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'ahora mismo';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const displayAlerts = showAll ? alerts : alerts.slice(0, maxAlerts);

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <div className="spinner-border spinner-border-sm me-2" />
          Cargando alertas...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" size="sm" onClick={fetchAlerts}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <CheckCircle size={48} className="text-success mb-3" />
          <h6>No hay alertas pendientes</h6>
          <p className="text-muted mb-0">
            Todas tus garantías están al día y no hay notificaciones importantes.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="warranty-alerts">
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <Bell className="me-2" />
            <strong>Alertas de Garantía</strong>
            {unreadCount > 0 && (
              <Badge bg="danger" className="ms-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            {unreadCount > 0 && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={markAllAsRead}
                className="me-2"
              >
                Marcar todas como leídas
              </Button>
            )}
            {!showAll && alerts.length > maxAlerts && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Mostrar menos' : `Ver todas (${alerts.length})`}
              </Button>
            )}
          </div>
        </Card.Header>
        
        <Collapse in={showAll || expanded}>
          <Card.Body className="p-0">
            <ListGroup variant="flush">
              {displayAlerts.map((alert) => (
                <ListGroup.Item 
                  key={alert.id}
                  className={`alert-item ${!alert.isRead ? 'unread' : ''}`}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                  style={{ cursor: onAlertClick ? 'pointer' : 'default' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <h6 className="mb-1">
                            {alert.title}
                            {!alert.isRead && (
                              <Badge bg="primary" className="ms-2">Nuevo</Badge>
                            )}
                          </h6>
                          {getAlertBadge(alert.type)}
                        </div>
                        
                        <div className="text-end">
                          <small className="text-muted">
                            {getTimeAgo(alert.createdAt)}
                          </small>
                          {!alert.isRead && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(alert.id);
                              }}
                            >
                              ✓
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="mb-1">{alert.message}</p>
                      
                      {alert.warrantyName && (
                        <small className="text-muted">
                          <strong>Garantía:</strong> {alert.warrantyName}
                        </small>
                      )}
                      
                      {alert.daysRemaining !== undefined && (
                        <div className="mt-2">
                          <Alert variant={getAlertVariant(alert.severity)} size="sm" className="mb-0">
                            <Clock className="me-1" />
                            {alert.daysRemaining > 0 
                              ? `Expira en ${alert.daysRemaining} día${alert.daysRemaining > 1 ? 's' : ''}`
                              : 'Expiró hoy'
                            }
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Collapse>
        
        {!showAll && !expanded && alerts.length > maxAlerts && (
          <Card.Footer className="text-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => setExpanded(true)}
            >
              Ver {alerts.length - maxAlerts} alertas más
            </Button>
          </Card.Footer>
        )}
      </Card>

      <style jsx>{`
        .alert-item.unread {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
        }
        
        .alert-item:hover {
          background-color: #f8f9fa;
        }
        
        .alert-item.unread:hover {
          background-color: #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default WarrantyAlerts;
