import crypto from 'crypto';
import { authenticator } from 'otplib';

// Generar secreto para autenticación de dos factores
export const generateTwoFactorSecret = (): string => {
  return authenticator.generateSecret();
};

// Verificar código de autenticación de dos factores
export const verifyTwoFactorCode = (secret: string, code: string): boolean => {
  try {
    return authenticator.verify({ token: code, secret });
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
};

// Generar URL QR para configurar 2FA
export const generateTwoFactorQR = (secret: string, email: string, serviceName: string = 'PiezasYA'): string => {
  return authenticator.keyuri(email, serviceName, secret);
};

// Generar URL para Google Authenticator
export const generateGoogleAuthenticatorUrl = (secret: string, email: string, serviceName: string = 'PiezasYA'): string => {
  return `otpauth://totp/${serviceName}:${encodeURIComponent(email)}?secret=${secret}&issuer=${serviceName}&algorithm=SHA1&digits=6&period=30`;
};

// Generar códigos de respaldo
export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Verificar código de respaldo
export const verifyBackupCode = (backupCodes: string[], code: string): boolean => {
  return backupCodes.includes(code.toUpperCase());
};
