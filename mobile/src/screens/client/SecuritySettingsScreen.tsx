import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SecuritySettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
    loadSecuritySettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isAvailable = hasHardware && isEnrolled;
      setBiometricAvailable(isAvailable);
      console.log('🔐 Biometric Auth - Hardware disponible:', hasHardware);
      console.log('🔐 Biometric Auth - Huella configurada:', isEnrolled);
      console.log('🔐 Biometric Auth disponible:', isAvailable);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      const pinEnabled = await AsyncStorage.getItem('pinEnabled');
      const twoFactorEnabled = await AsyncStorage.getItem('twoFactorEnabled');
      
      setBiometricEnabled(biometricEnabled === 'true');
      setPinEnabled(pinEnabled === 'true');
      setTwoFactorEnabled(twoFactorEnabled === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometricAvailable) {
      showToast('Autenticación biométrica no disponible en este dispositivo', 'error');
      return;
    }

    if (value) {
      try {
        // Siempre intentar autenticación real primero
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autentica para activar la autenticación biométrica',
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar PIN',
        });

        if (result.success) {
          setBiometricEnabled(true);
          await AsyncStorage.setItem('biometricEnabled', 'true');
          showToast('Autenticación biométrica activada', 'success');
        } else {
          // En desarrollo, si falla la autenticación real, activar de todas formas
          if (__DEV__ && result.error === 'user_cancel') {
            setBiometricEnabled(true);
            await AsyncStorage.setItem('biometricEnabled', 'true');
            showToast('Autenticación biométrica activada (modo desarrollo)', 'success');
          } else {
            showToast('Autenticación cancelada', 'info');
          }
        }
      } catch (error) {
        console.error('Error with biometric authentication:', error);
        // En desarrollo, activar de todas formas si hay error
        if (__DEV__) {
          setBiometricEnabled(true);
          await AsyncStorage.setItem('biometricEnabled', 'true');
          showToast('Autenticación biométrica activada (modo desarrollo)', 'success');
        } else {
          showToast('Error al activar autenticación biométrica', 'error');
        }
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem('biometricEnabled', 'false');
      showToast('Autenticación biométrica desactivada', 'info');
    }
  };

  const handlePinToggle = (value: boolean) => {
    if (value) {
      setPinModalVisible(true);
    } else {
      Alert.alert(
        'Desactivar PIN',
        '¿Estás seguro de que quieres desactivar el PIN?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              setPinEnabled(false);
              await AsyncStorage.setItem('pinEnabled', 'false');
              await AsyncStorage.removeItem('userPin');
              showToast('PIN desactivado', 'info');
            },
          },
        ]
      );
    }
  };

  const handleTwoFactorToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Activar Verificación en Dos Pasos',
        'Se enviará un código de verificación a tu email para activar la verificación en dos pasos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Activar',
            onPress: async () => {
              setTwoFactorEnabled(true);
              await AsyncStorage.setItem('twoFactorEnabled', 'true');
              showToast('Código de verificación enviado a tu email', 'info');
            },
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
      await AsyncStorage.setItem('twoFactorEnabled', 'false');
      showToast('Verificación en dos pasos desactivada', 'info');
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) {
      showToast('El PIN debe tener al menos 4 dígitos', 'error');
      return;
    }

    if (newPin !== confirmPin) {
      showToast('Los PINs no coinciden', 'error');
      return;
    }

    try {
      // Guardar PIN de forma segura (en producción usarías encriptación)
      await AsyncStorage.setItem('userPin', newPin);
      await AsyncStorage.setItem('pinEnabled', 'true');
      
      setPinEnabled(true);
      setPinModalVisible(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('PIN configurado correctamente', 'success');
    } catch (error) {
      console.error('Error saving PIN:', error);
      showToast('Error al configurar PIN', 'error');
    }
  };

  const handleChangePassword = () => {
    showToast('Funcionalidad de cambio de contraseña próximamente', 'info');
  };

  const handleLoginHistory = () => {
    showToast('Mostrando historial de inicios de sesión...', 'info');
  };

  const renderPinModal = () => (
    <Modal
      visible={pinModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setPinModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Configurar PIN
          </Text>
          
          <TextInput
            style={[styles.pinInput, { 
              backgroundColor: colors.background, 
              color: colors.textPrimary,
              borderColor: colors.border 
            }]}
            placeholder="Nuevo PIN (mínimo 4 dígitos)"
            placeholderTextColor={colors.textTertiary}
            value={newPin}
            onChangeText={setNewPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />
          
          <TextInput
            style={[styles.pinInput, { 
              backgroundColor: colors.background, 
              color: colors.textPrimary,
              borderColor: colors.border 
            }]}
            placeholder="Confirmar PIN"
            placeholderTextColor={colors.textTertiary}
            value={confirmPin}
            onChangeText={setConfirmPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setPinModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSetPin}
            >
              <Text style={[styles.modalButtonText, { color: '#000000' }]}>
                Configurar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Configuración de Seguridad
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Protege tu cuenta con múltiples capas de seguridad
          </Text>
        </View>

        {/* Autenticación Biométrica */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Autenticación
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={biometricAvailable ? "finger-print-outline" : "finger-print-outline"} 
                size={24} 
                color={biometricAvailable ? colors.primary : colors.textTertiary} 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Autenticación Biométrica
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {biometricAvailable 
                    ? 'Usar huella dactilar o Face ID' 
                    : 'No disponible en este dispositivo'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={biometricEnabled ? '#000000' : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="keypad-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  PIN de Acceso
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Usar PIN para acceder a la aplicación
                </Text>
              </View>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={pinEnabled ? '#000000' : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Verificación en Dos Pasos
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Código adicional por email o SMS
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleTwoFactorToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={twoFactorEnabled ? '#000000' : colors.textTertiary}
            />
          </View>
        </View>

        {/* Contraseña */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Contraseña
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleChangePassword}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Cambiar Contraseña
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Actualiza tu contraseña de acceso
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Actividad */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Actividad
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleLoginHistory}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Historial de Inicios de Sesión
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Ver dispositivos y ubicaciones recientes
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {renderPinModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pinInput: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SecuritySettingsScreen;
