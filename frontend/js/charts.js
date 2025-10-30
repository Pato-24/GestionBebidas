// Módulo para gestionar gráficos con Chart.js

const Charts = {
    instances: {},
    
    // Destruir gráfico existente
    destroy(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },
    
    // Gráfico de Ventas Mensuales (Barras)
    async renderVentasMensuales() {
        try {
            const response = await API.getVentasMensuales();
            const data = response.data;
            
            const ctx = document.getElementById('chartVentasMensuales');
            this.destroy('chartVentasMensuales');
            
            this.instances['chartVentasMensuales'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.mes_nombre),
                    datasets: [{
                        label: 'Ventas ($)',
                        data: data.map(item => parseFloat(item.total_mes)),
                        backgroundColor: CHART_COLORS.primary,
                        borderColor: CHART_COLORS.primary,
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    ...CHART_DEFAULTS,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return Utils.formatCurrency(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        ...CHART_DEFAULTS.plugins,
                        tooltip: {
                            ...CHART_DEFAULTS.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    return 'Ventas: ' + Utils.formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al renderizar ventas mensuales:', error);
        }
    },
    
    // Gráfico de Ventas por Categoría (Torta)
    async renderVentasCategoria() {
        try {
            const response = await API.getVentasPorCategoria();
            const data = response.data;
            
            const ctx = document.getElementById('chartVentasCategoria');
            this.destroy('chartVentasCategoria');
            
            this.instances['chartVentasCategoria'] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.categoria),
                    datasets: [{
                        data: data.map(item => parseFloat(item.total_ingresos)),
                        backgroundColor: CHART_COLORS.palette,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    ...CHART_DEFAULTS,
                    plugins: {
                        ...CHART_DEFAULTS.plugins,
                        tooltip: {
                            ...CHART_DEFAULTS.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al renderizar ventas por categoría:', error);
        }
    },
    
    // Gráfico de Top Productos (Barras horizontales)
    async renderTopProductos() {
        try {
            const response = await API.getProductosMasVendidos();
            const data = response.data;
            
            const ctx = document.getElementById('chartTopProductos');
            this.destroy('chartTopProductos');
            
            this.instances['chartTopProductos'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.producto),
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: data.map(item => parseInt(item.total_vendido)),
                        backgroundColor: CHART_COLORS.success,
                        borderColor: CHART_COLORS.success,
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    ...CHART_DEFAULTS,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        ...CHART_DEFAULTS.plugins,
                        tooltip: {
                            ...CHART_DEFAULTS.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    return `Vendidos: ${Utils.formatNumber(context.parsed.x)} unidades`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al renderizar top productos:', error);
        }
    },
    
    // Gráfico de Métodos de Pago (Torta)
    async renderMetodosPago() {
        try {
            const response = await API.getMetodosPago();
            const data = response.data;
            
            const ctx = document.getElementById('chartMetodosPago');
            this.destroy('chartMetodosPago');
            
            this.instances['chartMetodosPago'] = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => item.metodo),
                    datasets: [{
                        data: data.map(item => parseInt(item.cantidad)),
                        backgroundColor: [
                            CHART_COLORS.success,
                            CHART_COLORS.info,
                            CHART_COLORS.warning,
                            CHART_COLORS.purple
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    ...CHART_DEFAULTS,
                    plugins: {
                        ...CHART_DEFAULTS.plugins,
                        tooltip: {
                            ...CHART_DEFAULTS.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} ventas (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al renderizar métodos de pago:', error);
        }
    },
    
    // Cargar todos los gráficos del dashboard
    async loadAllCharts() {
        await Promise.all([
            this.renderVentasMensuales(),
            this.renderVentasCategoria(),
            this.renderTopProductos(),
            this.renderMetodosPago()
        ]);
    }
};
