# Modal de Confirmación de Cierre de Sesión

## 📋 Descripción

Se ha implementado un **modal de confirmación elegante** que aparece cuando el usuario intenta cerrar sesión. Esto mejora la experiencia del usuario y previene cierres accidentales de sesión.

## ✨ Características

### Diseño Visual
- **Icono animado**: Ícono de pregunta con efecto de pulso
- **Mensajes claros**: Título principal y submensaje informativo
- **Botones diferenciados**: 
  - Botón "Cancelar" (gris) para cerrar el modal
  - Botón "Cerrar Sesión" (rojo) para confirmar el cierre

### Funcionalidad
- Al hacer clic en el botón de logout (icono de salida), se abre el modal
- El usuario puede cancelar la acción cerrando el modal
- Al confirmar, se elimina la sesión y redirige al login

## 🎨 Estilos Implementados

### CSS Personalizado
```css
.modal-confirm - Contenedor del modal (max-width: 450px)
.confirm-icon - Icono central con animación pulse
.confirm-message - Mensaje principal (18px, bold)
.confirm-submessage - Submensaje secundario (14px, gris)
.btn-danger - Botón rojo con gradiente y hover effect
```

### Animación
El icono tiene una animación de pulso (opacity 1 → 0.6 → 1) cada 2 segundos.

## 🔧 Funciones JavaScript

### `cerrarSesion()`
```javascript
// Se modificó para abrir el modal en lugar de usar confirm()
function cerrarSesion() {
    const modal = document.getElementById('modal-confirmar-logout');
    if (modal) {
        modal.classList.add('active');
    }
}
```

### `confirmarCerrarSesion()`
```javascript
// Nueva función que ejecuta el cierre real
function confirmarCerrarSesion() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}
```

## 📁 Archivos Modificados

### 1. `frontend/index.html`
- Se agregó el modal `#modal-confirmar-logout` después del modal de detalle de venta
- Estructura: header + body (icono + mensajes) + actions (botones)

### 2. `frontend/css/styles.css`
- Estilos para `.modal-confirm`, `.confirm-icon`, `.confirm-message`, `.confirm-submessage`
- Estilos para `.btn-danger` con gradiente y efectos hover
- Animación `@keyframes pulse`

### 3. `frontend/js/app.js`
- Función `cerrarSesion()` actualizada para abrir el modal
- Nueva función `confirmarCerrarSesion()` para ejecutar el logout
- Export de `confirmarCerrarSesion` al objeto global window

## 🚀 Uso

El modal se activa automáticamente cuando el usuario hace clic en el botón de logout en el header:

```html
<button class="btn-logout" onclick="cerrarSesion()">
    <i class="fas fa-sign-out-alt"></i>
</button>
```

## 🎯 Beneficios

1. **Prevención de errores**: Evita cierres accidentales de sesión
2. **Mejor UX**: Interfaz más profesional que el alert() nativo del navegador
3. **Consistencia**: Mantiene el diseño coherente con el resto de modales
4. **Información clara**: Advierte sobre pérdida de cambios no guardados
5. **Accesibilidad**: Botones claramente identificados con iconos y colores

## ✅ Estado

- [x] Modal HTML creado
- [x] Estilos CSS implementados
- [x] Funciones JavaScript actualizadas
- [x] Animación de icono agregada
- [x] Botones funcionales (Cancelar/Confirmar)
- [x] Integrado con el sistema de autenticación existente

---

**Fecha de implementación**: 7 de noviembre de 2025  
**Versión**: 1.0
