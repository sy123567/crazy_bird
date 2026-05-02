package com.example.myapplication.data.local

import androidx.room.*
import com.example.myapplication.data.model.DailyRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyRecordDao {
    @Query("SELECT * FROM daily_records ORDER BY date DESC")
    fun getAllRecords(): Flow<List<DailyRecord>>

    @Query("SELECT * FROM daily_records WHERE date = :date LIMIT 1")
    suspend fun getRecordByDate(date: Long): DailyRecord?

    @Query("SELECT * FROM daily_records ORDER BY date DESC LIMIT 1")
    suspend fun getLatestRecord(): DailyRecord?

    @Query("SELECT * FROM daily_records ORDER BY date DESC LIMIT 1")
    fun getLatestRecordFlow(): Flow<DailyRecord?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: DailyRecord): Long

    @Update
    suspend fun update(record: DailyRecord)

    @Delete
    suspend fun delete(record: DailyRecord)

    @Query("DELETE FROM daily_records")
    suspend fun deleteAll()
}
