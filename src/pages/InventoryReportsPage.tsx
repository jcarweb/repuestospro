import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useTheme } from '../contexts/ThemeContext';
import ExportModal from '../components/ExportModal';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

const InventoryReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { theme } = useTheme();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [showExportModal, setShowExportModal] = useState(false);

  // Datos de ejemplo para los reportes
  const reportData = {
    overview: {
      totalProducts: 156,
      lowStock: 12,
      outOfStock: 3,
      totalValue: 15420.50,
      monthlyGrowth: 15.3
    },
    movements: [
      { date: '2024-01-15', type: 'Entrada', quantity: 50, product: 'Filtro de aceite' },
      { date: '2024-01-14', type: 'Salida', quantity: 25, product: 'Bujía' },
      { date: '2024-01-13', type: 'Entrada', quantity: 30, product: 'Freno de disco' },
      { date: '2024-01-12', type: 'Salida', quantity: 15, product: 'Aceite de motor' }
    ],
    topProducts: [
      { name: 'Filtro de aceite', sales: 45, stock: 23 },
      { name: 'Bujía', sales: 38, stock: 12 },
      { name: 'Freno de disco', sales: 32, stock: 8 },
      { name: 'Aceite de motor', sales: 28, stock: 15 }
    ]
  };

  const reportTypes = [
    { id: 'overview', name: 'Vista General', icon: BarChart3 },
    { id: 'movements', name: 'Movimientos', icon: TrendingUp },
    { id: 'topProducts', name: 'Productos Top', icon: Package },
    { id: 'alerts', name: 'Alertas', icon: AlertTriangle }
  ];

  const dateRanges = [
    { value: '7days', label: 'Últimos 7 días' },
    { value: '30days', label: 'Últimos 30 días' },
    { value: '90days', label: 'Últimos 90 días' },
    { value: '1year', label: 'Último año' }
  ];

  const handleExportReport = () => {
    console.log('Botón exportar clickeado');
    setShowExportModal(true);
    console.log('showExportModal establecido en true');
  };

  const renderOverviewReport = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.overview.totalProducts}</p>
          </div>
          <Package className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Stock Bajo</p>
            <p className="text-2xl font-bold text-yellow-600">{reportData.overview.lowStock}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Sin Stock</p>
            <p className="text-2xl font-bold text-red-600">{reportData.overview.outOfStock}</p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Valor Total</p>
            <p className="text-2xl font-bold text-green-600">${reportData.overview.totalValue.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );

  const renderMovementsReport = () => (
    <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Movimientos de Inventario</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#555555]">
              <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Fecha</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Tipo</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Producto</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {reportData.movements.map((movement, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-[#444444]">
                <td className="py-2 text-sm text-gray-900 dark:text-white">{movement.date}</td>
                <td className="py-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    movement.type === 'Entrada' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {movement.type}
                  </span>
                </td>
                <td className="py-2 text-sm text-gray-900 dark:text-white">{movement.product}</td>
                <td className="py-2 text-sm text-gray-900 dark:text-white">{movement.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTopProductsReport = () => (
    <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos Más Vendidos</h3>
      <div className="space-y-4">
        {reportData.topProducts.map((product, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#444444] rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-200">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Stock: {product.stock}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{product.sales} ventas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlertsReport = () => (
    <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertas de Inventario</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-200">Productos sin stock</p>
            <p className="text-xs text-red-700 dark:text-red-300">3 productos requieren reabastecimiento inmediato</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Stock bajo</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">12 productos con stock por debajo del mínimo</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Transferencias pendientes</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">2 transferencias entre sucursales en proceso</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'movements':
        return renderMovementsReport();
      case 'topProducts':
        return renderTopProductsReport();
      case 'alerts':
        return renderAlertsReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-8 w-8 text-[#FFC300]" />
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             Reportes de Inventario
           </h1>
        </div>
                 <p className="text-gray-600 dark:text-gray-300">
           Analiza y exporta información detallada de tu inventario
           {activeStore && (
             <span className="text-[#FFC300] font-medium"> - {activeStore.name}</span>
           )}
         </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Tipo de reporte */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedReport === type.id
                      ? 'bg-[#FFC300] text-[#333333]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rango de fechas */}
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Período
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botón exportar */}
        <div className="sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            &nbsp;
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Evento del botón exportar:', e);
              handleExportReport();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

             {/* Contenido del reporte */}
       <div className="mb-6">
         {renderReportContent()}
       </div>

       {/* Modal de exportación */}
       {console.log('Renderizando modal, showExportModal:', showExportModal)}
       <ExportModal
         isOpen={showExportModal}
         onClose={() => {
           console.log('Cerrando modal');
           setShowExportModal(false);
         }}
         reportType={selectedReport}
         dateRange={dateRange}
       />
     </div>
   );
 };

export default InventoryReportsPage;
