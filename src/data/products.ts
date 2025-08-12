import type { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Filtro de Aceite Motor',
    description: 'Filtro de aceite de alta calidad para motores de gasolina y diesel. Compatible con múltiples marcas.',
    price: 25.99,
    originalPrice: 32.99,
    image: '/images/filtro-aceite.jpg',
    category: 'car',
    subcategory: 'Filtros',
    brand: 'Bosch',
    stock: 150,
    rating: 4.5,
    reviews: 89,
    isOnSale: true,
    discountPercentage: 21,
    specifications: [
      { name: 'Material', value: 'Papel sintético' },
      { name: 'Capacidad', value: 'Hasta 5L' },
      { name: 'Temperatura', value: '-40°C a +120°C' }
    ],
    compatibleVehicles: ['Toyota', 'Honda', 'Ford', 'Chevrolet']
  },
  {
    id: '2',
    name: 'Pastillas de Freno Delanteras',
    description: 'Pastillas de freno cerámicas de alto rendimiento para frenado suave y duradero.',
    price: 45.50,
    image: '/images/pastillas-freno.jpg',
    category: 'car',
    subcategory: 'Frenos',
    brand: 'Brembo',
    stock: 75,
    rating: 4.8,
    reviews: 156,
    isNew: true,
    specifications: [
      { name: 'Material', value: 'Cerámica' },
      { name: 'Tipo', value: 'Delanteras' },
      { name: 'Duración', value: '50,000 km' }
    ],
    compatibleVehicles: ['BMW', 'Mercedes', 'Audi', 'Volkswagen']
  },
  {
    id: '3',
    name: 'Batería de Moto 12V',
    description: 'Batería de moto de 12V con tecnología AGM para mayor durabilidad y rendimiento.',
    price: 89.99,
    image: '/images/bateria-moto.jpg',
    category: 'motorcycle',
    subcategory: 'Baterías',
    brand: 'Yuasa',
    stock: 30,
    rating: 4.3,
    reviews: 67,
    specifications: [
      { name: 'Voltaje', value: '12V' },
      { name: 'Capacidad', value: '7Ah' },
      { name: 'Tecnología', value: 'AGM' }
    ],
    compatibleVehicles: ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki']
  },
  {
    id: '4',
    name: 'Neumático Camión 295/80R22.5',
    description: 'Neumático para camión de alta resistencia con banda de rodadura especial para cargas pesadas.',
    price: 450.00,
    image: '/images/neumatico-camion.jpg',
    category: 'truck',
    subcategory: 'Neumáticos',
    brand: 'Michelin',
    stock: 12,
    rating: 4.7,
    reviews: 34,
    specifications: [
      { name: 'Medida', value: '295/80R22.5' },
      { name: 'Índice de Carga', value: '149/145' },
      { name: 'Índice de Velocidad', value: 'M' }
    ],
    compatibleVehicles: ['Freightliner', 'Kenworth', 'Peterbilt', 'Volvo']
  },
  {
    id: '5',
    name: 'Aceite Motor Sintético 5W-30',
    description: 'Aceite de motor sintético de alto rendimiento para protección máxima del motor.',
    price: 35.99,
    originalPrice: 42.99,
    image: '/images/aceite-motor.jpg',
    category: 'car',
    subcategory: 'Lubricantes',
    brand: 'Mobil 1',
    stock: 200,
    rating: 4.6,
    reviews: 234,
    isOnSale: true,
    discountPercentage: 16,
    specifications: [
      { name: 'Viscosidad', value: '5W-30' },
      { name: 'Tipo', value: 'Sintético' },
      { name: 'Capacidad', value: '1L' }
    ],
    compatibleVehicles: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan']
  },
  {
    id: '6',
    name: 'Cadena de Distribución',
    description: 'Kit completo de cadena de distribución con tensor y guías para motores de alto rendimiento.',
    price: 180.00,
    image: '/images/cadena-distribucion.jpg',
    category: 'car',
    subcategory: 'Motor',
    brand: 'Gates',
    stock: 25,
    rating: 4.4,
    reviews: 78,
    specifications: [
      { name: 'Material', value: 'Acero endurecido' },
      { name: 'Incluye', value: 'Cadena, tensor, guías' },
      { name: 'Garantía', value: '2 años' }
    ],
    compatibleVehicles: ['BMW', 'Mercedes', 'Audi', 'Volkswagen']
  },
  {
    id: '7',
    name: 'Espejo Retrovisor Moto',
    description: 'Espejo retrovisor universal para motocicletas con montaje ajustable.',
    price: 28.50,
    image: '/images/espejo-moto.jpg',
    category: 'motorcycle',
    subcategory: 'Accesorios',
    brand: 'Kuryakyn',
    stock: 45,
    rating: 4.2,
    reviews: 56,
    specifications: [
      { name: 'Material', value: 'Aluminio' },
      { name: 'Tamaño', value: '3 pulgadas' },
      { name: 'Montaje', value: 'Universal' }
    ],
    compatibleVehicles: ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Harley-Davidson']
  },
  {
    id: '8',
    name: 'Filtro de Aire Cabina',
    description: 'Filtro de aire para cabina de camión con carbón activado para eliminar olores.',
    price: 65.00,
    image: '/images/filtro-aire-cabina.jpg',
    category: 'truck',
    subcategory: 'Filtros',
    brand: 'Donaldson',
    stock: 18,
    rating: 4.5,
    reviews: 42,
    specifications: [
      { name: 'Tipo', value: 'Carbón activado' },
      { name: 'Duración', value: '15,000 km' },
      { name: 'Filtración', value: '99.9%' }
    ],
    compatibleVehicles: ['Freightliner', 'Kenworth', 'Peterbilt', 'Volvo', 'Mack']
  }
];

export const categories = [
  {
    id: 'car',
    name: 'Automóviles',
    icon: '🚗',
    description: 'Repuestos para autos y vehículos ligeros',
    productCount: 45
  },
  {
    id: 'motorcycle',
    name: 'Motocicletas',
    icon: '🏍️',
    description: 'Repuestos para motos y scooters',
    productCount: 32
  },
  {
    id: 'truck',
    name: 'Camiones',
    icon: '🚛',
    description: 'Repuestos para camiones y vehículos pesados',
    productCount: 28
  }
]; 