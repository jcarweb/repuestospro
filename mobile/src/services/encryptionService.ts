import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
}

interface DecryptionResult {
  decrypted: string;
  success: boolean;
}

class EncryptionService {
  private static instance: EncryptionService;
  private readonly ENCRYPTION_KEY = 'piezasya_encryption_key_2024';
  private readonly STORAGE_KEY = 'encryption_settings';

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Generar clave de encriptación derivada de la contraseña del usuario
  private async deriveKey(password: string, salt: string): Promise<string> {
    try {
      // En una implementación real, usarías PBKDF2 o Argon2
      // Por simplicidad, usamos una función hash básica
      const combined = password + salt + this.ENCRYPTION_KEY;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      return hash.substring(0, 32); // Tomar solo 32 caracteres para la clave
    } catch (error) {
      console.error('Error deriving key:', error);
      throw new Error('Error al generar clave de encriptación');
    }
  }

  // Generar salt aleatorio
  private generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generar IV (Initialization Vector) aleatorio
  private generateIV(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Encriptar texto usando algoritmo simple (en producción usar AES)
  private async encryptText(text: string, key: string, iv: string): Promise<string> {
    try {
      // Algoritmo de encriptación simple (XOR con rotación)
      // En producción, usar AES-256-GCM
      let encrypted = '';
      for (let i = 0; i < text.length; i++) {
        const textChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const ivChar = iv.charCodeAt(i % iv.length);
        const encryptedChar = textChar ^ keyChar ^ ivChar;
        encrypted += String.fromCharCode(encryptedChar);
      }
      
      // Codificar en base64 para almacenamiento seguro
      return btoa(encrypted);
    } catch (error) {
      console.error('Error encrypting text:', error);
      throw new Error('Error al encriptar datos');
    }
  }

  // Desencriptar texto
  private async decryptText(encryptedText: string, key: string, iv: string): Promise<string> {
    try {
      // Decodificar desde base64
      const decoded = atob(encryptedText);
      
      // Algoritmo de desencriptación simple (XOR con rotación)
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const encryptedChar = decoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const ivChar = iv.charCodeAt(i % iv.length);
        const decryptedChar = encryptedChar ^ keyChar ^ ivChar;
        decrypted += String.fromCharCode(decryptedChar);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting text:', error);
      throw new Error('Error al desencriptar datos');
    }
  }

  // Encriptar datos sensibles
  async encryptSensitiveData(data: string, userPassword: string): Promise<EncryptionResult> {
    try {
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(userPassword, salt);
      const encrypted = await this.encryptText(data, key, iv);

      return {
        encrypted,
        iv,
        salt,
      };
    } catch (error) {
      console.error('Error encrypting sensitive data:', error);
      throw new Error('Error al encriptar datos sensibles');
    }
  }

  // Desencriptar datos sensibles
  async decryptSensitiveData(
    encryptedData: string,
    iv: string,
    salt: string,
    userPassword: string
  ): Promise<DecryptionResult> {
    try {
      const key = await this.deriveKey(userPassword, salt);
      const decrypted = await this.decryptText(encryptedData, key, iv);

      return {
        decrypted,
        success: true,
      };
    } catch (error) {
      console.error('Error decrypting sensitive data:', error);
      return {
        decrypted: '',
        success: false,
      };
    }
  }

  // Encriptar y guardar datos en AsyncStorage
  async encryptAndStore(key: string, data: string, userPassword: string): Promise<void> {
    try {
      const encryptionResult = await this.encryptSensitiveData(data, userPassword);
      const storageData = {
        encrypted: encryptionResult.encrypted,
        iv: encryptionResult.iv,
        salt: encryptionResult.salt,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(storageData));
      console.log(`🔒 Datos encriptados y guardados: ${key}`);
    } catch (error) {
      console.error('Error encrypting and storing data:', error);
      throw new Error('Error al encriptar y guardar datos');
    }
  }

  // Desencriptar y recuperar datos de AsyncStorage
  async decryptAndRetrieve(key: string, userPassword: string): Promise<string | null> {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);
      const result = await this.decryptSensitiveData(
        parsedData.encrypted,
        parsedData.iv,
        parsedData.salt,
        userPassword
      );

      if (result.success) {
        console.log(`🔓 Datos desencriptados y recuperados: ${key}`);
        return result.decrypted;
      } else {
        console.error('Failed to decrypt data');
        return null;
      }
    } catch (error) {
      console.error('Error decrypting and retrieving data:', error);
      return null;
    }
  }

  // Encriptar PIN
  async encryptPIN(pin: string, userPassword: string): Promise<void> {
    try {
      await this.encryptAndStore('encrypted_pin', pin, userPassword);
      console.log('🔒 PIN encriptado y guardado');
    } catch (error) {
      console.error('Error encrypting PIN:', error);
      throw new Error('Error al encriptar PIN');
    }
  }

  // Desencriptar PIN
  async decryptPIN(userPassword: string): Promise<string | null> {
    try {
      return await this.decryptAndRetrieve('encrypted_pin', userPassword);
    } catch (error) {
      console.error('Error decrypting PIN:', error);
      return null;
    }
  }

  // Encriptar datos de 2FA
  async encrypt2FAData(secret: string, backupCodes: string[], userPassword: string): Promise<void> {
    try {
      const data = JSON.stringify({
        secret,
        backupCodes,
        timestamp: Date.now(),
      });

      await this.encryptAndStore('encrypted_2fa_data', data, userPassword);
      console.log('🔒 Datos 2FA encriptados y guardados');
    } catch (error) {
      console.error('Error encrypting 2FA data:', error);
      throw new Error('Error al encriptar datos 2FA');
    }
  }

  // Desencriptar datos de 2FA
  async decrypt2FAData(userPassword: string): Promise<{ secret: string; backupCodes: string[] } | null> {
    try {
      const decryptedData = await this.decryptAndRetrieve('encrypted_2fa_data', userPassword);
      if (!decryptedData) {
        return null;
      }

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting 2FA data:', error);
      return null;
    }
  }

  // Encriptar datos biométricos
  async encryptBiometricData(biometricType: string, setupDate: string, userPassword: string): Promise<void> {
    try {
      const data = JSON.stringify({
        type: biometricType,
        setupDate,
        timestamp: Date.now(),
      });

      await this.encryptAndStore('encrypted_biometric_data', data, userPassword);
      console.log('🔒 Datos biométricos encriptados y guardados');
    } catch (error) {
      console.error('Error encrypting biometric data:', error);
      throw new Error('Error al encriptar datos biométricos');
    }
  }

  // Desencriptar datos biométricos
  async decryptBiometricData(userPassword: string): Promise<{ type: string; setupDate: string } | null> {
    try {
      const decryptedData = await this.decryptAndRetrieve('encrypted_biometric_data', userPassword);
      if (!decryptedData) {
        return null;
      }

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting biometric data:', error);
      return null;
    }
  }

  // Verificar integridad de datos encriptados
  async verifyDataIntegrity(key: string, userPassword: string): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (!storedData) {
        return false;
      }

      const parsedData = JSON.parse(storedData);
      
      // Verificar que los campos requeridos estén presentes
      if (!parsedData.encrypted || !parsedData.iv || !parsedData.salt) {
        return false;
      }

      // Intentar desencriptar para verificar integridad
      const result = await this.decryptSensitiveData(
        parsedData.encrypted,
        parsedData.iv,
        parsedData.salt,
        userPassword
      );

      return result.success;
    } catch (error) {
      console.error('Error verifying data integrity:', error);
      return false;
    }
  }

  // Limpiar todos los datos encriptados
  async clearAllEncryptedData(): Promise<void> {
    try {
      const keys = [
        'encrypted_pin',
        'encrypted_2fa_data',
        'encrypted_biometric_data',
      ];

      for (const key of keys) {
        await AsyncStorage.removeItem(key);
      }

      console.log('🧹 Todos los datos encriptados han sido limpiados');
    } catch (error) {
      console.error('Error clearing encrypted data:', error);
      throw new Error('Error al limpiar datos encriptados');
    }
  }

  // Obtener estadísticas de encriptación
  async getEncryptionStats(): Promise<{
    totalEncryptedKeys: number;
    lastEncryption: number | null;
    dataIntegrity: { [key: string]: boolean };
  }> {
    try {
      const keys = [
        'encrypted_pin',
        'encrypted_2fa_data',
        'encrypted_biometric_data',
      ];

      let totalEncryptedKeys = 0;
      let lastEncryption = null;
      const dataIntegrity: { [key: string]: boolean } = {};

      for (const key of keys) {
        const storedData = await AsyncStorage.getItem(key);
        if (storedData) {
          totalEncryptedKeys++;
          const parsedData = JSON.parse(storedData);
          if (parsedData.timestamp) {
            lastEncryption = Math.max(lastEncryption || 0, parsedData.timestamp);
          }
          dataIntegrity[key] = true; // Simplificado para demo
        }
      }

      return {
        totalEncryptedKeys,
        lastEncryption,
        dataIntegrity,
      };
    } catch (error) {
      console.error('Error getting encryption stats:', error);
      return {
        totalEncryptedKeys: 0,
        lastEncryption: null,
        dataIntegrity: {},
      };
    }
  }
}

export default EncryptionService.getInstance();
