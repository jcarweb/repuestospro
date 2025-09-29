import React from 'react';
import { useTranslation } from 'react-i18next';
import { StarIcon, ChartBarIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';

interface ReviewStatsProps {
  stats: {
    totalReviews: number;
    averageRating: number;
    totalPoints: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  period: string;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats, period }) => {
  const { t } = useTranslation();

  const totalReviews = stats.totalReviews;
  const maxRating = Math.max(...Object.values(stats.ratingDistribution));

  const getPeriodLabel = (period: string) => {
    const periods = {
      '7d': t('stats.periods.last7Days'),
      '30d': t('stats.periods.last30Days'),
      '90d': t('stats.periods.last90Days'),
      '1y': t('stats.periods.lastYear')
    };
    return periods[period as keyof typeof periods] || period;
  };

  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((rating / totalReviews) * 100);
  };

  const getRatingBarWidth = (rating: number) => {
    if (maxRating === 0) return 0;
    return (rating / maxRating) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('storeManager.reviews.stats.title')}
        </h2>
        <span className="text-sm text-gray-500">
          {getPeriodLabel(period)}
        </span>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <StarIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            {t('storeManager.reviews.stats.averageRating')}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-gray-600">
            {t('storeManager.reviews.stats.totalReviews')}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalPoints}
          </div>
          <div className="text-sm text-gray-600">
            {t('storeManager.reviews.stats.totalPoints')}
          </div>
        </div>
      </div>

      {/* Distribución de calificaciones */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('storeManager.reviews.stats.ratingDistribution')}
        </h3>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <StarIconSolid className="w-4 h-4 text-yellow-400" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getRatingBarWidth(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }}
                />
              </div>
              
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({getRatingPercentage(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de calificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              {t('storeManager.reviews.stats.positiveReviews')}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {stats.ratingDistribution[4] + stats.ratingDistribution[5]}
          </div>
          <div className="text-xs text-green-600">
            {totalReviews > 0 
              ? `${Math.round(((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / totalReviews) * 100)}% del total`
              : '0% del total'
            }
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDownIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-800">
              {t('storeManager.reviews.stats.negativeReviews')}
            </span>
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {stats.ratingDistribution[1] + stats.ratingDistribution[2]}
          </div>
          <div className="text-xs text-red-600">
            {totalReviews > 0 
              ? `${Math.round(((stats.ratingDistribution[1] + stats.ratingDistribution[2]) / totalReviews) * 100)}% del total`
              : '0% del total'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
