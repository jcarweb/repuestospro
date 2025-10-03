import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      platform: process.platform,
      nodeVersion: process.version,
    };

    res.status(200).json({
      success: true,
      data: healthData,
      message: 'Service is healthy'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Service is unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check endpoint
 * @access Public
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      platform: process.platform,
      nodeVersion: process.version,
      cpu: {
        usage: process.cpuUsage(),
      },
      database: {
        status: 'connected', // TODO: Add actual database health check
      },
      services: {
        api: 'running',
        database: 'connected',
        storage: 'available',
      }
    };

    res.status(200).json({
      success: true,
      data: detailedHealthData,
      message: 'Detailed health check completed'
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Detailed health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/health/ping
 * @desc Simple ping endpoint
 * @access Public
 */
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router;
