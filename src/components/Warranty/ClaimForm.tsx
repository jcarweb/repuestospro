import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { ExclamationTriangle, Upload, FileText, Camera, Send } from 'react-bootstrap-icons';

interface Warranty {
  _id: string;
  type: string;
  status: string;
  coverageAmount: number;
  description: string;
  expirationDate: string;
  terms: {
    coversDefectiveProducts: boolean;
    coversNonDelivery: boolean;
    coversNotAsDescribed: boolean;
    coversLateDelivery: boolean;
    returnWindowDays: number;
    claimWindowDays: number;
  };
}

interface ClaimFormProps {
  warrantyId: string;
  transactionId: string;
  storeId: string;
  onClaimSubmitted?: (claimId: string) => void;
  onCancel?: () => void;
}

interface ClaimData {
  claimType: string;
  title: string;
  description: string;
  problemDetails: {
    issueType: string;
    severity: string;
    impact: string;
    expectedResolution: string;
  };
  claimedAmount: number;
  evidence: File[];
}

const ClaimForm: React.FC<ClaimFormProps> = ({
  warrantyId,
  transactionId,
  storeId,
  onClaimSubmitted,
  onCancel
}) => {
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState<ClaimData>({
    claimType: '',
    title: '',
    description: '',
    problemDetails: {
      issueType: '',
      severity: 'moderate',
      impact: '',
      expectedResolution: ''
    },
    claimedAmount: 0,
    evidence: []
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWarrantyDetails();
  }, [warrantyId]);

  const fetchWarrantyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warranties/user/${warrantyId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar detalles de la garantía');
      }

      const data = await response.json();
      setWarranty(data.warranty);
      
      // Establecer monto máximo reclamable
      setFormData(prev => ({
        ...prev,
        claimedAmount: data.warranty.coverageAmount
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.claimType) {
      errors.claimType = 'Debes seleccionar un tipo de reclamo';
    }

    if (!formData.title.trim()) {
      errors.title = 'El título es requerido';
    } else if (formData.title.length < 10) {
      errors.title = 'El título debe tener al menos 10 caracteres';
    }

    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    } else if (formData.description.length < 50) {
      errors.description = 'La descripción debe tener al menos 50 caracteres';
    }

    if (!formData.problemDetails.issueType.trim()) {
      errors.issueType = 'Debes especificar el tipo de problema';
    }

    if (!formData.problemDetails.impact.trim()) {
      errors.impact = 'Debes describir el impacto del problema';
    }

    if (!formData.problemDetails.expectedResolution.trim()) {
      errors.expectedResolution = 'Debes especificar la resolución esperada';
    }

    if (formData.claimedAmount <= 0) {
      errors.claimedAmount = 'El monto reclamado debe ser mayor a 0';
    } else if (warranty && formData.claimedAmount > warranty.coverageAmount) {
      errors.claimedAmount = `El monto no puede exceder la cobertura de ${formatCurrency(warranty.coverageAmount)}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de validación
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleProblemDetailChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      problemDetails: {
        ...prev.problemDetails,
        [field]: value
      }
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validar tipos de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setError('Algunos archivos no son válidos. Solo se permiten imágenes, PDFs y videos.');
      return;
    }

    // Validar tamaño (máximo 10MB por archivo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const sizeValidFiles = validFiles.filter(file => file.size <= maxSize);
    
    if (sizeValidFiles.length !== validFiles.length) {
      setError('Algunos archivos son demasiado grandes. Máximo 10MB por archivo.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...sizeValidFiles]
    }));

    setError(null);
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(0);

      // Crear FormData para enviar archivos
      const submitData = new FormData();
      submitData.append('warrantyId', warrantyId);
      submitData.append('transactionId', transactionId);
      submitData.append('storeId', storeId);
      submitData.append('claimType', formData.claimType);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('claimedAmount', formData.claimedAmount.toString());
      submitData.append('problemDetails', JSON.stringify(formData.problemDetails));

      // Agregar archivos de evidencia
      formData.evidence.forEach((file, index) => {
        submitData.append(`evidence`, file);
      });

      const response = await fetch('/api/claims/user/create', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el reclamo');
      }

      const data = await response.json();
      
      // Simular progreso de carga
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onClaimSubmitted?.(data.claim._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el reclamo');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getClaimTypeText = (type: string) => {
    switch (type) {
      case 'defective_product': return 'Producto Defectuoso';
      case 'non_delivery': return 'No Entrega';
      case 'not_as_described': return 'No Como Se Describe';
      case 'late_delivery': return 'Entrega Tardía';
      case 'damaged_package': return 'Paquete Dañado';
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'success';
      case 'moderate': return 'warning';
      case 'major': return 'danger';
      case 'critical': return 'dark';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando detalles de la garantía...
        </Card.Body>
      </Card>
    );
  }

  if (error && !warranty) {
    return (
      <Alert variant="danger" className="mb-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" size="sm" onClick={fetchWarrantyDetails}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (!warranty) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>Garantía no encontrada</Alert.Heading>
        <p>No se pudo cargar la información de la garantía.</p>
      </Alert>
    );
  }

  return (
    <div className="claim-form">
      <Card className="mb-3">
        <Card.Header className="bg-primary text-white">
          <ExclamationTriangle className="me-2" />
          <strong>Crear Reclamo de Garantía</strong>
        </Card.Header>
        <Card.Body>
          {/* Información de la Garantía */}
          <Alert variant="info" className="mb-3">
            <h6>Información de la Garantía</h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Tipo:</strong> {warranty.description}<br />
                <strong>Cobertura:</strong> {formatCurrency(warranty.coverageAmount)}<br />
                <strong>Estado:</strong> 
                <Badge bg="success" className="ms-1">Activa</Badge>
              </div>
              <div className="col-md-6">
                <strong>Expira:</strong> {new Date(warranty.expirationDate).toLocaleDateString('es-CO')}<br />
                <strong>Monto Máximo:</strong> {formatCurrency(warranty.coverageAmount)}
              </div>
            </div>
          </Alert>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Tipo de Reclamo */}
            <Form.Group className="mb-3">
              <Form.Label><strong>Tipo de Reclamo *</strong></Form.Label>
              <Form.Select
                value={formData.claimType}
                onChange={(e) => handleInputChange('claimType', e.target.value)}
                isInvalid={!!validationErrors.claimType}
              >
                <option value="">Selecciona el tipo de problema</option>
                {warranty.terms.coversDefectiveProducts && (
                  <option value="defective_product">Producto Defectuoso</option>
                )}
                {warranty.terms.coversNonDelivery && (
                  <option value="non_delivery">No Entrega</option>
                )}
                {warranty.terms.coversNotAsDescribed && (
                  <option value="not_as_described">No Como Se Describe</option>
                )}
                {warranty.terms.coversLateDelivery && (
                  <option value="late_delivery">Entrega Tardía</option>
                )}
                <option value="damaged_package">Paquete Dañado</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.claimType}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Título */}
            <Form.Group className="mb-3">
              <Form.Label><strong>Título del Reclamo *</strong></Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Describe brevemente el problema"
                isInvalid={!!validationErrors.title}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Descripción */}
            <Form.Group className="mb-3">
              <Form.Label><strong>Descripción Detallada *</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente el problema que has experimentado..."
                isInvalid={!!validationErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Detalles del Problema */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Tipo de Problema *</strong></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.problemDetails.issueType}
                    onChange={(e) => handleProblemDetailChange('issueType', e.target.value)}
                    placeholder="Ej: Pantalla rota, no enciende, etc."
                    isInvalid={!!validationErrors.issueType}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.issueType}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Severidad *</strong></Form.Label>
                  <Form.Select
                    value={formData.problemDetails.severity}
                    onChange={(e) => handleProblemDetailChange('severity', e.target.value)}
                  >
                    <option value="minor">Menor</option>
                    <option value="moderate">Moderada</option>
                    <option value="major">Mayor</option>
                    <option value="critical">Crítica</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label><strong>Impacto del Problema *</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.problemDetails.impact}
                onChange={(e) => handleProblemDetailChange('impact', e.target.value)}
                placeholder="¿Cómo te ha afectado este problema?"
                isInvalid={!!validationErrors.impact}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.impact}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Resolución Esperada *</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.problemDetails.expectedResolution}
                onChange={(e) => handleProblemDetailChange('expectedResolution', e.target.value)}
                placeholder="¿Qué esperas que se haga para resolver el problema?"
                isInvalid={!!validationErrors.expectedResolution}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.expectedResolution}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Monto Reclamado */}
            <Form.Group className="mb-3">
              <Form.Label><strong>Monto Reclamado *</strong></Form.Label>
              <Form.Control
                type="number"
                value={formData.claimedAmount}
                onChange={(e) => handleInputChange('claimedAmount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                max={warranty.coverageAmount}
                isInvalid={!!validationErrors.claimedAmount}
              />
              <Form.Text className="text-muted">
                Máximo: {formatCurrency(warranty.coverageAmount)}
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationErrors.claimedAmount}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Evidencia */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Evidencia (Opcional)</strong>
                <small className="text-muted ms-2">
                  Fotos, videos o documentos que respalden tu reclamo
                </small>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,.pdf,video/*"
                onChange={handleFileUpload}
                className="mb-2"
              />
              <Form.Text className="text-muted">
                Formatos permitidos: JPG, PNG, GIF, PDF, MP4. Máximo 10MB por archivo.
              </Form.Text>

              {formData.evidence.length > 0 && (
                <div className="mt-2">
                  <h6>Archivos seleccionados:</h6>
                  {formData.evidence.map((file, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded mb-1">
                      <div>
                        <FileText className="me-2" />
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* Progreso de carga */}
            {submitting && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small>Enviando reclamo...</small>
                  <small>{uploadProgress}%</small>
                </div>
                <ProgressBar now={uploadProgress} />
              </div>
            )}

            {/* Botones */}
            <div className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="me-2" />
                    Enviar Reclamo
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClaimForm;
