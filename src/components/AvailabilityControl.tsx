import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Coffee, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AvailabilityStatus } from '../data/mockWorkSchedule';

interface AvailabilityControlProps {
  currentStatus: AvailabilityStatus | null;
  onStatusChange: (status: 'available' | 'busy' | 'offline' | 'break', notes?: string) => void;
  className?: string;
}

const AvailabilityControl: React.FC<AvailabilityControlProps> = ({
  currentStatus,
  onStatusChange,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentStatus?.notes || '');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: <Wifi className="h-5 w-5" />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          label: t('schedule.status.available')
        };
      case 'busy':
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          label: t('schedule.status.busy')
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-5 w-5" />,
          color: 'text-carbon-600 dark:text-carbon-400',
          bgColor: 'bg-carbon-100 dark:bg-carbon-700',
          borderColor: 'border-carbon-200 dark:border-carbon-600',
          label: t('schedule.status.offline')
        };
      case 'break':
        return {
          icon: <Coffee className="h-5 w-5" />,
          color: 'text-racing-600 dark:text-racing-400',
          bgColor: 'bg-racing-100 dark:bg-racing-900/20',
          borderColor: 'border-racing-200 dark:border-racing-700',
          label: t('schedule.status.break')
        };
      default:
        return {
          icon: <WifiOff className="h-5 w-5" />,
          color: 'text-carbon-600 dark:text-carbon-400',
          bgColor: 'bg-carbon-100 dark:bg-carbon-700',
          borderColor: 'border-carbon-200 dark:border-carbon-600',
          label: t('schedule.status.offline')
        };
    }
  };

  const handleStatusChange = (status: 'available' | 'busy' | 'offline' | 'break') => {
    onStatusChange(status, notes);
    setIsEditing(false);
  };

  const handleSaveNotes = () => {
    if (currentStatus) {
      onStatusChange(currentStatus.status, notes);
    }
    setIsEditing(false);
  };

  const currentConfig = getStatusConfig(currentStatus?.status || 'offline');

  return (
    <div className={`bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700 ${className}`}>
      <div className="p-4 border-b border-carbon-200 dark:border-carbon-700">
        <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
          {t('schedule.availability')}
        </h3>
      </div>

      <div className="p-4">
        {/* Estado actual */}
        <div className={`p-4 rounded-lg border ${currentConfig.bgColor} ${currentConfig.borderColor} mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={currentConfig.color}>
                {currentConfig.icon}
              </div>
              <div>
                <div className="font-medium text-onix-900 dark:text-snow-500">
                  {currentConfig.label}
                </div>
                <div className="text-sm text-carbon-600 dark:text-carbon-400">
                  {currentStatus?.updatedAt 
                    ? `Actualizado: ${currentStatus.updatedAt.toLocaleTimeString()}`
                    : 'No hay estado registrado'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-carbon-600 hover:text-carbon-700 dark:text-carbon-400 dark:hover:text-carbon-300 hover:bg-carbon-50 dark:hover:bg-carbon-700 rounded"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {/* Notas */}
          {currentStatus?.notes && (
            <div className="mt-3 pt-3 border-t border-carbon-200 dark:border-carbon-600">
              <div className="text-sm text-carbon-600 dark:text-carbon-400">
                <strong>Notas:</strong> {currentStatus.notes}
              </div>
            </div>
          )}
        </div>

        {/* Editor de notas */}
        {isEditing && (
          <div className="mb-4 p-3 bg-carbon-50 dark:bg-carbon-700 rounded-lg">
            <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
              {t('schedule.notes')}:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-600 dark:text-snow-500 text-sm"
              placeholder="Agrega notas sobre tu disponibilidad..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-racing-500 text-onix-900 rounded text-sm hover:bg-racing-600 transition-colors flex items-center gap-1"
              >
                <Save className="h-3 w-3" />
                {t('schedule.save')}
              </button>
              <button
                onClick={() => {
                  setNotes(currentStatus?.notes || '');
                  setIsEditing(false);
                }}
                className="px-3 py-1 bg-carbon-300 text-carbon-700 rounded text-sm hover:bg-carbon-400 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {t('schedule.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Botones de estado */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleStatusChange('available')}
            className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${
              currentStatus?.status === 'available'
                ? 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                : 'bg-snow-500 border-carbon-200 dark:bg-carbon-800 dark:border-carbon-700 hover:bg-green-50 dark:hover:bg-green-900/10'
            }`}
          >
            <Wifi className={`h-5 w-5 ${
              currentStatus?.status === 'available'
                ? 'text-green-600 dark:text-green-400'
                : 'text-carbon-400 dark:text-carbon-500'
            }`} />
            <span className={`font-medium ${
              currentStatus?.status === 'available'
                ? 'text-green-800 dark:text-green-300'
                : 'text-carbon-700 dark:text-carbon-300'
            }`}>
              {t('schedule.status.available')}
            </span>
          </button>

          <button
            onClick={() => handleStatusChange('busy')}
            className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${
              currentStatus?.status === 'busy'
                ? 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700'
                : 'bg-snow-500 border-carbon-200 dark:bg-carbon-800 dark:border-carbon-700 hover:bg-orange-50 dark:hover:bg-orange-900/10'
            }`}
          >
            <Clock className={`h-5 w-5 ${
              currentStatus?.status === 'busy'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-carbon-400 dark:text-carbon-500'
            }`} />
            <span className={`font-medium ${
              currentStatus?.status === 'busy'
                ? 'text-orange-800 dark:text-orange-300'
                : 'text-carbon-700 dark:text-carbon-300'
            }`}>
              {t('schedule.status.busy')}
            </span>
          </button>

          <button
            onClick={() => handleStatusChange('break')}
            className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${
              currentStatus?.status === 'break'
                ? 'bg-racing-100 border-racing-200 dark:bg-racing-900/20 dark:border-racing-700'
                : 'bg-snow-500 border-carbon-200 dark:bg-carbon-800 dark:border-carbon-700 hover:bg-racing-50 dark:hover:bg-racing-900/10'
            }`}
          >
            <Coffee className={`h-5 w-5 ${
              currentStatus?.status === 'break'
                ? 'text-racing-600 dark:text-racing-400'
                : 'text-carbon-400 dark:text-carbon-500'
            }`} />
            <span className={`font-medium ${
              currentStatus?.status === 'break'
                ? 'text-racing-800 dark:text-racing-300'
                : 'text-carbon-700 dark:text-carbon-300'
            }`}>
              {t('schedule.status.break')}
            </span>
          </button>

          <button
            onClick={() => handleStatusChange('offline')}
            className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${
              currentStatus?.status === 'offline'
                ? 'bg-carbon-100 border-carbon-200 dark:bg-carbon-700 dark:border-carbon-600'
                : 'bg-snow-500 border-carbon-200 dark:bg-carbon-800 dark:border-carbon-700 hover:bg-carbon-50 dark:hover:bg-carbon-700'
            }`}
          >
            <WifiOff className={`h-5 w-5 ${
              currentStatus?.status === 'offline'
                ? 'text-carbon-600 dark:text-carbon-400'
                : 'text-carbon-400 dark:text-carbon-500'
            }`} />
            <span className={`font-medium ${
              currentStatus?.status === 'offline'
                ? 'text-carbon-800 dark:text-carbon-300'
                : 'text-carbon-700 dark:text-carbon-300'
            }`}>
              {t('schedule.status.offline')}
            </span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-carbon-50 dark:bg-carbon-700 rounded-lg">
          <div className="text-sm text-carbon-600 dark:text-carbon-400">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span><strong>Disponible:</strong> Listo para recibir pedidos</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span><strong>Ocupado:</strong> Con muchos pedidos pendientes</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="h-4 w-4 text-racing-600 dark:text-racing-400" />
              <span><strong>En Descanso:</strong> Pausa temporal</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-carbon-600 dark:text-carbon-400" />
              <span><strong>Desconectado:</strong> No disponible para pedidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityControl;
