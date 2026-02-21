# 発表者用ページで Google スライドを表示する（schedule.json の書き換え）

発表者用ページでは **Google スライドのプレゼンモード**を優先して開くようにしています（アニメーション・投影に対応）。聴衆向けの PDF はそのままバックアップとして利用します。

---

## あなたが schedule.json で書き換えるべき項目

各グループ（`groups` の各要素）に、次の **2 項目を追加**してください。既存の PDF 用項目はそのままで構いません。

| キー名 | 必須 | 説明・値の例 |
|--------|------|----------------------|
| **`slides_present_url`** | **推奨** | Google スライドを **プレゼンモード**で開く URL。<br>例: `https://docs.google.com/presentation/d/【スライドID】/present` |
| **`slides_view_url`** | 任意 | Google スライドを **閲覧用**で開く URL。<br>例: `https://docs.google.com/presentation/d/【スライドID】/view` |

### URL の作り方

1. Google スライドをブラウザで開く。
2. アドレスバーの URL を確認する。
   - 例: `https://docs.google.com/presentation/d/1ABCdefGHIjkLMnOpqRStUvWxYz/edit`
3. 末尾を次のように変える。
   - **プレゼンモード用**: `/edit` を **`/present`** に変更  
     → `https://docs.google.com/presentation/d/1ABCdefGHIjkLMnOpqRStUvWxYz/present`
   - **閲覧用**: `/edit` を **`/view`** に変更  
     → `https://docs.google.com/presentation/d/1ABCdefGHIjkLMnOpqRStUvWxYz/view`

---

## 1 グループあたりの記述例（追加するだけ）

**現在（PDF のみ）の例:**

```json
{
  "group_id": "201-1",
  "group_name": "201-1",
  "theme_title": "",
  "theme_detail": "",
  "timeslot_label": "第1発表",
  "room_name": "3-2教室",
  "pdf_drive_url": "https://drive.google.com/file/d/.../view",
  "pdf_embed_url": "https://drive.google.com/file/d/.../preview",
  "slides_pdf_drive_url": "https://drive.google.com/file/d/.../view",
  "slides_pdf_embed_url": "https://drive.google.com/file/d/.../preview"
}
```

**追加後（Google スライド用を足した例）:**

```json
{
  "group_id": "201-1",
  "group_name": "201-1",
  "theme_title": "",
  "theme_detail": "",
  "timeslot_label": "第1発表",
  "room_name": "3-2教室",
  "pdf_drive_url": "https://drive.google.com/file/d/.../view",
  "pdf_embed_url": "https://drive.google.com/file/d/.../preview",
  "slides_pdf_drive_url": "https://drive.google.com/file/d/.../view",
  "slides_pdf_embed_url": "https://drive.google.com/file/d/.../preview",
  "slides_present_url": "https://docs.google.com/presentation/d/【このグループのスライドID】/present",
  "slides_view_url": "https://docs.google.com/presentation/d/【このグループのスライドID】/view"
}
```

- **`slides_present_url`** を入れると、発表者用ページでグループを選んだときに、その URL が **一発で新規タブに開きます**（プレゼンモード）。
- **`slides_view_url`** は任意です。プレゼン用と閲覧用の両方のリンクを出したい場合だけ追加してください。
- **`slides_pdf_drive_url`** と **`slides_pdf_embed_url`** は **聴衆向け・バックアップ用**のまま変更不要です。

---

## まとめ

| 項目 | 用途 | 書き換え |
|------|------|----------|
| `slides_present_url` | 発表者用・プレゼンモードで開く | **追加する**（Google スライドの `/present` URL） |
| `slides_view_url` | 発表者用・閲覧用で開く | 任意で追加（Google スライドの `/view` URL） |
| `slides_pdf_drive_url` | 聴衆向け・バックアップ | 今のままでよい |
| `slides_pdf_embed_url` | 聴衆向け・埋め込み表示 | 今のままでよい |

スプレッドシートから JSON を書き出している場合は、シートに **`slides_present_url`** と **`slides_view_url`** の列を追加し、上記の形式の URL を入力してからエクスポートしてください。
