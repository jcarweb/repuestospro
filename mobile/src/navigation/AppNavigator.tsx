import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import GPSVerificationScreen from '../screens/auth/GPSVerificationScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';
import PINVerificationScreen from '../screens/auth/PINVerificationScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import CartScreen from '../screens/main/CartScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Context
import { useAuth } from '../contexts/AuthContext';

// Placeholder screens for other tabs
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Esta funcionalidad estará disponible próximamente</Text>
  </View>
);

const SearchScreen = () => <PlaceholderScreen title="Búsqueda" />;
const ProductDetailScreen = () => <PlaceholderScreen title="Detalle del Producto" />;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="GPSVerification" component={GPSVerificationScreen} />
        <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
        <Stack.Screen name="PINVerification" component={PINVerificationScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Categories') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'Cart') {
          iconName = focused ? 'cart' : 'cart-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FFC300',
      tabBarInactiveTintColor: '#6B7280',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Inicio' }}
    />
    <Tab.Screen 
      name="Categories" 
      component={CategoriesScreen}
      options={{ tabBarLabel: 'Categorías' }}
    />
    <Tab.Screen 
      name="Cart" 
      component={CartScreen}
      options={{ tabBarLabel: 'Carrito' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Perfil' }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
