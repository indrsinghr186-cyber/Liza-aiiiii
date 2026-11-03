package com.liza.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.liza.ai.settings.OwnerSecurity
import com.liza.ai.settings.SettingsRepository
import com.liza.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    settings: SettingsRepository,
    voiceSensitivity: Float,
    emotionIntensity: Float,
    liveMicRms: Float = 0f,
    onVoiceSensitivityChange: (Float) -> Unit,
    onEmotionIntensityChange: (Float) -> Unit,
    onSelectProfile: (String) -> Unit,
    onSaveSettings: () -> Unit,
    onClearAllMemories: () -> Unit
) {
    var apiKey by remember { mutableStateOf(settings.apiKey) }
    var voiceName by remember { mutableStateOf(settings.voiceName) }
    var wakeWordEnabled by remember { mutableStateOf(settings.isWakeWordEnabled) }
    var bgVoiceEnabled by remember { mutableStateOf(settings.isBackgroundVoiceEnabled) }
    var adminPinInput by remember { mutableStateOf("") }
    var isAdminUnlocked by remember { mutableStateOf(false) }

    val voiceOptions = listOf("Lyra", "Kore", "Zephyr", "Aoede", "Puck", "Charon", "Fenrir")
    val calibrationProfiles = listOf("CALM", "BALANCED", "EXPRESSIVE", "DYNAMIC")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BlackAmoled)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "PREFERENCES & SYSTEM",
            style = Typography.labelSmall.copy(color = PurplePrimary, fontSize = 12.sp)
        )
        Text(
            text = "LIZA Assistant Settings",
            style = Typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Owner Identity Verification Badge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(DarkSurfaceElevated)
                .border(1.dp, PurpleGlow.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = PurplePrimary,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "OWNER & CREATOR IDENTITY",
                        style = Typography.labelSmall.copy(color = CyanAccent)
                    )
                    Text(
                        text = OwnerSecurity.OWNER_IDENTITY,
                        style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Verified Creator. Always acknowledged as sole owner.",
                        style = Typography.bodyMedium.copy(color = TextMuted, fontSize = 12.sp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ==================== VOICE CALIBRATION & EMOTIONAL MODULATION ====================
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(DarkSurfaceElevated)
                .border(1.dp, CyanAccent.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = null,
                            tint = CyanAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Voice Calibration",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(PurpleDark)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "EMOTION ENGINE",
                            style = Typography.labelSmall.copy(color = CyanAccent, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Calibrate microphone input sensitivity and emotion intensity so Liza's visual orb reactions and expressions scale with Paramveer's speaking volume.",
                    style = Typography.bodyMedium.copy(color = TextMuted, fontSize = 12.sp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Calibration Presets
                Text(
                    text = "Calibration Presets",
                    style = Typography.labelSmall.copy(color = PurplePrimary, fontWeight = FontWeight.SemiBold)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    calibrationProfiles.forEach { profile ->
                        val isSelected = settings.voiceCalibrationProfile.equals(profile, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { onSelectProfile(profile) },
                            label = { Text(profile, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = CyanAccent,
                                selectedLabelColor = BlackAmoled
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Voice Sensitivity Slider
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Input Voice Sensitivity",
                        style = Typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                    )
                    Text(
                        text = "${String.format("%.1f", voiceSensitivity)}x",
                        style = Typography.labelMedium.copy(color = CyanAccent, fontWeight = FontWeight.Bold)
                    )
                }

                Slider(
                    value = voiceSensitivity,
                    onValueChange = onVoiceSensitivityChange,
                    valueRange = 0.2f..2.5f,
                    colors = SliderDefaults.colors(
                        thumbColor = CyanAccent,
                        activeTrackColor = CyanAccent,
                        inactiveTrackColor = DarkBorder
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Emotional Modulation Intensity Slider
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Emotional Modulation Intensity",
                        style = Typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                    )
                    Text(
                        text = "${String.format("%.1f", emotionIntensity)}x",
                        style = Typography.labelMedium.copy(color = PurplePrimary, fontWeight = FontWeight.Bold)
                    )
                }

                Slider(
                    value = emotionIntensity,
                    onValueChange = onEmotionIntensityChange,
                    valueRange = 0.5f..2.0f,
                    colors = SliderDefaults.colors(
                        thumbColor = PurplePrimary,
                        activeTrackColor = PurplePrimary,
                        inactiveTrackColor = DarkBorder
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Live Volume Reaction Preview Meter
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(BlackAmoled)
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = null,
                        tint = CyanAccent,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Live Volume Response:",
                        style = Typography.labelSmall.copy(color = TextSecondary, fontSize = 11.sp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    LinearProgressIndicator(
                        progress = { ((liveMicRms * voiceSensitivity) / 2000f).coerceIn(0.05f, 1f) },
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = CyanAccent,
                        trackColor = DarkSurface
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Gemini AI API Key Configuration
        Text(
            text = "Gemini AI API Configuration",
            style = Typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = apiKey,
            onValueChange = {
                apiKey = it
                settings.apiKey = it.trim()
            },
            label = { Text("Gemini API Key (Generative Language API)") },
            placeholder = { Text("AIzaSy...") },
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = { Icon(Icons.Default.VpnKey, contentDescription = null, tint = PurpleGlow) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                focusedBorderColor = PurplePrimary,
                unfocusedBorderColor = DarkBorder
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Natural Voice Tone Selection
        Text(
            text = "Voice Synthesis Model (Live API Voice)",
            style = Typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            voiceOptions.forEach { voice ->
                val isSelected = voiceName.equals(voice, ignoreCase = true)
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        voiceName = voice
                        settings.voiceName = voice
                    },
                    label = { Text(voice) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = PurplePrimary,
                        selectedLabelColor = BlackAmoled
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Voice Triggers
        Text(
            text = "Voice Detection Options",
            style = Typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = "Wake-Word Detection", style = Typography.bodyLarge)
                Text(
                    text = "Listen for \"Hey Liza\" inside the application",
                    style = Typography.bodyMedium.copy(color = TextMuted, fontSize = 12.sp)
                )
            }
            Switch(
                checked = wakeWordEnabled,
                onCheckedChange = {
                    wakeWordEnabled = it
                    settings.isWakeWordEnabled = it
                },
                colors = SwitchDefaults.colors(checkedThumbColor = PurplePrimary)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = "Background Wake-Up Service", style = Typography.bodyLarge)
                Text(
                    text = "Keep lightweight listening foreground service running in background",
                    style = Typography.bodyMedium.copy(color = TextMuted, fontSize = 12.sp)
                )
            }
            Switch(
                checked = bgVoiceEnabled,
                onCheckedChange = {
                    bgVoiceEnabled = it
                    settings.isBackgroundVoiceEnabled = it
                },
                colors = SwitchDefaults.colors(checkedThumbColor = PurplePrimary)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Owner Admin Gate & Vault Cleanup
        Text(
            text = "Owner Admin Actions",
            style = Typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (!isAdminUnlocked) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = adminPinInput,
                    onValueChange = { adminPinInput = it },
                    label = { Text("Enter Admin PIN (Default: 1234)") },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (OwnerSecurity.verifyAdminPin(adminPinInput.trim())) {
                            isAdminUnlocked = true
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary)
                ) {
                    Text("Unlock", color = BlackAmoled)
                }
            }
        } else {
            Button(
                onClick = onClearAllMemories,
                colors = ButtonDefaults.buttonColors(containerColor = RoseAccent),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Purge Entire Memory Vault", color = TextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
