# Build Android APK for 99 Idea Puzzle

## Prerequisites

1. **Node.js** (already installed)
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK 11+** - Usually comes with Android Studio

## Setup Instructions

### Step 1: Install Capacitor and Dependencies

```powershell
cd Game
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
npx cap init "99 Idea Puzzle" "com.colormerge.puzzle" --web-dir=public
```

### Step 2: Add Android Platform

```powershell
npx cap add android
```

### Step 3: Build the Game (Production Mode)

Since this is a multiplayer game, you need to decide:

**Option A: Standalone APK (with embedded server)**

```powershell
# Copy all files to android assets
npx cap sync android
```

**Option B: Client-only APK (connects to external server)**
Update `capacitor.config.json` to point to your deployed server:

```json
{
  "server": {
    "url": "https://your-server-domain.com",
    "cleartext": false
  }
}
```

### Step 4: Open in Android Studio

```powershell
npx cap open android
```

### Step 5: Build APK in Android Studio

1. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** in the notification to find your APK
4. APK location: `Game\android\app\build\outputs\apk\debug\app-debug.apk`

### Step 6: Sign APK for Release (Optional)

For production release:

1. Generate keystore:

```powershell
keytool -genkey -v -keystore release-key.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

2. In Android Studio:
   - **Build** → **Generate Signed Bundle / APK**
   - Select **APK**
   - Choose your keystore file
   - Enter passwords
   - Select **release** build variant

## Quick Build Script (After Initial Setup)

Create `build-android.bat`:

```bat
@echo off
echo Building Android APK...
call npx cap sync android
call npx cap open android
echo.
echo Build the APK in Android Studio:
echo 1. Build → Build Bundle(s) / APK(s) → Build APK(s)
echo 2. Find APK at: android\app\build\outputs\apk\debug\app-debug.apk
```

## Important Notes

### Multiplayer Considerations

⚠️ **This game requires a server connection for multiplayer mode**

You have three options:

1. **Deploy Server Separately**

   - Host the server on a cloud platform (Heroku, Railway, Render, AWS, etc.)
   - Update `capacitor.config.json` with server URL
   - APK will connect to remote server

2. **Embedded Server** (Advanced)

   - Not recommended for mobile apps
   - Server runs on phone (drains battery)
   - Only works for local testing

3. **Hybrid Approach** (Recommended)
   - Solo mode works offline
   - Multiplayer requires internet and connects to remote server
   - Best user experience

### Permissions Required

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

These are automatically added by Capacitor.

## Testing the APK

### Install on Device via USB:

```powershell
adb install Game\android\app\build\outputs\apk\debug\app-debug.apk
```

### Install on Device via File Transfer:

1. Copy APK to phone
2. Enable "Install from Unknown Sources" in Settings
3. Tap APK file to install

## Troubleshooting

### Issue: Build Fails

- Ensure Android SDK is properly installed
- Check Java JDK version (needs 11+)
- Run `npx cap doctor` to diagnose

### Issue: APK Won't Connect to Server

- Check server URL in `capacitor.config.json`
- Ensure server is accessible from internet
- Check Android network permissions

### Issue: APK Crashes

- Check Chrome DevTools via `chrome://inspect`
- Enable USB debugging on Android device
- View console logs in Android Studio Logcat

## File Size Optimization

To reduce APK size:

1. Use release build variant
2. Enable ProGuard/R8 in `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

## Distribution

### Google Play Store:

1. Build **App Bundle (.aab)** instead of APK
2. Sign with release keystore
3. Upload to Google Play Console

### Direct Distribution:

1. Build signed release APK
2. Host on your website
3. Users can download and install directly

---

**Estimated APK Size:** 5-10 MB (debug), 2-5 MB (release)
**Minimum Android Version:** Android 5.0 (API 21)
