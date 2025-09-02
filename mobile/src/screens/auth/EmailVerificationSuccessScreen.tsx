import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface EmailVerificationSuccessScreenProps {
  navigation: any;
}

const EmailVerificationSuccessScreen: React.FC<EmailVerificationSuccessScreenProps> = ({ 
  navigation 
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    // Mostrar mensaje de éxito cuando se carga la pantalla
    showToast('¡Email verificado exitosamente!', 'success');
  }, []);

  const handleGoToLogin = async () => {
    try {
      // Asegurar que el usuario esté deslogueado para poder hacer login
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigation.navigate('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Icono de éxito */}
        <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        {/* Título y mensaje */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            ¡Email Verificado!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tu cuenta ha sido verificada exitosamente
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Ahora puedes iniciar sesión y disfrutar de todos los servicios de PiezasYA
          </Text>
        </View>

        {/* Botón para ir al login */}
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleGoToLogin}
        >
          <Text style={[styles.loginButtonText, { color: colors.textPrimary }]}>
            Ir al Inicio de Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailVerificationSuccessScreen;
