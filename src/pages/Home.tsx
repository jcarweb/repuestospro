import React from 'react';
import { Link } from 'react-router-dom';
import AdvancedSearch from '../components/AdvancedSearch';
import { Package, TrendingUp, Star, Truck, Shield } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🚗 RepuestosPro
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Encuentra los mejores repuestos para tu vehículo
            </p>
            
            {/* Búsqueda avanzada */}
            <div className="max-w-4xl mx-auto mb-8">
              <AdvancedSearch 
                placeholder="Buscar repuestos, marcas, códigos..."
                className="w-full"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/categories"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package className="w-5 h-5 mr-2" />
                Ver Categorías
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                <TrendingUp className="w-5 h-5 mr-2" />
                Ofertas Especiales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir RepuestosPro?
            </h2>
            <p className="text-lg text-gray-600">
              La mejor plataforma para encontrar repuestos de calidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Amplio Catálogo
              </h3>
              <p className="text-gray-600">
                Más de 10,000 productos de las mejores marcas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Envío Rápido
              </h3>
              <p className="text-gray-600">
                Entrega en 24-48 horas en toda Colombia
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Garantía Total
              </h3>
              <p className="text-gray-600">
                Todos nuestros productos tienen garantía
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para encontrar tu repuesto?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de clientes satisfechos
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            Explorar Categorías
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 