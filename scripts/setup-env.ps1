# Windows PowerShell environment setup helper
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$BackendEnv = Join-Path $Root "backend\.env"
$ExampleEnv = Join-Path $Root ".env.example"

if (-not (Test-Path $BackendEnv)) {
    Write-Host "Creating backend/.env from .env.example..." -ForegroundColor Cyan
    Copy-Item $ExampleEnv $BackendEnv
    Write-Host "backend/.env created. Remember to update secret keys." -ForegroundColor Green
} else {
    Write-Host "backend/.env already exists." -ForegroundColor Yellow
}

