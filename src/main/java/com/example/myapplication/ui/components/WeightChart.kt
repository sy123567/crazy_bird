package com.example.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.myapplication.data.model.DailyRecord
import com.patrykandpatrick.vico.compose.axis.horizontal.rememberBottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.rememberStartAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.chart.line.lineSpec
import com.patrykandpatrick.vico.compose.component.textComponent
import com.patrykandpatrick.vico.compose.dimensions.dimensionsOf
import com.patrykandpatrick.vico.core.axis.AxisPosition
import com.patrykandpatrick.vico.core.axis.formatter.AxisValueFormatter
import com.patrykandpatrick.vico.core.entry.ChartEntryModelProducer
import com.patrykandpatrick.vico.core.entry.entryOf

@Composable
fun WeightChart(
    records: List<DailyRecord>,
    modifier: Modifier = Modifier
) {
    if (records.isEmpty()) {
        Card(
            modifier = modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp)
                    .padding(16.dp)
            ) {
                Text(
                    text = "暂无数据，请先记录体重",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        return
    }

    val sortedRecords = remember(records) { records.sortedBy { it.date } }

    val chartEntryModelProducer = remember(sortedRecords) {
        ChartEntryModelProducer(
            sortedRecords.mapIndexed { index, record ->
                entryOf(index.toFloat(), record.weight)
            }
        )
    }

    val dateLabels = remember(sortedRecords) {
        sortedRecords.map { DateUtils.formatDate(it.date) }
    }

    val bottomAxisValueFormatter = AxisValueFormatter<AxisPosition.Horizontal.Bottom> { value, _ ->
        dateLabels.getOrElse(value.toInt()) { "" }
    }

    val lineSpecs = listOf(
        lineSpec(
            lineColor = Color(0xFF4CAF50),
            lineBackgroundShader = null
        )
    )

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "体重趋势",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(16.dp))
            Chart(
                chart = lineChart(lineSpecs),
                chartModelProducer = chartEntryModelProducer,
                startAxis = rememberStartAxis(
                    label = textComponent(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        padding = dimensionsOf(end = 8.dp)
                    ),
                    guideline = null
                ),
                bottomAxis = rememberBottomAxis(
                    label = textComponent(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        padding = dimensionsOf(top = 4.dp)
                    ),
                    guideline = null,
                    valueFormatter = bottomAxisValueFormatter
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
            )
        }
    }
}
