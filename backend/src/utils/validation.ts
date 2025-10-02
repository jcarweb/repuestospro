import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación comunes
export const commonSchemas = {
  id: z.string().min(1, 'ID es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
  })
};

// Type guards para validaciones en runtime
export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCoordinates(coords: unknown): coords is { lat: number; lng: number } {
  return (
    typeof coords === 'object' &&
    coords !== null &&
    'lat' in coords &&
    'lng' in coords &&
    typeof (coords as any).lat === 'number' &&
    typeof (coords as any).lng === 'number' &&
    (coords as any).lat >= -90 &&
    (coords as any).lat <= 90 &&
    (coords as any).lng >= -180 &&
    (coords as any).lng <= 180
  );
}

// Middleware de validación con Zod
export function validateSchema<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Validación de parámetros de query
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Validación de parámetros de ruta
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de ruta inválidos',
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Función helper para manejar errores de validación
export function handleValidationError(error: unknown, res: Response): void {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
    return;
  }
  throw error;
}
