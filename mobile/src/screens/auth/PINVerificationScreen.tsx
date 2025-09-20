import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

interface PINVerificationScreenProps {
  navigation: any;
  route: any;
}

const PINVerificationScreen: React.FC<PINVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const onSuccess = route.params?.onSuccess;

  useEffect(() => {
    if (attempts >= maxAttempts) {
      Alert.alert(
        'Demasiados Intentos',
        'Has excedido el número máximo de intentos. Por favor, usa el login tradicional.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    }
  }, [attempts]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 4) {
        verifyPIN(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const verifyPIN = async (pinCode: string) => {
    try {
      setIsLoading(true);
      
      // Simular verificación de PIN
      // En una implementación real, aquí se verificaría con el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por ahora, simulamos que el PIN correcto es "1234"
      if (pinCode === '1234') {
        showToast('PIN verificado exitosamente', 'success');
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Si no hay callback, navegar al login
          navigation.navigate('Login');
        }
      } else {
        setAttempts(attempts + 1);
        setPin('');
        showToast(`PIN incorrecto. Intentos restantes: ${maxAttempts - attempts - 1}`, 'error');
      }
      
    } catch (error: any) {
      console.error('PIN verification error:', error);
      showToast('Error al verificar PIN', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNumberButton = (number: string) => (
    <TouchableOpacity
      key={number}
      style={[styles.numberButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleNumberPress(number)}
      disabled={isLoading}
    >
      <Text style={[styles.numberText, { color: colors.textPrimary }]}>{number}</Text>
    </TouchableOpacity>
  );

  const renderPINDisplay = () => (
    <View style={styles.pinDisplay}>
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            { 
              backgroundColor: index < pin.length ? colors.primary : colors.border,
              borderColor: colors.border 
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Icono */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="keypad" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Título y descripción */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Verificar PIN
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu PIN de 4 dígitos
          </Text>
          {attempts > 0 && (
            <Text style={[styles.attemptsText, { color: colors.error }]}>
              Intentos restantes: {maxAttempts - attempts}
            </Text>
          )}
        </View>

        {/* Display del PIN */}
        {renderPINDisplay()}

        {/* Teclado numérico */}
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {renderNumberButton('1')}
            {renderNumberButton('2')}
            {renderNumberButton('3')}
          </View>
          <View style={styles.keypadRow}>
            {renderNumberButton('4')}
            {renderNumberButton('5')}
            {renderNumberButton('6')}
          </View>
          <View style={styles.keypadRow}>
            {renderNumberButton('7')}
            {renderNumberButton('8')}
            {renderNumberButton('9')}
          </View>
          <View style={styles.keypadRow}>
            <View style={styles.emptyButton} />
            {renderNumberButton('0')}
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleDelete}
              disabled={isLoading || pin.length === 0}
            >
              <Icon 
                name="backspace-outline" 
                size={24} 
                color={pin.length > 0 ? colors.textPrimary : colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            PIN de prueba: 1234
          </Text>
          <TouchableOpacity
            style={styles.forgotPINButton}
            onPress={() => {
              Alert.alert(
                'Olvidaste tu PIN',
                'Por favor, usa el login tradicional con email y contraseña.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }}
          >
            <Text style={[styles.forgotPINText, { color: colors.primary }]}>
              ¿Olvidaste tu PIN?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  attemptsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
    gap: 16,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  keypad: {
    marginBottom: 32,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
  },
  emptyButton: {
    width: 70,
    height: 70,
  },
  deleteButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotPINButton: {
    paddingVertical: 8,
  },
  forgotPINText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PINVerificationScreen;
