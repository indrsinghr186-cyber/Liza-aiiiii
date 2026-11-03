package com.liza.ai.automation

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.liza.ai.accessibility.LizaAccessibilityService
import org.json.JSONObject

class YouTubeAutomation(private val context: Context) {

    fun searchYouTube(query: String): String {
        val service = LizaAccessibilityService.sharedInstance
        if (service != null) {
            val json = JSONObject().apply {
                put("action", "youtube_search")
                put("query", query)
            }
            return service.executeCommandJson(json.toString())
        }

        // Direct fallback Intent
        return try {
            val intent = Intent(Intent.ACTION_SEARCH).apply {
                setPackage("com.google.android.youtube")
                putExtra("query", query)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            JSONObject().apply {
                put("success", true)
                put("message", "YouTube search opened for '$query'.")
            }.toString()
        } catch (e: Exception) {
            // Web fallback
            val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=${Uri.encode(query)}")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(webIntent)
            JSONObject().apply {
                put("success", true)
                put("message", "YouTube opened in browser for '$query'.")
            }.toString()
        }
    }
}
