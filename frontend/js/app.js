// Aplicación principal - Controlador de la interfaz

// Variables globales
let currentSection = 'dashboard';
let productosCache = [];
let currentUser = null;
let sidebarOpen = false;

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación Gestión de Bebidas...');
    
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Cargar información del usuario
    cargarUsuario();
    
    // Aplicar permisos según el rol
    aplicarPermisos();
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar sección inicial (Dashboard)
    await loadDashboard();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('✅ Aplicación lista');
});

// Configurar navegación entre secciones
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Cerrar sidebar en móvil
            if (window.innerWidth <= 400) {
                closeSidebar();
            }
            
            // Actualizar nav activo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Obtener sección
            const section = item.dataset.section;
            
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            
            // Mostrar sección seleccionada
            document.getElementById(`section-${section}`).classList.add('active');
            
            // Actualizar título
            updatePageTitle(section);
            
            // Cargar datos de la sección
            await loadSectionData(section);
        });
    });
}

// Actualizar título de la página
function updatePageTitle(section) {
    const titles = {
        'dashboard': 'Dashboard',
        'productos': 'Gestión de Productos',
        'ventas': 'Registro de Ventas',
        'inventario': 'Control de Inventario',
        'reportes': 'Reportes y Análisis'
    };
    
    document.getElementById('page-title').textContent = titles[section];
    document.getElementById('breadcrumb').textContent = `Inicio / ${titles[section]}`;
    currentSection = section;
}

// Cargar datos según la sección
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'productos':
            await Tables.renderProductos();
            await loadCategorias();
            break;
        case 'ventas':
            await Tables.renderVentas();
            break;
        case 'inventario':
            await Tables.renderInventario();
            break;
        case 'reportes':
            // Los reportes son estáticos por ahora
            break;
    }
}

// Cargar Dashboard completo
async function loadDashboard() {
    try {
        // Cargar KPIs
        await loadKPIs();
        
        // Cargar gráficos
        await Charts.loadAllCharts();
        
        // Cargar alertas de stock
        await Tables.renderAlertasStock();
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        Utils.showNotification('Error al cargar el dashboard', 'error');
    }
}

// Cargar KPIs
async function loadKPIs() {
    try {
        const response = await API.getResumenGeneral();
        const data = response.data;
        
        // Actualizar KPIs
        document.getElementById('kpi-ventas-total').textContent = 
            Utils.formatCurrency(data.ventas.monto_total);
        
        document.getElementById('kpi-productos').textContent = 
            Utils.formatNumber(data.productos.total_catalogo);
        
        document.getElementById('kpi-stock').textContent = 
            Utils.formatNumber(data.inventario.unidades_totales);
        
        document.getElementById('kpi-stock-bajo').textContent = 
            data.inventario.productos_stock_bajo;
        
        document.getElementById('kpi-ventas-mes').textContent = 
            Utils.formatCurrency(data.ventas_mes_actual.monto);
        
        document.getElementById('kpi-ventas-mes-count').textContent = 
            data.ventas_mes_actual.total;
    } catch (error) {
        console.error('Error al cargar KPIs:', error);
    }
}

// Cargar categorías para filtros
async function loadCategorias() {
    try {
        const response = await API.getCategorias();
        const categorias = response.data;
        
        const select = document.getElementById('filter-categoria');
        select.innerHTML = '<option value="">Todas las categorías</option>';
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botón nueva venta
    const btnNuevaVenta = document.getElementById('btn-nueva-venta');
    if (btnNuevaVenta) {
        btnNuevaVenta.addEventListener('click', abrirModalNuevaVenta);
    }
    
    // Formulario nueva venta
    const formNuevaVenta = document.getElementById('form-nueva-venta');
    if (formNuevaVenta) {
        formNuevaVenta.addEventListener('submit', submitNuevaVenta);
    }
    
    // Botón nuevo producto
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', abrirModalNuevoProducto);
    }
    
    // Formulario nuevo producto
    const formNuevoProducto = document.getElementById('form-nuevo-producto');
    if (formNuevoProducto) {
        formNuevoProducto.addEventListener('submit', submitNuevoProducto);
    }
    
    // Formulario editar producto
    const formEditarProducto = document.getElementById('form-editar-producto');
    if (formEditarProducto) {
        formEditarProducto.addEventListener('submit', submitEditarProducto);
    }
    
    // Formulario ajustar stock
    const formAjustarStock = document.getElementById('form-ajustar-stock');
    if (formAjustarStock) {
        formAjustarStock.addEventListener('submit', submitAjustarStock);
    }
    
    // Event listeners para actualizar preview del stock
    const nuevoStockInput = document.getElementById('nuevo-stock');
    const nuevoMinStockInput = document.getElementById('nuevo-stock-minimo');
    if (nuevoStockInput) {
        nuevoStockInput.addEventListener('input', actualizarPreviewStock);
    }
    if (nuevoMinStockInput) {
        nuevoMinStockInput.addEventListener('input', actualizarPreviewStock);
    }
    
    // Buscador de productos
    const searchProductos = document.getElementById('search-productos');
    if (searchProductos) {
        searchProductos.addEventListener('input', Utils.debounce(filtrarProductos, 200));
    }

    // Filtro por categoría de productos
    const filterCategoria = document.getElementById('filter-categoria');
    if (filterCategoria) {
        filterCategoria.addEventListener('change', filtrarProductos);
    }
    
    // Buscador de inventario
    const searchInventario = document.getElementById('search-inventario');
    if (searchInventario) {
        searchInventario.addEventListener('input', Utils.debounce(filtrarInventario, 200));
    }
    
    // Buscador de ventas
    const searchVentas = document.getElementById('search-ventas');
    if (searchVentas) {
        searchVentas.addEventListener('input', Utils.debounce(filtrarVentas, 200));
    }
    
    // Filtros de ventas
    const filterFechaDesde = document.getElementById('filter-fecha-desde');
    const filterFechaHasta = document.getElementById('filter-fecha-hasta');
    const filterMetodoPago = document.getElementById('filter-metodo-pago');
    
    if (filterFechaDesde) {
        filterFechaDesde.addEventListener('change', filtrarVentas);
    }
    if (filterFechaHasta) {
        filterFechaHasta.addEventListener('change', filtrarVentas);
    }
    if (filterMetodoPago) {
        filterMetodoPago.addEventListener('change', filtrarVentas);
    }
    
    // Buscador global
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', Utils.debounce(busquedaGlobal, 300));
    }
    
    // Botón de notificaciones
    const btnNotificaciones = document.getElementById('btn-notificaciones');
    if (btnNotificaciones) {
        btnNotificaciones.addEventListener('click', toggleNotificaciones);
    }
    
    // Cerrar panel de notificaciones al hacer click fuera
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notifications-panel');
        const btn = document.getElementById('btn-notificaciones');
        if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    // Cargar notificaciones iniciales
    cargarNotificaciones();
}

// Abrir modal nueva venta
async function abrirModalNuevaVenta() {
    const modal = document.getElementById('modal-nueva-venta');
    modal.classList.add('active');
    
    // Cargar productos disponibles
    try {
        const response = await API.getProductos();
        productosCache = response.data;
        
        // Limpiar items previos
        document.getElementById('items-venta').innerHTML = '';
        
        // Agregar primer item
        agregarItemVenta();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        Utils.showNotification('Error al cargar productos', 'error');
    }
}

// Agregar item a la venta
function agregarItemVenta() {
    const container = document.getElementById('items-venta');
    const itemId = Date.now();
    
    let html = `
        <div class="item-venta" id="item-${itemId}">
            <select class="producto-select" name="product_id[]" required onchange="calcularTotalVenta()">
                <option value="">Seleccionar producto...</option>
    `;
    
    productosCache.forEach(producto => {
        html += `<option value="${producto.id}" data-price="${producto.unit_price}">
            ${producto.name} - ${Utils.formatCurrency(producto.unit_price)} (Stock: ${producto.stock})
        </option>`;
    });
    
    html += `
            </select>
            <input type="number" name="quantity[]" placeholder="Cantidad" min="1" value="1" required onchange="calcularTotalVenta()">
            <button type="button" class="btn btn-danger btn-sm" onclick="eliminarItemVenta(${itemId})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
}

// Eliminar item de venta
function eliminarItemVenta(itemId) {
    const item = document.getElementById(`item-${itemId}`);
    if (item) {
        item.remove();
        calcularTotalVenta();
    }
}

// Calcular total de la venta
function calcularTotalVenta() {
    const items = document.querySelectorAll('.item-venta');
    let total = 0;
    
    items.forEach(item => {
        const select = item.querySelector('select');
        const quantity = item.querySelector('input[type="number"]').value;
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.price) {
            const price = parseFloat(selectedOption.dataset.price);
            total += price * parseInt(quantity || 0);
        }
    });
    
    document.getElementById('total-venta-display').textContent = total.toFixed(2);
}

// Submit nueva venta
async function submitNuevaVenta(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const items = [];
    
    // Obtener todos los items
    const productIds = formData.getAll('product_id[]');
    const quantities = formData.getAll('quantity[]');
    
    for (let i = 0; i < productIds.length; i++) {
        if (productIds[i]) {
            const producto = productosCache.find(p => p.id == productIds[i]);
            items.push({
                product_id: parseInt(productIds[i]),
                quantity: parseInt(quantities[i]),
                unit_price: parseFloat(producto.unit_price)
            });
        }
    }
    
    if (items.length === 0) {
        Utils.showNotification('Debes agregar al menos un producto', 'warning');
        return;
    }
    
    const ventaData = {
        payment_method: formData.get('payment_method'),
        note: formData.get('note') || null,
        items: items
    };
    
    try {
        await API.createVenta(ventaData);
        Utils.showNotification('Venta registrada exitosamente', 'success');
        cerrarModal('modal-nueva-venta');
        
        // Recargar datos si estamos en ventas
        if (currentSection === 'ventas') {
            await Tables.renderVentas();
        }
        
        // Recargar dashboard
        await loadKPIs();
    } catch (error) {
        console.error('Error al crear venta:', error);
        Utils.showNotification('Error al registrar la venta: ' + error.message, 'error');
    }
}

// Cerrar modal
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error(`Modal ${modalId} no encontrado`);
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Ver detalle de venta
async function verDetalleVenta(id) {
    try {
        const response = await API.getVenta(id);
        const venta = response.data;
        
        // Llenar información del modal
        document.getElementById('detalle-venta-id').textContent = venta.id;
        document.getElementById('detalle-venta-fecha').textContent = Utils.formatDate(venta.sale_date);
        document.getElementById('detalle-venta-metodo').textContent = venta.payment_method;
        
        // Mostrar nota si existe
        const notaContainer = document.getElementById('detalle-venta-nota-container');
        const notaElement = document.getElementById('detalle-venta-nota');
        if (venta.note) {
            notaElement.textContent = venta.note;
            notaContainer.style.display = 'block';
        } else {
            notaContainer.style.display = 'none';
        }
        
        // Llenar tabla de productos
        const itemsContainer = document.getElementById('detalle-venta-items');
        itemsContainer.innerHTML = '';
        
        venta.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="producto-info">
                        <i class="fas fa-wine-bottle"></i>
                        <span>${item.product_name}</span>
                    </div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${Utils.formatCurrency(item.unit_price)}</td>
                <td class="text-right"><strong>${Utils.formatCurrency(item.subtotal)}</strong></td>
            `;
            itemsContainer.appendChild(row);
        });
        
        // Mostrar total
        document.getElementById('detalle-venta-total').textContent = Utils.formatCurrency(venta.total);
        
        // Abrir modal
        document.getElementById('modal-detalle-venta').classList.add('active');
        
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        Utils.showNotification('Error al cargar detalle de venta', 'error');
    }
}

// Función para imprimir detalle
function imprimirDetalle() {
    window.print();
}

// Variables para almacenar IDs temporalmente
let productoIdParaEliminar = null;
let ventaIdParaEliminar = null;

// Eliminar venta - Abrir modal de confirmación
async function eliminarVenta(id) {
    ventaIdParaEliminar = id;
    
    // Obtener información de la venta
    try {
        const response = await API.getVenta(id);
        const venta = response.data;
        
        // Mostrar información en el modal
        document.getElementById('venta-eliminar-info').innerHTML = `
            <div class="detail-item">
                <span class="detail-label">ID de Venta:</span>
                <span class="detail-value">#${venta.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${Utils.formatDate(venta.sale_date)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Total:</span>
                <span class="detail-value">${Utils.formatCurrency(venta.total)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Método de Pago:</span>
                <span class="detail-value">${venta.payment_method}</span>
            </div>
        `;
        
        // Abrir modal
        document.getElementById('modal-confirmar-eliminar-venta').classList.add('active');
    } catch (error) {
        console.error('Error al obtener venta:', error);
        Utils.showNotification('Error al cargar información de la venta', 'error');
    }
}

// Confirmar eliminación de venta
async function confirmarEliminarVenta() {
    if (!ventaIdParaEliminar) return;
    
    try {
        await API.deleteVenta(ventaIdParaEliminar);
        Utils.showNotification('Venta eliminada exitosamente', 'success');
        cerrarModal('modal-confirmar-eliminar-venta');
        ventaIdParaEliminar = null;
        await Tables.renderVentas();
        await loadKPIs();
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        Utils.showNotification('Error al eliminar la venta', 'error');
    }
}

// Eliminar producto - Abrir modal de confirmación
async function eliminarProducto(id) {
    productoIdParaEliminar = id;
    
    // Obtener información del producto
    try {
        const response = await API.getProductos();
        const producto = response.data.find(p => p.id === id);
        
        if (!producto) {
            Utils.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Mostrar información en el modal
        document.getElementById('producto-eliminar-info').innerHTML = `
            <div class="detail-item">
                <span class="detail-label">SKU:</span>
                <span class="detail-value">${producto.sku}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Nombre:</span>
                <span class="detail-value">${producto.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Precio:</span>
                <span class="detail-value">${Utils.formatCurrency(producto.unit_price)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Stock:</span>
                <span class="detail-value">${producto.stock} unidades</span>
            </div>
        `;
        
        // Abrir modal
        document.getElementById('modal-confirmar-eliminar-producto').classList.add('active');
    } catch (error) {
        console.error('Error al obtener producto:', error);
        Utils.showNotification('Error al cargar información del producto', 'error');
    }
}

// Confirmar eliminación de producto
async function confirmarEliminarProducto() {
    if (!productoIdParaEliminar) return;
    
    try {
        await API.deleteProducto(productoIdParaEliminar);
        Utils.showNotification('Producto eliminado exitosamente', 'success');
        cerrarModal('modal-confirmar-eliminar-producto');
        productoIdParaEliminar = null;
        await Tables.renderProductos();
        await loadKPIs();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        Utils.showNotification('No se puede eliminar el producto (puede tener ventas asociadas)', 'error');
    }
}

// Ajustar stock
// Variables para el modal de ajuste de stock
let stockAjusteData = {
    productId: null,
    stockActual: 0,
    minStockActual: 0
};

async function ajustarStock(productId, stockActual, minStock, productoNombre = '', sku = '') {
    // Guardar datos para uso posterior
    stockAjusteData = {
        productId,
        stockActual,
        minStockActual: minStock
    };
    
    // Actualizar información del producto en el modal
    document.getElementById('stock-producto-nombre').textContent = productoNombre || 'Producto';
    document.getElementById('stock-producto-sku').textContent = sku || 'N/A';
    
    // Actualizar valores actuales
    document.getElementById('stock-actual-display').textContent = stockActual;
    document.getElementById('stock-minimo-display').textContent = minStock;
    
    // Resetear formulario
    document.getElementById('nuevo-stock').value = stockActual;
    document.getElementById('nuevo-stock-minimo').value = minStock;
    document.getElementById('motivo-ajuste').value = '';
    document.getElementById('nota-ajuste').value = '';
    
    // Actualizar preview
    actualizarPreviewStock();
    
    // Abrir modal
    abrirModal('modal-ajustar-stock');
}

function ajustarCantidad(inputId, delta) {
    const input = document.getElementById(inputId);
    const valorActual = parseInt(input.value) || 0;
    const nuevoValor = Math.max(0, valorActual + delta);
    input.value = nuevoValor;
    actualizarPreviewStock();
}

function actualizarPreviewStock() {
    const nuevoStock = parseInt(document.getElementById('nuevo-stock').value) || 0;
    const nuevoMinStock = parseInt(document.getElementById('nuevo-stock-minimo').value) || 0;
    
    const { stockActual, minStockActual } = stockAjusteData;
    
    // Calcular diferencia
    const diferenciaStock = nuevoStock - stockActual;
    
    // Actualizar valores en el preview
    document.getElementById('stock-diferencia').textContent = diferenciaStock > 0 ? `+${diferenciaStock}` : diferenciaStock;
    
    // Actualizar badge de estado
    const badgeEstado = document.getElementById('stock-estado-badge');
    badgeEstado.classList.remove('increase', 'decrease', 'no-change');
    
    if (diferenciaStock > 0) {
        badgeEstado.textContent = 'Incremento';
        badgeEstado.classList.add('increase');
    } else if (diferenciaStock < 0) {
        badgeEstado.textContent = 'Reducción';
        badgeEstado.classList.add('decrease');
    } else {
        badgeEstado.textContent = 'Sin cambios';
        badgeEstado.classList.add('no-change');
    }
}

async function submitAjustarStock(e) {
    e.preventDefault();
    
    const nuevoStock = parseInt(document.getElementById('nuevo-stock').value);
    const nuevoMinStock = parseInt(document.getElementById('nuevo-stock-minimo').value);
    const motivo = document.getElementById('motivo-ajuste').value;
    const notas = document.getElementById('nota-ajuste').value;
    
    if (isNaN(nuevoStock) || isNaN(nuevoMinStock)) {
        Utils.showNotification('Por favor ingresa valores válidos', 'error');
        return;
    }
    
    if (nuevoStock < 0 || nuevoMinStock < 0) {
        Utils.showNotification('Los valores no pueden ser negativos', 'error');
        return;
    }
    
    try {
        await API.updateInventario(stockAjusteData.productId, {
            quantity: nuevoStock,
            min_stock: nuevoMinStock,
            motivo: motivo || 'Ajuste manual',
            notas: notas
        });
        
        Utils.showNotification('Inventario actualizado exitosamente', 'success');
        cerrarModal('modal-ajustar-stock');
        await Tables.renderInventario();
        await loadKPIs();
    } catch (error) {
        console.error('Error al actualizar inventario:', error);
        Utils.showNotification('Error al actualizar inventario', 'error');
    }
}

// ========== GESTIÓN DE PRODUCTOS ==========

// Abrir modal nuevo producto
async function abrirModalNuevoProducto() {
    const modal = document.getElementById('modal-nuevo-producto');
    
    if (!modal) {
        console.error('❌ Modal nuevo producto no encontrado');
        return;
    }
    
    modal.classList.add('active');
    
    // Cargar categorías
    try {
        const response = await API.getCategorias();
        const select = document.getElementById('select-categoria-producto');
        
        if (!select) {
            console.error('❌ Select de categorías no encontrado');
            return;
        }
        
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        
        response.data.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        // Limpiar formulario
        document.getElementById('form-nuevo-producto').reset();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        Utils.showNotification('Error al cargar categorías', 'error');
    }
}

// Abrir modal editar producto
async function editarProducto(id) {
    const modal = document.getElementById('modal-editar-producto');
    
    if (!modal) {
        console.error('❌ Modal editar producto no encontrado');
        return;
    }
    
    try {
        // Obtener datos del producto
        const response = await API.getProductos();
        const producto = response.data.find(p => p.id === id);
        
        if (!producto) {
            Utils.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Cargar categorías
        const categoriasResponse = await API.getCategorias();
        const select = document.getElementById('edit-categoria-producto');
        
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        categoriasResponse.data.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        // Llenar formulario con datos del producto
        document.getElementById('edit-producto-id').value = producto.id;
        document.getElementById('edit-sku').value = producto.sku;
        document.getElementById('edit-nombre').value = producto.name;
        document.getElementById('edit-categoria-producto').value = producto.category_id;
        document.getElementById('edit-volumen').value = producto.volume_ml || '';
        document.getElementById('edit-unidad-medida').value = producto.unit_measure || 'unidad';
        document.getElementById('edit-precio').value = producto.unit_price;
        document.getElementById('edit-descripcion').value = producto.description || '';
        
        // Abrir modal
        modal.classList.add('active');
    } catch (error) {
        console.error('Error al cargar producto:', error);
        Utils.showNotification('Error al cargar datos del producto', 'error');
    }
}

// Submit nuevo producto
async function submitNuevoProducto(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const stockInicial = parseInt(formData.get('stock')) || 0;
    const minStock = parseInt(formData.get('stock_minimo')) || 0;

    // Mapeo al contrato del backend
    const data = {
        sku: formData.get('sku'),
        name: formData.get('nombre'),
        category_id: parseInt(formData.get('categoria_id')),
        unit_price: parseFloat(formData.get('precio')),
        volume_ml: formData.get('volumen_ml') ? parseInt(formData.get('volumen_ml')) : null,
        unit_measure: formData.get('unidad_medida') || 'unidad'
        // supplier_id opcional: podría agregarse si se incorpora al formulario
    };
    
    try {
        const resp = await API.createProducto(data);
        const nuevoId = resp?.data?.id;
        Utils.showNotification('Producto creado exitosamente', 'success');
        cerrarModal('modal-nuevo-producto');
        
        // Intentar inicializar inventario si el usuario cargó valores
        if (nuevoId && (stockInicial > 0 || minStock > 0)) {
            try {
                await API.updateInventario(nuevoId, {
                    quantity: stockInicial,
                    min_stock: minStock
                });
            } catch (invErr) {
                console.warn('No se pudo inicializar el inventario para el nuevo producto:', invErr);
                // No bloqueamos el flujo: el producto igualmente quedó creado
            }
        }
        await Tables.renderProductos();
        await loadKPIs();
    } catch (error) {
        console.error('Error al crear producto:', error);
        Utils.showNotification('Error al crear producto', 'error');
    }
}

// Submit editar producto
async function submitEditarProducto(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productoId = parseInt(formData.get('id'));
    
    // Mapeo al contrato del backend
    const data = {
        sku: formData.get('sku'),
        name: formData.get('nombre'),
        category_id: parseInt(formData.get('categoria_id')),
        unit_price: parseFloat(formData.get('precio')),
        volume_ml: formData.get('volumen_ml') ? parseInt(formData.get('volumen_ml')) : null,
        unit_measure: formData.get('unidad_medida') || 'unidad',
        description: formData.get('descripcion') || null
    };
    
    try {
        await API.updateProducto(productoId, data);
        Utils.showNotification('Producto actualizado exitosamente', 'success');
        cerrarModal('modal-editar-producto');
        await Tables.renderProductos();
        await loadKPIs();
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        Utils.showNotification('Error al actualizar producto', 'error');
    }
}

// Filtrar productos por búsqueda
function filtrarProductos() {
    const searchInput = document.getElementById('search-productos');
    const filterSelect = document.getElementById('filter-categoria');
    const term = (searchInput?.value || '').toLowerCase();
    const categoria = filterSelect?.value || '';

    const rows = document.querySelectorAll('#table-productos tbody tr');
    rows.forEach(row => {
        const texto = row.textContent.toLowerCase();
        const catId = row.dataset.categoryId || '';
        const coincideTexto = !term || texto.includes(term);
        const coincideCategoria = !categoria || catId === String(categoria);
        row.style.display = (coincideTexto && coincideCategoria) ? '' : 'none';
    });
}

// Filtrar inventario por búsqueda
function filtrarInventario() {
    const searchInput = document.getElementById('search-inventario');
    const term = (searchInput?.value || '').toLowerCase();

    const rows = document.querySelectorAll('#tabla-inventario tbody tr');
    rows.forEach(row => {
        const texto = row.textContent.toLowerCase();
        const coincide = !term || texto.includes(term);
        row.style.display = coincide ? '' : 'none';
    });
}

// Filtrar ventas por búsqueda y filtros
function filtrarVentas() {
    const searchInput = document.getElementById('search-ventas');
    const filterFechaDesde = document.getElementById('filter-fecha-desde');
    const filterFechaHasta = document.getElementById('filter-fecha-hasta');
    const filterMetodoPago = document.getElementById('filter-metodo-pago');
    
    const term = (searchInput?.value || '').toLowerCase();
    const fechaDesde = filterFechaDesde?.value || '';
    const fechaHasta = filterFechaHasta?.value || '';
    const metodoPago = filterMetodoPago?.value || '';

    const rows = document.querySelectorAll('#tabla-ventas tbody tr');
    rows.forEach(row => {
        const texto = row.textContent.toLowerCase();
        const fechaVenta = row.querySelector('td:nth-child(2)')?.textContent || '';
        const metodo = row.querySelector('td:nth-child(5)')?.textContent || '';
        
        const coincideTexto = !term || texto.includes(term);
        const coincideMetodo = !metodoPago || metodo.includes(metodoPago);
        
        // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD para comparación
        let coincideFecha = true;
        if (fechaDesde || fechaHasta) {
            const partes = fechaVenta.split(/[\/\s,:-]/);
            if (partes.length >= 3) {
                const fechaVentaISO = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                if (fechaDesde && fechaVentaISO < fechaDesde) coincideFecha = false;
                if (fechaHasta && fechaVentaISO > fechaHasta) coincideFecha = false;
            }
        }
        
        row.style.display = (coincideTexto && coincideMetodo && coincideFecha) ? '' : 'none';
    });
}

// Búsqueda global
function busquedaGlobal() {
    const searchInput = document.getElementById('global-search');
    const term = (searchInput?.value || '').toLowerCase();
    
    if (!term) return;
    
    // Buscar en la sección actual
    if (currentSection === 'productos') {
        const searchProductos = document.getElementById('search-productos');
        if (searchProductos) {
            searchProductos.value = term;
            filtrarProductos();
        }
    } else if (currentSection === 'inventario') {
        const searchInventario = document.getElementById('search-inventario');
        if (searchInventario) {
            searchInventario.value = term;
            filtrarInventario();
        }
    } else if (currentSection === 'ventas') {
        const searchVentas = document.getElementById('search-ventas');
        if (searchVentas) {
            searchVentas.value = term;
            filtrarVentas();
        }
    } else {
        // Buscar en todas las tablas visibles
        const tables = document.querySelectorAll('.content-section.active table tbody tr');
        tables.forEach(row => {
            const texto = row.textContent.toLowerCase();
            const coincide = texto.includes(term);
            row.style.display = coincide ? '' : 'none';
        });
    }
}

// Notificaciones
function toggleNotificaciones() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('active');
}

async function cargarNotificaciones() {
    try {
        // Obtener productos con stock bajo
        const response = await API.getStockBajo();
        const stockBajo = response.data || [];
        
        const notificationsList = document.getElementById('notifications-list');
        const badge = document.getElementById('badge-notificaciones');
        
        // Crear notificaciones basadas en stock bajo
        let notifications = [];
        
        stockBajo.forEach(item => {
            if (item.stock_actual === 0) {
                notifications.push({
                    type: 'warning',
                    icon: 'fa-exclamation-triangle',
                    title: 'Stock agotado',
                    message: `${item.producto} no tiene stock disponible`,
                    time: 'Ahora',
                    unread: true
                });
            } else {
                notifications.push({
                    type: 'info',
                    icon: 'fa-info-circle',
                    title: 'Stock bajo',
                    message: `${item.producto} tiene solo ${item.stock_actual} unidades`,
                    time: 'Hace 5 min',
                    unread: true
                });
            }
        });
        
        // Limitar a las primeras 5 notificaciones
        notifications = notifications.slice(0, 5);
        
        // Actualizar badge
        if (badge) {
            badge.textContent = notifications.length;
            badge.style.display = notifications.length > 0 ? 'block' : 'none';
        }
        
        // Renderizar notificaciones
        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No hay notificaciones nuevas</p>
                </div>
            `;
        } else {
            notificationsList.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.unread ? 'unread' : ''}" onclick="marcarComoLeida(this)">
                    <div class="notification-icon ${notif.type}">
                        <i class="fas ${notif.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${notif.time}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

function marcarComoLeida(element) {
    element.classList.remove('unread');
    actualizarBadgeNotificaciones();
}

function marcarTodasLeidas() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));
    actualizarBadgeNotificaciones();
}

function actualizarBadgeNotificaciones() {
    const badge = document.getElementById('badge-notificaciones');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Autenticación y Permisos
function verificarAutenticacion() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

function cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = currentUser.full_name;
        }
    }
}

function cerrarSesion() {
    // Abrir modal de confirmación en lugar de confirm()
    const modal = document.getElementById('modal-confirmar-logout');
    if (modal) {
        modal.classList.add('active');
    }
}

function confirmarCerrarSesion() {
    // Realizar el cierre de sesión
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}

function aplicarPermisos() {
    if (!currentUser) return;
    
    const role = currentUser.role;
    
    if (role === 'empleado') {
        // Ocultar secciones solo para administradores
        ocultarElementoPorId('section-reportes');
        
        // Ocultar botones de administrador
        ocultarElementoPorId('btn-nuevo-producto');
        
        // Ocultar acciones de eliminar y editar en tablas
        const estiloEmpleado = document.createElement('style');
        estiloEmpleado.innerHTML = `
            /* Ocultar botones de eliminar y editar para empleados */
            .btn-danger, 
            button[onclick*="eliminarProducto"],
            button[onclick*="editarProducto"],
            button[onclick*="eliminarVenta"],
            button[onclick*="ajustarStock"] {
                display: none !important;
            }
            
            /* Ocultar sección de reportes en el menú */
            .nav-item[data-section="reportes"] {
                display: none !important;
            }
        `;
        document.head.appendChild(estiloEmpleado);
        
        console.log('🔒 Permisos de empleado aplicados');
    } else if (role === 'admin') {
        console.log('🔓 Permisos de administrador - Acceso total');
    }
}

function ocultarElementoPorId(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.style.display = 'none';
    }
}

function esAdmin() {
    return currentUser && currentUser.role === 'admin';
}

function esEmpleado() {
    return currentUser && currentUser.role === 'empleado';
}

// Exportar funciones al objeto global window para que sean accesibles desde HTML
window.abrirModalNuevoProducto = abrirModalNuevoProducto;
window.editarProducto = editarProducto;
window.submitNuevoProducto = submitNuevoProducto;
window.submitEditarProducto = submitEditarProducto;
window.filtrarProductos = filtrarProductos;
window.filtrarInventario = filtrarInventario;
window.filtrarVentas = filtrarVentas;
window.busquedaGlobal = busquedaGlobal;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.eliminarVenta = eliminarVenta;
window.eliminarProducto = eliminarProducto;
window.confirmarEliminarVenta = confirmarEliminarVenta;
window.confirmarEliminarProducto = confirmarEliminarProducto;
window.ajustarStock = ajustarStock;
window.ajustarCantidad = ajustarCantidad;
window.submitAjustarStock = submitAjustarStock;
window.agregarItemVenta = agregarItemVenta;
window.eliminarItemVenta = eliminarItemVenta;
window.toggleNotificaciones = toggleNotificaciones;
window.marcarComoLeida = marcarComoLeida;
window.marcarTodasLeidas = marcarTodasLeidas;
window.cerrarSesion = cerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;
window.abrirModalNuevaVenta = abrirModalNuevaVenta;
window.verDetalleVenta = verDetalleVenta;
window.imprimirDetalle = imprimirDetalle;

// ========== FUNCIONES RESPONSIVE - SIDEBAR MÓVIL ==========

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebarOpen = !sidebarOpen;
    
    if (sidebarOpen) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    sidebarOpen = false;
}

// Exportar funciones responsive
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
