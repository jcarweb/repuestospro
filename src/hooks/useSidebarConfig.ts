import { useState, useEffect, useCallback } from 'react';

export interface SidebarConfig {
  theme: 'light' | 'dark' | 'auto';
  width: 'compact' | 'normal' | 'wide';
  showIcons: boolean;
  showDescriptions: boolean;
  showUserInfo: boolean;
  showStoreInfo: boolean;
  enableAnimations: boolean;
  menuItems: {
    id: string;
    title: string;
    path: string;
    icon: string;
    visible: boolean;
    order: number;
    description: string;
  }[];
  quickActions: {
    id: string;
    title: string;
    visible: boolean;
    order: number;
  }[];
  notifications: {
    showBadge: boolean;
    showCount: boolean;
    position: 'top' | 'bottom';
  };
}

const defaultConfig: SidebarConfig = {
  theme: 'auto',
  width: 'normal',
  showIcons: true,
  showDescriptions: true,
  showUserInfo: true,
  showStoreInfo: true,
  enableAnimations: true,
  menuItems: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/store-manager/dashboard',
      icon: 'Home',
      visible: true,
      order: 1,
      description: 'Panel de gestión de tienda'
    },
    {
      id: 'inventory',
      title: 'Gestión de Inventario',
      path: '/store-manager/inventory',
      icon: 'Package',
      visible: true,
      order: 2,
      description: 'Configurar y gestionar inventario'
    },
    {
      id: 'products',
      title: 'Productos',
      path: '/store-manager/products',
      icon: 'Package',
      visible: true,
      order: 3,
      description: 'Gestión de productos de la tienda'
    },
    {
      id: 'promotions',
      title: 'Promociones',
      path: '/store-manager/promotions',
      icon: 'Tag',
      visible: true,
      order: 4,
      description: 'Promociones de la tienda'
    },
    {
      id: 'sales',
      title: 'Ventas',
      path: '/store-manager/sales',
      icon: 'ShoppingCart',
      visible: true,
      order: 5,
      description: 'Gestión de ventas'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      path: '/store-manager/orders',
      icon: 'ShoppingBag',
      visible: true,
      order: 6,
      description: 'Gestión de pedidos'
    },
    {
      id: 'delivery',
      title: 'Delivery',
      path: '/store-manager/delivery',
      icon: 'Truck',
      visible: true,
      order: 7,
      description: 'Asignar y gestionar delivery'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      path: '/store-manager/analytics',
      icon: 'BarChart3',
      visible: true,
      order: 8,
      description: 'Estadísticas de la tienda'
    },
    {
      id: 'messages',
      title: 'Mensajes',
      path: '/store-manager/messages',
      icon: 'MessageSquare',
      visible: true,
      order: 9,
      description: 'Mensajería con clientes'
    },
    {
      id: 'reviews',
      title: 'Reseñas',
      path: '/store-manager/reviews',
      icon: 'Star',
      visible: true,
      order: 10,
      description: 'Reseñas de productos'
    },
    {
      id: 'branches',
      title: 'Sucursales',
      path: '/store-manager/branches',
      icon: 'Building2',
      visible: true,
      order: 11,
      description: 'Gestión de sucursales'
    },
    {
      id: 'advertisements',
      title: 'Publicidad',
      path: '/store-manager/advertisements',
      icon: 'TrendingUp',
      visible: false,
      order: 12,
      description: 'Gestión de publicidad'
    },
    {
      id: 'store-configuration',
      title: 'Configuración de Tienda',
      path: '/store-manager/store-configuration',
      icon: 'Settings',
      visible: true,
      order: 13,
      description: 'Configuración básica de la tienda'
    },
    {
      id: 'settings',
      title: 'Configuración del Sidebar',
      path: '/store-manager/settings',
      icon: 'Settings',
      visible: true,
      order: 14,
      description: 'Configuración del sidebar'
    }
  ],
  quickActions: [
    {
      id: 'newProduct',
      title: 'Nuevo Producto',
      visible: true,
      order: 1
    },
    {
      id: 'newPromotion',
      title: 'Nueva Promoción',
      visible: true,
      order: 2
    },
    {
      id: 'viewReports',
      title: 'Ver Reportes',
      visible: true,
      order: 3
    },
    {
      id: 'manageInventory',
      title: 'Gestionar Inventario',
      visible: true,
      order: 4
    }
  ],
  notifications: {
    showBadge: true,
    showCount: true,
    position: 'top'
  }
};

export const useSidebarConfig = () => {
  const [config, setConfig] = useState<SidebarConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const savedConfig = localStorage.getItem('storeManagerSidebarConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      }
    } catch (err) {
      console.error('Error cargando configuración del sidebar:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar configuración
  const saveConfig = useCallback(async (newConfig: SidebarConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      // Guardar en localStorage
      localStorage.setItem('storeManagerSidebarConfig', JSON.stringify(newConfig));
      setConfig(newConfig);
      
      // Aquí se podría enviar al backend para persistir
      const token = localStorage.getItem('token');
      if (token) {
        // Implementar llamada al backend si es necesario
        // await fetch('/api/store-manager/sidebar-config', {
        //   method: 'PUT',
        //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newConfig)
        // });
      }
      
      return true;
    } catch (err) {
      console.error('Error guardando configuración del sidebar:', err);
      setError('Error al guardar la configuración');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar configuración parcial
  const updateConfig = useCallback((updates: Partial<SidebarConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
  }, [config]);

  // Restaurar configuración por defecto
  const resetConfig = useCallback(async () => {
    try {
      localStorage.removeItem('storeManagerSidebarConfig');
      setConfig(defaultConfig);
      return true;
    } catch (err) {
      console.error('Error restaurando configuración:', err);
      setError('Error al restaurar la configuración');
      return false;
    }
  }, []);

  // Obtener elementos de menú visibles
  const getVisibleMenuItems = useCallback(() => {
    return config.menuItems
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);
  }, [config.menuItems]);

  // Obtener clases CSS según la configuración
  const getWidthClass = useCallback(() => {
    switch (config.width) {
      case 'compact': return 'w-48';
      case 'wide': return 'w-80';
      default: return 'w-64';
    }
  }, [config.width]);

  const getThemeClass = useCallback(() => {
    switch (config.theme) {
      case 'light': return 'bg-white';
      case 'dark': return 'bg-[#333333]';
      default: return 'bg-white dark:bg-[#333333]';
    }
  }, [config.theme]);

  // Cargar configuración al montar el hook
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateConfig,
    resetConfig,
    getVisibleMenuItems,
    getWidthClass,
    getThemeClass
  };
};
