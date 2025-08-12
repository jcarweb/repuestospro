import { authMiddleware, adminMiddleware } from './authMiddleware';

// Exportar con nombres más descriptivos
export const authenticateToken = authMiddleware;
export const requireAdmin = adminMiddleware;

// También exportar los nombres originales
export { authMiddleware, adminMiddleware }; 