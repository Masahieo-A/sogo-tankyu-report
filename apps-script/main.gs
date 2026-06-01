// ============================================================
// main.gs — メニュー定義・パイプライン制御
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 発表会サイト管理')
    .addItem('① 提出物を取得・整理',    'runFetchSubmissions')
    .addItem('② PDFに変換',             'runConvertToPdf')
    .addItem('③ サイトに反映（JSON公開）','runPublishToSite')
    .addSeparator()
    .addItem('⚡ すべて一括実行',         'runAll')
    .addSeparator()
    .addItem('📄 レポートテンプレートを作成', 'createReportTemplate')
    .addItem('🔧 初期セットアップ（シート生成）', 'setupSheets')
    .addToUi();
}

// ──────────────────────────────────────────
// ① Classroom から提出物を取得してシートに記録
// ──────────────────────────────────────────
function runFetchSubmissions() {
  var ui = SpreadsheetApp.getUi();
  try {
    var settings    = getSettings();
    var studentMap  = getStudentMapping();
    var groups      = getGroupList();

    var reportSubs  = fetchSubmissions(settings[SETTING_KEYS.CLASSROOM_COURSE_ID],
                                       settings[SETTING_KEYS.REPORT_ASSIGNMENT_ID]);
    var slidesSubs  = fetchSubmissions(settings[SETTING_KEYS.CLASSROOM_COURSE_ID],
                                       settings[SETTING_KEYS.SLIDES_ASSIGNMENT_ID]);

    writeFileIds(groups, studentMap, reportSubs, slidesSubs);
    ui.alert('✅ 提出物の取得完了', '提出ファイルIDをシートに書き込みました。\n次に「② PDFに変換」を実行してください。', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ エラー', e.message, ui.ButtonSet.OK);
    throw e;
  }
}

// ──────────────────────────────────────────
// ② 取得済みファイルをPDFに変換
// ──────────────────────────────────────────
function runConvertToPdf() {
  var ui = SpreadsheetApp.getUi();
  try {
    var settings = getSettings();
    var groups   = getGroupList();
    convertAndStorePdfUrls(groups, settings[SETTING_KEYS.OUTPUT_FOLDER_ID]);
    ui.alert('✅ PDF変換完了', 'PDFのURLをシートに書き込みました。\n次に「③ サイトに反映」を実行してください。', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ エラー', e.message, ui.ButtonSet.OK);
    throw e;
  }
}

// ──────────────────────────────────────────
// ③ シートのデータを JSON 化して GitHub にプッシュ
// ──────────────────────────────────────────
function runPublishToSite() {
  var ui = SpreadsheetApp.getUi();
  try {
    var settings = getSettings();
    var json     = generateScheduleJson(settings);
    pushToGithub(settings, json);
    ui.alert('✅ サイト反映完了', 'schedule.json を GitHub にプッシュしました。\nVercel が自動デプロイします（数分かかります）。', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ エラー', e.message, ui.ButtonSet.OK);
    throw e;
  }
}

// ──────────────────────────────────────────
// ⚡ 一括実行
// ──────────────────────────────────────────
function runAll() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert('⚡ 一括実行', '①②③をまとめて実行します。よろしいですか？', ui.ButtonSet.OK_CANCEL);
  if (res !== ui.Button.OK) return;

  try {
    runFetchSubmissions();
    runConvertToPdf();
    runPublishToSite();
    ui.alert('✅ すべての処理が完了しました', 'サイトへの反映が完了しました。', ui.ButtonSet.OK);
  } catch (e) {
    // 各関数内でエラーアラートを出しているので、ここでは再スローのみ
  }
}

// ──────────────────────────────────────────
// 🔧 初回セットアップ：必要なシートを自動生成
// ──────────────────────────────────────────
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  createSheetIfNotExists(ss, SHEET_NAMES.SETTINGS, [
    ['キー', '値', '説明'],
    [SETTING_KEYS.GITHUB_TOKEN,         '', 'GitHubのPersonal Access Token（repo権限）'],
    [SETTING_KEYS.GITHUB_OWNER,         '', 'GitHubユーザー名または組織名'],
    [SETTING_KEYS.GITHUB_REPO,          '', 'リポジトリ名（例: sogo-tankyu-report）'],
    [SETTING_KEYS.GITHUB_BRANCH,        'main', ''],
    [SETTING_KEYS.GITHUB_FILE_PATH,     'data/schedule.json', ''],
    [SETTING_KEYS.CLASSROOM_COURSE_ID,  '', 'ClassroomのコースID（URLの末尾）'],
    [SETTING_KEYS.REPORT_ASSIGNMENT_ID, '', 'レポート課題のID'],
    [SETTING_KEYS.SLIDES_ASSIGNMENT_ID, '', 'スライド課題のID'],
    [SETTING_KEYS.OUTPUT_FOLDER_ID,     '', 'PDF保存先のDriveフォルダID'],
    [SETTING_KEYS.EVENT_TITLE,          '富田高校　総合探求成果報告会', ''],
    [SETTING_KEYS.EVENT_DATE,           '2025年3月13日', ''],
  ]);

  createSheetIfNotExists(ss, SHEET_NAMES.GROUP_LIST, [
    ['group_id','group_name','timeslot_label','room_name','theme_title','theme_detail',
     'report_file_id(自動)','slides_file_id(自動)',
     'report_pdf_drive_url(自動)','report_pdf_embed_url(自動)',
     'slides_pdf_drive_url(自動)','slides_pdf_embed_url(自動)'],
  ]);

  createSheetIfNotExists(ss, SHEET_NAMES.STUDENT_MAP, [
    ['Classroomでの氏名', 'group_id', '備考'],
  ]);

  ui.alert('✅ セットアップ完了', '「設定」「グループ一覧」「生徒対応」シートを作成しました。\n各シートに必要な情報を入力してください。', ui.ButtonSet.OK);
}

function createSheetIfNotExists(ss, name, headers) {
  if (ss.getSheetByName(name)) return;
  var sheet = ss.insertSheet(name);
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
    sheet.getRange(1, 1, 1, headers[0].length).setFontWeight('bold').setBackground('#1a3d52').setFontColor('#ffffff');
  }
}
