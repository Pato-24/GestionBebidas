-- Schema DDL para Gestión de Ventas / Stock de Bebidas (MySQL)
-- Normalizado hasta 3FN

DROP DATABASE IF EXISTS gestion_bebidas;
CREATE DATABASE gestion_bebidas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_bebidas;

-- Tabla: categories (categoría de la bebida)
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- Tabla: suppliers (proveedores)
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(120),
  address VARCHAR(255)
) ENGINE=InnoDB;

-- Tabla: products (bebidas)
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  supplier_id INT,
  volume_ml INT,
  unit_measure VARCHAR(30) DEFAULT 'unidad',
  unit_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: customers (clientes opcionales para ventas)
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: inventories (stock actual por producto)
CREATE TABLE inventories (
  product_id INT PRIMARY KEY,
  quantity INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: sales (ventas)
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_id INT,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_method ENUM('Efectivo','Tarjeta','Mixto','Transferencia') DEFAULT 'Efectivo',
  note VARCHAR(255),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: sale_items (detalle de cada venta)
CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: stock_movements (registro de entradas/salidas de stock)
CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('IN','OUT') NOT NULL,
  qty INT NOT NULL,
  reference VARCHAR(120),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Índices recomendados
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_stock_movements_prod ON stock_movements(product_id);

-- Vistas útiles (ejemplos)
DROP VIEW IF EXISTS vw_stock_summary;
CREATE VIEW vw_stock_summary AS
SELECT p.id AS product_id, p.sku, p.name, c.name AS category, COALESCE(i.quantity,0) AS stock, p.unit_price
FROM products p
LEFT JOIN inventories i ON p.id = i.product_id
LEFT JOIN categories c ON p.category_id = c.id;

-- Fin de schema.sql
