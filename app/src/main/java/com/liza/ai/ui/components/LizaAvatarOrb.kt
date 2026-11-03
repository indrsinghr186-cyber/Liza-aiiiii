package com.liza.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.liza.ai.data.LizaEmotion
import com.liza.ai.ui.theme.*

@Composable
fun LizaAvatarOrb(
    emotion: LizaEmotion,
    isSpeaking: Boolean,
    isListening: Boolean,
    volumeRms: Float,
    emotionIntensity: Float = 1.0f,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb_pulse")

    val pulseSpeedMs = (1800 / emotionIntensity.coerceIn(0.6f, 2.0f)).toInt()
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.94f,
        targetValue = 1.06f,
        animationSpec = infiniteRepeatable(
            animation = tween(pulseSpeedMs, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = (0.75f * emotionIntensity.coerceIn(0.7f, 1.3f)).coerceAtMost(0.95f),
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow_alpha"
    )

    val emotionEmoji = when (emotion) {
        LizaEmotion.HAPPY -> "😊"
        LizaEmotion.LISTENING -> "🎧"
        LizaEmotion.THINKING -> "🧠"
        LizaEmotion.SPEAKING -> "✨"
        LizaEmotion.SURPRISED -> "😮"
        LizaEmotion.LOVING -> "💖"
        LizaEmotion.EXCITED -> "🔥"
    }

    val emotionColor = when (emotion) {
        LizaEmotion.LOVING -> RoseAccent
        LizaEmotion.EXCITED -> AmberAccent
        LizaEmotion.LISTENING -> CyanAccent
        LizaEmotion.THINKING -> PurpleGlow
        LizaEmotion.SURPRISED -> RoseAccent
        else -> PurplePrimary
    }

    // Dynamic scale and boost modulated by calibrated volume and emotion intensity
    val dynamicBoost = ((volumeRms / 1400f) * emotionIntensity).coerceIn(0f, 0.55f)
    val effectiveScale = (if (isSpeaking || isListening) pulseScale + dynamicBoost else 1.0f)

    Box(
        modifier = modifier
            .size(240.dp)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        // Outer Ambient Glow Aura
        Box(
            modifier = Modifier
                .size((200 * effectiveScale).dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            emotionColor.copy(alpha = glowAlpha),
                            PurpleDark.copy(alpha = glowAlpha * 0.4f),
                            Color.Transparent
                        )
                    )
                )
        )

        // Orbital Ring Canvas
        Canvas(
            modifier = Modifier
                .size((190 * (1f + dynamicBoost * 0.4f)).dp)
        ) {
            val center = Offset(size.width / 2, size.height / 2)
            val radius = size.minDimension / 2 - 8.dp.toPx()

            drawCircle(
                brush = Brush.sweepGradient(
                    colors = listOf(
                        emotionColor,
                        CyanAccent,
                        PurplePrimary,
                        emotionColor
                    )
                ),
                radius = radius,
                center = center,
                style = Stroke(width = (3.5f * emotionIntensity.coerceIn(0.8f, 1.8f)).dp.toPx())
            )
        }

        // Core Inner Spherical Display
        Box(
            modifier = Modifier
                .size(150.dp)
                .clip(CircleShape)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            DarkSurfaceElevated,
                            DarkSurface,
                            BlackAmoled
                        )
                    )
                )
                .border(2.dp, emotionColor.copy(alpha = 0.85f), CircleShape)
                .shadow(20.dp, CircleShape, spotColor = emotionColor),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                Text(
                    text = emotionEmoji,
                    fontSize = 44.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "LIZA",
                    style = Typography.labelSmall.copy(
                        color = emotionColor,
                        fontSize = 12.sp,
                        letterSpacing = 2.sp
                    )
                )
            }
        }
    }
}
