# Quick Development Startup Script
# Runs all three services concurrently

Write-Host "🚀 Starting YouTube Study Application..." -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (!(Test-Path "backend\.env")) {
    Write-Host "❌ backend\.env not found!" -ForegroundColor Red
    Write-Host "   Please copy backend\.env.example to backend\.env and configure your API keys" -ForegroundColor Yellow
    exit 1
}

if (!(Test-Path "ai-service\.env")) {
    Write-Host "❌ ai-service\.env not found!" -ForegroundColor Red
    Write-Host "   Please copy ai-service\.env.example to ai-service\.env and configure your API keys" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment files found" -ForegroundColor Green

# Start services in background
Write-Host ""
Write-Host "Starting Backend API server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting AI Service..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\ai-service'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "🎉 All services are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "• Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "• Backend:     http://localhost:5000" -ForegroundColor Yellow  
Write-Host "• AI Service:  http://localhost:5001" -ForegroundColor Magenta
Write-Host ""
Write-Host "Check each PowerShell window for startup messages" -ForegroundColor Gray
Write-Host "Press Ctrl+C in each window to stop the services" -ForegroundColor Gray