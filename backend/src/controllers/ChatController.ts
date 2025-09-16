import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ChatService } from '../services/ChatService';
import Chat from '../models/Chat';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import Store from '../models/Store';
import Product from '../models/Product';

export class ChatController {
  constructor(private chatService: ChatService) {}

  // Iniciar un nuevo chat
  async createChat(req: Request, res: Response) {
    try {
      const { storeId, productId } = req.body;
      const clientId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      // Solo clientes pueden iniciar chats
      if (userRole !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'Solo los clientes pueden iniciar chats'
        });
      }

      // Validar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      // Validar producto si se proporciona
      if (productId) {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
          });
        }

        // Verificar que el producto pertenece a la tienda
        if (!product.store.equals(storeId)) {
          return res.status(400).json({
            success: false,
            message: 'El producto no pertenece a esta tienda'
          });
        }
      }

      const chat = await this.chatService.createChat(clientId, storeId, productId);

      res.json({
        success: true,
        message: 'Chat creado exitosamente',
        data: {
          chatId: chat._id,
          chat
        }
      });
    } catch (error) {
      console.error('Error creando chat:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener chats del usuario
  async getUserChats(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      let chats;

      if (userRole === 'client') {
        chats = await this.chatService.getUserChats(userId, 'client');
      } else if (userRole === 'store_manager') {
        // Para store managers, necesitamos obtener las tiendas que maneja
        const stores = await Store.find({
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });

        const storeIds = stores.map(store => store._id);
        
        chats = await Chat.find({
          'participants.store': { $in: storeIds },
          status: 'active'
        })
        .populate('lastMessage')
        .populate('product', 'name sku images')
        .populate('participants.client', 'name email')
        .sort({ lastActivity: -1 } as any);
      } else if (userRole === 'admin') {
        // Admins pueden ver todos los chats
        chats = await Chat.find({})
        .populate('lastMessage')
        .populate('product', 'name sku images')
        .populate('participants.client', 'name email')
        .populate('participants.store', 'name')
        .sort({ lastActivity: -1 } as any)
        .limit(100); // Limitar para admins
      } else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a los chats'
        });
      }

      res.json({
        success: true,
        data: {
          chats,
          count: chats.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo chats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener un chat específico
  async getChatById(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      const chat = await this.chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        });
      }

      // Verificar permisos de acceso
      let hasAccess = false;

      if (userRole === 'client') {
        hasAccess = chat.participants.client.equals(userId);
      } else if (userRole === 'store_manager') {
        // Verificar que el usuario tiene acceso a la tienda
        const store = await Store.findOne({
          _id: chat.participants.store,
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });
        hasAccess = !!store;
      } else if (userRole === 'admin') {
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este chat'
        });
      }

      res.json({
        success: true,
        data: { chat }
      });
    } catch (error) {
      console.error('Error obteniendo chat:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener mensajes de un chat
  async getChatMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      // Verificar acceso al chat (similar a getChatById)
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        });
      }

      let hasAccess = false;
      if (userRole === 'client') {
        hasAccess = chat.participants.client.equals(userId);
      } else if (userRole === 'store_manager') {
        const store = await Store.findOne({
          _id: chat.participants.store,
          $or: [{ owner: userId }, { managers: userId }],
          isActive: true
        });
        hasAccess = !!store;
      } else if (userRole === 'admin') {
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este chat'
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const messages = await ChatMessage.find({
        chatId,
        'validation.isBlocked': false // Solo mensajes no bloqueados
      })
      .sort({ createdAt: -1 } as any)
      .skip(skip)
      .limit(limitNum)
      .populate('sender.userId', 'name email')
      .exec();

      const total = await ChatMessage.countDocuments({
        chatId,
        'validation.isBlocked': false
      });

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Ordenar cronológicamente
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cerrar un chat
  async closeChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        });
      }

      // Verificar permisos (solo participantes o admin pueden cerrar)
      let canClose = false;
      if (userRole === 'client') {
        canClose = chat.participants.client.equals(userId);
      } else if (userRole === 'store_manager') {
        const store = await Store.findOne({
          _id: chat.participants.store,
          $or: [{ owner: userId }, { managers: userId }],
          isActive: true
        });
        canClose = !!store;
      } else if (userRole === 'admin') {
        canClose = true;
      }

      if (!canClose) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cerrar este chat'
        });
      }

      await Chat.findByIdAndUpdate(chatId, {
        status: 'closed',
        lastActivity: new Date()
      });

      // Crear mensaje de sistema informando el cierre
      const systemMessage = new ChatMessage({
        chatId,
        sender: {
          userId,
          userType: userRole,
          userName: 'Sistema'
        },
        messageType: 'system',
        content: 'El chat ha sido cerrado.',
        validation: {
          isBlocked: false,
          violations: [],
          blockedContent: [],
          autoModerated: false
        }
      });

      await systemMessage.save();

      // Notificar a través de WebSocket
      this.chatService.getIO().to(chatId).emit('chat_closed', {
        chatId,
        closedBy: userId,
        message: systemMessage
      });

      res.json({
        success: true,
        message: 'Chat cerrado exitosamente'
      });
    } catch (error) {
      console.error('Error cerrando chat:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de chat (para admins)
  async getChatStats(req: Request, res: Response) {
    try {
      const userRole = (req as any).user.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden acceder a las estadísticas'
        });
      }

      const stats = await Promise.all([
        Chat.countDocuments({ status: 'active' }),
        Chat.countDocuments({ status: 'closed' }),
        Chat.countDocuments({ status: 'blocked' }),
        ChatMessage.countDocuments({ 'validation.isBlocked': true }),
        ChatMessage.countDocuments({ 'validation.autoModerated': true }),
        Chat.countDocuments({ 
          lastActivity: { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
          } 
        })
      ]);

      const [activeChats, closedChats, blockedChats, blockedMessages, moderatedMessages, recentChats] = stats;

      res.json({
        success: true,
        data: {
          chats: {
            active: activeChats,
            closed: closedChats,
            blocked: blockedChats,
            recent24h: recentChats
          },
          messages: {
            blocked: blockedMessages,
            moderated: moderatedMessages
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener chats de una tienda específica
  async getStoreChats(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      // Verificar que el usuario tiene acceso a la tienda
      if (userRole === 'store_manager') {
        const store = await Store.findOne({
          _id: storeId,
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });

        if (!store) {
          return res.status(403).json({
            success: false,
            message: 'No tienes acceso a esta tienda'
          });
        }
      } else if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a los chats de la tienda'
        });
      }

      // Obtener chats de la tienda con información adicional
      const chats = await Chat.find({
        'participants.store': storeId
      })
      .populate('lastMessage')
      .populate('product', 'name sku images')
      .populate('participants.client', 'name email')
      .sort({ lastActivity: -1 } as any);

      // Enriquecer con información adicional
      const enrichedChats = await Promise.all(chats.map(async (chat) => {
        // Contar mensajes totales
        const messageCount = await ChatMessage.countDocuments({ chatId: chat._id });
        
        // Contar mensajes sin leer (para la tienda)
        const unreadCount = await ChatMessage.countDocuments({
          chatId: chat._id,
          'sender.userType': 'client',
          readBy: { $not: { $elemMatch: { userId: storeId } } }
        });

        // Contar violaciones
        const violationsCount = await ChatMessage.countDocuments({
          chatId: chat._id,
          'validation.isBlocked': true
        });

        return {
          ...chat.toObject(),
          messageCount,
          unreadCount,
          violationsCount
        };
      }));

      res.json({
        success: true,
        data: {
          chats: enrichedChats,
          count: enrichedChats.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo chats de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de chat de una tienda
  async getStoreChatStats(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      // Verificar que el usuario tiene acceso a la tienda
      if (userRole === 'store_manager') {
        const store = await Store.findOne({
          _id: storeId,
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });

        if (!store) {
          return res.status(403).json({
            success: false,
            message: 'No tienes acceso a esta tienda'
          });
        }
      } else if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a las estadísticas de la tienda'
        });
      }

      // Obtener estadísticas de la tienda
      const totalChats = await Chat.countDocuments({ 'participants.store': storeId });
      const activeChats = await Chat.countDocuments({ 
        'participants.store': storeId, 
        status: 'active' 
      });

      // Obtener mensajes sin leer
      const unreadMessages = await ChatMessage.countDocuments({
        chatId: { $in: await Chat.find({ 'participants.store': storeId }).distinct('_id') },
        'sender.userType': 'client',
        readBy: { $not: { $elemMatch: { userId: storeId } } }
      });

      // Obtener violaciones hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const violationsToday = await ChatMessage.countDocuments({
        chatId: { $in: await Chat.find({ 'participants.store': storeId }).distinct('_id') },
        'validation.isBlocked': true,
        createdAt: { $gte: today }
      });

      // Calcular tiempo promedio de respuesta (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const storeMessages = await ChatMessage.find({
        chatId: { $in: await Chat.find({ 'participants.store': storeId }).distinct('_id') },
        'sender.userType': 'store_manager',
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: 1 } as any);

      let totalResponseTime = 0;
      let responseCount = 0;

      for (const message of storeMessages) {
        const chat = await Chat.findById(message.chatId);
        if (chat) {
          const clientMessages = await ChatMessage.find({
            chatId: message.chatId,
            'sender.userType': 'client',
            createdAt: { $lt: message.createdAt }
          }).sort({ createdAt: -1 } as any).limit(1);

          if (clientMessages.length > 0) {
            const responseTime = message.createdAt.getTime() - clientMessages[0].createdAt.getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      }

      const averageResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60)) : 0;

      // Calcular satisfacción del cliente (simulado por ahora)
      const customerSatisfaction = Math.floor(Math.random() * 20) + 80; // 80-100%

      res.json({
        success: true,
        data: {
          totalChats,
          activeChats,
          unreadMessages,
          violationsToday,
          averageResponseTime,
          customerSatisfaction
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Bloquear un chat
  async blockChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const userId = (req as AuthenticatedRequest).user?._id;
      const userRole = (req as any).user.role;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        });
      }

      // Verificar permisos
      if (userRole === 'store_manager') {
        const store = await Store.findOne({
          _id: chat.participants.store,
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });

        if (!store) {
          return res.status(403).json({
            success: false,
            message: 'No tienes acceso a este chat'
          });
        }
      } else if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para bloquear chats'
        });
      }

      // Bloquear el chat
      chat.status = 'blocked';
      await chat.save();

      res.json({
        success: true,
        message: 'Chat bloqueado exitosamente'
      });
    } catch (error) {
      console.error('Error bloqueando chat:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

