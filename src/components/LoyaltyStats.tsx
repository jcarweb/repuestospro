import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TrendingUp, TrendingDown, Users, Award, Gift, Star, DollarSign, Calendar } from 'lucide-react';

interface LoyaltyStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPoints: number;
    pointsIssued: number;
    pointsRedeemed: number;
    totalRewards: number;
    activeRewards: number;
    totalRedemptions: number;
    pendingRedemptions: number;
    completedRedemptions: number;
    averageRating: number;
    totalReviews: number;
    monthlyGrowth: number;
    topRewards: Array<{
      name: string;
      redemptions: number;
      points: number;
    }>;
    recentActivity: Array<{
      type: string;
      description: string;
      points: number;
      date: string;
    }>;
  };
}

const LoyaltyStats: React.FC<LoyaltyStatsProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getActivityDescription = (activity: any) => {
    const baseDescription = activity.description;
    const userName = baseDescription.split(' por ')[1] || baseDescription.split(' by ')[1] || baseDescription.split(' por ')[1];
    
    switch (activity.type) {
      case 'purchase':
        return `${t('loyaltyDashboard.activity.purchase')} ${userName}`;
      case 'review':
        return `${t('loyaltyDashboard.activity.review')} ${userName}`;
      case 'referral':
        return `${t('loyaltyDashboard.activity.referral')} ${userName}`;
      case 'redemption':
        return `${t('loyaltyDashboard.activity.redemption')} ${userName}`;
      default:
        return activity.description;
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(stats.monthlyGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(stats.monthlyGrowth)}`}>
                  {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth}%
                </span>
                <span className="text-sm text-gray-500 ml-1">{t('loyaltyDashboard.stats.thisMonth')}</span>
              </div>
            </div>
            <div className="p-3 bg-[#FFC300] bg-opacity-20 rounded-full">
              <Users className="w-6 h-6 text-[#FFC300]" />
            </div>
          </div>
        </div>

        {/* Puntos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.totalPoints')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalPoints)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">
                  +{formatNumber(stats.pointsIssued)} {t('loyaltyDashboard.stats.issued')}
                </span>
                <span className="text-sm text-red-600 font-medium ml-2">
                  -{formatNumber(stats.pointsRedeemed)} {t('loyaltyDashboard.stats.redeemed')}
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#FFC300] bg-opacity-20 rounded-full">
              <Award className="w-6 h-6 text-[#FFC300]" />
            </div>
          </div>
        </div>

        {/* Premios */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.activeRewards')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRewards}</p>
              <p className="text-sm text-gray-500 mt-1">{t('loyaltyDashboard.stats.ofTotal')} {stats.totalRewards} {t('loyaltyDashboard.stats.total')}</p>
            </div>
            <div className="p-3 bg-[#FFC300] bg-opacity-20 rounded-full">
              <Gift className="w-6 h-6 text-[#FFC300]" />
            </div>
          </div>
        </div>

        {/* Canjes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.completedRedemptions')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedRedemptions}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.pendingRedemptions} {t('loyaltyDashboard.stats.pending')}</p>
            </div>
            <div className="p-3 bg-[#FFC300] bg-opacity-20 rounded-full">
              <DollarSign className="w-6 h-6 text-[#FFC300]" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premios más populares */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('loyaltyDashboard.sections.popularRewards')}</h3>
          <div className="space-y-4">
            {stats.topRewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reward.name}</p>
                    <p className="text-sm text-gray-500">{reward.points} {t('loyaltyDashboard.rewards.points')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{reward.redemptions}</p>
                  <p className="text-sm text-gray-500">{t('loyaltyDashboard.rewards.redemptions')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('loyaltyDashboard.sections.recentActivity')}</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    {activity.type === 'purchase' && <DollarSign className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'review' && <Star className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'referral' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'redemption' && <Gift className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getActivityDescription(activity)}</p>
                    <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.points >= 0 ? '+' : ''}{activity.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Valoración promedio */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.averageRating')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">{formatNumber(stats.totalReviews)} {t('loyaltyDashboard.stats.reviews')}</p>
            </div>
            <div className="p-3 bg-[#FFC300] bg-opacity-20 rounded-full">
              <Star className="w-6 h-6 text-[#FFC300]" />
            </div>
          </div>
        </div>

        {/* Usuarios activos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.activeUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeUsers)}</p>
              <p className="text-sm text-gray-500">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}{t('loyaltyDashboard.stats.ofTotalUsers')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tasa de conversión */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('loyaltyDashboard.stats.conversionRate')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers > 0 ? ((stats.completedRedemptions / stats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500">{t('loyaltyDashboard.stats.usersWhoRedeemed')}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyStats;
