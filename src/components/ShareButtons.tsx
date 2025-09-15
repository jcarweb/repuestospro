import React, { useState } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Mail, 
  Link2, 
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ShareButtonsProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  productId,
  productName,
  productPrice,
  productImage,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}/product/${productId}`;
  const shareText = `${productName} - ${new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(productPrice)} en PiezasYA`;
  
  // Texto específico para WhatsApp con mejor formato
  const whatsappText = `🚗 *${productName}*\n\n💰 Precio: ${new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(productPrice)}\n\n🏪 Disponible en PiezasYA\n\n🔗 Ver producto:\n${productUrl}`;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const subject = encodeURIComponent(`🚗 ${productName} - PiezasYA`);
        const body = encodeURIComponent(`Hola!\n\nTe comparto este producto que encontré en PiezasYA:\n\n${whatsappText}`);
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.open(url);
      }
    },
    {
      name: 'Copiar enlace',
      icon: copied ? Check : Copy,
      color: copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(productUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          // Fallback para navegadores que no soportan clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = productUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal de compartir */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 hover:shadow-lg border border-gray-200"
        title={t('product.share')}
      >
        <Share2 className="h-4 w-4 text-gray-600" />
      </button>

      {/* Menú desplegable de opciones de compartir */}
      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú de opciones */}
          <div className="absolute top-full right-0 mt-2 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 py-2 z-20 min-w-[200px]">
            <div className="px-3 py-2 border-b border-gray-700">
              <h4 className="text-sm font-semibold text-white">
                {t('product.shareOptions')}
              </h4>
            </div>
            
            {shareOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <option.icon className="h-4 w-4 mr-3" />
                {option.name === 'Copiar enlace' ? 
                  (copied ? t('product.linkCopied') : t('product.copyLink')) : 
                  option.name
                }
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButtons;
