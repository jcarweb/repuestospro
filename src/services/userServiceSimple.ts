// Servicio simplificado de usuarios que siempre devuelve datos simulados
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  roleFilter: string = '',
  statusFilter: string = ''
) => {
  console.log('🔍 fetchUsers called with:', { page, limit, searchTerm, roleFilter, statusFilter });
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Datos simulados para usuarios
  const allUsers = [
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
    },
    {
      _id: '11',
      name: 'Elena Vargas',
      email: 'elena@piezasyaya.com',
      role: 'seller',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: '12',
      name: 'Miguel Torres',
      email: 'miguel@piezasyaya.com',
      role: 'admin',
      status: 'inactive',
      createdAt: new Date().toISOString()
    }
  ];

  // Aplicar filtros
  let filteredUsers = allUsers;

  // Filtro por búsqueda
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filtro por rol
  if (roleFilter) {
    filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
  }

  // Filtro por estado
  if (statusFilter) {
    filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
  }

  // Aplicar paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const result = {
    success: true,
    users: paginatedUsers,
    pagination: {
      totalUsers: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
      currentPage: page,
      limit: limit
    }
  };

  console.log('📊 Returning data:', result);
  return result;
};

// Función para crear usuario
export const createUser = async (userData: any) => {
  console.log('🔧 Creating user (simulated):', userData);
  return {
    success: true,
    user: {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    }
  };
};

// Función para actualizar usuario
export const updateUser = async (id: string, userData: any) => {
  console.log('🔧 Updating user (simulated):', id, userData);
  return {
    success: true,
    user: {
      _id: id,
      ...userData,
      updatedAt: new Date().toISOString()
    }
  };
};

// Función para eliminar usuario
export const deleteUser = async (id: string) => {
  console.log('🔧 Deleting user (simulated):', id);
  return {
    success: true,
    message: 'Usuario eliminado correctamente'
  };
};
