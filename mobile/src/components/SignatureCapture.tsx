import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SignatureCaptureProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  customerName?: string;
  orderNumber?: string;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  visible,
  onClose,
  onSave,
  customerName = 'Cliente',
  orderNumber = 'N/A'
}) => {
  const { colors } = useTheme();
  const [signature, setSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<View>(null);
  const { width, height } = Dimensions.get('window');

  const handleClear = () => {
    setSignature('');
    Alert.alert(
      'Limpiar Firma',
      '¿Estás seguro de que deseas limpiar la firma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', onPress: () => setSignature('') }
      ]
    );
  };

  const handleSave = () => {
    if (!signature.trim()) {
      Alert.alert('Error', 'Por favor, capture la firma del cliente antes de continuar.');
      return;
    }

    Alert.alert(
      'Confirmar Firma',
      '¿Está seguro de que la firma es correcta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            onSave(signature);
            setSignature('');
            onClose();
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (signature.trim()) {
      Alert.alert(
        'Descartar Firma',
        '¿Está seguro de que desea descartar la firma capturada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Descartar', 
            onPress: () => {
              setSignature('');
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Firma del Cliente
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Order Info */}
        <View style={[styles.orderInfo, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.orderText, { color: colors.text }]}>
            Orden: {orderNumber}
          </Text>
          <Text style={[styles.customerText, { color: colors.textSecondary }]}>
            Cliente: {customerName}
          </Text>
        </View>

        {/* Signature Area */}
        <View style={styles.signatureContainer}>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Solicite al cliente que firme en el área de abajo para confirmar la entrega
          </Text>
          
          <View style={[styles.signatureArea, { backgroundColor: 'white', borderColor: colors.border }]}>
            {signature ? (
              <View style={styles.signaturePreview}>
                <Text style={styles.signatureText}>✓ Firma Capturada</Text>
                <Text style={[styles.signatureSubtext, { color: colors.textSecondary }]}>
                  La firma ha sido registrada correctamente
                </Text>
              </View>
            ) : (
              <View style={styles.placeholderArea}>
                <Ionicons name="create-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Área de Firma
                </Text>
                <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
                  Toque para comenzar a capturar la firma
                </Text>
              </View>
            )}
          </View>

          {/* Signature Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleClear}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
              <Text style={[styles.controlButtonText, { color: colors.text }]}>
                Limpiar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Simular captura de firma
                setSignature('signature_data_' + Date.now());
              }}
            >
              <Ionicons name="camera" size={20} color={colors.text} />
              <Text style={[styles.controlButtonText, { color: colors.text }]}>
                Capturar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.instructionTitle, { color: colors.text }]}>
            Instrucciones:
          </Text>
          <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
            • Solicite al cliente que firme en el área designada
          </Text>
          <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
            • Verifique que la firma sea legible
          </Text>
          <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
            • Confirme la entrega solo después de capturar la firma
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  orderInfo: {
    padding: 15,
    borderBottomWidth: 1,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerText: {
    fontSize: 14,
  },
  signatureContainer: {
    flex: 1,
    padding: 20,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  signatureArea: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePreview: {
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
  },
  signatureSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderArea: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  controlButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    padding: 20,
    borderRadius: 12,
    margin: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default SignatureCapture;
