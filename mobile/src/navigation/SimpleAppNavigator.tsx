import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Client Screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ProductsScreen from '../screens/client/ProductsScreen';
import CartScreen from '../screens/client/CartScreen';
import FavoritesScreen from '../screens/client/FavoritesScreen';
import OrdersScreen from '../screens/client/OrdersScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import ProductDetailScreen from '../screens/client/ProductDetailScreen';
import ChatScreen from '../screens/client/ChatScreen';
import EditProfileScreen from '../screens/client/EditProfileScreen';
import SettingsScreen from '../screens/client/SettingsScreen';
import ReviewsScreen from '../screens/client/ReviewsScreen';
import SecuritySettingsScreen from '../screens/client/SecuritySettingsScreen';
import PrivacySettingsScreen from '../screens/client/PrivacySettingsScreen';
import ChatEvaluationScreen from '../screens/client/ChatEvaluationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Client Tab Navigator
const ClientTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'ClientHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
        name="ClientHome" 
        component={ClientHomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ tabBarLabel: 'Productos' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ tabBarLabel: 'Carrito' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favoritos' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

const SimpleAppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return null; // O un componente de carga simple
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
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // Client Stack
          <>
            <Stack.Screen 
              name="ClientTabs" 
              component={ClientTabNavigator} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Detalle del Producto',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Editar Perfil',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Configuración',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="Reviews" 
              component={ReviewsScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Mis Reseñas',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="SecuritySettings" 
              component={SecuritySettingsScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Configuración de Seguridad',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="PrivacySettings" 
              component={PrivacySettingsScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Configuración de Privacidad',
                headerBackTitle: 'Atrás'
              }} 
            />
            <Stack.Screen 
              name="ChatEvaluation" 
              component={ChatEvaluationScreen} 
              options={{ 
                headerShown: true,
                headerTitle: 'Evaluar Chat',
                headerBackTitle: 'Atrás'
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default SimpleAppNavigator;
