import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PromotionForm from '../components/PromotionForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Tag, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Package,
  Type
} from 'lucide-react';

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  customText?: string;
  products: any[];
  categories?: any[];
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  isActive: boolean;
  ribbonText: string;
  ribbonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOriginalPrice: boolean;
  showDiscountAmount: boolean;
  maxUses?: number;
  currentUses: number;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PromotionStats {
  total: number;
  active: number;
  expired: number;
  upcoming: number;
  byType: Record<string, number>;
}

const AdminPromotions: React.FC = () => {
  const { user, token } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'store_manager')) {
      fetchPromotions();
      fetchStats();
    }
  }, [user, filter]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/promotions?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/promotions/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const togglePromotionStatus = async (promotionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${promotionId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPromotions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  const deletePromotion = async (promotionId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPromotions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleCreatePromotion = async (formData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchPromotions();
        fetchStats();
        alert('Promoción creada exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert('Error al crear la promoción');
    }
  };

  const handleEditPromotion = async (formData: any) => {
    if (!selectedPromotion) return;

    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${selectedPromotion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedPromotion(null);
        fetchPromotions();
        fetchStats();
        alert('Promoción actualizada exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert('Error al actualizar la promoción');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Package className="h-4 w-4" />;
      case 'custom':
        return <Type className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Porcentaje';
      case 'fixed':
        return 'Monto Fijo';
      case 'buy_x_get_y':
        return 'Compra X Obtén Y';
      case 'custom':
        return 'Personalizado';
      default:
        return type;
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactiva</span>;
    }

    if (now < startDate) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Próxima</span>;
    }

    if (now > endDate) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expirada</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activa</span>;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'store_manager')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo administradores y gestores de tienda pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Promociones</h1>
            <p className="mt-2 text-gray-600">Administra las promociones y ofertas de productos</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nueva Promoción
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Promociones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiradas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las promociones</option>
            <option value="active">Solo activas</option>
            <option value="inactive">Solo inactivas</option>
            <option value="expired">Expiradas</option>
            <option value="upcoming">Próximas</option>
          </select>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lista de Promociones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promoción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas y Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                      <div className="text-sm text-gray-500">{promotion.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(promotion.type)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getTypeLabel(promotion.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>
                        Inicio: {new Date(promotion.startDate).toLocaleDateString()}
                        {promotion.startTime && ` ${promotion.startTime}`}
                      </div>
                      <div>
                        Fin: {new Date(promotion.endDate).toLocaleDateString()}
                        {promotion.endTime && ` ${promotion.endTime}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(promotion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promotion.products.length} productos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promotion.currentUses}
                    {promotion.maxUses && ` / ${promotion.maxUses}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPromotion(promotion);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => togglePromotionStatus(promotion._id)}
                        className={promotion.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                      >
                        {promotion.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deletePromotion(promotion._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay promociones</h3>
            <p className="text-gray-500">Crea tu primera promoción para comenzar.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PromotionForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePromotion}
        token={token}
      />

      <PromotionForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPromotion(null);
        }}
        onSubmit={handleEditPromotion}
        promotion={selectedPromotion}
        isEditing={true}
        token={token}
      />
    </div>
  );
};

export default AdminPromotions; 