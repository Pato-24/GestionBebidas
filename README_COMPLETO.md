# 🍷 Sistema de Gestión de Bebidas - Trabajo Práctico Integrador

**Carrera:** Tecnicatura Universitaria en Programación - UTN  
**Año:** 2do Año  
**Asignaturas:** Base de Datos I, Base de Datos II, Introducción al Análisis de Datos  
**Tipo:** Trabajo Práctico Final Integrador

---

## 📋 Descripción del Proyecto

Sistema web completo para la gestión de ventas y stock de bebidas (gaseosas, aguas, cervezas, vinos, jugos, energizantes y licores). La aplicación permite visualizar datos estadísticos mediante gráficos interactivos, gestionar productos, registrar ventas y controlar el inventario.

### Características Principales

- ✅ **Dashboard interactivo** con KPIs y gráficos dinámicos
- ✅ **Gestión completa de productos** (CRUD)
- ✅ **Registro de ventas** con múltiples métodos de pago
- ✅ **Control de inventario** con alertas de stock bajo
- ✅ **Reportes y análisis** de datos con interpretaciones
- ✅ **Visualización gráfica** (barras, tortas, líneas)
- ✅ **API RESTful** documentada con Node.js y Express
- ✅ **Base de datos MySQL** normalizada hasta 3FN

---

## 🗂️ Estructura del Proyecto

```
GestionBebidas_DB/
├── backend/
│   ├── config/
│   │   └── database.js         # Configuración de MySQL
│   ├── routes/
│   │   ├── stats.js            # Endpoints de estadísticas
│   │   ├── products.js         # CRUD de productos
│   │   ├── sales.js            # CRUD de ventas
│   │   ├── categories.js       # Listado de categorías
│   │   └── inventory.js        # Control de inventario
│   ├── server.js               # Servidor Express
│   ├── package.json
│   ├── .env.example            # Variables de entorno
│   └── .env                    # Configuración local
├── frontend/
│   ├── css/
│   │   └── styles.css          # Estilos modernos
│   ├── js/
│   │   ├── config.js           # Configuración global
│   │   ├── api.js              # Cliente API
│   │   ├── charts.js           # Gráficos Chart.js
│   │   ├── tables.js           # Tablas dinámicas
│   │   └── app.js              # Controlador principal
│   └── index.html              # Interfaz principal
├── sql/
│   ├── schema.sql              # Estructura de la BD
│   ├── data.sql                # Datos iniciales (50+ registros)
│   ├── triggers.sql            # Triggers automáticos
│   └── import_all.sql          # Script completo
├── docs/
│   └── ANALISIS_TECNICO.md     # Análisis y documentación
├── diagram/
│   └── ER_readme.txt           # Diagrama ER
├── README.md                   # Este archivo
└── .gitignore
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** v16 o superior ([Descargar](https://nodejs.org/))
- **MySQL** 8.0 o superior
- **Navegador web** moderno (Chrome, Firefox, Edge)
- **Editor de código** (opcional: VS Code)

### Paso 1: Clonar/Descargar el Proyecto

Si tienes Git instalado:
```powershell
git clone [URL_DEL_REPOSITORIO]
cd GestionBebidas_DB
```

O simplemente descomprime el archivo .zip en una carpeta.

### Paso 2: Configurar la Base de Datos

1. Abre **MySQL Workbench** o tu cliente MySQL preferido

2. Importa la base de datos ejecutando:
```sql
SOURCE F:/PATO/Carrera de Programacion_UTN/2DO. AÑO/2do. Cuatrimestre/Introducción al Análisis de Datos/GestionBebidas_DB/sql/import_all.sql
```

O desde PowerShell:
```powershell
cd "F:\PATO\Carrera de Programacion_UTN\2DO. AÑO\2do. Cuatrimestre\Introducción al Análisis de Datos\GestionBebidas_DB"
mysql -u root -p < sql/import_all.sql
```

3. Verifica que la base de datos `gestion_bebidas` se haya creado correctamente:
```sql
USE gestion_bebidas;
SHOW TABLES;
SELECT COUNT(*) FROM products;  -- Debería retornar 20
SELECT COUNT(*) FROM sales;     -- Debería retornar varios registros
```

### Paso 3: Configurar el Backend

1. Navega a la carpeta `backend`:
```powershell
cd backend
```

2. Instala las dependencias de Node.js:
```powershell
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Edita `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=gestion_bebidas
DB_PORT=3306
PORT=3000
```

4. Inicia el servidor:
```powershell
npm start
```

Deberías ver:
```
✅ Conexión exitosa a MySQL - Base de datos: gestion_bebidas
🚀 Servidor ejecutándose en http://localhost:3000
```

### Paso 4: Abrir el Frontend

1. Abre el archivo `frontend/index.html` en tu navegador web:
   - **Opción 1:** Doble clic en el archivo
   - **Opción 2:** Desde VS Code, click derecho > "Open with Live Server"
   - **Opción 3:** Arrastra el archivo al navegador

2. La aplicación debería cargar automáticamente y conectarse al backend

---

## 📊 Uso de la Aplicación

### Dashboard Principal

Al abrir la aplicación, verás:

1. **KPIs (Indicadores):**
   - Total de ventas acumuladas
   - Cantidad de productos en catálogo
   - Unidades en stock
   - Ventas del mes actual

2. **Gráficos:**
   - **Ventas Mensuales:** Gráfico de barras con evolución temporal
   - **Ventas por Categoría:** Gráfico de torta con distribución porcentual
   - **Top 10 Productos:** Productos más vendidos en barras horizontales
   - **Métodos de Pago:** Distribución de formas de pago

3. **Alertas de Stock:** Tabla con productos que necesitan reposición

### Gestión de Productos

- **Listar productos:** Ver catálogo completo con stock y precios
- **Buscar:** Filtrar por nombre o SKU
- **Filtrar:** Por categoría
- **Editar:** Modificar información de productos
- **Eliminar:** Borrar productos (si no tienen ventas asociadas)

### Registro de Ventas

- **Nueva Venta:**
  1. Click en "Nueva Venta"
  2. Selecciona método de pago
  3. Agrega productos y cantidades
  4. El total se calcula automáticamente
  5. Guarda la transacción

- **Ver Detalle:** Click en el ícono de ojo para ver items vendidos
- **Eliminar:** Borrar ventas erróneas

### Control de Inventario

- **Ver stock actual** de todos los productos
- **Estados:**
  - 🔴 **Bajo:** Stock menor al mínimo (crítico)
  - 🟡 **Medio:** Stock cerca del mínimo
  - 🟢 **Suficiente:** Stock adecuado
- **Ajustar stock:** Modificar cantidades manualmente

### Reportes y Análisis

Sección con interpretaciones de los datos:
- **Tendencias de Ventas:** Análisis temporal
- **Gestión de Inventario:** Recomendaciones de stock
- **Productos Estrella:** Identificación de best-sellers
- **Métodos de Pago:** Preferencias de los clientes

---

## 🔌 API Endpoints

### Estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/stats/resumen-general` | KPIs generales del sistema |
| GET | `/api/stats/ventas-mensuales` | Ventas de los últimos 12 meses |
| GET | `/api/stats/productos-mas-vendidos` | Top 10 productos |
| GET | `/api/stats/ventas-por-categoria` | Distribución por categoría |
| GET | `/api/stats/metodos-pago` | Estadísticas de formas de pago |
| GET | `/api/stats/stock-bajo` | Productos con stock crítico |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos los productos |
| GET | `/api/products/:id` | Obtener un producto específico |
| POST | `/api/products` | Crear nuevo producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

### Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sales` | Listar ventas (con paginación) |
| GET | `/api/sales/:id` | Detalle de una venta |
| POST | `/api/sales` | Registrar nueva venta |
| DELETE | `/api/sales/:id` | Eliminar venta |

### Inventario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/inventory` | Estado completo del inventario |
| PUT | `/api/inventory/:productId` | Actualizar stock de producto |

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar todas las categorías |

---

## 🗃️ Modelo de Base de Datos

### Tablas Principales

- **`categories`**: Categorías de bebidas (Gaseosas, Cervezas, etc.)
- **`suppliers`**: Proveedores
- **`products`**: Catálogo de productos con precios
- **`customers`**: Clientes (opcional)
- **`inventories`**: Stock actual por producto
- **`sales`**: Cabecera de ventas
- **`sale_items`**: Detalle de productos vendidos
- **`stock_movements`**: Historial de movimientos

### Normalización

La base de datos está normalizada hasta **3FN (Tercera Forma Normal)**:
- ✅ No hay dependencias parciales
- ✅ No hay dependencias transitivas
- ✅ Cada tabla tiene una clave primaria única
- ✅ Se usan claves foráneas para relaciones

### Triggers Automáticos

- **`trg_sale_items_stock_check`**: Valida que haya stock antes de vender
- **`trg_sale_items_after_insert`**: Descuenta stock al registrar venta
- **`trg_sale_items_after_update`**: Ajusta stock al modificar venta
- **`trg_sale_items_after_delete`**: Devuelve stock al cancelar venta
- **`trg_stock_movements_after_insert`**: Actualiza inventario con movimientos

---

## 📈 Ejemplos de Consultas SQL

### Ventas Totales por Mes
```sql
SELECT 
  DATE_FORMAT(sale_date, '%Y-%m') AS mes,
  COUNT(*) AS cantidad_ventas,
  SUM(total) AS total_mes
FROM sales
GROUP BY mes
ORDER BY mes DESC;
```

### Productos Más Vendidos
```sql
SELECT 
  p.name AS producto,
  SUM(si.quantity) AS total_vendido,
  SUM(si.subtotal) AS ingresos
FROM sale_items si
JOIN products p ON si.product_id = p.id
GROUP BY p.id
ORDER BY total_vendido DESC
LIMIT 10;
```

### Stock Bajo Alerta
```sql
SELECT 
  p.name,
  i.quantity AS stock_actual,
  i.min_stock,
  (i.min_stock - i.quantity) AS faltante
FROM inventories i
JOIN products p ON i.product_id = p.id
WHERE i.quantity < i.min_stock
ORDER BY faltante DESC;
```

---

## 🎨 Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web minimalista
- **mysql2** - Driver para MySQL con soporte de promesas
- **dotenv** - Gestión de variables de entorno
- **cors** - Middleware para CORS

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript ES6+** - Lógica de la aplicación
- **Chart.js** - Biblioteca de gráficos interactivos
- **Font Awesome** - Iconografía

### Base de Datos
- **MySQL 8.0** - Sistema de gestión de bases de datos relacional

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to MySQL"

1. Verifica que MySQL esté ejecutándose:
```powershell
mysql --version
```

2. Comprueba las credenciales en `backend/.env`

3. Verifica que el puerto 3306 esté abierto

### Error: "Port 3000 already in use"

1. Cambia el puerto en `backend/.env`:
```env
PORT=3001
```

2. Actualiza también en `frontend/js/config.js`:
```javascript
BASE_URL: 'http://localhost:3001/api'
```

### Los gráficos no se muestran

1. Verifica que el backend esté ejecutándose
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que haya datos en la base de datos

### CORS Error

Si ves errores de CORS, asegúrate de que el backend tenga configurado `cors`:
```javascript
app.use(cors());
```

---

## 📝 Criterios de Evaluación Cumplidos

| Criterio | Ponderación | Cumplimiento |
|----------|-------------|--------------|
| **Diseño de base de datos y consultas** | 25% | ✅ 3FN, triggers, vistas |
| **Lógica y funcionamiento del sistema** | 25% | ✅ API completa, CRUD funcional |
| **Representación gráfica de datos** | 20% | ✅ 4 tipos de gráficos interactivos |
| **Interactividad e integración** | 15% | ✅ Filtros, búsquedas, modales |
| **Documentación técnica y claridad** | 15% | ✅ README, comentarios, análisis |

---

## 👥 Autores

**Nombre:** [Tu Nombre Completo]  
**Legajo:** [Tu Legajo]  
**Carrera:** Tecnicatura Universitaria en Programación  
**Universidad:** Universidad Tecnológica Nacional (UTN)  
**Fecha de Entrega:** 15 de Noviembre de 2025

---

## 📄 Licencia

Este proyecto es desarrollado con fines educativos como parte del Trabajo Práctico Final Integrador.

---

## 🙏 Agradecimientos

- A los docentes de Base de Datos I, Base de Datos II e Introducción al Análisis de Datos
- A la UTN por la formación académica
- A la comunidad de desarrolladores por las herramientas open source utilizadas

---

## 📞 Contacto

Para consultas sobre el proyecto:
- **Email:** [tu_email@ejemplo.com]
- **GitHub:** [tu_usuario]

---

**⭐ Si este proyecto te fue útil, no olvides darle una estrella!**
