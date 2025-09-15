import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ShareButtons from './ShareButtons';
import type { Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para obtener la imagen del producto con fallback
  const getProductImage = () => {
    if (product.images && product.images.length > 0 && product.images[0] !== '') {
      return product.images[0];
    }
    // Fallback a imagen de Unsplash que funciona
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
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
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      category: product.category,
      brand: product.brand
    });
  };

  const handleToggleFavorite = () => {
    if (isFavorite(product._id)) {
      removeFromFavorites(product._id);
    } else {
      addToFavorites({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        category: product.category,
        brand: product.brand
      });
    }
  };

  const handleCardClick = () => {
    // Navegar al detalle del producto
    navigate(`/product/${product._id}`);
    // Scroll to top para mejor UX
    window.scrollTo(0, 0);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se active la navegación de la tarjeta
  };

  return (
    <div 
      className="card group hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 border border-gray-200 hover:border-blue-300"
      onClick={handleCardClick}
      title="Haz clic para ver detalles del producto"
    >
      {/* Imagen del producto */}
      <div className="relative mb-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
              }}
            />
        </div>
        
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
            onClick={(e) => {
              handleActionClick(e);
              handleToggleFavorite();
            }}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isFavorite(product._id) 
                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              handleActionClick(e);
              handleAddToCart();
            }}
            disabled={product.stock === 0}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isInCart(product._id)
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-white text-gray-600 hover:bg-[#FFC300] hover:text-[#333333]'
            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <div onClick={handleActionClick}>
            <ShareButtons
              productId={product._id}
              productName={product.name}
              productPrice={product.price}
              productImage={getProductImage()}
            />
          </div>
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
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Indicador de que es clickeable */}
        <div className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
          Haz clic para ver detalles
        </div>

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
            {renderStars(product.popularity)}
            <span className="text-sm text-gray-600 ml-1">
              ({product.popularity})
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

        {/* Tipo de Despacho */}
        {product.deliveryType && (
          <div className="text-sm">
            {product.deliveryType === 'delivery_motorizado' ? (
              <span className="text-blue-600">🚚 Delivery</span>
            ) : (
              <span className="text-orange-600">📦 Pick up</span>
            )}
          </div>
        )}

        {/* Botón agregar al carrito */}
        <button
          onClick={(e) => {
            handleActionClick(e);
            handleAddToCart();
          }}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isInCart(product._id)
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-[#FFC300] text-[#333333] hover:bg-[#FFB800]'
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart(product._id) ? 'En el carrito' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 