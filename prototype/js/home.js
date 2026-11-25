/* 平台外壳（侧栏/顶栏/底部 Tab）+ 创作框 + 首页。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const TYPES = { midnav: { w: 80, h: 70, n: 40 }, bottomnav: { w: 70, h: 70, n: 35 }, gametype: { w: 100, h: 76, n: 13 } };
  const PALETTES = {
    blue: ['#1678ff', '#04be02', '#ffaa09', '#333333'], gold: ['#c9963b', '#2fa84f', '#f2a20c', '#2b2620'],
    green: ['#10b26c', '#3a86ff', '#ffaa09', '#1f2a24'], purple: ['#7b4dff', '#12b886', '#ff9f1c', '#25213a'],
  };
  window.TYPES = TYPES; window.PALETTES = PALETTES;
  S.c = { type: 'midnav', qty: 'one', quality: 'std', model: 'gpt', color: 'follow', custom: ['#0a84ff', '#ffffff', '#0a84ff', '#8e8e93'], ref: false, prompt: '' };
  S.filter = 'all';

  // ---------- 外壳 ----------
  const NAV = [
    { id: 'home', key: 'nav/home', icon: 'house-fill', route: 'home' },
    { id: 'templates', key: 'nav/templates', icon: 'squares-four-fill', route: 'todo/templates' },
    { id: 'projects', key: 'nav/projects', icon: 'folder-fill', route: 'todo/projects' },
    { id: 'history', key: 'nav/history', icon: 'image-fill', route: 'todo/history' },
  ];
  function current() { return S.route === 'todo' ? S.routeArg : S.route; }
  function sidebar() {
    const exp = (S.route === 'workbench' ? S.wbSidebar : S.sidebarExpanded) && window.bp() === 'desktop';
    const cur = current();
    const wbOn = S.route === 'workbench' && (!S.activeSession || S.routeArg === 'new');
    const wb = exp
      ? `<div class="sb-wb"><button class="nav ${wbOn ? 'is-on' : ''}" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}<span>${t('nav/workbench')}</span></button><button class="ibtn ibtn-sm chev" data-act="toggleHistory" aria-label="toggle">${ic(S.historyOpen ? 'caret-down' : 'caret-right', 'ic-16')}</button></div>
        ${S.historyOpen ? `<div class="sb-tools"><label class="sb-search">${ic('magnifying-glass', 'ic-16')}<input data-input="sessSearch" value="${esc(S.sessSearch || '')}" placeholder="${esc(t('workbench/search-sessions'))}"></label><button class="ibtn ibtn-sm" style="color:var(--brand)" data-act="newChat" aria-label="${esc(t('nav/new-chat'))}">${ic('plus', 'ic-16')}</button></div>${window.sessionList('sb')}` : ''}`
      : `<button class="nav ${S.route === 'workbench' ? 'is-on' : ''}" data-act="go" data-arg="workbench">${ic('magic-wand-fill', 'is-brand')}<span>${t('nav/workbench')}</span></button>
         <button class="nav" data-act="newChat">${ic('plus')}<span>${t('nav/new-chat')}</span></button>`;
    return `<aside class="sidebar ${exp ? 'is-expanded' : ''}">
      <div class="sb-head"><img class="logo" src="assets/logo-orb.webp" alt="logo">${window.bp() === 'desktop' ? `<button class="ibtn ibtn-sm ibtn-secondary" data-act="toggleSidebar" title="${esc(t(exp ? 'nav/collapse' : 'nav/expand'))}">${ic('sidebar-simple', 'ic-16')}</button>` : ''}</div>
      ${NAV.map((n) => `<button class="nav ${cur === n.id ? 'is-on' : ''}" data-act="go" data-arg="${n.route}">${ic(n.icon)}<span>${t(n.key)}</span></button>`).join('')}
      <div class="sb-spacer"></div>${wb}</aside>`;
  }
  function langMenu(align = 'right') {
    if (S.menu !== 'lang') return '';
    return `<div class="menu" style="top:calc(100% + 8px);${align}:0">${window.LANGS.map((l) => `<button class="menu-item ${S.lang === l.code ? 'is-on' : ''}" data-act="setLang" data-arg="${l.code}">${l.name}</button>`).join('')}</div>`;
  }
  function topbar(solid) {
    return `<header class="topbar desk ${solid ? 'is-solid' : ''}">
      <label class="tb-search">${ic('magnifying-glass', 'ic-16')}<input placeholder="${esc(t('topbar/search'))}" data-key="searchKey"></label>
      <button class="credit" data-act="soon">${ic('sparkle-fill')}${num(S.credits)}</button>
      <div class="rel"><button class="ibtn ibtn-secondary" data-act="menu:toggle" data-arg="lang" title="${esc(t('nav/language'))}">${ic('globe')}</button>${langMenu()}</div>
      <button class="ibtn ibtn-secondary" data-act="setTheme" title="${esc(t(S.theme === 'dark' ? 'nav/theme-dark' : 'nav/theme-light'))}">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill')}</button>
      <button class="ibtn ibtn-secondary" data-act="soon">${ic('bell-fill')}</button>
      <button class="avatar" data-act="soon" aria-label="${esc(t('nav/me'))}"></button></header>`;
  }
  function mTopbar() {
    return `<header class="m-topbar"><img class="logo" src="assets/logo-orb.webp" alt="logo"><div class="grow"></div>
      <button class="ibtn ibtn-secondary" data-act="soon">${ic('magnifying-glass')}</button>
      <button class="credit" data-act="soon">${ic('sparkle-fill')}${num(S.credits)}</button>
      <div class="rel"><button class="ibtn ibtn-secondary" data-act="menu:toggle" data-arg="lang">${ic('globe')}</button>${langMenu()}</div>
      <button class="ibtn ibtn-secondary" data-act="setTheme">${ic(S.theme === 'dark' ? 'moon-fill' : 'sun-fill')}</button>
      <button class="ibtn ibtn-secondary" data-act="soon">${ic('bell-fill')}</button></header>`;
  }
  function tabbar() {
    const cur = current();
    const tabs = [
      ['home', 'nav/home', 'house-fill', 'home'], ['templates', 'nav/templates', 'squares-four-fill', 'todo/templates'],
      ['workbench', 'nav/workbench-short', 'magic-wand-fill', 'workbench'], ['projects', 'nav/projects', 'folder-fill', 'todo/projects'], ['me', 'nav/me', 'user-circle-fill', 'todo/me'],
    ];
    return `<nav class="tabbar">${tabs.map(([id, k, icn, r]) => `<button class="tab ${cur === id ? 'is-on' : ''}" data-act="go" data-arg="${r}">${ic(icn, id === 'workbench' ? 'is-brand' : '')}<span>${t(k)}</span></button>`).join('')}</nav>`;
  }
  window.shell = (inner, opts = {}) => `<div class="app ${opts.cls || ''}">${sidebar()}<div class="main">${opts.mTop === undefined ? mTopbar() : opts.mTop}${opts.noTop ? '' : topbar(opts.solid)}${inner}</div>${opts.noTab ? '' : tabbar()}</div>${window.overlays()}`;
  A.toggleSidebar = () => { if (S.route === 'workbench') { S.wbSidebar = !S.wbSidebar; window.LS.set('wbSidebar', S.wbSidebar); } else { S.sidebarExpanded = !S.sidebarExpanded; window.LS.set('sidebarExpanded', S.sidebarExpanded); } };
  A.toggleHistory = () => { S.historyOpen = !S.historyOpen; };
  A.searchKey = (e) => { if (e.key === 'Enter') window.comingSoon(); };

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
    const tabs = ['midnav', 'bottomnav', 'gametype'];
    const menu = (id, body, cls) => (!mob && S.menu === id ? `<div class="menu c-menu ${cls}">${body}</div>` : '');
    const opt = (id, inner) => `<div class="rel"><button class="c-opt ${S.menu === id ? 'is-open' : ''}" data-act="${mob ? 'sheet' : 'menu:toggle'}" data-arg="${id}">${inner}${ic('caret-down', 'chev')}</button>${menu(id, id === 'spec' ? specBody() : id === 'model' ? modelBody() : colorBody(), id === 'spec' ? 'spec-menu' : id === 'color' ? 'color-menu' : '')}</div>`;
    const opts = [
      opt('model', `${window.MODEL_LOGO[S.c.model]}${modelName(S.c.model)}`),
      opt('color', `${ic('paint-brush-fill')}${esc(colorLabel())}`),
      opt('spec', `${ic(S.c.qty === 'set' ? 'toolbox-fill' : 'frame-corners-fill')}${esc(specLabel())}`),
    ];
    if (mob) opts.reverse(); // 手机端规格在前（Figma Composer Device=Mobile）
    const empty = !S.c.prompt.trim();
    return `<div class="composer" data-where="${where}">
      <div class="c-tabs" data-sk="ctabs-${where}">${tabs.map((ty) => `<button class="c-tab ${S.c.type === ty ? 'is-on' : ''}" data-act="cType" data-arg="${ty}">${window.typeIcon(ty)}${t('composer/type-' + ty)}</button>`).join('')}
        <button class="tpl-link" data-act="tplLink">${t('composer/template-link')}</button></div>
      <div class="c-box ${S.c.type === 'midnav' ? 'no-tl' : ''}">
        <div class="c-input">
          <button class="refslot ${S.c.ref ? 'is-filled' : ''}" data-act="cRef" aria-label="${esc(t('composer/ref-slot'))}">${S.c.ref ? `<span class="rm" data-act="cRefRm" data-stop>${ic('x', 'ic-16')}</span>` : `${ic('plus')}<span>${t('composer/ref-slot')}</span><span class="tip">${t('composer/ref-hint')}</span>`}</button>
          <textarea rows="3" data-input="cPrompt" data-key="cKey" placeholder="${esc(t('composer/placeholder'))}">${esc(S.c.prompt)}</textarea>
        </div>
        <div class="c-tools"><div class="c-opts" data-sk="copts-${where}">${opts.join('')}</div>
          <button class="send ${empty ? 'is-disabled' : ''}" data-act="cSend" title="${esc(t('confirm/approx', { n: cost() }))}">${ic('sparkle-fill')}${num(cost())}${ic('arrow-up')}</button></div>
      </div></div>`;
  };
  A.cType = (v) => { S.c.type = v; };
  A.cQty = (v) => { S.c.qty = v; };
  A.cQuality = (v) => { S.c.quality = v; };
  A.cModel = (v) => { S.c.model = v; S.menu = null; if (S.sheet === 'model') S.sheet = null; };
  A.cColor = (v) => { S.c.color = v; if (v !== 'custom') { S.menu = null; if (S.sheet === 'color') S.sheet = null; } else if (!window.isMobile()) S.menu = 'color'; };
  I.cCustom = (v, el) => { S.c.custom[+el.dataset.i] = v; };
  A.cRef = () => { if (!S.c.ref) { S.c.ref = true; } };
  A.cRefRm = () => { S.c.ref = false; };
  I.cPrompt = (v) => { const was = !S.c.prompt.trim(); S.c.prompt = v; const now = !v.trim(); document.querySelectorAll('.send').forEach((b) => b.classList.toggle('is-disabled', now)); return false && was; };
  A.cKey = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); A.cSend(); return true; } };
  A.sheet = (id) => { S.sheet = id; S.menu = null; };
  A.tplLink = () => { if (S.route !== 'home') { go('home'); setTimeout(() => document.getElementById('sec-templates')?.scrollIntoView({ behavior: 'smooth' }), 60); } else document.getElementById('sec-templates')?.scrollIntoView({ behavior: 'smooth' }); return false; };
  A.cSend = () => {
    if (!S.c.prompt.trim()) { document.querySelector('[data-input="cPrompt"]')?.focus(); return false; }
    if (S.c.qty === 'set') { S.menu = null; if (window.isMobile()) S.sheet = 'confirm'; else S.dialog = 'confirm'; return; }
    window.startGeneration();
  };
  A.confirmSet = () => { S.dialog = null; S.sheet = null; window.startGeneration(); };

  function confirmBody() {
    const ty = TYPES[S.c.type];
    return `<h3>${t('confirm/title-' + S.c.type)}</h3><p class="muted" style="margin:8px 0 16px">${t('confirm/body', { n: ty.n, m: ty.n - 1 })}</p>
      <div style="display:flex;gap:8px;flex-direction:column;padding:12px;border-radius:12px;background:var(--fill-3)">
        <div style="display:flex;justify-content:space-between"><span class="muted">${t('confirm/cost-label')}</span><b>${t('confirm/approx', { n: num(cost()) })}</b></div>
        <div style="display:flex;justify-content:space-between"><span class="muted">${t('confirm/balance-label')}</span><span>${t('confirm/points', { n: num(S.credits) })}</span></div></div>
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeAll">${t('confirm/cancel')}</button><button class="btn btn-primary" data-act="confirmSet">${t('confirm/ok')}</button></div>`;
  }
  // 全局浮层（弹窗/底部面板），各页面共用
  window.overlays = function () {
    let h = '';
    if (S.dialog === 'confirm') h += window.dialog(confirmBody());
    if (S.sheet === 'confirm') h += window.sheet(confirmBody());
    if (S.sheet === 'spec') h += window.sheet(`<div class="sheet-head"><h3>${t('spec/sheet-title')}</h3></div><div class="spec-menu" style="width:auto;padding:0">${specBody()}</div><button class="btn btn-primary btn-block" style="margin-top:16px" data-act="closeAll">${t('spec/done')}</button>`);
    if (S.sheet === 'model') h += window.sheet(`<div class="sheet-head"><h3>${t('sheet/model-title')}</h3></div>${modelBody()}`);
    if (S.sheet === 'color') h += window.sheet(`<div class="sheet-head"><h3>${t('sheet/color-title')}</h3></div>${colorBody()}${S.c.color === 'custom' ? `<button class="btn btn-primary btn-block" style="margin-top:12px" data-act="closeAll">${t('spec/done')}</button>` : ''}`);
    if (window.wbOverlays) h += window.wbOverlays();
    return h;
  };

  // ---------- 首页 ----------
  const PROJECTS = [
    { name: '星河体育 · 首页', st: 'designing', time: 'time/2h' }, { name: '金冠娱乐 · H5', st: 'exported', time: 'time/yesterday' },
    { name: '蓝鲸平台 · 春节版', st: 'designing', time: 'time/3d' }, { name: 'Lucky Star · Home', st: 'exported', time: 'time/3d' },
    { name: '悦动 · 新版首页', st: 'designing', time: 'time/3d' }, { name: '星耀 · 活动页', st: 'designing', time: 'time/3d' },
  ];
  const TEMPLATES = [
    { k: 'classic-blue', meta: 'standard', f: 'classic' }, { k: 'midnight-gold', meta: 'pro', f: 'dark' }, { k: 'fresh-green', meta: 'standard', f: 'minimal' },
    { k: 'western-white', meta: 'standard', f: 'western' }, { k: 'festive-red', meta: 'pro', f: 'festive' }, { k: 'classic-blue', meta: 'standard', f: 'classic' },
  ];
  const levelTag = () => `<span class="level-tag"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span>`;
  window.VIEWS.home = function () {
    const lv = (tier, key, on) => `<div class="level ${on ? 'is-on' : 'is-off'}"><div class="level-row"><img src="assets/badge-tier${tier}.png" alt=""><span class="level-title">${t('level/' + key + '-title')}</span>${on ? '' : `<span class="pill-tag is-gray">${t('level/coming-soon')}</span>`}</div><div class="level-desc">${t('level/' + key + '-desc')}</div>${on ? `<div><button class="btn btn-primary" data-act="openEditor">${ic('arrow-right', 'ic-16')}${t('level/cta')}</button></div>` : ''}</div>`;
    const tpls = TEMPLATES.filter((x) => S.filter === 'all' || x.f === S.filter);
    const inner = `<main class="page">
      <section class="hero"><img class="hero-orb" src="assets/logo-orb.webp" alt=""><h1>${t('home/greeting')}</h1><p>${t('home/subtitle')}</p>${window.composer('home')}</section>
      <section class="section"><div class="section-head"><h2>${t('section/level')}</h2></div><div class="levels">${lv(1, 'standard', true)}${lv(2, 'pro', false)}${lv(3, 'full', false)}</div></section>
      <section class="section"><div class="section-head"><h2>${t('section/recent')}</h2><button class="view-all" data-act="go" data-arg="todo/projects">${t('common/view-all')}${ic('caret-right', 'ic-16')}</button></div>
        <div class="cards" data-sk="recent">${PROJECTS.map((p) => `<button class="card" data-act="openEditor"><div class="cover r-5x6 skeleton">${levelTag()}</div><div class="card-title"><span class="ellipsis" title="${esc(p.name)}">${esc(p.name)}</span><span class="pill-tag ${p.st === 'exported' ? '' : ''}">${t('status/' + p.st)}</span></div><div class="caption faint">${t(p.time)}</div></button>`).join('')}</div></section>
      <section class="section" id="sec-templates"><div class="section-head"><h2>${t('section/templates')}</h2><button class="view-all" data-act="go" data-arg="todo/templates">${t('common/view-all')}${ic('caret-right', 'ic-16')}</button></div>
        <div class="filters scroll-x" data-sk="filters">${['all', 'classic', 'western', 'minimal', 'dark', 'festive'].map((f) => `<button class="chip ${S.filter === f ? 'is-on' : ''}" data-act="filter" data-arg="${f}">${t('filter/' + f)}</button>`).join('')}</div>
        <div class="cards" data-sk="tpls">${tpls.length ? tpls.map((x) => `<button class="card" data-act="openEditor"><div class="cover r-3x4 skeleton"></div><div class="card-title"><span class="ellipsis">${t('template/' + x.k)}</span></div><div class="caption faint">${t('template/meta-' + x.meta)}</div></button>`).join('') : `<div class="caption faint">—</div>`}</div></section>
    </main>`;
    return window.shell(inner);
  };
  A.filter = (f) => { S.filter = f; };
  A.openEditor = () => { window.openEditor(); return false; };

  // ---------- 待设计页面 ----------
  window.VIEWS.todo = function () {
    return window.shell(`<div class="todo-page">${window.empty('wrench-fill', t('page/todo-title'), t('page/todo-desc'), `<button class="btn btn-secondary" data-act="go" data-arg="home">${t('page/back-home')}</button>`)}</div>`, { solid: true });
  };
  S.credits = 1280;
})();
