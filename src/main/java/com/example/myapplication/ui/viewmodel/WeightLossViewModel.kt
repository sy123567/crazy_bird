package com.example.myapplication.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.DailyRecord
import com.example.myapplication.data.model.UserSettings
import com.example.myapplication.data.repository.WeightRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class WeightLossUiState(
    val userSettings: UserSettings? = null,
    val latestRecord: DailyRecord? = null,
    val allRecords: List<DailyRecord> = emptyList(),
    val isLoading: Boolean = true,
    val showSettingsDialog: Boolean = false,
    val showWeightInputDialog: Boolean = false
)

class WeightLossViewModel(
    private val repository: WeightRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WeightLossUiState())
    val uiState: StateFlow<WeightLossUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            combine(
                repository.userSettings,
                repository.latestRecord,
                repository.allRecords
            ) { settings, latest, records ->
                WeightLossUiState(
                    userSettings = settings,
                    latestRecord = latest,
                    allRecords = records.sortedBy { it.date },
                    isLoading = false
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }

    fun saveSettings(initialWeight: Float, targetWeight: Float) {
        viewModelScope.launch {
            repository.saveUserSettings(initialWeight, targetWeight)
            _uiState.update { it.copy(showSettingsDialog = false) }
        }
    }

    fun saveDailyWeight(weight: Float, note: String? = null) {
        viewModelScope.launch {
            repository.saveDailyWeight(weight, note)
            _uiState.update { it.copy(showWeightInputDialog = false) }
        }
    }

    fun deleteRecord(record: DailyRecord) {
        viewModelScope.launch {
            repository.deleteRecord(record)
        }
    }

    fun showSettingsDialog() {
        _uiState.update { it.copy(showSettingsDialog = true) }
    }

    fun hideSettingsDialog() {
        _uiState.update { it.copy(showSettingsDialog = false) }
    }

    fun showWeightInputDialog() {
        _uiState.update { it.copy(showWeightInputDialog = true) }
    }

    fun hideWeightInputDialog() {
        _uiState.update { it.copy(showWeightInputDialog = false) }
    }

    fun getProgressPercentage(): Float {
        val settings = _uiState.value.userSettings ?: return 0f
        val latest = _uiState.value.latestRecord ?: return 0f
        val totalToLose = settings.initialWeight - settings.targetWeight
        if (totalToLose <= 0) return 0f
        val lost = settings.initialWeight - latest.weight
        return ((lost / totalToLose) * 100).coerceIn(0f, 100f)
    }

    fun getTotalLost(): Float {
        val settings = _uiState.value.userSettings ?: return 0f
        val latest = _uiState.value.latestRecord ?: return 0f
        return settings.initialWeight - latest.weight
    }

    fun getRemainingToTarget(): Float {
        val settings = _uiState.value.userSettings ?: return 0f
        val latest = _uiState.value.latestRecord ?: return 0f
        return latest.weight - settings.targetWeight
    }

    companion object {
        fun provideFactory(
            repository: WeightRepository
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return WeightLossViewModel(repository) as T
            }
        }
    }
}
