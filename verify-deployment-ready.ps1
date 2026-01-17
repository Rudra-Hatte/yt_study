#!/usr/bin/env pwsh
# Pre-Deployment Verification Script

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  YT STUDY - Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allChecks = $true

# Check 1: Node.js installed
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " Not found!" -ForegroundColor Red
    $allChecks = $false
}

# Check 2: Git installed
Write-Host "Checking Git..." -NoNewline
try {
    $gitVersion = git --version
    Write-Host " $gitVersion" -ForegroundColor Green
} catch {
    Write-Host " Not found!" -ForegroundColor Red
    $allChecks = $false
}

# Check 3: Required files exist
Write-Host "`nChecking project structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "frontend\package.json",
    "backend\package.json",
    "ai-service\package.json",
    "frontend\vercel.json",
    "backend\Dockerfile",
    "ai-service\Dockerfile"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allChecks = $false
    }
}

# Check 4: Environment file examples
Write-Host "`nChecking environment templates..." -ForegroundColor Yellow

$envFiles = @(
    "frontend\.env.example",
    "backend\.env.example",
    "ai-service\.env.example"
)

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allChecks = $false
    }
}

# Check 5: Dependencies installed
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow

$dirs = @("frontend", "backend", "ai-service")
foreach ($dir in $dirs) {
    if (Test-Path "$dir\node_modules") {
        Write-Host "  OK: $dir dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: $dir dependencies not installed" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allChecks) {
    Write-Host "All checks passed! Ready to deploy!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Read DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor White
    Write-Host "2. Read QUICK_DEPLOY.md for commands" -ForegroundColor White
    Write-Host "3. Follow DEPLOYMENT_WORKFLOW.md for step-by-step process" -ForegroundColor White
} else {
    Write-Host "Some checks failed. Fix issues above before deploying." -ForegroundColor Red
}
Write-Host "========================================`n" -ForegroundColor Cyan

# Show deployment guides
Write-Host "Deployment Guides Available:" -ForegroundColor Cyan
Write-Host "  - DEPLOYMENT_GUIDE.md     (Complete guide)" -ForegroundColor White
Write-Host "  - QUICK_DEPLOY.md         (Quick reference)" -ForegroundColor White
Write-Host "  - DEPLOYMENT_WORKFLOW.md  (Visual workflow)" -ForegroundColor White
Write-Host ""
