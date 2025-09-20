import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BiometricSetupModal: React.FC<BiometricSetupModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [biometricType, setBiometricType] = useState<string>('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'setup' | 'test'>('check');

  useEffect(() => {
    if (visible) {
      checkBiometricAvailability();
    }
  }, [visible]);

  const checkBiometricAvailability = async () => {
    try {
      setLoading(true);
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setIsAvailable(hasHardware && enrolled);
      setIsEnrolled(enrolled);
      
      // Determinar el tipo de biometría disponible
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Huella Dactilar');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('Reconocimiento de Iris');
      } else {
        setBiometricType('Biometría');
      }
      
      if (hasHardware && enrolled) {
        setStep('setup');
      } else {
        setStep('check');
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupBiometric = async () => {
    try {
      setLoading(true);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Configurar ${biometricType}`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        // Guardar configuración biométrica
        await AsyncStorage.setItem('biometricEnabled', 'true');
        await AsyncStorage.setItem('biometricType', biometricType);
        await AsyncStorage.setItem('biometricSetupDate', new Date().toISOString());
        
        setStep('test');
        showToast(`${biometricType} configurado exitosamente`, 'success');
      } else {
        if (result.error === 'user_cancel') {
          showToast('Configuración cancelada', 'info');
        } else {
          showToast('Error al configurar biometría', 'error');
        }
      }
    } catch (error) {
      console.error('Error setting up biometric:', error);
      showToast('Error al configurar biometría', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestBiometric = async () => {
    try {
      setLoading(true);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verificar ${biometricType}`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        showToast('Verificación biométrica exitosa', 'success');
        onSuccess();
        onClose();
      } else {
        if (result.error === 'user_cancel') {
          showToast('Verificación cancelada', 'info');
        } else {
          showToast('Error en la verificación biométrica', 'error');
        }
      }
    } catch (error) {
      console.error('Error testing biometric:', error);
      showToast('Error en la verificación biométrica', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="finger-print" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verificar Biometría
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Verificando disponibilidad de autenticación biométrica
        </Text>
      </View>

      <View style={[styles.statusContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statusRow}>
          <Ionicons 
            name={isAvailable ? "checkmark-circle" : "close-circle"} 
            size={24} 
            color={isAvailable ? colors.success : colors.error} 
          />
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            Hardware disponible: {isAvailable ? 'Sí' : 'No'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Ionicons 
            name={isEnrolled ? "checkmark-circle" : "close-circle"} 
            size={24} 
            color={isEnrolled ? colors.success : colors.error} 
          />
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            {biometricType} configurado: {isEnrolled ? 'Sí' : 'No'}
          </Text>
        </View>

        {biometricType && (
          <View style={styles.statusRow}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              Tipo: {biometricType}
            </Text>
          </View>
        )}
      </View>

      {!isAvailable && (
        <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
          <Ionicons name="warning" size={24} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            {!isEnrolled 
              ? `Necesitas configurar ${biometricType} en la configuración de tu dispositivo primero.`
              : 'La autenticación biométrica no está disponible en este dispositivo.'
            }
          </Text>
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>
          Instrucciones:
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          1. Ve a Configuración de tu dispositivo
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          2. Busca "Seguridad" o "Biometría"
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          3. Configura {biometricType}
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          4. Regresa a la app y presiona "Verificar"
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={checkBiometricAvailability}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Verificar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSetupStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Configurar {biometricType}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Activa la autenticación biométrica para mayor seguridad
        </Text>
      </View>

      <View style={[styles.benefitsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.benefitsTitle, { color: colors.textPrimary }]}>
          Beneficios:
        </Text>
        <View style={styles.benefitItem}>
          <Ionicons name="flash" size={20} color={colors.success} />
          <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
            Acceso rápido y seguro
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="shield" size={20} color={colors.success} />
          <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
            Mayor protección de tu cuenta
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="lock-closed" size={20} color={colors.success} />
          <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
            No necesitas recordar contraseñas
          </Text>
        </View>
      </View>

      <View style={[styles.warningContainer, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
        <Ionicons name="information-circle" size={24} color={colors.info} />
        <Text style={[styles.warningText, { color: colors.info }]}>
          Se te pedirá que verifiques tu {biometricType} para completar la configuración.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleSetupBiometric}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Configurar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTestStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          ¡Configuración Exitosa!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {biometricType} ha sido configurado correctamente
        </Text>
      </View>

      <View style={[styles.successContainer, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
        <Ionicons name="checkmark-circle" size={32} color={colors.success} />
        <Text style={[styles.successText, { color: colors.success }]}>
          La autenticación biométrica está activa
        </Text>
      </View>

      <View style={[styles.infoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
          Próximos pasos:
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Usa {biometricType} para iniciar sesión rápidamente
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Puedes desactivar esta función en cualquier momento
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Tu información biométrica se mantiene segura en tu dispositivo
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleTestBiometric}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Probar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.success }]}
          onPress={() => {
            onSuccess();
            onClose();
          }}
        >
          <Text style={styles.primaryButtonText}>Completar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
            Configurar Biometría
          </Text>
          <View style={styles.placeholder} />
        </View>

        {step === 'check' && renderCheckStep()}
        {step === 'setup' && renderSetupStep()}
        {step === 'test' && renderTestStep()}
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
  placeholder: {
    width: 40,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  benefitsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  successText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BiometricSetupModal;
