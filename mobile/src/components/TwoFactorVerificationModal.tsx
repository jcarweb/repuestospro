import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

interface TwoFactorVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (code: string) => void;
  onUseBackupCode: () => void;
  userEmail?: string;
}

const TwoFactorVerificationModal: React.FC<TwoFactorVerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onUseBackupCode,
  userEmail,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible && !useBackup) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible, useBackup]);

  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setBackupCode('');
      setUseBackup(false);
      setTimeLeft(30);
      setError(null);
    }
  }, [visible]);

  const handleVerifyCode = async () => {
    console.log('Verificando código 2FA:', { useBackup, verificationCode, backupCode });
    console.log('userEmail recibido:', userEmail);
    
    // Limpiar error anterior
    setError(null);
    
    if (useBackup) {
      if (backupCode.length < 6) {
        setError('El código de respaldo debe tener al menos 6 caracteres');
        return;
      }
    } else {
      if (verificationCode.length !== 6) {
        setError('El código debe tener 6 dígitos');
        return;
      }
    }

    setLoading(true);
    try {
      const codeToVerify = useBackup ? backupCode : verificationCode;
      
      // Usar el servicio de API real para verificar 2FA
      const { default: apiService } = await import('../services/api');
      
      // Usar el email del usuario pasado como prop
      if (!userEmail) {
        setError('Error: No se encontró información del usuario');
        return;
      }
      
      console.log('Usuario encontrado para 2FA:', userEmail);
      
      // Obtener el tempToken
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const tempToken = await AsyncStorage.getItem('tempToken');
      console.log('TempToken encontrado:', tempToken ? 'Sí' : 'No');
      
      const response = await apiService.verifyTwoFactor({
        email: userEmail,
        code: codeToVerify,
        tempToken: tempToken || 'temp-token'
      });
      
      console.log('Respuesta completa del backend 2FA:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        showToast('Código verificado correctamente', 'success');
        onSuccess(codeToVerify);
        onClose();
      } else {
        const errorMessage = response.message || 'Código inválido';
        setError(errorMessage);
        console.error('Error en verificación 2FA:', errorMessage);
      }
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      const errorMessage = error.message || 'Error al verificar código';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    showToast('Código reenviado a tu app de autenticación', 'info');
    setTimeLeft(30);
  };

  const renderMainVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verificación en Dos Pasos
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresa el código de 6 dígitos de tu app de autenticación
        </Text>
      </View>

      <View style={[styles.timerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="time" size={24} color={colors.primary} />
        <Text style={[styles.timerText, { color: colors.textPrimary }]}>
          Tiempo restante: {timeLeft}s
        </Text>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.codeInputContainer}>
        <TextInput
          style={[styles.codeInput, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            color: colors.textPrimary 
          }]}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="000000"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
          fontSize={24}
          letterSpacing={8}
        />
      </View>

      <TouchableOpacity
        style={[styles.resendButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleResendCode}
      >
        <Ionicons name="refresh" size={16} color={colors.primary} />
        <Text style={[styles.resendButtonText, { color: colors.primary }]}>
          Reenviar código
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.verifyButton, { backgroundColor: colors.primary }]}
        onPress={handleVerifyCode}
        disabled={loading || verificationCode.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.verifyButtonText}>Verificar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backupButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setUseBackup(true)}
      >
        <Ionicons name="key" size={16} color={colors.textSecondary} />
        <Text style={[styles.backupButtonText, { color: colors.textSecondary }]}>
          Usar código de respaldo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onClose}
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackupVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Código de Respaldo
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresa uno de tus códigos de respaldo
        </Text>
      </View>

      <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
        <Ionicons name="warning" size={24} color={colors.warning} />
        <Text style={[styles.warningText, { color: colors.warning }]}>
          Los códigos de respaldo solo se pueden usar una vez
        </Text>
      </View>

      <View style={styles.codeInputContainer}>
        <TextInput
          style={[styles.codeInput, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            color: colors.textPrimary 
          }]}
          value={backupCode}
          onChangeText={setBackupCode}
          placeholder="Código de respaldo"
          placeholderTextColor={colors.textTertiary}
          textAlign="center"
          fontSize={18}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.backupButtons}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setUseBackup(false)}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
            Volver
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: colors.primary }]}
          onPress={handleVerifyCode}
          disabled={loading || backupCode.length < 6}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verificar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Verificación 2FA
          </Text>
          <View style={styles.placeholder} />
        </View>

        {useBackup ? renderBackupVerification() : renderMainVerification()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    letterSpacing: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  resendButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  backupButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  backupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TwoFactorVerificationModal;
