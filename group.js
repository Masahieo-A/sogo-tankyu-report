(function () {
  function getGroupId() {
    var params = new URLSearchParams(location.search);
    return params.get('group_id') || '';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function loadSchedule() {
    return fetch('data/schedule.json').then(function (res) {
      if (!res.ok) throw new Error('データの読み込みに失敗しました。');
      return res.json();
    });
  }

  function renderGroupDetail(data) {
    var groupId = getGroupId();
    var group = (data.groups || []).find(function (g) { return g.group_id === groupId; });
    var container = document.getElementById('groupDetail');
    if (!container) return;
    if (!group) {
      container.innerHTML = '<p class="error-message">指定されたグループが見つかりません。</p>';
      return;
    }

    var html = '';
    html += '<header class="detail-header">';
    html += '<h1>' + escapeHtml(group.group_name || group.group_id) + '</h1>';
    html += '<p class="theme-title">' + escapeHtml(group.theme_title || '') + '</p>';
    html += '<ul class="meta-list">';
    html += '<li>発表時間: ' + escapeHtml(group.timeslot_label || '') + '</li>';
    html += '<li>教室: ' + escapeHtml(group.room_name || '') + '</li>';
    html += '</ul>';
    html += '</header>';

    if (group.theme_detail) {
      html += '<div class="section-block">';
      html += '<h3>発表概要</h3>';
      html += '<p>' + escapeHtml(group.theme_detail) + '</p>';
      html += '</div>';
    }

    if (group.pdf_embed_url || group.pdf_drive_url) {
      html += '<div class="section-block">';
      html += '<h3>参考資料 PDF</h3>';
      if (group.pdf_title) html += '<p><strong>' + escapeHtml(group.pdf_title) + '</strong></p>';
      if (group.pdf_embed_url) {
        html += '<div class="pdf-embed-wrap">';
        html += '<iframe src="' + escapeHtml(group.pdf_embed_url) + '" title="PDF"></iframe>';
        html += '</div>';
      }
      html += '<ul class="link-list">';
      if (group.pdf_drive_url) {
        html += '<li><a href="' + escapeHtml(group.pdf_drive_url) + '" target="_blank" rel="noopener" class="external">新規タブで開く</a></li>';
      }
      html += '</ul>';
      html += '</div>';
    }

    if (group.slides_view_url || group.slides_present_url) {
      html += '<div class="section-block">';
      html += '<h3>発表スライド</h3>';
      if (group.slides_title) html += '<p><strong>' + escapeHtml(group.slides_title) + '</strong></p>';
      html += '<ul class="link-list">';
      if (group.slides_present_url) {
        html += '<li><a href="' + escapeHtml(group.slides_present_url) + '" target="_blank" rel="noopener" class="btn">投影（プレゼン表示）を新規タブで開く</a></li>';
      }
      if (group.slides_view_url) {
        html += '<li><a href="' + escapeHtml(group.slides_view_url) + '" target="_blank" rel="noopener" class="external">閲覧用（通常表示）を開く</a></li>';
      }
      html += '</ul>';
      html += '</div>';
    }

    if (!group.theme_detail && !group.pdf_embed_url && !group.pdf_drive_url && !group.slides_view_url && !group.slides_present_url) {
      html += '<div class="section-block"><p class="text-muted">このグループの資料はまだ登録されていません。</p></div>';
    }

    container.innerHTML = html;
    document.title = (group.group_name || group.group_id) + ' - 総合探究成果報告会';
  }

  if (document.getElementById('groupDetail')) {
    loadSchedule()
      .then(renderGroupDetail)
      .catch(function (err) {
        var container = document.getElementById('groupDetail');
        if (container) {
          container.innerHTML = '<p class="error-message">' + escapeHtml(err.message) + '</p>';
        }
      });
  }
})();
