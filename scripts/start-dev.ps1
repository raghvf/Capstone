# Smart Campus - start all services (run from project root)
# Prerequisites: MongoDB running, Python venv set up in python-face-api

Write-Host "=== Smart Campus Dev Startup ===" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
try {
    $mongo = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($mongo -and $mongo.Status -ne 'Running') {
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service MongoDB
    }
} catch {
    Write-Host "Note: Ensure MongoDB is running on mongodb://127.0.0.1:27017" -ForegroundColor Yellow
}

$root = Split-Path -Parent $PSScriptRoot

# Seed demo users
Write-Host "Seeding demo accounts..." -ForegroundColor Green
Set-Location "$root\server"
npm run seed 2>$null

Write-Host ""
Write-Host "Open 3 terminals and run:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  TERMINAL 1 - Face API (port 5000):" -ForegroundColor White
Write-Host "    cd python-face-api" -ForegroundColor Gray
Write-Host "    .\venv\Scripts\activate" -ForegroundColor Gray
Write-Host "    python recognize_api.py" -ForegroundColor Gray
Write-Host ""
Write-Host "  TERMINAL 2 - Backend (port 5001):" -ForegroundColor White
Write-Host "    cd server" -ForegroundColor Gray
Write-Host "    npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  TERMINAL 3 - Frontend (port 5173):" -ForegroundColor White
Write-Host "    cd facefrontend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Then open: http://localhost:5173/signin" -ForegroundColor Green
Write-Host "Demo login: admin@demo.com / demo123" -ForegroundColor Green

Set-Location $root
