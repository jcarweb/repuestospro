import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, User, LogOut, Bell } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#FFC300] rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-[#333333]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#333333]">PiezasYA</h1>
          <p className="text-xs text-gray-500">Panel de Administración</p>
        </div>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-[#FFC300] transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#333333]">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-[#E63946] transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
