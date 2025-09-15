import { useActiveStore } from '../contexts/ActiveStoreContext';

export const useActiveStoreData = () => {
  const { activeStore, loading, userStores } = useActiveStore();

  return {
    // Tienda activa
    activeStore,
    loading,
    userStores,
    
    // Datos específicos de la tienda activa
    storeId: activeStore?._id,
    storeName: activeStore?.name,
    storeAddress: activeStore ? `${activeStore.address}, ${activeStore.city}, ${activeStore.state}` : '',
    storePhone: activeStore?.phone,
    storeEmail: activeStore?.email,
    storeCurrency: activeStore?.settings.currency || 'USD',
    storeTaxRate: activeStore?.settings.taxRate || 16.0,
    storeDeliveryRadius: activeStore?.settings.deliveryRadius || 10,
    storeMinimumOrder: activeStore?.settings.minimumOrder || 0,
    storeAutoAcceptOrders: activeStore?.settings.autoAcceptOrders || false,
    
    // Estado de la tienda
    isStoreActive: activeStore?.isActive || false,
    hasActiveStore: !!activeStore,
    hasMultipleStores: userStores.length > 1,
    
    // Configuración de horarios
    businessHours: activeStore?.businessHours,
    
    // Redes sociales
    socialMedia: activeStore?.socialMedia,
    
    // Coordenadas
    coordinates: activeStore?.coordinates,
    
    // Utilidades
    formatCurrency: (amount: number) => {
      const currency = activeStore?.settings.currency || 'USD';
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    },
    
    calculateTax: (amount: number) => {
      const taxRate = activeStore?.settings.taxRate || 16.0;
      return amount * (taxRate / 100);
    },
    
    calculateTotalWithTax: (amount: number) => {
      const taxRate = activeStore?.settings.taxRate || 16.0;
      return amount * (1 + taxRate / 100);
    }
  };
};
