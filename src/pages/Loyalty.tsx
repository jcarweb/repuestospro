import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  Gift, 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  MapPin,
  ShoppingBag,
  MessageSquare,
  Zap,
  Share2
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import ReferralModal from '../components/ReferralModal';
import { API_BASE_URL } from '../config/api';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface LoyaltyStats {
  currentPoints: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalPurchases: number;
  totalSpent: number;
  reviewsCount: number;
  redemptionsCount: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  referralCode: string;
  referredBy?: string;
}

const Loyalty: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'reviews' | 'referrals'>('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [trackingStats, setTrackingStats] = useState<any>(null);
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  
  // Google Analytics hook
  const { trackReferral } = useGoogleAnalytics();

  useEffect(() => {
    fetchLoyaltyStats();
    fetchTrackingStats();
    fetchAvailableRewards();
  }, []);

  const fetchLoyaltyStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""""/api/loyalty/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/loyalty/tracking-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setTrackingStats(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de tracking:', error);
    }
  };

  const fetchAvailableRewards = async () => {
    setLoadingRewards(true);
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/loyalty/available-rewards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setAvailableRewards(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo premios disponibles:', error);
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!confirm('¿Estás seguro de que quieres canjear este premio?')) {
      return;
    }

    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rewardId })
      });

      const result = await response.json();
      if (result.success) {
        alert('¡Premio canjeado exitosamente!');
        // Recargar datos
        fetchLoyaltyStats();
        fetchAvailableRewards();
      } else {
        alert(result.message || 'Error al canjear el premio');
      }
    } catch (error) {
      console.error('Error canjeando premio:', error);
      alert('Error al canjear el premio');
    }
  };

  const getLoyaltyLevelInfo = (level: string) => {
    const levels = {
      bronze: { name: 'Bronce', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: '🥉' },
      silver: { name: 'Plata', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🥈' },
      gold: { name: 'Oro', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🥇' },
      platinum: { name: 'Platino', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '💎' }
    };
    return levels[level as keyof typeof levels] || levels.bronze;
  };

  const getNextLevelInfo = (currentLevel: string) => {
    const nextLevels = {
      bronze: { level: 'silver', points: 2000, spent: 200, name: 'Plata' },
      silver: { level: 'gold', points: 5000, spent: 500, name: 'Oro' },
      gold: { level: 'platinum', points: 10000, spent: 1000, name: 'Platino' },
      platinum: null
    };
    return nextLevels[currentLevel as keyof typeof nextLevels];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error cargando datos</h2>
          <p className="text-gray-600">No se pudieron cargar las estadísticas de fidelización</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLoyaltyLevelInfo(stats.loyaltyLevel);
  const nextLevel = getNextLevelInfo(stats.loyaltyLevel);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Programa de Fidelización
          </h1>
          <p className="text-gray-600">
            Gana puntos, sube de nivel y canjea premios increíbles
          </p>
        </div>

        {/* Nivel de Lealtad */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-4xl ${levelInfo.color}`}>
                {levelInfo.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Nivel {levelInfo.name}
                </h2>
                <p className="text-gray-600">
                  {stats.currentPoints.toLocaleString()} puntos actuales
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {stats.currentPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Puntos Totales</div>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Próximo nivel: {nextLevel.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Necesitas {nextLevel.points.toLocaleString()} puntos y ${nextLevel.spent} en compras
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">
                    {Math.round((stats.currentPoints / nextLevel.points) * 100)}%
                  </div>
                  <div className="text-xs text-blue-500">Progreso</div>
                </div>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.currentPoints / nextLevel.points) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compras</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premios Canjeados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.redemptionsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Resumen', icon: Award },
                { id: 'rewards', name: 'Premios', icon: Gift },
                { id: 'reviews', name: 'Calificaciones', icon: Star },
                { id: 'referrals', name: 'Referidos', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Puntos Ganados</h3>
                    <p className="text-3xl font-bold">{stats.totalPointsEarned.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm">Total histórico</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Puntos Gastados</h3>
                    <p className="text-3xl font-bold">{stats.totalPointsSpent.toLocaleString()}</p>
                    <p className="text-green-100 text-sm">En premios</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cómo Ganar Puntos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Star className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Calificar Productos</p>
                        <p className="text-sm text-gray-600">50-250 puntos por calificación</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Referir Amigos</p>
                        <p className="text-sm text-gray-600">500 puntos por referido</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Compras</p>
                        <p className="text-sm text-gray-600">1 punto por cada $1</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Calificar Servicios</p>
                        <p className="text-sm text-gray-600">75-375 puntos por calificación</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Premios Disponibles
                  </h3>
                  <button
                    onClick={fetchAvailableRewards}
                    disabled={loadingRewards}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingRewards ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>

                {loadingRewards ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando premios...</p>
                  </div>
                ) : availableRewards.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay premios disponibles
                    </h3>
                    <p className="text-gray-600">
                      Por el momento no hay premios disponibles para canjear
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableRewards.map((reward) => (
                      <div key={reward._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {reward.image && (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <img
                              src={reward.image}
                              alt={reward.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {reward.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {reward.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Puntos requeridos:</span>
                              <span className="font-semibold text-blue-600">
                                {reward.pointsRequired.toLocaleString()}
                              </span>
                            </div>
                            {reward.cashRequired > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Efectivo adicional:</span>
                                <span className="font-semibold text-green-600">
                                  ${reward.cashRequired.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Stock disponible:</span>
                              <span className="font-semibold text-gray-900">
                                {reward.stock}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Categoría:</span>
                              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {reward.category}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRedeemReward(reward._id)}
                            disabled={!reward.canAfford || reward.stock <= 0}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              reward.canAfford && reward.stock > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {!reward.canAfford
                              ? 'Puntos insuficientes'
                              : reward.stock <= 0
                              ? 'Agotado'
                              : 'Canjear Premio'
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mis Calificaciones
                </h3>
                <p className="text-gray-600">
                  Aquí verás todas las calificaciones que has enviado
                </p>
              </div>
            )}

                         {activeTab === 'referrals' && (
               <div className="space-y-6">
                 {/* Código de Referido */}
                 <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
                   <h3 className="text-lg font-semibold mb-2">Tu Código de Referido</h3>
                   <div className="flex items-center justify-between">
                     <div className="text-3xl font-bold font-mono">
                       {stats.referralCode}
                     </div>
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(stats.referralCode);
                         // Mostrar notificación de copiado
                       }}
                       className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                     >
                       Copiar
                     </button>
                     <button 
                       onClick={() => {
                         setShowShareModal(true);
                         // Track referral share in Google Analytics
                         if (user && stats) {
                           trackReferral(user.id, stats.referralCode, 'manual');
                         }
                       }}
                       className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors ml-2"
                     >
                       <Share2 size={16} className="inline mr-1" />
                       Compartir
                     </button>
                   </div>
                   <p className="text-green-100 text-sm mt-2">
                     Comparte este código con amigos y ambos ganarán puntos
                   </p>
                 </div>

                 {/* Compartir en Redes Sociales */}
                 <div className="bg-white rounded-lg shadow-sm p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Compartir en Redes Sociales</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <button 
                       onClick={() => {
                         setShowShareModal(true);
                         // Track referral share in Google Analytics
                         if (user && stats) {
                           trackReferral(user.id, stats.referralCode, 'social');
                         }
                       }}
                       className="flex flex-col items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                       <Share2 className="w-8 h-8 mb-2" />
                       <span className="text-sm font-medium">Compartir</span>
                     </button>
                   </div>
                 </div>

                 {/* Estadísticas de Referidos */}
                 <div className="bg-white rounded-lg shadow-sm p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Referidos</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="text-center p-4 bg-blue-50 rounded-lg">
                       <div className="text-2xl font-bold text-blue-600">
                         {trackingStats?.totalSuccessfulRegistrations || 0}
                       </div>
                       <div className="text-sm text-gray-600">Referidos Registrados</div>
                     </div>
                     <div className="text-center p-4 bg-green-50 rounded-lg">
                       <div className="text-2xl font-bold text-green-600">
                         {trackingStats?.totalPointsEarned || 0}
                       </div>
                       <div className="text-sm text-gray-600">Puntos Ganados</div>
                     </div>
                     <div className="text-center p-4 bg-purple-50 rounded-lg">
                       <div className="text-2xl font-bold text-purple-600">
                         {trackingStats?.totalClicks || 0}
                       </div>
                       <div className="text-sm text-gray-600">Clics en Enlaces</div>
                     </div>
                   </div>
                 </div>

                 {/* Cómo Funciona */}
                 <div className="bg-gray-50 rounded-lg p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Cómo Funciona</h3>
                   <div className="space-y-4">
                     <div className="flex items-start space-x-3">
                       <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                         1
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">Comparte tu código</p>
                         <p className="text-sm text-gray-600">Envía tu código único a amigos y familiares</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-3">
                       <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                         2
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">Ellos se registran</p>
                         <p className="text-sm text-gray-600">Usan tu código al crear su cuenta</p>
                       </div>
                     </div>
                     <div className="flex items-start space-x-3">
                       <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                         3
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">Ambos ganan</p>
                         <p className="text-sm text-gray-600">Tú obtienes 500 puntos, ellos 200 puntos</p>
                       </div>
                     </div>
                   </div>
                   
                   {/* Botón para usar código de referido */}
                   <div className="mt-6 pt-4 border-t border-gray-200">
                     <button
                       onClick={() => setShowReferralModal(true)}
                       className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                     >
                       ¿Tienes un código de referido? Úsalo aquí
                     </button>
                   </div>
                 </div>
               </div>
             )}
          </div>
                 </div>
       </div>

       {/* Share Modal */}
       {stats && (
         <ShareModal
           isOpen={showShareModal}
           onClose={() => setShowShareModal(false)}
           referralCode={stats.referralCode}
           shareUrl="https://PiezasYA.com"
           shareText="¡Únete a PiezasYA y gana puntos con mi código de referido!"
         />
       )}

       {/* Referral Modal */}
       <ReferralModal
         isOpen={showReferralModal}
         onClose={() => setShowReferralModal(false)}
         onReferralApplied={(referrerName, pointsEarned) => {
           console.log(`Referido aplicado: ${referrerName}, puntos ganados: ${pointsEarned}`);
           // Aquí se podría actualizar las estadísticas
           fetchLoyaltyStats();
         }}
       />
     </div>
   );
 };

export default Loyalty; 