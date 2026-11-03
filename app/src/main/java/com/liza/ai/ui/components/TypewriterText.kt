package com.liza.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import com.liza.ai.ui.theme.CyanAccent
import com.liza.ai.ui.theme.TextPrimary
import com.liza.ai.ui.theme.Typography
import kotlinx.coroutines.delay

@Composable
fun TypewriterText(
    text: String,
    modifier: Modifier = Modifier,
    style: TextStyle = Typography.bodyMedium.copy(color = TextPrimary),
    cursorColor: Color = CyanAccent,
    animate: Boolean = true,
    charDelayMs: Long = 16L,
    onComplete: () -> Unit = {}
) {
    var displayedLength by remember(text, animate) {
        mutableStateOf(if (animate) 0 else text.length)
    }
    var isTyping by remember(text, animate) {
        mutableStateOf(animate && text.isNotEmpty())
    }

    val infiniteTransition = rememberInfiniteTransition(label = "cursor_blink")
    val cursorAlpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursor_alpha"
    )

    LaunchedEffect(text, animate) {
        if (!animate) {
            displayedLength = text.length
            isTyping = false
            onComplete()
            return@LaunchedEffect
        }

        isTyping = true
        // If text was extended (streaming chunk), continue typing from current length
        val startIdx = displayedLength.coerceAtMost(text.length)
        for (i in startIdx..text.length) {
            displayedLength = i
            // Dynamic typing cadence: faster for whitespace/commas, slight variation for realism
            val stepDelay = if (i < text.length && text[i - 1].isWhitespace()) {
                charDelayMs / 2
            } else {
                charDelayMs
            }
            delay(stepDelay)
        }
        isTyping = false
        onComplete()
    }

    val displayedText = remember(text, displayedLength) {
        text.take(displayedLength.coerceIn(0, text.length))
    }

    Row(modifier = modifier) {
        Text(
            text = displayedText,
            style = style
        )
        if (isTyping) {
            Spacer(modifier = Modifier.width(2.dp))
            Text(
                text = "▍",
                style = style.copy(color = cursorColor.copy(alpha = cursorAlpha))
            )
        }
    }
}
