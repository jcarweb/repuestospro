import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

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

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
          <AppNavigator />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
