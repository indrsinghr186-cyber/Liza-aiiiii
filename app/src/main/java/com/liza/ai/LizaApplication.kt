package com.liza.ai

import android.app.Application
import com.liza.ai.memory.MemoryDatabase
import com.liza.ai.settings.SettingsRepository

/**
 * LizaApplication
 * Initializes application-wide Singletons (Room DB, Settings, Native services)
 */
class LizaApplication : Application() {

    lateinit var database: MemoryDatabase
        private set

    lateinit var settingsRepository: SettingsRepository
        private set

    companion object {
        lateinit var instance: LizaApplication
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        database = MemoryDatabase.getDatabase(this)
        settingsRepository = SettingsRepository(this)
    }
}
