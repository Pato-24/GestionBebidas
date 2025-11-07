// Servidor principal - Backend API para Gestión de Bebidas
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const productsRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const categoriesRoutes = require('./routes/categories');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simple (ANTES de servir archivos estáticos)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({
    message: 'API Gestión de Bebidas - Trabajo Práctico Integrador',
    version: '1.0.0',
    endpoints: {
      stats: '/api/stats/*',
      products: '/api/products',
      sales: '/api/sales',
      categories: '/api/categories',
      inventory: '/api/inventory'
    }
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/inventory', inventoryRoutes);

// Servir el frontend en la ruta raíz (debe ir después de las rutas de la API)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor'
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint no encontrado'
  });
});

// Iniciar servidor
const startServer = async () => {
  // Verificar conexión a la base de datos
  const connected = await testConnection();
  
  if (!connected) {
    console.error('⚠️  No se pudo conectar a la base de datos. Verifica tu configuración en .env');
    console.log('📝 Copia el archivo .env.example a .env y configura tus credenciales');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Frontend: Abre frontend/index.html en tu navegador`);
    console.log(`🔍 API Docs: http://localhost:${PORT}/\n`);
  });
};

startServer();
