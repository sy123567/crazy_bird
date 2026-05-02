package com.example.myapplication.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.myapplication.data.model.DailyRecord
import com.example.myapplication.data.model.UserSettings
import com.example.myapplication.ui.components.*
import com.example.myapplication.ui.viewmodel.WeightLossUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    uiState: WeightLossUiState,
    onShowSettings: () -> Unit,
    onHideSettings: () -> Unit,
    onSaveSettings: (Float, Float) -> Unit,
    onShowWeightInput: () -> Unit,
    onHideWeightInput: () -> Unit,
    onSaveWeight: (Float, String?) -> Unit,
    onDeleteRecord: (DailyRecord) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "减肥追踪",
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    IconButton(onClick = onShowSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "设置"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onShowWeightInput,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "记录体重"
                )
            }
        }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (uiState.userSettings == null) {
                    NoSettingsCard(onSetup = onShowSettings)
                } else {
                    SettingsSummaryCard(
                        settings = uiState.userSettings,
                        onEdit = onShowSettings
                    )

                    if (uiState.latestRecord != null) {
                        OverallProgressSection(
                            settings = uiState.userSettings,
                            latestRecord = uiState.latestRecord
                        )
                    }

                    TodayProgressCard(
                        latestRecord = uiState.latestRecord,
                        onRecordClick = onShowWeightInput
                    )
                }

                if (uiState.allRecords.isNotEmpty()) {
                    WeightChart(records = uiState.allRecords)
                }

                if (uiState.allRecords.isNotEmpty()) {
                    RecordsList(
                        records = uiState.allRecords,
                        onDeleteRecord = onDeleteRecord
                    )
                }

                Spacer(modifier = Modifier.height(80.dp))
            }
        }

        if (uiState.showSettingsDialog) {
            SettingsDialog(
                initialWeight = uiState.userSettings?.initialWeight,
                targetWeight = uiState.userSettings?.targetWeight,
                onDismiss = onHideSettings,
                onSave = onSaveSettings
            )
        }

        if (uiState.showWeightInputDialog) {
            WeightInputDialog(
                lastWeight = uiState.latestRecord?.weight,
                onDismiss = onHideWeightInput,
                onSave = onSaveWeight
            )
        }
    }
}

@Composable
fun NoSettingsCard(
    onSetup: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        ),
        onClick = onSetup
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "欢迎使用减肥追踪",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSecondaryContainer
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "点击设置初始体重和目标体重",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSecondaryContainer
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onSetup) {
                Text("开始设置")
            }
        }
    }
}

@Composable
fun SettingsSummaryCard(
    settings: UserSettings,
    onEdit: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        onClick = onEdit
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "初始体重",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${String.format("%.1f", settings.initialWeight)} kg",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "目标体重",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${String.format("%.1f", settings.targetWeight)} kg",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
fun OverallProgressSection(
    settings: UserSettings,
    latestRecord: DailyRecord,
    modifier: Modifier = Modifier
) {
    val totalToLose = settings.initialWeight - settings.targetWeight
    val alreadyLost = settings.initialWeight - latestRecord.weight
    val progress = if (totalToLose > 0) (alreadyLost / totalToLose * 100).coerceIn(0f, 100f) else 0f
    val remaining = latestRecord.weight - settings.targetWeight

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = "总体进度",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ProgressCard(
                title = "已减体重",
                value = "${String.format("%.1f", alreadyLost)} kg",
                subtitle = "相比初始体重",
                progress = progress.coerceAtMost(100f) / 100f,
                progressColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.weight(1f)
            )
            ProgressCard(
                title = "距离目标",
                value = "${String.format("%.1f", remaining)} kg",
                subtitle = "还需减重",
                modifier = Modifier.weight(1f)
            )
        }
    }
}
