// ============================================================
// config.gs — 列定義・シート名・設定キーの定数
// ============================================================

var SHEET_NAMES = {
  GROUP_LIST: 'グループ一覧',
  STUDENT_MAP: '生徒対応',
  SETTINGS:    '設定',
};

// 「グループ一覧」シートの列番号（0始まり）
var COL = {
  GROUP_ID:             0,
  GROUP_NAME:           1,
  TIMESLOT:             2,
  ROOM:                 3,
  THEME_TITLE:          4,
  THEME_DETAIL:         5,
  REPORT_FILE_ID:       6,  // スクリプトが書き込む
  SLIDES_FILE_ID:       7,  // スクリプトが書き込む
  REPORT_PDF_DRIVE_URL: 8,  // スクリプトが書き込む
  REPORT_PDF_EMBED_URL: 9,  // スクリプトが書き込む
  SLIDES_PDF_DRIVE_URL: 10, // スクリプトが書き込む
  SLIDES_PDF_EMBED_URL: 11, // スクリプトが書き込む
};

// 「設定」シート A列のキー名（完全一致）
var SETTING_KEYS = {
  GITHUB_TOKEN:         'GitHub Token',
  GITHUB_OWNER:         'GitHub Owner',
  GITHUB_REPO:          'GitHub Repo',
  GITHUB_BRANCH:        'GitHub Branch',
  GITHUB_FILE_PATH:     'GitHub File Path',
  CLASSROOM_COURSE_ID:  'Classroom Course ID',
  REPORT_ASSIGNMENT_ID: 'Report Assignment ID',
  SLIDES_ASSIGNMENT_ID: 'Slides Assignment ID',
  OUTPUT_FOLDER_ID:     'Output Folder ID',
  EVENT_TITLE:          'Event Title',
  EVENT_DATE:           'Event Date',
};
