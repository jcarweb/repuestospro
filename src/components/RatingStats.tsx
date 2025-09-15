import React from 'react';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RatingStatsProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
  previousPeriod?: {
    averageRating: number;
    totalRatings: number;
  };
  className?: string;
}

const RatingStats: React.FC<RatingStatsProps> = ({
  averageRating,
  totalRatings,
  ratingDistribution,
  previousPeriod,
  className = ''
}) => {
  const { t } = useLanguage();

  const getRatingPercentage = (rating: number) => {
    if (totalRatings === 0) return 0;
    return (ratingDistribution[rating] || 0) / totalRatings * 100;
  };

  const getRatingChange = () => {
    if (!previousPeriod) return null;
    const change = averageRating - previousPeriod.averageRating;
    return {
      value: change,
      percentage: previousPeriod.averageRating > 0 
        ? (change / previousPeriod.averageRating) * 100 
        : 0,
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const ratingChange = getRatingChange();

  return (
    <div className={`bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
          {t('rating.stats.title')}
        </h3>
        {ratingChange && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            ratingChange.isPositive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : ratingChange.isNegative
              ? 'bg-alert-100 text-alert-800 dark:bg-alert-900 dark:text-alert-300'
              : 'bg-carbon-100 text-carbon-800 dark:bg-carbon-700 dark:text-carbon-300'
          }`}>
            {ratingChange.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : ratingChange.isNegative ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {ratingChange.isPositive ? '+' : ''}{ratingChange.value.toFixed(1)}
          </div>
        )}
      </div>

      {/* Rating principal */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(averageRating)
                    ? 'fill-racing-500 text-racing-500'
                    : index < averageRating
                    ? 'fill-racing-500 text-racing-500 opacity-50'
                    : 'text-carbon-300 dark:text-carbon-600'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-carbon-600 dark:text-carbon-400 mt-1">
            {totalRatings} {t('rating.stats.totalRatings')}
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => {
              const rating = 5 - index;
              const percentage = getRatingPercentage(rating);
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-carbon-600 dark:text-carbon-400">
                      {rating}
                    </span>
                    <Star className="w-3 h-3 fill-racing-500 text-racing-500" />
                  </div>
                  <div className="flex-1 bg-carbon-100 dark:bg-carbon-700 rounded-full h-2">
                    <div
                      className="bg-racing-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-carbon-600 dark:text-carbon-400">
                      {ratingDistribution[rating] || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-carbon-200 dark:border-carbon-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
            {ratingDistribution[5] || 0}
          </div>
          <div className="text-sm text-carbon-600 dark:text-carbon-400">
            {t('rating.stats.excellent')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-alert-600 dark:text-alert-400">
            {(ratingDistribution[1] || 0) + (ratingDistribution[2] || 0)}
          </div>
          <div className="text-sm text-carbon-600 dark:text-carbon-400">
            {t('rating.stats.needsImprovement')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStats;
