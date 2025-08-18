import React, { createContext, useContext, useState, ReactNode } from 'react';
import { profileService } from '../services/profileService';

interface TwoFactorContextType {
  isTwoFactorEnabled: boolean;
  requireTwoFactor: (action: string) => Promise<boolean>;
  verifyTwoFactorCode: (code: string) => Promise<boolean>;
  showTwoFactorModal: boolean;
  setShowTwoFactorModal: (show: boolean) => void;
  currentAction: string | null;
  isLoading: boolean;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

interface TwoFactorProviderProps {
  children: ReactNode;
  isTwoFactorEnabled: boolean;
}

export const TwoFactorProvider: React.FC<TwoFactorProviderProps> = ({ 
  children, 
  isTwoFactorEnabled 
}) => {
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResolve, setPendingResolve] = useState<((value: boolean) => void) | null>(null);

  const requireTwoFactor = async (action: string): Promise<boolean> => {
    // Si 2FA no está habilitado, permitir la acción
    if (!isTwoFactorEnabled) {
      return true;
    }

    // Si ya hay una verificación en curso, esperar
    if (pendingResolve) {
      return new Promise((resolve) => {
        // Esperar a que se complete la verificación actual
        const checkPending = () => {
          if (!pendingResolve) {
            resolve(true);
          } else {
            setTimeout(checkPending, 100);
          }
        };
        checkPending();
      });
    }

    // Mostrar modal de verificación
    setCurrentAction(action);
    setShowTwoFactorModal(true);

    return new Promise((resolve) => {
      setPendingResolve(() => resolve);
    });
  };

  const verifyTwoFactorCode = async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verificar el código con el backend
      const result = await profileService.setTwoFactor({ enabled: true, code });
      
      if (result.success) {
        // Código válido
        setShowTwoFactorModal(false);
        setCurrentAction(null);
        setIsLoading(false);
        
        // Resolver la promesa pendiente
        if (pendingResolve) {
          pendingResolve(true);
          setPendingResolve(null);
        }
        
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const value: TwoFactorContextType = {
    isTwoFactorEnabled,
    requireTwoFactor,
    verifyTwoFactorCode,
    showTwoFactorModal,
    setShowTwoFactorModal,
    currentAction,
    isLoading
  };

  return (
    <TwoFactorContext.Provider value={value}>
      {children}
    </TwoFactorContext.Provider>
  );
};

export const useTwoFactor = (): TwoFactorContextType => {
  const context = useContext(TwoFactorContext);
  if (context === undefined) {
    throw new Error('useTwoFactor must be used within a TwoFactorProvider');
  }
  return context;
};
