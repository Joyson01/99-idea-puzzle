# 🚀 Quick APK Build Guide

## Fastest Way to Build APK

### Prerequisites (One-Time Setup)

1. Install **Android Studio**: https://developer.android.com/studio
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (optional, for testing)

### Build APK (Simple Steps)

#### Method 1: Automated Script

```powershell
cd Game
.\build-android.bat
```

This will:

- Install Capacitor dependencies
- Setup Android platform
- Open Android Studio automatically

Then in Android Studio:

1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait 2-5 minutes for build to complete
3. Click **locate** to find your APK
4. APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

#### Method 2: Manual Commands

```powershell
cd Game

# Install dependencies (first time only)
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev

# Initialize Capacitor (first time only)
npx cap init "99 Idea Puzzle" "com.colormerge.puzzle" --web-dir=public

# Add Android platform (first time only)
npx cap add android

# Sync files (every time you make changes)
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Install APK on Your Phone

### Option 1: USB Cable

1. Enable **Developer Options** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect phone to computer via USB
4. Run in PowerShell:

```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: File Transfer

1. Copy `app-debug.apk` to your phone (via USB, Bluetooth, or cloud)
2. On phone, go to Settings → Security
3. Enable **Install Unknown Apps** for your file manager
4. Tap the APK file on your phone to install

## Important Notes

### ⚠️ Multiplayer Requires Server

**The APK alone won't work for multiplayer!** You need:

1. **Deploy the server** to a hosting platform:

   - **Render** (Free): https://render.com
   - **Railway** (Free tier): https://railway.app
   - **Heroku** (Paid): https://heroku.com
   - **Your own VPS**

2. **Update server URL** in `capacitor.config.json`:

```json
{
  "server": {
    "url": "https://your-deployed-server.com",
    "cleartext": false
  }
}
```

3. **Rebuild APK** after changing config:

```powershell
npx cap sync android
npx cap open android
# Build APK again in Android Studio
```

### 📱 Solo Mode Works Offline

The single-player mode works without a server!

## Expected APK Size

- **Debug APK**: ~8-12 MB
- **Release APK**: ~3-6 MB (optimized)

## Troubleshooting

### "Command not found: npx"

Install Node.js first: https://nodejs.org/

### "Android SDK not found"

Install Android Studio and run it once to download SDK

### "Build Failed" in Android Studio

1. Click **File** → **Sync Project with Gradle Files**
2. Wait for sync to complete
3. Try building again

### APK Won't Install on Phone

- Enable "Install Unknown Apps" in Settings
- Make sure you're using `app-debug.apk` (not app-release-unsigned.apk)

### Game Loads But Multiplayer Doesn't Work

- Check if server is running and accessible
- Verify server URL in `capacitor.config.json`
- Check phone's internet connection

## Next Steps After Building

1. **Test the APK** on your device
2. **Deploy server** to cloud platform
3. **Update config** with server URL
4. **Rebuild APK** with server connection
5. **Share APK** with friends to test multiplayer!

## For Production Release

When ready to publish to Google Play:

```powershell
# Generate release keystore (one time)
keytool -genkey -v -keystore release-key.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000

# In Android Studio:
# Build → Generate Signed Bundle / APK → Android App Bundle
# Upload the .aab file to Google Play Console
```

---

**Need Help?** Check `build-apk.md` for detailed documentation.
