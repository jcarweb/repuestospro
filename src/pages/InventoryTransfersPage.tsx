import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useTheme } from '../contexts/ThemeContext';
import NewTransferModal from '../components/NewTransferModal';
import { 
  Truck, 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

const InventoryTransfersPage: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { theme } = useTheme();
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Datos de ejemplo para las transferencias
  const [transfers, setTransfers] = useState([
    {
      id: 'TR001',
      fromStore: 'Tienda Principal - Caracas',
      toStore: 'Sucursal 1 - Caracas',
      product: 'Filtro de aceite',
      quantity: 50,
      status: 'completed',
      date: '2024-01-15',
      completedDate: '2024-01-16'
    },
    {
      id: 'TR002',
      fromStore: 'Tienda Principal - Caracas',
      toStore: 'Sucursal 1 - Caracas',
      product: 'Bujías',
      quantity: 25,
      status: 'pending',
      date: '2024-01-14',
      completedDate: null
    },
    {
      id: 'TR003',
      fromStore: 'Sucursal 1 - Caracas',
      toStore: 'Tienda Principal - Caracas',
      product: 'Aceite de motor',
      quantity: 30,
      status: 'in_transit',
      date: '2024-01-13',
      completedDate: null
    },
    {
      id: 'TR004',
      fromStore: 'Tienda Principal - Caracas',
      toStore: 'Sucursal 1 - Caracas',
      product: 'Frenos de disco',
      quantity: 15,
      status: 'cancelled',
      date: '2024-01-12',
      completedDate: null
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'Todas', color: 'gray' },
    { value: 'pending', label: 'Pendientes', color: 'yellow' },
    { value: 'in_transit', label: 'En Tránsito', color: 'blue' },
    { value: 'completed', label: 'Completadas', color: 'green' },
    { value: 'cancelled', label: 'Canceladas', color: 'red' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_transit':
        return 'En Tránsito';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const filteredTransfers = transfers.filter(transfer => 
    filterStatus === 'all' || transfer.status === filterStatus
  );

  const handleNewTransfer = () => {
    setShowNewTransferModal(true);
  };

  const handleCancelTransfer = (transferId: string) => {
    // Lógica para cancelar transferencia
    console.log('Cancelando transferencia:', transferId);
    alert('Transferencia cancelada correctamente');
  };

  const handleCompleteTransfer = (transferId: string) => {
    // Lógica para completar transferencia
    console.log('Completando transferencia:', transferId);
    alert('Transferencia completada correctamente');
  };

  const handleTransferCreated = (newTransferData: any) => {
    // Generar un nuevo ID único
    const newId = `TR${String(transfers.length + 1).padStart(3, '0')}`;
    
    // Obtener nombres de las tiendas
    const fromStore = userStores.find(store => store._id === newTransferData.fromStore);
    const toStore = userStores.find(store => store._id === newTransferData.toStore);
    
    // Obtener nombre del producto
    const availableProducts = [
      { id: '1', name: 'Filtro de aceite' },
      { id: '2', name: 'Bujías' },
      { id: '3', name: 'Aceite de motor' },
      { id: '4', name: 'Frenos de disco' },
      { id: '5', name: 'Pastillas de freno' }
    ];
    const product = availableProducts.find(p => p.id === newTransferData.product);
    
    // Crear la nueva transferencia
    const newTransfer = {
      id: newId,
      fromStore: fromStore ? `${fromStore.name} - ${fromStore.city}` : 'Tienda Origen',
      toStore: toStore ? `${toStore.name} - ${toStore.city}` : 'Tienda Destino',
      product: product ? product.name : 'Producto',
      quantity: parseInt(newTransferData.quantity),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      completedDate: null
    };
    
    // Agregar la nueva transferencia al inicio de la lista
    setTransfers(prevTransfers => [newTransfer, ...prevTransfers]);
    
    console.log('Nueva transferencia agregada:', newTransfer);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Truck className="h-8 w-8 text-[#FFC300]" />
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             Transferencias de Inventario
           </h1>
        </div>
                 <p className="text-gray-600 dark:text-gray-300">
           Gestiona las transferencias de productos entre sucursales
           {activeStore && (
             <span className="text-[#FFC300] font-medium"> - {activeStore.name}</span>
           )}
         </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <button
            onClick={handleNewTransfer}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-lg hover:bg-[#E6B800] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Transferencia</span>
          </button>
        </div>

        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtrar por Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Transferencias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{transfers.length}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transfers.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">En Tránsito</p>
              <p className="text-2xl font-bold text-blue-600">
                {transfers.filter(t => t.status === 'in_transit').length}
              </p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {transfers.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Lista de transferencias */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555]">
        <div className="p-6 border-b border-gray-200 dark:border-[#555555]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transferencias ({filteredTransfers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#555555]">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Desde</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Hacia</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Producto</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Cantidad</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Estado</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-gray-100 dark:border-[#444444] hover:bg-gray-50 dark:hover:bg-[#444444]">
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">
                    {transfer.id}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {transfer.fromStore}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {transfer.toStore}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {transfer.product}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {transfer.quantity}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span>{getStatusLabel(transfer.status)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {transfer.date}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {transfer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCompleteTransfer(transfer.id)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Completar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelTransfer(transfer.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Cancelar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {transfer.status === 'in_transit' && (
                        <button
                          onClick={() => handleCompleteTransfer(transfer.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Completar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransfers.length === 0 && (
          <div className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron transferencias con los filtros seleccionados
            </p>
          </div>
        )}
      </div>

      {/* Modal para nueva transferencia */}
      <NewTransferModal
        isOpen={showNewTransferModal}
        onClose={() => setShowNewTransferModal(false)}
        onTransferCreated={handleTransferCreated}
      />
    </div>
  );
};

export default InventoryTransfersPage;
