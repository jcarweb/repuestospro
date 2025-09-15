import { useLocation } from 'react-router-dom';

export const useLayoutContext = () => {
  const location = useLocation();
  
  const isAdminContext = location.pathname.startsWith('/admin');
  const isStoreManagerContext = location.pathname.startsWith('/store-manager');
  const isDeliveryContext = location.pathname.startsWith('/delivery');
  
  const isSpecificContext = isAdminContext || isStoreManagerContext || isDeliveryContext;
  
  return {
    isAdminContext,
    isStoreManagerContext,
    isDeliveryContext,
    isSpecificContext,
    // Clases CSS condicionales
    containerClasses: isSpecificContext 
      ? 'bg-gray-50 py-6' 
      : 'min-h-screen bg-gray-50 py-8',
    contentClasses: isSpecificContext 
      ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8' 
      : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'
  };
};
