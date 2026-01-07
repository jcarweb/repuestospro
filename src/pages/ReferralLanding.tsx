import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Users, Gift, Star, ArrowRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

const ReferralLanding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      trackReferralClick(ref);
      verifyReferralCode(ref);
    }
  }, [searchParams]);

  const trackReferralClick = async (code: string) => {
    try {
      await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""/api/loyalty/track-click/${code}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error registrando clic:', error);
    }
  };

  const verifyReferralCode = async (code: string) => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/loyalty/verify-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.toUpperCase() })
      });

      const result = await response.json();
      if (result.success) {
        setReferrerInfo(result.data);
      }
    } catch (error) {
      console.error('Error verificando código:', error);
    }
  };

  const handleAuthSuccess = (user: any, token: string) => {
    // Si hay código de referido, procesarlo
    if (referralCode) {
      processReferral(user._id);
    }
    
    setShowAuthModal(false);
    navigate('/loyalty');
  };

  const processReferral = async (userId: string) => {
    try {
      // Aquí se procesaría el referido en el backend
      console.log(`Procesando referido: ${referralCode} para usuario: ${userId}`);
    } catch (error) {
      console.error('Error procesando referido:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a PiezasYA!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu amigo te invitó a unirte a la mejor plataforma de repuestos
          </p>
          
          {referrerInfo && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Invitado por {referrerInfo.referrerName}
                </h2>
              </div>
              <p className="text-gray-600">
                Tu amigo te ha invitado a unirte a PiezasYA. ¡Regístrate y ambos ganarán puntos!
              </p>
            </div>
          )}
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              200 Puntos de Bienvenida
            </h3>
            <p className="text-gray-600">
              Recibe puntos inmediatamente al registrarte con el código de referido
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Programa de Fidelización
            </h3>
            <p className="text-gray-600">
              Accede inmediatamente al programa de puntos y premios
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tu Amigo Gana 500 Puntos
            </h3>
            <p className="text-gray-600">
              Tu referidor también se beneficia por invitarte
            </p>
          </div>
        </div>

        {/* Código de Referido */}
        {referralCode && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Código de Referido</h2>
            <div className="text-4xl font-mono font-bold mb-4">
              {referralCode}
            </div>
            <p className="text-green-100">
              Este código será aplicado automáticamente al registrarte
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto space-x-2"
          >
            <span>Registrarme Ahora</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-600 mt-4">
            ¡Es gratis y solo toma 2 minutos!
          </p>
        </div>

        {/* Características */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Por qué PiezasYA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Repuestos Originales</h3>
                <p className="text-gray-600">Garantía de calidad en todos nuestros productos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Envío Rápido</h3>
                <p className="text-gray-600">Entrega en 24-48 horas en toda la ciudad</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Precios Competitivos</h3>
                <p className="text-gray-600">Los mejores precios del mercado</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Soporte 24/7</h3>
                <p className="text-gray-600">Atención al cliente disponible todo el día</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        referralCode={referralCode}
      />
    </div>
  );
};

export default ReferralLanding; 