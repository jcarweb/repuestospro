import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Configuración del servidor
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Configuración de JWT
  JWT_SECRET: process.env.JWT_SECRET || 'tu-secreto-jwt-super-seguro-cambiar-en-produccion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Configuración de MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro',

  // Configuración de CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Configuración de Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Configuración de bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),

  // Configuración de SMTP (para emails)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Configuración de Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',

  // Configuración de Cloudinary (para imágenes)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default config;