# 総合探究成果報告会 - 学内限定Webサイト

探究発表会の**スケジュール一覧**と**各グループの資料（PDF）**を閲覧できる静的サイトです。
データの更新は **Google スプレッドシートのメニュー操作だけ**で完結します（Classroom 提出 → PDF 変換 → サイト反映まで自動）。

## 📖 操作ガイド（2冊構成）

| ガイド | 対象 | 内容 |
|--------|------|------|
| [`teacher-guide.html`](teacher-guide.html)（実務編） | 学年の担当教員（誰でも） | 毎年の運用: グループ登録・生徒への指示・一括実行・サイトの見方。技術用語なし |
| [`admin-guide.html`](admin-guide.html)（管理者編） | 技術担当者 | 初回セットアップ（GitHub・Vercel・Google Cloud）・引き継ぎ・技術トラブル対応 |

どちらもブラウザで開いて読めます。

## 運用フロー（概要）

```
生徒が Classroom に Google Slides を提出
        ↓
Google スプレッドシートの「📋 発表会サイト管理」メニュー
        ↓
「⚡ すべて一括実行」をクリック
  ① Classroom から提出物を取得（メールアドレスでグループに紐付け）
  ② Drive 上で PDF に変換・「組織内のみ」で共有
  ③ schedule.json を生成して GitHub にプッシュ
        ↓
Vercel が自動デプロイ → サイトに反映
```

## リポジトリ構成

```
├── index.html          スケジュール一覧（トップページ）
├── group.html          グループ詳細（PDF埋め込み）
├── common.js           共通処理（データ読込・URL検証・Googleログインゲート）
├── schedule.js         一覧ページの表示・検索・ソート
├── group.js            詳細ページの表示
├── style.css           スタイル
├── data/schedule.json  スケジュールデータ（Apps Script が自動更新）
├── apps-script/        スプレッドシートに貼る Google Apps Script 一式
├── docs/               開発者向けドキュメント
│   ├── DATA_SCHEMA.md    シートの列構成と JSON のキー
│   ├── DEPLOY.md         GitHub + Vercel のデプロイ手順
│   └── DRIVE_FOLDER.md   Drive フォルダから手動でリンクを取得する方法（補助）
├── sample/             デモ用サンプルデータ（架空の内容）
├── teacher-guide.html  教員向け操作ガイド・実務編（本番サイトには公開されない）
├── admin-guide.html    管理者向けガイド・技術編（本番サイトには公開されない）
├── vercel.json         セキュリティヘッダー等の設定
└── .vercelignore       本番サイトにデプロイしないファイルの指定
```

## セキュリティ設計

| 対象 | 保護のしくみ |
|------|--------------|
| サイトの閲覧 | 「設定」シートで `Allowed Domain` / `Google Client ID` を設定すると、学校の Google アカウントでのログインを要求（閲覧ゲート） |
| PDF の中身 | Google Drive の共有「**組織内のみ**」。リンクが漏れても組織外からは開けない（こちらが本命の保護） |
| GitHub トークン | シートには置かず、スプレッドシートのメニュー「🔑 GitHub トークンを設定」から **Apps Script のスクリプト プロパティ**に保存 |
| 内部資料 | `teacher-guide.html`・`admin-guide.html`・`docs/`・`apps-script/` は `.vercelignore` で本番サイトから除外 |

## ローカルで確認（開発者向け）

```bash
npx serve -l 8080
```

- 一覧: http://localhost:8080/
- 詳細: http://localhost:8080/group.html?group_id=101

※ ルートの `serve.json`（`cleanUrls: false`）により、本番（Vercel）と同じ URL 挙動になります。

## デプロイ

GitHub に push すると Vercel が自動デプロイします。初回セットアップは [`docs/DEPLOY.md`](docs/DEPLOY.md) を参照してください。
