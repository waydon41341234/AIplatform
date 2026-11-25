/* 工作台：生成记录流、会话列表（重命名/置顶/下载/删除）、生成过程模拟、查看大图 / 整套、失败 / 取消 / 补生成。
   对外导出：sessionList、wbOverlays、startGeneration、openViewer、openRecord、glyphTile、WB（给 D 的历史生成页用）。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (k, v) => window.t(k, v), esc = (s) => window.esc(s), ic = (n, c) => window.ic(n, c);
  const isMob = () => window.isMobile();
  const GLYPHS = ['house-fill', 'game-controller-fill', 'heart-fill', 'gift-fill', 'trophy-fill', 'crown-fill', 'ticket-fill', 'headset-fill', 'stack-fill', 'toolbox-fill', 'sparkle-fill', 'user-circle-fill', 'bell-fill', 'credit-card', 'squares-four-fill', 'magic-wand-fill'];
  const TONES = { blue: ['#1e46f0', '#06b0ea'], gold: ['#a8741f', '#f2c14e'], green: ['#0b8f57', '#3fd28f'], purple: ['#5b2fd6', '#c86bff'], follow: ['#1e46f0', '#06b0ea'], custom: null };
  const PRICE = 20; // 一张 20 点

  // ---------- 共用接口（A 在 core.js 提供；没就绪时退化） ----------
  const afford = (n) => (typeof window.canAfford === 'function' ? window.canAfford(n) : (S.credits || 0) >= n);
  const pay = (n, kind, vars, sid, rid) => {
    if (n <= 0) return;
    if (typeof window.spend === 'function') window.spend(n, kind, vars, sid, rid);
    else S.credits = Math.max(0, (S.credits || 0) - n);
  };
  const notify = (o) => { if (typeof window.pushNotice === 'function') window.pushNotice(Object.assign({ cat: 'gen', read: false }, o)); };
  const failNext = (prompt = '') => (typeof window.takeFail === 'function' ? !!window.takeFail(prompt) : /失败|失敗|fail/i.test(prompt));
  let pendingCost = null; // costConfirm 没就绪时用本地弹窗
  function askCost(o) {
    if (typeof window.costConfirm === 'function') { window.costConfirm(o); return; }
    pendingCost = o; S.menu = null;
    if (isMob()) { S.dialog = null; S.sheet = 'wbcost'; } else { S.sheet = null; S.dialog = 'wbcost'; }
  }
  // 余额不够 → CP-02 不足版；够返回 true
  function need(n) {
    if (afford(n)) return true;
    askCost({ title: t('confirm/low-title'), body: n === PRICE ? t('confirm/low-one', { n: PRICE }) : '', cost: n });
    return false;
  }

  // ---------- 假数据 ----------
  let rid = 10;
  const rec = (o) => Object.assign({ id: 'r' + ++rid, day: 'today', progress: 100, tone: 'blue', fails: [], seeds: {} }, o);
  // 固定 id：s1 → r11 样板、r12 生成中；s2 → r13 一套完成；s3 → r14 单个完成、rf3 失败（SH-01 / SH-02 假数据跳转用）
  S.sessions = [
    { id: 's1', title: '中部导航 · 深蓝玻璃质感', pinned: false, records: [
      rec({ prompt: '深蓝科技感，玻璃磨砂质感，圆润线条', model: 'gpt', type: 'midnav', quality: 'std', qty: 'set', status: 'sample' }),
      rec({ prompt: '霓虹扁平风，紫粉渐变描边', model: 'gemini', type: 'gametype', quality: 'hd', qty: 'one', status: 'generating', progress: 73, tone: 'purple', free: true }),
    ] },
    { id: 's2', title: '底部导航 · 金色奢华', pinned: false, records: [
      rec({ prompt: '金色奢华风，立体浮雕，深色底', model: 'gpt', type: 'bottomnav', quality: 'std', qty: 'set', status: 'doneSet', tone: 'gold', day: 'yesterday' }),
    ] },
    { id: 's3', title: '游戏分类 · 霓虹扁平', pinned: false, records: [
      rec({ prompt: '霓虹扁平风，紫粉渐变描边', model: 'gemini', type: 'gametype', quality: 'hd', qty: 'one', status: 'done', tone: 'purple', day: 'yesterday' }),
      rec({ id: 'rf3', prompt: '赛博朋克霓虹，金属质感', model: 'gpt', type: 'gametype', quality: 'std', qty: 'one', status: 'failed', tone: 'purple', day: 'today' }),
    ] },
  ];
  S.activeSession = 's1';
  // 刷新后保留会话与记录（LS）；结构不对就用假数据
  const saved = window.LS.get('wbData1', null);
  if (saved && Array.isArray(saved.sessions)) {
    S.sessions = saved.sessions; S.activeSession = saved.active || null;
    S.sessions.forEach((s) => s.records.forEach((r) => { r.fails = r.fails || []; r.seeds = r.seeds || {}; r.busy = null; const k = +String(r.id).slice(1) || 0; if (k > rid) rid = k; }));
  }
  let lastSaved = '';
  function save() { const v = JSON.stringify({ sessions: S.sessions, active: S.activeSession }); if (v !== lastSaved) { lastSaved = v; window.LS.set('wbData1', JSON.parse(v)); } }
  window.AFTER_RENDER.push(save);
  S.sessSearch = '';
  S.renaming = null;
  S.viewer = null; S.setGrid = null;
  const sess = (id) => S.sessions.find((s) => s.id === id);
  function findRec(id) { for (const s of S.sessions) for (const r of s.records) if (r.id === id) return r; return null; }
  const sessOf = (r) => S.sessions.find((s) => s.records.includes(r));
  const sidOf = (r) => (sessOf(r) || {}).id;
  const N = (r) => window.TYPES[r.type].n;
  const typeLabel = (ty) => t('composer/type-' + ty);

  // ---------- 会话列表 ----------
  function sorted() {
    const q = (S.sessSearch || '').trim().toLowerCase();
    return S.sessions.filter((s) => !q || s.title.toLowerCase().includes(q)).sort((a, b) => (b.pinned - a.pinned));
  }
  // WB-04 空状态（侧栏 220 / 抽屉 300 通用）
  function sessEmpty() {
    const q = (S.sessSearch || '').trim();
    const h = q
      ? window.empty('magnifying-glass', t('wb/sess-none', { q }), '', `<button class="link-btn" data-act="sessClear">${t('wb/sess-clear')}</button>`)
      : window.empty('magic-wand-fill', t('wb/sess-empty'), '', `<button class="btn btn-secondary btn-sm" data-act="newChat">${ic('plus', 'ic-16')}${t('nav/new-chat')}</button>`);
    return `<div class="sess-none">${h.replace('class="empty"', 'class="empty is-sm"')}</div>`;
  }
  window.sessionList = function (where) {
    const list = sorted();
    if (!list.length) return sessEmpty();
    const cur = S.route === 'workbench' && S.routeArg !== 'new' ? S.activeSession : null;
    const mob = isMob();
    return `<div class="sessions" data-sk="sess-${where}">${list.map((s) => {
      if (S.renaming === s.id) return `<div class="sess is-editing">${s.pinned ? ic('push-pin-fill', 'ic-16 pin') : ''}<input data-input="renameVal" data-key="renameKey" value="${esc(S.renameVal)}" data-autofocus aria-label="${esc(t('menu/rename'))}"></div>`;
      // 平板抽屉（600–1199）也用往上弹的菜单；手机用底部面板
      const menuOpen = S.menu === 'sess:' + s.id && (where === 'sb' || !mob);
      return `<div class="sess ${cur === s.id ? 'is-on' : ''} rel">${s.pinned ? ic('push-pin-fill', 'ic-16 pin') : ''}<button class="t ellipsis" data-act="openSession" data-arg="${s.id}" title="${esc(s.title)}">${esc(s.title)}</button>
        <button class="more ${menuOpen ? 'is-open' : ''}" data-act="${mob ? 'sessSheet' : 'menu:toggle'}" data-arg="${mob ? s.id : 'sess:' + s.id}" aria-label="more">${ic('dots-three', 'ic-16')}</button>
        ${menuOpen ? sessMenu(s, 'menu') : ''}</div>`;
    }).join('')}</div>`;
  };
  function sessMenu(s, kind) {
    const items = `<button class="menu-item" data-act="sessRename" data-arg="${s.id}">${ic('pencil-simple')}${t('menu/rename')}</button>
      <button class="menu-item" data-act="sessPin" data-arg="${s.id}">${ic(s.pinned ? 'push-pin-fill' : 'push-pin')}${t(s.pinned ? 'menu/unpin' : 'menu/pin')}</button>
      <button class="menu-item" data-act="sessZip" data-arg="${s.id}">${ic('download-simple')}${t('menu/download-zip')}</button>
      <div class="menu-sep"></div><button class="menu-item is-danger" data-act="sessDelete" data-arg="${s.id}">${ic('trash')}${t('menu/delete')}</button>`;
    // 侧栏底部空间不够，会话菜单向上弹（Figma SessionMenu）
    return kind === 'menu' ? `<div class="menu sess-menu">${items}</div>` : items;
  }
  A.openSession = (id) => { S.activeSession = id; S.drawer = false; if (S.route !== 'workbench' || S.routeArg) { window.go('workbench'); return false; } };
  A.sessSheet = (id) => { S.sessSheet = id; S.sheet = 'sess'; };
  // 会话列表可滚动（overflow:auto）会裁掉菜单，所以菜单用 fixed 定位到「⋯」按钮上方（往上弹）；上方放不下时放到下方。
  window.AFTER_RENDER.push(() => {
    const m = document.querySelector('.sess-menu'); if (!m) return;
    const b = m.parentElement.querySelector('.more').getBoundingClientRect();
    let top = b.top - m.offsetHeight - 4;
    if (top < 8) top = b.bottom + 4;
    m.style.position = 'fixed'; m.style.left = Math.max(8, b.right - m.offsetWidth) + 'px'; m.style.top = top + 'px';
  });
  A.sessRename = (id) => { S.renaming = id; S.renameVal = sess(id).title; S.menu = null; S.sheet = null; if (isMob()) S.drawer = true; };
  I.renameVal = (v) => { S.renameVal = v; };
  A.renameKey = (e) => {
    if (e.key === 'Enter') { const s = sess(S.renaming); const v = S.renameVal.trim(); if (s && v) { s.title = v; window.toast(t('toast/renamed')); } S.renaming = null; return true; }
    if (e.key === 'Escape') { S.renaming = null; return true; }
  };
  document.addEventListener('focusout', (e) => { if (S.renaming && e.target.matches('[data-input="renameVal"]')) { setTimeout(() => { if (!S.renaming) return; const s = sess(S.renaming); const v = (S.renameVal || '').trim(); if (s && v && v !== s.title) { s.title = v; window.toast(t('toast/renamed')); } S.renaming = null; window.render(); }, 120); } });
  A.sessPin = (id) => { const s = sess(id); s.pinned = !s.pinned; S.sheet = null; window.toast(t(s.pinned ? 'toast/pinned' : 'toast/unpinned')); };
  A.sessZip = () => { S.sheet = null; window.toast(t('toast/zip-started')); };
  A.sessDelete = (id) => { S.delId = id; S.menu = null; if (isMob()) S.sheet = 'del'; else { S.sheet = null; S.dialog = 'del'; } };
  // WB-06 删除后可撤销：回到原下标，置顶状态不变；原来是当前会话则重新打开
  A.sessDeleteOk = () => {
    const i = S.sessions.findIndex((s) => s.id === S.delId);
    S.dialog = null; S.sheet = null;
    if (i < 0) return;
    const s = S.sessions[i], wasActive = S.activeSession === s.id;
    S.sessions.splice(i, 1);
    if (wasActive) S.activeSession = S.sessions[0] ? S.sessions[0].id : null;
    window.toast(t('toast/deleted'), {
      ms: 5000, actionLabel: t('ed/am-undo'),
      action: () => {
        if (S.sessions.includes(s)) return;
        S.sessions.splice(Math.min(i, S.sessions.length), 0, s);
        if (wasActive) { S.activeSession = s.id; if (S.route !== 'workbench' || S.routeArg) window.go('workbench'); }
      },
    });
  };
  I.sessSearch = (v) => { S.sessSearch = v; return true; };
  A.sessClear = () => {
    S.sessSearch = '';
    setTimeout(() => { const el = document.querySelector(S.drawer ? '.drawer [data-input="sessSearch"]' : '[data-input="sessSearch"]'); if (el) el.focus(); }, 0);
  };
  A.newChat = () => { S.drawer = false; window.go('workbench/new'); return false; };
  A.openDrawer = () => { S.drawer = true; S.drawerIn = true; };
  // 抽屉只在打开那一次播滑入动画（重渲染不重播，也避免 transform 影响 fixed 菜单定位）
  window.AFTER_RENDER.push(() => { if (S.drawerIn && document.querySelector('.drawer')) setTimeout(() => { S.drawerIn = false; }, 0); });

  // ---------- 记录工具 ----------
  function meta(r) {
    const ty = window.TYPES[r.type];
    return [r.model === 'gemini' ? 'Gemini' : 'GPT Image', `${typeLabel(r.type)} ${ty.w}×${ty.h}`, t(r.quality === 'hd' ? 'spec/q-hd' : 'spec/q-standard'), r.qty === 'one' ? t('spec/one') : t('spec/set-n', { n: ty.n })].join('  |  ');
  }
  function tone(r) { if (r.tone === 'custom' && r.custom) return [r.custom[0], r.custom[2]]; return TONES[r.tone] || TONES.blue; }
  const restDoneNow = (r) => Math.round((r.progress / 100) * (N(r) - 1));
  // 已成功的格子下标（0 = 样板）；历史生成页只显示这些
  function doneIdx(r) {
    const n = N(r), all = (k) => Array.from({ length: k }, (_, i) => i);
    switch (r.status) {
      case 'done': case 'sample': return [0];
      case 'doneSet': case 'filling': return all(n).filter((i) => !r.fails.includes(i));
      case 'setCancelled': return all(1 + r.restDone);
      case 'setProgress': return all(1 + restDoneNow(r));
      default: return [];
    }
  }
  // 查看器可翻的格子：一套完成时含失败格；单个失败显示失败占位
  function viewList(r, from) {
    if (from === 'history') return doneIdx(r);
    if (r.status === 'failed') return [0];
    if (r.status === 'doneSet' || r.status === 'filling') return Array.from({ length: N(r) }, (_, i) => i);
    return doneIdx(r);
  }
  const isFailIdx = (r, i) => r.status === 'failed' || r.fails.includes(i);
  // 一套「生成其余」失败的固定格：第 7、23 个（不够 23 个时取倒数第 2 个）
  function failSlots(r) { const n = N(r); const a = [6, 22].filter((i) => i < n); if (a.length < 2) a.push(n - 2); return [...new Set(a)]; }

  // 图标格。opts：sm、dl（下载角标）、zoom（查看大图角标）、more（+N，点了开整套）、tag、from（'history'）、view:false 不可点
  function glyphTile(r, i = 0, opts = {}) {
    if (typeof r === 'string') r = findRec(r);
    if (!r) return '';
    r.fails = r.fails || []; r.seeds = r.seeds || {};
    const [a, b] = tone(r);
    if (r.status === 'failed') return `<div class="tile tile-fail ${opts.sm ? 'is-sm' : ''}" data-act="viewTile" data-arg="${r.id}:0" title="${esc(t('rec/failed'))}">${ic('x-circle-fill', 'ic-24')}</div>`;
    const g = GLYPHS[(i + (r.seed || 0) + (r.seeds[i] || 0)) % GLYPHS.length];
    const fail = r.fails.includes(i), busy = r.busy === i;
    const act = opts.more ? `data-act="openSetGrid" data-arg="${r.id}"` : opts.view === false ? '' : `data-act="viewTile" data-arg="${r.id}:${i}${opts.from ? ':' + opts.from : ''}" title="${esc(t('wb/view-large'))}"`;
    const cls = ['tile', opts.sm ? 'is-sm' : '', opts.dl || opts.zoom ? 'can-dl' : '', act ? 'is-click' : '', fail ? 'is-failed' : ''].join(' ');
    return `<div class="${cls}" ${act}>${opts.tag || ''}<div class="glyph" style="background:linear-gradient(135deg,${a},${b})">${ic(g)}</div>`
      + (fail ? `<span class="fail-badge">${ic('x-circle-fill')}</span>` : '')
      + (busy ? '<span class="tile-busy"><i class="wb-spin"></i></span>' : '')
      + (opts.dl || opts.zoom ? `<span class="tile-acts">${opts.zoom ? `<span class="dl" data-act="viewTile" data-arg="${r.id}:${i}" data-stop title="${esc(t('wb/view-large'))}">${ic('arrows-out-simple', 'ic-16')}</span>` : ''}${opts.dl && !fail ? `<span class="dl" data-act="dlOne" data-stop title="${esc(t('rec/download'))}">${ic('download-simple', 'ic-16')}</span>` : ''}</span>` : '')
      + (opts.more ? `<span class="more-n">+${opts.more}</span>` : '') + '</div>';
  }
  // 一套的格子行：电脑最多 16 格 + 「+N」格，手机 3 格（第 3 格盖 +N）
  function setTiles(r, idx) {
    const mob = isMob();
    if (mob) {
      const show = idx.slice(0, 3);
      return show.map((i, k) => glyphTile(r, i, { dl: true, more: k === 2 && idx.length > 3 ? idx.length - 2 : 0 })).join('');
    }
    const show = idx.slice(0, 16);
    return show.map((i) => glyphTile(r, i, { sm: true, dl: true })).join('') + (idx.length > show.length ? `<div class="tile is-sm is-click more-tile" data-act="openSetGrid" data-arg="${r.id}"><span>+${idx.length - show.length}</span></div>` : '');
  }

  function recordView(r) {
    const ty = window.TYPES[r.type];
    const mob = isMob();
    const [a, b] = tone(r);
    const m = ty.n - 1;
    const note = (icn, txt, cls = '') => `<div class="rec-note ${cls}">${icn ? ic(icn, 'ic-16') : ''}<span>${txt}</span></div>`;
    const btn = (cls, act, label, icn) => `<button class="btn ${cls} btn-sm" data-act="${act}" data-arg="${r.id}">${icn ? ic(icn, 'ic-16') : ''}${label}</button>`;
    let body = '', cancel = false;
    switch (r.status) {
      case 'generating':
        cancel = true;
        body = `<div class="tiles"><div class="tile skeleton"><span class="pct" data-prog="${r.id}">${r.progress}%</span></div></div>${note('clock', t('rec/generating'))}`;
        break;
      case 'sample':
        body = `<div class="tiles">${glyphTile(r, 0, { tag: `<span class="tag pill-tag">${t('rec/sample-tag', { n: ty.n })}</span>` })}</div>
          ${note('', t('rec/sample-ready', { m, c: window.num(m * PRICE) }))}
          <div class="rec-actions">${btn('btn-primary', 'approveSet', t('rec/continue', { m }))}${btn('btn-secondary', 'regen', t('rec/redo-sample-cost', { c: PRICE }))}</div>`;
        break;
      case 'setProgress': {
        cancel = true;
        const done = restDoneNow(r);
        const show = Math.min(1 + done, mob ? 6 : 12);
        body = `<div class="tiles">${Array.from({ length: show }, (_, i) => glyphTile(r, i, { sm: true })).join('')}<div class="tile is-sm skeleton"></div></div>
          <div class="rec-note">${ic('clock', 'ic-16')}<span data-prog="${r.id}">${t('rec/set-progress', { m })} · ${done}/${m}</span></div><div class="progress" style="max-width:320px"><i style="width:${r.progress}%" data-bar="${r.id}"></i></div>`;
        break;
      }
      case 'filling':
        body = `<div class="tiles">${setTiles(r, Array.from({ length: ty.n }, (_, i) => i))}</div>
          ${note('clock', t('rec/filling', { f: r.fails.length }))}<div class="progress" style="max-width:320px"><i style="width:${r.progress}%" data-bar="${r.id}"></i></div>`;
        break;
      case 'doneSet': {
        const f = r.fails.length;
        body = `<div class="tiles">${setTiles(r, Array.from({ length: ty.n }, (_, i) => i))}</div>`;
        body += f
          ? `${note('warning-circle-fill', t('rec/partial', { d: m - f, n: m, f }), 'is-warn')}
            <div class="rec-actions">${btn('btn-primary', 'recFill', t('rec/fill-missing', { f, c: window.num(f * PRICE) }))}${btn('btn-secondary', 'dlZip', t('rec/dl-done-zip'), 'download-simple')}</div>`
          : `${note('', t(mob ? 'rec/done-set-mobile' : 'rec/done-set', { n: ty.n }))}
            <div class="rec-actions">${btn('btn-primary', 'dlZip', t('rec/download-zip'), 'download-simple')}${btn('btn-secondary', 'regen', t('rec/regenerate-cost', { c: PRICE }), 'clock-counter-clockwise')}</div>`;
        break;
      }
      case 'setCancelled': {
        const left = m - r.restDone;
        body = `<div class="tiles">${setTiles(r, doneIdx(r))}</div>${note('stop-circle-fill', t('rec/cancelled-set', { d: r.restDone, n: m }))}
          <div class="rec-actions">${btn('btn-primary', 'recResume', t('rec/resume', { r: left, c: window.num(left * PRICE) }))}${btn('btn-secondary', 'dlZip', t('rec/dl-done-zip'), 'download-simple')}</div>`;
        break;
      }
      case 'failed':
        body = `<div class="tiles">${glyphTile(r, 0)}</div>${note('warning-circle-fill', t('rec/failed'), 'is-err')}
          <div class="rec-actions">${btn('btn-primary', 'recRetry', t('rec/retry', { c: PRICE }))}${btn('btn-secondary is-danger-text', 'recDelete', t('rec/delete'), 'trash')}</div>`;
        break;
      case 'cancelled':
        body = `<div class="tiles"><div class="tile tile-void"></div></div>${note('stop-circle-fill', t('rec/cancelled-one'))}
          <div class="rec-actions">${btn('btn-secondary', 'recRetry', t('rec/regenerate-cost', { c: PRICE }), 'clock-counter-clockwise')}</div>`;
        break;
      default: // done（单个）
        body = `<div class="tiles">${glyphTile(r, 0, { dl: true })}</div>
          <div class="rec-actions" style="margin-top:12px">${btn('btn-secondary', 'dlOne', t('rec/download'), 'download-simple')}${btn('btn-secondary', 'regen', t('rec/regenerate-cost', { c: PRICE }), 'clock-counter-clockwise')}${btn('btn-secondary', 'useRef', t('rec/use-ref'), 'image')}</div>`;
    }
    const cancelBtn = cancel ? `<button class="rec-cancel" data-act="recCancel" data-arg="${r.id}">${ic('stop-circle-fill', 'ic-16')}${t('rec/cancel')}</button>` : '';
    return `<article class="rec ${S.flash === r.id ? 'is-flash' : ''}" id="rec-${r.id}"><div class="rec-head"><span class="rec-thumb" style="background:linear-gradient(135deg,${a},${b})"></span><span class="rec-prompt">${esc(r.prompt)}</span><span class="rec-meta">${esc(meta(r))}</span>${cancelBtn}</div>${body}</article>`;
  }

  // ---------- 生成过程模拟 ----------
  const timers = {};
  const stop = (r) => { clearInterval(timers[r.id]); delete timers[r.id]; };
  // 进度只改文字和进度条，结束时整页刷新
  function run(r, ms, onEnd) {
    stop(r);
    const start = Date.now(), from = r.progress;
    timers[r.id] = setInterval(() => {
      const p = Math.min(100, Math.round(from + ((Date.now() - start) / ms) * (100 - from)));
      r.progress = p;
      const el = document.querySelector(`[data-prog="${r.id}"]`);
      if (el) {
        if (r.status === 'setProgress') { const m = N(r) - 1; el.textContent = `${t('rec/set-progress', { m })} · ${Math.round((p / 100) * m)}/${m}`; }
        else el.textContent = p + '%';
      }
      const bar = document.querySelector(`[data-bar="${r.id}"]`); if (bar) bar.style.width = p + '%';
      if (p >= 100) { stop(r); onEnd(); window.render(); }
    }, 250);
  }
  // 单个 / 样板：生成中 → 完成（扣 20）或失败（不扣）
  function startFirst(r, ms = 3500) {
    r.status = 'generating'; r.progress = r.progress < 100 ? r.progress : 0;
    if (r.willFail === undefined) r.willFail = failNext();
    run(r, ms, () => {
      const sid = sidOf(r);
      if (r.willFail) {
        r.status = 'failed'; delete r.willFail;
        notify({ kind: 'failed', title: { k: 'notice/failed', v: { type: r.type } }, body: { k: 'notice/failed-d' }, sid, rid: r.id });
        return;
      }
      delete r.willFail;
      r.status = r.qty === 'set' ? 'sample' : 'done';
      if (!r.free) pay(PRICE, r.payKind || (r.qty === 'set' ? 'sample' : 'one'), { type: r.type }, sid, r.id);
      r.free = false; r.payKind = null;
      const k = r.qty === 'set' ? 'notice/sample-done' : 'notice/one-done';
      notify({ kind: 'done', title: { k, v: { type: r.type } }, body: r.prompt, sid, rid: r.id });
    });
  }
  // 一套「生成其余」：从 fromDone 继续，完成时按实际成功数扣点
  function startRest(r, fromDone, resume) {
    const m = N(r) - 1;
    if (!resume) { r.status = 'setProgress'; r.restFrom = fromDone; r.progress = Math.round((fromDone / m) * 100); r.fails = []; r.willFail = failNext(); }
    const willFail = !!r.willFail;
    run(r, Math.max(1500, 6000 * (1 - fromDone / m)), () => {
      const sid = sidOf(r);
      const fails = willFail ? failSlots(r).filter((i) => i > fromDone) : [];
      const ok = m - fromDone - fails.length;
      pay(ok * PRICE, 'rest', { type: r.type, n: ok }, sid, r.id);
      r.status = 'doneSet'; r.fails = fails; delete r.willFail;
      if (fails.length) notify({ kind: 'partial', title: { k: 'notice/partial', v: { type: r.type, d: m - fails.length, n: m, f: fails.length } }, body: r.prompt, sid, rid: r.id });
      else notify({ kind: 'done', title: { k: 'notice/set-done', v: { type: r.type, n: N(r) } }, body: r.prompt, sid, rid: r.id });
    });
  }
  window.startGeneration = function () {
    const c = S.c;
    const prompt = c.prompt.trim();
    const r = rec({ prompt, model: c.model, type: c.type, quality: c.quality, qty: c.qty, status: 'generating', progress: 0, tone: c.color === 'follow' ? 'blue' : c.color, custom: c.custom.slice(), seed: Math.floor(Math.random() * 10) });
    r.willFail = failNext(prompt);
    let s = S.route === 'workbench' && S.routeArg !== 'new' ? sess(S.activeSession) : null;
    if (!s) { s = { id: 's' + Date.now(), title: `${typeLabel(c.type)} · ${prompt.slice(0, 12)}`, pinned: false, records: [] }; S.sessions.unshift(s); }
    s.records.push(r); S.activeSession = s.id; c.prompt = ''; c.ref = false;
    // 提交时不扣点，成功那一刻才扣（§0.4）
    startFirst(r);
    if (S.route !== 'workbench' || S.routeArg) window.go('workbench'); else window.render();
    scrollEnd();
    return false;
  };
  // 刷新前没跑完的记录接着跑（假数据 r12 开场前已扣，不再扣点）
  setTimeout(() => {
    for (const s of S.sessions) for (const r of s.records) {
      if (r.status === 'generating') { if (r.id === 'r12' && r.free) r.willFail = false; startFirst(r, r.id === 'r12' ? 6000 : 3500); }
      else if (r.status === 'setProgress') startRest(r, r.restFrom || 0, true);
      else if (r.status === 'filling') startFill(r);
    }
  }, 300);
  function scrollEnd() { setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 30); }

  // ---------- 记录上的操作 ----------
  A.dlOne = () => { window.toast(t('toast/png-started')); return false; };
  A.dlZip = () => { window.toast(t('toast/zip-started')); return false; };
  // 用作参考：把第 1 格图标画成 dataURL 放进创作框参考图格
  function glyphDataURL(r, i = 0) {
    const [a, b] = tone(r);
    const g = GLYPHS[(i + (r.seed || 0) + ((r.seeds || {})[i] || 0)) % GLYPHS.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(#g)"/><svg x="40" y="40" width="80" height="80" viewBox="0 0 256 256" fill="#fff">${window.PH[g] || ''}</svg></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function useRef(r, i) {
    const src = glyphDataURL(r, i);
    const name = window.I18N['composer/ref-from-rec'] ? t('composer/ref-from-rec') : 'icon.png';
    S.c.ref = src; S.c.refName = name; // A 的 S.c.ref 是 setter，直接给 dataURL
    window.toast(t(window.I18N['toast/ref-set'] ? 'toast/ref-set' : 'toast/ref-added'));
    if (S.route === 'workbench') scrollEnd();
  }
  A.useRef = (id) => { const r = findRec(id); if (r) useRef(r, 0); };
  A.approveSet = (id) => {
    const r = findRec(id); if (!r) return;
    const m = N(r) - 1;
    askCost({ title: t('rec/approve-title', { m }), body: t('rec/approve-body'), cost: m * PRICE, okLabel: t('rec/approve-ok', { m }), onOk: () => { if (r.status === 'sample') startRest(r, 0); window.render(); } });
  };
  // 重新生成（单个 / 一套完成 / 样板）：按钮已写费用，不弹确认；新记录追加到会话末尾
  A.regen = (id) => {
    const r = findRec(id); if (!r || !need(PRICE)) return;
    const s = sessOf(r);
    const n = Object.assign({}, r, { id: 'r' + ++rid, status: 'generating', progress: 0, day: 'today', seed: (r.seed || 0) + 3, fails: [], seeds: {}, payKind: 'regen', free: false, busy: null });
    delete n.willFail;
    s.records.push(n); startFirst(n); scrollEnd();
  };
  // 失败 / 已取消的单个、样板：原地重试
  A.recRetry = (id) => { const r = findRec(id); if (!r || !need(PRICE)) return; delete r.willFail; r.progress = 0; startFirst(r); S.dialog = null; S.sheet = null; S.viewer = null; };
  A.recDelete = (id) => {
    const r = findRec(id); if (!r) return;
    const s = sessOf(r), i = s.records.indexOf(r);
    stop(r); s.records.splice(i, 1);
    window.toast(t('toast/rec-deleted'), { ms: 5000, actionLabel: t('ed/am-undo'), action: () => { if (!s.records.includes(r)) s.records.splice(Math.min(i, s.records.length), 0, r); } });
  };
  // 部分失败 → 补生成
  A.recFill = (id) => {
    const r = findRec(id); if (!r) return;
    const f = r.fails.length; if (!f || !need(f * PRICE)) return;
    r.status = 'filling'; r.progress = 0; r.willFail = failNext();
    startFill(r);
  };
  function startFill(r) {
    const f = r.fails.length, willFail = !!r.willFail;
    run(r, 2500, () => {
      delete r.willFail;
      const sid = sidOf(r);
      r.status = 'doneSet';
      if (willFail) { notify({ kind: 'failed', title: { k: 'notice/failed', v: { type: r.type } }, body: { k: 'notice/failed-d' }, sid, rid: r.id }); return; }
      pay(f * PRICE, 'fill', { type: r.type, n: f }, sid, r.id);
      r.fails = [];
      notify({ kind: 'done', title: { k: 'notice/set-done', v: { type: r.type, n: N(r) } }, body: r.prompt, sid, rid: r.id });
    });
  }
  A.recResume = (id) => { const r = findRec(id); if (!r) return; const left = N(r) - 1 - r.restDone; if (!need(left * PRICE)) return; startRest(r, r.restDone); };
  // WB-05 取消：单个 / 样板直接取消；一套其余先确认
  A.recCancel = (id) => {
    const r = findRec(id); if (!r) return;
    if (r.status === 'generating') { stop(r); r.status = 'cancelled'; r.progress = 0; delete r.willFail; return; }
    if (r.status === 'setProgress') { S.cancelRid = id; S.menu = null; if (isMob()) S.sheet = 'wbcancel'; else S.dialog = 'wbcancel'; }
  };
  A.recCancelOk = () => {
    S.dialog = null; S.sheet = null;
    const r = findRec(S.cancelRid); if (!r || r.status !== 'setProgress') return;
    stop(r);
    const done = restDoneNow(r), fresh = done - (r.restFrom || 0);
    pay(fresh * PRICE, 'rest', { type: r.type, n: fresh }, sidOf(r), r.id);
    r.status = 'setCancelled'; r.restDone = done;
  };

  // ---------- WB-03 查看大图 ----------
  const viewerOpen = () => !!S.viewer && (S.dialog === 'viewer' || S.sheet === 'viewer');
  const gridOpen = () => !!S.setGrid && (S.dialog === 'setgrid' || S.sheet === 'setgrid');
  window.openViewer = function (id, idx = 0, opts = {}) {
    const r = findRec(id); if (!r) return false;
    S.viewer = { rid: id, idx: +idx || 0, from: opts.from || null, back: opts.back || null };
    S.menu = null; S.drawer = false;
    if (isMob()) { S.dialog = null; S.sheet = 'viewer'; } else { S.sheet = null; S.dialog = 'viewer'; }
    window.render();
    return false;
  };
  A.viewTile = (arg) => {
    const [id, i, from] = String(arg).split(':');
    const r = findRec(id); if (!r) return false;
    return window.openViewer(id, +i, { from: from || null, back: gridOpen() ? 'setgrid' : null });
  };
  function closeViewer() {
    const back = S.viewer && S.viewer.back;
    S.viewer = null;
    if (back === 'setgrid' && S.setGrid) { if (isMob()) { S.dialog = null; S.sheet = 'setgrid'; } else { S.sheet = null; S.dialog = 'setgrid'; } }
    else { S.dialog = null; S.sheet = null; }
  }
  A.viewerClose = () => { closeViewer(); };
  function step(d) {
    const v = S.viewer, r = v && findRec(v.rid); if (!r) return;
    const list = viewList(r, v.from), p = list.indexOf(v.idx);
    const np = Math.max(0, Math.min(list.length - 1, (p < 0 ? 0 : p) + d));
    v.idx = list[np];
  }
  A.viewerStep = (d) => { step(+d); };
  A.viewerDl = () => { window.toast(t('toast/png-started')); return false; };
  A.viewerRef = () => { const v = S.viewer, r = v && findRec(v.rid); if (r) useRef(r, v.idx); };
  A.viewerGoChat = () => { const v = S.viewer, r = v && findRec(v.rid); if (r) window.openRecord(sidOf(r), r.id); return false; };
  // 重新生成这一个 / 重试失败格：该格转圈 → 换图（seed 变化）→ 扣 20
  A.viewerRegen = () => {
    const v = S.viewer, r = v && findRec(v.rid); if (!r) return;
    if (r.status === 'failed') { A.recRetry(r.id); return; }
    if (r.busy != null || !need(PRICE)) return;
    const i = v.idx, willFail = failNext();
    r.busy = i;
    setTimeout(() => {
      r.busy = null;
      const sid = sidOf(r);
      if (willFail) {
        if (!r.fails.includes(i) && r.qty === 'set') r.fails.push(i);
        notify({ kind: 'failed', title: { k: 'notice/failed', v: { type: r.type } }, body: { k: 'notice/failed-d' }, sid, rid: r.id });
      } else {
        r.seeds[i] = (r.seeds[i] || 0) + 5;
        r.fails = r.fails.filter((x) => x !== i);
        pay(PRICE, 'regen', { type: r.type }, sid, r.id);
      }
      window.render();
    }, 1500);
  };
  // 左右键切换；整套里打开的查看器按 Esc 先回到整套
  document.addEventListener('keydown', (e) => {
    if (!viewerOpen()) return;
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.closest('input,textarea')) { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); window.render(); }
    if (e.key === 'Escape' && S.viewer.back === 'setgrid') { e.stopImmediatePropagation(); closeViewer(); window.render(); }
  }, true);
  // 手机左右滑（> 40px）
  let tx = null;
  document.addEventListener('touchstart', (e) => { tx = e.target.closest && e.target.closest('.vw-swipe') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 40 && viewerOpen()) { step(dx < 0 ? 1 : -1); window.render(); } });

  function stageSize(r) {
    const ty = window.TYPES[r.type];
    let w = Math.round((280 * ty.w) / ty.h), h = 280;
    if (w > 320) { h = Math.round((320 * ty.h) / ty.w); w = 320; }
    return { w, h, ty };
  }
  function viewerHTML() {
    const v = S.viewer, r = findRec(v.rid);
    if (!r) return '';
    const mob = isMob();
    const list = viewList(r, v.from);
    if (!list.includes(v.idx)) v.idx = list[0] ?? 0;
    const p = Math.max(0, list.indexOf(v.idx)), n = Math.max(1, list.length);
    const fail = isFailIdx(r, v.idx), busy = r.busy === v.idx;
    const { w, h, ty } = stageSize(r);
    const [a, b] = tone(r);
    const g = GLYPHS[(v.idx + (r.seed || 0) + (r.seeds[v.idx] || 0)) % GLYPHS.length];
    const img = fail
      ? `<div class="vw-img is-fail" style="--vw-w:${w}px;--vw-ar:${ty.w}/${ty.h}">${ic('x-circle-fill')}<span>${t('wb/viewer-failed')}</span></div>`
      : `<div class="vw-img" style="--vw-w:${w}px;--vw-ar:${ty.w}/${ty.h}"><div class="glyph" style="background:linear-gradient(135deg,${a},${b})">${ic(g)}</div>${busy ? '<span class="tile-busy"><i class="wb-spin"></i></span>' : ''}</div>`;
    const title = t('wb/viewer-pos', { i: p + 1, n });
    const spec = `<div class="vw-spec caption">${t('wb/viewer-spec', { w: ty.w, h: ty.h, w2: ty.w * 2, h2: ty.h * 2 })}</div>`;
    const navBtn = (d, icn, dis) => `<button class="vw-nav ${d < 0 ? 'prev' : 'next'}" data-act="viewerStep" data-arg="${d}" ${dis ? 'disabled' : ''} aria-label="${d < 0 ? 'prev' : 'next'}">${ic(icn)}</button>`;
    const goChat = v.from === 'history' ? `<button class="btn btn-secondary" data-act="viewerGoChat">${ic('arrow-right', 'ic-16')}${window.I18N['hist/go-chat'] ? t('hist/go-chat') : t('nav/workbench')}</button>` : '';
    const acts = fail
      ? [`<button class="btn btn-primary" data-act="viewerRegen">${t('rec/retry', { c: PRICE })}</button>`, goChat].filter(Boolean)
      : [`<button class="btn btn-primary" data-act="viewerDl">${ic('download-simple', 'ic-16')}${t('rec/download')}</button>`,
        `<button class="btn btn-secondary" data-act="viewerRef">${ic('image', 'ic-16')}${t('rec/use-ref')}</button>`,
        `<button class="btn btn-secondary ${busy ? 'is-disabled' : ''}" data-act="viewerRegen">${ic('clock-counter-clockwise', 'ic-16')}${t('wb/regen-one', { c: PRICE })}</button>`, goChat].filter(Boolean);
    const actsHTML = `<div class="vw-acts n${acts.length}">${acts.join('')}</div>`;
    if (!mob) {
      return window.dialog(`<div class="dialog-head"><h3>${title}</h3><button class="ibtn ibtn-sm" data-act="viewerClose" aria-label="close">${ic('x', 'ic-16')}</button></div>
        <div class="vw-stage">${navBtn(-1, 'caret-left', p === 0)}${img}${navBtn(1, 'caret-right', p >= n - 1)}</div>${spec}${actsHTML}`, 'dialog-wide wb-viewer');
    }
    const pager = n <= 1 ? '' : n <= 10 ? `<div class="vw-dots">${list.map((_, k) => `<i class="${k === p ? 'is-on' : ''}"></i>`).join('')}</div>` : `<div class="vw-count caption">${p + 1} / ${n}</div>`;
    return `<div class="scrim" data-act="closeAll"></div><div class="sheet is-full wb-full wb-viewer" role="dialog">
      <header class="wbf-head"><button class="ibtn" data-act="viewerClose" aria-label="close">${ic('x')}</button><h3 class="ellipsis">${title}</h3><span class="wbf-sp"></span></header>
      <div class="wbf-body vw-swipe">${img}${spec}${pager}</div>
      <div class="wbf-foot">${actsHTML}</div></div>`;
  }

  // ---------- 整套面板 ----------
  A.openSetGrid = (id) => { if (!findRec(id)) return; S.setGrid = id; S.viewer = null; S.menu = null; if (isMob()) { S.dialog = null; S.sheet = 'setgrid'; } else { S.sheet = null; S.dialog = 'setgrid'; } };
  function setGridHTML(under) {
    const r = findRec(S.setGrid); if (!r) return '';
    const mob = isMob();
    const idx = r.status === 'doneSet' || r.status === 'filling' ? Array.from({ length: N(r) }, (_, i) => i) : doneIdx(r);
    const { ty } = stageSize(r);
    const grid = `<div class="set-grid" style="--set-ar:${ty.w}/${ty.h}" data-sk="setgrid">${idx.map((i) => glyphTile(r, i, { dl: !mob, zoom: !mob })).join('')}</div>`;
    const total = `<span class="caption muted">${t('wb/set-total', { n: idx.length })}</span>`;
    const dl = (cls) => `<button class="btn btn-primary ${cls}" data-act="dlZip">${ic('download-simple', 'ic-16')}${t('wb/set-dl-all')}</button>`;
    // 查看器叠在整套面板上时，面板不再画遮罩
    const scrim = under ? '' : '<div class="scrim" data-act="closeAll"></div>';
    if (!mob) {
      return `${scrim}<div class="dialog wb-setgrid ${under ? 'is-under' : ''}" role="dialog"><div class="dialog-head"><div class="sg-title"><h3 class="ellipsis" title="${esc(r.prompt)}">${esc(r.prompt)}</h3>${total}</div>${dl('btn-sm')}<button class="ibtn ibtn-sm" data-act="closeSetGrid" aria-label="close">${ic('x', 'ic-16')}</button></div>${grid}</div>`;
    }
    return `${scrim}<div class="sheet is-full wb-full wb-setgrid ${under ? 'is-under' : ''}" role="dialog">
      <header class="wbf-head"><button class="ibtn" data-act="closeSetGrid" aria-label="close">${ic('x')}</button><div class="sg-title"><h3 class="ellipsis">${esc(r.prompt)}</h3>${total}</div><span class="wbf-sp"></span></header>
      <div class="wbf-body">${grid}</div><div class="wbf-foot">${dl('btn-block')}</div></div>`;
  }
  A.closeSetGrid = () => { S.setGrid = null; S.dialog = null; S.sheet = null; };

  // ---------- 浮层 ----------
  function costBody(o) {
    const ok = afford(o.cost);
    return `<h3>${esc(o.title)}</h3>${o.body ? `<p class="muted" style="margin:8px 0 0">${esc(o.body)}</p>` : ''}
      <div class="wb-costcard"><div><span class="muted">${t('confirm/cost-label')}</span><b>${t('confirm/approx', { n: window.num(o.cost) })}</b></div>
      <div class="${ok ? '' : 'is-err'}"><span class="${ok ? 'muted' : ''}">${t('confirm/balance-label')}</span><span>${t('confirm/points', { n: window.num(S.credits || 0) })}</span></div></div>
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button>${ok ? `<button class="btn btn-primary" data-act="wbCostOk">${esc(o.okLabel || t('confirm/ok'))}</button>` : `<button class="btn btn-primary" data-act="wbTopup">${ic('credit-card', 'ic-16')}${t('confirm/topup')}</button>`}</div>`;
  }
  A.wbCostOk = () => { const o = pendingCost; pendingCost = null; S.dialog = null; S.sheet = null; if (o && o.onOk) o.onOk(); };
  A.wbTopup = () => { S.dialog = null; S.sheet = null; if (typeof window.openTopup === 'function') { window.openTopup(); return false; } window.comingSoon(); };
  function cancelBody() {
    const r = findRec(S.cancelRid); if (!r) return '';
    const m = N(r) - 1, d = restDoneNow(r);
    return `<h3>${t('rec/cancel-title')}</h3><p class="muted" style="margin:8px 0 0">${t('rec/cancel-body', { d, r: m - d })}</p>
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('rec/cancel-keep')}</button><button class="btn btn-danger" data-act="recCancelOk">${t('rec/cancel-ok')}</button></div>`;
  }

  window.wbOverlays = function () {
    let h = '';
    // 抽屉先画：抽屉里打开的会话面板 / 删除确认叠在抽屉上面（测试修复）
    if (S.drawer) h += `<div class="scrim" data-act="closeAll"></div><aside class="drawer ${S.drawerIn ? 'is-in' : ''}">
      <button class="nav" data-act="go" data-arg="home">${ic('house-fill')}${t('nav/home')}</button>
      <div class="sb-wb"><button class="nav" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}${t('nav/workbench')}</button></div>
      <button class="nav" data-act="go" data-arg="history">${ic('image-fill')}${t('nav/history')}</button>
      <div class="sb-tools"><label class="sb-search">${ic('magnifying-glass', 'ic-16')}<input data-input="sessSearch" value="${esc(S.sessSearch)}" placeholder="${esc(t('workbench/search-sessions'))}"></label><button class="ibtn ibtn-sm" style="color:var(--brand)" data-act="newChat" aria-label="${esc(t('nav/new-chat'))}">${ic('plus', 'ic-16')}</button></div>
      ${window.sessionList('drawer')}</aside>`;
    const delBody = `<h3>${t('confirm/delete-title')}</h3><p class="muted" style="margin:8px 0 0">${t('confirm/delete-body')}</p><div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-danger" data-act="sessDeleteOk">${t('menu/delete')}</button></div>`;
    if (S.dialog === 'del') h += window.dialog(delBody);
    if (S.sheet === 'del') h += window.sheet(delBody);
    if (S.sheet === 'sess') { const s = sess(S.sessSheet); if (s) h += window.sheet(`<div class="sheet-head"><h3 class="ellipsis">${esc(s.title)}</h3></div>${sessMenu(s, 'sheet')}`); }
    if ((S.dialog === 'wbcost' || S.sheet === 'wbcost') && pendingCost) h += isMob() ? window.sheet(costBody(pendingCost)) : window.dialog(costBody(pendingCost));
    if (S.dialog === 'wbcancel' || S.sheet === 'wbcancel') { const b = cancelBody(); if (b) h += isMob() ? window.sheet(b) : window.dialog(b); }
    if (gridOpen()) h += setGridHTML(false);
    if (viewerOpen()) { if (S.viewer.back === 'setgrid' && S.setGrid) h += setGridHTML(true); h += viewerHTML(); }
    return h;
  };

  // ---------- 定位到记录（SH-01 流水、SH-02 通知、历史生成「去对话」） ----------
  window.openRecord = function (sid, recId) {
    S.menu = null; S.sheet = null; S.dialog = null; S.drawer = false; S.viewer = null; S.setGrid = null;
    if (sess(sid)) S.activeSession = sid;
    S.flash = recId && findRec(recId) ? recId : null; S.flashScroll = true;
    if (S.route === 'workbench' && !S.routeArg) window.render(); else window.go('workbench');
    return false;
  };
  window.AFTER_RENDER.push(() => {
    if (!S.flashScroll || S.route !== 'workbench') return;
    S.flashScroll = false;
    if (!S.flash) { window.scrollTo(0, document.body.scrollHeight); return; }
    const id = S.flash, el = document.getElementById('rec-' + id);
    if (el) el.scrollIntoView({ block: 'center' });
    setTimeout(() => { if (S.flash === id) S.flash = null; const n = document.getElementById('rec-' + id); if (n) n.classList.remove('is-flash'); }, 1000);
  });

  // ---------- 页面 ----------
  window.VIEWS.workbench = function () {
    const isNew = S.routeArg === 'new' || !sess(S.activeSession);
    const s = isNew ? null : sess(S.activeSession);
    let feed;
    if (isNew) {
      feed = `<div class="wb-empty"><img src="assets/logo-orb.webp" alt=""><h2>${t('workbench/empty-title')}</h2><p class="muted" style="margin:0">${t('workbench/empty-hint')}</p></div>`;
    } else {
      const groups = ['yesterday', 'today'].map((d) => ({ d, rs: s.records.filter((r) => r.day === d) })).filter((g) => g.rs.length);
      feed = `<div class="feed">${groups.map((g) => `<div class="day">${t('ws/' + g.d)}</div>${g.rs.map(recordView).join('')}`).join('')}</div>`;
    }
    const title = isNew ? t('nav/new-chat') : t('nav/workbench');
    const mTop = `<header class="m-topbar wb-bar"><button class="ibtn" data-act="openDrawer" aria-label="menu">${ic('sidebar-simple')}</button><h1>${esc(title)}</h1><button class="ibtn" data-act="newChat" aria-label="${esc(t('nav/new-chat'))}">${ic('plus')}</button></header>`;
    // SH-04：平板（600–1199）顶栏最左侧的历史抽屉按钮
    const tablet = !isMob() && window.bp() !== 'desktop';
    const topLead = tablet ? drawerBtn() : '';
    const inner = `<div class="wb">${feed}<div class="dock">${window.composer('wb')}</div></div>`;
    return window.shell(inner, { mTop, noTab: true, solid: true, cls: 'is-wb', topLead });
  };
  const drawerBtn = () => `<button class="ibtn ibtn-secondary wb-drawer-btn" data-act="openDrawer" title="${esc(t('wb/history-drawer'))}" aria-label="${esc(t('wb/history-drawer'))}">${ic('sidebar-simple')}</button>`;
  // shell() 还不支持 opts.topLead 时，自己插到桌面顶栏最前
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'workbench' || isMob() || window.bp() === 'desktop') return;
    const bar = document.querySelector('.topbar.desk');
    if (bar && !bar.querySelector('.wb-drawer-btn')) bar.insertAdjacentHTML('afterbegin', drawerBtn());
  });

  // ---------- 导出给其它页面 ----------
  window.glyphTile = glyphTile;
  window.WB = { findRec, sessOf, doneIdx, viewList, typeLabel, glyphDataURL };
})();
