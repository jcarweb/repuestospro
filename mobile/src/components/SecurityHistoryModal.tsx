import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import sessionManager from '../services/sessionManager';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'token_refresh' | 'suspicious_activity' | 'password_change' | '2fa_enabled' | '2fa_disabled';
  timestamp: number;
  deviceInfo: any;
  location?: {
    latitude: number;
    longitude: number;
  };
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

interface SecurityHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const SecurityHistoryModal: React.FC<SecurityHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'login' | 'security' | 'suspicious'>('all');

  useEffect(() => {
    if (visible) {
      loadSecurityEvents();
    }
  }, [visible]);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      
      // Generar eventos de seguridad de ejemplo
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          timestamp: Date.now() - 1000 * 60 * 5, // 5 minutos atrás
          deviceInfo: { platform: 'Android', model: 'Samsung Galaxy' },
          location: { latitude: 10.4632, longitude: -66.9843 },
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          type: '2fa_enabled',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutos atrás
          deviceInfo: { platform: 'Android', model: 'Samsung Galaxy' },
          reason: 'Configuración de autenticación de dos factores'
        },
        {
          id: '3',
          type: 'password_change',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 horas atrás
          deviceInfo: { platform: 'Android', model: 'Samsung Galaxy' },
          reason: 'Cambio de contraseña por seguridad'
        },
        {
          id: '4',
          type: 'login',
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 día atrás
          deviceInfo: { platform: 'Android', model: 'Samsung Galaxy' },
          location: { latitude: 10.4632, longitude: -66.9843 },
          ipAddress: '192.168.1.100'
        },
        {
          id: '5',
          type: 'suspicious_activity',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 días atrás
          deviceInfo: { platform: 'Android', model: 'Samsung Galaxy' },
          reason: 'Múltiples intentos de login fallidos',
          ipAddress: '192.168.1.100'
        }
      ];
      
      setEvents(mockEvents);
      console.log('Eventos de seguridad cargados:', mockEvents.length);
    } catch (error) {
      console.error('Error loading security events:', error);
      showToast('Error al cargar el historial de seguridad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'log-in';
      case 'logout':
        return 'log-out';
      case 'token_refresh':
        return 'refresh';
      case 'suspicious_activity':
        return 'warning';
      case 'password_change':
        return 'key';
      case '2fa_enabled':
        return 'shield-checkmark';
      case '2fa_disabled':
        return 'shield';
      default:
        return 'information-circle';
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return colors.success;
      case 'logout':
        return colors.textSecondary;
      case 'token_refresh':
        return colors.primary;
      case 'suspicious_activity':
        return colors.error;
      case 'password_change':
        return colors.warning;
      case '2fa_enabled':
        return colors.success;
      case '2fa_disabled':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getEventTitle = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'Inicio de sesión';
      case 'logout':
        return 'Cierre de sesión';
      case 'token_refresh':
        return 'Token actualizado';
      case 'suspicious_activity':
        return 'Actividad sospechosa';
      case 'password_change':
        return 'Contraseña cambiada';
      case '2fa_enabled':
        return '2FA activado';
      case '2fa_disabled':
        return '2FA desactivado';
      default:
        return 'Evento de seguridad';
    }
  };

  const getEventDescription = (event: SecurityEvent) => {
    const date = new Date(event.timestamp).toLocaleString();
    const device = event.deviceInfo?.platform || 'Dispositivo desconocido';
    
    switch (event.type) {
      case 'login':
        return `Inicio de sesión desde ${device} el ${date}`;
      case 'logout':
        return `Cierre de sesión el ${date}`;
      case 'token_refresh':
        return `Token de acceso actualizado el ${date}`;
      case 'suspicious_activity':
        return `Actividad sospechosa detectada: ${event.reason || 'Razón desconocida'} el ${date}`;
      case 'password_change':
        return `Contraseña cambiada el ${date}`;
      case '2fa_enabled':
        return `Autenticación de dos factores activada el ${date}`;
      case '2fa_disabled':
        return `Autenticación de dos factores desactivada el ${date}`;
      default:
        return `Evento de seguridad el ${date}`;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `hace ${minutes} min`;
    } else if (hours < 24) {
      return `hace ${hours}h`;
    } else {
      return `hace ${days} días`;
    }
  };

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'login':
        return event.type === 'login' || event.type === 'logout';
      case 'security':
        return ['password_change', '2fa_enabled', '2fa_disabled', 'token_refresh'].includes(event.type);
      case 'suspicious':
        return event.type === 'suspicious_activity';
      default:
        return true;
    }
  });

  const clearHistory = () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que quieres limpiar todo el historial de seguridad? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              // En una implementación real, aquí limpiarías el historial
              showToast('Historial de seguridad limpiado', 'success');
              setEvents([]);
            } catch (error) {
              showToast('Error al limpiar el historial', 'error');
            }
          },
        },
      ]
    );
  };

  const renderEventItem = (event: SecurityEvent) => (
    <View key={event.id} style={[styles.eventItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons 
            name={getEventIcon(event.type)} 
            size={24} 
            color={getEventColor(event.type)} 
          />
        </View>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
            {getEventTitle(event.type)}
          </Text>
          <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
            {formatTimeAgo(event.timestamp)}
          </Text>
        </View>
        {event.type === 'suspicious_activity' && (
          <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
            <Ionicons name="alert" size={16} color="white" />
          </View>
        )}
      </View>
      
      <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
        {getEventDescription(event)}
      </Text>
      
      {event.deviceInfo && (
        <View style={styles.deviceInfo}>
          <Ionicons name="phone-portrait" size={16} color={colors.textTertiary} />
          <Text style={[styles.deviceText, { color: colors.textTertiary }]}>
            {event.deviceInfo.platform} • {event.deviceInfo.deviceId?.substring(0, 8)}...
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Historial de Seguridad
          </Text>
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'login', label: 'Sesiones' },
              { key: 'security', label: 'Seguridad' },
              { key: 'suspicious', label: 'Sospechoso' },
            ].map((filterOption) => (
              <TouchableOpacity
                key={filterOption.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filter === filterOption.key ? colors.primary : colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setFilter(filterOption.key as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: filter === filterOption.key ? 'white' : colors.textPrimary }
                  ]}
                >
                  {filterOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de eventos */}
        <ScrollView style={styles.eventsList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Cargando historial...
              </Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No hay eventos
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {filter === 'all' 
                  ? 'No se han registrado eventos de seguridad'
                  : `No hay eventos de tipo "${filter}"`
                }
              </Text>
            </View>
          ) : (
            filteredEvents.map(renderEventItem)
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  eventItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default SecurityHistoryModal;
