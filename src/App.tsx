import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Configuration from './pages/Configuration';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPromotions from './pages/AdminPromotions';
import AdminSearchConfig from './pages/AdminSearchConfig';
import AdminGenerateProducts from './pages/AdminGenerateProducts';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StoreManagerRoute from './components/StoreManagerRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <div className="App">
              <Header />
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:category" element={<CategoryProducts />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />

                {/* Rutas protegidas */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/security" element={
                  <ProtectedRoute>
                    <Security />
                  </ProtectedRoute>
                } />
                <Route path="/configuration" element={
                  <ProtectedRoute>
                    <Configuration />
                  </ProtectedRoute>
                } />

                {/* Rutas de administrador */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/promotions" element={
                  <AdminRoute>
                    <AdminPromotions />
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
                    <AdminDashboard />
                  </StoreManagerRoute>
                } />
              </Routes>
            </div>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
