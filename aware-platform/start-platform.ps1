# Aware Platform - Complete Startup Script
# This script starts the blockchain node, deploys the contract, and starts the server

Write-Host "Starting Aware Platform..." -ForegroundColor Cyan
Write-Host ""

# Set location to the platform directory
Set-Location $PSScriptRoot

# Step 1: Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Clean up old deployment
if (Test-Path "deployment.json") {
    Write-Host "Removing old deployment..." -ForegroundColor Yellow
    Remove-Item "deployment.json" -Force
}

# Step 3: Start Hardhat blockchain node in a new window
Write-Host "Starting Hardhat blockchain node..." -ForegroundColor Green
$nodeCommand = "cd '$PSScriptRoot'; Write-Host 'Hardhat Blockchain Node' -ForegroundColor Cyan; npx hardhat node"
$nodeProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $nodeCommand -PassThru -WindowStyle Normal

# Step 4: Wait for blockchain to be ready
Write-Host "Waiting for blockchain node to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxAttempts = 20
$attempt = 0
$nodeReady = $false

while (-not $nodeReady -and $attempt -lt $maxAttempts) {
    try {
        $attempt++
        $jsonBody = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body $jsonBody -ContentType "application/json" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $nodeReady = $true
            Write-Host "Blockchain node is ready!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   Attempt $attempt/$maxAttempts - waiting..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $nodeReady) {
    Write-Host "Blockchain node failed to start" -ForegroundColor Red
    Write-Host "   Please check the blockchain window for errors" -ForegroundColor Yellow
    exit 1
}

# Step 5: Deploy smart contract
Write-Host ""
Write-Host "Deploying SupplyChain smart contract..." -ForegroundColor Green
npm run blockchain:deploy 2>$null

# Verify deployment.json was created (more important than exit code)
if (-not (Test-Path "deployment.json")) {
    Write-Host "deployment.json was not created" -ForegroundColor Red
    Write-Host "   Deployment may have failed - check the blockchain window" -ForegroundColor Yellow
    exit 1
}

$deployment = Get-Content "deployment.json" | ConvertFrom-Json
Write-Host "Contract deployed at: $($deployment.contractAddress)" -ForegroundColor Green

# Step 6: Start the Express server
Write-Host ""
Write-Host "Starting Express server..." -ForegroundColor Green
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Aware Platform is ready!" -ForegroundColor Cyan
Write-Host "  " -ForegroundColor Cyan
Write-Host "  Web Interface: http://localhost:3000" -ForegroundColor White
Write-Host "  Blockchain: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "  Contract: $($deployment.contractAddress)" -ForegroundColor White
Write-Host "  " -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "  (The blockchain window will remain open)" -ForegroundColor Gray
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
node src/index.js

# Cleanup when server stops
Write-Host ""
Write-Host "Server stopped" -ForegroundColor Yellow
Write-Host "   The blockchain node is still running in the other window" -ForegroundColor Gray
Write-Host "   Close that window manually if you want to stop the blockchain" -ForegroundColor Gray
