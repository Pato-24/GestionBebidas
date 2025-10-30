// Rutas para ventas
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /api/sales - Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        s.*,
        c.name AS customer_name,
        COUNT(si.id) AS items_count
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.sale_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await promisePool.query(query, [parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error en GET /sales:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/sales/:id - Obtener detalle de una venta
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Consultar venta principal
    const saleQuery = `
      SELECT 
        s.*,
        c.name AS customer_name,
        c.email AS customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `;
    
    const [saleRows] = await promisePool.query(saleQuery, [id]);
    
    if (saleRows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Venta no encontrada'
      });
    }
    
    // Consultar items de la venta
    const itemsQuery = `
      SELECT 
        si.*,
        p.name AS product_name,
        p.sku,
        c.name AS category_name
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE si.sale_id = ?
    `;
    
    const [itemsRows] = await promisePool.query(itemsQuery, [id]);
    
    res.json({
      success: true,
      data: {
        ...saleRows[0],
        items: itemsRows
      }
    });
  } catch (error) {
    console.error('Error en GET /sales/:id:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// POST /api/sales - Crear nueva venta
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    const { customer_id, payment_method, note, items } = req.body;
    
    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'La venta debe incluir al menos un producto'
      });
    }
    
    await connection.beginTransaction();
    
    // Calcular total
    let total = 0;
    for (const item of items) {
      total += item.quantity * item.unit_price;
    }
    
    // Insertar venta
    const saleQuery = `
      INSERT INTO sales (customer_id, total, payment_method, note)
      VALUES (?, ?, ?, ?)
    `;
    
    const [saleResult] = await connection.query(saleQuery, [
      customer_id || null,
      total,
      payment_method || 'Efectivo',
      note || null
    ]);
    
    const saleId = saleResult.insertId;
    
    // Insertar items
    for (const item of items) {
      const subtotal = item.quantity * item.unit_price;
      
      const itemQuery = `
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await connection.query(itemQuery, [
        saleId,
        item.product_id,
        item.quantity,
        item.unit_price,
        subtotal
      ]);
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { id: saleId, total }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en POST /sales:', error);
    res.status(500).json({ error: true, message: error.message });
  } finally {
    connection.release();
  }
});

// DELETE /api/sales/:id - Eliminar venta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM sales WHERE id = ?';
    const [result] = await promisePool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Venta no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE /sales/:id:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
