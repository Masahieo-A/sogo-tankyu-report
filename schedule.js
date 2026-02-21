(function () {
  var DATA_URL = 'data/schedule.json';
  var sortKey = 'timeslot_label';
  var sortDir = 1; // 1: asc, -1: desc

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

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // デフォルト: 時間帯（第1→第2→第3）優先、次にグループ名。同点時は時間帯→グループ名で比較
  function sortGroups(groups) {
    var key = sortKey;
    var dir = sortDir;
    return groups.slice().sort(function (a, b) {
      var va = a[key] != null ? String(a[key]).trim() : '';
      var vb = b[key] != null ? String(b[key]).trim() : '';
      var c = va.localeCompare(vb, 'ja');
      if (c !== 0) return c * dir;
      var ct = (a.timeslot_label || '').trim().localeCompare((b.timeslot_label || '').trim(), 'ja');
      if (ct !== 0) return ct;
      var ga = (a.group_name || a.group_id || '').trim();
      var gb = (b.group_name || b.group_id || '').trim();
      return ga.localeCompare(gb, 'ja') * dir;
    });
  }

  function renderTopPage(data) {
    document.getElementById('eventDate').textContent = '2025年3月13日';
    var tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    var base = getBasePath();
    var groupPage = (base ? base + '/' : '') + 'group.html';
    var groups = sortGroups(data.groups || []);
    tbody.innerHTML = '';
    groups.forEach(function (g) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(g.timeslot_label || '') + '</td>' +
        '<td>' + escapeHtml(g.room_name || '') + '</td>' +
        '<td><a class="group-link" href="' + groupPage + '?group_id=' + encodeURIComponent(g.group_id) + '">' + escapeHtml(g.group_name || g.group_id) + '</a></td>' +
        '<td class="col-theme">' + escapeHtml(g.theme_title || '') + '</td>' +
        '<td class="col-detail">' + escapeHtml(g.theme_detail || '') + '</td>';
      tbody.appendChild(tr);
    });
    updateSortIndicators();
  }

  function updateSortIndicators() {
    var ths = document.querySelectorAll('#scheduleTable thead th.sortable');
    ths.forEach(function (th) {
      var key = th.getAttribute('data-sort');
      th.classList.remove('sort-asc', 'sort-desc');
      if (key === sortKey) {
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  function initSort(data) {
    var table = document.getElementById('scheduleTable');
    if (!table) return;
    table.querySelectorAll('thead th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.getAttribute('data-sort');
        if (key === sortKey) {
          sortDir = -sortDir;
        } else {
          sortKey = key;
          sortDir = 1;
        }
        renderTopPage(data);
      });
    });
  }

  if (document.getElementById('scheduleBody')) {
    loadSchedule()
      .then(function (data) {
        renderTopPage(data);
        initSort(data);
      })
      .catch(function (err) {
        var tbody = document.getElementById('scheduleBody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="5" class="error-message">' + escapeHtml(err.message) + '</td></tr>';
        }
      });
  }
})();
