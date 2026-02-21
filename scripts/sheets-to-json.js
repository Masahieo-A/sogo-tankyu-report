/**
 * Google スプレッドシート「ウェブに公開」の CSV URL から schedule.json を生成する。
 * 使い方: node scripts/sheets-to-json.js [CSVのURL]
 * URL を省略した場合は下の DEFAULT_CSV_URL を使う（中身を書き換えてください）。
 */

const fs = require('fs');
const path = require('path');

// スプレッドシートを「ウェブに公開」→ CSV の URL をここに貼っても可
const DEFAULT_CSV_URL = '';

const csvUrl = process.argv[2] || DEFAULT_CSV_URL;
if (!csvUrl) {
  console.error('使い方: node scripts/sheets-to-json.js "https://docs.google.com/.../export?format=csv&..."');
  process.exit(1);
}

function parseCsv(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === '\n' && !inQuotes) || (c === '\r' && !inQuotes)) {
      if (current) lines.push(current);
      current = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += c;
    }
  }
  if (current) lines.push(current);

  return lines.map((line) => {
    const row = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === '\t' || c === ',') && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    row.push(cell.trim());
    return row;
  });
}

async function main() {
  const res = await fetch(csvUrl);
  if (!res.ok) {
    console.error('CSV の取得に失敗しました:', res.status);
    process.exit(1);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    console.error('2行以上必要です（1行目=ヘッダー、2行目以降=データ）');
    process.exit(1);
  }

  const headers = rows[0].map((h) => (h != null ? String(h).trim() : ''));
  const groups = rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] != null ? String(row[i]).trim() : '';
    });
    return obj;
  });

  const out = {
    eventTitle: '総合探究成果報告会',
    eventDate: '2025年〇月〇日',
    notice: '学内限定です。PDF・スライドは組織内のみ閲覧可能です。',
    groups,
  };

  const outPath = path.join(__dirname, '..', 'data', 'schedule.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('書き出し完了:', outPath, '（グループ数:', groups.length, '）');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
