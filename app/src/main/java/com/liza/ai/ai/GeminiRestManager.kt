package com.liza.ai.ai

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.liza.ai.data.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class GeminiRestManager(private val apiKeyProvider: () -> String) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()

    suspend fun generateContent(
        userMessage: String,
        systemPrompt: String,
        memoryContext: String = "",
        screenshotBase64: String? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (apiKey.isBlank()) {
            return@withContext Result.failure(Exception("Gemini API Key is missing. Please set it in Settings/Admin panel."))
        }

        val url = "https://generativelanguage.googleapis.com/v1beta/models/${Constants.DEFAULT_MODEL}:generateContent?key=$apiKey"

        val contents = JsonArray()
        val userContent = JsonObject().apply {
            addProperty("role", "user")
            val parts = JsonArray()
            
            // Text part
            val textPart = JsonObject().apply {
                addProperty("text", userMessage)
            }
            parts.add(textPart)

            // Optional Image part
            if (!screenshotBase64.isNullOrBlank()) {
                val inlineData = JsonObject().apply {
                    addProperty("mime_type", "image/jpeg")
                    addProperty("data", screenshotBase64)
                }
                val imagePart = JsonObject().apply {
                    add("inline_data", inlineData)
                }
                parts.add(imagePart)
            }

            add("parts", parts)
        }
        contents.add(userContent)

        val fullSystemPrompt = buildString {
            append(systemPrompt)
            if (memoryContext.isNotBlank()) {
                append("\n\n")
                append(memoryContext)
            }
        }

        val root = JsonObject().apply {
            val systemInstruction = JsonObject().apply {
                val parts = JsonArray().apply {
                    add(JsonObject().apply { addProperty("text", fullSystemPrompt) })
                }
                add("parts", parts)
            }
            add("system_instruction", systemInstruction)
            add("contents", contents)
            add("tools", ToolRegistry.getToolDeclarationsJson())
        }

        val requestBody = gson.toJson(root).toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        try {
            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("API Error ${response.code}: $body"))
            }

            val jsonRes = gson.fromJson(body, JsonObject::class.java)
            val candidates = jsonRes.getAsJsonArray("candidates")
            if (candidates != null && candidates.size() > 0) {
                val firstCandidate = candidates[0].asJsonObject
                val content = firstCandidate.getAsJsonObject("content")
                val parts = content?.getAsJsonArray("parts")
                val textBuilder = StringBuilder()
                if (parts != null) {
                    for (i in 0 until parts.size()) {
                        val part = parts[i].asJsonObject
                        if (part.has("text")) {
                            textBuilder.append(part.get("text").asString)
                        }
                    }
                }
                Result.success(textBuilder.toString())
            } else {
                Result.failure(Exception("No response text returned from Gemini API."))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
