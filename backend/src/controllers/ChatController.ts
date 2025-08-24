import { Request, Response } from 'express';
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
      const clientId = (req as any).user._id;
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
      const userId = (req as any).user._id;
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
        .sort({ lastActivity: -1 });
      } else if (userRole === 'admin') {
        // Admins pueden ver todos los chats
        chats = await Chat.find({})
        .populate('lastMessage')
        .populate('product', 'name sku images')
        .populate('participants.client', 'name email')
        .populate('participants.store', 'name')
        .sort({ lastActivity: -1 })
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
      const userId = (req as any).user._id;
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
      const userId = (req as any).user._id;
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
      .sort({ createdAt: -1 })
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
      const userId = (req as any).user._id;
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
}

