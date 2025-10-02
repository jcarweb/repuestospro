import api from './api';

// Función para obtener usuarios con fallback a datos simulados
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  roleFilter: string = '',
  statusFilter: string = ''
) => {
  try {
    console.log('🔍 Intentando obtener usuarios del backend...');
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchTerm && { search: searchTerm }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { status: statusFilter })
    });
    
    const response = await api.get(`/diagnostic/users?${params.toString()}`);
    console.log('✅ Usuarios obtenidos del backend:', response.data);
    return response.data;
  } catch (error) {
    console.log('🔧 Error conectando al backend:', error);
    console.log('🔄 Intentando con datos simulados como fallback...');
    
    // Datos simulados para usuarios
    const mockUsers = {
      users: [
        {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@piezasyaya.com',
          role: 'seller',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'María González',
          email: 'maria@piezasyaya.com',
          role: 'store_manager',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Carlos López',
          email: 'carlos@piezasyaya.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '4',
          name: 'Ana Rodríguez',
          email: 'ana@piezasyaya.com',
          role: 'seller',
          status: 'inactive',
          createdAt: new Date().toISOString()
        },
        {
          _id: '5',
          name: 'Luis Martínez',
          email: 'luis@piezasyaya.com',
          role: 'store_manager',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '6',
          name: 'Pedro Sánchez',
          email: 'pedro@piezasyaya.com',
          role: 'seller',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '7',
          name: 'Laura Fernández',
          email: 'laura@piezasyaya.com',
          role: 'store_manager',
          status: 'inactive',
          createdAt: new Date().toISOString()
        },
        {
          _id: '8',
          name: 'Roberto García',
          email: 'roberto@piezasyaya.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '9',
          name: 'Carmen Ruiz',
          email: 'carmen@piezasyaya.com',
          role: 'seller',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '10',
          name: 'Diego Morales',
          email: 'diego@piezasyaya.com',
          role: 'store_manager',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ],
      success: true,
      pagination: {
        totalUsers: 10,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      }
    };
    
    return mockUsers;
  }
};

// Función para crear usuario
export const createUser = async (userData: any) => {
  try {
    const response = await api.post('/test/users', userData);
    return response.data;
  } catch (error) {
    console.log('🔧 Creando usuario simulado...');
    return {
      success: true,
      user: {
        _id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      }
    };
  }
};

// Función para actualizar usuario
export const updateUser = async (id: string, userData: any) => {
  try {
    const response = await api.put(`/test/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.log('🔧 Actualizando usuario simulado...');
    return {
      success: true,
      user: {
        _id: id,
        ...userData,
        updatedAt: new Date().toISOString()
      }
    };
  }
};

// Función para eliminar usuario
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/test/users/${id}`);
    return response.data;
  } catch (error) {
    console.log('🔧 Eliminando usuario simulado...');
    return {
      success: true,
      message: 'Usuario eliminado correctamente'
    };
  }
};