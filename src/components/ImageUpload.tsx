import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number; // en MB
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 5,
  maxSize = 10, // 10MB por defecto
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convertir archivo a base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    // Verificar formato
    if (!acceptedFormats.includes(file.type)) {
      return `Formato no soportado. Formatos permitidos: ${acceptedFormats.join(', ')}`;
    }

    // Verificar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxSize}MB`;
    }

    // Verificar número máximo de imágenes
    if (images.length >= maxImages) {
      return `Máximo ${maxImages} imágenes permitidas`;
    }

    return null;
  }, [acceptedFormats, maxSize, images.length, maxImages]);

  // Procesar archivos
  const processFiles = useCallback(async (files: FileList) => {
    setError(null);
    const newImages: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar archivo
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (error) {
        errors.push(`${file.name}: Error al procesar el archivo`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  }, [validateFile, fileToBase64, onChange, images]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Manejar drag and drop
  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  // Eliminar imagen
  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }, [images, onChange]);

  // Abrir selector de archivos
  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de drag and drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-racing-500 bg-racing-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              Arrastra y suelta imágenes aquí, o{' '}
              <span className="text-racing-600 hover:text-racing-500">
                haz clic para seleccionar
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxImages} imágenes, {maxSize}MB cada una
            </p>
            <p className="text-xs text-gray-500">
              Formatos: {acceptedFormats.map(f => f.split('/')[1]).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-alert-50 border border-alert-200 rounded-md p-3">
          <p className="text-sm text-alert-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-alert-500 text-white rounded-full p-1 hover:bg-alert-600 transition-colors opacity-0 group-hover:opacity-100"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {images.length} de {maxImages} imágenes
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
