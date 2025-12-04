@echo off
REM AbsenceHub Installer Batch Script for Windows

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo AbsenceHub Installer - Windows
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo Checking Python version...
python --version

REM Run the installer
echo.
echo Running installer...
python install.py

pause
