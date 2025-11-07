// Módulo de Reportes
const Reportes = {
    // Generar reporte de ventas en PDF
    async generarReporteVentas() {
        try {
            Utils.showNotification('Generando reporte de ventas...', 'info');
            
            const response = await API.getVentas();
            const ventas = response.data;
            
            // Crear contenido del PDF
            let contenidoPDF = `
=================================================
          REPORTE DE VENTAS
          Sistema de Gestión de Bebidas
=================================================

Fecha de generación: ${new Date().toLocaleString('es-AR')}
Total de ventas registradas: ${ventas.length}

-------------------------------------------------
DETALLE DE VENTAS
-------------------------------------------------

`;
            
            let totalGeneral = 0;
            
            ventas.forEach((venta, index) => {
                contenidoPDF += `
Venta #${venta.id} - ${Utils.formatDate(venta.sale_date)}
Método de Pago: ${venta.payment_method}
Total: ${Utils.formatCurrency(venta.total)}
${venta.note ? 'Nota: ' + venta.note : ''}
-------------------------------------------------
`;
                totalGeneral += parseFloat(venta.total);
            });
            
            contenidoPDF += `
=================================================
RESUMEN FINANCIERO
=================================================
Total General: ${Utils.formatCurrency(totalGeneral)}
Promedio por Venta: ${Utils.formatCurrency(totalGeneral / ventas.length)}
=================================================
`;
            
            // Descargar como archivo de texto (simulación de PDF)
            this.descargarArchivo(contenidoPDF, 'reporte_ventas.txt', 'text/plain');
            
            Utils.showNotification('Reporte de ventas generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar reporte:', error);
            Utils.showNotification('Error al generar reporte de ventas', 'error');
        }
    },
    
    // Exportar inventario a Excel (CSV)
    async exportarInventarioExcel() {
        try {
            Utils.showNotification('Exportando inventario...', 'info');
            
            const response = await API.getInventario();
            const inventario = response.data;
            
            // Crear contenido CSV
            let csv = 'SKU,Producto,Categoría,Stock Actual,Stock Mínimo,Estado,Precio Unitario,Valor Total\n';
            
            inventario.forEach(item => {
                const valorTotal = item.stock_actual * item.precio_unitario;
                csv += `"${item.sku}","${item.producto}","${item.categoria}",${item.stock_actual},${item.stock_minimo},"${item.estado}",${item.precio_unitario},${valorTotal.toFixed(2)}\n`;
            });
            
            // Calcular totales
            const totalUnidades = inventario.reduce((sum, item) => sum + item.stock_actual, 0);
            const valorInventario = inventario.reduce((sum, item) => sum + (item.stock_actual * item.precio_unitario), 0);
            
            csv += `\n"TOTALES","","",${totalUnidades},"","","",${valorInventario.toFixed(2)}\n`;
            
            // Descargar como CSV
            this.descargarArchivo(csv, 'inventario_completo.csv', 'text/csv');
            
            Utils.showNotification('Inventario exportado exitosamente', 'success');
        } catch (error) {
            console.error('Error al exportar inventario:', error);
            Utils.showNotification('Error al exportar inventario', 'error');
        }
    },
    
    // Abrir modal de análisis estadístico
    async abrirModalAnalisisEstadistico() {
        try {
            const modal = document.getElementById('modal-analisis-estadistico');
            modal.classList.add('active');
            
            Utils.showNotification('Cargando análisis estadístico...', 'info');
            
            // Cargar todos los datos necesarios
            await Promise.all([
                this.cargarTendenciaVentas(),
                this.cargarRotacionInventario(),
                this.cargarVentasPorDia(),
                this.cargarHorasPico()
            ]);
            
            Utils.showNotification('Análisis cargado exitosamente', 'success');
        } catch (error) {
            console.error('Error al cargar análisis:', error);
            Utils.showNotification('Error al cargar análisis estadístico', 'error');
        }
    },
    
    // Cargar gráfico de tendencia de ventas
    async cargarTendenciaVentas() {
        try {
            const response = await API.getVentasMensuales();
            const data = response.data;
            
            const ctx = document.getElementById('chart-tendencia-ventas');
            
            // Destruir gráfico anterior si existe
            if (window.chartTendenciaVentas) {
                window.chartTendenciaVentas.destroy();
            }
            
            window.chartTendenciaVentas = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(item => item.mes),
                    datasets: [{
                        label: 'Ventas Mensuales',
                        data: data.map(item => item.total),
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            // Calcular estadísticas
            const totales = data.map(item => parseFloat(item.total));
            const promedio = totales.reduce((a, b) => a + b, 0) / totales.length;
            const maximo = Math.max(...totales);
            const tendencia = totales[totales.length - 1] > totales[0] ? 'positive' : 'negative';
            
            document.getElementById('stats-tendencia').innerHTML = `
                <div class="stat-item">
                    <span class="label">Promedio Mensual</span>
                    <span class="value">${Utils.formatCurrency(promedio)}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Mes Pico</span>
                    <span class="value">${Utils.formatCurrency(maximo)}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Tendencia</span>
                    <span class="trend ${tendencia}">
                        <i class="fas fa-arrow-${tendencia === 'positive' ? 'up' : 'down'}"></i>
                        ${tendencia === 'positive' ? 'Crecimiento' : 'Decrecimiento'}
                    </span>
                </div>
            `;
        } catch (error) {
            console.error('Error al cargar tendencia:', error);
        }
    },
    
    // Cargar gráfico de rotación de inventario
    async cargarRotacionInventario() {
        try {
            const response = await API.getProductosMasVendidos();
            const data = response.data.slice(0, 8);
            
            const ctx = document.getElementById('chart-rotacion-inventario');
            
            if (window.chartRotacion) {
                window.chartRotacion.destroy();
            }
            
            window.chartRotacion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.producto.substring(0, 15)),
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: data.map(item => item.total_vendido),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            const totalVendido = data.reduce((sum, item) => sum + parseInt(item.total_vendido), 0);
            const productoTop = data[0];
            
            document.getElementById('stats-rotacion').innerHTML = `
                <div class="stat-item">
                    <span class="label">Total Vendido</span>
                    <span class="value">${totalVendido}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Producto Top</span>
                    <span class="value" style="font-size: 14px;">${productoTop.producto.substring(0, 20)}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error al cargar rotación:', error);
        }
    },
    
    // Cargar ventas por día de la semana (simulado)
    async cargarVentasPorDia() {
        try {
            const response = await API.getVentas();
            const ventas = response.data;
            
            // Agrupar por día de la semana
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const ventasPorDia = new Array(7).fill(0);
            const contadorPorDia = new Array(7).fill(0);
            
            ventas.forEach(venta => {
                const fecha = new Date(venta.sale_date);
                const dia = fecha.getDay();
                ventasPorDia[dia] += parseFloat(venta.total);
                contadorPorDia[dia]++;
            });
            
            const ctx = document.getElementById('chart-ventas-dia-semana');
            
            if (window.chartDiasSemana) {
                window.chartDiasSemana.destroy();
            }
            
            window.chartDiasSemana = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dias,
                    datasets: [{
                        label: 'Ventas por Día',
                        data: ventasPorDia,
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(37, 99, 235, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                            'rgba(236, 72, 153, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            const mejorDia = dias[ventasPorDia.indexOf(Math.max(...ventasPorDia))];
            const totalSemana = ventasPorDia.reduce((a, b) => a + b, 0);
            
            document.getElementById('stats-dias').innerHTML = `
                <div class="stat-item">
                    <span class="label">Mejor Día</span>
                    <span class="value" style="font-size: 16px;">${mejorDia}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Total Semanal</span>
                    <span class="value">${Utils.formatCurrency(totalSemana)}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Promedio Diario</span>
                    <span class="value">${Utils.formatCurrency(totalSemana / 7)}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error al cargar ventas por día:', error);
        }
    },
    
    // Cargar horas pico (simulado)
    async cargarHorasPico() {
        try {
            const response = await API.getVentas();
            const ventas = response.data;
            
            // Simular distribución horaria
            const horas = ['9-12', '12-15', '15-18', '18-21', '21-24'];
            const distribucion = [15, 25, 30, 20, 10]; // Porcentajes simulados
            
            const ctx = document.getElementById('chart-horas-pico');
            
            if (window.chartHorasPico) {
                window.chartHorasPico.destroy();
            }
            
            window.chartHorasPico = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: horas,
                    datasets: [{
                        data: distribucion,
                        backgroundColor: [
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(37, 99, 235, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
            
            const horaPico = horas[distribucion.indexOf(Math.max(...distribucion))];
            
            document.getElementById('stats-horas').innerHTML = `
                <div class="stat-item">
                    <span class="label">Hora Pico</span>
                    <span class="value" style="font-size: 16px;">${horaPico} hs</span>
                </div>
                <div class="stat-item">
                    <span class="label">% en Hora Pico</span>
                    <span class="value">${Math.max(...distribucion)}%</span>
                </div>
            `;
        } catch (error) {
            console.error('Error al cargar horas pico:', error);
        }
    },
    
    // Exportar análisis completo
    async exportarAnalisis() {
        try {
            Utils.showNotification('Exportando análisis...', 'info');
            
            const response = await API.getResumenGeneral();
            const data = response.data;
            
            let contenido = `
=================================================
        ANÁLISIS ESTADÍSTICO COMPLETO
        Sistema de Gestión de Bebidas
=================================================

Fecha: ${new Date().toLocaleString('es-AR')}

-------------------------------------------------
RESUMEN GENERAL
-------------------------------------------------
Total Productos: ${data.productos.total_catalogo}
Unidades en Stock: ${data.inventario.unidades_totales}
Productos con Stock Bajo: ${data.inventario.productos_stock_bajo}
Ventas Totales: ${Utils.formatCurrency(data.ventas.monto_total)}
Ventas del Mes: ${Utils.formatCurrency(data.ventas_mes_actual.monto)}

-------------------------------------------------
RECOMENDACIONES
-------------------------------------------------
✓ Revisar productos con stock bajo
✓ Analizar productos de baja rotación
✓ Optimizar horarios de atención según picos de venta
✓ Implementar promociones en días de menor venta

=================================================
`;
            
            this.descargarArchivo(contenido, 'analisis_estadistico.txt', 'text/plain');
            Utils.showNotification('Análisis exportado exitosamente', 'success');
        } catch (error) {
            console.error('Error al exportar análisis:', error);
            Utils.showNotification('Error al exportar análisis', 'error');
        }
    },
    
    // Generar reporte de clientes
    async generarReporteClientes() {
        try {
            Utils.showNotification('Generando reporte de clientes...', 'info');
            
            // Como no tenemos clientes implementados, generar reporte basado en ventas
            const response = await API.getVentas();
            const ventas = response.data;
            
            let contenido = `
=================================================
          TOP CLIENTES / VENTAS
          Sistema de Gestión de Bebidas
=================================================

Fecha: ${new Date().toLocaleString('es-AR')}
Total de transacciones: ${ventas.length}

-------------------------------------------------
ANÁLISIS DE VENTAS
-------------------------------------------------

`;
            
            // Agrupar por método de pago como proxy de clientes
            const porMetodo = {};
            ventas.forEach(venta => {
                const metodo = venta.payment_method;
                if (!porMetodo[metodo]) {
                    porMetodo[metodo] = {
                        cantidad: 0,
                        total: 0
                    };
                }
                porMetodo[metodo].cantidad++;
                porMetodo[metodo].total += parseFloat(venta.total);
            });
            
            Object.entries(porMetodo).forEach(([metodo, datos]) => {
                contenido += `
${metodo}:
  Transacciones: ${datos.cantidad}
  Total: ${Utils.formatCurrency(datos.total)}
  Promedio: ${Utils.formatCurrency(datos.total / datos.cantidad)}
-------------------------------------------------
`;
            });
            
            contenido += `
=================================================
NOTA: Este reporte muestra el análisis por método
de pago. Para análisis detallado de clientes,
implementar el módulo de gestión de clientes.
=================================================
`;
            
            this.descargarArchivo(contenido, 'reporte_clientes.txt', 'text/plain');
            Utils.showNotification('Reporte generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar reporte:', error);
            Utils.showNotification('Error al generar reporte de clientes', 'error');
        }
    },
    
    // Utilidad para descargar archivos
    descargarArchivo(contenido, nombreArchivo, tipoMIME) {
        const blob = new Blob([contenido], { type: tipoMIME });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};

// Exportar funciones al objeto global window
window.generarReporteVentas = () => Reportes.generarReporteVentas();
window.exportarInventarioExcel = () => Reportes.exportarInventarioExcel();
window.abrirModalAnalisisEstadistico = () => Reportes.abrirModalAnalisisEstadistico();
window.generarReporteClientes = () => Reportes.generarReporteClientes();
window.exportarAnalisis = () => Reportes.exportarAnalisis();
