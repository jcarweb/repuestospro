import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target,
  Play,
  Pause,
  Settings,
  Eye,
  MousePointer,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ABTestVariant {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  navigationUrl?: string;
  displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  trafficPercentage: number;
  status: 'active' | 'paused' | 'completed';
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpc: number;
    conversionRate: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  trafficSplit: '50-50' | '60-40' | '70-30' | 'custom';
  primaryMetric: 'ctr' | 'conversion_rate' | 'revenue' | 'cpc';
  confidenceLevel: number;
  sampleSize: number;
  winner?: string;
}

interface AdvertisementABTestingProps {
  onStartTest: (test: ABTest) => void;
  onPauseTest: (testId: string) => void;
  onEndTest: (testId: string, winnerId: string) => void;
}

const AdvertisementABTesting: React.FC<AdvertisementABTestingProps> = ({
  onStartTest,
  onPauseTest,
  onEndTest
}) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    setLoading(true);
    try {
      // Simular datos de A/B tests
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Test de Títulos',
          description: 'Comparando diferentes títulos para mejorar CTR',
          status: 'running',
          startDate: '2024-01-01',
          trafficSplit: '50-50',
          primaryMetric: 'ctr',
          confidenceLevel: 95,
          sampleSize: 1000,
          variants: [
            {
              id: '1a',
              name: 'Variante A',
              title: '¡Ofertas Increíbles!',
              description: 'Descubre las mejores ofertas',
              trafficPercentage: 50,
              status: 'active',
              metrics: {
                impressions: 5000,
                clicks: 450,
                conversions: 45,
                revenue: 900,
                ctr: 9.0,
                cpc: 2.0,
                conversionRate: 10.0
              }
            },
            {
              id: '1b',
              name: 'Variante B',
              title: 'Descuentos Especiales',
              description: 'Aprovecha nuestros descuentos',
              trafficPercentage: 50,
              status: 'active',
              metrics: {
                impressions: 5000,
                clicks: 520,
                conversions: 52,
                revenue: 1040,
                ctr: 10.4,
                cpc: 2.0,
                conversionRate: 10.0
              }
            }
          ]
        },
        {
          id: '2',
          name: 'Test de Imágenes',
          description: 'Probando diferentes imágenes para mayor engagement',
          status: 'paused',
          startDate: '2024-01-05',
          trafficSplit: '60-40',
          primaryMetric: 'conversion_rate',
          confidenceLevel: 90,
          sampleSize: 800,
          variants: [
            {
              id: '2a',
              name: 'Imagen A',
              title: 'Producto Destacado',
              description: 'Con imagen de producto',
              imageUrl: 'https://example.com/image1.jpg',
              trafficPercentage: 60,
              status: 'paused',
              metrics: {
                impressions: 3000,
                clicks: 240,
                conversions: 30,
                revenue: 600,
                ctr: 8.0,
                cpc: 2.5,
                conversionRate: 12.5
              }
            },
            {
              id: '2b',
              name: 'Imagen B',
              title: 'Producto Destacado',
              description: 'Con imagen de lifestyle',
              imageUrl: 'https://example.com/image2.jpg',
              trafficPercentage: 40,
              status: 'paused',
              metrics: {
                impressions: 2000,
                clicks: 180,
                conversions: 24,
                revenue: 480,
                ctr: 9.0,
                cpc: 2.5,
                conversionRate: 13.3
              }
            }
          ]
        }
      ];
      
      setTests(mockTests);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatisticalSignificance = (variantA: ABTestVariant, variantB: ABTestVariant) => {
    // Simulación de cálculo de significancia estadística
    const diff = Math.abs(variantA.metrics.ctr - variantB.metrics.ctr);
    const pooledSE = Math.sqrt(
      (variantA.metrics.ctr * (1 - variantA.metrics.ctr) / variantA.metrics.impressions) +
      (variantB.metrics.ctr * (1 - variantB.metrics.ctr) / variantB.metrics.impressions)
    );
    const zScore = diff / pooledSE;
    
    // Retorna probabilidad de que la diferencia sea significativa
    return Math.min(99.9, Math.max(0.1, 95 + (zScore - 1.96) * 10));
  };

  const getWinner = (test: ABTest) => {
    if (test.variants.length !== 2) return null;
    
    const [variantA, variantB] = test.variants;
    const significance = calculateStatisticalSignificance(variantA, variantB);
    
    if (significance < 90) return null; // No hay ganador claro
    
    const metricA = variantA.metrics[test.primaryMetric];
    const metricB = variantB.metrics[test.primaryMetric];
    
    return metricA > metricB ? variantA.id : variantB.id;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <TestTube className="w-8 h-8 text-[#FFC300] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#FFC300]">A/B Testing</h2>
          <p className="text-gray-600">Prueba diferentes versiones de publicidades para optimizar resultados</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] flex items-center space-x-2"
        >
          <TestTube className="w-4 h-4" />
          <span>Nuevo Test</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map(test => {
          const winner = getWinner(test);
          const isRunning = test.status === 'running';
          
          return (
            <div key={test.id} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                {/* Test Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      test.status === 'running' ? 'bg-green-100 text-green-800' :
                      test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status === 'running' ? 'Ejecutándose' :
                       test.status === 'paused' ? 'Pausado' :
                       test.status === 'completed' ? 'Completado' : 'Borrador'}
                    </span>
                    
                    {isRunning && (
                      <button
                        onClick={() => onPauseTest(test.id)}
                        className="p-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">División de Tráfico</p>
                    <p className="font-semibold">{test.trafficSplit}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Métrica Principal</p>
                    <p className="font-semibold capitalize">{test.primaryMetric.replace('_', ' ')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Nivel de Confianza</p>
                    <p className="font-semibold">{test.confidenceLevel}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Tamaño de Muestra</p>
                    <p className="font-semibold">{formatNumber(test.sampleSize)}</p>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Variantes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map(variant => (
                      <div key={variant.id} className={`p-4 border rounded-lg ${
                        winner === variant.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900">{variant.name}</h5>
                            <p className="text-sm text-gray-600">{variant.title}</p>
                          </div>
                          {winner === variant.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Impresiones</p>
                            <p className="font-semibold">{formatNumber(variant.metrics.impressions)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Clicks</p>
                            <p className="font-semibold">{formatNumber(variant.metrics.clicks)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">CTR</p>
                            <p className="font-semibold">{formatPercentage(variant.metrics.ctr)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversiones</p>
                            <p className="font-semibold">{formatNumber(variant.metrics.conversions)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Ingresos</p>
                            <p className="font-semibold">{formatCurrency(variant.metrics.revenue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">CPC</p>
                            <p className="font-semibold">{formatCurrency(variant.metrics.cpc)}</p>
                          </div>
                        </div>

                        {/* Traffic Percentage */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Tráfico asignado</span>
                            <span>{variant.trafficPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#FFC300] h-2 rounded-full" 
                              style={{ width: `${variant.trafficPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistical Significance */}
                {test.variants.length === 2 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Significancia Estadística</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-700">
                          {calculateStatisticalSignificance(test.variants[0], test.variants[1]).toFixed(1)}% de confianza
                        </span>
                      </div>
                      {winner && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Ganador identificado: {test.variants.find(v => v.id === winner)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-2">
                  {isRunning && winner && (
                    <button
                      onClick={() => onEndTest(test.id, winner)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Finalizar Test</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTest(test)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ver Detalles</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tests A/B activos</h3>
          <p className="text-gray-600 mb-4">Crea tu primer test A/B para optimizar tus publicidades</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] flex items-center space-x-2 mx-auto"
          >
            <TestTube className="w-4 h-4" />
            <span>Crear Test A/B</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvertisementABTesting;
