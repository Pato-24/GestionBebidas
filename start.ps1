# Script para iniciar el sistema completo
# Sistema de Gestión de Bebidas

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Iniciando Sistema de Gestión de Bebidas     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Obtener la ruta del proyecto
$projectPath = $PSScriptRoot

# Iniciar el backend en una nueva ventana de PowerShell
Write-Host "Iniciando servidor backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\backend'; Write-Host 'Backend Server Iniciado' -ForegroundColor Green; npm start"

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# Abrir el frontend en el navegador
Write-Host "Abriendo frontend en el navegador..." -ForegroundColor Yellow
Start-Process "$projectPath\frontend\index.html"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ✅ Sistema iniciado correctamente            " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: Abierto en tu navegador" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener el backend, cierra la ventana de PowerShell que se abrio" -ForegroundColor Yellow
Write-Host ""
