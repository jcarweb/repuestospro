import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Usando alternativa compatible con la versión actual de Expo

interface TwoFactorSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Función para copiar al portapapeles (simulada)
  const copyToClipboard = async (text: string) => {
    try {
      // Simular copia al portapapeles
      await AsyncStorage.setItem('lastCopiedText', text);
      showToast('✅ Código copiado al portapapeles', 'success');
      console.log('Código copiado (simulado):', text);
      return true;
    } catch (error) {
      console.error('Error copiando código:', error);
      showToast('❌ Error al copiar código', 'error');
      return false;
    }
  };

  useEffect(() => {
    if (visible && step === 'setup') {
      generate2FASecret();
    }
  }, [visible, step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify') {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const generate2FASecret = async () => {
    setLoading(true);
    try {
      // Simular generación de secreto 2FA
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQrCode = 'otpauth://totp/PiezasYA:usuario@piezasya.com?secret=' + mockSecret + '&issuer=PiezasYA';
      
      setSecret(mockSecret);
      setQrCode(mockQrCode);
      
      // Generar códigos de respaldo
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      showToast('Código QR generado correctamente', 'success');
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      showToast('Error al generar código 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    console.log('Verificando código:', verificationCode);
    
    if (verificationCode.length !== 6) {
      showToast('El código debe tener 6 dígitos', 'error');
      return;
    }

    setLoading(true);
    try {
      // Usar el servicio de API real para verificar 2FA
      const { default: apiService } = await import('../services/api');
      
      // Verificar código usando el backend real
      const response = await apiService.verifyTwoFactor({
        email: 'admin@repuestospro.com', // Usar email del usuario actual
        code: verificationCode,
        tempToken: 'setup-token' // Token especial para configuración
      });
      
      console.log('Respuesta verificación 2FA:', response);
      
      if (response.success) {
        setStep('backup');
        showToast('✅ Código verificado correctamente', 'success');
        console.log('Verificación exitosa, avanzando a códigos de respaldo');
      } else {
        showToast('❌ Código inválido. Verifica que sea el código correcto', 'error');
        console.log('Código inválido:', verificationCode);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      showToast('❌ Error al verificar código', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      // Guardar configuración 2FA
      await AsyncStorage.setItem('twoFactorEnabled', 'true');
      await AsyncStorage.setItem('twoFactorSecret', secret);
      await AsyncStorage.setItem('twoFactorBackupCodes', JSON.stringify(backupCodes));
      
      showToast('2FA configurado exitosamente', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error completing 2FA setup:', error);
      showToast('Error al completar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSetupStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Configurar 2FA
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escanea el código QR con tu app de autenticación
        </Text>
      </View>

      <View style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.qrPlaceholder, { backgroundColor: colors.background }]}>
          <Ionicons name="qr-code" size={120} color={colors.textTertiary} />
          <Text style={[styles.qrText, { color: colors.textSecondary }]}>
            Código QR
          </Text>
        </View>
      </View>

      <View style={[styles.secretContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.secretLabel, { color: colors.textSecondary }]}>
          Código secreto (si no puedes escanear):
        </Text>
        <Text 
          style={[styles.secretCode, { color: colors.textPrimary }]}
          selectable={true}
          onLongPress={() => {
            copyToClipboard(secret);
          }}
        >
          {secret}
        </Text>
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            copyToClipboard(secret);
          }}
        >
          <Ionicons name="copy" size={16} color="white" />
          <Text style={styles.copyButtonText}>Copiar Código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>
          Instrucciones:
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          1. Abre tu app de autenticación (Google Authenticator, Authy, etc.)
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          2. Escanea el código QR o ingresa manualmente el código secreto
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          3. Para ingresar manualmente: toca "Agregar cuenta" → "Ingresar clave de configuración"
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          4. Nombre: PiezasYA, Clave: {secret}
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          5. Presiona "Continuar" cuando hayas configurado la app
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        onPress={() => setStep('verify')}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderVerifyStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verificar Código
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresa el código de 6 dígitos de tu app
        </Text>
      </View>

      <View style={[styles.timerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="time" size={24} color={colors.primary} />
        <Text style={[styles.timerText, { color: colors.textPrimary }]}>
          Tiempo restante: {timeLeft}s
        </Text>
      </View>

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

      <View style={styles.verifyButtons}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setStep('setup')}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
            Volver
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton, 
            { 
              backgroundColor: (loading || verificationCode.length !== 6) ? colors.textTertiary : colors.primary,
              opacity: (loading || verificationCode.length !== 6) ? 0.6 : 1
            }
          ]}
          onPress={() => {
            console.log('Botón verificar presionado');
            console.log('Código actual:', verificationCode);
            console.log('Longitud:', verificationCode.length);
            handleVerifyCode();
          }}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>
              {verificationCode.length === 6 ? 'Verificar' : `Faltan ${6 - verificationCode.length} dígitos`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBackupStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Códigos de Respaldo
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Guarda estos códigos en un lugar seguro
        </Text>
      </View>

      <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
        <Ionicons name="warning" size={24} color={colors.warning} />
        <Text style={[styles.warningText, { color: colors.warning }]}>
          Estos códigos te permitirán acceder a tu cuenta si pierdes tu dispositivo
        </Text>
      </View>

      <View style={[styles.codesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {backupCodes.map((code, index) => (
          <View key={index} style={[styles.codeItem, { borderColor: colors.border }]}>
            <Text style={[styles.codeNumber, { color: colors.textSecondary }]}>
              {index + 1}
            </Text>
            <Text style={[styles.codeValue, { color: colors.textPrimary }]}>
              {code}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.downloadButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          showToast('Códigos guardados localmente', 'success');
        }}
      >
        <Ionicons name="download" size={20} color="white" />
        <Text style={styles.downloadButtonText}>Guardar Códigos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: colors.success }]}
        onPress={handleCompleteSetup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.completeButtonText}>Completar Configuración</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
            Configurar 2FA
          </Text>
          <View style={styles.placeholder} />
        </View>

        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  qrText: {
    marginTop: 12,
    fontSize: 16,
  },
  secretContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  secretLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 18,
    fontFamily: 'monospace',
    marginBottom: 12,
    textAlign: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  copyButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  codeInputContainer: {
    marginBottom: 30,
  },
  codeInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    letterSpacing: 8,
  },
  verifyButtons: {
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
  verifyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  codesContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  codeNumber: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
  },
  codeValue: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  downloadButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TwoFactorSetupModal;
