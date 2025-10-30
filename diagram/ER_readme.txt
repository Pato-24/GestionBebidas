ER (texto) - entidades principales y relaciones

categories (1) <-- products (N) --> suppliers (1)
products (1) <-- inventories (1)
products (1) <-- sale_items (N) --> sales (1)
sales (N) --> customers (1)
products (1) <-- stock_movements (N)

Llaves y cardinalidades resumidas:
- categories.id PK
- suppliers.id PK
- products.id PK, products.category_id FK -> categories.id, products.supplier_id FK -> suppliers.id
- inventories.product_id PK/FK -> products.id
- sales.id PK, sales.customer_id FK -> customers.id
- sale_items.sale_id FK -> sales.id, sale_items.product_id FK -> products.id
- stock_movements.product_id FK -> products.id

Fin del ER_texto
