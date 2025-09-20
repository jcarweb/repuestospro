import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from 'react-native-vector-icons/Icon';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('Por favor ingresa tu nombre', 'error');
      return false;
    }
    if (!formData.email.trim()) {
      showToast('Por favor ingresa tu correo electrónico', 'error');
      return false;
    }
    if (!formData.password) {
      showToast('Por favor ingresa una contraseña', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });
      
      // Navegar a la pantalla de verificación de email
      navigation.navigate('EmailVerification', { email: formData.email.trim() });
    } catch (error: any) {
      // El error ya se maneja en el AuthContext con toast
      console.log('Registration error handled by AuthContext');
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>Registrarse</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Crea tu cuenta en PiezasYA
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Nombre completo</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
                <Icon
                  name="person-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Correo electrónico</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Icon
                  name="mail-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Teléfono (opcional)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                  placeholder="+58 412 123 4567"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
                <Icon
                  name="call-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Contraseña</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Confirmar contraseña</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary }, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={[styles.registerButtonText, { color: colors.textPrimary }]}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                Al registrarte, aceptas nuestros{' '}
                <Text style={[styles.termsLink, { color: colors.primary }]}>Términos y Condiciones</Text>
                {' '}y{' '}
                <Text style={[styles.termsLink, { color: colors.primary }]}>Política de Privacidad</Text>
              </Text>
            </View>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={[styles.linkHighlight, { color: colors.primary }]}>Inicia sesión</Text>
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
    paddingVertical: 40,
  },
  content: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40,
  },
  input: {
    fontSize: 16,
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
  registerButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
  },
  loginLinkContainer: {
    marginTop: 24,
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
});

export default RegisterScreen;
