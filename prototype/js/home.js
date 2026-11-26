/* 平台外壳（侧栏/顶栏/底部 Tab）+ 余额 / 通知 / 搜索 / 账户菜单 + 创作框 + 首页。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), esc = (s) => window.esc(s), ic = (...a) => window.ic(...a), num = (n) => window.num(n);
  const TYPES = { midnav: { w: 80, h: 70, n: 40 }, bottomnav: { w: 70, h: 70, n: 35 }, gametype: { w: 100, h: 76, n: 13 } };
  const PALETTES = {
    blue: ['#1678ff', '#04be02', '#ffaa09', '#333333'], gold: ['#c9963b', '#2fa84f', '#f2a20c', '#2b2620'],
    green: ['#10b26c', '#3a86ff', '#ffaa09', '#1f2a24'], purple: ['#7b4dff', '#12b886', '#ff9f1c', '#25213a'],
    platinum: ['#c8a96a', '#9a968f', '#e0a83a', '#2b2a28'], // 白金（2026-11-26，版式「白金 · 简约」用，不进创作框色板下拉）
  };
  window.TYPES = TYPES; window.PALETTES = PALETTES;
  S.c = { type: 'midnav', qty: 'one', quality: 'std', model: 'gpt', color: 'follow', custom: ['#0a84ff', '#ffffff', '#0a84ff', '#8e8e93'], prompt: '', refSt: { src: null, name: '', uploading: false, pct: 0 } };
  // 兼容旧写法：S.c.ref / S.c.refName 读写参考图格状态（B「用作参考」直接赋 dataURL）
  Object.defineProperty(S.c, 'ref', { enumerable: true, get() { return S.c.refSt.src || false; }, set(v) { S.c.refSt.src = v === true ? 'assets/hero-1440x480.jpg' : v || null; S.c.refSt.uploading = false; } });
  Object.defineProperty(S.c, 'refName', { enumerable: true, get() { return S.c.refSt.name; }, set(v) { S.c.refSt.name = v || ''; } });
  S.filter = 'all';
  S.q = ''; S.sGroup = null; S.sFocus = -1; S.noticeTab = 'all';

  // ---------- 外壳 ----------
  const NAV = [
    { id: 'home', key: 'nav/home', icon: 'house-fill', route: 'home' },
    { id: 'templates', key: 'nav/templates', icon: 'squares-four-fill', route: 'templates' },
    { id: 'projects', key: 'nav/projects', icon: 'folder-fill', route: 'projects' },
    { id: 'history', key: 'nav/history', icon: 'image-fill', route: 'history' },
  ];
  function current() { return S.route === 'todo' ? S.routeArg : S.route; }
  const auOff = () => !!(window.AU && window.AU.off()); // AU：未登录时外壳换成登录入口（js/auth.js）
  function sidebar() {
    const exp = (S.route === 'workbench' ? S.wbSidebar : S.sidebarExpanded) && window.bp() === 'desktop';
    const cur = current();
    const wbOn = S.route === 'workbench' && (!S.activeSession || S.routeArg === 'new');
    const wb = auOff() ? window.AU.sbBlock(exp) : exp
      ? `<div class="sb-wb"><button class="nav ${wbOn ? 'is-on' : ''}" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}<span>${t('nav/workbench')}</span></button><button class="ibtn ibtn-sm chev" data-act="toggleHistory" aria-label="toggle">${ic(S.historyOpen ? 'caret-down' : 'caret-right', 'ic-16')}</button></div>
        ${S.historyOpen ? `<div class="sb-tools"><label class="sb-search">${ic('magnifying-glass', 'ic-16')}<input data-input="sessSearch" value="${esc(S.sessSearch || '')}" placeholder="${esc(t('workbench/search-sessions'))}"></label><button class="ibtn ibtn-sm" style="color:var(--brand)" data-act="newChat" aria-label="${esc(t('nav/new-chat'))}">${ic('plus', 'ic-16')}</button></div>${window.sessionList('sb')}` : ''}`
      : `<button class="nav ${S.route === 'workbench' ? 'is-on' : ''}" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}<span>${t('nav/workbench')}</span></button>
         <button class="nav" data-act="newChat">${ic('plus')}<span>${t('nav/new-chat')}</span></button>`;
    return `<aside class="sidebar ${exp ? 'is-expanded' : ''}">
      <div class="sb-head"><img class="logo" src="assets/logo-orb.webp" alt="logo">${window.bp() === 'desktop' ? `<button class="ibtn ibtn-sm ibtn-secondary" data-act="toggleSidebar" title="${esc(t(exp ? 'nav/collapse' : 'nav/expand'))}">${ic('sidebar-simple', 'ic-16')}</button>` : ''}</div>
      ${NAV.map((n) => `<button class="nav ${cur === n.id ? 'is-on' : ''}" data-act="go" data-arg="${n.route}">${ic(n.icon)}<span>${t(n.key)}</span></button>`).join('')}
      <div class="sb-spacer"></div>${wb}</aside>`;
  }
  const langItems = (act = 'setLang', keep = false) => window.LANGS.map((l) => `<button class="menu-item ${S.lang === l.code ? 'is-on' : ''}" data-act="${act}" data-arg="${l.code}"${keep ? ' data-keep' : ''}>${l.name}</button>`).join('');
  window.langItems = langItems;
  function langMenu(align = 'right') {
    if (S.menu !== 'lang') return '';
    return `<div class="menu" style="top:calc(100% + 8px);${align}:0">${langItems()}</div>`;
  }
  const isLow = () => S.credits < 100;
  const creditBtn = () => `<button class="credit ${isLow() ? 'is-low' : ''} ${S.menu === 'credit' ? 'is-open' : ''}" data-act="creditOpen" aria-label="${esc(t('credit/title'))}">${ic('sparkle-fill')}${num(S.credits)}</button>`;
  const bellBtn = () => `<button class="ibtn ibtn-secondary bell ${window.hasUnread() ? 'has-dot' : ''}" data-act="noticeOpen" aria-label="${esc(t('notice/title'))}">${ic('bell-fill')}</button>`;
  function topbar(solid, lead) {
    const pop = (id, body, cls) => (S.menu === id ? `<div class="menu ${cls}">${body}</div>` : '');
    return `<header class="topbar desk ${solid ? 'is-solid' : ''}">${lead || ''}${window.demoTag()}
      <div class="rel tb-search-wrap"><label class="tb-search ${S.menu === 'search' ? 'is-open' : ''}">${ic('magnifying-glass', 'ic-16')}<input data-input="q" data-key="searchKey" data-act="searchFocus" value="${esc(S.q)}" placeholder="${esc(t('search/placeholder'))}" autocomplete="off"></label>${pop('search', searchBody(), 'search-pop')}</div>
      ${auOff() ? '' : `<div class="rel">${creditBtn()}${pop('credit', creditBody(), 'credit-pop')}</div>`}
      <div class="rel"><button class="ibtn ibtn-secondary" data-act="menu:toggle" data-arg="lang" title="${esc(t('nav/language'))}">${ic('globe')}</button>${langMenu()}</div>
      <button class="ibtn ibtn-secondary" data-act="setTheme" title="${esc(t(S.theme === 'dark' ? 'nav/theme-dark' : 'nav/theme-light'))}">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill')}</button>
      ${auOff() ? window.AU.deskBtns() : `<div class="rel">${bellBtn()}${pop('notice', noticeBody(false), 'notice-pop')}</div>
      <div class="rel"><button class="avatar" data-act="menu:toggle" data-arg="account" aria-label="${esc(t('nav/me'))}"></button>${pop('account', accountBody(), 'account-pop')}</div>`}</header>`;
  }
  function mTopbar() {
    return `<header class="m-topbar"><img class="logo" src="assets/logo-orb.webp" alt="logo">${window.demoTag()}<div class="grow"></div>
      <button class="ibtn ibtn-secondary" data-act="searchOpen" aria-label="${esc(t('search/placeholder'))}">${ic('magnifying-glass')}</button>
      ${auOff() ? '' : creditBtn()}
      <div class="rel"><button class="ibtn ibtn-secondary" data-act="menu:toggle" data-arg="lang">${ic('globe')}</button>${langMenu()}</div>
      <button class="ibtn ibtn-secondary" data-act="setTheme">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill')}</button>
      ${auOff() ? window.AU.mBtn() : bellBtn()}</header>`;
  }
  function tabbar() {
    const cur = current();
    const tabs = [
      ['home', 'nav/home', 'house-fill', 'home'], ['templates', 'nav/templates', 'squares-four-fill', 'templates'],
      ['workbench', 'nav/workbench-short', 'magic-wand-fill', 'workbench'], ['projects', 'nav/projects', 'folder-fill', 'projects'], ['me', 'nav/me', 'user-circle-fill', 'me'],
    ];
    return `<nav class="tabbar">${tabs.map(([id, k, icn, r]) => `<button class="tab ${cur === id ? 'is-on' : ''}" data-act="go" data-arg="${r}">${ic(icn, id === 'workbench' ? 'is-brand' : '')}<span>${t(k)}</span></button>`).join('')}</nav>`;
  }
  // opts: cls / solid / noTop / noTab / mTop / topLead（插在桌面顶栏最前，SH-04）
  window.shell = (inner, opts = {}) => `<div class="app ${opts.cls || ''}">${sidebar()}<div class="main">${opts.mTop === undefined ? mTopbar() : opts.mTop}${opts.noTop ? '' : topbar(opts.solid, opts.topLead)}${inner}</div>${opts.noTab ? '' : tabbar()}</div>${window.overlays()}`;
  A.toggleSidebar = () => { if (S.route === 'workbench') { S.wbSidebar = !S.wbSidebar; window.LS.set('wbSidebar', S.wbSidebar); } else { S.sidebarExpanded = !S.sidebarExpanded; window.LS.set('sidebarExpanded', S.sidebarExpanded); } };
  A.toggleHistory = () => { S.historyOpen = !S.historyOpen; };
  const blur = () => { const a = document.activeElement; if (a && a.blur) a.blur(); };
  const closeLayers = () => { S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; };

  // ---------- SH-01 余额弹层 ----------
  const KIND_IC = { topup: 'wallet-fill' };
  window.ledgerRow = function (l) {
    const link = !!l.sid;
    const inner = `<span class="lr-ic ${l.kind === 'topup' ? 'is-topup' : ''}">${ic(KIND_IC[l.kind] || 'magic-wand-fill', 'ic-16')}</span>
      <span class="lr-main"><span class="lr-title ellipsis">${esc(window.ledgerTitle(l))}</span><span class="caption faint">${esc(window.fmtTime(l))}</span></span>
      <span class="lr-amt ${l.amount > 0 ? 'is-plus' : ''}">${l.amount > 0 ? '+' : l.amount < 0 ? '−' : ''}${num(Math.abs(l.amount))}</span>${link ? ic('caret-right', 'ic-16 lr-caret') : '<span class="lr-caret"></span>'}`;
    return link ? `<button class="ledger-row is-link" data-act="ledgerGo" data-arg="${l.id}">${inner}</button>` : `<div class="ledger-row">${inner}</div>`;
  };
  window.creditStats = () => `<div class="cp-stats"><div>${t('credit/month-used', { n: num(S.monthUsed) })}</div><div>${t('credit/month-runs', { n: num(S.monthRuns) })}</div></div>`;
  function creditBody() {
    const rows = S.ledger.slice(0, 5);
    return `<div class="cp-head"><span>${t('credit/title')}</span><span class="cp-info" title="${esc(t('credit/rule'))}" aria-label="${esc(t('credit/rule'))}">${ic('info-fill', 'ic-16')}</span></div>
      ${isLow() ? `<div class="notice is-warn">${ic('warning-circle-fill', 'ic-16')}<span>${t('credit/low', { n: num(window.TYPES.midnav.n * 20) })}</span></div>` : ''}
      <div class="cp-bal ${isLow() ? 'is-low' : ''}"><b>${num(S.credits)}</b><span>${t('credit/unit')}</span></div>
      ${window.creditStats()}
      <div class="menu-label">${t('credit/recent')}</div>
      <div class="cp-list">${rows.length ? rows.map(window.ledgerRow).join('') : window.empty('receipt-fill', t('credit/empty')).replace('class="empty"', 'class="empty is-sm"')}</div>
      <div class="cp-foot"><button class="btn btn-secondary btn-sm" data-act="viewUsage">${ic('receipt-fill', 'ic-16')}<span class="ellipsis">${t('credit/view-usage')}</span></button><button class="btn btn-primary btn-sm" data-act="creditTopup">${ic('wallet-fill', 'ic-16')}<span class="ellipsis">${t('credit/topup')}</span></button></div>`;
  }
  // 打开余额弹层（电脑下拉 / 手机面板）；账户菜单、通知也调它
  window.openCredit = () => { if (window.isMobile()) { S.menu = null; S.sheet = 'credit'; } else { S.sheet = null; S.menu = 'credit'; } };
  A.creditOpen = () => { if (!window.isMobile() && window.__prevMenu === 'credit') { S.menu = null; return; } window.openCredit(); };
  A.ledgerGo = (id) => {
    const l = S.ledger.find((x) => x.id === id); closeLayers();
    if (l && l.sid) { if (window.openRecord) window.openRecord(l.sid, l.rid); else { S.activeSession = l.sid; window.go('workbench'); } }
    return false;
  };
  A.viewUsage = () => {
    closeLayers(); window.go('me');
    setTimeout(() => document.getElementById('me-ledger')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return false;
  };
  A.creditTopup = () => { window.openTopup(); return false; };

  // ---------- SH-02 通知 ----------
  const N_IC = { done: ['check-circle-fill', 'is-ok'], failed: ['x-circle-fill', 'is-err'], partial: ['warning-circle-fill', 'is-warn'], exportFail: ['x-circle-fill', 'is-err'], export: ['download-simple', 'is-brand'], credit: ['sparkle-fill', 'is-warn'] };
  function noticeItem(n) {
    const [icn, cls] = N_IC[n.kind] || N_IC.done;
    return `<button class="notice-item ${n.read ? '' : 'is-unread'}" data-act="noticeGo" data-arg="${n.id}"><span class="ni-dot"></span><span class="ni-ic ${cls}">${ic(icn, 'ic-16')}</span>
      <span class="ni-main"><span class="ni-title">${esc(window.tx(n.title))}</span>${n.body ? `<span class="ni-body">${esc(window.tx(n.body))}</span>` : ''}<span class="caption faint">${esc(window.fmtTime(n))}</span></span></button>`;
  }
  function noticeBody(mobile) {
    const list = S.notices.filter((n) => S.noticeTab === 'all' || n.cat === S.noticeTab);
    const unread = window.hasUnread();
    const tabs = ['all', 'gen', 'sys'].map((k) => `<button class="seg-opt ${S.noticeTab === k ? 'is-on' : ''}" data-act="noticeTab" data-arg="${k}" data-keep>${t('notice/tab-' + k)}</button>`).join('');
    const readAll = `<button class="np-readall" data-act="noticeReadAll" data-keep ${unread ? '' : 'disabled'}>${ic('checks', 'ic-16')}${t('notice/read-all')}</button>`;
    const head = mobile
      ? `<div class="sheet-head"><h3>${t('notice/title')}</h3><button class="ibtn ibtn-sm ibtn-secondary" data-act="closeAll" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div><div class="np-sub">${readAll}</div>`
      : `<div class="np-head"><span>${t('notice/title')}</span>${readAll}</div>`;
    return `${head}<div class="seg np-seg">${tabs}</div><div class="np-list" data-sk="np-${mobile ? 'm' : 'd'}">${list.length ? list.map(noticeItem).join('') : window.empty('bell', t('notice/empty')).replace('class="empty"', 'class="empty is-sm"')}</div>`;
  }
  A.noticeOpen = () => { if (window.isMobile()) { S.sheet = 'notice'; return; } S.menu = window.__prevMenu === 'notice' ? null : 'notice'; };
  A.noticeTab = (k) => { S.noticeTab = k; };
  A.noticeReadAll = () => { S.notices.forEach((n) => { n.read = true; }); };
  A.noticeGo = (id) => {
    const n = S.notices.find((x) => x.id === id); if (!n) return;
    n.read = true; closeLayers();
    // 有 sid（生成完成 / 失败 / 部分失败）→ 工作台对应记录；有项目名（导出完成 / 失败）→ 编辑器导出结果；余额类 → 余额弹层
    if (n.sid && n.kind !== 'credit') { if (window.openRecord) window.openRecord(n.sid, n.rid); else { S.activeSession = n.sid; window.go('workbench'); } return false; }
    // 编辑器里 Banner AI / AI 生成一套图标 失败等通知带 proj：只回到该项目编辑器，不打开导出结果
    if (n.proj && !n.name) { window.openEditor({ name: n.proj }); return false; }
    if (n.name || n.kind === 'export' || n.kind === 'exportFail') { window.openEditor({ name: n.name, status: 'exported', then: 'exportDone' }); return false; }
    if (n.kind === 'credit') window.openCredit();
  };

  // ---------- SH-03 搜索 ----------
  const RECENT0 = ['深蓝', '金冠', '底部导航'];
  const recent = () => window.LS.get('recentSearch', RECENT0);
  const addRecent = (q) => { q = (q || '').trim(); if (!q) return; window.LS.set('recentSearch', [q].concat(recent().filter((x) => x !== q)).slice(0, 5)); };
  function hl(text, q) {
    text = String(text); if (!q) return esc(text);
    const lo = text.toLowerCase(), ql = q.toLowerCase(); let out = '', i = 0, j;
    while ((j = lo.indexOf(ql, i)) >= 0) { out += esc(text.slice(i, j)) + '<mark>' + esc(text.slice(j, j + q.length)) + '</mark>'; i = j + q.length; }
    return out + esc(text.slice(i));
  }
  function searchData(q) {
    const ql = q.toLowerCase(), has = (s) => String(s).toLowerCase().includes(ql);
    const seen = {};
    const tpls = window.TEMPLATES.filter((x) => { if (seen[x.k]) return false; seen[x.k] = 1; return has(t('template/' + x.k)) || has(t('filter/' + x.f)); })
      .map((x) => ({ act: 'tpl:' + x.k, html: `<span class="sr-thumb r-3x4" style="background:${toneGrad(thumbTone(x))}"></span><span class="sr-main"><span class="ellipsis">${hl(t('template/' + x.k), q)}</span><span class="caption faint ellipsis">${esc(t('filter/' + x.f))} · ${esc(t('template/meta-' + x.meta))}</span></span>` }));
    const projs = (auOff() ? [] : window.PROJECTS).filter((p) => has(p.name))
      .map((p) => ({ act: 'proj:' + p.name, html: `<span class="sr-thumb r-5x6" style="background:${toneGrad(p.tone)}"></span><span class="sr-main"><span class="ellipsis">${hl(p.name, q)}</span></span><span class="pill-tag ${p.st === 'exported' ? 'is-ok' : 'is-gray'}">${t('status/' + p.st)}</span>` }));
    const sess = (auOff() ? [] : S.sessions || []).filter((s) => has(s.title))
      .map((s) => ({ act: 'sess:' + s.id, html: `<span class="sr-ic">${ic('magic-wand-fill', 'ic-16')}</span><span class="sr-main"><span class="ellipsis">${hl(s.title, q)}</span></span><span class="caption faint">${t('ws/' + ((s.records && s.records[0] && s.records[0].day) || 'today'))}</span>` }));
    return [['templates', tpls], ['projects', projs], ['sessions', sess]];
  }
  // 当前可见的结果行（↑↓ 键用）
  function visibleRows() {
    const q = S.q.trim(); if (!q) return [];
    const rows = [];
    searchData(q).forEach(([g, list]) => { if (S.sGroup && S.sGroup !== g) return; (S.sGroup ? list : list.slice(0, 3)).forEach((r) => rows.push(r)); });
    return rows;
  }
  const chips = () => `<div class="s-try"><span class="caption muted">${t('search/try')}</span>${[1, 2, 3].map((i) => `<button class="chip" data-act="searchFill" data-arg="${esc(t('search/s-' + i))}" data-keep>${t('search/s-' + i)}</button>`).join('')}</div>`;
  function searchBody() {
    const q = S.q.trim();
    if (!q) {
      const r = recent();
      if (!r.length) return chips();
      return `<div class="s-grp-head"><span>${t('search/recent')}</span><button class="s-link" data-act="searchClear" data-keep>${t('search/clear')}</button></div>
        ${r.map((w) => `<div class="menu-item s-recent"><button class="s-recent-w" data-act="searchFill" data-arg="${esc(w)}" data-keep>${ic('clock', 'ic-16')}<span class="ellipsis">${esc(w)}</span></button><button class="ibtn ibtn-sm" data-act="searchDel" data-arg="${esc(w)}" data-keep aria-label="${esc(t('menu/delete'))}">${ic('x', 'ic-16')}</button></div>`).join('')}`;
    }
    const data = searchData(q);
    const total = data.reduce((a, [, l]) => a + l.length, 0);
    if (!total) return `${window.empty('magnifying-glass', t('search/none', { q })).replace('class="empty"', 'class="empty is-sm"')}${chips()}`;
    let idx = 0, h = '';
    if (S.sGroup) h += `<button class="s-back" data-act="searchGroup" data-arg="" data-keep>${ic('caret-left', 'ic-16')}${t('search/back-all')}</button>`;
    data.forEach(([g, list]) => {
      if (!list.length || (S.sGroup && S.sGroup !== g)) return;
      const shown = S.sGroup ? list : list.slice(0, 3);
      h += `<div class="s-grp-head"><span>${t('search/grp-' + g)}</span>${!S.sGroup && list.length > 3 ? `<button class="s-link" data-act="searchGroup" data-arg="${g}" data-keep>${t('search/view-n', { n: list.length })}</button>` : ''}</div>`;
      h += shown.map((r) => `<button class="menu-item s-row ${idx++ === S.sFocus ? 'is-focus' : ''}" data-act="searchGo" data-arg="${esc(r.act)}">${r.html}</button>`).join('');
    });
    return h;
  }
  A.searchFocus = () => { if (window.isMobile() || window.__prevMenu === 'search') { S.menu = window.__prevMenu; return false; } S.menu = 'search'; };
  I.q = (v) => { S.q = v; S.sGroup = null; S.sFocus = -1; if (!window.isMobile()) S.menu = 'search'; return true; };
  I.qm = I.q;
  A.searchKey = (e) => {
    if (e.key === 'Escape') { S.menu = null; S.sheet = null; e.target.blur(); return true; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const n = visibleRows().length; if (!n) return; e.preventDefault();
      S.sFocus = e.key === 'ArrowDown' ? (S.sFocus + 1) % n : (S.sFocus <= 0 ? n - 1 : S.sFocus - 1);
      if (!window.isMobile()) S.menu = 'search';
      setTimeout(() => document.querySelector('.s-row.is-focus')?.scrollIntoView({ block: 'nearest' }), 0);
      return true;
    }
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      const rows = visibleRows();
      if (S.sFocus >= 0 && rows[S.sFocus]) { A.searchGo(rows[S.sFocus].act); window.render(); return; }
      const q = S.q.trim(); if (!q) return;
      addRecent(q);
      const g = searchData(q).find(([, l]) => l.length); S.sGroup = g ? g[0] : null; S.sFocus = -1;
      if (!window.isMobile()) S.menu = 'search';
      return true;
    }
  };
  A.searchFill = (w) => { S.q = w; S.sGroup = null; S.sFocus = -1; if (!window.isMobile()) S.menu = 'search'; setTimeout(() => { const n = document.querySelector(window.isMobile() ? '[data-input="qm"]' : '[data-input="q"]'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 0); };
  A.searchClear = () => { window.LS.set('recentSearch', []); };
  A.searchDel = (w) => { window.LS.set('recentSearch', recent().filter((x) => x !== w)); };
  A.searchGroup = (g) => { S.sGroup = g || null; S.sFocus = -1; };
  A.searchOpen = () => { S.sheet = 'search'; S.sGroup = null; S.sFocus = -1; };
  A.searchClearQ = () => { S.q = ''; S.sGroup = null; setTimeout(() => document.querySelector('[data-input="qm"]')?.focus(), 0); };
  A.searchGo = (a) => {
    addRecent(S.q); blur(); closeLayers();
    const i = a.indexOf(':'), kind = a.slice(0, i), v = a.slice(i + 1);
    if (kind === 'tpl') { window.openTplPreview(v); return; }
    if (kind === 'proj') { A.openProject(v); return false; }
    if (kind === 'sess') { if (A.openSession) { const r = A.openSession(v); if (r !== false) window.render(); } return false; }
  };

  // ---------- SH-05 账户菜单 ----------
  function accountBody() {
    const lang = window.LANGS.find((l) => l.code === S.lang);
    return `<button class="acct-head" data-act="go" data-arg="me"><span class="avatar is-40"></span><span class="acct-main"><span class="acct-name ellipsis">${t('account/name')}</span><span class="caption faint">${t('account/id', { n: '20488316' })}</span><span class="level-tag is-inline"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span></span>${ic('caret-right', 'ic-16 faint')}</button>
      <button class="menu-item" data-act="acctCredit">${ic('sparkle-fill', 'is-brand')}<span class="grow">${t('account/balance')}</span><span class="muted">${t('confirm/points', { n: num(S.credits) })}</span></button>
      <button class="menu-item" data-act="go" data-arg="projects">${ic('folder-fill')}<span>${t('nav/projects')}</span></button>
      <button class="menu-item" data-act="go" data-arg="history">${ic('image-fill')}<span>${t('nav/history')}</span></button>
      <div class="menu-sep"></div>
      <div class="acct-row"><span>${t('account/appearance')}</span><div class="seg seg-sm">${['light', 'dark'].map((v) => `<button class="seg-opt ${S.theme === v ? 'is-on' : ''}" data-act="setTheme" data-arg="${v}" data-keep>${t('nav/theme-' + v)}</button>`).join('')}</div></div>
      <button class="menu-item" data-act="acctLangToggle" data-keep>${ic('globe')}<span class="grow">${t('nav/language')}</span><span class="muted">${lang ? lang.name : ''}</span>${ic(S.acctLang ? 'caret-down' : 'caret-right', 'ic-16 faint')}</button>
      ${S.acctLang ? `<div class="acct-langs">${langItems('acctLang', true)}</div>` : ''}
      <button class="menu-item" data-act="soon">${ic('question-fill')}<span>${t('account/help')}</span></button>
      <div class="menu-sep"></div>
      <button class="menu-item is-danger" data-act="openLogout">${ic('sign-out-fill')}<span>${t('account/logout')}</span></button>`;
  }
  A.acctCredit = () => { window.openCredit(); };
  A.acctLangToggle = () => { S.acctLang = !S.acctLang; };
  A.acctLang = (v) => { S.lang = v; window.LS.set('lang', v); S.acctLang = false; };
  // 退出登录确认（D 的「我的」页也调它）
  window.openLogout = () => { S.menu = null; if (window.isMobile()) { S.dialog = null; S.sheet = 'logout'; } else { S.sheet = null; S.dialog = 'logout'; } };
  A.openLogout = () => { window.openLogout(); };
  A.logoutOk = () => { closeLayers(); window.toast(t('toast/logged-out'), { info: true }); };
  const logoutBody = () => `<h3>${t('account/logout-q')}</h3><div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('common/cancel')}</button><button class="btn btn-danger" data-act="logoutOk">${t('account/logout')}</button></div>`;

  // ---------- 创作框 ----------
  const cost = () => (S.c.qty === 'one' ? 20 : TYPES[S.c.type].n * 20);
  window.composerCost = cost;
  const qLabel = () => t(S.c.quality === 'hd' ? 'spec/q-hd' : 'spec/q-standard');
  function specLabel() { const ty = TYPES[S.c.type]; return `${S.c.qty === 'one' ? t('spec/one') : t('spec/set-n', { n: ty.n })} · ${ty.w}×${ty.h} · ${qLabel()}`; }
  window.specLabel = specLabel;
  function colorLabel() {
    if (S.c.color === 'follow') return t('composer/chip-color');
    if (S.c.color === 'custom') return t('color/menu-title') + '：' + t('color/custom');
    return t('color/menu-title') + '：' + t('color/palette-' + S.c.color);
  }
  const modelName = (m) => (m === 'gemini' ? 'Gemini' : 'GPT Image');
  function specBody() {
    const ty = TYPES[S.c.type];
    return `<div class="lab">${t('spec/quantity')}</div>${window.seg([{ v: 'one', label: t('composer/qty-one') }, { v: 'set', label: t('composer/qty-set-' + S.c.type) }], S.c.qty, 'cQty')}
      <div class="lab" style="margin-top:12px">${t('spec/quality')}</div>${window.seg([{ v: 'std', label: t('spec/q-standard') }, { v: 'hd', label: t('spec/q-hd') }], S.c.quality, 'cQuality')}
      <div class="note">${t('spec/fixed-note', { w: ty.w, h: ty.h, sw: ty.w * 2, sh: ty.h * 2, hw: ty.w * 3, hh: ty.h * 3 })}</div>`;
  }
  function modelBody() {
    return ['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${S.c.model === m ? 'is-on' : ''}" data-act="cModel" data-arg="${m}">${window.MODEL_LOGO[m]}<span><div class="nm">${modelName(m)}</div><div class="ds">${m === 'gpt' ? 'Sunburst Flare' : 'Nano Banana Pro'} · ${t('model/' + m + '-desc')}</div></span></button>`).join('');
  }
  function colorBody() {
    const pal = (k) => `<button class="menu-item ${S.c.color === k ? 'is-on' : ''}" data-act="cColor" data-arg="${k}"><span class="dots">${PALETTES[k].slice(0, 3).map((c) => `<i style="background:${c}"></i>`).join('')}</span>${t('color/palette-' + k)}</button>`;
    const roles = ['color/role-primary', 'color/role-icon', 'color/role-active', 'color/role-inactive'];
    return `<button class="menu-item ${S.c.color === 'follow' ? 'is-on' : ''}" data-act="cColor" data-arg="follow"><span><div>${t('color/follow')}</div><div class="caption muted">${t('color/follow-desc')}</div></span></button>
      <div class="menu-label">${t('color/presets')}</div>${['blue', 'gold', 'green', 'purple'].map(pal).join('')}
      <div class="menu-sep"></div><button class="menu-item ${S.c.color === 'custom' ? 'is-on' : ''}" data-act="cColor" data-arg="custom" data-keep>${t('color/custom')}</button>
      ${S.c.color === 'custom' ? `<div class="custom-row">${roles.map((r, i) => `<label><input type="color" value="${S.c.custom[i]}" data-input="cCustom" data-i="${i}">${t(r)}</label>`).join('')}</div><div class="menu-label" style="padding-top:0">${t('color/custom-note')}</div>` : ''}`;
  }
  window.composer = function (where) {
    const mob = window.isMobile();
    const tabs = ['design', 'midnav', 'bottomnav', 'gametype']; // design：AI 首页设计（AD-01，放最前）
    const tabBtn = (ty) => `<button class="c-tab ${S.c.type === ty ? 'is-on' : ''}" data-act="cType" data-arg="${ty}">${window.typeIcon(ty)}${t('composer/type-' + ty)}</button>`;
    const tabsHtml = `<div class="c-tabs" data-sk="ctabs-${where}">${tabs.map(tabBtn).join('')}<button class="tpl-link" data-act="tplLink">${t('composer/template-link')}</button></div>`;
    if (S.c.type === 'design' && window.AD) return window.AD.composer(where, tabsHtml);
    const menu = (id, body, cls) => (!mob && S.menu === id ? `<div class="menu c-menu ${cls}">${body}</div>` : '');
    const opt = (id, inner) => `<div class="rel"><button class="c-opt ${S.menu === id ? 'is-open' : ''}" data-act="${mob ? 'sheet' : 'menu:toggle'}" data-arg="${id}">${inner}${ic('caret-down', 'chev')}</button>${menu(id, id === 'spec' ? specBody() : id === 'model' ? modelBody() : colorBody(), id === 'spec' ? 'spec-menu' : id === 'color' ? 'color-menu' : '')}</div>`;
    const opts = [
      opt('model', `${window.MODEL_LOGO[S.c.model]}<span class="ellipsis">${modelName(S.c.model)}</span>`),
      opt('color', `${ic('paint-brush-fill')}<span class="ellipsis">${esc(colorLabel())}</span>`),
      opt('spec', `${ic(S.c.qty === 'set' ? 'toolbox-fill' : 'frame-corners-fill')}<span class="ellipsis">${esc(specLabel())}</span>`),
    ];
    if (mob) opts.reverse(); // 手机端规格在前（Figma Composer Device=Mobile）
    const empty = !S.c.prompt.trim();
    const now = Date.now(), hint = now < (S.cHintUntil || 0), shake = now < (S.cShakeUntil || 0);
    return `<div class="composer" data-where="${where}">
      ${tabsHtml}
      <div class="c-box ${S.c.type === tabs[0] ? 'no-tl' : ''} ${hint ? 'is-err' : ''} ${shake ? 'is-shake' : ''}">
        <div class="c-input">
          ${window.refSlot(S.c.refSt, 'cRef')}
          <textarea rows="3" data-input="cPrompt" data-key="cKey" placeholder="${esc(t('composer/placeholder'))}">${esc(S.c.prompt)}</textarea>
        </div>
        <div class="c-tools"><div class="c-opts" data-sk="copts-${where}">${opts.join('')}</div>
          <button class="send ${empty ? 'is-disabled' : ''}" data-act="cSend" title="${esc(t('confirm/approx', { n: cost() }))}">${ic('sparkle-fill')}${num(cost())}${ic('arrow-up')}</button></div>
      </div>${hint ? `<div class="c-hint" role="alert">${t('composer/empty-hint')}</div>` : ''}</div>`;
  };
  A.cType = (v) => { S.c.type = v; S.menu = null; };
  A.cQty = (v) => { S.c.qty = v; };
  A.cQuality = (v) => { S.c.quality = v; };
  A.cModel = (v) => { S.c.model = v; S.menu = null; if (S.sheet === 'model') S.sheet = null; };
  A.cColor = (v) => { S.c.color = v; if (v !== 'custom') { S.menu = null; if (S.sheet === 'color') S.sheet = null; } else if (!window.isMobile()) S.menu = 'color'; };
  I.cCustom = (v, el) => { S.c.custom[+el.dataset.i] = v; };
  // CP-01 参考图格
  A.cRefPick = () => { S.sheet = null; window.refPick(S.c.refSt); return false; };
  A.cRefRm = () => { S.c.refSt.src = null; S.c.refSt.name = ''; if (S.sheet === 'ref') S.sheet = null; };
  A.cRefCancel = () => { window.refCancel(S.c.refSt); };
  A.cRefView = () => { if (window.isMobile()) S.sheet = 'ref'; else return false; };
  const refSheet = () => `<div class="sheet-head"><h3 class="ellipsis">${esc(S.c.refSt.name || t('composer/ref-slot'))}</h3><button class="ibtn ibtn-sm ibtn-secondary" data-act="closeAll" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>
    <img class="ref-big" src="${esc(S.c.refSt.src || '')}" alt="">
    <div class="sheet-btns"><button class="btn btn-secondary" data-act="cRefPick">${t('composer/ref-change')}</button><button class="btn btn-outline is-danger-outline" data-act="cRefRm">${t('composer/ref-remove')}</button></div>`;
  I.cPrompt = (v) => {
    S.c.prompt = v; const now = !v.trim();
    document.querySelectorAll('.send').forEach((b) => b.classList.toggle('is-disabled', now));
    if (S.cHintUntil) { S.cHintUntil = 0; document.querySelectorAll('.c-hint').forEach((n) => n.remove()); document.querySelectorAll('.c-box.is-err').forEach((n) => n.classList.remove('is-err')); }
    return false;
  };
  A.cKey = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); const r = A.cSend(); if (r !== false) return true; } };
  A.sheet = (id) => { S.sheet = id; S.menu = null; };
  A.tplLink = () => { if (S.route !== 'home') { window.go('home'); setTimeout(() => document.getElementById('sec-templates')?.scrollIntoView({ behavior: 'smooth' }), 60); } else document.getElementById('sec-templates')?.scrollIntoView({ behavior: 'smooth' }); return false; };
  // CP-03 空提交：描边变红 + 抖动 + 3 秒提示
  function emptyHint() {
    const now = Date.now(); S.cHintUntil = now + 3000; S.cShakeUntil = now + 320;
    const tok = (S.cHintTok = (S.cHintTok || 0) + 1);
    setTimeout(() => { if (S.cHintTok === tok && S.cHintUntil) { S.cHintUntil = 0; window.render(); } }, 3000);
    setTimeout(() => document.querySelector('[data-input="cPrompt"]')?.focus(), 0);
  }
  A.cSend = () => {
    if (!S.c.prompt.trim()) { emptyHint(); window.render(); return false; }
    const n = cost();
    if (S.c.qty === 'set') {
      const ty = TYPES[S.c.type];
      window.costConfirm({ title: t('confirm/title-' + S.c.type), body: t('confirm/body', { n: ty.n, m: ty.n - 1 }), cost: n, okLabel: t('confirm/ok'), onOk: () => window.startGeneration() });
      return;
    }
    if (!window.canAfford(n)) { window.lowBalance(n); return; }
    window.startGeneration();
  };
  A.confirmSet = () => { S.dialog = null; S.sheet = null; window.startGeneration(); };

  // 全局浮层（弹窗/底部面板），各页面共用
  const sm = (h) => h.replace('class="empty"', 'class="empty is-sm"');
  window.overlays = function () {
    let h = '';
    if (S.sheet === 'spec' && TYPES[S.c.type]) h += window.sheet(`<div class="sheet-head"><h3>${t('spec/sheet-title')}</h3></div><div class="spec-menu" style="width:auto;padding:0">${specBody()}</div><button class="btn btn-primary btn-block" style="margin-top:16px" data-act="closeAll">${t('spec/done')}</button>`);
    if (S.sheet === 'model') h += window.sheet(`<div class="sheet-head"><h3>${t('sheet/model-title')}</h3></div>${modelBody()}`);
    if (S.sheet === 'color') h += window.sheet(`<div class="sheet-head"><h3>${t('sheet/color-title')}</h3></div>${colorBody()}${S.c.color === 'custom' ? `<button class="btn btn-primary btn-block" style="margin-top:12px" data-act="closeAll">${t('spec/done')}</button>` : ''}`);
    if (S.sheet === 'credit') h += window.sheet(`<div class="credit-sheet">${creditBody()}</div>`, 'is-credit');
    if (S.sheet === 'notice') h += window.sheet(`<div class="notice-sheet">${noticeBody(true)}</div>`, 'is-tall');
    if (S.sheet === 'search') h += window.sheet(`<div class="s-top"><label class="tb-search">${ic('magnifying-glass', 'ic-16')}<input data-input="qm" data-key="searchKey" value="${esc(S.q)}" placeholder="${esc(t('search/placeholder'))}" autocomplete="off" data-autofocus>${S.q ? `<button class="s-x" data-act="searchClearQ" aria-label="${esc(t('search/clear'))}">${ic('x', 'ic-16')}</button>` : ''}</label><button class="s-cancel" data-act="closeAll">${t('common/cancel')}</button></div><div class="s-body">${searchBody()}</div>`, 'is-full is-search');
    if (S.sheet === 'ref' && S.c.refSt.src) h += window.sheet(refSheet(), 'is-ref');
    if (S.dialog === 'logout') h += window.dialog(logoutBody(), 'dialog-sm');
    if (S.sheet === 'logout') h += window.sheet(logoutBody());
    if (S.dialog === 'tpl') h += window.dialog(tplBody(false), 'dialog-tpl');
    if (S.sheet === 'tpl') h += window.sheet(tplBody(true), 'is-full is-tpl');
    if (S.dialog === 'newproj') h += window.dialog(npBody(), 'dialog-np');
    if (S.sheet === 'newproj') h += window.sheet(npBody());
    if (window.wbOverlays) h += window.wbOverlays();
    if (window.pageOverlays) h += window.pageOverlays();
    if (window.adOverlays) h += window.adOverlays();
    h += window.costConfirmLayer();
    return h;
  };

  // ---------- 首页数据 ----------
  window.PROJECTS = window.LS.get('projects', null) || [
    { name: '星河体育 · 首页', st: 'designing', time: 'time/2h', tone: 'blue' }, { name: '金冠娱乐 · H5', st: 'exported', time: 'time/yesterday', tone: 'gold' },
    { name: '蓝鲸平台 · 春节版', st: 'designing', time: 'time/3d', tone: 'blue' }, { name: 'Lucky Star · Home', st: 'exported', time: 'time/3d', tone: 'purple' },
    { name: '悦动 · 新版首页', st: 'designing', time: 'time/3d', tone: 'green' }, { name: '星耀 · 活动页', st: 'designing', time: 'time/3d', tone: 'purple' },
  ];
  // 项目列表存 LS：新建 / 重命名 / 删除（D 的页面直接改 window.PROJECTS 数组）刷新后保持一致
  let projSaved = '';
  window.AFTER_RENDER.push(() => { const s = JSON.stringify(window.PROJECTS); if (s !== projSaved) { projSaved = s; window.LS.set('projects', window.PROJECTS); } });
  // 目前只开放「经典蓝白」（真实 UI，Waydon 2026-11-26 11:16）；其余版式（含白金）只显示平台底板色 + 兜底图标 +「暂未开放」
  const TPL_OPEN = ['classic-blue']; // Waydon 2026-11-26 11:16：只开放真实的经典蓝白，其他（含白金）先显示暂不开放
  window.tplOpen = (k) => TPL_OPEN.includes(k);
  const soonToast = () => window.toast(t('tpl/soon-toast'), { info: true });
  A.tplSoon = () => { soonToast(); return false; };
  const TEMPLATES = (window.TEMPLATES = [
    { k: 'classic-blue', meta: 'standard', f: 'classic', tone: 'blue' }, { k: 'western-white', meta: 'standard', f: 'western', tone: 'platinum' }, { k: 'midnight-gold', meta: 'pro', f: 'dark', tone: 'gold' },
    { k: 'fresh-green', meta: 'standard', f: 'minimal', tone: 'green' }, { k: 'festive-red', meta: 'pro', f: 'festive', tone: 'gold' }, { k: 'classic-blue', meta: 'standard', f: 'classic', tone: 'blue' },
  ]);
  // 模板 → 配色（沿用编辑器 setTemplate 的 map；新模板没写 tone 时按名字猜）
  const TPL_TONE = { 'classic-blue': 'blue', 'midnight-gold': 'gold', 'fresh-green': 'green', 'western-white': 'platinum', 'festive-red': 'gold', 'ocean-blue': 'blue', 'black-gold': 'gold', 'spring-red': 'gold', 'mini-gray': 'purple', 'western-blue': 'blue' };
  const tplTone = (x) => x.tone || TPL_TONE[x.k] || 'blue';
  window.tplTone = (k) => TPL_TONE[k] || 'blue';
  const toneGrad = (tone) => { const p = PALETTES[tone] || MINI_PAL[tone] || PALETTES.blue; return `linear-gradient(160deg, ${p[0]}, ${p[3]})`; };
  const levelTag = () => `<span class="level-tag"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span>`;

  // HM-02 封面：首次 0.6 秒骨架，之后静态缩略图；图片坏了显示 image-broken-fill
  function cover(src, ratio, extra = '') {
    if (!S.thumbsReady) return `<div class="cover ${ratio} skeleton">${extra}</div>`;
    return `<div class="cover ${ratio} has-img"><img src="${src}" alt="" loading="lazy" onerror="this.parentNode.classList.add('is-broken');this.remove()"><span class="broken">${ic('image-broken-fill', 'ic-24')}</span>${extra}</div>`;
  }
  function kickThumbs() {
    if (S.thumbsReady || S.thumbsTimer) return;
    S.thumbsTimer = setTimeout(() => { S.thumbsReady = true; window.render(); }, 600);
  }
  window.kickThumbs = kickThumbs;
  // 卡片 HTML（D 的新页面复用）：extra 放进封面右上（例如「⋯」按钮）
  window.projectCard = (p, extra = '') => { kickThumbs(); return `<div class="card" role="button" tabindex="0" data-act="openProject" data-arg="${esc(p.name)}">${cover('assets/thumbs/project-' + (p.tone || 'blue') + '.png', 'r-5x6', levelTag() + extra)}<div class="card-title"><span class="ellipsis" title="${esc(p.name)}">${esc(p.name)}</span><span class="pill-tag ${p.st === 'exported' ? 'is-ok' : ''}">${t('status/' + p.st)}</span></div><div class="caption faint">${p.timeText ? esc(p.timeText) : t(p.time)}</div></div>`; };
  window.templateCard = (x, extra = '') => { if (!window.tplOpen(x.k)) return `<div class="card is-soon" role="button" tabindex="0" data-act="tplSoon" data-arg="${x.k}"><div class="cover r-3x4 tpl-soon-cover"><span class="tpl-soon-ic">${ic('layout-fill', 'ic-40')}</span><span class="pill-tag is-gray tpl-soon-tag">${t('level/coming-soon')}</span>${extra}</div><div class="card-title"><span class="ellipsis">${t('template/' + x.k)}</span></div><div class="caption faint">${t('level/coming-soon')}</div></div>`; kickThumbs(); return `<div class="card" role="button" tabindex="0" data-act="openTplPreview" data-arg="${x.k}">${cover('assets/thumbs/tpl-' + x.k + '.png', 'r-3x4', extra)}<div class="card-title"><span class="ellipsis">${t('template/' + x.k)}</span></div><div class="caption faint">${t('template/meta-' + x.meta)}</div></div>`; };
  // role=button 的卡片支持回车 / 空格
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); } });
  A.openProject = (name) => {
    const p = window.PROJECTS.find((x) => x.name === name) || { name, st: 'designing', tone: 'blue' };
    closeLayers(); window.openEditor({ name: p.name, status: p.st, palette: p.tone }); return false;
  };

  // ---------- HM-01 模板预览 / 新建项目 ----------
  // 缩略长图：用模板配色画一张简化 H5 首页（预览弹窗用；缩略图 PNG 也是从它截出来的）
  // 缩略图专用的额外配色（只用于画面，不进编辑器）
  const MINI_PAL = { red: ['#e0322b', '#ffb800', '#ff7a00', '#3a0d0d'], gray: ['#5b6270', '#9aa3b2', '#2fa84f', '#22252b'], teal: ['#0a9bb5', '#3a86ff', '#ffaa09', '#0f2a33'] };
  const THUMB_TONE = { 'festive-red': 'red', 'spring-red': 'red', 'mini-gray': 'gray', 'ocean-blue': 'teal' };
  const thumbTone = (x) => THUMB_TONE[x.k] || tplTone(x);
  window.miniH5 = function (tone, long) {
    const p = PALETTES[tone] || MINI_PAL[tone] || PALETTES.blue, dark = tone === 'gold' || tone === 'red', bg = dark ? '#16130f' : '#f4f6fa', card = dark ? '#262019' : '#ffffff', ink = dark ? '#f5e6c8' : '#1d2433';
    const icons = (n, cls) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="background:${i % 3 === 0 ? p[0] : i % 3 === 1 ? p[1] : p[2]}"></i>`).join('');
    const games = (n) => Array.from({ length: n }, (_, i) => `<i style="background:linear-gradient(150deg, ${p[i % 3]}, ${p[3]})"></i>`).join('');
    return `<div class="mini-h5" style="--m-bg:${bg};--m-card:${card};--m-ink:${ink};--m-p:${p[0]};--m-dark:${p[3]}">
      <div class="m-top"><i class="m-logo"></i><span></span><b></b></div>
      <div class="m-banner" style="background:linear-gradient(120deg, ${p[0]}, ${p[3]})"><span></span><span></span></div>
      <div class="m-jack"><span>8,888,888</span></div>
      <div class="m-nav">${icons(5, 'm-ic')}</div>
      <div class="m-tabs">${icons(4, 'm-tab')}</div>
      <div class="m-games">${games(long ? 12 : 6)}</div>
      ${long ? `<div class="m-games is-wide">${games(4)}</div><div class="m-foot"></div>` : ''}
      <div class="m-bottom">${icons(5, 'm-bi')}</div></div>`;
  };
  window.openTplPreview = function (k) {
    if (!window.tplOpen(k)) { soonToast(); return; }
    S.tplK = k; S.tplReady = false; S.menu = null;
    if (window.isMobile()) { S.dialog = null; S.sheet = 'tpl'; } else { S.sheet = null; S.dialog = 'tpl'; }
    const tok = (S.tplTok = (S.tplTok || 0) + 1);
    setTimeout(() => { if (S.tplTok === tok) { S.tplReady = true; window.render(); } }, 400);
    if (!window.__inAct) window.render();
  };
  A.openTplPreview = (k) => { window.openTplPreview(k); };
  function tplBody(mobile) {
    const x = TEMPLATES.find((q) => q.k === S.tplK) || { k: S.tplK, meta: 'standard', f: 'classic' };
    const tone = thumbTone(x), pal = PALETTES[tone] || MINI_PAL[tone] || PALETTES.blue;
    const prev = `<div class="tpl-prev ${S.tplReady ? '' : 'skeleton'}" data-sk="tplprev">${S.tplReady ? window.miniH5(tone, true) : ''}</div>`;
    const info = `<div class="tpl-info"><h3>${t('template/' + x.k)}</h3>
      <div class="tpl-meta"><span class="level-tag is-inline"><img src="assets/badge-tier${x.meta === 'pro' ? 2 : 1}.png" alt="">${t('level/' + (x.meta === 'pro' ? 'pro' : 'standard') + '-title')}</span><span class="caption muted">${t('template/meta-' + x.meta)}</span></div>
      <div class="dots tpl-dots">${pal.slice(0, 3).map((c) => `<i style="background:${c}"></i>`).join('')}</div>
      <p class="muted body-sm">${t('tpl/desc')}</p>
      <div class="tpl-btns"><button class="btn btn-secondary" data-act="closeAll">${t('tpl/close')}</button><button class="btn btn-primary" data-act="tplNew">${t('tpl/use')}</button></div></div>`;
    return mobile ? `<div class="sheet-head"><h3 class="ellipsis">${t('template/' + x.k)}</h3><button class="ibtn ibtn-sm ibtn-secondary" data-act="closeAll" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>${prev}${info}` : `<div class="tpl-wrap">${prev}${info}</div>`;
  }
  A.tplNew = () => { window.openNewProject({ template: S.tplK }); };
  function defaultName() {
    const names = new Set(window.PROJECTS.map((p) => p.name)); let n = 1;
    while (names.has(t('newproj/default-name', { n }))) n++;
    return t('newproj/default-name', { n });
  }
  // 新建项目弹窗（D 的「我的项目」也调它）
  window.openNewProject = function (opts = {}) {
    if (opts.template && !window.tplOpen(opts.template)) { soonToast(); return; }
    S.np = { name: opts.name || defaultName(), level: 'standard', template: opts.template || null, design: opts.design || null, from: opts.from || '', fresh: true };
    S.menu = null;
    if (window.isMobile()) { S.dialog = null; S.sheet = 'newproj'; } else { S.sheet = null; S.dialog = 'newproj'; }
    if (!window.__inAct) window.render();
  };
  A.openNewProject = (k) => { window.openNewProject({ template: k || null }); };
  function npBody() {
    const np = S.np || {}, emptyName = !np.name.trim();
    const taken = !emptyName && window.PROJECTS.some((p) => p.name === np.name.trim()); // 同名会覆盖已有项目的设计，拦下
    const lv = (key, tier, on) => `<button class="np-level ${on ? (np.level === key ? 'is-on' : '') : 'is-off'}" ${on ? `data-act="npLevel" data-arg="${key}"` : 'disabled'}><img src="assets/badge-tier${tier}.png" alt=""><span class="grow">${t('level/' + key + '-title')}</span>${on ? '' : `<span class="pill-tag is-gray">${t('level/coming-soon')}</span>`}</button>`;
    const fresh = np.fresh; np.fresh = false;
    return `<h3>${t('newproj/title')}</h3>
      <label class="np-lab">${t('newproj/name')}</label>
      <input class="input np-name ${emptyName || taken ? 'is-err' : ''}" data-input="npName" data-key="npKey" value="${esc(np.name)}" ${fresh ? 'data-autofocus' : ''} maxlength="40">
      ${emptyName ? `<div class="caption err-text">${t('newproj/name-empty')}</div>` : taken ? `<div class="caption err-text">${t('ed/name-taken')}</div>` : ''}
      <label class="np-lab">${t('newproj/level')}</label>
      <div class="np-levels">${lv('standard', 1, true)}${lv('pro', 2, false)}${lv('full', 3, false)}</div>
      ${np.template ? `<div class="caption muted" style="margin-top:12px">${t('newproj/from-tpl', { name: t('template/' + np.template) })}</div>` : ''}${np.design && np.from ? `<div class="caption muted" style="margin-top:12px">${esc(np.from)}</div>` : ''}
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-primary ${emptyName || taken ? 'is-disabled' : ''}" data-act="npStart">${t('newproj/start')}</button></div>`;
  }
  const npState = (v) => { v = v.trim(); return !v ? 'empty' : window.PROJECTS.some((p) => p.name === v) ? 'taken' : 'ok'; };
  I.npName = (v) => { const was = npState(S.np.name); S.np.name = v; return was !== npState(v); };
  A.npKey = (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); A.npStart(); window.render(); } };
  A.npLevel = (k) => { S.np.level = k; };
  A.npStart = () => {
    const np = S.np; if (!np || npState(np.name) !== 'ok') return false;
    closeLayers();
    const palette = np.template ? tplTone({ k: np.template }) : 'blue';
    const name = np.name.trim();
    // 新项目：清掉同名旧项目（已删除）残留的编辑器数据；不带模板时按默认模板新建，保证是一份全新的设计
    ['ed.d.', 'ed.st.', 'ed.x.'].forEach((k) => { try { localStorage.removeItem('proto.' + k + name); } catch (e) { /* noop */ } });
    if (np.design) { // AD：用 AI 首页设计新建项目，设计作为初始数据
      const tone = np.design.tone || 'blue';
      window.PROJECTS.unshift({ name, st: 'designing', time: 'time/just', tone, template: np.design.template || null });
      window.openEditor({ name, design: np.design, status: 'designing' });
      return false;
    }
    window.PROJECTS.unshift({ name, st: 'designing', time: 'time/just', tone: palette, template: np.template || null });
    window.openEditor({ name, template: np.template || 'classic-blue', palette, status: 'designing' });
    return false;
  };

  // ---------- 首页 ----------
  window.VIEWS.home = function () {
    const lv = (tier, key, on) => `<div class="level ${on ? 'is-on' : 'is-off'}"><div class="level-row"><img src="assets/badge-tier${tier}.png" alt=""><span class="level-title">${t('level/' + key + '-title')}</span>${on ? '' : `<span class="pill-tag is-gray">${t('level/coming-soon')}</span>`}</div><div class="level-desc">${t('level/' + key + '-desc')}</div>${on ? `<div><button class="btn btn-primary" data-act="openNewProject">${ic('arrow-right', 'ic-16')}${t('level/cta')}</button></div>` : ''}</div>`;
    const tpls = TEMPLATES.filter((x) => S.filter === 'all' || x.f === S.filter);
    const tplEmpty = `<div class="cards-empty">${sm(window.empty('squares-four-fill', t('home/tpl-empty'), '', `<button class="btn btn-secondary btn-sm" data-act="filter" data-arg="all">${t('common/view-all')}</button>`))}</div>`;
    const inner = `<main class="page">
      <section class="hero"><img class="hero-orb" src="assets/logo-orb.webp" alt=""><h1>${t('home/greeting')}</h1><p>${t('home/subtitle')}</p>${window.composer('home')}</section>
      <section class="section"><div class="section-head"><h2>${t('section/level')}</h2></div><div class="levels">${lv(1, 'standard', true)}${lv(2, 'pro', false)}${lv(3, 'full', false)}</div></section>
      ${auOff() ? window.AU.homeCard() : !window.PROJECTS.length ? '' : `<section class="section"><div class="section-head"><h2>${t('section/recent')}</h2><button class="view-all" data-act="go" data-arg="projects">${t('common/view-all')}${ic('caret-right', 'ic-16')}</button></div>
        <div class="cards" data-sk="recent">${window.PROJECTS.slice(0, 6).map((p) => window.projectCard(p)).join('')}</div></section>`}
      <section class="section" id="sec-templates"><div class="section-head"><h2>${t('section/templates')}</h2><button class="view-all" data-act="go" data-arg="templates">${t('common/view-all')}${ic('caret-right', 'ic-16')}</button></div>
        <div class="filters scroll-x" data-sk="filters">${['all', 'classic', 'western', 'minimal', 'dark', 'festive'].map((f) => `<button class="chip ${S.filter === f ? 'is-on' : ''}" data-act="filter" data-arg="${f}">${t('filter/' + f)}</button>`).join('')}</div>
        <div class="cards ${tpls.length ? '' : 'is-empty'}" data-sk="tpls">${tpls.length ? tpls.slice(0, 6).map((x) => window.templateCard(x)).join('') : tplEmpty}</div></section>
    </main>`;
    return window.shell(inner);
  };
  A.filter = (f) => { S.filter = f; };
  // 首页创作框的下拉（自定义配色展开后较高）超出屏幕底部时，把页面滚到能看到整个菜单（测试修复）
  window.AFTER_RENDER.push(() => {
    if (!S.menu || S.route !== 'home') return;
    const m = document.querySelector('.hero .c-menu'); if (!m) return;
    const r = m.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 8) window.scrollBy({ top: Math.min(r.bottom - window.innerHeight + 16, r.top - 72) });
  });
  A.openEditor = () => { window.openNewProject(); };

  // ---------- 待设计页面（兜底）----------
  window.VIEWS.todo = function () {
    return window.shell(`<div class="todo-page">${window.empty('wrench-fill', t('page/todo-title'), t('page/todo-desc'), `<button class="btn btn-secondary" data-act="go" data-arg="home">${t('page/back-home')}</button>`)}</div>`, { solid: true });
  };
})();
