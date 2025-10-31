// Aplicación principal - Controlador de la interfaz

// Variables globales
let currentSection = 'dashboard';
let productosCache = [];

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación Gestión de Bebidas...');
    
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
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Ver detalle de venta
async function verDetalleVenta(id) {
    try {
        const response = await API.getVenta(id);
        const venta = response.data;
        
        let detalle = `Venta #${venta.id}\n`;
        detalle += `Fecha: ${Utils.formatDate(venta.sale_date)}\n`;
        detalle += `Método: ${venta.payment_method}\n\n`;
        detalle += `Productos:\n`;
        
        venta.items.forEach(item => {
            detalle += `- ${item.product_name}: ${item.quantity} x ${Utils.formatCurrency(item.unit_price)} = ${Utils.formatCurrency(item.subtotal)}\n`;
        });
        
        detalle += `\nTotal: ${Utils.formatCurrency(venta.total)}`;
        
        alert(detalle);
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        Utils.showNotification('Error al cargar detalle de venta', 'error');
    }
}

// Eliminar venta
async function eliminarVenta(id) {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) {
        return;
    }
    
    try {
        await API.deleteVenta(id);
        Utils.showNotification('Venta eliminada exitosamente', 'success');
        await Tables.renderVentas();
        await loadKPIs();
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        Utils.showNotification('Error al eliminar la venta', 'error');
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        await API.deleteProducto(id);
        Utils.showNotification('Producto eliminado exitosamente', 'success');
        await Tables.renderProductos();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        Utils.showNotification('No se puede eliminar el producto (puede tener ventas asociadas)', 'error');
    }
}

// Ajustar stock
async function ajustarStock(productId, stockActual, minStock) {
    const nuevoStock = prompt(`Stock actual: ${stockActual}\nIngresa el nuevo stock:`, stockActual);
    
    if (nuevoStock === null) return;
    
    const nuevoMinStock = prompt(`Stock mínimo actual: ${minStock}\nIngresa el nuevo stock mínimo:`, minStock);
    
    if (nuevoMinStock === null) return;
    
    try {
        await API.updateInventario(productId, {
            quantity: parseInt(nuevoStock),
            min_stock: parseInt(nuevoMinStock)
        });
        
        Utils.showNotification('Inventario actualizado exitosamente', 'success');
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
    modal.classList.add('active');
    
    // Cargar categorías
    try {
        const response = await API.getCategorias();
        const select = document.getElementById('select-categoria-producto');
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

// Exportar funciones al objeto global window para que sean accesibles desde HTML
window.abrirModalNuevoProducto = abrirModalNuevoProducto;
window.submitNuevoProducto = submitNuevoProducto;
window.filtrarProductos = filtrarProductos;
window.cerrarModal = cerrarModal;
window.eliminarVenta = eliminarVenta;
window.eliminarProducto = eliminarProducto;
window.ajustarStock = ajustarStock;
window.agregarItemVenta = agregarItemVenta;
window.eliminarItemVenta = eliminarItemVenta;
window.abrirModalNuevaVenta = abrirModalNuevaVenta;
