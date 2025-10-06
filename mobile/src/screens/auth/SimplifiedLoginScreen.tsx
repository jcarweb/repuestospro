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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showBackendSwitcher, setShowBackendSwitcher] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuth();
  const { colors, isDark } = useTheme();

  // Cargar usuario guardado al iniciar
  useEffect(() => {
    loadSavedUser();
    checkBiometricAvailability();
  }, []);

  // Cargar datos del usuario persistente
  useEffect(() => {
    if (savedUser) {
      // El usuario ya está guardado, mostrar pantalla simplificada
      console.log('👤 Usuario persistente cargado:', savedUser.name);
    }
  }, [savedUser]);

  const loadSavedUser = async () => {
    try {
      // Usar el servicio de persistencia del AuthContext
      const { getSavedUser } = useAuth();
      const userData = await getSavedUser();
      if (userData) {
        setSavedUser(userData);
        console.log('👤 Usuario persistente cargado:', userData.name);
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

  const handlePasswordLogin = async () => {
    if (!savedUser) {
      Alert.alert('Error', 'No hay usuario guardado');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    try {
      await login(savedUser.email, password);
      
      if (rememberMe) {
        // Guardar credenciales para uso futuro
        await AsyncStorage.setItem('savedCredentials', JSON.stringify({ 
          email: savedUser.email, 
          password 
        }));
        
        // Guardar usuario en persistencia
        const { saveUser } = useAuth();
        await saveUser({
          name: savedUser.name,
          email: savedUser.email,
          avatar: savedUser.avatar,
          role: savedUser.role,
        });
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
      
      // Obtener credenciales guardadas
      const savedCredentials = await AsyncStorage.getItem('savedCredentials');
      if (!savedCredentials) {
        Alert.alert('Error', 'No hay credenciales guardadas para autenticación biométrica');
        return;
      }

      const credentials = JSON.parse(savedCredentials);
      
      // Autenticar con biometría
      const biometricResult = await biometricAuthService.authenticate();
      
      if (biometricResult.success) {
        await login(credentials.email, credentials.password);
        console.log('✅ Login biométrico exitoso');
      } else {
        Alert.alert('Error', 'Autenticación biométrica fallida');
      }
      
    } catch (error: any) {
      console.error('❌ Error en login biométrico:', error);
      Alert.alert('Error', 'Error en autenticación biométrica');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handlePinLogin = () => {
    setShowPinModal(true);
  };

  const handlePinSuccess = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials.email, credentials.password);
      setShowPinModal(false);
    } catch (error: any) {
      console.error('❌ Error en login con PIN:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      '¿Deseas recuperar tu contraseña?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Recuperar', 
          onPress: () => {
            // TODO: Implementar recuperación de contraseña
            Alert.alert('Próximamente', 'Función de recuperación de contraseña en desarrollo');
          }
        }
      ]
    );
  };

  const handleNewAccount = () => {
    navigation.navigate('Register');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cambiar Usuario',
      '¿Deseas iniciar sesión con una cuenta diferente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cambiar Usuario', 
          onPress: async () => {
            try {
              // Limpiar datos del usuario actual
              await AsyncStorage.removeItem('savedUser');
              await AsyncStorage.removeItem('savedCredentials');
              setSavedUser(null);
              setPassword('');
              
              // Mostrar mensaje de confirmación
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

  if (!savedUser) {
    // Si no hay usuario guardado, mostrar pantalla de login tradicional
    return (
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: colors.primary }]}>
              PiezasYa
            </Text>
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

          {/* Login Form */}
          <View style={styles.loginContainer}>
            <Text style={[styles.title, { color: colors.text, fontWeight: 'bold', fontSize: 20 }]}>
              Iniciar Sesión
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { 
                  borderBottomColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value=""
                onChangeText={() => {}}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { 
                  borderBottomColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value=""
                onChangeText={() => {}}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                onPress={() => {}}
              >
                <Text style={styles.loginButtonText}>INGRESAR</Text>
              </TouchableOpacity>

              {biometricAvailable && (
                <TouchableOpacity 
                  style={[styles.biometricButton, { backgroundColor: colors.secondary }]}
                  onPress={() => {}}
                >
                  <Ionicons name="finger-print" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.rememberContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              <Text style={[styles.rememberText, { color: colors.text, fontWeight: '600', fontSize: 16 }]}>
                Recuérdame
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.newAccountButton}
              onPress={handleNewAccount}
            >
              <Text style={[styles.newAccountText, { color: colors.primary }]}>
                ABRIR CUENTA NUEVA
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Backend Switcher Modal */}
        <Modal
          visible={showBackendSwitcher}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <BackendSwitcher onClose={() => setShowBackendSwitcher(false)} />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: colors.primary }]}>
              PiezasYa
            </Text>
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
                <Text style={[styles.greeting, { color: colors.text }]}>
                  {getGreeting()}
                </Text>
                
                <View style={styles.profileContainer}>
                  <Image
                    source={{ 
                      uri: savedUser.avatar || 'https://via.placeholder.com/100/6366f1/ffffff?text=' + savedUser.name.charAt(0)
                    }}
                    style={styles.profileImageLarge}
                  />
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {savedUser.name}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    {maskEmail(savedUser.email)}
                  </Text>
                  
                  {/* Quick Change User Button */}
                  <TouchableOpacity 
                    style={styles.quickChangeUserButton}
                    onPress={handleLogout}
                  >
                    <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                    <Text style={[styles.quickChangeUserText, { color: colors.primary }]}>
                      Cambiar Usuario
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Sin Usuario - Mostrar Logo */
              <View style={styles.logoSection}>
                <Text style={[styles.logoText, { color: colors.primary, fontSize: 32 }]}>
                  PiezasYa
                </Text>
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                  Bienvenido
                </Text>
              </View>
            )}
          </View>

          {/* Middle Section - Login Form */}
          <View style={styles.middleSection}>
            {/* Password Input */}
            <View style={styles.passwordContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                borderBottomColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoFocus={true}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
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
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handlePasswordLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity 
              style={[styles.biometricButton, { backgroundColor: colors.secondary }]}
              onPress={handleBiometricLogin}
              disabled={isBiometricLoading}
            >
              {isBiometricLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="finger-print" size={24} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* PIN Login Option */}
        <TouchableOpacity 
          style={styles.pinButton}
          onPress={handlePinLogin}
        >
          <Ionicons name="keypad" size={20} color={colors.primary} />
          <Text style={[styles.pinButtonText, { color: colors.primary }]}>
            Usar PIN
          </Text>
        </TouchableOpacity>

        {/* Remember Me */}
        <View style={styles.rememberContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && (
              <Ionicons name="checkmark" size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.rememberText, { color: colors.text }]}>
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

              {/* Change User Option */}
              <TouchableOpacity 
                style={styles.changeUserButton}
                onPress={handleLogout}
              >
                <Ionicons name="person-add" size={20} color={colors.primary} />
                <Text style={[styles.changeUserText, { color: colors.primary }]}>
                  Cambiar Usuario
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <PinLoginModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Backend Switcher Modal */}
      <Modal
        visible={showBackendSwitcher}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <BackendSwitcher onClose={() => setShowBackendSwitcher(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    marginTop: 20,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 2,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  chatButton: {
    padding: 8,
    marginLeft: 8,
  },
  userContainer: {
    alignItems: 'center',
    marginVertical: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    marginTop: 8,
  },
  quickChangeUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  quickChangeUserText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  passwordContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 12,
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  pinButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
  },
  newAccountButton: {
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  newAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  changeUserText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
});

export default SimplifiedLoginScreen;
