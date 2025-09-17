import SocketIOServer from 'socket.io';
import { Server as HTTPServer } from 'http';
import Chat, { IChat } from '../models/Chat';
import ChatMessage, { IChatMessage } from '../models/ChatMessage';
import User from '../models/User';
import Store from '../models/Store';
import Product from '../models/Product';
import { ContentFilterService } from '../middleware/contentFilter';
import mongoose from 'mongoose';

export interface ChatParticipant {
  userId: string;
  userType: 'client' | 'store_manager' | 'admin';
  socketId: string;
  chatId: string;
}

export class ChatService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ChatParticipant> = new Map();
  private userSocketMap: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`💬 Usuario conectado: ${socket.id}`);

      // Autenticación del usuario
      socket.on('authenticate', async (data: { userId: string; userType: string; token: string }) => {
        try {
          // Aquí deberías validar el token JWT
          const user = await User.findById(data.userId);
          if (!user) {
            socket.emit('auth_error', { message: 'Usuario no encontrado' });
            return;
          }

          // Registrar usuario conectado
          this.connectedUsers.set(socket.id, {
            userId: data.userId,
            userType: data.userType as 'client' | 'store_manager' | 'admin',
            socketId: socket.id,
            chatId: ''
          });

          this.userSocketMap.set(data.userId, socket.id);

          socket.emit('authenticated', { success: true });
          console.log(`✅ Usuario autenticado: ${user.name} (${data.userType})`);
        } catch (error) {
          console.error('Error en autenticación:', error);
          socket.emit('auth_error', { message: 'Error de autenticación' });
        }
      });

      // Unirse a un chat
      socket.on('join_chat', async (data: { chatId: string }) => {
        try {
          const participant = this.connectedUsers.get(socket.id);
          if (!participant) {
            socket.emit('error', { message: 'Usuario no autenticado' });
            return;
          }

          const chat = await Chat.findById(data.chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat no encontrado' });
            return;
          }

          // Verificar que el usuario tenga acceso al chat
          const hasAccess = this.verifyUserAccess(participant, chat);
          if (!hasAccess) {
            socket.emit('error', { message: 'No tienes acceso a este chat' });
            return;
          }

          // Unirse al room del chat
          socket.join(data.chatId);
          participant.chatId = data.chatId;

          // Actualizar estado de conexión
          await this.updateUserOnlineStatus(participant.userId, chat, true);

          // Cargar historial de mensajes
          const messages = await this.getChatMessages(data.chatId);
          socket.emit('chat_history', { messages });

          // Notificar a otros participantes que el usuario está en línea
          socket.to(data.chatId).emit('user_online', {
            userId: participant.userId,
            userType: participant.userType
          });

          console.log(`📝 Usuario ${participant.userId} se unió al chat ${data.chatId}`);
        } catch (error) {
          console.error('Error al unirse al chat:', error);
          socket.emit('error', { message: 'Error al acceder al chat' });
        }
      });

      // Enviar mensaje
      socket.on('send_message', async (data: { 
        chatId: string; 
        content: string; 
        messageType?: string 
      }) => {
        try {
          const participant = this.connectedUsers.get(socket.id);
          if (!participant) {
            socket.emit('error', { message: 'Usuario no autenticado' });
            return;
          }

          // Validar contenido con filtros anti-fuga
          const validation = await ContentFilterService.validateChatMessage(data.content);
          
          let processedContent = data.content;
          let isBlocked = false;

          if (!validation.isValid) {
            console.log(`⚠️ Mensaje bloqueado de ${participant.userId}:`, validation.violations);
            
            // Opción 1: Bloquear completamente el mensaje
            isBlocked = true;
            
            // Opción 2: Censurar contenido (comentar línea anterior y descomentar siguiente)
            // processedContent = this.censorContent(data.content, validation.blockedContent);
          }

          // Crear mensaje en base de datos
          const user = await User.findById(participant.userId);
          const message = new ChatMessage({
            chatId: data.chatId,
            sender: {
              userId: participant.userId,
              userType: participant.userType,
              userName: user?.name || 'Usuario'
            },
            messageType: data.messageType || 'text',
            content: processedContent,
            originalContent: data.content !== processedContent ? data.content : undefined,
            validation: {
              isBlocked,
              violations: validation.violations,
              blockedContent: validation.blockedContent,
              autoModerated: !validation.isValid
            },
            status: isBlocked ? 'blocked' : 'sent',
            metadata: {
              ipAddress: socket.handshake.address,
              userAgent: socket.handshake.headers['user-agent']
            }
          });

          const savedMessage = await message.save();

          // Actualizar último mensaje del chat
          await Chat.findByIdAndUpdate(data.chatId, {
            lastMessage: savedMessage._id,
            lastActivity: new Date()
          });

          if (isBlocked) {
            // Enviar mensaje de error solo al remitente
            socket.emit('message_blocked', {
              violations: validation.violations,
              blockedContent: validation.blockedContent,
              suggestions: [
                'Usa el chat interno de PiezasYA para comunicarte',
                'No incluyas información de contacto personal',
                'No sugieras pagos fuera de la plataforma'
              ]
            });
          } else {
            // Enviar mensaje a todos los participantes del chat
            this.io.to(data.chatId).emit('new_message', {
              message: savedMessage,
              sender: participant
            });

            // Marcar como entregado
            await ChatMessage.findByIdAndUpdate(savedMessage._id, {
              status: 'delivered'
            });
          }

          console.log(`📨 Mensaje ${isBlocked ? 'bloqueado' : 'enviado'} en chat ${data.chatId}`);
        } catch (error) {
          console.error('Error enviando mensaje:', error);
          socket.emit('error', { message: 'Error enviando mensaje' });
        }
      });

      // Marcar mensajes como leídos
      socket.on('mark_as_read', async (data: { chatId: string; messageIds: string[] }) => {
        try {
          const participant = this.connectedUsers.get(socket.id);
          if (!participant) return;

          await ChatMessage.updateMany(
            { 
              _id: { $in: data.messageIds },
              'readBy.userId': { $ne: participant.userId }
            },
            {
              $push: {
                readBy: {
                  userId: participant.userId,
                  readAt: new Date()
                }
              }
            }
          );

          // Notificar al otro participante
          socket.to(data.chatId).emit('messages_read', {
            messageIds: data.messageIds,
            readBy: participant.userId
          });
        } catch (error) {
          console.error('Error marcando mensajes como leídos:', error);
        }
      });

      // Usuario escribiendo
      socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
        const participant = this.connectedUsers.get(socket.id);
        if (!participant) return;

        socket.to(data.chatId).emit('user_typing', {
          userId: participant.userId,
          userType: participant.userType,
          isTyping: data.isTyping
        });
      });

      // Desconexión
      socket.on('disconnect', async () => {
        const participant = this.connectedUsers.get(socket.id);
        if (participant) {
          console.log(`👋 Usuario desconectado: ${participant.userId}`);

          // Actualizar estado offline
          if (participant.chatId) {
            const chat = await Chat.findById(participant.chatId);
            if (chat) {
              await this.updateUserOnlineStatus(participant.userId, chat, false);
              
              // Notificar a otros participantes
              socket.to(participant.chatId).emit('user_offline', {
                userId: participant.userId,
                userType: participant.userType
              });
            }
          }

          this.connectedUsers.delete(socket.id);
          this.userSocketMap.delete(participant.userId);
        }
      });
    });
  }

  private verifyUserAccess(participant: ChatParticipant, chat: IChat): boolean {
    const userId = new mongoose.Types.ObjectId(participant.userId);
    
    // Cliente debe ser el cliente del chat
    if (participant.userType === 'client') {
      return chat.participants.client.equals(userId);
    }
    
    // Store manager debe tener acceso a la tienda
    if (participant.userType === 'store_manager') {
      // Aquí deberías verificar que el usuario tenga acceso a la tienda
      // Por ahora, simplificamos asumiendo que si es store_manager, tiene acceso
      return true;
    }
    
    // Admin tiene acceso a todos los chats
    if (participant.userType === 'admin') {
      return true;
    }
    
    return false;
  }

  private async updateUserOnlineStatus(userId: string, chat: IChat, isOnline: boolean) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (chat.participants.client.equals(userObjectId)) {
      await Chat.findByIdAndUpdate(chat._id, { isClientOnline: isOnline });
    } else {
      await Chat.findByIdAndUpdate(chat._id, { isStoreOnline: isOnline });
    }
  }

  private async getChatMessages(chatId: string, limit: number = 50) {
    return await ChatMessage.find({ 
      chatId,
      'validation.isBlocked': false 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender.userId', 'name email')
    .exec();
  }

  private censorContent(content: string, blockedItems: string[]): string {
    let censored = content;
    
    blockedItems.forEach(item => {
      const regex = new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      censored = censored.replace(regex, '[CONTENIDO CENSURADO]');
    });
    
    return censored;
  }

  // Métodos públicos para uso en controladores
  public async createChat(clientId: string, storeId: string, productId?: string): Promise<IChat> {
    try {
      const client = await User.findById(clientId);
      const store = await Store.findById(storeId);
      const product = productId ? await Product.findById(productId) : null;

      if (!client || !store) {
        throw new Error('Cliente o tienda no encontrados');
      }

      // Verificar si ya existe un chat entre estos participantes para este producto
      const existingChat = await Chat.findOne({
        'participants.client': clientId,
        'participants.store': storeId,
        product: productId || null,
        status: 'active'
      });

      if (existingChat) {
        return existingChat;
      }

      const chat = new Chat({
        participants: {
          client: clientId,
          store: storeId
        },
        product: productId,
        metadata: {
          clientName: client.name,
          storeName: store.name,
          productName: product?.name,
          productSku: product?.sku
        }
      });

      return await chat.save();
    } catch (error) {
      console.error('Error creando chat:', error);
      throw error;
    }
  }

  public async getUserChats(userId: string, userType: 'client' | 'store_manager'): Promise<IChat[]> {
    const query = userType === 'client' 
      ? { 'participants.client': userId }
      : { 'participants.store': userId }; // Para store_manager, necesitarías verificar acceso a la tienda

    return await Chat.find(query)
      .populate('lastMessage')
      .populate('product', 'name sku images')
      .sort({ lastActivity: -1 })
      .exec();
  }

  public async getChatById(chatId: string): Promise<IChat | null> {
    return await Chat.findById(chatId)
      .populate('participants.client', 'name email')
      .populate('participants.store', 'name')
      .populate('product', 'name sku images price')
      .populate('lastMessage')
      .exec();
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

