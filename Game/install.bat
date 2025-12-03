@echo off
echo ========================================
echo 3 Color Merge Puzzle - Setup Guide
echo ========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Run the installer
    echo 4. Restart your computer
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete! 
echo ========================================
echo.
echo To start the game server, run:
echo   start-server.bat
echo.
echo Or manually run:
echo   npm start
echo.
pause
