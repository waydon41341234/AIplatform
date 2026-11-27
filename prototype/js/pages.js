/* 第五轮 D：新页面（NP-01 模板、NP-02 我的项目、NP-03 历史生成、NP-04 我的、NP-05 充值·模拟）。
 * 依赖 A（core/home）：PROJECTS、TEMPLATES、projectCard、templateCard、openTplPreview、openNewProject、openTopup、pushNotice、S.ledger、pageOverlays 钩子；
 * 依赖 B（workbench）：openViewer、openRecord、glyphTile。都先判断是否存在，没有就用本文件的简化实现兜底。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (k, v) => window.t(k, v), esc = (s) => window.esc(s), num = (n) => window.num(n), ic = (n, c) => window.ic(n, c);
  const mob = () => window.isMobile();

  // A 的图标（question-fill 等）还没合入时兜底，已存在的不覆盖
  const PH_FB = {
    'question-fill': '<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,168a12,12,0,1,1,12-12A12,12,0,0,1,128,192Zm8-48.72V144a8,8,0,0,1-16,0v-8a8,8,0,0,1,8-8c13.23,0,24-9,24-20s-10.77-20-24-20-24,9-24,20v4a8,8,0,0,1-16,0v-4c0-19.85,17.94-36,40-36s40,16.15,40,36C168,125.38,154.24,139.93,136,143.28Z"/>',
    'sign-out-fill': '<path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40A8,8,0,0,0,176,88v32H112a8,8,0,0,0,0,16h64v32a8,8,0,0,0,13.66,5.66l40-40A8,8,0,0,0,229.66,122.34Z"/>',
    'circle-notch': '<path d="M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128Z"/>',
    'receipt-fill': '<path d="M216,40H40A16,16,0,0,0,24,56V208a8,8,0,0,0,11.58,7.15L64,200.94l28.42,14.21a8,8,0,0,0,7.16,0L128,200.94l28.42,14.21a8,8,0,0,0,7.16,0L192,200.94l28.42,14.21A8,8,0,0,0,232,208V56A16,16,0,0,0,216,40ZM176,144H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm0-32H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z"/>',
  };
  for (const k in PH_FB) if (!window.PH[k]) window.PH[k] = PH_FB[k];

  // ---------- 页面状态 ----------
  S.pg = { tplQ: '', tplF: 'all', tplLv: 'all', tplReady: false, projF: 'all', projSort: 'recent', projSel: null, renVal: '', histF: 'all', ledF: 'all', ledN: 10, tier: null, custom: '', pay: 'idle', paidN: 0, scrollTo: null, prev: null };

  // ---------- 兜底：流水 / 充值入口（A 的 core.js 先加载，已定义就不动）----------
  if (!Array.isArray(S.ledger)) S.ledger = [];
  if (!window.openTopup) window.openTopup = () => { S.returnTo = location.hash; S.menu = null; S.sheet = null; S.dialog = null; window.go('recharge'); };

  // ---------- 数据 ----------
  const TPL_EXTRA = [
    { k: 'classic-blue', meta: 'standard', f: 'classic' }, { k: 'midnight-gold', meta: 'pro', f: 'dark' }, { k: 'fresh-green', meta: 'standard', f: 'minimal' },
    { k: 'western-white', meta: 'standard', f: 'western' }, { k: 'festive-red', meta: 'pro', f: 'festive' },
    { k: 'ocean-blue', meta: 'standard', f: 'classic' }, { k: 'black-gold', meta: 'pro', f: 'dark' }, { k: 'spring-red', meta: 'pro', f: 'festive' },
    { k: 'mini-gray', meta: 'standard', f: 'minimal' }, { k: 'western-blue', meta: 'standard', f: 'western' },
  ];
  // 缩略图兜底配色（A 的 templateCard 就绪后不用）
  const TPL_TONE = { 'classic-blue': ['#1678ff', '#06b0ea'], 'midnight-gold': ['#2b2620', '#c9963b'], 'fresh-green': ['#10b26c', '#7be0b0'], 'western-white': ['#e9edf5', '#1678ff'], 'festive-red': ['#d8282f', '#f2c14e'], 'ocean-blue': ['#0b4fa8', '#3fc6f0'], 'black-gold': ['#111111', '#d4a640'], 'spring-red': ['#b5121b', '#ff8a3d'], 'mini-gray': ['#8e8e93', '#e5e5ea'], 'western-blue': ['#1e2f6b', '#4d8dff'] };
  function templates() {
    const base = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];
    const out = [], seen = {};
    base.concat(TPL_EXTRA).forEach((x) => { if (x && x.k && !seen[x.k]) { seen[x.k] = 1; out.push(x); } });
    return out;
  }
  const PROJ_BASE = [
    { name: '星河体育 · 首页', st: 'designing', time: 'time/2h', tone: 'blue' }, { name: '金冠娱乐 · H5', st: 'exported', time: 'time/yesterday', tone: 'gold' },
    { name: '蓝鲸平台 · 春节版', st: 'designing', time: 'time/3d', tone: 'blue' }, { name: 'Lucky Star · Home', st: 'exported', time: 'time/3d', tone: 'purple' },
    { name: '悦动 · 新版首页', st: 'designing', time: 'time/3d', tone: 'green' }, { name: '星耀 · 活动页', st: 'designing', time: 'time/3d', tone: 'purple' },
  ];
  const PROJ_EXTRA = [{ name: '海浪娱乐 · 首页', st: 'designing', time: 'time/5d', tone: 'blue' }, { name: 'Golden Bay · H5', st: 'exported', time: 'time/1w', tone: 'gold' }];
  let localProjects = null, pid = 0;
  // 优先用 A 导出的 PROJECTS（同一个数组，首页同步变化），首次补上 2 个
  function projects() {
    let arr = Array.isArray(window.PROJECTS) ? window.PROJECTS : (localProjects || (localProjects = window.LS.get('pg.projects', null) || PROJ_BASE.map((p) => Object.assign({}, p))));
    // pgId 唯一（LS 里带回来的也算进计数，避免撞号）
    const seen = new Set();
    arr.forEach((p) => { const m = /^p(\d+)$/.exec(p.pgId || ''); if (m) pid = Math.max(pid, +m[1]); });
    arr.forEach((p) => { if (!p.pgId || seen.has(p.pgId)) p.pgId = 'p' + ++pid; seen.add(p.pgId); });
    return arr;
  }
  // 首次（LS 里还没有项目列表）补上 2 个假数据；之后增删都以 LS 为准，删掉的不会再冒出来
  if (window.LS.get(Array.isArray(window.PROJECTS) ? 'projects' : 'pg.projects', null) == null) {
    const arr = projects();
    PROJ_EXTRA.forEach((x) => { if (!arr.some((p) => p.name === x.name)) arr.push(Object.assign({}, x)); });
    saveProjects();
  }
  const projById = (id) => projects().find((p) => p.pgId === id);
  // 项目增删改：A 在 AFTER_RENDER 里把 window.PROJECTS 存进 LS('projects')；A 没接上时本地兜底也存一份
  function saveProjects() { if (!Array.isArray(window.PROJECTS)) window.LS.set('pg.projects', localProjects); }

  // 历史生成：从工作台会话里收集已完成的图标
  function failedSet(r) {
    const f = r.failed || r.fails || r.failIdx;
    if (!f) return null;
    return f instanceof Set ? f : new Set(Array.isArray(f) ? f : Object.keys(f).map(Number));
  }
  function doneIdx(r) {
    if (window.WB && window.WB.doneIdx) return window.WB.doneIdx(r); // B：失败格、取消、进行中都已处理
    const st = String(r.status || '');
    if (/fail|cancel|error|generating/i.test(st) && st !== 'doneSet') { if (!/partial/i.test(st)) return []; }
    const ty = (window.TYPES || {})[r.type] || { n: 1 };
    let n = 0;
    if (st === 'done' || st === 'sample') n = 1;
    else if (st === 'doneSet' || /partial/i.test(st)) n = ty.n;
    else if (st === 'setProgress') n = 1 + Math.round(((r.progress || 0) / 100) * (ty.n - 1));
    else if (st === 'cancelled' || st === 'canceled') n = r.doneCount || 0;
    const fs = failedSet(r);
    const out = [];
    for (let i = 0; i < n; i++) if (!fs || !fs.has(i)) out.push(i);
    return out;
  }
  function historyItems() {
    const items = [];
    (S.sessions || []).forEach((s) => (s.records || []).forEach((r, ri) => {
      doneIdx(r).forEach((i) => items.push({ s, r, i, ri }));
    }));
    return items;
  }
  const dayOf = (r) => (r.day === 'today' || r.day === 'yesterday' ? r.day : 'earlier');

  // ---------- 小组件 ----------
  const GLYPHS = ['house-fill', 'game-controller-fill', 'heart-fill', 'gift-fill', 'trophy-fill', 'crown-fill', 'ticket-fill', 'headset-fill', 'stack-fill', 'toolbox-fill', 'sparkle-fill', 'user-circle-fill', 'bell-fill', 'wallet-fill', 'squares-four-fill', 'magic-wand-fill'];
  const TONES = { blue: ['#1e46f0', '#06b0ea'], gold: ['#a8741f', '#f2c14e'], green: ['#0b8f57', '#3fd28f'], purple: ['#5b2fd6', '#c86bff'] };
  function tile(r, i) {
    if (window.glyphTile) return window.glyphTile(r, i, { sm: true, view: false });
    const [a, b] = r.tone === 'custom' && r.custom ? [r.custom[0], r.custom[2]] : (TONES[r.tone] || TONES.blue);
    return `<div class="tile is-sm"><div class="glyph" style="background:linear-gradient(135deg,${a},${b})">${ic(GLYPHS[(i + (r.seed || 0)) % GLYPHS.length])}</div></div>`;
  }
  const head = (title, sub, right = '') => `<div class="pg-head"><div class="pg-head-t"><h1>${esc(title)}</h1>${sub ? `<p class="muted">${esc(sub)}</p>` : ''}</div>${right}</div>`;
  const emptyBox = (icon, title, btn) => `<div class="pg-empty">${window.empty(icon, title, '', btn)}</div>`;
  const viewAllBtn = (act) => `<button class="btn btn-secondary btn-sm" data-act="${act}">${t('common/view-all')}</button>`;
  const segCount = (label, n) => `${esc(label)}<span class="pg-n">${num(n)}</span>`;
  // 下拉：电脑往下弹 menu，手机走底部面板
  function dropBtn(id, label, icon, cls = '') {
    const open = S.menu === id || S.sheet === id;
    return `<button class="chip pg-drop ${cls} ${open ? 'is-open' : ''}" aria-label="${esc(label)}" data-act="${mob() ? 'pgSheet' : 'menu:toggle'}" data-arg="${id}">${icon ? ic(icon, 'ic-16') : ''}<span class="ellipsis">${esc(label)}</span>${ic('caret-down', 'ic-16 chev')}</button>`;
  }
  const deskMenu = (id, body, cls = '') => (!mob() && S.menu === id ? `<div class="menu pg-menu ${cls}">${body}</div>` : '');

  // 浮层：A 在 overlays() 里调用 pageOverlays()；还没接上时由本文件在页面末尾补
  let ovCalls = 0;
  function page(inner, opts) {
    const before = ovCalls;
    let h = window.shell(inner, Object.assign({ solid: true }, opts || {}));
    if (ovCalls === before) h += window.pageOverlays();
    return h;
  }

  // ======================================================================
  // NP-01 模板
  // ======================================================================
  const LV_OPTS = () => [['all', t('pg/level-all')], ['standard', t('level/standard-title')], ['pro', t('level/pro-title')]];
  function tplCardHtml(x) {
    if (window.templateCard) return window.templateCard(x);
    const [a, b] = TPL_TONE[x.k] || TPL_TONE['classic-blue'];
    return `<button class="card" data-act="pgTpl" data-arg="${x.k}"><div class="cover r-3x4 pg-thumb" style="--a:${a};--b:${b}"><i></i><i></i><i></i><i></i></div><div class="card-title"><span class="ellipsis" title="${esc(t('template/' + x.k))}">${esc(t('template/' + x.k))}</span></div><div class="caption faint">${t('template/meta-' + x.meta)}</div></button>`;
  }
  function viewTemplates() {
    const P = S.pg;
    const q = P.tplQ.trim().toLowerCase();
    const all = templates();
    const list = all.filter((x) => (P.tplF === 'all' || x.f === P.tplF) && (P.tplLv === 'all' || x.meta === P.tplLv) && (!q || t('template/' + x.k).toLowerCase().includes(q) || x.k.includes(q)));
    if (window.templateCard) P.tplReady = true; // A 的卡片自带 HM-02 骨架
    if (!P.tplReady && !P.tplTimer) P.tplTimer = setTimeout(() => { P.tplReady = true; if (S.route === 'templates') window.render(); }, 600);
    const search = `<label class="tb-search pg-search">${ic('magnifying-glass', 'ic-16')}<input data-input="pgTplQ" value="${esc(P.tplQ)}" placeholder="${esc(t('pg/search'))}" aria-label="${esc(t('pg/search'))}">${P.tplQ ? `<button class="ibtn ibtn-sm" data-act="pgTplClear" aria-label="${esc(t('pg/clear-search'))}">${ic('x', 'ic-16')}</button>` : ''}</label>`;
    const lvLabel = LV_OPTS().find((o) => o[0] === P.tplLv)[1];
    const lvBody = LV_OPTS().map(([v, l]) => `<button class="menu-item ${P.tplLv === v ? 'is-on' : ''}" data-act="pgTplLv" data-arg="${v}">${esc(l)}</button>`).join('');
    const filters = `<div class="pg-filters"><div class="filters scroll-x" data-sk="pg-tplf">${['all', 'classic', 'western', 'minimal', 'dark', 'festive'].map((f) => `<button class="chip ${P.tplF === f ? 'is-on' : ''}" data-act="pgTplF" data-arg="${f}">${t('filter/' + f)}</button>`).join('')}</div>
      <div class="rel pg-drop-wrap">${dropBtn('pg-level', lvLabel, mob() ? 'funnel-simple' : '')}${deskMenu('pg-level', lvBody)}</div></div>`;
    let body;
    if (!P.tplReady) body = `<div class="pg-grid">${all.map(() => `<div class="card"><div class="cover r-3x4 skeleton"></div><div class="pg-sk-line skeleton"></div><div class="pg-sk-line is-short skeleton"></div></div>`).join('')}</div>`;
    else if (!list.length) body = q ? emptyBox('magnifying-glass', t('pg/none', { q: P.tplQ.trim() }), `<button class="btn btn-secondary btn-sm" data-act="pgTplClear">${t('pg/clear-search')}</button>`) : emptyBox('squares-four-fill', t('home/tpl-empty'), viewAllBtn('pgTplAll'));
    else body = `<div class="pg-grid">${list.map(tplCardHtml).join('')}</div>`;
    return page(`<main class="page pg">${head(t('nav/templates'), t('pg/templates-sub'), search)}${filters}${body}</main>`);
  }
  I.pgTplQ = (v) => { S.pg.tplQ = v; return true; };
  A.pgTplClear = () => { S.pg.tplQ = ''; };
  A.pgTplF = (f) => { S.pg.tplF = f; };
  A.pgTplLv = (v) => { S.pg.tplLv = v; S.menu = null; S.sheet = null; };
  A.pgTplAll = () => { S.pg.tplF = 'all'; S.pg.tplLv = 'all'; };
  A.pgTpl = (k) => {
    if (window.openTplPreview) window.openTplPreview(k);
    else if (window.openNewProject) window.openNewProject({ template: k });
    else { window.openEditor({ template: k }); return false; }
  };
  A.pgSheet = (id) => { S.sheet = id; S.menu = null; };

  // ======================================================================
  // NP-02 我的项目
  // ======================================================================
  function projCardHtml(p) {
    const card = window.projectCard ? window.projectCard(p)
      : `<button class="card" data-act="pgOpenProj" data-arg="${p.pgId}"><div class="cover r-5x6 pg-thumb is-proj" style="--a:${(window.PALETTES || {})[p.tone] ? window.PALETTES[p.tone][0] : '#1678ff'};--b:${(window.PALETTES || {})[p.tone] ? window.PALETTES[p.tone][3] : '#333'}"><i></i><i></i><i></i><i></i><span class="level-tag"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span></div><div class="card-title"><span class="ellipsis" title="${esc(p.name)}">${esc(p.name)}</span><span class="pill-tag ${p.st === 'exported' ? 'is-ok' : ''}">${t('status/' + p.st)}</span></div><div class="caption faint">${t(p.time)}</div></button>`;
    const mid = 'pg-proj:' + p.pgId;
    if (S.pg.msel) { const on = S.pg.msel.includes(p.pgId); return `<div class="pg-pcard is-msel ${on ? 'is-picked' : ''}">${card}<button class="pg-pick" data-act="pgMselT" data-arg="${p.pgId}" aria-pressed="${on}" aria-label="${esc(p.name)}"><span class="check ${on ? 'is-on' : ''}">${on ? ic('check', 'ic-16') : ''}</span></button></div>`; }
    const open = S.menu === mid || (S.sheet === 'pg-proj' && S.pg.projSel === p.pgId);
    return `<div class="pg-pcard ${open ? 'is-open' : ''}">${card}<button class="pg-more" data-act="${mob() ? 'pgProjSheet' : 'menu:toggle'}" data-arg="${mob() ? p.pgId : mid}" aria-label="more">${ic('dots-three', 'ic-16')}</button>${deskMenu(mid, projMenuItems(p), 'pg-pmenu')}</div>`;
  }
  const projMenuItems = (p) => `<button class="menu-item" data-act="pgRename" data-arg="${p.pgId}">${ic('pencil-simple')}${t('proj/rename')}</button>
    <button class="menu-item" data-act="pgDup" data-arg="${p.pgId}">${ic('copy')}${t('proj/duplicate')}</button><div class="menu-sep"></div>
    <button class="menu-item is-danger" data-act="pgDel" data-arg="${p.pgId}">${ic('trash')}${t('proj/delete')}</button>`;
  function viewProjects() {
    const P = S.pg, all = projects();
    const cnt = (f) => all.filter((p) => f === 'all' || p.st === f).length;
    let list = all.filter((p) => P.projF === 'all' || p.st === P.projF);
    if (P.projSort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, S.lang));
    const selBtn = all.length ? `<button class="btn btn-secondary ${mob() ? 'btn-sm' : ''}" data-act="pgMselOn">${ic('check-square-fill', 'ic-16')}${t('proj/select')}</button>` : '';
    const newBtn = `<div class="pg-head-btns">${selBtn}<button class="btn btn-primary ${mob() ? 'btn-sm' : ''}" data-act="pgNewProj">${ic('plus', 'ic-16')}${t('proj/new')}</button></div>`;
    const sortLabel = t(P.projSort === 'name' ? 'proj/sort-name' : 'proj/sort-recent');
    const sortBody = ['recent', 'name'].map((v) => `<button class="menu-item ${P.projSort === v ? 'is-on' : ''}" data-act="pgSort" data-arg="${v}">${t('proj/sort-' + v)}</button>`).join('');
    const filters = `<div class="pg-filters"><div class="scroll-x pg-seg-wrap" data-sk="pg-projf">${window.seg(['all', 'designing', 'exported'].map((v) => ({ v, html: segCount(t(v === 'all' ? 'filter/all' : 'status/' + v), cnt(v)) })), P.projF, 'pgProjF', 'pg-seg')}</div>
      <div class="rel pg-drop-wrap">${dropBtn('pg-sort', sortLabel, 'arrows-down-up', 'is-icon-m')}${deskMenu('pg-sort', sortBody)}</div></div>`;
    let body;
    if (!all.length) body = emptyBox('folder-fill', t('proj/empty'), `<button class="btn btn-primary btn-sm" data-act="pgNewProj">${ic('plus', 'ic-16')}${t('proj/new')}</button>`);
    else if (!list.length) body = emptyBox('folder-fill', t('proj/empty-filter', { st: t('status/' + P.projF) }), viewAllBtn('pgProjAll'));
    else body = `<div class="pg-grid">${list.map(projCardHtml).join('')}</div>`;
    // 多选模式：顶部换成工具条（已选 N · 全选 / 全不选 · 删除 · 取消），手机删除栏固定在底部
    if (P.msel) {
      P.msel = P.msel.filter((id) => all.some((p) => p.pgId === id));
      const n = P.msel.length, allOn = list.length && list.every((p) => P.msel.includes(p.pgId));
      const bar = `<div class="pg-mbar"><b>${t('proj/selected-n', { n })}</b><span class="pg-mbar-sp"></span>
        <button class="btn btn-ghost btn-sm" data-act="pgMselAll" data-arg="${allOn ? 0 : 1}">${ic(allOn ? 'minus-square-fill' : 'check-square-fill', 'ic-16')}${t(allOn ? 'mp/ai-none' : 'mp/ai-all')}</button>
        <button class="btn btn-danger btn-sm ${n ? '' : 'is-disabled'}" data-act="pgMselDel">${ic('trash-fill', 'ic-16')}${t('proj/delete-n', { n })}</button>
        <button class="btn btn-secondary btn-sm" data-act="pgMselOff">${t('confirm/cancel')}</button></div>`;
      return page(`<main class="page pg is-msel">${head(t('nav/projects'), '', '')}${bar}${filters}${body}</main>`);
    }
    return page(`<main class="page pg">${head(t('nav/projects'), '', newBtn)}${filters}${body}</main>`);
  }
  // 多选删除（Waydon 2026-11-26）：选择 → 勾选 / 全选 → 删除 N 个（确认）→ 可撤销；取消 / Esc 退出
  A.pgMselOn = () => { S.pg.msel = []; S.menu = null; S.sheet = null; };
  A.pgMselOff = () => { S.pg.msel = null; };
  A.pgMselT = (id) => { const a = S.pg.msel; if (!a) return false; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); };
  A.pgMselAll = (v) => { const P = S.pg, vis = projects().filter((p) => P.projF === 'all' || p.st === P.projF).map((p) => p.pgId); P.msel = v === '1' ? Array.from(new Set(P.msel.concat(vis))) : P.msel.filter((id) => !vis.includes(id)); };
  A.pgMselDel = () => { if (!S.pg.msel || !S.pg.msel.length) return false; if (mob()) S.sheet = 'pg-mdel'; else S.dialog = 'pg-mdel'; };
  A.pgMselDelOk = () => {
    const arr = projects(), ids = S.pg.msel || [];
    const removed = arr.map((p, i) => ({ p, i })).filter((x) => ids.includes(x.p.pgId));
    for (let k = removed.length - 1; k >= 0; k--) arr.splice(removed[k].i, 1);
    saveProjects(); S.dialog = null; S.sheet = null; S.pg.msel = null;
    window.toast(t('proj/deleted-n', { n: removed.length }), { ms: 6000, actionLabel: t('ed/am-undo'), action: () => { removed.forEach((x) => { if (!arr.includes(x.p)) arr.splice(Math.min(x.i, arr.length), 0, x.p); }); saveProjects(); window.render(); } });
  };
  A.pgProjF = (v) => { S.pg.projF = v; };
  A.pgProjAll = () => { S.pg.projF = 'all'; };
  A.pgSort = (v) => { S.pg.projSort = v; S.menu = null; S.sheet = null; };
  A.pgNewProj = () => { if (window.openNewProject) window.openNewProject({}); else { window.openEditor(); return false; } };
  A.pgOpenProj = (id) => { const p = projById(id); window.openEditor(p ? { name: p.name, status: p.st, palette: p.tone } : undefined); return false; };
  A.pgProjSheet = (id) => { S.pg.projSel = id; S.sheet = 'pg-proj'; S.menu = null; };
  A.pgRename = (id) => { const p = projById(id); if (!p) return; S.pg.projSel = id; S.pg.renVal = p.name; S.menu = null; S.sheet = null; if (mob()) S.sheet = 'pg-rename'; else S.dialog = 'pg-rename'; };
  I.pgRenVal = (v) => { const was = !S.pg.renVal.trim(); S.pg.renVal = v; return was !== !v.trim(); };
  A.pgRenKey = (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); A.pgRenOk(); return true; } };
  // 编辑器的设计 / 状态 / 导出记录按项目名存 LS（ed.d. / ed.st. / ed.x.）：改名时搬过去，复制时拷一份（测试修复）
  const ED_KEYS = ['ed.d.', 'ed.st.', 'ed.x.'];
  function edData(from, to, move) {
    ED_KEYS.forEach((k) => { const v = window.LS.get(k + from, null); if (v != null) { window.LS.set(k + to, v); if (move) { try { localStorage.removeItem('proto.' + k + from); } catch (e) { /* noop */ } } } });
    if (move && window.LS.get('ed.last', null) === from) window.LS.set('ed.last', to);
  }
  const nameTaken = (v, self) => projects().some((p) => p !== self && p.name === v);
  A.pgRenOk = () => {
    const p = projById(S.pg.projSel), v = S.pg.renVal.trim();
    if (!v) return false;
    if (p && v !== p.name) {
      if (nameTaken(v, p)) { window.toast(t('ed/name-taken'), { info: true }); return false; }
      const old = p.name; p.name = v; edData(old, v, true); saveProjects(); window.toast(t('proj/renamed'));
      // 编辑器内存里还是旧名（正开着这个项目时），下次打开按新名读
      if (window.E && window.E.name === old) window.E.name = v;
    }
    S.dialog = null; S.sheet = null;
  };
  A.pgDup = (id) => {
    const arr = projects(), i = arr.findIndex((p) => p.pgId === id); if (i < 0) return;
    // 副本名不重复：X 副本、X 副本 2、X 副本 3…
    let name = t('proj/copy-suffix', { name: arr[i].name }), k = 2;
    const base = name; while (nameTaken(name)) name = base + ' ' + k++;
    const c = Object.assign({}, arr[i], { name, st: 'designing', time: 'proj/just-now' });
    edData(arr[i].name, name, false); window.LS.set('ed.st.' + name, 'designing');
    delete c.pgId; arr.splice(i + 1, 0, c); projects(); saveProjects();
    S.menu = null; S.sheet = null; window.toast(t('proj/copied'));
  };
  A.pgDel = (id) => { S.pg.projSel = id; S.menu = null; S.sheet = null; if (mob()) S.sheet = 'pg-del'; else S.dialog = 'pg-del'; };
  A.pgDelOk = () => {
    const arr = projects(), i = arr.findIndex((p) => p.pgId === S.pg.projSel);
    S.dialog = null; S.sheet = null; if (i < 0) return;
    const [p] = arr.splice(i, 1); saveProjects();
    window.toast(t('proj/deleted'), { ms: 5000, actionLabel: t('ed/am-undo'), action: () => { if (!arr.includes(p)) { arr.splice(Math.min(i, arr.length), 0, p); saveProjects(); } window.render(); } });
  };

  // ======================================================================
  // NP-03 历史生成
  // ======================================================================
  const HTYPES = ['design', 'midnav', 'bottomnav', 'gametype']; // design：AI 首页设计（AD-02）
  const tileBtn = (it) => `<button class="pg-tile" data-act="pgView" data-arg="${it.s.id}|${it.r.id}|${it.i}" aria-label="${esc(t('composer/type-' + it.r.type))}">${tile(it.r, it.i)}</button>`;
  function viewHistory() {
    const P = S.pg, all = historyItems();
    const sessN = new Set(all.map((x) => x.s.id)).size;
    const list = all.filter((x) => P.histF === 'all' || x.r.type === P.histF);
    const filters = `<div class="pg-filters"><div class="scroll-x pg-seg-wrap" data-sk="pg-histf">${window.seg([{ v: 'all', label: t('filter/all') }].concat(HTYPES.map((v) => ({ v, label: t('composer/type-' + v) }))), P.histF, 'pgHistF', 'pg-seg')}</div></div>`;
    let body;
    if (!all.length) body = emptyBox('image-fill', t('hist/empty'), `<button class="btn btn-primary btn-sm" data-act="go" data-arg="workbench">${t('hist/go-wb')}</button>`);
    else if (!list.length) body = emptyBox('image-fill', t('hist/empty-filter', { type: t('composer/type-' + P.histF) }), viewAllBtn('pgHistAll'));
    else {
      body = ['today', 'yesterday', 'earlier'].map((d) => {
        // 组内新的在前：会话按列表顺序、记录倒序
        const g = list.filter((x) => dayOf(x.r) === d).sort((a, b) => (a.s === b.s ? b.ri - a.ri || a.i - b.i : 0));
        if (!g.length) return '';
        return `<section class="pg-day"><h2>${d === 'earlier' ? t('hist/earlier') : t('ws/' + d)}</h2><div class="pg-hgrid">${g.map(tileBtn).join('')}</div></section>`;
      }).join('');
    }
    return page(`<main class="page pg">${head(t('nav/history'), all.length ? t('hist/sub', { n: num(all.length), s: num(sessN) }) : '')}${all.length ? filters : ''}${body}</main>`);
  }
  A.pgHistF = (v) => { S.pg.histF = v; };
  A.pgHistAll = () => { S.pg.histF = 'all'; };
  A.pgView = (arg) => {
    const [sid, rid, idx] = String(arg).split('|');
    if (window.openViewer) return window.openViewer(rid, +idx, { from: 'history' });
    if (window.openRecord) return window.openRecord(sid, rid);
    S.activeSession = sid; window.go('workbench'); return false;
  };

  // ======================================================================
  // NP-04 我的
  // ======================================================================
  function typeName(v) { const k = 'composer/type-' + v; return window.I18N[k] ? t(k) : v; }
  function ledgerAmount(e) {
    if (typeof e.amount === 'number') return e.amount;
    if (typeof e.delta === 'number') return e.delta;
    if (typeof e.n === 'number') return e.kind === 'topup' ? e.n : -e.n;
    return 0;
  }
  function ledgerTitle(e) {
    if (window.ledgerTitle && !e.title) return window.ledgerTitle(e);
    if (e.title && !window.I18N[e.title]) return e.title;
    const vars = Object.assign({}, e.vars || {});
    if (vars.type) vars.type = typeName(vars.type);
    if (vars.n != null) vars.n = num(+vars.n || 0);
    return t(e.title || e.titleKey || 'credit/l-' + e.kind, vars);
  }
  function ledgerTime(e) {
    if (window.fmtTime && (e.at || (e.time && e.time.k))) return window.fmtTime(e);
    const x = e.time;
    if (!x) return '';
    if (typeof x === 'object') return t(x.key || x.k, { t: x.t || x.at || '' });
    return window.I18N[x] ? t(x, { t: e.at || '' }) : String(x);
  }
  function ledgerRow(e, i) {
    if (window.ledgerRow) return window.ledgerRow(e, i);
    const amt = ledgerAmount(e), up = amt > 0, link = !!e.sid;
    const inner = `<span class="pg-lic ${up ? 'is-up' : ''}">${ic(up ? 'wallet-fill' : 'magic-wand-fill', 'ic-16')}</span><span class="pg-lmid"><span class="ellipsis">${esc(ledgerTitle(e))}</span><span class="caption faint">${esc(ledgerTime(e))}</span></span><span class="pg-lamt ${up ? 'is-up' : ''}">${up ? '+' : '−'}${num(Math.abs(amt))}</span>${link ? ic('caret-right', 'ic-16 pg-chev') : ''}`;
    return link ? `<button class="pg-lrow is-link" data-act="pgLedger" data-arg="${i}">${inner}</button>` : `<div class="pg-lrow">${inner}</div>`;
  }
  const isUp = (e) => ledgerAmount(e) > 0;
  function meRow(icon, label, trail, act, arg, cls = '') {
    return `<button class="pg-row ${cls}" data-act="${act}" ${arg != null ? `data-arg="${arg}"` : ''}>${icon ? ic(icon, 'pg-row-ic') : ''}<span class="pg-row-l ellipsis">${esc(label)}</span>${trail ? `<span class="pg-row-t">${trail}</span>` : ''}${cls.includes('is-danger') ? '' : ic('caret-right', 'ic-16 pg-chev')}</button>`;
  }
  function viewMe() {
    const P = S.pg;
    const led = S.ledger || [];
    const spends = led.filter((e) => !isUp(e));
    const used = typeof S.monthUsed === 'number' ? S.monthUsed : spends.reduce((s, e) => s + Math.abs(ledgerAmount(e)), 0);
    const runs = typeof S.monthRuns === 'number' ? S.monthRuns : spends.length;
    const low = (S.credits || 0) < 100;
    const lf = led.map((e, i) => ({ e, i })).filter(({ e }) => P.ledF === 'all' || (P.ledF === 'topup' ? isUp(e) : !isUp(e)));
    const hist = historyItems();
    const recent = hist.slice().sort((a, b) => (dayOf(a.r) === dayOf(b.r) ? 0 : ['today', 'yesterday', 'earlier'].indexOf(dayOf(a.r)) - ['today', 'yesterday', 'earlier'].indexOf(dayOf(b.r)))).slice(0, 4);
    const langName = (window.LANGS.find((l) => l.code === S.lang) || {}).name || S.lang;
    const langBody = window.LANGS.map((l) => `<button class="menu-item ${S.lang === l.code ? 'is-on' : ''}" data-act="setLang" data-arg="${l.code}">${l.name}</button>`).join('');

    const sec1 = `<section class="pg-card pg-acct"><button class="pg-av-btn" data-act="avOpen" aria-label="${esc(t('me/av-title'))}" title="${esc(t('me/av-title'))}"><span class="avatar pg-av"></span><span class="pg-av-edit">${ic('pencil-simple')}</span></button><div class="pg-acct-i"><div class="pg-acct-n ellipsis">${t('account/name')}</div><div class="caption muted">${t('account/id', { n: '20488316' })}</div><span class="pg-badge"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span></div>
      <button class="btn btn-secondary btn-sm" data-act="soon">${t('me/edit-profile')}</button></section>`;
    const sec2 = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/balance')}</h2>
      <div class="pg-bal ${low ? 'is-low' : ''}">${ic('sparkle-fill', 'ic-24')}<b>${num(S.credits || 0)}</b><span class="muted">${t('credit/unit')}</span></div>
      <div class="pg-stats"><div>${t('credit/month-used', { n: num(used) })}</div><div>${t('credit/month-runs', { n: num(runs) })}</div></div>
      <button class="btn btn-primary btn-block" data-act="pgTopup">${ic('wallet-fill', 'ic-16')}${t('credit/topup')}</button>
      <div class="pg-led-head" id="me-ledger"><h3>${t('me/ledger')}</h3>${window.seg([{ v: 'all', label: t('filter/all') }, { v: 'spend', label: t('me/l-spend') }, { v: 'topup', label: t('me/l-topup') }], P.ledF, 'pgLedF', 'pg-seg')}</div>
      ${lf.length ? `<div class="pg-led">${lf.slice(0, P.ledN).map(({ e, i }) => ledgerRow(e, i)).join('')}</div>${lf.length > P.ledN ? `<button class="btn btn-ghost btn-sm btn-block" data-act="pgLedMore">${t('me/load-more')}</button>` : ''}`
        : `<div class="empty is-sm">${`<div class="ico">${ic('receipt-fill', 'ic-24')}</div><h3>${t('credit/empty')}</h3>`}</div>`}</section>`;
    const sec3 = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/work')}</h2>
      ${meRow('folder-fill', t('nav/projects'), esc(t('me/n-projects', { n: num(projects().length) })), 'go', 'projects')}
      ${meRow('image-fill', t('nav/history'), esc(t('me/n-icons', { n: num(hist.length) })), 'go', 'history')}
      ${recent.length ? `<div class="pg-recent">${recent.map(tileBtn).join('')}</div>` : ''}</section>`;
    const sec4 = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/prefs')}</h2>
      <div class="rel">${meRow('globe', t('nav/language'), esc(langName), mob() ? 'pgSheet' : 'menu:toggle', 'pg-lang', S.menu === 'pg-lang' ? 'is-open' : '')}${deskMenu('pg-lang', langBody, 'pg-lmenu')}</div>
      <div class="pg-row is-static">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill', 'pg-row-ic')}<span class="pg-row-l ellipsis">${t('account/appearance')}</span>${window.seg([{ v: 'light', label: t('nav/theme-light') }, { v: 'dark', label: t('nav/theme-dark') }], S.theme, 'setTheme', 'pg-seg')}</div></section>`;
    const sec5 = `<section class="pg-card"><h2 class="pg-sec-t">${t('me/help')}</h2>
      ${meRow('question-fill', t('account/help'), '', 'soon')}
      ${meRow('sign-out-fill', t('account/logout'), '', 'pgLogout', null, 'is-danger')}</section>`;
    return page(`<main class="page pg pg-me">${mob() ? '' : head(t('nav/me'), '')}${sec1}${sec2}${sec3}${sec4}${sec5}</main>`);
  }
  A.pgTopup = () => { window.openTopup(); return false; };
  A.pgLedF = (v) => { S.pg.ledF = v; S.pg.ledN = 10; };
  A.pgLedMore = () => { S.pg.ledN += 10; };
  A.pgLedger = (i) => {
    const e = (S.ledger || [])[+i]; if (!e || !e.sid) return false;
    if (window.openRecord) return window.openRecord(e.sid, e.rid);
    S.activeSession = e.sid; window.go('workbench'); return false;
  };
  A.pgLogout = () => { S.menu = null; if (mob()) S.sheet = 'pg-logout'; else S.dialog = 'pg-logout'; };
  A.pgLogoutOk = () => { S.dialog = null; S.sheet = null; window.toast(t('toast/logged-out'), { info: true }); };

  // ---------- 头像（11-27）：8 个 AI 默认头像 a1~a8 + 上传；按账号存，新账号默认 a1 ----------
  // 全站 .avatar（顶部栏、账户弹层、我的）都读根节点 CSS 变量 --av-img，所以只在这里设一次，不改各处模板
  const AVS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  const avAcct = () => (S.auth && S.auth.key) || 'default';
  const avCur = () => (window.LS.get('avatar', {}) || {})[avAcct()] || 'a1';
  const avSrc = (v) => (AVS.includes(v) ? `assets/avatars/${v}.webp` : v); // 给 <img src>：单文件版由 build-single 的 innerHTML 钩子换成内嵌数据
  const avCss = (v) => (AVS.includes(v) ? (window.A_ && window.A_[`avatars/${v}.webp`]) || new URL(avSrc(v), location.href).href : v); // CSS 变量里要绝对地址
  let avLast = null;
  function applyAvatar() {
    const v = avCur(); if (v === avLast) return; avLast = v;
    document.documentElement.style.setProperty('--av-img', `url("${avCss(v)}")`);
  }
  window.AFTER_RENDER.push(applyAvatar);
  applyAvatar();
  window.avatarOf = avCur; // 其他模块要用当前头像时读它：'a1'~'a8' 或业主上传的 dataURL
  A.avOpen = () => { S.menu = null; S.pg.avSel = avCur(); if (mob()) S.sheet = 'pg-av'; else S.dialog = 'pg-av'; };
  A.avPick = (k) => { if (AVS.includes(k)) S.pg.avSel = k; };
  A.avUpload = () => {
    window.pickImage({ accept: 'image/png,image/jpeg,image/webp', maxMB: 2 }, (src) => {
      // 居中裁成正方形、缩到 256，存得下也显示得快
      const im = new Image();
      im.onload = () => {
        const s = Math.min(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 256;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
        x.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 256, 256);
        try { S.pg.avSel = c.toDataURL('image/jpeg', 0.86); } catch (e) { S.pg.avSel = src; }
        window.render();
      };
      im.onerror = () => window.toast(t('composer/ref-bad-type'), { info: true });
      im.src = src;
    });
    return false;
  };
  A.avSave = () => {
    const v = S.pg.avSel;
    if (!v || v === avCur()) return false; // 没换：「保存」是灰的，点了不动
    S.dialog = null; S.sheet = null;
    const m = window.LS.get('avatar', {}) || {}; m[avAcct()] = v; window.LS.set('avatar', m);
    applyAvatar(); window.toast(t('me/av-saved'));
  };
  function avBody() {
    const sel = S.pg.avSel || avCur(), changed = sel !== avCur(), m = mob();
    const opt = (k, i) => `<button class="av-opt ${sel === k ? 'is-on' : ''}" data-act="avPick" data-arg="${k}" aria-pressed="${sel === k}" aria-label="${esc(t('me/av-n', { n: i + 1 }))}"><img src="assets/avatars/${k}.webp" alt="">${sel === k ? `<span class="av-ck">${ic('check')}</span>` : ''}</button>`;
    return `<div class="dialog-head sheet-head av-head"><h3>${t('me/av-title')}</h3><button class="ibtn ibtn-sm ibtn-secondary" data-act="closeAll" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>
      <div class="av-cur"><img class="av-pv" src="${esc(avSrc(sel))}" alt=""><div class="av-cur-t"><p>${t('me/av-hint')}</p><p class="caption faint">${t('me/av-rule')}</p></div></div>
      <div class="av-grid">${AVS.map(opt).join('')}</div>
      <div class="av-foot ${m ? 'is-m' : ''}"><button class="btn btn-secondary" data-act="avUpload">${ic('upload-simple', 'ic-16')}${t(m ? 'me/av-upload-m' : 'me/av-upload')}</button>${m ? '' : `<span class="av-sp"></span><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button>`}<button class="btn btn-primary ${changed ? '' : 'is-disabled'}" data-act="avSave" aria-disabled="${!changed}">${t('proj/save')}</button></div>`;
  }

  // ======================================================================
  // NP-05 充值（模拟）
  // ======================================================================
  const TIERS = [500, 1000, 3000];
  function tierN() {
    const P = S.pg;
    if (P.tier === 'custom') { const v = String(P.custom).replace(/[\s,.]/g, ''); if (!/^\d+$/.test(v)) return 0; const n = +v; return n >= 100 && n <= 100000 && n % 100 === 0 ? n : 0; }
    return P.tier || 0;
  }
  const price = (n) => '¥' + num(n / 10);
  function viewRecharge() {
    const P = S.pg;
    // 从别的页面进来时，上一次的成功态清掉
    if (P.prev !== 'recharge' && P.pay === 'done') { P.pay = 'idle'; P.tier = null; P.custom = ''; }
    const n = tierN(), paying = P.pay === 'paying', done = P.pay === 'done';
    const customBad = P.tier === 'custom' && String(P.custom).trim() !== '' && !n;
    let card, foot;
    if (done) {
      card = `<div class="pg-done">${ic('check-circle-fill', 'pg-done-ic')}<h2>${t('topup/done', { n: num(P.paidN) })}</h2><p class="muted">${t('topup/balance', { n: num(S.credits || 0) })}</p></div>`;
      foot = S.returnTo
        ? `<button class="btn btn-secondary" data-act="pgViewLedger">${t('topup/view-ledger')}</button><button class="btn btn-primary" data-act="pgReturn">${t('topup/back')}</button>`
        : `<button class="btn btn-secondary" data-act="pgAgain">${t('topup/again')}</button><button class="btn btn-primary" data-act="pgViewLedger">${t('topup/view-ledger')}</button>`;
    } else {
      const tierCard = (v) => `<button class="pg-tier ${P.tier === v ? 'is-on' : ''}" data-act="pgTier" data-arg="${v}" ${paying ? 'disabled' : ''}><b>${num(v)}</b><span class="pg-tier-u">${t('credit/unit')}</span><span class="pg-tier-p">${price(v)}</span></button>`;
      const custom = P.tier === 'custom'
        ? `<div class="pg-tier is-on is-custom"><span class="pg-tier-l">${t('topup/custom')}</span><input class="input ${customBad ? 'is-bad' : ''}" inputmode="numeric" data-input="pgCustom" value="${esc(P.custom)}" placeholder="${esc(t('topup/custom-ph'))}" ${paying ? 'disabled' : ''} data-autofocus aria-label="${esc(t('topup/custom-ph'))}"><span class="pg-tier-p">${n ? price(n) : '—'}</span></div>`
        : `<button class="pg-tier" data-act="pgTier" data-arg="custom" ${paying ? 'disabled' : ''}>${ic('pencil-simple', 'ic-24')}<span class="pg-tier-l">${t('topup/custom')}</span></button>`;
      card = `<div class="pg-tiers">${TIERS.map(tierCard).join('')}${custom}</div>
        ${customBad ? `<div class="caption pg-bad">${t('topup/custom-bad')}</div>` : ''}<div class="caption faint pg-sim">${ic('info-fill', 'ic-16')}${t('topup/sim-note')}</div>`;
      foot = `<button class="btn btn-primary btn-block ${!n || paying ? 'is-disabled' : ''}" data-act="pgPay">${paying ? `${ic('circle-notch', 'ic-16 pg-spin')}${t('topup/paying')}` : esc(t('topup/pay', { p: n ? price(n) : '—' }))}</button>`;
    }
    const balLine = `<p class="muted pg-rc-bal">${ic('wallet-fill', 'ic-16')}${t('topup/balance', { n: num(S.credits || 0) })}</p>`;
    if (mob()) {
      const mTop = `<header class="m-topbar pg-bar"><button class="ibtn" data-act="pgBack" aria-label="${esc(t('pg/back'))}">${ic('caret-left')}</button><h1>${t('topup/title')}</h1>${window.demoTag()}<span class="pg-bar-sp"></span></header>`;
      return page(`<main class="page pg pg-rc">${done ? '' : balLine}${card}<div class="pg-rc-foot ${done ? 'is-two' : ''}">${foot}</div></main>`, { mTop, noTab: true, cls: 'is-pg-rc' });
    }
    return page(`<main class="page pg pg-rc"><div class="pg-rc-card"><div class="pg-rc-head"><button class="ibtn ibtn-sm ibtn-secondary" data-act="pgBack" aria-label="${esc(t('pg/back'))}">${ic('caret-left', 'ic-16')}</button><h1>${t('topup/title')}</h1></div>${done ? '' : balLine}${card}<div class="pg-rc-foot ${done ? 'is-two' : ''}">${foot}</div></div></main>`);
  }
  A.pgTier = (v) => { if (S.pg.pay !== 'idle') return false; S.pg.tier = v === 'custom' ? 'custom' : +v; };
  I.pgCustom = (v) => { S.pg.custom = v; return true; };
  A.pgPay = () => {
    const P = S.pg, n = tierN();
    if (!n || P.pay !== 'idle') return false;
    P.pay = 'paying';
    setTimeout(() => {
      P.paidN = n; P.pay = 'done';
      if (window.topup) window.topup(n); // A：加点 + 流水 + 通知（通知会自己重渲染）
      else {
        S.credits = (S.credits || 0) + n;
        if (!Array.isArray(S.ledger)) S.ledger = [];
        S.ledger.unshift({ kind: 'topup', amount: n, vars: {}, at: Date.now() });
      }
      window.render();
    }, 1000);
  };
  A.pgReturn = () => { const r = S.returnTo; S.returnTo = null; S.pg.pay = 'idle'; location.hash = r || '#/home'; return false; };
  A.pgViewLedger = () => { S.returnTo = null; S.pg.ledF = 'all'; S.pg.scrollTo = 'me-ledger'; window.go('me'); return false; };
  A.pgAgain = () => { S.pg.pay = 'idle'; S.pg.tier = null; S.pg.custom = ''; };
  A.pgBack = () => { if (history.length > 1) history.back(); else window.go('me'); return false; };

  // ======================================================================
  // 浮层（A 的 overlays() 调用；未接入时由 page() 补）
  // ======================================================================
  window.pageOverlays = function () {
    ovCalls++;
    let h = '';
    const P = S.pg;
    const wrap = (id, body) => (S.dialog === id ? window.dialog(body) : S.sheet === id ? window.sheet(body) : '');
    if (S.dialog === 'pg-rename' || S.sheet === 'pg-rename') {
      const emptyName = !P.renVal.trim();
      h += wrap('pg-rename', `<div class="dialog-head sheet-head"><h3>${t('proj/rename')}</h3></div><input class="input pg-ren" data-input="pgRenVal" data-key="pgRenKey" value="${esc(P.renVal)}" data-autofocus aria-label="${esc(t('proj/rename'))}">
        <div class="dialog-foot pg-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-primary ${emptyName ? 'is-disabled' : ''}" data-act="pgRenOk">${t('proj/save')}</button></div>`);
    }
    if (S.dialog === 'pg-mdel' || S.sheet === 'pg-mdel') {
      const n = (P.msel || []).length;
      h += wrap('pg-mdel', `<h3>${t('proj/delete-n-q', { n })}</h3><p class="muted pg-dp">${t('proj/delete-d')}</p><div class="dialog-foot pg-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-danger" data-act="pgMselDelOk">${t('proj/delete-n', { n })}</button></div>`);
    }
    if (S.dialog === 'pg-del' || S.sheet === 'pg-del') {
      h += wrap('pg-del', `<h3>${t('proj/delete-q')}</h3><p class="muted pg-dp">${t('proj/delete-d')}</p><div class="dialog-foot pg-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-danger" data-act="pgDelOk">${t('proj/delete')}</button></div>`);
    }
    if (S.dialog === 'pg-av') h += window.dialog(avBody(), 'av-dlg');
    if (S.sheet === 'pg-av') h += window.sheet(avBody(), 'av-dlg');
    if (S.dialog === 'pg-logout' || S.sheet === 'pg-logout') {
      h += wrap('pg-logout', `<h3>${t('account/logout-q')}</h3><div class="dialog-foot pg-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-danger" data-act="pgLogoutOk">${t('account/logout')}</button></div>`);
    }
    if (S.sheet === 'pg-proj') { const p = projById(P.projSel); if (p) h += window.sheet(`<div class="sheet-head"><h3 class="ellipsis">${esc(p.name)}</h3></div>${projMenuItems(p)}`); }
    if (S.sheet === 'pg-level') h += window.sheet(`<div class="sheet-head"><h3>${t('newproj/level') !== 'newproj/level' ? t('newproj/level') : t('pg/level-all')}</h3></div>${LV_OPTS().map(([v, l]) => `<button class="menu-item ${P.tplLv === v ? 'is-on' : ''}" data-act="pgTplLv" data-arg="${v}">${esc(l)}</button>`).join('')}`);
    if (S.sheet === 'pg-sort') h += window.sheet(`<div class="sheet-head"><h3>${t('proj/sort-recent')} / ${t('proj/sort-name')}</h3></div>${['recent', 'name'].map((v) => `<button class="menu-item ${P.projSort === v ? 'is-on' : ''}" data-act="pgSort" data-arg="${v}">${t('proj/sort-' + v)}</button>`).join('')}`);
    if (S.sheet === 'pg-lang') h += window.sheet(`<div class="sheet-head"><h3>${t('nav/language')}</h3></div>${window.LANGS.map((l) => `<button class="menu-item ${S.lang === l.code ? 'is-on' : ''}" data-act="setLang" data-arg="${l.code}">${l.name}</button>`).join('')}`);
    return h;
  };

  // 渲染后：定位到流水区、记录上一路由
  window.AFTER_RENDER.push(() => {
    const P = S.pg;
    if (P.scrollTo && S.route === 'me') {
      const el = document.getElementById(P.scrollTo);
      if (el) { P.scrollTo = null; el.scrollIntoView({ block: 'start' }); }
    }
    P.prev = S.route;
  });

  // ---------- 注册路由 ----------
  window.PAGES = { templates: viewTemplates, projects: viewProjects, history: viewHistory, me: viewMe, recharge: viewRecharge };
  Object.assign(window.VIEWS, window.PAGES);
  // #/me/ledger 与 #/me#me-ledger 都定位到全部流水
  window.VIEWS['me#me-ledger'] = () => { S.pg.scrollTo = 'me-ledger'; return viewMe(); };
  const meView = window.VIEWS.me;
  window.VIEWS.me = () => { if (S.routeArg === 'ledger' && S.pg.prev !== 'me') S.pg.scrollTo = 'me-ledger'; return meView(); };
})();
