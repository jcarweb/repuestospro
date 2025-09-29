import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Product {
  _id: string;
  name: string;
  sku: string;
  originalPartCode?: string;
  price: number;
  stock: number;
  images: string[];
}

interface QuotationItem {
  product: string;
  productName: string;
  productSku: string;
  productOriginalCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  notes?: string;
}

const CreateQuotationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    },
    validityDays: 30,
    notes: '',
    terms: '',
    conditions: '',
  });

  useEffect(() => {
    calculateTotals();
  }, [items, taxRate, discountRate]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(subtotal);
  };

  const searchProducts = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/advanced-search/quick?q=${encodeURIComponent(term)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    searchProducts(text);
  };

  const addProduct = (product: Product) => {
    const existingItem = items.find(item => item.product === product._id);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.product === product._id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: QuotationItem = {
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        productOriginalCode: product.originalPartCode,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        specifications: {},
        notes: '',
      };
      setItems([...items, newItem]);
    }
    
    setSearchTerm('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(items.map((item, i) => 
      i === index 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.customer.name || !formData.customer.email) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un producto');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Cotización creada exitosamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Error al crear la cotización');
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      Alert.alert('Error', 'Error al crear la cotización');
    } finally {
      setLoading(false);
    }
  };

  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discountRate) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => addProduct(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>
        {item.originalPartCode && (
          <Text style={styles.productCode}>Código: {item.originalPartCode}</Text>
        )}
      </View>
      <View style={styles.productPrice}>
        <Text style={styles.priceText}>${item.price}</Text>
        <Text style={styles.stockText}>Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuotationItem = ({ item, index }: { item: QuotationItem; index: number }) => (
    <View style={styles.quotationItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
        {item.productOriginalCode && (
          <Text style={styles.itemCode}>Código: {item.productOriginalCode}</Text>
        )}
      </View>
      <View style={styles.itemControls}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(index, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(index, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.itemTotal}>
          <Text style={styles.totalText}>${item.totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(index)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Cotización</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Ej: Cotización de repuestos para Toyota Corolla"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Días de validez *</Text>
            <TextInput
              style={styles.input}
              value={formData.validityDays.toString()}
              onChangeText={(text) => setFormData({ ...formData, validityDays: parseInt(text) || 30 })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Descripción opcional de la cotización"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.customer.name}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                customer: { ...formData.customer, name: text }
              })}
              placeholder="Nombre del cliente"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.customer.email}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                customer: { ...formData.customer, email: text }
              })}
              placeholder="email@ejemplo.com"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={formData.customer.phone}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                customer: { ...formData.customer, phone: text }
              })}
              placeholder="+58 412 123 4567"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Empresa</Text>
            <TextInput
              style={styles.input}
              value={formData.customer.company}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                customer: { ...formData.customer, company: text }
              })}
              placeholder="Nombre de la empresa"
            />
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={styles.addProductText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {items.length > 0 ? (
            <FlatList
              data={items}
              renderItem={renderQuotationItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyProducts}>
              <Ionicons name="package" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay productos agregados</Text>
              <Text style={styles.emptySubtext}>Toca "Agregar" para comenzar</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Totales</Text>
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.taxRow}>
                  <Text style={styles.totalLabel}>Impuestos:</Text>
                  <TextInput
                    style={styles.taxInput}
                    value={taxRate.toString()}
                    onChangeText={(text) => setTaxRate(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.percentText}>%</Text>
                </View>
                <Text style={styles.totalValue}>${taxAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.taxRow}>
                  <Text style={styles.totalLabel}>Descuento:</Text>
                  <TextInput
                    style={styles.taxInput}
                    value={discountRate.toString()}
                    onChangeText={(text) => setDiscountRate(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.percentText}>%</Text>
                </View>
                <Text style={styles.totalValue}>-${discountAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.finalTotal]}>
                <Text style={styles.finalTotalLabel}>Total:</Text>
                <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Términos</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.terms}
              onChangeText={(text) => setFormData({ ...formData, terms: text })}
              placeholder="Términos generales de la cotización"
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condiciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.conditions}
              onChangeText={(text) => setFormData({ ...formData, conditions: text })}
              placeholder="Condiciones específicas de venta"
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Notas adicionales para el cliente"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>
      </ScrollView>

      {/* Product Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Buscar Productos</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchText}
                placeholder="Buscar por nombre, SKU o código..."
                value={searchTerm}
                onChangeText={handleSearchChange}
              />
            </View>
          </View>
          
          <FlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            style={styles.searchResults}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
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
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  addProductText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyProducts: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  quotationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 4,
    padding: 8,
    marginLeft: 8,
  },
  totalsContainer: {
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
  taxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 4,
    width: 60,
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 14,
  },
  percentText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  searchResults: {
    flex: 1,
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productSku: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  productCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default CreateQuotationScreen;
