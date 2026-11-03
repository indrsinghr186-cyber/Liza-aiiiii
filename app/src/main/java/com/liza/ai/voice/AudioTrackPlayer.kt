package com.liza.ai.voice

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.LinkedBlockingQueue

class AudioTrackPlayer(
    private val onPlaybackStateChanged: (Boolean) -> Unit = {},
    private val onVolumeRms: (Float) -> Unit = {}
) {
    companion object {
        private const val TAG = "AudioTrackPlayer"
        const val SAMPLE_RATE = 24000 // 24kHz output from Gemini Live
        const val CHANNEL_CONFIG = AudioFormat.CHANNEL_OUT_MONO
        const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
    }

    private var audioTrack: AudioTrack? = null
    private val audioQueue = LinkedBlockingQueue<ByteArray>()
    private var playbackJob: Job? = null
    @Volatile
    var isPlaying = false
        private set

    init {
        initAudioTrack()
    }

    private fun initAudioTrack() {
        try {
            val minBufferSize = AudioTrack.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
            audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANT)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AUDIO_FORMAT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(CHANNEL_CONFIG)
                        .build()
                )
                .setBufferSizeInBytes(maxOf(minBufferSize, 4096))
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            audioTrack?.play()
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing AudioTrack", e)
        }
    }

    fun startPlayback(scope: CoroutineScope) {
        if (playbackJob?.isActive == true) return

        playbackJob = scope.launch(Dispatchers.IO) {
            while (isActive) {
                val chunk = audioQueue.poll(100, java.util.concurrent.TimeUnit.MILLISECONDS)
                if (chunk != null && chunk.isNotEmpty()) {
                    if (!isPlaying) {
                        isPlaying = true
                        onPlaybackStateChanged(true)
                    }

                    if (audioTrack?.playState != AudioTrack.PLAYSTATE_PLAYING) {
                        audioTrack?.play()
                    }

                    audioTrack?.write(chunk, 0, chunk.size)

                    // Compute RMS for speaker animation
                    var sum = 0.0
                    for (i in 0 until chunk.size step 2) {
                        if (i + 1 < chunk.size) {
                            val sample = (chunk[i + 1].toInt() shl 8) or (chunk[i].toInt() and 0xFF)
                            sum += sample * sample
                        }
                    }
                    val rms = Math.sqrt(sum / (chunk.size / 2)).toFloat()
                    onVolumeRms(rms)
                } else {
                    if (isPlaying && audioQueue.isEmpty()) {
                        isPlaying = false
                        onPlaybackStateChanged(false)
                    }
                }
            }
        }
    }

    fun enqueueAudio(pcmData: ByteArray) {
        audioQueue.offer(pcmData)
    }

    /**
     * Immediate Zero-Latency Interruption
     * Stops audio and flushes buffers instantly when user speaks
     */
    fun stopAndFlush() {
        audioQueue.clear()
        try {
            audioTrack?.pause()
            audioTrack?.flush()
        } catch (e: Exception) {
            Log.e(TAG, "Error flushing AudioTrack", e)
        }
        isPlaying = false
        onPlaybackStateChanged(false)
    }

    fun release() {
        stopAndFlush()
        playbackJob?.cancel()
        playbackJob = null
        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing AudioTrack", e)
        }
        audioTrack = null
    }
}
