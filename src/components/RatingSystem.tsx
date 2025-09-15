import React, { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RatingSystemProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  readonly = false,
  showLabel = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [hoverRating, setHoverRating] = useState(0);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return t('rating.veryPoor');
      case 2:
        return t('rating.poor');
      case 3:
        return t('rating.fair');
      case 4:
        return t('rating.good');
      case 5:
        return t('rating.excellent');
      default:
        return '';
    }
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = readonly 
            ? starValue <= rating 
            : starValue <= (hoverRating || rating);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              onMouseLeave={handleStarLeave}
              disabled={readonly}
              className={`transition-colors duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
            >
              {isFilled ? (
                <Star 
                  className={`${getSizeClasses()} fill-racing-500 text-racing-500`} 
                />
              ) : (
                <Star 
                  className={`${getSizeClasses()} text-carbon-300 dark:text-carbon-600`} 
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
          {getRatingLabel(rating)}
        </span>
      )}
      
      <span className="text-sm text-carbon-500 dark:text-carbon-400">
        ({rating}/{maxRating})
      </span>
    </div>
  );
};

export default RatingSystem;
