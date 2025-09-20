import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import Toast from 'react-native-toast-message';

// Componente de carga simple
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    justifyContent: 'center', 
    alignItems: 'center' 
  }}>
    <ActivityIndicator size="large" color="#FFC300" />
    <Text style={{ 
      color: '#FFFFFF', 
      marginTop: 16, 
      fontSize: 16 
    }}>
      Cargando PiezasYA...
    </Text>
  </View>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simular tiempo de carga inicial
    const timer = setTimeout(() => {
      setShowSplash(false);
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <NetworkProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </AuthProvider>
        </NetworkProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
