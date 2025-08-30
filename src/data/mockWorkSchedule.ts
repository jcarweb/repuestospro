export interface WorkShift {
  _id: string;
  deliveryId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  startTime: string; // formato "HH:MM"
  endTime: string; // formato "HH:MM"
  isActive: boolean;
  breakStart?: string;
  breakEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  _id: string;
  deliveryId: string;
  weekStart: Date;
  weekEnd: Date;
  shifts: WorkShift[];
  totalHours: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityStatus {
  _id: string;
  deliveryId: string;
  date: Date;
  status: 'available' | 'busy' | 'offline' | 'break';
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOffRequest {
  _id: string;
  deliveryId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Datos de prueba para horarios de trabajo
export const mockWorkShifts: WorkShift[] = [
  {
    _id: 'shift_001',
    deliveryId: 'delivery_001',
    dayOfWeek: 1, // Lunes
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_002',
    deliveryId: 'delivery_001',
    dayOfWeek: 2, // Martes
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_003',
    deliveryId: 'delivery_001',
    dayOfWeek: 3, // Miércoles
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_004',
    deliveryId: 'delivery_001',
    dayOfWeek: 4, // Jueves
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_005',
    deliveryId: 'delivery_001',
    dayOfWeek: 5, // Viernes
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_006',
    deliveryId: 'delivery_001',
    dayOfWeek: 6, // Sábado
    startTime: '09:00',
    endTime: '15:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '12:30',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: 'shift_007',
    deliveryId: 'delivery_001',
    dayOfWeek: 0, // Domingo
    startTime: '10:00',
    endTime: '14:00',
    isActive: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
];

// Datos de prueba para horarios semanales
export const mockWorkSchedules: WorkSchedule[] = [
  {
    _id: 'schedule_001',
    deliveryId: 'delivery_001',
    weekStart: new Date('2024-01-15T00:00:00Z'),
    weekEnd: new Date('2024-01-21T23:59:59Z'),
    shifts: mockWorkShifts.filter(s => s.isActive),
    totalHours: 42,
    status: 'active',
    createdAt: new Date('2024-01-14T00:00:00Z'),
    updatedAt: new Date('2024-01-14T00:00:00Z')
  }
];

// Datos de prueba para estados de disponibilidad
export const mockAvailabilityStatus: AvailabilityStatus[] = [
  {
    _id: 'availability_001',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-15T00:00:00Z'),
    status: 'available',
    startTime: '08:00',
    endTime: '17:00',
    notes: 'Horario normal de trabajo',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    _id: 'availability_002',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-16T00:00:00Z'),
    status: 'busy',
    startTime: '08:00',
    endTime: '17:00',
    notes: 'Muchos pedidos pendientes',
    createdAt: new Date('2024-01-16T08:00:00Z'),
    updatedAt: new Date('2024-01-16T10:30:00Z')
  },
  {
    _id: 'availability_003',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-17T00:00:00Z'),
    status: 'break',
    startTime: '12:00',
    endTime: '13:00',
    notes: 'Pausa para almuerzo',
    createdAt: new Date('2024-01-17T12:00:00Z'),
    updatedAt: new Date('2024-01-17T12:00:00Z')
  }
];

// Datos de prueba para solicitudes de tiempo libre
export const mockTimeOffRequests: TimeOffRequest[] = [
  {
    _id: 'timeoff_001',
    deliveryId: 'delivery_001',
    startDate: new Date('2024-01-25T00:00:00Z'),
    endDate: new Date('2024-01-26T23:59:59Z'),
    reason: 'Cita médica',
    status: 'approved',
    approvedBy: 'admin_001',
    approvedAt: new Date('2024-01-20T10:00:00Z'),
    createdAt: new Date('2024-01-18T14:30:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
  },
  {
    _id: 'timeoff_002',
    deliveryId: 'delivery_001',
    startDate: new Date('2024-02-10T00:00:00Z'),
    endDate: new Date('2024-02-12T23:59:59Z'),
    reason: 'Vacaciones familiares',
    status: 'pending',
    createdAt: new Date('2024-01-22T16:45:00Z'),
    updatedAt: new Date('2024-01-22T16:45:00Z')
  }
];

// Funciones de utilidad
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek];
};

export const getDayNameShort = (dayOfWeek: number): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayOfWeek];
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const calculateShiftHours = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  let minutes = endMin - startMin;
  
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  
  return hours + minutes / 60;
};

export const getCurrentWeekSchedule = (deliveryId: string): WorkSchedule | null => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const schedule = mockWorkSchedules.find(s => 
    s.deliveryId === deliveryId && 
    s.weekStart <= today && 
    s.weekEnd >= today
  );
  
  if (schedule) return schedule;
  
  // Crear horario por defecto si no existe
  const defaultShifts = mockWorkShifts.filter(s => s.deliveryId === deliveryId && s.isActive);
  const totalHours = defaultShifts.reduce((total, shift) => {
    return total + calculateShiftHours(shift.startTime, shift.endTime);
  }, 0);
  
  return {
    _id: `schedule_${Date.now()}`,
    deliveryId,
    weekStart,
    weekEnd,
    shifts: defaultShifts,
    totalHours,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const getTodayShift = (deliveryId: string): WorkShift | null => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return mockWorkShifts.find(s => s.deliveryId === deliveryId && s.dayOfWeek === dayOfWeek && s.isActive) || null;
};

export const getCurrentAvailability = (deliveryId: string): AvailabilityStatus | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockAvailabilityStatus.find(a => 
    a.deliveryId === deliveryId && 
    a.date.getTime() === today.getTime()
  ) || null;
};

export const updateAvailabilityStatus = (
  deliveryId: string, 
  status: 'available' | 'busy' | 'offline' | 'break',
  notes?: string
): AvailabilityStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existing = mockAvailabilityStatus.find(a => 
    a.deliveryId === deliveryId && 
    a.date.getTime() === today.getTime()
  );
  
  if (existing) {
    existing.status = status;
    existing.notes = notes;
    existing.updatedAt = new Date();
    return existing;
  }
  
  const newStatus: AvailabilityStatus = {
    _id: `availability_${Date.now()}`,
    deliveryId,
    date: today,
    status,
    notes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockAvailabilityStatus.push(newStatus);
  return newStatus;
};

export const createTimeOffRequest = (
  deliveryId: string,
  startDate: Date,
  endDate: Date,
  reason: string
): TimeOffRequest => {
  const request: TimeOffRequest = {
    _id: `timeoff_${Date.now()}`,
    deliveryId,
    startDate,
    endDate,
    reason,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockTimeOffRequests.push(request);
  return request;
};

export const getPendingTimeOffRequests = (deliveryId: string): TimeOffRequest[] => {
  return mockTimeOffRequests.filter(r => r.deliveryId === deliveryId && r.status === 'pending');
};

export const getApprovedTimeOffRequests = (deliveryId: string): TimeOffRequest[] => {
  return mockTimeOffRequests.filter(r => r.deliveryId === deliveryId && r.status === 'approved');
};

export const getWeeklyStats = (deliveryId: string) => {
  const schedule = getCurrentWeekSchedule(deliveryId);
  if (!schedule) return null;
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayShift = schedule.shifts.find(s => s.dayOfWeek === dayOfWeek);
  
  const totalDays = schedule.shifts.length;
  const totalHours = schedule.totalHours;
  const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
  
  return {
    totalDays,
    totalHours,
    averageHoursPerDay,
    todayShift,
    isWorkingToday: !!todayShift,
    currentStatus: getCurrentAvailability(deliveryId)?.status || 'offline'
  };
};
