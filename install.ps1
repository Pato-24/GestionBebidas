# Script de instalación automatizada para Windows PowerShell
# Sistema de Gestión de Bebidas - TP Integrador

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Sistema de Gestión de Bebidas - Installer   " -ForegroundColor Cyan
Write-Host "   Trabajo Práctico Integrador - UTN          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js no encontrado. Descárgalo desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar MySQL
Write-Host "🔍 Verificando MySQL..." -ForegroundColor Yellow
$mysqlVersion = mysql --version 2>$null
if ($mysqlVersion) {
    Write-Host "   ✅ MySQL instalado: $mysqlVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  MySQL no encontrado en PATH. Asegúrate de tenerlo instalado." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Paso 1: Instalar dependencias del backend   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

if (Test-Path "package.json") {
    Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ No se encontró package.json" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Paso 2: Configurar variables de entorno     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ Archivo .env creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ⚠️  IMPORTANTE: Edita backend/.env con tus credenciales de MySQL" -ForegroundColor Yellow
    Write-Host "      Especialmente la línea: DB_PASSWORD=tu_password" -ForegroundColor Yellow
} else {
    Write-Host "   ℹ️  El archivo .env ya existe" -ForegroundColor Cyan
}

Set-Location ..

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Paso 3: Importar base de datos              " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "¿Deseas importar la base de datos ahora? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host "Ingresa tu usuario de MySQL (por defecto: root):" -ForegroundColor Yellow
    $user = Read-Host
    if ([string]::IsNullOrWhiteSpace($user)) {
        $user = "root"
    }
    
    Write-Host "Ingresa tu contraseña de MySQL:" -ForegroundColor Yellow
    $password = Read-Host -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    Write-Host "📊 Importando base de datos..." -ForegroundColor Yellow
    
    if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
        Get-Content sql\import_all.sql | mysql -u $user 2>&1 | Out-Null
    } else {
        Get-Content sql\import_all.sql | mysql -u $user -p"$passwordPlain" 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Base de datos importada correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error al importar base de datos" -ForegroundColor Red
        Write-Host "   💡 Puedes hacerlo manualmente ejecutando: sql\import_all.sql" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⏭️  Saltando importación de base de datos" -ForegroundColor Cyan
    Write-Host "   💡 Recuerda importar sql\import_all.sql antes de usar el sistema" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✅ INSTALACIÓN COMPLETADA                    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣  Edita backend/.env con tu contraseña de MySQL" -ForegroundColor White
Write-Host "2️⃣  Inicia el servidor:" -ForegroundColor White
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Abre en el navegador:" -ForegroundColor White
Write-Host "    frontend\index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación completa: README_COMPLETO.md" -ForegroundColor Cyan
Write-Host "🚀 Guía rápida: INICIO_RAPIDO.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "¡Buena suerte con tu Trabajo Práctico! 🎓" -ForegroundColor Green
