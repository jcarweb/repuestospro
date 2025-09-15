import React from 'react';
import { Calendar, Clock, Coffee, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  WorkShift, 
  getDayName, 
  getDayNameShort, 
  formatTime, 
  calculateShiftHours 
} from '../data/mockWorkSchedule';

interface WeeklyScheduleProps {
  shifts: WorkShift[];
  onEditShift?: (shift: WorkShift) => void;
  onDeleteShift?: (shiftId: string) => void;
  onToggleShift?: (shiftId: string) => void;
  className?: string;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  shifts,
  onEditShift,
  onDeleteShift,
  onToggleShift,
  className = ''
}) => {
  const { t } = useLanguage();

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-carbon-100 text-carbon-800 dark:bg-carbon-700 dark:text-carbon-300';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const getDayClass = (dayOfWeek: number) => {
    const today = new Date().getDay();
    return dayOfWeek === today 
      ? 'bg-racing-50 dark:bg-racing-900/20 border-racing-200 dark:border-racing-700'
      : 'bg-snow-500 dark:bg-carbon-800 border-carbon-200 dark:border-carbon-700';
  };

  const renderShift = (shift: WorkShift) => {
    const hours = calculateShiftHours(shift.startTime, shift.endTime);
    const breakHours = shift.breakStart && shift.breakEnd 
      ? calculateShiftHours(shift.breakStart, shift.breakEnd)
      : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-onix-900 dark:text-snow-500">
              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.isActive)}`}>
            {shift.isActive ? t('schedule.active') : t('schedule.inactive')}
          </div>
        </div>
        
        <div className="text-xs text-carbon-600 dark:text-carbon-400">
          {t('schedule.workingHours')}: {hours.toFixed(1)}h
          {breakHours > 0 && (
            <span className="ml-2">
              • {t('schedule.breakTime')}: {breakHours.toFixed(1)}h
            </span>
          )}
        </div>

        {shift.breakStart && shift.breakEnd && (
          <div className="flex items-center gap-1 text-xs text-carbon-500 dark:text-carbon-400">
            <Coffee className="h-3 w-3" />
            <span>
              {formatTime(shift.breakStart)} - {formatTime(shift.breakEnd)}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-1 pt-2 border-t border-carbon-100 dark:border-carbon-700">
          {onEditShift && (
            <button
              onClick={() => onEditShift(shift)}
              className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
              title={t('schedule.edit')}
            >
              <Edit className="h-3 w-3" />
            </button>
          )}
          {onDeleteShift && (
            <button
              onClick={() => onDeleteShift(shift._id)}
              className="p-1 text-alert-600 hover:text-alert-700 dark:text-alert-400 dark:hover:text-alert-300 hover:bg-alert-50 dark:hover:bg-alert-900/20 rounded"
              title={t('schedule.delete')}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {onToggleShift && (
            <button
              onClick={() => onToggleShift(shift._id)}
              className={`p-1 rounded hover:bg-carbon-50 dark:hover:bg-carbon-700 ${
                shift.isActive 
                  ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                  : 'text-carbon-600 hover:text-carbon-700 dark:text-carbon-400 dark:hover:text-carbon-300'
              }`}
              title={shift.isActive ? 'Desactivar' : 'Activar'}
            >
              {getStatusIcon(shift.isActive)}
            </button>
          )}
        </div>
      </div>
    );
  };

  const days = [0, 1, 2, 3, 4, 5, 6]; // Domingo a Sábado

  return (
    <div className={`bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700 ${className}`}>
      <div className="p-4 border-b border-carbon-200 dark:border-carbon-700">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-racing-600 dark:text-racing-400" />
          <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
            {t('schedule.weeklySchedule')}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 p-4">
        {days.map(dayOfWeek => {
          const shift = shifts.find(s => s.dayOfWeek === dayOfWeek);
          const isToday = new Date().getDay() === dayOfWeek;

          return (
            <div
              key={dayOfWeek}
              className={`p-3 rounded-lg border ${getDayClass(dayOfWeek)} min-h-[120px]`}
            >
              <div className="text-center mb-3">
                <div className={`text-sm font-medium ${
                  isToday 
                    ? 'text-racing-700 dark:text-racing-300' 
                    : 'text-carbon-600 dark:text-carbon-400'
                }`}>
                  {getDayNameShort(dayOfWeek)}
                </div>
                {isToday && (
                  <div className="text-xs text-racing-600 dark:text-racing-400 font-medium">
                    {t('schedule.today')}
                  </div>
                )}
              </div>

              {shift ? (
                renderShift(shift)
              ) : (
                <div className="text-center text-carbon-400 dark:text-carbon-500 text-xs">
                  {t('schedule.noShifts')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="p-4 border-t border-carbon-200 dark:border-carbon-700 bg-carbon-50 dark:bg-carbon-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-onix-900 dark:text-snow-500">
              {shifts.filter(s => s.isActive).length}
            </div>
            <div className="text-xs text-carbon-600 dark:text-carbon-400">
              {t('schedule.workingDays')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-onix-900 dark:text-snow-500">
              {shifts
                .filter(s => s.isActive)
                .reduce((total, shift) => total + calculateShiftHours(shift.startTime, shift.endTime), 0)
                .toFixed(1)}h
            </div>
            <div className="text-xs text-carbon-600 dark:text-carbon-400">
              {t('schedule.totalHours')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-onix-900 dark:text-snow-500">
              {shifts.filter(s => s.isActive).length > 0 
                ? (shifts
                    .filter(s => s.isActive)
                    .reduce((total, shift) => total + calculateShiftHours(shift.startTime, shift.endTime), 0) / 
                    shifts.filter(s => s.isActive).length).toFixed(1)
                : '0'}h
            </div>
            <div className="text-xs text-carbon-600 dark:text-carbon-400">
              {t('schedule.averageHours')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
