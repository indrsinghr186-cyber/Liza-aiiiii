package com.liza.ai.memory

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface MemoryDao {

    @Query("SELECT * FROM memories WHERE isPermanent = 1 OR expiresAt > :currentTime ORDER BY createdAt DESC")
    fun getActiveMemoriesFlow(currentTime: Long = System.currentTimeMillis()): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE isPermanent = 1 OR expiresAt > :currentTime ORDER BY createdAt DESC")
    suspend fun getActiveMemories(currentTime: Long = System.currentTimeMillis()): List<MemoryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: MemoryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(memories: List<MemoryEntity>)

    @Delete
    suspend fun deleteMemory(memory: MemoryEntity)

    @Query("DELETE FROM memories WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM memories WHERE isPermanent = 0 AND expiresAt <= :currentTime")
    suspend fun purgeExpiredMemories(currentTime: Long = System.currentTimeMillis()): Int

    @Query("DELETE FROM memories")
    suspend fun clearAll()
}
