import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { ContentValidator, ValidationResult } from '../utils/contentValidator';

interface ContentValidationAlertProps {
  content: string;
  onValidationChange: (isValid: boolean) => void;
  showSuggestions?: boolean;
  showBlockedContent?: boolean;
  className?: string;
}

const ContentValidationAlert: React.FC<ContentValidationAlertProps> = ({
  content,
  onValidationChange,
  showSuggestions = true,
  showBlockedContent = true,
  className = ''
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    violations: [],
    blockedContent: [],
    suggestions: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (content.trim()) {
      const result = ContentValidator.getRealTimeFeedback(content);
      setValidation(result);
      onValidationChange(result.isValid);
      setIsVisible(true);
    } else {
      setValidation({
        isValid: true,
        violations: [],
        blockedContent: [],
        suggestions: []
      });
      onValidationChange(true);
      setIsVisible(false);
    }
  }, [content, onValidationChange]);

  if (!isVisible) {
    return null;
  }

  if (validation.isValid) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300 ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm text-green-700 font-medium">
            ✅ El contenido cumple con las políticas de la plataforma
          </span>
          <p className="text-xs text-green-600 mt-1">
            Tu descripción está lista para ser publicada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 transition-all duration-300 ${className}`}>
      {/* Alerta principal */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800 mb-1">
            ⚠️ Contenido no permitido detectado
          </h4>
          <p className="text-sm text-red-700">
            Tu descripción contiene información que no está permitida en la plataforma
          </p>
        </div>
      </div>

      {/* Violaciones específicas */}
      <div className="space-y-2">
        {validation.violations.map((violation, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                {violation}
              </p>
              {showSuggestions && validation.suggestions[index] && (
                <p className="text-sm text-yellow-700">
                  💡 {validation.suggestions[index]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contenido bloqueado */}
      {showBlockedContent && validation.blockedContent.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-gray-600" />
            <h5 className="text-sm font-medium text-gray-700">
              Contenido bloqueado:
            </h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {validation.blockedContent.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200"
              >
                "{item}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sugerencias generales */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-2">
              💡 Consejos para una descripción exitosa:
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Usa el chat interno de PiezasYA para contactar al vendedor</li>
              <li>• No incluyas información de contacto personal</li>
              <li>• No incluyas enlaces externos</li>
              <li>• Enfócate en las características del producto</li>
              <li>• Usa los métodos de pago seguros de la plataforma</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentValidationAlert;
