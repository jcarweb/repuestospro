import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminStorePhotoUpload: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a esta funcionalidad.
          </p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada por este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        toast.success('Ubicación obtenida exitosamente');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Error obteniendo ubicación');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleUpload = async () => {
    if (!selectedFile || !storeName.trim() || !lat || !lng) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('name', storeName.trim());
      if (storePhone.trim()) {
        formData.append('phone', storePhone.trim());
      }
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/store-photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Foto subida exitosamente');
        
        // Limpiar formulario
        setStoreName('');
        setStorePhone('');
        setLat('');
        setLng('');
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || 'Error subiendo foto');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || 'Error subiendo foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subir Foto de Local</h1>
          <p className="mt-2 text-gray-600">
            Captura una foto del local con GPS para enriquecimiento de datos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Foto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Local *
            </label>
            
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  🗑️ Eliminar foto
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                <div className="text-gray-400 text-4xl mb-2">📸</div>
                <p className="text-gray-600">Haz clic para seleccionar una foto</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF (máx. 10MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Ubicación GPS */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación GPS *
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Ej: 10.4806"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Ej: -66.9036"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={getCurrentLocation}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              📍 Obtener Ubicación Actual
            </button>
          </div>

          {/* Información del local */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información del Local
            </label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre del local *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ej: Repuestos El Motor"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="Ej: +584121234567"
                  maxLength={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botón de subida */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !storeName.trim() || !lat || !lng || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Subiendo...
              </>
            ) : (
              <>
                📤 Subir Foto
              </>
            )}
          </button>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La foto será procesada automáticamente para extraer información del local usando OCR y consultas a APIs externas como MercadoLibre y DuckDuckGo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStorePhotoUpload;
