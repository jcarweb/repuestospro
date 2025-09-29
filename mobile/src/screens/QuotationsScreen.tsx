import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Quotation {
  _id: string;
  quotationNumber: string;
  title: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface QuotationStats {
  totalQuotations: number;
  totalValue: number;
  byStatus: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

const QuotationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQuotations();
    fetchStats();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setQuotations(data.data.quotations);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      Alert.alert('Error', 'No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQuotations(), fetchStats()]);
    setRefreshing(false);
  };

  const handleDeleteQuotation = async (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta cotización?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              const data = await response.json();
              if (data.success) {
                setQuotations(quotations.filter(q => q._id !== id));
                Alert.alert('Éxito', 'Cotización eliminada exitosamente');
              }
            } catch (error) {
              console.error('Error deleting quotation:', error);
              Alert.alert('Error', 'No se pudo eliminar la cotización');
            }
          },
        },
      ]
    );
  };

  const handleSendQuotation = async (id: string, method: 'email' | 'whatsapp' | 'both') => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });
      const data = await response.json();
      if (data.success) {
        fetchQuotations();
        Alert.alert('Éxito', 'Cotización enviada exitosamente');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      Alert.alert('Error', 'No se pudo enviar la cotización');
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderQuotationItem = ({ item }: { item: Quotation }) => (
    <TouchableOpacity
      style={styles.quotationCard}
      onPress={() => navigation.navigate('QuotationDetails', { quotation: item })}
    >
      <View style={styles.quotationHeader}>
        <View style={styles.quotationInfo}>
          <Text style={styles.quotationNumber}>{item.quotationNumber}</Text>
          <Text style={styles.quotationTitle}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.customer.name}</Text>
        <Text style={styles.customerEmail}>{item.customer.email}</Text>
      </View>
      
      <View style={styles.quotationFooter}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            {item.currency} {item.total.toFixed(2)}
          </Text>
        </View>
        <Text style={styles.validUntil}>
          Válido hasta: {new Date(item.validUntil).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {item.status === 'draft' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.emailButton]}
              onPress={() => handleSendQuotation(item._id, 'email')}
            >
              <Ionicons name="mail" size={16} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.whatsappButton]}
              onPress={() => handleSendQuotation(item._id, 'whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteQuotation(item._id)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => navigation.navigate('QuotationPDF', { quotationId: item._id })}
        >
          <Ionicons name="download" size={16} color="#10B981" />
          <Text style={styles.actionButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <Ionicons name={icon as any} size={24} color={color} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando cotizaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cotizaciones</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateQuotation')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          {renderStatsCard(
            'Total Cotizaciones',
            stats.totalQuotations.toString(),
            'document-text',
            '#3B82F6'
          )}
          {renderStatsCard(
            'Valor Total',
            `$${stats.totalValue.toFixed(2)}`,
            'cash',
            '#10B981'
          )}
          {renderStatsCard(
            'Vistas',
            (stats.byStatus.find(s => s._id === 'viewed')?.count || 0).toString(),
            'eye',
            '#F59E0B'
          )}
          {renderStatsCard(
            'Aceptadas',
            (stats.byStatus.find(s => s._id === 'accepted')?.count || 0).toString(),
            'checkmark-circle',
            '#10B981'
          )}
        </ScrollView>
      )}

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchText}
            placeholder="Buscar cotizaciones..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Quotations List */}
      <FlatList
        data={filteredQuotations}
        renderItem={renderQuotationItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 12,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  listContainer: {
    padding: 16,
  },
  quotationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quotationInfo: {
    flex: 1,
  },
  quotationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  quotationTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  customerEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  quotationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  validUntil: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  emailButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  whatsappButton: {
    borderColor: '#25D366',
    backgroundColor: '#F0FDF4',
  },
  downloadButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  deleteButton: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default QuotationsScreen;
