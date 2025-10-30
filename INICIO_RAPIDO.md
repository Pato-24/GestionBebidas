# ⚡ INICIO RÁPIDO - Sistema de Gestión de Bebidas

## 🚀 Pasos para Ejecutar el Proyecto

### 1️⃣ Verificar Requisitos

Asegúrate de tener instalado:
- ✅ Node.js (v16+): Ejecuta `node --version`
- ✅ MySQL (8.0+): Ejecuta `mysql --version`
- ✅ Navegador web moderno (Chrome, Firefox, Edge)

### 2️⃣ Importar Base de Datos

Opción A - Desde MySQL Workbench:
1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. File > Run SQL Script
4. Selecciona: `sql/import_all.sql`
5. Ejecuta

Opción B - Desde PowerShell:
```powershell
cd "F:\PATO\Carrera de Programacion_UTN\2DO. AÑO\2do. Cuatrimestre\Introducción al Análisis de Datos\GestionBebidas_DB"
mysql -u root -p < sql\import_all.sql
```

### 3️⃣ Configurar Backend

```powershell
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia .env.example a .env y edita con tus datos:
copy .env.example .env
notepad .env

# Edita estos valores:
# DB_PASSWORD=tu_password_mysql
# (Los demás valores por defecto están bien)

# Iniciar servidor
npm start
```

Deberías ver:
```
✅ Conexión exitosa a MySQL - Base de datos: gestion_bebidas
🚀 Servidor ejecutándose en http://localhost:3000
```

### 4️⃣ Abrir Frontend

1. Abre el archivo: `frontend\index.html` en tu navegador
2. La aplicación se conectará automáticamente al backend
3. ¡Listo! Ya puedes usar el sistema

---

## 🧪 Verificar que Todo Funciona

### Probar el Backend

Abre tu navegador y visita:
```
http://localhost:3000/api/stats/resumen-general
```

Deberías ver un JSON con estadísticas.

### Probar el Frontend

1. En la página principal, verifica que:
   - ✅ Los KPIs muestran números (no ceros)
   - ✅ Los gráficos se renderizan
   - ✅ Las tablas cargan datos

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"

**Solución:**
1. Verifica que MySQL esté ejecutándose:
   ```powershell
   Get-Service MySQL*
   ```
2. Revisa las credenciales en `backend\.env`

### Error: "Port 3000 already in use"

**Solución:**
1. Cambia el puerto en `backend\.env`:
   ```
   PORT=3001
   ```
2. Actualiza en `frontend\js\config.js`:
   ```javascript
   BASE_URL: 'http://localhost:3001/api'
   ```

### Los gráficos no aparecen

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Verifica que el backend esté ejecutándose
4. Refresca la página (F5)

### No hay datos en las tablas

**Solución:**
1. Verifica que la base de datos tenga datos:
   ```sql
   USE gestion_bebidas;
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM sales;
   ```
2. Si no hay datos, vuelve a importar `sql/import_all.sql`

---

## 📂 Estructura de Archivos

```
GestionBebidas_DB/
├── backend/              ← Servidor Node.js
│   ├── config/          ← Configuración BD
│   ├── routes/          ← Endpoints API
│   ├── server.js        ← Archivo principal
│   └── .env             ← Configuración local
├── frontend/            ← Interfaz web
│   ├── index.html       ← Página principal
│   ├── css/             ← Estilos
│   └── js/              ← Lógica JavaScript
└── sql/                 ← Base de datos
    └── import_all.sql   ← Script completo
```

---

## 🎯 Funcionalidades Principales

1. **Dashboard**: KPIs + 4 gráficos interactivos
2. **Productos**: Listado, búsqueda, edición
3. **Ventas**: Registro de nuevas ventas
4. **Inventario**: Control de stock con alertas
5. **Reportes**: Análisis e interpretación de datos

---

## 📞 Ayuda Adicional

- **README completo**: Ver `README_COMPLETO.md`
- **Análisis técnico**: Ver `docs/ANALISIS_TECNICO.md`
- **Consultas SQL**: Ver `sql/schema.sql`

---

## ✅ Checklist de Entrega

Para el Trabajo Práctico, asegúrate de incluir:

- [ ] Base de datos exportada (.sql)
- [ ] Código fuente completo (backend + frontend)
- [ ] README con instrucciones
- [ ] Documento de análisis técnico (PDF o MD)
- [ ] Capturas de pantalla del sistema funcionando
- [ ] Archivo comprimido (.zip o .rar)

---

**🎓 ¡Éxitos con tu Trabajo Práctico Integrador!**
