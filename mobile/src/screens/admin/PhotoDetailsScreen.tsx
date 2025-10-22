import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PhotoDetailsScreenProps {
  route: {
    params: {
      photo: {
        _id: string;
        name: string;
        phone?: string;
        imageUrl: string;
        lat: number;
        lng: number;
        ocrText?: string;
        status: 'pending' | 'processing' | 'enriched' | 'error';
        errorMessage?: string;
        metrics?: any;
        createdAt: string;
        updatedAt: string;
      };
    };
  };
  navigation: any;
}

const PhotoDetailsScreen: React.FC<PhotoDetailsScreenProps> = ({ route, navigation }) => {
  const { photo } = route.params;
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'processing': return '#007AFF';
      case 'enriched': return '#34C759';
      case 'error': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'enriched': return 'Enriquecido';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Foto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: photo.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{photo.name}</Text>
          </View>
          
          {photo.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{photo.phone}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(photo.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(photo.status) }]}>
                {getStatusText(photo.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordenadas:</Text>
            <Text style={styles.infoValue}>{photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}</Text>
          </View>
        </View>

        {/* OCR Text */}
        {photo.ocrText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Texto Extraído (OCR)</Text>
            <View style={styles.ocrContainer}>
              <Text style={styles.ocrText}>{photo.ocrText}</Text>
            </View>
          </View>
        )}

        {/* Error Message */}
        {photo.errorMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mensaje de Error</Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{photo.errorMessage}</Text>
            </View>
          </View>
        )}

        {/* Métricas de Enriquecimiento */}
        {photo.metrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas de Enriquecimiento</Text>
            
            {photo.metrics.mercadoLibre && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>MercadoLibre:</Text>
                <Text style={styles.metricValue}>
                  {photo.metrics.mercadoLibre.found ? 'Encontrado' : 'No encontrado'}
                </Text>
              </View>
            )}
            
            {photo.metrics.duckduckgo && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DuckDuckGo:</Text>
                <Text style={styles.metricValue}>
                  {photo.metrics.duckduckgo.found ? 'Encontrado' : 'No encontrado'}
                </Text>
              </View>
            )}
            
            {photo.metrics.instagram && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Instagram:</Text>
                <Text style={styles.metricValue}>
                  {photo.metrics.instagram.found ? 'Encontrado' : 'No encontrado'}
                </Text>
              </View>
            )}
            
            {photo.metrics.whatsapp && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>WhatsApp:</Text>
                <Text style={styles.metricValue}>
                  {photo.metrics.whatsapp.found ? 'Encontrado' : 'No encontrado'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creado:</Text>
            <Text style={styles.infoValue}>
              {new Date(photo.createdAt).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Actualizado:</Text>
            <Text style={styles.infoValue}>
              {new Date(photo.updatedAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ocrContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  ocrText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
  },
});

export default PhotoDetailsScreen;
