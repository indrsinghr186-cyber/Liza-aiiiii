package com.liza.ai.device

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.os.BatteryManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import com.liza.ai.accessibility.LizaAccessibilityService
import org.json.JSONObject

class DeviceControlManager(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
    private val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    private var isTorchOn = false

    fun getBatteryLevel(): Int {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
    }

    fun isAccessibilityEnabled(): Boolean {
        return LizaAccessibilityService.isServiceConnected
    }

    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun vibrateDevice(milliseconds: Long = 200) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(milliseconds)
        }
    }

    fun setTorch(enable: Boolean): Boolean {
        return try {
            val cameraId = cameraManager?.cameraIdList?.firstOrNull { id ->
                cameraManager.getCameraCharacteristics(id).get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
            } ?: return false

            cameraManager?.setTorchMode(cameraId, enable)
            isTorchOn = enable
            true
        } catch (e: Exception) {
            false
        }
    }

    fun toggleTorch(): Boolean {
        return setTorch(!isTorchOn)
    }

    fun adjustVolume(direction: Int) {
        audioManager?.adjustStreamVolume(
            AudioManager.STREAM_MUSIC,
            direction, // AudioManager.ADJUST_RAISE or ADJUST_LOWER
            AudioManager.FLAG_SHOW_UI
        )
    }

    fun executeAccessibilityAction(actionJson: String): String {
        val service = LizaAccessibilityService.sharedInstance
            ?: return JSONObject().apply {
                put("success", false)
                put("message", "Accessibility Service is OFF. Please enable 'LIZA Device Control' in Android Settings.")
            }.toString()

        return service.executeCommandJson(actionJson)
    }
}
