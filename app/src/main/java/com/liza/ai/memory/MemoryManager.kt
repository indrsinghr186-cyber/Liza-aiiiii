package com.liza.ai.memory

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MemoryManager(private val memoryDao: MemoryDao) {

    private val scope = CoroutineScope(Dispatchers.IO)

    init {
        // Auto purge expired 24h items on startup
        scope.launch {
            memoryDao.purgeExpiredMemories()
        }
    }

    val activeMemoriesFlow: Flow<List<MemoryEntity>> = memoryDao.getActiveMemoriesFlow()

    suspend fun addMemory(
        key: String,
        value: String,
        category: String = "general",
        isPermanent: Boolean = false,
        durationHours: Long = 24
    ): MemoryEntity = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val expires = if (isPermanent) Long.MAX_VALUE else now + (durationHours * 3600 * 1000L)
        val entity = MemoryEntity(
            key = key,
            value = value,
            category = category,
            createdAt = now,
            expiresAt = expires,
            isPermanent = isPermanent
        )
        memoryDao.insertMemory(entity)
        entity
    }

    suspend fun getMemoryContextPrompt(): String = withContext(Dispatchers.IO) {
        val list = memoryDao.getActiveMemories()
        if (list.isEmpty()) return@withContext ""

        buildString {
            append("\n[LIZA ACTIVE MEMORY VAULT (Persisted Context)]\n")
            list.forEach {
                val tag = if (it.isPermanent) "PERMANENT" else "24-HOUR"
                append("- ($tag) ${it.key}: ${it.value}\n")
            }
        }
    }

    suspend fun deleteMemory(id: String) = withContext(Dispatchers.IO) {
        memoryDao.deleteById(id)
    }

    suspend fun clearAll() = withContext(Dispatchers.IO) {
        memoryDao.clearAll()
    }
}
