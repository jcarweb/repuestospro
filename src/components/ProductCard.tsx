import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, isInCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
      brand: product.brand
    });
  };

  const handleToggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        brand: product.brand
      });
    }
  };

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      {/* Imagen del producto */}
      <div className="relative mb-4">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
              }}
            />
          </div>
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Nuevo
            </span>
          )}
          {product.isOnSale && product.discountPercentage && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isFavorite(product.id) 
                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isInCart(product.id)
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        {/* Categoría y marca */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="capitalize">{product.category}</span>
          <span className="font-medium">{product.brand}</span>
        </div>

        {/* Nombre del producto */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating y reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-sm text-gray-600 ml-1">
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Stock */}
        <div className="text-sm">
          {product.stock > 0 ? (
            <span className="text-green-600">En stock ({product.stock})</span>
          ) : (
            <span className="text-red-600">Sin stock</span>
          )}
        </div>

        {/* Botón agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isInCart(product.id)
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart(product.id) ? 'En el carrito' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 