import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Award,
  Gift,
  Zap,
  Crown
} from 'lucide-react';

interface MonetizationFlowProps {
  onComplete?: (data: any) => void;
  initialData?: any;
}

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

const MonetizationFlow: React.FC<MonetizationFlowProps> = ({ onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [flowData, setFlowData] = useState<any>(initialData || {});

  const steps: FlowStep[] = [
    {
      id: 'pricing',
      title: 'Configuración de Precios',
      description: 'Establece las tarifas base y estructura de precios',
      icon: DollarSign,
      completed: completedSteps.has('pricing'),
      required: true
    },
    {
      id: 'plans',
      title: 'Planes de Publicidad',
      description: 'Crea y configura los planes de publicidad disponibles',
      icon: Target,
      completed: completedSteps.has('plans'),
      required: true
    },
    {
      id: 'commissions',
      title: 'Comisiones y Tarifas',
      description: 'Define las comisiones para diferentes tipos de transacciones',
      icon: TrendingUp,
      completed: completedSteps.has('commissions'),
      required: true
    },
    {
      id: 'subscriptions',
      title: 'Suscripciones',
      description: 'Configura los planes de suscripción para tiendas',
      icon: Users,
      completed: completedSteps.has('subscriptions'),
      required: false
    },
    {
      id: 'promotions',
      title: 'Sistema de Promociones',
      description: 'Establece las reglas para promociones y descuentos',
      icon: Gift,
      completed: completedSteps.has('promotions'),
      required: false
    },
    {
      id: 'analytics',
      title: 'Analytics y Reportes',
      description: 'Configura el sistema de reportes y métricas',
      icon: BarChart3,
      completed: completedSteps.has('analytics'),
      required: false
    }
  ];

  const handleStepComplete = (stepId: string, data: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setFlowData(prev => ({ ...prev, [stepId]: data }));
    
    // Avanzar al siguiente paso si no es el último
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Flujo completado
      onComplete?.(flowData);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const getStepIcon = (step: FlowStep) => {
    const Icon = step.icon;
    if (step.completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    return <Icon className="w-6 h-6 text-gray-400" />;
  };

  const getStepStatus = (step: FlowStep) => {
    if (step.completed) {
      return 'completed';
    }
    if (currentStep === steps.findIndex(s => s.id === step.id)) {
      return 'current';
    }
    return 'pending';
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    
    switch (currentStepData.id) {
      case 'pricing':
        return <PricingStep onComplete={(data) => handleStepComplete('pricing', data)} data={flowData.pricing} />;
      case 'plans':
        return <PlansStep onComplete={(data) => handleStepComplete('plans', data)} data={flowData.plans} />;
      case 'commissions':
        return <CommissionsStep onComplete={(data) => handleStepComplete('commissions', data)} data={flowData.commissions} />;
      case 'subscriptions':
        return <SubscriptionsStep onComplete={(data) => handleStepComplete('subscriptions', data)} data={flowData.subscriptions} />;
      case 'promotions':
        return <PromotionsStep onComplete={(data) => handleStepComplete('promotions', data)} data={flowData.promotions} />;
      case 'analytics':
        return <AnalyticsStep onComplete={(data) => handleStepComplete('analytics', data)} data={flowData.analytics} />;
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de Monetización
        </h1>
        <p className="text-gray-600">
          Configura todos los aspectos de monetización de tu plataforma
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Progreso: {completedSteps.size} de {steps.length} pasos completados
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((completedSteps.size / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#FFC300] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isClickable = index <= currentStep || step.completed;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`} onClick={() => isClickable && setCurrentStep(index)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'current' ? 'bg-[#FFC300] text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {getStepIcon(step)}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-[#FFC300]' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>
        
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div className="flex space-x-3">
          {!steps[currentStep].required && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Omitir
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componentes para cada paso
const PricingStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [formData, setFormData] = useState(data || {
    basePrice: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    setupFee: 0,
    minimumSpend: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({...formData, currency: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="VES">VES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo de Facturación</label>
          <select
            value={formData.billingCycle}
            onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo de Configuración</label>
          <input
            type="number"
            value={formData.setupFee}
            onChange={(e) => setFormData({...formData, setupFee: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Configuración de Precios
      </button>
    </form>
  );
};

const PlansStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [plans, setPlans] = useState(data?.plans || []);

  const handleAddPlan = () => {
    const newPlan = {
      id: Date.now().toString(),
      name: '',
      type: 'basic',
      price: 0,
      features: []
    };
    setPlans([...plans, newPlan]);
  };

  const handlePlanChange = (index: number, field: string, value: any) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlans(updatedPlans);
  };

  const handleComplete = () => {
    onComplete({ plans });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Planes de Publicidad</h3>
        <button
          onClick={handleAddPlan}
          className="px-3 py-1 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
        >
          Agregar Plan
        </button>
      </div>
      
      {plans.map((plan: any, index: number) => (
        <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
              <input
                type="text"
                value={plan.name}
                onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={plan.type}
                onChange={(e) => handlePlanChange(index, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Empresarial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                value={plan.price}
                onChange={(e) => handlePlanChange(index, 'price', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={handleComplete}
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Planes
      </button>
    </div>
  );
};

const CommissionsStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [commissions, setCommissions] = useState(data || {
    sales: 5,
    advertising: 10,
    subscriptions: 15,
    delivery: 8
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(commissions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión por Ventas (%)</label>
          <input
            type="number"
            value={commissions.sales}
            onChange={(e) => setCommissions({...commissions, sales: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión por Publicidad (%)</label>
          <input
            type="number"
            value={commissions.advertising}
            onChange={(e) => setCommissions({...commissions, advertising: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión por Suscripciones (%)</label>
          <input
            type="number"
            value={commissions.subscriptions}
            onChange={(e) => setCommissions({...commissions, subscriptions: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión por Delivery (%)</label>
          <input
            type="number"
            value={commissions.delivery}
            onChange={(e) => setCommissions({...commissions, delivery: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Comisiones
      </button>
    </form>
  );
};

const SubscriptionsStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [subscriptions, setSubscriptions] = useState(data || {
    basic: { price: 29, features: ['Gestión básica', 'Hasta 100 productos'] },
    premium: { price: 59, features: ['Gestión avanzada', 'Hasta 500 productos', 'Analytics'] },
    enterprise: { price: 99, features: ['Gestión completa', 'Productos ilimitados', 'Soporte prioritario'] }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(subscriptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(subscriptions).map(([plan, data]: [string, any]) => (
          <div key={plan} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 capitalize mb-2">{plan}</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                value={data.price}
                onChange={(e) => setSubscriptions({
                  ...subscriptions,
                  [plan]: { ...data, price: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
              <textarea
                value={data.features.join('\n')}
                onChange={(e) => setSubscriptions({
                  ...subscriptions,
                  [plan]: { ...data, features: e.target.value.split('\n') }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
              />
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Suscripciones
      </button>
    </form>
  );
};

const PromotionsStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [promotions, setPromotions] = useState(data || {
    maxDiscount: 50,
    minOrderValue: 100,
    maxUsesPerUser: 3,
    approvalRequired: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(promotions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descuento Máximo (%)</label>
          <input
            type="number"
            value={promotions.maxDiscount}
            onChange={(e) => setPromotions({...promotions, maxDiscount: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo de Orden</label>
          <input
            type="number"
            value={promotions.minOrderValue}
            onChange={(e) => setPromotions({...promotions, minOrderValue: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usos Máximos por Usuario</label>
          <input
            type="number"
            value={promotions.maxUsesPerUser}
            onChange={(e) => setPromotions({...promotions, maxUsesPerUser: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={promotions.approvalRequired}
            onChange={(e) => setPromotions({...promotions, approvalRequired: e.target.checked})}
            className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Requiere Aprobación
          </label>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Configuración de Promociones
      </button>
    </form>
  );
};

const AnalyticsStep: React.FC<{ onComplete: (data: any) => void; data?: any }> = ({ onComplete, data }) => {
  const [analytics, setAnalytics] = useState(data || {
    trackingEnabled: true,
    reportFrequency: 'weekly',
    metrics: ['revenue', 'conversions', 'traffic'],
    retentionPeriod: 365
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(analytics);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={analytics.trackingEnabled}
            onChange={(e) => setAnalytics({...analytics, trackingEnabled: e.target.checked})}
            className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Habilitar Tracking de Analytics
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Reportes</label>
          <select
            value={analytics.reportFrequency}
            onChange={(e) => setAnalytics({...analytics, reportFrequency: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Período de Retención (días)</label>
          <input
            type="number"
            value={analytics.retentionPeriod}
            onChange={(e) => setAnalytics({...analytics, retentionPeriod: Number(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000]"
      >
        Guardar Configuración de Analytics
      </button>
    </form>
  );
};

export default MonetizationFlow;
