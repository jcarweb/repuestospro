import React, { useState, useEffect } from 'react';
import { Card, Badge, ProgressBar, Button, Alert, Spinner, Row, Col, Timeline } from 'react-bootstrap';
import { Clock, CheckCircle, ExclamationTriangle, Chat, FileText, Send } from 'react-bootstrap-icons';

interface ClaimStatus {
  id: string;
  claimNumber: string;
  status: 'pending' | 'under_review' | 'evidence_required' | 'approved' | 'rejected' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  claimedAmount: number;
  approvedAmount?: number;
  filedDate: Date;
  estimatedResolutionDate?: Date;
  actualResolutionDate?: Date;
  assignedAgent?: string;
  progress: number; // 0-100
  communications: Array<{
    id: string;
    from: 'user' | 'store' | 'support' | 'system';
    message: string;
    timestamp: Date;
    attachments?: string[];
    isInternal?: boolean;
  }>;
  evidence: Array<{
    id: string;
    type: 'photo' | 'document' | 'video' | 'audio' | 'other';
    filename: string;
    url: string;
    uploadedAt: Date;
    description?: string;
  }>;
  nextAction?: {
    type: string;
    description: string;
    deadline?: Date;
    required: boolean;
  };
}

interface ClaimTrackerProps {
  claimId: string;
  onStatusUpdate?: (status: ClaimStatus) => void;
  onCommunication?: (message: string) => void;
}

const ClaimTracker: React.FC<ClaimTrackerProps> = ({
  claimId,
  onStatusUpdate,
  onCommunication
}) => {
  const [claim, setClaim] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/claims/user/${claimId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar detalles del reclamo');
      }

      const data = await response.json();
      setClaim(data.claim);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !claim) return;

    try {
      setSending(true);
      const response = await fetch(`/api/claims/user/${claimId}/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMessage,
          from: 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClaim(prev => prev ? {
          ...prev,
          communications: [...prev.communications, data.communication]
        } : null);
        setNewMessage('');
        onCommunication?.(newMessage);
      } else {
        throw new Error('Error al enviar mensaje');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'evidence_required': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'resolved': return 'success';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'under_review': return 'En Revisión';
      case 'evidence_required': return 'Evidencia Requerida';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'resolved': return 'Resuelto';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'dark';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
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

  const getTimeElapsed = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressSteps = () => {
    const steps = [
      { name: 'Reclamo Creado', completed: true },
      { name: 'En Revisión', completed: ['under_review', 'evidence_required', 'approved', 'rejected', 'resolved'].includes(claim?.status || '') },
      { name: 'Evidencia Revisada', completed: ['approved', 'rejected', 'resolved'].includes(claim?.status || '') },
      { name: 'Resolución', completed: ['resolved'].includes(claim?.status || '') }
    ];
    return steps;
  };

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando detalles del reclamo...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" size="sm" onClick={fetchClaimDetails}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (!claim) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>Reclamo no encontrado</Alert.Heading>
        <p>No se pudo cargar la información del reclamo.</p>
      </Alert>
    );
  }

  const progressSteps = getProgressSteps();

  return (
    <div className="claim-tracker">
      <Card className="mb-3">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Reclamo #{claim.claimNumber}</h5>
              <small className="text-muted">
                Creado el {formatDate(claim.filedDate)} • {getTimeElapsed(claim.filedDate)} días transcurridos
              </small>
            </div>
            <div className="text-end">
              <Badge bg={getStatusColor(claim.status)} className="me-2">
                {getStatusText(claim.status)}
              </Badge>
              <Badge bg={getPriorityColor(claim.priority)}>
                {getPriorityText(claim.priority)}
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h6>{claim.title}</h6>
              <p className="text-muted">{claim.description}</p>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small>Progreso del reclamo</small>
                  <small>{claim.progress}%</small>
                </div>
                <ProgressBar now={claim.progress} className="mb-3" />
                
                <div className="progress-steps">
                  {progressSteps.map((step, index) => (
                    <div key={index} className={`step ${step.completed ? 'completed' : ''}`}>
                      <div className="step-icon">
                        {step.completed ? <CheckCircle /> : <Clock />}
                      </div>
                      <div className="step-label">{step.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {claim.nextAction && (
                <Alert variant="info" className="mb-3">
                  <Alert.Heading>Próxima Acción Requerida</Alert.Heading>
                  <p><strong>{claim.nextAction.type}:</strong> {claim.nextAction.description}</p>
                  {claim.nextAction.deadline && (
                    <small className="text-muted">
                      Fecha límite: {formatDate(claim.nextAction.deadline)}
                    </small>
                  )}
                </Alert>
              )}
            </Col>
            
            <Col md={4}>
              <Card className="border-secondary">
                <Card.Header>
                  <strong>Detalles del Reclamo</strong>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <small className="text-muted">Monto Reclamado:</small>
                    <div><strong>{formatCurrency(claim.claimedAmount)}</strong></div>
                  </div>
                  
                  {claim.approvedAmount && (
                    <div className="mb-2">
                      <small className="text-muted">Monto Aprobado:</small>
                      <div><strong className="text-success">{formatCurrency(claim.approvedAmount)}</strong></div>
                    </div>
                  )}
                  
                  {claim.assignedAgent && (
                    <div className="mb-2">
                      <small className="text-muted">Agente Asignado:</small>
                      <div><strong>{claim.assignedAgent}</strong></div>
                    </div>
                  )}
                  
                  {claim.estimatedResolutionDate && (
                    <div className="mb-2">
                      <small className="text-muted">Resolución Estimada:</small>
                      <div><strong>{formatDate(claim.estimatedResolutionDate)}</strong></div>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <small className="text-muted">Evidencia:</small>
                    <div><strong>{claim.evidence.length} archivos</strong></div>
                  </div>
                  
                  <div>
                    <small className="text-muted">Comunicaciones:</small>
                    <div><strong>{claim.communications.length} mensajes</strong></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Comunicaciones */}
      <Card className="mb-3">
        <Card.Header>
          <Chat className="me-2" />
          <strong>Comunicaciones</strong>
        </Card.Header>
        <Card.Body>
          <div className="communications-timeline">
            {claim.communications.map((comm, index) => (
              <div key={comm.id} className={`communication-item ${comm.from}`}>
                <div className="communication-header">
                  <div className="d-flex align-items-center">
                    <div className={`avatar ${comm.from}`}>
                      {comm.from === 'user' ? '👤' : comm.from === 'support' ? '🛡️' : '🏪'}
                    </div>
                    <div className="ms-2">
                      <strong>
                        {comm.from === 'user' ? 'Tú' : 
                         comm.from === 'support' ? 'Soporte' : 
                         comm.from === 'store' ? 'Tienda' : 'Sistema'}
                      </strong>
                      <small className="text-muted ms-2">
                        {formatDate(comm.timestamp)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="communication-message">
                  {comm.message}
                </div>
                {comm.attachments && comm.attachments.length > 0 && (
                  <div className="communication-attachments">
                    <small className="text-muted">
                      <FileText className="me-1" />
                      {comm.attachments.length} adjunto{comm.attachments.length > 1 ? 's' : ''}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nuevo mensaje */}
          <div className="new-message mt-3">
            <div className="d-flex">
              <div className="flex-grow-1 me-2">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div>
                <Button
                  variant="primary"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="me-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Evidencia */}
      {claim.evidence.length > 0 && (
        <Card className="mb-3">
          <Card.Header>
            <FileText className="me-2" />
            <strong>Evidencia ({claim.evidence.length})</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              {claim.evidence.map((evidence) => (
                <Col md={4} key={evidence.id} className="mb-2">
                  <Card className="evidence-item">
                    <Card.Body className="text-center">
                      <div className="evidence-icon mb-2">
                        {evidence.type === 'photo' ? '📷' : 
                         evidence.type === 'document' ? '📄' : 
                         evidence.type === 'video' ? '🎥' : '📎'}
                      </div>
                      <small className="d-block text-truncate">{evidence.filename}</small>
                      <small className="text-muted">
                        {formatDate(evidence.uploadedAt)}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      <style jsx>{`
        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        
        .step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 15px;
          left: 50%;
          width: 100%;
          height: 2px;
          background-color: #e9ecef;
          z-index: 1;
        }
        
        .step.completed:not(:last-child)::after {
          background-color: #28a745;
        }
        
        .step-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        
        .step.completed .step-icon {
          background-color: #28a745;
          color: white;
        }
        
        .step-label {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          text-align: center;
          color: #6c757d;
        }
        
        .step.completed .step-label {
          color: #28a745;
          font-weight: bold;
        }
        
        .communications-timeline {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .communication-item {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        
        .communication-item.user {
          background-color: #f8f9fa;
          border-left-color: #007bff;
        }
        
        .communication-item.support {
          background-color: #e7f3ff;
          border-left-color: #17a2b8;
        }
        
        .communication-item.store {
          background-color: #fff3cd;
          border-left-color: #ffc107;
        }
        
        .communication-item.system {
          background-color: #f8f9fa;
          border-left-color: #6c757d;
        }
        
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .communication-message {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: white;
          border-radius: 4px;
        }
        
        .communication-attachments {
          margin-top: 0.5rem;
        }
        
        .evidence-item {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .evidence-item:hover {
          transform: translateY(-2px);
        }
        
        .evidence-icon {
          font-size: 2rem;
        }
      `}</style>
    </div>
  );
};

export default ClaimTracker;
