package com.example.myapplication

import android.app.Application
import com.example.myapplication.data.local.AppDatabase
import com.example.myapplication.data.repository.WeightRepository

class WeightLossApp : Application() {
    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy {
        WeightRepository(
            database.userSettingsDao(),
            database.dailyRecordDao()
        )
    }
}
