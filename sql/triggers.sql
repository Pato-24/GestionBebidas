-- triggers.sql
-- Triggers para mantener sincronizado el inventario automáticamente
USE gestion_bebidas;

DELIMITER $$

-- Antes de insertar un item de venta: verificar stock y decrementar
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

-- Después de eliminar un item de venta: reponer stock (venta anulada)
CREATE TRIGGER trg_sale_items_after_delete
AFTER DELETE ON sale_items
FOR EACH ROW
BEGIN
  UPDATE inventories SET quantity = quantity + OLD.quantity WHERE product_id = OLD.product_id;
END$$

-- Al actualizar un item de venta: ajustar inventario según la diferencia
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

-- Después de insertar un movimiento de stock (IN/OUT): ajustar inventario
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
    -- OUT
    UPDATE inventories SET quantity = quantity - NEW.qty WHERE product_id = NEW.product_id;
    SELECT quantity INTO q FROM inventories WHERE product_id = NEW.product_id;
    IF q < 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock negativo tras movimiento OUT';
    END IF;
  END IF;
END$$

DELIMITER ;

-- Nota: estos triggers usan SIGNAL para bloquear operaciones que producirían stock negativo.
