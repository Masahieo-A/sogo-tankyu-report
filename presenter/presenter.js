(function () {
  var STORAGE_KEY = 'presenter_ok';
  var DATA_URL = '../data/schedule.json';

  function isUnlocked() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function setUnlocked() {
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function showGate() {
    document.getElementById('passwordGate').style.display = 'block';
    document.getElementById('presenterApp').style.display = 'none';
  }

  function showApp() {
    document.getElementById('passwordGate').style.display = 'none';
    document.getElementById('presenterApp').style.display = 'block';
  }

  function initGate() {
    var form = document.getElementById('passwordForm');
    var input = document.getElementById('passwordInput');
    var errEl = document.getElementById('gateError');
    var expected = window.PRESENTER_PASSWORD || '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      if (input.value === expected) {
        setUnlocked();
        showApp();
        loadAndRender();
      } else {
        errEl.textContent = 'パスワードが正しくありません。';
        errEl.style.display = 'block';
      }
    });
  }

  function loadSchedule() {
    return fetch(DATA_URL).then(function (res) {
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

  function renderGroupList(data, filter) {
    var list = document.getElementById('groupList');
    if (!list) return;
    var groups = (data.groups || []).slice();
    var q = (filter || '').toLowerCase().trim();
    if (q) {
      groups = groups.filter(function (g) {
        return (g.group_id && g.group_id.toLowerCase().indexOf(q) !== -1) ||
          (g.group_name && g.group_name.toLowerCase().indexOf(q) !== -1) ||
          (g.theme_title && g.theme_title.toLowerCase().indexOf(q) !== -1) ||
          (g.room_name && g.room_name.toLowerCase().indexOf(q) !== -1);
      });
    }
    list.innerHTML = groups.map(function (g) {
      var meta = [g.timeslot_label, g.room_name].filter(Boolean).join(' · ');
      return '<li><a href="#" data-group-id="' + escapeHtml(g.group_id) + '">' +
        escapeHtml(g.group_name || g.group_id) + ' — ' + escapeHtml(g.theme_title || '') +
        (meta ? '<span class="meta">' + escapeHtml(meta) + '</span>' : '') +
        '</a></li>';
    }).join('');

    list.querySelectorAll('a[data-group-id]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-group-id');
        var group = (data.groups || []).find(function (g) { return g.group_id === id; });
        if (group) renderSelectedGroup(group);
      });
    });
  }

  function renderSelectedGroup(group) {
    var section = document.getElementById('selectedGroupSection');
    var content = document.getElementById('selectedGroupContent');
    if (!section || !content) return;

    var html = '<p><strong>' + escapeHtml(group.group_name || group.group_id) + '</strong> — ' + escapeHtml(group.theme_title || '') + '</p>';
    html += '<p class="meta">' + escapeHtml(group.timeslot_label || '') + ' · ' + escapeHtml(group.room_name || '') + '</p>';
    html += '<div class="section-block"><h3>投影用リンク</h3><ul class="link-list">';
    if (group.slides_present_url) {
      html += '<li><a href="' + escapeHtml(group.slides_present_url) + '" target="_blank" rel="noopener" class="btn btn-primary">プレゼン表示（present）を新規タブで開く</a></li>';
    } else {
      html += '<li>スライドのURLが未登録です。</li>';
    }
    if (group.slides_view_url) {
      html += '<li><a href="' + escapeHtml(group.slides_view_url) + '" target="_blank" rel="noopener">閲覧用（通常表示）を開く</a></li>';
    }
    html += '</ul></div>';

    content.innerHTML = html;
    section.style.display = 'block';
  }

  function loadAndRender() {
    var list = document.getElementById('groupList');
    if (list) list.innerHTML = '<li class="loading">読み込み中…</li>';
    loadSchedule()
      .then(function (data) {
        renderGroupList(data);
        var search = document.getElementById('groupSearch');
        if (search) {
          search.addEventListener('input', function () {
            renderGroupList(data, search.value);
          });
        }
      })
      .catch(function (err) {
        if (list) list.innerHTML = '<li class="error-message">' + escapeHtml(err.message) + '</li>';
      });
  }

  document.getElementById('logoutBtn').addEventListener('click', logout);

  if (isUnlocked()) {
    showApp();
    loadAndRender();
  } else {
    showGate();
    initGate();
  }
})();
