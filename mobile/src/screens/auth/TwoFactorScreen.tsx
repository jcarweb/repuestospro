import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authVerificationService from '../../services/authVerification';

interface TwoFactorScreenProps {
  navigation: any;
  route: any;
}

const TwoFactorScreen: React.FC<TwoFactorScreenProps> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const email = route.params?.email;
  const onSuccess = route.params?.onSuccess;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      const result = await authVerificationService.verifyTwoFactorCode(code, email);
      
      if (result.success) {
        Alert.alert(
          'Verificación Exitosa',
          'Código de doble factor verificado correctamente.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                }
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Código inválido');
        setCode('');
      }
    } catch (error) {
      console.error('❌ Error verificando código 2FA:', error);
      Alert.alert('Error', 'Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setIsLoading(true);
      // Aquí deberías hacer una llamada al backend para reenviar el código
      Alert.alert(
        'Código Reenviado',
        'Se ha reenviado el código de verificación a tu aplicación Google Authenticator.',
        [{ text: 'Entendido', style: 'default' }]
      );
      
      setTimeLeft(30);
      setCanResend(false);
    } catch (error) {
      console.error('❌ Error reenviando código:', error);
      Alert.alert('Error', 'Error al reenviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {/* Icono */}
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#FFC300" />
          </View>

          {/* Título */}
          <Text style={styles.title}>Doble Factor de Autenticación</Text>

          {/* Descripción */}
          <Text style={styles.description}>
            Ingresa el código de 6 dígitos que aparece en tu aplicación Google Authenticator.
          </Text>

          {/* Input del código */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código de verificación</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textAlign="center"
              fontSize={24}
              letterSpacing={8}
            />
          </View>

          {/* Botón de verificación */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, (!code || code.length !== 6) && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={isLoading || !code || code.length !== 6}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Text>
          </TouchableOpacity>

          {/* Timer y reenvío */}
          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Reenviar código en: {formatTime(timeLeft)}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={resendCode}
                disabled={isLoading}
              >
                <Text style={styles.resendButtonText}>Reenviar código</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botón de volver */}
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>¿No tienes Google Authenticator?</Text>
            <Text style={styles.infoText}>
              • Descarga Google Authenticator desde la App Store{'\n'}
              • Escanea el código QR que se te proporcionó{'\n'}
              • O ingresa manualmente la clave secreta{'\n'}
              • El código cambia cada 30 segundos
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FFC300',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendButtonText: {
    color: '#FFC300',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default TwoFactorScreen;
