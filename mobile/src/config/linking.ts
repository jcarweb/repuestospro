import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<any> = {
  prefixes: ['piezasya://', 'https://piezasya.com'],
  
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      EmailVerification: 'email-verification',
      EmailVerificationCallback: 'verify-email/:token',
      EmailVerificationSuccess: 'email-verification-success',
      PINVerification: 'pin-verification',
      
      // Client screens
      ClientTabs: {
        screens: {
          ClientHome: 'client/home',
          Products: 'client/products',
          Cart: 'client/cart',
          Favorites: 'client/favorites',
          Orders: 'client/orders',
          Chat: 'client/chat',
          Profile: 'client/profile',
        },
      },
              ProductDetail: 'client/product/:id',
        ChatEvaluation: 'client/chat-evaluation',
        EditProfile: 'client/edit-profile',
        Settings: 'client/settings',
      
      // Admin screens
      AdminDashboard: 'admin/dashboard',
      
      // Store Manager screens
      StoreManagerDashboard: 'store-manager/dashboard',
      
      // Delivery screens
      DeliveryDashboard: 'delivery/dashboard',
    },
  },
};
