@echo off
echo ========================================
echo Redis Installation Helper for Windows
echo ========================================
echo.
echo This script will help you download and install Redis.
echo.
echo Option 1: Download Redis MSI Installer (Recommended)
echo -----------------------------------------------
echo Please download Redis from:
echo https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.msi
echo.
echo After downloading:
echo 1. Run the .msi file
echo 2. Check "Add Redis to PATH" during installation
echo 3. Complete the installation
echo 4. Redis will start automatically
echo.
echo ========================================
echo.
echo Option 2: Use Chocolatey (if installed)
echo -----------------------------------------------
echo If you have Chocolatey, run:
echo   choco install redis-64
echo.
echo ========================================
echo.
echo After installation, verify Redis is running:
echo   redis-cli ping
echo.
echo Expected output: PONG
echo.
echo ========================================
echo.
pause
