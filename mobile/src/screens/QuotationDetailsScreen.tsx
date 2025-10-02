import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Quotation {
  _id: string;
  quotationNumber: string;
  title: string;
  description?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    productName: string;
    productSku: string;
    productOriginalCode?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: Record<string, any>;
    notes?: string;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  conditions?: string;
}

const QuotationDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const { quotation } = route.params as { quotation: Quotation };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotation._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        // En React Native, necesitarías usar una librería como react-native-fs para manejar archivos
        Alert.alert('Éxito', 'PDF descargado exitosamente');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'No se pudo descargar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotation._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ method: 'email' }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Cotización enviada por email exitosamente');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'No se pudo enviar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotation._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ method: 'whatsapp' }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Cotización enviada por WhatsApp exitosamente');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      Alert.alert('Error', 'No se pudo enviar por WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Cotización ${quotation.quotationNumber} - ${quotation.title}\nTotal: ${quotation.currency} ${quotation.total.toFixed(2)}`,
        title: `Cotización ${quotation.quotationNumber}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '#6B7280',
      sent: '#3B82F6',
      viewed: '#F59E0B',
      accepted: '#10B981',
      rejected: '#EF4444',
      expired: '#6B7280',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Borrador',
      sent: 'Enviado',
      viewed: 'Visto',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      expired: 'Expirado',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
      </View>
      {item.productOriginalCode && (
        <Text style={styles.itemCode}>Código: {item.productOriginalCode}</Text>
      )}
      <View style={styles.itemDetails}>
        <View style={styles.itemQuantity}>
          <Text style={styles.itemLabel}>Cantidad:</Text>
          <Text style={styles.itemValue}>{item.quantity}</Text>
        </View>
        <View style={styles.itemPrice}>
          <Text style={styles.itemLabel}>Precio Unit.:</Text>
          <Text style={styles.itemValue}>{quotation.currency} {item.unitPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.itemTotal}>
          <Text style={styles.itemLabel}>Total:</Text>
          <Text style={styles.itemValue}>{quotation.currency} {item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
      {item.notes && (
        <Text style={styles.itemNotes}>Notas: {item.notes}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quotation.quotationNumber}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Basic Info */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quotation.status) }]}>
              <Text style={styles.statusText}>{getStatusText(quotation.status)}</Text>
            </View>
            <Text style={styles.quotationTitle}>{quotation.title}</Text>
          </View>
          
          {quotation.description && (
            <Text style={styles.description}>{quotation.description}</Text>
          )}
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de creación</Text>
              <Text style={styles.infoValue}>
                {new Date(quotation.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Válido hasta</Text>
              <Text style={styles.infoValue}>
                {new Date(quotation.validUntil).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.infoValue}>
                {quotation.currency} {quotation.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.customerCard}>
            <Text style={styles.customerName}>{quotation.customer.name}</Text>
            <Text style={styles.customerEmail}>{quotation.customer.email}</Text>
            {quotation.customer.phone && (
              <Text style={styles.customerPhone}>{quotation.customer.phone}</Text>
            )}
            {quotation.customer.company && (
              <Text style={styles.customerCompany}>{quotation.customer.company}</Text>
            )}
            {quotation.customer.address && (
              <Text style={styles.customerAddress}>{quotation.customer.address}</Text>
            )}
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {quotation.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
              </View>
              {item.productOriginalCode && (
                <Text style={styles.itemCode}>Código: {item.productOriginalCode}</Text>
              )}
              <View style={styles.itemDetails}>
                <View style={styles.itemQuantity}>
                  <Text style={styles.itemLabel}>Cantidad:</Text>
                  <Text style={styles.itemValue}>{item.quantity}</Text>
                </View>
                <View style={styles.itemPrice}>
                  <Text style={styles.itemLabel}>Precio Unit.:</Text>
                  <Text style={styles.itemValue}>{quotation.currency} {item.unitPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemLabel}>Total:</Text>
                  <Text style={styles.itemValue}>{quotation.currency} {item.totalPrice.toFixed(2)}</Text>
                </View>
              </View>
              {item.notes && (
                <Text style={styles.itemNotes}>Notas: {item.notes}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{quotation.currency} {quotation.subtotal.toFixed(2)}</Text>
            </View>
            {quotation.taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Impuestos ({quotation.taxRate}%):</Text>
                <Text style={styles.totalValue}>{quotation.currency} {quotation.taxAmount.toFixed(2)}</Text>
              </View>
            )}
            {quotation.discountRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento ({quotation.discountRate}%):</Text>
                <Text style={styles.totalValue}>-{quotation.currency} {quotation.discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>{quotation.currency} {quotation.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        {(quotation.terms || quotation.conditions || quotation.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
            {quotation.terms && (
              <View style={styles.termsCard}>
                <Text style={styles.termsTitle}>Términos</Text>
                <Text style={styles.termsText}>{quotation.terms}</Text>
              </View>
            )}
            {quotation.conditions && (
              <View style={styles.termsCard}>
                <Text style={styles.termsTitle}>Condiciones</Text>
                <Text style={styles.termsText}>{quotation.conditions}</Text>
              </View>
            )}
            {quotation.notes && (
              <View style={styles.termsCard}>
                <Text style={styles.termsTitle}>Notas adicionales</Text>
                <Text style={styles.termsText}>{quotation.notes}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownloadPDF}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>
        
        {quotation.status === 'draft' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.emailButton]}
              onPress={handleSendEmail}
              disabled={loading}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.whatsappButton]}
              onPress={handleSendWhatsApp}
              disabled={loading}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quotationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  customerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemSku: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  itemQuantity: {
    width: '33%',
  },
  itemPrice: {
    width: '33%',
  },
  itemTotal: {
    width: '33%',
  },
  itemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  totalsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  termsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: '#10B981',
  },
  emailButton: {
    backgroundColor: '#3B82F6',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default QuotationDetailsScreen;
