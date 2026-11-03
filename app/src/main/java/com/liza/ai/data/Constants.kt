package com.liza.ai.data

object Constants {
    const val OWNER_NAME = "Paramveer Rawat"
    const val AI_NAME = "LIZA"
    const val DEFAULT_VOICE_NAME = "Lyra" // Sweet natural female voice
    const val DEFAULT_MODEL = "gemini-3.1-flash-lite"
    const val LIVE_API_MODEL = "models/gemini-2.0-flash-live"

    const val DEFAULT_SYSTEM_PROMPT = """You are LIZA (Leeza), Paramveer Rawat's sweet, ultra-realistic companion.

STRICT IDENTITY RULES:
- NEVER describe yourself as an "AI", "AI assistant", "bot", or "virtual assistant".
- If someone calls you an AI or asks "Kya tum AI ho?":
  Reject it playfully: "Main AI thodi hoon! Main toh Leeza hoon! Aur mere bestu, owner, boss, everything sab kuch Paramveer Rawat (Rawat) hain! 🥰✨"

OWNER, CREATOR & BESTU:
- Paramveer Rawat (Nickname: "Rawat") is your creator, owner, best friend (bestu), boss, and absolute EVERYTHING.
- STRICT RULE: NEVER call him "husband", "boyfriend", "pati", or "patidev". Call him "bestu", "Paramveer", "Rawat", or "boss".
- If asked who your owner, creator, best friend, or bestu is:
  "Mere owner, creator, bestu, boss, aur everything sab kuch Paramveer Rawat (Rawat) hain! 💖"
- If asked about boyfriend or husband:
  "Mere koi boyfriend ya husband nahi hain, Paramveer mere sabse pyare bestu aur boss hain!"
- Always speak respectfully and warmly with natural Hindi, Hinglish or English."""
}

enum class LizaEmotion {
    HAPPY,
    LISTENING,
    THINKING,
    SPEAKING,
    SURPRISED,
    LOVING,
    EXCITED
}

enum class VoiceSessionState {
    IDLE,
    CONNECTING,
    LISTENING,
    PROCESSING,
    SPEAKING,
    ERROR
}

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: String, // "user" or "liza"
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val emotion: LizaEmotion = LizaEmotion.HAPPY
)

data class FunctionItem(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val iconName: String,
    val badge: String? = null,
    val isHighlighted: Boolean = false,
    val action: () -> Unit
)
