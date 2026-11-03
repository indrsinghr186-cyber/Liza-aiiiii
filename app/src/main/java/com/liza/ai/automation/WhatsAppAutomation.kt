package com.liza.ai.automation

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.liza.ai.accessibility.LizaAccessibilityService
import org.json.JSONObject

class WhatsAppAutomation(private val context: Context) {

    fun sendWhatsAppMessage(contactName: String, messageText: String, isConfirmed: Boolean = true): String {
        val service = LizaAccessibilityService.sharedInstance
        if (service != null) {
            val json = JSONObject().apply {
                put("action", "whatsapp_send_message")
                put("contact", contactName)
                put("message", messageText)
                put("confirmed", isConfirmed)
            }
            return service.executeCommandJson(json.toString())
        }

        // Fallback intent if accessibility is off
        return try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://api.whatsapp.com/send?text=${Uri.encode(messageText)}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            JSONObject().apply {
                put("success", true)
                put("message", "WhatsApp chat opened via Intent.")
            }.toString()
        } catch (e: Exception) {
            JSONObject().apply {
                put("success", false)
                put("message", "WhatsApp not installed or failed to open: ${e.message}")
            }.toString()
        }
    }
}
