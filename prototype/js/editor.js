/* 编辑器内页：三栏（桌面/iPad 横屏）或画布 + 底部工具（手机/折叠屏/iPad 竖屏 < 840）。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const KEYS = ['primary', 'lead', 'neutral_1', 'neutral_2', 'neutral_3', 'border', 'bg_1', 'bg_2', 'accent_1', 'accent_2', 'accent_3'];
  const PRESETS = {
    blue: ['#1678ff', '#333333', '#666666', '#999999', '#cccccc', '#e3e3e3', '#f8f8f8', '#ffffff', '#04be02', '#ea4e3d', '#ffaa09'],
    gold: ['#c9963b', '#2b2620', '#6b6256', '#9c9286', '#cfc7bc', '#e8e0d4', '#f7f3ec', '#ffffff', '#2fa84f', '#d9472b', '#f2a20c'],
    green: ['#10b26c', '#1f2a24', '#58665e', '#8e9a93', '#c5cdc8', '#dfe6e2', '#f4f8f6', '#ffffff', '#3a86ff', '#ef4444', '#ffaa09'],
    purple: ['#7b4dff', '#25213a', '#5f5a75', '#948faa', '#c9c5da', '#e4e1ef', '#f6f5fb', '#ffffff', '#12b886', '#f03e5e', '#ff9f1c'],
  };
  const preset = (k) => Object.fromEntries(KEYS.map((key, i) => [key, PRESETS[k][i]]));
  const SUGGEST = ['#1678ff', '#c9963b', '#10b26c', '#7b4dff', '#ea4e3d', '#ff7a1a', '#06b0ea', '#1c2033'];
  const MODS = {
    topbar: { key: 'mod/topbar', fixed: true, st: 'done' }, banner: { key: 'mod/banner', st: 'done' }, jackpot: { key: 'cat/jackpot', st: 'check' },
    midnav: { key: 'mod/midnav', st: 'check' }, gamemenu: { key: 'mod/gamemenu', st: 'done' }, gamecards: { key: 'mod/gamecards', st: 'done' },
    footer: { key: 'cat/footer', st: 'done' }, menubar: { key: 'cat/menu', st: 'todo' }, sidebar: { key: 'mod/sidebar', st: 'done' }, bottomnav: { key: 'mod/bottomnav', fixed: true, st: 'check' },
  };
  const BANNER = { large: { w: 1080, h: 490, dw: 710, dh: 322, cw: 351, ch: 159 }, general: { w: 1020, h: 300, dw: 710, dh: 209, cw: 351, ch: 103 }, small: { w: 386, h: 244, dw: 386, dh: 244, cw: 193, ch: 122 } };
  const TB = { h: [88, 96, 112], pad: [24, 32, 48], gap: [16, 24, 32] };
  const TB_SW = { bg: ['#ffffff', '#f8f8f8', '#1c2033', '#1678ff'], text: ['#333333', '#1c2033', '#ffffff', '#666666'], search: ['#1678ff', '#333333', '#ffaa09', '#ffffff'], reg: ['#ffaa09', '#1678ff', '#ea4e3d', '#10b26c'] };
  const SLIDE_F = ['none', 'hue-rotate(28deg) saturate(1.2)', 'hue-rotate(-38deg)'];
  const CAND_F = ['hue-rotate(10deg) saturate(1.4)', 'hue-rotate(-60deg) saturate(1.3)', 'hue-rotate(140deg) saturate(1.1)', 'hue-rotate(200deg) brightness(1.1)'];
  const baseName = (id) => id.split('~')[0];
  const modName = (id) => { const b = baseName(id); const n = id.includes('~') ? ' ' + (+id.split('~')[1] + 1) : ''; return t(MODS[b].key) + n; };

  function defaultDesign() {
    return {
      order: ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer', 'menubar'], hidden: {}, side: 'left', login: false,
      theme: preset('blue'), palette: 'blue', template: 'classic-blue', height: 1480,
      banner: { size: 'general', ind: 'bars', margin: 16, corner: 8, slides: SLIDE_F.slice() },
      m: window.MP ? window.MP.defaults() : {}, ec: {},
      tb: { h: 88, pad: 24, gap: 16, items: { logo: true, side: true, search: true, auth: true }, searchFirst: false, colors: { bg: null, text: null, search: null, reg: null }, logoF: 'none' },
    };
  }
  const E = (window.E = {
    loading: false, step: 0, device: 'h5', sel: null, tab: 'content', ai: null, zoom: 50, palOpen: false, picker: null,
    checksPassed: false, dlg: null, exp: { stage: 'ready', opts: { figma: true, png: true, svg: false } }, slide: 0, mpanel: null, preview: false,
    upload: null, replaced: null, h5side: false, adv: false, D: defaultDesign(), past: [], future: [],
  });

  // ---------- 历史（撤销/重做） ----------
  const snap = () => JSON.stringify(E.D);
  function commit(fn) { E.past.push(snap()); if (E.past.length > 60) E.past.shift(); E.future = []; fn(); }
  A.undo = () => { if (!E.past.length) return false; E.future.push(snap()); E.D = JSON.parse(E.past.pop()); window.toast(t('ed/undo-toast')); };
  A.redo = () => { if (!E.future.length) return false; E.past.push(snap()); E.D = JSON.parse(E.future.pop()); window.toast(t('ed/redo-toast')); };

  // ---------- 进入编辑器（加载页） ----------
  window.openEditor = function () {
    E.loading = true; E.step = 0; E.sel = null; E.ai = null; E.picker = null; E.mpanel = null; E.dlg = null;
    window.go('editor');
    const tick = () => { E.step++; if (E.step >= 3) { setTimeout(() => { E.loading = false; window.render(); }, 350); } window.render(); if (E.step < 3) setTimeout(tick, 380); };
    setTimeout(tick, 380);
  };
  const mobileEd = () => window.innerWidth < 840;

  // ---------- 颜色工具 ----------
  function hex2hsv(hex) {
    const n = parseInt(hex.slice(1), 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return { h, s: mx ? d / mx : 0, v: mx };
  }
  function hsv2hex({ h, s, v }) {
    const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }
  const validHex = (s) => /^#?[0-9a-f]{6}$/i.test(s);

  // 色块上的文字颜色：按 WCAG 相对亮度，取与底色对比度更高的黑或白
  function inkOn(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})/i.exec(hex || ''); if (!m) return '#fff';
    let h = m[1]; if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const L = [0, 2, 4].map((i) => { const c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    const lum = 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2];
    return (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05) ? '#000' : '#fff';
  }
  // 当前用于渲染的主题（取色中实时预览）
  function liveTheme() {
    const th = Object.assign({}, E.D.theme);
    const tb = Object.assign({}, E.D.tb.colors);
    const ec = Object.assign({}, E.D.ec);
    if (E.picker) { if (E.picker.tbRow) tb[E.picker.tbRow] = E.picker.value; else if (E.picker.elRow) ec[E.picker.elRow] = E.picker.value; else th[E.picker.key] = E.picker.value; }
    return { th, tb, ec };
  }
  function themeStyle() {
    const { th, tb, ec } = liveTheme();
    let s = KEYS.map((k) => `--o-${k}:${th[k]}`).join(';') + (window.MP ? window.MP.vars(th, ec) : '');
    if (tb.bg) s += `;--tb-bg:${tb.bg}`; if (tb.text) s += `;--tb-text:${tb.text}`; if (tb.search) s += `;--tb-search:${tb.search}`; if (tb.reg) s += `;--tb-reg:${tb.reg}`;
    return s;
  }

  // ---------- H5 预览 ----------
  function modWrap(id, inner, opts = {}) {
    const sel = E.sel === id;
    let extra = '';
    if (sel && !mobileEd()) extra = `<span class="sel-label ${opts.top ? 'inside' : ''}">${esc(E.ai && E.ai.cand != null && baseName(id) === 'banner' ? t('ed/previewing', { n: E.ai.cand + 1 }) : modName(id))}</span>${selToolbar(id, opts.top)}`;
    return `<div class="mod ${sel ? 'is-sel' : ''}" data-mod="${id}" data-act="selMod" data-arg="${id}">${inner}${extra}</div>`;
  }
  function selToolbar(id, below) {
    const b = baseName(id), fixed = MODS[b].fixed;
    const idx = E.D.order.indexOf(id);
    const btn = (act, icon, label, arg = '') => `<button data-act="${act}" data-arg="${arg}" data-stop>${ic(icon)}${label}</button>`;
    let main = '';
    if (b === 'topbar') main = btn('tbTab', 'sliders-horizontal', t('ed/tool-layout'), 'layout') + btn('tbTab', 'paint-brush-fill', t('ed/recolor'), 'color');
    else if (b !== 'banner' && b !== 'menubar') main = btn('tbTab', 'sliders-horizontal', t('ed/tool-layout'), 'layout') + btn('tbTab', 'paint-brush-fill', t('ed/recolor'), 'color');
    else if (b === 'banner') main = btn('toolReplace', 'image', t('ed/replace-image')) + btn('openAi', 'magic-wand', t('ed/ai')) + btn('tbTab', 'paint-brush-fill', t('ed/recolor'), 'color');
    const move = fixed || b === 'sidebar' ? '' : `<button class="ib" data-act="move" data-arg="-1" data-stop ${idx <= 0 ? 'disabled' : ''}>${ic('arrow-up')}</button><button class="ib" data-act="move" data-arg="1" data-stop ${idx >= E.D.order.length - 1 ? 'disabled' : ''}>${ic('arrow-down')}</button>`;
    const menu = S.menu === 'modmenu' ? moduleMenu(id) : '';
    return `<div class="seltool ${below ? 'below' : ''}" data-stop>${main}${move}<button class="ib" data-act="toggleHide" data-arg="${id}" data-stop title="${esc(t('ed/am-toggle'))}">${ic('eye-slash-fill')}</button><span class="rel"><button class="ib" data-act="menu:toggle" data-arg="modmenu" data-stop>${ic('dots-three')}</button>${menu}</span></div>`;
  }
  function moduleMenu(id) {
    const fixed = MODS[baseName(id)].fixed;
    return `<div class="menu" data-stop>${fixed ? '' : `<button class="menu-item" data-act="modDup" data-arg="${id}" data-stop>${ic('copy')}${t('ed/menu-duplicate')}</button>`}<button class="menu-item" data-act="modReset" data-arg="${id}" data-stop>${ic('arrow-counter-clockwise')}${t('ed/menu-reset')}</button><button class="menu-item is-danger" data-act="modDel" data-arg="${id}" data-stop>${ic('trash')}${t('ed/menu-delete')}</button></div>`;
  }
  function h5Topbar() {
    const D = E.D, tb = D.tb, it = tb.items;
    const side = it.side ? `<span data-act="h5Side" data-stop>${ic('list', 'ico')}</span>` : '';
    const search = it.search ? ic('magnifying-glass', 'ico srch') : '';
    const logo = it.logo ? `<span class="lg"><img src="assets/logo-orb.webp" alt="">星河体育</span>` : '';
    const auth = it.auth ? (D.login ? `<span class="bal">¥ 1,280.00</span><span class="ava"></span>` : `<span class="login">登录</span><span class="reg">注册</span>`) : '';
    const left = D.side === 'left' ? side : '';
    const right = D.side === 'right' ? side : '';
    const pre = tb.searchFirst ? search : '';
    const post = tb.searchFirst ? '' : search;
    return `<div class="h5-top" style="height:${tb.h / 2}px;padding:0 ${tb.pad / 2}px;gap:${tb.gap / 2}px">${left}${pre}${logo}<span class="sp"></span>${post}${auth}${right}</div>`;
  }
  function slideF(i) {
    if (E.ai && E.ai.cand != null && i === E.slide) return CAND_F[E.ai.cand];
    return E.D.banner.slides[i] || 'none';
  }
  function h5Banner() {
    const B = E.D.banner, sz = BANNER[B.size];
    const n = B.slides.length;
    const slides = B.slides.map((_, i) => `<div class="slide" style="filter:${slideF(i)}"></div>`).join('');
    const ind = B.ind === 'none' ? '' : `<div class="h5-ind ${B.ind}">${B.slides.map((_, i) => `<i class="${i === E.slide ? 'on' : ''}" data-act="slideTo" data-arg="${i}" data-stop></i>`).join('')}</div>`;
    return `<div class="h5-banner" style="padding:${B.margin / 2}px 0"><div class="vp" data-swipe style="width:${sz.cw}px;height:${sz.ch}px;border-radius:${B.corner / 2}px"><div class="track" style="transform:translateX(${-E.slide * 100}%)">${slides}</div></div>${ind}</div>`;
    void n;
  }
  function modHtml(id) {
    switch (baseName(id)) {
      case 'banner': return h5Banner();
      case 'jackpot': case 'midnav': case 'gamemenu': case 'gamecards': case 'footer': return window.MP.h5(baseName(id), id);
      default: return '';
    }
  }
  function h5(opts = {}) {
    const D = E.D;
    const body = D.order.filter((id) => !D.hidden[id] && baseName(id) !== 'menubar').map((id) => modWrap(id, modHtml(id))).join('');
    const top = D.hidden.topbar ? '' : modWrap('topbar', h5Topbar(), { top: true });
    const bnav = D.hidden.bottomnav ? '' : `<div class="h5-bnav mod ${window.MP.bnavCls()} ${E.sel === 'bottomnav' ? 'is-sel' : ''}" data-mod="bottomnav" data-act="selMod" data-arg="bottomnav">${window.MP.bnav()}${E.sel === 'bottomnav' && !mobileEd() ? `<span class="sel-label">${esc(modName('bottomnav'))}</span>${selToolbar('bottomnav')}` : ''}</div>`;
    const side = E.h5side && !D.hidden.sidebar ? `<div class="h5-side ${D.side}" data-act="h5SideClose" data-stop>${window.MP.side()}</div>` : '';
    return `<div class="h5" style="${themeStyle()}${opts.style || ''}">${top}${body}${bnav}${side}</div>`;
  }

  // ---------- 左栏：页面与模块树 ----------
  function stOf(id) { const b = baseName(id); let s = MODS[b].st; if (E.checksPassed && s === 'check') s = 'done'; return s; }
  function row(id, opts = {}) {
    const hidden = !!E.D.hidden[id];
    const grip = opts.grip ? `<span class="grip" data-grip="${id}">${ic('dots-six-vertical', 'ic-16')}</span>` : '';
    return `<div class="row ${E.sel === id ? 'is-on' : ''} ${hidden ? 'is-hidden' : ''}" data-row="${id}">${grip}<span class="dot ${stOf(id)}"></span><button class="nm" data-act="selMod" data-arg="${id}">${esc(modName(id))}</button>${stOf(id) === 'todo' ? `<span class="st">${t('st/todo')}</span>` : ''}<button class="eye" data-act="toggleHide" data-arg="${id}" title="${esc(t('ed/am-toggle'))}">${ic(hidden ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button></div>`;
  }
  function tree() {
    const pageSt = E.checksPassed ? 'done' : 'check';
    return `<div class="grp-label">${t('ed/pages')}</div>
      <div class="row ${E.sel === null ? 'is-on' : ''}"><span class="dot ${pageSt}"></span>${ic('house-fill', 'ic-16')}<button class="nm" data-act="selMod" data-arg="">${t('cat/home')}</button><span class="st">${t(pageSt === 'check' ? 'st/check' : 'st/done')}</span></div>
      <div class="divider"></div><div class="grp-label">${t('ed/modules')}</div>
      <div data-drag-list>${E.D.order.map((id) => row(id, { grip: true })).join('')}</div>
      <div class="rel"><button class="add-mod ${S.menu === 'addmod' ? 'is-open' : ''}" data-act="addMenu">${ic('plus', 'ic-16')}${t('ed/add-module')}</button>${S.menu === 'addmod' ? `<div class="menu add-menu">${addList()}</div>` : ''}</div>
      ${row('sidebar')}
      <div class="side-pos"><span>${t('ed/side-pos')}</span><div class="iseg">${['left', 'right'].map((v) => `<button class="${E.D.side === v ? 'is-on' : ''}" data-act="setSide" data-arg="${v}">${t('ed/side-' + v)}</button>`).join('')}</div></div>
      <div class="grp-label">${t('ed/fixed')}</div>${row('topbar')}${row('bottomnav')}`;
  }

  // ---------- 右栏 ----------
  const segBtns = (opts, cur, act) => window.seg(opts, cur, act);
  function pageSettings() {
    const th = liveTheme().th;
    const groups = [['ed/grp-primary', ['primary', 'lead']], ['ed/grp-text', ['neutral_1', 'neutral_2', 'neutral_3']], ['ed/grp-bg', ['bg_1', 'bg_2', 'border']], ['ed/grp-accent', ['accent_1', 'accent_2', 'accent_3']]];
    return `<h2 class="p-title">${t('ed/page-settings')}</h2><p class="p-sub">${t('ed/page-hint')}</p>
      <div class="p-sec"><div class="lab">${t('ed/brand-colors')}</div><div class="pals">${Object.keys(PRESETS).map((k) => `<button class="pal ${E.D.palette === k ? 'is-on' : ''}" data-act="setPalette" data-arg="${k}" title="${esc(t('color/palette-' + k))}">${[0, 8, 10].map((i) => `<i style="background:${PRESETS[k][i]}"></i>`).join('')}</button>`).join('')}</div>
        <div class="basecard"><div class="hd">${t('ed/base-colors')}</div>${groups.map(([g, ks]) => `<div class="bc-row"><span class="k">${t(g)}</span><div class="sws">${ks.map((k) => `<button class="sw-btn ${E.picker && E.picker.key === k && !E.picker.tbRow ? 'is-on' : ''}" style="background:${th[k]}" title="${esc(t('ed/key-' + k))}" data-act="pick" data-arg="${k}|panel"></button>`).join('')}</div></div>`).join('')}</div>
        ${E.picker && E.picker.where === 'panel' ? pickerHtml('in-panel') : ''}
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:12px" data-act="soon">${ic('caret-right', 'ic-16')}${t('ed/all-keys')}</button></div>
      <div class="p-sec"><div class="lab">${t('ed/template')}</div><div class="tplchips">${['classic-blue', 'midnight-gold', 'fresh-green', 'western-white'].map((k) => `<button class="chip ${E.D.template === k ? 'is-on' : ''}" data-act="setTemplate" data-arg="${k}">${t('template/' + k)}</button>`).join('')}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/page-height')}</div><div style="display:flex;align-items:center;gap:8px"><input class="input" style="width:110px" type="number" value="${E.D.height}" data-input="pageHeight"><span class="caption faint">${t('ed/height-note')}</span></div></div>`;
  }
  function tabs3(cur) { return `<div class="tabs3">${segBtns([{ v: 'content', label: t('ed/tab-content') }, { v: 'layout', label: t('ed/tab-layout') }, { v: 'color', label: t('ed/tab-color') }], cur, 'setTab')}</div>`; }
  function assetMenu(id) {
    if (S.menu !== 'am:' + id) return '';
    return `<div class="menu" style="top:calc(100% + 4px);right:0">${`<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button><button class="menu-item" data-act="amReset" data-arg="${id}">${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button><button class="menu-item" data-act="amToggle" data-arg="${id}">${ic('eye-fill')}${t('ed/am-toggle')}</button>`}</div>`;
  }
  const moreBtn = (id) => `<span class="rel" style="margin-left:auto"><button class="more-btn" data-act="menu:toggle" data-arg="am:${id}">${ic('dots-three', 'ic-16')}</button>${assetMenu(id)}</span>`;
  function uploadUI(slot) {
    let h = '';
    if (E.upload && E.upload.slot === slot) h += `<div class="upl"><div class="r">${t('ed/am-uploading')}<b data-upl>${E.upload.pct}%</b><button data-act="cancelUpload">${ic('x', 'ic-16')}</button></div><div class="progress"><i data-uplbar style="width:${E.upload.pct}%"></i></div></div>`;
    if (E.replaced && E.replaced.slot === slot) h += `<div class="replaced">${ic('check-circle-fill')}${t('ed/am-replaced')} · <button data-act="undoReplace">${t('ed/am-undo')}</button></div>`;
    return h;
  }
  function bannerContent() {
    const B = E.D.banner, sz = BANNER[B.size];
    const sizeSeg = segBtns(['large', 'general', 'small'].map((v) => ({ v, label: t('ed/banner-' + v) })), B.size, 'bannerSize');
    const slides = B.slides.map((f, i) => {
      if (i === E.slide) return `<div class="asset is-on"><div class="top"><span class="thumb" style="filter:${f}"></span><span style="min-width:0"><div class="nm">${t('ed/slide-n', { n: i + 1 })} · ${t('ed/previewing-slide')}</div><div class="sp">${t('ed/spec-line', sz)}</div></span></div>
        <div class="acts"><button class="btn btn-primary btn-sm" data-act="openAi">${ic('magic-wand', 'ic-16')}${t('ed/ai')}</button><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="slide${i}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="soon">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div>${uploadUI('slide' + i)}`;
      return `<div class="asset-row"><span class="grip">${ic('dots-six-vertical', 'ic-16')}</span><div class="asset compact" data-act="slideTo" data-arg="${i}"><div class="top"><span class="thumb" style="filter:${f}"></span><span><div class="nm">${t('ed/slide-n', { n: i + 1 })}</div><div class="sp">${i === 1 ? `<span style="color:var(--warning)">800×600 · ${t('ed/fp-bad-size')}</span>` : `${sz.w}×${sz.h}`}</div></span>${moreBtn('slide' + i)}</div></div></div>${uploadUI('slide' + i)}`;
    }).join('');
    return `${E.checksPassed ? '' : `<div class="notice">${ic('warning-circle-fill')}<div>${t('ed/chk-2')}<div class="caption faint">Banner</div></div></div>`}
      <div class="p-sec"><div class="lab">${t('ed/banner-spec')}</div>${sizeSeg}<div class="p-note">${t('ed/spec-line', sz)}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/banner-images', { n: B.slides.length })}</div>${slides}
        ${B.slides.length < 5 ? `<button class="btn btn-outline btn-sm" style="margin-top:8px" data-act="addSlide">${ic('plus', 'ic-16')}${t('ed/add-slide')}</button>` : ''}</div>
      <div class="p-sec"><div class="lab">${t('ed/indicator')}</div>${segBtns([{ v: 'dots', label: t('ed/ind-dots') }, { v: 'bars', label: t('ed/ind-bars') }, { v: 'none', label: t('ed/ind-none') }], B.ind, 'bannerInd')}</div>`;
  }
  function pxSeg(vals, cur, act, labels) {
    return `${segBtns(vals.map((v, i) => ({ v: String(v), label: labels ? labels[i] : v + ' px' })), String(cur), act)}`;
  }
  function bannerLayout() {
    const B = E.D.banner;
    const mk = [8, 16, 24], ck = [0, 8, 16];
    return `<div class="p-sec"><div class="lab">${t('ed/margin')}<span class="v">${B.margin} px</span></div>${pxSeg(mk, B.margin, 'bannerMargin', [t('ed/s-small'), t('ed/s-medium'), t('ed/s-large')])}<div class="seg-sub">${mk.map((v) => `<span class="${v === B.margin ? 'is-on' : ''}">${v} px</span>`).join('')}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/corner')}<span class="v">${B.corner} px</span></div>${pxSeg(ck, B.corner, 'bannerCorner', [t('ed/c-none'), t('ed/s-small'), t('ed/s-large')])}<div class="seg-sub">${ck.map((v) => `<span class="${v === B.corner ? 'is-on' : ''}">${v} px</span>`).join('')}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/banner-spec')}</div>${segBtns(['large', 'general', 'small'].map((v) => ({ v, label: t('ed/banner-' + v) })), B.size, 'bannerSize')}<div class="seg-sub">${Object.entries(BANNER).map(([k, v]) => `<span class="${k === B.size ? 'is-on' : ''}">${v.w}×${v.h}</span>`).join('')}</div></div>
      <div class="p-note">${ic('lock-fill', 'ic-16')}${t('ed/layout-note')}</div><div class="p-note">${t('ed/unit-750')}</div>`;
  }
  function bannerColor() {
    const th = liveTheme().th;
    const els = [['ed/el-placeholder', 'border', 'ed/use-ddt', 'ext/ddt_bg → base/border'], ['ed/el-ind-active', 'primary', 'ed/use-primary', 'base/primary'], ['ed/el-ind-def', 'neutral_3', 'ed/use-n3', 'base/neutral_3']];
    return `<div class="p-sec">${els.map(([n, k, u, adv]) => `<button class="elrow" data-act="pick" data-arg="${k}|panel"><span class="sw" style="background:${th[k]}"></span><span><div class="body-sm" style="font-weight:500">${t(n)}</div><div class="caption faint">${t(u)}${E.adv ? ' · ' + adv : ''}</div></span>${ic('lock-fill')}</button>`).join('')}
      ${E.picker && E.picker.where === 'panel' ? pickerHtml('in-panel') : ''}</div>
      <div class="p-note">${t('ed/color-note')}</div>
      <button class="p-note" style="align-items:center;margin-top:12px" data-act="toggleAdv"><span class="check ${E.adv ? 'is-on' : ''}">${E.adv ? ic('check', 'ic-16') : ''}</span>${t('ed/show-advanced')}</button>`;
  }
  function aiPanel() {
    const a = E.ai, sz = BANNER[E.D.banner.size];
    const kws = [1, 2, 3, 4, 5, 6, 7, 8];
    const cands = a.stage === 'generating' ? `<div class="cands">${[0, 1, 2, 3].map(() => '<div class="cand skeleton"></div>').join('')}</div><div class="rec-note">${ic('clock', 'ic-16')}${t('rec/generating')}</div>`
      : a.stage === 'cands' ? `<div class="cands">${CAND_F.map((f, i) => `<button class="cand ${a.cand === i ? 'is-on' : ''}" style="filter:${f}" data-act="pickCand" data-arg="${i}">${a.cand === i ? `<span class="ck">${ic('check', 'ic-16')}</span>` : ''}</button>`).join('')}</div>
        <div class="rec-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm ${a.cand == null ? 'is-disabled' : ''}" data-act="adoptCand">${t('ed/adopt')}</button><button class="btn btn-secondary btn-sm" data-act="closeAi">${t('ed/keep-current')}</button><button class="btn btn-outline btn-sm" data-act="aiGen">${ic('clock-counter-clockwise', 'ic-16')}${t('ed/regenerate')}</button></div><div class="p-note">${t('ed/ai-note')}</div>` : '';
    return `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="closeAi" title="${esc(t('ed/keep-current'))}">${ic('caret-left')}</button>${t('ed/ai-title')}</h2>
      <div class="p-note" style="margin:0 0 8px">${ic('magic-wand', 'ic-16')}${t('ed/ai-auto-hint')}</div>
      <div class="ai-box"><div class="in"><button class="refslot ${a.ref ? 'is-filled' : ''}" data-act="aiRef">${a.ref ? `<span class="rm" data-act="aiRefRm" data-stop>${ic('x', 'ic-16')}</span>` : `${ic('plus')}<span>${t('composer/ref-slot')}</span>`}</button>
        <div style="flex:1;min-width:0"><textarea data-input="aiPrompt">${esc(a.prompt)}</textarea>${a.kw.length ? `<div class="tagrow">${a.kw.map((k) => `<button class="chip is-on" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}${ic('x', 'ic-16')}</button>`).join('')}</div>` : ''}</div></div>
        <div class="ft"><span class="rel"><button class="c-opt" data-act="menu:toggle" data-arg="aiModel">${window.MODEL_LOGO[a.model]}${a.model === 'gpt' ? 'GPT Image' : 'Gemini'}${ic('caret-down', 'chev')}</button>${S.menu === 'aiModel' ? `<div class="menu c-menu">${['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${a.model === m ? 'is-on' : ''}" data-act="aiModel" data-arg="${m}">${window.MODEL_LOGO[m]}<span><div class="nm">${m === 'gpt' ? 'GPT Image' : 'Gemini'}</div><div class="ds">${t('model/' + m + '-desc')}</div></span></button>`).join('')}</div>` : ''}</span>
          <button class="send" data-act="aiGen">${ic('sparkle-fill')}20${ic('arrow-up')}</button></div></div>
      <div class="p-sec"><div class="lab">${t('ed/ai-style-title')}</div><div class="kw">${kws.map((k) => `<button class="chip ${a.kw.includes(k) ? 'is-on' : ''}" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}</button>`).join('')}</div>
        <div class="p-note">${t('ed/cost-ai')}</div><div class="p-note" style="margin-top:2px">${t('ed/spec-line', sz)}</div></div>
      ${a.stage !== 'idle' ? `<div class="p-sec"><div class="lab">${t('ed/ai-candidates')}</div>${cands}</div>` : ''}`;
  }
  function tbContent() {
    const D = E.D, it = D.tb.items;
    const eye = (k) => `<button class="eye" data-act="tbItem" data-arg="${k}">${ic(it[k] ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`;
    const card = (k, thumb, name, spec, extra = '') => `<div class="asset-row ${it[k] ? '' : 'is-hidden'}"><span class="grip" ${k === 'side' || k === 'search' ? `data-act="tbSwap"` : ''}>${ic('dots-six-vertical', 'ic-16')}</span><div class="asset"><div class="top">${thumb}<span style="min-width:0"><div class="nm">${name}</div><div class="sp">${spec}</div></span>${moreBtn('tb-' + k)}</div>${extra}</div>${eye(k)}</div>${uploadUI('tb-' + k)}`;
    const entries = D.tb.searchFirst
      ? [card('search', `<span class="thumb sq">${ic('magnifying-glass')}</span>`, t('ed/tb-search'), '48×48'), card('side', `<span class="thumb sq">${ic('list')}</span>`, t('ed/tb-sideicon'), '48×48')]
      : [card('side', `<span class="thumb sq">${ic('list')}</span>`, t('ed/tb-sideicon'), '48×48'), card('search', `<span class="thumb sq">${ic('magnifying-glass')}</span>`, t('ed/tb-search'), '48×48')];
    return `<div class="p-sec"><div class="lab">${t('ed/tb-state')}</div>${segBtns([{ v: 'out', label: t('ed/signed-out') }, { v: 'in', label: t('ed/signed-in') }], D.login ? 'in' : 'out', 'setLogin')}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-logo')}</div>${card('logo', `<span class="thumb logo" style="filter:${D.tb.logoF}"><img src="assets/logo-orb.webp" alt="">星河体育</span>`, 'Logo', '600×100 · PNG / SVG')}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-entries')}</div>${entries.join('')}
        <div class="side-pos" style="padding:0 0 0 30px"><span>${t('ed/side-pos')}</span><div class="iseg">${['left', 'right'].map((v) => `<button class="${D.side === v ? 'is-on' : ''}" data-act="setSide" data-arg="${v}">${t('ed/side-' + v)}</button>`).join('')}</div></div></div>
      <div class="p-sec"><div class="asset-row ${it.auth ? '' : 'is-hidden'}"><span class="grip">${ic('dots-six-vertical', 'ic-16')}</span><div style="flex:1;font-weight:600;font-size:var(--fs-body-sm)">${t(D.login ? 'ed/tb-balance' : 'ed/tb-auth')}</div>${eye('auth')}</div>
        <div class="p-note">${t(D.login ? 'ed/tb-balance-note' : 'ed/tb-auth-note')}</div></div>
      <div class="p-note">${t('ed/tb-del-note')}</div><div class="p-note">${t('ed/tb-fixed')}</div>`;
  }
  function tbLayout() {
    const tb = E.D.tb;
    const sec = (k, lab) => `<div class="p-sec"><div class="lab">${t(lab)}<span class="v">${tb[k]} px</span></div>${pxSeg(TB[k], tb[k], 'tbLayout_' + k)}</div>`;
    return sec('h', 'ed/tb-height') + sec('pad', 'ed/tb-padding') + sec('gap', 'ed/tb-gap') + `<div class="p-note">${t('ed/unit-750')}</div>`;
  }
  function tbColor() {
    const { th, tb } = liveTheme();
    const cur = { bg: tb.bg || th.bg_2, text: tb.text || th.lead, search: tb.search || th.primary, reg: tb.reg || th.accent_3 };
    const rows = [['bg', 'ed/tb-c-bg'], ['text', 'ed/tb-c-text'], ['search', 'ed/tb-c-search'], ['reg', 'ed/tb-c-reg']];
    return rows.map(([k, lab]) => `<div class="crow"><div class="k">${t(lab)}</div><div class="sws">${TB_SW[k].map((c) => `<button class="sw-btn ${cur[k].toLowerCase() === c ? 'is-on' : ''}" style="background:${c}" data-act="tbColor" data-arg="${k}|${c}"></button>`).join('')}<button class="rainbow ${E.picker && E.picker.tbRow === k ? 'is-on' : ''}" data-act="pickTb" data-arg="${k}"></button></div>${E.picker && E.picker.tbRow === k ? pickerHtml('in-panel', t(lab)) : ''}</div>`).join('') + `<div class="p-note">${t('ed/tb-c-note')}</div>`;
  }
  function modulePanel(id) {
    const b = baseName(id);
    if (b === 'banner' && E.ai) return aiPanel();
    const head = `<h2 class="p-title">${esc(modName(id))}</h2>`;
    if (b === 'banner') return head + tabs3(E.tab) + (E.tab === 'content' ? bannerContent() : E.tab === 'layout' ? bannerLayout() : bannerColor());
    if (b === 'topbar') return head + tabs3(E.tab) + (E.tab === 'content' ? tbContent() : E.tab === 'layout' ? tbLayout() : tbColor());
    if (window.MP.has(b)) return head + tabs3(E.tab) + window.MP.panel(b, E.tab);
    return head + window.empty('wrench-fill', t('ed/todo-title'), t('ed/todo-desc'));
  }
  function rightPanel() { return E.sel ? modulePanel(E.sel) : pageSettings(); }

  // ---------- 取色器 ----------
  function pickerHtml(cls = '', title) {
    const p = E.picker; const hsv = hex2hsv(p.value);
    const name = title || t('ed/key-' + p.key);
    const fixedRow = p.tbRow || p.elRow;
    const keyMenu = !fixedRow && S.menu === 'keymenu' ? `<div class="menu keymenu">${KEYS.map((k) => `<button class="menu-item ${p.key === k ? 'is-on' : ''}" data-act="pickKey" data-arg="${k}"><span class="sw" style="background:${E.D.theme[k]}"></span>${t('ed/key-' + k)}<span class="kk">${k}</span></button>`).join('')}</div>` : '';
    return `<div class="picker ${cls}" data-picker>
      <div class="pk-head">${fixedRow ? `<span class="pk-title">${esc(name)}</span>` : `<button class="pk-title" data-act="menu:toggle" data-arg="keymenu">${esc(name)}${ic('caret-down')}</button>`}${keyMenu}<span class="caption faint">${fixedRow ? '' : p.key}</span></div>
      <div class="pk-cmp"><div style="background:${p.orig};color:${inkOn(p.orig)}">${t('ed/pick-current')}</div><div data-pk-new style="background:${p.value};color:${inkOn(p.value)}">${t('ed/pick-new')}</div></div>
      <div class="pk-sv" data-drag="sv" style="background:hsl(${hsv.h},100%,50%)"><span class="pk-dot" data-pk-svdot style="left:${hsv.s * 100}%;top:${(1 - hsv.v) * 100}%;background:${p.value}"></span></div>
      <div class="pk-h" data-drag="hue"><span class="pk-dot" data-pk-hdot style="left:${(hsv.h / 360) * 100}%;background:hsl(${hsv.h},100%,50%)"></span></div>
      <label class="pk-hex"><i data-pk-sw style="background:${p.value}"></i><input data-input="pkHex" value="${p.value.toUpperCase()}" maxlength="7"></label>
      <div class="caption muted" style="margin-top:8px">${t('ed/pick-suggest')}</div>
      <div class="pk-sug">${SUGGEST.map((c) => `<button style="background:${c}" data-act="pkSet" data-arg="${c}"></button>`).join('')}</div>
      <div class="caption faint" style="margin-bottom:10px">${t('ed/pick-sync')}</div>
      <div class="pk-foot"><button class="btn btn-secondary btn-sm" data-act="pkCancel">${t('confirm/cancel')}</button><button class="btn btn-primary btn-sm" data-act="pkApply">${t('ed/pick-apply')}</button></div></div>`;
  }
  A.pick = (arg) => { const [k, where] = arg.split('|'); const v = E.D.theme[k]; E.picker = { key: k, orig: v, value: v, where: mobileEd() ? 'sheet' : where }; S.menu = null; if (mobileEd()) E.mpanel = 'picker'; };
  A.pickTb = (k) => { const th = E.D.theme; const cur = E.D.tb.colors[k] || { bg: th.bg_2, text: th.lead, search: th.primary, reg: th.accent_3 }[k]; if (E.picker && E.picker.tbRow === k) { E.picker = null; return; } E.picker = { key: k, tbRow: k, orig: cur, value: cur, where: 'tb' }; };
  A.pickKey = (k) => { const v = E.D.theme[k]; Object.assign(E.picker, { key: k, orig: v, value: v }); S.menu = null; };
  A.pkSet = (c) => { E.picker.value = c; };
  A.pkCancel = () => { E.picker = null; if (E.mpanel === 'picker') E.mpanel = 'colors'; };
  A.pkApply = () => {
    const p = E.picker; if (!p) return;
    if (p.value.toLowerCase() === p.orig.toLowerCase()) { E.picker = null; if (E.mpanel === 'picker') E.mpanel = null; return; }
    commit(() => { if (p.tbRow) E.D.tb.colors[p.tbRow] = p.value; else if (p.elRow) E.D.ec[p.elRow] = p.value; else { E.D.theme[p.key] = p.value; E.D.palette = null; } });
    E.picker = null; if (E.mpanel === 'picker') E.mpanel = null;
    const label = p.elRow ? t('mp/c-' + p.elRow.replace('.', '-')) : p.tbRow ? t({ bg: 'ed/tb-c-bg', text: 'ed/tb-c-text', search: 'ed/tb-c-search', reg: 'ed/tb-c-reg' }[p.tbRow]) : t('ed/key-' + p.key);
    window.toast(t('ed/toast-color', { k: label }), { action: () => { A.undo(); window.render(); }, actionLabel: t('ed/undo'), ms: 4000 });
  };
  I.pkHex = (v) => { if (validHex(v)) { E.picker.value = (v[0] === '#' ? v : '#' + v).toLowerCase(); livePicker(); } };
  function livePicker() {
    const p = E.picker; if (!p) return;
    const hsv = hex2hsv(p.value);
    document.querySelectorAll('.h5').forEach((n) => { n.style.cssText = themeStyle() + (n.dataset.extra || ''); });
    document.querySelectorAll('[data-pk-new],[data-pk-sw]').forEach((n) => { n.style.background = p.value; });
    document.querySelectorAll('[data-pk-new]').forEach((n) => { n.style.color = inkOn(p.value); });
    document.querySelectorAll('[data-pk-svdot]').forEach((n) => { n.style.left = hsv.s * 100 + '%'; n.style.top = (1 - hsv.v) * 100 + '%'; n.style.background = p.value; });
    document.querySelectorAll('[data-drag="sv"]').forEach((n) => { n.style.background = `hsl(${p.h != null ? p.h : hsv.h},100%,50%)`; });
    document.querySelectorAll('[data-pk-hdot]').forEach((n) => { const h = p.h != null ? p.h : hsv.h; n.style.left = (h / 360) * 100 + '%'; n.style.background = `hsl(${h},100%,50%)`; });
    document.querySelectorAll('[data-input="pkHex"]').forEach((n) => { if (document.activeElement !== n) n.value = p.value.toUpperCase(); });
  }

  // ---------- 拖动：取色、模块排序、Banner 滑动 ----------
  document.addEventListener('pointerdown', (e) => {
    const drag = e.target.closest('[data-drag]');
    if (drag && E.picker) {
      e.preventDefault();
      const kind = drag.dataset.drag; const rect = drag.getBoundingClientRect();
      const hsv0 = hex2hsv(E.picker.value); E.picker.h = E.picker.h != null ? E.picker.h : hsv0.h;
      const move = (ev) => {
        const x = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width)), y = Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height));
        const cur = hex2hsv(E.picker.value);
        if (kind === 'sv') E.picker.value = hsv2hex({ h: E.picker.h, s: x, v: 1 - y });
        else { E.picker.h = x * 359.9; E.picker.value = hsv2hex({ h: E.picker.h, s: cur.s || 0.8, v: cur.v || 0.9 }); }
        livePicker();
      };
      move(e);
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      return;
    }
    const grip = e.target.closest('[data-grip]');
    if (grip) { startReorder(e, grip); return; }
    const vp = e.target.closest('[data-swipe]');
    if (vp) {
      const x0 = e.clientX;
      const up = (ev) => { window.removeEventListener('pointerup', up); const dx = ev.clientX - x0; if (Math.abs(dx) > 30) { const n = E.D.banner.slides.length; setSlide((E.slide + (dx < 0 ? 1 : -1) + n) % n); E.swiped = Date.now(); } };
      window.addEventListener('pointerup', up);
    }
  });
  function startReorder(e, grip) {
    e.preventDefault();
    const id = grip.dataset.grip; const list = grip.closest('[data-drag-list]'); if (!list) return;
    const rows = [...list.querySelectorAll('[data-row]')]; const src = rows.find((r) => r.dataset.row === id);
    src.classList.add('is-dragging'); let target = null;
    const move = (ev) => {
      rows.forEach((r) => r.classList.remove('drop-before', 'drop-after'));
      target = null;
      for (const r of rows) { const b = r.getBoundingClientRect(); if (ev.clientY >= b.top && ev.clientY <= b.bottom && r !== src) { const before = ev.clientY < b.top + b.height / 2; r.classList.add(before ? 'drop-before' : 'drop-after'); target = { id: r.dataset.row, before }; } }
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      const key = list.dataset.dragList;
      if (target && key) commit(() => { const arr = E.D.m[key].items; const from = +id; const it = arr.splice(from, 1)[0]; let i = +target.id; if (i > from) i--; if (!target.before) i++; arr.splice(i, 0, it); });
      else if (target) commit(() => { const o = E.D.order.filter((x) => x !== id); let i = o.indexOf(target.id); if (!target.before) i++; o.splice(i, 0, id); E.D.order = o; });
      window.render();
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }

  // ---------- Banner 轮播 ----------
  function setSlide(i) {
    E.slide = i;
    document.querySelectorAll('.h5-banner .track').forEach((n) => { n.style.transform = `translateX(${-i * 100}%)`; });
    document.querySelectorAll('.h5-ind').forEach((w) => [...w.children].forEach((d, k) => d.classList.toggle('on', k === i)));
    if (E.sel === 'banner' && !E.ai) window.render();
  }
  setInterval(() => {
    if (S.route !== 'editor' || E.loading || (E.sel === 'banner') || E.picker || document.hidden) return;
    if (E.swiped && Date.now() - E.swiped < 3000) return;
    const n = E.D.banner.slides.length; setSlide((E.slide + 1) % n);
  }, 3000);
  A.slideTo = (i) => { setSlide(+i); return false; };

  // ---------- 选择与模块操作 ----------
  A.selMod = (id, el, e) => {
    if (e && e.target.closest('[data-stop]') && !el.matches('[data-stop]')) return false;
    if (Date.now() - (E.swiped || 0) < 300) return false;
    const nid = id || null;
    if (nid !== E.sel) { E.tab = 'content'; E.ai = null; E.picker = null; }
    E.sel = nid; S.menu = null;
    E.h5side = nid === 'sidebar';
    if (mobileEd()) E.mpanel = nid ? 'module' : null;
  };
  A.setTab = (v) => { E.tab = v; E.picker = null; };
  A.tbTab = (v) => { E.tab = v; E.ai = null; if (mobileEd()) E.mpanel = 'module'; };
  A.toggleHide = (id) => { commit(() => { E.D.hidden[id] = !E.D.hidden[id]; }); S.menu = null; if (id === 'sidebar') E.h5side = false; };
  A.move = (d) => { const id = E.sel; const o = E.D.order; const i = o.indexOf(id), j = i + +d; if (i < 0 || j < 0 || j >= o.length) return false; commit(() => { o.splice(i, 1); o.splice(j, 0, id); }); };
  A.modDup = (id) => { commit(() => { const b = baseName(id); const n = E.D.order.filter((x) => baseName(x) === b).length; const nid = b + '~' + n; E.D.order.splice(E.D.order.indexOf(id) + 1, 0, nid); E.sel = nid; }); S.menu = null; window.toast(t('ed/dup-toast')); };
  A.modReset = (id) => {
    commit(() => { const d = defaultDesign(); const b = baseName(id); if (b === 'topbar') E.D.tb = d.tb; if (b === 'banner') E.D.banner = d.banner; if (d.m[b]) E.D.m[b] = d.m[b]; window.MP.resetColors(b); E.D.hidden[id] = false; });
    S.menu = null; window.toast(t('ed/reset-toast'));
  };
  // 删除：页面里的流式模块真正移除（可撤销、可从「添加模块」加回来）；顶部栏 / 底部导航 / 侧边栏是固定模块，只能隐藏
  A.modDel = (id) => {
    const inFlow = E.D.order.includes(id);
    commit(() => { if (inFlow) E.D.order = E.D.order.filter((x) => x !== id); else E.D.hidden[id] = true; });
    if (E.sel === id) E.sel = null; S.menu = null; if (E.mpanel === 'module') E.mpanel = null;
    if (inFlow) window.toast(t('ed/deleted-toast', { m: modName(id) }), { action: () => { A.undo(); window.render(); }, actionLabel: t('ed/undo'), ms: 5000 });
  };
  const ADDABLE = ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer', 'menubar'];
  A.addMod = (b) => {
    let id = b; let n = 1; while (E.D.order.includes(id)) id = b + '~' + n++;
    commit(() => { const i = E.D.order.indexOf(E.sel); if (i >= 0) E.D.order.splice(i + 1, 0, id); else E.D.order.push(id); E.D.hidden[id] = false; });
    S.menu = null; E.tab = 'content'; E.ai = null; E.picker = null;
    if (mobileEd()) { E.mpanel = 'modules'; E.sel = null; } else E.sel = b === 'menubar' ? null : id;
    window.toast(t('ed/added-toast', { m: modName(id) }));
    setTimeout(() => { const n2 = document.querySelector(`.h5 [data-mod="${id}"]`); if (n2) n2.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30);
  };
  // 左栏可滚动会裁掉菜单，所以「添加模块」菜单用 fixed 定位到按钮正下方（往下弹）
  window.AFTER_RENDER.push(() => {
    const m = document.querySelector('.add-menu'); if (!m) return;
    const r = m.parentElement.querySelector('.add-mod').getBoundingClientRect();
    m.style.position = 'fixed'; m.style.left = r.left + 'px'; m.style.top = (r.bottom + 6) + 'px';
    m.style.maxHeight = (window.innerHeight - r.bottom - 18) + 'px'; m.style.overflow = 'auto';
  });
  A.addMenu = () => { if (mobileEd()) { E.mpanel = 'addmod'; S.menu = null; } else S.menu = S.menu === 'addmod' ? null : 'addmod'; };
  function addList() {
    return `<div class="add-hd"><div class="t">${t('ed/add-title')}</div><div class="caption faint">${t('ed/add-hint')}</div></div><div class="add-grid">${ADDABLE.map((b) => {
      const ico = { banner: 'image-fill', jackpot: 'sparkle-fill', midnav: 'list', gamemenu: 'squares-four', gamecards: 'squares-four-fill', footer: 'file-image', menubar: 'layout-fill' }[b];
      const inPage = E.D.order.some((x) => baseName(x) === b);
      return `<button class="add-it" data-act="addMod" data-arg="${b}"><span class="tile">${ic(ico)}</span><span class="tx"><span class="nm">${t(MODS[b].key)}</span><span class="ds">${t('ed/desc-' + b)}</span></span>${inPage ? `<span class="tag">${t('ed/add-in-page')}</span>` : ''}</button>`;
    }).join('')}</div>`;
  }
  A.setSide = (v) => { commit(() => { E.D.side = v; }); };
  A.h5Side = () => { E.h5side = true; E.sel = 'sidebar'; if (mobileEd()) E.mpanel = 'module'; };
  A.h5SideClose = (a, el, e) => { if (e.target.closest('.pn')) return false; E.h5side = false; if (E.sel === 'sidebar') E.sel = null; if (mobileEd()) E.mpanel = null; };
  A.setLogin = (v) => { commit(() => { E.D.login = v === 'in'; }); };
  A.setPalette = (k) => { commit(() => { E.D.theme = preset(k); E.D.palette = k; }); E.picker = null; };
  A.setTemplate = (k) => { const map = { 'classic-blue': 'blue', 'midnight-gold': 'gold', 'fresh-green': 'green', 'western-white': 'purple' }; commit(() => { E.D.template = k; E.D.theme = preset(map[k]); E.D.palette = map[k]; }); };
  I.pageHeight = (v) => { E.D.height = +v || E.D.height; };
  A.toggleAdv = () => { E.adv = !E.adv; };
  A.bannerSize = (v) => { commit(() => { E.D.banner.size = v; }); };
  A.bannerInd = (v) => { commit(() => { E.D.banner.ind = v; }); };
  A.bannerMargin = (v) => { commit(() => { E.D.banner.margin = +v; }); };
  A.bannerCorner = (v) => { commit(() => { E.D.banner.corner = +v; }); };
  A.addSlide = () => { commit(() => { E.D.banner.slides.push('hue-rotate(90deg) saturate(.8)'); }); setSlide(E.D.banner.slides.length - 1); };
  A.tbItem = (k) => { commit(() => { E.D.tb.items[k] = !E.D.tb.items[k]; }); };
  A.tbSwap = () => { commit(() => { E.D.tb.searchFirst = !E.D.tb.searchFirst; }); };
  A.tbColor = (arg) => { const [k, c] = arg.split('|'); commit(() => { E.D.tb.colors[k] = c; }); E.picker = null; };
  ['h', 'pad', 'gap'].forEach((k) => { A['tbLayout_' + k] = (v) => { commit(() => { E.D.tb[k] = +v; }); }; });
  A.setDevice = (v) => { E.device = v; if (v === 'pc') { E.sel = null; E.ai = null; } };
  A.zoom = (d) => { const z = [25, 50, 75, 100]; const i = z.indexOf(E.zoom) + +d; if (i >= 0 && i < z.length) E.zoom = z[i]; };
  A.togglePal = () => { E.palOpen = !E.palOpen; if (!E.palOpen && E.picker && E.picker.where === 'float') E.picker = null; };
  A.edBack = () => { window.go('home'); return false; };

  // 素材：上传 / 菜单
  A.toolReplace = () => { E.tab = 'content'; E.ai = null; S.menu = null; E.fpSlot = 'slide' + E.slide; E.dlg = 'fp'; };
  A.amUpload = (slot) => { S.menu = null; E.fpSlot = slot; E.dlg = 'fp'; };
  A.amReset = (slot) => { S.menu = null; commit(() => { if (slot.startsWith('slide')) E.D.banner.slides[+slot.slice(5)] = SLIDE_F[+slot.slice(5)] || 'none'; if (slot === 'tb-logo') E.D.tb.logoF = 'none'; if (slot.startsWith('mp-')) window.MP.setAsset(slot, null); }); window.toast(t('ed/reset-toast')); };
  A.amToggle = (slot) => { S.menu = null; if (slot.startsWith('mp-')) { window.MP.toggleAsset(slot); return; } if (slot.startsWith('tb-')) A.tbItem(slot.slice(3)); else window.comingSoon(); };
  A.fpPick = (f) => {
    const slot = E.fpSlot; E.dlg = null; E.upload = { slot, pct: 0 }; E.replaced = null;
    const timer = setInterval(() => {
      E.upload.pct = Math.min(100, E.upload.pct + 9);
      const b = document.querySelector('[data-upl]'); if (b) b.textContent = E.upload.pct + '%';
      const bar = document.querySelector('[data-uplbar]'); if (bar) bar.style.width = E.upload.pct + '%';
      if (E.upload.pct >= 100) {
        clearInterval(timer);
        const prev = slot.startsWith('mp-') ? window.MP.getAsset(slot) : slot.startsWith('slide') ? E.D.banner.slides[+slot.slice(5)] : E.D.tb.logoF;
        commit(() => { if (slot.startsWith('mp-')) window.MP.setAsset(slot, f); else if (slot.startsWith('slide')) E.D.banner.slides[+slot.slice(5)] = f; else if (slot === 'tb-logo') E.D.tb.logoF = f; });
        E.upload = null; E.replaced = { slot, prev }; window.toast(t('ed/upload-done')); window.render();
      }
    }, 140);
    E.upload.timer = timer;
  };
  A.cancelUpload = () => { if (E.upload) clearInterval(E.upload.timer); E.upload = null; };
  A.undoReplace = () => { const r = E.replaced; if (!r) return; commit(() => { if (r.slot.startsWith('mp-')) window.MP.setAsset(r.slot, r.prev); else if (r.slot.startsWith('slide')) E.D.banner.slides[+r.slot.slice(5)] = r.prev; else E.D.tb.logoF = r.prev; }); E.replaced = null; };

  // AI 生成
  A.openAi = () => { E.sel = 'banner'; E.picker = null; S.menu = null; const sz = BANNER[E.D.banner.size]; E.ai = { prompt: t('ed/ai-auto-prompt', { w: sz.w, h: sz.h }), kw: [], ref: false, model: 'gpt', stage: 'idle', cand: null }; if (mobileEd()) E.mpanel = 'module'; };
  A.closeAi = () => { E.ai = null; };
  I.aiPrompt = (v) => { E.ai.prompt = v; };
  A.aiKw = (k) => { const a = E.ai.kw; const n = +k; const i = a.indexOf(n); if (i >= 0) a.splice(i, 1); else a.push(n); };
  A.aiRef = () => { E.ai.ref = true; };
  A.aiRefRm = () => { E.ai.ref = false; };
  A.aiModel = (m) => { E.ai.model = m; S.menu = null; };
  A.aiGen = () => { E.ai.stage = 'generating'; E.ai.cand = null; setTimeout(() => { if (E.ai) { E.ai.stage = 'cands'; window.render(); } }, 1500); };
  A.pickCand = (i) => { E.ai.cand = +i; };
  A.adoptCand = () => { const a = E.ai; if (a.cand == null) return false; commit(() => { E.D.banner.slides[E.slide] = CAND_F[a.cand]; }); E.ai = null; E.replaced = { slot: 'slide' + E.slide, prev: SLIDE_F[E.slide] }; window.toast(t('ed/am-replaced')); };

  // 检查 / 导出
  A.openChecks = () => { E.dlg = 'checks'; S.menu = null; };
  A.openExport = () => { E.dlg = 'export'; E.exp.stage = 'ready'; };
  A.locate = (id) => { E.dlg = null; A.selMod(id); };
  A.markAll = () => { E.checksPassed = true; };
  A.expOpt = (k) => { E.exp.opts[k] = !E.exp.opts[k]; };
  A.doExport = () => {
    if (!E.checksPassed) { E.dlg = 'checks'; return; }
    if (!Object.values(E.exp.opts).some(Boolean)) return false;
    E.exp.stage = 'exporting';
    setTimeout(() => { if (E.dlg === 'export') { E.exp.stage = 'done'; window.render(); } }, 1800);
  };
  A.dlFile = () => { window.toast(t('ed/exp-dl-started')); return false; };
  A.closeDlg = () => { E.dlg = null; if (mobileEd() && ['checks', 'export'].includes(E.mpanel)) E.mpanel = null; };

  function checksBody() {
    const item = (lvl, key, mod, modKey) => `<div class="chk">${ic(lvl === 'err' ? 'warning-circle-fill' : lvl === 'warn' ? 'warning-circle-fill' : 'check-circle-fill')}<div class="tx">${t(key)}<small>${t(modKey)}</small></div>${mod ? `<button class="btn btn-secondary btn-sm" data-act="locate" data-arg="${mod}">${t('ed/locate')}</button>` : ''}</div>`;
    const colorOf = (l) => `style="color:var(--${l === 'err' ? 'error' : l === 'warn' ? 'warning' : 'success'})"`;
    const body = E.checksPassed
      ? `<div class="notice is-ok">${ic('check-circle-fill')}${t('ed/exp-ready')}</div><div class="chk-grp ok">${t('ed/passed')}</div>${['ed/chk-1', 'ed/chk-2', 'ed/chk-3', 'ed/chk-4', 'ed/chk-ok'].map((k) => `<div class="chk"><span ${colorOf('ok')}>${ic('check-circle-fill')}</span><div class="tx">${t(k)}</div></div>`).join('')}`
      : `<p class="muted" style="margin:0">${t('ed/checks-sub')}</p>
        <div class="chk-grp err">${t('ed/required')}</div>${[['ed/chk-1', 'midnav', 'mod/midnav'], ['ed/chk-2', 'banner', 'mod/banner'], ['ed/chk-3', 'bottomnav', 'mod/bottomnav']].map(([k, m, mk]) => item('err', k, m, mk).replace('<svg', `<span ${colorOf('err')}><svg`).replace('</svg>', '</svg></span>')).join('')}
        <div class="chk-grp warn">${t('ed/suggested')}</div>${item('warn', 'ed/chk-4', 'jackpot', 'cat/jackpot').replace('<svg', `<span ${colorOf('warn')}><svg`).replace('</svg>', '</svg></span>')}
        <div class="chk-grp ok">${t('ed/passed')}</div><div class="chk"><span ${colorOf('ok')}>${ic('check-circle-fill')}</span><div class="tx">${t('ed/chk-ok')}<small>${t('ed/passed')}</small></div></div>
        <button class="btn btn-secondary btn-block" style="margin-top:16px" data-act="markAll">${ic('check-circle-fill', 'ic-16')}${t('ed/chk-demo')}</button>`;
    return `<div class="dialog-head"><h3>${t('ed/checks-title')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div>${body}`;
  }
  function exportBody() {
    const x = E.exp;
    if (x.stage === 'exporting') return `<div class="dialog-head"><h3>${t('ed/exp-ing')}</h3></div><p class="muted">${t('ed/exp-ing-d')}</p><div class="progress"><i style="width:100%;transition:width 1.8s linear" data-expbar></i></div>`;
    if (x.stage === 'done') {
      const files = [x.opts.figma && ['星河体育-首页.fig', 'Figma'], x.opts.png && ['星河体育-首页-PNG.zip', 'PNG'], x.opts.svg && ['星河体育-首页-SVG.zip', 'SVG'], ['theme.json', 'JSON']].filter(Boolean);
      return `<div class="dialog-head"><h3>${ic('check-circle-fill')} ${t('ed/exp-done')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><p class="muted">${t('ed/exp-done-d')}</p>
        <div class="files">${files.map(([n, k]) => `<div class="f">${ic(k === 'Figma' ? 'file-image' : 'download-simple')}<span class="n ellipsis">${n}</span><button class="btn btn-secondary btn-sm" data-act="dlFile">${t('rec/download').replace('PNG', '').trim() || 'Download'}</button></div>`).join('')}</div>
        <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('ed/done')}</button><button class="btn btn-primary" data-act="dlFile">${ic('download-simple', 'ic-16')}${t('ed/exp-dl-all')}</button></div>`;
    }
    const opt = (k, n, d) => `<button class="exp-opt ${x.opts[k] ? 'is-on' : ''}" data-act="expOpt" data-arg="${k}"><span class="check ${x.opts[k] ? 'is-on' : ''}">${x.opts[k] ? ic('check', 'ic-16') : ''}</span><span><b class="body-sm">${t(n)}</b><small>${t(d)}</small></span></button>`;
    return `<div class="dialog-head"><h3>${t('ed/export-title')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div>
      ${E.checksPassed ? `<div class="notice is-ok" style="margin-bottom:12px">${ic('check-circle-fill')}${t('ed/exp-ready')}</div>` : `<div class="notice is-warn" style="margin-bottom:12px;align-items:center">${ic('warning-circle-fill')}<span style="flex:1">${t('ed/exp-blocked', { n: 3 })}</span><button class="btn btn-secondary btn-sm" data-act="openChecks">${t('ed/go-check')}</button></div>`}
      ${opt('figma', 'ed/exp-figma', 'ed/exp-figma-d')}${opt('png', 'ed/exp-png', 'ed/exp-png-d')}${opt('svg', 'ed/exp-svg', 'ed/exp-svg-d')}
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary ${E.checksPassed ? '' : 'is-disabled'}" data-act="doExport">${ic('download-simple', 'ic-16')}${t('ed/export-btn')}</button></div>`;
  }
  function fpBody() {
    const files = [['banner-spring.png', '1020×300 · 820 KB', 'hue-rotate(170deg) saturate(1.3)', true], ['banner-match.png', '1020×300 · 1.1 MB', 'hue-rotate(-90deg)', true], ['banner-old.jpg', '800×600 · 640 KB', 'grayscale(.6)', false]];
    return `<div class="dialog-head"><h3>${t('ed/fp-title')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><p class="caption muted" style="margin:0 0 12px">${t('ed/fp-note')}</p>
      <div class="fp-grid">${files.map(([n, s, f, ok]) => `<button class="fp" data-act="fpPick" data-arg="${f}" ${ok ? '' : 'disabled'}><span class="im" style="filter:${f}"></span><span class="n ellipsis">${n}</span><span class="s ${ok ? '' : 'bad'}">${ok ? s : s + ' · ' + t('ed/fp-bad-size')}</span></button>`).join('')}</div>`;
  }
  function dialogs() {
    if (!E.dlg) return '';
    const body = E.dlg === 'checks' ? checksBody() : E.dlg === 'export' ? exportBody() : fpBody();
    const wrap = mobileEd() ? (b) => `<div class="scrim" data-act="closeDlg"></div><div class="sheet med-sheet"><div class="sheet-grab"></div>${b}</div>` : (b) => `<div class="scrim" data-act="closeDlg"></div><div class="dialog dialog-wide">${b}</div>`;
    return wrap(body);
  }

  // ---------- 桌面视图 ----------
  function floats() {
    const th = liveTheme().th;
    const pal = E.palOpen
      ? `<div class="fpal-x"><div class="hd">${ic('paint-brush-fill', 'ic-16')}${t('ed/palette')}<span class="sb-spacer"></span><button class="ibtn ibtn-sm" data-act="togglePal">${ic('caret-down', 'ic-16')}</button></div>
          ${[['ed/grp-primary', ['primary', 'lead']], ['ed/grp-text', ['neutral_1', 'neutral_2', 'neutral_3']], ['ed/grp-bg', ['bg_1', 'bg_2', 'border']], ['ed/grp-accent', ['accent_1', 'accent_2', 'accent_3']]].map(([g, ks]) => `<div class="lab">${t(g)}</div><div class="sws">${ks.map((k) => `<button class="sw-btn ${E.picker && E.picker.key === k && E.picker.where === 'float' ? 'is-on' : ''}" style="background:${th[k]}" title="${esc(t('ed/key-' + k))}" data-act="pick" data-arg="${k}|float"></button>`).join('')}</div>`).join('')}
          <div class="caption faint" style="margin-top:8px">${t('ed/palette-hint')}</div></div>`
      : `<button class="fpal" data-act="togglePal" title="${esc(t('ed/palette'))}">${ic('paint-brush-fill', 'ic-16')}${['primary', 'lead', 'neutral_1', 'bg_2', 'accent_1'].map((k) => `<span class="sw" style="background:${th[k]}"></span>`).join('')}${ic('caret-up', 'ic-16')}</button>`;
    const picker = E.picker && E.picker.where === 'float' ? pickerHtml() : '';
    return `<div class="ed-floats"><div>${picker}${E.device === 'h5' ? pal : ''}<div class="zb"><button class="ibtn ibtn-sm" data-act="zoom" data-arg="-1">${ic('minus', 'ic-16')}</button><span>${E.zoom}%</span><button class="ibtn ibtn-sm" data-act="zoom" data-arg="1">${ic('plus', 'ic-16')}</button></div></div></div>`;
  }
  function checkBtn(cls = '') {
    return `<button class="btn btn-sm btn-check ${E.checksPassed ? 'is-ok' : ''} ${cls}" data-act="openChecks">${ic(E.checksPassed ? 'check-circle-fill' : 'warning-circle-fill', 'ic-16')}${E.checksPassed ? t('ed/check-passed') : t('ed/check-n', { n: 3 })}</button>`;
  }
  function desktop() {
    const scale = E.zoom / 50;
    // PC 画布由 E 组 js/pc.js 提供；未加载时保持待设计空状态
    const canvas = window.PC && E.device === 'pc' ? window.PC.canvas() : E.device === 'pc'
      ? `<div class="pc-empty">${window.empty('wrench-fill', t('ed/pc-todo-title'), t('ed/pc-todo-desc'), `<button class="btn btn-secondary btn-sm" data-act="setDevice" data-arg="h5">${t('ed/back-h5')}</button>`)}</div>`
      : `<div class="ed-stage" style="padding-bottom:${120 + 815 * (scale - 1)}px"><div class="ed-zoom" style="transform:scale(${scale})">${h5()}</div></div>`;
    return `<div class="ed">
      <header class="ed-top"><button class="ibtn ibtn-sm" data-act="edBack" title="${esc(t('nav/home'))}">${ic('caret-left')}</button><span class="ed-name">星河体育 · 首页</span>
        <span class="lv-pill"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span><span class="ed-saved">${ic('check-circle-fill')}<span>${t('ed/saved')}</span></span>
        <div class="iseg" style="margin-left:12px">${[['h5', 'device-mobile', 'ed/device-h5'], ['pc', 'desktop', 'ed/device-pc']].map(([v, i, k]) => `<button class="${E.device === v ? 'is-on' : ''}" data-act="setDevice" data-arg="${v}" title="${esc(t(k))}">${ic(i)}</button>`).join('')}</div>
        ${E.device === 'h5' ? `<div class="iseg">${[['out', 'ed/signed-out'], ['in', 'ed/signed-in']].map(([v, k]) => `<button class="${(E.D.login ? 'in' : 'out') === v ? 'is-on' : ''}" data-act="setLogin" data-arg="${v}">${t(k)}</button>`).join('')}</div>` : ''}
        <span class="spacer"></span>
        <button class="ibtn ibtn-sm" data-act="undo" ${E.past.length ? '' : 'disabled'} title="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="redo" ${E.future.length ? '' : 'disabled'}>${ic('arrow-u-up-right')}</button>
        ${checkBtn()}<button class="btn btn-primary btn-sm" data-act="openExport">${ic('download-simple', 'ic-16')}${t('ed/export')}</button></header>
      <div class="ed-body"><nav class="ed-left" data-sk="ed-left">${tree()}</nav>
        <main class="ed-canvas" data-sk="ed-canvas" data-act="canvasBg">${canvas}${floats()}</main>
        <aside class="ed-right" data-sk="ed-right">${rightPanel()}</aside></div></div>${dialogs()}`;
  }
  A.canvasBg = (a, el, e) => { if (e.target === el || e.target.classList.contains('ed-stage')) { if (E.sel || E.picker) { E.sel = null; E.ai = null; E.picker = null; return; } } return false; };

  // ---------- 手机视图 ----------
  function mobile() {
    const scale = 343 / 375;
    const panel = mobilePanel();
    return `<div class="med">
      <header class="med-nav"><button class="ibtn" data-act="edBack">${ic('caret-left')}</button><div class="tt"><b>星河体育 · 首页</b><small>${t('ed/saved')}</small></div>
        <button class="ibtn ibtn-sm warn ${E.checksPassed ? 'is-ok' : ''}" data-act="mPanel" data-arg="checks">${ic(E.checksPassed ? 'check-circle-fill' : 'warning-circle-fill')}</button>
        <button class="btn btn-primary btn-sm" data-act="mPanel" data-arg="export">${ic('download-simple', 'ic-16')}${t('ed/export')}</button></header>
      <main class="med-canvas" data-sk="med-canvas" data-act="canvasBg"><div class="med-stage"><div style="width:343px;height:auto"><div style="transform:scale(${scale});transform-origin:top left;width:375px">${h5()}</div></div></div>
        ${E.mpanel ? '' : `<div class="med-login"><div class="iseg">${[['out', 'ed/signed-out'], ['in', 'ed/signed-in']].map(([v, k]) => `<button class="${(E.D.login ? 'in' : 'out') === v ? 'is-on' : ''}" data-act="setLogin" data-arg="${v}">${t(k)}</button>`).join('')}</div></div>
        <button class="fab" data-act="mPanel" data-arg="colors" aria-label="${esc(t('ed/m-colors'))}">${ic('paint-brush-fill')}<i style="background:${E.D.theme.primary}"></i></button>`}</main>
      <nav class="med-tools">${[['pages', 'squares-four-fill', 'ed/pages'], ['modules', 'layout-fill', 'ed/m-modules'], ['colors', 'palette-fill', 'ed/m-colors'], ['preview', 'eye-fill', 'ed/m-preview']].map(([id, i, k]) => `<button class="${E.mpanel === id ? 'is-on' : ''}" data-act="mPanel" data-arg="${id}">${ic(i)}${t(k)}</button>`).join('')}</nav>
    </div>${panel}${E.preview ? `<div class="preview-full"><button class="ibtn ibtn-secondary x" data-act="closePreview">${ic('x')}</button>${h5()}</div>` : ''}${dialogs()}`;
  }
  A.mPanel = (id) => {
    if (id === 'preview') { E.preview = true; E.sel = null; return; }
    if (id === 'checks' || id === 'export') { E.dlg = id; if (id === 'export') E.exp.stage = 'ready'; return; }
    E.mpanel = E.mpanel === id ? null : id; E.picker = null;
  };
  A.closePreview = () => { E.preview = false; };
  A.mIconClose = () => { E.mpanel = 'module'; E.iconMenu = null; };
  A.mClose = () => { E.mpanel = null; E.picker = null; E.ai = null; if (E.sel) E.sel = null; S.menu = null; };
  function mobilePanel() {
    if (!E.mpanel) return '';
    let head = '', body = '';
    if (E.mpanel === 'pages') { head = t('ed/pages'); body = `<div class="row ${E.sel === null ? 'is-on' : ''}"><span class="dot ${E.checksPassed ? 'done' : 'check'}"></span>${ic('house-fill', 'ic-16')}<span class="nm">${t('cat/home')}</span></div>` + pageSettings().replace(/<h2[\s\S]*?<\/h2>/, ''); }
    else if (E.mpanel === 'modules') { head = t('ed/m-modules'); body = tree().replace(/^[\s\S]*?<div class="grp-label">/, '<div class="grp-label">').replace(/<div class="grp-label">[^<]*<\/div>\s*<div class="row[\s\S]*?<div class="divider"><\/div>/, ''); }
    else if (E.mpanel === 'colors') { head = t('ed/m-colors'); body = pageSettings().replace(/<h2[\s\S]*?<\/h2>\s*<p class="p-sub">[\s\S]*?<\/p>/, '').replace(/<div class="p-sec"><div class="lab">[^<]*<\/div><div class="tplchips">[\s\S]*$/, ''); }
    else if (E.mpanel === 'iconmenu') { return `<div class="scrim" data-act="mIconClose"></div><div class="sheet med-sheet icon-sheet" data-sk="msheet"><div class="sheet-grab"></div>${window.MP.iconSheet()}</div>`; }
    else if (E.mpanel === 'addmod') { return `<div class="scrim" data-act="mClose"></div><div class="sheet med-sheet add-sheet" data-sk="msheet"><div class="sheet-grab"></div>${addList()}</div>`; }
    else if (E.mpanel === 'picker' && E.picker) { return `<div class="scrim" data-act="pkCancel"></div><div class="sheet med-sheet"><div class="sheet-grab"></div>${pickerHtml('in-panel').replace('class="picker in-panel"', 'class="picker in-panel" style="border:0;padding:0;margin:0;background:none"')}</div>`; }
    else if (E.mpanel === 'module' && E.sel) {
      const inner = modulePanel(E.sel);
      head = ''; body = inner.replace('<h2 class="p-title">', `<div class="sheet-head"><h2 class="p-title" style="margin:0">`).replace('</h2>', `</h2><span class="sb-spacer"></span><span class="rel"><button class="ibtn ibtn-sm" data-act="menu:toggle" data-arg="mmodmenu">${ic('dots-three')}</button>${S.menu === 'mmodmenu' ? moduleMenu(E.sel).replace('class="menu"', 'class="menu" style="top:calc(100% + 4px);right:0"') : ''}</span><button class="ibtn ibtn-sm" data-act="mClose">${ic('x')}</button></div>`);
      return `<div class="sheet med-sheet" style="box-shadow:var(--shadow-lg)" data-sk="msheet"><div class="sheet-grab"></div>${body}</div>`;
    } else return '';
    return `<div class="scrim" data-act="mClose"></div><div class="sheet med-sheet" data-sk="msheet"><div class="sheet-grab"></div><div class="sheet-head"><h3>${head}</h3><button class="ibtn ibtn-sm" data-act="mClose">${ic('x')}</button></div>${body}</div>`;
  }

  // ---------- 加载页 ----------
  function loading() {
    const steps = ['ed/load-step-1', 'ed/load-step-2', 'ed/load-step-3'];
    return `<div class="ed-loading"><div class="ld-card"><img src="assets/logo-orb.webp" alt=""><h3>${t('ed/loading-title')}</h3>${steps.map((k, i) => `<div class="ld-step ${i < E.step ? 'is-done' : i === E.step ? 'is-on' : ''}">${ic(i < E.step ? 'check-circle-fill' : i === E.step ? 'clock-counter-clockwise' : 'clock')}${t(k)}</div>`).join('')}<div class="caption faint" style="margin-top:12px">${t('ed/loading-tip')}</div></div></div>`;
  }

  window.EDX = { E, commit, liveTheme, themeStyle, modWrap, selToolbar, modHtml, pickerHtml, segBtns: (...a) => segBtns(...a), pxSeg: (...a) => pxSeg(...a), moreBtn: (...a) => moreBtn(...a), uploadUI: (...a) => uploadUI(...a), mobileEd, baseName, modName };
  window.VIEWS.editor = function () { if (E.loading) return loading(); return mobileEd() ? mobile() : desktop(); };
  window.ED = { isOpen: () => S.route === 'editor' && !!(E.dlg || E.picker || E.mpanel || E.preview || E.ai), escape() { E.dlg = null; E.picker = null; E.mpanel = null; E.preview = false; E.ai = null; } };
})();
