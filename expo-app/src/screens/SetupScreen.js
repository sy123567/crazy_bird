import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getSettings, saveSettings, clearAll } from '../storage';
import { todayStr } from '../utils';

export default function SetupScreen({ navigation, route }) {
  const editing = route?.params?.editing === true;
  const [initialWeight, setInitialWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      if (s) {
        setInitialWeight(String(s.initialWeight ?? ''));
        setTargetWeight(String(s.targetWeight ?? ''));
      }
      setLoading(false);
    })();
  }, []);

  const onSave = async () => {
    const iw = parseFloat(initialWeight);
    const tw = parseFloat(targetWeight);
    if (!isFinite(iw) || iw <= 0) {
      Alert.alert('提示', '请输入有效的初始体重');
      return;
    }
    if (!isFinite(tw) || tw <= 0) {
      Alert.alert('提示', '请输入有效的理想体重');
      return;
    }
    await saveSettings({
      initialWeight: iw,
      targetWeight: tw,
      createdAt: todayStr(),
    });
    navigation.replace('Home');
  };

  const onReset = () => {
    Alert.alert('确认重置', '将清空所有体重记录与设置,确定继续吗?', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          setInitialWeight('');
          setTargetWeight('');
        },
      },
    ]);
  };

  if (loading) return <View style={styles.container} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editing ? '编辑目标' : '欢迎使用减肥追踪'}</Text>
        <Text style={styles.subtitle}>
          {editing ? '修改你的初始体重与理想体重' : '先设置你的初始体重和理想体重'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>初始体重 (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="例如 75.5"
            value={initialWeight}
            onChangeText={setInitialWeight}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>理想体重 (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="例如 65.0"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
          <Text style={styles.primaryBtnText}>保存并开始</Text>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity style={styles.dangerBtn} onPress={onReset}>
            <Text style={styles.dangerBtnText}>清空所有数据</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, backgroundColor: '#f3faf6', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#065f46', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#4b5563', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dangerBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerBtnText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
});
