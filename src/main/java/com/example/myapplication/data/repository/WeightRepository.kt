package com.example.myapplication.data.repository

import com.example.myapplication.data.local.DailyRecordDao
import com.example.myapplication.data.local.UserSettingsDao
import com.example.myapplication.data.model.DailyRecord
import com.example.myapplication.data.model.UserSettings
import kotlinx.coroutines.flow.Flow
import java.util.Calendar

class WeightRepository(
    private val userSettingsDao: UserSettingsDao,
    private val dailyRecordDao: DailyRecordDao
) {
    val userSettings: Flow<UserSettings?> = userSettingsDao.getSettings()
    val allRecords: Flow<List<DailyRecord>> = dailyRecordDao.getAllRecords()
    val latestRecord: Flow<DailyRecord?> = dailyRecordDao.getLatestRecordFlow()

    suspend fun saveUserSettings(initialWeight: Float, targetWeight: Float) {
        val settings = UserSettings(
            id = 1,
            initialWeight = initialWeight,
            targetWeight = targetWeight
        )
        userSettingsDao.insertOrUpdate(settings)
    }

    suspend fun saveDailyWeight(weight: Float, note: String? = null) {
        val today = getTodayStartMillis()
        val existingRecord = dailyRecordDao.getRecordByDate(today)
        val yesterdayRecord = dailyRecordDao.getLatestRecord()

        val weightChange = if (yesterdayRecord != null) {
            weight - yesterdayRecord.weight
        } else {
            0f
        }

        if (existingRecord != null) {
            val updatedRecord = existingRecord.copy(
                weight = weight,
                weightChange = weightChange,
                note = note
            )
            dailyRecordDao.update(updatedRecord)
        } else {
            val newRecord = DailyRecord(
                date = today,
                weight = weight,
                weightChange = weightChange,
                note = note
            )
            dailyRecordDao.insert(newRecord)
        }
    }

    suspend fun deleteRecord(record: DailyRecord) {
        dailyRecordDao.delete(record)
    }

    suspend fun clearAllData() {
        userSettingsDao.deleteAll()
        dailyRecordDao.deleteAll()
    }

    private fun getTodayStartMillis(): Long {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return calendar.timeInMillis
    }
}
