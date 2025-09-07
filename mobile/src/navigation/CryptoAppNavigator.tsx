import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCryptoAuth } from '../contexts/CryptoAuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Auth Screens
import CryptoLoginScreen from '../screens/auth/CryptoLoginScreen';

// Admin Screens
import StorePhotoCaptureScreen from '../screens/admin/StorePhotoCaptureScreen';
import StorePhotosListScreen from '../screens/admin/StorePhotosListScreen';

// Components
import SplashScreen from '../components/SplashScreen';
import Toast from '../components/Toast';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Admin Tab Navigator
const AdminTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'StorePhotoCapture':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'StorePhotosList':
              iconName = focused ? 'list' : 'list-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="StorePhotoCapture" 
        component={StorePhotoCaptureScreen}
        options={{ tabBarLabel: 'Capturar' }}
      />
      <Tab.Screen 
        name="StorePhotosList" 
        component={StorePhotosListScreen}
        options={{ tabBarLabel: 'Fotos' }}
      />
    </Tab.Navigator>
  );
};

const CryptoAppNavigator = () => {
  const { user, isLoading, isAdmin } = useCryptoAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen 
            name="CryptoLogin" 
            component={CryptoLoginScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          // Role-based navigation
          <>
            {isAdmin ? (
              // Admin Stack
              <>
                <Stack.Screen 
                  name="AdminTabs" 
                  component={AdminTabNavigator} 
                  options={{ headerShown: false }} 
                />
              </>
            ) : (
              // Non-admin users
              <Stack.Screen 
                name="AccessDenied" 
                component={() => (
                  <div style={{ 
                    flex: 1, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    padding: 20 
                  }}>
                    <h2 style={{ color: '#FF3B30', marginBottom: 16 }}>
                      Acceso Restringido
                    </h2>
                    <p style={{ color: '#666', textAlign: 'center' }}>
                      Solo los administradores pueden acceder a esta aplicación.
                    </p>
                  </div>
                )} 
                options={{ headerShown: false }} 
              />
            )}
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default CryptoAppNavigator;
