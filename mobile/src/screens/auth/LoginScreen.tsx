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
import { Ionicons } from '@expo/vector-icons';
import googleAuthService from '../../services/googleAuth';
import biometricAuthService from '../../services/biometricAuth';
import authVerificationService from '../../services/authVerification';

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
      // Primero obtener la configuración de autenticación del usuario
      const settings = await getUserAuthSettings(email);
      
      if (!settings) {
        // Si no se puede obtener la configuración, intentar login normal
        await login(email, password);
        return;
      }

      // Verificar si el email está verificado
      if (settings.emailVerified === false) {
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
        return;
      }

      // Verificar GPS si está habilitado
      if (settings.gpsRequired) {
        navigation.navigate('GPSVerification', {
          onSuccess: () => {
            // Continuar con las siguientes verificaciones
            continueWithLogin(email, password, settings);
          }
        });
        return;
      }

      // Si no requiere GPS, continuar directamente
      continueWithLogin(email, password, settings);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error en el inicio de sesión');
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
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
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>
              Accede a tu cuenta de PiezasYA
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="admin@piezasyaya.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
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
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Alternative Login Options */}
            <View style={styles.alternativeContainer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continúa con</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.alternativeButtons}>
                {/* Google Login Button */}
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Continuar con Google</Text>
                </TouchableOpacity>

                                                          <TouchableOpacity
                          style={styles.alternativeButton}
                          onPress={handleBiometricLogin}
                          disabled={isBiometricLoading}
                        >
                          <Ionicons name="finger-print" size={20} color="#10B981" />
                          <Text style={styles.alternativeButtonText}>
                            {isBiometricLoading ? 'Verificando...' : 'Huella'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.alternativeButton}
                          onPress={() => navigation.navigate('PINVerification')}
                        >
                          <Ionicons name="keypad" size={20} color="#8B5CF6" />
                          <Text style={styles.alternativeButtonText}>PIN</Text>
                        </TouchableOpacity>
              </View>
            </View>

            {/* Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  ¿No tienes cuenta?{' '}
                  <Text style={styles.linkHighlight}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

              {/* Enlaces de ayuda */}
              <View style={styles.helpLinks}>
                <TouchableOpacity
                  style={styles.helpLink}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.helpLinkText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  passwordToggle: {
    position: 'absolute',
    right: 40,
    top: 12,
  },
  loginButton: {
    backgroundColor: '#FFC300',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeContainer: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  alternativeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alternativeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  alternativeButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  linksContainer: {
    marginTop: 24,
    gap: 12,
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  linkHighlight: {
    color: '#FFC300',
    fontWeight: '600',
  },
  helpLinks: {
    marginTop: 12,
  },
  helpLink: {
    alignItems: 'center',
  },
  helpLinkText: {
    color: '#FFC300',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
