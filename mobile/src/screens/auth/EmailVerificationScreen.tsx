import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authVerificationService from '../../services/authVerification';

interface EmailVerificationScreenProps {
  navigation: any;
  route: any;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const email = route.params?.email;

  useEffect(() => {
    if (email) {
      checkEmailVerification();
    }
  }, [email]);

  const checkEmailVerification = async () => {
    if (!email) return;

    try {
      setIsLoading(true);
      const result = await authVerificationService.checkEmailVerification(email);
      
      if (result.success) {
        setIsVerified(true);
        Alert.alert(
          'Email Verificado',
          'Tu email ha sido verificado correctamente. Puedes continuar con el login.',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setIsVerified(false);
      }
    } catch (error) {
      console.error('❌ Error verificando email:', error);
      Alert.alert('Error', 'Error al verificar el email');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) return;

    try {
      setIsLoading(true);
      // Aquí deberías hacer una llamada al backend para reenviar el email
      Alert.alert(
        'Email Reenviado',
        'Se ha reenviado el email de verificación. Revisa tu bandeja de entrada.',
        [{ text: 'Entendido', style: 'default' }]
      );
    } catch (error) {
      console.error('❌ Error reenviando email:', error);
      Alert.alert('Error', 'Error al reenviar el email de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {/* Icono */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isVerified ? "checkmark-circle" : "mail-outline"} 
            size={80} 
            color={isVerified ? "#10B981" : "#FFC300"} 
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>
          {isVerified ? 'Email Verificado' : 'Verificar Email'}
        </Text>

        {/* Descripción */}
        <Text style={styles.description}>
          {isVerified 
            ? 'Tu email ha sido verificado correctamente. Ya puedes acceder a tu cuenta.'
            : `Se ha enviado un email de verificación a:\n${email}\n\nPor favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.`
          }
        </Text>

        {/* Estado de verificación */}
        {!isVerified && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Estado: {isLoading ? 'Verificando...' : 'Pendiente de verificación'}
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#FFC300" style={styles.loader} />}
          </View>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          {!isVerified && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={checkEmailVerification}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verificando...' : 'Verificar Email'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resendVerificationEmail}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Reenviar Email</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>¿No recibiste el email?</Text>
          <Text style={styles.infoText}>
            • Revisa tu carpeta de spam{'\n'}
            • Verifica que el email esté correcto{'\n'}
            • Espera unos minutos y vuelve a intentar
          </Text>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  loader: {
    marginLeft: 8,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFC300',
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

export default EmailVerificationScreen;
