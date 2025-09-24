import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ActiveStoreProvider } from './contexts/ActiveStoreContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import InactivityProvider from './components/InactivityProvider';
import EmailVerificationRoute from './components/EmailVerificationRoute';

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
import Products from './pages/Products';
import Categories from './pages/Categories';
import SearchResults from './pages/SearchResults';
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
import MasterConfiguration from './pages/admin/MasterConfiguration';
import AdminSubcategories from './pages/AdminSubcategories';
import AdminPromotions from './pages/AdminPromotions';
import AdminAdvertisements from './pages/AdminAdvertisements';
import AdminSales from './pages/AdminSales';
import AdminSalesReports from './pages/AdminSalesReports';
import AdminLoyalty from './pages/AdminLoyalty';
import AdminStorePhotos from './pages/AdminStorePhotos';
import AdminStorePhotoUpload from './pages/AdminStorePhotoUpload';
import AdminDataEnrichment from './pages/AdminDataEnrichment';
import AdminDataEnrichmentUpload from './pages/AdminDataEnrichmentUpload';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminRegistrationCodes from './pages/AdminRegistrationCodes';
import AdminSearchConfig from './pages/AdminSearchConfig';
import AdminGenerateProducts from './pages/AdminGenerateProducts';
import AdminMonetization from './pages/AdminMonetization';
import AdminGlobalSettings from './pages/AdminGlobalSettings';
import AdminInventory from './pages/AdminInventory';

// Páginas de gestor de tienda
import StoreManagerDashboard from './pages/StoreManagerDashboard';
import StoreManagerProducts from './pages/StoreManagerProducts';
import StoreManagerPromotions from './pages/StoreManagerPromotions';
import StoreManagerSales from './pages/StoreManagerSales';
import StoreManagerOrdersPage from './pages/StoreManagerOrdersPage';
import StoreManagerDelivery from './pages/StoreManagerDelivery';
import StoreManagerAnalytics from './pages/StoreManagerAnalytics';
import StoreManagerMessages from './pages/StoreManagerMessages';
import StoreManagerReviews from './pages/StoreManagerReviews';
import StoreManagerSettings from './pages/StoreManagerSettings';
import StoreManagerInventory from './pages/StoreManagerInventory';
import StoreManagerInventoryAlerts from './pages/StoreManagerInventoryAlerts';
import StoreManagerNotifications from './pages/StoreManagerNotifications';
import StoreManagerSellers from './pages/StoreManagerSellers';
import StoreSetup from './pages/StoreSetup';
import InventoryManagementPage from './pages/InventoryManagementPage';
import InventoryReportsPage from './pages/InventoryReportsPage';
import InventoryTransfersPage from './pages/InventoryTransfersPage';

// Páginas de delivery
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryMap from './pages/DeliveryMap';
import DeliveryReport from './pages/DeliveryReport';
import DeliveryRatings from './pages/DeliveryRatings';
import DeliverySchedule from './pages/DeliverySchedule';
import DeliveryAvailabilityStatus from './pages/DeliveryAvailabilityStatus';
import DeliveryProfile from './pages/DeliveryProfile';

// Páginas de vendedor
import SellerDashboard from './pages/SellerDashboard';
import SellerPrices from './pages/SellerPrices';
import SellerChat from './pages/SellerChat';
import SellerQuotes from './pages/SellerQuotes';
import SellerProducts from './pages/SellerProducts';
import SellerCustomers from './pages/SellerCustomers';
import SellerPerformance from './pages/SellerPerformance';
import SellerProfile from './pages/SellerProfile';

// Componentes de rutas protegidas
import AdminRoute from './components/AdminRoute';
import StoreManagerRoute from './components/StoreManagerRoute';
import DeliveryRoute from './components/DeliveryRoute';
import DeliveryLayout from './components/DeliveryLayout';
import SellerRoute from './components/SellerRoute';
import SellerLayout from './components/SellerLayout';
import ClientRoute from './components/ClientRoute';
import ClientLayout from './components/ClientLayout';
import AdminLayout from './components/AdminLayout';
import StoreManagerLayout from './components/StoreManagerLayout';
import StoreManagerInitializer from './components/StoreManagerInitializer';
import StoreBranchesManager from './components/StoreBranchesManager';
import ProtectedRoute from './components/ProtectedRoute';
import QuickStoreCheck from './components/QuickStoreCheck';



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
      {/* Temporalmente deshabilitado para debugging */}
      {/* <InactivityProvider timeoutMinutes={60} warningMinutes={10}> */}
        <Routes>
        {/* Rutas de verificación de email - completamente limpias, sin Header ni Sidebar */}
        <Route path="/verify-email" element={<EmailVerificationRoute />} />
        <Route path="/email-verification" element={<EmailVerificationRoute />} />
        <Route path="/google-callback/verify-email" element={<EmailVerificationRoute />} />
        
        {/* Rutas de google-callback - completamente limpias, sin Header ni Sidebar */}
        <Route path="/google-callback/register-with-code" element={<RegisterWithCode />} />
        
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
            <Route path="/inventory" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminInventory />
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
            <Route path="/master-configuration" element={
              <AdminRoute>
                <AdminLayout>
                  <MasterConfiguration />
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
            <Route path="/sales-reports" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSalesReports />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/delivery" element={
              <AdminRoute>
                <AdminLayout>
                  <DeliveryDashboard />
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
            <Route path="/admin/store-photos" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminStorePhotos />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/store-photos/upload" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminStorePhotoUpload />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/data-enrichment" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDataEnrichment />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/data-enrichment/upload" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDataEnrichmentUpload />
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
             
             <Header />
             
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

                   <Route path="/reset-password" element={<ResetPassword />} />
                   <Route path="/google-callback" element={<GoogleCallback />} />
                   <Route path="/referral/:code" element={<ReferralLanding />} />
                   <Route path="/products" element={<Products />} />
                   <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/search-results" element={<SearchResults />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:category" element={<CategoryProducts />} />
                   <Route path="/nearby-products" element={<NearbyProducts />} />
                   <Route path="/store-registration" element={<StoreRegistration />} />
                 </Routes>
               </div>
             </div>
             
             <Footer />
           </div>
         } />

                   {/* Rutas específicas del cliente - SIN Header ni Sidebar general */}
                   <Route path="/cart" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Cart />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/favorites" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Favorites />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/profile" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Profile />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/security" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Security />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/security-settings" element={
                     <ClientRoute>
                       <ClientLayout>
                         <SecuritySettings />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/loyalty" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Loyalty />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/configuration" element={
                     <ClientRoute>
                       <ClientLayout>
                         <Configuration />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/orders" element={
                     <ClientRoute>
                       <ClientLayout>
                         <ClientOrders />
                       </ClientLayout>
                     </ClientRoute>
                   } />
                   <Route path="/notifications" element={
                     <ClientRoute>
                       <ClientLayout>
                         <ClientNotifications />
                       </ClientLayout>
                     </ClientRoute>
                   } />

                   {/* Rutas de gestor de tienda - SIN Header ni Sidebar principal */}
          <Route path="/store-manager/*" element={
            <Routes>
                             <Route path="/" element={
                 <StoreManagerRoute>
                   <QuickStoreCheck>
                     <StoreManagerInitializer />
                   </QuickStoreCheck>
                 </StoreManagerRoute>
               } />
              <Route path="/branches" element={
                <StoreManagerRoute>
                  <StoreBranchesManager />
                </StoreManagerRoute>
              } />
              <Route path="/dashboard" element={
                <StoreManagerRoute>
                  <StoreManagerLayout>
                    <StoreManagerDashboard />
                  </StoreManagerLayout>
                </StoreManagerRoute>
              } />
             <Route path="/products" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerProducts />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/inventory" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerInventory />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/inventory-alerts" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerInventoryAlerts />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/notifications" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerNotifications />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/promotions" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerPromotions />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/sales" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerSales />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/orders" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerOrdersPage />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/delivery" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerDelivery />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/analytics" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerAnalytics />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/messages" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerMessages />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/reviews" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerReviews />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/sellers" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerSellers />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/settings" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <StoreManagerSettings />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/profile" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <Profile />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/security" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <Security />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/configuration" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <Configuration />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/inventory" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <InventoryManagementPage />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/inventory/reports" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <InventoryReportsPage />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
             <Route path="/inventory/transfers" element={
               <StoreManagerRoute>
                 <StoreManagerLayout>
                   <InventoryTransfersPage />
                 </StoreManagerLayout>
               </StoreManagerRoute>
             } />
           </Routes>
         } />

                                       {/* Ruta de store-setup separada */}
           <Route path="/store-setup" element={
             <StoreManagerRoute>
               <StoreSetup />
             </StoreManagerRoute>
           } />

                    {/* Rutas de delivery - SIN Header ni Sidebar principal */}
           <Route path="/delivery/*" element={
             <Routes>
               <Route path="/" element={
                 <DeliveryRoute>
                   <Navigate to="/delivery/dashboard" replace />
                 </DeliveryRoute>
               } />
               <Route path="/dashboard" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryDashboard />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/orders" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryOrders />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/map" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryMap />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/report" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryReport />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/ratings" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryRatings />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/schedule" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliverySchedule />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/status" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryAvailabilityStatus />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/profile" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <DeliveryProfile />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               
               {/* Rutas de perfil para delivery */}
               <Route path="/user-profile" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <Profile />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/security" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <Security />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
               <Route path="/configuration" element={
                 <DeliveryRoute>
                   <DeliveryLayout>
                     <Configuration />
                   </DeliveryLayout>
                 </DeliveryRoute>
               } />
             </Routes>
           } />

                    {/* Rutas de vendedor - SIN Header ni Sidebar principal */}
           <Route path="/seller/*" element={
             <Routes>
               <Route path="/" element={
                 <SellerRoute>
                   <Navigate to="/seller/dashboard" replace />
                 </SellerRoute>
               } />
               <Route path="/dashboard" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerDashboard />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/prices" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerPrices />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/chat" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerChat />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/quotes" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerQuotes />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/products" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerProducts />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/customers" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerCustomers />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/performance" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerPerformance />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/profile" element={
                 <SellerRoute>
                   <SellerLayout>
                     <SellerProfile />
                   </SellerLayout>
                 </SellerRoute>
               } />
               
               {/* Rutas de perfil para vendedor */}
               <Route path="/user-profile" element={
                 <SellerRoute>
                   <SellerLayout>
                     <Profile />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/security" element={
                 <SellerRoute>
                   <SellerLayout>
                     <Security />
                   </SellerLayout>
                 </SellerRoute>
               } />
               <Route path="/configuration" element={
                 <SellerRoute>
                   <SellerLayout>
                     <Configuration />
                   </SellerLayout>
                 </SellerRoute>
               } />
             </Routes>
           } />
        </Routes>
      {/* </InactivityProvider> */}
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <ActiveStoreProvider>
            <CartProvider>
              <FavoritesProvider>
                <AppContent />
              </FavoritesProvider>
            </CartProvider>
          </ActiveStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
