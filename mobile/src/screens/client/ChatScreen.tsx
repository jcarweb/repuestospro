import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'client' | 'store_manager' | 'admin';
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  messageType: 'text' | 'image' | 'file' | 'system';
}

interface ChatSession {
  id: string;
  storeManagerId: string;
  storeManagerName: string;
  storeManagerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'resolved' | 'pending';
  rating?: number;
  evaluation?: string;
}

interface ChatScreenProps {
  route?: {
    params?: {
      companyId?: string;
      productId?: string;
      productName?: string;
    };
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Obtener parámetros de la ruta
  const companyId = route?.params?.companyId;
  const productId = route?.params?.productId;
  const productName = route?.params?.productName;

  // Mock data para demostración
  const mockChatSession: ChatSession = {
    id: '1',
    storeManagerId: 'sm1',
    storeManagerName: companyId ? `Soporte ${companyId}` : 'Carlos Mendoza',
    storeManagerAvatar: 'https://via.placeholder.com/40/FFC300/000000?text=CM',
    lastMessage: '¿En qué puedo ayudarte hoy?',
    lastMessageTime: new Date(),
    unreadCount: 0,
    status: 'active',
  };

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      text: productName 
        ? `Hola, tengo preguntas sobre el producto: ${productName}`
        : 'Hola, necesito ayuda con mi pedido #12345',
      sender: 'client',
      timestamp: new Date(Date.now() - 300000),
      isRead: true,
      messageType: 'text',
    },
    {
      id: '2',
      text: companyId 
        ? `¡Hola! Soy el equipo de soporte de ${companyId}. ¿En qué puedo ayudarte hoy?`
        : '¡Hola! Soy Carlos, gestor de la tienda. ¿En qué puedo ayudarte hoy?',
      sender: 'store_manager',
      timestamp: new Date(Date.now() - 240000),
      isRead: true,
      messageType: 'text',
    },
    {
      id: '3',
      text: productName 
        ? `Me gustaría saber más detalles sobre ${productName}`
        : 'Tengo un problema con la entrega de mi pedido',
      sender: 'client',
      timestamp: new Date(Date.now() - 180000),
      isRead: true,
      messageType: 'text',
    },
    {
      id: '4',
      text: productName 
        ? `¡Por supuesto! Te ayudo con toda la información sobre ${productName}...`
        : 'Entiendo tu preocupación. Déjame revisar el estado de tu pedido...',
      sender: 'store_manager',
      timestamp: new Date(Date.now() - 120000),
      isRead: true,
      messageType: 'text',
    },
    {
      id: '5',
      text: productName 
        ? `El producto ${productName} tiene garantía de 2 años y envío gratis. ¿Te gustaría que te ayude con la compra?`
        : 'Tu pedido está en camino y llegará mañana entre 2-4 PM',
      sender: 'store_manager',
      timestamp: new Date(Date.now() - 60000),
      isRead: false,
      messageType: 'text',
    },
  ];

  useEffect(() => {
    loadChatSession();
    loadMessages();
    // Simular mensajes en tiempo real
    const interval = setInterval(() => {
      simulateTyping();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadChatSession = async () => {
    try {
      setIsLoading(true);
      // Simular carga de sesión de chat
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChatSession(mockChatSession);
    } catch (error) {
      console.error('Error cargando sesión de chat:', error);
      showToast('Error al cargar el chat', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      // Simular carga de mensajes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let initialMessages = mockMessages;
      
      // Si hay un producto específico, agregar un mensaje inicial automático
      if (productName && productId) {
        const autoMessage: ChatMessage = {
          id: 'auto-1',
          text: `Hola, veo que estás interesado en ${productName}. ¿En qué puedo ayudarte?`,
          sender: 'store_manager',
          timestamp: new Date(Date.now() - 1000),
          isRead: false,
          messageType: 'text',
        };
        initialMessages = [autoMessage, ...mockMessages];
      }
      
      setMessages(initialMessages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const simulateTyping = () => {
    if (Math.random() > 0.7) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Agregar mensaje automático del gestor
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text: 'Estoy revisando tu consulta, un momento por favor...',
          sender: 'store_manager',
          timestamp: new Date(),
          isRead: false,
          messageType: 'text',
        };
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'client',
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      scrollToBottom();

      // Simular respuesta automática
      setTimeout(() => {
        const autoResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Mensaje recibido. Un gestor te responderá pronto.',
          sender: 'system',
          timestamp: new Date(),
          isRead: false,
          messageType: 'system',
        };
        setMessages(prev => [...prev, autoResponse]);
        scrollToBottom();
      }, 1000);

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      showToast('Error al enviar mensaje', 'error');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isClient = item.sender === 'client';
    const isSystem = item.sender === 'system';

    return (
      <View style={[
        styles.messageContainer,
        isClient ? styles.clientMessage : styles.managerMessage,
        isSystem && styles.systemMessage
      ]}>
        {!isClient && !isSystem && (
          <View style={styles.messageHeader}>
            <Text style={[styles.senderName, { color: colors.textSecondary }]}>
              {chatSession?.storeManagerName}
            </Text>
            <Text style={[styles.messageTime, { color: colors.textTertiary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isClient ? colors.primary : colors.surface,
            borderColor: isClient ? colors.primary : colors.border,
          },
          isSystem && { backgroundColor: colors.warning + '20', borderColor: colors.warning }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isClient ? 'white' : colors.textPrimary },
            isSystem && { color: colors.warning }
          ]}>
            {item.text}
          </Text>
        </View>

        {isClient && (
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { color: colors.textTertiary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Icon
              name={item.isRead ? "checkmark-done" : "checkmark"}
              size={16}
              color={item.isRead ? colors.primary : colors.textTertiary}
            />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            {chatSession?.storeManagerName} está escribiendo...
          </Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Conectando con el gestor...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
             {/* Header */}
       <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
         <View style={styles.headerInfo}>
           <View style={styles.avatarContainer}>
             <Text style={[styles.avatarText, { backgroundColor: colors.primary }]}>
               {chatSession?.storeManagerName?.charAt(0)}
             </Text>
           </View>
           <View style={styles.headerText}>
             <Text style={[styles.managerName, { color: colors.textPrimary }]}>
               {chatSession?.storeManagerName}
             </Text>
             <Text style={[styles.statusText, { color: colors.success }]}>
               ● En línea
             </Text>
             {productName && (
               <Text style={[styles.productInfo, { color: colors.textSecondary }]}>
                 Consulta sobre: {productName}
               </Text>
             )}
           </View>
         </View>
         <View style={styles.headerActions}>
           <TouchableOpacity
             style={styles.headerButton}
             onPress={() => {
               // navigation.navigate('ChatEvaluation', { chatId: chatSession?.id });
               showToast('Evaluación del chat', 'info');
             }}
           >
             <Icon name="star-outline" size={20} color={colors.textTertiary} />
           </TouchableOpacity>
           <TouchableOpacity
             style={styles.headerButton}
             onPress={() => Alert.alert('Opciones', 'Menú de opciones del chat')}
           >
             <Icon name="ellipsis-vertical" size={24} color={colors.textTertiary} />
           </TouchableOpacity>
         </View>
       </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="add-circle-outline" size={24} color={colors.textTertiary} />
        </TouchableOpacity>
        
        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? colors.primary : colors.textTertiary }
          ]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarText: {
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  headerText: {
    flex: 1,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
  },
  productInfo: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  clientMessage: {
    alignItems: 'flex-end',
  },
  managerMessage: {
    alignItems: 'flex-start',
  },
  systemMessage: {
    alignItems: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  messageTime: {
    fontSize: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typingContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;
