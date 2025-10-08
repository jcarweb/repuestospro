export interface BackendEnvironment {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  isLocal: boolean;
  isProduction: boolean;
}

export const BACKEND_ENVIRONMENTS: BackendEnvironment[] = [
  {
    id: 'local',
    name: 'Local Development',
    baseUrl: 'http://192.168.31.122:5000/api',
    description: 'Backend local en tu computadora',
    isLocal: true,
    isProduction: false
  },
  {
    id: 'render',
    name: 'Render Production',
    baseUrl: 'https://piezasya-back.onrender.com/api',
    description: 'Backend en producción (Render)',
    isLocal: false,
    isProduction: true
  },
  {
    id: 'localhost',
    name: 'Localhost',
    baseUrl: 'http://localhost:5000/api',
    description: 'Backend local (localhost)',
    isLocal: true,
    isProduction: false
  }
];

export const DEFAULT_ENVIRONMENT = 'render';

export const getEnvironmentById = (id: string): BackendEnvironment | undefined => {
  return BACKEND_ENVIRONMENTS.find(env => env.id === id);
};

export const getCurrentEnvironment = (): BackendEnvironment => {
  return getEnvironmentById(DEFAULT_ENVIRONMENT) || BACKEND_ENVIRONMENTS[0];
};
