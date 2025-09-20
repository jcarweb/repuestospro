import React, { useState, useEffect } from 'react';
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
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { productService, Product } from '../../services/productService';
import Icon from 'react-native-vector-icons/Icon';

type AdminStackParamList = {
  AdminProducts: undefined;
  AdminCreateProduct: { productId?: string };
};

type AdminCreateProductNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminCreateProduct'>;

const AdminCreateProductScreen: React.FC = () => {
  const navigation = useNavigation<AdminCreateProductNavigationProp>();
  const route = useRoute();
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  
  const { productId } = route.params as { productId?: string };
  const isEditing = !!productId;

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    subcategory: '',
    vehicleType: '',
    sku: '',
    originalPartCode: '',
    stock: '',
    isActive: true,
    isFeatured: false,
    tags: '',
    specifications: '',
  });

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Datos de opciones
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
    if (isEditing && productId) {
      loadProduct();
    }
  }, [productId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesData, vehicleTypesData, storesData] = await Promise.all([
        productService.getCategories(),
        productService.getVehicleTypes(),
        productService.getStores()
      ]);

      setCategories(categoriesData);
      setVehicleTypes(vehicleTypesData);
      
      if (storesData.success && storesData.data) {
        setStores(storesData.data.stores);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Error al cargar datos iniciales', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      const response = await productService.getProductById(productId);
      
      if (response.success && response.data) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          category: product.category || '',
          brand: product.brand || '',
          subcategory: product.subcategory || '',
          vehicleType: product.vehicleType || '',
          sku: product.sku || '',
          originalPartCode: product.originalPartCode || '',
          stock: product.stock?.toString() || '',
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          tags: product.tags?.join(', ') || '',
          specifications: JSON.stringify(product.specifications || {}, null, 2),
        });
        setImages(product.images || []);
      } else {
        showToast('Error al cargar el producto', 'error');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Error al cargar el producto', 'error');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrands = async (vehicleType: string) => {
    if (!vehicleType || vehicleType === 'all') {
      const brandsData = await productService.getBrands();
      setBrands(brandsData);
    } else {
      const brandsData = await productService.getBrandsByVehicleType(vehicleType);
      setBrands(brandsData);
    }
  };

  const loadSubcategories = async (category: string) => {
    if (!category || category === 'all') {
      const subcategoriesData = await productService.getSubcategories();
      setSubcategories(subcategoriesData);
    } else {
      const subcategoriesData = await productService.getSubcategories(category);
      setSubcategories(subcategoriesData);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'El precio debe ser un número válido';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
    }

    if (!formData.stock.trim()) {
      newErrors.stock = 'El stock es requerido';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'El stock debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      setIsSaving(true);

      const productData: Partial<Product> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        brand: formData.brand || undefined,
        subcategory: formData.subcategory || undefined,
        vehicleType: formData.vehicleType || undefined,
        sku: formData.sku.trim(),
        originalPartCode: formData.originalPartCode.trim() || undefined,
        stock: Number(formData.stock),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: images,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        store: stores[0] || {
          _id: 'mock-store',
          name: 'Tienda Mock',
          city: 'Ciudad Mock',
          state: 'Estado Mock'
        },
        createdBy: {
          name: user?.name || 'Usuario',
          email: user?.email || 'usuario@example.com'
        }
      };

      let response;
      if (isEditing && productId) {
        response = await productService.updateProduct(productId, productData);
      } else {
        response = await productService.createProduct(productData);
      }

      if (response.success) {
        showToast(
          `Producto ${isEditing ? 'actualizado' : 'creado'} exitosamente`,
          'success'
        );
        navigation.goBack();
      } else {
        showToast(response.message || 'Error al guardar el producto', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error al guardar el producto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEditing || !productId) return;

    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              const response = await productService.deleteProduct(productId);
              
              if (response.success) {
                showToast('Producto eliminado exitosamente', 'success');
                navigation.goBack();
              } else {
                showToast(response.message || 'Error al eliminar el producto', 'error');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              showToast('Error al eliminar el producto', 'error');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderFormField = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          errors[field] && styles.textInputError
        ]}
        value={formData[field]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderPicker = (
    label: string,
    field: keyof typeof formData,
    options: any[],
    onValueChange?: (value: string) => void
  ) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
        {options.map((option, index) => {
          const value = option.name || option;
          const isSelected = formData[field] === value;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
              onPress={() => {
                setFormData(prev => ({ ...prev, [field]: value }));
                onValueChange?.(value);
              }}
            >
              <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            {isEditing ? 'Cargando producto...' : 'Cargando datos...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </Text>
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isSaving}
          >
            <Icon name="trash" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Información Básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            {renderFormField('Nombre *', 'name', 'Nombre del producto')}
            {renderFormField('Descripción', 'description', 'Descripción del producto', 'default', true)}
            {renderFormField('Precio *', 'price', '0.00', 'numeric')}
            {renderFormField('SKU *', 'sku', 'SKU del producto')}
            {renderFormField('Código Original', 'originalPartCode', 'Código de la pieza original')}
            {renderFormField('Stock *', 'stock', '0', 'numeric')}
          </View>

          {/* Categorización */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorización</Text>
            
            {renderPicker('Categoría *', 'category', categories, (category) => {
              loadSubcategories(category);
            })}
            
            {renderPicker('Subcategoría', 'subcategory', subcategories)}
            
            {renderPicker('Tipo de Vehículo', 'vehicleType', vehicleTypes, (vehicleType) => {
              loadBrands(vehicleType);
            })}
            
            {renderPicker('Marca', 'brand', brands)}
          </View>

          {/* Configuración */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <View style={styles.switchField}>
              <Text style={styles.fieldLabel}>Producto Activo</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={formData.isActive ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.switchField}>
              <Text style={styles.fieldLabel}>Producto Destacado</Text>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isFeatured: value }))}
                trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
                thumbColor={formData.isFeatured ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            {renderFormField('Tags', 'tags', 'tag1, tag2, tag3')}
          </View>

          {/* Especificaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especificaciones</Text>
            {renderFormField('Especificaciones (JSON)', 'specifications', '{\n  "key": "value"\n}', 'default', true)}
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Actualizar' : 'Crear'} Producto
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  deleteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default AdminCreateProductScreen;
