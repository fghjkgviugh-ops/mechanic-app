'use strict';

/* ---------- Дані ---------- */

const STORAGE_KEY = 'garage-data-v1';

const TYPES = {
  service: { label: 'ТО', icon: '🛢️' },
  repair:  { label: 'Ремонт', icon: '🔧' },
  parts:   { label: 'Запчастини', icon: '⚙️' },
  fuel:    { label: 'Пальне', icon: '⛽' },
  tires:   { label: 'Шини', icon: '🛞' },
  other:   { label: 'Інше', icon: '📄' },
};

const PRESET_REMINDERS = [
  { title: 'Заміна моторного масла', everyKm: 10000, everyMonths: 12 },
  { title: 'Повітряний фільтр', everyKm: 20000, everyMonths: 24 },
  { title: 'Салонний фільтр', everyKm: 15000, everyMonths: 12 },
  { title: 'Гальмівна рідина', everyKm: 0, everyMonths: 24 },
  { title: 'Страховка', everyKm: 0, everyMonths: 12 },
  { title: 'Сезонна заміна шин', everyKm: 0, everyMonths: 6 },
];

let state = load();
let tab = 'home';
let historyFilter = 'all';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return { cars: [], records: [], reminders: [], currentCarId: null, ...d };
    }
  } catch (e) { /* немає доступу до сховища */ }
  return { cars: [], records: [], reminders: [], currentCarId: null };
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { alert('Не вдалося зберегти дані на пристрої.'); }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);
const car = () => state.cars.find(c => c.id === state.currentCarId) || null;
const carRecords = () => state.records.filter(r => r.carId === state.currentCarId)
  .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.mileage || 0) - (a.mileage || 0));
const carReminders = () => state.reminders.filter(r => r.carId === state.currentCarId);

/* ---------- Форматування ---------- */

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => Number(n || 0).toLocaleString('uk-UA');
const money = n => Number(n || 0).toLocaleString('uk-UA', { maximumFractionDigits: 2 }) + ' ₴';
const km = n => num(n) + ' км';
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
}
function addMonths(dateStr, months) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

/* ---------- Нагадування: розрахунок статусу ---------- */

function reminderStatus(rem, c) {
  const parts = [];
  let level = 'ok';
  const bump = l => { if (l === 'over' || (l === 'soon' && level === 'ok')) level = l; };

  if (rem.everyKm > 0) {
    const dueKm = Number(rem.lastKm || 0) + Number(rem.everyKm);
    const left = dueKm - Number(c.mileage || 0);
    if (left < 0) { bump('over'); parts.push(`прострочено на ${km(-left)}`); }
    else { if (left <= Math.max(1000, rem.everyKm * 0.1)) bump('soon'); parts.push(`через ${km(left)} (на ${km(dueKm)})`); }
  }
  if (rem.everyMonths > 0 && rem.lastDate) {
    const due = addMonths(rem.lastDate, rem.everyMonths);
    const left = daysBetween(today(), due);
    if (left < 0) { bump('over'); parts.push(`прострочено на ${-left} дн.`); }
    else { if (left <= 30) bump('soon'); parts.push(`до ${fmtDate(due)} (${left} дн.)`); }
  }
  return { level, text: parts.join(' · ') || 'не налаштовано' };
}

/* ---------- Рендер ---------- */

const $ = s => document.querySelector(s);
const view = $('#view');

function render() {
  renderCarSelect();
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#editCarBtn').style.visibility = car() ? 'visible' : 'hidden';

  if (!car()) {
    $('#fab').hidden = true;
    view.innerHTML = `
      <div class="empty">
        <div style="font-size:56px">🚗</div>
        <p><b>Вітаю у «Гаражі»!</b><br>Додайте своє перше авто, щоб вести історію обслуговування, витрати та нагадування.</p>
        <button class="btn primary" data-act="add-car">Додати авто</button>
      </div>`;
    return;
  }
  $('#fab').hidden = tab === 'stats';
  ({ home: renderHome, history: renderHistory, reminders: renderReminders, stats: renderStats })[tab]();
}

function renderCarSelect() {
  const sel = $('#carSelect');
  sel.innerHTML = state.cars.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')
    + `<option value="__new">＋ Додати авто…</option>`;
  sel.value = state.currentCarId || '__new';
  if (!state.cars.length) sel.innerHTML = `<option value="__new">Гараж</option>`;
}

function renderHome() {
  const c = car();
  const recs = carRecords();
  const rems = carReminders().map(r => ({ r, s: reminderStatus(r, c) }));
  const urgent = rems.filter(x => x.s.level !== 'ok').sort((a, b) => (a.s.level === 'over' ? -1 : 1));
  const yearStart = new Date().getFullYear() + '-01-01';
  const yearSpend = recs.filter(r => r.date >= yearStart).reduce((s, r) => s + Number(r.cost || 0), 0);

  view.innerHTML = `
    <div class="card">
      <div class="muted">${esc([c.make, c.model, c.year].filter(Boolean).join(' ')) || 'Авто'}${c.plate ? ' · ' + esc(c.plate) : ''}</div>
      <div class="row" style="margin-top:6px">
        <div><div class="muted">Пробіг</div><div class="big">${km(c.mileage)}</div></div>
        <button class="btn" data-act="update-mileage">Оновити</button>
      </div>
    </div>
    <div class="grid2">
      <div class="card"><div class="muted">Витрати за ${new Date().getFullYear()}</div><div class="title" style="font-size:20px">${money(yearSpend)}</div></div>
      <div class="card"><div class="muted">Записів</div><div class="title" style="font-size:20px">${recs.length}</div></div>
    </div>

    <h2>Потребує уваги</h2>
    ${urgent.length ? urgent.map(x => reminderCard(x.r, x.s)).join('') :
      `<div class="card muted">${rems.length ? '✅ Усе гаразд — нічого не прострочено.' : 'Нагадувань поки немає. <a href="#" data-act="goto-reminders">Додати</a>'}</div>`}

    <h2>Останні записи</h2>
    ${recs.slice(0, 3).map(recordCard).join('') || '<div class="card muted">Ще немає записів. Натисніть «+», щоб додати.</div>'}
  `;
}

function recordCard(r) {
  const t = TYPES[r.type] || TYPES.other;
  return `
    <div class="card" data-act="edit-record" data-id="${r.id}">
      <div class="row">
        <div class="title">${t.icon} ${esc(r.title || t.label)}</div>
        <div class="cost">${r.cost ? money(r.cost) : ''}</div>
      </div>
      <div class="muted">${fmtDate(r.date)}${r.mileage ? ' · ' + km(r.mileage) : ''} · <span class="tag">${t.label}</span></div>
      ${r.notes ? `<div class="muted" style="margin-top:6px">${esc(r.notes)}</div>` : ''}
    </div>`;
}

function reminderCard(r, s) {
  const every = [r.everyKm > 0 ? 'кожні ' + km(r.everyKm) : '', r.everyMonths > 0 ? 'кожні ' + r.everyMonths + ' міс.' : ''].filter(Boolean).join(' або ');
  return `
    <div class="card ${s.level === 'ok' ? '' : s.level}">
      <div class="row">
        <div class="title" data-act="edit-reminder" data-id="${r.id}">${esc(r.title)}</div>
        <button class="btn small" data-act="done-reminder" data-id="${r.id}">Виконано</button>
      </div>
      <div class="status ${s.level}">${esc(s.text)}</div>
      <div class="muted">${every}</div>
    </div>`;
}

function renderHistory() {
  const recs = carRecords().filter(r => historyFilter === 'all' || r.type === historyFilter);
  view.innerHTML = `
    <div class="filters">
      <button data-filter="all" class="${historyFilter === 'all' ? 'active' : ''}">Усі</button>
      ${Object.entries(TYPES).map(([k, t]) => `<button data-filter="${k}" class="${historyFilter === k ? 'active' : ''}">${t.icon} ${t.label}</button>`).join('')}
    </div>
    ${recs.map(recordCard).join('') || '<div class="empty">Записів немає.</div>'}
  `;
}

function renderReminders() {
  const c = car();
  const rems = carReminders().map(r => ({ r, s: reminderStatus(r, c) }));
  const order = { over: 0, soon: 1, ok: 2 };
  rems.sort((a, b) => order[a.s.level] - order[b.s.level]);
  view.innerHTML = rems.length
    ? rems.map(x => reminderCard(x.r, x.s)).join('') + '<p class="muted">Натисніть на назву, щоб змінити чи видалити.</p>'
    : `<div class="empty">Нагадувань немає.<br>Додайте, наприклад, заміну масла кожні 10 000 км.<br>
        <button class="btn primary" data-act="add-reminder">Додати нагадування</button></div>`;
}

function renderStats() {
  const recs = carRecords();
  const total = recs.reduce((s, r) => s + Number(r.cost || 0), 0);
  const byType = {};
  recs.forEach(r => { byType[r.type] = (byType[r.type] || 0) + Number(r.cost || 0); });
  const max = Math.max(1, ...Object.values(byType));

  const byYear = {};
  recs.forEach(r => { const y = (r.date || '').slice(0, 4); if (y) byYear[y] = (byYear[y] || 0) + Number(r.cost || 0); });

  view.innerHTML = `
    <div class="card"><div class="muted">Усього витрачено</div><div class="big">${money(total)}</div></div>
    <h2>За категоріями</h2>
    <div class="card">
      ${Object.keys(byType).length ? Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
        <div class="bar-row">
          <div class="row"><span>${TYPES[k]?.icon || ''} ${TYPES[k]?.label || k}</span><span class="cost">${money(v)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(v / max * 100).toFixed(1)}%"></div></div>
        </div>`).join('') : '<div class="muted">Немає даних</div>'}
    </div>
    <h2>За роками</h2>
    <div class="card">
      ${Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0])).map(([y, v]) => `<div class="row" style="padding:4px 0"><span>${y}</span><span class="cost">${money(v)}</span></div>`).join('') || '<div class="muted">Немає даних</div>'}
    </div>
    <h2>Резервна копія</h2>
    <div class="card">
      <p class="muted" style="margin-top:0">Дані зберігаються лише на цьому телефоні. Час від часу зберігайте копію у файл.</p>
      <div class="form-actions">
        <button class="btn" data-act="export">Зберегти копію</button>
        <button class="btn" data-act="import">Відновити</button>
      </div>
    </div>
  `;
}

/* ---------- Форми ---------- */

const dlg = $('#dlg');
const form = $('#dlgForm');

function openForm(html, onSubmit, onDelete) {
  form.innerHTML = html + `
    <div class="form-actions">
      ${onDelete ? '<button type="button" class="btn danger" data-del>Видалити</button>' : ''}
      <button type="button" class="btn" data-cancel>Скасувати</button>
      <button type="submit" class="btn primary">Зберегти</button>
    </div>`;
  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (onSubmit(data) !== false) { dlg.close(); save(); render(); }
  };
  form.querySelector('[data-cancel]').onclick = () => dlg.close();
  if (onDelete) form.querySelector('[data-del]').onclick = () => {
    if (confirm('Точно видалити?')) { onDelete(); dlg.close(); save(); render(); }
  };
  dlg.showModal();
  const first = form.querySelector('input:not([type=hidden]), select');
  if (first && !('ontouchstart' in window)) first.focus();
}

const field = (label, name, value = '', type = 'text', extra = '') =>
  `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;

function carForm(c) {
  const isNew = !c;
  c = c || {};
  openForm(`
    <h3>${isNew ? 'Нове авто' : 'Редагувати авто'}</h3>
    ${field('Назва (як показувати)', 'name', c.name, 'text', 'required placeholder="Напр. Моя Октавія"')}
    <div class="grid2">
      ${field('Марка', 'make', c.make, 'text', 'placeholder="Skoda"')}
      ${field('Модель', 'model', c.model, 'text', 'placeholder="Octavia"')}
    </div>
    <div class="grid2">
      ${field('Рік', 'year', c.year, 'number', 'inputmode="numeric" min="1900" max="2100"')}
      ${field('Номер', 'plate', c.plate, 'text', 'placeholder="AA1234BB"')}
    </div>
    ${field('VIN', 'vin', c.vin)}
    ${field('Поточний пробіг, км', 'mileage', c.mileage, 'number', 'inputmode="numeric" min="0" required')}
    ${isNew ? `<label style="display:flex;gap:8px;align-items:center;color:var(--text)"><input type="checkbox" name="presets" checked style="width:auto;margin:0"> Додати типові нагадування (масло, фільтри, страховка…)</label>` : ''}
  `, d => {
    const data = { name: d.name.trim(), make: d.make.trim(), model: d.model.trim(), year: d.year, plate: d.plate.trim().toUpperCase(), vin: d.vin.trim().toUpperCase(), mileage: Number(d.mileage) || 0 };
    if (isNew) {
      const nc = { id: uid(), ...data };
      state.cars.push(nc);
      state.currentCarId = nc.id;
      if (d.presets) PRESET_REMINDERS.forEach(p => state.reminders.push({ id: uid(), carId: nc.id, ...p, lastKm: nc.mileage, lastDate: today() }));
      tab = 'home';
    } else Object.assign(c, data);
  }, isNew ? null : () => {
    state.cars = state.cars.filter(x => x.id !== c.id);
    state.records = state.records.filter(x => x.carId !== c.id);
    state.reminders = state.reminders.filter(x => x.carId !== c.id);
    state.currentCarId = state.cars[0]?.id || null;
  });
}

function recordForm(r) {
  const isNew = !r;
  const c = car();
  r = r || { type: 'service', date: today(), mileage: c.mileage };
  openForm(`
    <h3>${isNew ? 'Новий запис' : 'Редагувати запис'}</h3>
    <label>Тип<select name="type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${r.type === k ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}</select></label>
    ${field('Що зроблено', 'title', r.title, 'text', 'required placeholder="Напр. Заміна масла і фільтра"')}
    <div class="grid2">
      ${field('Дата', 'date', r.date, 'date', 'required')}
      ${field('Пробіг, км', 'mileage', r.mileage, 'number', 'inputmode="numeric" min="0"')}
    </div>
    ${field('Вартість, ₴', 'cost', r.cost, 'number', 'inputmode="decimal" min="0" step="0.01"')}
    <label>Нотатки (запчастини, СТО, артикули)<textarea name="notes">${esc(r.notes)}</textarea></label>
  `, d => {
    const data = { type: d.type, title: d.title.trim(), date: d.date, mileage: Number(d.mileage) || 0, cost: Number(d.cost) || 0, notes: d.notes.trim() };
    if (isNew) state.records.push({ id: uid(), carId: c.id, ...data });
    else Object.assign(r, data);
    if (data.mileage > Number(c.mileage || 0)) c.mileage = data.mileage;
  }, isNew ? null : () => { state.records = state.records.filter(x => x.id !== r.id); });
}

function reminderForm(r) {
  const isNew = !r;
  const c = car();
  r = r || { lastKm: c.mileage, lastDate: today(), everyKm: '', everyMonths: '' };
  openForm(`
    <h3>${isNew ? 'Нове нагадування' : 'Редагувати нагадування'}</h3>
    ${isNew ? `<label>Шаблон<select id="preset"><option value="">— Власне —</option>${PRESET_REMINDERS.map((p, i) => `<option value="${i}">${esc(p.title)}</option>`).join('')}</select></label>` : ''}
    ${field('Назва', 'title', r.title, 'text', 'required placeholder="Напр. Заміна ременя ГРМ"')}
    <div class="grid2">
      ${field('Кожні, км', 'everyKm', r.everyKm || '', 'number', 'inputmode="numeric" min="0" placeholder="10000"')}
      ${field('Кожні, місяців', 'everyMonths', r.everyMonths || '', 'number', 'inputmode="numeric" min="0" placeholder="12"')}
    </div>
    <p class="hint">Можна вказати одне або обидва — спрацює те, що настане раніше.</p>
    <div class="grid2">
      ${field('Востаннє, км', 'lastKm', r.lastKm, 'number', 'inputmode="numeric" min="0"')}
      ${field('Востаннє, дата', 'lastDate', r.lastDate, 'date')}
    </div>
  `, d => {
    const data = { title: d.title.trim(), everyKm: Number(d.everyKm) || 0, everyMonths: Number(d.everyMonths) || 0, lastKm: Number(d.lastKm) || 0, lastDate: d.lastDate || today() };
    if (!data.everyKm && !data.everyMonths) { alert('Вкажіть інтервал у км або місяцях.'); return false; }
    if (isNew) state.reminders.push({ id: uid(), carId: c.id, ...data });
    else Object.assign(r, data);
  }, isNew ? null : () => { state.reminders = state.reminders.filter(x => x.id !== r.id); });

  const preset = form.querySelector('#preset');
  if (preset) preset.onchange = () => {
    const p = PRESET_REMINDERS[preset.value];
    if (!p) return;
    form.title.value = p.title;
    form.everyKm.value = p.everyKm || '';
    form.everyMonths.value = p.everyMonths || '';
  };
}

function doneReminder(r) {
  const c = car();
  openForm(`
    <h3>✅ ${esc(r.title)}</h3>
    <div class="grid2">
      ${field('Дата', 'date', today(), 'date', 'required')}
      ${field('Пробіг, км', 'mileage', c.mileage, 'number', 'inputmode="numeric" min="0" required')}
    </div>
    ${field('Вартість, ₴', 'cost', '', 'number', 'inputmode="decimal" min="0" step="0.01"')}
    <label>Нотатки<textarea name="notes"></textarea></label>
    <p class="hint">Буде додано запис в історію, а відлік нагадування почнеться заново.</p>
  `, d => {
    const mileage = Number(d.mileage) || 0;
    r.lastKm = mileage;
    r.lastDate = d.date;
    state.records.push({ id: uid(), carId: c.id, type: 'service', title: r.title, date: d.date, mileage, cost: Number(d.cost) || 0, notes: d.notes.trim() });
    if (mileage > Number(c.mileage || 0)) c.mileage = mileage;
  });
}

function mileageForm() {
  const c = car();
  openForm(`
    <h3>Оновити пробіг</h3>
    ${field('Поточний пробіг, км', 'mileage', c.mileage, 'number', 'inputmode="numeric" min="0" required')}
  `, d => {
    const m = Number(d.mileage) || 0;
    if (m < Number(c.mileage || 0) && !confirm('Новий пробіг менший за попередній. Зберегти?')) return false;
    c.mileage = m;
  });
}

/* ---------- Резервні копії ---------- */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `garage-backup-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    try {
      const d = JSON.parse(await inp.files[0].text());
      if (!Array.isArray(d.cars)) throw new Error();
      if (!confirm('Замінити поточні дані даними з файлу?')) return;
      state = { cars: [], records: [], reminders: [], currentCarId: null, ...d };
      save(); render();
      alert('Дані відновлено.');
    } catch { alert('Не вдалося прочитати файл резервної копії.'); }
  };
  inp.click();
}

/* ---------- Події ---------- */

document.querySelector('.tabbar').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  render();
  window.scrollTo(0, 0);
});

$('#carSelect').addEventListener('change', e => {
  if (e.target.value === '__new') { renderCarSelect(); carForm(); return; }
  state.currentCarId = e.target.value;
  save(); render();
});

$('#editCarBtn').addEventListener('click', () => car() && carForm(car()));

$('#fab').addEventListener('click', () => {
  if (tab === 'reminders') reminderForm(); else recordForm();
});

view.addEventListener('click', e => {
  const f = e.target.closest('[data-filter]');
  if (f) { historyFilter = f.dataset.filter; render(); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const id = el.dataset.id;
  switch (el.dataset.act) {
    case 'add-car': carForm(); break;
    case 'update-mileage': mileageForm(); break;
    case 'edit-record': recordForm(state.records.find(r => r.id === id)); break;
    case 'add-reminder': reminderForm(); break;
    case 'edit-reminder': reminderForm(state.reminders.find(r => r.id === id)); break;
    case 'done-reminder': doneReminder(state.reminders.find(r => r.id === id)); break;
    case 'goto-reminders': e.preventDefault(); tab = 'reminders'; render(); break;
    case 'export': exportData(); break;
    case 'import': importData(); break;
  }
});

if (!state.currentCarId && state.cars.length) state.currentCarId = state.cars[0].id;
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
