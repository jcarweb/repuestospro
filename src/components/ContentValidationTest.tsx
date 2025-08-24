import React, { useState } from 'react';
import ContentValidationAlert from './ContentValidationAlert';
import { ContentValidator } from '../utils/contentValidator';

const ContentValidationTest: React.FC = () => {
  const [testContent, setTestContent] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationSummary, setValidationSummary] = useState<any>(null);

  const testCases = [
    {
      name: 'Contenido Normal',
      content: 'Filtro de aceite de alta calidad para motores modernos. Compatible con múltiples marcas.',
      description: 'Contenido válido sin información de contacto'
    },
    {
      name: 'Teléfono Detectado',
      content: 'Filtro de aceite premium. Contactar al 0412-123-4567 para más información.',
      description: 'Contiene número de teléfono'
    },
    {
      name: 'Email Detectado',
      content: 'Filtro de aceite original. Enviar consulta a vendedor@ejemplo.com',
      description: 'Contiene dirección de email'
    },
    {
      name: 'WhatsApp Detectado',
      content: 'Filtro de aceite. Contactar por WhatsApp al 0412-123-4567',
      description: 'Menciona WhatsApp'
    },
    {
      name: 'Enlace Externo',
      content: 'Filtro de aceite. Más información en https://ejemplo.com',
      description: 'Contiene enlace externo'
    },
    {
      name: 'Múltiples Violaciones',
      content: 'Filtro de aceite. Contactar al 0412-123-4567 o vendedor@ejemplo.com. También por WhatsApp.',
      description: 'Contiene múltiples tipos de información prohibida'
    },
    {
      name: 'Pago Fuera de App',
      content: 'Filtro de aceite. Pago directo por Zelle o efectivo fuera de la app.',
      description: 'Sugiere pagos fuera de la plataforma'
    }
  ];

  const handleTestCase = (content: string) => {
    setTestContent(content);
    const summary = ContentValidator.getValidationSummary(content);
    setValidationSummary(summary);
  };

  const handleContentChange = (content: string) => {
    setTestContent(content);
    const summary = ContentValidator.getValidationSummary(content);
    setValidationSummary(summary);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🧪 Prueba del Sistema de Validación Anti-Fuga
        </h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Casos de Prueba
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testCases.map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCase(testCase.content)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-[#FFC300] hover:bg-yellow-50 transition-colors"
              >
                <div className="font-medium text-gray-800">{testCase.name}</div>
                <div className="text-sm text-gray-600">{testCase.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Editor de Contenido
          </h3>
          <textarea
            value={testContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Escribe o selecciona un caso de prueba para ver la validación en tiempo real..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
          />
        </div>

        {testContent && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Resultado de Validación
            </h3>
            <ContentValidationAlert
              content={testContent}
              onValidationChange={setIsValid}
              showSuggestions={true}
              showBlockedContent={true}
            />
          </div>
        )}

        {validationSummary && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Resumen de Validación
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${validationSummary.hasViolations ? 'text-red-600' : 'text-green-600'}`}>
                  {validationSummary.hasViolations ? '❌' : '✅'}
                </div>
                <div className="text-sm text-gray-600">Estado</div>
                <div className="font-medium">
                  {validationSummary.hasViolations ? 'Con Violaciones' : 'Válido'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationSummary.violationCount}
                </div>
                <div className="text-sm text-gray-600">Violaciones</div>
                <div className="font-medium">Detectadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {validationSummary.blockedItemsCount}
                </div>
                <div className="text-sm text-gray-600">Elementos</div>
                <div className="font-medium">Bloqueados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testContent.length}
                </div>
                <div className="text-sm text-gray-600">Caracteres</div>
                <div className="font-medium">Totales</div>
              </div>
            </div>
            {validationSummary.mainIssue && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">Problema Principal:</div>
                <div className="text-yellow-700">{validationSummary.mainIssue}</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📋 Información del Sistema
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• El sistema detecta automáticamente números de teléfono, emails, enlaces externos y palabras clave prohibidas</p>
            <p>• Proporciona sugerencias específicas para cada tipo de violación</p>
            <p>• La validación se realiza tanto en frontend (tiempo real) como en backend (antes de guardar)</p>
            <p>• Los patrones se pueden configurar desde la base de datos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentValidationTest;
