import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

// Componentes de layout
import Layout from './components/Layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Componentes de ruta protegida
import AdminRoute from './components/AdminRoute';
import StoreManagerRoute from './components/StoreManagerRoute';
import DeliveryRoute from './components/DeliveryRoute';
import ClientRoute from './components/ClientRoute';
import ProtectedRoute from './components/ProtectedRoute';

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

// Páginas de cliente
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Security from './pages/Security';
import SecuritySettings from './pages/SecuritySettings';
import Loyalty from './pages/Loyalty';
import Configuration from './pages/Configuration';

// Páginas de administrador
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminPromotions from './pages/AdminPromotions';
import AdminSales from './pages/AdminSales';
import AdminLoyalty from './pages/AdminLoyalty';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminRegistrationCodes from './pages/AdminRegistrationCodes';
import AdminSearchConfig from './pages/AdminSearchConfig';
import AdminGenerateProducts from './pages/AdminGenerateProducts';
import AdminUsers from './pages/AdminUsers';

// Páginas de gestor de tienda (por crear)
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

// Páginas de delivery (por crear)
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryMap from './pages/DeliveryMap';
import DeliveryReport from './pages/DeliveryReport';
import DeliveryRatings from './pages/DeliveryRatings';
import DeliverySchedule from './pages/DeliverySchedule';
import DeliveryStatus from './pages/DeliveryStatus';
import DeliveryProfile from './pages/DeliveryProfile';

// Páginas de cliente adicionales (por crear)
import ClientOrders from './pages/ClientOrders';
import ClientNotifications from './pages/ClientNotifications';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex">
          {/* Sidebar solo para usuarios autenticados */}
          {isAuthenticated && (
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )}
          
          <div className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
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

              {/* Rutas de administrador */}
              <Route path="/admin" element={
                <AdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </AdminRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/products" element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              } />
              <Route path="/admin/categories" element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              } />
              <Route path="/admin/promotions" element={
                <AdminRoute>
                  <AdminPromotions />
                </AdminRoute>
              } />
              <Route path="/admin/sales" element={
                <AdminRoute>
                  <AdminSales />
                </AdminRoute>
              } />
              <Route path="/admin/loyalty" element={
                <AdminRoute>
                  <AdminLoyalty />
                </AdminRoute>
              } />
              <Route path="/admin/analytics" element={
                <AdminRoute>
                  <AdminAnalytics />
                </AdminRoute>
              } />
              <Route path="/admin/registration-codes" element={
                <AdminRoute>
                  <AdminRegistrationCodes />
                </AdminRoute>
              } />
              <Route path="/admin/search-config" element={
                <AdminRoute>
                  <AdminSearchConfig />
                </AdminRoute>
              } />
              <Route path="/admin/generate-products" element={
                <AdminRoute>
                  <AdminGenerateProducts />
                </AdminRoute>
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
            </Routes>
          </div>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
