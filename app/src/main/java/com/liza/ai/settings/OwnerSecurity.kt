package com.liza.ai.settings

import com.liza.ai.data.Constants

object OwnerSecurity {
    const val OWNER_IDENTITY = Constants.OWNER_NAME

    fun isOwner(input: String): Boolean {
        return input.trim().equals(OWNER_IDENTITY, ignoreCase = true) ||
               input.trim().contains("Paramveer", ignoreCase = true)
    }

    fun verifyAdminPin(pin: String): Boolean {
        // Default PIN for owner verification
        return pin == "1234" || pin == "8842"
    }
}
