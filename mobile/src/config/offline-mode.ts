// Configuración del modo offline para desarrollo
export const OFFLINE_MODE = __DEV__ && false; // Desactivar temporalmente para usar backend real

// Datos mock para desarrollo
export const mockUser = {
  id: 'mock-user-1',
  name: 'Usuario de Prueba',
  email: 'test@piezasya.com',
  phone: '+584121234567',
  role: 'client',
  isVerified: true,
  profileImage: null,
  preferences: {
    language: 'es',
    notifications: true,
    theme: 'dark'
  },
  location: {
    address: 'Calle Atras de Antímano, Caracas, Distrito Capital, Venezuela',
    coordinates: {
      latitude: 10.463189,
      longitude: -66.984313
    }
  }
};

export const mockProducts = [
  {
    id: '1',
    name: 'Filtro de Aceite Motor',
    brand: 'Mann-Filter',
    price: 25.50,
    category: 'Filtros',
    subcategory: 'Filtros de Aceite',
    image: 'https://via.placeholder.com/300x200?text=Filtro+Aceite',
    description: 'Filtro de aceite de alta calidad para motores',
    stock: 15,
    rating: 4.5,
    reviews: 23
  },
  {
    id: '2',
    name: 'Pastillas de Freno Delanteras',
    brand: 'Brembo',
    price: 45.00,
    category: 'Frenos',
    subcategory: 'Pastillas de Freno',
    image: 'https://via.placeholder.com/300x200?text=Pastillas+Freno',
    description: 'Pastillas de freno delanteras de alto rendimiento',
    stock: 8,
    rating: 4.8,
    reviews: 15
  },
  {
    id: '3',
    name: 'Batería 12V 60Ah',
    brand: 'Bosch',
    price: 120.00,
    category: 'Eléctrico',
    subcategory: 'Baterías',
    image: 'https://via.placeholder.com/300x200?text=Bateria+12V',
    description: 'Batería de 12V 60Ah para vehículos',
    stock: 5,
    rating: 4.3,
    reviews: 31
  }
];

export const mockStores = [
  {
    id: '1',
    name: 'Repuestos Central',
    address: 'Av. Principal, Caracas',
    phone: '+584121234567',
    isOpen: true,
    rating: 4.5,
    distance: '2.5 km'
  },
  {
    id: '2',
    name: 'Auto Parts Plus',
    address: 'Calle Comercial, Valencia',
    phone: '+584121234568',
    isOpen: true,
    rating: 4.2,
    distance: '5.1 km'
  }
];

// Función para simular delay de red
export const simulateNetworkDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Función para simular respuesta de API
export const mockApiResponse = <T>(data: T, delay: number = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Configuración de red mock
export const mockNetworkConfig = {
  baseUrl: 'http://mock-api.piezasya.com/api',
  isLocal: false,
  networkName: 'Modo Offline (Desarrollo)',
  lastTested: Date.now(),
  isWorking: true,
};
