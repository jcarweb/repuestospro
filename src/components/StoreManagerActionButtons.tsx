import React from 'react';
import { useStoreManagerActions } from '../hooks/useStoreManagerActions';
import { useToast } from './StoreManagerToast';
import { 
  Plus, 
  Package, 
  Tag, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

interface StoreManagerActionButtonsProps {
  context: 'dashboard' | 'products' | 'inventory' | 'promotions' | 'orders' | 'sales' | 'analytics' | 'messages';
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onCreate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: ActionButton[];
  className?: string;
}

const StoreManagerActionButtons: React.FC<StoreManagerActionButtonsProps> = ({
  context,
  onRefresh,
  onExport,
  onImport,
  onCreate,
  onEdit,
  onDelete,
  onView,
  customActions = [],
  className = ''
}) => {
  const actions = useStoreManagerActions();
  const { ToastContainer } = useToast();

  const getContextButtons = (): ActionButton[] => {
    const baseButtons: ActionButton[] = [];

    switch (context) {
      case 'dashboard':
        return [
          {
            id: 'create-product',
            label: 'Agregar Producto',
            icon: Package,
            action: actions.createProduct,
            variant: 'primary'
          },
          {
            id: 'create-promotion',
            label: 'Crear Promoción',
            icon: Tag,
            action: actions.createPromotion,
            variant: 'success'
          },
          {
            id: 'view-orders',
            label: 'Ver Pedidos',
            icon: ShoppingCart,
            action: actions.goToOrders,
            variant: 'secondary'
          },
          {
            id: 'view-messages',
            label: 'Ver Mensajes',
            icon: MessageSquare,
            action: actions.goToMessages,
            variant: 'secondary'
          }
        ];

      case 'products':
        return [
          {
            id: 'create-product',
            label: 'Crear Producto',
            icon: Plus,
            action: onCreate || actions.createProduct,
            variant: 'primary'
          },
          {
            id: 'import-products',
            label: 'Importar CSV',
            icon: Upload,
            action: onImport || (() => {}),
            variant: 'secondary'
          },
          {
            id: 'refresh-products',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'inventory':
        return [
          {
            id: 'import-inventory',
            label: 'Importar',
            icon: Upload,
            action: onImport || (() => {}),
            variant: 'success'
          },
          {
            id: 'export-inventory',
            label: 'Exportar',
            icon: Download,
            action: onExport || actions.exportInventory,
            variant: 'secondary'
          },
          {
            id: 'refresh-inventory',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'promotions':
        return [
          {
            id: 'create-promotion',
            label: 'Crear Promoción',
            icon: Plus,
            action: onCreate || actions.createPromotion,
            variant: 'primary'
          },
          {
            id: 'refresh-promotions',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'orders':
        return [
          {
            id: 'refresh-orders',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          },
          {
            id: 'export-orders',
            label: 'Exportar',
            icon: Download,
            action: onExport || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'sales':
        return [
          {
            id: 'export-sales',
            label: 'Exportar CSV',
            icon: Download,
            action: onExport || (() => actions.exportSalesReport('csv')),
            variant: 'secondary'
          },
          {
            id: 'export-sales-json',
            label: 'Exportar JSON',
            icon: Download,
            action: () => actions.exportSalesReport('json'),
            variant: 'secondary'
          },
          {
            id: 'refresh-sales',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'analytics':
        return [
          {
            id: 'refresh-analytics',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          },
          {
            id: 'export-analytics',
            label: 'Exportar',
            icon: Download,
            action: onExport || (() => {}),
            variant: 'secondary'
          }
        ];

      case 'messages':
        return [
          {
            id: 'refresh-messages',
            label: 'Actualizar',
            icon: RefreshCw,
            action: onRefresh || (() => {}),
            variant: 'secondary'
          }
        ];

      default:
        return [];
    }
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FFC300] text-gray-900 hover:bg-[#E6B800]';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const contextButtons = getContextButtons();
  const allButtons = [...contextButtons, ...customActions];

  if (allButtons.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {allButtons.map((button) => {
          const IconComponent = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.action}
              disabled={button.disabled || button.loading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${getVariantClasses(button.variant || 'secondary')}
                ${button.disabled || button.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {button.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <IconComponent className="w-4 h-4" />
              )}
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>
      <ToastContainer />
    </>
  );
};

export default StoreManagerActionButtons;
