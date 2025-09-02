import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Package, 
  Truck, 
  Shield, 
  Heart,
  Share2,
  Tag,
  Hash,
  ZoomIn
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { productService, type Product, type RelatedProduct } from '../services/productService';
import ImageTest from '../components/ImageTest';
import ImageDiagnostic from '../components/ImageDiagnostic';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart, updateQuantity } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id!);
      
      if (data.success) {
        setProduct(data.data.product!);
        setRelatedProducts(data.data.relatedProducts || []);
      } else {
        setError('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePreviousImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!user) {
      showNotification('info', 'Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      showNotification('error', 'El producto no tiene stock disponible');
      return;
    }

    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0],
      category: product.category,
      brand: product.brand
    };

    if (isInCart(product._id)) {
      // Si ya está en el carrito, actualizar cantidad
      updateQuantity(product._id, quantity);
      showNotification('success', 'Cantidad actualizada en el carrito');
    } else {
      // Si no está en el carrito, agregarlo
      addItem(cartItem);
      showNotification('success', 'Producto agregado al carrito');
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      showNotification('info', 'Debes iniciar sesión para agregar favoritos');
      navigate('/login');
      return;
    }

    if (!product) return;

    if (isFavorite(product._id)) {
      removeFromFavorites(product._id);
      showNotification('success', 'Producto removido de favoritos');
    } else {
      addToFavorites({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        brand: product.brand
      });
      showNotification('success', 'Producto agregado a favoritos');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      showNotification('success', 'Enlace copiado al portapapeles');
    }
  };

  const handleRelatedProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => navigate('/categories')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a categorías
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <span>✅</span>}
            {notification.type === 'error' && <span>❌</span>}
            {notification.type === 'info' && <span>ℹ️</span>}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <nav className="flex space-x-2 text-sm text-gray-500">
                <span onClick={() => navigate('/categories')} className="hover:text-blue-600 cursor-pointer transition-colors">
                  Categorías
                </span>
                <span>/</span>
                <span onClick={() => navigate(`/category/${product.category}`)} className="hover:text-blue-600 cursor-pointer capitalize transition-colors">
                  {product.category}
                </span>
                <span>/</span>
                <span className="text-gray-900">{product.name}</span>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                {product.images && product.images.length > 0 ? (
                  <div className="relative group">
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-96 object-cover cursor-zoom-in transition-transform group-hover:scale-105"
                      onClick={() => setShowZoom(true)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-400 bg-gray-100">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>

              {/* Controles de navegación */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Indicadores de imagen */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-blue-600' : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex space-x-2">
                {product.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                    Destacado
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.stock > 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                }`}>
                  {product.stock > 0 ? 'En stock' : 'Sin stock'}
                </span>
              </div>
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{product.popularity}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.brand}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.subcategory}
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(product.price)}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Información de la tienda */}
            {product.store && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Vendido por:</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-800 font-medium">{product.store.name}</span>
                  {product.store.location && (
                    <>
                      <span className="text-blue-400">•</span>
                      <span className="text-blue-600 text-sm">{product.store.location}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Códigos */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">SKU:</span>
                <span className="text-sm font-medium">{product.sku}</span>
              </div>
              {product.originalPartCode && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Código Original:</span>
                  <span className="text-sm font-medium">{product.originalPartCode}</span>
                </div>
              )}
            </div>

            {/* Stock y cantidad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock disponible:</span>
                <span className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock} unidades
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Cantidad:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{isInCart(product._id) ? 'Actualizar carrito' : 'Agregar al carrito'}</span>
              </button>
              
              <button 
                onClick={handleToggleFavorite}
                className={`p-3 border rounded-lg transition-all ${
                  isFavorite(product._id) 
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={handleShare}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Envío gratis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Garantía</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Stock local</span>
              </div>
            </div>
          </div>
        </div>

        {/* Especificaciones */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Especificaciones</h3>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Productos relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  onClick={() => handleRelatedProductClick(relatedProduct._id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 overflow-hidden group"
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedProduct.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {relatedProduct.brand}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnóstico de imágenes (solo para desarrollo) */}
        {process.env.NODE_ENV === 'development' && product && (
          <div className="mt-8">
            <ImageDiagnostic 
              productImages={product.images || []}
              productName={product.name}
            />
          </div>
        )}
      </div>

      {/* Modal de zoom de imagen */}
      {showZoom && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 