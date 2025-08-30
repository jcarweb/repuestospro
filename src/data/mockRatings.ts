export interface Rating {
  _id: string;
  orderId: string;
  deliveryId: string;
  customerId: string;
  rating: number;
  comment?: string;
  type: 'customer_to_delivery' | 'delivery_to_customer';
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
  recentRatings: Rating[];
}

// Datos de prueba para calificaciones
export const mockRatings: Rating[] = [
  {
    _id: 'rating_001',
    orderId: 'order_001',
    deliveryId: 'delivery_001',
    customerId: 'customer_001',
    rating: 5,
    comment: 'Excelente servicio, muy rápido y profesional. El delivery fue muy amable y llegó antes de lo esperado.',
    type: 'customer_to_delivery',
    createdAt: new Date('2024-01-15T14:30:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z')
  },
  {
    _id: 'rating_002',
    orderId: 'order_002',
    deliveryId: 'delivery_001',
    customerId: 'customer_002',
    rating: 4,
    comment: 'Buen servicio, llegó a tiempo. El producto estaba en perfectas condiciones.',
    type: 'customer_to_delivery',
    createdAt: new Date('2024-01-14T16:45:00Z'),
    updatedAt: new Date('2024-01-14T16:45:00Z')
  },
  {
    _id: 'rating_003',
    orderId: 'order_003',
    deliveryId: 'delivery_002',
    customerId: 'customer_003',
    rating: 3,
    comment: 'Servicio regular. Llegó un poco tarde pero el producto estaba bien.',
    type: 'customer_to_delivery',
    createdAt: new Date('2024-01-13T12:20:00Z'),
    updatedAt: new Date('2024-01-13T12:20:00Z')
  },
  {
    _id: 'rating_004',
    orderId: 'order_004',
    deliveryId: 'delivery_002',
    customerId: 'customer_004',
    rating: 5,
    comment: '¡Excelente! Muy profesional y rápido. Definitivamente lo recomiendo.',
    type: 'customer_to_delivery',
    createdAt: new Date('2024-01-12T18:15:00Z'),
    updatedAt: new Date('2024-01-12T18:15:00Z')
  },
  {
    _id: 'rating_005',
    orderId: 'order_005',
    deliveryId: 'delivery_003',
    customerId: 'customer_005',
    rating: 2,
    comment: 'Llegó muy tarde y no fue muy amable. El producto estaba bien pero la experiencia no fue buena.',
    type: 'customer_to_delivery',
    createdAt: new Date('2024-01-11T20:30:00Z'),
    updatedAt: new Date('2024-01-11T20:30:00Z')
  },
  {
    _id: 'rating_006',
    orderId: 'order_001',
    deliveryId: 'delivery_001',
    customerId: 'customer_001',
    rating: 4,
    comment: 'Cliente muy amable y cooperativo. Dirección clara y fácil de encontrar.',
    type: 'delivery_to_customer',
    createdAt: new Date('2024-01-15T14:35:00Z'),
    updatedAt: new Date('2024-01-15T14:35:00Z')
  },
  {
    _id: 'rating_007',
    orderId: 'order_002',
    deliveryId: 'delivery_001',
    customerId: 'customer_002',
    rating: 5,
    comment: 'Excelente cliente. Muy puntual y amable. La entrega fue muy fluida.',
    type: 'delivery_to_customer',
    createdAt: new Date('2024-01-14T16:50:00Z'),
    updatedAt: new Date('2024-01-14T16:50:00Z')
  },
  {
    _id: 'rating_008',
    orderId: 'order_003',
    deliveryId: 'delivery_002',
    customerId: 'customer_003',
    rating: 3,
    comment: 'Cliente regular. No estaba disponible cuando llegué, tuve que esperar.',
    type: 'delivery_to_customer',
    createdAt: new Date('2024-01-13T12:25:00Z'),
    updatedAt: new Date('2024-01-13T12:25:00Z')
  },
  {
    _id: 'rating_009',
    orderId: 'order_004',
    deliveryId: 'delivery_002',
    customerId: 'customer_004',
    rating: 5,
    comment: 'Cliente excepcional. Muy organizado y puntual. La entrega fue perfecta.',
    type: 'delivery_to_customer',
    createdAt: new Date('2024-01-12T18:20:00Z'),
    updatedAt: new Date('2024-01-12T18:20:00Z')
  },
  {
    _id: 'rating_010',
    orderId: 'order_005',
    deliveryId: 'delivery_003',
    customerId: 'customer_005',
    rating: 2,
    comment: 'Cliente difícil. No respondía llamadas y la dirección no era clara.',
    type: 'delivery_to_customer',
    createdAt: new Date('2024-01-11T20:35:00Z'),
    updatedAt: new Date('2024-01-11T20:35:00Z')
  }
];

// Función para obtener estadísticas de calificaciones
export const getRatingStats = (deliveryId?: string, type?: 'customer_to_delivery' | 'delivery_to_customer'): RatingStats => {
  let filteredRatings = mockRatings;

  if (deliveryId) {
    filteredRatings = filteredRatings.filter(rating => rating.deliveryId === deliveryId);
  }

  if (type) {
    filteredRatings = filteredRatings.filter(rating => rating.type === type);
  }

  const totalRatings = filteredRatings.length;
  const averageRating = totalRatings > 0 
    ? filteredRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
    : 0;

  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  filteredRatings.forEach(rating => {
    ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
  });

  const recentRatings = filteredRatings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    averageRating,
    totalRatings,
    ratingDistribution,
    recentRatings
  };
};

// Función para obtener calificaciones por delivery
export const getDeliveryRatings = (deliveryId: string): Rating[] => {
  return mockRatings.filter(rating => 
    rating.deliveryId === deliveryId && rating.type === 'customer_to_delivery'
  );
};

// Función para obtener calificaciones por cliente
export const getCustomerRatings = (customerId: string): Rating[] => {
  return mockRatings.filter(rating => 
    rating.customerId === customerId && rating.type === 'delivery_to_customer'
  );
};

// Función para obtener calificaciones de un pedido específico
export const getOrderRatings = (orderId: string): Rating[] => {
  return mockRatings.filter(rating => rating.orderId === orderId);
};

// Función para crear una nueva calificación
export const createRating = (ratingData: Omit<Rating, '_id' | 'createdAt' | 'updatedAt'>): Rating => {
  const newRating: Rating = {
    ...ratingData,
    _id: `rating_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // En una implementación real, esto se guardaría en la base de datos
  mockRatings.push(newRating);
  
  return newRating;
};

// Función para obtener estadísticas comparativas (período anterior)
export const getRatingComparison = (deliveryId?: string, type?: 'customer_to_delivery' | 'delivery_to_customer') => {
  const currentStats = getRatingStats(deliveryId, type);
  
  // Simular datos del período anterior (últimos 30 días vs 30 días anteriores)
  const previousStats: RatingStats = {
    averageRating: currentStats.averageRating + (Math.random() - 0.5) * 0.5, // Variación aleatoria
    totalRatings: Math.floor(currentStats.totalRatings * 0.8), // 80% del período actual
    ratingDistribution: {
      1: Math.floor((currentStats.ratingDistribution[1] || 0) * 0.8),
      2: Math.floor((currentStats.ratingDistribution[2] || 0) * 0.8),
      3: Math.floor((currentStats.ratingDistribution[3] || 0) * 0.8),
      4: Math.floor((currentStats.ratingDistribution[4] || 0) * 0.8),
      5: Math.floor((currentStats.ratingDistribution[5] || 0) * 0.8)
    },
    recentRatings: []
  };

  return {
    current: currentStats,
    previous: previousStats
  };
};
