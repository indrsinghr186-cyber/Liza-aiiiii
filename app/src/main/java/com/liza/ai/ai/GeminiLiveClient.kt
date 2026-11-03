package com.liza.ai.ai

import android.util.Base64
import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.liza.ai.data.Constants
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

class GeminiLiveClient(
    private val apiKeyProvider: () -> String,
    private val onAudioReceived: (ByteArray) -> Unit,
    private val onTextReceived: (String) -> Unit,
    private val onTurnComplete: () -> Unit = {},
    private val onInterrupted: () -> Unit = {},
    private val onSessionClosed: () -> Unit = {}
) {
    companion object {
        private const val TAG = "GeminiLiveClient"
        private const val LIVE_HOST = "generativelanguage.googleapis.com"
    }

    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private val gson = Gson()
    var isConnected = false
        private set

    fun connect(systemPrompt: String, voiceName: String) {
        val apiKey = apiKeyProvider()
        if (apiKey.isBlank()) {
            Log.w(TAG, "API Key is empty, skipping live WebSocket connect.")
            return
        }

        val url = "wss://$LIVE_HOST/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=$apiKey"
        val request = Request.Builder().url(url).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                Log.i(TAG, "Gemini Live WebSocket Connected.")
                sendInitialSetup(systemPrompt, voiceName)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val root = gson.fromJson(text, JsonObject::class.java)
                    if (root.has("serverContent")) {
                        val serverContent = root.getAsJsonObject("serverContent")

                        if (serverContent.has("interrupted") && serverContent.get("interrupted").asBoolean) {
                            Log.d(TAG, "Gemini Live model output was interrupted by user voice.")
                            onInterrupted()
                        }

                        if (serverContent.has("modelTurn")) {
                            val parts = serverContent.getAsJsonObject("modelTurn").getAsJsonArray("parts")
                            parts?.forEach { partElem ->
                                val part = partElem.asJsonObject
                                if (part.has("text")) {
                                    val piece = part.get("text").asString
                                    if (piece.isNotBlank()) {
                                        onTextReceived(piece)
                                    }
                                }
                                if (part.has("inlineData")) {
                                    val inlineData = part.getAsJsonObject("inlineData")
                                    val base64Data = inlineData.get("data").asString
                                    val pcmBytes = Base64.decode(base64Data, Base64.DEFAULT)
                                    onAudioReceived(pcmBytes)
                                }
                            }
                        }

                        if (serverContent.has("turnComplete") && serverContent.get("turnComplete").asBoolean) {
                            Log.d(TAG, "Gemini Live turn complete.")
                            onTurnComplete()
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing server message", e)
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "Live WebSocket failure: ${t.message}")
                isConnected = false
                onSessionClosed()
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
                onSessionClosed()
            }
        })
    }

    private fun sendInitialSetup(systemPrompt: String, voiceName: String) {
        val setup = JsonObject().apply {
            val setupObj = JsonObject().apply {
                addProperty("model", Constants.LIVE_API_MODEL)
                val genConfig = JsonObject().apply {
                    val modalities = com.google.gson.JsonArray().apply {
                        add("AUDIO")
                    }
                    add("response_modalities", modalities)

                    val speechConfig = JsonObject().apply {
                        val voiceConfig = JsonObject().apply {
                            val prebuiltVoice = JsonObject().apply {
                                addProperty("voice_name", voiceName)
                            }
                            add("prebuilt_voice_config", prebuiltVoice)
                        }
                        add("voice_config", voiceConfig)
                    }
                    add("speech_config", speechConfig)
                }
                add("generation_config", genConfig)

                val sysInstruction = JsonObject().apply {
                    val parts = com.google.gson.JsonArray().apply {
                        add(JsonObject().apply { addProperty("text", systemPrompt) })
                    }
                    add("parts", parts)
                }
                add("system_instruction", sysInstruction)
            }
            add("setup", setupObj)
        }
        val setupJson = gson.toJson(setup)
        Log.d(TAG, "Sending Live setup: $setupJson")
        webSocket?.send(setupJson)
    }

    fun sendRealtimeAudioChunk(pcmChunk: ByteArray) {
        if (!isConnected || webSocket == null) return
        val base64Pcm = Base64.encodeToString(pcmChunk, Base64.NO_WRAP)
        val realtimeInput = JsonObject().apply {
            val inputObj = JsonObject().apply {
                val mediaChunks = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        addProperty("mime_type", "audio/pcm;rate=16000")
                        addProperty("data", base64Pcm)
                    })
                }
                add("media_chunks", mediaChunks)
            }
            add("realtime_input", inputObj)
        }
        webSocket?.send(gson.toJson(realtimeInput))
    }

    fun disconnect() {
        try {
            webSocket?.close(1000, "User disconnect")
        } catch (e: Exception) {
            Log.e(TAG, "Error closing WebSocket", e)
        }
        webSocket = null
        isConnected = false
    }
}
