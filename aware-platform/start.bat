@echo off
echo ================================
echo Aware Platform Starter
echo ================================
echo.

echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo ================================
echo IMPORTANT: Ollama moet draaien!
echo ================================
echo.
echo Als Ollama nog niet draait, open een nieuwe terminal en run:
echo   ollama serve
echo.
echo Als je het model nog niet hebt:
echo   ollama pull llama3.2:3b
echo.
echo Druk op een toets om de server te starten...
pause >nul
echo.

echo Starting Aware Platform...
echo.
echo Server draait op: http://localhost:3000
echo Druk op Ctrl+C om te stoppen
echo.

node src/index.js
