import React, { useState } from 'react';
import { X, Copy, Share2, MessageCircle, Mail, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  shareUrl?: string;
  shareText?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  shareUrl = 'https://PiezasYA.com',
  shareText = '¡Únete a PiezasYA y gana puntos con mi código de referido!'
}) => {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const shareData = {
    title: 'PiezasYA - Sistema de Fidelización',
    text: `${shareText} Código: ${referralCode}`,
    url: `${shareUrl}/referral?ref=${referralCode}`
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      action: () => shareToWhatsApp()
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      action: () => shareToFacebook()
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      hoverColor: 'hover:bg-blue-500',
      action: () => shareToTwitter()
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700',
      action: () => shareToEmail()
    },
    {
      name: 'SMS',
      icon: '📱',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => shareToSMS()
    },
    {
      name: 'Copiar Enlace',
      icon: '🔗',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      action: () => copyToClipboard()
    }
  ];

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} Código: ${referralCode}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${shareText} Código: ${referralCode}`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareData.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent('¡Únete a PiezasYA!');
    const body = encodeURIComponent(`${shareText}\n\nCódigo de referido: ${referralCode}\n\nEnlace: ${shareData.url}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
  };

  const shareToSMS = () => {
    const text = encodeURIComponent(`${shareText} Código: ${referralCode}`);
    const url = `sms:?body=${text}`;
    window.location.href = url;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} Código: ${referralCode}\n${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const handlePlatformClick = async (platform: any) => {
    setSelectedPlatform(platform.name);
    
    // Registrar el compartir en el backend
    try {
      await fetch('http://localhost:5000/api/loyalty/track-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: platform.name.toLowerCase(),
          shareUrl: shareData.url,
          shareText: shareData.text
        })
      });
    } catch (error) {
      console.error('Error registrando compartir:', error);
    }
    
    platform.action();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Compartir Código de Referido
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Código de Referido */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white">
          <h3 className="font-semibold mb-2">Tu Código de Referido</h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold font-mono">
              {referralCode}
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-white text-green-600 px-3 py-1 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Plataformas de Compartir */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Compartir en Redes Sociales
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handlePlatformClick(platform)}
                className={`flex flex-col items-center p-4 ${platform.color} ${platform.hoverColor} text-white rounded-lg transition-colors`}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje Personalizado */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mensaje Personalizado
          </h3>
          <textarea
            value={shareText}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Mensaje personalizado..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Este mensaje se incluirá automáticamente al compartir
          </p>
        </div>

        {/* Estadísticas de Compartir */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Estadísticas de Compartir</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-600">Compartido</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-600">Clics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-xs text-gray-600">Registros</div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              copyToClipboard();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Copiar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 