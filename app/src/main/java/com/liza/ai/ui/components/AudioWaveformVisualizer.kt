package com.liza.ai.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.unit.dp
import com.liza.ai.ui.theme.CyanAccent
import com.liza.ai.ui.theme.DarkSurface
import com.liza.ai.ui.theme.PurplePrimary
import kotlin.random.Random

@Composable
fun AudioWaveformVisualizer(
    isActive: Boolean,
    volumeRms: Float,
    barCount: Int = 18,
    modifier: Modifier = Modifier
) {
    val randomValues = remember {
        List(barCount) { AnimatableState(0.2f) }
    }

    LaunchedEffect(isActive, volumeRms) {
        val normalized = (volumeRms / 2000f).coerceIn(0.15f, 1.0f)
        randomValues.forEachIndexed { index, state ->
            val factor = if (isActive) {
                (normalized * (0.4f + Random.nextFloat() * 0.6f)).coerceIn(0.1f, 1.0f)
            } else {
                0.12f
            }
            state.target = factor
            state.current = factor
        }
    }

    Box(
        modifier = modifier
            .height(48.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface.copy(alpha = 0.6f))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val totalWidth = size.width
            val height = size.height
            val barWidth = (totalWidth / (barCount * 1.8f)).coerceAtLeast(3f)
            val spacing = (totalWidth - (barWidth * barCount)) / (barCount - 1).coerceAtLeast(1)

            for (i in 0 until barCount) {
                val x = i * (barWidth + spacing)
                val barHeight = (height * randomValues[i].current).coerceIn(4f, height)
                val y = (height - barHeight) / 2

                drawRoundRect(
                    color = if (i % 2 == 0) PurplePrimary else CyanAccent,
                    topLeft = Offset(x, y),
                    size = Size(barWidth, barHeight),
                    cornerRadius = CornerRadius(4f, 4f)
                )
            }
        }
    }
}

private class AnimatableState(initial: Float) {
    var current by mutableFloatStateOf(initial)
    var target by mutableFloatStateOf(initial)
}
