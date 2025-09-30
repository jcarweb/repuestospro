import express from 'express';
import { UnifiedWhatsAppService } from '../services/unifiedWhatsAppService';
import { WhatsAppInitializer } from '../scripts/initWhatsApp';

const router = express.Router();

/**
 * GET /api/whatsapp/status
 * Obtener estado del sistema de WhatsApp
 */
router.get('/status', async (req, res) => {
  try {
    const unifiedService = UnifiedWhatsAppService.getInstance();
    const status = unifiedService.getStatus();
    
    res.json({
      success: true,
      data: {
        method: status.method,
        connected: status.connected,
        available: status.available,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado de WhatsApp',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/whatsapp/test-message
 * Probar envío de mensaje de WhatsApp
 */
router.post('/test-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono y mensaje son requeridos'
      });
    }
    
    const unifiedService = UnifiedWhatsAppService.getInstance();
    const result = await unifiedService.sendTextMessage(phone, message);
    
    return res.json({
      success: result,
      message: result ? 'Mensaje enviado exitosamente' : 'Error enviando mensaje',
      data: {
        phone,
        message,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error enviando mensaje de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/whatsapp/test-document
 * Probar envío de documento por WhatsApp
 */
router.post('/test-document', async (req, res) => {
  try {
    const { phone, filename, caption } = req.body;
    
    if (!phone || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono y nombre de archivo son requeridos'
      });
    }
    
    // Crear un documento de prueba
    const testDocument = Buffer.from('Documento de prueba desde PiezasYA');
    
    const unifiedService = UnifiedWhatsAppService.getInstance();
    const result = await unifiedService.sendDocument(
      phone,
      testDocument,
      filename,
      caption || 'Documento de prueba'
    );
    
    return res.json({
      success: result,
      message: result ? 'Documento enviado exitosamente' : 'Error enviando documento',
      data: {
        phone,
        filename,
        caption,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error enviando documento de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/whatsapp/initialize
 * Inicializar WhatsApp para Venezuela
 */
router.post('/initialize', async (req, res) => {
  try {
    const initializer = WhatsAppInitializer.getInstance();
    await initializer.initializeForVenezuela();
    
    res.json({
      success: true,
      message: 'WhatsApp inicializado para Venezuela',
      data: {
        timestamp: new Date().toISOString(),
        instructions: [
          'Escanea el código QR que aparecerá en la consola del servidor',
          'Espera a que se muestre "WhatsApp conectado exitosamente"',
          'Verifica el estado con GET /api/whatsapp/status'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error inicializando WhatsApp',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/whatsapp/system-status
 * Obtener estado completo del sistema
 */
router.get('/system-status', async (req, res) => {
  try {
    const initializer = WhatsAppInitializer.getInstance();
    const systemStatus = initializer.getSystemStatus();
    
    res.json({
      success: true,
      data: {
        whatsapp: systemStatus.whatsapp,
        recommendations: systemStatus.recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado del sistema',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
