import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PinLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const PinLoginModal: React.FC<PinLoginModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  useEffect(() => {
    if (visible) {
      setPin('');
      setAttempts(0);
      setIsLocked(false);
      setLockTime(0);
    }
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTime > 0) {
      interval = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTime]);

  const handlePinInput = (digit: string) => {
    if (isLocked || pin.length >= 4) return;
    
    setPin(prev => prev + digit);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      showToast('El PIN debe tener 4 dígitos', 'error');
      return;
    }

    setLoading(true);
    try {
      // Verificar PIN
      const savedPin = await AsyncStorage.getItem('userPin');
      
      if (pin === savedPin) {
        // PIN correcto - hacer login
        const savedCredentials = await AsyncStorage.getItem('savedCredentials');
        
        if (savedCredentials) {
          const { email, password } = JSON.parse(savedCredentials);
          
          // Simular login exitoso
          const mockUser = {
            id: 'pin-user-123',
            name: 'Usuario PIN',
            email: email,
            role: 'client',
            emailVerified: true,
            phone: '+1234567890',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          showToast('Login exitoso con PIN', 'success');
          onSuccess(mockUser);
          onClose();
        } else {
          // Si no hay credenciales guardadas, pedir email
          Alert.prompt(
            'Login con PIN',
            'Ingresa tu email para continuar:',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Continuar',
                onPress: (email) => {
                  if (email) {
                    const mockUser = {
                      id: 'pin-user-123',
                      name: 'Usuario PIN',
                      email: email,
                      role: 'client',
                      emailVerified: true,
                      phone: '+1234567890',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    
                    showToast('Login exitoso con PIN', 'success');
                    onSuccess(mockUser);
                    onClose();
                  }
                }
              }
            ],
            'plain-text',
            ''
          );
        }
      } else {
        // PIN incorrecto
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        
        if (newAttempts >= 3) {
          // Bloquear por 30 segundos después de 3 intentos fallidos
          setIsLocked(true);
          setLockTime(30);
          showToast('Demasiados intentos fallidos. Bloqueado por 30 segundos', 'error');
        } else {
          showToast(`PIN incorrecto. Intentos restantes: ${3 - newAttempts}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      showToast('Error al verificar PIN', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderPinDots = () => (
    <View style={styles.pinDotsContainer}>
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: index < pin.length ? colors.primary : colors.border,
              borderColor: colors.border,
            }
          ]}
        />
      ))}
    </View>
  );

  const renderKeypad = () => (
    <View style={styles.keypad}>
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete']
      ].map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keypadRow}>
          {row.map((digit, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.keypadButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => {
                if (digit === 'delete') {
                  handleDelete();
                } else if (digit) {
                  handlePinInput(digit);
                }
              }}
              disabled={isLocked}
            >
              {digit === 'delete' ? (
                <Ionicons name="backspace" size={24} color={colors.textPrimary} />
              ) : digit ? (
                <Text style={[styles.keypadText, { color: colors.textPrimary }]}>
                  {digit}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}
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
            Login con PIN
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="keypad" size={48} color={colors.primary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Ingresa tu PIN
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Usa tu PIN de 4 dígitos para acceder
            </Text>
          </View>

          {renderPinDots()}

          {isLocked ? (
            <View style={[styles.lockContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
              <Ionicons name="lock-closed" size={32} color={colors.error} />
              <Text style={[styles.lockText, { color: colors.error }]}>
                Cuenta bloqueada
              </Text>
              <Text style={[styles.lockSubtext, { color: colors.error }]}>
                Intenta de nuevo en {lockTime} segundos
              </Text>
            </View>
          ) : (
            renderKeypad()
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleClear}
              disabled={isLocked || pin.length === 0}
            >
              <Text style={[styles.clearButtonText, { color: colors.textPrimary }]}>
                Limpiar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: pin.length === 4 ? colors.primary : colors.border }
              ]}
              onPress={handleVerifyPin}
              disabled={pin.length !== 4 || loading || isLocked}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.verifyButtonText}>Verificar</Text>
              )}
            </TouchableOpacity>
          </View>

          {attempts > 0 && !isLocked && (
            <View style={[styles.attemptsContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={[styles.attemptsText, { color: colors.warning }]}>
                Intentos fallidos: {attempts}/3
              </Text>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginHorizontal: 8,
  },
  keypad: {
    marginBottom: 30,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '600',
  },
  lockContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
  },
  lockText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  lockSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  attemptsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PinLoginModal;
