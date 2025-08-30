import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authVerificationService from '../../services/authVerification';

interface PINVerificationScreenProps {
  navigation: any;
  route: any;
}

const PINVerificationScreen: React.FC<PINVerificationScreenProps> = ({ navigation, route }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const onSuccess = route.params?.onSuccess;

  const handleVerifyPIN = async () => {
    if (!pin || pin.length !== 4) {
      Alert.alert('Error', 'Por favor ingresa un PIN de 4 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      const result = await authVerificationService.verifyPIN(pin);
      
      if (result.success) {
        Alert.alert(
          'PIN Verificado',
          'PIN verificado correctamente.',
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
        Alert.alert('Error', result.error || 'PIN incorrecto');
        setPin('');
      }
    } catch (error) {
      console.error('❌ Error verificando PIN:', error);
      Alert.alert('Error', 'Error al verificar el PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const setupPIN = () => {
    Alert.prompt(
      'Configurar PIN',
      'Ingresa un PIN de 4 dígitos para tu cuenta:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async (newPin) => {
            if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
              try {
                setIsLoading(true);
                const result = await authVerificationService.savePIN(newPin);
                
                if (result.success) {
                  Alert.alert('Éxito', 'PIN configurado correctamente');
                } else {
                  Alert.alert('Error', result.error || 'Error al guardar el PIN');
                }
              } catch (error) {
                console.error('❌ Error guardando PIN:', error);
                Alert.alert('Error', 'Error al guardar el PIN');
              } finally {
                setIsLoading(false);
              }
            } else {
              Alert.alert('Error', 'El PIN debe tener exactamente 4 dígitos numéricos');
            }
          },
        },
      ],
      'secure-text',
      '',
      'numeric'
    );
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
            <Ionicons name="keypad" size={80} color="#FFC300" />
          </View>

          {/* Título */}
          <Text style={styles.title}>Verificar PIN</Text>

          {/* Descripción */}
          <Text style={styles.description}>
            Ingresa el PIN de 4 dígitos configurado para tu cuenta.
          </Text>

          {/* Input del PIN */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>PIN de seguridad</Text>
            <View style={styles.pinInputContainer}>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="0000"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry={!showPin}
                autoFocus
                textAlign="center"
                fontSize={24}
                letterSpacing={8}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPin(!showPin)}
              >
                <Ionicons
                  name={showPin ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de verificación */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, (!pin || pin.length !== 4) && styles.buttonDisabled]}
            onPress={handleVerifyPIN}
            disabled={isLoading || !pin || pin.length !== 4}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verificando...' : 'Verificar PIN'}
            </Text>
          </TouchableOpacity>

          {/* Botón para configurar PIN */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={setupPIN}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Configurar PIN</Text>
          </TouchableOpacity>

          {/* Botón de volver */}
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>¿Qué es el PIN?</Text>
            <Text style={styles.infoText}>
              • Es un código de 4 dígitos para acceso rápido{'\n'}
              • Más seguro que una contraseña simple{'\n'}
              • Se guarda localmente en tu dispositivo{'\n'}
              • Puedes cambiarlo en cualquier momento
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
  pinInputContainer: {
    position: 'relative',
  },
  pinInput: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 16,
    padding: 4,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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

export default PINVerificationScreen;
