# データ設計（Google Sheets → schedule.json）

スケジュール・リンクは **Google Sheets** で管理し、本サイト用に **schedule.json** へエクスポートして利用します。

## 推奨シート列（スプレッドシート）

| 列名 | 説明 | 例 |
|------|------|-----|
| group_id | 001〜042（URLキー） | 001 |
| group_name | グループ名 | グループ1 |
| theme_title | 探究テーマ/発表タイトル | 〇〇について |
| theme_detail | 発表概要 | 概要テキスト |
| timeslot_label | 表示用時間帯 | 10:00-10:10 |
| start_time | 開始時刻（任意） | 10:00 |
| end_time | 終了時刻（任意） | 10:10 |
| room_name | 教室名 | 3-2教室 |
| pdf_title | PDF名 | 参考資料 |
| pdf_drive_url | Drive共有リンク（組織内限定） | https://drive.google.com/... |
| pdf_embed_url | 埋め込み用URL | https://drive.google.com/.../preview |
| slides_title | スライド名 | 発表スライド |
| slides_view_url | 閲覧URL | .../view |
| slides_present_url | **投影用 present URL** | .../present |
| notes | 備考 | |

## Drive リンクの作り方

- **PDF 埋め込み用**: 共有リンクの `view` を `preview` に変更  
  `https://drive.google.com/file/d/{FILE_ID}/view` → `.../preview`
- **Slides 投影用**: 共有リンクの `view` を `present` に変更  
  `https://docs.google.com/presentation/d/{ID}/view` → `.../present`

## schedule.json の更新手順

1. Sheets でデータを編集
2. 次のいずれかで JSON を生成し、`data/schedule.json` を上書き
   - **手動**: アドオンや Apps Script で JSON エクスポート
   - **スクリプト**: `scripts/sheets-to-json.js` を実行（要設定）
3. サイトを再デプロイ（または JSON のみアップロード）

※ PDF/Slides は「組織内のみ」に統一し、Publish to the web は使用しないでください。
