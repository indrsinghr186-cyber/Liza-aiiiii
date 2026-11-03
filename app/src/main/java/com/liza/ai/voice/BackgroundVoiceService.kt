package com.liza.ai.voice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.app.NotificationCompat
import com.liza.ai.MainActivity
import java.util.Locale

class BackgroundVoiceService : Service() {

    companion object {
        const val CHANNEL_ID = "liza_bg_voice_channel"
        const val NOTIFICATION_ID = 8842

        const val ACTION_START = "com.liza.ai.START_BG_VOICE"
        const val ACTION_STOP = "com.liza.ai.STOP_BG_VOICE"
        const val ACTION_PAUSE = "com.liza.ai.PAUSE_BG_VOICE"
        const val ACTION_RESUME = "com.liza.ai.RESUME_BG_VOICE"
        const val BROADCAST_WAKE_WORD_DETECTED = "com.liza.ai.WAKE_WORD_DETECTED"

        var isRunning = false
            private set
        var isPaused = false
            private set
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var recognizerIntent: Intent? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        setupSpeechRecognizer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action ?: ACTION_START) {
            ACTION_START -> {
                isRunning = true
                isPaused = false
                startForegroundWithNotification("LIZA is listening in background for \"Hey Liza\"")
                startListeningLoop()
            }
            ACTION_PAUSE -> {
                isPaused = true
                stopListeningLoop()
                startForegroundWithNotification("LIZA background voice paused")
            }
            ACTION_RESUME -> {
                isPaused = false
                startForegroundWithNotification("LIZA is listening in background for \"Hey Liza\"")
                startListeningLoop()
            }
            ACTION_STOP -> {
                stopSelfService()
            }
        }
        return START_NOT_STICKY
    }

    private fun setupSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onError(error: Int) {
                    if (isRunning && !isPaused) startListeningLoop()
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
    }

    private fun checkMatches(matches: ArrayList<String>?) {
        if (matches.isNullOrEmpty() || !isRunning || isPaused) return

        for (match in matches) {
            val text = match.lowercase(Locale.US)
            if (text.contains("hey liza") || text.contains("liza") || text.contains("hey lisa")) {
                notifyWakeWordDetected()
                break
            }
        }

        if (isRunning && !isPaused) {
            startListeningLoop()
        }
    }

    private fun notifyWakeWordDetected() {
        stopListeningLoop()

        val intent = Intent(BROADCAST_WAKE_WORD_DETECTED).apply {
            setPackage(packageName)
        }
        sendBroadcast(intent)

        try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }
            if (launchIntent != null) {
                startActivity(launchIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startListeningLoop() {
        if (!isRunning || isPaused) return
        try {
            speechRecognizer?.startListening(recognizerIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopListeningLoop() {
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.cancel()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startForegroundWithNotification(contentText: String) {
        val notification = buildNotification(contentText)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).let { intent ->
            PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        val pauseIntent = Intent(this, BackgroundVoiceService::class.java).apply {
            action = if (isPaused) ACTION_RESUME else ACTION_PAUSE
        }
        val pausePendingIntent = PendingIntent.getService(
            this, 1, pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, BackgroundVoiceService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("LIZA Background Voice")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .setContentIntent(openAppIntent)
            .addAction(
                android.R.drawable.ic_media_pause,
                if (isPaused) "Resume" else "Pause",
                pausePendingIntent
            )
            .addAction(
                android.R.drawable.ic_delete,
                "Stop",
                stopPendingIntent
            )
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "LIZA Background Voice",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Status while LIZA is listening for 'Hey Liza' in background"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun stopSelfService() {
        isRunning = false
        isPaused = false
        stopListeningLoop()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
    }

    override fun onDestroy() {
        stopSelfService()
        speechRecognizer?.destroy()
        speechRecognizer = null
        super.onDestroy()
    }
}
