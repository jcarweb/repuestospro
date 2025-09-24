import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CryptoAuthProvider } from './src/contexts/CryptoAuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import CryptoAppNavigator from './src/navigation/CryptoAppNavigator';

export default function CryptoApp() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <CryptoAuthProvider>
            <CryptoAppNavigator />
            <StatusBar style="auto" />
          </CryptoAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
