import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
  }>({
    visible: false,
    message: '',
    type: 'info',
    duration: 4000,
  });

  const showToast = (message: string, type: ToastType = 'info', duration: number = 4000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const value: ToastContextType = {
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};
