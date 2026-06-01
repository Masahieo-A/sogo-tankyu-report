# Apps Script セットアップガイド

このフォルダのコードを Google スプレッドシートに貼り付けることで、  
**Classroom 提出 → PDF変換 → サイト反映** を半自動化できます。

---

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `config.gs` | 列番号・シート名・設定キーの定数 |
| `main.gs` | メニュー定義・処理の司令塔 |
| `classroom.gs` | Google Classroom API から提出物を取得 |
| `drive.gs` | Drive のファイル整理・PDF変換 |
| `sheets.gs` | スプレッドシートの読み書き・JSON生成 |
| `github.gs` | GitHub API で schedule.json を更新 |
| `template.gs` | 探究レポート用 Slides テンプレートを自動生成 |

---

## セットアップ手順

### 1. Google スプレッドシートを作成

任意の名前で新しいスプレッドシートを作成してください。

### 2. Apps Script エディタを開く

スプレッドシートのメニューから  
**「拡張機能」→「Apps Script」** を選択。

### 3. コードを貼り付ける

左のファイル一覧に `+` ボタンでファイルを追加し、  
このフォルダの `.gs` ファイルの内容をそれぞれコピー＆ペーストしてください。

> **順番は問いません。** ファイル名は `.gs` を除いた名前（例: `config`）にしてください。

### 4. 必要なサービスを有効化

Apps Script エディタの左メニュー「サービス」(＋) から以下を追加：

- **Google Classroom API**（Classroom v1）
- **Google Drive API**（Drive v3）
- **Google Slides API**（Slides v1）

### 5. スクリプトを保存して実行

1. 保存（Ctrl+S）
2. スプレッドシートに戻り、メニューの **「📋 発表会サイト管理」** をクリック
3. **「🔧 初期セットアップ（シート生成）」** を実行  
   → 「設定」「グループ一覧」「生徒対応」の3シートが自動生成されます

### 6. 各シートに情報を入力

**「設定」シート（B列）：**

| キー | 入力内容 |
|------|---------|
| GitHub Token | GitHubで発行したPersonal Access Token（`repo`権限） |
| GitHub Owner | GitHubのユーザー名 |
| GitHub Repo | リポジトリ名（例: `sogo-tankyu-report`） |
| Classroom Course ID | ClassroomのコースID（URLの末尾の数字） |
| Report Assignment ID | レポート課題のID（下記参照） |
| Slides Assignment ID | スライド課題のID |
| Output Folder ID | PDF保存先のDriveフォルダID |

> **Classroom の課題IDの確認方法：**  
> 課題を開いて URL の末尾 `.../details/課題ID` の数字部分

**「グループ一覧」シート：**  
A〜F列（group_id〜theme_detail）を手入力。G列以降はスクリプトが自動入力します。

**「生徒対応」シート：**  
Classroom でのフルネーム（例: 富田太郎）と group_id の対応を入力。

---

## 運用フロー（発表会当日までの作業）

```
① 課題締切後
    └─ 「① 提出物を取得・整理」ボタンをクリック
         → Classroom の提出物を取得し、グループIDと紐付け

② PDFに変換
    └─ 「② PDFに変換」ボタンをクリック
         → Google Drive 上でPDF変換、共有URLを自動取得

③ サイトに反映
    └─ 「③ サイトに反映（JSON公開）」ボタンをクリック
         → schedule.json を GitHub にプッシュ
         → Vercel が自動デプロイ（数分で反映）

※ 「⚡ すべて一括実行」で ①②③ をまとめて実行することも可能
```

---

## レポートテンプレートの作成

**「📄 レポートテンプレートを作成」** ボタンを押すと、  
A4縦・2ページのレポートテンプレート（Google Slides）が自動生成されます。

生成されたファイルを Classroom の課題に添付し、  
**「生徒全員にコピーを配布」** に設定することで、  
生徒が各自のコピーに書き込む形になります。

---

## GitHub Personal Access Token の取得方法

1. GitHub にログイン
2. 右上のアイコン → **Settings**
3. 左メニュー下部 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. `repo` にチェックを入れて生成
6. 表示されたトークンをコピーして「設定」シートに貼り付け

> ⚠️ トークンは一度しか表示されません。必ずコピーしてから閉じてください。
