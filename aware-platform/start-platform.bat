@echo off
REM Aware™ Platform - Startup Script (Batch wrapper for PowerShell)
REM This launches the PowerShell startup script

powershell -ExecutionPolicy Bypass -File "%~dp0start-platform.ps1"
pause
