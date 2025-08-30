import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  Tag,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  Heart,
  Share2,
  Gift,
  Percent,
  Clock,
  Shield,
  Star,
  Eye,
  Save,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Lock,
  Zap,
  Award,
  Users,
  ShoppingBag,
  DollarSign,
  Calculator,
  Copy,
  Download,
  Printer,
  X
} from 'lucide-react';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, addItem } = useCart();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Estados para funcionalidades adicionales
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [showSaveForLater, setShowSaveForLater] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('free');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showProductQuickView, setShowProductQuickView] = useState<string | null>(null);
  const [showCartActions, setShowCartActions] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    setShowRemoveConfirm(null);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = () => {
    // TODO: Implementar proceso de checkout
    alert(t('cart.checkout.development'));
  };

  // Cupones disponibles (simulación)
  const availableCoupons = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', minAmount: 50, description: '10% de descuento en tu primera compra' },
    { code: 'FREESHIP', discount: 5, type: 'fixed', minAmount: 100, description: 'Envío gratuito + $5 de descuento' },
    { code: 'SAVE20', discount: 20, type: 'percentage', minAmount: 200, description: '20% de descuento en compras grandes' }
  ];

  // Opciones de envío
  const shippingOptions = [
    { id: 'free', name: 'Envío Gratis', price: 0, days: '3-5 días', description: 'Envío estándar gratuito' },
    { id: 'express', name: 'Envío Express', price: 8.99, days: '1-2 días', description: 'Entrega rápida' },
    { id: 'premium', name: 'Envío Premium', price: 15.99, days: 'Mismo día', description: 'Entrega en el mismo día' }
  ];

  // Calcular totales
  const subtotal = getTotalPrice();
  const shippingCost = selectedShipping === 'free' ? 0 : 
    shippingOptions.find(option => option.id === selectedShipping)?.price || 0;
  
  // Calcular descuento del cupón
  const couponDiscount = appliedCoupon ? 
    (appliedCoupon.type === 'percentage' ? 
      (subtotal * appliedCoupon.discount / 100) : 
      appliedCoupon.discount) : 0;
  
  const subtotalAfterDiscount = subtotal - couponDiscount;
  const taxes = subtotalAfterDiscount * 0.12; // 12% de impuestos
  const total = subtotalAfterDiscount + shippingCost + taxes;

  // Función para aplicar cupón
  const handleApplyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      if (subtotal >= coupon.minAmount) {
        setAppliedCoupon(coupon);
        setShowCouponModal(false);
        setCouponCode('');
        alert(t('cart.coupon.applied'));
      } else {
        alert(t('cart.coupon.minAmount', { amount: coupon.minAmount }));
      }
    } else {
      alert(t('cart.coupon.invalid'));
    }
  };

  // Función para remover cupón
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Función para guardar para después
  const handleSaveForLater = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSavedItems([...savedItems, item]);
      removeItem(itemId);
      setShowSaveForLater(null);
    }
  };

  // Función para mover de vuelta al carrito
  const handleMoveToCart = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    if (item) {
      addItem(item);
      setSavedItems(savedItems.filter(i => i.id !== itemId));
    }
  };

  // Función para remover de guardados
  const handleRemoveFromSaved = (itemId: string) => {
    setSavedItems(savedItems.filter(i => i.id !== itemId));
  };

  // Función para compartir carrito
  const handleShareCart = () => {
    const cartSummary = items.map(item => 
      `${item.name} - $${item.price.toFixed(2)} x${item.quantity}`
    ).join('\n');
    
    const message = `${t('cart.share.title')}\n\n${cartSummary}\n\n${t('cart.share.total')}: $${total.toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('cart.share.title'),
        text: message,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  // Función para imprimir carrito
  const handlePrintCart = () => {
    window.print();
  };

  // Función para descargar carrito como PDF
  const handleDownloadCart = () => {
    const cartData = {
      items,
      subtotal,
      shippingCost,
      couponDiscount,
      taxes,
      total,
      date: new Date().toLocaleDateString()
    };
    
    const blob = new Blob([JSON.stringify(cartData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cart-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Función para copiar resumen al portapapeles
  const handleCopySummary = () => {
    const summary = `Subtotal: $${subtotal.toFixed(2)}\nEnvío: $${shippingCost.toFixed(2)}\nDescuento: $${couponDiscount.toFixed(2)}\nImpuestos: $${taxes.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
    navigator.clipboard.writeText(summary);
    alert(t('cart.actions.copied'));
  };

  // Función para vista rápida de producto
  const handleQuickView = (itemId: string) => {
    setShowProductQuickView(itemId);
  };

  // Función para agregar a favoritos
  const handleAddToFavorites = (item: any) => {
    // Aquí se integraría con el contexto de favoritos
    alert(t('cart.actions.addedToFavorites'));
  };

  // Función para comparar productos
  const handleCompareProducts = () => {
    alert(t('cart.actions.compareFeature'));
  };

  // Función para calcular ahorro
  const calculateSavings = () => {
    return couponDiscount + (appliedCoupon?.code === 'FREESHIP' ? 5 : 0);
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('cart.title')}
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('cart.subtitle')}
            </p>
          </div>

          {/* Empty Cart State */}
          <div className={`rounded-lg shadow p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('cart.empty.title')}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('cart.empty.description')}
            </p>
            <Link 
              to="/categories"
              className="inline-flex items-center bg-[#FFC300] text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors focus:ring-2 focus:ring-[#FFC300]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('cart.empty.explore')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('cart.title')}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {items.length} {items.length === 1 ? t('cart.product') : t('cart.products')} {t('cart.inCart')}
              </p>
            </div>
            
            {/* Acciones del carrito */}
            <div className="flex items-center space-x-3">
              {/* Botón de acciones expandidas */}
              <div className="relative">
                <button
                  onClick={() => setShowCartActions(!showCartActions)}
                  className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                    isDark 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title={t('cart.actions.more')}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                
                {showCartActions && (
                  <div className={`absolute right-0 top-12 w-64 rounded-lg shadow-lg z-50 ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={handleShareCart}
                        className={`w-full flex items-center px-3 py-2 rounded text-sm transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('cart.actions.share')}
                      </button>
                      <button
                        onClick={handlePrintCart}
                        className={`w-full flex items-center px-3 py-2 rounded text-sm transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        {t('cart.actions.print')}
                      </button>
                      <button
                        onClick={handleDownloadCart}
                        className={`w-full flex items-center px-3 py-2 rounded text-sm transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('cart.actions.download')}
                      </button>
                      <button
                        onClick={handleCopySummary}
                        className={`w-full flex items-center px-3 py-2 rounded text-sm transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {t('cart.actions.copySummary')}
                      </button>
                      <button
                        onClick={handleCompareProducts}
                        className={`w-full flex items-center px-3 py-2 rounded text-sm transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('cart.actions.compare')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Cupón */}
              <button
                onClick={() => setShowCouponModal(true)}
                className={`px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Gift className="w-4 h-4 inline mr-1" />
                {t('cart.actions.coupon')}
              </button>
              
              {/* Vaciar carrito */}
              {showClearConfirm ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearCart}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('cart.actions.confirm')}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {t('cart.actions.cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className={`px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                    isDark 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('cart.actions.clear')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('cart.items.title')}
                </h2>
              </div>
              
              <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      {item.brand && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <Tag className="w-3 h-3 inline mr-1" />
                          {item.brand}
                        </p>
                      )}
                      {item.category && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <Package className="w-3 h-3 inline mr-1" />
                          {item.category}
                        </p>
                      )}
                      <p className="text-lg font-semibold text-[#FFC300]">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                          item.quantity <= 1 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-100'
                        }`}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className={`w-12 text-center text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total Price for this item */}
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Product Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Quick View */}
                      <button
                        onClick={() => handleQuickView(item.id)}
                        className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                            : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title={t('cart.actions.quickView')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Add to Favorites */}
                      <button
                        onClick={() => handleAddToFavorites(item)}
                        className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                          isDark 
                            ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-900/20' 
                            : 'text-pink-500 hover:text-pink-700 hover:bg-pink-50'
                        }`}
                        title={t('cart.actions.addToFavorites')}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      
                      {/* Save for Later */}
                      <button
                        onClick={() => setShowSaveForLater(item.id)}
                        className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                          isDark 
                            ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                            : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={t('cart.actions.saveForLater')}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      
                      {/* Remove Button */}
                      {showRemoveConfirm === item.id ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            {t('cart.actions.confirm')}
                          </button>
                          <button
                            onClick={() => setShowRemoveConfirm(null)}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            {t('cart.actions.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRemoveConfirm(item.id)}
                          className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                            isDark 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title={t('cart.actions.remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información adicional */}
            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-start space-x-3">
                <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('cart.info.title')}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('cart.info.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Guardado para después */}
            {savedItems.length > 0 && (
              <div className={`mt-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Save className="w-5 h-5 inline mr-2" />
                    {t('cart.saved.title')} ({savedItems.length})
                  </h2>
                </div>
                
                <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {savedItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {item.brand}
                          </p>
                        )}
                        {item.category && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            <Package className="w-3 h-3 inline mr-1" />
                            {item.category}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-[#FFC300]">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMoveToCart(item.id)}
                          className={`px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                            isDark 
                              ? 'bg-[#FFC300] text-black hover:bg-yellow-400' 
                              : 'bg-[#FFC300] text-black hover:bg-yellow-400'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />
                          {t('cart.saved.moveToCart')}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFromSaved(item.id)}
                          className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                            isDark 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title={t('cart.actions.remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow p-6 sticky top-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('cart.summary.title')}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {t('cart.summary.subtotal')} ({items.length} {items.length === 1 ? t('cart.product') : t('cart.products')})
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                {/* Cupón aplicado */}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      <Gift className="w-3 h-3 inline mr-1" />
                      {t('cart.summary.coupon')} ({appliedCoupon.code})
                    </span>
                    <span className="text-green-600 font-medium">
                      -${couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Subtotal después del descuento */}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {t('cart.summary.subtotalAfterDiscount')}
                    </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ${subtotalAfterDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Opciones de envío */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      <Truck className="w-3 h-3 inline mr-1" />
                      {t('cart.summary.shipping')}
                    </span>
                    <button
                      onClick={() => setShowShippingModal(true)}
                      className="text-[#FFC300] hover:underline text-sm"
                    >
                      {shippingCost === 0 ? t('cart.summary.free') : `$${shippingCost.toFixed(2)}`}
                    </button>
                  </div>
                  
                  {/* Información de envío */}
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {shippingOptions.find(option => option.id === selectedShipping)?.description}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {t('cart.summary.taxes')}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ${taxes.toFixed(2)}
                  </span>
                </div>
                
                {/* Ahorro total */}
                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      <Percent className="w-3 h-3 inline mr-1" />
                      {t('cart.summary.savings')}
                    </span>
                    <span className="text-green-600 font-medium">
                      ${calculateSavings().toFixed(2)}
                    </span>
                  </div>
                )}
                
                <hr className={isDark ? 'border-gray-700' : 'border-gray-200'} />
                <div className="flex justify-between text-lg font-semibold">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('cart.summary.total')}
                  </span>
                  <span className="text-[#FFC300]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#FFC300] text-black py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors font-medium focus:ring-2 focus:ring-[#FFC300]"
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  {t('cart.actions.checkout')}
                </button>
                
                <Link
                  to="/categories"
                  className={`block w-full text-center py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-[#FFC300] ${
                    isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  {t('cart.actions.continueShopping')}
                </Link>
              </div>

              {/* Beneficios */}
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('cart.benefits.title')}
                </h3>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    {t('cart.benefits.freeShipping')}
                  </li>
                  <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    {t('cart.benefits.securePayment')}
                  </li>
                  <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    {t('cart.benefits.returns')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cupón */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Gift className="w-5 h-5 inline mr-2" />
                  {t('cart.coupon.title')}
                </h3>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('cart.coupon.code')}
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t('cart.coupon.placeholder')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('cart.coupon.available')}
                  </h4>
                  {availableCoupons.map((coupon) => (
                    <div key={coupon.code} className={`p-3 rounded-lg border ${
                      isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {coupon.code}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {coupon.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCouponCode(coupon.code);
                            handleApplyCoupon();
                          }}
                          className="px-3 py-1 bg-[#FFC300] text-black text-sm rounded hover:bg-yellow-400 transition-colors"
                        >
                          {t('cart.coupon.apply')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleApplyCoupon}
                    className="flex-1 bg-[#FFC300] text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                  >
                    {t('cart.coupon.apply')}
                  </button>
                  <button
                    onClick={() => setShowCouponModal(false)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('cart.actions.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envío */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Truck className="w-5 h-5 inline mr-2" />
                  {t('cart.shipping.title')}
                </h3>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShipping === option.id
                        ? 'border-[#FFC300] bg-yellow-50 dark:bg-yellow-900/20'
                        : isDark 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping === option.id}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {option.name}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {option.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {option.price === 0 ? t('cart.shipping.free') : `$${option.price.toFixed(2)}`}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {option.days}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="w-full bg-[#FFC300] text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                >
                  {t('cart.shipping.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Rápida de Producto */}
      {showProductQuickView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full mx-4 rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Eye className="w-5 h-5 inline mr-2" />
                  {t('cart.quickView.title')}
                </h3>
                <button
                  onClick={() => setShowProductQuickView(null)}
                  className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const item = items.find(i => i.id === showProductQuickView);
                if (!item) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                        {item.brand && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {item.brand}
                          </p>
                        )}
                        {item.category && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            <Package className="w-3 h-3 inline mr-1" />
                            {item.category}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-2xl font-bold text-[#FFC300]">
                          ${item.price.toFixed(2)}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('cart.quickView.quantity')}: {item.quantity}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAddToFavorites(item)}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {t('cart.actions.addToFavorites')}
                        </button>
                        
                        <button
                          onClick={() => setShowProductQuickView(null)}
                          className="w-full bg-[#FFC300] text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                        >
                          {t('cart.quickView.close')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de Guardar para Después */}
      {showSaveForLater && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Save className="w-5 h-5 inline mr-2" />
                  {t('cart.saved.confirmTitle')}
                </h3>
                <button
                  onClick={() => setShowSaveForLater(null)}
                  className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('cart.saved.confirmMessage')}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSaveForLater(showSaveForLater)}
                  className="flex-1 bg-[#FFC300] text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                >
                  {t('cart.saved.confirm')}
                </button>
                <button
                  onClick={() => setShowSaveForLater(null)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('cart.actions.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 