/* 编辑器内页：三栏（桌面/iPad 横屏）或画布 + 底部工具（手机/折叠屏/iPad 竖屏 < 840）。
 * 第五轮 C：ED-01…ED-19、ED-21、ED-23。设计数据按项目名存 LS（刷新后一致）；扣点 / 通知 / 充值走 core.js 的共用接口。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const LS = window.LS;
  const KEYS = ['primary', 'lead', 'neutral_1', 'neutral_2', 'neutral_3', 'border', 'bg_1', 'bg_2', 'accent_1', 'accent_2', 'accent_3'];
  const PRESETS = {
    blue: ['#1678ff', '#333333', '#666666', '#999999', '#cccccc', '#e3e3e3', '#f8f8f8', '#ffffff', '#04be02', '#ea4e3d', '#ffaa09'],
    gold: ['#c9963b', '#2b2620', '#6b6256', '#9c9286', '#cfc7bc', '#e8e0d4', '#f7f3ec', '#ffffff', '#2fa84f', '#d9472b', '#f2a20c'],
    green: ['#10b26c', '#1f2a24', '#58665e', '#8e9a93', '#c5cdc8', '#dfe6e2', '#f4f8f6', '#ffffff', '#3a86ff', '#ef4444', '#ffaa09'],
    platinum: ['#c8a96a', '#2b2a28', '#6b6863', '#9a968f', '#cfcac2', '#e8e4dd', '#f7f6f3', '#ffffff', '#2fa84f', '#d9472b', '#e0a83a'],
    purple: ['#7b4dff', '#25213a', '#5f5a75', '#948faa', '#c9c5da', '#e4e1ef', '#f6f5fb', '#ffffff', '#12b886', '#f03e5e', '#ff9f1c'],
  };
  const preset = (k) => Object.fromEntries(KEYS.map((key, i) => [key, PRESETS[k][i]]));
  // AD：AI 首页设计的基准色在 D.baseTheme / D.baseEc（AI 给的值不算业主自改，ED-14 规则不变）
  const baseOf = (D) => (D.baseTheme ? Object.assign({}, D.baseTheme) : preset(PRESETS[D.basePreset] ? D.basePreset : 'blue'));
  const ecCustom = (D) => Object.keys(D.ec).filter((k) => !(D.baseEc && D.baseEc[k] === D.ec[k])).length;
  const SUGGEST = ['#1678ff', '#c9963b', '#10b26c', '#7b4dff', '#ea4e3d', '#ff7a1a', '#06b0ea', '#1c2033'];
  // ED-21：去掉「菜单栏」，游戏菜单即游戏类型菜单
  const MODS = {
    topbar: { key: 'mod/topbar', fixed: true }, banner: { key: 'mod/banner' }, notice: { key: 'mod/notice' }, jackpot: { key: 'cat/jackpot' },
    midnav: { key: 'mod/account' }, gamemenu: { key: 'mod/gamemenu' }, gamecards: { key: 'mod/gamecards' },
    footer: { key: 'cat/footer' }, sidebar: { key: 'mod/sidebar' }, bottomnav: { key: 'mod/bottomnav', fixed: true },
  };
  const BANNER = { large: { w: 1080, h: 490, dw: 710, dh: 322, cw: 351, ch: 159 }, general: { w: 1020, h: 300, dw: 710, dh: 209, cw: 351, ch: 103 }, small: { w: 386, h: 244, dw: 386, dh: 244, cw: 193, ch: 122 } };
  const TB = { h: [88, 96, 112], pad: [24, 32, 48], gap: [16, 24, 32] };
  const TB_SW = { bg: ['#ffffff', '#f8f8f8', '#1c2033', '#1678ff'], text: ['#333333', '#1c2033', '#ffffff', '#666666'], search: ['#1678ff', '#333333', '#ffaa09', '#ffffff'], reg: ['#ffaa09', '#1678ff', '#ea4e3d', '#10b26c'] };
  const SLIDE_F = ['none', 'hue-rotate(28deg) saturate(1.2)', 'hue-rotate(-38deg)'];
  const CAND_F = ['hue-rotate(10deg) saturate(1.4)', 'hue-rotate(-60deg) saturate(1.3)', 'hue-rotate(140deg) saturate(1.1)', 'hue-rotate(200deg) brightness(1.1)'];
  const BNAV_PX = { 98: 49, 110: 55, 120: 60 };
  const DV = 6; // 设计数据版本（LS 里旧数据不兼容时丢弃）
  const baseName = (id) => id.split('~')[0];
  const modName = (id) => { const b = baseName(id); const n = id.includes('~') ? ' ' + (+id.split('~')[1] + 1) : ''; return t((MODS[b] || MODS.banner).key) + n; };

  // ---------- 模板（ED-23）：版式 + 配色 + 默认素材整套 ----------
  const ORDER9 = ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer'];
  // 经典蓝白 = 真实 UI 结构（Waydon 2026-11-26 选「改成真实结构」）：没有彩金池 / 页脚 / 侧边栏
  const ORDER_CL = ['banner', 'notice', 'midnav', 'gamemenu', 'gamecards'];
  const TPL = {
    'classic-blue': { preset: 'blue', order: ORDER_CL, size: 'general', slides: SLIDE_F },
    'midnight-gold': { preset: 'gold', order: ORDER9, size: 'large', slides: ['sepia(.6) saturate(1.3)', 'sepia(.4) hue-rotate(-15deg)', 'sepia(.8) brightness(.9)'] },
    'fresh-green': { preset: 'green', order: ['banner', 'midnav', 'gamemenu', 'gamecards', 'jackpot', 'footer'], size: 'general', slides: ['hue-rotate(60deg)', 'hue-rotate(80deg) saturate(.9)', 'hue-rotate(40deg) brightness(1.05)'] },
    'western-white': { preset: 'platinum', order: ['banner', 'gamemenu', 'gamecards', 'midnav', 'footer', 'jackpot'], size: 'small', slides: ['hue-rotate(220deg)', 'hue-rotate(250deg) saturate(.8)', 'grayscale(.3) hue-rotate(200deg)'] },
    'festive-red': { preset: 'gold', order: ORDER9, size: 'large', slides: ['hue-rotate(-50deg) saturate(1.6)', 'hue-rotate(-70deg) saturate(1.4)', 'hue-rotate(-40deg) saturate(1.8)'] },
  };
  const tplOf = (k) => TPL[k] || TPL['classic-blue'];
  const mkSlides = (size, fs, bad) => fs.map((f, i) => ({ f, w: bad && i === 1 ? 800 : BANNER[size].w, h: bad && i === 1 ? 600 : BANNER[size].h }));
  function defaultDesign(tk, pal) {
    const key = TPL[tk] ? tk : 'classic-blue'; const tp = tplOf(key); const p = PRESETS[pal] ? pal : tp.preset;
    return {
      v: DV, order: tp.order.slice(), hidden: {}, side: 'left', login: false,
      theme: preset(p), palette: p, basePreset: p, template: key, height: 1600,
      banner: { size: tp.size, ind: 'bars', margin: 16, corner: 8, slides: mkSlides(tp.size, tp.slides, key === 'classic-blue') },
      m: window.MP ? window.MP.defaults() : {}, ec: {}, chkOk: {},
      tb: { h: 88, pad: 24, gap: 16, items: { logo: true, side: false, cur: true, search: true, auth: false }, searchFirst: false, balStyle: 'pill', colors: { bg: null, text: null, search: null, reg: null }, logoF: 'none' },
    };
  }
  const meta0 = LS.get('ed.meta', {});
  const E = (window.E = {
    loading: false, step: 0, device: 'h5', sel: null, tab: 'content', ai: null, zoom: 50, palOpen: false, picker: null,
    checksPassed: false, dlg: null, exp: { stage: 'ready', opts: { figma: true, png: true, svg: false }, dl: {}, failed: {}, retrying: {} }, slide: 0, mpanel: null, preview: false,
    upload: null, replaced: null, h5side: false, adv: false, D: defaultDesign(), past: [], future: [],
    name: LS.get('ed.last', '星河体育 · 首页'), status: 'designing', save: 'saved', nameEdit: null, rn: null, keys: null, iconAi: null, bx: null,
    lib: null, rs: null, palQ: null, tpl: null, contentH: 0, loadFail: false,
    figmaLinked: !!meta0.figmaLinked, projAssets: meta0.projAssets || [],
  });
  // 打开时恢复上次项目的设计
  // 旧数据迁移：充值图标统一面性（2026-11-26）
  const migrate = (D) => { try { Object.values(D.m || {}).forEach((m) => (m.items || []).forEach((it) => { if (it.i === 'credit-card') it.i = 'wallet-fill'; })); } catch (e) { /* noop */ } return D; };
  (function restore() { const d = LS.get('ed.d.' + E.name, null); if (d && d.v === DV) E.D = migrate(d); E.status = LS.get('ed.st.' + E.name, 'designing'); })();

  // ---------- 共用接口包装（A 的 core.js；缺失时退化） ----------
  const afford = (n) => (window.canAfford ? window.canAfford(n) : (S.credits || 0) >= n);
  const pay = (n, kind, vars) => { if (window.spend) window.spend(n, kind, vars || {}); }; // 扣点统一走 core 的 spend
  const fail = (p) => (window.takeFail ? window.takeFail(p == null ? '' : p) : false);
  const topup = () => { if (window.openTopup) window.openTopup(); else window.comingSoon(); };
  // 导出类通知带 name（点了回导出结果）；其它编辑器通知带 proj（点了回编辑器）
  const notice = (o) => { if (window.pushNotice) window.pushNotice(Object.assign(/^export/.test(o.kind) ? { name: E.name } : { proj: E.name }, o)); };
  const undoOpt = (ms = 5000) => ({ action: () => { A.undo(); window.render(); }, actionLabel: t('ed/am-undo'), ms });
  A.edTopup = () => { topup(); return false; };

  // ---------- 历史（撤销/重做）+ 自动保存（ED-15） ----------
  const snap = () => JSON.stringify(E.D);
  let saveTimer = null;
  function persist() { LS.set('ed.d.' + E.name, E.D); LS.set('ed.last', E.name); LS.set('ed.st.' + E.name, E.status); LS.set('ed.meta', { figmaLinked: E.figmaLinked, projAssets: E.projAssets.slice(-24) }); }
  function save() {
    E.save = 'saving'; clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (S.demo && S.demo.saveFail) E.save = 'failed'; else { persist(); E.save = 'saved'; }
      if (S.route === 'editor') window.render();
    }, 600);
  }
  A.saveRetry = () => { save(); };
  // 刚改完就刷新 / 关页：还在「保存中」的改动立即写入（保存失败演示时不写）
  window.addEventListener('pagehide', () => { if (E.save === 'saving' && !(S.demo && S.demo.saveFail)) persist(); });
  function commit(fn) {
    const before = checks().req;
    E.past.push(snap()); if (E.past.length > 60) E.past.shift(); E.future = []; fn();
    const after = checks().req.map((x) => x.id);
    before.filter((x) => !after.includes(x.id)).forEach((x) => window.toast(t('ed/chk-solved', { name: x.name })));
    save();
  }
  A.undo = () => { if (!E.past.length) return false; E.future.push(snap()); E.D = JSON.parse(E.past.pop()); fixSlide(); save(); window.toast(t('ed/undo-toast')); };
  A.redo = () => { if (!E.future.length) return false; E.past.push(snap()); E.D = JSON.parse(E.future.pop()); fixSlide(); save(); window.toast(t('ed/redo-toast')); };

  // ---------- 进入编辑器（加载页，ED-15 / ED-17） ----------
  window.openEditor = function (opts) {
    opts = opts || {};
    if ((opts.name && opts.name !== E.name) || opts.template || opts.design) {
      if (opts.name) E.name = opts.name;
      const d = !opts.template && LS.get('ed.d.' + E.name, null);
      E.D = d && d.v === DV ? migrate(d) : defaultDesign(opts.template, opts.palette);
      if (opts.design) { E.D = JSON.parse(JSON.stringify(opts.design)); E.D.v = DV; persist(); } // AD：AI 首页设计作为初始设计
      E.past = []; E.future = []; E.checksPassed = false; clearTimeout(expTimer); E.exp.stage = 'ready'; E.exp.dl = {}; E.exp.failed = {};
      const pj = Array.isArray(window.PROJECTS) && window.PROJECTS.find((p) => p.name === E.name);
      E.status = LS.get('ed.st.' + E.name, pj && pj.st === 'exported' ? 'exported' : 'designing');
    }
    if (opts.status) E.status = opts.status;
    E.then = opts.then || null;
    E.adBar = opts.design && opts.design.iconStyle ? { ics: opts.design.iconStyle } : null; E.adp = null; E.adMod = null;
    E.sel = null; E.ai = null; E.picker = null; E.mpanel = null; E.dlg = null; E.keys = null; E.iconAi = null; E.rn = null; E.nameEdit = null; E.slide = 0; E.save = 'saved';
    LS.set('ed.last', E.name);
    startLoad();
    window.go('editor');
  };
  let loadTok = 0;
  function startLoad() {
    const tok = ++loadTok;
    E.loading = true; E.step = 0; E.loadFail = false;
    const tick = () => {
      if (tok !== loadTok) return;
      if (E.step === 1 && S.demo && S.demo.loadFail) { E.loadFail = true; window.render(); return; }
      E.step++;
      if (E.step >= 3) setTimeout(() => { if (tok !== loadTok) return; E.loading = false; afterLoad(); window.render(); }, 350);
      window.render(); if (E.step < 3) setTimeout(tick, 380);
    };
    setTimeout(tick, 380);
  }
  function afterLoad() { if (E.then === 'exportDone') { const r = LS.get('ed.x.' + E.name, null); E.dlg = 'export'; E.exp.stage = 'done'; E.exp.dl = {}; E.exp.retrying = {}; E.exp.failed = (r && r.failed) || {}; } E.then = null; }
  A.edLoadRetry = () => { startLoad(); };
  // 直接打开 / 刷新 #/editor 也走加载页（加载失败演示开关同样生效）
  window.addEventListener('DOMContentLoaded', () => { if (S.route === 'editor' || /#\/editor/.test(location.hash)) startLoad(); });
  A.edLoadHome = () => { loadTok++; E.loading = false; E.loadFail = false; window.go('home'); return false; };
  const mobileEd = () => window.innerWidth < 840;

  // ---------- 颜色工具 ----------
  function hex2hsv(hex) {
    const n = parseInt(hex.slice(1, 7), 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
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
    const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})/i.exec(hex || ''); if (!m) return '#fff';
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
    if (tb.bg) s += `;--tb-bg:${tb.bg}`; if (tb.text) s += `;--tb-text:${tb.text}`; if (tb.search) s += `;--tb-search:${tb.search}`; if (tb.reg) s += `;--tb-reg:${tb.reg}`; if (tb.login) s += `;--tb-login:${tb.login}`; if (tb.regInk) s += `;--tb-regink:${tb.regInk}`;
    return s;
  }

  // ---------- 交付检查（ED-12）：只依赖 E.D，所有计数从这里取 ----------
  const inPage = (b) => E.D.order.some((x) => baseName(x) === b && !E.D.hidden[x]);
  function checks() {
    const D = E.D, req = [], sug = [], ok = [];
    if (!D.m || !D.m.midnav) return { req, sug, ok };
    const nm = window.MP.nm;
    if (inPage('midnav')) {
      const m = D.m.midnav; const miss = m.items.filter((it) => (m.mode === 'conf' || it.req) && !(it.img || it.i));
      (miss.length ? req : ok).push({ id: 'midnav', mod: 'midnav', name: t('mod/midnav'), text: miss.length ? t('ed/chk-midnav', { n: miss.length, names: miss.map(nm).join('、') }) : t('mod/midnav') });
    }
    if (inPage('banner')) {
      const sz = BANNER[D.banner.size]; let bad = 0;
      D.banner.slides.forEach((s, i) => { if (!s.hid && (s.w !== sz.w || s.h !== sz.h)) { bad++; req.push({ id: 'banner' + i, mod: 'banner', act: 'openResize', arg: 'slide' + i, name: 'Banner', text: t('ed/chk-banner', { i: i + 1, w: sz.w, h: sz.h }) }); } });
      if (!bad) ok.push({ id: 'banner', mod: 'banner', name: 'Banner', text: 'Banner' });
    }
    if (!D.hidden.bottomnav) {
      const miss = D.m.bottomnav.items.filter((it) => it.req && !it.imgOn && !it.onBuiltin);
      (miss.length ? req : ok).push({ id: 'bottomnav', mod: 'bottomnav', name: t('mod/bottomnav'), text: miss.length ? t('ed/chk-bnav', { names: miss.map(nm).join('、') }) : t('mod/bottomnav') });
    }
    if (inPage('gamemenu')) {
      const miss = D.m.gamemenu.items.filter((it) => it.on && !(it.img || it.i));
      (miss.length ? req : ok).push({ id: 'gamemenu', mod: 'gamemenu', name: t('mod/gamemenu'), text: miss.length ? t('ed/chk-gamemenu', { n: miss.length, names: miss.map(nm).join('、') }) : t('mod/gamemenu') });
    }
    if (inPage('jackpot')) (D.chkOk.jackpot ? ok : sug).push({ id: 'jackpot', mod: 'jackpot', name: t('cat/jackpot'), text: D.chkOk.jackpot ? t('cat/jackpot') : t('ed/chk-4'), confirm: true });
    if (window.AD && window.AD.checks) window.AD.checks(D, req, sug, ok);
    if (E.checksPassed) { ok.push(...req, ...sug); return { req: [], sug: [], ok }; }
    return { req, sug, ok };
  }

  // ---------- H5 预览 ----------
  function modWrap(id, inner, opts = {}) {
    const sel = E.sel === id;
    let extra = '';
    if (sel && !mobileEd()) extra = `<span class="sel-label ${opts.top ? 'inside' : ''}">${esc(E.ai && E.ai.cand != null && baseName(id) === 'banner' ? t('ed/previewing', { n: E.ai.cand + 1 }) : modName(id))}</span>${selToolbar(id, opts.top)}`;
    return `<div class="mod ${sel ? 'is-sel' : ''}" data-mod="${id}" data-act="selMod" data-arg="${id}">${inner}${extra}${window.AD ? window.AD.modMask(id) : ''}</div>`;
  }
  function selToolbar(id, below) {
    const b = baseName(id), fixed = MODS[b].fixed;
    const idx = E.D.order.indexOf(id);
    const btn = (act, icon, label, arg = '') => `<button data-act="${act}" data-arg="${arg}" data-stop>${ic(icon)}${label}</button>`;
    let main = '';
    if (b === 'banner') main = btn('toolReplace', 'image', t('ed/replace-image')) + btn('openAi', 'magic-wand', t('ed/ai')) + btn('tbTab', 'paint-brush-fill', t('ed/recolor'), 'color');
    else main = btn('tbTab', 'sliders-horizontal', t('ed/tool-layout'), 'layout') + btn('tbTab', 'paint-brush-fill', t('ed/recolor'), 'color');
    const move = fixed || b === 'sidebar' ? '' : `<button class="ib" data-act="move" data-arg="-1" data-stop ${idx <= 0 ? 'disabled' : ''}>${ic('arrow-up')}</button><button class="ib" data-act="move" data-arg="1" data-stop ${idx >= E.D.order.length - 1 ? 'disabled' : ''}>${ic('arrow-down')}</button>`;
    const menu = S.menu === 'modmenu' ? moduleMenu(id) : '';
    return `<div class="seltool ${below ? 'below' : ''}" data-stop>${main}${window.AD ? window.AD.toolBtn(id) : ''}${move}<button class="ib" data-act="toggleHide" data-arg="${id}" data-stop title="${esc(t('ed/am-toggle'))}">${ic('eye-slash-fill')}</button><span class="rel"><button class="ib" data-act="menu:toggle" data-arg="modmenu" data-stop>${ic('dots-three')}</button>${menu}</span></div>`;
  }
  function moduleMenu(id) {
    const fixed = MODS[baseName(id)].fixed;
    return `<div class="menu" data-stop>${fixed ? '' : `<button class="menu-item" data-act="modDup" data-arg="${id}" data-stop>${ic('copy')}${t('ed/menu-duplicate')}</button>`}<button class="menu-item" data-act="modReset" data-arg="${id}" data-stop>${ic('arrow-counter-clockwise')}${t('ed/menu-reset')}</button><button class="menu-item is-danger" data-act="modDel" data-arg="${id}" data-stop>${ic('trash')}${t('ed/menu-delete')}</button></div>`;
  }
  // 余额框样式（Waydon 2026-11-26「余额框样式可选」）：pill 描边胶囊 / solid 实底+充值 / text 图标+金额
  const BAL_STYLES = ['pill', 'solid', 'text'];
  const balHtml = (st, amt = '¥ 1,280.00') => {
    st = BAL_STYLES.includes(st) ? st : 'pill';
    if (st === 'solid') return `<span class="bal bal-solid">${ic('wallet-fill', 'bi')}${amt}<i class="bplus">${ic('plus', 'bi')}</i></span>`;
    if (st === 'text') return `<span class="bal bal-text">${ic('wallet-fill', 'bi')}${amt}</span>`;
    return `<span class="bal">${amt}</span>`;
  };
  window.balHtml = (st) => balHtml(st || (E.D && E.D.tb && E.D.tb.balStyle));
  A.tbBal = (v) => { if (!BAL_STYLES.includes(v) || E.D.tb.balStyle === v) return false; commit(() => { E.D.tb.balStyle = v; }); };
  function h5Topbar() {
    const D = E.D, tb = D.tb, it = tb.items;
    const side = it.side ? `<span data-act="h5Side" data-stop>${ic('list', 'ico')}</span>` : '';
    // 经典蓝白：Logo 图 + 币种切换 + 带文字的搜索
    const search = it.search ? `<span class="srch-cl"><img src="assets/classic/search.png" alt=""><small>${t('ed/tb-search')}</small></span>` : '';
    const cur = it.cur ? `<img class="cur-cl" src="assets/classic/cur.png" alt="CNY">` : '';
    const logo = it.logo ? `<span class="lg lg-cl" style="filter:${tb.logoF}"><img src="assets/classic/logo.png" alt="GAMING"></span>` : '';
    const auth = it.auth ? (D.login ? `${balHtml(tb.balStyle)}<span class="ava"></span>` : `<span class="login">登录</span><span class="reg">注册</span>`) : '';
    const left = D.side === 'left' ? side : '';
    const right = D.side === 'right' ? side : '';
    const pre = tb.searchFirst ? search : '';
    const post = tb.searchFirst ? '' : search;
    return `<div class="h5-top" style="height:${tb.h / 2}px;padding:0 ${tb.pad / 2}px;gap:${tb.gap / 2}px">${left}${pre}${logo}<span class="sp"></span>${cur}${post}${auth}${right}</div>`;
  }
  // 轮播只播放未隐藏的图（ED-06）
  const visIdx = () => E.D.banner.slides.map((s, i) => (s.hid ? -1 : i)).filter((i) => i >= 0);
  function fixSlide() { const v = visIdx(); if (!v.includes(E.slide)) E.slide = v.find((i) => i > E.slide) ?? v[0] ?? 0; }
  function slideF(i) {
    if (E.ai && E.ai.cand != null && i === E.slide) return CAND_F[E.ai.cand];
    return (E.D.banner.slides[i] || {}).f || 'none';
  }
  function h5Banner() {
    const B = E.D.banner, sz = BANNER[B.size];
    const v = visIdx(); const pos = Math.max(0, v.indexOf(E.slide));
    const slides = v.map((i) => `<div class="slide" style="background-image:url(assets/classic/banner.webp);filter:${slideF(i)}"></div>`).join('');
    const ind = B.ind === 'none' ? '' : `<div class="h5-ind ${B.ind}">${v.map((i, k) => `<i class="${k === pos ? 'on' : ''}" data-act="slideTo" data-arg="${i}" data-stop></i>`).join('')}</div>`;
    return `<div class="h5-banner" style="padding:${B.margin / 2}px 0"><div class="vp" data-swipe style="width:${sz.cw}px;height:${sz.ch}px;border-radius:${B.corner / 2}px"><div class="track" style="transform:translateX(${-pos * 100}%)">${slides}</div></div>${ind}</div>`;
  }
  function modHtml(id) {
    switch (baseName(id)) {
      case 'banner': return h5Banner();
      case 'notice': case 'jackpot': case 'midnav': case 'gamemenu': case 'gamecards': case 'footer': return window.MP.h5(baseName(id), id);
      default: return '';
    }
  }
  function h5(opts = {}) {
    const D = E.D;
    // 竖排游戏分类紧挨着游戏卡片时，两个模块左右并排（经典蓝白）
    const vis0 = D.order.filter((id) => !D.hidden[id] && MODS[baseName(id)]);
    let body = '';
    for (let k = 0; k < vis0.length; k++) {
      const id = vis0[k], nx = vis0[k + 1];
      if (baseName(id) === 'gamemenu' && D.m.gamemenu.style === 'side' && nx && baseName(nx) === 'gamecards') { body += `<div class="cl-games">${modWrap(id, modHtml(id))}${modWrap(nx, modHtml(nx))}</div>`; k++; continue; }
      body += modWrap(id, modHtml(id));
    }
    const topPx = D.hidden.topbar ? 0 : D.tb.h / 2, bnPx = D.hidden.bottomnav ? 0 : BNAV_PX[D.m.bottomnav.h] || 55;
    const top = D.hidden.topbar ? '' : modWrap('topbar', h5Topbar(), { top: true });
    const bnav = D.hidden.bottomnav ? '' : `<div class="h5-bnav mod ${window.MP.bnavCls()} ${E.sel === 'bottomnav' ? 'is-sel' : ''}" data-mod="bottomnav" data-act="selMod" data-arg="bottomnav">${window.MP.bnav()}${E.sel === 'bottomnav' && !mobileEd() ? `<span class="sel-label">${esc(modName('bottomnav'))}</span>${selToolbar('bottomnav')}` : ''}${window.AD ? window.AD.modMask('bottomnav') : ''}</div>`;
    const side = E.h5side && !D.hidden.sidebar ? `<div class="h5-side ${D.side}" data-act="h5SideClose" data-stop>${window.MP.side()}${window.AD ? window.AD.modMask('sidebar') : ''}</div>` : '';
    // ED-13：画布按页面高度显示，1334 处画首屏线
    const minBody = Math.max(0, D.height / 2 - topPx - bnPx);
    const fold = opts.noFold ? '' : `<div class="h5-fold" style="top:${667}px"><span>${t('ed/fold-line')}</span></div>`;
    return `<div class="h5 ${D.iconStyle ? 'ics-' + D.iconStyle : ''}" style="${themeStyle()}${opts.style || ''}">${top}<div class="h5-body" ${opts.measure ? 'data-measure' : ''} data-top="${topPx}" data-bn="${bnPx}" style="min-height:${minBody}px">${body}</div>${bnav}${fold}${side}</div>`;
  }
  // 内容高度（750 稿单位）：渲染后量一次，变了再渲染
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'editor' || E.loading) return;
    const b = document.querySelector('[data-measure]'); if (!b || !b.offsetHeight) return;
    const r = b.getBoundingClientRect(); const s = r.height / b.offsetHeight || 1;
    const kids = [...b.children]; const last = kids[kids.length - 1];
    const px = last ? (last.getBoundingClientRect().bottom - r.top) / s : 0;
    const h = Math.round((px + +b.dataset.top + +b.dataset.bn) * 2);
    if (Math.abs(h - E.contentH) > 2) { E.contentH = h; setTimeout(() => window.render(), 0); }
  });
  function overNotice() {
    const d = E.contentH - E.D.height; if (d <= 0) return '';
    const to = Math.min(6000, E.contentH);
    return `<div class="notice is-warn h5-over">${ic('warning-circle-fill')}<div class="tx">${t('ed/overflow', { d })}</div><button class="btn btn-secondary btn-sm" data-act="growTo" data-arg="${to}" data-stop>${t('ed/grow-to', { n: to })}</button><button class="btn btn-ghost btn-sm" data-act="fixLayout" data-stop>${t('ed/fix-layout')}</button></div>`;
  }
  A.growTo = (n) => { commit(() => { E.D.height = Math.max(1334, Math.min(6000, +n)); }); };
  A.fixLayout = () => { const last = E.D.order.filter((x) => !E.D.hidden[x]).slice(-1)[0]; if (!last) return false; E.sel = last; E.tab = 'layout'; E.ai = null; E.keys = null; E.iconAi = null; if (mobileEd()) E.mpanel = 'module'; };

  // ---------- 左栏：页面与模块树 ----------
  function stOf(id) {
    const b = baseName(id); const c = checks();
    if (c.req.some((x) => x.mod === b)) return 'check';
    return 'done';
  }
  function row(id, opts = {}) {
    const hidden = !!E.D.hidden[id];
    const grip = opts.grip ? `<span class="grip" data-grip="${id}">${ic('dots-six-vertical', 'ic-16')}</span>` : '';
    const pcNote = window.PC && window.PC.rowNote ? window.PC.rowNote(id) : '';
    return `<div class="row ${E.sel === id ? 'is-on' : ''} ${hidden ? 'is-hidden' : ''}" data-row="${id}">${grip}<span class="dot ${stOf(id)}"></span><button class="nm" data-act="selMod" data-arg="${id}">${esc(modName(id))}</button>${pcNote}<button class="eye" data-act="toggleHide" data-arg="${id}" title="${esc(t('ed/am-toggle'))}">${ic(hidden ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button></div>`;
  }
  function tree() {
    const n = checks().req.length; const pageSt = n ? 'check' : 'done';
    return `<div class="grp-label">${t('ed/pages')}</div>
      <div class="row ${E.sel === null ? 'is-on' : ''}"><span class="dot ${pageSt}"></span>${ic('house-fill', 'ic-16')}<button class="nm" data-act="selMod" data-arg="">${t('cat/home')}</button><span class="st">${t(pageSt === 'check' ? 'st/check' : 'st/done')}</span></div>
      <div class="divider"></div><div class="grp-label">${t('ed/modules')}</div>
      <div data-drag-list>${E.D.order.map((id) => row(id, { grip: true })).join('')}</div>
      <div class="rel"><button class="add-mod ${S.menu === 'addmod' ? 'is-open' : ''}" data-act="addMenu">${ic('plus', 'ic-16')}${t('ed/add-module')}</button>${S.menu === 'addmod' ? `<div class="menu add-menu">${addList()}</div>` : ''}</div>
      ${E.D.tb.items.side ? row('sidebar') + `<div class="side-pos"><span>${t('ed/side-pos')}</span><div class="iseg">${['left', 'right'].map((v) => `<button class="${E.D.side === v ? 'is-on' : ''}" data-act="setSide" data-arg="${v}">${t('ed/side-' + v)}</button>`).join('')}</div></div>` : ''}
      <div class="grp-label">${t('ed/fixed')}</div>${row('topbar')}${row('bottomnav')}`;
  }

  // ---------- 右栏 ----------
  const segBtns = (opts, cur, act) => window.seg(opts, cur, act);
  const TPLS = () => { const seen = {}; return (window.TEMPLATES || Object.keys(TPL).map((k) => ({ k, meta: k === 'midnight-gold' || k === 'festive-red' ? 'pro' : 'standard', f: 'classic' }))).filter((x) => (seen[x.k] ? false : (seen[x.k] = 1))); };
  const tplMeta = (k) => (TPLS().find((x) => x.k === k) || { meta: 'standard' }).meta;
  const tplThumb = (k, cls = '', bare = false) => { const p = PRESETS[tplOf(k).preset]; return `<span class="tpl-th ${cls} ${bare ? 'is-soon' : ''}" style="background:${bare ? 'var(--bg-surface)' : `linear-gradient(160deg,${p[0]},${p[7]} 70%,${p[10]})`}">${bare ? `<span class="tpl-soon-ic">${ic('layout-fill')}</span>` : `<img src="assets/thumbs/tpl-${k}.png" alt="" onerror="this.remove()">`}</span>`; };
  function tplRow() {
    return `<div class="tpl-row">${tplThumb(E.D.template)}<span class="tx"><b class="ellipsis">${t('template/' + E.D.template)}</b><span class="caption faint">${t('template/meta-' + tplMeta(E.D.template))}</span></span><button class="btn btn-secondary btn-sm" data-act="edOpenTpl">${t('ed/tpl-switch')}</button></div>`;
  }
  function pageSettings(mode) {
    if (E.keys && mode !== 'colors-only') return keysHead() + window.MP.keysPanel(mobileEd());
    const th = liveTheme().th;
    const groups = [['ed/grp-primary', ['primary', 'lead']], ['ed/grp-text', ['neutral_1', 'neutral_2', 'neutral_3']], ['ed/grp-bg', ['bg_1', 'bg_2', 'border']], ['ed/grp-accent', ['accent_1', 'accent_2', 'accent_3']]];
    const colorsSec = `<div class="p-sec"><div class="lab">${t('ed/brand-colors')}</div><div class="pals">${Object.keys(PRESETS).map((k) => `<button class="pal ${E.D.palette === k ? 'is-on' : ''}" data-act="setPalette" data-arg="${k}" title="${esc(t('color/palette-' + k))}">${[0, 8, 10].map((i) => `<i style="background:${PRESETS[k][i]}"></i>`).join('')}</button>`).join('')}</div>
        <div class="basecard"><div class="hd">${t('ed/base-colors')}</div>${groups.map(([g, ks]) => `<div class="bc-row"><span class="k">${t(g)}</span><div class="sws">${ks.map((k) => `<button class="sw-btn ${E.picker && E.picker.key === k && !E.picker.tbRow && !E.picker.elRow ? 'is-on' : ''}" style="background:${th[k]}" title="${esc(t('ed/key-' + k))}" data-act="pick" data-arg="${k}|panel"></button>`).join('')}</div></div>`).join('')}</div>
        ${E.picker && E.picker.where === 'panel' ? pickerHtml('in-panel') : ''}
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:12px" data-act="openKeys">${ic('caret-right', 'ic-16')}${t('ed/all-keys')}</button></div>`;
    if (mode === 'colors-only') return colorsSec;
    const hNote = E.contentH ? t('ed/height-note-n', { n: E.contentH }) : t('ed/height-note');
    return `<h2 class="p-title">${t('ed/page-settings')}</h2><p class="p-sub">${t('ed/page-hint')}</p>${window.AD ? window.AD.entryCard() : ''}
      <div class="p-sec"><div class="lab">${t('ed/tpl-sec')}</div>${tplRow()}</div>
      ${colorsSec}
      <div class="p-sec"><div class="lab">${t('ed/page-height')}</div><div class="h-row"><input class="input" style="width:110px" type="number" min="1334" max="6000" value="${E.D.height}" data-input="pageHeight" data-key="heightKey"><span class="caption faint">${hNote}</span></div></div>`;
  }
  const keysHead = () => (mobileEd() ? '' : `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="keysBack" title="${esc(t('ed/tpl-back'))}">${ic('caret-left')}</button>${t('ed/keys-title', { n: 68 })}</h2>`);
  A.openKeys = () => { E.keys = { q: '', showKey: S.lang === 'en' || S.lang === 'vi', closed: {} }; E.picker = null; S.menu = null; if (mobileEd()) E.mpanel = 'keys'; };
  A.keysBack = () => { E.keys = null; E.picker = null; if (E.mpanel === 'keys') E.mpanel = null; };
  // 页面高度：回车或失焦生效，越界纠正（ED-13）
  I.pageHeight = () => {};
  function heightApply(v) {
    let n = Math.round(+v); if (!Number.isFinite(n)) return;
    let clamped = false; if (n < 1334) { n = 1334; clamped = true; } else if (n > 6000) { n = 6000; clamped = true; }
    if (clamped) window.toast(t('ed/height-clamped', { n }), { info: true });
    if (n !== E.D.height) commit(() => { E.D.height = n; });
    window.render();
  }
  A.heightKey = (e, el) => { if (e.key === 'Enter') { el.blur(); } };
  document.addEventListener('change', (e) => { if (e.target.matches && e.target.matches('[data-input="pageHeight"]')) heightApply(e.target.value); });
  function tabs3(cur) { return `<div class="tabs3">${segBtns([{ v: 'content', label: t('ed/tab-content') }, { v: 'layout', label: t('ed/tab-layout') }, { v: 'color', label: t('ed/tab-color') }], cur, 'setTab')}</div>`; }

  // 素材「⋯」菜单（电脑往下弹；手机底部面板）
  function assetMenuItems(id) {
    if (id.startsWith('slide')) {
      const i = +id.slice(5); const s = E.D.banner.slides[i]; if (!s) return '';
      const v = visIdx(); const lastVis = !s.hid && v.length <= 1; const one = E.D.banner.slides.length <= 1;
      return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button><button class="menu-item" data-act="openLib" data-arg="${id}">${ic('stack-fill')}${t('ed/library')}</button><button class="menu-item" data-act="amReset" data-arg="${id}">${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button>
        <button class="menu-item" data-act="amToggle" data-arg="${id}" ${lastVis ? 'disabled' : ''}>${ic(s.hid ? 'eye-fill' : 'eye-slash-fill')}<span class="tx"><span>${t(s.hid ? 'ed/am-show' : 'ed/am-hide')}</span>${lastVis ? `<span class="sub">${t('ed/slide-keep-one')}</span>` : ''}</span></button>
        <div class="menu-sep"></div><button class="menu-item is-danger" data-act="amDelete" data-arg="${id}" ${one ? 'disabled' : ''}>${ic('trash')}<span class="tx"><span>${t('ed/am-delete')}</span>${one ? `<span class="sub">${t('ed/slide-keep-one')}</span>` : ''}</span></button>`;
    }
    const lib = /^mp-(jackpot-bg|gamecards-fallback|sidebar-head)$/.test(id) ? `<button class="menu-item" data-act="openLib" data-arg="${id}">${ic('stack-fill')}${t('ed/library')}</button>` : '';
    return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button>${lib}<button class="menu-item" data-act="amReset" data-arg="${id}">${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button><button class="menu-item" data-act="amToggle" data-arg="${id}">${ic('eye-fill')}${t('ed/am-toggle')}</button>`;
  }
  function assetMenu(id) {
    if (S.menu !== 'am:' + id || mobileEd()) return '';
    return `<div class="menu am-menu">${assetMenuItems(id)}</div>`;
  }
  const moreBtn = (id) => `<span class="rel" style="margin-left:auto"><button class="more-btn" data-act="menu:toggle" data-arg="am:${id}" data-stop>${ic('dots-three', 'ic-16')}</button>${assetMenu(id)}</span>`;
  function amSheet() {
    if (!S.menu || !S.menu.startsWith('am:') || !mobileEd()) return '';
    return `<div class="scrim" data-act="amClose" style="z-index:95"></div><div class="sheet med-sheet am-sheet" style="z-index:96"><div class="sheet-grab"></div><div class="icon-sheet-list">${assetMenuItems(S.menu.slice(3))}</div></div>`;
  }
  A.amClose = () => { S.menu = null; };
  function uploadUI(slot) {
    let h = '';
    if (E.upload && E.upload.slot === slot) h += `<div class="upl"><div class="r">${t('ed/am-uploading')}<b data-upl>${E.upload.pct}%</b><button data-act="cancelUpload">${ic('x', 'ic-16')}</button></div><div class="progress"><i data-uplbar style="width:${E.upload.pct}%"></i></div></div>`;
    if (E.replaced && E.replaced.slot === slot) h += `<div class="replaced">${ic('check-circle-fill')}${t('ed/am-replaced')} · <button data-act="undoReplace">${t('ed/am-undo')}</button></div>`;
    return h;
  }
  function bannerContent() {
    const B = E.D.banner, sz = BANNER[B.size];
    const sizeSeg = segBtns(['large', 'general', 'small'].map((v) => ({ v, label: t('ed/banner-' + v) })), B.size, 'bannerSize');
    const spLine = (s, i) => (s.w !== sz.w || s.h !== sz.h ? `<button class="warn-link" data-act="openResize" data-arg="slide${i}" data-stop>${ic('warning-circle-fill', 'ic-16')}${t('ed/slide-bad', { w: s.w, h: s.h })}</button>` : `${s.w}×${s.h}`);
    const hidTag = (s) => (s.hid ? `<span class="pill-tag is-gray">${t('ed/slide-hidden')}</span>` : '');
    const slides = B.slides.map((s, i) => {
      const grip = `<span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span>`;
      if (i === E.slide) return `<div class="asset-row ${s.hid ? 'is-hidden' : ''}" data-row="${i}">${grip}<div class="asset is-on"><div class="top"><span class="thumb" style="filter:${s.f}"></span><span style="min-width:0"><div class="nm">${t('ed/slide-n', { n: i + 1 })} · ${t('ed/previewing-slide')}</div><div class="sp">${spLine(s, i)}</div></span>${hidTag(s)}${moreBtn('slide' + i)}</div>
        <div class="acts"><button class="btn btn-primary btn-sm" data-act="openAi">${ic('magic-wand', 'ic-16')}${t('ed/ai')}</button><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="slide${i}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="openLib" data-arg="slide${i}">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div></div>${uploadUI('slide' + i)}`;
      return `<div class="asset-row ${s.hid ? 'is-hidden' : ''}" data-row="${i}">${grip}<div class="asset compact" data-act="slideTo" data-arg="${i}"><div class="top"><span class="thumb" style="filter:${s.f}"></span><span style="min-width:0"><div class="nm">${t('ed/slide-n', { n: i + 1 })}</div><div class="sp">${spLine(s, i)}</div></span>${hidTag(s)}${moreBtn('slide' + i)}</div></div></div>${uploadUI('slide' + i)}`;
    }).join('');
    const bad = checks().req.filter((x) => x.mod === 'banner');
    return `${bad.length ? `<div class="notice is-warn">${ic('warning-circle-fill')}<div>${esc(bad[0].text)}<div class="caption faint">Banner</div></div></div>` : ''}
      <div class="p-sec"><div class="lab">${t('ed/banner-spec')}</div>${sizeSeg}<div class="p-note">${t('ed/spec-line', sz)}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/banner-images', { n: B.slides.length })}</div><div data-drag-list="banner" class="slide-list">${slides}</div>
        ${B.slides.length < 5 ? `<button class="btn btn-outline btn-sm" style="margin-top:8px" data-act="addSlide">${ic('plus', 'ic-16')}${t('ed/add-slide')}</button>` : ''}<div class="p-note">${t('mp/drag-hint')}</div></div>
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
  // Banner AI（ED-09）：成功才扣 20；余额不足、失败都有出口
  function aiPanel() {
    const a = E.ai, sz = BANNER[E.D.banner.size];
    const kws = [1, 2, 3, 4, 5, 6, 7, 8];
    const can = afford(20);
    let cands = '';
    if (a.stage === 'generating') cands = `<div class="cands">${[0, 1, 2, 3].map(() => '<div class="cand skeleton"></div>').join('')}</div><div class="rec-note">${ic('clock', 'ic-16')}${t('rec/generating')}</div>`;
    else if (a.stage === 'failed') cands = `<div class="cands">${[0, 1, 2, 3].map(() => `<div class="cand is-fail">${ic('x-circle-fill')}</div>`).join('')}</div><div class="ia-msg is-err">${ic('warning-circle-fill', 'ic-16')}${t('ed/ai-failed')}</div><div class="rec-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-act="aiGen">${t('rec/retry', { c: 20 })}</button><button class="btn btn-secondary btn-sm" data-act="closeAi">${t('ed/keep-current')}</button></div>`;
    else if (a.stage === 'cands') cands = `<div class="cands">${CAND_F.map((f, i) => `<button class="cand ${a.cand === i ? 'is-on' : ''}" style="filter:${f}" data-act="pickCand" data-arg="${i}">${a.cand === i ? `<span class="ck">${ic('check', 'ic-16')}</span>` : ''}</button>`).join('')}</div>
        <div class="rec-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm ${a.cand == null ? 'is-disabled' : ''}" data-act="adoptCand">${t('ed/adopt')}</button><button class="btn btn-secondary btn-sm" data-act="closeAi">${t('ed/keep-current')}</button><button class="btn btn-outline btn-sm" data-act="aiGen">${ic('clock-counter-clockwise', 'ic-16')}${t('rec/regenerate-cost', { c: 20 })}</button></div><div class="p-note">${t('ed/ai-note')}</div>`;
    const ref = window.refSlot ? window.refSlot(a.refSt, 'edRef') : '';
    return `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="closeAi" title="${esc(t('ed/keep-current'))}">${ic('caret-left')}</button>${t('ed/ai-title')}</h2>
      <div class="p-note" style="margin:0 0 8px">${ic('magic-wand', 'ic-16')}${t('ed/ai-auto-hint')}</div>
      <div class="ai-box"><div class="in">${ref}
        <div style="flex:1;min-width:0"><textarea data-input="aiPrompt">${esc(a.prompt)}</textarea>${a.kw.length ? `<div class="tagrow">${a.kw.map((k) => `<button class="chip is-on" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}${ic('x', 'ic-16')}</button>`).join('')}</div>` : ''}</div></div>
        <div class="ft"><span class="rel"><button class="c-opt" data-act="menu:toggle" data-arg="aiModel">${window.MODEL_LOGO[a.model]}${a.model === 'gpt' ? 'GPT Image' : 'Gemini'}${ic('caret-down', 'chev')}</button>${S.menu === 'aiModel' ? `<div class="menu c-menu">${['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${a.model === m ? 'is-on' : ''}" data-act="aiModel" data-arg="${m}">${window.MODEL_LOGO[m]}<span><div class="nm">${m === 'gpt' ? 'GPT Image' : 'Gemini'}</div><div class="ds">${t('model/' + m + '-desc')}</div></span></button>`).join('')}</div>` : ''}</span>
          <button class="send ${can && a.stage !== 'generating' ? '' : 'is-disabled'}" data-act="aiGen">${ic('sparkle-fill')}20${ic('arrow-up')}</button></div></div>
      ${can ? '' : `<div class="ai-low">${t('ed/ai-low')} · <button data-act="edTopup">${t('confirm/topup')}</button></div>`}
      <div class="p-sec"><div class="lab">${t('ed/ai-style-title')}</div><div class="kw">${kws.map((k) => `<button class="chip ${a.kw.includes(k) ? 'is-on' : ''}" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}</button>`).join('')}</div>
        <div class="p-note">${t('ed/cost-ai')}</div><div class="p-note" style="margin-top:2px">${t('ed/spec-line', sz)}</div></div>
      ${a.stage !== 'idle' ? `<div class="p-sec"><div class="lab">${t('ed/ai-candidates')}</div>${cands}</div>` : ''}`;
  }
  function tbContent() {
    // 顶部栏内容（Waydon 2026-11-26 排版优化）：分组列表，每行 拖动 · 缩略图 · 名称/规格 · ⋯ · 眼睛 都在同一张卡内
    const D = E.D, it = D.tb.items;
    const eye = (k) => `<button class="eye" data-act="tbItem" data-arg="${k}" aria-label="${esc(t('ed/am-toggle'))}">${ic(it[k] ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`;
    const row = (k, thumb, name, spec, grip = true) => `<div class="tb-item ${it[k] ? '' : 'is-hidden'}">${grip ? `<span class="grip" ${k === 'side' || k === 'search' ? 'data-act="tbSwap"' : ''}>${ic('dots-six-vertical', 'ic-16')}</span>` : ''}${thumb}<span class="tx"><b class="ellipsis">${name}</b>${spec ? `<small class="ellipsis">${spec}</small>` : ''}</span>${moreBtn('tb-' + k)}${eye(k)}</div>`;
    const ups = (ks) => ks.map((k) => uploadUI('tb-' + k)).join('');
    const sideRow = row('side', `<span class="thumb sq">${ic('list')}</span>`, t('ed/tb-sideicon'), '48×48');
    const searchRow = row('search', `<span class="thumb sq"><img src="assets/classic/search.png" alt=""></span>`, t('ed/tb-search'), '56×49');
    const curRow = row('cur', `<span class="thumb cur"><img src="assets/classic/cur.png" alt=""></span>`, t('ed/tb-cur'), '142×46');
    const entries = curRow + (D.tb.searchFirst ? searchRow + sideRow : sideRow + searchRow);
    const pos = `<div class="tb-item tb-pos"><span class="tx"><b>${t('ed/side-pos')}</b></span><div class="iseg">${['left', 'right'].map((v) => `<button class="${D.side === v ? 'is-on' : ''}" data-act="setSide" data-arg="${v}">${t('ed/side-' + v)}</button>`).join('')}</div></div>`;
    const auth = `<div class="tb-item ${it.auth ? '' : 'is-hidden'}"><span class="thumb sq">${ic(D.login ? 'wallet-fill' : 'sign-in-fill')}</span><span class="tx"><b class="ellipsis">${t(D.login ? 'ed/tb-balance' : 'ed/tb-auth')}</b></span>${eye('auth')}</div>`;
    return `<div class="p-sec"><div class="lab">${t('ed/tb-state')}</div>${segBtns([{ v: 'out', label: t('ed/signed-out') }, { v: 'in', label: t('ed/signed-in') }], D.login ? 'in' : 'out', 'setLogin')}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-logo')}</div><div class="tb-group">${row('logo', `<span class="thumb logo" style="filter:${D.tb.logoF}"><img src="assets/classic/logo.png" alt=""></span>`, 'Logo', '230×76 · PNG / SVG', false)}</div>${ups(['logo'])}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-entries')}</div><div class="tb-group">${entries}${pos}</div>${ups(['cur', 'side', 'search'])}</div>
      <div class="p-sec"><div class="tb-group">${auth}${D.login && it.auth ? `<div class="tb-item tb-balst"><span class="tx"><b>${t('ed/bal-style')}</b></span></div><div class="bal-opts">${BAL_STYLES.map((v) => `<button class="bal-opt ${(D.tb.balStyle || 'pill') === v ? 'is-on' : ''}" data-act="tbBal" data-arg="${v}"><span class="bal-prev">${balHtml(v, '¥ 1,280')}</span><small>${t('ed/bal-' + v)}</small></button>`).join('')}</div>` : ''}</div><div class="p-note">${t(D.login ? 'ed/tb-balance-note' : 'ed/tb-auth-note')}</div></div>
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
    if (E.iconAi && E.iconAi.b === b) return window.MP.aiPanel();
    // AD-04：侧边栏在电脑画布上没有浮动工具条，「AI 重新生成」放在面板标题右侧（测试修复）
    const adBtn = b === 'sidebar' && window.AD && !mobileEd() ?`<span style="flex:1"></span>${window.AD.toolBtn(id, true)}` : '';
    const head = `<h2 class="p-title">${esc(modName(id))}${adBtn}</h2>`;
    const pcN = window.PC && window.PC.panelNote ? window.PC.panelNote(id) : '';
    if (b === 'banner') return head + tabs3(E.tab) + (E.tab === 'content' ? bannerContent() : E.tab === 'layout' ? bannerLayout() : bannerColor());
    if (b === 'topbar') return head + tabs3(E.tab) + (E.tab === 'content' ? tbContent() : E.tab === 'layout' ? tbLayout() : tbColor());
    if (window.MP.has(b)) return head + pcN + tabs3(E.tab) + window.MP.panel(b, E.tab);
    return head + window.empty('wrench-fill', t('ed/todo-title'), t('ed/todo-desc'));
  }
  function rightPanel() { if (E.adp && !E.sel && window.AD) return window.AD.edPanel(); return E.sel ? modulePanel(E.sel) : pageSettings(); }

  // ---------- 取色器 ----------
  function pickerHtml(cls = '', title) {
    const p = E.picker; const hsv = hex2hsv(p.value);
    const name = title || p.label || t('ed/key-' + p.key);
    const fixedRow = p.tbRow || p.elRow;
    const keyMenu = !fixedRow && S.menu === 'keymenu' ? `<div class="menu keymenu">${KEYS.map((k) => `<button class="menu-item ${p.key === k ? 'is-on' : ''}" data-act="pickKey" data-arg="${k}"><span class="sw" style="background:${E.D.theme[k]}"></span>${t('ed/key-' + k)}<span class="kk">${k}</span></button>`).join('')}</div>` : '';
    return `<div class="picker ${cls}" data-picker>
      <div class="pk-head">${fixedRow ? `<span class="pk-title">${esc(name)}</span>` : `<button class="pk-title" data-act="menu:toggle" data-arg="keymenu">${esc(name)}${ic('caret-down')}</button>`}${keyMenu}<span class="caption faint">${fixedRow ? (p.elRow && p.elRow.startsWith('key:') ? p.elRow.slice(4) : '') : p.key}</span></div>
      <div class="pk-cmp"><div style="background:${p.orig};color:${inkOn(p.orig)}">${t('ed/pick-current')}</div><div data-pk-new style="background:${p.value};color:${inkOn(p.value)}">${t('ed/pick-new')}</div></div>
      <div class="pk-sv" data-drag="sv" style="background:hsl(${hsv.h},100%,50%)"><span class="pk-dot" data-pk-svdot style="left:${hsv.s * 100}%;top:${(1 - hsv.v) * 100}%;background:${p.value}"></span></div>
      <div class="pk-h" data-drag="hue"><span class="pk-dot" data-pk-hdot style="left:${(hsv.h / 360) * 100}%;background:hsl(${hsv.h},100%,50%)"></span></div>
      <label class="pk-hex"><i data-pk-sw style="background:${p.value}"></i><input data-input="pkHex" value="${p.value.toUpperCase()}" maxlength="7"></label>
      <div class="caption muted" style="margin-top:8px">${t('ed/pick-suggest')}</div>
      <div class="pk-sug">${SUGGEST.map((c) => `<button style="background:${c}" data-act="pkSet" data-arg="${c}"></button>`).join('')}</div>
      <div class="caption faint" style="margin-bottom:10px">${t('ed/pick-sync')}</div>
      <div class="pk-foot"><button class="btn btn-secondary btn-sm" data-act="pkCancel">${t('confirm/cancel')}</button><button class="btn btn-primary btn-sm" data-act="pkApply">${t('ed/pick-apply')}</button></div></div>`;
  }
  A.pick = (arg) => { const [k, where] = arg.split('|'); const v = E.D.theme[k]; E.picker = { key: k, orig: v, value: v, where: mobileEd() ? 'sheet' : where }; S.menu = null; if (mobileEd()) { E.picker.back = ['colors', 'module'].includes(E.mpanel) ? E.mpanel : null; E.mpanel = 'picker'; } };
  A.pickTb = (k) => { const th = E.D.theme; const cur = E.D.tb.colors[k] || { bg: th.bg_2, text: th.lead, search: th.primary, reg: th.accent_3 }[k]; if (E.picker && E.picker.tbRow === k) { E.picker = null; return; } E.picker = { key: k, tbRow: k, orig: cur, value: cur, where: 'tb' }; };
  A.pickKey = (k) => { const v = E.D.theme[k]; Object.assign(E.picker, { key: k, orig: v, value: v }); S.menu = null; };
  A.pkSet = (c) => { E.picker.value = c; };
  A.pkCancel = () => { const p = E.picker; E.picker = null; if (E.mpanel === 'picker') E.mpanel = p && p.back ? p.back : null; };
  A.pkApply = () => {
    const p = E.picker; if (!p) return;
    const back = () => { E.picker = null; if (E.mpanel === 'picker') E.mpanel = p.back || null; };
    if (p.value.toLowerCase() === p.orig.toLowerCase()) { back(); return; }
    commit(() => { if (p.tbRow) E.D.tb.colors[p.tbRow] = p.value; else if (p.elRow) E.D.ec[p.elRow] = p.value; else { E.D.theme[p.key] = p.value; E.D.palette = null; } });
    back();
    if (p.elRow && p.elRow.startsWith('key:')) { window.toast(t('ed/changed-undo'), undoOpt(4000)); return; }
    const label = p.elRow ? t('mp/c-' + p.elRow.replace('.', '-')) : p.tbRow ? t({ bg: 'ed/tb-c-bg', text: 'ed/tb-c-text', search: 'ed/tb-c-search', reg: 'ed/tb-c-reg' }[p.tbRow]) : t('ed/key-' + p.key);
    window.toast(t('ed/toast-color', { k: label }), undoOpt(4000));
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

  // ---------- 拖动：取色、模块 / 入口 / 轮播图排序、Banner 滑动、裁切框 ----------
  document.addEventListener('pointerdown', (e) => {
    const drag = e.target.closest('[data-drag]');
    if (drag && E.picker) {
      e.preventDefault();
      const kind = drag.dataset.drag; const rect = drag.getBoundingClientRect();
      const hsv0 = hex2hsv(E.picker.value); E.picker.h = E.picker.h != null ? E.picker.h : hsv0.h;
      const move = (ev) => {
        if (!E.picker) return;
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
    const fr = e.target.closest('[data-rs-frame]');
    if (fr && E.rs) { startCropDrag(e, fr); return; }
    const grip = e.target.closest('[data-grip]');
    if (grip) {
      // 手机按住手柄 200ms 后才开始拖
      if (e.pointerType === 'touch') {
        const x0 = e.clientX, y0 = e.clientY; let ok = true;
        const mv = (ev) => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) ok = false; };
        window.addEventListener('pointermove', mv);
        setTimeout(() => { window.removeEventListener('pointermove', mv); if (ok) startReorder(e, grip); }, 200);
      } else startReorder(e, grip);
      return;
    }
    const vp = e.target.closest('[data-swipe]');
    if (vp) {
      const x0 = e.clientX;
      const up = (ev) => { window.removeEventListener('pointerup', up); const dx = ev.clientX - x0; if (Math.abs(dx) > 30) { const v = visIdx(); const p = v.indexOf(E.slide); setSlide(v[(p + (dx < 0 ? 1 : -1) + v.length) % v.length]); E.swiped = Date.now(); } };
      window.addEventListener('pointerup', up);
    }
  });
  function startReorder(e, grip) {
    if (e.cancelable) e.preventDefault();
    const id = grip.dataset.grip; const list = grip.closest('[data-drag-list]'); if (!list) return;
    const rows = [...list.querySelectorAll(':scope > [data-row]')]; const src = rows.find((r) => r.dataset.row === id); if (!src) return;
    src.classList.add('is-dragging'); let target = null;
    const move = (ev) => {
      rows.forEach((r) => r.classList.remove('drop-before', 'drop-after'));
      target = null;
      for (const r of rows) { const b = r.getBoundingClientRect(); if (ev.clientY >= b.top && ev.clientY <= b.bottom && r !== src) { const before = ev.clientY < b.top + b.height / 2; r.classList.add(before ? 'drop-before' : 'drop-after'); target = { id: r.dataset.row, before }; } }
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      const key = list.dataset.dragList;
      if (target && key) {
        const curIdx = E.slide; let newCur = curIdx;
        commit(() => {
          const arr = key === 'banner' ? E.D.banner.slides : E.D.m[key].items; const from = +id; const it = arr.splice(from, 1)[0]; let i = +target.id; if (i > from) i--; if (!target.before) i++; arr.splice(i, 0, it);
          if (key === 'banner') { const order = arr.map((_, k) => k); const map = []; order.forEach(() => {}); if (from === curIdx) newCur = i; else { let c = curIdx; if (from < c) c--; if (i <= c) c++; newCur = c; } void map; }
        });
        if (key === 'banner') E.slide = Math.max(0, Math.min(newCur, E.D.banner.slides.length - 1));
      } else if (target) commit(() => { const o = E.D.order.filter((x) => x !== id); let i = o.indexOf(target.id); if (!target.before) i++; o.splice(i, 0, id); E.D.order = o; });
      window.render();
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }

  // ---------- Banner 轮播 ----------
  function setSlide(i) {
    if (i == null || !E.D.banner.slides[i]) return;
    E.slide = i;
    const pos = Math.max(0, visIdx().indexOf(i));
    document.querySelectorAll('.h5-banner .track').forEach((n) => { n.style.transform = `translateX(${-pos * 100}%)`; });
    document.querySelectorAll('.h5-ind').forEach((w) => [...w.children].forEach((d, k) => d.classList.toggle('on', k === pos)));
    if (E.sel === 'banner' && !E.ai) window.render();
  }
  setInterval(() => {
    if (S.route !== 'editor' || E.loading || (E.sel === 'banner') || E.picker || document.hidden || E.dlg) return;
    if (E.swiped && Date.now() - E.swiped < 3000) return;
    const v = visIdx(); if (v.length < 2) return; setSlide(v[(v.indexOf(E.slide) + 1) % v.length]);
  }, 3000);
  A.slideTo = (i) => { setSlide(+i); return false; };

  // ---------- 选择与模块操作 ----------
  A.selMod = (id, el, e) => {
    if (e && el && e.target.closest('[data-stop]') && !el.matches('[data-stop]')) return false;
    if (Date.now() - (E.swiped || 0) < 300) return false;
    const nid = id || null;
    if (nid !== E.sel) { E.tab = 'content'; E.ai = null; E.picker = null; E.iconAi = null; E.rn = null; }
    E.sel = nid; S.menu = null; E.keys = null;
    E.h5side = nid === 'sidebar';
    if (mobileEd()) E.mpanel = nid ? 'module' : null;
    // 从左栏选模块：画布滚到该模块，选中框和工具条可见
    if (nid && el && el.closest && el.closest('.ed-left')) setTimeout(() => { const n = document.querySelector(`.ed-canvas [data-mod="${nid}"]`); if (n && n.scrollIntoView) n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 30);
  };
  A.setTab = (v) => { E.tab = v; E.picker = null; E.rn = null; };
  A.tbTab = (v) => { E.tab = v; E.ai = null; E.iconAi = null; if (mobileEd()) E.mpanel = 'module'; };
  A.toggleHide = (id) => {
    const was = !!E.D.hidden[id];
    commit(() => { E.D.hidden[id] = !was; }); S.menu = null; if (id === 'sidebar') E.h5side = false;
    if (!was) window.toast(t('ed/hidden-toast', { name: modName(id) }), undoOpt());
  };
  A.move = (d) => { const id = E.sel; const o = E.D.order; const i = o.indexOf(id), j = i + +d; if (i < 0 || j < 0 || j >= o.length) return false; commit(() => { E.D.order.splice(i, 1); E.D.order.splice(j, 0, id); }); window.toast(t(+d < 0 ? 'ed/moved-up' : 'ed/moved-down')); };
  A.modDup = (id) => { commit(() => { const b = baseName(id); let n = 1, nid = b + '~' + n; while (E.D.order.includes(nid)) nid = b + '~' + ++n; E.D.order.splice(E.D.order.indexOf(id) + 1, 0, nid); E.sel = nid; }); S.menu = null; window.toast(t('ed/dup-toast'), undoOpt()); };
  A.modReset = (id) => {
    commit(() => { const d = defaultDesign(E.D.template); const b = baseName(id); if (b === 'topbar') E.D.tb = d.tb; if (b === 'banner') E.D.banner = d.banner; if (d.m[b]) E.D.m[b] = d.m[b]; window.MP.resetColors(b); E.D.hidden[id] = false; });
    fixSlide(); S.menu = null; window.toast(t('ed/reset-toast'), undoOpt());
  };
  // 删除：页面里的流式模块真正移除（可撤销、可从「添加模块」加回来）；顶部栏 / 底部导航 / 侧边栏是固定模块，只能隐藏
  A.modDel = (id) => {
    const inFlow = E.D.order.includes(id);
    commit(() => { if (inFlow) E.D.order = E.D.order.filter((x) => x !== id); else E.D.hidden[id] = true; });
    if (E.sel === id) E.sel = null; S.menu = null; if (E.mpanel === 'module') E.mpanel = null;
    window.toast(t(inFlow ? 'ed/deleted-toast' : 'ed/hidden-toast', { m: modName(id), name: modName(id) }), undoOpt());
  };
  const ADDABLE = ['banner', 'notice', 'midnav', 'gamemenu', 'gamecards']; // 经典蓝白没有彩金池 / 页脚
  A.addMod = (b) => {
    let id = b; let n = 1; while (E.D.order.includes(id)) id = b + '~' + n++;
    commit(() => { const i = E.D.order.indexOf(E.sel); if (i >= 0) E.D.order.splice(i + 1, 0, id); else E.D.order.push(id); E.D.hidden[id] = false; });
    S.menu = null; E.tab = 'content'; E.ai = null; E.picker = null; E.keys = null;
    if (mobileEd()) { E.mpanel = 'modules'; E.sel = null; } else E.sel = id;
    window.toast(t('ed/added-toast', { m: modName(id) }), undoOpt());
    setTimeout(() => { const n2 = document.querySelector(`.h5 [data-mod="${id}"]`); if (n2) n2.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30);
  };
  // 左栏可滚动会裁掉菜单，所以「添加模块」菜单用 fixed 定位到按钮正下方（往下弹）
  window.AFTER_RENDER.push(() => {
    const m = document.querySelector('.add-menu'); if (!m) return;
    const r = m.parentElement.querySelector('.add-mod').getBoundingClientRect();
    m.style.position = 'fixed'; m.style.left = r.left + 'px'; m.style.top = (r.bottom + 6) + 'px';
    m.style.maxHeight = (window.innerHeight - r.bottom - 18) + 'px'; m.style.overflow = 'auto';
  });
  A.addMenu = () => { if (mobileEd()) { E.mpanel = 'addmod'; S.menu = null; } else S.menu = window.__prevMenu === 'addmod' ? null : 'addmod'; };
  function addList() {
    return `<div class="add-hd"><div class="t">${t('ed/add-title')}</div><div class="caption faint">${t('ed/add-hint')}</div></div><div class="add-grid">${ADDABLE.map((b) => {
      const ico = { notice: 'bell-fill', banner: 'image-fill', jackpot: 'sparkle-fill', midnav: 'list', gamemenu: 'squares-four', gamecards: 'squares-four-fill', footer: 'file-image' }[b];
      const inPg = E.D.order.some((x) => baseName(x) === b);
      return `<button class="add-it" data-act="addMod" data-arg="${b}"><span class="tile">${ic(ico)}</span><span class="tx"><span class="nm">${t(MODS[b].key)}</span><span class="ds">${t('ed/desc-' + b)}</span></span>${inPg ? `<span class="tag">${t('ed/add-in-page')}</span>` : ''}</button>`;
    }).join('')}</div>`;
  }
  A.setSide = (v) => { if (E.D.side === v) return false; commit(() => { E.D.side = v; }); };
  A.h5Side = () => { E.h5side = true; E.sel = 'sidebar'; E.keys = null; if (mobileEd()) E.mpanel = 'module'; };
  A.h5SideClose = (a, el, e) => { if (e.target.closest('.pn')) return false; E.h5side = false; if (E.sel === 'sidebar') E.sel = null; if (mobileEd()) E.mpanel = null; };
  A.setLogin = (v) => { if (E.D.login === (v === 'in')) return false; commit(() => { E.D.login = v === 'in'; }); };

  // ---------- 换整套配色（ED-14） ----------
  function customCount() { const base = baseOf(E.D); return ecCustom(E.D) + KEYS.filter((k) => E.D.theme[k].toLowerCase() !== base[k].toLowerCase()).length; }
  function applyPalette(k, keep) {
    const base = baseOf(E.D); const nw = preset(k);
    commit(() => {
      if (keep) { KEYS.forEach((key) => { if (E.D.theme[key].toLowerCase() === base[key].toLowerCase()) E.D.theme[key] = nw[key]; }); const be = E.D.baseEc || {}; Object.keys(be).forEach((id) => { if (E.D.ec[id] === be[id]) delete E.D.ec[id]; }); }
      else { E.D.theme = nw; E.D.ec = {}; }
      E.D.palette = k; E.D.basePreset = k; delete E.D.baseTheme; delete E.D.baseEc;
    });
    E.picker = null; E.dlg = null; E.palQ = null;
    window.toast(t('ed/pal-applied', { name: t('color/palette-' + k) }), undoOpt());
  }
  A.setPalette = (k) => { const n = customCount(); if (E.D.palette === k && !n) return false; if (!n) { applyPalette(k, true); return; } E.palQ = { k, n, keep: true }; E.dlg = 'pal'; E.picker = null; if (E.mpanel === 'colors') E.mpanel = null; };
  A.palKeep = (v) => { E.palQ.keep = v === '1'; };
  A.palApply = () => { applyPalette(E.palQ.k, E.palQ.keep); };
  function palBody() {
    const q = E.palQ; const name = t('color/palette-' + q.k);
    const opt = (v, k, d) => `<button class="rcard ${q.keep === (v === '1') ? 'is-on' : ''}" data-act="palKeep" data-arg="${v}"><span class="radio ${q.keep === (v === '1') ? 'is-on' : ''}"></span><span><b>${t(k)}</b><small>${t(d)}</small></span></button>`;
    return `<div class="dialog-head"><h3>${t('ed/pal-q-title', { name })}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><p class="muted" style="margin:0 0 12px">${t('ed/pal-q-body', { n: q.n })}</p>
      <div class="pal-prev">${PRESETS[q.k].map((c) => `<i style="background:${c}"></i>`).join('')}</div>
      ${opt('1', 'ed/pal-keep', 'ed/pal-keep-d')}${opt('0', 'ed/pal-all', 'ed/pal-all-d')}
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary" data-act="palApply">${t('ed/pal-apply')}</button></div>`;
  }

  // ---------- 切换模板（ED-23） ----------
  function tplCounts(D) {
    const base = baseOf(D); const tp = tplOf(D.template);
    const colors = ecCustom(D) + KEYS.filter((k) => D.theme[k].toLowerCase() !== base[k].toLowerCase()).length;
    let assets = D.banner.slides.filter((s, i) => s.f !== (tp.slides[i] || 'none') || s.fit).length;
    ['jackpot.bg', 'gamecards.fallback', 'sidebar.head'].forEach((p) => { const [b, f] = p.split('.'); if (D.m[b][f]) assets++; });
    if (D.tb.logoF !== 'none') assets++;
    // 换过的入口图标 + 改过的入口名 / 页脚链接名（名字不在默认名单里即算改过）
    const d0 = window.MP ? window.MP.defaults() : null;
    let icons = 0; ['midnav', 'bottomnav', 'gamemenu', 'sidebar', 'footer'].forEach((b) => { const dn = d0 && d0[b] ? d0[b].items.map((x) => x.n) : []; D.m[b].items.forEach((it) => { if (it.img || it.imgOn || (it.n && (it.k || (d0 && !dn.includes(it.n))))) icons++; }); });
    return { colors, assets, icons, n: colors + assets + icons };
  }
  function tplDesign(k, keep) {
    const D0 = E.D; const nd = defaultDesign(k);
    ['side', 'login', 'height', 'chkOk'].forEach((f) => { nd[f] = JSON.parse(JSON.stringify(D0[f])); });
    if (keep) {
      const base = baseOf(D0);
      KEYS.forEach((key) => { if (D0.theme[key].toLowerCase() !== base[key].toLowerCase()) nd.theme[key] = D0.theme[key]; });
      nd.ec = JSON.parse(JSON.stringify(D0.ec)); const be = D0.baseEc || {}; Object.keys(be).forEach((id) => { if (nd.ec[id] === be[id]) delete nd.ec[id]; }); nd.tb.colors = Object.assign({}, D0.tb.colors); nd.tb.logoF = D0.tb.logoF;
      const tp0 = tplOf(D0.template);
      D0.banner.slides.forEach((s, i) => { if (nd.banner.slides[i] && (s.f !== (tp0.slides[i] || 'none'))) nd.banner.slides[i] = Object.assign({}, s, { w: BANNER[nd.banner.size].w, h: BANNER[nd.banner.size].h }); });
      ['jackpot.bg', 'gamecards.fallback', 'sidebar.head'].forEach((p) => { const [b, f] = p.split('.'); if (D0.m[b][f]) nd.m[b][f] = D0.m[b][f]; });
      ['midnav', 'bottomnav', 'gamemenu', 'sidebar', 'footer'].forEach((b) => D0.m[b].items.forEach((it, i) => { const t2 = nd.m[b].items[i]; if (!t2) return; ['img', 'imgOn'].forEach((f) => { if (it[f]) t2[f] = it[f]; }); if (it.n && (it.k || it.n !== t2.n)) t2.n = it.n; }));
    }
    return nd;
  }
  A.edOpenTpl = () => { E.tpl = { step: 'list', chip: 'all', k: null, keep: true, busy: false }; E.dlg = 'tplpick'; E.picker = null; S.menu = null; if (E.mpanel === 'pages') E.mpanel = null; };
  A.edTplChip = (c) => { E.tpl.chip = c; };
  A.edTplPick = (k) => { if (k === E.D.template || !window.tplOpen(k)) return false; E.tpl.k = k; E.tpl.step = 'preview'; E.tpl.keep = true; };
  A.edTplBack = () => { if (E.tpl.busy) return false; E.tpl.step = 'list'; E.tpl.k = null; };
  A.edTplKeep = (v) => { E.tpl.keep = v === '1'; };
  A.edTplUse = () => {
    const T = E.tpl; if (!T || !T.k || T.busy) return false;
    T.busy = true;
    setTimeout(() => {
      if (E.tpl !== T) return;
      const nd = tplDesign(T.k, T.keep);
      commit(() => { E.D = nd; });
      E.dlg = null; E.tpl = null; E.sel = null; E.slide = 0; E.mpanel = null;
      window.toast(t('ed/tpl-switched', { name: t('template/' + nd.template) }), undoOpt());
      window.render();
    }, 600);
  };
  function h5For(D) {
    const keep = { D: E.D, sel: E.sel, ai: E.ai, picker: E.picker, side: E.h5side, slide: E.slide };
    E.D = D; E.sel = null; E.ai = null; E.picker = null; E.h5side = false; E.slide = 0;
    let html = '';
    try { html = h5({ noFold: true }); } finally { Object.assign(E, { D: keep.D, sel: keep.sel, ai: keep.ai, picker: keep.picker, h5side: keep.side, slide: keep.slide }); }
    return html;
  }
  function tplBody(mobile) {
    const T = E.tpl;
    const x = `<button class="ibtn ibtn-sm" data-act="closeDlg" aria-label="${esc(t('ed/close'))}">${ic('x')}</button>`;
    if (T.step === 'list') {
      const chips = ['all', 'classic', 'western', 'minimal', 'dark', 'festive'];
      const list = TPLS().filter((p) => T.chip === 'all' || p.f === T.chip);
      const card = (p) => {
        const cur = p.k === E.D.template, pro = !window.tplOpen(p.k); // 未开放：只显示底板色
        return `<button class="tpl-card ${cur ? 'is-cur' : ''} ${pro ? 'is-off' : ''}" data-act="edTplPick" data-arg="${p.k}" ${cur || pro ? 'aria-disabled="true"' : ''}>${tplThumb(p.k, 'big', pro)}${cur ? `<span class="pill-tag tpl-tag">${t('ed/tpl-current')}</span>` : ''}${pro ? `<span class="pill-tag is-gray tpl-tag">${t('level/coming-soon')}</span>` : ''}<span class="nm ellipsis">${t('template/' + p.k)}</span><span class="caption faint">${t('template/meta-' + p.meta)}</span></button>`;
      };
      return `<div class="dialog-head"><h3>${t('ed/tpl-switch')}</h3>${x}</div><div class="filters scroll-x tpl-chips">${chips.map((c) => `<button class="chip ${T.chip === c ? 'is-on' : ''}" data-act="edTplChip" data-arg="${c}">${t('filter/' + c)}</button>`).join('')}</div>
        <div class="tpl-grid" data-sk="tplgrid">${list.length ? list.map(card).join('') : `<div class="empty is-sm"><div class="ico">${ic('squares-four-fill', 'ic-24')}</div><h3>—</h3></div>`}</div>`;
    }
    const c = tplCounts(E.D); const nd = tplDesign(T.k, T.keep && c.n > 0);
    const det = [c.colors && t('ed/tpl-d-colors', { n: c.colors }), c.assets && t('ed/tpl-d-assets', { n: c.assets }), c.icons && t('ed/tpl-d-icons', { n: c.icons })].filter(Boolean).join('、');
    const ro = (v, k) => `<button class="rcard sm ${T.keep === (v === '1') ? 'is-on' : ''}" data-act="edTplKeep" data-arg="${v}"><span class="radio ${T.keep === (v === '1') ? 'is-on' : ''}"></span><span><b>${t(k)}</b></span></button>`;
    const over = c.n ? `<div class="notice is-warn">${ic('warning-circle-fill')}<div>${t('ed/tpl-overwrite', { n: c.n, detail: det })}</div></div>${ro('1', 'ed/tpl-keep')}${ro('0', 'ed/tpl-all')}<div class="caption faint" style="margin-top:6px">${t('ed/tpl-undo-note')}</div>` : '';
    const rep = [t('ed/tpl-r-layout'), t('ed/tpl-r-colors'), t('ed/tpl-r-assets', { n: tplOf(T.k).slides.length })];
    return `<div class="dialog-head"><h3 class="tpl-h"><button class="ibtn ibtn-sm" data-act="edTplBack" aria-label="${esc(t('ed/tpl-back'))}">${ic('caret-left')}</button><span class="ellipsis">${t('template/' + T.k)}</span></h3>${x}</div>
      <div class="ed-tprev ${mobile ? 'is-m' : ''}" data-sk="tplprev"><div class="tpl-long"><div class="tpl-scale">${h5For(nd)}</div></div>
        <div class="tpl-side"><div class="lab">${t('ed/tpl-replaces')}</div>${rep.map((r) => `<div class="tpl-li">${ic('check-circle-fill', 'ic-16')}${r}</div>`).join('')}<div style="margin-top:12px">${over}</div></div></div>
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="edTplBack">${t('ed/tpl-back')}</button><button class="btn btn-primary ${T.busy ? 'is-busy' : ''}" data-act="edTplUse">${T.busy ? ic('circle-notch', 'ic-16 spin') : ''}${t('ed/tpl-use')}</button></div>`;
  }

  A.toggleAdv = () => { E.adv = !E.adv; };
  A.bannerSize = (v) => { if (E.D.banner.size === v) return false; commit(() => { E.D.banner.size = v; }); };
  A.bannerInd = (v) => { if (E.D.banner.ind === v) return false; commit(() => { E.D.banner.ind = v; }); };
  A.bannerMargin = (v) => { commit(() => { E.D.banner.margin = +v; }); };
  A.bannerCorner = (v) => { commit(() => { E.D.banner.corner = +v; }); };
  A.addSlide = () => { const sz = BANNER[E.D.banner.size]; commit(() => { E.D.banner.slides.push({ f: 'hue-rotate(90deg) saturate(.8)', w: sz.w, h: sz.h }); }); setSlide(E.D.banner.slides.length - 1); };
  A.tbItem = (k) => { commit(() => { E.D.tb.items[k] = !E.D.tb.items[k]; }); };
  A.tbSwap = () => { commit(() => { E.D.tb.searchFirst = !E.D.tb.searchFirst; }); };
  A.tbColor = (arg) => { const [k, c] = arg.split('|'); commit(() => { E.D.tb.colors[k] = c; }); E.picker = null; };
  ['h', 'pad', 'gap'].forEach((k) => { A['tbLayout_' + k] = (v) => { commit(() => { E.D.tb[k] = +v; }); }; });
  A.setDevice = (v) => { E.device = v; E.ai = null; E.iconAi = null; E.picker = null; };
  A.mDevice = (v) => { E.device = v; E.mpanel = null; E.sel = null; E.picker = null; };
  A.zoom = (d) => { const z = [25, 50, 75, 100]; const i = z.indexOf(E.zoom) + +d; if (i >= 0 && i < z.length) E.zoom = z[i]; else return false; };
  A.togglePal = () => { E.palOpen = !E.palOpen; if (!E.palOpen && E.picker && E.picker.where === 'float') E.picker = null; };
  A.edBack = () => { window.go('home'); return false; };

  // ---------- 项目名（ED-15）：改名同步到项目列表 ----------
  function rename(v) {
    v = (v || '').trim(); if (!v || v === E.name) return false;
    const old = E.name; const P = window.PROJECTS;
    if (Array.isArray(P) && P.some((x) => x.name === v)) { window.toast(t('ed/name-taken'), { info: true }); return false; } // 不能和其它项目同名
    const xr = LS.get('ed.x.' + old, null); if (xr) LS.set('ed.x.' + v, xr);
    if (Array.isArray(P)) { const p = P.find((x) => x.name === old); if (p) p.name = v; }
    E.name = v; persist();
    window.toast(t('toast/renamed'));
    return true;
  }
  A.nameEdit = () => { E.nameEdit = { v: E.name }; if (mobileEd()) E.dlg = 'rename'; };
  I.nameIn = (v) => { if (E.nameEdit) E.nameEdit.v = v; };
  A.nameKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const v = E.nameEdit && E.nameEdit.v; E.nameEdit = null; if (E.dlg === 'rename') E.dlg = null; rename(v); return true; }
    if (e.key === 'Escape') { E.nameEdit = null; if (E.dlg === 'rename') E.dlg = null; return true; }
  };
  A.nameSave = () => { const v = E.nameEdit && E.nameEdit.v; E.nameEdit = null; E.dlg = null; rename(v); };
  document.addEventListener('focusout', (e) => {
    if (!e.target.matches || !e.target.matches('.ed-name-in')) return;
    setTimeout(() => { const ae = document.activeElement; if (E.nameEdit && E.dlg !== 'rename' && !(ae && ae.matches && ae.matches('.ed-name-in'))) { const v = E.nameEdit.v; E.nameEdit = null; rename(v); window.render(); } }, 0);
  });
  function saveHtml(small) {
    const st = E.save;
    const inner = st === 'saving' ? `${ic('circle-notch', 'spin')}<span>${t('ed/saving')}</span>` : st === 'failed' ? `${ic('warning-circle-fill')}<span>${t('ed/save-failed')} · <button class="link" data-act="saveRetry" data-stop>${t('ed/save-retry')}</button></span>` : `${ic('check-circle-fill')}<span>${t('ed/saved')}</span>`;
    return `<span class="ed-saved is-${st} ${small ? 'sm' : ''}">${inner}</span>`;
  }
  function renameBody() {
    return `<div class="dialog-head"><h3>${t('ed/project-name')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><input class="input" style="width:100%" data-input="nameIn" data-key="nameKey" value="${esc(E.nameEdit ? E.nameEdit.v : E.name)}" maxlength="40" data-autofocus>
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary" data-act="nameSave">${t('ed/save')}</button></div>`;
  }

  // ---------- 素材：上传 / 素材库 / 调整尺寸 ----------
  const SLOT_SPEC = { 'mp-jackpot-bg': [702, 160, 'mp/jp-bg'], 'mp-gamecards-fallback': [300, 225, 'mp/gc-fallback'], 'mp-sidebar-head': [540, 200, 'mp/sd-head'], 'tb-logo': [230, 76, null], 'tb-cur': [142, 46, 'ed/tb-cur'] };
  function slotSpec(slot) { if (slot.startsWith('slide')) { const b = BANNER[E.D.banner.size]; return { w: b.w, h: b.h, name: 'Banner' }; } const s = SLOT_SPEC[slot] || [96, 96, null]; return { w: s[0], h: s[1], name: s[2] ? t(s[2]) : 'Logo' }; }
  function getAsset(slot) { if (slot.startsWith('mp-')) return window.MP.getAsset(slot); if (slot.startsWith('slide')) return Object.assign({}, E.D.banner.slides[+slot.slice(5)]); return E.D.tb.logoF; }
  function setAsset(slot, v) {
    if (slot.startsWith('mp-')) window.MP.setAsset(slot, v && typeof v === 'object' ? v.f : v);
    else if (slot.startsWith('slide')) { const i = +slot.slice(5); const prev = E.D.banner.slides[i] || {}; E.D.banner.slides[i] = v && typeof v === 'object' ? Object.assign({ hid: prev.hid }, v) : { f: v, w: prev.w, h: prev.h, hid: prev.hid }; }
    else if (slot === 'tb-logo') E.D.tb.logoF = v && typeof v === 'object' ? v.f : v;
  }
  A.toolReplace = () => { E.tab = 'content'; E.ai = null; S.menu = null; E.fpSlot = 'slide' + E.slide; E.dlg = 'fp'; };
  A.amUpload = (slot) => { S.menu = null; E.fpSlot = slot; E.dlg = 'fp'; };
  A.amReset = (slot) => {
    S.menu = null;
    commit(() => { if (slot.startsWith('slide')) { const i = +slot.slice(5); const sz = BANNER[E.D.banner.size]; E.D.banner.slides[i] = { f: tplOf(E.D.template).slides[i] || 'none', w: sz.w, h: sz.h, hid: E.D.banner.slides[i].hid }; } if (slot === 'tb-logo') E.D.tb.logoF = 'none'; if (slot.startsWith('mp-')) window.MP.setAsset(slot, null); });
    window.toast(t('ed/reset-toast'), undoOpt());
  };
  A.amToggle = (slot) => {
    S.menu = null;
    if (slot.startsWith('mp-')) { window.MP.toggleAsset(slot); return; }
    if (slot.startsWith('tb-')) { A.tbItem(slot.slice(3)); return; }
    const i = +slot.slice(5); const s = E.D.banner.slides[i]; if (!s) return false;
    if (!s.hid && visIdx().length <= 1) return false;
    const hide = !s.hid;
    commit(() => { E.D.banner.slides[i].hid = hide; });
    if (hide) { if (E.slide === i) { const v = visIdx(); E.slide = v.find((k) => k > i) ?? v[0]; } window.toast(t('ed/slide-hide-toast', { n: i + 1 }), undoOpt()); }
  };
  A.amDelete = (slot) => {
    S.menu = null; const i = +slot.slice(5); const B = E.D.banner;
    if (B.slides.length <= 1) return false;
    commit(() => { E.D.banner.slides.splice(i, 1); if (!visIdx().length) E.D.banner.slides[0].hid = false; });
    if (E.slide >= E.D.banner.slides.length) E.slide = E.D.banner.slides.length - 1; fixSlide();
    window.toast(t('ed/slide-del-toast', { n: i + 1 }), undoOpt());
  };
  // 上传（模拟进度）：合规直接替换；不合规先进「调整尺寸」
  function uploadTo(slot, f, w, h, fit) {
    E.dlg = null; E.replaced = null; if (E.upload) clearInterval(E.upload.timer);
    E.upload = { slot, pct: 0 };
    const up = E.upload;
    up.timer = setInterval(() => {
      if (E.upload !== up) { clearInterval(up.timer); return; }
      up.pct = Math.min(100, up.pct + 9);
      const b = document.querySelector('[data-upl]'); if (b) b.textContent = up.pct + '%';
      const bar = document.querySelector('[data-uplbar]'); if (bar) bar.style.width = up.pct + '%';
      if (up.pct >= 100) {
        clearInterval(up.timer);
        const prev = getAsset(slot);
        commit(() => { setAsset(slot, { f, w, h, fit }); });
        E.upload = null; E.replaced = { slot, prev };
        if (!E.projAssets.some((a) => a.f === f)) E.projAssets.push({ f, name: slotSpec(slot).name + ' · ' + (E.projAssets.length + 1) });
        window.toast(t('ed/upload-done')); window.render();
      }
    }, 140);
  }
  A.fpPick = (arg) => {
    const [f, w, h] = arg.split('|'); const slot = E.fpSlot; const sp = slotSpec(slot);
    if (+w !== sp.w || +h !== sp.h) { openResize(slot, f, +w, +h); return; }
    uploadTo(slot, f, sp.w, sp.h);
  };
  A.cancelUpload = () => { if (E.upload) clearInterval(E.upload.timer); E.upload = null; };
  A.undoReplace = () => { const r = E.replaced; if (!r) return; commit(() => { setAsset(r.slot, r.prev); }); E.replaced = null; };

  // 素材库（ED-03）
  const LIB_CH = ['festive', 'sports', 'sports', 'festive', 'brand', 'brand', 'sports', 'festive'];
  const LIB_F = ['hue-rotate(-40deg) saturate(1.5)', 'hue-rotate(100deg)', 'hue-rotate(200deg) saturate(1.2)', 'sepia(.5) saturate(1.4)', 'hue-rotate(260deg)', 'hue-rotate(320deg) saturate(1.3)', 'hue-rotate(150deg) brightness(.9)', 'hue-rotate(-20deg) saturate(1.8)'];
  function libItems(slot) {
    const sp = slotSpec(slot);
    return LIB_F.map((f, i) => { let w = sp.w, h = sp.h; if (i === 6) { w = 800; h = 600; } if (i === 7) { if (sp.w === 1080 && sp.h === 490) { w = 640; h = 640; } else { w = 1080; h = 490; } } return { f, w, h, name: t('ed/lib-a' + (i + 1)), ch: LIB_CH[i] }; });
  }
  A.openLib = (slot) => { S.menu = null; E.lib = { slot, tab: 'shared', chip: 'all', sel: null, loading: false }; E.dlg = 'lib'; libLoad(); };
  function libLoad() { const L = E.lib; L.loading = true; L.sel = null; setTimeout(() => { if (E.lib === L) { L.loading = false; if (E.dlg === 'lib') window.render(); } }, 500); }
  A.libTab = (v) => { E.lib.tab = v; libLoad(); };
  A.libChip = (v) => { E.lib.chip = v; libLoad(); };
  A.libSel = (i) => {
    const L = E.lib; const it = libList()[+i]; if (!it) return false; const sp = slotSpec(L.slot);
    if (it.w !== sp.w || it.h !== sp.h) { openResize(L.slot, it.f, it.w, it.h); return; }
    L.sel = +i;
  };
  A.libUse = () => { const L = E.lib; const it = libList()[L.sel]; if (!it) return false; E.lib = null; uploadTo(L.slot, it.f, it.w, it.h); };
  function libList() {
    const L = E.lib; const sp = slotSpec(L.slot);
    if (L.tab === 'shared') return libItems(L.slot).filter((x) => L.chip === 'all' || x.ch === L.chip);
    if (L.tab === 'project') return E.projAssets.map((a) => ({ f: a.f, w: sp.w, h: sp.h, name: a.name }));
    if (L.slot.startsWith('slide')) return E.D.banner.slides.map((s, i) => ({ f: s.f, w: s.w, h: s.h, name: t('ed/slide-n', { n: i + 1 }) }));
    const cur = getAsset(L.slot); return cur && cur !== 'none' ? [{ f: cur, w: sp.w, h: sp.h, name: sp.name }] : [];
  }
  function libBody() {
    const L = E.lib; const sp = slotSpec(L.slot);
    const tabs = segBtns([{ v: 'shared', label: t('ed/lib-tab-shared') }, { v: 'project', label: t('ed/lib-tab-project') }, { v: 'used', label: t('ed/lib-tab-used') }], L.tab, 'libTab');
    const chips = L.tab === 'shared' ? `<div class="filters scroll-x lib-chips">${['all', 'festive', 'sports', 'brand'].map((c) => `<button class="chip ${L.chip === c ? 'is-on' : ''}" data-act="libChip" data-arg="${c}">${c === 'all' ? t('filter/all') : t('ed/lib-chip-' + c)}</button>`).join('')}</div>` : '';
    const ratio = `aspect-ratio:${sp.w} / ${sp.h}`;
    const list = libList();
    const grid = L.loading ? `<div class="lib-grid">${[0, 1, 2, 3, 4, 5].map(() => `<div class="lib-it"><span class="im skeleton" style="${ratio}"></span><span class="skeleton sk-line"></span></div>`).join('')}</div>`
      : list.length ? `<div class="lib-grid">${list.map((it, i) => { const bad = it.w !== sp.w || it.h !== sp.h; return `<button class="lib-it ${L.sel === i ? 'is-on' : ''} ${bad ? 'is-bad' : ''}" data-act="libSel" data-arg="${i}"><span class="im" style="${ratio};filter:${it.f}"></span><span class="n ellipsis">${esc(it.name)}</span><span class="s">${it.w}×${it.h}</span>${bad ? `<span class="pill-tag is-warn">${t('ed/lib-bad')}</span>` : ''}</button>`; }).join('')}</div>`
        : window.empty('stack-fill', t('ed/lib-empty'), t('ed/lib-empty-d'));
    return `<div class="dialog-head"><h3>${t('ed/lib-title', { name: sp.name, w: sp.w, h: sp.h })}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div>${tabs}${chips}<div class="lib-body" data-sk="lib">${grid}</div>
      <div class="dialog-foot lib-foot"><span class="caption faint">${t('ed/lib-free')}</span><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary ${L.sel == null ? 'is-disabled' : ''}" data-act="libUse">${t('ed/lib-use')}</button></div>`;
  }

  // 调整尺寸（ED-08）：裁切 / 留边，采用后才写入
  function openResize(slot, f, w, h) { S.menu = null; E.rs = { slot, f, w, h, mode: 'crop', fill: 'bg_1', x: 0.5, y: 0.5, back: E.dlg === 'lib' ? 'lib' : null }; E.dlg = 'resize'; }
  A.openResize = (slot) => { const s = E.D.banner.slides[+slot.slice(5)]; if (!s) return false; openResize(slot, s.f, s.w, s.h); };
  A.rsMode = (m) => { E.rs.mode = m; };
  A.rsFill = (k) => { E.rs.fill = k; };
  A.rsReupload = () => { E.fpSlot = E.rs.slot; E.rs = null; E.lib = null; E.dlg = 'fp'; };
  A.rsApply = () => {
    const r = E.rs; const sp = slotSpec(r.slot);
    commit(() => { setAsset(r.slot, { f: r.f, w: sp.w, h: sp.h, fit: r.mode }); });
    E.rs = null; E.dlg = null; E.lib = null;
    window.toast(t('ed/rs-done', { w: sp.w, h: sp.h }), undoOpt());
  };
  function rsGeom(mobile) {
    const r = E.rs; const sp = slotSpec(r.slot); const BW = mobile ? Math.min(window.innerWidth - 48, 340) : 360, BH = mobile ? 220 : 260;
    const s = Math.min(BW / r.w, BH / r.h); const ow = r.w * s, oh = r.h * s; const ratio = sp.w / sp.h;
    let fw, fh; if (r.w / r.h > ratio) { fh = oh; fw = oh * ratio; } else { fw = ow; fh = ow / ratio; }
    return { ow, oh, fw, fh, sp, BW, BH };
  }
  function resizeBody(mobile) {
    const r = E.rs; const g = rsGeom(mobile); const th = E.D.theme;
    let stage;
    if (r.mode === 'crop') stage = `<div class="rs-img" style="width:${g.ow}px;height:${g.oh}px;filter:${r.f}"><div class="rs-frame" data-rs-frame style="left:${(g.ow - g.fw) * r.x}px;top:${(g.oh - g.fh) * r.y}px;width:${g.fw}px;height:${g.fh}px"></div></div>`;
    else { const ratio = g.sp.w / g.sp.h; let tw = g.BW, thh = g.BW / ratio; if (thh > g.BH) { thh = g.BH; tw = g.BH * ratio; } const s = Math.min(tw / r.w, thh / r.h); stage = `<div class="rs-pad" style="width:${tw}px;height:${thh}px;background:${th[r.fill]}"><span class="rs-img in" style="width:${r.w * s}px;height:${r.h * s}px;filter:${r.f}"></span></div>`; }
    const card = (m, icn, k) => `<button class="rcard ${r.mode === m ? 'is-on' : ''}" data-act="rsMode" data-arg="${m}">${ic(icn)}<span><b>${t(k)}</b></span></button>`;
    return `<div class="dialog-head"><h3>${t('ed/rs-title', { w: g.sp.w, h: g.sp.h })}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div>
      <div class="rs ${mobile ? 'is-m' : ''}"><div class="rs-stage">${stage}</div><div class="rs-opts">${card('crop', 'crop', 'ed/rs-crop')}${card('pad', 'frame-corners', 'ed/rs-pad')}
        ${r.mode === 'pad' ? `<div class="lab">${t('ed/rs-fill')}</div><div class="sws">${['bg_1', 'bg_2', 'primary'].map((k) => `<button class="sw-btn ${r.fill === k ? 'is-on' : ''}" style="background:${th[k]}" title="${esc(t('ed/key-' + k))}" data-act="rsFill" data-arg="${k}"></button>`).join('')}</div>` : ''}
        <button class="btn btn-ghost btn-sm" data-act="rsReupload">${ic('upload-simple', 'ic-16')}${t('ed/rs-reupload')}</button></div></div>
      <div class="dialog-foot"><span class="caption faint rs-cap">${t('ed/rs-from-to', { w: r.w, h: r.h, tw: g.sp.w, th: g.sp.h })}</span><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary" data-act="rsApply">${t('ed/pick-apply')}</button></div>`;
  }
  function startCropDrag(e, fr) {
    e.preventDefault();
    const r = E.rs; const g = rsGeom(mobileEd()); const x0 = e.clientX, y0 = e.clientY; const sx = r.x, sy = r.y;
    const mx = g.ow - g.fw, my = g.oh - g.fh;
    const move = (ev) => { if (!E.rs) return; if (mx > 0) r.x = Math.min(1, Math.max(0, sx + (ev.clientX - x0) / mx)); if (my > 0) r.y = Math.min(1, Math.max(0, sy + (ev.clientY - y0) / my)); fr.style.left = mx * r.x + 'px'; fr.style.top = my * r.y + 'px'; };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }

  // AI 生成（Banner）
  A.openAi = () => { E.sel = 'banner'; E.picker = null; S.menu = null; E.keys = null; E.iconAi = null; const sz = BANNER[E.D.banner.size]; E.ai = { prompt: t('ed/ai-auto-prompt', { w: sz.w, h: sz.h }), kw: [], refSt: {}, model: 'gpt', stage: 'idle', cand: null }; if (mobileEd()) E.mpanel = 'module'; };
  A.closeAi = () => { if (E.ai) E.ai.tok = null; E.ai = null; };
  I.aiPrompt = (v) => { E.ai.prompt = v; };
  A.aiKw = (k) => { const a = E.ai.kw; const n = +k; const i = a.indexOf(n); if (i >= 0) a.splice(i, 1); else a.push(n); };
  A.edRefPick = () => { if (window.refPick) window.refPick(E.ai.refSt); return false; };
  A.edRefView = () => { if (window.refPick) window.refPick(E.ai.refSt); return false; };
  A.edRefRm = () => { E.ai.refSt = {}; };
  A.edRefCancel = () => { if (window.refCancel) window.refCancel(E.ai.refSt); };
  A.aiModel = (m) => { E.ai.model = m; S.menu = null; };
  A.aiGen = () => {
    const a = E.ai; if (!a || a.stage === 'generating') return false;
    if (!afford(20)) { if (window.lowBalance) window.lowBalance(20); else topup(); return false; }
    a.stage = 'generating'; a.cand = null; const tok = (a.tok = {});
    setTimeout(() => {
      if (E.ai !== a || a.tok !== tok) return;
      if (fail(a.prompt)) { a.stage = 'failed'; notice({ kind: 'failed', cat: 'gen', title: t('ed/ai-title'), body: t('ed/ai-failed') }); }
      else { pay(20, 'banner'); a.stage = 'cands'; }
      window.render();
    }, 1500);
  };
  A.pickCand = (i) => { E.ai.cand = +i; };
  A.adoptCand = () => {
    const a = E.ai; if (a.cand == null) return false;
    const slot = 'slide' + E.slide; const prev = getAsset(slot); const f = CAND_F[a.cand];
    commit(() => { setAsset(slot, f); });
    E.ai = null; E.replaced = { slot, prev };
    if (!E.projAssets.some((x) => x.f === f)) E.projAssets.push({ f, name: 'AI · ' + (E.projAssets.length + 1) });
    window.toast(t('ed/am-replaced'), undoOpt());
  };

  // ---------- 检查 / 导出（ED-12 / ED-16） ----------
  A.openChecks = () => { E.dlg = 'checks'; S.menu = null; };
  A.openExport = () => { E.dlg = 'export'; if (E.exp.stage !== 'exporting') E.exp.stage = 'ready'; E.exp.linking = 0; };
  A.locate = (id) => { const all = checks(); const c = [...all.req, ...all.sug].find((x) => x.id === id); E.dlg = null; if (c && c.act && A[c.act]) { return A[c.act](c.arg); } A.selMod(c ? c.mod : id); };
  A.chkConfirm = () => { commit(() => { E.D.chkOk.jackpot = true; }); window.toast(t('ed/chk-solved', { name: t('cat/jackpot') })); };
  A.markAll = () => { E.checksPassed = true; };
  A.expOpt = (k) => { E.exp.opts[k] = !E.exp.opts[k]; };
  let expTimer = null;
  function startExport() {
    const x = E.exp; x.stage = 'exporting'; x.dl = {}; x.failed = {}; x.retrying = {}; clearTimeout(expTimer);
    expTimer = setTimeout(() => {
      if (E.exp.stage !== 'exporting') return;
      x.stage = 'done';
      if (S.demo && S.demo.exportFail) x.failed = { png: true };
      E.status = 'exported'; persist(); LS.set('ed.x.' + E.name, { failed: x.failed }); // 记住导出结果，点通知回来能看到
      const P = window.PROJECTS; if (Array.isArray(P)) { const p = P.find((q) => q.name === E.name); if (p) p.st = 'exported'; }
      const files = expFiles();
      notice(x.failed.png ? { kind: 'exportFail', cat: 'sys', title: t('ed/exp-partial') + ' · ' + E.name, body: t('ed/exp-partial-d') } : { kind: 'export', cat: 'sys', title: { k: 'notice/export-done', v: { name: E.name } }, body: { k: 'notice/export-d', v: { list: files.map((f) => f[1]).join('、'), n: files.length } } });
      if (S.route === 'editor') window.render();
    }, 1800);
  }
  A.doExport = () => {
    if (checks().req.length) { E.dlg = 'checks'; return; }
    if (!Object.values(E.exp.opts).some(Boolean)) return false;
    // 2026-11-26 Waydon：业主直接下载 .fig，不需要连接自己的 Figma（平台用公司 Figma 空间生成后导出副本），授权步骤去掉
    startExport();
  };
  A.figmaConnect = () => {
    const x = E.exp; if (x.linking) return false; x.linking = 1;
    setTimeout(() => { if (E.exp.stage !== 'connect' || E.dlg !== 'export') return; x.linking = 2; window.render(); setTimeout(() => { if (E.exp.stage !== 'connect' || E.dlg !== 'export') return; E.figmaLinked = true; persist(); startExport(); window.render(); }, 600); }, 1000);
  };
  A.expCancel = () => { clearTimeout(expTimer); E.exp.stage = 'ready'; window.toast(t('ed/exp-cancelled'), { info: true }); };
  A.dlFile = (k) => { if (k) E.exp.dl[k] = true; else expFiles().forEach((f) => { if (!E.exp.failed[f[2]]) E.exp.dl[f[2]] = true; }); window.toast(t('ed/exp-dl-started')); };
  A.expRetry = (k) => { const x = E.exp; if (x.retrying[k]) return false; x.retrying[k] = true; setTimeout(() => { delete x.retrying[k]; delete x.failed[k]; LS.set('ed.x.' + E.name, { failed: x.failed }); if (E.dlg === 'export') window.render(); }, 1000); };
  A.expBack = () => { E.exp.stage = 'ready'; E.exp.linking = 0; };
  A.closeDlg = () => {
    if (E.dlg === 'export' && E.exp.stage === 'exporting') A.expCancel();
    if (E.dlg === 'export' && E.exp.stage === 'connect') E.exp.stage = 'ready';
    if (E.dlg === 'resize' && E.rs && E.rs.back === 'lib' && E.lib) { E.rs = null; E.dlg = 'lib'; return; }
    if (E.dlg === 'adfig') { E.dlg = 'export'; return; } // AD-05：结构预览关掉回到导出结果
    E.dlg = null; E.rs = null; E.lib = null; E.palQ = null; if (!(E.tpl && E.tpl.busy)) E.tpl = null; E.nameEdit = null; if (E.bx && E.bx.ing == null) E.bx = null;
  };

  function checksBody() {
    const c = checks();
    const line = (x, lvl) => `<div class="chk"><span style="color:var(--${lvl === 'err' ? 'error' : lvl === 'warn' ? 'warning' : 'success'})">${ic(lvl === 'ok' ? 'check-circle-fill' : 'warning-circle-fill')}</span><div class="tx">${esc(x.text)}<small>${esc(lvl === 'ok' ? t('ed/passed') : x.name)}</small></div>${lvl !== 'ok' ? `<button class="btn btn-secondary btn-sm" data-act="locate" data-arg="${x.id}">${t('ed/locate')}</button>` : ''}${lvl === 'warn' && x.confirm ? `<button class="btn btn-secondary btn-sm" data-act="chkConfirm">${t('ed/chk-confirm')}</button>` : ''}</div>`;
    const body = !c.req.length && !c.sug.length
      ? `<div class="notice is-ok">${ic('check-circle-fill')}${t('ed/exp-ready')}</div><div class="chk-grp ok">${t('ed/passed')}</div>${c.ok.map((x) => line(x, 'ok')).join('')}`
      : `<p class="muted" style="margin:0">${t('ed/checks-sub-n', { r: c.req.length, s: c.sug.length })}</p>
        ${c.req.length ? `<div class="chk-grp err">${t('ed/required')}</div>${c.req.map((x) => line(x, 'err')).join('')}` : ''}
        ${c.sug.length ? `<div class="chk-grp warn">${t('ed/suggested')}</div>${c.sug.map((x) => line(x, 'warn')).join('')}` : ''}
        ${c.ok.length ? `<div class="chk-grp ok">${t('ed/passed')}</div>${c.ok.map((x) => line(x, 'ok')).join('')}` : ''}
        ${c.req.length ? `<button class="btn btn-ghost btn-sm chk-demo" data-act="markAll">${t('ed/chk-demo')}</button>` : ''}`;
    return `<div class="dialog-head"><h3>${t('ed/checks-title')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><div class="chk-body">${body}</div>${!c.req.length ? `<div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('ed/done')}</button><button class="btn btn-primary" data-act="openExport">${ic('download-simple', 'ic-16')}${t('ed/export')}</button></div>` : ''}`;
  }
  function expFiles() {
    const o = E.exp.opts; const base = E.name.replace(/\s*·\s*/g, '-');
    return [o.figma && [base + '.fig', 'Figma', 'figma'], o.png && [base + '-PNG.zip', 'PNG', 'png'], o.svg && [base + '-SVG.zip', 'SVG', 'svg'], window.PC && o.png && [base + '-PC.png', t('ed/exp-pc-png'), 'pc'], ['theme.json', 'JSON', 'json']].filter(Boolean);
  }
  function exportBody() {
    const x = E.exp; const req = checks().req.length;
    const close = `<button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button>`;
    if (x.stage === 'connect') {
      return `<div class="dialog-head"><h3>${t('ed/exp-connect-title')}</h3>${close}</div><div class="fg-conn"><span class="fg-logo">${ic('file-image', 'ic-24')}</span><p class="muted">${t('ed/exp-connect-d')}</p>${x.linking === 2 ? `<div class="fg-ok">${ic('check-circle-fill')}${t('ed/exp-connected')}</div>` : ''}</div>
        <div class="dialog-foot"><button class="btn btn-secondary" data-act="expBack">${t('confirm/cancel')}</button><button class="btn btn-primary ${x.linking ? 'is-busy' : ''}" data-act="figmaConnect">${x.linking === 1 ? ic('circle-notch', 'ic-16 spin') : ic('link-simple', 'ic-16')}${t('ed/exp-connect')}</button></div>`;
    }
    if (x.stage === 'exporting') return `<div class="dialog-head"><h3>${t('ed/exp-ing')}</h3></div><p class="muted">${t('ed/exp-ing-d')}</p><div class="progress"><i class="exp-bar"></i></div><div class="dialog-foot"><button class="btn btn-secondary" data-act="expCancel">${t('ed/exp-cancel')}</button></div>`;
    if (x.stage === 'done') {
      const files = expFiles(); const anyFail = files.some((f) => x.failed[f[2]]);
      const rowBtn = (k) => (x.failed[k] ? (x.retrying[k] ? `<button class="btn btn-secondary btn-sm is-busy">${ic('circle-notch', 'ic-16 spin')}${t('ed/exp-retry')}</button>` : `<button class="btn btn-secondary btn-sm" data-act="expRetry" data-arg="${k}">${t('ed/exp-retry')}</button>`)
        : x.dl[k] ? `<span class="dl-ok">${ic('check-circle-fill', 'ic-16')}${t('ed/exp-downloaded')}</span>` : `<button class="btn btn-secondary btn-sm" data-act="dlFile" data-arg="${k}">${t('ed/exp-dl')}</button>`);
      return `<div class="dialog-head"><h3>${anyFail ? `<span class="t-warn">${ic('warning-circle-fill')}</span> ${t('ed/exp-partial')}` : `${ic('check-circle-fill')} ${t('ed/exp-done')}`}</h3>${close}</div><p class="muted">${anyFail ? t('ed/exp-partial-d') : t('ed/exp-done-d')}</p>
        <div class="files">${files.map(([n, , k]) => `<div class="f ${x.failed[k] ? 'is-fail' : ''}">${x.failed[k] ? `<span class="t-err">${ic('x-circle-fill')}</span>` : ic(k === 'figma' ? 'file-image' : 'download-simple')}<span class="n ellipsis">${esc(n)}</span>${k === 'figma' && !x.failed[k] && window.AD ? window.AD.figViewBtn() : ''}${rowBtn(k)}</div>`).join('')}</div>
        <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('ed/done')}</button><button class="btn btn-primary" data-act="dlFile">${ic('download-simple', 'ic-16')}${t('ed/exp-dl-all')}</button></div>`;
    }
    const opt = (k, n, d, extra = '') => `<button class="exp-opt ${x.opts[k] ? 'is-on' : ''}" data-act="expOpt" data-arg="${k}"><span class="check ${x.opts[k] ? 'is-on' : ''}">${x.opts[k] ? ic('check', 'ic-16') : ''}</span><span><b class="body-sm">${t(n)}</b><small>${t(d)}</small>${extra}</span></button>`;
    const figExtra = false ? `<small class="fg-cap">${ic('link-simple', 'ic-16')}${t('ed/exp-figma-auth')}</small>` : '';
    return `<div class="dialog-head"><h3>${t('ed/export-title')}</h3>${close}</div>
      ${!req ? `<div class="notice is-ok" style="margin-bottom:12px">${ic('check-circle-fill')}${t('ed/exp-ready')}</div>` : `<div class="notice is-warn" style="margin-bottom:12px;align-items:center">${ic('warning-circle-fill')}<span style="flex:1">${t('ed/exp-blocked', { n: req })}</span><button class="btn btn-secondary btn-sm" data-act="openChecks">${t('ed/go-check')}</button></div>`}
      ${opt('figma', 'ed/exp-figma', 'ed/exp-figma-d', figExtra)}${x.opts.figma && window.AD ? window.AD.figIncl() : ''}${opt('png', 'ed/exp-png', 'ed/exp-png-d')}${opt('svg', 'ed/exp-svg', 'ed/exp-svg-d')}
      <div class="dialog-foot"><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary ${!req && Object.values(x.opts).some(Boolean) ? '' : 'is-disabled'}" data-act="doExport">${ic('download-simple', 'ic-16')}${t('ed/export-btn')}</button></div>`;
  }
  function fpBody() {
    const sp = slotSpec(E.fpSlot || 'slide0');
    const files = [['banner-spring.png', sp.w, sp.h, '820 KB', 'hue-rotate(170deg) saturate(1.3)'], ['banner-match.png', sp.w, sp.h, '1.1 MB', 'hue-rotate(-90deg)'], ['banner-old.jpg', 800, 600, '640 KB', 'grayscale(.6)']];
    return `<div class="dialog-head"><h3>${t('ed/fp-title')}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><p class="caption muted" style="margin:0 0 12px">${t('ed/fp-note')}</p>
      <div class="fp-grid">${files.map(([n, w, h, kb, f]) => { const ok = w === sp.w && h === sp.h; return `<button class="fp" data-act="fpPick" data-arg="${f}|${w}|${h}"><span class="im" style="filter:${f};aspect-ratio:${sp.w} / ${sp.h}"></span><span class="n ellipsis">${n}</span><span class="s ${ok ? '' : 'bad'}">${w}×${h} · ${kb}${ok ? '' : ' · ' + t('ed/lib-bad')}</span></button>`; }).join('')}</div>`;
  }
  function dialogs() {
    if (!E.dlg) return '';
    const m = mobileEd();
    const map = Object.assign({ checks: checksBody, export: exportBody, fp: fpBody, lib: libBody, resize: resizeBody, pal: palBody, tplpick: tplBody, rename: renameBody, batch: (mm) => window.MP.batchBody(mm) }, window.AD ? window.AD.dlgs : {});
    const need = { lib: 'lib', resize: 'rs', pal: 'palQ', tplpick: 'tpl', batch: 'bx' }[E.dlg];
    if (need && !E[need]) { E.dlg = null; return ''; }
    const body = (map[E.dlg] || fpBody)(m);
    const full = ['lib', 'resize', 'batch', 'tplpick', 'adfig'].includes(E.dlg);
    const cls = { lib: 'dialog-lib', tplpick: 'dialog-tpl', pal: 'dialog-sm', rename: 'dialog-sm', batch: 'dialog-bx', resize: 'dialog-rs', adfig: 'dialog-adfig' }[E.dlg] || '';
    if (m) return `<div class="scrim" data-act="closeDlg"></div><div class="sheet med-sheet ed-dlg-sheet ${full ? 'is-full' : ''} ${cls}" data-sk="dlgsheet">${full ? '' : '<div class="sheet-grab"></div>'}${body}</div>${E.dlg === 'batch' ? window.MP.batchPickSheet() : ''}`;
    return `<div class="scrim" data-act="closeDlg"></div><div class="dialog dialog-wide ${cls}" data-sk="dlg">${body}</div>`;
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
    return `<div class="ed-floats"><div>${picker}${pal}<div class="zb"><button class="ibtn ibtn-sm" data-act="zoom" data-arg="-1" ${E.zoom <= 25 ? 'disabled' : ''}>${ic('minus', 'ic-16')}</button><span>${E.zoom}%</span><button class="ibtn ibtn-sm" data-act="zoom" data-arg="1" ${E.zoom >= 100 ? 'disabled' : ''}>${ic('plus', 'ic-16')}</button></div></div></div>`;
  }
  function checkBtn(cls = '') {
    const n = checks().req.length;
    return `<button class="btn btn-sm btn-check ${n ? '' : 'is-ok'} ${cls}" data-act="openChecks">${ic(n ? 'warning-circle-fill' : 'check-circle-fill', 'ic-16')}<span class="ellipsis">${n ? t('ed/check-n', { n }) : t('ed/check-passed')}</span></button>`;
  }
  const busyMask = () => (E.tpl && E.tpl.busy ? '<div class="canvas-busy skeleton"></div>' : '');
  function nameHtml() {
    if (E.nameEdit && E.dlg !== 'rename') return `<input class="input ed-name-in" data-input="nameIn" data-key="nameKey" value="${esc(E.nameEdit.v)}" maxlength="40" style="width:calc(${Math.max(8, [...E.nameEdit.v].length * 1.6)}ch + 24px)" data-autofocus aria-label="${esc(t('ed/project-name'))}">`;
    return `<button class="ed-name" data-act="nameEdit" title="${esc(t('ed/project-name'))}">${esc(E.name)}</button>`;
  }
  function desktop() {
    const scale = E.zoom / 50;
    // PC 画布由 E 组 js/pc.js 提供；未加载时保持待设计空状态
    const canvas = window.PC && E.device === 'pc' ? window.PC.canvas() : E.device === 'pc'
      ? `<div class="pc-empty">${window.empty('wrench-fill', t('ed/pc-todo-title'), t('ed/pc-todo-desc'), `<button class="btn btn-secondary btn-sm" data-act="setDevice" data-arg="h5">${t('ed/back-h5')}</button>`)}</div>`
      : `<div class="ed-stage" style="padding-bottom:${120 + 815 * (scale - 1)}px"><div class="ed-zoom" style="transform:scale(${scale})">${h5({ measure: true })}<div class="over-wrap"><div style="transform:scale(${1 / scale});transform-origin:top center">${overNotice()}</div></div></div></div>`;
    return `<div class="ed">
      <header class="ed-top"><button class="ibtn ibtn-sm" data-act="edBack" title="${esc(t('nav/home'))}">${ic('caret-left')}</button>${nameHtml()}
        ${E.status === 'exported' ? `<span class="pill-tag is-ok">${t('status/exported')}</span>` : ''}<span class="lv-pill"><img src="assets/badge-tier1.png" alt="">${t('level/standard-title')}</span>${window.demoTag()}${saveHtml()}
        <div class="iseg" style="margin-left:12px">${[['h5', 'device-mobile', 'ed/device-h5'], ['pc', 'desktop', 'ed/device-pc']].map(([v, i, k]) => `<button class="${E.device === v ? 'is-on' : ''}" data-act="setDevice" data-arg="${v}" title="${esc(t(k))}">${ic(i)}</button>`).join('')}</div>
        <div class="iseg">${[['out', 'ed/signed-out'], ['in', 'ed/signed-in']].map(([v, k]) => `<button class="${(E.D.login ? 'in' : 'out') === v ? 'is-on' : ''}" data-act="setLogin" data-arg="${v}">${t(k)}</button>`).join('')}</div>
        <span class="spacer"></span>
        <button class="ibtn ibtn-sm" data-act="undo" ${E.past.length ? '' : 'disabled'} title="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="redo" ${E.future.length ? '' : 'disabled'} title="${esc(t('ed/redo'))}">${ic('arrow-u-up-right')}</button>
        ${checkBtn()}<button class="btn btn-primary btn-sm" data-act="openExport">${ic('download-simple', 'ic-16')}${t('ed/export')}</button></header>
      <div class="ed-body"><nav class="ed-left" data-sk="ed-left">${tree()}</nav>
        <main class="ed-canvas" data-sk="ed-canvas" data-act="canvasBg">${window.AD ? window.AD.edBar() : ''}${canvas}${E.device === 'pc' && window.PC ? '' : floats()}${busyMask()}</main>
        <aside class="ed-right" data-sk="ed-right">${rightPanel()}</aside></div></div>${dialogs()}${window.costConfirmLayer ? window.costConfirmLayer() : ''}`;
  }
  A.canvasBg = (a, el, e) => { if (e.target === el || e.target.classList.contains('ed-stage') || e.target.classList.contains('med-stage')) { if (E.sel || E.picker) { E.sel = null; E.ai = null; E.picker = null; E.iconAi = null; E.h5side = false; if (mobileEd()) E.mpanel = null; return; } } return false; };

  // ---------- 手机视图 ----------
  function mobile() {
    const scale = 343 / 375;
    const panel = mobilePanel();
    const pc = E.device === 'pc';
    const canvas = pc ? (window.PC ? window.PC.canvas({ mobile: true }) : `<div class="pc-empty">${window.empty('wrench-fill', t('ed/pc-todo-title'), t('ed/pc-todo-desc'), `<button class="btn btn-secondary btn-sm" data-act="mDevice" data-arg="h5">${t('ed/back-h5')}</button>`)}</div>`)
      : `<div class="med-stage"><div style="width:343px;height:auto"><div style="transform:scale(${scale});transform-origin:top left;width:375px">${h5({ measure: true })}</div></div>${overNotice()}</div>`;
    const n = checks().req.length;
    return `<div class="med">
      <header class="med-nav"><button class="ibtn" data-act="edBack" aria-label="${esc(t('nav/home'))}">${ic('caret-left')}</button><button class="tt" data-act="nameEdit"><b>${esc(E.name)}</b><small>${window.demoTag()}${E.status === 'exported' ? `<span class="pill-tag is-ok">${t('status/exported')}</span> ` : ''}${pc ? `<span class="pc-tag">${t('ed/pc-preview')}</span> · ` : ''}${saveHtml(true)}</small></button>
        <button class="ibtn ibtn-sm" data-act="undo" ${E.past.length ? '' : 'disabled'} aria-label="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="redo" ${E.future.length ? '' : 'disabled'} aria-label="${esc(t('ed/redo'))}">${ic('arrow-u-up-right')}</button>
        <button class="ibtn ibtn-sm warn ${n ? '' : 'is-ok'}" data-act="mPanel" data-arg="checks" aria-label="${esc(t('ed/checks-title'))}">${ic(n ? 'warning-circle-fill' : 'check-circle-fill')}${n ? `<i class="badge">${n}</i>` : ''}</button>
        <button class="btn btn-primary btn-sm" data-act="mPanel" data-arg="export">${ic('download-simple', 'ic-16')}<span class="ex-l">${t('ed/export')}</span></button></header>
      <main class="med-canvas ${pc ? 'is-pc' : ''}" data-sk="med-canvas" data-act="canvasBg">${window.AD ? window.AD.edBar() : ''}${canvas}
        ${E.mpanel || pc ? '' : `<div class="med-login"><div class="iseg">${[['out', 'ed/signed-out'], ['in', 'ed/signed-in']].map(([v, k]) => `<button class="${(E.D.login ? 'in' : 'out') === v ? 'is-on' : ''}" data-act="setLogin" data-arg="${v}">${t(k)}</button>`).join('')}</div></div>`}
        ${E.mpanel || pc ? '' : `<button class="fab" data-act="mPanel" data-arg="colors" aria-label="${esc(t('ed/m-colors'))}">${ic('paint-brush-fill')}<i style="background:${E.D.theme.primary}"></i></button>`}${busyMask()}</main>
      <nav class="med-tools">${[['pages', 'squares-four-fill', 'ed/pages'], ['modules', 'layout-fill', 'ed/m-modules'], ['colors', 'palette-fill', 'ed/m-colors'], ['preview', 'eye-fill', 'ed/m-preview']].map(([id, i, k]) => `<button class="${E.mpanel === id ? 'is-on' : ''}" data-act="mPanel" data-arg="${id}">${ic(i)}${t(k)}</button>`).join('')}</nav>
    </div>${panel}${amSheet()}${E.preview ? `<div class="preview-full"><button class="ibtn ibtn-secondary x" data-act="closePreview" aria-label="${esc(t('ed/close'))}">${ic('x')}</button>${h5({ noFold: true })}</div>` : ''}${dialogs()}${window.costConfirmLayer ? window.costConfirmLayer() : ''}`;
  }
  A.mPanel = (id) => {
    if (id === 'preview') { E.preview = true; E.sel = null; E.mpanel = null; return; }
    if (id === 'checks' || id === 'export') { if (id === 'export') A.openExport(); else E.dlg = 'checks'; return; }
    E.keys = null; E.mpanel = E.mpanel === id ? null : id; E.picker = null;
  };
  A.closePreview = () => { E.preview = false; };
  A.mIconClose = () => { E.mpanel = 'module'; E.iconMenu = null; };
  A.mClose = () => { E.mpanel = null; E.picker = null; E.ai = null; E.keys = null; if (E.iconAi) A.iaClose(); if (E.sel) E.sel = null; E.h5side = false; S.menu = null; E.rn = null; };
  function mModuleHead(id) {
    const b = baseName(id); const sub = (b === 'banner' && E.ai) || (E.iconAi && E.iconAi.b === b);
    if (sub) return '';
    const fixed = MODS[b].fixed; const idx = E.D.order.indexOf(id); const hid = !!E.D.hidden[id];
    const mv = fixed || b === 'sidebar' ? '' : `<button class="ibtn ibtn-sm" data-act="move" data-arg="-1" ${idx <= 0 ? 'disabled' : ''} aria-label="↑">${ic('arrow-up')}</button><button class="ibtn ibtn-sm" data-act="move" data-arg="1" ${idx >= E.D.order.length - 1 ? 'disabled' : ''} aria-label="↓">${ic('arrow-down')}</button>`;
    return `${window.AD ? window.AD.toolBtn(id, true) : ''}${mv}<button class="ibtn ibtn-sm" data-act="toggleHide" data-arg="${id}" aria-label="${esc(t('ed/am-toggle'))}">${ic(hid ? 'eye-fill' : 'eye-slash-fill')}</button><span class="rel"><button class="ibtn ibtn-sm" data-act="menu:toggle" data-arg="mmodmenu">${ic('dots-three')}</button>${S.menu === 'mmodmenu' ? moduleMenu(id).replace('class="menu"', 'class="menu" style="top:calc(100% + 4px);right:0;left:auto"') : ''}</span>`;
  }
  function mobilePanel() {
    if (!E.mpanel) return '';
    let head = '', body = '', cls = '';
    if (E.mpanel === 'pages') {
      head = t('ed/pages');
      body = `<div class="p-sec" style="margin-top:0">${segBtns([{ v: 'h5', label: t('ed/device-h5') }, { v: 'pc', label: t('ed/device-pc') }], E.device, 'mDevice')}</div><div class="p-sec">${tplRow()}</div>
        <div class="row ${E.sel === null ? 'is-on' : ''}" style="margin-top:12px"><span class="dot ${checks().req.length ? 'check' : 'done'}"></span>${ic('house-fill', 'ic-16')}<span class="nm">${t('cat/home')}</span></div>
        <div class="p-sec"><div class="lab">${t('ed/page-height')}</div><div class="h-row"><input class="input" style="width:110px" type="number" min="1334" max="6000" value="${E.D.height}" data-input="pageHeight" data-key="heightKey"><span class="caption faint">${E.contentH ? t('ed/height-note-n', { n: E.contentH }) : t('ed/height-note')}</span></div></div>`;
    } else if (E.mpanel === 'modules') { head = t('ed/m-modules'); body = tree().replace(/^[\s\S]*?<div class="grp-label">/, '<div class="grp-label">').replace(/<div class="grp-label">[^<]*<\/div>\s*<div class="row[\s\S]*?<div class="divider"><\/div>/, ''); }
    else if (E.mpanel === 'colors') { head = t('ed/m-colors'); body = (window.AD ? window.AD.entryCard() : '') + pageSettings('colors-only'); }
    else if (E.mpanel === 'ad' && window.AD) { return window.AD.mSheet(); }
    else if (E.mpanel === 'keys' && E.keys) { head = t('ed/keys-title', { n: 68 }); body = window.MP.keysPanel(true); cls = 'is-tall'; }
    else if (E.mpanel === 'iconmenu') { return `<div class="scrim" data-act="mIconClose"></div><div class="sheet med-sheet icon-sheet" data-sk="msheet"><div class="sheet-grab"></div>${window.MP.iconSheet()}</div>`; }
    else if (E.mpanel === 'addmod') { return `<div class="scrim" data-act="mClose"></div><div class="sheet med-sheet add-sheet" data-sk="msheet"><div class="sheet-grab"></div>${addList()}</div>`; }
    else if (E.mpanel === 'picker' && E.picker) { return `<div class="scrim" data-act="pkCancel"></div><div class="sheet med-sheet"><div class="sheet-grab"></div>${pickerHtml('in-panel').replace('class="picker in-panel"', 'class="picker in-panel" style="border:0;padding:0;margin:0;background:none"')}</div>`; }
    else if (E.mpanel === 'module' && E.sel) {
      const inner = modulePanel(E.sel);
      body = inner.replace('<h2 class="p-title">', `<div class="sheet-head"><h2 class="p-title" style="margin:0;min-width:0">`).replace('</h2>', `</h2><span class="sb-spacer"></span>${mModuleHead(E.sel)}<button class="ibtn ibtn-sm" data-act="mClose" aria-label="${esc(t('ed/close'))}">${ic('x')}</button></div>`);
      return `<div class="sheet med-sheet m-mod ${E.iconAi ? 'is-tall' : ''}" style="box-shadow:var(--shadow-lg)" data-sk="msheet"><div class="sheet-grab"></div>${body}</div>`;
    } else { E.mpanel = null; return ''; }
    return `<div class="scrim" data-act="mClose"></div><div class="sheet med-sheet ${cls}" data-sk="msheet"><div class="sheet-grab"></div><div class="sheet-head"><h3>${head}</h3><button class="ibtn ibtn-sm" data-act="mClose" aria-label="${esc(t('ed/close'))}">${ic('x')}</button></div>${body}</div>`;
  }

  // ---------- 加载页 ----------
  function loading() {
    const steps = ['ed/load-step-1', 'ed/load-step-2', 'ed/load-step-3'];
    const st = (i) => (E.loadFail && i === E.step ? 'is-fail' : i < E.step ? 'is-done' : i === E.step ? 'is-on' : '');
    const icn = (i) => (E.loadFail && i === E.step ? 'x-circle-fill' : i < E.step ? 'check-circle-fill' : i === E.step ? 'clock-counter-clockwise' : 'clock');
    return `<div class="ed-loading"><div class="ld-card"><img src="assets/logo-orb.webp" alt=""><h3>${t('ed/loading-title')}</h3>${steps.map((k, i) => `<div class="ld-step ${st(i)}">${ic(icn(i))}${t(k)}</div>`).join('')}
      ${E.loadFail ? `<div class="ld-fail">${t('ed/load-failed')}</div><div class="ld-acts"><button class="btn btn-primary" data-act="edLoadRetry">${t('ed/load-retry')}</button><button class="btn btn-secondary" data-act="edLoadHome">${t('page/back-home')}</button></div>` : `<div class="caption faint" style="margin-top:12px">${t('ed/loading-tip')}</div>`}</div></div>`;
  }

  // Esc：一层一层关（菜单 / 共用弹层由 core 先关，这一下不再关编辑器的层）
  let escSkip = false;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') escSkip = !!(S.menu || S.sheet || S.dialog); }, true);
  function escape() {
    if (escSkip) { escSkip = false; return; }
    if (E.rn) { E.rn = null; return; }
    if (E.nameEdit && E.dlg !== 'rename') { E.nameEdit = null; return; }
    if (E.bx && E.bx.pick != null) { E.bx.pick = null; return; }
    if (E.picker) { A.pkCancel(); return; }
    if (E.dlg) { A.closeDlg(); return; }
    if (E.preview) { E.preview = false; return; }
    if (E.mpanel) { if (E.mpanel === 'iconmenu') A.mIconClose(); else if (E.mpanel === 'keys') A.keysBack(); else A.mClose(); return; }
    if (E.adMod) { A.adModCancel(); return; }
    if (E.adp) { A.adEClose(); return; }
    if (E.keys) { E.keys = null; return; }
    if (E.iconAi) { A.iaClose(); return; }
    if (E.ai) { E.ai = null; return; }
    if (E.h5side) { E.h5side = false; if (E.sel === 'sidebar') E.sel = null; return; }
    if (E.palOpen) { E.palOpen = false; }
  }

  window.EDX = { E, commit, save, liveTheme, themeStyle, modWrap, selToolbar, modHtml, pickerHtml, segBtns: (...a) => segBtns(...a), pxSeg: (...a) => pxSeg(...a), moreBtn: (...a) => moreBtn(...a), uploadUI: (...a) => uploadUI(...a), mobileEd, baseName, modName, checks, afford, pay, fail, topup, notice, undoOpt, inkOn,
    // AD：AI 首页设计用（按给定设计数据渲染迷你预览 h5For、默认设计、配色工具）
    h5For, defaultDesign, preset, baseOf, customCount, PRESETS, KEYS, SUGGEST, BANNER, MODS, hex2hsv, hsv2hex, fixSlide, persist };
  window.VIEWS.editor = function () { if (E.loading) return loading(); return mobileEd() ? mobile() : desktop(); };
  window.ED = { isOpen: () => S.route === 'editor' && !!(E.dlg || E.picker || E.mpanel || E.preview || E.ai || E.keys || E.iconAi || E.rn || E.nameEdit || E.h5side || E.palOpen || E.adp || E.adMod), escape };
})();
