// DATA ACCESS LAYER: the only module that touches storage.
// Acts as a mock "server" API (localStorage-backed).
// Server-dependent operations fail when the browser is offline.
const KEY = 'ctu_requests';

const read  = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = list => localStorage.setItem(KEY, JSON.stringify(list));
const delay = ms => new Promise(r => setTimeout(r, ms));

// Every server-dependent call passes through here.
async function gate() {
  await delay(300);
  if (!navigator.onLine) throw new Error('OFFLINE');
}

export const dataService = {
  // Reading previously saved data works offline (local copy).
  async getAll() {
    await delay(100);
    return read();
  },
  async insert(record) {          // requires connection
    await gate();
    const list = read();
    list.push(record);
    write(list);
    return record;
  },
  async update(id, changes) {     // requires connection
    await gate();
    const list = read();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('NOT_FOUND');
    Object.assign(item, changes);
    write(list);
    return item;
  }
};