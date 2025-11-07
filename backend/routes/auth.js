// Rutas de autenticación
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: true,
        message: 'Usuario y contraseña son requeridos'
      });
    }
    
    // Buscar usuario
    const query = 'SELECT * FROM users WHERE username = ? AND active = TRUE';
    const [rows] = await promisePool.query(query, [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Usuario o contraseña incorrectos'
      });
    }
    
    const user = rows[0];
    
    // Verificar contraseña (en producción usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        error: true,
        message: 'Usuario o contraseña incorrectos'
      });
    }
    
    // Actualizar último login
    await promisePool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    
    // Retornar datos del usuario (sin la contraseña)
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/auth/me - Obtener usuario actual (verificar sesión)
router.get('/me', async (req, res) => {
  try {
    // En una implementación real, verificarías el token aquí
    // Por ahora retornamos un mensaje simple
    res.json({
      success: true,
      message: 'Sesión válida'
    });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
