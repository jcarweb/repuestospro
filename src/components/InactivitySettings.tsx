import React, { useState, useEffect, useRef } from 'react';
import { Settings, Clock, AlertTriangle, X } from 'lucide-react';

interface InactivitySettingsProps {
  onSettingsChange: (timeoutMinutes: number, warningMinutes: number) => void;
  currentTimeoutMinutes?: number;
  currentWarningMinutes?: number;
}

const InactivitySettings: React.FC<InactivitySettingsProps> = ({
  onSettingsChange,
  currentTimeoutMinutes = 30,
  currentWarningMinutes = 5
}) => {
  const [timeoutMinutes, setTimeoutMinutes] = useState(currentTimeoutMinutes);
  const [warningMinutes, setWarningMinutes] = useState(currentWarningMinutes);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSettingsChange(timeoutMinutes, warningMinutes);
  }, [timeoutMinutes, warningMinutes, onSettingsChange]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = () => {
    onSettingsChange(timeoutMinutes, warningMinutes);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTimeoutMinutes(currentTimeoutMinutes);
    setWarningMinutes(currentWarningMinutes);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
                       <button
                   onClick={() => setIsOpen(!isOpen)}
                   className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                 >
                   <Settings className="h-4 w-4" />
                   <span className="text-sm">Configuración de inactividad</span>
                 </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-[#FFC300] mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Configuración de inactividad
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            {/* Tiempo de inactividad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tiempo de inactividad (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-lg"
                placeholder="30"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tiempo después del cual se cerrará la sesión por inactividad
              </p>
            </div>

            {/* Tiempo de advertencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tiempo de advertencia (minutos)
              </label>
              <input
                type="number"
                min="1"
                max={timeoutMinutes - 1}
                value={warningMinutes}
                onChange={(e) => setWarningMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-lg"
                placeholder="5"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tiempo antes del cierre en el que se mostrará la advertencia
              </p>
            </div>

            {/* Información */}
            <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Información importante
                </p>
                <p className="text-sm text-blue-700">
                  La advertencia se mostrará <strong>{timeoutMinutes - warningMinutes} minutos</strong> después de la última actividad
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#FFC300] hover:bg-[#E6B800] text-[#333333] font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:shadow-md"
            >
              Guardar Cambios
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InactivitySettings;
