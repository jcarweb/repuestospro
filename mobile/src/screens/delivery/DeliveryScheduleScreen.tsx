import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { deliveryService } from '../../services/deliveryService';

interface WorkDay {
  day: string;
  label: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface ScheduleSettings {
  isAutoSchedule: boolean;
  workDays: WorkDay[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  timeZone: string;
  notifications: {
    shiftReminder: boolean;
    breakReminder: boolean;
    endShiftReminder: boolean;
  };
}

const DeliveryScheduleScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    isAutoSchedule: false,
    workDays: [
      { day: 'monday', label: 'Lunes', isWorking: true, startTime: '08:00', endTime: '17:00' },
      { day: 'tuesday', label: 'Martes', isWorking: true, startTime: '08:00', endTime: '17:00' },
      { day: 'wednesday', label: 'Miércoles', isWorking: true, startTime: '08:00', endTime: '17:00' },
      { day: 'thursday', label: 'Jueves', isWorking: true, startTime: '08:00', endTime: '17:00' },
      { day: 'friday', label: 'Viernes', isWorking: true, startTime: '08:00', endTime: '17:00' },
      { day: 'saturday', label: 'Sábado', isWorking: false, startTime: '09:00', endTime: '15:00' },
      { day: 'sunday', label: 'Domingo', isWorking: false, startTime: '09:00', endTime: '15:00' },
    ],
    maxHoursPerDay: 8,
    maxHoursPerWeek: 40,
    timeZone: 'America/Caracas',
    notifications: {
      shiftReminder: true,
      breakReminder: true,
      endShiftReminder: true,
    }
  });
  const [selectedDay, setSelectedDay] = useState<WorkDay | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeType, setTimeType] = useState<'start' | 'end' | 'breakStart' | 'breakEnd'>('start');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      
      const response = await deliveryService.getDeliverySettings();
      
      if (response.success && response.data?.schedule) {
        setSchedule(response.data.schedule);
        console.log('✅ Horario de trabajo cargado:', response.data.schedule);
      } else {
        console.warn('⚠️ No se pudo cargar el horario, usando configuración por defecto');
        // Mantener configuración por defecto que ya está en el estado
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      showToast('Error al cargar horario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      
      const response = await deliveryService.updateDeliverySettings({
        schedule: schedule
      });
      
      if (response.success) {
        showToast('Horario guardado exitosamente', 'success');
        console.log('✅ Horario de trabajo guardado:', schedule);
      } else {
        throw new Error(response.message || 'Error al guardar horario');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      showToast('Error al guardar horario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkDay = (dayIndex: number) => {
    const newSchedule = { ...schedule };
    newSchedule.workDays[dayIndex].isWorking = !newSchedule.workDays[dayIndex].isWorking;
    setSchedule(newSchedule);
  };

  const updateWorkTime = (dayIndex: number, timeType: 'start' | 'end' | 'breakStart' | 'breakEnd', time: string) => {
    const newSchedule = { ...schedule };
    if (timeType === 'start') {
      newSchedule.workDays[dayIndex].startTime = time;
    } else if (timeType === 'end') {
      newSchedule.workDays[dayIndex].endTime = time;
    } else if (timeType === 'breakStart') {
      newSchedule.workDays[dayIndex].breakStart = time;
    } else if (timeType === 'breakEnd') {
      newSchedule.workDays[dayIndex].breakEnd = time;
    }
    setSchedule(newSchedule);
  };

  const showTimePicker = (day: WorkDay, type: 'start' | 'end' | 'breakStart' | 'breakEnd') => {
    setSelectedDay(day);
    setTimeType(type);
    setShowTimeModal(true);
  };

  const handleTimeChange = (time: string) => {
    if (selectedDay) {
      const dayIndex = schedule.workDays.findIndex(d => d.day === selectedDay.day);
      if (dayIndex !== -1) {
        updateWorkTime(dayIndex, timeType, time);
      }
    }
    setShowTimeModal(false);
  };

  const toggleNotification = (type: keyof typeof schedule.notifications) => {
    const newSchedule = { ...schedule };
    newSchedule.notifications[type] = !newSchedule.notifications[type];
    setSchedule(newSchedule);
  };

  const resetToDefault = () => {
    Alert.alert(
      'Restablecer Horario',
      '¿Deseas restablecer el horario a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restablecer', style: 'destructive', onPress: () => {
          loadSchedule();
          showToast('Horario restablecido', 'info');
        }}
      ]
    );
  };

  const calculateTotalHours = () => {
    return schedule.workDays
      .filter(day => day.isWorking)
      .reduce((total, day) => {
        const start = new Date(`2000-01-01T${day.startTime}:00`);
        const end = new Date(`2000-01-01T${day.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const WorkDayCard = ({ day, index }: { day: WorkDay; index: number }) => (
    <View style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.dayHeader}>
        <View style={styles.dayInfo}>
          <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>
            {day.label}
          </Text>
          <Switch
            value={day.isWorking}
            onValueChange={() => toggleWorkDay(index)}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={day.isWorking ? colors.primary : colors.textTertiary}
          />
        </View>
        {day.isWorking && (
          <View style={styles.workHours}>
            <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
              {day.startTime} - {day.endTime}
            </Text>
          </View>
        )}
      </View>

      {day.isWorking && (
        <View style={styles.timeControls}>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => showTimePicker(day, 'start')}
          >
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={[styles.timeButtonText, { color: colors.textPrimary }]}>
              Inicio: {day.startTime}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => showTimePicker(day, 'end')}
          >
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={[styles.timeButtonText, { color: colors.textPrimary }]}>
              Fin: {day.endTime}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const TimePickerModal = () => (
    <Modal
      visible={showTimeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTimeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Seleccionar Hora
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {selectedDay?.label} - {timeType === 'start' ? 'Hora de inicio' : 'Hora de fin'}
          </Text>
          
          <View style={styles.timeOptions}>
            {Array.from({ length: 24 }, (_, hour) => (
              <View key={hour} style={styles.hourRow}>
                {Array.from({ length: 4 }, (_, quarter) => {
                  const minutes = quarter * 15;
                  const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  return (
                    <TouchableOpacity
                      key={quarter}
                      style={[
                        styles.timeOption,
                        { 
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => handleTimeChange(timeString)}
                    >
                      <Text style={[styles.timeOptionText, { color: colors.textPrimary }]}>
                        {timeString}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.error }]}
            onPress={() => setShowTimeModal(false)}
          >
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando horario...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Horario de Trabajo
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={saveSchedule}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={resetToDefault}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
          Resumen del Horario
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {schedule.workDays.filter(day => day.isWorking).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Días de Trabajo
            </Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {calculateTotalHours().toFixed(1)}h
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Horas Totales
            </Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {schedule.maxHoursPerWeek}h
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Máximo Semanal
            </Text>
          </View>
        </View>
      </View>

      {/* Auto Schedule Toggle */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionInfo}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Horario Automático
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Permite que el sistema ajuste automáticamente tu disponibilidad
            </Text>
          </View>
          <Switch
            value={schedule.isAutoSchedule}
            onValueChange={(value) => setSchedule({ ...schedule, isAutoSchedule: value })}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={schedule.isAutoSchedule ? colors.primary : colors.textTertiary}
          />
        </View>
      </View>

      {/* Work Days */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Días de Trabajo
        </Text>
        {schedule.workDays.map((day, index) => (
          <WorkDayCard key={day.day} day={day} index={index} />
        ))}
      </View>

      {/* Notifications */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Notificaciones
        </Text>
        
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
                Recordatorio de Turno
              </Text>
              <Text style={[styles.notificationSubtitle, { color: colors.textSecondary }]}>
                Notificar 15 minutos antes del inicio
              </Text>
            </View>
          </View>
          <Switch
            value={schedule.notifications.shiftReminder}
            onValueChange={() => toggleNotification('shiftReminder')}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={schedule.notifications.shiftReminder ? colors.primary : colors.textTertiary}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Ionicons name="pause-circle" size={20} color={colors.primary} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
                Recordatorio de Descanso
              </Text>
              <Text style={[styles.notificationSubtitle, { color: colors.textSecondary }]}>
                Recordar tomar descansos regulares
              </Text>
            </View>
          </View>
          <Switch
            value={schedule.notifications.breakReminder}
            onValueChange={() => toggleNotification('breakReminder')}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={schedule.notifications.breakReminder ? colors.primary : colors.textTertiary}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Ionicons name="stop-circle" size={20} color={colors.primary} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
                Recordatorio de Fin de Turno
              </Text>
              <Text style={[styles.notificationSubtitle, { color: colors.textSecondary }]}>
                Notificar cuando termine el turno
              </Text>
            </View>
          </View>
          <Switch
            value={schedule.notifications.endShiftReminder}
            onValueChange={() => toggleNotification('endShiftReminder')}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={schedule.notifications.endShiftReminder ? colors.primary : colors.textTertiary}
          />
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={saveSchedule}
          disabled={saving}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar Horario'}
          </Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  dayCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  workHours: {
    alignItems: 'flex-end',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 12,
  },
  saveSection: {
    padding: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  timeOptions: {
    maxHeight: 300,
  },
  hourRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeOption: {
    flex: 1,
    padding: 8,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 12,
  },
  modalButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeliveryScheduleScreen;
