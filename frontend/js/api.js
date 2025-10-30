// Módulo de comunicación con la API

const API = {
    // Función base para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                ...API_CONFIG.HEADERS,
                ...options.headers
            }
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ESTADÍSTICAS
    async getResumenGeneral() {
        return await this.request(API_ENDPOINTS.STATS.RESUMEN);
    },
    
    async getVentasMensuales() {
        return await this.request(API_ENDPOINTS.STATS.VENTAS_MENSUALES);
    },
    
    async getProductosMasVendidos() {
        return await this.request(API_ENDPOINTS.STATS.PRODUCTOS_MAS_VENDIDOS);
    },
    
    async getVentasPorCategoria() {
        return await this.request(API_ENDPOINTS.STATS.VENTAS_POR_CATEGORIA);
    },
    
    async getMetodosPago() {
        return await this.request(API_ENDPOINTS.STATS.METODOS_PAGO);
    },
    
    async getStockBajo() {
        return await this.request(API_ENDPOINTS.STATS.STOCK_BAJO);
    },
    
    // PRODUCTOS
    async getProductos() {
        return await this.request(API_ENDPOINTS.PRODUCTS.LIST);
    },
    
    async getProducto(id) {
        return await this.request(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    },
    
    async createProducto(data) {
        return await this.request(API_ENDPOINTS.PRODUCTS.CREATE, {
            method: 'POST',
            body: data
        });
    },
    
    async updateProducto(id, data) {
        return await this.request(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
            method: 'PUT',
            body: data
        });
    },
    
    async deleteProducto(id) {
        return await this.request(API_ENDPOINTS.PRODUCTS.DELETE(id), {
            method: 'DELETE'
        });
    },
    
    // VENTAS
    async getVentas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? 
            `${API_ENDPOINTS.SALES.LIST}?${queryString}` : 
            API_ENDPOINTS.SALES.LIST;
        return await this.request(endpoint);
    },
    
    async getVenta(id) {
        return await this.request(API_ENDPOINTS.SALES.BY_ID(id));
    },
    
    async createVenta(data) {
        return await this.request(API_ENDPOINTS.SALES.CREATE, {
            method: 'POST',
            body: data
        });
    },
    
    async deleteVenta(id) {
        return await this.request(API_ENDPOINTS.SALES.DELETE(id), {
            method: 'DELETE'
        });
    },
    
    // CATEGORÍAS
    async getCategorias() {
        return await this.request(API_ENDPOINTS.CATEGORIES.LIST);
    },
    
    // INVENTARIO
    async getInventario() {
        return await this.request(API_ENDPOINTS.INVENTORY.LIST);
    },
    
    async updateInventario(productId, data) {
        return await this.request(API_ENDPOINTS.INVENTORY.UPDATE(productId), {
            method: 'PUT',
            body: data
        });
    }
};
