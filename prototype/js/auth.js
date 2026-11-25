/* AU：平台未登录状态与登录 / 注册（AU-01 外壳未登录变体、AU-02 登录注册弹窗与 #/login 页、§3 数据）。
 * 对外：S.auth = {in, key, id, name}、window.requireLogin(next, opts)、window.AU（home.js 顶栏 / 侧栏 / 首页的挂接点）。
 * 做法：需要账号的入口（动作、全局函数、路由）在本文件统一包一层守卫；未登录时打开登录，成功后继续刚才的动作。
 * 数据按账号保留：当前账号的数据就在原来的 LS 键里，切换账号时把旧账号的快照存到 proto.auth.data.<key>。
 * 必须最后加载（依赖 core / home / workbench / pages / editor / aidesign 已注册的动作与视图）。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP, LS = window.LS;
  const t = (k, v) => window.t(k, v), esc = (s) => window.esc(s), ic = (n, c) => window.ic(n, c), num = (n) => window.num(n);
  const mob = () => window.isMobile();
  const qs = new URLSearchParams(location.search);
  const resetting = !!qs.get('reset');

  // ---------- 账号与登录态 ----------
  const DEF = { key: 'default', id: '20488316', account: '13800138000' }; // 演示默认账号（名称用 account/name 文案）
  const accts = () => LS.get('auth.accts', {}); // 本机注册过的账号：{ 账号: {key, id, name, account, pw} }
  S.auth = Object.assign({ in: true, key: DEF.key, id: DEF.id, name: null }, LS.get('auth', {}));
  const saveAuth = () => { if (!resetting) LS.set('auth', S.auth); };
  if (qs.get('auth') === '0') { S.auth.in = false; saveAuth(); }
  const off = () => !S.auth.in;
  const name = () => (S.auth.key === DEF.key ? t('account/name') : S.auth.name || t('auth/new-user'));

  // 账号名 / ID：外壳与「我的」用的 account/name、account/id 跟着当前账号走（不改别的文件）
  const t0 = window.t;
  window.t = function (key, vars) {
    if (S.auth && S.auth.key !== DEF.key) {
      if (key === 'account/name') return S.auth.name || t0('auth/new-user');
      if (key === 'account/id' && vars) vars = Object.assign({}, vars, { n: S.auth.id });
    }
    return t0(key, vars);
  };

  // ---------- 数据按账号保留 ----------
  // MEM：本页内切走的账号保留「活」数据（同一批对象），没跑完的生成继续更新它们；LS 里另存一份快照，刷新后用
  const MEM = {};
  const owner = () => LS.get('auth.owner', DEF.key);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const live = () => ({ credits: S.credits, monthUsed: S.monthUsed, monthRuns: S.monthRuns, ledger: S.ledger, notices: S.notices, projects: (window.PROJECTS || []).slice(), sessions: S.sessions || [], active: S.activeSession || null });
  const fresh = () => ({ credits: 0, monthUsed: 0, monthRuns: 0, ledger: [], notices: [], projects: [], sessions: [], active: null });
  function switchData(key) {
    const cur = owner();
    if (cur === key) return;
    MEM[cur] = live();
    LS.set('auth.data.' + cur, clone(MEM[cur]));
    let d = MEM[key];
    if (!d) {
      d = LS.get('auth.data.' + key, null) || fresh();
      // 刷新前没跑完的生成：快照里停在进行中，恢复时标成失败，避免一直转圈
      d.sessions.forEach((s) => (s.records || []).forEach((r) => { if (r.status === 'generating') { r.status = 'failed'; r.progress = 0; } }));
    }
    delete MEM[key];
    S.credits = d.credits; S.monthUsed = d.monthUsed; S.monthRuns = d.monthRuns; S.ledger = d.ledger; S.notices = d.notices;
    if (Array.isArray(window.PROJECTS)) window.PROJECTS.splice(0, window.PROJECTS.length, ...d.projects);
    S.sessions = d.sessions; S.activeSession = d.active;
    S.viewer = null; S.setGrid = null; S.flash = null;
    LS.set('auth.owner', key);
    window.persistCore();
  }
  // 切走的账号里没跑完的生成完成时扣点 / 发通知：记到那个账号（按会话 / 记录 id 找），不记到当前账号
  function acctOf(sid, rid) {
    if (!sid && !rid) return null;
    const has = (list) => (list || []).some((s) => (sid && s.id === sid) || (rid && (s.records || []).some((r) => r.id === rid)));
    if (has(S.sessions)) return null;
    return Object.keys(MEM).find((k) => has(MEM[k].sessions)) || null;
  }
  const spend0 = window.spend;
  window.spend = function (n, kind, vars, sid, rid) {
    const k = acctOf(sid, rid); if (!k) return spend0.apply(this, arguments);
    const m = MEM[k]; n = Math.round(n || 0); if (n <= 0) return;
    m.credits -= n; m.monthUsed += n; m.monthRuns += 1;
    m.ledger.unshift({ id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind: kind || 'one', amount: -n, vars: vars || {}, sid: sid || null, rid: rid || null, at: Date.now() });
    LS.set('auth.data.' + k, clone(m));
  };
  const notice0 = window.pushNotice;
  window.pushNotice = function (o) {
    const k = o && acctOf(o.sid, o.rid); if (!k) return notice0.apply(this, arguments);
    const m = MEM[k];
    m.notices.unshift(Object.assign({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), cat: 'gen', at: Date.now() }, o, { read: false }));
    LS.set('auth.data.' + k, clone(m));
  };

  // ---------- 弹窗状态 ----------
  const blank = () => ({ open: false, tab: 'login', method: 'code', acct: '', code: '', pwd: '', rCode: '', rPwd: '', team: '', showPwd: false, agree: false, err: {}, busy: false, tok: 0, cdUntil: 0, forgotTip: false, shakeUntil: 0, next: null, fresh: false, page: false });
  S.au = blank();
  const fq = (qs.get('fail') || '').split(',');
  S.demo = S.demo || {};
  S.demo.loginFail = fq.includes('login'); // ?fail=login：下一次提交网络失败（用一次，重试即成功）

  function openAuth(o, quiet) {
    o = o || {};
    const a = S.au;
    a.open = true; a.page = false; a.tab = o.tab || 'login'; a.next = o.next || null; a.err = {}; a.forgotTip = false; a.fresh = true; a.busy = false; a.tok++;
    S.menu = null;
    if (quiet) return;
    if (window.__inAct) Promise.resolve().then(() => window.render()); else window.render();
  }
  function closeAuth() {
    const a = S.au;
    a.open = false; a.next = null; a.busy = false; a.tok++; a.err = {}; a.forgotTip = false;
    a.code = ''; a.pwd = ''; a.rCode = ''; a.rPwd = ''; a.showPwd = false; // 账号、团队名、勾选保留
  }
  // requireLogin(next, opts)：已登录直接执行；否则弹登录，成功后执行 next
  window.requireLogin = function (next, opts) {
    if (S.auth.in) { if (next) next(); return true; }
    openAuth(Object.assign({}, opts, { next }));
    return false;
  };
  // 登录成功后继续原动作：按动作分发的方式执行（动作内不自己重渲染），最后统一重渲染
  function runNext(fn) {
    if (!fn) return;
    window.__inAct = true;
    try { fn(); } catch (e) { console.error(e); } finally { window.__inAct = false; }
  }

  // ---------- 守卫：动作 / 全局函数 / 路由 ----------
  const PROTECTED = ['projects', 'history', 'workbench', 'recharge', 'editor'];
  const isProt = (r, a) => PROTECTED.includes(r) || (r === 'me' && a === 'ledger');
  const pathProt = (p) => { const [r, a] = String(p || '').replace(/^#?\/?/, '').split('/'); return isProt(r, a); };
  function guardAct(name, pass) {
    const f = A[name]; if (typeof f !== 'function') return;
    A[name] = function (arg, el, e) {
      if (S.auth.in || (pass && pass(arg))) return f.apply(this, arguments);
      openAuth({ next: () => f.call(this, arg, el, e) });
    };
  }
  function guardFn(name) {
    const f = window[name]; if (typeof f !== 'function') return;
    window[name] = function () {
      if (S.auth.in) return f.apply(this, arguments);
      const args = arguments;
      openAuth({ next: () => f.apply(this, args) });
      return false;
    };
  }
  // 创作框：空提示词照常提示（不用登录）；有内容才要账号，提示词保留，登录后真正发出
  guardAct('cSend', () => !S.c.prompt.trim());
  guardAct('adSend', () => S.ad && S.ad.refSt && S.ad.refSt.uploading);
  ['newChat', 'openSession', 'openProject', 'pgNewProj', 'pgOpenProj', 'noticeOpen', 'creditOpen', 'openExport', 'doExport', 'tplNew'].forEach((n) => guardAct(n));
  ['openEditor', 'openNewProject', 'startGeneration', 'costConfirm', 'openTopup', 'openCredit', 'openRecord'].forEach(guardFn);
  // 导航：去受保护页面 → 停在原处弹登录，成功后再跳
  const goA = A.go, goW = window.go;
  A.go = function (p) {
    if (off() && pathProt(p)) { S.sheet = S.sheet === 'search' ? null : S.sheet; S.drawer = false; openAuth({ next: () => goW(p) }); return; }
    return goA.apply(this, arguments);
  };
  window.go = function (p) {
    if (off() && pathProt(p)) { openAuth({ next: () => goW(p) }); return; }
    return goW(p);
  };

  // ---------- 退出登录：回到未登录首页，数据留在本机（按账号） ----------
  function logout() {
    S.auth.in = false; saveAuth();
    closeAuth();
    S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; S.viewer = null; S.setGrid = null;
    if (window.ED && window.ED.isOpen && window.ED.isOpen()) window.ED.escape();
    S.route = 'home'; S.routeArg = null; // 先切到首页再渲染，避免在受保护页上触发路由守卫
    goW('home');
  }
  ['logoutOk', 'pgLogoutOk'].forEach((n) => { const f = A[n]; if (typeof f === 'function') A[n] = function () { f.apply(this, arguments); logout(); }; });

  // ---------- 校验与提交 ----------
  const norm = (v) => String(v || '').trim().toLowerCase();
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const isPhone = (v) => /^\+?[\d\s-]{6,20}$/.test(v) && v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15;
  const acctErr = (v) => (!v ? 'auth/err-acct-empty' : isEmail(v) || isPhone(v) ? null : 'auth/err-acct');
  const mask = (v) => { if (isEmail(v)) { const [u, d] = v.split('@'); return u.slice(0, 2) + '***@' + d; } const n = v.replace(/\D/g, ''); return n.length >= 7 ? n.slice(0, 3) + '****' + n.slice(-4) : v; };
  const strength = (p) => { if (!p) return 0; const k = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length; if (p.length < 8 || k <= 1) return 1; return k >= 3 && p.length >= 10 ? 3 : 2; };
  const cdLeft = () => Math.max(0, Math.ceil((S.au.cdUntil - Date.now()) / 1000));
  const isReg = () => S.au.tab === 'register';

  function validate() {
    const a = S.au, e = {}, acct = norm(a.acct);
    const ae = acctErr(acct); if (ae) e.acct = ae;
    if (isReg()) {
      if (!a.rCode.trim()) e.code = 'auth/err-code-empty'; else if (!/^\d{6}$/.test(a.rCode.trim())) e.code = 'auth/err-code';
      if (!a.rPwd) e.pwd = 'auth/err-pwd-empty'; else if (a.rPwd.length < 8) e.pwd = 'auth/err-pwd-short';
    } else if (a.method === 'code') {
      if (!a.code.trim()) e.code = 'auth/err-code-empty'; else if (!/^\d{6}$/.test(a.code.trim())) e.code = 'auth/err-code';
    } else if (!a.pwd) e.pwd = 'auth/err-pwd-empty';
    if (!a.agree) { e.agree = true; a.shakeUntil = Date.now() + 400; }
    return e;
  }
  A.auSubmit = () => {
    const a = S.au; if (a.busy) return false;
    a.err = validate(); a.forgotTip = a.forgotTip && !a.err.acct;
    if (Object.keys(a.err).length) {
      const tok = a.tok; setTimeout(() => { if (S.au.tok === tok && S.au.shakeUntil && Date.now() >= S.au.shakeUntil) { S.au.shakeUntil = 0; const n = document.querySelector('.au-agree.is-shake'); if (n) n.classList.remove('is-shake'); } }, 420);
      return;
    }
    a.busy = true; const tok = ++a.tok;
    setTimeout(() => { if (S.au.tok !== tok || !S.au.busy) return; S.au.busy = false; finish(); window.render(); }, 1200);
  };
  function finish() {
    const a = S.au, acct = norm(a.acct), list = accts();
    if (S.demo.loginFail) { S.demo.loginFail = false; a.err = { net: true }; return; }
    if (isReg()) {
      if (list[acct] || acct === DEF.account) { a.err = { acct: 'auth/err-exists', exists: true }; return; }
      if (a.rCode.trim() === '000000') { a.err = { code: 'auth/err-code' }; return; }
      const rec = { key: 'u:' + acct, id: String(30000000 + Math.floor(Math.random() * 60000000)), name: a.team.trim() || mask(acct), account: acct, pw: a.rPwd };
      list[acct] = rec; LS.set('auth.accts', list);
      success(rec, true);
      return;
    }
    const rec = list[acct];
    if (!rec && acct.includes('new')) { a.err = { acct: 'auth/err-unreg', unreg: true }; return; }
    if (a.method === 'code' && a.code.trim() === '000000') { a.err = { code: 'auth/err-code' }; return; }
    if (a.method === 'pwd' && (a.pwd === 'wrong' || (rec && rec.pw && rec.pw !== a.pwd))) { a.err = { pwd: 'auth/err-pwd' }; return; }
    success(rec || { key: DEF.key, id: DEF.id, name: null }, false);
  }
  function success(rec, isNew) {
    const a = S.au, next = a.next, page = S.route === 'login';
    switchData(rec.key);
    S.auth = { in: true, key: rec.key, id: rec.id, name: rec.name || null }; saveAuth();
    if (isNew) { // 注册送 500 点：余额、流水、通知一致
      S.credits += 500;
      S.ledger.unshift({ id: 'l' + Date.now().toString(36), kind: 'topup', amount: 500, vars: { au: 'bonus' }, at: Date.now() });
      window.pushNotice({ kind: 'credit', cat: 'sys', title: { k: 'auth/n-bonus', v: { n: num(500) } }, body: { k: 'notice/balance-d', v: { n: num(S.credits) } } });
    }
    window.persistCore();
    closeAuth(); a.tab = 'login';
    window.toast(isNew ? t('auth/reg-ok') : t('auth/welcome', { name: name() }));
    if (page) { goW('home'); return; }
    runNext(next);
  }
  // 注册赠送的流水标题
  const lt0 = window.ledgerTitle;
  window.ledgerTitle = (l) => (l && l.vars && l.vars.au === 'bonus' ? t('auth/l-bonus') : lt0(l));

  // ---------- 弹窗里的动作 ----------
  A.auOpen = (tab) => { openAuth({ tab: tab === 'register' ? 'register' : 'login' }, true); };
  A.auClose = () => { if (S.route === 'login') { closeAuth(); goW('home'); return false; } closeAuth(); };
  A.auTab = (v) => { const a = S.au; if (a.busy) return false; a.tab = v; a.err = {}; a.forgotTip = false; };
  A.auMethod = (v) => { const a = S.au; if (a.busy) return false; a.method = v; a.err = {}; a.forgotTip = false; };
  A.auForgot = () => { const a = S.au; if (a.busy) return false; a.method = 'code'; a.err = {}; a.forgotTip = true; };
  A.auEye = () => { S.au.showPwd = !S.au.showPwd; setTimeout(() => { const n = document.querySelector('.au-pwd input'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 0); };
  A.auAgree = () => { const a = S.au; if (a.busy) return false; a.agree = !a.agree; if (a.agree) delete a.err.agree; };
  A.auGoReg = () => { const a = S.au; a.tab = 'register'; a.err = {}; a.forgotTip = false; };
  A.auGoLogin = () => { const a = S.au; a.tab = 'login'; a.err = {}; a.forgotTip = false; };
  A.auRetry = () => { delete S.au.err.net; return A.auSubmit(); };
  A.auDoc = () => { window.comingSoon(); return false; };
  A.auKey = (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); A.auSubmit(); return true; } };
  A.auCode = () => {
    const a = S.au; if (a.busy || cdLeft() > 0) return false;
    const ae = acctErr(norm(a.acct)); if (ae) { a.err = Object.assign({}, a.err, { acct: ae }); return; }
    a.cdUntil = Date.now() + 60000; a.sent = true;
    delete a.err.acct;
    window.toast(t('auth/code-sent'), { info: true, ms: 3600 });
    tickCd();
    setTimeout(() => { const n = document.querySelector('.au-code input'); if (n) n.focus(); }, 0);
  };
  let cdTimer = null;
  function tickCd() {
    if (cdTimer) return;
    cdTimer = setInterval(() => {
      const n = cdLeft();
      document.querySelectorAll('[data-au-cd]').forEach((b) => { b.textContent = n > 0 ? t('auth/resend-n', { n }) : t('auth/resend'); b.classList.toggle('is-wait', n > 0); b.disabled = n > 0 || S.au.busy; });
      if (n <= 0) { clearInterval(cdTimer); cdTimer = null; }
    }, 1000);
  }
  // 输入：有错时清掉该字段的错（重渲染一次）
  const clr = (k) => { const e = S.au.err; const had = !!(e[k] || e.net || (k === 'acct' && (e.unreg || e.exists))); delete e[k]; delete e.net; if (k === 'acct') { delete e.unreg; delete e.exists; } return had; };
  I.auAcct = (v) => { S.au.acct = v; return clr('acct'); };
  I.auCodeIn = (v) => { S.au[isReg() ? 'rCode' : 'code'] = v.replace(/\D/g, '').slice(0, 6); const el = document.querySelector('.au-code input'); if (el && el.value !== S.au[isReg() ? 'rCode' : 'code']) el.value = S.au[isReg() ? 'rCode' : 'code']; return clr('code'); };
  I.auPwd = (v) => { S.au.pwd = v; return clr('pwd'); };
  I.auRPwd = (v) => { const was = strength(S.au.rPwd); S.au.rPwd = v; const had = clr('pwd'); return had || was !== strength(v); };
  I.auTeam = (v) => { S.au.team = v; return false; };

  // ---------- 渲染：表单 ----------
  function field(label, inner, errKey, extra = '') {
    const e = S.au.err[errKey];
    return `<div class="au-field ${e ? 'is-err' : ''}"><label class="au-lab">${esc(label)}</label>${inner}${e ? `<div class="au-err" role="alert">${ic('warning-circle-fill', 'ic-16')}<span>${esc(t(e))}</span>${extra}</div>` : ''}</div>`;
  }
  function form() {
    const a = S.au, reg = isReg(), dis = a.busy ? 'disabled' : '', e = a.err;
    const fresh = a.fresh;
    const acctLink = e.unreg ? `<button class="au-link" data-act="auGoReg">${t('auth/go-register')}</button>` : e.exists ? `<button class="au-link" data-act="auGoLogin">${t('auth/go-login')}</button>` : '';
    const acctF = field(t('auth/acct'), `<div class="au-input"><input class="input" data-input="auAcct" data-key="auKey" value="${esc(a.acct)}" placeholder="${esc(t('auth/acct-ph'))}" autocomplete="username" inputmode="email" maxlength="64" ${fresh ? 'data-autofocus' : ''} ${dis} aria-label="${esc(t('auth/acct'))}"></div>`, 'acct', acctLink);
    const n = cdLeft();
    const cdBtn = `<button class="au-cd ${n > 0 ? 'is-wait' : ''}" data-act="auCode" data-au-cd ${n > 0 || a.busy ? 'disabled' : ''}>${n > 0 ? t('auth/resend-n', { n }) : a.sent ? t('auth/resend') : t('auth/get-code')}</button>`;
    const codeF = field(t('auth/code'), `<div class="au-input au-code"><input class="input" data-input="auCodeIn" data-key="auKey" value="${esc(reg ? a.rCode : a.code)}" placeholder="${esc(t('auth/code-ph'))}" inputmode="numeric" autocomplete="one-time-code" maxlength="6" ${dis} aria-label="${esc(t('auth/code'))}">${cdBtn}</div>`, 'code');
    const eye = `<button class="au-eye" data-act="auEye" ${dis} aria-label="${esc(t(a.showPwd ? 'auth/hide-pwd' : 'auth/show-pwd'))}" title="${esc(t(a.showPwd ? 'auth/hide-pwd' : 'auth/show-pwd'))}">${ic(a.showPwd ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`;
    const pwdIn = (k, ph, ac) => `<div class="au-input au-pwd"><input class="input" type="${a.showPwd ? 'text' : 'password'}" data-input="${k}" data-key="auKey" value="${esc(k === 'auPwd' ? a.pwd : a.rPwd)}" placeholder="${esc(ph)}" autocomplete="${ac}" maxlength="64" ${dis} aria-label="${esc(ph)}">${eye}</div>`;
    let body;
    if (reg) {
      const s = strength(a.rPwd);
      const meter = a.rPwd ? `<div class="au-meter is-s${s}" aria-live="polite"><span class="au-bars"><i></i><i></i><i></i></span><span class="caption">${t('auth/strength')}：${t(['', 'auth/s-weak', 'auth/s-mid', 'auth/s-strong'][s])}</span></div>` : '';
      body = acctF + codeF + field(t('auth/pwd-set'), pwdIn('auRPwd', t('auth/pwd-set-ph'), 'new-password') + (e.pwd ? '' : meter), 'pwd')
        + field(t('auth/team'), `<div class="au-input"><input class="input" data-input="auTeam" data-key="auKey" value="${esc(a.team)}" placeholder="${esc(t('auth/team-ph'))}" maxlength="30" ${dis} aria-label="${esc(t('auth/team'))}"></div>`, 'team');
    } else {
      const methods = `<div class="au-methods" role="tablist">${['code', 'pwd'].map((m) => `<button class="au-method ${a.method === m ? 'is-on' : ''}" role="tab" aria-selected="${a.method === m}" data-act="auMethod" data-arg="${m}" ${dis}>${t('auth/m-' + m)}</button>`).join('<i></i>')}</div>`;
      body = methods + (a.forgotTip ? `<div class="notice au-tip">${ic('info-fill', 'ic-16')}<span>${t('auth/forgot-tip')}</span></div>` : '') + acctF
        + (a.method === 'code' ? codeF : field(t('auth/pwd'), pwdIn('auPwd', t('auth/pwd-ph'), 'current-password'), 'pwd') + `<div class="au-forgot"><button class="au-link" data-act="auForgot" ${dis}>${t('auth/forgot')}</button></div>`);
    }
    const net = e.net ? `<div class="notice is-err au-net" role="alert">${ic('x-circle-fill', 'ic-16')}<span class="grow">${t('auth/err-net')}</span><button class="btn btn-sm btn-secondary" data-act="auRetry">${t('auth/retry')}</button></div>` : '';
    const shake = Date.now() < a.shakeUntil;
    const agreeTxt = t('auth/agree', { a: `<button class="au-doc" data-act="auDoc">${esc(t('auth/terms'))}</button>`, b: `<button class="au-doc" data-act="auDoc">${esc(t('auth/privacy'))}</button>` });
    const agree = `<div class="au-agree ${shake ? 'is-shake' : ''} ${e.agree ? 'is-err' : ''}"><button class="au-check ${a.agree ? 'is-on' : ''}" role="checkbox" aria-checked="${a.agree}" data-act="auAgree" ${dis} aria-label="${esc(t('auth/terms') + t('auth/privacy'))}">${ic(a.agree ? 'check-square-fill' : 'square', 'ic-16')}</button><span class="au-agree-t">${agreeTxt}</span></div>${e.agree ? `<div class="au-err is-agree" role="alert">${ic('warning-circle-fill', 'ic-16')}<span>${t('auth/agree-need')}</span></div>` : ''}`;
    const submit = `<button class="btn btn-primary btn-block au-submit ${a.busy ? 'is-busy' : ''}" data-act="auSubmit" ${a.busy ? 'aria-busy="true"' : ''}>${a.busy ? `${ic('circle-notch', 'ic-16 au-spin')}${t(reg ? 'auth/registering' : 'auth/submitting')}` : t(reg ? 'auth/submit-register' : 'auth/login')}</button>`;
    const tabs = `<div class="seg au-tabs" role="tablist">${['login', 'register'].map((k) => `<button class="seg-opt ${a.tab === k ? 'is-on' : ''}" role="tab" aria-selected="${a.tab === k}" data-act="auTab" data-arg="${k}" ${dis}>${t('auth/' + k)}</button>`).join('')}</div>`;
    const head = `<div class="au-head"><img class="au-orb" src="assets/logo-orb.webp" alt=""><div class="au-head-t"><h3 id="au-title">${t(reg ? 'auth/title-register' : 'auth/title-login')}</h3><p class="muted">${t(reg ? 'auth/sub-register' : 'auth/sub-login')}</p></div><button class="ibtn ibtn-sm ibtn-secondary au-x" data-act="auClose" aria-label="${esc(t('auth/close'))}" title="${esc(t('auth/close'))}">${ic('x', 'ic-16')}</button></div>`;
    return `${head}${tabs}<div class="au-form ${a.busy ? 'is-busy' : ''}">${net}${body}${agree}${submit}<div class="au-more caption">${t('auth/more')}</div></div>`;
  }
  // 弹窗层（电脑居中 440；手机全屏底部面板，可下拉关闭）
  function layer() {
    const a = S.au;
    if (!a.open || S.route === 'login') return '';
    const sheet = mob();
    return `<div class="au-scrim" data-act="auClose"></div><div class="au-dlg ${sheet ? 'is-sheet' : ''} ${a.tab === 'register' ? 'is-reg' : ''}" role="dialog" aria-modal="true" aria-labelledby="au-title" data-sk="au-dlg">${sheet ? '<div class="au-grab" aria-hidden="true"><i></i></div>' : ''}${form()}</div>`;
  }
  window.AFTER_RENDER.push(() => { if (S.au.fresh) S.au.fresh = false; });

  // Esc 只关登录层（不连带关掉下面的模板预览等）
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (S.au.open && S.route !== 'login') { e.stopPropagation(); closeAuth(); window.render(); }
  }, true);
  // 手机面板下拉关闭（拖动顶部把手 / 标题区）
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest && e.target.closest('.au-dlg.is-sheet .au-grab, .au-dlg.is-sheet .au-head');
    if (!h || e.target.closest('button')) return;
    const d = h.closest('.au-dlg'); drag = { y: e.clientY, d, dy: 0 };
    d.style.transition = 'none';
  });
  document.addEventListener('pointermove', (e) => { if (!drag) return; drag.dy = Math.max(0, e.clientY - drag.y); drag.d.style.transform = `translateY(${drag.dy}px)`; });
  const endDrag = () => {
    if (!drag) return; const d = drag.d, dy = drag.dy; drag = null;
    d.style.transition = ''; d.style.transform = '';
    if (dy > 90) { closeAuth(); window.render(); }
  };
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);

  // ---------- 外壳挂接点（home.js 调用） ----------
  const loginBtns = () => `<button class="btn btn-secondary au-tb-btn" data-act="auOpen" data-arg="login">${t('auth/login')}</button><button class="btn btn-primary au-tb-btn" data-act="auOpen" data-arg="register">${t('auth/register')}</button>`;
  window.AU = {
    off, name, layer, open: openAuth,
    deskBtns: loginBtns,
    mBtn: () => `<button class="au-m-login" data-act="auOpen" data-arg="login">${t('auth/login')}</button>`,
    sbBlock: (exp) => `<button class="nav" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}<span>${t('nav/workbench')}</span></button><button class="nav" data-act="newChat">${ic('plus')}<span>${t('nav/new-chat')}</span></button>`
      + (exp ? `<div class="au-sb-card"><span class="au-sb-ic">${ic('user-circle-fill')}</span><p>${t('auth/sb-card')}</p><button class="btn btn-primary btn-sm btn-block" data-act="auOpen" data-arg="login">${ic('sign-in-fill', 'ic-16')}${t('auth/login')}</button></div>`
        : `<button class="nav au-sb-login" data-act="auOpen" data-arg="login" title="${esc(t('auth/sb-card'))}">${ic('sign-in-fill')}<span>${t('auth/login')}</span></button>`),
    homeCard: () => `<section class="section"><div class="section-head"><h2>${t('section/recent')}</h2></div>
      <div class="au-guide"><span class="au-guide-ic">${ic('folder-fill', 'ic-24')}</span><div class="au-guide-t"><h3>${t('auth/guide-title')}</h3><p>${t('auth/guide-desc')}</p></div>
      <div class="au-guide-btns"><button class="btn btn-secondary" data-act="auOpen" data-arg="register">${ic('user-plus-fill', 'ic-16')}${t('auth/register')}</button><button class="btn btn-primary" data-act="auOpen" data-arg="login">${ic('sign-in-fill', 'ic-16')}${t('auth/login')}</button></div></div></section>`,
  };

  // ---------- 未登录「我的」 ----------
  function meOut() {
    const langName = (window.LANGS.find((l) => l.code === S.lang) || {}).name || S.lang;
    const langBody = window.LANGS.map((l) => `<button class="menu-item ${S.lang === l.code ? 'is-on' : ''}" data-act="setLang" data-arg="${l.code}">${l.name}</button>`).join('');
    const row = (icon, label, trail, act, arg, cls = '') => `<button class="pg-row ${cls}" data-act="${act}" ${arg != null ? `data-arg="${arg}"` : ''}>${ic(icon, 'pg-row-ic')}<span class="pg-row-l ellipsis">${esc(label)}</span>${trail ? `<span class="pg-row-t">${esc(trail)}</span>` : ''}${ic('caret-right', 'ic-16 pg-chev')}</button>`;
    const card = `<section class="pg-card au-me"><span class="au-me-av">${ic('user-fill')}</span><div class="au-me-t"><h2>${t('auth/me-title')}</h2><p class="muted">${t('auth/me-desc')}</p></div>
      <button class="btn btn-primary au-me-btn" data-act="auOpen" data-arg="login">${ic('sign-in-fill', 'ic-16')}${t('auth/login-register')}</button></section>`;
    const prefs = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/prefs')}</h2>
      <div class="rel">${row('globe', t('nav/language'), langName, mob() ? 'pgSheet' : 'menu:toggle', 'pg-lang', S.menu === 'pg-lang' ? 'is-open' : '')}${!mob() && S.menu === 'pg-lang' ? `<div class="menu pg-menu pg-lmenu">${langBody}</div>` : ''}</div>
      <div class="pg-row is-static">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill', 'pg-row-ic')}<span class="pg-row-l ellipsis">${t('account/appearance')}</span>${window.seg([{ v: 'light', label: t('nav/theme-light') }, { v: 'dark', label: t('nav/theme-dark') }], S.theme, 'setTheme', 'pg-seg')}</div></section>`;
    const help = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/help')}</h2>${row('question-fill', t('account/help'), '', 'soon')}</section>`;
    const head = mob() ? '' : `<div class="pg-head"><div class="pg-head-t"><h1>${esc(t('nav/me'))}</h1></div></div>`;
    return window.shell(`<main class="page pg pg-me">${head}${card}${prefs}${help}</main>`, { solid: true });
  }

  // ---------- 独立登录页 #/login ----------
  function loginPage() {
    const a = S.au;
    if (!a.open || !a.page) { const keep = a.open ? a.tab : 'login'; Object.assign(a, { open: true, page: true, tab: keep, fresh: true, next: null }); }
    const langMenu = S.menu === 'au-lang' ? `<div class="menu au-lmenu">${window.langItems()}</div>` : '';
    return `<div class="au-page"><header class="au-page-top"><img class="logo" src="assets/logo-orb.webp" alt="logo">${window.demoTag()}<span class="grow"></span>
      <div class="rel"><button class="ibtn au-glass" data-act="menu:toggle" data-arg="au-lang" title="${esc(t('nav/language'))}" aria-label="${esc(t('nav/language'))}">${ic('globe')}</button>${langMenu}</div>
      <button class="ibtn au-glass" data-act="setTheme" title="${esc(t(S.theme === 'dark' ? 'nav/theme-dark' : 'nav/theme-light'))}" aria-label="${esc(t(S.theme === 'dark' ? 'nav/theme-dark' : 'nav/theme-light'))}">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill')}</button></header>
      <main class="au-page-main"><div class="au-dlg is-page ${a.tab === 'register' ? 'is-reg' : ''}" role="main" aria-labelledby="au-title">${form()}</div>
      <button class="au-page-back" data-act="auClose">${ic('caret-left', 'ic-16')}${t('auth/back-home')}</button></main></div>`;
  }

  // ---------- 视图：路由守卫 + 叠加登录层 ----------
  const V = window.VIEWS;
  const toHome = () => { history.replaceState(null, '', location.pathname + location.search + '#/home'); S.route = 'home'; S.routeArg = null; };
  V.login = function () {
    if (S.auth.in) { toHome(); return V.home(); }
    return loginPage();
  };
  V.login.__au = true;
  const meIn = V.me;
  V.me = function () { return off() && S.routeArg !== 'ledger' ? meOut() : meIn.apply(this, arguments); };
  Object.keys(V).forEach((k) => {
    const f = V[k]; if (typeof f !== 'function' || f.__au) return;
    const g = function () {
      if (off() && isProt(S.route, S.routeArg) && (k === S.route || k === 'todo')) {
        const target = S.route + (S.routeArg ? '/' + S.routeArg : '');
        toHome(); openAuth({ next: () => goW(target) }, true);
        return V.home();
      }
      if (S.route !== 'login' && S.au.page) { S.au.page = false; S.au.open = false; } // 离开 #/login 页
      return f.apply(this, arguments) + layer();
    };
    g.__au = true; V[k] = g;
  });
})();
