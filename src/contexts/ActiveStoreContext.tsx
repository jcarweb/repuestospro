import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const fetchUserStores = async () => {
    if (!token || user?.role !== 'store_manager') {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const stores = data.data.filter((store: Store) => store.isActive);
        setUserStores(stores);
        
        // Si no hay tienda activa seleccionada y hay tiendas disponibles, seleccionar la primera
        if (!activeStore && stores.length > 0) {
          setActiveStore(stores[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStores = async () => {
    setLoading(true);
    await fetchUserStores();
  };

  useEffect(() => {
    fetchUserStores();
  }, [token, user]);

  // Limpiar tienda activa cuando el usuario cambia
  useEffect(() => {
    if (!user || user.role !== 'store_manager') {
      setActiveStore(null);
      setUserStores([]);
    }
  }, [user]);

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
