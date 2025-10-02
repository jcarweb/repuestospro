import mongoose from 'mongoose';
import config from './env';
class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;
  private connectionState: string = 'disconnected';
  private constructor() {}
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  async connectToDatabase(): Promise<void> {
    try {
      console.log('🔌 Conectando a la base de datos...');
      const uri = config.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro';
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      this.isConnected = true;
      this.connectionState = 'connected';
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      this.isConnected = false;
      this.connectionState = 'error';
      throw error;
    }
  }
  async disconnectFromDatabase(): Promise<void> {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        this.connectionState = 'disconnected';
      }
    } catch (error) {
      console.error('❌ Error desconectando de MongoDB:', error);
      throw error;
    }
  }
  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
  getConnectionState(): string {
    return this.connectionState;
  }
  async healthCheck(): Promise<any> {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'No conectado a la base de datos'
        };
      }
      // Verificar que podemos hacer una operación simple
      if (!mongoose.connection.db) {
        return {
          status: 'unhealthy',
          message: 'Conexión a la base de datos no disponible'
        };
      }
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      return {
        status: 'healthy',
        message: 'Base de datos funcionando correctamente',
        ping: (result as any).ok === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Error verificando salud de la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
export default DatabaseService;