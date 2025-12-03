@echo off
echo ========================================
echo 99 Idea Puzzle - Android APK Builder
echo ========================================
echo.

REM Check if Capacitor is installed
if not exist "node_modules\@capacitor\core" (
    echo [1/4] Installing Capacitor dependencies...
    call npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
    echo.
    
    echo [2/4] Initializing Capacitor...
    call npx cap init "99 Idea Puzzle" "com.colormerge.puzzle" --web-dir=public
    echo.
    
    echo [3/4] Adding Android platform...
    call npx cap add android
    echo.
) else (
    echo Capacitor already installed, skipping setup...
    echo.
)

echo [4/4] Syncing web assets to Android...
call npx cap sync android
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Opening Android Studio...
echo 2. In Android Studio, click: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo 3. Find your APK at: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo NOTE: For multiplayer to work, the server must be running and accessible!
echo Configure server URL in capacitor.config.json
echo.

call npx cap open android

echo.
echo Press any key to exit...
pause >nul
