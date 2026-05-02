export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatNum(n, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '--';
  return Number(n).toFixed(digits);
}

export function shortDate(s) {
  // 'YYYY-MM-DD' -> 'MM/DD'
  if (!s || s.length < 10) return s;
  return `${s.slice(5, 7)}/${s.slice(8, 10)}`;
}

// Compute progress % towards target.
// Loss progress = (initial - current) / (initial - target) clamped to [0, 100].
// Handles weight gain target as well.
export function computeProgress(initial, target, current) {
  if (initial == null || target == null || current == null) return 0;
  const total = initial - target;
  if (total === 0) return 100;
  const done = initial - current;
  const pct = (done / total) * 100;
  return Math.max(0, Math.min(100, pct));
}
