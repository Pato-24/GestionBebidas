-- import_all.sql
-- Script combinado: schema + data para importar la base `gestion_bebidas` en MySQL
-- Ejecutar con: mysql -u <usuario> -p < import_all.sql

-- =========================
-- SCHEMA (schema.sql)
-- =========================
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

-- =========================
-- DATA (data.sql)
-- =========================
USE gestion_bebidas;

-- CATEGORIES
INSERT INTO categories (name, description) VALUES
('Gaseosas','Bebidas carbonatadas azucaradas o zero'),
('Aguas','Aguas minerales y saborizadas'),
('Cervezas','Cervezas artesanales e industriales'),
('Vinos','Vinos y espumantes'),
('Jugos','Jugos naturales y néctares'),
('Energizantes','Bebidas energéticas'),
('Licores','Bebidas espirituosas');

-- SUPPLIERS
INSERT INTO suppliers (name, contact, phone, email, address) VALUES
('Distribuciones Norte','María López','+54-11-4000-0001','maria@distnorte.com','Av. Norte 120'),
('Bebidas del Sur','Juan Pérez','+54-11-4000-0002','juan@bebidassur.com','Calle Sur 45'),
('Importadora Global','Ana Gómez','+54-11-4000-0003','ana@importglobal.com','Puerto 9'),
('Cervecería Local','Carlos Ruiz','+54-11-4000-0004','ventas@cervecerialocal.com','Parque Industrial'),
('Viñedos del Valle','Laura Vidal','+54-11-4000-0005','laura@vinedosvalle.com','Ruta 7 km 21'),
('Jugos Frescos SA','Sofia Martinez','+54-11-4000-0006','sofia@jugosfrescos.com','Ruta 3 100');

-- PRODUCTS (20 productos)
INSERT INTO products (sku, name, category_id, supplier_id, volume_ml, unit_measure, unit_price) VALUES
('GAS-350-01','Coca-Cola 350ml',1,1,350,'unidad',120.00),
('GAS-1500-01','Coca-Cola 1.5L',1,1,1500,'unidad',280.00),
('GAS-350-02','Pepsi 350ml',1,1,350,'unidad',110.00),
('AGU-500-01','Agua Mineral 500ml',2,2,500,'unidad',80.00),
('AGU-1500-01','Agua Mineral 1.5L',2,2,1500,'unidad',150.00),
('CER-330-01','Cerveza Lager 330ml',3,4,330,'unidad',160.00),
('CER-500-01','Cerveza IPA 500ml',3,4,500,'unidad',220.00),
('VIN-750-01','Malbec 750ml',4,5,750,'unidad',1300.00),
('VIN-750-02','Chardonnay 750ml',4,5,750,'unidad',1250.00),
('JUG-300-01','Jugo Naranja 300ml',5,6,300,'unidad',140.00),
('JUG-1000-01','Jugo Naranja 1L',5,6,1000,'unidad',340.00),
('ENE-250-01','Energético 250ml',6,1,250,'unidad',210.00),
('LIC-700-01','Vodka 700ml',7,3,700,'unidad',2200.00),
('LIC-700-02','Whisky 700ml',7,3,700,'unidad',6500.00),
('GAS-350-03','Sprite 350ml',1,1,350,'unidad',115.00),
('GAS-1500-02','Fanta 1.5L',1,2,1500,'unidad',260.00),
('CER-330-02','Cerveza Stout 330ml',3,4,330,'unidad',190.00),
('AGU-750-01','Agua Saborizada 750ml',2,2,750,'unidad',170.00),
('JUG-200-01','Jugo Manzana 200ml',5,6,200,'unidad',120.00),
('GAS-250-01','Gaseosa Lata 250ml',1,1,250,'unidad',95.00);

-- INVENTORIES (stock inicial)
INSERT INTO inventories (product_id, quantity, min_stock) VALUES
(1,120,10),(2,60,5),(3,80,8),(4,200,20),(5,150,15),
(6,90,10),(7,70,8),(8,30,3),(9,35,3),(10,100,10),
(11,80,8),(12,50,5),(13,25,2),(14,15,2),(15,110,10),
(16,40,5),(17,45,5),(18,90,10),(19,150,15),(20,200,20);

-- CUSTOMERS (12)
INSERT INTO customers (name, email, phone) VALUES
('Panadería Dulce Hogar','dulce@panaderia.com','+54-11-4200-0001'),
('Kiosco La Esquina','esquina@kiosco.com','+54-11-4200-0002'),
('Restaurante El Buen Sabor','contacto@elbuen.com','+54-11-4200-0003'),
('Bar Central','ventas@barcentral.com','+54-11-4200-0004'),
('Supermercado Norte','compras@norte.com','+54-11-4200-0005'),
('Minimarket Sol','sol@minimarket.com','+54-11-4200-0006'),
('Club Deportivo','club@deportivo.com','+54-11-4200-0007'),
('Casa Particular (García)','garcia@gmail.com','+54-11-4200-0008'),
('Catering Eventos','info@catering.com','+54-11-4200-0009'),
('Heladería Fresca','fresca@heladeria.com','+54-11-4200-0010'),
('Quiosco Infantil','kids@kiosk.com','+54-11-4200-0011'),
('Tienda Orgánica','organica@shop.com','+54-11-4200-0012');

-- SALES y SALE_ITEMS (20 ventas con múltiples items -> muchos inserts)
-- Venta 1
INSERT INTO sales (sale_date, customer_id, total, payment_method, note) VALUES
('2025-09-01 10:15:00',1,560.00,'Efectivo','Venta por caja 1');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),1,2,120.00,240.00),(LAST_INSERT_ID(),10,2,140.00,280.00);

-- Venta 2
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-01 12:30:00',2,285.00,'Tarjeta');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),3,1,110.00,110.00),(LAST_INSERT_ID(),20,1,95.00,95.00),(LAST_INSERT_ID(),4,1,80.00,80.00);

-- Venta 3
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-02 09:05:00',3,480.00,'Efectivo');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),6,2,160.00,320.00),(LAST_INSERT_ID(),5,1,150.00,150.00);

-- Venta 4
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-03 18:20:00',4,380.00,'Tarjeta');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),7,1,220.00,220.00),(LAST_INSERT_ID(),20,2,95.00,190.00);

-- Venta 5
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-04 14:10:00',5,2600.00,'Transferencia');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),8,2,1300.00,2600.00);

-- Venta 6
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-05 11:00:00',6,420.00,'Efectivo');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),11,1,340.00,340.00),(LAST_INSERT_ID(),1,1,120.00,120.00);

-- Venta 7
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-06 20:45:00',4,370.00,'Tarjeta');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),12,1,210.00,210.00),(LAST_INSERT_ID(),6,1,160.00,160.00);

-- Venta 8
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-07 16:30:00',7,260.00,'Efectivo');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),19,2,120.00,240.00),(LAST_INSERT_ID(),4,1,80.00,80.00);

-- Venta 9
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-08 13:00:00',8,235.00,'Efectivo');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),15,1,115.00,115.00),(LAST_INSERT_ID(),3,1,110.00,110.00),(LAST_INSERT_ID(),20,1,95.00,95.00);

-- Venta 10
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-09 19:10:00',9,750.00,'Tarjeta');
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(LAST_INSERT_ID(),6,3,160.00,480.00),(LAST_INSERT_ID(),7,1,220.00,220.00),(LAST_INSERT_ID(),20,1,95.00,95.00);

-- Venta 11..20 (varios registros para aumentar cantidad)
INSERT INTO sales (sale_date, customer_id, total, payment_method) VALUES
('2025-09-10 10:00:00',10,430.00,'Efectivo'),
('2025-09-10 11:30:00',11,235.00,'Tarjeta'),
('2025-09-11 15:20:00',12,780.00,'Efectivo'),
('2025-09-12 09:45:00',1,360.00,'Efectivo'),
('2025-09-12 13:50:00',2,520.00,'Tarjeta'),
('2025-09-13 18:00:00',3,150.00,'Efectivo'),
('2025-09-14 20:15:00',4,420.00,'Tarjeta'),
('2025-09-15 14:30:00',5,260.00,'Transferencia'),
('2025-09-16 17:05:00',6,480.00,'Efectivo'),
('2025-09-17 12:25:00',7,300.00,'Efectivo');

-- Añadir sale_items correspondientes (asignando algunos productos variados)
-- Para venta id = 11 (asume auto-increment secuencial)
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(11,10,1,140.00,140.00),(11,20,3,95.00,285.00);
-- id 12
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(12,1,2,120.00,240.00),(12,3,1,110.00,110.00);
-- id 13
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(13,8,1,1300.00,1300.00),(13,19,3,120.00,360.00);
-- id 14
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(14,6,2,160.00,320.00),(14,5,1,40.00,40.00);
-- id 15
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(15,2,1,280.00,280.00),(15,20,2,95.00,190.00),(15,1,1,120.00,120.00);
-- id 16
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(16,11,1,340.00,340.00);
-- id 17
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(17,12,2,210.00,420.00);
-- id 18
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(18,13,1,2200.00,2200.00),(18,20,1,95.00,95.00);
-- id 19
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(19,15,2,115.00,230.00);
-- id 20
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
(20,7,2,220.00,440.00),(20,4,1,80.00,80.00);

-- STOCK_MOVEMENTS (ejemplos de entradas y salidas)
INSERT INTO stock_movements (product_id, movement_type, qty, reference) VALUES
(1,'IN',200,'Compra a Distribuciones Norte'),
(2,'IN',100,'Compra a Distribuciones Norte'),
(3,'IN',150,'Compra a Distribuciones Norte'),
(6,'IN',120,'Recepción Cervecería Local'),
(8,'IN',50,'Compra Viñedos del Valle'),
(1,'OUT',50,'Venta POS sept'),
(6,'OUT',60,'Venta mayorista'),
(10,'OUT',20,'Promoción social');

-- FIN import_all.sql

-- =========================
-- TRIGGERS (triggers.sql)
-- =========================
-- Se incluyen los triggers para mantener consistentemente el inventario.
DELIMITER $$

CREATE TRIGGER trg_sale_items_before_insert
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
  DECLARE current_qty INT;
  SELECT quantity INTO current_qty FROM inventories WHERE product_id = NEW.product_id FOR UPDATE;
  IF current_qty IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe registro de inventario para el producto';
  END IF;
  IF current_qty < NEW.quantity THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para la venta';
  END IF;
  UPDATE inventories SET quantity = quantity - NEW.quantity WHERE product_id = NEW.product_id;
END$$

CREATE TRIGGER trg_sale_items_after_delete
AFTER DELETE ON sale_items
FOR EACH ROW
BEGIN
  UPDATE inventories SET quantity = quantity + OLD.quantity WHERE product_id = OLD.product_id;
END$$

CREATE TRIGGER trg_sale_items_after_update
AFTER UPDATE ON sale_items
FOR EACH ROW
BEGIN
  DECLARE diff INT;
  DECLARE q INT;
  SET diff = NEW.quantity - OLD.quantity;
  IF diff > 0 THEN
    UPDATE inventories SET quantity = quantity - diff WHERE product_id = NEW.product_id;
    SELECT quantity INTO q FROM inventories WHERE product_id = NEW.product_id;
    IF q < 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente tras actualizar sale_items';
    END IF;
  ELSEIF diff < 0 THEN
    UPDATE inventories SET quantity = quantity + ABS(diff) WHERE product_id = NEW.product_id;
  END IF;
END$$

CREATE TRIGGER trg_stock_movements_after_insert
AFTER INSERT ON stock_movements
FOR EACH ROW
BEGIN
  DECLARE q INT;
  IF NEW.movement_type = 'IN' THEN
    INSERT INTO inventories (product_id, quantity, min_stock)
    VALUES (NEW.product_id, NEW.qty, 0)
    ON DUPLICATE KEY UPDATE quantity = quantity + NEW.qty;
  ELSE
    UPDATE inventories SET quantity = quantity - NEW.qty WHERE product_id = NEW.product_id;
    SELECT quantity INTO q FROM inventories WHERE product_id = NEW.product_id;
    IF q < 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock negativo tras movimiento OUT';
    END IF;
  END IF;
END$$

DELIMITER ;

