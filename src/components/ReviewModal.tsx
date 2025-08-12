import React, { useState } from 'react';
import { X, Star, MessageSquare, Package, Truck, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  orderId?: string;
  productName?: string;
  onReviewSubmitted?: (pointsEarned: number) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  orderId,
  productName,
  onReviewSubmitted
}) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<'product' | 'service' | 'delivery' | 'app'>('product');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/loyalty/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          title,
          comment,
          category
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `¡Calificación enviada! Ganaste ${result.data.pointsEarned} puntos` });
        onReviewSubmitted?.(result.data.pointsEarned);
        setTimeout(() => {
          onClose();
          setRating(5);
          setTitle('');
          setComment('');
          setCategory('product');
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Error enviando calificación' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (cat: string) => {
    const categories = {
      product: { name: 'Producto', icon: Package, points: '50-250 puntos', color: 'text-blue-600' },
      service: { name: 'Servicio', icon: MessageSquare, points: '75-375 puntos', color: 'text-green-600' },
      delivery: { name: 'Entrega', icon: Truck, points: '25-125 puntos', color: 'text-yellow-600' },
      app: { name: 'Aplicación', icon: Smartphone, points: '100-500 puntos', color: 'text-purple-600' }
    };
    return categories[cat as keyof typeof categories];
  };

  const getPointsForRating = (rating: number, category: string) => {
    const basePoints = {
      product: 50,
      service: 75,
      delivery: 25,
      app: 100
    };
    return basePoints[category as keyof typeof basePoints] * rating;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Enviar Calificación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {productName && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-1">Producto:</h3>
            <p className="text-blue-700">{productName}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Qué estás calificando?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['product', 'service', 'delivery', 'app'] as const).map((cat) => {
                const info = getCategoryInfo(cat);
                const Icon = info.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      category === cat
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${info.color}`} />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{info.name}</div>
                        <div className="text-xs text-gray-500">{info.points}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Ganarás {getPointsForRating(rating, category)} puntos por esta calificación
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Resumen de tu experiencia"
              maxLength={100}
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Comparte tu experiencia con otros usuarios..."
              maxLength={1000}
              required
            />
            <div className="mt-1 text-sm text-gray-500">
              {comment.length}/1000 caracteres
            </div>
          </div>

          {/* Mensaje de éxito/error */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 