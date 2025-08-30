import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Calendar, 
  Clock, 
  Coffee, 
  Wifi, 
  WifiOff, 
  Plus, 
  RefreshCw,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import WeeklySchedule from '../components/WeeklySchedule';
import AvailabilityControl from '../components/AvailabilityControl';
import { 
  mockWorkShifts,
  mockAvailabilityStatus,
  mockTimeOffRequests,
  getCurrentWeekSchedule,
  getCurrentAvailability,
  updateAvailabilityStatus,
  createTimeOffRequest,
  getPendingTimeOffRequests,
  getApprovedTimeOffRequests,
  getWeeklyStats,
  type WorkShift,
  type AvailabilityStatus,
  type TimeOffRequest
} from '../data/mockWorkSchedule';

const DeliverySchedule: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability' | 'timeOff'>('schedule');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [currentAvailability, setCurrentAvailability] = useState<AvailabilityStatus | null>(null);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  
  // Estados para modales
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  
  // Estados para formularios
  const [timeOffForm, setTimeOffForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [shiftForm, setShiftForm] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '17:00',
    breakStart: '',
    breakEnd: '',
    isActive: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadScheduleData();
  }, [currentWeek]);

  const loadScheduleData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deliveryId = 'delivery_001';
      const weekSchedule = getCurrentWeekSchedule(deliveryId);
      const availability = getCurrentAvailability(deliveryId);
      const requests = [...getPendingTimeOffRequests(deliveryId), ...getApprovedTimeOffRequests(deliveryId)];
      const stats = getWeeklyStats(deliveryId);
      
      setShifts(weekSchedule?.shifts || mockWorkShifts.filter(s => s.deliveryId === deliveryId));
      setCurrentAvailability(availability);
      setTimeOffRequests(requests);
      setWeeklyStats(stats);
      
    } catch (error) {
      console.error('Error loading schedule data:', error);
    }
  };

  const handleAvailabilityChange = (status: 'available' | 'busy' | 'offline' | 'break', notes?: string) => {
    const deliveryId = 'delivery_001';
    const newStatus = updateAvailabilityStatus(deliveryId, status, notes);
    setCurrentAvailability(newStatus);
  };

  const handleSubmitTimeOff = () => {
    if (!timeOffForm.startDate || !timeOffForm.endDate || !timeOffForm.reason) {
      alert('Por favor completa todos los campos');
      return;
    }

    const deliveryId = 'delivery_001';
    const newRequest = createTimeOffRequest(
      deliveryId,
      new Date(timeOffForm.startDate),
      new Date(timeOffForm.endDate),
      timeOffForm.reason
    );

    setTimeOffRequests([...timeOffRequests, newRequest]);
    setTimeOffForm({ startDate: '', endDate: '', reason: '' });
    setShowTimeOffModal(false);
    
    alert(t('schedule.requestSubmitted'));
  };

  const handleEditShift = (shift: WorkShift) => {
    setEditingShift(shift);
    setShiftForm({
      dayOfWeek: shift.dayOfWeek,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakStart: shift.breakStart || '',
      breakEnd: shift.breakEnd || '',
      isActive: shift.isActive
    });
    setShowShiftModal(true);
  };

  const handleSaveShift = () => {
    if (editingShift) {
      const updatedShifts = shifts.map(s => 
        s._id === editingShift._id 
          ? { ...s, ...shiftForm }
          : s
      );
      setShifts(updatedShifts);
    } else {
      const newShift: WorkShift = {
        _id: `shift_${Date.now()}`,
        deliveryId: 'delivery_001',
        ...shiftForm,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setShifts([...shifts, newShift]);
    }
    
    setShowShiftModal(false);
    setEditingShift(null);
    setShiftForm({
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '17:00',
      breakStart: '',
      breakEnd: '',
      isActive: true
    });
  };

  const handleDeleteShift = (shiftId: string) => {
    if (confirm(t('schedule.confirmDelete'))) {
      setShifts(shifts.filter(s => s._id !== shiftId));
    }
  };

  const handleToggleShift = (shiftId: string) => {
    setShifts(shifts.map(s => 
      s._id === shiftId 
        ? { ...s, isActive: !s.isActive }
        : s
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 dark:text-orange-400';
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'rejected': return 'text-alert-600 dark:text-alert-400';
      default: return 'text-carbon-600 dark:text-carbon-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {t('schedule.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('schedule.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadScheduleData}
            className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button className="px-4 py-2 bg-carbon-600 text-snow-500 rounded-lg hover:bg-carbon-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="px-4 py-2 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {weeklyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="flex items-center">
              <div className="p-2 bg-racing-100 dark:bg-racing-900 rounded-lg">
                <Calendar className="h-6 w-6 text-racing-600 dark:text-racing-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                  {t('schedule.workingDays')}
                </p>
                <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                  {weeklyStats.totalDays}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                  {t('schedule.totalHours')}
                </p>
                <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                  {weeklyStats.totalHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                  Estado Actual
                </p>
                <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                  {t(`schedule.status.${weeklyStats.currentStatus}`)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                  Solicitudes Pendientes
                </p>
                <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                  {timeOffRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación de pestañas */}
      <div className="border-b border-carbon-200 dark:border-carbon-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            {t('schedule.weeklySchedule')}
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'availability'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <Wifi className="h-4 w-4 inline mr-2" />
            {t('schedule.availability')}
          </button>
          <button
            onClick={() => setActiveTab('timeOff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeOff'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <CalendarDays className="h-4 w-4 inline mr-2" />
            {t('schedule.timeOff')}
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const prevWeek = new Date(currentWeek);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setCurrentWeek(prevWeek);
                }}
                className="p-2 text-carbon-600 hover:text-carbon-700 dark:text-carbon-400 dark:hover:text-carbon-300 hover:bg-carbon-50 dark:hover:bg-carbon-700 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('schedule.currentWeek')}
              </h2>
              <button
                onClick={() => {
                  const nextWeek = new Date(currentWeek);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setCurrentWeek(nextWeek);
                }}
                className="p-2 text-carbon-600 hover:text-carbon-700 dark:text-carbon-400 dark:hover:text-carbon-300 hover:bg-carbon-50 dark:hover:bg-carbon-700 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setShowShiftModal(true)}
              className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Turno
            </button>
          </div>

          <WeeklySchedule
            shifts={shifts}
            onEditShift={handleEditShift}
            onDeleteShift={handleDeleteShift}
            onToggleShift={handleToggleShift}
          />
        </div>
      )}

      {activeTab === 'availability' && (
        <AvailabilityControl
          currentStatus={currentAvailability}
          onStatusChange={handleAvailabilityChange}
        />
      )}

      {activeTab === 'timeOff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
              {t('schedule.timeOff')}
            </h2>
            <button
              onClick={() => setShowTimeOffModal(true)}
              className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('schedule.requestTimeOff')}
            </button>
          </div>

          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="p-4 border-b border-carbon-200 dark:border-carbon-700">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('schedule.viewRequests')}
              </h3>
            </div>
            <div className="p-4">
              {timeOffRequests.length > 0 ? (
                <div className="space-y-4">
                  {timeOffRequests.map((request) => (
                    <div key={request._id} className="p-4 border border-carbon-200 dark:border-carbon-600 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                          </div>
                          <span className={`font-medium ${getStatusColor(request.status)}`}>
                            {t(`schedule.status.${request.status}`)}
                          </span>
                        </div>
                        <span className="text-sm text-carbon-500 dark:text-carbon-400">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-carbon-600 dark:text-carbon-400 mb-2">
                        <strong>Período:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div className="text-sm text-carbon-600 dark:text-carbon-400">
                        <strong>Motivo:</strong> {request.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-carbon-300 dark:text-carbon-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-carbon-600 dark:text-carbon-400 mb-2">
                    {t('schedule.noRequests')}
                  </h3>
                  <p className="text-sm text-carbon-500 dark:text-carbon-500">
                    No hay solicitudes de tiempo libre registradas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para solicitar tiempo libre */}
      {showTimeOffModal && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('schedule.requestTimeOff')}
              </h3>
              <button
                onClick={() => setShowTimeOffModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  Fecha de inicio:
                </label>
                <input
                  type="date"
                  value={timeOffForm.startDate}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  Fecha de fin:
                </label>
                <input
                  type="date"
                  value={timeOffForm.endDate}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  {t('schedule.reason')}:
                </label>
                <textarea
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  placeholder="Describe el motivo de tu solicitud..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowTimeOffModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  {t('schedule.cancel')}
                </button>
                <button
                  onClick={handleSubmitTimeOff}
                  className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors"
                >
                  {t('schedule.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar/crear turno */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {editingShift ? 'Editar Turno' : 'Agregar Turno'}
              </h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  Día de la semana:
                </label>
                <select
                  value={shiftForm.dayOfWeek}
                  onChange={(e) => setShiftForm({ ...shiftForm, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                >
                  <option value={0}>Domingo</option>
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    {t('schedule.startTime')}:
                  </label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    {t('schedule.endTime')}:
                  </label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    {t('schedule.breakStart')}:
                  </label>
                  <input
                    type="time"
                    value={shiftForm.breakStart}
                    onChange={(e) => setShiftForm({ ...shiftForm, breakStart: e.target.value })}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    {t('schedule.breakEnd')}:
                  </label>
                  <input
                    type="time"
                    value={shiftForm.breakEnd}
                    onChange={(e) => setShiftForm({ ...shiftForm, breakEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={shiftForm.isActive}
                  onChange={(e) => setShiftForm({ ...shiftForm, isActive: e.target.checked })}
                  className="rounded border-carbon-300 text-racing-600 focus:ring-racing-500"
                />
                <label htmlFor="isActive" className="text-sm text-carbon-700 dark:text-carbon-300">
                  Turno activo
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowShiftModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  {t('schedule.cancel')}
                </button>
                <button
                  onClick={handleSaveShift}
                  className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors"
                >
                  {t('schedule.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySchedule;
