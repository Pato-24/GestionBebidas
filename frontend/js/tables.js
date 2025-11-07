// Módulo para gestionar tablas dinámicas

const Tables = {
    // Renderizar tabla de productos
    async renderProductos() {
        try {
            const container = document.getElementById('tabla-productos');
            container.innerHTML = '<p class="loading">Cargando productos...</p>';
            
            const response = await API.getProductos();
            const productos = response.data;
            
            if (productos.length === 0) {
                container.innerHTML = '<p class="loading">No hay productos registrados</p>';
                return;
            }
            
            let html = `
                <table id="table-productos">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Volumen</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            productos.forEach(producto => {
                html += `
                    <tr data-category-id="${producto.category_id}">
                        <td><strong>${producto.sku}</strong></td>
                        <td>${producto.name}</td>
                        <td>${producto.category_name || '-'}</td>
                        <td>${producto.supplier_name || '-'}</td>
                        <td>${producto.volume_ml || '-'} ml</td>
                        <td>${Utils.formatCurrency(producto.unit_price)}</td>
                        <td>${producto.stock || 0}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editarProducto(${producto.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al renderizar productos:', error);
            document.getElementById('tabla-productos').innerHTML = 
                '<p class="loading">Error al cargar productos</p>';
        }
    },
    
    // Renderizar tabla de ventas
    async renderVentas() {
        try {
            const container = document.getElementById('tabla-ventas');
            container.innerHTML = '<p class="loading">Cargando ventas...</p>';
            
            const response = await API.getVentas({ limit: 100 });
            const ventas = response.data;
            
            if (ventas.length === 0) {
                container.innerHTML = '<p class="loading">No hay ventas registradas</p>';
                return;
            }
            
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Items</th>
                            <th>Método de Pago</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            ventas.forEach(venta => {
                html += `
                    <tr>
                        <td><strong>#${venta.id}</strong></td>
                        <td>${Utils.formatDateShort(venta.sale_date)}</td>
                        <td>${venta.customer_name || 'Anónimo'}</td>
                        <td>${venta.items_count || 0} items</td>
                        <td>${venta.payment_method}</td>
                        <td><strong>${Utils.formatCurrency(venta.total)}</strong></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="verDetalleVenta(${venta.id})" title="Ver detalle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarVenta(${venta.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al renderizar ventas:', error);
            document.getElementById('tabla-ventas').innerHTML = 
                '<p class="loading">Error al cargar ventas</p>';
        }
    },
    
    // Renderizar tabla de inventario
    async renderInventario() {
        try {
            const container = document.getElementById('tabla-inventario');
            container.innerHTML = '<p class="loading">Cargando inventario...</p>';
            
            const response = await API.getInventario();
            const inventario = response.data;
            
            if (inventario.length === 0) {
                container.innerHTML = '<p class="loading">No hay productos en inventario</p>';
                return;
            }
            
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                            <th>Última Actualización</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            inventario.forEach(item => {
                const estadoClass = {
                    'Bajo': 'badge-bajo',
                    'Medio': 'badge-medio',
                    'Suficiente': 'badge-suficiente'
                }[item.estado_stock] || '';
                
                html += `
                    <tr>
                        <td><strong>${item.sku}</strong></td>
                        <td>${item.producto}</td>
                        <td>${item.categoria}</td>
                        <td><strong>${item.stock}</strong></td>
                        <td>${item.min_stock}</td>
                        <td><span class="badge-status ${estadoClass}">${item.estado_stock}</span></td>
                        <td>${Utils.formatDateShort(item.last_updated)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="ajustarStock(${item.id}, ${item.stock}, ${item.min_stock}, '${item.producto.replace(/'/g, "\\'")}', '${item.sku}')" title="Ajustar stock">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al renderizar inventario:', error);
            document.getElementById('tabla-inventario').innerHTML = 
                '<p class="loading">Error al cargar inventario</p>';
        }
    },
    
    // Renderizar alertas de stock bajo
    async renderAlertasStock() {
        try {
            const container = document.getElementById('alertas-stock');
            const response = await API.getStockBajo();
            const alertas = response.data;
            
            if (alertas.length === 0) {
                container.innerHTML = '<p style="color: var(--success-color); padding: 20px; text-align: center;"><i class="fas fa-check-circle"></i> No hay productos con stock bajo</p>';
                return;
            }
            
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Faltante</th>
                            <th>Urgencia</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            alertas.forEach(alerta => {
                const urgencia = alerta.stock_actual === 0 ? 'CRÍTICO' : 
                                alerta.unidades_faltantes > 10 ? 'ALTO' : 'MEDIO';
                const urgenciaColor = urgencia === 'CRÍTICO' ? 'var(--danger-color)' :
                                     urgencia === 'ALTO' ? 'var(--warning-color)' : 
                                     'var(--info-color)';
                
                html += `
                    <tr>
                        <td><strong>${alerta.producto}</strong></td>
                        <td>${alerta.categoria}</td>
                        <td>${alerta.stock_actual}</td>
                        <td>${alerta.stock_minimo}</td>
                        <td><strong style="color: var(--danger-color);">${alerta.unidades_faltantes}</strong></td>
                        <td><strong style="color: ${urgenciaColor};">${urgencia}</strong></td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al renderizar alertas:', error);
        }
    }
};
