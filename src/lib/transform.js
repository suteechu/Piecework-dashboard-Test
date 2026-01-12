// Utilities + ตัวแปลงข้อมูลสำหรับ Piece Work Dashboard

const toNum = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const n = Number(v.replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const unique = (arr) => [...new Set(arr)];
const monthKeyOf = (y, m) => `${y}-${String(m).padStart(2, "0")}-01`;

export function detectColumns(rows) {
  const sample = rows?.[0] || {};
  const keys = Object.keys(sample);
  const pick = (re, fb = null) => keys.find((k) => re.test(k)) || fb;

  const yearKey    = pick(/^year$/i);
  const monthKey   = pick(/^month$/i);
  const dateKey    = pick(/date|เดือน|วันที่/i);
  const sectionKey = pick(/^(section|หมวด|แผนก|ประเภท)$/i, "Section");
  const amountKey  = pick(/^(amount|ยอด|ค่าใช้จ่าย|total|sum)$/i, "Amount");
  const numberKey  = pick(/^(number(\s*of)?(\s*people)?)$/i);
  const avgKey     = pick(/(avg|average)/i);
  return { yearKey, monthKey, dateKey, sectionKey, amountKey, numberKey, avgKey };
}

export function normalizeRows(rawRows) {
  if (!Array.isArray(rawRows)) return [];
  const { yearKey, monthKey, dateKey, sectionKey, amountKey, numberKey, avgKey } =
    detectColumns(rawRows);

  return rawRows
    .map((r) => {
      let year, month, date;
      if (yearKey && monthKey) {
        year = toNum(r[yearKey]); month = toNum(r[monthKey]);
        date = new Date(year, month - 1, 1);
      } else if (dateKey) {
        date = new Date(r[dateKey]); year = date.getFullYear(); month = date.getMonth() + 1;
      } else {
        date = new Date(); year = date.getFullYear(); month = date.getMonth() + 1;
      }

      return {
        section: String(r[sectionKey] ?? "").trim(),
        amount : toNum(r[amountKey]),
        count  : numberKey ? toNum(r[numberKey]) : 0,
        average: avgKey ? toNum(r[avgKey]) : 0,
        year, month, date,
        monthKey: monthKeyOf(year, month),
      };
    })
    .filter((r) => r.section);
}

export function filterRows(rows, { year = "all", section = "all", monthFrom = 1, monthTo = 12 }) {
  return rows.filter((r) => {
    const yOk = year === "all" || r.year === Number(year);
    const mOk = r.month >= monthFrom && r.month <= monthTo;
    const sOk = section === "all" || r.section === section;
    return yOk && mOk && sOk;
  });
}

export function kpiFromRows(rows) {
  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
  const totalCount  = rows.reduce((s, r) => s + (r.count || 0), 0);
  const sections    = unique(rows.map((r) => r.section)).length;
  return { sections, totalAmount, count: totalCount || rows.length };
}

export function monthlyTotalSeries(rows) {
  const byMonth = new Map();
  rows.forEach((r) => byMonth.set(r.monthKey, (byMonth.get(r.monthKey) || 0) + r.amount));
  return [...byMonth.entries()]
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([x, y]) => ({ x, y }));
}

export function sectionLineSeries(rows) {
  const months = unique(rows.map((r) => r.monthKey)).sort((a, b) => new Date(a) - new Date(b));
  const bucket = new Map();
  rows.forEach((r) => {
    const key = `${r.section}|${r.monthKey}`;
    bucket.set(key, (bucket.get(key) || 0) + r.amount);
  });
  const sections = unique(rows.map((r) => r.section)).sort();
  return sections.map((name) => ({
    name, x: months, y: months.map((m) => bucket.get(`${name}|${m}`) || 0),
    mode: "lines+markers",
  }));
}

export function sectionTotals(rows) {
  const sums = new Map();
  rows.forEach((r) => sums.set(r.section, (sums.get(r.section) || 0) + r.amount));
  return { labels: [...sums.keys()], values: [...sums.values()] };
}
