import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada del fondo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animación del logo con delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Mostrar splash por 3 segundos
    const timer = setTimeout(() => {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoFadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/piezasya.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
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
