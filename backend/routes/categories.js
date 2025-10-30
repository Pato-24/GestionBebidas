// Rutas para categorías
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) AS productos_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en GET /categories:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
