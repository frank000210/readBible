/* ============== 一年讀經一遍 - 主程式 ============== */
// 依賴：data.js (BOOKS, PLAN)

const STORAGE_KEY = 'bible_one_year_v1';
const SOURCE_KEY = 'bible_source_v1';

// ---------- 資料模型 ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return Object.assign(defaultState(), s);
  } catch (e) {
    return defaultState();
  }
}
function defaultState() {
  // startDate 預設為今年第一天
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: ymd(start),
    checks: {},   // {1: true, 2: false, ...}
    notes: {},    // {1: "感言內容", ...}
  };
}
function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
let state = loadState();
let bibleSource = localStorage.getItem(SOURCE_KEY) || 'rcv_daily';

// ---------- 工具函式 ----------
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function dayDiff(a, b) {
  // 天數差（b - a），忽略時區
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86400000);
}
function todayDayNumber() {
  const start = parseYmd(state.startDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = dayDiff(start, today);
  return diff + 1; // day 1 是 startDate 當天
}
function dateOfDay(n) {
  const start = parseYmd(state.startDate);
  start.setDate(start.getDate() + (n - 1));
  return start;
}
function formatDate(d) {
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
}
function bookByBx(bx) {
  return BOOKS.find(b => b.bx === bx);
}

// ---------- 讀經連結產生 ----------
// 多種模式：每日讀經 (官方 f_day) 或 個別書本綱目
function buildLinks(dayObj) {
  const links = [];
  // 1) 主要：恢復本網站每日讀經 URL
  if (bibleSource === 'rcv_daily') {
    links.push({
      label: `恢復本第 ${dayObj.d} 天讀經`,
      url: `https://www.recoveryversion.com.tw/Style0A/026/bible_reading.php?f_day=${dayObj.d}`,
      primary: true,
    });
  }
  // 2) 各章節連結：書本綱目 (Bx)
  // 將 refs 依 bx 分組
  const groups = {};
  for (const [bx, ch] of dayObj.r) {
    if (!groups[bx]) groups[bx] = [];
    groups[bx].push(ch);
  }
  for (const bxStr of Object.keys(groups)) {
    const bx = Number(bxStr);
    const book = bookByBx(bx);
    const chs = groups[bx];
    const range = chs.length === 1 ? `${chs[0]}` : `${chs[0]}-${chs[chs.length-1]}`;
    let url;
    if (bibleSource === 'bible_com') {
      // Bible.com 恢復本繁中 (CRV)
      const code = bibleComCode(bx);
      url = `https://www.bible.com/zh-TW/bible/4230/${code}.${chs[0]}.CRV`;
    } else {
      // 預設：恢復本書本綱目
      url = `https://recoveryversion.com.tw/Style0A/026/outline_List.php?Bx=${bx}`;
    }
    links.push({
      label: `${book.name} ${range}`,
      url,
      primary: false,
    });
  }
  return links;
}

// Bible.com 書本代碼對應 (依 USFM 代碼)
function bibleComCode(bx) {
  const codes = ['', 'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
    '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG',
    'ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM',
    'HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO',
    '2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB',
    'JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
  return codes[bx] || '';
}

// ---------- DOM ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ---------- 分頁切換 ----------
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.remove('active'));
  $$('.panel').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  $('#tab-' + t.dataset.tab).classList.add('active');
  if (t.dataset.tab === 'list') renderPlanList();
  if (t.dataset.tab === 'notes') renderNotesList();
}));

// ---------- Today 頁面 ----------
function renderToday() {
  const n = todayDayNumber();
  const todayDate = $('#todayDate');
  const todayDay = $('#todayDay');
  const todayTitle = $('#todayTitle');
  const todayLinks = $('#todayLinks');
  const todayCheck = $('#todayCheck');
  const todayNote = $('#todayNote');

  todayDate.textContent = formatDate(new Date());

  if (n < 1) {
    todayDay.textContent = `尚未開始`;
    todayTitle.textContent = `請於設定中調整起始日`;
    todayLinks.innerHTML = '';
    todayCheck.disabled = true;
    todayNote.disabled = true;
  } else if (n > 365) {
    todayDay.textContent = `已完成 365 天 🎉`;
    todayTitle.textContent = `恭喜！您已完成一年讀經`;
    todayLinks.innerHTML = '';
    todayCheck.disabled = true;
    todayNote.disabled = true;
  } else {
    const dayObj = PLAN[n - 1];
    todayDay.textContent = `Day ${n}/365`;
    todayTitle.textContent = dayObj.t;
    renderLinks(todayLinks, dayObj);
    todayCheck.disabled = false;
    todayNote.disabled = false;
    todayCheck.checked = !!state.checks[n];
    todayNote.value = state.notes[n] || '';

    todayCheck.onchange = () => {
      state.checks[n] = todayCheck.checked;
      saveState(state);
      renderProgress();
    };
    $('#saveTodayNote').onclick = () => {
      state.notes[n] = todayNote.value.trim();
      if (!state.notes[n]) delete state.notes[n];
      saveState(state);
      flashSaveHint('#saveHint');
    };
  }
  renderProgress();
}

function renderLinks(container, dayObj) {
  container.innerHTML = '';
  const links = buildLinks(dayObj);
  links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'link-btn' + (link.primary ? ' primary' : '');
    a.textContent = link.label;
    container.appendChild(a);
  });
}

function renderProgress() {
  const done = Object.values(state.checks).filter(v => v).length;
  const pct = Math.round((done / 365) * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressText').textContent = `${done} / 365 天 (${pct}%)`;
}

function flashSaveHint(sel) {
  const el = $(sel);
  el.textContent = '✓ 已儲存';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

// ---------- 進度表 ----------
function renderPlanList() {
  const list = $('#planList');
  const search = ($('#searchInput').value || '').trim().toLowerCase();
  const filter = $('#filterSelect').value;
  const todayN = todayDayNumber();

  list.innerHTML = '';
  PLAN.forEach(d => {
    const isDone = !!state.checks[d.d];
    const hasNote = !!state.notes[d.d];

    if (filter === 'done' && !isDone) return;
    if (filter === 'undone' && isDone) return;

    const dateStr = formatDate(dateOfDay(d.d));
    if (search) {
      const hay = `${d.t} day ${d.d} ${dateStr}`.toLowerCase();
      if (!hay.includes(search)) return;
    }

    const item = document.createElement('div');
    item.className = 'plan-item' + (isDone ? ' done' : '') + (d.d === todayN ? ' today' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isDone;
    checkbox.onclick = (e) => {
      e.stopPropagation();
      state.checks[d.d] = checkbox.checked;
      saveState(state);
      item.classList.toggle('done', checkbox.checked);
      renderProgress();
    };

    const dayLabel = document.createElement('div');
    dayLabel.className = 'plan-item-day';
    dayLabel.textContent = `Day ${d.d}`;

    const title = document.createElement('div');
    title.className = 'plan-item-title';
    title.innerHTML = `${d.t}<br><span style="font-size:0.8rem;color:#999;">${dateStr}</span>`;

    item.appendChild(checkbox);
    item.appendChild(dayLabel);
    item.appendChild(title);
    if (hasNote) {
      const noteIcon = document.createElement('div');
      noteIcon.className = 'plan-item-note-icon';
      noteIcon.textContent = '✎';
      noteIcon.title = '已寫感言';
      item.appendChild(noteIcon);
    }

    item.onclick = (e) => {
      if (e.target === checkbox) return;
      openDayModal(d.d);
    };
    list.appendChild(item);
  });
  if (list.children.length === 0) {
    list.innerHTML = '<div class="empty-state">沒有符合的進度</div>';
  }
}

$('#searchInput').addEventListener('input', renderPlanList);
$('#filterSelect').addEventListener('change', renderPlanList);

// ---------- 詳細日期 modal ----------
function openDayModal(n) {
  const dayObj = PLAN[n - 1];
  $('#modalDayNum').textContent = `Day ${n}/365`;
  $('#modalDate').textContent = formatDate(dateOfDay(n));
  $('#modalTitle').textContent = dayObj.t;
  renderLinks($('#modalLinks'), dayObj);

  const modalCheck = $('#modalCheck');
  const modalNote = $('#modalNote');
  modalCheck.checked = !!state.checks[n];
  modalNote.value = state.notes[n] || '';

  modalCheck.onchange = () => {
    state.checks[n] = modalCheck.checked;
    saveState(state);
    renderPlanList();
    renderProgress();
    if (n === todayDayNumber()) renderToday();
  };
  $('#modalSaveNote').onclick = () => {
    state.notes[n] = modalNote.value.trim();
    if (!state.notes[n]) delete state.notes[n];
    saveState(state);
    flashSaveHint('#modalSaveHint');
    renderPlanList();
    if (n === todayDayNumber()) renderToday();
  };

  $('#dayModal').classList.remove('hidden');
}
$('#modalClose').onclick = () => $('#dayModal').classList.add('hidden');
$('#dayModal').onclick = (e) => {
  if (e.target.id === 'dayModal') $('#dayModal').classList.add('hidden');
};

// ---------- 感言列表 ----------
function renderNotesList() {
  const container = $('#notesList');
  const empty = $('#notesEmpty');
  container.innerHTML = '';
  const entries = Object.keys(state.notes)
    .map(k => Number(k))
    .filter(n => state.notes[n] && state.notes[n].trim())
    .sort((a, b) => b - a);

  if (entries.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  entries.forEach(n => {
    const dayObj = PLAN[n - 1];
    const item = document.createElement('div');
    item.className = 'note-item';
    const dateStr = formatDate(dateOfDay(n));
    item.innerHTML = `
      <div class="note-item-header">
        <span>Day ${n} · ${dateStr}</span>
        <span>${state.checks[n] ? '✓ 已讀' : '未讀'}</span>
      </div>
      <div class="note-item-title">${dayObj.t}</div>
      <div class="note-item-text">${escapeHtml(state.notes[n])}</div>
    `;
    item.onclick = () => openDayModal(n);
    container.appendChild(item);
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// ---------- 設定頁 ----------
$('#startDate').value = state.startDate;
$('#bibleSource').value = bibleSource;

$('#resetStartToday').onclick = () => {
  $('#startDate').value = ymd(new Date());
};
$('#saveStartDate').onclick = () => {
  const d = $('#startDate').value;
  if (!d) { alert('請選擇日期'); return; }
  state.startDate = d;
  saveState(state);
  alert('已儲存。今日讀經將依此日期重新計算。');
  renderToday();
};
$('#saveSource').onclick = () => {
  bibleSource = $('#bibleSource').value;
  localStorage.setItem(SOURCE_KEY, bibleSource);
  alert('已儲存來源設定。');
  renderToday();
};
$('#exportData').onclick = () => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
    bibleSource,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bible-reading-backup-${ymd(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
$('#importData').onclick = () => $('#importFile').click();
$('#importFile').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.state) {
        state = Object.assign(defaultState(), data.state);
        saveState(state);
      }
      if (data.bibleSource) {
        bibleSource = data.bibleSource;
        localStorage.setItem(SOURCE_KEY, bibleSource);
      }
      alert('已成功匯入資料！');
      $('#startDate').value = state.startDate;
      $('#bibleSource').value = bibleSource;
      renderToday();
    } catch (err) {
      alert('匯入失敗：檔案格式錯誤。');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
};
$('#clearData').onclick = () => {
  if (!confirm('確定要清除所有讀經記錄與感言嗎？此動作無法復原！')) return;
  if (!confirm('再次確認：所有資料將被永久刪除。')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  saveState(state);
  $('#startDate').value = state.startDate;
  alert('已清除所有資料。');
  renderToday();
  renderPlanList();
  renderNotesList();
};

// ---------- 初始化 ----------
renderToday();
