import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  X, 
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Calendar,
  Filter
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  dateRange: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  reportType, 
  dateRange 
 }) => {
   const { theme } = useTheme();

  // Estados del formulario
  const [exportFormat, setExportFormat] = useState('excel');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

     // Formatos de exportación disponibles
   const exportFormats = [
          { 
        id: 'excel', 
        name: 'Excel (.xlsx)', 
        icon: FileSpreadsheet,
        description: 'Formato ideal para análisis y manipulación de datos'
      },
      { 
        id: 'pdf', 
        name: 'PDF (.pdf)', 
        icon: File,
        description: 'Formato perfecto para presentaciones y reportes formales'
      },
      { 
        id: 'csv', 
        name: 'CSV (.csv)', 
        icon: FileText,
        description: 'Formato simple para importar a otras aplicaciones'
      }
   ];

  // Obtener nombre del tipo de reporte
  const getReportTypeName = () => {
    switch (reportType) {
      case 'overview':
        return 'Vista General';
      case 'movements':
        return 'Movimientos';
      case 'topProducts':
        return 'Productos Top';
      case 'alerts':
        return 'Alertas';
      default:
        return 'Reporte';
    }
  };

  // Obtener nombre del rango de fechas
  const getDateRangeName = () => {
    switch (dateRange) {
      case '7days':
        return 'Últimos 7 días';
      case '30days':
        return 'Últimos 30 días';
      case '90days':
        return 'Últimos 90 días';
      case '1year':
        return 'Último año';
      default:
        return 'Período personalizado';
    }
  };

  // Manejar exportación
  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aquí iría la lógica real de exportación
      console.log('Exportando reporte:', {
        type: reportType,
        format: exportFormat,
        dateRange: dateRange,
        customDateRange,
        includeCharts
      });

      // Simular descarga
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      
      // Crear un enlace de descarga simulado
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Contenido del reporte simulado');
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      
      // No cerrar automáticamente, dejar que el usuario cierre manualmente
      // setTimeout(() => {
      //   onClose();
      // }, 3000);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el reporte. Intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#333333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#555555]">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-[#FFC300]" />
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
               Exportar Reporte
             </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {exportSuccess ? (
            <div className="text-center py-8">
              <Download className="h-16 w-16 text-green-500 mx-auto mb-4" />
                             <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 ¡Reporte Exportado!
               </h4>
               <p className="text-gray-600 dark:text-gray-300 mb-6">
                 El reporte se ha descargado exitosamente en tu dispositivo.
               </p>
               <button
                 onClick={onClose}
                 className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
               >
                 Cerrar
               </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del reporte */}
              <div className="bg-gray-50 dark:bg-[#444444] rounded-lg p-4">
                                 <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                   Detalles del Reporte
                 </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                                     <div>
                     <span className="text-gray-600 dark:text-gray-300">Tipo:</span>
                     <span className="ml-2 text-gray-900 dark:text-white">{getReportTypeName()}</span>
                   </div>
                   <div>
                     <span className="text-gray-600 dark:text-gray-300">Período:</span>
                     <span className="ml-2 text-gray-900 dark:text-white">{getDateRangeName()}</span>
                   </div>
                </div>
              </div>

              {/* Formato de exportación */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                   Formato de Exportación
                 </label>
                <div className="grid grid-cols-1 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <label
                        key={format.id}
                        className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          exportFormat === format.id
                            ? 'border-[#FFC300] bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-300 dark:border-[#555555] hover:border-gray-400 dark:hover:border-[#666666]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.id}
                          checked={exportFormat === format.id}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="mt-1 text-[#FFC300] focus:ring-[#FFC300]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {format.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {format.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Opciones adicionales */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                   Opciones Adicionales
                 </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="text-[#FFC300] focus:ring-[#FFC300] rounded"
                    />
                                         <span className="text-sm text-gray-900 dark:text-white">
                       Incluir gráficos y visualizaciones
                     </span>
                  </label>
                </div>
              </div>

              {/* Rango de fechas personalizado (si es necesario) */}
              {dateRange === 'custom' && (
                <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     Rango de Fechas Personalizado
                   </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                                             <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                         Fecha de Inicio
                       </label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                      />
                    </div>
                    <div>
                                             <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                         Fecha de Fin
                       </label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333333]"></div>
                      <span>Exportando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                                             <span>Exportar Reporte</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
