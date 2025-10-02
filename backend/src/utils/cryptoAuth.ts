import crypto from 'crypto';

import { secureConfig } from '../config/secureConfig';

const JWT_SECRET = secureConfig.get('jwt').secret;
const SALT_ROUNDS = 16;

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class CryptoAuth {
  /**
   * Genera un hash de contraseña usando PBKDF2 con salt
   */
  static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(SALT_ROUNDS).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    return { hash, salt };
  }

  /**
   * Verifica una contraseña contra su hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    return hash === hashToVerify;
  }

  /**
   * Genera un token JWT-like firmado con HMAC-SHA256
   */
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 horas
    };

    // Codificar header y payload en base64url
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));

    // Crear la firma
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifica y decodifica un token JWT-like
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Verificar la firma
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return null;
      }

      // Decodificar el payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload || '')) as TokenPayload;

      // Verificar expiración
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Codifica en base64url
   */
  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Decodifica desde base64url
   */
  private static base64UrlDecode(str: string): string {
    // Agregar padding si es necesario
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }

  /**
   * Genera un salt aleatorio
   */
  static generateSalt(): string {
    return crypto.randomBytes(SALT_ROUNDS).toString('hex');
  }

  /**
   * Genera un hash HMAC-SHA256
   */
  static generateHMAC(data: string, secret: string = JWT_SECRET): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }
}
