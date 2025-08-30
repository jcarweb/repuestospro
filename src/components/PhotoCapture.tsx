import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RotateCcw, Check, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  onClose: () => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onClose }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(t('capture.photo.error'));
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError(t('capture.photo.invalidFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
            {t('capture.photo.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          {/* Área de captura */}
          <div className="bg-carbon-100 dark:bg-carbon-700 rounded-lg p-4 mb-4">
            {!capturedImage ? (
              <div className="relative">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-carbon-200 dark:bg-carbon-600 rounded flex items-center justify-center">
                    <Camera className="h-12 w-12 text-carbon-400" />
                  </div>
                )}
                
                {/* Canvas oculto para captura */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="text-center text-sm text-alert-600 dark:text-alert-400 mb-4 p-2 bg-alert-50 dark:bg-alert-900/20 rounded">
              {error}
            </div>
          )}

          {/* Instrucciones */}
          <div className="text-center text-sm text-carbon-600 dark:text-carbon-400 mb-4">
            {capturedImage 
              ? t('capture.photo.captured')
              : isCameraActive 
                ? t('capture.photo.instructions')
                : t('capture.photo.upload')
            }
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          {!capturedImage ? (
            <>
              {isCameraActive ? (
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {t('capture.photo.take')}
                </button>
              ) : (
                <button
                  onClick={openFileSelector}
                  className="flex-1 px-4 py-2 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {t('capture.photo.upload')}
                </button>
              )}
              
              {!isCameraActive && (
                <button
                  onClick={startCamera}
                  className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {t('capture.photo.activate')}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t('capture.photo.retake')}
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                {t('capture.photo.confirm')}
              </button>
            </>
          )}
        </div>

        {/* Input oculto para subir archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoCapture;
