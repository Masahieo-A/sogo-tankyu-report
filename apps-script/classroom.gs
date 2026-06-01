// ============================================================
// classroom.gs — Google Classroom API との連携
// ============================================================

/**
 * 指定課題の提出物一覧を取得する
 * @param {string} courseId   - ClassroomのコースID
 * @param {string} courseWorkId - 課題のID
 * @returns {Array<{studentName:string, fileId:string, mimeType:string}>}
 */
function fetchSubmissions(courseId, courseWorkId) {
  if (!courseId || !courseWorkId) {
    throw new Error('Classroom Course ID または Assignment ID が「設定」シートに入力されていません。');
  }

  var submissions = [];
  var pageToken = null;

  do {
    var url = 'https://classroom.googleapis.com/v1/courses/' + courseId +
              '/courseWork/' + courseWorkId + '/studentSubmissions?pageSize=100' +
              (pageToken ? '&pageToken=' + pageToken : '');

    var response = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('Classroom API エラー: ' + response.getContentText());
    }

    var data = JSON.parse(response.getContentText());
    pageToken = data.nextPageToken || null;

    (data.studentSubmissions || []).forEach(function (sub) {
      if (sub.state !== 'TURNED_IN' && sub.state !== 'RETURNED') return;

      var studentName = getStudentDisplayName(sub.userId);
      (sub.assignmentSubmission && sub.assignmentSubmission.attachments || []).forEach(function (att) {
        if (att.driveFile) {
          submissions.push({
            studentName: studentName,
            userId:      sub.userId,
            fileId:      att.driveFile.id,
            mimeType:    att.driveFile.mimeType || '',
          });
        }
      });
    });
  } while (pageToken);

  return submissions;
}

/**
 * ユーザーIDから表示名を取得する
 */
function getStudentDisplayName(userId) {
  try {
    var url = 'https://classroom.googleapis.com/v1/userProfiles/' + userId;
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200) {
      var profile = JSON.parse(res.getContentText());
      return profile.name && profile.name.fullName ? profile.name.fullName : userId;
    }
  } catch (_) {}
  return userId;
}
