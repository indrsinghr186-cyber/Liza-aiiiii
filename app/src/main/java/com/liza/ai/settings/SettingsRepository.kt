package com.liza.ai.settings

import android.content.Context
import android.content.SharedPreferences
import com.liza.ai.data.Constants

class SettingsRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("liza_settings_prefs", Context.MODE_PRIVATE)

    var apiKey: String
        get() = prefs.getString("gemini_api_key", "") ?: ""
        set(value) = prefs.edit().putString("gemini_api_key", value).apply()

    var wakeWord: String
        get() = prefs.getString("wake_word", "Hey Liza") ?: "Hey Liza"
        set(value) = prefs.edit().putString("wake_word", value).apply()

    var isWakeWordEnabled: Boolean
        get() = prefs.getBoolean("wake_word_enabled", true)
        set(value) = prefs.edit().putBoolean("wake_word_enabled", value).apply()

    var isBackgroundVoiceEnabled: Boolean
        get() = prefs.getBoolean("bg_voice_enabled", false)
        set(value) = prefs.edit().putBoolean("bg_voice_enabled", value).apply()

    var systemPrompt: String
        get() = prefs.getString("system_prompt", Constants.DEFAULT_SYSTEM_PROMPT) ?: Constants.DEFAULT_SYSTEM_PROMPT
        set(value) = prefs.edit().putString("system_prompt", value).apply()

    var voiceName: String
        get() = prefs.getString("voice_name", Constants.DEFAULT_VOICE_NAME) ?: Constants.DEFAULT_VOICE_NAME
        set(value) = prefs.edit().putString("voice_name", value).apply()

    var ownerName: String
        get() = prefs.getString("owner_name", Constants.OWNER_NAME) ?: Constants.OWNER_NAME
        set(value) = prefs.edit().putString("owner_name", value).apply()

    var selectedTheme: String
        get() = prefs.getString("selected_theme", "cyber_neon") ?: "cyber_neon"
        set(value) = prefs.edit().putString("selected_theme", value).apply()

    var autoReadClipboard: Boolean
        get() = prefs.getBoolean("auto_clipboard", false)
        set(value) = prefs.edit().putBoolean("auto_clipboard", value).apply()

    var voiceSensitivity: Float
        get() = prefs.getFloat("voice_sensitivity", 1.0f)
        set(value) = prefs.edit().putFloat("voice_sensitivity", value).apply()

    var emotionIntensity: Float
        get() = prefs.getFloat("emotion_intensity", 1.0f)
        set(value) = prefs.edit().putFloat("emotion_intensity", value).apply()

    var voiceCalibrationProfile: String
        get() = prefs.getString("voice_calib_profile", "BALANCED") ?: "BALANCED"
        set(value) = prefs.edit().putString("voice_calib_profile", value).apply()
}

