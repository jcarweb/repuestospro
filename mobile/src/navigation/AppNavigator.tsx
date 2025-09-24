import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { linking } from '../config/linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import EmailVerificationCallbackScreen from '../screens/auth/EmailVerificationCallbackScreen';
import EmailVerificationSuccessScreen from '../screens/auth/EmailVerificationSuccessScreen';
import PINVerificationScreen from '../screens/auth/PINVerificationScreen';

// Client Screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ProductsScreen from '../screens/client/ProductsScreen';
import CartScreen from '../screens/client/CartScreen';
import FavoritesScreen from '../screens/client/FavoritesScreen';
import OrdersScreen from '../screens/client/OrdersScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import ProductDetailScreen from '../screens/client/ProductDetailScreen';
import ChatScreen from '../screens/client/ChatScreen';
import ChatEvaluationScreen from '../screens/client/ChatEvaluationScreen';
import EditProfileScreen from '../screens/client/EditProfileScreen';
import SettingsScreen from '../screens/client/SettingsScreen';
import ReviewsScreen from '../screens/client/ReviewsScreen';
import SecuritySettingsScreen from '../screens/client/SecuritySettingsScreen';
import PrivacySettingsScreen from '../screens/client/PrivacySettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminStoresScreen from '../screens/admin/AdminStoresScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import AdminEditProfileScreen from '../screens/admin/AdminEditProfileScreen';
import OrderDetailsScreen from '../screens/admin/OrderDetailsScreen';
import AdminCreateUserScreen from '../screens/admin/AdminCreateUserScreen';
import AdminCreateProductScreen from '../screens/admin/AdminCreateProductScreen';
import StorePhotoCaptureScreen from '../screens/admin/StorePhotoCaptureScreen';
import StorePhotosListScreen from '../screens/admin/StorePhotosListScreen';

// Store Manager Screens
import StoreManagerDashboardScreen from '../screens/store-manager/StoreManagerDashboardScreen';
import StoreManagerProfileScreen from '../screens/store-manager/StoreManagerProfileScreen';
import StoreManagerEditProfileScreen from '../screens/store-manager/StoreManagerEditProfileScreen';

// Seller Screens
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';

// Delivery Screens
import DeliveryDashboardScreen from '../screens/delivery/DeliveryDashboardScreen';
import DeliveryProfileScreen from '../screens/delivery/DeliveryProfileScreen';
import DeliveryEditProfileScreen from '../screens/delivery/DeliveryEditProfileScreen';
import DeliveryOrdersScreen from '../screens/delivery/DeliveryOrdersScreen';
import DeliveryMapScreen from '../screens/delivery/DeliveryMapScreen';
import DeliveryReportScreen from '../screens/delivery/DeliveryReportScreen';
import DeliveryRatingsScreen from '../screens/delivery/DeliveryRatingsScreen';
import DeliveryScheduleScreen from '../screens/delivery/DeliveryScheduleScreen';
import DeliverySettingsScreen from '../screens/delivery/DeliverySettingsScreen';
import DeliveryLocationScreen from '../screens/delivery/DeliveryLocationScreen';
import DeliveryEarningsScreen from '../screens/delivery/DeliveryEarningsScreen';

// Components
import { ActivityIndicator, View, Text } from 'react-native';
import Toast from '../components/Toast';

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

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  console.log('🔍 AppNavigator - Renderizando con usuario:', user ? `${user.email} (${user.role})` : 'null');
  console.log('🔍 AppNavigator - isLoading:', isLoading);

  // Log para debug de roles
  useEffect(() => {
    if (user) {
      console.log('🔍 AppNavigator - Usuario detectado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });
      console.log('🔍 AppNavigator - Condiciones de navegación:', {
        isClient: user.role === 'client',
        isAdmin: user.role === 'admin',
        isStoreManager: user.role === 'store_manager',
        isDelivery: user.role === 'delivery'
      });
      console.log('🔍 AppNavigator - Tipo de rol:', typeof user.role);
      console.log('🔍 AppNavigator - Rol exacto:', JSON.stringify(user.role));
    } else {
      console.log('🔍 AppNavigator - No hay usuario');
    }
  }, [user]);

  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const pinStatus = await AsyncStorage.getItem('pinEnabled');
        const isPinEnabled = pinStatus === 'true';
        setPinEnabled(isPinEnabled);
        
        console.log('🔐 PIN Status Check:', {
          user: !!user,
          pinStatus,
          isPinEnabled,
          showPinVerification: showPinVerification
        });
        
        // Temporalmente deshabilitado para evitar errores de navegación
        // if (user && isPinEnabled) {
        //   console.log('🔐 Mostrando verificación de PIN');
        //   setShowPinVerification(true);
        // }
      } catch (error) {
        console.error('Error checking PIN status:', error);
      }
    };

    if (user) {
      checkPinStatus();
    }
  }, [user]);

  const handlePinSuccess = () => {
    setShowPinVerification(false);
  };

  const handlePinCancel = () => {
    // Opcional: cerrar sesión si el usuario cancela la verificación de PIN
    setShowPinVerification(false);
  };

  // Mostrar verificación de PIN si está habilitada - Temporalmente deshabilitado
  // if (showPinVerification && user) {
  //   return (
  //     <PINVerificationScreen
  //       navigation={{ goBack: handlePinCancel }}
  //       route={{ params: { onSuccess: handlePinSuccess } }}
  //     />
  //   );
  // }

  console.log('🔍 AppNavigator - Renderizando navegación con usuario:', user ? `${user.email} (${user.role})` : 'null');
  console.log('🔍 AppNavigator - isLoading en render:', isLoading);
  
  if (isLoading) {
    console.log('🔍 AppNavigator - Mostrando loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Cargando...</Text>
      </View>
    );
  }
  
  console.log('🔍 AppNavigator - Continuando con navegación...');
  
  // Verificar si hay usuario
  if (!user) {
    console.log('🔍 AppNavigator - No hay usuario, mostrando Auth Stack');
  } else {
    console.log('🔍 AppNavigator - Hay usuario, mostrando Role-based navigation');
  }
  
  // Verificar si hay usuario
  if (!user) {
    console.log('🔍 AppNavigator - No hay usuario, mostrando Auth Stack');
  } else {
    console.log('🔍 AppNavigator - Hay usuario, mostrando Role-based navigation');
  }
  
  return (
    <NavigationContainer linking={linking}>
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
            {console.log('🔍 AppNavigator - Mostrando Auth Stack (no hay usuario)')}
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
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="EmailVerificationCallback" 
              component={EmailVerificationCallbackScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="EmailVerificationSuccess" 
              component={EmailVerificationSuccessScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="PINVerification" 
              component={PINVerificationScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // Role-based navigation
          <>
            {console.log('🔍 AppNavigator - Mostrando Role-based navigation (hay usuario)')}
            {console.log('🔍 AppNavigator - Evaluando navegación para rol:', user.role)}
            {console.log('🔍 AppNavigator - ¿Es cliente?', user.role === 'client')}
            {user.role === 'client' && (
              <>
                {console.log('🔍 AppNavigator - Renderizando ClientTabs')}
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
                  name="ChatEvaluation" 
                  component={ChatEvaluationScreen} 
                  options={{ 
                    headerShown: true,
                    headerTitle: 'Evaluar Chat',
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
              </>
            )}
            
            {console.log('🔍 AppNavigator - Verificando si es admin:', user.role === 'admin')}
            {console.log('🔍 AppNavigator - ¿Es admin?', user.role === 'admin')}
            {user.role === 'admin' && (
              <>
                {console.log('🔍 AppNavigator - Renderizando AdminDashboard')}
                <Stack.Screen 
                  name="AdminDashboard" 
                  component={AdminDashboardScreen} 
                  options={{ headerShown: false }} 
                />
                <Stack.Screen 
                  name="AdminProducts" 
                  component={AdminProductsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Gestión de Productos',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminStores" 
                  component={AdminStoresScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Gestión de Tiendas',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="StorePhotoCapture" 
                  component={StorePhotoCaptureScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Capturar Foto de Local',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="StorePhotosList" 
                  component={StorePhotosListScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Fotos de Locales',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminUsers" 
                  component={AdminUsersScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Gestión de Usuarios',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminCreateUser" 
                  component={AdminCreateUserScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Crear Usuario',
                    headerBackTitle: 'Usuarios'
                  }} 
                />
                <Stack.Screen 
                  name="AdminCreateProduct" 
                  component={AdminCreateProductScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Crear Producto',
                    headerBackTitle: 'Productos'
                  }} 
                />
                <Stack.Screen 
                  name="AdminOrders" 
                  component={AdminOrdersScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Gestión de Órdenes',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="OrderDetails" 
                  component={OrderDetailsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Detalles de la Orden',
                    headerBackTitle: 'Órdenes'
                  }} 
                />
                <Stack.Screen 
                  name="AdminReports" 
                  component={AdminReportsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Reportes y Analytics',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminSettings" 
                  component={AdminSettingsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Configuraciones',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminProfile" 
                  component={AdminProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Perfil de Administrador',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="AdminEditProfile" 
                  component={AdminEditProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Editar Perfil',
                    headerBackTitle: 'Perfil'
                  }} 
                />
              </>
            )}
            
            {console.log('🔍 AppNavigator - ¿Es store_manager?', user.role === 'store_manager')}
            {user.role === 'store_manager' && (
              <>
                {console.log('🔍 AppNavigator - Renderizando StoreManagerDashboard')}
                <Stack.Screen 
                  name="StoreManagerDashboard" 
                  component={StoreManagerDashboardScreen} 
                  options={{ headerShown: false }} 
                />
                <Stack.Screen 
                  name="StoreManagerProfile" 
                  component={StoreManagerProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Perfil de Gestor',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="StoreManagerEditProfile" 
                  component={StoreManagerEditProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Editar Perfil',
                    headerBackTitle: 'Perfil'
                  }} 
                />
              </>
            )}
            
            {console.log('🔍 AppNavigator - ¿Es seller?', user.role === 'seller')}
            {user.role === 'seller' && (
              <>
                {console.log('🔍 AppNavigator - Renderizando SellerDashboard')}
                <Stack.Screen 
                  name="SellerDashboard" 
                  component={SellerDashboardScreen} 
                  options={{ headerShown: false }} 
                />
              </>
            )}
            
            {console.log('🔍 AppNavigator - ¿Es delivery?', user.role === 'delivery')}
            {user.role === 'delivery' && (
              <>
                {console.log('🔍 AppNavigator - Renderizando DeliveryDashboard')}
                <Stack.Screen 
                  name="DeliveryDashboard" 
                  component={DeliveryDashboardScreen} 
                  options={{ headerShown: false }} 
                />
                <Stack.Screen 
                  name="DeliveryProfile" 
                  component={DeliveryProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Perfil de Repartidor',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryEditProfile" 
                  component={DeliveryEditProfileScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Editar Perfil',
                    headerBackTitle: 'Perfil'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryOrders" 
                  component={DeliveryOrdersScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Mis Entregas',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryMap" 
                  component={DeliveryMapScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Mapa de Rutas',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryReport" 
                  component={DeliveryReportScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Reportes de Delivery',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryRatings" 
                  component={DeliveryRatingsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Mis Calificaciones',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliverySchedule" 
                  component={DeliveryScheduleScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Horario de Trabajo',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliverySettings" 
                  component={DeliverySettingsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Configuración de Repartidor',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryLocation" 
                  component={DeliveryLocationScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Ubicación en Tiempo Real',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="DeliveryEarnings" 
                  component={DeliveryEarningsScreen} 
                  options={{ 
                    headerShown: true,
                    title: 'Ganancias y Comisiones',
                    headerBackTitle: 'Dashboard'
                  }} 
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
