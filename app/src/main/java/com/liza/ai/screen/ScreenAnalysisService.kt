package com.liza.ai.screen

import android.graphics.Bitmap
import android.util.Base64
import java.io.ByteArrayOutputStream

class ScreenAnalysisService(private val screenCaptureManager: ScreenCaptureManager) {

    fun captureAndEncodeJpeg(): String? {
        val bitmap = screenCaptureManager.getLatestScreenshot() ?: return null
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 75, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
}
