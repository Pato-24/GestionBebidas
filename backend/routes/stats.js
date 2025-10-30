// Rutas para estadísticas y gráficos
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /api/stats/ventas-mensuales - Ventas totales por mes (últimos 12 meses)
router.get('/ventas-mensuales', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(sale_date, '%Y-%m') AS mes,
        DATE_FORMAT(sale_date, '%b %Y') AS mes_nombre,
        COUNT(*) AS cantidad_ventas,
        SUM(total) AS total_mes
      FROM sales
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
      ORDER BY mes ASC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en ventas-mensuales:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/stats/productos-mas-vendidos - Top 10 productos más vendidos
router.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name AS producto,
        c.name AS categoria,
        SUM(si.quantity) AS total_vendido,
        SUM(si.subtotal) AS ingresos_totales,
        p.unit_price AS precio_unitario
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY p.id, p.name, c.name, p.unit_price
      ORDER BY total_vendido DESC
      LIMIT 10
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en productos-mas-vendidos:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/stats/ventas-por-categoria - Distribución de ventas por categoría
router.get('/ventas-por-categoria', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name AS categoria,
        COUNT(DISTINCT si.sale_id) AS num_ventas,
        SUM(si.quantity) AS unidades_vendidas,
        SUM(si.subtotal) AS total_ingresos
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY total_ingresos DESC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en ventas-por-categoria:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/stats/metodos-pago - Distribución de métodos de pago
router.get('/metodos-pago', async (req, res) => {
  try {
    const query = `
      SELECT 
        payment_method AS metodo,
        COUNT(*) AS cantidad,
        SUM(total) AS monto_total
      FROM sales
      GROUP BY payment_method
      ORDER BY cantidad DESC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error en metodos-pago:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/stats/stock-bajo - Productos con stock bajo (menor al mínimo)
router.get('/stock-bajo', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name AS producto,
        c.name AS categoria,
        i.quantity AS stock_actual,
        i.min_stock AS stock_minimo,
        (i.min_stock - i.quantity) AS unidades_faltantes
      FROM inventories i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE i.quantity < i.min_stock
      ORDER BY unidades_faltantes DESC
    `;
    
    const [rows] = await promisePool.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error en stock-bajo:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// GET /api/stats/resumen-general - Dashboard general con KPIs
router.get('/resumen-general', async (req, res) => {
  try {
    // Total de ventas
    const [ventasTotal] = await promisePool.query(
      'SELECT COUNT(*) AS total, SUM(total) AS monto FROM sales'
    );
    
    // Productos en catálogo
    const [productosTotal] = await promisePool.query(
      'SELECT COUNT(*) AS total FROM products'
    );
    
    // Stock total
    const [stockTotal] = await promisePool.query(
      'SELECT SUM(quantity) AS total FROM inventories'
    );
    
    // Productos con stock bajo
    const [stockBajo] = await promisePool.query(
      'SELECT COUNT(*) AS total FROM inventories WHERE quantity < min_stock'
    );
    
    // Ventas del mes actual
    const [ventasMes] = await promisePool.query(
      `SELECT COUNT(*) AS total, SUM(total) AS monto 
       FROM sales 
       WHERE MONTH(sale_date) = MONTH(NOW()) AND YEAR(sale_date) = YEAR(NOW())`
    );
    
    res.json({
      success: true,
      data: {
        ventas: {
          total: ventasTotal[0].total || 0,
          monto_total: ventasTotal[0].monto || 0
        },
        ventas_mes_actual: {
          total: ventasMes[0].total || 0,
          monto: ventasMes[0].monto || 0
        },
        productos: {
          total_catalogo: productosTotal[0].total || 0
        },
        inventario: {
          unidades_totales: stockTotal[0].total || 0,
          productos_stock_bajo: stockBajo[0].total || 0
        }
      }
    });
  } catch (error) {
    console.error('Error en resumen-general:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
