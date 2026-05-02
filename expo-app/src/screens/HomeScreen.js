import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import {
  getSettings,
  getRecords,
  upsertRecord,
  deleteRecord,
} from '../storage';
import { todayStr, formatNum, shortDate, computeProgress } from '../utils';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [settings, setSettings] = useState(null);
  const [records, setRecords] = useState([]);
  const [todayInput, setTodayInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const s = await getSettings();
    if (!s) {
      navigation.replace('Setup');
      return;
    }
    const recs = await getRecords();
    setSettings(s);
    setRecords(recs);
    const today = todayStr();
    const todayRec = recs.find((r) => r.date === today);
    setTodayInput(todayRec ? String(todayRec.weight) : '');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onSaveToday = async () => {
    const w = parseFloat(todayInput);
    if (!isFinite(w) || w <= 0) {
      Alert.alert('提示', '请输入有效的体重数值');
      return;
    }
    const next = await upsertRecord(todayStr(), w);
    setRecords(next);
  };

  const onDelete = (date) => {
    Alert.alert('删除记录', `确定删除 ${date} 的记录吗?`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const next = await deleteRecord(date);
          setRecords(next);
          if (date === todayStr()) setTodayInput('');
        },
      },
    ]);
  };

  if (!settings) return <View style={styles.container} />;

  const today = todayStr();
  const todayRec = records.find((r) => r.date === today);
  const sorted = records; // already sorted asc

  // Yesterday = the most recent record strictly before today
  const beforeToday = sorted.filter((r) => r.date < today);
  const yesterdayRec = beforeToday.length ? beforeToday[beforeToday.length - 1] : null;

  const currentWeight = todayRec
    ? todayRec.weight
    : sorted.length
    ? sorted[sorted.length - 1].weight
    : settings.initialWeight;

  // Diff vs yesterday (negative = lost weight, good)
  const diffYesterday =
    todayRec && yesterdayRec ? todayRec.weight - yesterdayRec.weight : null;

  // Total lost from initial weight
  const totalLost = settings.initialWeight - currentWeight;

  // Distance to target
  const toTarget = currentWeight - settings.targetWeight;

  // Overall progress %
  const progress = computeProgress(
    settings.initialWeight,
    settings.targetWeight,
    currentWeight
  );

  // Chart data: include initial point + records
  const chartPoints = [
    { date: settings.createdAt || (sorted[0]?.date ?? today), weight: settings.initialWeight, isInitial: true },
    ...sorted,
  ];
  // De-dup if initial date matches a record date
  const dedup = [];
  const seen = new Set();
  for (const p of chartPoints) {
    if (seen.has(p.date)) continue;
    seen.add(p.date);
    dedup.push(p);
  }
  // Limit to last 14 points for readability
  const chartData = dedup.slice(-14);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#10b981' },
    propsForBackgroundLines: { stroke: '#e5e7eb' },
  };

  const diffColor =
    diffYesterday == null
      ? '#6b7280'
      : diffYesterday < 0
      ? '#10b981'
      : diffYesterday > 0
      ? '#ef4444'
      : '#6b7280';
  const diffArrow =
    diffYesterday == null ? '–' : diffYesterday < 0 ? '↓' : diffYesterday > 0 ? '↑' : '→';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f3faf6' }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 顶部目标卡片 */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>我的目标</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Setup', { editing: true })}>
            <Text style={styles.linkText}>编辑</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>初始体重</Text>
            <Text style={styles.metricValue}>{formatNum(settings.initialWeight)} kg</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>理想体重</Text>
            <Text style={styles.metricValue}>{formatNum(settings.targetWeight)} kg</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>当前体重</Text>
            <Text style={styles.metricValue}>{formatNum(currentWeight)} kg</Text>
          </View>
        </View>
      </View>

      {/* 总进度卡片 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>总进度</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFg, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPct}>{formatNum(progress, 1)}%</Text>
        <View style={styles.row}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>已减</Text>
            <Text style={[styles.metricValue, { color: totalLost >= 0 ? '#10b981' : '#ef4444' }]}>
              {totalLost >= 0 ? '' : '+'}
              {formatNum(Math.abs(totalLost))} kg
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>距目标</Text>
            <Text style={styles.metricValue}>
              {formatNum(Math.abs(toTarget))} kg
            </Text>
          </View>
        </View>
      </View>

      {/* 今日记录 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>今日记录 ({today})</Text>
        <View style={[styles.row, { alignItems: 'center' }]}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="decimal-pad"
            placeholder="输入今日体重 (kg)"
            value={todayInput}
            onChangeText={setTodayInput}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={onSaveToday}>
            <Text style={styles.saveBtnText}>保存</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.diffRow}>
          <Text style={styles.metricLabel}>与昨日对比</Text>
          <Text style={[styles.diffValue, { color: diffColor }]}>
            {diffArrow}{' '}
            {diffYesterday == null
              ? '暂无对比'
              : `${formatNum(Math.abs(diffYesterday))} kg`}
          </Text>
        </View>
        {yesterdayRec && (
          <Text style={styles.helper}>
            昨日 ({yesterdayRec.date}): {formatNum(yesterdayRec.weight)} kg
          </Text>
        )}
      </View>

      {/* 折线图 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>体重趋势</Text>
        {chartData.length >= 2 ? (
          <LineChart
            data={{
              labels: chartData.map((p) => shortDate(p.date)),
              datasets: [
                { data: chartData.map((p) => Number(p.weight)) },
                // target line
                {
                  data: chartData.map(() => Number(settings.targetWeight)),
                  color: () => 'rgba(239, 68, 68, 0.6)',
                  withDots: false,
                },
              ],
              legend: ['体重 (kg)', '目标'],
            }}
            width={screenWidth - 56}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        ) : (
          <Text style={styles.helper}>至少记录 1 天后将显示折线图</Text>
        )}
      </View>

      {/* 历史记录 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>历史记录</Text>
        {sorted.length === 0 && <Text style={styles.helper}>暂无记录</Text>}
        {[...sorted].reverse().map((r, idx, arr) => {
          const prev = arr[idx + 1]; // older record
          const d = prev ? r.weight - prev.weight : null;
          const c =
            d == null ? '#6b7280' : d < 0 ? '#10b981' : d > 0 ? '#ef4444' : '#6b7280';
          return (
            <TouchableOpacity
              key={r.date}
              onLongPress={() => onDelete(r.date)}
              style={styles.recordRow}
            >
              <Text style={styles.recordDate}>{r.date}</Text>
              <Text style={styles.recordWeight}>{formatNum(r.weight)} kg</Text>
              <Text style={[styles.recordDiff, { color: c }]}>
                {d == null ? '—' : `${d <= 0 ? '↓' : '↑'} ${formatNum(Math.abs(d))}`}
              </Text>
            </TouchableOpacity>
          );
        })}
        {sorted.length > 0 && (
          <Text style={[styles.helper, { marginTop: 6 }]}>长按记录可删除</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#065f46', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metric: { flex: 1, alignItems: 'flex-start' },
  metricLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  linkText: { color: '#10b981', fontWeight: '600' },
  progressBarBg: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5f5ec',
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFg: { height: '100%', backgroundColor: '#10b981' },
  progressPct: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  diffValue: { fontSize: 20, fontWeight: '800' },
  helper: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recordDate: { fontSize: 14, color: '#374151', flex: 1 },
  recordWeight: { fontSize: 16, fontWeight: '700', color: '#111827', width: 90, textAlign: 'right' },
  recordDiff: { fontSize: 14, fontWeight: '600', width: 80, textAlign: 'right' },
});
