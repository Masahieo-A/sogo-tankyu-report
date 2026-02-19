# Google Sheets から schedule.json を出力する

## 方法1: Google Apps Script で JSON を取得

1. スプレッドシートを開く → **拡張機能** → **Apps Script**
2. 次のようなスクリプトを貼り付けて保存・実行（「実行」で一度権限を許可）

```javascript
function exportScheduleJson() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0];
  var rows = data.slice(1);
  var groups = rows.map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] != null ? String(row[i]).trim() : '';
    });
    return obj;
  });
  var out = {
    eventTitle: '総合探究成果報告会',
    eventDate: sheet.getParent().getName() || '', // または固定日付
    notice: '学内限定です。PDF・スライドは組織内のみ閲覧可能です。',
    groups: groups
  };
  Logger.log(JSON.stringify(out, null, 2));
  // ログに出るのでコピーして data/schedule.json に貼り付け
  // または Drive にファイルとして保存する処理を追加可能
}
```

3. **実行** → **exportScheduleJson** を選択 → 実行
4. **表示** → **ログ** で出力された JSON をコピーし、プロジェクトの `data/schedule.json` に貼り付けて保存

## 方法2: 手動で CSV エクスポート → JSON 変換

1. シートを **ファイル → ダウンロード → カンマ区切り値 (.csv)** でダウンロード
2. オンラインの CSV→JSON 変換ツールや、ローカルの簡易スクリプトで `schedule.json` の形式に合わせて変換
3. `eventTitle` / `eventDate` / `notice` / `groups` の形になるよう整形する

## 列名の対応

Sheets の1行目（ヘッダー）は、`schedule.json` の各グループオブジェクトのキーと一致させてください。  
例: `group_id`, `group_name`, `theme_title`, `timeslot_label`, `room_name`, `pdf_drive_url`, `pdf_embed_url`, `slides_view_url`, `slides_present_url` など（`docs/DATA_SCHEMA.md` 参照）。

## 本番前の確認

- `slides_present_url` は必ず **/present** のURLになっているか
- PDF の `pdf_embed_url` は **/preview** のURLか
- すべてのリンクは「組織内のみ」共有で、Publish to the web にしていないか
