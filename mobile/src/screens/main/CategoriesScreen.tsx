import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
}

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de categorías
    setTimeout(() => {
      setCategories([
        {
          id: '1',
          name: 'Motor',
          description: 'Partes del motor y accesorios',
          productCount: 150,
        },
        {
          id: '2',
          name: 'Frenos',
          description: 'Sistemas de frenado',
          productCount: 89,
        },
        {
          id: '3',
          name: 'Suspensión',
          description: 'Componentes de suspensión',
          productCount: 67,
        },
        {
          id: '4',
          name: 'Eléctrico',
          description: 'Sistema eléctrico y baterías',
          productCount: 120,
        },
        {
          id: '5',
          name: 'Carrocería',
          description: 'Partes exteriores del vehículo',
          productCount: 95,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.categoryIcon}>
        <Icon name="car-sport" size={32} color="#FFC300" />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.productCount}>{item.productCount} productos</Text>
      </View>
      <Icon name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC300" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categorías</Text>
        <Text style={styles.subtitle}>Explora nuestros productos por categoría</Text>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: '#FFC300',
    fontWeight: '500',
  },
});

export default CategoriesScreen;
