import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addItem } = useCart();

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

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            <p className="text-gray-600">Productos que te han gustado</p>
          </div>

          {/* Empty Favorites State */}
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes favoritos</h2>
            <p className="text-gray-600 mb-6">
              Agrega productos a tus favoritos para verlos aquí
            </p>
            <Link 
              to="/categories"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Explorar Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} en tus favoritos
          </p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <button
                  onClick={() => handleRemoveFromFavorites(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                  {item.name}
                </h3>
                
                {item.brand && (
                  <p className="text-sm text-gray-500 mb-1">Marca: {item.brand}</p>
                )}
                
                {item.category && (
                  <p className="text-sm text-gray-500 mb-3">Categoría: {item.category}</p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-blue-600">
                    ${item.price.toFixed(2)}
                  </p>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Agregar</span>
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Agregado el {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuar Explorando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Favorites; 