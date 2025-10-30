// Rutas para productos
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        COALESCE(i.quantity, 0) AS stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN inventories i ON p.id = i.product_id
      ORDER BY p.name ASC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        COALESCE(i.quantity, 0) AS stock,
        COALESCE(i.min_stock, 0) AS min_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN inventories i ON p.id = i.product_id
      WHERE p.id = ?
    `;
    
    const [rows] = await promisePool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error en GET /products/:id:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { sku, name, category_id, supplier_id, volume_ml, unit_measure, unit_price } = req.body;
    
    // Validaciones básicas
    if (!sku || !name || !category_id || !unit_price) {
      return res.status(400).json({
        error: true,
        message: 'Faltan campos obligatorios: sku, name, category_id, unit_price'
      });
    }
    
    const query = `
      INSERT INTO products (sku, name, category_id, supplier_id, volume_ml, unit_measure, unit_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await promisePool.query(query, [
      sku, name, category_id, supplier_id, volume_ml, unit_measure || 'unidad', unit_price
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error en POST /products:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, supplier_id, volume_ml, unit_measure, unit_price } = req.body;
    
    const query = `
      UPDATE products 
      SET name = ?, category_id = ?, supplier_id = ?, volume_ml = ?, unit_measure = ?, unit_price = ?
      WHERE id = ?
    `;
    
    const [result] = await promisePool.query(query, [
      name, category_id, supplier_id, volume_ml, unit_measure, unit_price, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en PUT /products/:id:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await promisePool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE /products/:id:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
