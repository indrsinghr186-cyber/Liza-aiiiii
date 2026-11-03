package com.liza.ai.ai

import com.google.gson.JsonArray
import com.google.gson.JsonObject

object ToolRegistry {

    fun getToolDeclarationsJson(): JsonArray {
        val tools = JsonArray()
        val functionDeclarations = JsonArray()

        // 1. WhatsApp Send Message
        val sendWhatsApp = JsonObject().apply {
            addProperty("name", "send_whatsapp_message")
            addProperty("description", "Sends a WhatsApp message to a specified contact after user confirmation.")
            val parameters = JsonObject().apply {
                addProperty("type", "OBJECT")
                val properties = JsonObject().apply {
                    add("contact", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "Name of the WhatsApp contact (e.g., 'Rahul', 'Mom')")
                    })
                    add("message", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "The message content to send")
                    })
                }
                add("properties", properties)
                val required = JsonArray().apply {
                    add("contact")
                    add("message")
                }
                add("required", required)
            }
            add("parameters", parameters)
        }
        functionDeclarations.add(sendWhatsApp)

        // 2. YouTube Search
        val youtubeSearch = JsonObject().apply {
            addProperty("name", "search_youtube")
            addProperty("description", "Searches and plays videos on YouTube.")
            val parameters = JsonObject().apply {
                addProperty("type", "OBJECT")
                val properties = JsonObject().apply {
                    add("query", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "Search query for YouTube")
                    })
                }
                add("properties", properties)
                val required = JsonArray().apply {
                    add("query")
                }
                add("required", required)
            }
            add("parameters", parameters)
        }
        functionDeclarations.add(youtubeSearch)

        // 3. Device Navigation (Back, Home, Recents)
        val deviceNav = JsonObject().apply {
            addProperty("name", "perform_device_navigation")
            addProperty("description", "Executes global system navigation actions: 'back', 'home', or 'recents'.")
            val parameters = JsonObject().apply {
                addProperty("type", "OBJECT")
                val properties = JsonObject().apply {
                    add("action", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "One of 'back', 'home', 'recents'")
                    })
                }
                add("properties", properties)
                val required = JsonArray().apply {
                    add("action")
                }
                add("required", required)
            }
            add("parameters", parameters)
        }
        functionDeclarations.add(deviceNav)

        // 4. Save To Memory Vault
        val saveMemory = JsonObject().apply {
            addProperty("name", "save_to_memory")
            addProperty("description", "Saves an important fact, preference or snippet to LIZA's 24-hour or permanent memory vault.")
            val parameters = JsonObject().apply {
                addProperty("type", "OBJECT")
                val properties = JsonObject().apply {
                    add("key", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "Short identifier or subject")
                    })
                    add("value", JsonObject().apply {
                        addProperty("type", "STRING")
                        addProperty("description", "Fact or note details")
                    })
                    add("is_permanent", JsonObject().apply {
                        addProperty("type", "BOOLEAN")
                        addProperty("description", "True if permanent, false for 24-hour memory")
                    })
                }
                add("properties", properties)
                val required = JsonArray().apply {
                    add("key")
                    add("value")
                }
                add("required", required)
            }
            add("parameters", parameters)
        }
        functionDeclarations.add(saveMemory)

        val toolWrapper = JsonObject().apply {
            add("function_declarations", functionDeclarations)
        }
        tools.add(toolWrapper)
        return tools
    }
}
