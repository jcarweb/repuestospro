import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { testMultipleImages, generateImageTestReport, type ImageTestResult } from '../utils/imageTestUtils';

interface ImageDiagnosticProps {
  productImages: string[];
  productName: string;
}

const ImageDiagnostic: React.FC<ImageDiagnosticProps> = ({ productImages, productName }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<ImageTestResult[]>([]);
  const [report, setReport] = useState<any>(null);

  const runDiagnostic = async () => {
    if (productImages.length === 0) {
      setTestResults([{
        url: 'No images',
        success: false,
        error: 'Product has no images'
      }]);
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    setReport(null);

    try {
      console.log(`🔍 Iniciando diagnóstico de imágenes para: ${productName}`);
      console.log(`📸 URLs a probar:`, productImages);
      
      const results = await testMultipleImages(productImages);
      setTestResults(results);
      
      const diagnosticReport = generateImageTestReport(results);
      setReport(diagnosticReport);
      
      console.log('📊 Reporte de diagnóstico:', diagnosticReport);
      
      // Mostrar errores en consola para debugging
      const failedImages = results.filter(r => !r.success);
      if (failedImages.length > 0) {
        console.error('❌ Imágenes que fallaron:', failedImages);
      }
      
    } catch (error) {
      console.error('❌ Error durante el diagnóstico:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Diagnóstico de Imágenes</h3>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isTesting ? (
            <>
              <Clock className="w-4 h-4 animate-spin inline mr-2" />
              Probando...
            </>
          ) : (
            'Ejecutar Diagnóstico'
          )}
        </button>
      </div>

      {productImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Este producto no tiene imágenes</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Resultados del Diagnóstico:</h4>
          
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(result.success)}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${getStatusColor(result.success)}`}>
                  {result.success ? '✅ Cargada exitosamente' : '❌ Error al cargar'}
                </div>
                <div className="text-xs text-gray-600 break-all">
                  {result.url}
                </div>
                {result.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
                {result.success && result.loadTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    Tiempo de carga: {result.loadTime}ms
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {report && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resumen del Diagnóstico:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de imágenes:</span> {report.total}
            </div>
            <div>
              <span className="font-medium">Exitosas:</span> {report.successful}
            </div>
            <div>
              <span className="font-medium">Fallidas:</span> {report.failed}
            </div>
            <div>
              <span className="font-medium">Tasa de éxito:</span> {report.successRate.toFixed(1)}%
            </div>
            {report.averageLoadTime > 0 && (
              <div className="col-span-2">
                <span className="font-medium">Tiempo promedio de carga:</span> {report.averageLoadTime}ms
              </div>
            )}
          </div>
          
          {report.failedUrls.length > 0 && (
            <div className="mt-3">
              <div className="font-medium text-red-700 mb-2">URLs que fallaron:</div>
              <div className="space-y-1">
                {report.failedUrls.map((url: string, index: number) => (
                  <div key={index} className="text-xs text-red-600 break-all bg-red-100 p-2 rounded">
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDiagnostic;
