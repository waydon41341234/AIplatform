/* 核心：状态、文案、路由、渲染循环、通用组件（菜单/面板/弹窗/提示）。
 * 第五轮 A：§0.3 共用接口已就绪（见文件末尾「第五轮 A」段）：
 *   S.credits / S.ledger / S.notices / S.demo、canAfford(n)、spend(n, kind, vars, sid, rid)、topup(n)、openTopup()、
 *   pushNotice(o)、takeFail(prompt?)、pickImage(opts, cb)、refSlot(state, act) + refPick / refUpload / refCancel、
 *   costConfirm(opts) / costConfirmLayer() / lowBalance(n)、tx({k, v}) 文案拼装、fmtTime(x)、ledgerTitle(l)、progressRing(pct)。
 *   路由 #/templates #/projects #/history #/me #/recharge 已接好（VIEWS.* 由 D 在 pages.js 注册，未注册时落到 VIEWS.todo）。 */
(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('proto.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('proto.' + k, JSON.stringify(v)); } catch (e) { /* 隐私模式忽略 */ } },
  };
  const qs = new URLSearchParams(location.search);
  const S = (window.S = {
    theme: qs.get('theme') || LS.get('theme', 'dark'),
    lang: qs.get('lang') || LS.get('lang', 'zh-Hans'),
    route: 'home',
    sidebarExpanded: LS.get('sidebarExpanded', false),
    wbSidebar: LS.get('wbSidebar', true), // 工作台默认展开侧栏并显示历史会话
    historyOpen: true,
    menu: null, // 当前打开的下拉菜单 id
    sheet: null, // 手机底部面板 id
    dialog: null, // 居中弹窗 id
    drawer: false,
    toasts: [],
  });
  const LANG_IDX = { 'zh-Hans': 0, 'zh-Hant': 1, en: 2, vi: 3 };

  // ---------- 文案 ----------
  function t(key, vars) {
    const row = window.I18N[key];
    let s = row ? (row[LANG_IDX[S.lang]] ?? row[0]) : key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => (S.lang === 'vi' ? n.toLocaleString('vi-VN') : n.toLocaleString('en-US'));

  // ---------- 图标 ----------
  function ic(name, cls = '') {
    const p = window.PH[name];
    if (!p) return '';
    return `<svg class="ic ${cls}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${p}</svg>`;
  }
  // 平台自绘双色类型图标（nav.middle / nav.bottom / category.grid）
  function typeIcon(type, cls = '') {
    const on = 'var(--brand)', off = 'var(--icon-3)';
    if (type === 'gametype') return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="3.75" fill="${on}"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="3.75" fill="${off}"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="3.75" fill="${off}"/><rect x="13" y="13" width="7.5" height="7.5" rx="3.75" fill="${off}"/></svg>`;
    // 首页设计：整页版式（顶栏、主色 Banner、下方两块），和三类图标页签同一套双色画法（2026-11-26 Waydon：面性部分用蓝色）
    if (type === 'design') return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.25" width="17" height="4" rx="2" fill="${off}"/><rect x="3.5" y="9" width="17" height="5.5" rx="2" fill="${on}"/><rect x="3.5" y="16.25" width="7.75" height="4.5" rx="2" fill="${off}"/><rect x="12.75" y="16.25" width="7.75" height="4.5" rx="2" fill="${off}"/></svg>`;
    const a = type === 'midnav' ? [off, on, off] : [off, off, on];
    return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.25" width="16" height="4.5" rx="2.25" fill="${a[0]}"/><rect x="4" y="9.75" width="16" height="4.5" rx="2.25" fill="${a[1]}"/><rect x="4" y="16.25" width="16" height="4.5" rx="2.25" fill="${a[2]}"/></svg>`;
  }
  const MODEL_LOGO = {
    gpt: '<svg class="model-logo" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#fff" d="M18.85 10.55a4.04 4.04 0 0 0-.34-3.27 4.1 4.1 0 0 0-4.34-1.94A4.07 4.07 0 0 0 7.32 6.8a4.04 4.04 0 0 0-2.67 1.92 4.1 4.1 0 0 0 .5 4.73 4.04 4.04 0 0 0 .34 3.27 4.1 4.1 0 0 0 4.34 1.94 4.06 4.06 0 0 0 3.01 1.34 4.1 4.1 0 0 0 3.85-2.8 4.04 4.04 0 0 0 2.67-1.94 4.1 4.1 0 0 0-.5-4.73Zm-6.01 8.4a3.03 3.03 0 0 1-1.92-.7l.1-.05 3.18-1.84a.52.52 0 0 0 .26-.45v-4.49l1.35.78v3.76a3 3 0 0 1-2.97 2.99Zm-6.44-2.75a3 3 0 0 1-.36-2.01l.1.06 3.19 1.84c.08.05.17.07.26.07s.18-.02.26-.07l3.9-2.25v1.56l-3.25 1.86a3 3 0 0 1-4.1-1.06Zm-.84-6.94a3 3 0 0 1 1.58-1.31v3.78c0 .1.02.18.07.26.04.08.11.15.19.19l3.88 2.24-1.35.78-3.22-1.86a3 3 0 0 1-1.15-4.09Zm11.06 2.57-3.89-2.26 1.35-.77 3.22 1.86a3 3 0 0 1-.45 5.4v-3.78a.53.53 0 0 0-.23-.45Zm1.34-2.01-.1-.06-3.18-1.85a.52.52 0 0 0-.52 0l-3.9 2.24V8.6l3.24-1.86a3 3 0 0 1 4.45 3.11ZM9.54 12.58l-1.35-.78V8.05a3 3 0 0 1 4.92-2.3l-.1.05-3.18 1.84a.52.52 0 0 0-.26.45l-.03 4.49Zm.73-1.58L12 10l1.74 1v2l-1.73 1-1.74-1Z"/></svg>',
    gemini: '<svg class="model-logo" viewBox="0 0 24 24"><defs><linearGradient id="gmg" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#1F87FF"/><stop offset=".5" stop-color="#8C6EE3"/><stop offset="1" stop-color="#DB6B80"/></linearGradient></defs><path fill="url(#gmg)" d="M11.12 18.71Q12 20.72 12 23q0-2.28.85-4.29a11.3 11.3 0 0 1 5.86-5.83Q20.72 12 23 12q-2.28 0-4.29-.85a11.3 11.3 0 0 1-5.86-5.86Q12 3.28 12 1q0 2.28-.88 4.29a11.3 11.3 0 0 1-5.83 5.86Q3.28 12 1 12q2.28 0 4.29.88a11.3 11.3 0 0 1 5.83 5.83Z"/></svg>',
  };

  // ---------- 断点 ----------
  const bp = () => { const w = window.innerWidth; return w < 600 ? 'compact' : w < 840 ? 'medium' : w < 1200 ? 'expanded' : 'desktop'; };
  const isMobile = () => window.innerWidth < 600;

  // ---------- 提示 ----------
  let toastId = 0;
  function toast(msg, opts = {}) {
    const id = ++toastId;
    S.toasts.push({ id, msg, action: opts.action, actionLabel: opts.actionLabel, info: opts.info, cls: opts.cls });
    renderToasts();
    setTimeout(() => { S.toasts = S.toasts.filter((x) => x.id !== id); renderToasts(); }, opts.ms || 2400);
    return id;
  }
  // 提前收掉一条提示（单卡换图：同一时间只留一条「撤销换图」）
  function toastDrop(id) { if (!S.toasts.some((x) => x.id === id)) return; S.toasts = S.toasts.filter((x) => x.id !== id); renderToasts(); }
  function renderToasts() {
    let w = document.querySelector('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    w.innerHTML = S.toasts.map((x) => `<div class="toast ${x.info ? 'is-info' : ''} ${x.cls || ''}" role="status">${ic(x.info ? 'info-fill' : 'check-circle-fill')}<span>${esc(x.msg)}</span>${x.action ? `<button data-act="toastAction" data-arg="${x.id}">${esc(x.actionLabel)}</button>` : ''}</div>`).join('');
  }
  const comingSoon = () => toast(t('common/coming-soon'), { info: true });

  // ---------- 路由 ----------
  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [r, a] = h.split('/');
    S.route = r; S.routeArg = a || null;
  }
  function go(path) { if (location.hash !== '#/' + path) location.hash = '#/' + path; else { parseRoute(); render(); } }

  // ---------- 动作分发 ----------
  const actions = (window.ACT = {});
  const inputs = (window.INP = {});
  function closeFloating() { S.menu = null; }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) {
      if (S.menu && !e.target.closest('.menu')) { S.menu = null; render(); }
      return;
    }
    if (el.dataset.stop !== undefined) e.stopPropagation();
    const name = el.dataset.act, arg = el.dataset.arg;
    const fn = actions[name];
    if (!fn) { console.warn('missing action', name); return; }
    const keepMenu = el.closest('.menu') && el.dataset.keep !== undefined;
    window.__prevMenu = S.menu; // 分发前打开的菜单（按钮再点一次关掉用）
    if (S.menu && !keepMenu && !name.startsWith('menu:')) S.menu = null;
    window.__inAct = true; // 动作内调用的接口不自己重渲染（第五轮 A）
    let r;
    try { r = fn(arg, el, e); } finally { window.__inAct = false; }
    if (r !== false) render();
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const fn = inputs[el.dataset.input];
    if (fn && fn(el.value, el, e) === true) render();
  });
  document.addEventListener('keydown', (e) => {
    const el = e.target.closest('[data-key]');
    if (el) { const fn = actions[el.dataset.key]; window.__inAct = true; let r; try { r = fn && fn(e, el); } finally { window.__inAct = false; } if (r === true) render(); }
    if (e.key === 'Escape') {
      if (!S.menu && !S.sheet && !S.dialog && S.pg && S.pg.msel) { S.pg.msel = null; render(); return; }
      if (S.menu || S.sheet || S.dialog || S.drawer || (window.ED && window.ED.isOpen())) { S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; if (window.ED) window.ED.escape(); render(); }
    }
  });
  actions['menu:toggle'] = (id) => { S.menu = S.menu === id ? null : id; };
  actions.closeAll = () => { S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; };
  actions.toastAction = (id) => { const x = S.toasts.find((q) => q.id === +id); if (x && x.action) x.action(); S.toasts = S.toasts.filter((q) => q.id !== +id); renderToasts(); };
  actions.go = (p) => { S.menu = null; S.sheet = null; S.drawer = false; go(p); return false; };
  actions.soon = () => { comingSoon(); return false; };
  actions.setTheme = (v) => { S.theme = v || (S.theme === 'dark' ? 'light' : 'dark'); LS.set('theme', S.theme); };
  actions.setLang = (v) => { S.lang = v; LS.set('lang', v); S.menu = null; S.sheet = null; };

  // ---------- 渲染 ----------
  const views = (window.VIEWS = {});
  let lastBp = bp();
  function render() {
    const root = document.getElementById('app');
    document.documentElement.dataset.theme = S.theme;
    document.documentElement.lang = S.lang;
    // 记住滚动位置与焦点
    const scrolls = {};
    root.querySelectorAll('[data-sk]').forEach((n) => { scrolls[n.dataset.sk] = [n.scrollTop, n.scrollLeft]; });
    const winY = window.scrollY;
    const ae = document.activeElement;
    const focus = ae && ae.dataset && ae.dataset.input ? { k: ae.dataset.input, s: ae.selectionStart, e: ae.selectionEnd } : null;
    const view = views[S.route] || views.todo;
    root.innerHTML = view() + (window.PROTO_BAR ? window.PROTO_BAR() : '');
    root.querySelectorAll('[data-sk]').forEach((n) => { const v = scrolls[n.dataset.sk]; if (v) { n.scrollTop = v[0]; n.scrollLeft = v[1]; } });
    if (window.scrollY !== winY) window.scrollTo(0, winY);
    if (focus) { const n = root.querySelector(`[data-input="${focus.k}"]`); if (n) { n.focus(); try { n.setSelectionRange(focus.s, focus.e); } catch (e) { /* noop */ } } }
    const af = root.querySelector('[data-autofocus]'); if (af && !focus) { af.focus(); if (af.select) af.select(); }
    if (window.AFTER_RENDER) window.AFTER_RENDER.forEach((f) => f());
    renderToasts();
  }
  window.addEventListener('hashchange', () => { parseRoute(); if (S.pg) S.pg.msel = null; S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; window.scrollTo(0, 0); render(); });
  window.addEventListener('resize', () => { const b = bp(); if (b !== lastBp) { lastBp = b; S.menu = null; S.sheet = null; S.drawer = false; render(); } });

  // ---------- 通用片段 ----------
  const seg = (opts, cur, act, extra = '') => `<div class="seg ${extra}">${opts.map((o) => `<button class="seg-opt ${o.v === cur ? 'is-on' : ''}" data-act="${act}" data-arg="${o.v}">${o.html || esc(o.label)}</button>`).join('')}</div>`;
  const sheet = (inner, cls = '') => `<div class="scrim" data-act="closeAll"></div><div class="sheet ${cls}" role="dialog"><div class="sheet-grab"></div>${inner}</div>`;
  const dialog = (inner, cls = '') => `<div class="scrim" data-act="closeAll"></div><div class="dialog ${cls}" role="dialog">${inner}</div>`;
  const empty = (icon, title, desc, btn) => `<div class="empty"><div class="ico">${ic(icon, 'ic-24')}</div><h3>${esc(title)}</h3>${desc ? `<p>${esc(desc)}</p>` : ''}${btn || ''}</div>`;

  Object.assign(window, { t, esc, num, ic, typeIcon, MODEL_LOGO, bp, isMobile, toast, toastDrop, comingSoon, go, render, seg, sheet, dialog, empty, LS });
  window.AFTER_RENDER = [];
  window.addEventListener('DOMContentLoaded', () => { parseRoute(); render(); });
})();

/* ===== 第五轮 A：§0.3 共用接口（余额 / 流水 / 通知 / 演示开关 / 选图 / 参考图格 / 费用确认）===== */
(function () {
  const S = window.S, A = window.ACT, t = window.t, esc = window.esc, ic = window.ic, num = window.num;
  const qs = new URLSearchParams(location.search);

  // ---------- 余额与流水 ----------
  const LS = window.LS;
  S.credits = LS.get('credits', 1280);
  S.monthUsed = LS.get('monthUsed', 740); // 本月已用（由前 4 条流水算出），spend 时累加
  S.monthRuns = LS.get('monthRuns', 4); // 本月生成次数
  let lid = 0;
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  // 流水：{id, kind: sample|rest|one|regen|fill|banner|iconset|topup, amount(扣点为负), vars, sid, rid, time:{k,t} 或 at:时间戳}
  S.ledger = [
    { id: 'l' + ++lid, kind: 'sample', amount: -20, vars: { type: 'midnav' }, sid: 's1', rid: 'r11', time: { k: 'common/today-at', t: '10:12' } },
    { id: 'l' + ++lid, kind: 'rest', amount: -680, vars: { type: 'bottomnav', n: 34 }, sid: 's2', rid: 'r13', time: { k: 'common/yesterday-at', t: '21:08' } },
    { id: 'l' + ++lid, kind: 'sample', amount: -20, vars: { type: 'bottomnav' }, sid: 's2', rid: 'r13', time: { k: 'common/yesterday-at', t: '20:55' } },
    { id: 'l' + ++lid, kind: 'one', amount: -20, vars: { type: 'gametype' }, sid: 's3', rid: 'r14', time: { k: 'common/yesterday-at', t: '18:40' } },
    { id: 'l' + ++lid, kind: 'topup', amount: 1000, vars: {}, time: { k: 'common/date-nov20', t: '09:30' } },
  ];
  S.ledger = LS.get('ledger', S.ledger);
  window.canAfford = (n) => S.credits >= (n || 0);
  // 扣点：成功那一刻调用。vars.type 写类型代码（midnav / bottomnav / gametype），渲染时自动翻译
  window.spend = function (n, kind, vars, sid, rid) {
    n = Math.round(n || 0);
    if (n <= 0) return;
    S.credits -= n; S.monthUsed += n; S.monthRuns += 1;
    S.ledger.unshift({ id: uid('l'), kind: kind || 'one', amount: -n, vars: vars || {}, sid: sid || null, rid: rid || null, at: Date.now() });
    window.persistCore();
  };
  // 充值入账（D 的充值页用）：加点、写流水、发通知
  window.topup = function (n) {
    S.credits += n;
    S.ledger.unshift({ id: uid('l'), kind: 'topup', amount: n, vars: {}, at: Date.now() });
    window.pushNotice({ kind: 'credit', cat: 'sys', title: { k: 'notice/topup', v: { n: num(n) } }, body: { k: 'notice/balance-d', v: { n: num(S.credits) } } });
    window.persistCore();
  };
  window.openTopup = function () {
    S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false;
    if (window.ED && window.ED.isOpen()) window.ED.escape();
    S.returnTo = location.hash || '#/home';
    window.go('recharge');
  };

  // ---------- 文案拼装 ----------
  // tx(x)：字符串原样返回；{k, v} 按 key 翻译，v 里的值可以再是 {k, v}；v.type 为类型代码时自动翻译
  window.tx = function tx(x) {
    if (x == null) return '';
    if (typeof x !== 'object') return String(x);
    const v = {};
    for (const k in x.v || {}) {
      const val = x.v[k];
      v[k] = k === 'type' && typeof val === 'string' && window.I18N['composer/type-' + val] ? t('composer/type-' + val) : tx(val);
    }
    return t(x.k, v);
  };
  const hm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  // 时间：{time:{k,t}} 或 {at: 时间戳}
  window.fmtTime = function (x) {
    if (x.time) return t(x.time.k, { t: x.time.t });
    const d = new Date(x.at || Date.now()), day = (q) => new Date(q.getFullYear(), q.getMonth(), q.getDate()).getTime();
    const diff = Math.round((day(new Date()) - day(d)) / 86400000);
    if (diff <= 0) return t('common/today-at', { t: hm(d) });
    if (diff === 1) return t('common/yesterday-at', { t: hm(d) });
    return t('common/date-at', { m: d.getMonth() + 1, d: d.getDate(), t: hm(d) });
  };
  window.ledgerTitle = (l) => window.tx({ k: 'credit/l-' + l.kind, v: l.vars || {} });

  // ---------- 通知 ----------
  let nid = 0;
  // 通知：{id, kind: done|failed|export|credit, cat: gen|sys, title, body（字符串或 {k,v}）, sid, rid, name, read, time|at}
  S.notices = [
    { id: 'n' + ++nid, kind: 'done', cat: 'gen', title: { k: 'notice/sample-done', v: { type: 'midnav' } }, body: '深蓝科技感，玻璃磨砂质感，圆润线条', sid: 's1', rid: 'r11', read: false, time: { k: 'common/today-at', t: '10:13' } },
    { id: 'n' + ++nid, kind: 'failed', cat: 'gen', title: { k: 'notice/failed', v: { type: 'gametype' } }, body: { k: 'notice/failed-d' }, sid: 's3', rid: 'rf3', read: false, time: { k: 'common/today-at', t: '09:40' } },
    { id: 'n' + ++nid, kind: 'export', cat: 'sys', title: { k: 'notice/export-done', v: { name: '星河体育 · 首页' } }, body: { k: 'notice/export-d', v: { list: 'Figma、PNG、JSON', n: 3 } }, name: '星河体育 · 首页', read: true, time: { k: 'common/yesterday-at', t: '22:15' } },
    { id: 'n' + ++nid, kind: 'done', cat: 'gen', title: { k: 'notice/set-done', v: { type: 'bottomnav', n: 35 } }, body: '金色奢华风，立体浮雕，深色底', sid: 's2', rid: 'r13', read: true, time: { k: 'common/yesterday-at', t: '21:09' } },
    { id: 'n' + ++nid, kind: 'credit', cat: 'sys', title: { k: 'notice/topup', v: { n: '1,000' } }, body: { k: 'notice/balance-d', v: { n: '1,280' } }, read: true, time: { k: 'common/date-nov20', t: '09:31' } },
  ];
  S.notices = LS.get('notices', S.notices);
  window.pushNotice = function (o) {
    S.notices.unshift(Object.assign({ id: uid('n'), cat: 'gen', read: false, at: Date.now() }, o, { read: !!o.read }));
    window.persistCore();
    if (!window.__inAct) window.render(); // 异步回调里调用时立即出红点
  };
  window.hasUnread = () => S.notices.some((n) => !n.read);

  // ---------- 本地保存：余额 / 流水 / 通知，刷新后一致（每次渲染后有变化才写）----------
  let saved = '';
  const persist = () => {
    const snap = JSON.stringify([S.credits, S.monthUsed, S.monthRuns, S.ledger, S.notices]);
    if (snap === saved) return; saved = snap;
    LS.set('credits', S.credits); LS.set('monthUsed', S.monthUsed); LS.set('monthRuns', S.monthRuns); LS.set('ledger', S.ledger.slice(0, 200)); LS.set('notices', S.notices.slice(0, 100));
  };
  window.persistCore = persist;
  window.addEventListener('DOMContentLoaded', () => { window.AFTER_RENDER.push(persist); });
  window.addEventListener('pagehide', persist);
  // 原型重置：?reset=1 清掉本地数据
  if (qs.get('reset')) { try { Object.keys(localStorage).filter((k) => k.startsWith('proto.')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* noop */ } const q2 = new URLSearchParams(location.search); q2.delete('reset'); const rest = q2.toString(); location.replace(location.pathname + (rest ? '?' + rest : '') + location.hash); } // 其它参数（theme / lang / fail）保留

  // ---------- 演示开关 ----------
  const fq = (qs.get('fail') || '').split(',');
  // 顶部栏 DEMO 标签（Waydon 2026-11-26：给老板看的演示版本标识）
  window.demoTag = () => '<span class="demo-tag" title="Demo">DEMO</span>';
  S.demo = { failNext: fq.includes('gen'), loadFail: fq.includes('load'), saveFail: fq.includes('save'), exportFail: fq.includes('export') };
  // 读并清掉「下次生成失败」；提示词含「失败」/ fail 也算失败
  window.takeFail = function (prompt) {
    const p = String(prompt == null ? (S.c && S.c.prompt) || '' : prompt).toLowerCase();
    const f = S.demo.failNext || p.includes('失败') || p.includes('失敗') || p.includes('fail');
    S.demo.failNext = false;
    return f;
  };
  A.demoToggle = (k) => { S.demo[k] = !S.demo[k]; };

  // ---------- 选图 ----------
  // 模块图片（图标 / Banner / 卡片封面等）统一支持的格式（Waydon 2026-11-26）
  window.IMG_ACCEPT = 'image/png,image/svg+xml,image/apng,image/avif,image/webp';
  // 图片素材值：'img:<地址>' = 业主上传 / AI 生成的真实图片；'img:<地址>#<CSS 滤镜>' = 同一张图换个色调（AI Banner 候选模拟）；其余 = 在默认图上叠的 CSS 滤镜（原型模拟换图）
  window.fxStyle = (f, def) => { if (!/^img:/.test(f || '')) return `${def ? `background-image:url(${def});` : ''}filter:${f || 'none'}`; const k = f.indexOf('#'); return k < 0 ? `background-image:url(${f.slice(4)});filter:none` : `background-image:url(${f.slice(4, k)});filter:${f.slice(k + 1)}`; };
  window.imgOk = (f) => !!f && /^image\/(png|svg\+xml|apng|avif|webp)$/.test(f.type);
  // pickImage({accept, maxMB, multiple}, cb)：单选 cb(dataURL, file)；多选 cb([{src, name, file}])。类型 / 大小不合规自己 toast，不回调
  window.pickImage = function (opts, cb) {
    opts = Object.assign({ accept: 'image/png,image/jpeg,image/webp', maxMB: 10, multiple: false }, opts || {});
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = opts.accept; inp.multiple = !!opts.multiple; inp.style.display = 'none';
    document.body.appendChild(inp);
    const ok = (f) => opts.accept.split(',').some((a) => { a = a.trim(); return a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.type === a; });
    inp.addEventListener('change', () => {
      const files = Array.from(inp.files || []); inp.remove();
      if (!files.length) return;
      const bad = files.filter((f) => !ok(f)), big = files.filter((f) => ok(f) && f.size > opts.maxMB * 1048576);
      if (bad.length) window.toast(t(opts.accept === window.IMG_ACCEPT ? 'mp/icon-bad' : 'composer/ref-bad-type'), { info: true }); // 提示跟实际支持的格式一致
      if (big.length) window.toast(opts.maxMB === 10 ? t('composer/ref-too-big') : t('common/file-too-big', { n: opts.maxMB }), { info: true });
      const good = files.filter((f) => ok(f) && f.size <= opts.maxMB * 1048576);
      if (!good.length) return;
      const read = (f) => new Promise((res) => { const r = new FileReader(); r.onload = () => res({ src: r.result, name: f.name, file: f }); r.readAsDataURL(f); });
      Promise.all((opts.multiple ? good : good.slice(0, 1)).map(read)).then((arr) => { if (opts.multiple) cb(arr); else cb(arr[0].src, arr[0].file); window.render(); });
    });
    inp.click();
  };

  // ---------- 参考图格（CP-01）----------
  // refSlot(state, act)：state = {src, name, uploading, pct}。动作名 = act + Pick / Rm / Cancel / View
  // 选图 + 模拟上传用 refPick(state)（state 会被写入 uploading / pct / src / name），上传期间每 100ms 重渲染
  const ring = (pct) => { const c = 2 * Math.PI * 10; return `<svg class="ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="var(--fill-1)" stroke-width="2.5"/><circle cx="12" cy="12" r="10" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 12 12)"/></svg>`; };
  window.progressRing = ring;
  window.refSlot = function (st, act) {
    st = st || {};
    if (st.uploading) return `<div class="refslot is-uploading skeleton" role="progressbar" aria-valuenow="${st.pct || 0}" title="${esc(t('composer/ref-uploading', { n: st.pct || 0 }))}">${ring(st.pct || 0)}<span class="pct">${st.pct || 0}%</span><span class="rm" data-act="${act}Cancel" data-stop>${ic('x', 'ic-16')}</span></div>`;
    if (st.src) return `<button class="refslot is-filled" data-act="${act}View" aria-label="${esc(st.name || t('composer/ref-slot'))}"><img class="ref-img" src="${esc(st.src)}" alt=""><span class="rm" data-act="${act}Rm" data-stop aria-label="${esc(t('composer/ref-remove'))}">${ic('x', 'ic-16')}</span><span class="ref-pop"><img src="${esc(st.src)}" alt=""><span class="caption ellipsis">${esc(st.name || '')}</span></span></button>`;
    return `<button class="refslot" data-act="${act}Pick" aria-label="${esc(t('composer/ref-slot'))}">${ic('plus')}<span>${t('composer/ref-slot')}</span><span class="tip">${t('composer/ref-hint')}</span></button>`;
  };
  window.refPick = function (st, done) {
    window.pickImage({ accept: 'image/png,image/jpeg,image/webp,image/avif,image/apng', maxMB: 10 }, (src, file) => window.refUpload(st, src, file ? file.name : '', done));
  };
  // 模拟上传约 1 秒
  window.refUpload = function (st, src, name, done) {
    const tok = (st._tok = (st._tok || 0) + 1);
    st.uploading = true; st.pct = 0;
    const tick = () => {
      if (st._tok !== tok || !st.uploading) return;
      st.pct = Math.min(100, st.pct + 10 + Math.round(Math.random() * 5));
      if (st.pct >= 100) { st.uploading = false; st.pct = 0; st.src = src; st.name = name; if (done) done(); }
      else setTimeout(tick, 100);
      window.render();
    };
    window.render(); setTimeout(tick, 100);
  };
  window.refCancel = (st) => { st.uploading = false; st.pct = 0; st._tok = (st._tok || 0) + 1; };

  // ---------- 费用确认（CP-02）----------
  // costConfirm({title, body, cost, okLabel, onOk})：余额够 → 确认后 onOk()；余额不足 → 主按钮变「去充值」
  const narrow = () => window.isMobile() || (S.route === 'editor' && window.innerWidth < 840);
  window.costConfirm = function (opts) {
    S.cost = Object.assign({ okLabel: t('confirm/ok') }, opts || {});
    S.menu = null;
    if (narrow()) { S.dialog = null; S.sheet = 'cost'; } else { S.sheet = null; S.dialog = 'cost'; }
    if (!window.__inAct) window.render();
  };
  // 单个生成余额不足时直接弹的版本
  window.lowBalance = (n) => window.costConfirm({ title: t('confirm/low-title'), body: t('confirm/low-one', { n }), cost: n });
  // star: true → AI 生成统一面板的写法（Figma AIG/CostConfirm）：顶部 48 图标块，金额写 ✦，「本次约消耗 / 当前余额 / 还差 ✦N」
  function costBody() {
    const o = S.cost || {};
    const ok = window.canAfford(o.cost), short = (o.cost || 0) - S.credits;
    if (o.star) {
      return `<div class="cc-star">${o.icon ? `<span class="cc-ic">${ic(ok ? o.icon : 'wallet-fill')}</span>` : ''}<h3>${esc(o.title || '')}</h3>${o.body ? `<p class="muted cc-body">${esc(o.body)}</p>` : ''}
      <div class="cost-card"><div class="cost-row"><span class="muted">${t('confirm/cost-label-s')}</span><b class="cc-cost">✦${num(o.cost || 0)}</b></div>
        <div class="cost-row ${ok ? '' : 'is-err'}"><span class="${ok ? 'muted' : ''}">${t('confirm/balance-label')}</span><span>✦${num(S.credits)}</span></div></div>
      ${ok ? '' : `<div class="caption err-text" style="margin-top:8px">${t('confirm/short-by-s', { n: num(short) })}</div>`}
      <div class="dialog-foot cc-foot"><button class="btn btn-secondary" data-act="costCancel">${t('confirm/cancel')}</button>${ok ? `<button class="btn btn-primary" data-act="costOk">${esc(o.okLabel)}</button>` : `<button class="btn btn-primary" data-act="costTopup">${ic('wallet-fill', 'ic-16')}${t('confirm/topup')}</button>`}</div></div>`;
    }
    // icon / costLabel / costText（可选）：顶部图标块 + 自定义「本次约消耗 · 50 点」（AI 一键设计 Figma D4 / M4）
    return `${o.icon ? `<span class="cc-ic">${ic(ok ? o.icon : 'wallet-fill')}</span>` : ''}<h3>${esc(o.title || '')}</h3>${o.body ? `<p class="muted" style="margin:8px 0 16px">${esc(o.body)}</p>` : '<div style="height:16px"></div>'}
      <div class="cost-card"><div class="cost-row"><span class="muted">${o.costLabel ? esc(o.costLabel) : t('confirm/cost-label')}</span><b${o.costText ? ' class="cc-cost is-brand"' : ''}>${o.costText ? esc(o.costText) : t('confirm/approx', { n: num(o.cost || 0) })}</b></div>
        <div class="cost-row ${ok ? '' : 'is-err'}"><span class="${ok ? 'muted' : ''}">${t('confirm/balance-label')}</span><span>${t('confirm/points', { n: num(S.credits) })}</span></div></div>
      ${ok ? '' : `<div class="caption err-text" style="margin-top:8px">${t('confirm/short-by', { n: num(short) })}</div>`}
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="costCancel">${t('confirm/cancel')}</button>${ok ? `<button class="btn btn-primary" data-act="costOk">${esc(o.okLabel)}</button>` : `<button class="btn btn-primary" data-act="costTopup">${ic('wallet-fill', 'ic-16')}${t('confirm/topup')}</button>`}</div>`;
  }
  window.costConfirmLayer = function () {
    if (S.dialog === 'cost') return window.dialog(costBody(), 'cost-dialog');
    if (S.sheet === 'cost') return window.sheet(costBody(), 'cost-sheet');
    return '';
  };
  const closeCost = () => { if (S.dialog === 'cost') S.dialog = null; if (S.sheet === 'cost') S.sheet = null; };
  A.costCancel = () => { closeCost(); const o = S.cost; S.cost = null; if (o && o.onCancel) o.onCancel(); };
  A.costOk = () => { closeCost(); const o = S.cost; S.cost = null; if (o && o.onOk) o.onOk(); };
  A.costTopup = () => { closeCost(); S.cost = null; window.openTopup(); return false; };
})();
