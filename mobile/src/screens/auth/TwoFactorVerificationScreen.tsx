import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TwoFactorVerificationScreenProps {
  navigation: any;
  route: any;
}

const TwoFactorVerificationScreen: React.FC<TwoFactorVerificationScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { setUser, setRequiresTwoFactor, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [code, setCode] = useState('');
  
  const email = route.params?.email || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
        showToast('Verificación exitosa', 'success');
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
    if (countdown > 0) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Reenviando código 2FA...');
      // Aquí harías la llamada al backend para reenviar el código
      showToast('Código de verificación reenviado', 'success');
      setCountdown(60); // 60 segundos de espera
    } catch (error: any) {
      showToast(error.message || 'Error al reenviar el código', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Limpiar datos temporales
      await AsyncStorage.removeItem('tempToken');
      await AsyncStorage.removeItem('pendingUser');
      setRequiresTwoFactor(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Verificación 2FA
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hemos enviado un código de verificación a tu email
          </Text>
          
          {email && (
            <Text style={[styles.email, { color: colors.primary }]}>
              {email}
            </Text>
          )}
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Código de verificación
          </Text>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border 
              }
            ]}
            placeholder="Ingresa el código de 6 dígitos"
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

          <View style={styles.resendContainer}>
            <TouchableOpacity
              style={[
                styles.resendButton,
                countdown > 0 && styles.resendButtonDisabled
              ]}
              onPress={handleResendCode}
              disabled={countdown > 0 || isLoading}
            >
              <Text style={[
                styles.resendText,
                { color: countdown > 0 ? colors.textSecondary : colors.primary }
              ]}>
                {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.logoutText, { color: colors.textSecondary }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  resendContainer: {
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default TwoFactorVerificationScreen;
