package com.siraj.mobile.data.network

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
