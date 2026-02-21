# 総合探究成果報告会 - 学内限定Webサイト

42グループの探究発表会向けに、**閲覧者用**と**発表者用**の2系統で利用できる静的な学内サイトです。

---

## PDF・スライドは「どこに保存するか」（重要）

**PDF と Google スライドは、このリポジトリや Vercel には置きません。Google ドライブに保存したままにします。**

| 役割 | 保存場所 |
|------|----------|
| **PDF・スライドのファイル** | **Google ドライブ**（共有ドライブ推奨） |
| **このサイト** | スケジュールと **Drive のリンク（URL）** を `data/schedule.json` に書くだけ |

- **共有設定**: 「**組織内のみ**」にし、**Publish to the web（ウェブに公開）は使わない**
- サイト上ではリンクを表示するだけ。リンクを開いた人は **Google にログインしたうえで、組織内の権限がある人だけ**が PDF/スライドを開けます（URL が漏れても中身は守られる）

**運用の流れ**: 共有ドライブに PDF・スライドを入れる → 共有を「組織内のみ」にする → 共有リンクを Google Sheets に貼る → Sheets から `data/schedule.json` を更新 → このリポジトリを更新して push

### 84個のリンクを JSON にペーストする必要はありますか？ → **いいえ**

- **リンク（PDF 42本・スライド 42本）は、すべて Google スプレッドシートの表に貼るだけ**でよいです。
- **JSON に 1本ずつコピペする必要はありません。** スプレッドシートをマスタにして、そこから `schedule.json` を**1回の操作で一括生成**します。
  - **方法1**: スプレッドシートで Apps Script を実行 → ログに表示された JSON をコピー → `data/schedule.json` を**まるごと1回だけ貼り替え**。
  - **方法2**: スプレッドシートを CSV で公開 → `node scripts/sheets-to-json.js "CSVのURL"` を実行 → `data/schedule.json` が自動で上書き（コピペなし）。

くわしくは **`docs/SHEETS_EXPORT.md`** を参照してください。

### Drive で「201-1」のようにフォルダ／ファイル名を付けて、サイトで 201-1 を選ぶと資料を見られる？

- **フォルダの「ファイルパス」を JSON に 1 つ渡して、サイトから一覧して開く**ことは **できません**。Drive にはそのようなパスはなく、サイトからは「各ファイルの URL」で開く形になります。
- **できること**: Drive のフォルダに `201-1.pdf`, `201-2.pdf` のように 42 本を置き、**Apps Script で「フォルダ ID」を指定して 1 回実行**すると、ファイル名から group_id（201-1）と各 PDF のリンクを取得できます。その結果をスプレッドシートや JSON に反映すれば、**サイトで「201-1」を選ぶとその PDF が開く**ようにできます。  
  → 詳しくは **`docs/DRIVE_FOLDER.md`** を参照してください。

---

## デプロイ手順（GitHub + Vercel）

### 1. GitHub にリポジトリを作る

1. [GitHub](https://github.com) で **New repository** をクリック
2. リポジトリ名を決める（例: `sogo-tankyu-report`）
3. **Public** で作成（Private でも Vercel 連携可能）
4. 「Initialize with README」は**付けない**（既に README があるため）

### 2. ローカルで Git に上げる

**`index.html` と `presenter/` があるプロジェクトのルートフォルダ**で、ターミナルを開いて実行してください。

```bash
git init
git add .
git commit -m "Initial commit: 総合探究成果報告会サイト"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

- `あなたのユーザー名` と `リポジトリ名` を、作ったリポジトリに合わせて書き換える
- GitHub のリポジトリページで **Code** → **HTTPS** の URL をコピーして `git remote add origin ...` にそのまま貼り付けてよい
- Git 未導入の場合は [Git](https://git-scm.com/) をインストールする

### 3. Vercel で公開する

1. [Vercel](https://vercel.com) にログイン（GitHub 連携が簡単）
2. **Add New…** → **Project**
3. **Import Git Repository** で、さきほど push したリポジトリを選ぶ
4. **Framework Preset**: **Other** のまま
5. **Root Directory**: 空のまま
6. **Deploy** をクリック

完了すると `https://プロジェクト名.vercel.app` のような URL が発行されます。学内ではこの URL を案内すればよいです。

### 4. 以降の更新のしかた

`data/schedule.json` や HTML/CSS/JS を直したら、同じフォルダで:

```bash
git add .
git commit -m "スケジュール更新"
git push
```

push するだけで Vercel が自動で再デプロイします。

---

## 注意事項

- **サイト本体（Vercel の URL）**: 誰でもアクセス可能。スケジュール表・グループ名・テーマ名・概要は URL を知っていれば見られます。
- **PDF・スライドの中身**: Drive を「組織内のみ」にしているため、**同じ Google 組織でログインしている人だけ**が開けます。
- 発表者用（`/presenter/`）は **パスワード**で保護。`presenter/presenter-config.js` の `PRESENTER_PASSWORD` を本番用に必ず変更し、教員だけに伝えてください。

---

## 構成

- **閲覧者用（ルート）**: `index.html`（スケジュール一覧）, `group.html`（グループ詳細・PDF埋め込み＋リンク、Slides 投影リンク）
- **発表者用**: `presenter/`（パスワード入室 → グループ選択 → プレゼン表示を新規タブで開く）
- **データ**: `data/schedule.json`（Google Sheets からエクスポートする想定）

## ローカルで確認

```bash
npx serve -l 8080
# または
python3 -m http.server 8080
```

- 閲覧者用: http://localhost:8080/
- 発表者用: http://localhost:8080/presenter/

## ファイル一覧

```
├── index.html, group.html, style.css, schedule.js, group.js
├── data/schedule.json
├── presenter/ (index.html, presenter.css, presenter-config.js, presenter.js)
├── docs/ (DATA_SCHEMA.md, SHEETS_EXPORT.md, DEPLOY.md)
├── vercel.json
└── README.md
```

## 発表スライドは PDF で保存

当日のデバイス・環境による不具合を減らすため、**発表スライドも PDF で保存**する運用です。  
`schedule.json` には `slides_pdf_drive_url`（新規タブで開く用）と `slides_pdf_embed_url`（埋め込み表示用）に Drive の PDF リンクを登録してください。Google Slides の URL は使いません。
