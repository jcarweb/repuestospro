import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Award, Users, Gift, Star, Plus, Settings, Package, X } from 'lucide-react';
import RewardForm from '../components/RewardForm';
import RedemptionManagement from '../components/RedemptionManagement';
import PointsPolicyForm from '../components/PointsPolicyForm';
import LoyaltyStats from '../components/LoyaltyStats';

interface Reward {
  _id: string;
  name: string;
  description: string;
  image?: string;
  pointsRequired: number;
  cashRequired: number;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

interface Redemption {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rewardId: {
    _id: string;
    name: string;
    description: string;
    image?: string;
  };
  pointsSpent: number;
  cashSpent: number;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PointsPolicy {
  action: string;
  points: number;
  description: string;
  isActive: boolean;
}

type TabType = 'overview' | 'rewards' | 'redemptions' | 'policies';

const AdminLoyalty: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [policies, setPolicies] = useState<PointsPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedStats, setDetailedStats] = useState<any>(null);

  const stats = [
    {
      title: t('adminLoyalty.stats.activeCustomers'),
      value: '1,234',
      icon: Users,
      color: 'bg-[#FFC300]'
    },
    {
      title: t('adminLoyalty.stats.pointsAwarded'),
      value: '45,678',
      icon: Award,
      color: 'bg-[#FFC300]'
    },
    {
      title: t('adminLoyalty.stats.rewardsRedeemed'),
      value: '89',
      icon: Gift,
      color: 'bg-[#FFC300]'
    },
    {
      title: t('adminLoyalty.stats.averageRating'),
      value: '4.5',
      icon: Star,
      color: 'bg-[#FFC300]'
    }
  ];

  const tabs = [
    { id: 'overview', label: t('adminLoyalty.tabs.overview'), icon: Award },
    { id: 'rewards', label: t('adminLoyalty.tabs.rewards'), icon: Gift },
    { id: 'redemptions', label: t('adminLoyalty.tabs.redemptions'), icon: Package },
    { id: 'policies', label: t('adminLoyalty.tabs.policies'), icon: Settings }
  ];

  useEffect(() => {
    // Cargar datos iniciales
    loadRewards();
    loadRedemptions();
    loadPolicies();
    loadDetailedStats();
  }, []);

  const loadRewards = async () => {
    try {
      if (!token) {
        return;
      }
      
      setIsLoading(true);
      const response = await fetch('/api/loyalty/rewards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRewards(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando premios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRedemptions = async () => {
    try {
      const response = await fetch('/api/loyalty/redemptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando canjes:', error);
    }
  };

  const loadPolicies = async () => {
    try {
      const response = await fetch('/api/loyalty/policies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando políticas:', error);
    }
  };

  const loadDetailedStats = async () => {
    try {
      const response = await fetch('/api/loyalty/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDetailedStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas detalladas:', error);
    }
  };



  const handleCreateReward = async (rewardData: any) => {
    try {
      if (!token) {
        alert(t('adminLoyalty.messages.error.noToken'));
        return;
      }
      
      setIsLoading(true);
      const formData = new FormData();
      
      Object.keys(rewardData).forEach(key => {
        if (key === 'imageFile' && rewardData[key]) {
          formData.append('image', rewardData[key]);
        } else {
          formData.append(key, rewardData[key]);
        }
      });

      const response = await fetch('/api/loyalty/rewards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        await loadRewards();
        setShowRewardForm(false);
        alert(t('adminLoyalty.messages.rewardCreated'));
      } else {
        const errorData = await response.json();
        alert(`${t('adminLoyalty.messages.error.createReward')}: ${errorData.message || t('adminLoyalty.messages.error.unknown')}`);
      }
    } catch (error) {
      console.error('Error creando premio:', error);
      alert(t('adminLoyalty.messages.error.connection'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReward = async (rewardData: any) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      
      Object.keys(rewardData).forEach(key => {
        if (key === 'imageFile' && rewardData[key]) {
          formData.append('image', rewardData[key]);
        } else {
          formData.append(key, rewardData[key]);
        }
      });

      const response = await fetch(`/api/loyalty/rewards/${editingReward?._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Premio actualizado exitosamente:', result);
        await loadRewards();
        setEditingReward(null);
        setShowRewardForm(false);
        alert(t('adminLoyalty.messages.rewardUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        alert(`${t('adminLoyalty.messages.error.updateReward')}: ${errorData.message || t('adminLoyalty.messages.error.unknown')}`);
      }
    } catch (error) {
      console.error('Error actualizando premio:', error);
      alert(t('adminLoyalty.messages.error.connection'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (redemptionId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/loyalty/redemptions/${redemptionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        await loadRedemptions();
        
        // Mostrar mensaje de confirmación para estado entregado
        if (status === 'delivered') {
          alert(t('adminLoyalty.messages.statusUpdated'));
        }
      } else {
        const errorData = await response.json();
        alert(`${t('adminLoyalty.messages.error.updateStatus')}: ${errorData.message || t('adminLoyalty.messages.error.unknown')}`);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert(t('adminLoyalty.messages.error.connection'));
    }
  };

  const handleUpdateTracking = async (redemptionId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/loyalty/redemptions/${redemptionId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber })
      });

      if (response.ok) {
        await loadRedemptions();
      }
    } catch (error) {
      console.error('Error actualizando tracking:', error);
    }
  };

  const handleSavePolicies = async (newPolicies: PointsPolicy[]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/loyalty/policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ policies: newPolicies })
      });

      if (response.ok) {
        await loadPolicies();
      }
    } catch (error) {
      console.error('Error guardando políticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {detailedStats ? (
              <LoyaltyStats stats={detailedStats} />
            ) : (
              <>
                {/* Estadísticas básicas mientras cargan las detalladas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-full ${stat.color} text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de premios y canjes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminLoyalty.overview.activeRewards')}</h3>
                    <div className="space-y-3">
                      {rewards.slice(0, 3).map(reward => (
                        <div key={reward._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {reward.image && (
                              <img src={reward.image} alt={reward.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{reward.name}</p>
                              <p className="text-sm text-gray-600">{reward.pointsRequired} pts</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {reward.isActive ? t('adminLoyalty.overview.active') : t('adminLoyalty.overview.inactive')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminLoyalty.overview.recentRedemptions')}</h3>
                    <div className="space-y-3">
                      {redemptions.slice(0, 3).map(redemption => (
                        <div key={redemption._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{redemption.userId.name}</p>
                            <p className="text-sm text-gray-600">{redemption.rewardId.name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            redemption.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            redemption.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            redemption.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {redemption.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'rewards':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('adminLoyalty.rewards.title')}</h2>
              <button
                onClick={() => setShowRewardForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminLoyalty.rewards.newReward')}</span>
              </button>
            </div>

            {showRewardForm && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                  <div className="flex-shrink-0 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#FFC300]">
                        {editingReward ? t('adminLoyalty.rewards.editReward') : t('adminLoyalty.rewards.createNewReward')}
                      </h2>
                      <button
                        onClick={() => {
                          setShowRewardForm(false);
                          setEditingReward(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <RewardForm
                      reward={editingReward || undefined}
                      onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
                      onCancel={() => {
                        setShowRewardForm(false);
                        setEditingReward(null);
                      }}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminLoyalty.rewards.table.reward')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminLoyalty.rewards.table.points')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminLoyalty.rewards.table.stock')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminLoyalty.rewards.table.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminLoyalty.rewards.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rewards.map(reward => (
                      <tr key={reward._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {reward.image && (
                              <img src={reward.image} alt={reward.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                              <div className="text-sm text-gray-500">{reward.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reward.pointsRequired} pts
                          {reward.cashRequired > 0 && ` + $${reward.cashRequired}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reward.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {reward.isActive ? t('adminLoyalty.overview.active') : t('adminLoyalty.overview.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditReward(reward)}
                            className="text-[#FFC300] hover:text-[#E6B000]"
                          >
                            {t('adminLoyalty.rewards.edit')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'redemptions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('adminLoyalty.redemptions.title')}</h2>
            </div>

            <RedemptionManagement
              redemptions={redemptions}
              onStatusChange={handleStatusChange}
              onUpdateTracking={handleUpdateTracking}
              isLoading={isLoading}
            />
          </div>
        );

      case 'policies':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('adminLoyalty.policies.title')}</h2>
            </div>

            <PointsPolicyForm
              policies={policies}
              onSave={handleSavePolicies}
              isLoading={isLoading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminLoyalty.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminLoyalty.subtitle')}</p>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#FFC300] text-[#FFC300]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la pestaña */}
      {renderTabContent()}
    </div>
  );
};

export default AdminLoyalty; 