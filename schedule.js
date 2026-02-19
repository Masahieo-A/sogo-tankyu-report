(function () {
  // ルート配置時: index.html / group.html と同じ階層に data/schedule.json を置く
  var DATA_URL = 'data/schedule.json';

  function getBasePath() {
    var path = location.pathname;
    if (path.endsWith('/') || path.endsWith('/index.html')) {
      return path.replace(/\/index\.html$/, '').replace(/\/?$/, '') || '';
    }
    return path.replace(/\/[^/]+$/, '') || '';
  }

  function loadSchedule() {
    var base = getBasePath();
    var url = (base ? base + '/' : '') + DATA_URL;
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('スケジュールの読み込みに失敗しました。');
      return res.json();
    });
  }

  function renderTopPage(data) {
    document.getElementById('eventDate').textContent = data.eventDate || '';
    document.getElementById('notice').textContent = data.notice || '';
    var tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    var base = getBasePath();
    var groupPage = (base ? base + '/' : '') + 'group.html';
    data.groups.forEach(function (g) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(g.timeslot_label || '') + '</td>' +
        '<td>' + escapeHtml(g.room_name || '') + '</td>' +
        '<td><a class="group-link" href="' + groupPage + '?group_id=' + encodeURIComponent(g.group_id) + '">' + escapeHtml(g.group_name || g.group_id) + '</a></td>' +
        '<td>' + escapeHtml(g.theme_title || '') + '</td>';
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  if (document.getElementById('scheduleBody')) {
    loadSchedule()
      .then(renderTopPage)
      .catch(function (err) {
        var tbody = document.getElementById('scheduleBody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="4" class="error-message">' + escapeHtml(err.message) + '</td></tr>';
        }
      });
  }
})();
