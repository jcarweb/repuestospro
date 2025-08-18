import { useTwoFactor } from '../contexts/TwoFactorContext';

export const useSensitiveAction = () => {
  const { requireTwoFactor, verifyTwoFactorCode, showTwoFactorModal, setShowTwoFactorModal, currentAction, isLoading } = useTwoFactor();

  const executeSensitiveAction = async <T>(
    action: string,
    actionFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      // Verificar si se requiere 2FA
      const isVerified = await requireTwoFactor(action);
      
      if (!isVerified) {
        // El usuario canceló la verificación
        return null;
      }

      // Ejecutar la acción
      return await actionFunction();
    } catch (error) {
      console.error('Error executing sensitive action:', error);
      throw error;
    }
  };

  const handleVerifyCode = async (code: string): Promise<boolean> => {
    return await verifyTwoFactorCode(code);
  };

  const closeModal = () => {
    setShowTwoFactorModal(false);
  };

  return {
    executeSensitiveAction,
    handleVerifyCode,
    showTwoFactorModal,
    closeModal,
    currentAction,
    isLoading
  };
};

// Lista de acciones sensibles que requieren 2FA
export const SENSITIVE_ACTIONS = {
  // Datos personales
  UPDATE_PERSONAL_INFO: 'Actualizar información personal',
  UPDATE_ADDRESS: 'Actualizar dirección',
  UPDATE_PHONE: 'Actualizar número de teléfono',
  UPDATE_EMAIL: 'Actualizar dirección de email',
  
  // Datos jurídicos
  UPDATE_LEGAL_DOCUMENTS: 'Actualizar documentos jurídicos',
  UPDATE_TAX_INFO: 'Actualizar información fiscal',
  UPDATE_COMPANY_INFO: 'Actualizar información de empresa',
  
  // Información financiera
  UPDATE_PAYMENT_METHODS: 'Actualizar métodos de pago',
  ADD_CREDIT_CARD: 'Agregar tarjeta de crédito',
  REMOVE_CREDIT_CARD: 'Eliminar tarjeta de crédito',
  UPDATE_BANK_ACCOUNT: 'Actualizar cuenta bancaria',
  
  // Transacciones monetarias
  PROCESS_PAYMENT: 'Procesar pago',
  PROCESS_REFUND: 'Procesar reembolso',
  TRANSFER_FUNDS: 'Transferir fondos',
  WITHDRAW_FUNDS: 'Retirar fondos',
  
  // Configuración de seguridad
  CHANGE_PASSWORD: 'Cambiar contraseña',
  UPDATE_SECURITY_SETTINGS: 'Actualizar configuración de seguridad',
  DISABLE_2FA: 'Desactivar autenticación de dos factores',
  
  // Gestión de cuenta
  DELETE_ACCOUNT: 'Eliminar cuenta',
  DEACTIVATE_ACCOUNT: 'Desactivar cuenta',
  EXPORT_PERSONAL_DATA: 'Exportar datos personales',
  
  // Pedidos y compras
  CANCEL_ORDER: 'Cancelar pedido',
  MODIFY_ORDER: 'Modificar pedido',
  REQUEST_REFUND: 'Solicitar reembolso',
  
  // Configuración de tienda (para administradores)
  UPDATE_STORE_SETTINGS: 'Actualizar configuración de tienda',
  MANAGE_USERS: 'Gestionar usuarios',
  VIEW_ANALYTICS: 'Ver analíticas',
  MANAGE_INVENTORY: 'Gestionar inventario'
} as const;

export type SensitiveActionType = keyof typeof SENSITIVE_ACTIONS;
