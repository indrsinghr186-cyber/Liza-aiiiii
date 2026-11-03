package com.liza.ai.memory

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "memories")
data class MemoryEntity(
    @PrimaryKey
    val id: String = java.util.UUID.randomUUID().toString(),
    val key: String,
    val value: String,
    val category: String = "general", // "preference", "fact", "conversation", "owner"
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long = System.currentTimeMillis() + (24 * 60 * 60 * 1000L), // 24-hour expiration
    val isPermanent: Boolean = false
)
