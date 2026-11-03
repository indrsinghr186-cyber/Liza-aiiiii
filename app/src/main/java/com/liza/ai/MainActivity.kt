package com.liza.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assistant
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Widgets
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.liza.ai.screen.ScreenCaptureService
import com.liza.ai.ui.screens.FunctionsScreen
import com.liza.ai.ui.screens.MemoryVaultScreen
import com.liza.ai.ui.screens.SettingsScreen
import com.liza.ai.ui.screens.VoiceAssistantScreen
import com.liza.ai.ui.theme.BlackAmoled
import com.liza.ai.ui.theme.DarkBorder
import com.liza.ai.ui.theme.DarkSurface
import com.liza.ai.ui.theme.DarkSurfaceElevated
import com.liza.ai.ui.theme.LizaTheme
import com.liza.ai.ui.theme.PurplePrimary
import com.liza.ai.ui.theme.TextMuted
import com.liza.ai.ui.theme.TextPrimary
import com.liza.ai.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] == true
        if (!recordAudioGranted) {
            Toast.makeText(this, "Microphone permission required for LIZA voice", Toast.LENGTH_LONG).show()
        }
    }

    private val mediaProjectionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && result.data != null) {
            val metrics = resources.displayMetrics
            viewModel.screenCaptureManager.startProjection(
                resultCode = result.resultCode,
                resultData = result.data!!,
                displayMetrics = metrics
            )
            val serviceIntent = Intent(this, ScreenCaptureService::class.java).apply {
                action = ScreenCaptureService.ACTION_START
            }
            ContextCompat.startForegroundService(this, serviceIntent)
            Toast.makeText(this, "Screen Vision active", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Screen Capture permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestRequiredPermissions()

        setContent {
            LizaTheme {
                MainAppContent(
                    viewModel = viewModel,
                    onOpenAccessibility = { openAccessibilitySettings() },
                    onRequestScreenCapture = { requestScreenCapture() }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.checkAccessibilityStatus()
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        permissionLauncher.launch(permissions.toTypedArray())
    }

    private fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
    }

    private fun requestScreenCapture() {
        val mediaProjectionManager = getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        mediaProjectionLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
    }
}

enum class NavigationTab(val title: String) {
    VOICE("Voice"),
    FUNCTIONS("Tools"),
    MEMORY("Memory"),
    SETTINGS("Settings")
}

@Composable
fun MainAppContent(
    viewModel: MainViewModel,
    onOpenAccessibility: () -> Unit,
    onRequestScreenCapture: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(NavigationTab.VOICE) }

    val sessionState by viewModel.voiceEngine.sessionState.collectAsState()
    val emotion by viewModel.voiceEngine.currentEmotion.collectAsState()
    val micRms by viewModel.voiceEngine.micVolumeRms.collectAsState()
    val speakerRms by viewModel.voiceEngine.speakerVolumeRms.collectAsState()
    val chatMessages by viewModel.chatMessages.collectAsState()
    val liveTranscript by viewModel.liveTranscript.collectAsState()
    val liveTranscriptSpeaker by viewModel.liveTranscriptSpeaker.collectAsState()
    val voiceSensitivity by viewModel.voiceSensitivity.collectAsState()
    val emotionIntensity by viewModel.emotionIntensity.collectAsState()
    val activeMemories by viewModel.activeMemories.collectAsState()
    val isAccessibilityEnabled by viewModel.isAccessibilityConnected.collectAsState()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = DarkSurfaceElevated,
                modifier = Modifier.fillMaxWidth()
            ) {
                NavigationBarItem(
                    selected = selectedTab == NavigationTab.VOICE,
                    onClick = { selectedTab = NavigationTab.VOICE },
                    icon = { Icon(Icons.Default.Assistant, contentDescription = "Voice") },
                    label = { Text("Voice") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PurplePrimary,
                        selectedTextColor = PurplePrimary,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted,
                        indicatorColor = DarkSurface
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NavigationTab.FUNCTIONS,
                    onClick = { selectedTab = NavigationTab.FUNCTIONS },
                    icon = { Icon(Icons.Default.Widgets, contentDescription = "Tools") },
                    label = { Text("Tools") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PurplePrimary,
                        selectedTextColor = PurplePrimary,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted,
                        indicatorColor = DarkSurface
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NavigationTab.MEMORY,
                    onClick = { selectedTab = NavigationTab.MEMORY },
                    icon = { Icon(Icons.Default.Psychology, contentDescription = "Memory") },
                    label = { Text("Memory") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PurplePrimary,
                        selectedTextColor = PurplePrimary,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted,
                        indicatorColor = DarkSurface
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == NavigationTab.SETTINGS,
                    onClick = { selectedTab = NavigationTab.SETTINGS },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PurplePrimary,
                        selectedTextColor = PurplePrimary,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted,
                        indicatorColor = DarkSurface
                    )
                )
            }
        },
        containerColor = BlackAmoled
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                NavigationTab.VOICE -> VoiceAssistantScreen(
                    sessionState = sessionState,
                    currentEmotion = emotion,
                    micVolumeRms = micRms,
                    speakerVolumeRms = speakerRms,
                    chatMessages = chatMessages,
                    liveTranscript = liveTranscript,
                    liveTranscriptSpeaker = liveTranscriptSpeaker,
                    emotionIntensity = emotionIntensity,
                    onStartVoice = { viewModel.startVoiceSession() },
                    onStopVoice = { viewModel.stopVoiceSession() },
                    onInterruptVoice = { viewModel.interruptVoice() },
                    onSendMessage = { text -> viewModel.sendMessage(text) }
                )

                NavigationTab.FUNCTIONS -> FunctionsScreen(
                    onFunctionClick = { funcId ->
                        when (funcId) {
                            "whatsapp_send" -> viewModel.sendMessage("Send WhatsApp message to friend")
                            "youtube_play" -> viewModel.sendMessage("Search YouTube for relaxing lo-fi music")
                            "nav_actions" -> viewModel.sendMessage("Press Home button")
                        }
                    },
                    onOpenAccessibility = onOpenAccessibility,
                    isAccessibilityEnabled = isAccessibilityEnabled,
                    onTriggerTorch = { viewModel.toggleTorch() },
                    onScreenAnalyze = onRequestScreenCapture
                )

                NavigationTab.MEMORY -> MemoryVaultScreen(
                    memories = activeMemories,
                    onAddMemory = { key, value, isPermanent ->
                        viewModel.addMemory(key, value, isPermanent)
                    },
                    onDeleteMemory = { id -> viewModel.deleteMemory(id) },
                    onClearAll = { viewModel.clearAllMemories() }
                )

                NavigationTab.SETTINGS -> SettingsScreen(
                    settings = viewModel.settingsRepository,
                    voiceSensitivity = voiceSensitivity,
                    emotionIntensity = emotionIntensity,
                    liveMicRms = micRms,
                    onVoiceSensitivityChange = { viewModel.updateVoiceSensitivity(it) },
                    onEmotionIntensityChange = { viewModel.updateEmotionIntensity(it) },
                    onSelectProfile = { viewModel.setCalibrationPreset(it) },
                    onSaveSettings = { /* Persisted directly in repo */ },
                    onClearAllMemories = { viewModel.clearAllMemories() }
                )
            }
        }
    }
}
