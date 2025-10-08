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
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import biometricAuthService from '../../services/biometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PinLoginModal from '../../components/PinLoginModal';
import { BackendSwitcher } from '../../components/BackendSwitcher';
import ConnectionIndicator from '../../components/ConnectionIndicator';

interface SimplifiedLoginScreenProps {
  navigation: any;
}

interface SavedUser {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  lastLogin: string;
}

const SimplifiedLoginScreen: React.FC<SimplifiedLoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showBackendSwitcher, setShowBackendSwitcher] = useState(false);
  
  const { login, isLoading, error, clearError, getSavedUser, saveUser, user } = useAuth();
  const { colors, isDark } = useTheme();

  // Cargar usuario guardado al iniciar
  useEffect(() => {
    loadSavedUser();
    checkBiometricAvailability();
  }, []);

  // Sincronizar imagen del AuthContext con usuario persistente
  useEffect(() => {
    if (savedUser && user && (user.profileImage || user.avatar)) {
      const avatarUrl = user.profileImage || user.avatar;
      
      // Solo actualizar si el avatar es diferente o no existe
      if (savedUser.avatar !== avatarUrl) {
        const userWithImage = {
          ...savedUser,
          avatar: avatarUrl
        };
        setSavedUser(userWithImage);
      }
    }
  }, [user, savedUser]);

  // Detectar cuando el usuario se autentica exitosamente
  useEffect(() => {
    if (user) {
      console.log('🎉 Usuario autenticado detectado en SimplifiedLoginScreen:', user.email, user.role);
      console.log('🎉 El AppNavigator debería navegar al dashboard ahora');
    }
  }, [user]);

  const loadSavedUser = async () => {
    try {
      const userData = await getSavedUser();
      if (userData) {
        setSavedUser(userData);
        console.log('✅ Usuario persistente cargado:', userData.name);
      }
    } catch (error) {
      console.error('❌ Error cargando usuario guardado:', error);
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

  // Ya no necesitamos esta función porque la imagen se guarda directamente en AuthContext

  const handlePasswordLogin = async () => {
    const userEmail = savedUser ? savedUser.email : email;
    
    if (!userEmail) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    try {
      console.log('🔄 Iniciando login para:', userEmail);
      const loginResult = await login(userEmail, password);
      console.log('✅ Login completado, resultado:', loginResult);
      
      if (rememberMe) {
        await AsyncStorage.setItem('savedCredentials', JSON.stringify({ 
          email: userEmail, 
          password 
        }));
        
        // El login ya guardó el usuario con imagen en AuthContext
        // Solo necesitamos guardar los datos básicos para persistencia
        await saveUser({
          name: userEmail.split('@')[0], // Usar parte del email como nombre
          email: userEmail,
          avatar: undefined, // Se usará la imagen del AuthContext si está disponible
          role: 'client', // Rol por defecto
        });
        
        console.log('✅ Usuario guardado para persistencia:', userEmail.split('@')[0]);
      }
      
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    }
  };

  const handleBiometricLogin = async () => {
    if (!savedUser) {
      Alert.alert('Error', 'No hay usuario guardado');
      return;
    }

    try {
      setIsBiometricLoading(true);
      
      const savedCredentials = await AsyncStorage.getItem('savedCredentials');
      if (!savedCredentials) {
        Alert.alert('Error', 'No hay credenciales guardadas para autenticación biométrica');
        return;
      }

      const credentials = JSON.parse(savedCredentials);
      
      const biometricResult = await biometricAuthService.authenticate();
      
      if (biometricResult.success) {
        await login(credentials.email, credentials.password);
        
        // Actualizar usuario guardado (mantener datos existentes)
        await saveUser({
          name: savedUser.name,
          email: credentials.email,
          avatar: savedUser.avatar,
          role: savedUser.role,
        });
        
        console.log('✅ Login biométrico exitoso, usuario actualizado:', savedUser.name);
      } else {
        Alert.alert('Error', 'Autenticación biométrica fallida');
      }
    } catch (error: any) {
      console.error('❌ Error en login biométrico:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión con biometría');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handlePinLogin = async (pin: string) => {
    if (!savedUser) {
      Alert.alert('Error', 'No hay usuario guardado');
      return;
    }

    try {
      const savedCredentials = await AsyncStorage.getItem('savedCredentials');
      if (!savedCredentials) {
        Alert.alert('Error', 'No hay credenciales guardadas para autenticación con PIN');
        return;
      }

      const credentials = JSON.parse(savedCredentials);
      
      await login(credentials.email, credentials.password);
      
      // Actualizar usuario guardado (mantener datos existentes)
      await saveUser({
        name: savedUser.name,
        email: credentials.email,
        avatar: savedUser.avatar,
        role: savedUser.role,
      });
      
      console.log('✅ Login con PIN exitoso, usuario actualizado:', savedUser.name);
      setShowPinModal(false);
    } catch (error: any) {
      console.error('❌ Error en login con PIN:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión con PIN');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleNewAccount = () => {
    navigation.navigate('Register');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cambiar Usuario',
      '¿Estás seguro de que quieres cambiar de usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cambiar Usuario', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('savedUser');
              await AsyncStorage.removeItem('savedCredentials');
              setSavedUser(null);
              setPassword('');
              
              Alert.alert(
                'Usuario Cambiado',
                'Ahora puedes iniciar sesión con una cuenta diferente',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error cambiando usuario:', error);
              Alert.alert('Error', 'No se pudo cambiar el usuario');
            }
          }
        }
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
    const maskedDomain = domain.charAt(0) + '*'.repeat(domain.length - 2) + domain.charAt(domain.length - 1);
    return `${maskedLocal}@${maskedDomain}`;
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo-piezasya-light.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRight}>
            <ConnectionIndicator size="small" />
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => setShowBackendSwitcher(true)}
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Top Section */}
          <View style={styles.topSection}>
            {savedUser ? (
              /* Usuario Persistente - Mostrar Perfil */
              <View style={styles.userContainer}>
                <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                  {getGreeting()}
                </Text>
                
                <View style={styles.profileContainer}>
                  {savedUser.avatar ? (
                    <Image
                      source={{ uri: savedUser.avatar }}
                      style={styles.profileImageLarge}
                    />
                  ) : (
                    <View style={[styles.profileImageLarge, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {savedUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>
                    {savedUser.name}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    {maskEmail(savedUser.email)}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.quickChangeUserButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.quickChangeUserText}>Cambiar Usuario</Text>
                  </TouchableOpacity>
                  
                </View>
              </View>
            ) : (
              /* Sin Usuario - Mostrar Logo */
              <View style={styles.logoSection}>
                {/* Logo central comentado para mostrar al cliente */}
                {/* <Image
                  source={require('../../../assets/logo-piezasya-light.png')}
                  style={styles.logoImageLarge}
                  resizeMode="contain"
                /> */}
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                  Bienvenido
                </Text>
              </View>
            )}
          </View>

          {/* Middle Section - Login Form */}
          <View style={styles.middleSection}>
            {/* Email Input - Solo mostrar si no hay usuario persistente */}
            {!savedUser && (
              <View style={styles.emailContainer}>
                <Text style={[styles.inputLabel, { color: '#FFFFFF' }]}>
                  Email
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.emailInput, { 
                      borderColor: colors.border,
                      color: '#FFFFFF',
                      backgroundColor: colors.surface 
                    }]}
                    placeholder="Ingresa tu email"
                    placeholderTextColor="#CCCCCC"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <Text style={[styles.inputLabel, { color: '#FFFFFF' }]}>
                Contraseña
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { 
                    borderColor: colors.border,
                    color: '#FFFFFF',
                    backgroundColor: colors.surface 
                  }]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#CCCCCC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <View style={styles.loginRow}>
                <TouchableOpacity 
                  style={[styles.loginButton, { backgroundColor: colors.primary, flex: 1, marginRight: 8 }]}
                  onPress={handlePasswordLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>INGRESAR</Text>
                  )}
                </TouchableOpacity>

                {biometricAvailable && (
                  <TouchableOpacity 
                    style={[styles.biometricButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={handleBiometricLogin}
                    disabled={isBiometricLoading}
                  >
                    {isBiometricLoading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Ionicons name="finger-print" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.pinButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowPinModal(true)}
                >
                  <Ionicons name="keypad" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
              <Text style={[styles.rememberText, { color: '#FFFFFF' }]}>
                Recuérdame
              </Text>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* New Account */}
            <TouchableOpacity 
              style={styles.newAccountButton}
              onPress={handleNewAccount}
            >
              <Text style={[styles.newAccountText, { color: colors.primary }]}>
                ABRIR CUENTA NUEVA
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      {/* Backend Switcher Modal */}
      <Modal
        visible={showBackendSwitcher}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBackendSwitcher(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowBackendSwitcher(false)}
            >
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <BackendSwitcher />
          </View>
        </View>
      </Modal>

      {/* PIN Login Modal */}
      <PinLoginModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinLogin}
      />

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flex: 1,
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  userContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoImageLarge: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  middleSection: {
    flex: 3,
    justifyContent: 'center',
  },
  emailContainer: {
    marginBottom: 16,
  },
  passwordContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  emailInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biometricButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pinButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  newAccountButton: {
    marginBottom: 16,
  },
  newAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  quickChangeUserButton: {
    backgroundColor: '#fbbf24', // Amarillo
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'center',
  },
  quickChangeUserText: {
    color: '#1f2937', // Gris oscuro para contraste
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SimplifiedLoginScreen;