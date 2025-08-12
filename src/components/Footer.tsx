import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🔧</div>
              <span className="text-xl font-bold">RepuestosPro</span>
            </div>
            <p className="text-gray-300 mb-4">
              Tu tienda de confianza para repuestos de vehículos. 
              Ofrecemos la mejor calidad y servicio al mejor precio.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/category/car" className="text-gray-300 hover:text-white transition-colors">
                  Repuestos Autos
                </Link>
              </li>
              <li>
                <Link to="/category/motorcycle" className="text-gray-300 hover:text-white transition-colors">
                  Repuestos Motos
                </Link>
              </li>
              <li>
                <Link to="/category/truck" className="text-gray-300 hover:text-white transition-colors">
                  Repuestos Camiones
                </Link>
              </li>
              <li>
                <Link to="/ofertas" className="text-gray-300 hover:text-white transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">info@repuestospro.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">
                  123 Calle Principal<br />
                  Ciudad, Estado 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 RepuestosPro. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </Link>
              <Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Envío
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 