# Proyecto: Gestión de Ventas / Stock de Bebidas (Base de Datos)

Este paquete contiene únicamente la parte de Base de Datos del Trabajo Práctico Final Integrador.

Contenido
- `sql/schema.sql` : DDL para MySQL (crea la base `gestion_bebidas`, tablas, índices y vista de resumen).
- `sql/data.sql` : Datos iniciales (categorías, proveedores, productos, inventarios, clientes, ventas, items y movimientos). Contiene más de 50 registros en total.
- `diagram/` : carpeta reservada para diagramas (ER). Actualmente se incluye el esquema en texto en este README.

Adicionales generados
- `sql/import_all.sql` : script combinado (schema + data) listo para importar en un único paso.
- `diagram/ER_diagram.svg` : diagrama ER simplificado en formato SVG.

- `sql/triggers.sql` : triggers para mantener `inventories` sincronizado (validación de stock, ajustes al insertar/actualizar/eliminar sale_items y al insertar stock_movements).

Nota: `sql/import_all.sql` ya incluye estos triggers al final del script combinado.

Dominio elegido
- Gestión de ventas y stock comercial de bebidas (gaseosas, aguas, cervezas, vinos, jugos, energizantes y licores).

Modelo y normalización
- Tablas separadas: `categories`, `suppliers`, `products`, `customers`, `inventories`, `sales`, `sale_items`, `stock_movements`.
- Diseño apuntado a 3FN:
  - Los atributos atómicos están en columnas separadas.
  - Las dependencias funcionales se respetan: los datos de proveedor se mantienen en `suppliers`; los productos referencian `supplier_id` y `category_id` (no duplicación de datos del proveedor por producto salvo la FK).
  - `sale_items` almacena detalles de la venta (cantidad, precio unitario, subtotal) dependientes de la clave primaria `id` y de la relación con `sales`.

Cómo importar (MySQL)
1. Abrir terminal o cliente MySQL y ejecutar:

```powershell
mysql -u root -p < .\sql\schema.sql ; mysql -u root -p < .\sql\data.sql
```

(En Windows PowerShell, ajustar la ruta relativa al directorio donde descargue el proyecto.)

Consultas de ejemplo
- Stock actual por producto:
  SELECT * FROM vw_stock_summary ORDER BY stock ASC;

- Ventas totales por mes:
  SELECT DATE_FORMAT(sale_date, '%Y-%m') AS mes, SUM(total) AS total_mes
  FROM sales GROUP BY mes ORDER BY mes;

- Productos más vendidos (cantidad total):
  SELECT p.id, p.name, SUM(si.quantity) AS total_vendido
  FROM sale_items si JOIN products p ON si.product_id = p.id
  GROUP BY p.id, p.name ORDER BY total_vendido DESC LIMIT 10;

Notas finales
- Los scripts están pensados para MySQL 5.7+ / 8.0+. Si usa otro motor (MariaDB), normalmente funcionará sin cambios.
- La importación crea la base `gestion_bebidas`.
- Próximos pasos recomendados: exportar un diagrama ER (por ejemplo con MySQL Workbench), implementar triggers para ajustar `inventories` automáticamente al insertar `sale_items` o `stock_movements`, y construir la capa API / frontend indicada en el enunciado.

Convertir SVG a PNG (opcional)
Si querés un PNG y tenés Inkscape instalado en Windows, podés ejecutar en PowerShell:

```powershell
inkscape .\diagram\ER_diagram.svg --export-type=png -o .\diagram\ER_diagram.png
```

O usar una herramienta online para convertir el SVG a PNG.

Autor: Entrega generada automáticamente (solicitud del alumno)
Fecha: 2025-10-24
