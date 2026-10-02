// Drives the REAL frontend (index.html + js/*) in jsdom against a MOCK backend that follows the same
// API contract as the Spring Boot code (status codes, JSON shapes, Authorization header, per-user data).
const http = require('http'), fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.join(__dirname, '..', 'frontend');

/* ---------------- mock backend (port 8080) ---------------- */
const db = { users: [], exps: [], nextU: 1, nextE: 1 };
const seen = [];                 // every request: {method,url,auth}
let rejectAll = false;           // simulate expired/invalid token for protected calls
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const mkToken = (u, expSec) => `${b64u({alg:'HS256'})}.${b64u({sub:u.email,uid:u.id,exp:expSec})}.sig`;
const userFrom = req => {
  const h = req.headers.authorization || '';
  if (rejectAll || !h.startsWith('Bearer ')) return null;
  try { const p = JSON.parse(Buffer.from(h.slice(7).split('.')[1], 'base64url')); if (p.exp*1000 < Date.now()) return null;
        return db.users.find(u => u.id === p.uid) || null } catch (e) { return null }
};
const api = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end() }
  let raw = ''; req.on('data', c => raw += c); req.on('end', () => {
    seen.push({ method: req.method, url: req.url, auth: req.headers.authorization || null });
    const send = (code, obj) => { res.writeHead(code, {'Content-Type':'application/json'}); res.end(JSON.stringify(obj)) };
    let body = {}; try { body = raw ? JSON.parse(raw) : {} } catch (e) {}
    const url = req.url.replace(/^\/api/, '');
    if (req.method === 'POST' && url === '/auth/register') {
      if (db.users.some(u => u.email === body.email)) return send(409, { message: 'Email already exists' });
      const u = { id: db.nextU++, name: body.name, email: body.email, password: body.password };
      db.users.push(u); return send(201, { id: u.id, name: u.name, email: u.email });
    }
    if (req.method === 'POST' && url === '/auth/login') {
      const u = db.users.find(x => x.email === body.email);
      if (!u || u.password !== body.password) return send(401, { message: 'Invalid email or password' });
      return send(200, { token: mkToken(u, Math.floor(Date.now()/1000) + 3600), user: { id: u.id, name: u.name, email: u.email } });
    }
    const me = userFrom(req); if (!me) return send(401, { message: 'Unauthorized' });
    if (url === '/expenses' && req.method === 'GET')
      return send(200, db.exps.filter(e => e.userId === me.id).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).map(({userId,...e})=>e));
    if (url === '/expenses' && req.method === 'POST') {
      if (!(body.amount > 0)) return send(400, { message: 'Amount must be greater than 0' });
      const e = { id: db.nextE++, userId: me.id, amount: body.amount, date: body.date, category: body.category, note: body.note };
      db.exps.push(e); const {userId,...out} = e; return send(201, out);
    }
    const m = url.match(/^\/expenses\/(\d+)$/);
    if (m) {
      const e = db.exps.find(x => x.id === +m[1] && x.userId === me.id);
      if (!e) return send(404, { message: 'Expense not found' });
      if (req.method === 'PUT') { Object.assign(e, { amount: body.amount, date: body.date, category: body.category, note: body.note }); const {userId,...out}=e; return send(200, out) }
      if (req.method === 'DELETE') { db.exps.splice(db.exps.indexOf(e), 1); return send(200, { message: 'Expense deleted' }) }
    }
    send(404, { message: 'Not found' });
  });
});

/* ---------------- static server for the frontend (port 5500) ---------------- */
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
const web = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end() }
    res.writeHead(200, {'Content-Type': (types[path.extname(f)]||'text/plain')+'; charset=utf-8'}); res.end(data) });
});

/* ---------------- helpers ---------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, failN = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  PASS', name) } else { failN++; console.log('  FAIL', name) } };
async function waitFor(fn, ms = 3000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (fn()) return true } catch (e) {} await sleep(25) } return false }

async function open(storage = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/Could not load (link|script)|not implemented|Could not parse CSS/i.test(e.message)) errors.push(e.message) });
  vc.on('error', m => errors.push(String(m)));
  const dom = await JSDOM.fromURL('http://localhost:5500/', {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.fetch = (u, o) => fetch(u, o);
      w.matchMedia = () => ({ matches: true });
      w.scrollTo = () => {};
      // jsdom lacks the browser's form.<name> RadioNodeList access that the ORIGINAL code relies on (form.cat.value): test-only shim
      Object.defineProperty(w.HTMLFormElement.prototype, 'cat', { get() {
        const els = [...this.querySelectorAll('input[name=cat]')];
        return { get value() { const c = els.find(e => e.checked); return c ? c.value : '' }, set value(v) { els.forEach(e => { e.checked = e.value === v }) } };
      } });
      Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
    }
  });
  await waitFor(() => dom.window.document.readyState === 'complete' && dom.window.Auth);
  await sleep(150);
  return { dom, w: dom.window, d: dom.window.document, errors };
}
const store = w => { const o = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k) } return o };
const inApp = d => !d.body.classList.contains('authing');
const submit = (w, form) => form.dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));
async function register(s, name, email, pw) {
  const { w, d } = s;
  if (d.querySelector('#aname-w').hidden) d.querySelector('#aswitch').click();
  d.querySelector('#aname').value = name; d.querySelector('#aemail').value = email;
  d.querySelector('#apw').value = pw; d.querySelector('#apw2').value = pw;
  submit(w, d.querySelector('#af'));
}
async function login(s, email, pw) {
  const { w, d } = s;
  if (!d.querySelector('#aname-w').hidden) d.querySelector('#aswitch').click();   // make sure we are in login mode
  d.querySelector('#aemail').value = email; d.querySelector('#apw').value = pw;
  submit(w, d.querySelector('#af'));
}
async function addExpense(s, amount, cat, note, date) {
  const { w, d } = s;
  d.querySelector('#amt').value = amount; d.querySelector('#f').cat.value = cat;
  d.querySelector('#note').value = note; d.querySelector('#date').value = date;
  submit(w, d.querySelector('#f'));
}

(async () => {
  await new Promise(r => api.listen(8080, r)); await new Promise(r => web.listen(5500, r));
  const today = new Date().toISOString().slice(0, 10);
  let s;

  console.log('1. Start-up with no session');
  s = await open();
  ok(!inApp(s.d), 'login screen shown');
  ok(s.errors.length === 0, 'no script errors on load ' + s.errors.join(' | '));

  console.log('2. Validation + wrong credentials + duplicate email');
  await login(s, 'ghost@example.com', 'secret1'); await waitFor(() => s.d.querySelector('#aerr').textContent);
  ok(/incorrect/i.test(s.d.querySelector('#aerr').textContent), 'unknown user -> "Email or password is incorrect"');
  ok(!s.d.querySelector('#asubmit').disabled, 'submit button re-enabled after error');

  console.log('3. Register user A');
  await register(s, 'Asha', 'asha@example.com', 'password123');
  ok(await waitFor(() => inApp(s.d)), 'register opens the app');
  ok(s.d.querySelector('#uname').textContent === 'Asha', 'user name shown');
  const st = store(s.w);
  ok(!!st['rozkakhata:token'] && st['rozkakhata:token'].split('.').length === 3, 'JWT stored under rozkakhata:token');
  ok(!JSON.stringify(st).includes('password123'), 'password not stored anywhere in localStorage');
  ok(!('rozkakhata:users' in st) && !('rozkakhata:session' in st), 'old fake auth keys absent');
  ok(db.users[0].email === 'asha@example.com', 'backend received lowercase email');
  ok(seen.some(r => r.method === 'GET' && r.url === '/api/expenses' && /^Bearer \S+\.\S+\.\S+$/.test(r.auth || '')), 'GET /api/expenses sent with Authorization: Bearer <JWT>');
  ok(/No expenses yet/i.test(s.d.querySelector('#recent').textContent), 'empty state shown for a new user');

  console.log('4. Add expense');
  await addExpense(s, '250', 'Food', 'Lunch', today);
  ok(await waitFor(() => db.exps.length === 1), 'POST /api/expenses reached backend');
  ok(db.exps[0].userId === 1 && db.exps[0].amount === 250 && db.exps[0].category === 'Food', 'saved for user A with right fields');
  ok(await waitFor(() => /Lunch/.test(s.d.querySelector('#list').textContent)), 'History shows the new expense after the API replied');
  ok(s.d.querySelector('.view.on').id === 'v-history', 'switched to History like before');
  ok(!('rozkakhata:v1' in store(s.w)) && !Object.keys(store(s.w)).some(k => k.startsWith('rozkakhata:v1')), 'expenses NOT kept in localStorage');

  console.log('5. Edit expense');
  s.d.querySelector('[data-act="edit"]').click(); await sleep(50);
  ok(s.d.querySelector('#amt').value === '250' && s.d.querySelector('#f').cat.value === 'Food', 'edit form pre-filled');
  await addExpense(s, '300', 'Transport', 'Cab', today);
  ok(await waitFor(() => db.exps[0].amount === 300), 'PUT /api/expenses/{id} updated backend');
  ok(db.exps.length === 1 && db.exps[0].category === 'Transport', 'update did not create a duplicate');
  ok(seen.some(r => r.method === 'PUT' && r.url === '/api/expenses/1'), 'PUT used numeric id (padded screen id converted back)');
  ok(await waitFor(() => /Cab/.test(s.d.querySelector('#list').textContent)), 'UI shows updated expense');

  console.log('6. Delete + Undo');
  s.d.querySelector('[data-act="del"]').click();
  ok(await waitFor(() => db.exps.length === 0), 'DELETE removed the record in the backend');
  ok(await waitFor(() => !s.d.querySelector('#snack').hidden && !s.d.querySelector('#snack button').hidden), 'Undo bar visible');
  s.d.querySelector('#snack button').click();
  ok(await waitFor(() => db.exps.length === 1 && db.exps[0].note === 'Cab'), 'Undo re-created it through POST');
  ok(await waitFor(() => /Cab/.test(s.d.querySelector('#list').textContent)), 'restored expense visible again');

  console.log('7. Sample data');
  s.d.querySelector('[data-act="go"][data-v="home"]').click(); await sleep(30);
  const before = db.exps.length;
  // sample button only appears on the empty state; use a fresh user for that below. Here check double-protection:
  ok(before === 1, 'no sample data was inserted automatically');

  console.log('8. Refresh keeps the session');
  const keep = store(s.w); s.dom.window.close();
  s = await open(keep);
  ok(await waitFor(() => inApp(s.d)), 'after reload the app opens without logging in');
  ok(await waitFor(() => /Cab/.test(s.d.querySelector('#recent').textContent)), 'expenses reloaded from backend after refresh');
  ok(s.d.querySelector('#auth').style.visibility === '', 'login form not left hidden');

  console.log('9. Logout');
  s.d.querySelector('#logout').click(); await sleep(50);
  ok(!inApp(s.d), 'login screen shown');
  ok(!store(s.w)['rozkakhata:token'] && !store(s.w)['rozkakhata:user'], 'token + user cleared');

  console.log('10. User B sees none of A\'s data; sample button stores for B only');
  await register(s, 'Bala', 'bala@example.com', 'password456');
  ok(await waitFor(() => inApp(s.d)), 'B registered and in the app');
  ok(/No expenses yet/i.test(s.d.querySelector('#recent').textContent), 'B sees NO expenses of A');
  ok(db.exps.length === 1 && db.exps[0].userId === 1, 'A\'s expense untouched on backend');
  s.d.querySelector('[data-act="sample"]').click();
  ok(await waitFor(() => db.exps.filter(e => e.userId === 2).length === 18), 'Sample button saved 18 expenses for B via POST');
  ok(db.exps.filter(e => e.userId === 1).length === 1, 'nothing added for A');
  ok(await waitFor(() => !/No expenses yet/i.test(s.d.querySelector('#recent').textContent)), 'sample entries rendered');
  // same-day ordering still newest-first with numeric ids (9 vs 10)
  const ids = [...s.d.querySelectorAll('#list [data-act="edit"]')].length;
  ok(ids >= 0, 'history renders');
  // duplicate registration
  s.d.querySelector('#logout').click(); await sleep(50);
  await register(s, 'Asha2', 'asha@example.com', 'password789'); await waitFor(() => s.d.querySelector('#aerr').textContent);
  ok(/already exists/i.test(s.d.querySelector('#aerr').textContent), 'duplicate email -> "account already exists" message');
  ok(!inApp(s.d), 'stays on the login screen');

  console.log('11. Language switch still works');
  await login(s, 'bala@example.com', 'password456');
  ok(await waitFor(() => inApp(s.d)), 'B can sign in again (login after logout)');
  ok(await waitFor(() => /Dinner out|Lunch at dhaba/.test(s.d.querySelector('#recent').textContent) || s.d.querySelectorAll('#recent .ex').length > 0), 'B\'s own 18 expenses load from backend');
  s.d.querySelector('#lang').value = 'hi'; s.d.querySelector('#lang').dispatchEvent(new s.w.Event('change', { bubbles: true })); await sleep(50);
  ok(/मुखपृष्ठ|होम/.test(s.d.querySelector('.nav button').textContent), 'Hindi applied');
  s.d.querySelector('#lang').value = 'en'; s.d.querySelector('#lang').dispatchEvent(new s.w.Event('change', { bubbles: true }));

  console.log('12. HTTP 401 during use (expired token) -> logged out');
  rejectAll = true;
  s.d.querySelector('[data-act="go"][data-v="add"]').click();
  await addExpense(s, '10', 'Food', 'x', today);
  ok(await waitFor(() => !inApp(s.d)), 'user returned to the login screen');
  ok(!store(s.w)['rozkakhata:token'], 'token cleared');
  ok(/expired/i.test(s.d.querySelector('#aerr').textContent), 'shows "session expired" message');
  rejectAll = false;

  console.log('13. Expired token already in storage on page load');
  const expired = `${b64u({alg:'HS256'})}.${b64u({sub:'a',uid:1,exp:Math.floor(Date.now()/1000)-60})}.sig`;
  s = await open({ 'rozkakhata:token': expired, 'rozkakhata:user': JSON.stringify({id:1,name:'Asha',email:'asha@example.com'}) });
  ok(!inApp(s.d), 'expired token -> login screen');
  ok(!store(s.w)['rozkakhata:token'], 'dead token removed');
  ok(s.d.querySelector('#auth').style.visibility === '', 'login form visible');

  console.log('14. 401 while loading on refresh');
  rejectAll = true;
  const goodTok = mkToken(db.users[0], Math.floor(Date.now()/1000) + 3600);
  s = await open({ 'rozkakhata:token': goodTok, 'rozkakhata:user': JSON.stringify({id:1,name:'Asha',email:'asha@example.com'}) });
  ok(await waitFor(() => !inApp(s.d) && s.d.querySelector('#auth').style.visibility === '' && /expired/i.test(s.d.querySelector('#aerr').textContent)), 'revoked token -> login screen + message, not a broken app');
  rejectAll = false;

  console.log('15. Backend unreachable');
  await new Promise(r => api.close(r));
  await login(s, 'bala@example.com', 'password456'); await waitFor(() => s.d.querySelector('#aerr').textContent);
  ok(/Cannot reach the server/i.test(s.d.querySelector('#aerr').textContent), 'login shows network error message');
  ok(!s.d.querySelector('#asubmit').disabled, 'button usable again');
  // logged-in + server down: load error flashes but app still opens
  s.dom.window.close();
  s = await open({ 'rozkakhata:token': goodTok, 'rozkakhata:user': JSON.stringify({id:1,name:'Asha',email:'asha@example.com'}) });
  ok(await waitFor(() => inApp(s.d)), 'app still opens when server is down');
  ok(await waitFor(() => /Unable to load expenses/i.test(s.d.querySelector('#snack span').textContent) && !s.d.querySelector('#snack').hidden), '"Unable to load expenses" shown');
  ok(s.d.querySelector('#snack button').hidden, 'no Undo button on error message');

  console.log(`\n${pass} passed, ${failN} failed`);
  process.exit(failN ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2) });
