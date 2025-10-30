// Rutas para inventario
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /api/inventory - Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name AS producto,
        p.sku,
        c.name AS categoria,
        i.quantity AS stock,
        i.min_stock,
        i.last_updated,
        CASE 
          WHEN i.quantity < i.min_stock THEN 'Bajo'
          WHEN i.quantity < (i.min_stock * 2) THEN 'Medio'
          ELSE 'Suficiente'
        END AS estado_stock
      FROM inventories i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY i.quantity ASC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en GET /inventory:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// PUT /api/inventory/:productId - Actualizar stock de un producto
router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, min_stock } = req.body;
    
    const query = `
      UPDATE inventories 
      SET quantity = ?, min_stock = ?
      WHERE product_id = ?
    `;
    
    const [result] = await promisePool.query(query, [quantity, min_stock, productId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado en inventario'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en PUT /inventory/:productId:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
