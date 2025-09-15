// Datos mock para cuando el servidor no está disponible

export const mockStates = [
  // Región Capital
  { _id: '1', name: 'Distrito Capital', code: 'DC', capital: 'Caracas', region: 'Capital' },
  
  // Región Central
  { _id: '2', name: 'Miranda', code: 'MI', capital: 'Los Teques', region: 'Central' },
  { _id: '3', name: 'Carabobo', code: 'CA', capital: 'Valencia', region: 'Central' },
  { _id: '4', name: 'Aragua', code: 'AR', capital: 'Maracay', region: 'Central' },
  { _id: '5', name: 'Cojedes', code: 'CO', capital: 'San Carlos', region: 'Central' },
  { _id: '6', name: 'Guárico', code: 'GU', capital: 'San Juan de los Morros', region: 'Central' },
  { _id: '7', name: 'Vargas', code: 'VA', capital: 'La Guaira', region: 'Central' },
  
  // Región Occidental
  { _id: '8', name: 'Zulia', code: 'ZU', capital: 'Maracaibo', region: 'Occidental' },
  { _id: '9', name: 'Lara', code: 'LA', capital: 'Barquisimeto', region: 'Occidental' },
  { _id: '10', name: 'Falcón', code: 'FA', capital: 'Coro', region: 'Occidental' },
  { _id: '11', name: 'Yaracuy', code: 'YA', capital: 'San Felipe', region: 'Occidental' },
  { _id: '12', name: 'Trujillo', code: 'TR', capital: 'Trujillo', region: 'Occidental' },
  
  // Región Oriental
  { _id: '13', name: 'Anzoátegui', code: 'AN', capital: 'Barcelona', region: 'Oriental' },
  { _id: '14', name: 'Bolívar', code: 'BO', capital: 'Ciudad Bolívar', region: 'Oriental' },
  { _id: '15', name: 'Monagas', code: 'MO', capital: 'Maturín', region: 'Oriental' },
  { _id: '16', name: 'Sucre', code: 'SU', capital: 'Cumaná', region: 'Oriental' },
  { _id: '17', name: 'Delta Amacuro', code: 'DA', capital: 'Tucupita', region: 'Oriental' },
  
  // Región Andina
  { _id: '18', name: 'Táchira', code: 'TA', capital: 'San Cristóbal', region: 'Andina' },
  { _id: '19', name: 'Mérida', code: 'ME', capital: 'Mérida', region: 'Andina' },
  { _id: '20', name: 'Barinas', code: 'BA', capital: 'Barinas', region: 'Andina' },
  { _id: '21', name: 'Portuguesa', code: 'PO', capital: 'Guanare', region: 'Andina' },
  
  // Región Llanos
  { _id: '22', name: 'Apure', code: 'AP', capital: 'San Fernando de Apure', region: 'Llanos' },
  
  // Región Guayana
  { _id: '23', name: 'Amazonas', code: 'AM', capital: 'Puerto Ayacucho', region: 'Guayana' },
  
  // Dependencias Federales
  { _id: '24', name: 'Dependencias Federales', code: 'DF', capital: 'La Orchila', region: 'Insular' }
];

export const mockMunicipalities = {
  '1': [ // Distrito Capital
    { _id: '1-1', name: 'Libertador', code: 'LIB', capital: 'Caracas', state: '1' },
    { _id: '1-2', name: 'Chacao', code: 'CHA', capital: 'Chacao', state: '1' },
    { _id: '1-3', name: 'Baruta', code: 'BAR', capital: 'Baruta', state: '1' },
    { _id: '1-4', name: 'El Hatillo', code: 'HAT', capital: 'El Hatillo', state: '1' }
  ],
  '2': [ // Miranda
    { _id: '2-1', name: 'Guarenas', code: 'GUA', capital: 'Guarenas', state: '2' },
    { _id: '2-2', name: 'Guatire', code: 'GUT', capital: 'Guatire', state: '2' },
    { _id: '2-3', name: 'Petare', code: 'PET', capital: 'Petare', state: '2' },
    { _id: '2-4', name: 'Sucre', code: 'SUC', capital: 'Petare', state: '2' }
  ],
  '3': [ // Carabobo
    { _id: '3-1', name: 'Valencia', code: 'VAL', capital: 'Valencia', state: '3' },
    { _id: '3-2', name: 'Puerto Cabello', code: 'PUE', capital: 'Puerto Cabello', state: '3' },
    { _id: '3-3', name: 'Guacara', code: 'GUC', capital: 'Guacara', state: '3' },
    { _id: '3-4', name: 'San Diego', code: 'SDI', capital: 'San Diego', state: '3' }
  ],
  '4': [ // Aragua
    { _id: '4-1', name: 'Girardot', code: 'GIR', capital: 'Maracay', state: '4' },
    { _id: '4-2', name: 'Mario Briceño Iragorry', code: 'MBI', capital: 'El Limón', state: '4' },
    { _id: '4-3', name: 'Santiago Mariño', code: 'SMA', capital: 'Turmero', state: '4' }
  ],
  '8': [ // Zulia
    { _id: '8-1', name: 'Maracaibo', code: 'MAR', capital: 'Maracaibo', state: '8' },
    { _id: '8-2', name: 'Cabimas', code: 'CAB', capital: 'Cabimas', state: '8' },
    { _id: '8-3', name: 'Ciudad Ojeda', code: 'COJ', capital: 'Ciudad Ojeda', state: '8' }
  ],
  '9': [ // Lara
    { _id: '9-1', name: 'Iribarren', code: 'IRI', capital: 'Barquisimeto', state: '9' },
    { _id: '9-2', name: 'Palavecino', code: 'PAL', capital: 'Cabudare', state: '9' },
    { _id: '9-3', name: 'Torres', code: 'TOR', capital: 'Carora', state: '9' }
  ],
  '13': [ // Anzoátegui
    { _id: '13-1', name: 'Barcelona', code: 'BAR', capital: 'Barcelona', state: '13' },
    { _id: '13-2', name: 'Lechería', code: 'LEC', capital: 'Lechería', state: '13' },
    { _id: '13-3', name: 'Puerto La Cruz', code: 'PLC', capital: 'Puerto La Cruz', state: '13' }
  ],
  '14': [ // Bolívar
    { _id: '14-1', name: 'Heres', code: 'HER', capital: 'Ciudad Bolívar', state: '14' },
    { _id: '14-2', name: 'Caroní', code: 'CAR', capital: 'Ciudad Guayana', state: '14' },
    { _id: '14-3', name: 'Angostura', code: 'ANG', capital: 'Ciudad Bolívar', state: '14' }
  ],
  '18': [ // Táchira
    { _id: '18-1', name: 'San Cristóbal', code: 'SCR', capital: 'San Cristóbal', state: '18' },
    { _id: '18-2', name: 'Cárdenas', code: 'CAR', capital: 'Táriba', state: '18' },
    { _id: '18-3', name: 'Córdoba', code: 'COR', capital: 'Santa Ana', state: '18' }
  ],
  '19': [ // Mérida
    { _id: '19-1', name: 'Libertador', code: 'LIB', capital: 'Mérida', state: '19' },
    { _id: '19-2', name: 'Campo Elías', code: 'CAM', capital: 'Ejido', state: '19' },
    { _id: '19-3', name: 'Rangel', code: 'RAN', capital: 'Mucuchíes', state: '19' }
  ]
};

export const mockParishes = {
  '1-1': [ // Libertador (Distrito Capital)
    { _id: '1-1-1', name: 'Catedral', code: 'CAT', municipality: '1-1' },
    { _id: '1-1-2', name: 'La Candelaria', code: 'CAN', municipality: '1-1' },
    { _id: '1-1-3', name: 'San Juan', code: 'SJU', municipality: '1-1' },
    { _id: '1-1-4', name: 'Santa Teresa', code: 'STE', municipality: '1-1' }
  ],
  '1-2': [ // Chacao (Distrito Capital)
    { _id: '1-2-1', name: 'Chacao', code: 'CHA', municipality: '1-2' },
    { _id: '1-2-2', name: 'Bello Campo', code: 'BEL', municipality: '1-2' }
  ],
  '2-1': [ // Guarenas (Miranda)
    { _id: '2-1-1', name: 'Guarenas', code: 'GUA', municipality: '2-1' },
    { _id: '2-1-2', name: 'Caucagüita', code: 'CAU', municipality: '2-1' }
  ],
  '3-1': [ // Valencia (Carabobo)
    { _id: '3-1-1', name: 'Valencia', code: 'VAL', municipality: '3-1' },
    { _id: '3-1-2', name: 'San Blas', code: 'SBL', municipality: '3-1' },
    { _id: '3-1-3', name: 'Candelaria', code: 'CAN', municipality: '3-1' }
  ],
  '4-1': [ // Girardot (Aragua)
    { _id: '4-1-1', name: 'Maracay', code: 'MAR', municipality: '4-1' },
    { _id: '4-1-2', name: 'Choroní', code: 'CHO', municipality: '4-1' }
  ],
  '8-1': [ // Maracaibo (Zulia)
    { _id: '8-1-1', name: 'Maracaibo', code: 'MAR', municipality: '8-1' },
    { _id: '8-1-2', name: 'San Rafael', code: 'SRA', municipality: '8-1' }
  ],
  '9-1': [ // Iribarren (Lara)
    { _id: '9-1-1', name: 'Barquisimeto', code: 'BAR', municipality: '9-1' },
    { _id: '9-1-2', name: 'Concepción', code: 'CON', municipality: '9-1' }
  ],
  '13-1': [ // Barcelona (Anzoátegui)
    { _id: '13-1-1', name: 'Barcelona', code: 'BAR', municipality: '13-1' },
    { _id: '13-1-2', name: 'Bergantín', code: 'BER', municipality: '13-1' }
  ],
  '14-1': [ // Heres (Bolívar)
    { _id: '14-1-1', name: 'Ciudad Bolívar', code: 'CBV', municipality: '14-1' },
    { _id: '14-1-2', name: 'Angostura', code: 'ANG', municipality: '14-1' }
  ],
  '18-1': [ // San Cristóbal (Táchira)
    { _id: '18-1-1', name: 'San Cristóbal', code: 'SCR', municipality: '18-1' },
    { _id: '18-1-2', name: 'La Concordia', code: 'LCO', municipality: '18-1' }
  ],
  '19-1': [ // Libertador (Mérida)
    { _id: '19-1-1', name: 'Mérida', code: 'MER', municipality: '19-1' },
    { _id: '19-1-2', name: 'Arias', code: 'ARI', municipality: '19-1' }
  ]
};

export const mockUsers = [
  {
    _id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'store_manager',
    isActive: true,
    isEmailVerified: true,
    avatar: '/uploads/perfil/default-avatar.svg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    role: 'store_manager',
    isActive: true,
    isEmailVerified: true,
    avatar: '/uploads/perfil/default-avatar.svg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    role: 'store_manager',
    isActive: true,
    isEmailVerified: true,
    avatar: '/uploads/perfil/default-avatar.svg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

export const mockStores = [
  {
    _id: '1',
    name: 'Repuestos Central',
    description: 'Tienda principal de repuestos automotrices',
    address: 'Av. Principal, Centro',
    city: 'Caracas',
    state: 'Distrito Capital',
    zipCode: '1010',
    country: 'Venezuela',
    phone: '+58-212-555-0101',
    email: 'info@repuestoscentral.com',
    website: 'https://repuestoscentral.com',
    isActive: true,
    owner: {
      _id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com'
    },
    managers: [
      {
        _id: '2',
        name: 'María González',
        email: 'maria.gonzalez@example.com'
      }
    ],
    coordinates: {
      latitude: 10.4806,
      longitude: -66.9036
    },
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '16:00', isOpen: true },
      sunday: { open: '08:00', close: '14:00', isOpen: false }
    },
    settings: {
      currency: 'USD',
      taxRate: 16,
      deliveryRadius: 10,
      minimumOrder: 0,
      autoAcceptOrders: true
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Auto Parts Valencia',
    description: 'Repuestos para vehículos en Valencia',
    address: 'Calle Comercial, Centro',
    city: 'Valencia',
    state: 'Carabobo',
    zipCode: '2001',
    country: 'Venezuela',
    phone: '+58-241-555-0202',
    email: 'ventas@autopartsvalencia.com',
    isActive: true,
    owner: {
      _id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com'
    },
    managers: [],
    coordinates: {
      latitude: 10.1621,
      longitude: -68.0077
    },
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '16:00', isOpen: true },
      sunday: { open: '08:00', close: '14:00', isOpen: false }
    },
    settings: {
      currency: 'USD',
      taxRate: 16,
      deliveryRadius: 15,
      minimumOrder: 50,
      autoAcceptOrders: false
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

export const mockStoreStats = {
  totalStores: 2,
  activeStores: 2,
  inactiveStores: 0,
  storesByCity: [
    { _id: 'Caracas', count: 1 },
    { _id: 'Valencia', count: 1 }
  ],
  storesByState: [
    { _id: 'Distrito Capital', count: 1 },
    { _id: 'Carabobo', count: 1 }
  ]
};
