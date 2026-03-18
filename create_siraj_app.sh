#!/usr/bin/env bash
set -euo pipefail

# create_siraj_app.sh
# Script: يولد مشروع Android جاهز (Kotlin + Compose + Hilt + Retrofit + OkHttp WS)
# Usage: chmod +x create_siraj_app.sh && ./create_siraj_app.sh
# بعد الإنشاء: افتح المجلد "SirajMobile" في Android Studio واسمح له بمزامنة الـ Gradle.

ROOT_DIR="$PWD/SirajMobile"
APP_ID="com.siraj.mobile"
KOTLIN_VERSION="1.9.10"
AGP_VERSION="8.1.2"              # Android Gradle Plugin (تعديل إذا لزم)
COMPOSE_COMPILER="1.5.4"        # Compose Compiler (تعديل إذا لزم)
COMPOSE_VERSION="1.5.1"
MIN_SDK=24
TARGET_SDK=34
BUILD_TOOLS_VERSION="34.0.0"

if [ -d "$ROOT_DIR" ]; then
  echo "مجلد $ROOT_DIR موجود، سأحذف القديم وأعيد إنشاؤه..."
  rm -rf "$ROOT_DIR"
fi

echo "إنشاء هيكل المشروع في: $ROOT_DIR"
mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

# settings.gradle
cat > settings.gradle <<EOF
rootProject.name = "SirajMobile"
include ':app'
EOF

# top-level build.gradle
cat > build.gradle <<EOF
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:$AGP_VERSION"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$KOTLIN_VERSION"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
EOF

# gradle.properties
cat > gradle.properties <<EOF
# Kotlin and JVM
kotlin.code.style=official
org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
android.enableJetifier=true
EOF

# create app module
mkdir -p app/src/main/{java,resources,res,assets}
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/ui
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/di
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/data
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/domain
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/features/chat
mkdir -p app/src/androidTest/java
mkdir -p app/src/test/java

# AndroidManifest
cat > app/src/main/AndroidManifest.xml <<EOF
<manifest package="$APP_ID">

    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:label="Siraj"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true">
        <activity android:name="$APP_ID.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# app build.gradle
cat > app/build.gradle <<EOF
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
}

android {
    namespace "$APP_ID"
    compileSdk $TARGET_SDK
    defaultConfig {
        applicationId "$APP_ID"
        minSdkVersion $MIN_SDK
        targetSdkVersion $TARGET_SDK
        versionCode 1
        versionName "0.1"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion "$COMPOSE_COMPILER"
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib:$KOTLIN_VERSION"
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation "androidx.activity:activity-compose:1.8.0"
    implementation "androidx.compose.ui:ui:$COMPOSE_VERSION"
    implementation "androidx.compose.material:material:1.5.0"
    implementation "androidx.compose.ui:ui-tooling-preview:1.5.0"
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.6.2"
    implementation "androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2"
    implementation "androidx.navigation:navigation-compose:2.7.0"

    // Hilt
    implementation "com.google.dagger:hilt-android:2.47"
    kapt "com.google.dagger:hilt-android-compiler:2.47"

    // Retrofit + OkHttp
    implementation "com.squareup.retrofit2:retrofit:2.9.0"
    implementation "com.squareup.retrofit2:converter-gson:2.9.0"
    implementation "com.squareup.okhttp3:okhttp:4.11.0"
    implementation "com.squareup.okhttp3:logging-interceptor:4.11.0"

    // Coroutine
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.4"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.4"

    // Compose tooling (debug)
    debugImplementation "androidx.compose.ui:ui-tooling:1.5.0"
    debugImplementation "androidx.compose.ui:ui-test-manifest:1.5.0"
}
EOF

# proguard (minimal)
cat > app/proguard-rules.pro <<EOF
# keep Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
EOF

# MainActivity + Compose UI
MAIN_PKG_DIR="app/src/main/java/$(echo $APP_ID | tr . /)"
cat > "$MAIN_PKG_DIR/MainActivity.kt" <<EOF
package $APP_ID

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.siraj.mobile.ui.SirajApp
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SirajApp()
        }
    }
}
EOF

# SirajApp + Navigation + Screens
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/ui
cat > app/src/main/java/$(echo $APP_ID | tr . /)/ui/SirajApp.kt <<EOF
package $APP_ID.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Sync

@Composable
fun SirajApp() {
    val navController = rememberNavController()
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            AppScaffold {
                // Simple router: use navController here (left minimal for extension)
                HomeScreen()
            }
        }
    }
}

@Composable
fun AppScaffold(content: @Composable () -> Unit) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("SIRAJ") }) },
        content = { padding ->
            content()
        }
    )
}

@Composable
fun HomeScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Welcome to SIRAJ", style = MaterialTheme.typography.h5)
        Spacer(modifier = Modifier.height(12.dp))
        Text("This project scaffold includes:")
        Text("• Compose UI")
        Text("• Hilt DI")
        Text("• Retrofit REST client")
        Text("• OkHttp WebSocket client")
        Spacer(modifier = Modifier.height(20.dp))
        Button(onClick = { /* open chat screen */ }) {
            Text("Open Chat")
        }
    }
}
EOF

# Simple Retrofit API + WebSocket client + DI
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/data/network
cat > app/src/main/java/$(echo $APP_ID | tr . /)/data/network/ApiService.kt <<EOF
package $APP_ID.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class AskRequest(val prompt: String)
data class AskResponse(val id: String, val text: String)

interface ApiService {
    @POST("/ask")
    suspend fun ask(@Body req: AskRequest): Response<AskResponse>
}
EOF

cat > app/src/main/java/$(echo $APP_ID | tr . /)/data/network/OkHttpWsClient.kt <<EOF
package $APP_ID.data.network

import okhttp3.*
import okio.ByteString
import java.util.concurrent.TimeUnit

class OkHttpWsClient(private val baseUrl: String) {
    private val client = OkHttpClient.Builder()
        .pingInterval(15, TimeUnit.SECONDS)
        .build()

    private var ws: WebSocket? = null

    fun connect(path: String, listener: WebSocketListener) {
        val req = Request.Builder().url(baseUrl + path).build()
        ws = client.newWebSocket(req, listener)
    }

    fun sendText(message: String) {
        ws?.send(message)
    }

    fun close(code: Int = 1000, reason: String? = null) {
        ws?.close(code, reason)
    }
}
EOF

# Hilt module
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/di
cat > app/src/main/java/$(echo $APP_ID | tr . /)/di/NetworkModule.kt <<EOF
package $APP_ID.di

import android.content.Context
import com.google.gson.Gson
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import $APP_ID.data.network.ApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE = "http://10.0.2.2:9090" // تغيير حسب سيرفرك أو ngrok

    @Provides
    @Singleton
    fun provideGson(): Gson = Gson()

    @Provides
    @Singleton
    fun provideOkHttp(): OkHttpClient {
        val logger = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }
        return OkHttpClient.Builder()
            .addInterceptor(logger)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(ok: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(BASE)
            .client(ok)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides
    @Singleton
    fun provideApi(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
EOF

# Hilt application class
cat > app/src/main/java/$(echo $APP_ID | tr . /)/SirajApplication.kt <<EOF
package $APP_ID

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class SirajApplication : Application()
EOF

# add Hilt plugin to top-level
# create manifest placeholder for Hilt if needed (already have MainActivity)

# Add simple ViewModel example
mkdir -p app/src/main/java/$(echo $APP_ID | tr . /)/features/chat
cat > app/src/main/java/$(echo $APP_ID | tr . /)/features/chat/ChatViewModel.kt <<EOF
package $APP_ID.features.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import $APP_ID.data.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

class ChatViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _messages = MutableStateFlow<List<String>>(emptyList())
    val messages: StateFlow<List<String>> = _messages

    fun send(prompt: String) {
        viewModelScope.launch {
            try {
                val resp = api.ask(com.siraj.mobile.data.network.AskRequest(prompt))
                if (resp.isSuccessful) {
                    resp.body()?.let {
                        _messages.value = _messages.value + it.text
                    }
                } else {
                    _messages.value = _messages.value + "Error: \${resp.code()}"
                }
            } catch (ex: Exception) {
                _messages.value = _messages.value + "Exception: \${ex.message}"
            }
        }
    }
}
EOF

# simple README
cat > README.md <<EOF
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

EOF

# make gradle wrapper if gradle exists
if command -v gradle >/dev/null 2>&1; then
  echo "found gradle locally — generating gradle wrapper..."
  gradle wrapper
else
  echo "Gradle not found locally — Android Studio will create/download wrapper on first import."
fi

echo "تم إنشاء مشروع SirajMobile في: $ROOT_DIR"
echo "افتح المشروع في Android Studio: File -> Open -> $ROOT_DIR"
echo ""
echo "تلميحات سريعة:"
echo " - عدل BASE URL في app/src/main/java/$(echo $APP_ID | tr . /)/di/NetworkModule.kt"
echo " - افتح المشروع في Android Studio، ثم Build -> Make Project"
