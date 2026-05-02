package com.example.myapplication.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_settings")
data class UserSettings(
    @PrimaryKey
    val id: Int = 1,
    val initialWeight: Float,
    val targetWeight: Float,
    val createdAt: Long = System.currentTimeMillis()
)
