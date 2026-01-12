import Papa from 'papaparse';

export function parseCsvTextAuto(text) {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });
}

export function toCsv(rows) {
  return Papa.unparse(rows || []);
}

export async function loadAutoData() {
  const lastCsv = localStorage.getItem('piecework:lastCsv');
  if (lastCsv) {
    try {
      const rows = await parseCsvTextAuto(lastCsv);
      if (Array.isArray(rows) && rows.length) return rows;
    } catch {}
  }

  try {
    const r = await fetch('/data/piecework.json', { cache: 'no-store' });
    if (r.ok) {
      const json = await r.json();
      if (Array.isArray(json) && json.length) return json;
    }
  } catch {}

  try {
    const r = await fetch('/data/piecework.csv', { cache: 'no-store' });
    if (r.ok) {
      const text = await r.text();
      const rows = await parseCsvTextAuto(text);
      if (Array.isArray(rows) && rows.length) return rows;
    }
  } catch {}

  return [];
}
