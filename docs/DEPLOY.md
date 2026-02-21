# デプロイ手順（GitHub + Vercel）と PDF の保存場所

## PDF・スライドは「どこに保存するか」

**参考資料 PDF と発表スライド PDF は、このサイト（Vercel）には置きません。Google Drive に保存したままにします。**（発表スライドは当日の不具合を減らすため PDF で保存する運用です。）

- **保存場所**: **Google ドライブ**（推奨: 共有ドライブ）に参考資料 PDF・発表スライド PDF を置く
- **共有設定**: 「**組織内のみ**」または「リンクを知る全員」の場合は**組織のドメイン限定**にし、**Publish to the web（ウェブに公開）は使わない**
- **このサイトの役割**: `data/schedule.json` に **Drive のリンク（URL）だけ**を書く。サイトは「一覧・詳細ページ」と「そのリンク」を表示するだけ
- **結果**: Vercel でサイトは誰でも開けますが、PDF のリンクをクリックしたときは **Google にログインしたうえで、組織内の権限がある人だけ**が開けます（リンクが漏れても中身は守られる）

### 運用の流れ（まとめ）

1. 共有ドライブ（またはフォルダ）に参考資料 PDF・発表スライド PDF を入れる  
2. 各ファイルの共有を「組織内のみ」にする  
3. 共有リンクをコピーし、Google Sheets の `pdf_drive_url` / `pdf_embed_url` / `slides_pdf_drive_url` / `slides_pdf_embed_url` などに貼る  
4. Sheets から `data/schedule.json` を更新（`docs/SHEETS_EXPORT.md` 参照）  
5. このリポジトリの `data/schedule.json` を更新して GitHub に push → Vercel が自動で再デプロイ

---

## GitHub に上げる

### 1. リポジトリを用意する

1. [GitHub](https://github.com) で **New repository** をクリック
2. リポジトリ名を決める（例: `sogo-tankyu-report`）
3. **Public** で作成（Private でも Vercel 連携可能）
4. 「Initialize with README」は**不要**（既に README があるため）

### 2. ローカルで Git を初期化して push する

**必ず、`index.html` と `presenter/` があるプロジェクトのルートフォルダ**で実行してください。

```bash
cd プロジェクトのルートフォルダのパス

git init
git add .
git commit -m "Initial commit: 総合探究成果報告会サイト"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

- `あなたのユーザー名` と `リポジトリ名` は、さきほど作ったリポジトリに合わせて書き換えてください。
- GitHub のリポジトリページで **Code** → **HTTPS** の URL をコピーして `git remote add origin ...` に貼り付けるとそのまま使えます。
- まだ Git を入れていない場合: 先に [Git](https://git-scm.com/) をインストールしてください。

---

## Vercel でデプロイ（公開）する

### 1. Vercel に接続する

1. [Vercel](https://vercel.com) にログイン（GitHub アカウントで連携が簡単）
2. **Add New…** → **Project**
3. **Import Git Repository** で、さきほど push した GitHub リポジトリを選ぶ
4. **Framework Preset**: そのまま **Other** で OK
5. **Root Directory**: 空のまま（ルートがプロジェクトのルート）
6. **Build and Output Settings**: そのまま（静的サイトなのでビルドコマンドは不要）
7. **Deploy** をクリック

### 2. デプロイ後の URL

- デプロイが終わると `https://プロジェクト名.vercel.app` のような URL が発行されます
- 学内で共有するときはこの URL を案内すれば OK

### 3. 更新のしかた

- `data/schedule.json` や HTML/CSS/JS を直したら、同じフォルダで:
  ```bash
  git add .
  git commit -m "スケジュール更新"
  git push
  ```
- Vercel は GitHub と連携しているので、**push するだけで自動で再デプロイ**されます

---

## 注意事項（学内限定の意味）

- **サイト本体（Vercel の URL）**: インターネット上で誰でもアクセス可能です。スケジュール表・グループ名・テーマ名・概要は、その URL を知っていれば見られます。
- **PDF の中身**: Drive の「組織内のみ」のため、**同じ Google 組織にログインしている人だけ**が開けます。URL が外に漏れても、中身は組織外には見えません。
- 発表者用ページ（`/presenter/`）は **パスワード**で守っています。パスワードは `presenter/presenter-config.js` の `PRESENTER_PASSWORD` で変更できます（本番では必ず変更し、教員だけに伝えるなどしてください）。
