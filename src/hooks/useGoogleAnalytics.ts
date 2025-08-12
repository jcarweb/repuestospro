import { useEffect, useState } from 'react';

interface GoogleAnalyticsConfig {
  measurementId: string;
  customEvents: {
    userRegistration: boolean;
    userLogin: boolean;
    purchase: boolean;
    review: boolean;
    referral: boolean;
    rewardRedemption: boolean;
    locationUpdate: boolean;
  };
  customDimensions: {
    userId: boolean;
    userRole: boolean;
    loyaltyLevel: boolean;
    locationEnabled: boolean;
  };
  customMetrics: {
    pointsEarned: boolean;
    totalSpent: boolean;
    referralCount: boolean;
  };
}

export const useGoogleAnalytics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<GoogleAnalyticsConfig | null>(null);

  // Cargar configuración de Google Analytics
  useEffect(() => {
    const loadAnalyticsConfig = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics/custom-config');
        const result = await response.json();
        
        if (result.success && result.data) {
          setConfig(result.data);
          setIsLoaded(true);
        } else {
          // Si no hay configuración, marcar como cargado para evitar errores
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error cargando configuración de GA:', error);
        // Marcar como cargado para evitar errores
        setIsLoaded(true);
      }
    };

    loadAnalyticsConfig();
  }, []);

  // Funciones específicas para eventos del sistema (simplificadas)
  const trackUserRegistration = (userId: string, userRole: string) => {
    console.log('Track user registration:', { userId, userRole });
  };

  const trackUserLogin = (userId: string, userRole: string, loyaltyLevel: string) => {
    console.log('Track user login:', { userId, userRole, loyaltyLevel });
  };

  const trackPurchase = (userId: string, orderId: string, total: number, loyaltyLevel: string) => {
    console.log('Track purchase:', { userId, orderId, total, loyaltyLevel });
  };

  const trackReview = (userId: string, productId: string, rating: number, pointsEarned: number) => {
    console.log('Track review:', { userId, productId, rating, pointsEarned });
  };

  const trackReferral = (userId: string, referralCode: string, platform: string) => {
    console.log('Track referral:', { userId, referralCode, platform });
  };

  const trackRewardRedemption = (userId: string, rewardId: string, pointsSpent: number, cashSpent: number) => {
    console.log('Track reward redemption:', { userId, rewardId, pointsSpent, cashSpent });
  };

  const trackLocationUpdate = (userId: string, locationEnabled: boolean) => {
    console.log('Track location update:', { userId, locationEnabled });
  };

  return {
    isLoaded,
    config,
    trackUserRegistration,
    trackUserLogin,
    trackPurchase,
    trackReview,
    trackReferral,
    trackRewardRedemption,
    trackLocationUpdate
  };
}; 