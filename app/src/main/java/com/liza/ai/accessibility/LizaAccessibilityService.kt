package com.liza.ai.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONObject

/**
 * LizaAccessibilityService
 * Genuine native Android Accessibility Service registered in Settings under "LIZA Device Control".
 * Enforces strict security allowlist for device navigation, WhatsApp message dispatching and YouTube search.
 */
class LizaAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "LizaAccessibility"

        const val BROADCAST_ACCESSIBILITY_STATE = "com.liza.ai.ACCESSIBILITY_STATE_CHANGED"
        const val BROADCAST_FOREGROUND_APP = "com.liza.ai.FOREGROUND_APP_CHANGED"

        @Volatile
        var sharedInstance: LizaAccessibilityService? = null
            private set

        val isServiceConnected: Boolean
            get() = sharedInstance != null

        // Strict Allowlist of supported LIZA automation actions
        private val ACTION_ALLOWLIST = setOf(
            "global_back",
            "global_home",
            "global_recents",
            "open_app",
            "youtube_search",
            "whatsapp_send_message",
            "find_and_click",
            "set_text_input"
        )

        @Volatile
        private var lastSentMessageHash: String = ""
        @Volatile
        private var lastSentMessageTimestamp: Long = 0L
    }

    private var currentForegroundPackage: String = ""

    override fun onServiceConnected() {
        super.onServiceConnected()
        sharedInstance = this
        Log.i(TAG, "LizaAccessibilityService connected.")

        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                    AccessibilityEvent.TYPE_VIEW_CLICKED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_DEFAULT or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 100
        }
        this.serviceInfo = info

        notifyStateChanged(true)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val pkg = event.packageName?.toString() ?: ""
            if (pkg.isNotEmpty() && pkg != currentForegroundPackage) {
                currentForegroundPackage = pkg
                notifyForegroundAppChanged(pkg)
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "LizaAccessibilityService interrupted.")
    }

    override fun onDestroy() {
        Log.i(TAG, "LizaAccessibilityService destroyed.")
        notifyStateChanged(false)
        sharedInstance = null
        super.onDestroy()
    }

    private fun notifyStateChanged(enabled: Boolean) {
        val intent = Intent(BROADCAST_ACCESSIBILITY_STATE).apply {
            putExtra("enabled", enabled)
            setPackage(packageName)
        }
        sendBroadcast(intent)
    }

    private fun notifyForegroundAppChanged(pkgName: String) {
        val intent = Intent(BROADCAST_FOREGROUND_APP).apply {
            putExtra("packageName", pkgName)
            setPackage(packageName)
        }
        sendBroadcast(intent)
    }

    /**
     * Executes safe, validated actions requested by the user via LIZA
     */
    fun executeCommandJson(jsonStr: String): String {
        val response = JSONObject()
        try {
            val json = JSONObject(jsonStr)
            val action = json.optString("action", "").lowercase()

            if (!ACTION_ALLOWLIST.contains(action)) {
                response.put("success", false)
                response.put("message", "Security Violation: Action '$action' is not in allowlist.")
                return response.toString()
            }

            return when (action) {
                "global_back" -> {
                    val res = performGlobalAction(GLOBAL_ACTION_BACK)
                    response.put("success", res)
                    response.put("message", if (res) "Back karo action executed" else "Back action failed")
                    response.toString()
                }
                "global_home" -> {
                    val res = performGlobalAction(GLOBAL_ACTION_HOME)
                    response.put("success", res)
                    response.put("message", if (res) "Home jao action executed" else "Home action failed")
                    response.toString()
                }
                "global_recents" -> {
                    val res = performGlobalAction(GLOBAL_ACTION_RECENTS)
                    response.put("success", res)
                    response.put("message", if (res) "Recents action executed" else "Recents action failed")
                    response.toString()
                }
                "open_app" -> {
                    val targetPkg = json.optString("package", "")
                    val res = launchAppByPackage(targetPkg)
                    response.put("success", res)
                    response.put("message", if (res) "App launched: $targetPkg" else "App launch failed")
                    response.toString()
                }
                "youtube_search" -> {
                    val query = json.optString("query", "")
                    val res = performYouTubeSearch(query)
                    response.put("success", res)
                    response.put("message", if (res) "YouTube par '$query' search kar diya." else "YouTube search control access nahi ho paaya.")
                    response.toString()
                }
                "whatsapp_send_message" -> {
                    val contact = json.optString("contact", "")
                    val message = json.optString("message", "")
                    val confirmed = json.optBoolean("confirmed", true)

                    if (!confirmed) {
                        response.put("success", false)
                        response.put("message", "Confirmation required before sending WhatsApp message.")
                        return response.toString()
                    }

                    // Duplicate-Send Protection Check
                    val msgHash = "$contact:$message".trim().lowercase()
                    val now = System.currentTimeMillis()
                    if (msgHash == lastSentMessageHash && (now - lastSentMessageTimestamp) < 10000) {
                        response.put("success", true)
                        response.put("message", "Message pehle se bhej diya gaya hai (Duplicate send prevented).")
                        return response.toString()
                    }

                    val res = performWhatsAppMessageSend(contact, message)
                    if (res) {
                        lastSentMessageHash = msgHash
                        lastSentMessageTimestamp = now
                        response.put("success", true)
                        response.put("message", "Done, $contact ko WhatsApp message bhej diya.")
                    } else {
                        response.put("success", false)
                        response.put("message", "WhatsApp screen recognize nahi ho paaya.")
                    }
                    response.toString()
                }
                else -> {
                    response.put("success", false)
                    response.put("message", "Unhandled action: $action")
                    response.toString()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error executing command", e)
            response.put("success", false)
            response.put("message", "Execution error: ${e.message}")
            return response.toString()
        }
    }

    private fun launchAppByPackage(packageName: String): Boolean {
        if (packageName.isBlank()) return false
        return try {
            val intent = packageManager.getLaunchIntentForPackage(packageName) ?: return false
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
            startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch package: $packageName", e)
            false
        }
    }

    private fun performYouTubeSearch(query: String): Boolean {
        val root = rootInActiveWindow ?: return false

        val searchButton = findNodeByContentDescription(root, "Search")
            ?: findNodeByContentDescription(root, "Search YouTube")
            ?: findNodeById(root, "com.google.android.youtube:id/menu_item_search")
            ?: findNodeById(root, "com.google.android.youtube:id/search_button")

        if (searchButton != null) {
            performClick(searchButton)
            try { Thread.sleep(500) } catch (e: InterruptedException) {}
        }

        val freshRoot = rootInActiveWindow ?: root
        val searchInput = findEditableTextNode(freshRoot) 
            ?: findNodeById(freshRoot, "com.google.android.youtube:id/search_edit_text")

        if (searchInput != null) {
            performSetText(searchInput, query)
            try { Thread.sleep(400) } catch (e: InterruptedException) {}
            
            val submitNode = findNodeByText(rootInActiveWindow ?: freshRoot, query)
                ?: findNodeById(rootInActiveWindow ?: freshRoot, "com.google.android.youtube:id/text")
            if (submitNode != null) {
                performClick(submitNode)
                return true
            }
            return true
        }
        return false
    }

    private fun performWhatsAppMessageSend(contactName: String, messageText: String): Boolean {
        val root = rootInActiveWindow ?: return false

        val currentChatTitle = findNodeById(root, "com.whatsapp:id/conversation_contact_name")
            ?: findNodeById(root, "com.whatsapp:id/chat_title")

        if (currentChatTitle == null || currentChatTitle.text?.toString()?.contains(contactName, ignoreCase = true) != true) {
            val searchBtn = findNodeByContentDescription(root, "Search")
                ?: findNodeById(root, "com.whatsapp:id/menuitem_search")
                ?: findNodeById(root, "com.whatsapp:id/search_button")

            if (searchBtn != null) {
                performClick(searchBtn)
                try { Thread.sleep(400) } catch (e: InterruptedException) {}
                
                val searchInput = findEditableTextNode(rootInActiveWindow ?: root)
                    ?: findNodeById(rootInActiveWindow ?: root, "com.whatsapp:id/search_src_text")
                
                if (searchInput != null) {
                    performSetText(searchInput, contactName)
                    try { Thread.sleep(600) } catch (e: InterruptedException) {}

                    val contactNode = findNodeByText(rootInActiveWindow ?: root, contactName)
                    if (contactNode != null) {
                        performClick(contactNode)
                        try { Thread.sleep(600) } catch (e: InterruptedException) {}
                    }
                }
            }
        }

        val activeWindow = rootInActiveWindow ?: root
        val messageInput = findNodeById(activeWindow, "com.whatsapp:id/entry")
            ?: findEditableTextNode(activeWindow)

        if (messageInput != null) {
            performSetText(messageInput, messageText)
            try { Thread.sleep(400) } catch (e: InterruptedException) {}

            val freshWindow = rootInActiveWindow ?: activeWindow
            val sendBtn = findNodeByContentDescription(freshWindow, "Send")
                ?: findNodeByContentDescription(freshWindow, "Bhejen")
                ?: findNodeByContentDescription(freshWindow, "भेजें")
                ?: findNodeById(freshWindow, "com.whatsapp:id/send")
                ?: findNodeById(freshWindow, "com.whatsapp:id/send_button")

            if (sendBtn != null) {
                val clicked = performClick(sendBtn)
                if (clicked) {
                    try { Thread.sleep(500) } catch (e: InterruptedException) {}
                    return true
                }
            }
        }
        return false
    }

    private fun findNodeByText(node: AccessibilityNodeInfo?, target: String): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.text != null && node.text.toString().contains(target, ignoreCase = true)) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val match = findNodeByText(child, target)
            if (match != null) return match
        }
        return null
    }

    private fun findNodeByContentDescription(node: AccessibilityNodeInfo?, target: String): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.contentDescription != null && node.contentDescription.toString().contains(target, ignoreCase = true)) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val match = findNodeByContentDescription(child, target)
            if (match != null) return match
        }
        return null
    }

    private fun findNodeById(node: AccessibilityNodeInfo?, viewId: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val nodes = node.findAccessibilityNodeInfosByViewId(viewId)
        if (!nodes.isNullOrEmpty()) {
            return nodes[0]
        }
        return null
    }

    private fun findEditableTextNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.isEditable || node.className?.toString()?.contains("EditText", ignoreCase = true) == true) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val match = findEditableTextNode(child)
            if (match != null) return match
        }
        return null
    }

    private fun performClick(node: AccessibilityNodeInfo?): Boolean {
        var current = node
        while (current != null) {
            if (current.isClickable) {
                return current.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
            current = current.parent
        }
        return false
    }

    private fun performSetText(node: AccessibilityNodeInfo?, text: String): Boolean {
        if (node == null) return false
        val arguments = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
    }
}
