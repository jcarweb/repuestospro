import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  phoneLocal?: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  isActive: boolean;
  isMainStore: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActiveStoreContextType {
  activeStore: Store | null;
  setActiveStore: (store: Store | null) => void;
  userStores: Store[];
  loading: boolean;
  refreshStores: () => Promise<void>;
}

const ActiveStoreContext = createContext<ActiveStoreContextType | undefined>(undefined);

export const useActiveStore = () => {
  const context = useContext(ActiveStoreContext);
  if (context === undefined) {
    throw new Error('useActiveStore must be used within an ActiveStoreProvider');
  }
  return context;
};

interface ActiveStoreProviderProps {
  children: ReactNode;
}

export const ActiveStoreProvider: React.FC<ActiveStoreProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchUserStores = useCallback(async () => {
    console.log('ActiveStoreContext: fetchUserStores called');
    console.log('ActiveStoreContext: token:', !!token);
    console.log('ActiveStoreContext: user role:', user?.role);
    
    if (!token || user?.role !== 'store_manager') {
      console.log('ActiveStoreContext: No token or not store_manager, setting loading to false');
      setLoading(false);
      return;
    }

    console.log('ActiveStoreContext: Iniciando fetch de tiendas...');

    try {
      setLoading(true);
      console.log('ActiveStoreContext: Haciendo petición a /api/user/stores/complete...');
      
      const response = await fetch('http://localhost:5000/api/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('ActiveStoreContext: Respuesta recibida, status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ActiveStoreContext: Datos parseados:', data);
      console.log('ActiveStoreContext: Success:', data.success);
      console.log('ActiveStoreContext: Data length:', data.data?.length || 0);
      
      if (data.success) {
        console.log('ActiveStoreContext: Datos completos recibidos:', data.data);
        const stores = data.data || [];
        console.log('ActiveStoreContext: Tiendas encontradas:', stores.length);
        console.log('ActiveStoreContext: Detalles de tiendas:', stores.map(s => ({ id: s._id, name: s.name, isActive: s.isActive })));
        
        setUserStores(stores);
        
        // Si no hay tienda activa seleccionada y hay tiendas disponibles, seleccionar la tienda principal
        if (!activeStore && stores.length > 0) {
          console.log('ActiveStoreContext: Buscando tienda principal...');
          const mainStore = stores.find(store => store.isMainStore);
          console.log('ActiveStoreContext: Tienda principal encontrada:', mainStore?.name);
          const selectedStore = mainStore || stores[0];
          console.log('ActiveStoreContext: Tienda seleccionada:', selectedStore.name);
          setActiveStore(selectedStore);
        }
        
        console.log(`ActiveStoreContext: Encontradas ${stores.length} tiendas activas`);
      } else {
        console.error('ActiveStoreContext: Error en respuesta:', data.message);
        setUserStores([]);
      }
    } catch (error) {
      console.error('ActiveStoreContext: Error fetching user stores:', error);
      setUserStores([]);
    } finally {
      console.log('ActiveStoreContext: Setting loading to false');
      setLoading(false);
    }
  }, [token, user?.role, activeStore]);

  const refreshStores = useCallback(async () => {
    console.log('ActiveStoreContext: refreshStores called');
    await fetchUserStores();
  }, [fetchUserStores]);

  // Efecto principal para inicialización
  useEffect(() => {
    console.log('ActiveStoreContext: useEffect triggered');
    console.log('ActiveStoreContext: token:', !!token);
    console.log('ActiveStoreContext: user?.id:', user?.id);
    console.log('ActiveStoreContext: user?.role:', user?.role);
    
    if (token && user?.role === 'store_manager') {
      console.log('ActiveStoreContext: Conditions met, calling fetchUserStores');
      fetchUserStores();
    } else {
      console.log('ActiveStoreContext: Conditions not met, setting loading to false');
      console.log('ActiveStoreContext: token present:', !!token);
      console.log('ActiveStoreContext: user role is store_manager:', user?.role === 'store_manager');
      setLoading(false);
      setUserStores([]);
      setActiveStore(null);
    }
  }, [token, user?.id, user?.role, fetchUserStores]);

  // Limpiar tienda activa cuando el usuario cambia
  useEffect(() => {
    if (!user || user.role !== 'store_manager') {
      setActiveStore(null);
      setUserStores([]);
    }
  }, [user?.id, user?.role]);

  const value: ActiveStoreContextType = {
    activeStore,
    setActiveStore,
    userStores,
    loading,
    refreshStores
  };

  return (
    <ActiveStoreContext.Provider value={value}>
      {children}
    </ActiveStoreContext.Provider>
  );
};
