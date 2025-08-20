import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import AdvancedSearch from '../components/AdvancedSearch';
import { Package, TrendingUp, Star, Truck, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange(); // Para asegurar re-renders

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333]">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🚗 PiezasYA
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t('home.hero.tagline')}
            </p>
            
            {/* Búsqueda avanzada */}
            <div className="max-w-4xl mx-auto mb-8">
              <AdvancedSearch 
                placeholder={t('home.search.placeholder')}
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
                {t('home.actions.viewCategories')}
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                <TrendingUp className="w-5 h-5 mr-2" />
                {t('home.actions.specialOffers')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#333333] dark:text-[#FFC300] mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-white">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-[#FFC300] mb-2">
                {t('home.features.catalog.title')}
              </h3>
              <p className="text-gray-600 dark:text-white">
                {t('home.features.catalog.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-[#FFC300] mb-2">
                {t('home.features.shipping.title')}
              </h3>
              <p className="text-gray-600 dark:text-white">
                {t('home.features.shipping.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-[#FFC300] mb-2">
                {t('home.features.warranty.title')}
              </h3>
              <p className="text-gray-600 dark:text-white">
                {t('home.features.warranty.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            {t('home.cta.exploreCategories')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 