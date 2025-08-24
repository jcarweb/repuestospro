import React, { useState, useRef } from 'react';
import { Upload, Download, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    total: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
      row: number;
      error: string;
      data: any;
    }>;
  };
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<Array<{ _id: string; name: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar tiendas del usuario (gestor de tienda)
  const loadStores = async () => {
    try {
      // Usar el endpoint que funciona en la aplicación
      const response = await fetch('/api/stores/my-stores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStores(data.data || []);
        if (data.data && data.data.length > 0) {
          setStoreId(data.data[0]._id);
        }
      } else {
        console.error('Error cargando tiendas:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    }
  };

  // Cargar tiendas cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      loadStores();
    }
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar que sea un archivo CSV
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file || !storeId) {
      alert('Por favor selecciona un archivo y una tienda');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('storeId', storeId);

      const response = await fetch('/api/products/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const resultData = await response.json();
      setResult(resultData);

      if (resultData.success) {
        // Cerrar modal después de 3 segundos si fue exitoso
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error al importar el archivo'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,category,brand,subcategory,sku,originalPartCode,stock,isFeatured,tags,specifications,images
"Filtro de Aceite Motor","Filtro de aceite de alta calidad para motor","25.99","Motor","Toyota","Filtros","FIL-001","12345-67890",50,true,"filtro,aceite,motor","{\"material\":\"papel\",\"tamaño\":\"estándar\"}",""
"Pastillas de Freno","Pastillas de freno delanteras","89.50","Frenos","Honda","Pastillas","PAST-001","98765-43210",25,false,"frenos,pastillas,seguridad","{\"material\":\"cerámica\",\"durabilidad\":\"alta\"}",""`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-productos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Importar Productos desde CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Selección de tienda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tienda *
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
              required
            >
              <option value="">Selecciona una tienda</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name} {store.type && `(${store.type})`}
                </option>
              ))}
            </select>
            {stores.length === 0 && (
              <p className="text-sm text-alert-600 mt-1">
                No tienes tiendas asignadas. Contacta al administrador.
              </p>
            )}
          </div>

          {/* Selección de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo CSV *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto h-12 w-12 text-primary-600" />
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-alert-600 hover:text-alert-800 text-sm"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Arrastra y suelta el archivo CSV aquí, o{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-racing-600 hover:text-racing-500"
                    >
                      haz clic para seleccionar
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Máximo 5MB, solo archivos CSV
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Descarga de plantilla */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-primary-900">
                  ¿No tienes un archivo CSV?
                </h3>
                <p className="text-sm text-primary-700 mt-1">
                  Descarga nuestra plantilla con el formato correcto para importar tus productos.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 flex items-center text-sm text-primary-600 hover:text-primary-800"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar plantilla CSV
                </button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-carbon-50 border border-carbon-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-carbon-900 mb-2">
              Instrucciones:
            </h3>
            <ul className="text-sm text-carbon-700 space-y-1">
              <li>• Los campos marcados con * son obligatorios</li>
              <li>• El SKU debe ser único en la tienda</li>
              <li>• Las especificaciones deben estar en formato JSON válido</li>
              <li>• Las imágenes deben ser URLs separadas por comas</li>
              <li>• Los tags deben estar separados por comas</li>
            </ul>
          </div>

          {/* Resultado de importación */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.success 
                ? 'bg-primary-50 border-primary-200' 
                : 'bg-alert-50 border-alert-200'
            }`}>
              <div className="flex items-start space-x-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-alert-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    result.success ? 'text-primary-900' : 'text-alert-900'
                  }`}>
                    {result.success ? 'Importación completada' : 'Error en la importación'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-primary-700' : 'text-alert-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.data && (
                    <div className="mt-2 text-sm">
                      <p>Total: {result.data.total}</p>
                      <p className="text-primary-600">Exitosos: {result.data.successCount}</p>
                      <p className="text-alert-600">Errores: {result.data.errorCount}</p>
                      
                      {result.data.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-alert-600">
                            Ver errores ({result.data.errors.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {result.data.errors.slice(0, 5).map((error, index) => (
                              <div key={index} className="text-xs bg-alert-100 p-2 rounded">
                                <strong>Fila {error.row}:</strong> {error.error}
                              </div>
                            ))}
                            {result.data.errors.length > 5 && (
                              <p className="text-xs text-gray-600">
                                ... y {result.data.errors.length - 5} errores más
                              </p>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-carbon-300 rounded-lg text-carbon-700 hover:bg-carbon-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!file || !storeId || loading}
              className="px-4 py-2 bg-racing-500 text-white rounded-lg hover:bg-racing-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : 'Importar Productos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;
