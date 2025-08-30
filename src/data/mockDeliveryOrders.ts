export interface DeliveryOrder {
  _id: string;
  orderId: string;
  storeId: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    storeName: string;
  };
  deliveryLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    customerName: string;
    customerPhone: string;
    instructions?: string;
  };
  deliveryFee: number;
  riderPayment: number;
  trackingCode: string;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      image: string;
      sku: string;
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const mockDeliveryOrders: DeliveryOrder[] = [
  {
    _id: '1',
    orderId: 'ORD-2024-001',
    storeId: {
      _id: 'store1',
      name: 'Auto Parts Express',
      address: 'Av. Principal 123, Caracas',
      phone: '+58 212-555-0101'
    },
    customerId: {
      _id: 'customer1',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+58 412-555-0101'
    },
    status: 'assigned',
    pickupLocation: {
      address: 'Av. Principal 123, Caracas, Venezuela',
      coordinates: { lat: 10.4806, lng: -66.9036 },
      storeName: 'Auto Parts Express'
    },
    deliveryLocation: {
      address: 'Calle Los Rosales 45, Caracas, Venezuela',
      coordinates: { lat: 10.4900, lng: -66.9100 },
      customerName: 'María González',
      customerPhone: '+58 412-555-0101',
      instructions: 'Entregar en la portería del edificio'
    },
    deliveryFee: 5.00,
    riderPayment: 8.00,
    trackingCode: 'TRK-001-2024',
    estimatedPickupTime: '2024-01-15T10:00:00Z',
    estimatedDeliveryTime: '2024-01-15T11:30:00Z',
    items: [
      {
        productId: {
          _id: 'prod1',
          name: 'Filtro de Aceite Motorcraft',
          image: '/images/products/filter1.jpg',
          sku: 'FLT-001'
        },
        quantity: 2,
        price: 15.00
      }
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },
  {
    _id: '2',
    orderId: 'ORD-2024-002',
    storeId: {
      _id: 'store2',
      name: 'Repuestos Rápidos',
      address: 'Calle Comercial 456, Caracas',
      phone: '+58 212-555-0202'
    },
    customerId: {
      _id: 'customer2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+58 414-555-0202'
    },
    status: 'accepted',
    pickupLocation: {
      address: 'Calle Comercial 456, Caracas, Venezuela',
      coordinates: { lat: 10.4700, lng: -66.8900 },
      storeName: 'Repuestos Rápidos'
    },
    deliveryLocation: {
      address: 'Urbanización El Bosque 78, Caracas, Venezuela',
      coordinates: { lat: 10.4800, lng: -66.9000 },
      customerName: 'Carlos Rodríguez',
      customerPhone: '+58 414-555-0202',
      instructions: 'Llamar antes de llegar'
    },
    deliveryFee: 6.50,
    riderPayment: 10.00,
    trackingCode: 'TRK-002-2024',
    estimatedPickupTime: '2024-01-15T14:00:00Z',
    estimatedDeliveryTime: '2024-01-15T15:30:00Z',
    actualPickupTime: '2024-01-15T14:15:00Z',
    items: [
      {
        productId: {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          image: '/images/products/brakes1.jpg',
          sku: 'BRK-001'
        },
        quantity: 1,
        price: 45.00
      },
      {
        productId: {
          _id: 'prod3',
          name: 'Líquido de Frenos DOT4',
          image: '/images/products/brake-fluid.jpg',
          sku: 'FLD-001'
        },
        quantity: 1,
        price: 12.00
      }
    ],
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T14:15:00Z'
  },
  {
    _id: '3',
    orderId: 'ORD-2024-003',
    storeId: {
      _id: 'store3',
      name: 'Auto Supply Center',
      address: 'Plaza Mayor 789, Caracas',
      phone: '+58 212-555-0303'
    },
    customerId: {
      _id: 'customer3',
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+58 416-555-0303'
    },
    status: 'picked_up',
    pickupLocation: {
      address: 'Plaza Mayor 789, Caracas, Venezuela',
      coordinates: { lat: 10.4600, lng: -66.8700 },
      storeName: 'Auto Supply Center'
    },
    deliveryLocation: {
      address: 'Residencial Los Cedros 12, Caracas, Venezuela',
      coordinates: { lat: 10.4700, lng: -66.8800 },
      customerName: 'Ana Martínez',
      customerPhone: '+58 416-555-0303',
      instructions: 'Entregar en el apartamento 5B'
    },
    deliveryFee: 4.50,
    riderPayment: 7.50,
    trackingCode: 'TRK-003-2024',
    estimatedPickupTime: '2024-01-15T16:00:00Z',
    estimatedDeliveryTime: '2024-01-15T17:00:00Z',
    actualPickupTime: '2024-01-15T16:10:00Z',
    items: [
      {
        productId: {
          _id: 'prod4',
          name: 'Batería Automotriz 12V 60Ah',
          image: '/images/products/battery1.jpg',
          sku: 'BAT-001'
        },
        quantity: 1,
        price: 120.00
      }
    ],
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-15T16:10:00Z'
  },
  {
    _id: '4',
    orderId: 'ORD-2024-004',
    storeId: {
      _id: 'store1',
      name: 'Auto Parts Express',
      address: 'Av. Principal 123, Caracas',
      phone: '+58 212-555-0101'
    },
    customerId: {
      _id: 'customer4',
      name: 'Luis Pérez',
      email: 'luis.perez@email.com',
      phone: '+58 418-555-0404'
    },
    status: 'in_transit',
    pickupLocation: {
      address: 'Av. Principal 123, Caracas, Venezuela',
      coordinates: { lat: 10.4806, lng: -66.9036 },
      storeName: 'Auto Parts Express'
    },
    deliveryLocation: {
      address: 'Centro Comercial Galerías 34, Caracas, Venezuela',
      coordinates: { lat: 10.4900, lng: -66.9200 },
      customerName: 'Luis Pérez',
      customerPhone: '+58 418-555-0404',
      instructions: 'Entregar en el estacionamiento del centro comercial'
    },
    deliveryFee: 7.00,
    riderPayment: 11.00,
    trackingCode: 'TRK-004-2024',
    estimatedPickupTime: '2024-01-15T18:00:00Z',
    estimatedDeliveryTime: '2024-01-15T19:00:00Z',
    actualPickupTime: '2024-01-15T18:05:00Z',
    items: [
      {
        productId: {
          _id: 'prod5',
          name: 'Aceite de Motor 5W-30 Sintético',
          image: '/images/products/oil1.jpg',
          sku: 'OIL-001'
        },
        quantity: 4,
        price: 18.00
      },
      {
        productId: {
          _id: 'prod6',
          name: 'Filtro de Aire Motorcraft',
          image: '/images/products/air-filter.jpg',
          sku: 'AIR-001'
        },
        quantity: 1,
        price: 22.00
      }
    ],
    createdAt: '2024-01-15T17:00:00Z',
    updatedAt: '2024-01-15T18:05:00Z'
  },
  {
    _id: '5',
    orderId: 'ORD-2024-005',
    storeId: {
      _id: 'store2',
      name: 'Repuestos Rápidos',
      address: 'Calle Comercial 456, Caracas',
      phone: '+58 212-555-0202'
    },
    customerId: {
      _id: 'customer5',
      name: 'Patricia López',
      email: 'patricia.lopez@email.com',
      phone: '+58 420-555-0505'
    },
    status: 'delivered',
    pickupLocation: {
      address: 'Calle Comercial 456, Caracas, Venezuela',
      coordinates: { lat: 10.4700, lng: -66.8900 },
      storeName: 'Repuestos Rápidos'
    },
    deliveryLocation: {
      address: 'Conjunto Residencial El Paraíso 67, Caracas, Venezuela',
      coordinates: { lat: 10.5000, lng: -66.9300 },
      customerName: 'Patricia López',
      customerPhone: '+58 420-555-0505',
      instructions: 'Entregar en la recepción'
    },
    deliveryFee: 8.00,
    riderPayment: 12.00,
    trackingCode: 'TRK-005-2024',
    estimatedPickupTime: '2024-01-15T12:00:00Z',
    estimatedDeliveryTime: '2024-01-15T13:30:00Z',
    actualPickupTime: '2024-01-15T12:10:00Z',
    actualDeliveryTime: '2024-01-15T13:25:00Z',
    items: [
      {
        productId: {
          _id: 'prod7',
          name: 'Kit de Embrague Completo',
          image: '/images/products/clutch-kit.jpg',
          sku: 'CLT-001'
        },
        quantity: 1,
        price: 180.00
      }
    ],
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T13:25:00Z'
  },
  {
    _id: '6',
    orderId: 'ORD-2024-006',
    storeId: {
      _id: 'store3',
      name: 'Auto Supply Center',
      address: 'Plaza Mayor 789, Caracas',
      phone: '+58 212-555-0303'
    },
    customerId: {
      _id: 'customer6',
      name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+58 422-555-0606'
    },
    status: 'pending',
    pickupLocation: {
      address: 'Plaza Mayor 789, Caracas, Venezuela',
      coordinates: { lat: 10.4600, lng: -66.8700 },
      storeName: 'Auto Supply Center'
    },
    deliveryLocation: {
      address: 'Zona Industrial La Yaguara 89, Caracas, Venezuela',
      coordinates: { lat: 10.4500, lng: -66.8500 },
      customerName: 'Roberto Silva',
      customerPhone: '+58 422-555-0606',
      instructions: 'Entregar en el área de recepción de la empresa'
    },
    deliveryFee: 9.00,
    riderPayment: 14.00,
    trackingCode: 'TRK-006-2024',
    estimatedPickupTime: '2024-01-15T20:00:00Z',
    estimatedDeliveryTime: '2024-01-15T21:00:00Z',
    items: [
      {
        productId: {
          _id: 'prod8',
          name: 'Radiador de Motor Universal',
          image: '/images/products/radiator.jpg',
          sku: 'RAD-001'
        },
        quantity: 1,
        price: 95.00
      },
      {
        productId: {
          _id: 'prod9',
          name: 'Líquido Refrigerante Verde',
          image: '/images/products/coolant.jpg',
          sku: 'CLD-001'
        },
        quantity: 2,
        price: 15.00
      }
    ],
    createdAt: '2024-01-15T19:00:00Z',
    updatedAt: '2024-01-15T19:00:00Z'
  }
];

export const getMockDeliveryOrders = (): DeliveryOrder[] => {
  return mockDeliveryOrders;
};

export const getMockDeliveryOrdersByStatus = (status: string): DeliveryOrder[] => {
  if (status === 'all') {
    return mockDeliveryOrders;
  }
  return mockDeliveryOrders.filter(order => order.status === status);
};

export const getMockDeliveryOrderById = (id: string): DeliveryOrder | undefined => {
  return mockDeliveryOrders.find(order => order._id === id);
};

// Datos de prueba para reportes de entrega
export const mockDeliveryReports = [
  {
    _id: 'report_001',
    orderId: 'order_001',
    deliveryId: 'delivery_001',
    status: 'completed',
    reportType: 'delivery_completed',
    timestamp: new Date('2024-01-15T14:30:00Z'),
    customerSignature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9ImdyYXkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpcm1hIGRlbCBDbGllbnRlPC90ZXh0Pgo8L3N2Zz4K',
    deliveryPhoto: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
    notes: 'Entrega exitosa. Cliente muy satisfecho con el servicio.',
    issueType: null,
    issueDescription: null,
    deliveryTime: 25, // minutos
    distance: 8.5, // km
    fuelConsumption: 0.8, // litros
    earnings: 15.50,
    customerRating: 5,
    customerFeedback: 'Excelente servicio, muy rápido y profesional.'
  },
  {
    _id: 'report_002',
    orderId: 'order_002',
    deliveryId: 'delivery_002',
    status: 'failed',
    reportType: 'delivery_failed',
    timestamp: new Date('2024-01-15T16:45:00Z'),
    customerSignature: null,
    deliveryPhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
    notes: 'Cliente no disponible en la dirección especificada.',
    issueType: 'customer_not_available',
    issueDescription: 'Cliente no respondió llamadas ni mensajes. Dirección correcta pero no hay nadie en casa.',
    deliveryTime: 35,
    distance: 12.0,
    fuelConsumption: 1.2,
    earnings: 8.00,
    customerRating: null,
    customerFeedback: null
  },
  {
    _id: 'report_003',
    orderId: 'order_003',
    deliveryId: 'delivery_003',
    status: 'completed',
    reportType: 'delivery_completed',
    timestamp: new Date('2024-01-15T18:20:00Z'),
    customerSignature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9ImdyYXkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpcm1hIGRlbCBDbGllbnRlPC90ZXh0Pgo8L3N2Zz4K',
    deliveryPhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    notes: 'Entrega realizada con éxito. Cliente solicitó entrega en la puerta.',
    issueType: null,
    issueDescription: null,
    deliveryTime: 18,
    distance: 5.2,
    fuelConsumption: 0.5,
    earnings: 12.00,
    customerRating: 4,
    customerFeedback: 'Buen servicio, pero tardó un poco más de lo esperado.'
  },
  {
    _id: 'report_004',
    orderId: 'order_004',
    deliveryId: 'delivery_004',
    status: 'failed',
    reportType: 'delivery_failed',
    timestamp: new Date('2024-01-15T19:15:00Z'),
    customerSignature: null,
    deliveryPhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
    notes: 'Dirección incorrecta proporcionada por el cliente.',
    issueType: 'wrong_address',
    issueDescription: 'La dirección en el pedido no existe. Cliente proporcionó dirección incorrecta.',
    deliveryTime: 45,
    distance: 15.8,
    fuelConsumption: 1.5,
    earnings: 5.00,
    customerRating: null,
    customerFeedback: null
  },
  {
    _id: 'report_005',
    orderId: 'order_005',
    deliveryId: 'delivery_005',
    status: 'completed',
    reportType: 'delivery_completed',
    timestamp: new Date('2024-01-15T20:30:00Z'),
    customerSignature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9ImdyYXkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpcm1hIGRlbCBDbGllbnRlPC90ZXh0Pgo8L3N2Zz4K',
    deliveryPhoto: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
    notes: 'Entrega exitosa. Cliente muy amable y agradecido.',
    issueType: null,
    issueDescription: null,
    deliveryTime: 22,
    distance: 7.3,
    fuelConsumption: 0.7,
    earnings: 14.00,
    customerRating: 5,
    customerFeedback: 'Servicio excepcional. Muy puntual y profesional.'
  }
];

// Tipos de problemas para reportes
export const issueTypes = [
  { value: 'customer_not_available', label: 'Cliente No Disponible' },
  { value: 'wrong_address', label: 'Dirección Incorrecta' },
  { value: 'package_damaged', label: 'Paquete Dañado' },
  { value: 'customer_refused', label: 'Cliente Rechazó' },
  { value: 'payment_issue', label: 'Problema de Pago' },
  { value: 'weather_issue', label: 'Problema Climático' },
  { value: 'traffic_issue', label: 'Problema de Tráfico' },
  { value: 'vehicle_issue', label: 'Problema del Vehículo' },
  { value: 'other', label: 'Otro' }
];

// Función para obtener reportes por estado
export const getDeliveryReportsByStatus = (status: string) => {
  return mockDeliveryReports.filter(report => report.status === status);
};

// Función para obtener estadísticas de hoy
export const getTodayStats = () => {
  const today = new Date();
  const todayReports = mockDeliveryReports.filter(report => {
    const reportDate = new Date(report.timestamp);
    return reportDate.toDateString() === today.toDateString();
  });

  return {
    completed: todayReports.filter(r => r.status === 'completed').length,
    failed: todayReports.filter(r => r.status === 'failed').length,
    totalEarnings: todayReports.reduce((sum, r) => sum + r.earnings, 0),
    avgDeliveryTime: todayReports.length > 0 
      ? todayReports.reduce((sum, r) => sum + r.deliveryTime, 0) / todayReports.length 
      : 0,
    totalDistance: todayReports.reduce((sum, r) => sum + r.distance, 0)
  };
};

// Función para obtener estadísticas semanales
export const getWeeklyStats = () => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyReports = mockDeliveryReports.filter(report => {
    const reportDate = new Date(report.timestamp);
    return reportDate >= weekAgo && reportDate <= today;
  });

  return {
    completed: weeklyReports.filter(r => r.status === 'completed').length,
    failed: weeklyReports.filter(r => r.status === 'failed').length,
    totalEarnings: weeklyReports.reduce((sum, r) => sum + r.earnings, 0),
    avgDeliveryTime: weeklyReports.length > 0 
      ? weeklyReports.reduce((sum, r) => sum + r.deliveryTime, 0) / weeklyReports.length 
      : 0,
    totalDistance: weeklyReports.reduce((sum, r) => sum + r.distance, 0)
  };
};

// Función para generar reporte de entrega
export const generateDeliveryReport = (orderId: string, reportData: any) => {
  const newReport = {
    _id: `report_${Date.now()}`,
    orderId,
    deliveryId: 'delivery_current',
    status: reportData.status,
    reportType: reportData.reportType,
    timestamp: new Date(),
    customerSignature: reportData.customerSignature || null,
    deliveryPhoto: reportData.deliveryPhoto || null,
    notes: reportData.notes || '',
    issueType: reportData.issueType || null,
    issueDescription: reportData.issueDescription || null,
    deliveryTime: reportData.deliveryTime || 0,
    distance: reportData.distance || 0,
    fuelConsumption: reportData.fuelConsumption || 0,
    earnings: reportData.earnings || 0,
    customerRating: reportData.customerRating || null,
    customerFeedback: reportData.customerFeedback || null
  };

  // En una aplicación real, aquí se enviaría al backend
  console.log('Nuevo reporte generado:', newReport);
  return newReport;
};
