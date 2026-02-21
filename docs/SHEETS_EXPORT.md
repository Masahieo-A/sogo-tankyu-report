# リンクは「スプレッドシートだけ」に入れる（JSON に 84 回ペースト不要）

## 結論

- **参考資料 PDF 42本・発表スライド PDF 42本のリンクは、すべて Google スプレッドシートの表に貼り付けるだけ**でよいです（発表スライドは PDF で保存する運用です）。
- **JSON に 1本ずつコピペする必要はありません。** スプレッドシートがマスタで、そこから `schedule.json` を**一括で生成**します。

## データの流れ

1. **Google スプレッドシート**で 1 行 = 1 グループ（42 行）。各列に PDF のリンク・スライドのリンクなどを入力。
2. リンクは **スプレッドシートにだけ**入力（合計 84 個でも、表のセルに貼るだけ）。
3. **スプレッドシート → schedule.json** を **1 回の操作**で実行（下記の「方法1」または「方法2」）。
4. 生成された `data/schedule.json` をリポジトリに commit → push すればサイトに反映。

---

## 方法1: Google Apps Script で JSON をコピー（スプレッドシートだけ編集）

1. スプレッドシートを開く → **拡張機能** → **Apps Script**
2. 下記のスクリプトを貼り付けて保存
3. 1行目を**列名（ヘッダー）**にし、2行目以降に 42 グループ分のデータを入力（リンクはこの表に貼るだけ）
4. Apps Script で **実行** → **ログ**に表示された JSON を**全選択してコピー**
5. プロジェクトの `data/schedule.json` を開き、**中身をすべて削除してコピーした JSON を1回貼り付けて保存**

これで **84 個のリンクを JSON に直接ペーストする必要はありません**（スプレッドシートに貼る → 1回だけ JSON を貼り替え）。

### 列名（1行目）の例

```
group_id	group_name	theme_title	theme_detail	timeslot_label	room_name	pdf_title	pdf_drive_url	pdf_embed_url	slides_title	slides_pdf_drive_url	slides_pdf_embed_url	slides_present_url	slides_view_url	notes
```

**※ スライドの使い分け**  
- **聴衆向け（グループ詳細ページ）**: `slides_pdf_drive_url` と `slides_pdf_embed_url`（PDF、バックアップ兼用）。  
- **発表者用ページ**: `slides_present_url`（Google スライドのプレゼンモード）を追加すると、発表者用で一発で開けます。任意で `slides_view_url`（閲覧用）も追加できます。詳しくは **`docs/PRESENTER_GOOGLE_SLIDES.md`** を参照してください。

**この項目を少し変更してもよいですか？**  
→ **列の追加・並び替え・不要な列の削除は自由です。** 列名（1行目）を変えると、出力される JSON のキーも変わり、サイトがその項目を読めなくなることがあります。詳しくは **`docs/DATA_SCHEMA.md`** を参照してください。

### Apps Script（貼り付けて実行）

```javascript
function exportScheduleJson() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log('2行以上必要です（1行目=ヘッダー、2行目以降=データ）');
    return;
  }
  var headers = data[0].map(function (h) { return h != null ? String(h).trim() : ''; });
  var groups = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var val = row[c];
      obj[headers[c]] = val != null ? String(val).trim() : '';
    }
    groups.push(obj);
  }
  var out = {
    eventTitle: '総合探究成果報告会',
    eventDate: '2025年〇月〇日',
    notice: '学内限定です。PDF・スライドは組織内のみ閲覧可能です。',
    groups: groups
  };
  Logger.log(JSON.stringify(out, null, 2));
}
```

1. **実行** → `exportScheduleJson` を選択 → 実行（初回は権限を許可）
2. **表示** → **ログ** を開く → 表示された JSON をすべてコピー
3. `data/schedule.json` をその内容で**まるごと上書き保存**

---

## 方法2: スプレッドシートを「ウェブに公開（CSV）」してスクリプトで JSON 生成（コピペ不要）

スプレッドシートの**表だけ**を「ウェブに公開」で CSV として出し、ローカルで 1 コマンド実行すると `data/schedule.json` が自動で更新されます。**JSON へのコピペは一度も不要**です。

- 注意: スプレッドシートの内容（グループ名・テーマ・時間・**リンクURL**）は、公開用 CSV の URL を知っている人には見られます。リンクそのものは組織限定の Drive なので、**ファイルの中身**は組織外には開けません。表の公開が気になる場合は方法1を使ってください。

### 手順

1. スプレッドシートで 1行目＝ヘッダー、2～43行目＝42グループのデータにする（リンクはここにだけ貼る）。
2. **ファイル** → **共有** → **ウェブに公開**（または「公開」タブ）→ **リンク**で「ウェブページ」ではなく **「CSV」** を選ぶ → リンクをコピー。
3. プロジェクトで:
   ```bash
   node scripts/sheets-to-json.js "ここにCSVのURLを貼る"
   ```
4. `data/schedule.json` が上書きされるので、`git add data/schedule.json && git commit -m "スケジュール更新" && git push` で反映。

CSV の URL は `scripts/sheets-to-json.js` の先頭で定数として書いておいてもよいです（後述）。

---

## まとめ

| 作業 | 回数 |
|------|------|
| リンクをスプレッドシートのセルに貼る | 84 回（参考資料PDF・発表スライドPDF 各42本を表に貼るだけ） |
| JSON にリンクを 1 本ずつペースト | **0 回**（しない） |
| スプレッドシート → JSON の更新 | **1 回**（Apps Script でコピーして JSON をまるごと貼り替え、またはスクリプト 1 実行） |

PDF・スライドは Drive に置き、共有設定をしたうえで、**リンクはすべてスプレッドシートで管理し、JSON はスプレッドシートから一括生成する**運用にすれば、84 個を JSON に手で貼る必要はありません。
