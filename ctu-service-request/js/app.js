// CONTROLLER: wires UI <-> request service. Only module that knows both.
import { initUI, renderList, toast, setNetwork } from './ui.js';
import { createRequest, changeStatus, listRequests } from './requestService.js';

let current = { status: '', query: '' };

function friendly(e) {
  if (e.message === 'OFFLINE') return 'You are offline. This action needs a connection and was NOT completed.';
  return 'Something went wrong. The operation was NOT completed.';
}

async function refresh() {
  try { renderList(await listRequests(current)); }
  catch (e) { toast(friendly(e), 'error'); renderList([]); }
}

initUI({
  async onSubmit(data) {
    try {
      const res = await createRequest(data);
      if (!res.ok) { toast('Please fix the highlighted fields.', 'error'); return res; }
      toast(`Request submitted! Your ID: ${res.request.id}`, 'success');
      await refresh();
      return res;
    } catch (e) { toast(friendly(e), 'error'); return { ok: false }; }
  },
  async onStatusChange(id, status) {
    try { await changeStatus(id, status); toast('Status updated.', 'success'); }
    catch (e) { toast(friendly(e), 'error'); }
    await refresh();   // re-render so UI always reflects real stored state
  },
  onFilter(f) { current = f; refresh(); }
});

const net = () => {
  setNetwork(navigator.onLine);
  if (!navigator.onLine) toast('You are offline. Viewing saved data only; submitting is disabled until reconnected.', 'info');
};
window.addEventListener('online', net);
window.addEventListener('offline', net);
setNetwork(navigator.onLine);
refresh();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW failed', err));
}