package com.liza.ai.ai

import com.liza.ai.data.LizaEmotion

object EmotionAnalyzer {

    /**
     * Analyzes emotion based on semantic text content and input voice volume energy,
     * scaled by user's voice calibration sensitivity and emotion intensity settings.
     */
    fun analyzeEmotion(
        text: String,
        inputVolumeRms: Float = 0f,
        voiceSensitivity: Float = 1.0f,
        emotionIntensity: Float = 1.0f
    ): LizaEmotion {
        val lower = text.lowercase().trim()
        val calibratedRms = inputVolumeRms * voiceSensitivity

        // 1. Text-based semantic emotion cues
        val semanticEmotion = when {
            lower.contains("love you") || lower.contains("pyaar") || lower.contains("jaan") || lower.contains("sweet") || lower.contains("cute") -> LizaEmotion.LOVING
            lower.contains("yay") || lower.contains("party") || lower.contains("let's go") || lower.contains("maza") || lower.contains("super") || lower.contains("excited") || lower.contains("awesome") -> LizaEmotion.EXCITED
            lower.contains("wow") || lower.contains("amazing") || lower.contains("sach me") || lower.contains("really") || lower.contains("omg") || lower.contains("shocked") -> LizaEmotion.SURPRISED
            lower.contains("thinking") || lower.contains("solve") || lower.contains("calculate") || lower.contains("code") || lower.contains("socho") || lower.contains("batao") -> LizaEmotion.THINKING
            lower.contains("happy") || lower.contains("great") || lower.contains("kush") || lower.contains("badhiya") || lower.contains("mast") || lower.contains("thanks") || lower.contains("dhanyawad") -> LizaEmotion.HAPPY
            else -> null
        }

        if (semanticEmotion != null) {
            return semanticEmotion
        }

        // 2. Dynamic acoustic volume energy modulation (Paramveer's input volume)
        // Calibrated RMS threshold checks
        val highEnergyThreshold = 1200f / emotionIntensity
        val veryHighThreshold = 2200f / emotionIntensity
        val gentleThreshold = 300f * emotionIntensity

        return when {
            calibratedRms > veryHighThreshold -> LizaEmotion.EXCITED
            calibratedRms > highEnergyThreshold -> LizaEmotion.SURPRISED
            calibratedRms in 1f..gentleThreshold -> LizaEmotion.HAPPY
            else -> LizaEmotion.SPEAKING
        }
    }

    fun analyzeEmotionFromText(text: String): LizaEmotion {
        return analyzeEmotion(text)
    }
}
