import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  TrendingUp, 
  DollarSign,
  Car,
  Wrench,
  Zap,
  Shield,
  Settings,
  Gauge,
  Fuel,
  Cpu,
  Wind,
  Circle
} from 'lucide-react';

interface Category {
  name: string;
  count: number;
  avgPrice: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'motor':
      case 'engine':
        return <Settings className="w-6 h-6" />;
      case 'frenos':
      case 'brakes':
        return <Circle className="w-6 h-6" />;
      case 'eléctrico':
      case 'electrical':
        return <Zap className="w-6 h-6" />;
      case 'refrigeración':
      case 'cooling':
        return <Wind className="w-6 h-6" />;
      case 'transmisión':
      case 'transmission':
        return <Gauge className="w-6 h-6" />;
      case 'combustible':
      case 'fuel':
        return <Fuel className="w-6 h-6" />;
      case 'dirección':
      case 'steering':
        return <Car className="w-6 h-6" />;
      case 'escape':
      case 'exhaust':
        return <Cpu className="w-6 h-6" />;
      case 'accesorios':
      case 'accessories':
        return <Package className="w-6 h-6" />;
      default:
        return <Wrench className="w-6 h-6" />;
    }
  };

  // Función para obtener el color del icono según la categoría
  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'motor':
      case 'engine':
        return 'text-red-600 bg-red-100';
      case 'frenos':
      case 'brakes':
        return 'text-orange-600 bg-orange-100';
      case 'eléctrico':
      case 'electrical':
        return 'text-yellow-600 bg-yellow-100';
      case 'refrigeración':
      case 'cooling':
        return 'text-blue-600 bg-blue-100';
      case 'transmisión':
      case 'transmission':
        return 'text-purple-600 bg-purple-100';
      case 'combustible':
      case 'fuel':
        return 'text-green-600 bg-green-100';
      case 'dirección':
      case 'steering':
        return 'text-indigo-600 bg-indigo-100';
      case 'escape':
      case 'exhaust':
        return 'text-gray-600 bg-gray-100';
      case 'accesorios':
      case 'accessories':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-[#FFC300] bg-[#FFC300]/20';
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando categorías desde:', 'process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""/api/products/categories');
      
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/products/categories');
      const data = await response.json();
      
      console.log('📊 Respuesta del servidor:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Categorías cargadas:', data.data);
        console.log('🔍 Primera categoría:', data.data[0]);
        console.log('🔍 Tipo de datos:', typeof data.data[0]);
        console.log('🔍 Longitud del array:', data.data.length);
        console.log('🔍 Todas las categorías:', data.data.map(cat => cat.name));
        setCategories(data.data);
      } else {
        console.error('❌ Error en respuesta o datos vacíos:', data.message || 'No hay categorías');
        
        // Fallback con categorías hardcodeadas para testing
        console.log('🔄 Usando categorías de prueba...');
        const testCategories = [
          { name: 'frenos', count: 61, avgPrice: 263 },
          { name: 'motor', count: 52, avgPrice: 278 },
          { name: 'transmisión', count: 55, avgPrice: 255 },
          { name: 'eléctrico', count: 60, avgPrice: 280 },
          { name: 'suspensión', count: 45, avgPrice: 245 },
          { name: 'accesorios', count: 67, avgPrice: 274 }
        ];
        console.log('🔄 Categorías de prueba:', testCategories);
        setCategories(testCategories);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      
      // Fallback con categorías hardcodeadas para testing
      console.log('🔄 Usando categorías de prueba por error de conexión...');
      const testCategories = [
        { name: 'frenos', count: 61, avgPrice: 263 },
        { name: 'motor', count: 52, avgPrice: 278 },
        { name: 'transmisión', count: 55, avgPrice: 255 },
        { name: 'eléctrico', count: 60, avgPrice: 280 },
        { name: 'suspensión', count: 45, avgPrice: 245 },
        { name: 'accesorios', count: 67, avgPrice: 274 }
      ];
      console.log('🔄 Categorías de prueba por error:', testCategories);
      setCategories(testCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    console.log('🔗 Navegando a categoría:', categoryName);
    console.log('🔗 Tipo de categoryName:', typeof categoryName);
    console.log('🔗 Valor de categoryName:', JSON.stringify(categoryName));
    
    // Asegurar que categoryName sea un string válido
    if (typeof categoryName === 'string' && categoryName.trim() !== '') {
      navigate(`/category/${categoryName.toLowerCase()}`);
    } else {
      console.error('❌ Error: categoryName no es válido:', categoryName);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#FFC300] rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-[#333333]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#333333]">Categorías</h1>
              <p className="text-gray-600">Explora nuestros repuestos por categoría</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            console.log(`🔍 Renderizando categoría ${index}:`, category);
            console.log(`🔍 Nombre de categoría: "${category.name}"`);
            console.log(`🔍 Tipo de nombre:`, typeof category.name);
            return (
            <div
              key={category.name}
              onClick={() => {
                console.log('🖱️ Click en categoría:', category);
                console.log('🖱️ category.name:', category.name);
                console.log('🖱️ typeof category.name:', typeof category.name);
                handleCategoryClick(category.name);
              }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-[#FFC300] hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(category.name)}`}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333] capitalize">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count} productos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFC300] transition-colors" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{category.count} disponibles</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#FFC300]">
                    <DollarSign className="w-4 h-4" />
                    <span>Desde ${Math.round(category.avgPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay categorías disponibles
            </h3>
            <p className="text-gray-600">
              Por favor, contacta al administrador para agregar categorías.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 