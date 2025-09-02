import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import googleAuthService from '../../services/googleAuth';
import biometricAuthService from '../../services/biometricAuth';
import authVerificationService from '../../services/authVerification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileVerificationService from '../../services/mobileVerification';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [userAuthSettings, setUserAuthSettings] = useState<any>(null);
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const { colors, isDark } = useTheme();

  // Verificar disponibilidad de autenticación biométrica al cargar
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Función para obtener configuración de autenticación del usuario
  const getUserAuthSettings = async (userEmail: string) => {
    try {
      const settings = await authVerificationService.getUserAuthSettings(userEmail);
      setUserAuthSettings(settings);
      return settings;
    } catch (error) {
      console.error('❌ Error obteniendo configuración de usuario:', error);
      return null;
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const available = await biometricAuthService.isAvailable();
      setBiometricAvailable(available);
      console.log('🔐 Biometric Auth disponible:', available);
    } catch (error) {
      console.error('❌ Error verificando biometría:', error);
      setBiometricAvailable(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      // Verificar si el email está verificado en la app móvil
      const isVerified = await mobileVerificationService.isEmailVerifiedInMobile(email);
      
      if (isVerified) {
        // Usuario ya verificado en móvil, hacer login directamente
        await login(email, password);
        return;
      }

      // Si no está verificado, intentar login normal
      await login(email, password);
      
    } catch (error: any) {
      // Si el error es de email no verificado, mostrar opción de verificación
      if (error.message && error.message.includes('verificado')) {
        Alert.alert(
          'Email No Verificado',
          'Tu email no ha sido verificado. Debes verificar tu email antes de continuar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Verificar Email', 
              onPress: () => navigation.navigate('EmailVerification', { email }) 
            }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Error en el inicio de sesión');
      }
    }
  };

  const continueWithLogin = async (userEmail: string, userPassword: string, settings: any) => {
    try {
      // Verificar doble factor si está habilitado
      if (settings.twoFactorEnabled) {
        navigation.navigate('TwoFactor', {
          email: userEmail,
          onSuccess: () => {
            // Continuar con login después de 2FA
            performFinalLogin(userEmail, userPassword);
          }
        });
        return;
      }

      // Verificar PIN si está habilitado
      if (settings.pinEnabled) {
        navigation.navigate('PINVerification', {
          onSuccess: () => {
            // Continuar con login después de PIN
            performFinalLogin(userEmail, userPassword);
          }
        });
        return;
      }

      // Si no hay verificaciones adicionales, hacer login directamente
      performFinalLogin(userEmail, userPassword);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error en el proceso de verificación');
    }
  };

  const performFinalLogin = async (userEmail: string, userPassword: string) => {
    try {
      await login(userEmail, userPassword);
      // La navegación se manejará automáticamente en el AuthProvider
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error en el inicio de sesión');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔐 Iniciando login con Google...');
      
      // Verificar si Google Auth está disponible
      if (!googleAuthService.isAvailable()) {
        Alert.alert('Error', 'Login con Google no disponible en este dispositivo');
        return;
      }

      // Mostrar mensaje de que está en desarrollo
      Alert.alert(
        'Login con Google en Desarrollo',
        'El login con Google está configurado pero necesita ajustes adicionales. Por ahora, usa el login tradicional con email y contraseña.',
        [
          { text: 'Entendido', style: 'default' }
        ]
      );

      // Comentado temporalmente hasta resolver el error 400
      /*
      // Iniciar autenticación con Google
      const googleUser = await googleAuthService.signInWithGoogle();
      
      if (googleUser) {
        console.log('✅ Usuario de Google obtenido:', googleUser.email);
        
        // Login con el backend usando la información de Google
        await loginWithGoogle('google_token', {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        });
        
        console.log('✅ Login con Google exitoso');
      } else {
        console.log('❌ No se pudo obtener información del usuario de Google');
        Alert.alert('Error', 'No se pudo completar el login con Google');
      }
      */
    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);
      Alert.alert('Error', error.message || 'Error en el login con Google');
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        'Huella Dactilar No Disponible',
        'La autenticación biométrica no está disponible en este dispositivo o no tienes huellas configuradas.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    try {
      setIsBiometricLoading(true);
      
      const result = await biometricAuthService.authenticate();
      
      if (result.success) {
        // Verificar si la biometría está habilitada para el usuario
        const biometricEnabled = await authVerificationService.isBiometricEnabled();
        
        if (biometricEnabled) {
          // Aquí podrías implementar el login automático con credenciales guardadas
          Alert.alert(
            'Autenticación Exitosa',
            'Huella dactilar verificada correctamente. Por ahora, usa el login tradicional.',
            [{ text: 'Entendido', style: 'default' }]
          );
        } else {
          Alert.alert(
            'Biometría No Configurada',
            'La autenticación biométrica no está configurada para tu cuenta. Usa el login tradicional.',
            [{ text: 'Entendido', style: 'default' }]
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Error en la autenticación biométrica');
      }
    } catch (error: any) {
      console.error('❌ Error en login biométrico:', error);
      Alert.alert('Error', 'Error inesperado en la autenticación biométrica');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo-piezasya-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Iniciar Sesión</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Accede a tu cuenta de PiezasYA
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.surface,
                    color: colors.textPrimary 
                  }]}
                  placeholder="admin@piezasyaya.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.surface,
                    color: colors.textPrimary 
                  }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton, 
                { backgroundColor: colors.primary },
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, { color: isDark ? '#000000' : '#111827' }]}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Alternative Login Options */}
            <View style={styles.alternativeContainer}>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderSecondary }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>o continúa con</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderSecondary }]} />
              </View>

              <View style={styles.alternativeButtons}>
                {/* Google Login Button - Full Width */}
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#4285F4' }]}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Continuar con Google</Text>
                </TouchableOpacity>

                {/* Biometric and PIN Buttons - Side by Side */}
                <View style={styles.secondaryButtonsRow}>
                  <TouchableOpacity
                    style={[styles.alternativeButton, { 
                      borderColor: colors.border, 
                      backgroundColor: colors.surface 
                    }]}
                    onPress={handleBiometricLogin}
                    disabled={isBiometricLoading}
                  >
                    <Ionicons name="finger-print" size={20} color={colors.success} />
                    <Text style={[styles.alternativeButtonText, { color: colors.textPrimary }]}>
                      {isBiometricLoading ? 'Verificando...' : 'Huella'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.alternativeButton, { 
                      borderColor: colors.border, 
                      backgroundColor: colors.surface 
                    }]}
                    onPress={() => navigation.navigate('PINVerification')}
                  >
                    <Ionicons name="keypad" size={20} color="#8B5CF6" />
                    <Text style={[styles.alternativeButtonText, { color: colors.textPrimary }]}>PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.linkButton}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  ¿No tienes cuenta?{' '}
                  <Text style={[styles.linkHighlight, { color: colors.primary }]}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

              {/* Enlaces de ayuda */}
              <View style={styles.helpLinks}>
                <TouchableOpacity
                  style={styles.helpLink}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={[styles.helpLinkText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Botón temporal para limpiar verificación móvil (solo para testing) */}
              <TouchableOpacity
                style={styles.clearDataButton}
                onPress={async () => {
                  try {
                    await mobileVerificationService.clearMobileVerification();
                    Alert.alert('Datos Limpiados', 'La verificación móvil ha sido limpiada. Puedes probar el flujo completo nuevamente.');
                  } catch (error) {
                    console.error('Error clearing mobile verification:', error);
                  }
                }}
              >
                <Text style={[styles.clearDataText, { color: colors.error }]}>
                  🧹 Limpiar Verificación Móvil (Testing)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20, // Reducido de 40 a 20
  },
  content: {
    borderRadius: 12,
    padding: 20, // Reducido de 24 a 20
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24, // Reducido de 40 a 24
  },
  logo: {
    width: 160, // Reducido de 200 a 160
    height: 80, // Reducido de 100 a 80
  },
  header: {
    alignItems: 'center',
    marginBottom: 20, // Reducido de 32 a 20
  },
  title: {
    fontSize: 24, // Reducido de 28 a 24
    fontWeight: 'bold',
    marginBottom: 6, // Reducido de 8 a 6
  },
  subtitle: {
    fontSize: 14, // Reducido de 16 a 14
    textAlign: 'center',
  },
  form: {
    gap: 16, // Reducido de 20 a 16
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10, // Reducido de 12 a 10
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    gap: 6, // Reducido de 8 a 6
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10, // Reducido de 12 a 10
    paddingRight: 40,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 10, // Ajustado para el nuevo padding
  },
  passwordToggle: {
    position: 'absolute',
    right: 40,
    top: 10, // Ajustado para el nuevo padding
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 12, // Reducido de 14 a 12
    alignItems: 'center',
    marginTop: 6, // Reducido de 8 a 6
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeContainer: {
    marginTop: 16, // Reducido de 24 a 16
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Reducido de 20 a 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  alternativeButtons: {
    flexDirection: 'column',
    gap: 12, // Reducido de 16 a 12
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  alternativeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12, // Reducido de 14 a 12
    paddingHorizontal: 16,
    gap: 8,
  },
  alternativeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10, // Reducido de 12 a 10
    paddingHorizontal: 16,
    gap: 8,
    width: '100%',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 16, // Reducido de 24 a 16
    gap: 8, // Reducido de 12 a 8
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
  },
  linkHighlight: {
    fontWeight: '600',
  },
  helpLinks: {
    marginTop: 8, // Reducido de 12 a 8
  },
  helpLink: {
    alignItems: 'center',
  },
  helpLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  clearDataButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000', // Color rojo para indicar que es un botón de limpieza
  },
  clearDataText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
