package com.siraj.mobile.ui

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
