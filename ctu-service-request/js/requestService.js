// REQUEST-PROCESSING LOGIC: validation, ID generation, status rules, filtering.
// Talks to the data layer only through dataService's functions.
import { dataService } from './dataService.js';
import { CONCERN_TYPES, STATUSES, DEFAULT_STATUS } from './config.js';

// Unique ID per request (timestamp + random), so identical descriptions never collide.
function generateId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CTU-${t}-${r}`;
}

export function validate(d) {
  const errors = {};
  const name = (d.studentName || '').trim();
  if (!name) errors.studentName = 'Student name is required.';
  else if (!/^[A-Za-zÑñ.\- ]{2,}$/.test(name)) errors.studentName = 'Use letters only (at least 2 characters).';
  if (!CONCERN_TYPES.includes(d.concernType)) errors.concernType = 'Please select a type of concern.';
  const desc = (d.description || '').trim();
  if (!desc) errors.description = 'Description is required.';
  else if (desc.length < 10) errors.description = 'Description must be at least 10 characters.';
  const today = new Date().toISOString().slice(0, 10);
  if (!d.requestDate) errors.requestDate = 'Date of request is required.';
  else if (d.requestDate > today) errors.requestDate = 'Date cannot be in the future.';
  return { ok: Object.keys(errors).length === 0, errors };
}

export async function createRequest(d) {
  const v = validate(d);
  if (!v.ok) return v;
  const record = {
    id: generateId(),
    studentName: d.studentName.trim(),
    concernType: d.concernType,
    description: d.description.trim(),
    requestDate: d.requestDate,
    status: DEFAULT_STATUS
  };
  await dataService.insert(record);
  return { ok: true, request: record };
}

export async function changeStatus(id, status) {
  if (!STATUSES.some(s => s.key === status)) throw new Error('INVALID_STATUS');
  return dataService.update(id, { status });
}

export async function listRequests({ status = '', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  const all = await dataService.getAll();
  return all
    .filter(r => !status || r.status === status)
    .filter(r => !q || r.id.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q))
    .reverse();
}
