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
  Hash
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  subcategory: string;
  stock: number;
  isFeatured: boolean;
  popularity: number;
  sku: string;
  originalPartCode?: string;
  specifications: Record<string, any>;
  tags: string[];
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data.product);
        setRelatedProducts(data.data.relatedProducts);
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
    // TODO: Implementar lógica del carrito
    console.log('Agregar al carrito:', product?.name, quantity);
  };

  const handleRelatedProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <nav className="flex space-x-2 text-sm text-gray-500">
                <span onClick={() => navigate('/categories')} className="hover:text-blue-600 cursor-pointer">
                  Categorías
                </span>
                <span>/</span>
                <span onClick={() => navigate(`/category/${product.category}`)} className="hover:text-blue-600 cursor-pointer capitalize">
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
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
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
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
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
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-blue-600' : 'bg-white/60'
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
                <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
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
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
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
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
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
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Agregar al carrito</span>
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
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

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Productos relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  onClick={() => handleRelatedProductClick(relatedProduct._id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
                >
                  <div className="h-48 bg-gray-200">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
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
      </div>
    </div>
  );
};

export default ProductDetail; 