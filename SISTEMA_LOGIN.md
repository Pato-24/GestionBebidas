# 🔐 Sistema de Login Implementado - Guía Completa

## ✅ ¿Qué se ha implementado?

### 1. **Base de Datos**
- ✅ Tabla `users` creada con 3 usuarios de prueba
- ✅ Campos: username, password, full_name, role, email, active
- ✅ Roles: `admin` y `empleado`

### 2. **Backend (API)**
- ✅ Ruta `/api/auth/login` - Iniciar sesión
- ✅ Ruta `/api/auth/logout` - Cerrar sesión  
- ✅ Ruta `/api/auth/me` - Verificar sesión

### 3. **Frontend**
- ✅ Página de login (`login.html`) con diseño moderno
- ✅ Protección de `index.html` (redirige a login si no está autenticado)
- ✅ Sistema de permisos por rol
- ✅ Botón de cerrar sesión en el header

---

## 👥 Usuarios de Prueba

### 🔴 Administrador (Acceso Total)
```
Usuario: admin
Contraseña: admin123
```

### 🟢 Empleados (Acceso Limitado)
```
Usuario: vendedor1
Contraseña: empleado123

Usuario: vendedor2
Contraseña: empleado123
```

---

## 🔐 Permisos por Rol

### **ADMINISTRADOR**
✅ Dashboard completo con todas las estadísticas
✅ Crear, editar y eliminar productos
✅ Registrar y eliminar ventas
✅ Ajustar inventario
✅ Ver y generar reportes
✅ Acceso a todas las secciones

### **EMPLEADO**
✅ Dashboard básico
✅ Registrar nuevas ventas
✅ Ver productos y precios
✅ Ver stock disponible
✅ Ver notificaciones

❌ NO puede crear/editar/eliminar productos
❌ NO puede ajustar inventario
❌ NO puede ver reportes
❌ NO puede eliminar ventas

---

## 🚀 Cómo Usar el Sistema

### Paso 1: Iniciar el Servidor
Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd backend
npm run dev
```

Deberías ver:
```
✅ Conexión exitosa a MySQL - Base de datos: gestion_bebidas
🚀 Servidor ejecutándose en http://localhost:3000
```

### Paso 2: Abrir la Aplicación
1. Abre tu navegador
2. Ve a: `http://localhost:3000/login.html`
3. Ingresa las credenciales de prueba

### Paso 3: Probar los Roles

**Como Administrador:**
1. Login con `admin` / `admin123`
2. Verifica que puedes ver TODO
3. Prueba crear un producto nuevo
4. Prueba ajustar inventario

**Como Empleado:**
1. Cierra sesión (botón rojo en el header)
2. Login con `vendedor1` / `empleado123`
3. Verifica que:
   - NO ves la sección "Reportes"
   - NO ves botones de "Nuevo Producto"
   - NO ves botones de eliminar/editar
4. Prueba registrar una venta

---

## 📂 Archivos Nuevos Creados

```
GestionBebidas/
├── sql/
│   └── users.sql              # Script SQL para crear tabla usuarios
├── backend/
│   └── routes/
│       └── auth.js            # Rutas de autenticación (login/logout)
└── frontend/
    └── login.html             # Página de inicio de sesión
```

## 📝 Archivos Modificados

```
backend/
├── server.js                  # Agregada ruta de autenticación

frontend/
├── index.html                 # Protección de autenticación + botón logout
├── css/styles.css             # Estilos para botón logout
└── js/app.js                  # Sistema de permisos y roles
```

---

## 🔧 Funcionalidades Técnicas

### Autenticación
- **Almacenamiento**: LocalStorage del navegador
- **Datos guardados**: 
  - `isAuthenticated`: true/false
  - `user`: {id, username, full_name, role, email}

### Seguridad
- ⚠️ **NOTA**: Este es un sistema básico para demostración
- En producción deberías usar:
  - Contraseñas hasheadas con bcrypt
  - Tokens JWT
  - HTTPS
  - Cookies HttpOnly
  - CORS configurado

### Control de Permisos (Frontend)
- Oculta elementos según el rol
- Aplica estilos CSS dinámicamente
- Redirige si no está autenticado

---

## 🧪 Pruebas Recomendadas

### ✅ Checklist de Pruebas

- [ ] Login con usuario admin
- [ ] Ver todas las secciones como admin
- [ ] Crear un producto como admin
- [ ] Ajustar inventario como admin
- [ ] Cerrar sesión
- [ ] Login con usuario empleado
- [ ] Verificar que no ve "Reportes"
- [ ] Verificar que no puede crear productos
- [ ] Registrar una venta como empleado
- [ ] Intentar acceder a index.html sin login (debe redirigir)
- [ ] Refrescar la página (debe mantener la sesión)

---

## 🔄 Próximas Mejoras (Opcional)

1. **Seguridad**:
   - Implementar bcrypt para contraseñas
   - Agregar tokens JWT
   - Configurar sesiones del lado del servidor

2. **Funcionalidades**:
   - Recuperación de contraseña
   - Cambiar contraseña
   - Registro de nuevos usuarios (solo admin)
   - Perfil de usuario editable

3. **Roles Adicionales**:
   - Supervisor (nivel intermedio)
   - Auditor (solo lectura)

---

## ❓ Solución de Problemas

### Error: "No se puede conectar al servidor"
- Verifica que el servidor esté corriendo: `npm run dev` en la carpeta backend
- Verifica que MySQL esté corriendo en XAMPP

### Error: "Usuario o contraseña incorrectos"
- Verifica las credenciales de prueba
- Verifica que la tabla users esté creada: ejecuta `sql/users.sql`

### No redirige al login
- Limpia el localStorage del navegador (F12 > Application > LocalStorage > Clear)
- Refresca la página

### Como empleado veo todo
- Refresca la página (F5)
- Verifica que el rol en la base de datos sea 'empleado'
- Abre la consola y verifica el mensaje "🔒 Permisos de empleado aplicados"

---

## 📞 Usuarios y Contraseñas de Referencia

| Usuario | Contraseña | Rol | Nombre Completo |
|---------|-----------|-----|-----------------|
| admin | admin123 | admin | Administrador del Sistema |
| vendedor1 | empleado123 | empleado | Juan Pérez |
| vendedor2 | empleado123 | empleado | María García |

---

¡Sistema de login implementado y funcionando! 🎉
