/**
 * schedule.json のキー名をサイトが期待する形式に変換する（1回限り実行用）
 * 使い方: node scripts/fix-schedule-keys.js
 */
const fs = require('fs');
const path = require('path');

const schedulePath = path.join(__dirname, '..', 'data', 'schedule.json');
const raw = fs.readFileSync(schedulePath, 'utf8');
const data = JSON.parse(raw);

const keyMap = {
  'group id': 'group_id',
  'group name': 'group_name',
  'theme title': 'theme_title',
  'theme detail': 'theme_detail',
  timeslot: 'timeslot_label',
  room: 'room_name',
  'report drive url': 'pdf_drive_url',
  'report embed url': 'pdf_embed_url',
  'slides drive url': 'slides_pdf_drive_url',
  'slides embed url': 'slides_pdf_embed_url',
};

data.groups = data.groups.map(function (g) {
  const out = {};
  for (const [oldKey, newKey] of Object.entries(keyMap)) {
    if (g[oldKey] !== undefined) out[newKey] = g[oldKey];
  }
  // 詳細ページのリンク・識別は group_id で行う。URL を group.html?group_id=201-1 にするため group_id は group_name の値にする
  if (out.group_name) {
    out.group_id = out.group_name;
  }
  return out;
});

fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2), 'utf8');
console.log('変換完了:', schedulePath, '（グループ数:', data.groups.length, '）');
