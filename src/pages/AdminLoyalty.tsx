import React from 'react';
import { Award, Users, Gift, Star } from 'lucide-react';

const AdminLoyalty: React.FC = () => {
  const stats = [
    {
      title: 'Clientes Activos',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Puntos Otorgados',
      value: '45,678',
      icon: Award,
      color: 'bg-green-500'
    },
    {
      title: 'Premios Canjeados',
      value: '89',
      icon: Gift,
      color: 'bg-purple-500'
    },
    {
      title: 'Valoración Promedio',
      value: '4.5',
      icon: Star,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Fidelización</h1>
        <p className="text-gray-600 mt-2">Administra el programa de lealtad de clientes</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Programa de Puntos</h3>
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Configuración de puntos y recompensas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Premios Disponibles</h3>
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Gestión de premios y recompensas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoyalty; 