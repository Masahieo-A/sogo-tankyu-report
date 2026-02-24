(function () {
  var DATA_URL = 'data/schedule.json';
  var sortKey = 'timeslot_label';
  var sortDir = 1;
  var rawData = null;

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

  function getSearchText() {
    var el = document.getElementById('scheduleSearch');
    return el ? (el.value || '').trim().toLowerCase() : '';
  }

  function getFilterTimeslot() {
    var el = document.getElementById('filterTimeslot');
    return el ? (el.value || '').trim() : '';
  }

  function getFilterRoom() {
    var el = document.getElementById('filterRoom');
    return el ? (el.value || '').trim() : '';
  }

  function matchGroup(g, searchText, filterTimeslot, filterRoom) {
    if (filterTimeslot && (g.timeslot_label || '').trim() !== filterTimeslot) return false;
    if (filterRoom && (g.room_name || '').trim() !== filterRoom) return false;
    if (!searchText) return true;
    var time = (g.timeslot_label || '').toLowerCase();
    var room = (g.room_name || '').toLowerCase();
    var group = (g.group_name || g.group_id || '').toLowerCase();
    var theme = (g.theme_title || '').toLowerCase();
    var detail = (g.theme_detail || '').toLowerCase();
    return time.indexOf(searchText) !== -1 || room.indexOf(searchText) !== -1 ||
      group.indexOf(searchText) !== -1 || theme.indexOf(searchText) !== -1 || detail.indexOf(searchText) !== -1;
  }

  function filterGroups(groups, searchText, filterTimeslot, filterRoom) {
    return groups.filter(function (g) {
      return matchGroup(g, searchText, filterTimeslot, filterRoom);
    });
  }

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

  function fillFilterOptions(groups) {
    var times = {};
    var rooms = {};
    groups.forEach(function (g) {
      var t = (g.timeslot_label || '').trim();
      var r = (g.room_name || '').trim();
      if (t) times[t] = true;
      if (r) rooms[r] = true;
    });
    var timeOpts = Object.keys(times).sort();
    var roomOpts = Object.keys(rooms).sort();
    var selTime = document.getElementById('filterTimeslot');
    var selRoom = document.getElementById('filterRoom');
    if (selTime) {
      var cur = selTime.value;
      selTime.innerHTML = '<option value="">すべて</option>' + timeOpts.map(function (t) {
        return '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + '</option>';
      }).join('');
      if (cur && timeOpts.indexOf(cur) !== -1) selTime.value = cur;
    }
    if (selRoom) {
      var curR = selRoom.value;
      selRoom.innerHTML = '<option value="">すべて</option>' + roomOpts.map(function (r) {
        return '<option value="' + escapeHtml(r) + '">' + escapeHtml(r) + '</option>';
      }).join('');
      if (curR && roomOpts.indexOf(curR) !== -1) selRoom.value = curR;
    }
  }

  function renderTable(groups) {
    var tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    document.getElementById('eventDate').textContent = '2025年3月13日';
    var base = getBasePath();
    var groupPage = (base ? base + '/' : '') + 'group.html';
    tbody.innerHTML = '';
    if (groups.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-row">条件に一致する発表がありません。検索ワードやフィルターを変えてください。</td></tr>';
    } else {
      groups.forEach(function (g) {
        var tr = document.createElement('tr');
        tr.className = 'schedule-row-clickable';
        tr.setAttribute('data-group-id', g.group_id);
        tr.innerHTML =
          '<td>' + escapeHtml(g.timeslot_label || '') + '</td>' +
          '<td>' + escapeHtml(g.room_name || '') + '</td>' +
          '<td class="group-name-cell">' + escapeHtml(g.group_name || g.group_id) + '</td>' +
          '<td class="col-theme">' + escapeHtml(g.theme_title || '') + '</td>' +
          '<td class="col-detail">' + escapeHtml(g.theme_detail || '') + '</td>';
        tr.addEventListener('click', function () {
          location.href = groupPage + '?group_id=' + encodeURIComponent(g.group_id);
        });
        tbody.appendChild(tr);
      });
    }
    updateSortIndicators();
  }

  function updateResultCount(total, filtered) {
    var el = document.getElementById('resultCount');
    if (!el) return;
    if (total === 0) {
      el.textContent = '0件';
      return;
    }
    if (filtered === total) {
      el.textContent = '全' + total + '件';
    } else {
      el.textContent = '全' + total + '件中 ' + filtered + '件';
    }
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

  function applyFiltersAndRender() {
    if (!rawData || !rawData.groups) return;
    var searchText = getSearchText();
    var filterTimeslot = getFilterTimeslot();
    var filterRoom = getFilterRoom();
    var filtered = filterGroups(rawData.groups, searchText, filterTimeslot, filterRoom);
    var sorted = sortGroups(filtered);
    renderTable(sorted);
    updateResultCount(rawData.groups.length, sorted.length);
    var clearBtn = document.getElementById('searchClear');
    var searchEl = document.getElementById('scheduleSearch');
    if (clearBtn && searchEl) clearBtn.style.visibility = searchEl.value.trim() ? 'visible' : 'hidden';
  }

  function initSort() {
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
        applyFiltersAndRender();
      });
    });
  }

  function initSearchAndFilters() {
    var searchEl = document.getElementById('scheduleSearch');
    var clearBtn = document.getElementById('searchClear');
    var timeSel = document.getElementById('filterTimeslot');
    var roomSel = document.getElementById('filterRoom');

    function onFilterChange() {
      applyFiltersAndRender();
    }

    if (searchEl) {
      searchEl.addEventListener('input', onFilterChange);
      searchEl.addEventListener('keyup', onFilterChange);
    }
    if (clearBtn) {
      clearBtn.style.visibility = 'hidden';
      clearBtn.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        onFilterChange();
        searchEl.focus();
      });
    }
    if (timeSel) timeSel.addEventListener('change', onFilterChange);
    if (roomSel) roomSel.addEventListener('change', onFilterChange);
  }

  if (document.getElementById('scheduleBody')) {
    loadSchedule()
      .then(function (data) {
        rawData = data;
        fillFilterOptions(data.groups || []);
        initSort();
        initSearchAndFilters();
        applyFiltersAndRender();
      })
      .catch(function (err) {
        var tbody = document.getElementById('scheduleBody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="5" class="error-message">' + escapeHtml(err.message) + '</td></tr>';
        }
      });
  }
})();
