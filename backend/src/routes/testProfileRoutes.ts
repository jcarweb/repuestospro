import express from 'express';
import User from '../models/User';

const router = express.Router();

// Ruta de prueba sin autenticación para verificar que el backend funciona
router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Ruta de perfil funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en ruta de prueba',
      error: error.message
    });
  }
});

// Ruta de prueba para obtener un usuario específico (sin autenticación)
router.get('/test-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -twoFactorSecret -backupCodes');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuario',
      error: error.message
    });
  }
});

export default router;
