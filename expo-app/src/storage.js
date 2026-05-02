import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_SETTINGS = 'wlt:settings'; // { initialWeight, targetWeight, createdAt }
const KEY_RECORDS = 'wlt:records';   // [{ date: 'YYYY-MM-DD', weight: number, note?: string }]

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY_SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export async function clearAll() {
  await AsyncStorage.multiRemove([KEY_SETTINGS, KEY_RECORDS]);
}

export async function getRecords() {
  try {
    const raw = await AsyncStorage.getItem(KEY_RECORDS);
    const arr = raw ? JSON.parse(raw) : [];
    // sort ascending by date
    arr.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return arr;
  } catch (e) {
    return [];
  }
}

export async function saveRecords(records) {
  await AsyncStorage.setItem(KEY_RECORDS, JSON.stringify(records));
}

// Upsert today's record (one entry per date)
export async function upsertRecord(date, weight, note = '') {
  const records = await getRecords();
  const idx = records.findIndex((r) => r.date === date);
  if (idx >= 0) {
    records[idx] = { ...records[idx], weight, note };
  } else {
    records.push({ date, weight, note });
  }
  records.sort((a, b) => (a.date < b.date ? -1 : 1));
  await saveRecords(records);
  return records;
}

export async function deleteRecord(date) {
  const records = await getRecords();
  const next = records.filter((r) => r.date !== date);
  await saveRecords(next);
  return next;
}
