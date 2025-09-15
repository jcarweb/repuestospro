import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Star, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  productId?: {
    _id: string;
    name: string;
    image?: string;
    price?: number;
  };
  orderId?: {
    _id: string;
    orderNumber: string;
    total?: number;
  };
  rating: number;
  title?: string;
  comment: string;
  category: 'product' | 'service' | 'delivery' | 'app';
  pointsEarned: number;
  isVerified: boolean;
  helpful: number;
  reply?: {
    text: string;
    authorId: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalPoints: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewFilters {
  rating?: number;
  category?: string;
  verified?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const StoreManagerReviews: React.FC = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'stats'>('all');

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [filters, pagination.page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.rating && { rating: filters.rating.toString() }),
        ...(filters.category && { category: filters.category }),
        ...(filters.verified !== undefined && { verified: filters.verified.toString() })
      });

      const response = await fetch(`/api/reviews/store?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.generalStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      setReplying(true);
      const response = await fetch(`/api/reviews/${selectedReview._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (response.ok) {
        setReplyText('');
        setSelectedReview(null);
        loadReviews(); // Recargar para mostrar la respuesta
      }
    } catch (error) {
      console.error('Error replying to review:', error);
    } finally {
      setReplying(false);
    }
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < rating ? (
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
        ) : (
          <Star className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      product: t('reviews.categories.product'),
      service: t('reviews.categories.service'),
      delivery: t('reviews.categories.delivery'),
      app: t('reviews.categories.app')
    };
    return categories[category as keyof typeof categories] || category;
  };

  const renderReviewCard = (review: Review) => (
    <div key={review._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.userId.avatar ? (
              <img src={review.userId.avatar} alt={review.userId.name} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-gray-600 font-semibold">
                {review.userId.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.userId.name}</h4>
            <p className="text-sm text-gray-500">{review.userId.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {review.isVerified && (
            <CheckCircle className="w-5 h-5 text-green-500" title="Reseña verificada" />
          )}
          <span className="text-sm text-gray-500">
            {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
          </span>
        </div>
      </div>

      {review.productId && (
        <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
          {review.productId.image && (
            <img src={review.productId.image} alt={review.productId.name} className="w-12 h-12 object-cover rounded" />
          )}
          <div>
            <h5 className="font-medium text-gray-900">{review.productId.name}</h5>
            {review.productId.price && (
              <p className="text-sm text-gray-600">${review.productId.price}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center space-x-1">
          {renderStars(review.rating)}
        </div>
        <span className="text-sm text-gray-600">({review.rating}/5)</span>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {getCategoryLabel(review.category)}
        </span>
        {review.helpful > 0 && (
          <span className="text-sm text-gray-500">
            {review.helpful} útil{review.helpful !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      <p className="text-gray-700 mb-4">{review.comment}</p>

      {review.reply ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Respuesta de la tienda</span>
            <span className="text-sm text-blue-600">
              {format(new Date(review.reply.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </span>
          </div>
          <p className="text-blue-800">{review.reply.text}</p>
        </div>
      ) : (
        <button
          onClick={() => setSelectedReview(review)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Responder</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('storeManager.reviews.title')}
        </h1>
        <p className="text-gray-600">
          {t('storeManager.reviews.description')}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('storeManager.reviews.tabs.all')}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('storeManager.reviews.tabs.pending')}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('storeManager.reviews.tabs.stats')}
          </button>
        </nav>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('storeManager.reviews.stats.averageRating')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('storeManager.reviews.stats.totalReviews')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('storeManager.reviews.stats.pendingReplies')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter(r => !r.reply).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t('storeManager.reviews.stats.totalPoints')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPoints}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeManager.reviews.filters.rating')}
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('storeManager.reviews.filters.allRatings')}</option>
              <option value="5">5 {t('storeManager.reviews.filters.stars')}</option>
              <option value="4">4 {t('storeManager.reviews.filters.stars')}</option>
              <option value="3">3 {t('storeManager.reviews.filters.stars')}</option>
              <option value="2">2 {t('storeManager.reviews.filters.stars')}</option>
              <option value="1">1 {t('storeManager.reviews.filters.star')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeManager.reviews.filters.category')}
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('storeManager.reviews.filters.allCategories')}</option>
              <option value="product">{t('reviews.categories.product')}</option>
              <option value="service">{t('reviews.categories.service')}</option>
              <option value="delivery">{t('reviews.categories.delivery')}</option>
              <option value="app">{t('reviews.categories.app')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeManager.reviews.filters.verified')}
            </label>
            <select
              value={filters.verified?.toString() || ''}
              onChange={(e) => handleFilterChange('verified', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('storeManager.reviews.filters.all')}</option>
              <option value="true">{t('storeManager.reviews.filters.verified')}</option>
              <option value="false">{t('storeManager.reviews.filters.notVerified')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeManager.reviews.filters.sortBy')}
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">{t('storeManager.reviews.filters.newest')}</option>
              <option value="createdAt-asc">{t('storeManager.reviews.filters.oldest')}</option>
              <option value="rating-desc">{t('storeManager.reviews.filters.highestRating')}</option>
              <option value="rating-asc">{t('storeManager.reviews.filters.lowestRating')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('storeManager.reviews.noReviews')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('storeManager.reviews.noReviewsDescription')}
              </p>
            </div>
          ) : (
            reviews.map(renderReviewCard)
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.previous')}
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.next')}
            </button>
          </nav>
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('storeManager.reviews.reply.title')}
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedReview.userId.name}</strong> escribió:
                </p>
                <p className="text-gray-800">{selectedReview.comment}</p>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('storeManager.reviews.reply.placeholder')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replying}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replying ? t('common.sending') : t('storeManager.reviews.reply.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerReviews;
