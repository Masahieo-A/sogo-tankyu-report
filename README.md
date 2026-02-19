# 総合探究成果報告会 - 学内限定Webサイト

42グループの探究発表会向けに、**閲覧者用**と**発表者用**の2系統で利用できる静的な学内サイトです。

## 構成

- **閲覧者用（ルート）**
  - `index.html` … スケジュール一覧（時間×教室×グループ）。ここにPDF/Slides埋め込みは置かず負荷を抑える。
  - `group.html` … グループ詳細（発表場所・時間・テーマ・概要、参考資料PDFの埋め込み＋「新規タブで開く」、Slidesの「投影で開く」／「閲覧で開く」リンク）
- **発表者用** … `presenter/`
  - パスワードで入室 → グループ選択 → **プレゼン表示（present）を新規タブで開く**を主導線に投影。
- **データ** … `data/schedule.json`（Google Sheets からエクスポートする想定）

## 運用の流れ

1. **Google Sheets** で42グループ分のマスタを管理（`docs/DATA_SCHEMA.md` 参照）。
2. **Google Drive** でPDF・Slidesを共有ドライブ等に集約し、**組織内のみ**で共有。Publish to the web は使わない。
3. Sheets の内容を **schedule.json** に反映（手動エクスポート or スクリプト）。`data/schedule.json` を更新。
4. 本サイトを学内Webサーバ等に配置。必要に応じて **閲覧者用** と **発表者用** を別URL（別サイト）で運用可能。
5. 発表者用のパスワードは `presenter/presenter-config.js` の `PRESENTER_PASSWORD` を変更。可能なら発表者用URLはGoogleグループ等でアクセス制限。

## ローカルで確認

```bash
# 簡易サーバでルートを公開（例: ポート8080）
npx serve -l 8080
# または
python3 -m http.server 8080
```

- 閲覧者用: http://localhost:8080/
- グループ例: http://localhost:8080/group.html?group_id=001
- 発表者用: http://localhost:8080/presenter/

## 制約・注意

- **個人情報**: PDFの外部公開は行わず、ドメイン（組織）内限定で運用してください。
- **負荷**: トップには重い埋め込みを置かず、グループ詳細で初めてPDFを読み込む構成です。PDFは圧縮・最適化を推奨。
- **投影**: 確実性のため、Slidesは「新規タブで present を開く」を主導線にしています。
- **発表者用を別サイトにする場合**: `presenter/` を別ドメインに配置するときは、`presenter/presenter.js` の `DATA_URL` をその環境で参照できる `schedule.json` のURLに変更するか、同じ `data/schedule.json` を発表者用サイトにも配置してください。

## ファイル一覧

```
├── index.html          # 閲覧者用トップ（スケジュール）
├── group.html          # グループ詳細
├── style.css
├── schedule.js
├── group.js
├── data/
│   └── schedule.json   # スケジュール・リンクのマスタ
├── presenter/
│   ├── index.html
│   ├── presenter.css
│   ├── presenter-config.js  # パスワード設定
│   └── presenter.js
├── docs/
│   └── DATA_SCHEMA.md  # Sheets 項目・schedule.json の説明
└── README.md
```

## スライドの「投影用URL」について

- 通常のGoogleスライドURL: `https://docs.google.com/presentation/d/{ID}/view`
- 投影用（present）: `https://docs.google.com/presentation/d/{ID}/present`
- Sheets の `slides_present_url` には上記 **present** のURLを登録してください。
