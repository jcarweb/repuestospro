import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { ShieldCheck, Clock, DollarSign, CheckCircle } from 'react-bootstrap-icons';

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

interface PurchaseGuaranteeProps {
  transactionAmount: number;
  productId?: string;
  storeId: string;
  onWarrantySelect: (warranty: WarrantyOption | null) => void;
  selectedWarranty?: WarrantyOption | null;
  isLoading?: boolean;
}

const PurchaseGuarantee: React.FC<PurchaseGuaranteeProps> = ({
  transactionAmount,
  productId,
  storeId,
  onWarrantySelect,
  selectedWarranty,
  isLoading = false
}) => {
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarrantyOptions();
  }, [transactionAmount]);

  const fetchWarrantyOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warranties/options?amount=${transactionAmount}&storeId=${storeId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar opciones de garantía');
      }

      const data = await response.json();
      setWarrantyOptions(data.warranties || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleWarrantySelect = (warranty: WarrantyOption) => {
    onWarrantySelect(warranty);
  };

  const handleRemoveWarranty = () => {
    onWarrantySelect(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getProtectionLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'success';
      case 'premium': return 'warning';
      case 'extended': return 'danger';
      default: return 'secondary';
    }
  };

  const getProtectionLevelText = (level: string) => {
    switch (level) {
      case 'basic': return 'Básica';
      case 'premium': return 'Premium';
      case 'extended': return 'Extendida';
      default: return level;
    }
  };

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando opciones de garantía...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>⚠️ Advertencia</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-warning" size="sm" onClick={fetchWarrantyOptions}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <div className="purchase-guarantee">
      <Card className="mb-3 border-primary">
        <Card.Header className="bg-primary text-white">
          <ShieldCheck className="me-2" />
          <strong>Protección de Compra Segura</strong>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="mb-3">
            <strong>💡 ¿Por qué elegir protección?</strong>
            <ul className="mb-0 mt-2">
              <li>Reembolso completo si el producto no llega</li>
              <li>Protección contra productos defectuosos</li>
              <li>Garantía si el producto no es como se describe</li>
              <li>Solo disponible comprando dentro de la app</li>
            </ul>
          </Alert>

          {selectedWarranty ? (
            <div className="selected-warranty mb-3">
              <Card className="border-success">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <CheckCircle className="text-success me-2" />
                        Garantía Seleccionada
                      </h6>
                      <Badge bg={getProtectionLevelColor(selectedWarranty.level)} className="mb-2">
                        {getProtectionLevelText(selectedWarranty.level)}
                      </Badge>
                      <p className="mb-1">
                        <strong>Cobertura:</strong> {formatCurrency(selectedWarranty.coverageAmount)} 
                        ({selectedWarranty.coveragePercentage}%)
                      </p>
                      <p className="mb-1">
                        <strong>Duración:</strong> {selectedWarranty.durationDays} días
                      </p>
                      <p className="mb-1">
                        <strong>Costo:</strong> {formatCurrency(selectedWarranty.cost)}
                      </p>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={handleRemoveWarranty}
                      disabled={isLoading}
                    >
                      Remover
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="warranty-options">
              <h6 className="mb-3">Selecciona tu nivel de protección:</h6>
              
              {warrantyOptions.map((warranty, index) => (
                <Card 
                  key={index} 
                  className="mb-2 warranty-option"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleWarrantySelect(warranty)}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <Badge bg={getProtectionLevelColor(warranty.level)} className="me-2">
                            {getProtectionLevelText(warranty.level)}
                          </Badge>
                          <span className="text-muted">
                            <Clock className="me-1" />
                            {warranty.durationDays} días
                          </span>
                        </div>
                        
                        <h6 className="mb-1">{warranty.description}</h6>
                        
                        <div className="row text-sm">
                          <div className="col-6">
                            <DollarSign className="me-1" />
                            <strong>Cobertura:</strong> {formatCurrency(warranty.coverageAmount)}
                          </div>
                          <div className="col-6">
                            <strong>Costo:</strong> {formatCurrency(warranty.cost)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <small className="text-muted">
                            <strong>Cubre:</strong>
                            {warranty.terms.coversDefectiveProducts && ' Productos defectuosos,'}
                            {warranty.terms.coversNonDelivery && ' No entrega,'}
                            {warranty.terms.coversNotAsDescribed && ' No como se describe,'}
                            {warranty.terms.coversLateDelivery && ' Entrega tardía'}
                          </small>
                        </div>
                      </div>
                      
                      <div className="text-end">
                        <Button variant="outline-primary" size="sm">
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          <Alert variant="warning" className="mt-3">
            <strong>⚠️ Importante:</strong> Esta protección solo está disponible cuando compras dentro de la app. 
            Si sales de la app, pierdes tu garantía de seguridad.
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PurchaseGuarantee;
