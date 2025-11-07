// Configuración global de la aplicación
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Endpoints de la API
const API_ENDPOINTS = {
    // Estadísticas
    STATS: {
        RESUMEN: '/stats/resumen-general',
        VENTAS_MENSUALES: '/stats/ventas-mensuales',
        PRODUCTOS_MAS_VENDIDOS: '/stats/productos-mas-vendidos',
        VENTAS_POR_CATEGORIA: '/stats/ventas-por-categoria',
        METODOS_PAGO: '/stats/metodos-pago',
        STOCK_BAJO: '/stats/stock-bajo'
    },
    // Productos
    PRODUCTS: {
        LIST: '/products',
        BY_ID: (id) => `/products/${id}`,
        CREATE: '/products',
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`
    },
    // Ventas
    SALES: {
        LIST: '/sales',
        BY_ID: (id) => `/sales/${id}`,
        CREATE: '/sales',
        DELETE: (id) => `/sales/${id}`
    },
    // Categorías
    CATEGORIES: {
        LIST: '/categories'
    },
    // Inventario
    INVENTORY: {
        LIST: '/inventory',
        UPDATE: (id) => `/inventory/${id}`
    }
};

// Utilidades
const Utils = {
    // Formatear moneda
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    // Formatear número
    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num);
    },
    
    // Formatear fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Formatear fecha corta
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    },
    
    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear contenedor de notificación modal
        const modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        
        const titles = {
            success: '¡Éxito!',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        
        modal.innerHTML = `
            <div class="notification-modal-overlay"></div>
            <div class="notification-modal-content ${type}">
                <div class="notification-modal-icon">
                    ${icons[type] || icons.info}
                </div>
                <div class="notification-modal-body">
                    <h3 class="notification-modal-title">${titles[type] || titles.info}</h3>
                    <p class="notification-modal-message">${message}</p>
                </div>
                <button class="notification-modal-close" aria-label="Cerrar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Función para cerrar el modal
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        // Cerrar al hacer clic en el botón de cerrar
        const closeBtn = modal.querySelector('.notification-modal-close');
        closeBtn.addEventListener('click', closeModal);
        
        // Cerrar al hacer clic en el overlay
        const overlay = modal.querySelector('.notification-modal-overlay');
        overlay.addEventListener('click', closeModal);
        
        // Auto-cerrar después de 4 segundos para success, 6 segundos para otros
        const autoCloseTime = type === 'success' ? 4000 : 6000;
        setTimeout(closeModal, autoCloseTime);
    },
    
    // Debounce para búsquedas
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Colores para gráficos
const CHART_COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    
    palette: [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
        '#14b8a6', '#f97316', '#84cc16', '#a855f7'
    ]
};

// Configuración de Chart.js por defecto
const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 12,
                    family: "'Inter', sans-serif"
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            }
        }
    }
};
