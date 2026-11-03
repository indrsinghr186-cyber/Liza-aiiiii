# LIZA AI - Native Android Assistant (APK Build Guide)

LIZA AI is an intelligent voice assistant and on-device automation engine built natively with Kotlin, Jetpack Compose (Material 3), Room Database, and the Gemini Live Multimodal & 2.5 REST APIs.

---

## 🛠️ Termux & CLI Build Instructions

When compiling the native Android project in **Termux** or any headless Linux/macOS/Windows environment, Gradle requires the Android SDK location to be explicitly defined. If not configured, you may encounter the following error:

```text
> SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file at 'local.properties'.
```

### Fixing the "SDK location not found" Error

You can fix this error using **either** Method 1 (`local.properties`) or Method 2 (`ANDROID_HOME` environment variable):

#### Method 1: Using `local.properties` (Recommended)

1. A template file named `local.properties.example` (and `local.properties.template`) is provided in the repository root defining the `sdk.dir` key.
2. Copy `local.properties.example` to `local.properties`:
   ```bash
   cp local.properties.example local.properties
   ```
3. Set the `sdk.dir` path pointing to your Android SDK directory:

   **For Termux (Android CLI):**
   ```properties
   sdk.dir=/data/data/com.termux/files/home/android-sdk
   ```
   *(Note: In Termux, ensure your SDK is unpacked in `$HOME/android-sdk` or wherever you placed your Android command-line tools.)*

   **For Linux:**
   ```properties
   sdk.dir=/home/user/Android/Sdk
   ```

   **For macOS:**
   ```properties
   sdk.dir=/Users/user/Library/Android/sdk
   ```

   **For Windows:**
   ```properties
   sdk.dir=C\:\\Users\\user\\AppData\\Local\\Android\\Sdk
   ```

#### Method 2: Exporting `ANDROID_HOME`

Alternatively, add the SDK path to your shell configuration (`~/.bashrc` or `~/.zshrc` in Termux):

```bash
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

Then reload your environment:
```bash
source ~/.bashrc
```

---

## 📦 Prerequisites for Building in Termux

1. **Java 17 OpenJDK** (Required for Kotlin 2.0+ and AGP 8.8+):
   ```bash
   pkg install openjdk-17
   ```
   Verify your Java version:
   ```bash
   java -version
   # Should output openjdk version "17.x.x"
   ```

2. **Android Command-Line Tools & SDK Platform 35**:
   Ensure you have installed `platforms;android-35` and `build-tools;35.0.0` via `sdkmanager`:
   ```bash
   yes | sdkmanager --licenses
   sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
   ```

---

## 🚀 Building the Debug APK

Once your SDK location is set, build the native debug APK by running:

```bash
chmod +x gradlew
./gradlew :app:assembleDebug
```

The compiled APK will be located at:
```text
app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚙️ Project Architecture & Capabilities

### 1. Java 17 & SDK Compatibility
- **Compile SDK**: `35` (Android 15)
- **Target SDK**: `35`
- **Min SDK**: `26` (Android 8.0 Oreo)
- **JVM Target Compatibility**: Java 17 (`compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }` & `kotlinOptions { jvmTarget = "17" }`).
- **Android Gradle Plugin**: `8.8.0`
- **Kotlin & Compose**: Kotlin `2.0.21` with official Kotlin Compose Compiler Plugin.
- **Optimized Dependencies**: Redundant libraries (`navigation-compose`, `okhttp-logging`, and legacy secrets plugins) have been pruned to keep APK size minimal and build times fast.

### 2. Declared Hardware & Runtime Permissions
Declared in `app/src/main/AndroidManifest.xml`:
- **Microphone & Voice**:
  - `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`
  - `FOREGROUND_SERVICE_MICROPHONE` (for continuous background listening)
  - `WAKE_LOCK` (for wake-word recognition loop)
- **Camera & Flashlight**:
  - `CAMERA`
  - Optional hardware features: `android.hardware.camera`, `android.hardware.camera.autofocus`, `android.hardware.camera.flash`
- **Networking**:
  - `INTERNET`, `ACCESS_NETWORK_STATE` (for Gemini Live WebSocket & REST API communication)
- **Screen Capture & Vision**:
  - `FOREGROUND_SERVICE_MEDIA_PROJECTION`
- **System & Automation**:
  - `POST_NOTIFICATIONS`, `VIBRATE`, `SYSTEM_ALERT_WINDOW`
  - Accessibility Service (`BIND_ACCESSIBILITY_SERVICE`) for device control

### 3. Zero-Permission Automation Fallbacks
- **WhatsApp**: Uses native accessibility nodes when enabled; falls back instantly to `Intent.ACTION_VIEW` (`api.whatsapp.com/send`) without permission dialog barriers.
- **YouTube**: Searches through accessibility service or opens direct `Intent.ACTION_SEARCH` / browser query.
- **Flashlight / Torch**: Directly controls Camera2 `CameraManager.setTorchMode`.
- **Memory Vault**: Local offline persistence via Room DB with 24-hour retention and permanent pin support.
