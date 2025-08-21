import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterWithCode from './pages/RegisterWithCode';
import VerifyEmail from './pages/VerifyEmail';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import ReferralLanding from './pages/ReferralLanding';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import NearbyProducts from './pages/NearbyProducts';
import StoreRegistration from './pages/StoreRegistration';

// Páginas de cliente
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Security from './pages/Security';
import SecuritySettings from './pages/SecuritySettings';
import Loyalty from './pages/Loyalty';
import Configuration from './pages/Configuration';
import ClientOrders from './pages/ClientOrders';
import ClientNotifications from './pages/ClientNotifications';

// Páginas de administrador
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminSubcategories from './pages/AdminSubcategories';
import AdminPromotions from './pages/AdminPromotions';
import AdminAdvertisements from './pages/AdminAdvertisements';
import AdminSales from './pages/AdminSales';
import AdminLoyalty from './pages/AdminLoyalty';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminRegistrationCodes from './pages/AdminRegistrationCodes';
import AdminSearchConfig from './pages/AdminSearchConfig';
import AdminGenerateProducts from './pages/AdminGenerateProducts';
import AdminMonetization from './pages/AdminMonetization';
import AdminGlobalSettings from './pages/AdminGlobalSettings';

// Páginas de gestor de tienda
import StoreManagerDashboard from './pages/StoreManagerDashboard';
import StoreManagerProducts from './pages/StoreManagerProducts';
import StoreManagerPromotions from './pages/StoreManagerPromotions';
import StoreManagerSales from './pages/StoreManagerSales';
import StoreManagerOrders from './pages/StoreManagerOrders';
import StoreManagerDelivery from './pages/StoreManagerDelivery';
import StoreManagerAnalytics from './pages/StoreManagerAnalytics';
import StoreManagerMessages from './pages/StoreManagerMessages';
import StoreManagerReviews from './pages/StoreManagerReviews';
import StoreManagerSettings from './pages/StoreManagerSettings';
import StoreSetup from './pages/StoreSetup';

// Páginas de delivery
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryMap from './pages/DeliveryMap';
import DeliveryReport from './pages/DeliveryReport';
import DeliveryRatings from './pages/DeliveryRatings';
import DeliverySchedule from './pages/DeliverySchedule';
import DeliveryStatus from './pages/DeliveryStatus';
import DeliveryProfile from './pages/DeliveryProfile';

// Componentes de rutas protegidas
import AdminRoute from './components/AdminRoute';
import StoreManagerRoute from './components/StoreManagerRoute';
import DeliveryRoute from './components/DeliveryRoute';
import ClientRoute from './components/ClientRoute';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';



function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, hasRole, user, isLoading } = useAuth();

  // Mostrar loading mientras se inicializa la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
          <p className="text-[#333333]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rutas de administrador - sin Header ni Sidebar normal */}
        <Route path="/admin/*" element={
          <Routes>
            <Route path="/" element={
              <AdminRoute>
                <Navigate to="/admin/dashboard" replace />
              </AdminRoute>
            } />
            <Route path="/dashboard" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/users" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/stores" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminStores />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/products" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/categories" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/subcategories" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSubcategories />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/promotions" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminPromotions />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/advertisements" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminAdvertisements />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/sales" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSales />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/loyalty" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLoyalty />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/analytics" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/registration-codes" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminRegistrationCodes />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/search-config" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSearchConfig />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/generate-products" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminGenerateProducts />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/monetization" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminMonetization />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/settings" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminGlobalSettings />
                </AdminLayout>
              </AdminRoute>
            } />
            {/* Rutas de perfil para admin */}
            <Route path="/profile" element={
              <AdminRoute>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/security" element={
              <AdminRoute>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/configuration" element={
              <AdminRoute>
                <AdminLayout>
                  <Configuration />
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
        } />

        {/* Rutas normales con Header y Sidebar */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-50">
            {/* TEST DIV - Should be visible at the very top */}
            <div style={{
              backgroundColor: 'red', 
              color: 'white', 
              padding: '20px', 
              textAlign: 'center', 
              fontSize: '24px',
              fontWeight: 'bold',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999
            }}>
              🚨 TEST APP - Si ves esto, la aplicación funciona 🚨
            </div>
            
            <Header />
            
            <div className="flex">
              {/* Sidebar solo para usuarios autenticados */}
              {isAuthenticated && (
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              )}
              
              <div className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={
                    isAuthenticated && user && user.role === 'admin' ? (
                      <Navigate to="/admin/dashboard" replace />
                    ) : (
                      <Home />
                    )
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register-with-code" element={<RegisterWithCode />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/email-verification" element={<EmailVerification />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/google-callback" element={<GoogleCallback />} />
                  <Route path="/referral/:code" element={<ReferralLanding />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:id" element={<CategoryProducts />} />
                  <Route path="/nearby-products" element={<NearbyProducts />} />
                  <Route path="/store-registration" element={<StoreRegistration />} />

                  {/* Rutas protegidas para clientes */}
                  <Route path="/cart" element={
                    <ClientRoute>
                      <Cart />
                    </ClientRoute>
                  } />
                  <Route path="/favorites" element={
                    <ClientRoute>
                      <Favorites />
                    </ClientRoute>
                  } />
                  <Route path="/profile" element={
                    <ClientRoute>
                      <Profile />
                    </ClientRoute>
                  } />
                  <Route path="/security" element={
                    <ClientRoute>
                      <Security />
                    </ClientRoute>
                  } />
                  <Route path="/security-settings" element={
                    <ClientRoute>
                      <SecuritySettings />
                    </ClientRoute>
                  } />
                  <Route path="/loyalty" element={
                    <ClientRoute>
                      <Loyalty />
                    </ClientRoute>
                  } />
                  <Route path="/configuration" element={
                    <ClientRoute>
                      <Configuration />
                    </ClientRoute>
                  } />
                  <Route path="/orders" element={
                    <ClientRoute>
                      <ClientOrders />
                    </ClientRoute>
                  } />
                  <Route path="/notifications" element={
                    <ClientRoute>
                      <ClientNotifications />
                    </ClientRoute>
                  } />

                  {/* Rutas de gestor de tienda */}
                  <Route path="/store-manager" element={
                    <StoreManagerRoute>
                      <Navigate to="/store-manager/dashboard" replace />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/dashboard" element={
                    <StoreManagerRoute>
                      <StoreManagerDashboard />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/products" element={
                    <StoreManagerRoute>
                      <StoreManagerProducts />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/promotions" element={
                    <StoreManagerRoute>
                      <StoreManagerPromotions />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/sales" element={
                    <StoreManagerRoute>
                      <StoreManagerSales />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/orders" element={
                    <StoreManagerRoute>
                      <StoreManagerOrders />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/delivery" element={
                    <StoreManagerRoute>
                      <StoreManagerDelivery />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/analytics" element={
                    <StoreManagerRoute>
                      <StoreManagerAnalytics />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/messages" element={
                    <StoreManagerRoute>
                      <StoreManagerMessages />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/reviews" element={
                    <StoreManagerRoute>
                      <StoreManagerReviews />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/settings" element={
                    <StoreManagerRoute>
                      <StoreManagerSettings />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-setup" element={
                    <StoreManagerRoute>
                      <StoreSetup />
                    </StoreManagerRoute>
                  } />
                  
                  {/* Rutas de perfil para gestor de tienda */}
                  <Route path="/store-manager/profile" element={
                    <StoreManagerRoute>
                      <Profile />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/security" element={
                    <StoreManagerRoute>
                      <Security />
                    </StoreManagerRoute>
                  } />
                  <Route path="/store-manager/configuration" element={
                    <StoreManagerRoute>
                      <Configuration />
                    </StoreManagerRoute>
                  } />

                  {/* Rutas de delivery */}
                  <Route path="/delivery" element={
                    <DeliveryRoute>
                      <Navigate to="/delivery/dashboard" replace />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/dashboard" element={
                    <DeliveryRoute>
                      <DeliveryDashboard />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/orders" element={
                    <DeliveryRoute>
                      <DeliveryOrders />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/map" element={
                    <DeliveryRoute>
                      <DeliveryMap />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/report" element={
                    <DeliveryRoute>
                      <DeliveryReport />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/ratings" element={
                    <DeliveryRoute>
                      <DeliveryRatings />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/schedule" element={
                    <DeliveryRoute>
                      <DeliverySchedule />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/status" element={
                    <DeliveryRoute>
                      <DeliveryStatus />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/profile" element={
                    <DeliveryRoute>
                      <DeliveryProfile />
                    </DeliveryRoute>
                  } />
                  
                  {/* Rutas de perfil para delivery */}
                  <Route path="/delivery/user-profile" element={
                    <DeliveryRoute>
                      <Profile />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/security" element={
                    <DeliveryRoute>
                      <Security />
                    </DeliveryRoute>
                  } />
                  <Route path="/delivery/configuration" element={
                    <DeliveryRoute>
                      <Configuration />
                    </DeliveryRoute>
                  } />
                </Routes>
              </div>
            </div>
            
            <Footer />
          </div>
        } />
      </Routes>
      
             
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
