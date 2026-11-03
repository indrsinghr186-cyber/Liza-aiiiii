package com.liza.ai.voice

import android.content.Context
import com.liza.ai.ai.EmotionAnalyzer
import com.liza.ai.data.LizaEmotion
import com.liza.ai.data.VoiceSessionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class VoiceEngine(
    private val context: Context,
    private val scope: CoroutineScope,
    private val onSendAudioChunk: (ByteArray) -> Unit,
    private val onUserInterrupted: () -> Unit = {},
    private val onUserSpeechTranscript: (String, Boolean) -> Unit = { _, _ -> }
) {
    private val _sessionState = MutableStateFlow(VoiceSessionState.IDLE)
    val sessionState: StateFlow<VoiceSessionState> = _sessionState.asStateFlow()

    private val _currentEmotion = MutableStateFlow(LizaEmotion.HAPPY)
    val currentEmotion: StateFlow<LizaEmotion> = _currentEmotion.asStateFlow()

    private val _micVolumeRms = MutableStateFlow(0f)
    val micVolumeRms: StateFlow<Float> = _micVolumeRms.asStateFlow()

    private val _speakerVolumeRms = MutableStateFlow(0f)
    val speakerVolumeRms: StateFlow<Float> = _speakerVolumeRms.asStateFlow()

    // Voice calibration settings
    var voiceSensitivity: Float = 1.0f
    var emotionIntensity: Float = 1.0f

    private var audioRecordManager: AudioRecordManager? = null
    private var audioTrackPlayer: AudioTrackPlayer? = null
    private var liveSpeechRecognizer: LiveSpeechRecognizer? = null

    init {
        audioTrackPlayer = AudioTrackPlayer(
            onPlaybackStateChanged = { isPlaying ->
                if (isPlaying) {
                    _sessionState.value = VoiceSessionState.SPEAKING
                    _currentEmotion.value = LizaEmotion.SPEAKING
                    liveSpeechRecognizer?.stopListening()
                } else if (_sessionState.value == VoiceSessionState.SPEAKING) {
                    _sessionState.value = VoiceSessionState.LISTENING
                    _currentEmotion.value = LizaEmotion.LISTENING
                    startUserSpeechRecognition()
                }
            },
            onVolumeRms = { rms ->
                _speakerVolumeRms.value = rms
            }
        )

        audioRecordManager = AudioRecordManager(
            onAudioChunk = { chunk ->
                if (audioTrackPlayer?.isPlaying == true) {
                    audioTrackPlayer?.stopAndFlush()
                    onUserInterrupted()
                    _sessionState.value = VoiceSessionState.LISTENING
                    _currentEmotion.value = LizaEmotion.LISTENING
                    startUserSpeechRecognition()
                }
                onSendAudioChunk(chunk)
            },
            onVolumeRms = { rms ->
                val calibratedRms = rms * voiceSensitivity
                _micVolumeRms.value = calibratedRms

                if (_sessionState.value == VoiceSessionState.LISTENING && rms > 200f) {
                    val dynamicEmotion = EmotionAnalyzer.analyzeEmotion(
                        text = "",
                        inputVolumeRms = rms,
                        voiceSensitivity = voiceSensitivity,
                        emotionIntensity = emotionIntensity
                    )
                    if (dynamicEmotion != LizaEmotion.SPEAKING) {
                        _currentEmotion.value = dynamicEmotion
                    }
                }
            }
        )

        liveSpeechRecognizer = LiveSpeechRecognizer(
            context = context,
            onPartialTranscript = { partial ->
                onUserSpeechTranscript(partial, false)
            },
            onFinalTranscript = { finalResult ->
                onUserSpeechTranscript(finalResult, true)
            },
            onVolumeRms = { rms ->
                val calibratedRms = rms * voiceSensitivity
                _micVolumeRms.value = calibratedRms
                if (_sessionState.value == VoiceSessionState.LISTENING && rms > 200f) {
                    val dynamicEmotion = EmotionAnalyzer.analyzeEmotion(
                        text = "",
                        inputVolumeRms = rms,
                        voiceSensitivity = voiceSensitivity,
                        emotionIntensity = emotionIntensity
                    )
                    if (dynamicEmotion != LizaEmotion.SPEAKING) {
                        _currentEmotion.value = dynamicEmotion
                    }
                }
            },
            onError = { error ->
                android.util.Log.d("VoiceEngine", "Live speech recognizer notice: $error")
            }
        )
    }

    fun startUserSpeechRecognition() {
        try {
            liveSpeechRecognizer?.startListening()
        } catch (e: Exception) {
            android.util.Log.e("VoiceEngine", "Failed to start speech recognizer", e)
        }
    }

    fun startSession() {
        _sessionState.value = VoiceSessionState.LISTENING
        _currentEmotion.value = LizaEmotion.LISTENING
        audioTrackPlayer?.startPlayback(scope)
        startUserSpeechRecognition()
        audioRecordManager?.startRecording(scope)
    }

    fun stopSession() {
        audioRecordManager?.stopRecording()
        audioTrackPlayer?.stopAndFlush()
        liveSpeechRecognizer?.stopListening()
        _sessionState.value = VoiceSessionState.IDLE
        _currentEmotion.value = LizaEmotion.HAPPY
        _micVolumeRms.value = 0f
        _speakerVolumeRms.value = 0f
    }

    fun receiveIncomingAudio(pcmData: ByteArray) {
        liveSpeechRecognizer?.stopListening()
        audioTrackPlayer?.enqueueAudio(pcmData)
    }

    fun setEmotion(emotion: LizaEmotion) {
        _currentEmotion.value = emotion
    }

    fun setState(state: VoiceSessionState) {
        _sessionState.value = state
    }

    fun interrupt() {
        audioTrackPlayer?.stopAndFlush()
        _sessionState.value = VoiceSessionState.LISTENING
        _currentEmotion.value = LizaEmotion.LISTENING
        onUserInterrupted()
        startUserSpeechRecognition()
    }

    fun release() {
        stopSession()
        audioTrackPlayer?.release()
        audioTrackPlayer = null
        audioRecordManager = null
        liveSpeechRecognizer?.stopListening()
        liveSpeechRecognizer = null
    }
}
