-- Tabla de usuarios para autenticación
USE gestion_bebidas;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
  email VARCHAR(120),
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL
) ENGINE=InnoDB;

-- Insertar usuarios de ejemplo
-- Contraseña para admin: admin123
-- Contraseña para empleado: empleado123
-- Nota: En producción, estas contraseñas deberían estar hasheadas con bcrypt
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', 'admin123', 'Administrador del Sistema', 'admin', 'admin@gestionbebidas.com'),
('vendedor1', 'empleado123', 'Juan Pérez', 'empleado', 'juan@gestionbebidas.com'),
('vendedor2', 'empleado123', 'María García', 'empleado', 'maria@gestionbebidas.com');

-- Crear índice para mejorar búsquedas
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_role ON users(role);
