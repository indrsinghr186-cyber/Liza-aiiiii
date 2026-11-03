package com.liza.ai.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import java.util.Locale

class WakeWordDetector(
    private val context: Context,
    private val onWakeWordDetected: (String) -> Unit
) {
    companion object {
        private const val TAG = "WakeWordDetector"
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var recognizerIntent: Intent? = null
    @Volatile
    var isListening = false
        private set

    fun startListening() {
        if (isListening) return
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            Log.w(TAG, "SpeechRecognizer not available on this device.")
            return
        }

        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {}
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(error: Int) {
                        if (isListening) {
                            // Restart listener loop
                            restart()
                        }
                    }

                    override fun onResults(results: Bundle?) {
                        checkMatches(results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION))
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        checkMatches(partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION))
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }

            recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toString())
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
            }

            speechRecognizer?.startListening(recognizerIntent)
            isListening = true
        } catch (e: Exception) {
            Log.e(TAG, "Error starting WakeWord listener", e)
        }
    }

    private fun checkMatches(matches: ArrayList<String>?) {
        if (matches.isNullOrEmpty() || !isListening) return

        for (match in matches) {
            val text = match.lowercase(Locale.US)
            if (text.contains("hey liza") || text.contains("liza") || text.contains("hey lisa") || text.contains("lisa")) {
                onWakeWordDetected(match)
                break
            }
        }

        if (isListening) {
            restart()
        }
    }

    private fun restart() {
        try {
            speechRecognizer?.cancel()
            speechRecognizer?.startListening(recognizerIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Error restarting speech recognizer", e)
        }
    }

    fun stopListening() {
        isListening = false
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying speech recognizer", e)
        }
        speechRecognizer = null
    }
}
