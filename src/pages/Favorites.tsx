import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  Eye,
  Share2,
  Clock,
  Tag,
  Package
} from 'lucide-react';

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addItem } = useCart();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Estados para funcionalidades adicionales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      category: item.category,
      brand: item.brand
    });
  };

  const handleRemoveFromFavorites = (itemId: string) => {
    removeFromFavorites(itemId);
  };

  // Filtrar y ordenar favoritos
  const filteredFavorites = favorites
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'date':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(favorites.map(item => item.category).filter(Boolean)))];

  // Función para compartir producto
  const handleShare = (item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Mira este producto: ${item.name}`,
        url: window.location.href
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${item.name} - $${item.price.toFixed(2)}`);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('favorites.title')}
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('favorites.subtitle')}
            </p>
          </div>

          {/* Empty Favorites State */}
          <div className={`rounded-lg shadow p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('favorites.empty.title')}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('favorites.empty.description')}
            </p>
            <Link 
              to="/categories"
              className="inline-flex items-center bg-[#FFC300] text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors focus:ring-2 focus:ring-[#FFC300]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('favorites.empty.explore')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('favorites.title')}
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {filteredFavorites.length} {filteredFavorites.length === 1 ? t('favorites.product') : t('favorites.products')} {t('favorites.inFavorites')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('favorites.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? t('favorites.filters.allCategories') : category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="date">{t('favorites.sort.date')}</option>
              <option value="name">{t('favorites.sort.name')}</option>
              <option value="price">{t('favorites.sort.price')}</option>
            </select>

            {/* View Mode */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#FFC300] text-black' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#FFC300] text-black' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredFavorites.map((item) => (
            <div key={item.id} className={`rounded-lg shadow hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                        title={t('favorites.actions.share')}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromFavorites(item.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                        title={t('favorites.actions.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className={`text-lg font-medium mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </h3>
                    
                    {item.brand && (
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <Tag className="w-3 h-3 inline mr-1" />
                        {item.brand}
                      </p>
                    )}
                    
                    {item.category && (
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <Package className="w-3 h-3 inline mr-1" />
                        {item.category}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold text-[#FFC300]">
                        ${item.price.toFixed(2)}
                      </p>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center space-x-1 bg-[#FFC300] text-black px-3 py-2 rounded-lg hover:bg-yellow-400 transition-colors focus:ring-2 focus:ring-[#FFC300]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">{t('favorites.actions.addToCart')}</span>
                      </button>
                    </div>

                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {t('favorites.addedOn')} {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                // List View
                <div className="flex p-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          {item.brand && (
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                              <Tag className="w-3 h-3 inline mr-1" />
                              {item.brand}
                            </span>
                          )}
                          {item.category && (
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                              <Package className="w-3 h-3 inline mr-1" />
                              {item.category}
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {t('favorites.addedOn')} {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-semibold text-[#FFC300] mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleShare(item)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title={t('favorites.actions.share')}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center space-x-1 bg-[#FFC300] text-black px-3 py-2 rounded-lg hover:bg-yellow-400 transition-colors focus:ring-2 focus:ring-[#FFC300]"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-sm">{t('favorites.actions.addToCart')}</span>
                          </button>
                          <button
                            onClick={() => handleRemoveFromFavorites(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
                            title={t('favorites.actions.remove')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFavorites.length === 0 && favorites.length > 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">{t('favorites.noResults.title')}</h3>
            <p>{t('favorites.noResults.description')}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 text-center">
          <Link
            to="/categories"
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
              isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('favorites.continueExploring')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Favorites; 