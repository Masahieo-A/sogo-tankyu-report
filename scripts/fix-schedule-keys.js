/**
 * schedule.json のキー名をサイトが期待する形式に変換する（1回限り実行用）
 * 使い方: node scripts/fix-schedule-keys.js
 * 英語・日本語の両方の列名（スプレッドシート1行目）に対応します。
 */
const fs = require('fs');
const path = require('path');

const schedulePath = path.join(__dirname, '..', 'data', 'schedule.json');
const raw = fs.readFileSync(schedulePath, 'utf8');
const data = JSON.parse(raw);

// 1対1のキー変換（スペース区切り・ハイフン区切り両対応）
const keyMap = {
  'group id': 'group_id',
  'group-id': 'group_id',
  'group name': 'group_name',
  'group-name': 'group_name',
  'report drive url': 'pdf_drive_url',
  'report-drive-url': 'pdf_drive_url',
  'report embed url': 'pdf_embed_url',
  'report-embed-url': 'pdf_embed_url',
  'slides drive url': 'slides_pdf_drive_url',
  'slides-drive-url': 'slides_pdf_drive_url',
  'slides embed url': 'slides_pdf_embed_url',
  'slides-embed-url': 'slides_pdf_embed_url',
  'pdf embed url': 'slides_pdf_drive_url',
  'pdf-embed-url': 'slides_pdf_drive_url',
};
// 複数の候補キーから1つのターゲットへ（時間帯・教室・探究テーマなど。スペース/ハイフン/日本語対応）
const multiKeyMap = {
  theme_title: ['theme title', 'theme-title', '探究テーマ', 'テーマ'],
  theme_detail: ['theme detail', 'theme-detail', 'テーマ詳細', '発表概要', '概要'],
  timeslot_label: ['timeslot', 'timeslot_label', '時間帯', '発表時間'],
  room_name: ['room', 'room_name', '教室', '会場'],
};
const oldKeys = new Set(Object.keys(keyMap));
multiKeyMap.theme_title.forEach(function (k) { oldKeys.add(k); });
multiKeyMap.theme_detail.forEach(function (k) { oldKeys.add(k); });
multiKeyMap.timeslot_label.forEach(function (k) { oldKeys.add(k); });
multiKeyMap.room_name.forEach(function (k) { oldKeys.add(k); });

function pickFirstValue(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var val = obj[keys[i]];
    if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
  }
  for (var j = 0; j < keys.length; j++) {
    if (obj[keys[j]] !== undefined) return obj[keys[j]] != null ? String(obj[keys[j]]).trim() : '';
  }
  return '';
}

data.groups = data.groups.map(function (g) {
  const out = {};
  for (const [oldKey, newKey] of Object.entries(keyMap)) {
    if (g[oldKey] !== undefined) out[newKey] = g[oldKey];
  }
  for (const [targetKey, sourceKeys] of Object.entries(multiKeyMap)) {
    var val = pickFirstValue(g, sourceKeys);
    if (val !== undefined) out[targetKey] = val;
  }
  // すでに標準キー（アンダースコア入り）の項目はそのまま引き継ぐ（slides_present_url など）
  for (const key of Object.keys(g)) {
    if (oldKeys.has(key)) continue;
    if (key.indexOf('_') !== -1 || key === 'slides_present_url' || key === 'slides_view_url') {
      out[key] = g[key];
    }
  }
  if (out.group_name) {
    out.group_id = out.group_name;
  }
  return out;
});

fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2), 'utf8');
console.log('変換完了:', schedulePath, '（グループ数:', data.groups.length, '）');
