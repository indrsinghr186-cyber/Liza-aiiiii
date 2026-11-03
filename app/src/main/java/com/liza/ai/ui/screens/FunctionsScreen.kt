package com.liza.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.liza.ai.data.FunctionItem
import com.liza.ai.ui.theme.*

@Composable
fun FunctionsScreen(
    onFunctionClick: (String) -> Unit,
    onOpenAccessibility: () -> Unit,
    isAccessibilityEnabled: Boolean,
    onTriggerTorch: () -> Unit,
    onScreenAnalyze: () -> Unit
) {
    val functionList = listOf(
        FunctionCategory(
            title = "Device Automation & Controls",
            items = listOf(
                FunctionItem(
                    id = "accessibility_status",
                    title = "Accessibility Engine",
                    description = if (isAccessibilityEnabled) "Active & Ready" else "Disabled (Tap to grant)",
                    category = "device",
                    iconName = "settings_accessibility",
                    badge = if (isAccessibilityEnabled) "ONLINE" else "SETUP NEEDED",
                    action = onOpenAccessibility
                ),
                FunctionItem(
                    id = "screen_vision",
                    title = "Screen Vision Analysis",
                    description = "Analyze what's currently on your display",
                    category = "device",
                    iconName = "screen_search",
                    badge = "AI VISION",
                    action = onScreenAnalyze
                ),
                FunctionItem(
                    id = "torch_toggle",
                    title = "Flashlight / Torch",
                    description = "Toggle device torch on or off instantly",
                    category = "device",
                    iconName = "flashlight_on",
                    action = onTriggerTorch
                )
            )
        ),
        FunctionCategory(
            title = "App Interactions",
            items = listOf(
                FunctionItem(
                    id = "whatsapp_send",
                    title = "WhatsApp Automator",
                    description = "Send verified messages via voice/accessibility",
                    category = "apps",
                    iconName = "chat",
                    action = { onFunctionClick("whatsapp_send") }
                ),
                FunctionItem(
                    id = "youtube_play",
                    title = "YouTube Video Search",
                    description = "Search & play favorite songs or podcasts",
                    category = "apps",
                    iconName = "play_circle",
                    action = { onFunctionClick("youtube_play") }
                ),
                FunctionItem(
                    id = "nav_actions",
                    title = "System Nav (Back/Home)",
                    description = "Hands-free Android navigation commands",
                    category = "apps",
                    iconName = "navigation",
                    action = { onFunctionClick("nav_actions") }
                )
            )
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BlackAmoled)
            .padding(16.dp)
    ) {
        Text(
            text = "LIZA FUNCTION CENTER",
            style = Typography.labelSmall.copy(color = PurplePrimary, fontSize = 12.sp)
        )
        Text(
            text = "AI Automation & Controls",
            style = Typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            functionList.forEach { category ->
                items(category.items) { item ->
                    FunctionCard(item)
                }
            }
        }
    }
}

data class FunctionCategory(
    val title: String,
    val items: List<FunctionItem>
)

@Composable
fun FunctionCard(item: FunctionItem) {
    val iconVector: ImageVector = when (item.iconName) {
        "settings_accessibility" -> Icons.Default.AccessibilityNew
        "screen_search" -> Icons.Default.Screenshot
        "flashlight_on" -> Icons.Default.FlashlightOn
        "chat" -> Icons.Default.ChatBubble
        "play_circle" -> Icons.Default.PlayCircleFilled
        else -> Icons.Default.SmartToy
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurfaceElevated)
            .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            .clickable { item.action() }
            .padding(12.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = iconVector,
                    contentDescription = item.title,
                    tint = PurpleGlow,
                    modifier = Modifier.size(28.dp)
                )

                if (item.badge != null) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (item.badge == "ONLINE") GreenOnline.copy(alpha = 0.2f) else PurpleDark)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = item.badge,
                            style = Typography.labelSmall.copy(
                                color = if (item.badge == "ONLINE") GreenOnline else PurplePrimary,
                                fontSize = 9.sp
                            )
                        )
                    }
                }
            }

            Column {
                Text(
                    text = item.title,
                    style = Typography.titleMedium.copy(fontSize = 14.sp, fontWeight = FontWeight.SemiBold),
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = item.description,
                    style = Typography.bodyMedium.copy(fontSize = 11.sp, color = TextMuted),
                    maxLines = 2
                )
            }
        }
    }
}
