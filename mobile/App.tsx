import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import OfflineIndicator from './src/components/OfflineIndicator';


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

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

  return (
    <ThemeProvider>
      <ToastProvider>
        <NetworkProvider autoScan={false} scanInterval={60000}>
          <AuthProvider>
            <StatusBar style="light" />
            <OfflineIndicator />
            <AppNavigator />
          </AuthProvider>
        </NetworkProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
