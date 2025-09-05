import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Mostrar splash por 2 segundos (reducido para evitar problemas)
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/piezasya.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fondo oscuro corporativo
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.7, // 70% del ancho de la pantalla
    height: height * 0.3, // 30% del alto de la pantalla
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
