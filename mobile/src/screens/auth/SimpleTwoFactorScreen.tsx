import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SimpleTwoFactorScreen: React.FC = () => {
  const { colors } = useTheme();
  const { setUser, setRequiresTwoFactor } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    try {
      setIsLoading(true);
      
      // Obtener el tempToken guardado
      const tempToken = await AsyncStorage.getItem('tempToken');
      if (!tempToken) {
        Alert.alert('Error', 'No se encontró el token temporal. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Simular verificación del código 2FA
      // En una implementación real, aquí harías la llamada al backend
      console.log('🔐 Verificando código 2FA:', code);
      console.log('🔐 Token temporal:', tempToken.substring(0, 20) + '...');
      
      // Simular éxito de verificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener el usuario pendiente
      const pendingUserData = await AsyncStorage.getItem('pendingUser');
      if (pendingUserData) {
        const pendingUser = JSON.parse(pendingUserData);
        
        // Establecer el usuario como autenticado
        setUser(pendingUser);
        await AsyncStorage.setItem('user', JSON.stringify(pendingUser));
        
        // Limpiar datos temporales
        await AsyncStorage.removeItem('tempToken');
        await AsyncStorage.removeItem('pendingUser');
        setRequiresTwoFactor(false);
        
        console.log('✅ Verificación 2FA exitosa, usuario autenticado:', pendingUser.email);
      } else {
        Alert.alert('Error', 'No se encontraron datos del usuario. Por favor, inicia sesión nuevamente.');
      }
      
    } catch (error) {
      console.error('❌ Error en verificación 2FA:', error);
      Alert.alert('Error', 'Error al verificar el código. Por favor, inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      console.log('🔄 Reenviando código 2FA...');
      // Aquí harías la llamada al backend para reenviar el código
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código de verificación a tu email.');
    } catch (error) {
      console.error('❌ Error reenviando código:', error);
      Alert.alert('Error', 'No se pudo reenviar el código. Por favor, inténtalo nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Verificación 2FA
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa el código de verificación que se envió a tu email
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border 
              }
            ]}
            placeholder="Código de verificación"
            placeholderTextColor={colors.textSecondary}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.verifyButton,
              { backgroundColor: colors.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
          >
            <Text style={[styles.resendText, { color: colors.primary }]}>
              Reenviar código
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
  },
  verifyButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SimpleTwoFactorScreen;
