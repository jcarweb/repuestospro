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
import Icon from 'react-native-vector-icons/Icon';
import authVerificationService from '../../services/authVerification';

interface GPSVerificationScreenProps {
  navigation: any;
  route: any;
}

const GPSVerificationScreen: React.FC<GPSVerificationScreenProps> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const onSuccess = route.params?.onSuccess;

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const granted = await authVerificationService.requestLocationPermission();
      setPermissionGranted(granted);
      
      if (granted) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('❌ Error verificando permisos de ubicación:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const result = await authVerificationService.checkGPSLocation();
      
      if (result.success) {
        setLocationData(result.data);
        Alert.alert(
          'Ubicación Verificada',
          'Tu ubicación ha sido verificada correctamente.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                if (onSuccess) {
                  onSuccess(result.data);
                }
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al obtener la ubicación');
      }
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      Alert.alert('Error', 'Error al obtener la ubicación GPS');
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    Alert.alert(
      'Permisos de Ubicación',
      'Para continuar, necesitas habilitar los permisos de ubicación en la configuración de tu dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Configuración', onPress: () => {
          // Aquí podrías abrir la configuración del dispositivo
          Alert.alert('Configuración', 'Por favor, ve a Configuración > Privacidad > Ubicación y habilita el acceso para esta app.');
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {/* Icono */}
        <View style={styles.iconContainer}>
          <Icon 
            name={locationData ? "location" : "location-outline"} 
            size={80} 
            color={locationData ? "#10B981" : "#FFC300"} 
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>
          {locationData ? 'Ubicación Verificada' : 'Verificar Ubicación'}
        </Text>

        {/* Descripción */}
        <Text style={styles.description}>
          {locationData 
            ? 'Tu ubicación ha sido verificada correctamente. Ya puedes continuar con el login.'
            : 'Para continuar con el login, necesitamos verificar tu ubicación GPS. Esto es necesario por razones de seguridad.'
          }
        </Text>

        {/* Información de ubicación */}
        {locationData && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Información de ubicación:</Text>
            <Text style={styles.locationText}>
              Latitud: {locationData.latitude.toFixed(6)}{'\n'}
              Longitud: {locationData.longitude.toFixed(6)}{'\n'}
              Precisión: {locationData.accuracy.toFixed(1)} metros
            </Text>
          </View>
        )}

        {/* Estado de verificación */}
        {!locationData && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Estado: {isLoading ? 'Obteniendo ubicación...' : 'Pendiente de verificación'}
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#FFC300" style={styles.loader} />}
          </View>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          {!locationData && (
            <>
              {!permissionGranted ? (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={openSettings}
                >
                  <Text style={styles.buttonText}>Habilitar Ubicación</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={getCurrentLocation}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Obteniendo ubicación...' : 'Verificar Ubicación'}
                  </Text>
                </TouchableOpacity>
              )}
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
          <Text style={styles.infoTitle}>¿Por qué necesitamos tu ubicación?</Text>
          <Text style={styles.infoText}>
            • Verificación de seguridad{'\n'}
            • Prevención de accesos no autorizados{'\n'}
            • Cumplimiento de políticas de seguridad{'\n'}
            • Tu ubicación no se comparte con terceros
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
  locationContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
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
  backButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
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

export default GPSVerificationScreen;
