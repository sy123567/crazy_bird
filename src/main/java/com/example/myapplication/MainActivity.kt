package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myapplication.ui.screens.MainScreen
import com.example.myapplication.ui.theme.MyApplicationTheme
import com.example.myapplication.ui.viewmodel.WeightLossViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val app = application as WeightLossApp
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: WeightLossViewModel = viewModel(
                        factory = WeightLossViewModel.provideFactory(app.repository)
                    )
                    val uiState by viewModel.uiState.collectAsState()

                    MainScreen(
                        uiState = uiState,
                        onShowSettings = viewModel::showSettingsDialog,
                        onHideSettings = viewModel::hideSettingsDialog,
                        onSaveSettings = viewModel::saveSettings,
                        onShowWeightInput = viewModel::showWeightInputDialog,
                        onHideWeightInput = viewModel::hideWeightInputDialog,
                        onSaveWeight = viewModel::saveDailyWeight,
                        onDeleteRecord = viewModel::deleteRecord
                    )
                }
            }
        }
    }
}
