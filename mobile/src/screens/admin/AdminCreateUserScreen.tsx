import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from 'react-native-vector-icons/Icon';

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client' | 'delivery' | 'store_manager';
  password: string;
  confirmPassword: string;
}

const AdminCreateUserScreen: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const isAdmin = user?.role === 'admin';

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast('El nombre es requerido', 'error');
      return false;
    }

    if (!formData.email.trim()) {
      showToast('El email es requerido', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('El email no es válido', 'error');
      return false;
    }

    if (!formData.password) {
      showToast('La contraseña es requerida', 'error');
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Crear Usuario',
      `¿Estás seguro de que quieres crear el usuario ${formData.name} con rol ${formData.role}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Aquí harías la llamada a la API para crear el usuario
              // const response = await createUser(formData);
              
              // Simular llamada a API
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              showToast('Usuario creado exitosamente', 'success');
              
              // Limpiar formulario
              setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'client',
                password: '',
                confirmPassword: '',
              });
              
            } catch (error) {
              console.error('Error creating user:', error);
              showToast('Error al crear el usuario', 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#FF3B30';
      case 'store_manager': return '#007AFF';
      case 'delivery': return '#34C759';
      case 'client': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'store_manager': return 'Gestor de Tienda';
      case 'delivery': return 'Delivery';
      case 'client': return 'Cliente';
      default: return 'Desconocido';
    }
  };

  // Verificar si el usuario es admin
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <Text style={styles.title}>Crear Usuario</Text>
        <Text style={styles.subtitle}>
          Agregar nuevo usuario al sistema
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Ej: juan@example.com"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Ej: +584121234567"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Rol */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rol del Usuario</Text>
            
            <View style={styles.roleContainer}>
              {(['client', 'delivery', 'store_manager', 'admin'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && { backgroundColor: getRoleColor(role) }
                  ]}
                  onPress={() => handleInputChange('role', role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === role && { color: '#fff' }
                  ]}>
                    {getRoleText(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contraseña</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Repetir contraseña"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botón de envío */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Crear Usuario</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminCreateUserScreen;
