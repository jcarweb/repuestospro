import React from 'react';
import { X, Download, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CapturedMediaPreviewProps {
  type: 'signature' | 'photo';
  dataUrl: string;
  onRemove: () => void;
  onView?: () => void;
}

const CapturedMediaPreview: React.FC<CapturedMediaPreviewProps> = ({ 
  type, 
  dataUrl, 
  onRemove, 
  onView 
}) => {
  const { t } = useLanguage();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${type === 'signature' ? 'firma' : 'foto'}_entrega_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group">
      <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-3 border border-carbon-200 dark:border-carbon-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-carbon-600 dark:text-carbon-400 uppercase tracking-wide">
            {type === 'signature' ? 'Firma' : 'Foto'} Capturada
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <button
                onClick={onView}
                className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                title="Ver"
              >
                <Eye className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-1 text-racing-600 hover:text-racing-700 dark:text-racing-400 dark:hover:text-racing-300"
              title="Descargar"
            >
              <Download className="h-3 w-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 text-alert-600 hover:text-alert-700 dark:text-alert-400 dark:hover:text-alert-300"
              title="Eliminar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          {type === 'signature' ? (
            <div className="bg-snow-500 dark:bg-carbon-600 rounded border border-carbon-200 dark:border-carbon-500 p-2">
              <img
                src={dataUrl}
                alt="Firma capturada"
                className="w-full h-12 object-contain"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={dataUrl}
                alt="Foto capturada"
                className="w-full h-16 object-cover rounded"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/50 to-transparent rounded" />
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-carbon-500 dark:text-carbon-400">
          {new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default CapturedMediaPreview;
