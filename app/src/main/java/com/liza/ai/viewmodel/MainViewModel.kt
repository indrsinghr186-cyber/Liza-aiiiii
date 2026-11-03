package com.liza.ai.viewmodel

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.liza.ai.LizaApplication
import com.liza.ai.accessibility.LizaAccessibilityService
import com.liza.ai.ai.EmotionAnalyzer
import com.liza.ai.ai.GeminiLiveClient
import com.liza.ai.ai.GeminiRestManager
import com.liza.ai.automation.WhatsAppAutomation
import com.liza.ai.automation.YouTubeAutomation
import com.liza.ai.data.ChatMessage
import com.liza.ai.data.LizaEmotion
import com.liza.ai.data.VoiceSessionState
import com.liza.ai.device.DeviceControlManager
import com.liza.ai.memory.MemoryEntity
import com.liza.ai.memory.MemoryManager
import com.liza.ai.screen.ScreenAnalysisService
import com.liza.ai.screen.ScreenCaptureManager
import com.liza.ai.settings.SettingsRepository
import com.liza.ai.voice.BackgroundVoiceService
import com.liza.ai.voice.VoiceEngine
import com.liza.ai.voice.WakeWordDetector
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val app = application as LizaApplication
    val settingsRepository: SettingsRepository = app.settingsRepository
    val memoryManager = MemoryManager(app.database.memoryDao())

    val deviceControlManager = DeviceControlManager(application)
    val whatsAppAutomation = WhatsAppAutomation(application)
    val youtubeAutomation = YouTubeAutomation(application)
    val screenCaptureManager = ScreenCaptureManager(application)
    val screenAnalysisService = ScreenAnalysisService(screenCaptureManager)

    // UI States
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                sender = "liza",
                text = "Namaste Paramveer! Mai LIZA hoon. Voice Calibration aur Live Transcribing active hain. Aapki kya madad karoon?",
                emotion = LizaEmotion.HAPPY
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Live Streaming Transcript State
    private val _liveTranscript = MutableStateFlow("")
    val liveTranscript: StateFlow<String> = _liveTranscript.asStateFlow()

    private val _liveTranscriptSpeaker = MutableStateFlow("liza") // "user" or "liza"
    val liveTranscriptSpeaker: StateFlow<String> = _liveTranscriptSpeaker.asStateFlow()

    // Voice Calibration States
    private val _voiceSensitivity = MutableStateFlow(settingsRepository.voiceSensitivity)
    val voiceSensitivity: StateFlow<Float> = _voiceSensitivity.asStateFlow()

    private val _emotionIntensity = MutableStateFlow(settingsRepository.emotionIntensity)
    val emotionIntensity: StateFlow<Float> = _emotionIntensity.asStateFlow()

    private val _activeMemories = MutableStateFlow<List<MemoryEntity>>(emptyList())
    val activeMemories: StateFlow<List<MemoryEntity>> = _activeMemories.asStateFlow()

    private val _isAccessibilityConnected = MutableStateFlow(false)
    val isAccessibilityConnected: StateFlow<Boolean> = _isAccessibilityConnected.asStateFlow()

    // Voice & AI Engines
    val voiceEngine: VoiceEngine
    private var geminiLiveClient: GeminiLiveClient? = null
    val geminiRestManager: GeminiRestManager
    private var wakeWordDetector: WakeWordDetector? = null

    // Buffer to accumulate model turn response text
    private var currentModelTurnBuffer = StringBuilder()

    init {
        geminiRestManager = GeminiRestManager { settingsRepository.apiKey }

        voiceEngine = VoiceEngine(
            context = application,
            scope = viewModelScope,
            onSendAudioChunk = { pcm ->
                geminiLiveClient?.sendRealtimeAudioChunk(pcm)
            },
            onUserInterrupted = {
                // User interrupted: finalize any partial transcript and clear
                if (currentModelTurnBuffer.isNotEmpty()) {
                    commitLizaTurnMessage(currentModelTurnBuffer.toString())
                    currentModelTurnBuffer.clear()
                }
                _liveTranscript.value = ""
            },
            onUserSpeechTranscript = { text, isFinal ->
                if (text.isNotBlank()) {
                    _liveTranscriptSpeaker.value = "user"
                    _liveTranscript.value = text
                    if (isFinal) {
                        if (geminiLiveClient?.isConnected != true) {
                            sendMessage(text)
                            _liveTranscript.value = ""
                        } else {
                            val userMsg = ChatMessage(
                                sender = "user",
                                text = text,
                                emotion = LizaEmotion.LISTENING
                            )
                            _chatMessages.value = _chatMessages.value + userMsg
                        }
                    }
                }
            }
        ).apply {
            this.voiceSensitivity = settingsRepository.voiceSensitivity
            this.emotionIntensity = settingsRepository.emotionIntensity
        }

        setupLiveClient()
        setupWakeWord()

        // Observe memories from Room DB
        viewModelScope.launch {
            memoryManager.activeMemoriesFlow.collect { list ->
                _activeMemories.value = list
            }
        }

        checkAccessibilityStatus()
    }

    private fun setupLiveClient() {
        geminiLiveClient = GeminiLiveClient(
            apiKeyProvider = { settingsRepository.apiKey },
            onAudioReceived = { pcm ->
                voiceEngine.receiveIncomingAudio(pcm)
            },
            onTextReceived = { text ->
                _liveTranscriptSpeaker.value = "liza"
                currentModelTurnBuffer.append(text)
                _liveTranscript.value = currentModelTurnBuffer.toString()

                val emotion = EmotionAnalyzer.analyzeEmotion(
                    text = currentModelTurnBuffer.toString(),
                    inputVolumeRms = voiceEngine.speakerVolumeRms.value,
                    voiceSensitivity = voiceEngine.voiceSensitivity,
                    emotionIntensity = voiceEngine.emotionIntensity
                )
                voiceEngine.setEmotion(emotion)
            },
            onTurnComplete = {
                val fullText = currentModelTurnBuffer.toString().trim()
                if (fullText.isNotBlank()) {
                    commitLizaTurnMessage(fullText)
                    currentModelTurnBuffer.clear()
                    _liveTranscript.value = ""
                }
            },
            onInterrupted = {
                val partial = currentModelTurnBuffer.toString().trim()
                if (partial.isNotBlank()) {
                    commitLizaTurnMessage("$partial [interrupted]")
                    currentModelTurnBuffer.clear()
                }
                _liveTranscript.value = ""
            },
            onSessionClosed = {
                voiceEngine.setState(VoiceSessionState.IDLE)
            }
        )
    }

    private fun commitLizaTurnMessage(text: String) {
        val emotion = EmotionAnalyzer.analyzeEmotion(
            text = text,
            inputVolumeRms = voiceEngine.speakerVolumeRms.value,
            voiceSensitivity = voiceEngine.voiceSensitivity,
            emotionIntensity = voiceEngine.emotionIntensity
        )
        val lizaMsg = ChatMessage(
            sender = "liza",
            text = text,
            emotion = emotion
        )
        _chatMessages.value = _chatMessages.value + lizaMsg
    }

    private fun setupWakeWord() {
        if (settingsRepository.isWakeWordEnabled) {
            wakeWordDetector = WakeWordDetector(getApplication()) { detected ->
                startVoiceSession()
            }
            wakeWordDetector?.startListening()
        }
    }

    fun checkAccessibilityStatus() {
        _isAccessibilityConnected.value = LizaAccessibilityService.isServiceConnected
    }

    fun startVoiceSession() {
        val prompt = settingsRepository.systemPrompt
        val voice = settingsRepository.voiceName
        currentModelTurnBuffer.clear()
        _liveTranscript.value = ""
        voiceEngine.setState(VoiceSessionState.CONNECTING)
        geminiLiveClient?.connect(prompt, voice)
        voiceEngine.startSession()
    }

    fun stopVoiceSession() {
        voiceEngine.stopSession()
        geminiLiveClient?.disconnect()
        if (currentModelTurnBuffer.isNotEmpty()) {
            commitLizaTurnMessage(currentModelTurnBuffer.toString())
            currentModelTurnBuffer.clear()
        }
        _liveTranscript.value = ""
    }

    fun interruptVoice() {
        voiceEngine.interrupt()
    }

    fun updateVoiceSensitivity(sensitivity: Float) {
        _voiceSensitivity.value = sensitivity
        settingsRepository.voiceSensitivity = sensitivity
        voiceEngine.voiceSensitivity = sensitivity
    }

    fun updateEmotionIntensity(intensity: Float) {
        _emotionIntensity.value = intensity
        settingsRepository.emotionIntensity = intensity
        voiceEngine.emotionIntensity = intensity
    }

    fun setCalibrationPreset(preset: String) {
        settingsRepository.voiceCalibrationProfile = preset
        when (preset) {
            "CALM" -> {
                updateVoiceSensitivity(0.6f)
                updateEmotionIntensity(0.7f)
            }
            "BALANCED" -> {
                updateVoiceSensitivity(1.0f)
                updateEmotionIntensity(1.0f)
            }
            "EXPRESSIVE" -> {
                updateVoiceSensitivity(1.4f)
                updateEmotionIntensity(1.5f)
            }
            "DYNAMIC" -> {
                updateVoiceSensitivity(1.8f)
                updateEmotionIntensity(1.8f)
            }
        }
    }

    fun sendMessage(userText: String) {
        val userMsg = ChatMessage(
            sender = "user",
            text = userText,
            emotion = LizaEmotion.LISTENING
        )
        _chatMessages.value = _chatMessages.value + userMsg

        viewModelScope.launch {
            // Check for natural direct automation commands
            val lower = userText.lowercase().trim()
            if (lower.contains("torch on") || lower.contains("flashlight on")) {
                deviceControlManager.setTorch(true)
                addLizaResponse("Torch on kar diya hai!")
                return@launch
            }
            if (lower.contains("torch off") || lower.contains("flashlight off")) {
                deviceControlManager.setTorch(false)
                addLizaResponse("Torch off kar diya hai.")
                return@launch
            }

            if (lower.startsWith("search youtube") || lower.startsWith("youtube pe")) {
                val query = lower.replace("search youtube", "").replace("youtube pe", "").replace("chalao", "").trim()
                youtubeAutomation.searchYouTube(query)
                addLizaResponse("YouTube par '$query' chala diya.")
                return@launch
            }

            // Normal Gemini Rest Request
            val memContext = memoryManager.getMemoryContextPrompt()
            val screenshot = if (lower.contains("screen") || lower.contains("look at this")) {
                screenAnalysisService.captureAndEncodeJpeg()
            } else null

            val result = geminiRestManager.generateContent(
                userMessage = userText,
                systemPrompt = settingsRepository.systemPrompt,
                memoryContext = memContext,
                screenshotBase64 = screenshot
            )

            result.onSuccess { reply ->
                val emotion = EmotionAnalyzer.analyzeEmotion(
                    text = reply,
                    inputVolumeRms = 400f,
                    voiceSensitivity = voiceEngine.voiceSensitivity,
                    emotionIntensity = voiceEngine.emotionIntensity
                )
                addLizaResponse(reply, emotion)
            }.onFailure { err ->
                addLizaResponse("Error: ${err.message}", LizaEmotion.HAPPY)
            }
        }
    }

    private fun addLizaResponse(text: String, emotion: LizaEmotion = LizaEmotion.HAPPY) {
        val lizaMsg = ChatMessage(
            sender = "liza",
            text = text,
            emotion = emotion
        )
        _chatMessages.value = _chatMessages.value + lizaMsg
    }

    fun addMemory(key: String, value: String, isPermanent: Boolean) {
        viewModelScope.launch {
            memoryManager.addMemory(key, value, isPermanent = isPermanent)
        }
    }

    fun deleteMemory(id: String) {
        viewModelScope.launch {
            memoryManager.deleteMemory(id)
        }
    }

    fun clearAllMemories() {
        viewModelScope.launch {
            memoryManager.clearAll()
        }
    }

    fun toggleTorch() {
        deviceControlManager.toggleTorch()
    }

    fun toggleBackgroundVoiceService(enable: Boolean) {
        val context = getApplication<Application>()
        val intent = Intent(context, BackgroundVoiceService::class.java).apply {
            action = if (enable) BackgroundVoiceService.ACTION_START else BackgroundVoiceService.ACTION_STOP
        }
        if (enable) {
            context.startForegroundService(intent)
        } else {
            context.stopService(intent)
        }
        settingsRepository.isBackgroundVoiceEnabled = enable
    }

    override fun onCleared() {
        voiceEngine.release()
        geminiLiveClient?.disconnect()
        wakeWordDetector?.stopListening()
        screenCaptureManager.stopProjection()
        super.onCleared()
    }
}
