@echo off
REM AbsenceHub - Build Script for Windows
REM This script builds the frontend and copies it to the backend static folder

echo.
echo Building AbsenceHub for deployment...
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set FRONTEND_DIR=%SCRIPT_DIR%frontend
set BACKEND_DIR=%SCRIPT_DIR%backend
set STATIC_DIR=%BACKEND_DIR%\static

REM Step 1: Build frontend
echo Step 1: Building frontend...
cd /d "%FRONTEND_DIR%"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Build production bundle
echo Creating production build...
call npm run build

if errorlevel 1 (
    echo ERROR: Frontend build failed!
    exit /b 1
)

echo Frontend build complete
echo.

REM Step 2: Copy to backend
echo Step 2: Copying build to backend...

REM Remove old static files
if exist "%STATIC_DIR%" (
    echo Removing old static files...
    rmdir /s /q "%STATIC_DIR%"
)

REM Copy new build
echo Copying new build files...
xcopy /E /I /Y "%FRONTEND_DIR%\dist" "%STATIC_DIR%"

if errorlevel 1 (
    echo ERROR: Failed to copy build files!
    exit /b 1
)

echo Build files copied to backend\static
echo.

REM Step 3: Summary
echo Build complete!
echo.
echo You can now run the integrated application:
echo   cd backend
echo   python run.py
echo.
echo The application will be available at: http://localhost:5000
echo.

pause
