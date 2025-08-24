import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authMiddleware } from '../middleware/authMiddleware';
import { clientMiddleware, storeManagerMiddleware, adminMiddleware } from '../middleware/roleMiddleware';
import { chatContentFilterMiddleware } from '../middleware/contentFilter';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

export default function createChatRoutes(chatController: ChatController) {
  // Crear nuevo chat (solo clientes)
  router.post('/create', clientMiddleware, chatController.createChat.bind(chatController));

  // Obtener chats del usuario
  router.get('/my-chats', chatController.getUserChats.bind(chatController));

  // Obtener chat específico por ID
  router.get('/:chatId', chatController.getChatById.bind(chatController));

  // Obtener mensajes de un chat
  router.get('/:chatId/messages', chatController.getChatMessages.bind(chatController));

  // Cerrar chat
  router.put('/:chatId/close', chatController.closeChat.bind(chatController));

  // Estadísticas de chat (solo admins)
  router.get('/admin/stats', adminMiddleware, chatController.getChatStats.bind(chatController));

  return router;
}
