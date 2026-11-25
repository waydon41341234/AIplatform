/* 工作台：生成记录流、会话列表（重命名/置顶/下载/删除）、生成过程模拟。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const GLYPHS = ['house-fill', 'game-controller-fill', 'heart-fill', 'gift-fill', 'trophy-fill', 'crown-fill', 'ticket-fill', 'headset-fill', 'stack-fill', 'toolbox-fill', 'sparkle-fill', 'user-circle-fill', 'bell-fill', 'credit-card', 'squares-four-fill', 'magic-wand-fill'];
  const TONES = { blue: ['#1e46f0', '#06b0ea'], gold: ['#a8741f', '#f2c14e'], green: ['#0b8f57', '#3fd28f'], purple: ['#5b2fd6', '#c86bff'], follow: ['#1e46f0', '#06b0ea'], custom: null };
  let rid = 10;
  const rec = (o) => Object.assign({ id: 'r' + ++rid, day: 'today', progress: 100, tone: 'blue' }, o);
  S.sessions = [
    { id: 's1', title: '中部导航 · 深蓝玻璃质感', pinned: false, records: [
      rec({ prompt: '深蓝科技感，玻璃磨砂质感，圆润线条', model: 'gpt', type: 'midnav', quality: 'std', qty: 'set', status: 'sample' }),
      rec({ prompt: '霓虹扁平风，紫粉渐变描边', model: 'gemini', type: 'gametype', quality: 'hd', qty: 'one', status: 'generating', progress: 73, tone: 'purple' }),
    ] },
    { id: 's2', title: '底部导航 · 金色奢华', pinned: false, records: [
      rec({ prompt: '金色奢华风，立体浮雕，深色底', model: 'gpt', type: 'bottomnav', quality: 'std', qty: 'set', status: 'doneSet', tone: 'gold', day: 'yesterday' }),
    ] },
    { id: 's3', title: '游戏分类 · 霓虹扁平', pinned: false, records: [
      rec({ prompt: '霓虹扁平风，紫粉渐变描边', model: 'gemini', type: 'gametype', quality: 'hd', qty: 'one', status: 'done', tone: 'purple', day: 'yesterday' }),
    ] },
  ];
  S.activeSession = 's1';
  S.sessSearch = '';
  S.renaming = null;
  const sess = (id) => S.sessions.find((s) => s.id === id);

  // ---------- 会话列表 ----------
  function sorted() {
    const q = (S.sessSearch || '').trim().toLowerCase();
    return S.sessions.filter((s) => !q || s.title.toLowerCase().includes(q)).sort((a, b) => (b.pinned - a.pinned));
  }
  window.sessionList = function (where) {
    const list = sorted();
    if (!list.length) return `<div class="sess-empty">—</div>`;
    const cur = S.route === 'workbench' && S.routeArg !== 'new' ? S.activeSession : null;
    return `<div class="sessions" data-sk="sess-${where}">${list.map((s) => {
      if (S.renaming === s.id) return `<div class="sess is-editing">${s.pinned ? window.ic('push-pin-fill', 'ic-16 pin') : ''}<input data-input="renameVal" data-key="renameKey" value="${window.esc(S.renameVal)}" data-autofocus aria-label="${window.esc(window.t('menu/rename'))}"></div>`;
      const menuOpen = S.menu === 'sess:' + s.id && where === 'sb';
      return `<div class="sess ${cur === s.id ? 'is-on' : ''} rel">${s.pinned ? window.ic('push-pin-fill', 'ic-16 pin') : ''}<button class="t ellipsis" data-act="openSession" data-arg="${s.id}" title="${window.esc(s.title)}">${window.esc(s.title)}</button>
        <button class="more ${menuOpen ? 'is-open' : ''}" data-act="${window.isMobile() ? 'sessSheet' : 'menu:toggle'}" data-arg="${window.isMobile() ? s.id : 'sess:' + s.id}" aria-label="more">${window.ic('dots-three', 'ic-16')}</button>
        ${menuOpen ? sessMenu(s, 'menu') : ''}</div>`;
    }).join('')}</div>`;
  };
  function sessMenu(s, kind) {
    const items = `<button class="menu-item" data-act="sessRename" data-arg="${s.id}">${window.ic('pencil-simple')}${window.t('menu/rename')}</button>
      <button class="menu-item" data-act="sessPin" data-arg="${s.id}">${window.ic(s.pinned ? 'push-pin-fill' : 'push-pin')}${window.t(s.pinned ? 'menu/unpin' : 'menu/pin')}</button>
      <button class="menu-item" data-act="sessZip" data-arg="${s.id}">${window.ic('download-simple')}${window.t('menu/download-zip')}</button>
      <div class="menu-sep"></div><button class="menu-item is-danger" data-act="sessDelete" data-arg="${s.id}">${window.ic('trash')}${window.t('menu/delete')}</button>`;
    // 侧栏底部空间不够，会话菜单向上弹（Figma SessionMenu）
    return kind === 'menu' ? `<div class="menu sess-menu">${items}</div>` : items;
  }
  A.openSession = (id) => { S.activeSession = id; S.drawer = false; if (S.route !== 'workbench' || S.routeArg) { window.go('workbench'); return false; } };
  A.sessSheet = (id) => { S.sessSheet = id; S.sheet = 'sess'; };
  // 会话列表可滚动（overflow:auto）会裁掉菜单，所以菜单用 fixed 定位到「⋯」按钮上方（往上弹）。
  window.AFTER_RENDER.push(() => {
    const m = document.querySelector('.sess-menu'); if (!m) return;
    const b = m.parentElement.querySelector('.more').getBoundingClientRect();
    m.style.position = 'fixed'; m.style.left = Math.max(8, b.right - m.offsetWidth) + 'px'; m.style.top = (b.top - m.offsetHeight - 4) + 'px';
  });
  A.sessRename = (id) => { S.renaming = id; S.renameVal = sess(id).title; S.menu = null; S.sheet = null; if (window.isMobile()) S.drawer = true; };
  I.renameVal = (v) => { S.renameVal = v; };
  A.renameKey = (e) => {
    if (e.key === 'Enter') { const s = sess(S.renaming); const v = S.renameVal.trim(); if (s && v) { s.title = v; window.toast(window.t('toast/renamed')); } S.renaming = null; return true; }
    if (e.key === 'Escape') { S.renaming = null; return true; }
  };
  document.addEventListener('focusout', (e) => { if (S.renaming && e.target.matches('[data-input="renameVal"]')) { setTimeout(() => { if (!S.renaming) return; const s = sess(S.renaming); const v = (S.renameVal || '').trim(); if (s && v && v !== s.title) { s.title = v; window.toast(window.t('toast/renamed')); } S.renaming = null; window.render(); }, 120); } });
  A.sessPin = (id) => { const s = sess(id); s.pinned = !s.pinned; S.sheet = null; window.toast(window.t(s.pinned ? 'toast/pinned' : 'toast/unpinned')); };
  A.sessZip = () => { S.sheet = null; window.toast(window.t('toast/zip-started')); };
  A.sessDelete = (id) => { S.delId = id; S.menu = null; if (window.isMobile()) S.sheet = 'del'; else { S.sheet = null; S.dialog = 'del'; } };
  A.sessDeleteOk = () => {
    S.sessions = S.sessions.filter((s) => s.id !== S.delId);
    if (S.activeSession === S.delId) S.activeSession = S.sessions[0] ? S.sessions[0].id : null;
    S.dialog = null; S.sheet = null; window.toast(window.t('toast/deleted'));
  };
  I.sessSearch = (v) => { S.sessSearch = v; return true; };
  A.newChat = () => { S.drawer = false; window.go('workbench/new'); return false; };

  window.wbOverlays = function () {
    let h = '';
    const delBody = `<h3>${window.t('confirm/delete-title')}</h3><p class="muted" style="margin:8px 0 0">${window.t('confirm/delete-body')}</p><div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${window.t('confirm/cancel')}</button><button class="btn btn-danger" data-act="sessDeleteOk">${window.t('menu/delete')}</button></div>`;
    if (S.dialog === 'del') h += window.dialog(delBody);
    if (S.sheet === 'del') h += window.sheet(delBody);
    if (S.sheet === 'sess') { const s = sess(S.sessSheet); if (s) h += window.sheet(`<div class="sheet-head"><h3 class="ellipsis">${window.esc(s.title)}</h3></div>${sessMenu(s, 'sheet')}`); }
    if (S.drawer) h += `<div class="scrim" data-act="closeAll"></div><aside class="drawer">
      <button class="nav" data-act="go" data-arg="home">${window.ic('house-fill')}${window.t('nav/home')}</button>
      <div class="sb-wb"><button class="nav" data-act="go" data-arg="workbench">${window.ic('magic-wand-fill', 'is-brand')}${window.t('nav/workbench')}</button></div>
      <div class="sb-tools"><label class="sb-search">${window.ic('magnifying-glass', 'ic-16')}<input data-input="sessSearch" value="${window.esc(S.sessSearch)}" placeholder="${window.esc(window.t('workbench/search-sessions'))}"></label><button class="ibtn ibtn-sm" style="color:var(--brand)" data-act="newChat">${window.ic('plus', 'ic-16')}</button></div>
      ${window.sessionList('drawer')}</aside>`;
    return h;
  };

  // ---------- 生成记录 ----------
  const typeLabel = (ty) => window.t('composer/type-' + ty);
  function meta(r) {
    const ty = window.TYPES[r.type];
    return [r.model === 'gemini' ? 'Gemini' : 'GPT Image', `${typeLabel(r.type)} ${ty.w}×${ty.h}`, window.t(r.quality === 'hd' ? 'spec/q-hd' : 'spec/q-standard'), r.qty === 'one' ? window.t('spec/one') : window.t('spec/set-n', { n: ty.n })].join('  |  ');
  }
  function tone(r) { if (r.tone === 'custom' && r.custom) return [r.custom[0], r.custom[2]]; return TONES[r.tone] || TONES.blue; }
  function glyphTile(r, i, opts = {}) {
    const [a, b] = tone(r);
    const g = GLYPHS[(i + (r.seed || 0)) % GLYPHS.length];
    return `<div class="tile ${opts.sm ? 'is-sm' : ''} ${opts.dl ? 'can-dl' : ''}" ${opts.dl ? `data-act="dlOne"` : ''}>${opts.tag || ''}<div class="glyph" style="background:linear-gradient(135deg,${a},${b})">${window.ic(g)}</div>${opts.dl ? `<span class="dl">${window.ic('download-simple', 'ic-16')}</span>` : ''}${opts.more ? `<span class="more-n">+${opts.more}</span>` : ''}</div>`;
  }
  function recordView(r) {
    const ty = window.TYPES[r.type];
    const mob = window.isMobile();
    const [a, b] = tone(r);
    let body = '';
    if (r.status === 'generating') {
      body = `<div class="tiles"><div class="tile skeleton"><span class="pct" data-prog="${r.id}">${r.progress}%</span></div></div><div class="rec-note">${window.ic('clock', 'ic-16')}${window.t('rec/generating')}</div>`;
    } else if (r.status === 'sample') {
      body = `<div class="tiles">${glyphTile(r, 0, { tag: `<span class="tag pill-tag">${window.t('rec/sample-tag', { n: ty.n })}</span>` })}</div>
        <div class="rec-note">${window.t('rec/sample-ready', { m: ty.n - 1, c: num((ty.n - 1) * 20) })}</div>
        <div class="rec-actions"><button class="btn btn-primary btn-sm" data-act="approveSet" data-arg="${r.id}">${window.t('rec/continue', { m: ty.n - 1 })}</button><button class="btn btn-secondary btn-sm" data-act="regen" data-arg="${r.id}">${window.t('rec/redo-sample')}</button></div>`;
    } else if (r.status === 'setProgress') {
      const done = Math.round((r.progress / 100) * (ty.n - 1));
      const show = Math.min(1 + done, mob ? 6 : 12);
      body = `<div class="tiles">${Array.from({ length: show }, (_, i) => glyphTile(r, i, { sm: true })).join('')}<div class="tile is-sm skeleton"></div></div>
        <div class="rec-note">${window.ic('clock', 'ic-16')}<span data-prog="${r.id}">${window.t('rec/set-progress', { m: ty.n - 1 })} · ${done}/${ty.n - 1}</span></div><div class="progress" style="max-width:320px"><i style="width:${r.progress}%" data-bar="${r.id}"></i></div>`;
    } else if (r.status === 'doneSet') {
      const show = mob ? 3 : Math.min(ty.n, 16);
      body = `<div class="tiles">${Array.from({ length: show }, (_, i) => glyphTile(r, i, { sm: !mob, dl: true, more: mob && i === 2 ? ty.n - 3 : 0 })).join('')}${!mob && ty.n > show ? `<div class="tile is-sm"><span class="muted">+${ty.n - show}</span></div>` : ''}</div>
        <div class="rec-note">${window.t(mob ? 'rec/done-set-mobile' : 'rec/done-set', { n: ty.n })}</div>
        <div class="rec-actions"><button class="btn btn-primary btn-sm" data-act="dlZip">${window.ic('download-simple', 'ic-16')}${window.t('rec/download-zip')}</button><button class="btn btn-secondary btn-sm" data-act="regen" data-arg="${r.id}">${window.t('rec/regenerate')}</button></div>`;
    } else {
      body = `<div class="tiles">${glyphTile(r, 0, { dl: true })}</div>
        <div class="rec-actions" style="margin-top:12px"><button class="btn btn-secondary btn-sm" data-act="dlOne">${window.ic('download-simple', 'ic-16')}${window.t('rec/download')}</button><button class="btn btn-secondary btn-sm" data-act="regen" data-arg="${r.id}">${window.ic('clock-counter-clockwise', 'ic-16')}${window.t('rec/regenerate')}</button><button class="btn btn-secondary btn-sm" data-act="useRef">${window.ic('image', 'ic-16')}${window.t('rec/use-ref')}</button></div>`;
    }
    return `<article class="rec" id="${r.id}"><div class="rec-head"><span class="rec-thumb" style="background:linear-gradient(135deg,${a},${b})"></span><span class="rec-prompt">${window.esc(r.prompt)}</span><span class="rec-meta">${window.esc(meta(r))}</span></div>${body}</article>`;
  }
  A.dlOne = () => { window.toast(window.t('toast/png-started')); return false; };
  A.dlZip = () => { window.toast(window.t('toast/zip-started')); return false; };
  A.useRef = () => { S.c.ref = true; window.toast(window.t('toast/ref-added')); };
  A.approveSet = (id) => { const r = findRec(id); r.status = 'setProgress'; r.progress = 0; tick(r, 'doneSet', 6000); };
  A.regen = (id) => {
    const r = findRec(id); const s = S.sessions.find((x) => x.records.includes(r));
    const n = Object.assign({}, r, { id: 'r' + ++rid, status: 'generating', progress: 0, day: 'today', seed: (r.seed || 0) + 3 });
    s.records.push(n); tick(n, r.qty === 'set' ? 'sample' : 'done', 3500); scrollEnd();
  };
  function findRec(id) { for (const s of S.sessions) for (const r of s.records) if (r.id === id) return r; }
  function scrollEnd() { setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 30); }
  // 进度模拟：只改进度文字，结束时整页刷新
  function tick(r, end, ms) {
    const start = Date.now(), from = r.progress;
    const timer = setInterval(() => {
      const p = Math.min(100, Math.round(from + ((Date.now() - start) / ms) * (100 - from)));
      r.progress = p;
      const el = document.querySelector(`[data-prog="${r.id}"]`);
      if (el) {
        if (r.status === 'setProgress') { const n = window.TYPES[r.type].n - 1; el.textContent = `${window.t('rec/set-progress', { m: n })} · ${Math.round((p / 100) * n)}/${n}`; const b = document.querySelector(`[data-bar="${r.id}"]`); if (b) b.style.width = p + '%'; }
        else el.textContent = p + '%';
      }
      if (p >= 100) { clearInterval(timer); r.status = end; if (end === 'sample' || end === 'done' || end === 'doneSet') window.render(); }
    }, 250);
  }
  window.startGeneration = function () {
    const c = S.c;
    const r = rec({ prompt: c.prompt.trim(), model: c.model, type: c.type, quality: c.quality, qty: c.qty, status: 'generating', progress: 0, tone: c.color === 'follow' ? 'blue' : c.color, custom: c.custom.slice(), seed: Math.floor(Math.random() * 10) });
    let s = S.route === 'workbench' && S.routeArg !== 'new' ? sess(S.activeSession) : null;
    if (!s) { s = { id: 's' + Date.now(), title: `${typeLabel(c.type)} · ${c.prompt.trim().slice(0, 12)}`, pinned: false, records: [] }; S.sessions.unshift(s); }
    s.records.push(r); S.activeSession = s.id; c.prompt = ''; c.ref = false;
    S.credits = Math.max(0, S.credits - (c.qty === 'one' ? 20 : 20));
    tick(r, c.qty === 'set' ? 'sample' : 'done', 3500);
    if (S.route !== 'workbench' || S.routeArg) window.go('workbench'); else window.render();
    scrollEnd();
    return false;
  };
  // 原有的「生成中」记录继续跑完
  setTimeout(() => { const r = S.sessions[0].records[1]; if (r.status === 'generating') tick(r, 'done', 6000); }, 300);

  window.VIEWS.workbench = function () {
    const isNew = S.routeArg === 'new' || !sess(S.activeSession);
    const s = isNew ? null : sess(S.activeSession);
    let feed;
    if (isNew) {
      feed = `<div class="wb-empty"><img src="assets/logo-orb.webp" alt=""><h2>${window.t('workbench/empty-title')}</h2><p class="muted" style="margin:0">${window.t('workbench/empty-hint')}</p></div>`;
    } else {
      const groups = ['yesterday', 'today'].map((d) => ({ d, rs: s.records.filter((r) => r.day === d) })).filter((g) => g.rs.length);
      feed = `<div class="feed">${groups.map((g) => `<div class="day">${window.t('ws/' + g.d)}</div>${g.rs.map(recordView).join('')}`).join('')}</div>`;
    }
    const title = isNew ? window.t('nav/new-chat') : window.t('nav/workbench');
    const mTop = `<header class="m-topbar wb-bar"><button class="ibtn" data-act="openDrawer" aria-label="menu">${window.ic('sidebar-simple')}</button><h1>${window.esc(title)}</h1><button class="ibtn" data-act="newChat" aria-label="${window.esc(window.t('nav/new-chat'))}">${window.ic('plus')}</button></header>`;
    const inner = `<div class="wb">${feed}<div class="dock">${window.composer('wb')}</div></div>`;
    return window.shell(inner, { mTop, noTab: true, solid: true, cls: 'is-wb' });
  };
  A.openDrawer = () => { S.drawer = true; };
})();
