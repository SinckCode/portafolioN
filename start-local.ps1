# Arranca el entorno local completo: MongoDB + API (4000) + Admin/Cursos (3000)
# Uso: clic derecho > Ejecutar con PowerShell, o desde terminal: .\start-local.ps1

$mongod = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
$root = $PSScriptRoot

# 1. MongoDB (si el puerto 27017 no responde, lo arranca)
$mongoUp = (Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue).TcpTestSucceeded
if (-not $mongoUp) {
    Write-Host "Arrancando MongoDB..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force "C:\data\log" | Out-Null
    Start-Process -FilePath $mongod -ArgumentList '--dbpath','C:\data\db','--port','27017','--bind_ip','127.0.0.1','--logpath','C:\data\log\mongod.log','--logappend' -WindowStyle Hidden
    Start-Sleep -Seconds 4
} else {
    Write-Host "MongoDB ya esta corriendo" -ForegroundColor Green
}

# 2. API NestJS en ventana nueva (puerto 4000)
Write-Host "Arrancando API (http://localhost:4000/docs)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\portfolio-api'; npm run start:dev"

# 3. Frontend Next.js en ventana nueva (puerto 3000)
Write-Host "Arrancando Admin/Cursos (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\portfolio-frontend'; npm run dev"

Write-Host ""
Write-Host "Listo. URLs:" -ForegroundColor Green
Write-Host "  Sitio + cursos : http://localhost:3000/cursos"
Write-Host "  Panel admin    : http://localhost:3000/admin  (admin@angelonesto.com / ChangeMe123!)"
Write-Host "  API + Swagger  : http://localhost:4000/docs"
