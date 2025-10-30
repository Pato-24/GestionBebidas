@echo off
echo ================================================
echo    Iniciando Sistema de Gestion de Bebidas
echo ================================================
echo.

cd /d "%~dp0"

echo Iniciando servidor backend...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Abriendo frontend en el navegador...
start "" "frontend\index.html"

echo.
echo ================================================
echo    Sistema iniciado correctamente
echo ================================================
echo.
echo Backend: http://localhost:3000
echo Frontend: Abierto en tu navegador
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
