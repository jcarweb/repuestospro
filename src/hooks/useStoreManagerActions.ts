import { useNavigate } from 'react-router-dom';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useToast } from '../components/StoreManagerToast';

export const useStoreManagerActions = () => {
  const navigate = useNavigate();
  const { activeStore } = useActiveStore();
  const { showSuccess, showError } = useToast();

  const actions = {
    // Navegación básica
    goToDashboard: () => navigate('/store-manager/dashboard'),
    goToProducts: () => navigate('/store-manager/products'),
    goToInventory: () => navigate('/store-manager/inventory'),
    goToPromotions: () => navigate('/store-manager/promotions'),
    goToOrders: () => navigate('/store-manager/orders'),
    goToSales: () => navigate('/store-manager/sales'),
    goToAnalytics: () => navigate('/store-manager/analytics'),
    goToMessages: () => navigate('/store-manager/messages'),
    goToSettings: () => navigate('/store-manager/settings'),

    // Acciones con parámetros
    createProduct: () => navigate('/store-manager/products?action=create'),
    createPromotion: () => navigate('/store-manager/promotions?action=create'),
    viewOrder: (orderId: string) => navigate(`/store-manager/orders?orderId=${orderId}`),
    viewProduct: (productId: string) => navigate(`/store-manager/products?productId=${productId}`),
    viewPromotion: (promotionId: string) => navigate(`/store-manager/promotions?promotionId=${promotionId}`),

    // Acciones de exportación
    exportInventory: async () => {
      if (!activeStore?._id) {
        showError('Error', 'No hay tienda activa seleccionada');
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/inventory/store-manager/export?storeId=${activeStore._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `inventario_${activeStore.name}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showSuccess('Éxito', 'Inventario exportado correctamente');
        } else {
          showError('Error', 'No se pudo exportar el inventario');
        }
      } catch (error) {
        console.error('Error exporting inventory:', error);
        showError('Error', 'Error al exportar el inventario');
      }
    },

    exportSalesReport: async (format: 'csv' | 'json' = 'csv') => {
      if (!activeStore?._id) {
        showError('Error', 'No hay tienda activa seleccionada');
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/sales-reports/store/export?storeId=${activeStore._id}&format=${format}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_ventas_${activeStore.name}_${new Date().toISOString().split('T')[0]}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showSuccess('Éxito', `Reporte de ventas exportado en formato ${format.toUpperCase()}`);
        } else {
          showError('Error', 'No se pudo exportar el reporte de ventas');
        }
      } catch (error) {
        console.error('Error exporting sales report:', error);
        showError('Error', 'Error al exportar el reporte de ventas');
      }
    },

    // Acciones de chat
    openChat: (chatId: string) => {
      window.open(`/chat/${chatId}`, '_blank');
    },

    // Acciones de notificaciones
    markAsRead: async (notificationId: string) => {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    // Acciones de configuración
    saveSettings: async (settings: any) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/store-manager/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settings)
        });

        if (response.ok) {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error saving settings:', error);
        return false;
      }
    },

    // Acciones de actualización de datos
    refreshData: (callback: () => void) => {
      callback();
    },

    // Acciones de validación
    validateStoreAccess: () => {
      return !!activeStore?._id;
    }
  };

  return actions;
};

export default useStoreManagerActions;
