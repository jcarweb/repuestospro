import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import AdvancedSearch from '../components/AdvancedSearch';
import { 
  Package, 
  TrendingUp, 
  Star, 
  Truck, 
  Shield, 
  Car, 
  Wrench, 
  Zap, 
  Clock, 
  MapPin,
  ChevronRight,
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  Lightbulb,
  Square
} from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Función para renderizar iconos de categorías
  const renderCategoryIcon = (iconName: string) => {
    const iconProps = { className: "w-8 h-8 text-white" };
    
    switch (iconName) {
      case 'brakes':
        return <Square {...iconProps} />;
      case 'engine':
        return <Settings {...iconProps} />;
      case 'suspension':
        return <Wrench {...iconProps} />;
      case 'lightbulb':
        return <Lightbulb {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'car':
        return <Car {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  // Función para renderizar iconos de productos
  const renderProductIcon = (iconName: string) => {
    const iconProps = { className: "w-16 h-16 text-[#333333]" };
    
    switch (iconName) {
      case 'brakes':
        return <Square {...iconProps} />;
      case 'wrench':
        return <Wrench {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'lightbulb':
        return <Lightbulb {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  // Datos de ejemplo para las secciones
  const featuredCategories = [
    { id: 1, name: 'Frenos', icon: 'brakes', count: '2,450', color: 'bg-red-500' },
    { id: 2, name: 'Motor', icon: 'engine', count: '1,890', color: 'bg-blue-500' },
    { id: 3, name: 'Suspensión', icon: 'suspension', count: '1,234', color: 'bg-green-500' },
    { id: 4, name: 'Iluminación', icon: 'lightbulb', count: '987', color: 'bg-yellow-500' },
    { id: 5, name: 'Transmisión', icon: 'zap', count: '756', color: 'bg-purple-500' },
    { id: 6, name: 'Carrocería', icon: 'car', count: '1,123', color: 'bg-indigo-500' },
  ];

  const trendingProducts = [
    { id: 1, name: 'Pastillas de Freno Premium', price: '$45.99', originalPrice: '$59.99', discount: '23%', image: 'brakes', rating: 4.8, reviews: 156 },
    { id: 2, name: 'Filtro de Aceite de Alto Rendimiento', price: '$12.99', originalPrice: '$18.99', discount: '32%', image: 'wrench', rating: 4.6, reviews: 89 },
    { id: 3, name: 'Amortiguadores Deportivos', price: '$89.99', originalPrice: '$129.99', discount: '31%', image: 'zap', rating: 4.7, reviews: 234 },
    { id: 4, name: 'Bujías de Iridio', price: '$24.99', originalPrice: '$34.99', discount: '29%', image: 'lightbulb', rating: 4.9, reviews: 67 },
  ];

  const offers = [
    { id: 1, title: 'Ofertas Flash', subtitle: 'Solo por 24 horas', discount: 'Hasta 50% OFF', color: 'bg-red-500' },
    { id: 2, title: 'Envío Gratis', subtitle: 'En compras superiores a $100', discount: 'Sin costo adicional', color: 'bg-green-500' },
    { id: 3, title: 'Garantía Extendida', subtitle: '2 años de protección', discount: 'Incluida gratis', color: 'bg-blue-500' },
  ];

  const brands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Hyundai'
  ];

  // Auto-slider para el hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con Slider */}
      <section className="relative w-full h-[600px] overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {/* Slide 1 - Principal */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full bg-gradient-to-br from-[#FFC300] via-[#FFB800] to-[#FFA500] flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-white">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                      Repuestos
                      <span className="block text-[#333333]">Automotrices</span>
                    </h1>
                    <p className="text-xl lg:text-2xl mb-8 text-[#333333] font-medium">
                      La mejor calidad al mejor precio. Encuentra todo para tu vehículo.
                    </p>
                    
                    {/* Búsqueda avanzada */}
                    <div className="max-w-lg mb-8">
                      <AdvancedSearch 
                        placeholder="Buscar repuestos, marcas, modelos..."
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/categories"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#333333] text-white font-bold rounded-xl hover:bg-[#444444] transition-all transform hover:scale-105 shadow-lg"
                      >
                        <Package className="w-6 h-6 mr-3" />
                        Explorar Categorías
                      </Link>
                      <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#333333] text-[#333333] font-bold rounded-xl hover:bg-[#333333] hover:text-white transition-all transform hover:scale-105">
                        <TrendingUp className="w-6 h-6 mr-3" />
                        Ofertas Especiales
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-center">
                      <div className="text-9xl mb-4 text-[#333333]">
                        <Car className="w-32 h-32 mx-auto" />
                      </div>
                      <div className="text-6xl mb-2 text-[#333333]">
                        <Settings className="w-20 h-20 mx-auto" />
                      </div>
                      <div className="text-4xl text-[#333333]">
                        <Wrench className="w-16 h-16 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 - Ofertas */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full bg-gradient-to-br from-[#333333] via-[#444444] to-[#555555] flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center text-white">
                <h2 className="text-5xl lg:text-7xl font-bold mb-6">
                  <span className="text-[#FFC300]">Ofertas</span> Flash
                </h2>
                <p className="text-xl lg:text-2xl mb-8">
                  Descuentos increíbles solo por tiempo limitado
                </p>
                <div className="text-6xl mb-8">⚡</div>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-[#FFC300] text-[#333333] font-bold rounded-xl hover:bg-[#FFB800] transition-all transform hover:scale-105">
                  Ver Ofertas
                </button>
              </div>
            </div>
          </div>

          {/* Slide 3 - Envío */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center text-white">
                <h2 className="text-5xl lg:text-7xl font-bold mb-6">
                  <span className="text-[#FFC300]">Envío</span> Gratis
                </h2>
                <p className="text-xl lg:text-2xl mb-8">
                  En todas las compras superiores a $100
                </p>
                <div className="text-6xl mb-8">🚚</div>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-[#FFC300] text-[#333333] font-bold rounded-xl hover:bg-[#FFB800] transition-all transform hover:scale-105">
                  Comprar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de slide */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-[#FFC300] w-8' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">
              Categorías <span className="text-[#FFC300]">Destacadas</span>
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra repuestos para todas las partes de tu vehículo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 hover:border-[#FFC300]"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {renderCategoryIcon(category.icon)}
                </div>
                <h3 className="text-lg font-semibold text-[#333333] mb-2 group-hover:text-[#FFC300] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.count} productos
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos en Tendencia */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                Productos en <span className="text-[#FFC300]">Tendencia</span>
              </h2>
              <p className="text-lg text-gray-600">
                Los repuestos más populares y mejor valorados
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg hover:bg-[#FFB800] transition-colors"
            >
              Ver Todos
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
                <div className="relative mb-4">
                  <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    {renderProductIcon(product.image)}
                  </div>
                  <div className="absolute top-2 right-2">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      {product.discount}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#333333] mb-2 group-hover:text-[#FFC300] transition-colors line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-[#FFC300] fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-[#333333]">
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {product.originalPrice}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg hover:bg-[#FFB800] transition-colors flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al Carrito
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas Especiales */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">
              Ofertas <span className="text-[#FFC300]">Especiales</span>
            </h2>
            <p className="text-lg text-gray-600">
              Aprovecha estas promociones por tiempo limitado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div key={offer.id} className={`${offer.color} rounded-2xl p-8 text-white text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2`}>
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-lg mb-4 opacity-90">{offer.subtitle}</p>
                <div className="text-3xl font-bold mb-6">{offer.discount}</div>
                <button className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Ver Ofertas
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marcas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">
              Marcas <span className="text-[#FFC300]">Disponibles</span>
            </h2>
            <p className="text-lg text-gray-600">
              Repuestos originales y de alta calidad para todas las marcas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 hover:border-[#FFC300]"
              >
                <h3 className="text-lg font-semibold text-[#333333] group-hover:text-[#FFC300] transition-colors">
                  {brand}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#333333] mb-4">
              ¿Por qué elegir <span className="text-[#FFC300]">PiezasYA</span>?
            </h2>
            <p className="text-lg text-gray-600">
              Somos tu mejor opción para repuestos automotrices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC300] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-[#FFC300]" />
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">
                Garantía de Calidad
              </h3>
              <p className="text-gray-600">
                Todos nuestros productos cuentan con garantía y certificación de calidad
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC300] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-10 h-10 text-[#FFC300]" />
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">
                Envío Rápido
              </h3>
              <p className="text-gray-600">
                Entrega en 24-48 horas en toda la ciudad
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC300] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-[#FFC300]" />
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">
                Atención 24/7
              </h3>
              <p className="text-gray-600">
                Soporte técnico disponible en cualquier momento
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC300] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-[#FFC300]" />
              </div>
              <h3 className="text-xl font-semibold text-[#333333] mb-3">
                Ubicación Céntrica
              </h3>
              <p className="text-gray-600">
                Tienda física en el centro de la ciudad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#333333] to-[#444444] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            ¿Listo para encontrar tus <span className="text-[#FFC300]">repuestos</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Únete a miles de clientes satisfechos que confían en PiezasYA para mantener sus vehículos en perfecto estado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/categories"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FFC300] text-[#333333] font-bold rounded-xl hover:bg-[#FFB800] transition-all transform hover:scale-105 shadow-lg"
            >
              <Package className="w-6 h-6 mr-3" />
              Explorar Productos
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#FFC300] text-[#FFC300] font-bold rounded-xl hover:bg-[#FFC300] hover:text-[#333333] transition-all transform hover:scale-105"
            >
              <Car className="w-6 h-6 mr-3" />
              Crear Cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 