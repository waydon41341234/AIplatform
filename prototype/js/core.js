/* 核心：状态、文案、路由、渲染循环、通用组件（菜单/面板/弹窗/提示）。 */
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
    S.toasts.push({ id, msg, action: opts.action, actionLabel: opts.actionLabel, info: opts.info });
    renderToasts();
    setTimeout(() => { S.toasts = S.toasts.filter((x) => x.id !== id); renderToasts(); }, opts.ms || 2400);
  }
  function renderToasts() {
    let w = document.querySelector('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    w.innerHTML = S.toasts.map((x) => `<div class="toast ${x.info ? 'is-info' : ''}" role="status">${ic(x.info ? 'info-fill' : 'check-circle-fill')}<span>${esc(x.msg)}</span>${x.action ? `<button data-act="toastAction" data-arg="${x.id}">${esc(x.actionLabel)}</button>` : ''}</div>`).join('');
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
    if (S.menu && !keepMenu && !name.startsWith('menu:')) S.menu = null;
    const r = fn(arg, el, e);
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
    if (el) { const fn = actions[el.dataset.key]; if (fn && fn(e, el) === true) render(); }
    if (e.key === 'Escape') {
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
  window.addEventListener('hashchange', () => { parseRoute(); S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; window.scrollTo(0, 0); render(); });
  window.addEventListener('resize', () => { const b = bp(); if (b !== lastBp) { lastBp = b; S.menu = null; S.sheet = null; S.drawer = false; render(); } });

  // ---------- 通用片段 ----------
  const seg = (opts, cur, act, extra = '') => `<div class="seg ${extra}">${opts.map((o) => `<button class="seg-opt ${o.v === cur ? 'is-on' : ''}" data-act="${act}" data-arg="${o.v}">${o.html || esc(o.label)}</button>`).join('')}</div>`;
  const sheet = (inner, cls = '') => `<div class="scrim" data-act="closeAll"></div><div class="sheet ${cls}" role="dialog"><div class="sheet-grab"></div>${inner}</div>`;
  const dialog = (inner, cls = '') => `<div class="scrim" data-act="closeAll"></div><div class="dialog ${cls}" role="dialog">${inner}</div>`;
  const empty = (icon, title, desc, btn) => `<div class="empty"><div class="ico">${ic(icon, 'ic-24')}</div><h3>${esc(title)}</h3>${desc ? `<p>${esc(desc)}</p>` : ''}${btn || ''}</div>`;

  Object.assign(window, { t, esc, num, ic, typeIcon, MODEL_LOGO, bp, isMobile, toast, comingSoon, go, render, seg, sheet, dialog, empty, LS });
  window.AFTER_RENDER = [];
  window.addEventListener('DOMContentLoaded', () => { parseRoute(); render(); });
})();
