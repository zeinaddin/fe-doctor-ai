# MedCare HealthAI - Mobile App Deployment Guide

This guide covers deploying the MedCare HealthAI app to Google Play Store and Apple App Store.

## Prerequisites

- Node.js 18+
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds, macOS only)
- Apple Developer Account ($99/year) for App Store
- Google Play Developer Account ($25 one-time) for Play Store

## Build the Web App

```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync to native platforms
npm run cap:sync
```

---

## Android (Google Play Store)

### 1. Generate a Signing Keystore

```bash
cd android

# Generate release keystore (save the passwords!)
keytool -genkey -v -keystore release.keystore -alias medcare -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password
# - Key password (can be same as keystore password)
# - Your name, organization, etc.
```

### 2. Configure Signing

Create `android/keystore.properties`:

```properties
storeFile=release.keystore
storePassword=your_keystore_password
keyAlias=medcare
keyPassword=your_key_password
```

**IMPORTANT:** Never commit `keystore.properties` or `release.keystore` to git!

### 3. Build Release Bundle (for Play Store)

```bash
# From the frontend directory
npm run android:release

# The AAB file will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Build Release APK (for testing)

```bash
npm run android:apk

# The APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### 5. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in app details:
   - App name: MedCare HealthAI
   - Default language: English
   - App type: App
   - Category: Medical
4. Upload the AAB file to "Production" or "Internal testing"
5. Complete the content rating questionnaire
6. Set up pricing and distribution
7. Submit for review

### Play Store Requirements

- App icons: ✅ Already generated
- Feature graphic: 1024x500 PNG (you'll need to create this)
- Screenshots: At least 2 phone screenshots
- Short description: Max 80 characters
- Full description: Max 4000 characters
- Privacy policy URL: Required for Medical apps

---

## iOS (Apple App Store)

### 1. Open in Xcode

```bash
npm run ios:open
```

### 2. Configure Signing

1. In Xcode, select the "App" project in the navigator
2. Select the "App" target
3. Go to "Signing & Capabilities"
4. Check "Automatically manage signing"
5. Select your Team (Apple Developer account)
6. Xcode will create/download provisioning profiles

### 3. Update Version Numbers

In Xcode, under "General":
- Version: 1.0.0
- Build: 1

### 4. Archive for App Store

1. Select "Any iOS Device" as the build target
2. Go to Product → Archive
3. Wait for the archive to complete
4. In the Organizer, click "Distribute App"
5. Select "App Store Connect"
6. Follow the prompts

### 5. Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app:
   - Platform: iOS
   - Name: MedCare HealthAI
   - Primary Language: English
   - Bundle ID: com.medcare.healthai
   - SKU: medcare-healthai-001
3. Fill in app information
4. Upload screenshots (required sizes):
   - 6.7" (1290×2796) - iPhone 15 Pro Max
   - 6.5" (1284×2778) - iPhone 14 Plus
   - 5.5" (1242×2208) - iPhone 8 Plus
5. Submit for review

### App Store Requirements

- App icons: ✅ Already generated (1024x1024)
- Screenshots: Required for each device size
- App description
- Privacy policy URL: Required
- Support URL
- Age rating questionnaire

---

## Version Management

### Incrementing Version for Updates

**Android** (android/app/build.gradle):
```groovy
versionCode 2      // Increment for each release
versionName "1.1.0"  // Semantic version
```

**iOS** (in Xcode):
- Version: 1.1.0
- Build: 2

---

## Environment Configuration

### Production API URL

Create `.env.production`:
```
VITE_API_URL=https://your-production-api.com
```

Update `capacitor.config.ts` for production:
```typescript
server: {
  androidScheme: 'https',
  // Remove any development server URLs
}
```

---

## Troubleshooting

### Android Build Fails

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android:build
```

### iOS Archive Fails

1. Clean build folder: Product → Clean Build Folder
2. Delete DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Try archiving again

### Capacitor Sync Issues

```bash
# Full reset
rm -rf node_modules
rm -rf ios/App/Pods
npm install
npx cap sync
cd ios/App && pod install
```

---

## Security Checklist

- [ ] Remove all console.log statements
- [ ] Disable webContentsDebuggingEnabled for Android release
- [ ] Ensure API uses HTTPS only
- [ ] Remove any hardcoded API keys
- [ ] Enable ProGuard/R8 for Android (already configured)
- [ ] Test on real devices before submission

---

## Support

For issues with:
- Capacitor: https://capacitorjs.com/docs
- Play Store: https://support.google.com/googleplay/android-developer
- App Store: https://developer.apple.com/support/
