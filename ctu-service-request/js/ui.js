// PRESENTATION LAYER: DOM only. No storage or business rules here.
import { STATUSES, CONCERN_TYPES, statusLabel } from './config.js';
const $ = id => document.getElementById(id);
const FIELDS = ['studentName', 'concernType', 'description', 'requestDate'];

export function initUI(h) {
  $('concernType').innerHTML = '<option value="">-- Select --</option>' +
    CONCERN_TYPES.map(t => `<option>${t}</option>`).join('');
  $('statusFilter').innerHTML = '<option value="">All statuses</option>' +
    STATUSES.map(s => `<option value="${s.key}">${s.label}</option>`).join('');
  $('requestDate').value = new Date().toISOString().slice(0, 10);

  $('requestForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(FIELDS.map(f => [f, $(f).value]));
    $('submitBtn').disabled = true;
    const res = await h.onSubmit(data);
    $('submitBtn').disabled = false;
    showErrors(res.errors || {});
    if (res.ok) { $('requestForm').reset(); $('requestDate').value = new Date().toISOString().slice(0, 10); }
  });
  const filter = () => h.onFilter({ status: $('statusFilter').value, query: $('searchBox').value });
  $('statusFilter').addEventListener('change', filter);
  $('searchBox').addEventListener('input', filter);
  $('requestList').addEventListener('change', e => {
    if (e.target.matches('select[data-id]')) h.onStatusChange(e.target.dataset.id, e.target.value);
  });
}

function showErrors(errors) {
  FIELDS.forEach(f => {
    $('err-' + f).textContent = errors[f] || '';
    $(f).classList.toggle('invalid', !!errors[f]);
  });
}

export function renderList(items) {
  const box = $('requestList');
  box.innerHTML = '';
  if (!items.length) { box.innerHTML = '<p class="empty">No requests found.</p>'; return; }
  items.forEach(r => {
    const div = document.createElement('div');
    div.className = 'req';
    div.innerHTML = `<div class="id"></div><p class="desc"></p><div class="meta"></div>
      <label>Status <select data-id="${r.id}">${STATUSES.map(s =>
        `<option value="${s.key}" ${s.key === r.status ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label>`;
    div.querySelector('.id').textContent = r.id;
    div.querySelector('.desc').textContent = r.description;
    div.querySelector('.meta').textContent =
      `${r.studentName} • ${r.concernType} • ${r.requestDate} • ${statusLabel(r.status)}`;
    box.appendChild(div);
  });
}

export function toast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  $('toasts').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

export function setNetwork(online) {
  const b = $('netBadge');
  b.textContent = online ? 'Online' : 'Offline';
  b.classList.toggle('offline', !online);
}
