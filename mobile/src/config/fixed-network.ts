// Configuración fija de red para evitar escaneo automático
export const FIXED_NETWORK_CONFIG = {
  baseUrl: 'http://192.168.0.110:3001/api', // IP real del backend según netstat
  isLocal: true,
  networkName: 'Backend Fijo',
  lastTested: Date.now(),
  isWorking: true,
};

// Función para obtener la configuración fija
export const getFixedNetworkConfig = () => {
  console.log('🔧 Usando configuración fija de red:', FIXED_NETWORK_CONFIG.baseUrl);
  return FIXED_NETWORK_CONFIG;
};
