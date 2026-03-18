SirajMobile – Generated scaffold
--------------------------------
Project features:
- Kotlin + Jetpack Compose
- Hilt DI
- Retrofit (REST)
- OkHttp WebSocket client
- MVVM skeleton (ViewModel example)

How to use:
1) Open this folder in Android Studio (File → Open → SirajMobile)
2) Let Android Studio sync Gradle and download SDKs
3) Adjust BASE URL in di/NetworkModule.kt to point to your SIRAJ backend (ngrok or localhost)
   - For WSL/emulator use: http://10.0.2.2:9090
   - For physical device use server IP or ngrok (https)
4) Run app on emulator or device.

To build from CLI (if gradle installed):
./gradlew assembleDebug

