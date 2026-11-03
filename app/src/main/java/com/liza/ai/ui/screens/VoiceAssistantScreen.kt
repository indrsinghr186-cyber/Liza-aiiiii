package com.liza.ai.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.liza.ai.data.ChatMessage
import com.liza.ai.data.LizaEmotion
import com.liza.ai.data.VoiceSessionState
import com.liza.ai.ui.components.AudioWaveformVisualizer
import com.liza.ai.ui.components.LizaAvatarOrb
import com.liza.ai.ui.components.TypewriterText
import com.liza.ai.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceAssistantScreen(
    sessionState: VoiceSessionState,
    currentEmotion: LizaEmotion,
    micVolumeRms: Float,
    speakerVolumeRms: Float,
    chatMessages: List<ChatMessage>,
    liveTranscript: String,
    liveTranscriptSpeaker: String = "liza",
    emotionIntensity: Float = 1.0f,
    onStartVoice: () -> Unit,
    onStopVoice: () -> Unit,
    onInterruptVoice: () -> Unit,
    onSendMessage: (String) -> Unit
) {
    var textInput by remember { mutableStateOf("") }
    val isLiveVoiceActive = sessionState == VoiceSessionState.LISTENING ||
            sessionState == VoiceSessionState.SPEAKING ||
            sessionState == VoiceSessionState.PROCESSING

    val listState = rememberLazyListState()

    // Scroll to bottom when new messages arrive
    LaunchedEffect(chatMessages.size) {
        if (chatMessages.isNotEmpty()) {
            listState.animateScrollToItem(0)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BlackAmoled)
            .padding(horizontal = 14.dp, vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Status Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                val infiniteTransition = rememberInfiniteTransition(label = "pulse_indicator")
                val pulseAlpha by infiniteTransition.animateFloat(
                    initialValue = 1f,
                    targetValue = 0.4f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(600, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "pulse_alpha"
                )

                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(
                            if (isLiveVoiceActive) GreenOnline.copy(alpha = pulseAlpha) else PurpleGlow
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = when (sessionState) {
                        VoiceSessionState.IDLE -> "READY (Tap Mic to Speak)"
                        VoiceSessionState.CONNECTING -> "CONNECTING LIVE..."
                        VoiceSessionState.LISTENING -> "LISTENING TO PARAMVEER..."
                        VoiceSessionState.PROCESSING -> "PROCESSING..."
                        VoiceSessionState.SPEAKING -> "LIZA SPEAKING (Tap to Interrupt)"
                        VoiceSessionState.ERROR -> "CONNECTION ERROR"
                    },
                    style = Typography.labelSmall.copy(
                        color = if (isLiveVoiceActive) GreenOnline else TextSecondary,
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }

            Surface(
                color = CyanAccent.copy(alpha = 0.12f),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, CyanAccent.copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.WorkspacePremium,
                        contentDescription = null,
                        tint = CyanAccent,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Paramveer Rawat",
                        style = Typography.labelSmall.copy(
                            color = CyanAccent,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(2.dp))

        // Central Avatar Orb with dynamic voice calibration & emotion reactivity
        LizaAvatarOrb(
            emotion = currentEmotion,
            isSpeaking = sessionState == VoiceSessionState.SPEAKING,
            isListening = sessionState == VoiceSessionState.LISTENING,
            volumeRms = if (sessionState == VoiceSessionState.SPEAKING) speakerVolumeRms else micVolumeRms,
            emotionIntensity = emotionIntensity
        )

        // Live Audio Waveform Visualizer
        AudioWaveformVisualizer(
            isActive = isLiveVoiceActive,
            volumeRms = if (sessionState == VoiceSessionState.SPEAKING) speakerVolumeRms else micVolumeRms,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp)
        )

        // Real-Time Live Transcribing HUD Panel
        AnimatedVisibility(
            visible = liveTranscript.isNotBlank(),
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            val isUserLive = liveTranscriptSpeaker == "user"
            val hudBorderColor = if (isUserLive) CyanAccent else PurplePrimary

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp, vertical = 4.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurfaceElevated.copy(alpha = 0.95f))
                    .border(
                        1.dp,
                        hudBorderColor.copy(alpha = 0.7f),
                        RoundedCornerShape(14.dp)
                    )
                    .padding(12.dp)
            ) {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isUserLive) Icons.Default.GraphicEq else Icons.Default.RecordVoiceOver,
                                contentDescription = null,
                                tint = hudBorderColor,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isUserLive) "PARAMVEER (LIVE TRANSCRIBING)" else "LIZA (LIVE STREAM)",
                                style = Typography.labelSmall.copy(
                                    color = hudBorderColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Surface(
                            color = GreenOnline.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, GreenOnline.copy(alpha = 0.6f))
                        ) {
                            Text(
                                text = "● LIVE",
                                style = Typography.labelSmall.copy(
                                    color = GreenOnline,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    TypewriterText(
                        text = "“$liveTranscript”",
                        style = Typography.bodyMedium.copy(
                            color = TextPrimary,
                            fontWeight = FontWeight.Medium,
                            lineHeight = 20.sp
                        ),
                        cursorColor = hudBorderColor,
                        animate = true,
                        charDelayMs = 12L
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        // Conversational Message Stream with Distinct Styling & Typewriter Effect
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(DarkSurface.copy(alpha = 0.6f))
                .padding(10.dp),
            reverseLayout = true
        ) {
            val reversedList = chatMessages.reversed()
            itemsIndexed(reversedList) { index, msg ->
                // Animate typewriter only for the newest message (index == 0 in reversed list)
                val isNewestMessage = index == 0
                MessageBubbleItem(
                    message = msg,
                    isNewest = isNewestMessage
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Interaction Bottom Controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Text query input
            OutlinedTextField(
                value = textInput,
                onValueChange = { textInput = it },
                placeholder = { Text("Ask LIZA or give command...", color = TextMuted, fontSize = 14.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PurplePrimary,
                    unfocusedBorderColor = DarkBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedContainerColor = DarkSurfaceElevated,
                    unfocusedContainerColor = DarkSurfaceElevated
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(54.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            if (textInput.isNotBlank()) {
                IconButton(
                    onClick = {
                        val text = textInput.trim()
                        textInput = ""
                        onSendMessage(text)
                    },
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(PurplePrimary)
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = BlackAmoled
                    )
                }
            } else {
                // Voice Toggle Action Button
                IconButton(
                    onClick = {
                        if (isLiveVoiceActive) {
                            if (sessionState == VoiceSessionState.SPEAKING) {
                                onInterruptVoice()
                            } else {
                                onStopVoice()
                            }
                        } else {
                            onStartVoice()
                        }
                    },
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                colors = if (isLiveVoiceActive) listOf(RoseAccent, AmberAccent) else listOf(PurplePrimary, PurpleGlow)
                            )
                        )
                ) {
                    Icon(
                        imageVector = if (isLiveVoiceActive) Icons.Default.Stop else Icons.Default.Mic,
                        contentDescription = "Voice Control",
                        tint = BlackAmoled,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MessageBubbleItem(
    message: ChatMessage,
    isNewest: Boolean = false
) {
    val isUser = message.sender == "user"
    val timeStr = remember(message.timestamp) {
        SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(message.timestamp))
    }

    val emotionColor = when (message.emotion) {
        LizaEmotion.LOVING -> RoseAccent
        LizaEmotion.HAPPY -> GreenOnline
        LizaEmotion.EXCITED -> AmberAccent
        LizaEmotion.SURPRISED -> RoseAccent
        LizaEmotion.LISTENING -> CyanAccent
        LizaEmotion.SPEAKING -> PurplePrimary
        LizaEmotion.THINKING -> PurpleGlow
    }

    val emotionLabel = when (message.emotion) {
        LizaEmotion.LOVING -> "💖 Loving"
        LizaEmotion.HAPPY -> "😊 Happy"
        LizaEmotion.EXCITED -> "🔥 Excited"
        LizaEmotion.SURPRISED -> "😮 Surprised"
        LizaEmotion.LISTENING -> "🎧 Listening"
        LizaEmotion.SPEAKING -> "🎙️ Speaking"
        LizaEmotion.THINKING -> "🧠 Thinking"
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Column(
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start,
            modifier = Modifier.fillMaxWidth(0.88f)
        ) {
            Box(
                modifier = Modifier
                    .clip(
                        RoundedCornerShape(
                            topStart = 18.dp,
                            topEnd = 18.dp,
                            bottomStart = if (isUser) 18.dp else 4.dp,
                            bottomEnd = if (isUser) 4.dp else 18.dp
                        )
                    )
                    .background(
                        if (isUser) {
                            Brush.linearGradient(
                                colors = listOf(
                                    DarkSurfaceElevated,
                                    PurpleDark.copy(alpha = 0.6f)
                                )
                            )
                        } else {
                            Brush.linearGradient(
                                colors = listOf(
                                    DarkSurfaceElevated,
                                    DarkSurface
                                )
                            )
                        }
                    )
                    .border(
                        width = 1.dp,
                        brush = if (isUser) {
                            Brush.linearGradient(
                                colors = listOf(CyanAccent.copy(alpha = 0.6f), PurpleGlow.copy(alpha = 0.4f))
                            )
                        } else {
                            Brush.linearGradient(
                                colors = listOf(emotionColor.copy(alpha = 0.7f), DarkBorder)
                            )
                        },
                        shape = RoundedCornerShape(
                            topStart = 18.dp,
                            topEnd = 18.dp,
                            bottomStart = if (isUser) 18.dp else 4.dp,
                            bottomEnd = if (isUser) 4.dp else 18.dp
                        )
                    )
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Column {
                    // Header label
                    if (isUser) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = CyanAccent,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "PARAMVEER RAWAT",
                                style = Typography.labelSmall.copy(
                                    color = CyanAccent,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = CyanAccent.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "CREATOR",
                                    style = Typography.labelSmall.copy(
                                        color = CyanAccent,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    ),
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                        }
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 4.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = PurplePrimary,
                                    modifier = Modifier.size(13.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "LIZA AI",
                                    style = Typography.labelSmall.copy(
                                        color = PurplePrimary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }

                            // Dynamic Emotion Pill Tag
                            Surface(
                                color = emotionColor.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, emotionColor.copy(alpha = 0.35f))
                            ) {
                                Text(
                                    text = emotionLabel,
                                    style = Typography.labelSmall.copy(
                                        color = emotionColor,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Content text with typewriter effect for Liza's newest response
                    if (!isUser && isNewest) {
                        TypewriterText(
                            text = message.text,
                            style = Typography.bodyMedium.copy(
                                color = TextPrimary,
                                lineHeight = 20.sp
                            ),
                            cursorColor = emotionColor,
                            animate = true,
                            charDelayMs = 14L
                        )
                    } else {
                        Text(
                            text = message.text,
                            style = Typography.bodyMedium.copy(
                                color = TextPrimary,
                                lineHeight = 20.sp
                            )
                        )
                    }
                }
            }

            // Timestamp footer
            Text(
                text = timeStr,
                style = Typography.labelSmall.copy(
                    color = if (isUser) CyanAccent.copy(alpha = 0.6f) else TextMuted,
                    fontSize = 9.sp
                ),
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
    }
}
