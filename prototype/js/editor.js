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
  // Banner 规格（照真实组件「H5 / Banner 画布（750）」317:55632）：dw/dh = 750 稿显示尺寸，cw/ch = 画布 CSS 尺寸；w/h = 交付图尺寸
  // Waydon 2026-11-26：规格只是前端显示尺寸不同，后台上传统一 1020×300
  const BANNER = { large: { w: 1500, h: 680, dw: 750, dh: 340, cw: 375, ch: 170, ib: 7.5 }, general: { w: 1020, h: 300, dw: 708, dh: 208, cw: 354, ch: 104, ib: 5 }, medium: { w: 1020, h: 300, dw: 750, dh: 221, cw: 375, ch: 110.3, ib: 5, sq: true }, small: { w: 320, h: 202, dw: 160, dh: 101, cw: 80, ch: 50.5, ib: 2.5 } };
  // Waydon 2026-11-26 15:17：大 Banner 首页显示 750×340、通用 708×208。大 Banner 的图按 750 宽等比出一套（1500×680 @2x，不再用 1020×300 裁切）；
  // 15:21：中 Banner 按 Figma 317:55637 = 750×220.6 通栏直角（1020×300 等比缩到 750 宽）
  // 小 Banner 一排默认展示 3 张（160×101 的小卡，图另出一套 320×202 @2x）
  const LARGE_DEF = ['assets/ai-banner/large-1.webp', 'assets/ai-banner/large-2.webp', 'assets/ai-banner/large-3.webp'];
  const SMALL_DEF = ['assets/ai-banner/small-1.webp', 'assets/ai-banner/small-2.webp', 'assets/ai-banner/small-3.webp'];
  const SIZES = ['large', 'general', 'medium', 'small'];
  // 指示器 4 种样式（真实组件「H5 / Banner 指示器」317:55641），旧数据 dots/bars 映射过来
  const IND = ['s1', 's2', 's3', 's4', 'none'];
  const indOf = (v) => (v === 'dots' ? 's1' : v === 'bars' ? 's4' : IND.includes(v) ? v : 's1');
  // 顶部栏高度按规范 70–100（Figma 经典蓝白 90）
  const TB = { h: [80, 90, 100], pad: [24, 32, 48], gap: [16, 24, 32] };
  // 顶部栏可选色都用 68 Key 引用（存 'key:<名>'），换整页配色时跟着变；默认（null）= 绑定的 Key
  const TB_SW = { bg: ['bg_2', 'bg_1', 'primary', 'lead'], side: ['lead', 'neutral_1', 'primary', 'bg_2'] };
  const TB_KEY = { bg: 'bs_topnav_bg', side: 'lead' };
  const SLIDE_F = ['none', 'hue-rotate(28deg) saturate(1.2)', 'hue-rotate(-38deg)'];
  // Banner AI 候选 = Figma generate image 生成的 4 种默认风格（2026-11-26，assets/ai-banner/）
  const CAND_W = ['glossy', 'blackgold', 'festive', 'neon'].map((k) => 'img:assets/ai-banner/' + k + '.webp');
  // AI 候选也按当前样式出对应比例的图（大 1500×680、小 320×202，其它 1020×300）
  // 每张候选图的风格标签（按图片内容标：大 = 真人蓝 / 黑金 / 体育霓虹，小 = 蓝光泽 / 黑金 / 红包喜庆）
  const CAND_TAG = { large: [['glossy'], ['blackgold'], ['sport', 'neon']], small: [['glossy'], ['blackgold'], ['festive']], def: [['glossy'], ['blackgold'], ['festive'], ['neon']] };
  const candBase = () => (E.D.banner.size === 'large' ? [1, 2, 3].map((n) => 'img:assets/ai-banner/large-' + n + '.webp') : E.D.banner.size === 'small' ? [1, 2, 3].map((n) => 'img:assets/ai-banner/small-' + n + '.webp') : CAND_W);
  const candTags = () => CAND_TAG[E.D.banner.size] || CAND_TAG.def;
  // 生成时按关键词 / 提示词 / 参考图给候选排序（最贴合的排第一），候选显示期间顺序固定
  const candList = () => { const b = candBase(); const o = E.ai && E.ai.order; return o && o.length === b.length ? o.map((k) => b[k]) : b; };
  const KW_ST = { 1: 'neon', 2: 'blackgold', 3: 'festive', 4: 'sport', 5: 'glossy', 6: 'neon', 7: 'glossy', 8: 'festive' };
  const PROMPT_ST = [['festive', /春节|新年|喜庆|喜慶|节日|節日|红包|紅包|中秋|圣诞|聖誕|红色|紅色|festive|holiday|new year|red\b|lễ hội|tết/i], ['blackgold', /黑金|金色|奢华|奢華|尊享|vip|gold|luxur|sang trọng|vàng/i], ['neon', /霓虹|赛博|賽博|科技|neon|cyber|tech|công nghệ/i], ['sport', /体育|體育|足球|球员|球員|赛事|賽事|sport|football|thể thao/i], ['glossy', /3d|立体|立體|光泽|光澤|卡通|glossy|cartoon|nổi khối/i]];
  function candScore(a) {
    const w = {}; const add = (st, n) => { w[st] = (w[st] || 0) + n; };
    a.kw.forEach((k) => add(KW_ST[k], 3));
    PROMPT_ST.forEach(([st, re]) => { if (re.test(a.prompt || '')) add(st, 2); });
    if (a.refStyle) add(a.refStyle === 'flat' ? 'glossy' : a.refStyle, 4);
    const sc = candTags().map((tg) => tg.reduce((n, st) => n + (w[st] || 0), 0));
    return { order: sc.map((v, i) => i).sort((x, y) => sc[y] - sc[x] || x - y), best: Math.max(...sc) > 0 };
  }
  const BNAV_PX = { 98: 49, 110: 55, 120: 60, 140: 70 };
  const DV = 8; // 设计数据版本（LS 里旧数据不兼容时丢弃）
  const baseName = (id) => id.split('~')[0];
  const modName = (id) => { const b = baseName(id); const n = id.includes('~') ? ' ' + (+id.split('~')[1] + 1) : ''; return t((MODS[b] || MODS.banner).key) + n; };

  // ---------- 模板（ED-23）：版式 + 配色 + 默认素材整套 ----------
  const ORDER9 = ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer'];
  // 经典蓝白 = 真实 UI 结构（Waydon 2026-11-26 选「改成真实结构」）：没有彩金池 / 页脚 / 侧边栏
  const ORDER_CL = ['banner', 'notice', 'midnav', 'gamemenu', 'gamecards'];
  const TPL = {
    'classic-blue': { preset: 'blue', order: ORDER_CL, size: 'general', slides: ['none', 'none', 'none'], ind: 's1' }, // 真实 Banner 原图，不再调色
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
      theme: preset(p), palette: p, basePreset: p, template: key, height: 1334,
      banner: { size: tp.size, ind: tp.ind || 'bars', margin: 16, corner: 16, slides: mkSlides(tp.size, tp.slides, key === 'classic-blue') },
      m: window.MP ? window.MP.defaults() : {}, ec: {}, chkOk: {},
      tb: { h: 90, pad: 24, gap: 16, items: { logo: true, side: false, cur: true, search: true, auth: true }, searchFirst: false, colors: { bg: null, side: null }, logoF: 'none' }, // 已登录默认显示余额框（Waydon 2026-11-26）
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
  const migrate = (D) => { try { Object.values(D.m || {}).forEach((m) => (m.items || []).forEach((it) => { if (it.i === 'credit-card') it.i = 'wallet-fill'; })); } catch (e) { /* noop */ } if (D.height === 1600) D.height = 1334; try { if (window.MP && window.MP.migrate) window.MP.migrate(D); } catch (e) { /* noop */ } return D; };
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
  // 整页恢复默认样式（Waydon 2026-11-26）：回到当前模板的默认设计，保留登录态预览；可撤销
  const pageDef = () => { const d = defaultDesign(E.D.template); d.login = E.D.login; return d; };
  const pageDirty = () => JSON.stringify(Object.assign({}, E.D, { login: false })) !== JSON.stringify(Object.assign({}, pageDef(), { login: false }));
  A.pageReset = () => { S.menu = null; if (!pageDirty()) return false; commit(() => { E.D = pageDef(); }); E.sel = null; E.picker = null; E.ai = null; fixSlide(); window.toast(t('ed/page-reset-done'), undoOpt()); };
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
    Object.keys(tb).forEach((k) => { tb[k] = tbRef(tb[k], th, ec); }); // 'key:xxx' → 当前配色的值（PC 画布也用这里）
    return { th, tb, ec };
  }
  // 顶部栏底板默认绑定 68 Key 的 bs_topnav_bg（Waydon 2026-11-26）
  const keyVal = (k, th, ec) => (th[k] != null ? th[k] : window.MP && window.MP.resolveKey ? window.MP.resolveKey(k, th, ec || E.D.ec || {}) : null);
  const tbBgDef = (th) => keyVal('bs_topnav_bg', th) || th.bg_2;
  function tbRef(v, th, ec) { return typeof v === 'string' && v.startsWith('key:') ? keyVal(v.slice(4), th, ec) || null : v; }
  // 顶部栏图片值：'img:<url>' 真实上传 / AI 图路径或 dataURL / 其它 = CSS 滤镜（原型模拟，叠在默认图上）
  function tbImg(v, def) {
    if (!v || v === 'none') return { src: def, f: 'none', own: false };
    if (/^img:/.test(v)) return { src: v.slice(4), f: 'none', own: true };
    if (/^(data:|assets\/|https?:|blob:)/.test(v)) return { src: v, f: 'none', own: true };
    return { src: def, f: v, own: true };
  }
  // 顶部栏图片按「调整尺寸」的选择显示（E.D.tb.fit[k]）：裁切 = 按框的位置铺满目标比例；留边 = 整图放进去、空白用所选底色
  function tbFitCss(k) {
    const m = (E.D.tb.fit || {})[k]; const sp = { logo: [230, 76], cur: [36, 36], search: [56, 49], side: [48, 48] }[k]; if (!m || !sp) return '';
    const ar = `aspect-ratio:${sp[0]}/${sp[1]};`;
    return m.fit === 'pad' ? ar + `object-fit:contain;background:${E.D.theme[m.fill] || E.D.theme.bg_1}` : ar + `object-fit:cover;object-position:${Math.round((m.x ?? 0.5) * 100)}% ${Math.round((m.y ?? 0.5) * 100)}%`;
  }
  // 记下 / 清掉调整尺寸的选择（AI 图、恢复默认、尺寸刚好的上传都不带）
  function tbFitSet(k, v) {
    const o = Object.assign({}, E.D.tb.fit);
    if (v && typeof v === 'object' && v.fit) o[k] = v.fit === 'pad' ? { fit: 'pad', fill: v.fill } : { fit: 'crop', x: v.x, y: v.y }; else delete o[k];
    if (Object.keys(o).length) E.D.tb.fit = o; else delete E.D.tb.fit;
  }
  const tbImgTag = (v, def, alt = '', cls = '', k = '') => { const x = tbImg(v, def); const st = [x.f !== 'none' ? `filter:${x.f}` : '', k && x.own ? tbFitCss(k) : ''].filter(Boolean).join(';'); return `<img${cls ? ` class="${cls}"` : ''} src="${x.src}" alt="${alt}"${st ? ` style="${st}"` : ''}>`; };
  window.tbImg = tbImg; window.tbFitCss = tbFitCss;
  function themeStyle() {
    const { th, tb, ec } = liveTheme();
    let s = KEYS.map((k) => `--o-${k}:${th[k]}`).join(';') + (window.MP ? window.MP.vars(th, ec) : '');
    s += `;--tb-bg:${tb.bg || tbBgDef(th)}`; if (tb.text) s += `;--tb-text:${tb.text}`; if (tb.side) s += `;--tb-side:${tb.side}`; // H5 只用这三个；搜索/注册等变量只有 PC 顶部栏用（pc.js）
    return s;
  }

  // ---------- 交付检查（ED-12）：只依赖 E.D，所有计数从这里取 ----------
  const inPage = (b) => E.D.order.some((x) => baseName(x) === b && !E.D.hidden[x]);
  function checks() {
    const D = E.D, req = [], sug = [], ok = [];
    if (!D.m || !D.m.midnav) return { req, sug, ok };
    const nm = window.MP.nm;
    if (inPage('midnav')) {
      const m = D.m.midnav; const miss = m.items.filter((it) => (m.mode === 'conf' || it.req) && !(it.img || it.def));
      (miss.length ? req : ok).push({ id: 'midnav', mod: 'midnav', name: t('mod/midnav'), text: miss.length ? t('ed/chk-midnav', { n: miss.length, names: miss.map(nm).join('、') }) : t('mod/midnav') });
    }
    if (inPage('banner')) {
      const sz = BANNER[D.banner.size]; let bad = 0;
      D.banner.slides.forEach((s, i) => { const d = slideDim(s, sz); if (!s.hid && (d.w !== sz.w || d.h !== sz.h)) { bad++; req.push({ id: 'banner' + i, mod: 'banner', act: 'openResize', arg: 'slide' + i, name: 'Banner', text: t('ed/chk-banner', { i: i + 1, w: sz.w, h: sz.h }) }); } });
      if (!bad) ok.push({ id: 'banner', mod: 'banner', name: 'Banner', text: 'Banner' });
    }
    if (!D.hidden.bottomnav) {
      const miss = D.m.bottomnav.items.filter((it) => it.req && !it.imgOn && !it.onBuiltin);
      (miss.length ? req : ok).push({ id: 'bottomnav', mod: 'bottomnav', name: t('mod/bottomnav'), text: miss.length ? t('ed/chk-bnav', { names: miss.map(nm).join('、') }) : t('mod/bottomnav') });
    }
    if (inPage('gamemenu')) {
      const miss = D.m.gamemenu.items.filter((it) => it.on && !(it.img || it.def)); // 内置线性图标只是占位，没有默认图 / 上传图才算缺
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
    // 工具条统一（壳层整理 2026-11-26）：[内容 | 布局 | 颜色] 跟右栏页签同名，当前页签高亮；Banner 前面多「换图 / AI」；
    // ↑ ↓ 带提示；隐藏按钮带文字（可在左栏恢复）
    const b = baseName(id), fixed = MODS[b].fixed;
    const idx = E.D.order.indexOf(id);
    const btn = (act, icon, label, arg = '', on = false) => `<button class="${on ? 'is-on' : ''}" data-act="${act}" data-arg="${arg}" data-stop>${ic(icon)}${label}</button>`;
    const tabBtn = (v, icon) => btn('tbTab', icon, t('ed/tab-' + v), v, E.sel === id && E.tab === v && !E.ai && !E.iconAi);
    let main = '';
    if (b === 'banner') main = btn('toolReplace', 'image', t('ed/replace-image')) + btn('openAi', 'magic-wand', t('ed/ai'), '', !!E.ai);
    else main = tabBtn('content', 'pencil-simple');
    main += tabBtn('layout', 'sliders-horizontal') + tabBtn('color', 'paint-brush-fill');
    const tip = (k) => `title="${esc(t(k))}" aria-label="${esc(t(k))}"`;
    const move = fixed || b === 'sidebar' ? '' : `<button class="ib" data-act="move" data-arg="-1" data-stop ${idx <= 0 ? 'disabled' : ''} ${tip('ed/move-up')}>${ic('arrow-up')}</button><button class="ib" data-act="move" data-arg="1" data-stop ${idx >= E.D.order.length - 1 ? 'disabled' : ''} ${tip('ed/move-down')}>${ic('arrow-down')}</button>`;
    const menu = S.menu === 'modmenu' ? moduleMenu(id) : '';
    return `<div class="seltool ${below ? 'below' : ''}" data-stop><button class="ib st-grip" data-stgrip data-stop title="${esc(t('ed/tool-drag'))}" aria-label="${esc(t('ed/tool-drag'))}">${ic('dots-six-vertical')}</button>${main}${window.AD ? window.AD.toolBtn(id) : ''}${move}<button class="st-hide" data-act="toggleHide" data-arg="${id}" data-stop ${tip('ed/hide-tip')}>${ic('eye-slash-fill')}${t('ed/am-hide')}</button><span class="rel"><button class="ib" data-act="menu:toggle" data-arg="modmenu" data-stop ${tip('ed/more')}>${ic('dots-three')}</button>${menu}</span></div>`;
  }
  function moduleMenu(id) {
    // 顶部栏 / 底部导航是固定模块：只能隐藏（不是删除），所以这里写「隐藏」且不用红色；侧边栏删除 = 去掉顶部栏入口（可再添加），保留删除
    const b = baseName(id), fixed = MODS[b].fixed, hid = !!E.D.hidden[id];
    const del = fixed ? `<button class="menu-item" data-act="toggleHide" data-arg="${id}" data-stop>${ic(hid ? 'eye-fill' : 'eye-slash-fill')}<span class="tx"><span>${t(hid ? 'ed/am-show' : 'ed/am-hide')}</span><span class="sub">${t('ed/fixed-hide-sub')}</span></span></button>`
      : `<button class="menu-item is-danger" data-act="modDel" data-arg="${id}" data-stop>${ic('trash')}${t('ed/menu-delete')}</button>`;
    return `<div class="menu" data-stop>${fixed || b === 'sidebar' ? '' : `<button class="menu-item" data-act="modDup" data-arg="${id}" data-stop>${ic('copy')}${t('ed/menu-duplicate')}</button>`}${E.toolPos ? `<button class="menu-item" data-act="toolDock" data-stop>${ic('push-pin')}${t('ed/tool-dock')}</button>` : ''}<button class="menu-item" data-act="modReset" data-arg="${id}" data-stop>${ic('arrow-counter-clockwise')}${t('ed/menu-reset')}</button><div class="menu-sep"></div>${del}</div>`;
  }
  // ---------- 余额框（Waydon 2026-11-26：用通用组件「余额刷新 / 展示名称自行选择」334:67053，支持改图标、文字、颜色） ----------
  // 模式 = 通用组件的「功能」变体：默认（国旗）/ 无币种 / 币种切换 / 特小 / 特小无底
  const BAL_MODES = ['default', 'nocur', 'switch', 'small', 'bare'];
  const CLA = 'assets/classic/';
  // 图片字段：curImg 币种 / refImg 刷新 / vipImg VIP 徽章 / caretImg 下拉箭头 / copyImg 复制 / swImg 切换账号（null = 默认图）
  const BAL_DEF = { mode: 'default', head: 'vip', greet: 'Olá', act: 'copy', curImg: null, refImg: null, vipImg: null, caretImg: null, copyImg: null, swImg: null, c: {} };
  const balCfg = (D) => { D = D || E.D; const b = Object.assign({}, BAL_DEF, (D && D.bal) || {}); b.c = Object.assign({}, (D && D.bal && D.bal.c) || {}); return b; };
  const BAL_C = [['amt', 'ed/bal-c-amt', 'accent_3'], ['bd', 'ed/bal-c-bd', 'border'], ['bg', 'ed/bal-c-bg', 'bg_2'], ['ic', 'ed/bal-c-ic', 'primary']];
  function balBox(cfg, amt = '1,232,345,678.90') {
    cfg = cfg || balCfg(); const m = BAL_MODES.includes(cfg.mode) ? cfg.mode : 'default', c = cfg.c || {};
    // 颜色值 'key:<名>' 跟 68 Key 走（改品牌配色 / Key 会跟着变）；旧存档的十六进制原样用
    const kc = (v) => (v && v.startsWith('key:') ? keyVal(v.slice(4), liveTheme().th) || '' : v);
    const st = ['amt', 'bd', 'bg', 'ic'].map((k) => (c[k] ? `--bx-${k}:${kc(c[k])};` : '')).join('');
    // 币种切换的默认币种符号用遮罩跟 accent_3（Figma comm_icon_sqb）；国旗是彩色位图，按原图显示
    const cur = m === 'nocur' ? '' : m === 'switch' ? `${cfg.curImg ? `<img class="cur" src="${cfg.curImg}" alt="">` : balMask('cur cur-k', 'bal-sym.png')}<i class="xch">⇆</i>` : `<img class="cur" src="${cfg.curImg || CLA + 'bal-flag.png'}" alt="">`;
    const rf = cfg.refImg ? `<img class="rf" src="${cfg.refImg}" alt="">` : `<i class="rf" style="-webkit-mask-image:url(${CLA}bal-refresh.png);mask-image:url(${CLA}bal-refresh.png)"></i>`;
    return `<span class="bx m-${m}" style="${st}">${cur}<b>${amt}</b>${rf}</span>`;
  }
  // 单色小图标用遮罩着色，颜色绑 68 Key（Figma 317:55712）：下拉箭头 neutral_2、复制 / 切换账号 primary；上传的图按原图显示
  const balMask = (cls, f) => `<i class="${cls} bmask" style="-webkit-mask-image:url(${CLA}${f});mask-image:url(${CLA}${f})"></i>`;
  function balUser(cfg, name = 'huiyuan123456') {
    cfg = cfg || balCfg();
    const head = cfg.head === 'vip' ? `<img class="vip" src="${cfg.vipImg || CLA + 'bal-vip2.png'}" alt="VIP">` : cfg.head === 'greet' ? `<span class="greet">${esc(cfg.greet || '')}</span>` : '';
    const ak = cfg.act === 'copy' ? 'copyImg' : 'swImg', af = cfg.act === 'copy' ? 'bal-copy.png' : 'bal-switch.png';
    const act = cfg.act === 'none' ? '' : cfg[ak] ? `<img class="act" src="${cfg[ak]}" alt="">` : balMask('act', af);
    const cv = cfg.caretImg ? `<img class="cv" src="${cfg.caretImg}" alt="">` : balMask('cv', 'bal-caret.png');
    return `<span class="bxu">${head}${cv}<b>${esc(name)}</b>${act}</span>`;
  }
  window.balBox = (amt) => balBox(balCfg(), amt);
  window.balUser = () => balUser(balCfg());
  window.balHtml = () => balBox(balCfg(), '1,280.00'); // 顶部栏 / PC 顶部栏共用
  const balHtml = () => window.balHtml();
  const balSet = (fn) => commit(() => { E.D.bal = Object.assign({}, BAL_DEF, E.D.bal || {}); E.D.bal.c = Object.assign({}, E.D.bal.c || {}); fn(E.D.bal); });
  A.balMode = (v) => { if (!BAL_MODES.includes(v) || balCfg().mode === v) return false; balSet((b) => { b.mode = v; }); };
  A.balHead = (v) => { if (balCfg().head === v) return false; balSet((b) => { b.head = v; }); };
  A.balAct = (v) => { if (balCfg().act === v) return false; balSet((b) => { b.act = v; }); };
  A.balColor = (arg) => { const i = arg.indexOf('|'), k = arg.slice(0, i), v = arg.slice(i + 1); balSet((b) => { if (v) b.c[k] = v; else delete b.c[k]; }); };
  A.balImgReset = (k) => { balSet((b) => { b[k] = null; }); };
  // 币种图标 AI：用顶部栏 AI 同一组默认风格图（assets/ai-tb/cur-<风格>.png），点候选直接用上
  A.balCurAi = () => { E.balAi = !E.balAi; };
  A.balCurAiUse = (st) => { if (!TB_AI.includes(st)) return false; balSet((b) => { b.curImg = AIT + 'cur-' + st + '.png'; }); window.toast(t('ed/bal-ai-used'), undoOpt()); };
  A.balAll = () => { commit(() => { delete E.D.bal; }); window.toast(t('ed/bal-reset-done'), undoOpt()); };
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.matches) return;
    if (el.matches('[data-balgreet]')) { const v = el.value.trim().slice(0, 12); balSet((b) => { b.greet = v; }); window.render(); }
    else if (el.matches('[data-balcolor]') && /^#[0-9a-f]{6}$/i.test(el.value)) { const k = el.dataset.balcolor; balSet((b) => { b.c[k] = el.value.toLowerCase(); }); window.render(); }
    else if (el.matches('[data-balimg]') && el.files && el.files[0]) {
      const k = el.dataset.balimg, f = el.files[0];
      if (!window.imgOk(f)) { window.toast(t('mp/icon-bad'), { info: true }); return; }
      const r = new FileReader(); r.onload = () => { balSet((b) => { b[k] = r.result; }); window.render(); }; r.readAsDataURL(f);
    }
  });
  // inMid：帐户栏里调用（颜色挪到「颜色」页签、不再提示切登录态，帐户栏内容页签顶部已有登录态切换）
  function balSec(inMid) {
    const cfg = balCfg(), th = liveTheme().th;
    const modes = `<div class="bx-opts">${BAL_MODES.map((m) => `<button class="bx-opt ${cfg.mode === m ? 'is-on' : ''}" data-act="balMode" data-arg="${m}"><span class="bx-prev">${balBox(Object.assign({}, cfg, { mode: m }), '1,232.90')}</span><small>${t('ed/bal-m-' + m)}</small></button>`).join('')}</div>`;
    const seg3 = (opts, cur, act) => segBtns(opts.map((v) => ({ v, label: t('ed/bal-' + act.slice(3).toLowerCase() + '-' + v) })), cur, act);
    // 默认是遮罩着色的单色图标时，缩略图也按 Key 颜色画（mk = 颜色 Key）
    const imgRow = (k, def, lab, spec, mk, ai) => `<div class="bx-img"><span class="thumb sq">${cfg[k] || !mk ? `<img src="${cfg[k] || def}" alt="">` : `<i class="bx-mk" style="background:${keyVal(mk, th)};-webkit-mask-image:url(${def});mask-image:url(${def})"></i>`}</span><span class="tx"><b>${t(lab)}</b><small>${spec}${cfg[k] ? ' · ' + t('ed/tb-own') : ''}</small></span>${ai ? `<button class="ib-s tb-ai ${E.balAi ? 'is-on' : ''}" data-act="balCurAi" title="${esc(t('mp/ai-one'))}" aria-label="${esc(t('mp/ai-one'))}">${ic('sparkle-fill', 'ic-16')}</button>` : ''}<label class="ib-s bx-up" title="${esc(t('ed/upload'))}" aria-label="${esc(t('ed/upload'))}">${ic('upload-simple', 'ic-16')}<input type="file" accept="${window.IMG_ACCEPT}" data-balimg="${k}" hidden></label>${cfg[k] ? `<button class="ib-s" data-act="balImgReset" data-arg="${k}" title="${esc(t('mp/icon-reset'))}" aria-label="${esc(t('mp/icon-reset'))}">${ic('arrow-counter-clockwise', 'ic-16')}</button>` : ''}</div>`;
    const curAi = E.balAi && cfg.mode !== 'nocur' ? `<div class="bx-ai"><div class="p-note">${t('ed/bal-ai-note')}</div><div class="bx-ai-opts">${TB_AI.map((st) => `<button class="${cfg.curImg === AIT + 'cur-' + st + '.png' ? 'is-on' : ''}" data-act="balCurAiUse" data-arg="${st}" title="${esc(t('ed/tbai-' + st))}"><img src="${AIT}cur-${st}.png" alt=""><small class="ellipsis">${t('ed/tbai-' + st)}</small></button>`).join('')}</div></div>` : '';
    const actK = cfg.act === 'copy' ? 'copyImg' : 'swImg';
    const dirty = !!E.D.bal;
    return `<div class="p-sec bx-sec"><div class="lab">${t('ed/bal-title')}${dirty ? `<button class="tx-reset" style="margin-left:auto" data-act="balAll">${ic('arrow-counter-clockwise', 'ic-16')}${t('tx/reset')}</button>` : ''}</div>
      ${E.D.login || inMid ? '' : `<div class="p-note">${ic('info-fill', 'ic-16')}${t('ed/bal-login-hint')} <button class="warn-link" data-act="setLogin" data-arg="in">${t('ed/signed-in')}</button></div>`}
      <div class="bx-lab">${t('ed/bal-mode')}</div>${modes}
      <div class="bx-lab">${t('ed/bal-head')}</div>${seg3(['vip', 'greet', 'none'], cfg.head, 'balHead')}${cfg.head === 'greet' ? `<input class="input" style="margin-top:8px" maxlength="12" value="${esc(cfg.greet)}" data-balgreet placeholder="${esc(t('ed/bal-greet-ph'))}">` : ''}
      <div class="bx-lab">${t('ed/bal-act')}</div>${seg3(['copy', 'switch', 'none'], cfg.act, 'balAct')}
      <div class="bx-lab">${t('ed/bal-icons')}</div>${cfg.mode === 'nocur' ? '' : imgRow('curImg', CLA + (cfg.mode === 'switch' ? 'bal-sym.png' : 'bal-flag.png'), 'ed/bal-i-cur', '52×52', cfg.mode === 'switch' ? 'accent_3' : null, true) + curAi}${imgRow('refImg', CLA + 'bal-refresh.png', 'ed/bal-i-ref', '30×30', 'primary')}
      ${cfg.head === 'vip' ? imgRow('vipImg', CLA + 'bal-vip2.png', 'ed/bal-i-vip', '60×28') : ''}${imgRow('caretImg', CLA + 'bal-caret.png', 'ed/bal-i-caret', '20×20', 'neutral_2')}${cfg.act === 'none' ? '' : imgRow(actK, CLA + (cfg.act === 'copy' ? 'bal-copy.png' : 'bal-switch.png'), 'ed/bal-act-' + cfg.act, '26×26', 'primary')}
      <div class="p-note">${t('ed/bal-ic-note')}</div>
      ${inMid ? `<div class="p-note">${t('ed/bal-c-moved')} <button class="warn-link" data-act="setTab" data-arg="color">${t('ed/tab-color')}</button></div>` : `<div class="bx-lab">${t('ed/bal-colors')}</div>${balColorRows()}`}
      <div class="p-note">${t('ed/bal-note')}</div></div>`;
  }
  // 余额框颜色（顶部栏内容页签 / 帐户栏颜色页签共用）
  function balColorRows() {
    // 色块存 'key:<名>'（跟页面配色走）；「默认」按钮带默认 Key 的色点，色块列表不再重复默认色
    const cfg = balCfg(), th = liveTheme().th, kv = (k) => keyVal(k, th) || '#000';
    const SW = ['primary', 'accent_3', 'accent_2', 'lead', 'bg_2', 'border'];
    const sw = (k, base) => {
      const cur = cfg.c[k] || '', hex = cur && !cur.startsWith('key:');
      const keys = SW.filter((x) => x !== base).slice(0, 5);
      return `<div class="tx-colors"><button class="tx-auto ${cur ? '' : 'is-on'}" data-act="balColor" data-arg="${k}|"><i class="sw-dot" style="background:${kv(base)}"></i>${t('tx/c-auto')}</button>${keys.map((x) => `<button class="sw-btn ${cur === 'key:' + x ? 'is-on' : ''}" style="background:${kv(x)}" title="${esc(t('ed/key-' + x))}" aria-label="${esc(t('ed/key-' + x))}" data-act="balColor" data-arg="${k}|key:${x}"></button>`).join('')}<label class="rainbow tx-custom ${hex ? 'is-on' : ''}" title="${esc(t('tx/c-custom'))}"><input type="color" data-balcolor="${k}" value="${hex ? cur : kv(cur ? cur.slice(4) : base)}"></label></div>`;
    };
    return BAL_C.map(([k, lab, base]) => `<div class="bx-crow"><span>${t(lab)}${E.adv ? `<small class="kk">${cfg.c[k] && cfg.c[k].startsWith('key:') ? cfg.c[k].slice(4) : base}</small>` : ''}</span>${sw(k, base)}</div>`).join('');
  }
  // 侧边栏入口图标：有图片（上传 / AI）用图片，否则用线性图标（滤镜模拟值叠在线性图标上）
  function sideIcHtml(v, cls) { const x = tbImg(v, ''); return x.src ? `<img class="${cls} ico-img" src="${x.src}" alt="" style="${tbFitCss('side')}">` : x.f !== 'none' ? `<span style="display:inline-flex;filter:${x.f}">${ic('list', cls)}</span>` : ic('list', cls); }
  const PH_OK = (n) => (window.PH && window.PH[n] ? n : 'sparkle-fill');
  const tbOrder = () => { const o = E.D.tb.order; return Array.isArray(o) && o.length === 3 ? o : E.D.tb.searchFirst ? ['search', 'logo', 'cur'] : ['logo', 'cur', 'search']; };
  function h5Topbar() {
    const D = E.D, tb = D.tb, it = tb.items;
    const tic = tb.icons || {};
    // 侧边栏入口：默认线性图标跟 --tb-side（lead）；上传 / AI 后用图片
    const side = it.side ? `<span data-act="h5Side" data-stop>${sideIcHtml(tic.side, 'ico')}</span>` : '';
    // 经典蓝白：Logo 图 + 币种切换 + 带文字的搜索
    // 画布上点 Logo / 币种 / 搜索：弹出 上传 / AI / 恢复 菜单（跟其它模块的图标一致）
    const icm = (k) => (S.menu === 'tbic:' + k && !mobileEd() ? `<div class="menu icon-menu tb-ic-menu" data-stop>${assetMenuItems('tb-' + k)}</div>` : '');
    const tw = (k, cls, inner) => `<span class="${cls} tb-ic ${S.menu === 'tbic:' + k || S.menu === 'am:tb-' + k ? 'is-focus' : ''}" data-act="tbIconMenu" data-arg="${k}" data-stop>${inner}${icm(k)}</span>`;
    const search = it.search ? tw('search', 'srch-cl', `${tbImgTag(tic.search, 'assets/classic/search.png', '', '', 'search')}<small>${t('ed/tb-search')}</small>`) : '';
    // 币种框：外框 border、文案 neutral_2、默认币种图标 accent_3（Figma 25517:2140 comm_icon_sqb，用遮罩跟色）（Waydon 2026-11-26）
    const curIc = tic.cur ? tbImgTag(tic.cur, CLA + 'bal-sym.png', '', '', 'cur') : `<span class="cur-ic" style="-webkit-mask-image:url(${CLA}bal-sym.png);mask-image:url(${CLA}bal-sym.png)"></span>`;
    const cur = it.cur && !D.login ? tw('cur', 'cur-cl', `${curIc}<b>CNY</b><i></i>`) : '';
    const logo = it.logo ? tw('logo', 'lg lg-cl', tbImgTag(tb.logoF, 'assets/classic/logo.png', 'GAMING', '', 'logo')) : '';
    // 未登录：顶部栏只留币种切换，不显示余额框 / 登录注册 / 头像（Waydon 2026-11-26，登录入口在帐户栏）
    const auth = it.auth && D.login ? balHtml() : ''; // 头像不放顶部栏（Waydon 2026-11-26）
    const left = D.side === 'left' ? side : '';
    const right = D.side === 'right' ? side : '';
    // 功能排列（Waydon 2026-11-26）：Logo / 币种切换（登录后是余额框）/ 搜索 按 tb.order 从左到右排；Logo 后面留空把其余推到右边（Logo 在最后则空白在它前面）
    const part = { logo, cur: cur + auth, search };
    const ord = tbOrder(); const li = ord.indexOf('logo');
    const mid = ord.map((k, i) => (k === 'logo' && i === ord.length - 1 && i > 0 ? '<span class="sp"></span>' + part[k] : part[k] + (k === 'logo' && i < ord.length - 1 ? '<span class="sp"></span>' : ''))).join('') + (li < 0 ? '<span class="sp"></span>' : '');
    return `<div class="h5-top" style="height:${tb.h / 2}px;padding:0 ${tb.pad / 2}px;gap:${tb.gap / 2}px">${left}${mid}${right}</div>`;
  }
  // 轮播只播放未隐藏的图（ED-06）
  const visIdx = () => E.D.banner.slides.map((s, i) => (s.hid ? -1 : i)).filter((i) => i >= 0);
  function fixSlide() { const v = visIdx(); if (!v.includes(E.slide)) E.slide = v.find((i) => i > E.slide) ?? v[0] ?? 0; }
  function slideF(i) {
    if (E.ai && E.ai.cand != null && i === E.slide) return candList()[E.ai.cand];
    return (E.D.banner.slides[i] || {}).f || 'none';
  }
  // 轮播图背景（画布 / PC / 面板缩略图共用）：真实图 'img:' 或滤镜模拟；调整尺寸选「留边」时整图放进去、空白用底色，「裁切」按框的位置
  const BANNER_DEF = 'assets/classic/banner.webp';
  function slideBg(s, f, def) {
    s = s || {}; f = f == null ? s.f || 'none' : f;
    let css = window.fxStyle(f, def || BANNER_DEF);
    if (f === s.f && s.fit === 'pad') css += `;background-size:contain;background-repeat:no-repeat;background-color:${E.D.theme[s.fill] || E.D.theme.bg_1}`;
    else if (f === s.f && s.fit === 'crop' && s.x != null) css += `;background-position:${Math.round(s.x * 100)}% ${Math.round(s.y * 100)}%`;
    return css;
  }
  // 当前样式的默认图（Waydon 2026-11-26 16:06：什么样式就展示什么尺寸的默认 Banner）；没上传自己的图 = 用默认图 = 尺寸自动符合
  const defImg = (i, k = E.D.banner.size) => (k === 'small' ? SMALL_DEF[i % 3] : k === 'large' ? LARGE_DEF[i % 3] : null);
  const ownImg = (s) => /^img:/.test((s && s.f) || '');
  const slideDim = (s, sz) => (ownImg(s) ? { w: s.w, h: s.h } : { w: sz.w, h: sz.h });
  const slideStyle = (i) => slideBg(E.D.banner.slides[i], slideF(i), defImg(i));
  function h5Banner() {
    const B = E.D.banner, sz = BANNER[B.size];
    const v = visIdx(); const pos = Math.max(0, v.indexOf(E.slide));
    const slides = v.map((i) => `<div class="slide" style="${slideStyle(i)}"></div>`).join('');
    const st = indOf(B.ind);
    const ind = st === 'none' ? '' : `<div class="h5-ind ${st}" style="bottom:${sz.ib}px">${v.map((i, k) => `<i class="${k === pos ? 'on' : ''}" data-act="slideTo" data-arg="${i}" data-stop></i>`).join('')}</div>`;
    // 小 Banner：一排并列（默认 3 张，多了横向滑动），不轮播、无指示器
    if (B.size === 'small') return `<div class="h5-banner sz-small" style="padding:${B.margin / 2}px 0"><div class="sm-row">${v.map((i) => `<div class="sm-it" style="width:${sz.cw}px;height:${sz.ch}px;border-radius:${B.corner / 4}px;${slideStyle(i)}"></div>`).join('')}</div></div>`;
    // 指示器叠在图片底部（真实组件）
    // Waydon 2026-11-26 15:20：大 / 中 Banner 顶部贴住顶部栏，不留间距（只留下间距）
    const padTop = B.size === 'large' || B.size === 'medium' ? 0 : B.margin / 2;
    return `<div class="h5-banner sz-${B.size}" style="padding:${padTop}px 0 ${B.margin / 2}px"><div class="vp" data-swipe style="width:${sz.cw}px;height:${sz.ch}px;border-radius:${sz.sq ? 0 : B.corner / 2}px"><div class="track" style="transform:translateX(${-pos * 100}%)">${slides}</div>${ind}</div></div>`;
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
    const topPx = D.hidden.topbar ? 0 : D.tb.h / 2, bnPx = D.hidden.bottomnav ? 0 : BNAV_PX[D.m.bottomnav.h] || (+D.m.bottomnav.h / 2) || 55;
    const top = D.hidden.topbar ? '' : modWrap('topbar', h5Topbar(), { top: true });
    const bnav = D.hidden.bottomnav ? '' : `<div class="h5-bnav mod ${window.MP.bnavCls()} ${E.sel === 'bottomnav' ? 'is-sel' : ''}" style="height:${bnPx}px" data-mod="bottomnav" data-act="selMod" data-arg="bottomnav">${window.MP.bnav()}${E.sel === 'bottomnav' && !mobileEd() ? `<span class="sel-label">${esc(modName('bottomnav'))}</span>${selToolbar('bottomnav')}` : ''}${window.AD ? window.AD.modMask('bottomnav') : ''}</div>`;
    const side = E.h5side && !D.hidden.sidebar ? `<div class="h5-side ${D.side}" data-act="h5SideClose" data-stop>${window.MP.side()}${window.AD ? window.AD.modMask('sidebar') : ''}</div>` : '';
    // ED-13：画布按页面高度显示（默认一屏 1334，Waydon 2026-11-26），内容超出在页面内滚动；加高后 1334 处画首屏线
    const minBody = Math.max(0, D.height / 2 - topPx - bnPx);
    const fold = opts.noFold ? '' : `<div class="h5-fold" style="top:${667}px"><span>${t('ed/fold-line')}</span></div>`;
    return `<div class="h5 ${D.iconStyle ? 'ics-' + D.iconStyle : ''}" style="${themeStyle()}${opts.style || ''}">${txtCss()}${top}<div class="h5-body" data-sk="h5-body${opts.style ? '-x' : ''}" ${opts.measure ? 'data-measure' : ''} data-top="${topPx}" data-bn="${bnPx}" style="height:${minBody}px">${body}</div>${bnav}${D.height > 1334 ? fold : ''}${side}</div>`;
  }
  // 一屏滚动时：选中的模块不在可视区就滚过去
  let lastSel = null;
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'editor' || E.sel === lastSel) return; lastSel = E.sel; if (!E.sel) return;
    const b = document.querySelector('.h5-body[data-measure]'), m = b && b.querySelector(`[data-mod="${E.sel}"]`); if (!m) return;
    const br = b.getBoundingClientRect(), mr = m.getBoundingClientRect();
    if (mr.top < br.top || mr.bottom > br.bottom) b.scrollTop += mr.top - br.top - 8;
  });
  // 手机编辑器：底部面板（.m-mod）盖住画布下半部分；选中模块后把画布滚到模块露在面板上方（不够滚就给画布底部垫出面板高度）
  let mLastSel = null;
  window.AFTER_RENDER.push(() => {
    const c = document.querySelector('.med-canvas'); if (!c) { mLastSel = null; return; }
    const sh = document.querySelector('.med-sheet.m-mod');
    c.style.paddingBottom = sh ? sh.offsetHeight + 'px' : '';
    if (S.route !== 'editor' || !E.sel || !sh) { mLastSel = sh ? mLastSel : null; return; }
    if (E.sel === mLastSel) return; mLastSel = E.sel;
    const fit = () => {
      const m = c.querySelector(`[data-mod="${E.sel}"]`); if (!m) return;
      const cr = c.getBoundingClientRect(), mr = m.getBoundingClientRect(), top = Math.min(cr.bottom, sh.getBoundingClientRect().top);
      if (mr.top >= cr.top + 8 && mr.bottom <= top - 8) return;
      c.scrollTop += mr.bottom > top - 8 && mr.height < top - cr.top - 16 ? mr.bottom - (top - 8) : mr.top - cr.top - 8;
    };
    fit(); setTimeout(fit, 320); // 面板有进场动画，动画结束后再对一次
  });
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
    const d = E.contentH - E.D.height; if (d <= 0 || E.D.height <= 1334) return ''; // 一屏高度时内容本来就滚动，不提示
    const to = Math.min(6000, E.contentH);
    return `<div class="notice is-warn h5-over">${ic('warning-circle-fill')}<div class="tx">${t('ed/overflow', { d })}</div><button class="btn btn-secondary btn-sm" data-act="growTo" data-arg="${to}" data-stop>${t('ed/grow-to', { n: to })}</button><button class="btn btn-ghost btn-sm" data-act="fixLayout" data-stop>${t('ed/fix-layout')}</button></div>`;
  }
  A.growTo = (n) => { commit(() => { E.D.height = Math.max(1334, Math.min(6000, +n)); }); };
  A.fixLayout = () => { const last = E.D.order.filter((x) => !E.D.hidden[x]).slice(-1)[0]; if (!last) return false; E.sel = last; E.tab = 'layout'; E.ai = null; E.keys = null; E.iconAi = null; if (mobileEd()) E.mpanel = 'module'; };

  // ---------- 左栏：页面与模块树 ----------
  function stOf(id) {
    const b = baseName(id); const n = checks().req.filter((x) => x.mod === b).length;
    return n ? 'check' : 'done';
  }
  // 状态点（壳层整理）：只在「有事要处理」时显示黄点并带提示；已完成不再显示绿点，减少噪音
  const dotHtml = (st, n) => (st === 'check' ? `<span class="dot check" title="${esc(t('ed/st-check-n', { n: n || 1 }))}" aria-label="${esc(t('ed/st-check-n', { n: n || 1 }))}"></span>` : '<span class="dot done" aria-hidden="true"></span>');
  function row(id, opts = {}) {
    const hidden = !!E.D.hidden[id];
    const grip = opts.grip ? `<span class="grip" data-grip="${id}" title="${esc(t('ed/drag-tip'))}">${ic('dots-six-vertical', 'ic-16')}</span>` : '';
    const pcNote = window.PC && window.PC.rowNote ? window.PC.rowNote(id) : '';
    const st = stOf(id), n = checks().req.filter((x) => x.mod === baseName(id)).length;
    const hidTag = hidden ? `<span class="pill-tag is-gray">${t('ed/st-hidden')}</span>` : '';
    return `<div class="row ${E.sel === id ? 'is-on' : ''} ${hidden ? 'is-hidden' : ''}" data-row="${id}">${grip}${dotHtml(st, n)}<button class="nm" data-act="selMod" data-arg="${id}">${esc(modName(id))}</button>${hidTag}${pcNote}<button class="eye" data-act="toggleHide" data-arg="${id}" title="${esc(t(hidden ? 'ed/am-show' : 'ed/am-hide'))}" aria-label="${esc(t(hidden ? 'ed/am-show' : 'ed/am-hide'))}">${ic(hidden ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button></div>`;
  }
  function tree() {
    // 左栏（壳层整理 2026-11-26）：首页 → 首页模块（可拖动，「添加模块」紧跟列表末尾）→ 固定位置（顶部栏 / 侧边栏 / 底部导航，不能拖）
    // 侧边栏「左 / 右」只放在侧边栏「布局」和顶部栏入口里，左栏不再重复
    const n = checks().req.length; const pageSt = n ? 'check' : 'done';
    return `<div class="grp-label">${t('ed/pages')}</div>
      <div class="row ${E.sel === null ? 'is-on' : ''}">${dotHtml(pageSt, n)}${ic('house-fill', 'ic-16')}<button class="nm" data-act="selMod" data-arg="">${t('cat/home')}</button>${n ? `<span class="st is-warn">${t('ed/st-check-n', { n })}</span>` : ''}</div>
      <div class="divider"></div><div class="grp-label">${t('ed/modules')}</div>
      <div data-drag-list>${E.D.order.map((id) => row(id, { grip: true })).join('')}</div>
      <div class="rel"><button class="add-mod ${S.menu === 'addmod' ? 'is-open' : ''}" data-act="addMenu">${ic('plus', 'ic-16')}${t('ed/add-module')}</button>${S.menu === 'addmod' ? `<div class="menu add-menu">${addList()}</div>` : ''}</div>
      <div class="grp-label">${t('ed/fixed')}</div>${row('topbar')}${E.D.tb.items.side ? row('sidebar') : ''}${row('bottomnav')}`;
  }

  // ---------- 右栏 ----------
  // 规则说明收成标题旁的 (i)：电脑悬停看提示，手机点一下弹出同样的文字（壳层整理：每段最多一条灰色说明）
  const tipI = (k, p) => `<button class="tip-i" data-act="tipShow" data-arg="${esc(k)}" data-stop title="${esc(t(k, p))}" aria-label="${esc(t(k, p))}">${ic('info-fill', 'ic-16')}</button>`;
  A.tipShow = (k) => { if (!window.I18N[k]) return false; window.toast(t(k), { info: true }); return false; };
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
      <div class="p-sec"><div class="lab">${t('ed/page-height')}</div><div class="h-row"><input class="input" style="width:110px" type="number" min="1334" max="6000" value="${E.D.height}" data-input="pageHeight" data-key="heightKey"><span class="caption faint">${hNote}</span></div></div>
      <div class="p-note">${ic('frame-corners', 'ic-16')}${t('ed/unit-750')}</div>`;
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
    if (id.startsWith('tb-')) {
      // 顶部栏：上传 / AI 生成 / 恢复默认 / 显示隐藏（Waydon 2026-11-26）
      const k = id.slice(3), own = k === 'logo' ? tbImg(E.D.tb.logoF, '').own : !!(E.D.tb.icons || {})[k];
      const aiAct = k === 'logo' ? 'tbLogoAiOpen' : 'tbAiJump';
      return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button>${aiAct ? `<button class="menu-item" data-act="${aiAct}" data-arg="${k}">${ic('sparkle-fill')}${t(k === 'logo' ? 'ed/tblogo-title' : 'mp/ai-one')}</button>` : ''}<button class="menu-item" data-act="amReset" data-arg="${id}" ${own ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button><button class="menu-item" data-act="amToggle" data-arg="${id}">${ic(E.D.tb.items[k] ? 'eye-slash-fill' : 'eye-fill')}${t('ed/am-toggle')}</button>`;
    }
    // 游戏菜单按钮底图：上传 / AI / 恢复（没有显示隐藏，按钮本身一直在）
    if (/^mp-gamemenu-btn/.test(id)) { const own = !!window.MP.getAsset(id); return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button><button class="menu-item" data-act="gmBaiOpen">${ic('sparkle-fill')}${t('mp/gm-bai-title')}</button><button class="menu-item" data-act="amReset" data-arg="${id}" ${own ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button>`; }
    // 游戏卡片收藏星：上传 / AI / 恢复（两张一起恢复）
    if (/^mp-gamecards-star/.test(id)) { const own = !!window.MP.getAsset(id); return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button><button class="menu-item" data-act="gcAiOpen" data-arg="star">${ic('sparkle-fill')}${t('mp/gc-ai-title')}</button><button class="menu-item" data-act="amReset" data-arg="${id}" ${own ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button>`; }
    const gcAi = id === 'mp-gamecards-fallback' ? `<button class="menu-item" data-act="gcAiOpen" data-arg="fallback">${ic('sparkle-fill')}${t('mp/gc-ai-title')}</button>` : ''; // 兜底封面也能 AI 生成
    const lib = /^mp-(jackpot-bg|gamecards-fallback|sidebar-head)$/.test(id) ? `<button class="menu-item" data-act="openLib" data-arg="${id}">${ic('stack-fill')}${t('ed/library')}</button>` : '';
    return `<button class="menu-item" data-act="amUpload" data-arg="${id}">${ic('upload-simple')}${t('ed/am-upload')}</button>${lib}${gcAi}<button class="menu-item" data-act="amReset" data-arg="${id}">${ic('arrow-counter-clockwise')}${t('ed/am-reset')}</button><button class="menu-item" data-act="amToggle" data-arg="${id}">${ic('eye-fill')}${t('ed/am-toggle')}</button>`;
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
  // Banner 样式（Waydon 2026-11-26：大/通用/中/小 作为样式给业主切换，只是前端显示尺寸不同，上传统一 1020×300）
  function bannerStyles(cur) {
    const i0 = visIdx()[0] ?? 0;
    return `<div class="bs-opts">${SIZES.map((k) => { const b = BANNER[k]; const prev = slideBg(E.D.banner.slides[i0], slideF(i0), defImg(i0, k)); const w = Math.round(b.dw / 750 * 64), h = Math.round(b.dh / 750 * 64); return `<button class="bs-opt ${cur === k ? 'is-on' : ''}" data-act="bannerSize" data-arg="${k}" title="${esc(t('ed/banner-' + k) + ' · ' + b.dw + '×' + b.dh)}"><span class="bs-prev"><i style="width:${w}px;height:${h}px;${prev}"></i></span><b>${t('ed/banner-' + k)}</b><small>${b.dw}×${b.dh}</small></button>`; }).join('')}</div>`;
  }
  function bannerContent() {
    const B = E.D.banner, sz = BANNER[B.size];
    // 尺寸不符的提醒单独占整行（放在缩略图那一行下面），不挤在名称列里换成好几行（QA 2026-11-26）
    const isBad = (s0) => { const s = slideDim(s0, sz); return s.w !== sz.w || s.h !== sz.h; };
    const spLine = (s0) => { const s = slideDim(s0, sz); return isBad(s0) ? '' : `${s.w}×${s.h}`; };
    const warnLine = (s0, i) => { if (!isBad(s0)) return ''; const s = slideDim(s0, sz); return `<button class="warn-link slide-warn" data-act="openResize" data-arg="slide${i}" data-stop>${ic('warning-circle-fill', 'ic-16')}${t('ed/slide-bad', { w: s.w, h: s.h })}</button>`; };
    const hidTag = (s) => (s.hid ? `<span class="pill-tag is-gray">${t('ed/slide-hidden')}</span>` : '');
    // 行内眼睛（跟其它列表模块一致）；最后一张可见的不能隐藏
    const vis = visIdx();
    const eye = (s, i) => { const lastVis = !s.hid && vis.length <= 1; return `<button class="eye ${lastVis ? 'is-off' : ''}" data-act="amToggle" data-arg="slide${i}" data-stop ${lastVis ? 'disabled' : ''} title="${esc(t(lastVis ? 'ed/slide-keep-one' : s.hid ? 'ed/am-show' : 'ed/am-hide'))}" aria-label="${esc(t(s.hid ? 'ed/am-show' : 'ed/am-hide'))}">${ic(s.hid ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button>`; };
    const thumb = (i) => `<span class="thumb" style="${slideBg(B.slides[i], null, defImg(i))}"></span>`;
    const slides = B.slides.map((s, i) => {
      const grip = `<span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span>`;
      if (i === E.slide) return `<div class="asset-row ${s.hid ? 'is-hidden' : ''}" data-row="${i}">${grip}<div class="asset is-on"><div class="top">${thumb(i)}<span style="min-width:0"><div class="nm slide-nm"><span>${t('ed/slide-n', { n: i + 1 })}</span></div><div class="sp">${spLine(s)}<span class="pill-tag">${t('ed/previewing-slide')}</span>${hidTag(s)}</div></span>${eye(s, i)}${moreBtn('slide' + i)}</div>${warnLine(s, i)}
        <div class="acts"><button class="btn btn-primary btn-sm" data-act="openAi">${ic('magic-wand', 'ic-16')}${t('ed/ai')}</button><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="slide${i}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="openLib" data-arg="slide${i}">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div></div>${uploadUI('slide' + i)}`;
      return `<div class="asset-row ${s.hid ? 'is-hidden' : ''}" data-row="${i}">${grip}<div class="asset compact" data-act="slideTo" data-arg="${i}" title="${esc(t('ed/slide-edit'))}"><div class="top">${thumb(i)}<span style="min-width:0"><div class="nm slide-nm"><span>${t('ed/slide-n', { n: i + 1 })}</span></div><div class="sp">${spLine(s)}${hidTag(s)}</div></span><span class="slide-edit" aria-hidden="true">${ic('pencil-simple', 'ic-16')}</span>${eye(s, i)}${moreBtn('slide' + i)}</div>${warnLine(s, i)}</div></div>${uploadUI('slide' + i)}`;
    }).join('');
    const bad = checks().req.filter((x) => x.mod === 'banner');
    return `${bad.length ? `<div class="notice is-warn">${ic('warning-circle-fill')}<div>${esc(bad[0].text)}<div class="caption faint">Banner</div></div></div>` : ''}
      <div class="p-sec"><div class="lab">${t('ed/banner-images', { n: B.slides.length })}${tipI('ed/slide-hint')}<span class="v">${sz.w}×${sz.h}</span></div><div data-drag-list="banner" class="slide-list">${slides}</div>
        ${B.slides.length < 5 ? `<button class="btn btn-outline btn-sm" style="margin-top:8px" data-act="addSlide">${ic('plus', 'ic-16')}${t('ed/add-slide')}</button>` : ''}<div class="p-note">${ic('info-fill', 'ic-16')}${t('ed/slide-text-note')}</div><div class="p-note">${t('ed/slide-style-at')}<button class="tb-goto" data-act="setTab" data-arg="layout">${t('ed/tab-layout')}</button></div></div>
      <div class="p-sec"><div class="lab">${t('ed/indicator')}</div><div class="ind-opts">${IND.map((v) => `<button class="ind-opt ${indOf(B.ind) === v ? 'is-on' : ''}" data-act="bannerInd" data-arg="${v}"><span class="ind-prev ${v === 'none' ? '' : 'on-ind'}">${v === 'none' ? `<small>${t('ed/ind-none')}</small>` : `<span class="h5-ind ${v}">${[0, 1, 2, 3, 4].map((k) => `<i class="${k === 2 ? 'on' : ''}"></i>`).join('')}</span>`}</span></button>`).join('')}</div><div class="p-note">${t('ed/ind-note')}</div></div>`;
  }
  function pxSeg(vals, cur, act, labels, rng) {
    return `${segBtns(vals.map((v, i) => ({ v: String(v), label: labels ? labels[i] : v + ' px' })), String(cur), act)}${pxCustom(vals, cur, act, rng)}`;
  }
  // 布局参数的「自定义」（Waydon 2026-11-26）：档位之外可直接输入数值，回车或失焦生效，越界自动夹到范围内
  function pxCustom(vals, cur, act, rng) {
    const [min, max, unit] = rng || [0, 200, 'px'];
    const on = !vals.map(Number).includes(+cur);
    return `<label class="px-custom ${on ? 'is-on' : ''}"><span>${t('ed/custom')}</span><input class="input" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${esc(String(cur))}" data-pxact="${act}" data-min="${min}" data-max="${max}"><em>${unit}</em><small>${min}–${max}</small></label>`;
  }
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.matches || !el.matches('[data-pxact]')) return;
    let n = Math.round(+el.value); if (!Number.isFinite(n)) { window.render(); return; }
    const min = +el.dataset.min, max = +el.dataset.max; if (n < min || n > max) { n = Math.max(min, Math.min(max, n)); window.toast(t('ed/custom-clamped', { min, max }), { info: true }); }
    const fn = A[el.dataset.pxact]; if (fn) fn(String(n)); window.render();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-pxact]')) e.target.blur(); });
  function bannerLayout() {
    const B = E.D.banner;
    const mk = [8, 16, 24], ck = [0, 8, 16];
    return `<div class="p-sec"><div class="lab">${t('ed/banner-style')}</div>${bannerStyles(B.size)}<div class="p-note">${t('ed/spec-line2', BANNER[B.size])}</div></div>
      <div class="p-sec"><div class="lab">${t('ed/margin')}<span class="v">${B.margin} px</span></div>${pxSeg(mk, B.margin, 'bannerMargin', [t('ed/s-small'), t('ed/s-medium'), t('ed/s-large')], [0, 64, 'px'])}<div class="seg-sub">${mk.map((v) => `<span class="${v === B.margin ? 'is-on' : ''}">${v} px</span>`).join('')}</div></div>
      ${BANNER[B.size].sq ? '' : `<div class="p-sec"><div class="lab">${t('ed/corner')}<span class="v">${B.corner} px</span></div>${pxSeg(ck, B.corner, 'bannerCorner', [t('ed/c-none'), t('ed/s-small'), t('ed/s-large')], [0, 60, 'px'])}<div class="seg-sub">${ck.map((v) => `<span class="${v === B.corner ? 'is-on' : ''}">${v} px</span>`).join('')}</div></div>`}
      <div class="p-note">${ic('lock-fill', 'ic-16')}${t('ed/layout-note')}</div>`;
  }
  // Banner 颜色（Figma 317:55531）：占位底 = ddt_bg，指示器选中 / 未选中 = text_primary（固定白，未选中 50% 透明）
  // 存在 E.D.ec['banner.*']：空 = 跟默认 Key；'key:<名>' = 改绑另一个 Key；十六进制 = 自定义
  const BN_SW = { 'banner.placeholder': ['bg_1', 'border', 'neutral_3', 'primary'], 'banner.indActive': ['primary', 'accent_3', 'lead', 'bg_2'], 'banner.indDef': ['bg_2', 'neutral_3', 'lead', 'primary'] };
  function bannerColor() {
    const { th, ec } = liveTheme();
    const rows = window.MP.EL.banner.map(([id, key]) => {
      const v = E.D.ec[id] || null, lab = t('mp/c-' + id.replace('.', '-')), pk = E.picker && E.picker.elRow === id;
      const kk = E.adv ? `<small class="kk">${v && v.startsWith('key:') ? v.slice(4) : key}</small>` : '';
      const defC = keyVal(key, th, ec);
      return `<div class="crow"><div class="k">${lab}${kk}</div><div class="tx-colors"><button class="tx-auto ${v ? '' : 'is-on'}" data-act="bnColor" data-arg="${id}|" title="${esc(t('ed/bn-c-def'))}"><i class="sw-dot" style="background:${defC}"></i>${t('mp/c-default')}</button>${BN_SW[id].map((k) => `<button class="sw-btn ${v === 'key:' + k ? 'is-on' : ''}" style="background:${th[k]}" title="${esc(t('ed/key-' + k))}" aria-label="${esc(t('ed/key-' + k))}" data-act="bnColor" data-arg="${id}|key:${k}"></button>`).join('')}<button class="rainbow ${pk || (v && !v.startsWith('key:')) ? 'is-on' : ''}" data-act="bnPick" data-arg="${id}|${key}" title="${esc(t('tx/c-custom'))}" aria-label="${esc(t('tx/c-custom'))}"></button></div>${pk ? pickerHtml('in-panel', lab) : ''}</div>`;
    }).join('');
    return `<div class="p-sec">${rows}</div>
      <div class="p-note">${t('ed/bn-c-note')}</div>
      <button class="p-note" style="align-items:center;margin-top:12px" data-act="toggleAdv"><span class="check ${E.adv ? 'is-on' : ''}">${E.adv ? ic('check', 'ic-16') : ''}</span>${t('ed/show-advanced')}</button>`;
  }
  A.bnColor = (arg) => { const i = arg.indexOf('|'); const id = arg.slice(0, i), v = arg.slice(i + 1) || null; if ((E.D.ec[id] || null) === v) return false; E.picker = null; commit(() => { if (v) E.D.ec[id] = v; else delete E.D.ec[id]; }); };
  A.bnPick = (arg) => {
    const [id, key] = arg.split('|'); if (E.picker && E.picker.elRow === id) { E.picker = null; return; }
    const { th, ec } = liveTheme(); const v = E.D.ec[id]; const cur = (v && !v.startsWith('key:') ? v : keyVal(v ? v.slice(4) : key, th, ec) || '#ffffff').slice(0, 7);
    E.picker = { key: 'primary', elRow: id, label: t('mp/c-' + id.replace('.', '-')), orig: cur, value: cur, where: 'el' };
  };
  // Banner AI（ED-09）：成功才扣 20；余额不足、失败都有出口
  function aiPanel() {
    const a = E.ai, sz = BANNER[E.D.banner.size];
    const kws = [1, 2, 3, 4, 5, 6, 7, 8];
    const can = afford(20);
    let cands = '';
    if (a.stage === 'generating') cands = `<div class="cands">${[0, 1, 2, 3].map(() => '<div class="cand skeleton"></div>').join('')}</div><div class="rec-note">${ic('clock', 'ic-16')}${t('rec/generating')}</div>`;
    else if (a.stage === 'failed') cands = `<div class="cands">${[0, 1, 2, 3].map(() => `<div class="cand is-fail">${ic('x-circle-fill')}</div>`).join('')}</div><div class="ia-msg is-err">${ic('warning-circle-fill', 'ic-16')}${t('ed/ai-failed')}</div><div class="rec-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-act="aiGen">${t('rec/retry', { c: 20 })}</button><button class="btn btn-secondary btn-sm" data-act="closeAi">${t('ed/keep-current')}</button></div>`;
    else if (a.stage === 'cands') cands = `<div class="cands">${candList().map((f, i) => `<button class="cand ${a.cand === i ? 'is-on' : ''}" style="${window.fxStyle(f)};aspect-ratio:${sz.w} / ${sz.h}" data-act="pickCand" data-arg="${i}">${a.cand === i ? `<span class="ck">${ic('check', 'ic-16')}</span>` : ''}${i === 0 && a.best ? `<span class="best">${t('ed/ai-best')}</span>` : ''}</button>`).join('')}</div>
        <div class="rec-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm ${a.cand == null ? 'is-disabled' : ''}" data-act="adoptCand">${t('ed/adopt')}</button><button class="btn btn-secondary btn-sm" data-act="closeAi">${t('ed/keep-current')}</button><button class="btn btn-outline btn-sm" data-act="aiGen">${ic('clock-counter-clockwise', 'ic-16')}${t('rec/regenerate-cost', { c: 20 })}</button></div><div class="p-note">${t('ed/ai-note')}</div>`;
    const ref = window.refSlot ? window.refSlot(a.refSt, 'edRef') : '';
    return `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="closeAi" title="${esc(t('ed/keep-current'))}">${ic('caret-left')}</button>${t('ed/ai-title')}</h2>
      <div class="p-note" style="margin:0 0 8px">${ic('magic-wand', 'ic-16')}${t('ed/ai-auto-hint')}</div>
      <div class="ai-box"><div class="in">${ref}
        <div style="flex:1;min-width:0"><textarea data-input="aiPrompt" ${a.analyzing ? `disabled placeholder="${esc(t('ed/tbai-analyzing'))}"` : ''}>${esc(a.analyzing ? '' : a.prompt)}</textarea>${a.kw.length ? `<div class="tagrow">${a.kw.map((k) => `<button class="chip is-on" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}${ic('x', 'ic-16')}</button>`).join('')}</div>` : ''}</div></div>
        <div class="ft"><span class="rel"><button class="c-opt" data-act="menu:toggle" data-arg="aiModel">${window.MODEL_LOGO[a.model]}${a.model === 'gpt' ? 'GPT Image' : 'Gemini'}${ic('caret-down', 'chev')}</button>${S.menu === 'aiModel' ? `<div class="menu c-menu">${['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${a.model === m ? 'is-on' : ''}" data-act="aiModel" data-arg="${m}">${window.MODEL_LOGO[m]}<span><div class="nm">${m === 'gpt' ? 'GPT Image' : 'Gemini'}</div><div class="ds">${t('model/' + m + '-desc')}</div></span></button>`).join('')}</div>` : ''}</span>
          <button class="send ${can && a.stage !== 'generating' && !a.analyzing ? '' : 'is-disabled'}" data-act="aiGen">${ic('sparkle-fill')}20${ic('arrow-up')}</button></div></div>
      ${can ? '' : `<div class="ai-low">${t('ed/ai-low')} · <button data-act="edTopup">${t('confirm/topup')}</button></div>`}
      <div class="p-sec"><div class="lab">${t('ed/ai-style-title')}</div><div class="kw">${kws.map((k) => `<button class="chip ${a.kw.includes(k) ? 'is-on' : ''}" data-act="aiKw" data-arg="${k}">${t('ed/ai-kw-' + k)}</button>`).join('')}</div>
        <div class="p-note">${t('ed/cost-ai')}</div><div class="p-note" style="margin-top:2px">${t('ed/spec-line', sz)}</div></div>
      ${a.stage !== 'idle' ? `<div class="p-sec"><div class="lab">${t('ed/ai-candidates')}</div>${cands}</div>` : ''}`;
  }
  // ---------- 顶部栏图标 AI 生成（模拟；样图由 Figma generate_image 生成，Waydon 2026-11-26） ----------
  // 跟首页创作框一样：参考图格 + 提示词输入框 + 模型下拉 + 发送键。上方风格卡点一下就把该风格的提示词填进框里；
  // 上传参考图后 AI 反推提示词填进框里（可改）。目标：搜索+币种 / 只搜索 / 只币种
  const TB_AI = ['glossy', 'flat', 'blackgold', 'festive', 'neon']; const AIT = 'assets/ai-tb/';
  const TB_AI_P = {
    glossy: ['亮蓝色 #1678FF 渐变，圆润卡通 3D 光泽质感，带白色高光，干净明亮', 'bright blue #1678FF gradient, glossy cartoon 3D, white highlights, clean and bright'],
    flat: ['纯色扁平风格，主色蓝 #1678FF / 橙黄 #FFAA09，线条粗细一致、圆角端点，无渐变，极简', 'flat solid color, blue #1678FF / orange #FFAA09, even rounded strokes, no gradient, minimal'],
    blackgold: ['香槟金金属拉丝质感，深色镜片 / 浮雕符号，边缘细齿纹，奢华高级', 'brushed champagne-gold metal, dark lens / embossed symbol, milled edge, luxurious'],
    festive: ['中国红 #E83A30 主体，金色描边，祥云点缀，喜庆节日风格，3D 卡通', 'Chinese red #E83A30 with gold outline and auspicious clouds, festive 3D cartoon'],
    neon: ['青蓝 / 紫色霓虹发光描边，深色半透明主体，科技赛博风，不要白色外发光', 'cyan / purple neon glowing outline, dark translucent body, cyber style, no white outer glow'],
  };
  const presetOf = (st) => TB_AI_P[st][/^zh/.test(S.lang) ? 0 : 1];
  const tbAi = () => (E.tbAi = E.tbAi || { target: 'both', style: 'glossy', model: 'gpt', prompt: presetOf('glossy'), stage: 'setup' });
  // 目标：两个一起（搜索 + 币种）/ 搜索 / 币种 / 侧边栏入口（加了侧边栏才有）；侧边栏入口 AI 图 = 菜单宫格图标（assets/ai-acct/more-<风格>）
  const tbAiTgt = () => { const a = tbAi(); if (a.target === 'side' && !E.D.tb.items.side) a.target = 'both'; return a.target; };
  const SIDE_AI = (st) => 'assets/ai-acct/more-' + st + '.webp';
  const tbAiCost = () => (tbAiTgt() === 'both' ? 40 : 20);
  A.tbAiStyle = (v) => { const a = tbAi(); if (a.stage === 'busy') return false; a.style = v; a.prompt = presetOf(v); a.fromRef = false; a.stage = 'setup'; };
  A.tbAiTarget = (v) => { const a = tbAi(); if (a.stage === 'busy' || a.target === v) return false; a.target = v; if (a.stage === 'done') a.stage = 'setup'; };
  A.tbAiModel = (v) => { tbAi().model = v; S.menu = null; };
  A.tbAiRefPick = () => { const a = tbAi(); if (a.stage === 'busy') return false; const inp = document.createElement('input'); inp.type = 'file'; inp.accept = window.IMG_ACCEPT; inp.setAttribute('data-tbairef', ''); inp.style.display = 'none'; document.body.appendChild(inp); inp.click(); setTimeout(() => inp.remove(), 60000); return false; };
  A.tbAiRefRm = () => { const a = tbAi(); a.ref = null; a.refSt = null; a.analyzing = false; a.fromRef = false; a.prompt = presetOf(a.style); a.stage = 'setup'; };
  A.tbAiRefView = () => false;
  A.tbAiRefCancel = () => A.tbAiRefRm();
  // 参考图反推提示词（通用）：读图取平均色 / 色相 / 饱和度 → 推荐款式 + 中英文提示词。where = [中文用途, 英文用途]
  function refRead(src, where, cb) {
    const im = new Image(); im.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 32, 32);
      const d = g.getImageData(0, 0, 32, 32).data; let r = 0, gg = 0, b = 0, n = 0, dark = 0, white = 0;
      for (let k = 0; k < d.length; k += 4) { if (d[k + 3] < 128) continue; const R = d[k], G = d[k + 1], B = d[k + 2]; if (R > 235 && G > 235 && B > 235) { white++; continue; } if (R + G + B < 120) dark++; r += R; gg += G; b += B; n++; }
      n = n || 1; r /= n; gg /= n; b /= n;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 510, sat = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255));
      let h = 0; if (mx !== mn) { h = mx === r ? (gg - b) / (mx - mn) : mx === gg ? 2 + (b - r) / (mx - mn) : 4 + (r - gg) / (mx - mn); h = (h * 60 + 360) % 360; }
      const hex = '#' + [r, gg, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
      const darkBg = dark / n > 0.35, zh = /^zh/.test(S.lang);
      const style = darkBg && (h > 170 && h < 300) ? 'neon' : (h < 25 || h > 340) && sat > 0.45 ? 'festive' : (h >= 25 && h < 55 && sat < 0.55) || darkBg ? 'blackgold' : sat > 0.75 && l > 0.45 && (h >= 15 && h < 60) ? 'flat' : 'glossy';
      const colorZh = (h < 25 || h > 340) ? '红色' : h < 45 ? '橙金色' : h < 70 ? '黄色' : h < 160 ? '绿色' : h < 200 ? '青色' : h < 260 ? '蓝色' : '紫色';
      const colorEn = (h < 25 || h > 340) ? 'red' : h < 45 ? 'orange-gold' : h < 70 ? 'yellow' : h < 160 ? 'green' : h < 200 ? 'cyan' : h < 260 ? 'blue' : 'purple';
      const finZh = { glossy: '圆润卡通 3D 光泽质感，带白色高光', flat: '纯色扁平风格，无渐变，线条圆角', blackgold: '金属拉丝质感，香槟金，奢华高级', festive: '喜庆节日风格，金色描边，祥云点缀', neon: '霓虹发光描边，深色半透明，科技感' }[style];
      const finEn = { glossy: 'glossy cartoon 3D with white highlights', flat: 'flat solid color, no gradient, rounded strokes', blackgold: 'brushed champagne-gold metal, luxurious', festive: 'festive style with gold outline and auspicious clouds', neon: 'neon glowing outline, dark translucent, futuristic' }[style];
      const prompt = zh ? `主色${colorZh}（约 ${hex}），${sat > 0.5 ? '高饱和' : '低饱和'}${l > 0.6 ? '、明亮' : l < 0.35 ? '、偏暗' : ''}，${finZh}${white / (n + white) > 0.2 ? '，带白色高光/描边' : ''}；透明背景，单个图标居中，${where[0]}`
        : `Main color ${colorEn} (about ${hex}), ${sat > 0.5 ? 'high' : 'low'} saturation${l > 0.6 ? ', bright' : l < 0.35 ? ', dark' : ''}, ${finEn}; transparent background, single centered icon, ${where[1]}`;
      cb({ style, hex, prompt });
    };
    im.onerror = () => cb(null);
    setTimeout(() => { im.src = src; }, 900); // 模拟识别耗时
  }
  window.aiRefRead = refRead;
  window.aiPreset = presetOf;
  function refAnalyze(src) {
    const a = tbAi(); a.ref = src; a.analyzing = true; a.refSt = { uploading: true, pct: 60 }; a.stage = 'setup'; window.render();
    refRead(src, ['适合手机顶部栏小尺寸显示', 'readable at small size in a mobile top bar'], (res) => {
      if (!res) { a.analyzing = false; a.ref = null; a.refSt = null; window.toast(t('ed/bal-img-bad'), { info: true }); window.render(); return; }
      a.prompt = res.prompt; a.refHex = res.hex; a.refStyle = res.style; a.analyzing = false; a.refSt = { src, name: a.refName || '' }; a.fromRef = true; window.render();
    });
  }
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.matches) return;
    if (el.matches('[data-tbairef]') && el.files && el.files[0]) { const f = el.files[0]; el.value = ''; if (!window.imgOk(f)) { window.toast(t('mp/icon-bad'), { info: true }); return; } tbAi().refName = f.name; const r = new FileReader(); r.onload = () => refAnalyze(r.result); r.readAsDataURL(f); }
  });
  document.addEventListener('input', (e) => { const el = e.target; if (el.matches && el.matches('[data-tbaiprompt]')) { tbAi().prompt = el.value.slice(0, 300); const b = document.querySelector('.tbai .send'); if (b) b.classList.toggle('is-disabled', !el.value.trim()); } });
  A.tbAiGen = () => {
    const a = tbAi(), n = tbAiCost();
    if (a.analyzing || !(a.prompt || '').trim()) return false;
    if (!afford(n)) { topup(); return false; }
    a.stage = 'busy'; const st = a.fromRef ? a.refStyle || 'glossy' : a.style;
    setTimeout(() => { if (E.tbAi !== a || a.stage !== 'busy') return; if (fail()) { a.stage = 'setup'; window.toast(t('mp/ai-failed'), { info: true }); } else { pay(n, 'iconset', { type: t('mod/topbar') }); a.stage = 'done'; a.res = st; } window.render(); }, 1400);
  };
  A.tbAiUse = () => { const a = tbAi(), r = a.res, tg = tbAiTgt(); if (!r) return false; commit(() => { if (tg === 'side') { tbIconSet('side', 'img:' + SIDE_AI(r)); return; } if (tg !== 'cur') tbIconSet('search', AIT + 'search-' + r + '.png'); if (tg !== 'search') tbIconSet('cur', AIT + 'cur-' + r + '.png'); }); a.stage = 'setup'; window.toast(t('ed/tbai-used'), undoOpt()); };
  // 一键恢复搜索 + 币种默认图标（侧边栏入口图标单独在行里恢复）
  A.tbAiReset = () => { const o = E.D.tb.icons || {}; if (!o.cur && !o.search) return false; commit(() => { tbIconSet('cur', null); tbIconSet('search', null); }); window.toast(t('ed/tbai-reset'), undoOpt()); };
  // 入口图标行的 ✦ 按钮：在入口图标下方展开 AI 生成并选好目标（Waydon 2026-11-26）
  A.tbAiJump = (k) => { S.menu = null; const a = tbAi(); E.tab = 'content'; E.tbAiOpen = true; E.tbAiFocus = '.tbai'; if (a.stage === 'busy') return; if (k === 'cur' || k === 'search' || k === 'side') a.target = k; if (a.stage === 'done') a.stage = 'setup'; };
  A.tbAiToggle = () => { E.tbAiOpen = !E.tbAiOpen; if (E.tbAiOpen) E.tbAiFocus = '.tbai'; };
  window.AFTER_RENDER.push(() => { const sel = E.tbAiFocus; if (!sel) return; E.tbAiFocus = false; const go = () => { const m = document.querySelector(typeof sel === 'string' ? sel : '.tbai'); if (!m) return; let c = m.parentElement; while (c && !(c.scrollHeight > c.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement; if (c) c.scrollTop += m.getBoundingClientRect().top - c.getBoundingClientRect().top - 8; m.classList.add('is-flash'); const ta = m.querySelector('textarea'); if (ta) ta.focus({ preventScroll: true }); }; setTimeout(go, 30); setTimeout(go, 320); });
  function tbAiSec() {
    const a = tbAi(), busy = a.stage === 'busy', n = tbAiCost(), o = E.D.tb.icons || {};
    const tg = tbAiTgt();
    const pair = (st) => (tg === 'side' ? `<img src="${SIDE_AI(st)}" alt="">` : `${tg !== 'cur' ? `<img src="${AIT}search-${st}.png" alt="">` : ''}${tg !== 'search' ? `<img src="${AIT}cur-${st}.png" alt="">` : ''}`);
    const target = segBtns([{ v: 'both', label: t('ed/tbai-t-both') }, { v: 'search', label: t('ed/tb-search') }, { v: 'cur', label: t('ed/tbai-t-cur') }].concat(E.D.tb.items.side ? [{ v: 'side', label: t('ed/tbai-t-side') }] : []), tg, 'tbAiTarget');
    const tiles = `<div class="tbai-opts">${TB_AI.map((v) => `<button class="tbai-opt ${!a.fromRef && a.style === v ? 'is-on' : ''}" data-act="tbAiStyle" data-arg="${v}" ${busy ? 'disabled' : ''}><span>${pair(v)}</span><small>${t('ed/tbai-' + v)}</small></button>`).join('')}</div>`;
    const logo = (window.MODEL_LOGO || {})[a.model] || '', mname = a.model === 'gemini' ? 'Gemini' : 'GPT Image';
    const mMenu = S.menu === 'tbai-model' ? `<div class="menu c-menu tbai-mmenu">${['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${a.model === m ? 'is-on' : ''}" data-act="tbAiModel" data-arg="${m}">${(window.MODEL_LOGO || {})[m] || ''}<span><div class="nm">${m === 'gemini' ? 'Gemini' : 'GPT Image'}</div><div class="ds">${m === 'gpt' ? 'Sunburst Flare' : 'Nano Banana Pro'}</div></span></button>`).join('')}</div>` : '';
    const empty = !(a.prompt || '').trim() || a.analyzing;
    const box = `<div class="c-box tbai-box"><div class="c-input">${window.refSlot(a.refSt, 'tbAiRef')}<textarea rows="4" maxlength="300" data-tbaiprompt placeholder="${esc(a.analyzing ? t('ed/tbai-analyzing') : t('ed/tbai-sprompt-ph'))}" ${busy || a.analyzing ? 'disabled' : ''}>${esc(a.analyzing ? '' : a.prompt || '')}</textarea></div>
      <div class="c-tools"><div class="c-opts"><div class="rel"><button class="c-opt ${S.menu === 'tbai-model' ? 'is-open' : ''}" data-act="menu:toggle" data-arg="tbai-model">${logo}<span class="ellipsis">${mname}</span>${ic('caret-down', 'chev')}</button>${mMenu}</div></div>
      ${busy ? `<button class="send is-disabled" disabled>${ic('spinner-gap', 'spin')}</button>` : `<button class="send ${empty ? 'is-disabled' : ''}" data-act="tbAiGen" title="${esc(t('ed/tbai-gen', { n }))}">${ic('sparkle-fill')}${n}${ic('arrow-up')}</button>`}</div></div>`;
    const note = a.fromRef && !a.analyzing ? `<div class="p-note">${ic('sparkle-fill', 'ic-16')}${t('ed/tbai-prompt-tip2')}</div>` : `<div class="p-note">${t('ed/tbai-box-tip')}</div>`;
    const res = a.stage === 'done' ? `<div class="tbai-res"><span class="pv">${pair(a.res)}</span><div class="r2"><button class="btn btn-primary btn-sm" data-act="tbAiUse">${ic('check', 'ic-16')}${t('ed/tbai-use')}</button><button class="btn btn-secondary btn-sm" data-act="tbAiGen">${ic('arrow-clockwise', 'ic-16')}${t('ed/tbai-again', { n })}</button></div></div>` : '';
    return `<div class="p-sec tbai"><div class="lab">${ic('sparkle-fill', 'ic-16 tbai-ic')}${t('ed/tbai-title2')}<span class="tbai-hd">${o.cur || o.search ? `<button class="tx-reset" data-act="tbAiReset">${ic('arrow-counter-clockwise', 'ic-16')}${t('tx/reset')}</button>` : ''}<button class="ib-s" data-act="tbAiToggle" title="${esc(t('ed/tbai-close'))}" aria-label="${esc(t('ed/tbai-close'))}">${ic('x', 'ic-16')}</button></span></div>
      <div class="tbai-row">${target}</div>${tiles}${box}${note}${res}</div>`;
  }
  // ---------- Logo AI 生成（原型：用调色滤镜模拟 4 个候选；正式版按提示词出图，品牌名 / 网址文字保持不变） ----------
  const LOGO_AI_F = ['saturate(1.3) contrast(1.05)', 'hue-rotate(-150deg) saturate(1.4)', 'sepia(.7) saturate(1.8) hue-rotate(-12deg) brightness(.95)', 'hue-rotate(95deg) saturate(1.3)', 'hue-rotate(160deg) saturate(1.2)', 'grayscale(1) contrast(1.4) brightness(.7)'];
  const tbLogoAi = () => (E.tbLogo = E.tbLogo || { prompt: t('ed/tblogo-def'), stage: 'setup', pick: 0, round: 0 });
  A.tbLogoAiOpen = () => { S.menu = null; E.tab = 'content'; tbLogoAi(); E.tbLogoOpen = true; E.tbAiFocus = '.tblogo'; };
  A.tbLogoAiClose = () => { E.tbLogoOpen = false; };
  A.tbLogoGen = () => {
    const a = tbLogoAi(); if (a.stage === 'busy' || !(a.prompt || '').trim()) return false;
    if (!afford(20)) { topup(); return false; }
    a.stage = 'busy';
    setTimeout(() => { if (E.tbLogo !== a || a.stage !== 'busy') return; if (fail(a.prompt)) { a.stage = a.cands ? 'done' : 'setup'; window.toast(t('mp/ai-failed'), { info: true }); } else { pay(20, 'iconset', { type: 'Logo' }); a.cands = [0, 1, 2, 3].map((i) => LOGO_AI_F[(a.round * 2 + i) % LOGO_AI_F.length]); a.round++; a.pick = 0; a.stage = 'done'; } window.render(); }, 1400);
  };
  A.tbLogoPick = (i) => { tbLogoAi().pick = +i; };
  A.tbLogoUse = () => { const a = tbLogoAi(); const f = a.cands && a.cands[a.pick]; if (!f) return false; commit(() => { E.D.tb.logoF = f; tbFitSet('logo', null); }); a.stage = 'setup'; a.cands = null; window.toast(t('ed/tblogo-used'), undoOpt()); };
  document.addEventListener('input', (e) => { const el = e.target; if (el.matches && el.matches('[data-tblogoprompt]')) { tbLogoAi().prompt = el.value.slice(0, 300); const b = document.querySelector('.tblogo .send'); if (b) b.classList.toggle('is-disabled', !el.value.trim()); } });
  function tbLogoSec() {
    const a = tbLogoAi(), busy = a.stage === 'busy', empty = !(a.prompt || '').trim();
    const box = `<div class="c-box tbai-box"><div class="c-input"><textarea rows="3" maxlength="300" data-tblogoprompt placeholder="${esc(t('ed/tblogo-ph'))}" ${busy ? 'disabled' : ''}>${esc(a.prompt || '')}</textarea></div>
      <div class="c-tools"><div class="c-opts"></div>${busy ? `<button class="send is-disabled" disabled>${ic('spinner-gap', 'spin')}</button>` : `<button class="send ${empty ? 'is-disabled' : ''}" data-act="tbLogoGen" title="${esc(t('ed/tbai-gen', { n: 20 }))}">${ic('sparkle-fill')}20${ic('arrow-up')}</button>`}</div></div>`;
    const res = a.stage === 'done' && a.cands ? `<div class="tblogo-cands">${a.cands.map((f, i) => `<button class="tblogo-c ${a.pick === i ? 'is-on' : ''}" data-act="tbLogoPick" data-arg="${i}"><img src="assets/classic/logo.png" alt="" style="filter:${f}"></button>`).join('')}</div>
      <div class="tbai-res"><div class="r2"><button class="btn btn-primary btn-sm" data-act="tbLogoUse">${ic('check', 'ic-16')}${t('ed/tbai-use')}</button><button class="btn btn-secondary btn-sm" data-act="tbLogoGen">${ic('arrow-clockwise', 'ic-16')}${t('ed/tbai-again', { n: 20 })}</button></div></div>` : '';
    return `<div class="tblogo"><div class="lab">${ic('sparkle-fill', 'ic-16 tbai-ic')}${t('ed/tblogo-title')}<span class="tbai-hd"><button class="ib-s" data-act="tbLogoAiClose" title="${esc(t('ed/tbai-close'))}" aria-label="${esc(t('ed/tbai-close'))}">${ic('x', 'ic-16')}</button></span></div>${box}${res}<div class="p-note">${t('ed/tblogo-note')}</div></div>`;
  }
  // 画布上点顶部栏图标：选中顶部栏 + 内容页签，电脑弹出菜单、手机出底部菜单（复用 assetMenuItems）
  A.tbIconMenu = (k) => {
    const prev = window.__prevMenu;
    if (E.sel !== 'topbar') { E.ai = null; E.picker = null; E.iconAi = null; E.keys = null; }
    E.sel = 'topbar'; E.tab = 'content'; E.h5side = false;
    if (mobileEd()) { E.mpanel = 'module'; S.menu = 'am:tb-' + k; } else S.menu = prev === 'tbic:' + k ? null : 'tbic:' + k;
  };
  A.tbSearchPos = (v) => { const f = v === 'left'; if (E.D.tb.searchFirst === f) return false; commit(() => { E.D.tb.searchFirst = f; }); };
  function tbContent() {
    // 顶部栏内容（Waydon 2026-11-26 排版优化）：预览状态 → Logo → 入口图标（AI 生成就在下面展开）→ 余额框 → 文字样式
    // 每行：缩略图（点一下上传）· 名称 / 规格 · ✦ AI · 恢复 · ⋯ · 眼睛
    const D = E.D, it = D.tb.items, tic = D.tb.icons || {}, th = liveTheme().th;
    const eye = (k) => `<button class="eye" data-act="tbItem" data-arg="${k}" title="${esc(t('ed/am-toggle'))}" aria-label="${esc(t('ed/am-toggle'))}">${ic(it[k] ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`;
    const thumb = (k, inner, cls = 'sq') => `<button class="thumb ${cls}" data-act="amUpload" data-arg="tb-${k}" title="${esc(t('ed/am-upload'))}" aria-label="${esc(t('ed/am-upload'))}">${inner}</button>`;
    const ib = (act, k, icn, tip, cls = '') => `<button class="ib-s ${cls}" data-act="${act}" data-arg="${k}" title="${esc(tip)}" aria-label="${esc(tip)}">${ic(icn, 'ic-16')}</button>`;
    const row = (k, th0, name, spec, own, ai) => `<div class="tb-item tb-row ${it[k] ? '' : 'is-hidden'}">${th0}<span class="tx"><b class="ellipsis">${name}</b><small class="ellipsis">${spec}${own ? ' · ' + t('ed/tb-own') : ''}</small></span>${ai ? ib(ai, k, 'sparkle-fill', t(k === 'logo' ? 'ed/tblogo-title' : 'mp/ai-one'), 'tb-ai') : ''}${own ? ib('amReset', 'tb-' + k, 'arrow-counter-clockwise', t('ed/am-reset')) : ''}${moreBtn('tb-' + k)}${eye(k)}</div>`;
    const ups = (ks) => ks.map((k) => uploadUI('tb-' + k)).join('');
    const logoRow = row('logo', thumb('logo', tbImgTag(D.tb.logoF, 'assets/classic/logo.png', '', '', 'logo'), 'logo'), 'Logo', '230×76', tbImg(D.tb.logoF, '').own, 'tbLogoAiOpen');
    const curDef = `<span class="cur-ic" style="background:${th.accent_3};-webkit-mask-image:url(${CLA}bal-sym.png);mask-image:url(${CLA}bal-sym.png)"></span>`;
    const curRow = row('cur', thumb('cur', tic.cur ? tbImgTag(tic.cur, CLA + 'bal-sym.png', '', '', 'cur') : curDef), t('ed/tb-cur'), '36×36', !!tic.cur, 'tbAiJump');
    const searchRow = row('search', thumb('search', tbImgTag(tic.search, 'assets/classic/search.png', '', '', 'search')), t('ed/tb-search'), '56×49', !!tic.search, 'tbAiJump');
    const sideRow = row('side', thumb('side', sideIcHtml(tic.side, '')), t('ed/tb-sideicon'), '48×48', !!tic.side, 'tbAiJump');
    // 侧边栏入口的眼睛 = 隐藏侧边栏模块（与左栏同步）；整个去掉要用左栏 / 画布的删除
    const sideRowX = D.hidden.sidebar ? sideRow.replace('<div class="tb-item tb-row ', '<div class="tb-item tb-row is-hidden ').replace('eye-fill', 'eye-slash-fill') : sideRow;
    const balRow = `<div class="tb-item ${it.auth ? '' : 'is-hidden'}"><span class="thumb sq">${ic('wallet-fill')}</span><span class="tx"><b class="ellipsis">${t('ed/tb-balance')}</b><small class="ellipsis">${t('ed/tb-bal-sub')}</small></span>${eye('auth')}</div>`;
    const seg = (lab, opts, cur, act) => `<div class="tb-item tb-pos"><span class="tx"><b class="ellipsis">${t(lab)}</b></span><div class="iseg">${opts.map(([v, l]) => `<button class="${cur === v ? 'is-on' : ''}" data-act="${act}" data-arg="${v}">${t(l)}</button>`).join('')}</div></div>`;
    const searchPos = it.search ? seg('ed/tb-search-pos', [['left', 'ed/side-left'], ['right', 'ed/side-right']], D.tb.searchFirst ? 'left' : 'right', 'tbSearchPos') : '';
    const sidePos = it.side ? seg('ed/tb-side-pos', [['left', 'ed/side-left'], ['right', 'ed/side-right']], D.side, 'setSide') : '';
    // 功能排列：拖动调整 Logo / 币种切换 / 搜索 在顶部栏里的左右顺序（入口图标本身不能拖）
    const arrName = { logo: 'Logo', cur: t(D.login ? 'ed/tb-balance' : 'ed/tb-cur'), search: t('ed/tb-search') };
    const arrIc = { logo: 'image-fill', cur: 'wallet-fill', search: 'magnifying-glass' };
    const arrange = `<div class="p-sec"><div class="lab">${t('ed/tb-arrange')}</div><div class="tb-group tb-arr" data-drag-list="tborder">${tbOrder().map((k, i) => `<div class="tb-item tb-arr-it ${it[k === 'cur' ? (D.login ? 'auth' : 'cur') : k] ? '' : 'is-hidden'}" data-row="${i}"><span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span><span class="n">${i + 1}</span>${ic(PH_OK(arrIc[k]), 'ic-16')}<span class="tx"><b class="ellipsis">${arrName[k]}</b></span></div>`).join('')}</div><div class="p-note">${t('ed/tb-arrange-note')}</div></div>`;
    const aiEntry = E.tbAiOpen ? '' : `<button class="btn btn-secondary btn-sm tbai-open" data-act="tbAiToggle">${ic('sparkle-fill', 'ic-16')}${t('ed/tbai-open')}</button>`;
    return `<div class="p-sec"><div class="lab">${t('ed/tb-state2')}</div>${segBtns([{ v: 'out', label: t('ed/signed-out') }, { v: 'in', label: t('ed/signed-in') }], D.login ? 'in' : 'out', 'setLogin')}<div class="p-note">${ic('info-fill', 'ic-16')}${t(D.login ? 'ed/tb-note-in' : 'ed/tb-note-out')}</div></div>
      ${arrange}
      <div class="p-sec"><div class="lab">${t('ed/tb-logo')}</div><div class="tb-group">${logoRow}</div>${ups(['logo'])}${E.tbLogoOpen ? tbLogoSec() : ''}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-entries')}</div><div class="tb-group">${D.login ? balRow : curRow}${searchRow}${it.side ? sideRowX.replace('data-act="tbItem" data-arg="side"', 'data-act="toggleHide" data-arg="sidebar"') + sidePos : ''}</div>${ups(it.side ? ['cur', 'search', 'side'] : ['cur', 'search'])}${aiEntry}</div>
      ${E.tbAiOpen ? tbAiSec() : ''}${D.login && it.auth ? balSec() : ''}`;
  }
  function tbLayout() {
    const tb = E.D.tb;
    const sec = (k, lab) => `<div class="p-sec"><div class="lab">${t(lab)}<span class="v">${tb[k]} px</span></div>${pxSeg(TB[k], tb[k], 'tbLayout_' + k, null, { h: [70, 100, 'px'], pad: [0, 80, 'px'], gap: [0, 64, 'px'] }[k])}</div>`;
    return sec('h', 'ed/tb-height') + sec('pad', 'ed/tb-padding') + sec('gap', 'ed/tb-gap') + `<div class="p-note">${t('ed/tb-h-note')}</div>`;
  }
  function tbColor() {
    // 颜色都绑 68 Key（Figma 317:55664）：底板 bs_topnav_bg、搜索文字 lead（Waydon 决定，Figma 为 neutral_1）、币种文字 neutral_2、
    // 币种外框 / 底部分割线 border、币种图标 accent_3、侧边栏入口 lead。文字颜色和「内容 › 文字样式」是同一个设置
    const { th, tb } = liveTheme(), raw = E.D.tb.colors || {}, D = E.D;
    const kk = (k) => (E.adv ? `<small class="kk">${k}</small>` : '');
    const row = (k, lab) => {
      const v = raw[k] || null, pk = E.picker && E.picker.tbRow === k;
      return `<div class="crow"><div class="k">${t(lab)}${kk(TB_KEY[k])}</div><div class="tx-colors"><button class="tx-auto ${v ? '' : 'is-on'}" data-act="tbColor" data-arg="${k}|">${t('tx/c-auto')}</button>${TB_SW[k].map((key) => `<button class="sw-btn ${v === 'key:' + key ? 'is-on' : ''}" style="background:${th[key]}" title="${esc(t('ed/key-' + key))}" aria-label="${esc(t('ed/key-' + key))}" data-act="tbColor" data-arg="${k}|key:${key}"></button>`).join('')}<button class="rainbow ${pk || (v && !v.startsWith('key:')) ? 'is-on' : ''}" data-act="pickTb" data-arg="${k}" title="${esc(t('tx/c-custom'))}" aria-label="${esc(t('tx/c-custom'))}"></button></div>${pk ? pickerHtml('in-panel', t(lab)) : ''}</div>`;
    };
    const txRow = (id, lab, key) => `<div class="crow"><div class="k">${t(lab)}${kk(key)}</div>${txColors(id)}</div>`;
    const link = (lab, key) => `<div class="crow tb-link"><div class="k">${t(lab)}${kk(key)}</div><div class="tb-link-r"><span class="sw-dot" style="background:${keyVal(key, th)}"></span><span class="ellipsis">${t('ed/tb-c-follow')}</span><button class="tb-goto" data-act="openKeys">${t('ed/tb-c-goto')}</button></div></div>`;
    return `<div class="p-sec">${row('bg', 'ed/tb-c-bg')}${D.tb.items.side ? row('side', 'ed/tb-c-side') : ''}${txRow('tb.search', 'tx/tb-search', 'lead')}${D.login ? '' : txRow('tb.cur', 'tx/tb-cur', 'neutral_2')}</div>
      <div class="p-sec"><div class="lab">${t('ed/tb-c-linked')}</div>${link('ed/tb-c-border', 'border')}${!D.login && !(D.tb.icons || {}).cur ? link('ed/tb-c-curic', 'accent_3') : ''}</div>
      <div class="p-note">${t('ed/tb-c-note2')}</div>${D.login && D.tb.items.auth ? `<div class="p-note">${t('ed/tb-c-bal')}</div>` : ''}
      <button class="p-note" style="align-items:center" data-act="toggleAdv"><span class="check ${E.adv ? 'is-on' : ''}">${E.adv ? ic('check', 'ic-16') : ''}</span>${t('ed/show-advanced')}</button>`;
  }
  // ---------- 文字样式（Waydon 2026-11-26：有文字的地方都能调字号 / 粗细 / 颜色） ----------
  // [元素 ID, 名称 key, 字号/粗细选择器, 颜色选择器(选中态不改色), 默认字号(CSS px，=750 稿÷2), 默认粗细, 最大字号(可省，默认 24)]
  const TXT = {
    // 顶部栏：币种文字 26/750=13（下拉箭头跟文字同色，Figma 都是 neutral_2）；搜索文字 22/750=11；余额金额只在已登录显示
    topbar: [['tb.cur', 'tx/tb-cur', '.h5-top .cur-cl b', '.h5-top .cur-cl', 13, 400], ['tb.search', 'tx/tb-search', '.h5-top .srch-cl small', '.h5-top .srch-cl', 11, 400], ['tb.bal', 'tx/tb-bal', '.h5-top .bx b', '.h5-top .bx b', 13, 400]],
    // 公告栏：正文 26/750=13（Figma 317:55675）；已登录信箱未读数 18/750=9，固定白字
    notice: [['notice.text', 'tx/notice-text', '.cl-notice .mq', '.cl-notice .mq', 13, 400], ['notice.badgeTx', 'tx/notice-badge', '.cl-notice .mail .bd', '.cl-notice .mail .bd', 9, 700]],
    // 帐户栏（Figma 317:55705）：入口名 22/750=11 neutral_1；登录 / 注册 24=12（颜色 primary / text_primary）；用户名 22=11 lead；
    // 问候语 11 neutral_2；余额金额 26=13 Bold（只改帐户栏里的余额框，顶部栏余额在顶部栏里改）；入口角标 18=9 白字
    midnav: [['midnav.name', 'tx/midnav-name', '.cl-ent .it .nm', '.cl-ent .it .nm', 11, 400], ['midnav.btn', 'tx/midnav-login', '.cl-user.out .lg', '.cl-user.out .lg', 12, 400], ['midnav.reg', 'tx/midnav-reg', '.cl-user.out .rg', '.cl-user.out .rg', 12, 400],
      ['midnav.user', 'tx/midnav-user', '.bxu b', '.bxu b', 11, 400], ['midnav.greet', 'tx/midnav-greet', '.bxu .greet', '.bxu .greet', 11, 400], ['midnav.bal', 'tx/midnav-bal', '.cl-user .bx b', '.cl-user .bx b', 13, 700], ['midnav.badge', 'tx/midnav-badge', '.cl-ent .ib .bd', '.cl-ent .ib .bd', 9, 400, 14]],
    // 游戏菜单（Figma 317:55796）：竖排分类名 26/750=13 Regular，未选中 leftnav_def、选中 leftnav_active；横向标签 / 图标分类 11
    gamemenu: [['gamemenu.name', 'tx/gamemenu-name', '.cl-gm > span:not(.on) b', '.cl-gm > span:not(.on) b', 13, 400], ['gamemenu.nameOn', 'tx/gamemenu-on', '.cl-gm > span.on b', '.cl-gm > span.on b', 13, 400],
      ['gamemenu.tab', 'tx/gamemenu-name', '.h5-gm > span:not(.on)', '.h5-gm > span:not(.on)', 11, 400], ['gamemenu.tabOn', 'tx/gamemenu-on', '.h5-gm > span.on', '.h5-gm > span.on', 11, 400]],
    // 游戏卡片（Figma 317:55739）：页签 26/750=13（选中跟 primary 不改色）；游戏名称 22=11（cards_text）；「另有 N 款游戏 展开」26=13（展开跟 primary）；
    // 分类标题 30=15 lead、「全部」24=12 neutral_2
    gamecards: [['gamecards.tab', 'tx/gamecards-tab', '.cl-gc .tabs span', '.cl-gc .tabs span:not(.on)', 13, 400], ['gamecards.name', 'tx/gamecards-name', '.cl-gc .nm', '.cl-gc .nm', 11, 400], ['gamecards.more', 'tx/gamecards-more', '.cl-gc .more', '.cl-gc .more', 13, 400],
      ['gamecards.title', 'tx/gamecards-title', '.cl-gc .hd b', '.cl-gc .hd b', 15, 400], ['gamecards.all', 'tx/gamecards-all', '.cl-gc .hd small', '.cl-gc .hd small', 12, 400]],
    // 底部导航（Figma 317:55538）：导航文字 h5/body2/regular 24/750=12，未选中 btmnav_def、选中 btmnav_active（颜色跟颜色页签同源）
    bottomnav: [['bottomnav.name', 'tx/bottomnav-name', '.h5-bnav .it:not(.on) .lb', '.h5-bnav .it:not(.on) .lb', 12, 400], ['bottomnav.nameOn', 'tx/bottomnav-on', '.h5-bnav .it.on .lb', '.h5-bnav .it.on .lb', 12, 400]],
  };
  const TX_ALL = Object.values(TXT).flat();
  const TX_W = [400, 500, 700];
  // 文字颜色与模块「颜色」页签共用同一个值的元素：颜色存在 E.D.ec[id]（可是 'key:<名>'），不再另存一份
  // 值 = E.D.ec 里的元素 ID（帐户栏入口名颜色 = 颜色页签的「入口文字」midnav.text；注册文字 = midnav.btnText）
  const TX_EC = { 'notice.text': 'notice.text', 'midnav.name': 'midnav.text', 'midnav.user': 'midnav.user', 'midnav.reg': 'midnav.btnText',
    'gamemenu.name': 'gamemenu.text', 'gamemenu.nameOn': 'gamemenu.activeText', 'gamemenu.tab': 'gamemenu.text', 'gamemenu.tabOn': 'gamemenu.activeText',
    'gamecards.tab': 'gamecards.tab', 'gamecards.name': 'gamecards.text', 'bottomnav.name': 'bottomnav.def', 'bottomnav.nameOn': 'bottomnav.active' };
  const txOf = (id) => {
    const o = ((E.D.txt || {})[id]) || {};
    if (!TX_EC[id]) return o;
    const v = (E.D.ec || {})[TX_EC[id]]; if (!v) return o;
    const c = v.startsWith('key:') ? (keyVal(v.slice(4), liveTheme().th) || '') : v;
    return Object.assign({}, o, c ? { c } : {});
  };
  function txtCss() {
    const T = E.D.txt || {}; let css = '';
    for (const [id, , sel, csel] of TX_ALL) {
      const v = T[id]; if (!v) continue;
      const scope = (q) => q.split(',').map((x) => '.h5 ' + x.trim()).join(',');
      if (v.s || v.w) css += `${scope(sel)}{${v.s ? `font-size:${v.s}px;` : ''}${v.w ? `font-weight:${v.w};` : ''}}`;
      if (v.c && !TX_EC[id]) css += `${scope(csel)}{color:${v.c}}`;
    }
    return css ? `<style>${css}</style>` : '';
  }
  // 只在对应状态下出现的文字（顶部栏：未登录才有币种，已登录且显示余额框才有金额）
  const TXT_WHEN = { 'tb.cur': () => !E.D.login, 'tb.bal': () => E.D.login && E.D.tb.items.auth, 'notice.badgeTx': () => E.D.login && E.D.m.notice && E.D.m.notice.mail,
    // 帐户栏：未登录只有登录 / 注册按钮，已登录才有用户名、余额、角标；单行（无帐户区）两边都没有
    'midnav.btn': () => mnAcct() && !E.D.login, 'midnav.reg': () => mnAcct() && !E.D.login, 'midnav.user': () => mnAcct() && E.D.login, 'midnav.bal': () => mnAcct() && E.D.login,
    'midnav.greet': () => mnAcct() && E.D.login && balCfg().head === 'greet', 'midnav.badge': () => E.D.login && E.D.m.midnav.items.some((x) => x.on && x.badge),
    // 游戏菜单：竖排和横向两套字号，只显示当前样式那一套
    'gamemenu.name': () => gmSide(), 'gamemenu.nameOn': () => gmSide(), 'gamemenu.tab': () => !gmSide(), 'gamemenu.tabOn': () => !gmSide(),
    // 游戏卡片：关掉名称 / 分类标题后对应文字样式不显示
    'gamecards.name': () => !!(E.D.m.gamecards && E.D.m.gamecards.name), 'gamecards.title': () => !!(E.D.m.gamecards && E.D.m.gamecards.title !== false), 'gamecards.all': () => !!(E.D.m.gamecards && E.D.m.gamecards.title !== false) };
  const gmSide = () => !!(E.D.m && E.D.m.gamemenu && E.D.m.gamemenu.style === 'side');
  const mnAcct = () => !!(E.D.m && E.D.m.midnav && E.D.m.midnav.layout === 'account');
  const txSw = () => { const th = liveTheme().th; return [th.lead, th.neutral_1, th.neutral_2, th.primary, th.accent_2, th.accent_3, '#ffffff'].map((c) => c.toLowerCase()).filter((c, i, a) => a.indexOf(c) === i); };
  // 文字颜色一行（文字样式和顶部栏「颜色」页签共用，改的是同一个值）
  function txColors(id) {
    const sw = txSw(), c = (txOf(id).c || '').toLowerCase();
    return `<div class="tx-colors"><button class="tx-auto ${c ? '' : 'is-on'}" data-act="txColor" data-arg="${id}|" title="${esc(t('tx/c-auto'))}">${t('tx/c-auto')}</button>${sw.map((x) => `<button class="sw-btn ${c === x ? 'is-on' : ''}" style="background:${x}" data-act="txColor" data-arg="${id}|${x}"></button>`).join('')}<label class="rainbow tx-custom ${c && !sw.includes(c) ? 'is-on' : ''}" title="${esc(t('tx/c-custom'))}"><input type="color" data-txcolor="${id}" value="${c || '#333333'}"></label></div>`;
  }
  function txtSec(b) {
    const els = (TXT[b] || []).filter(([id]) => !TXT_WHEN[id] || TXT_WHEN[id]()); if (!els.length) return '';
    const rows = els.map(([id, k, , , ds, dw, mx = 24]) => {
      const v = txOf(id), size = v.s || ds, w = v.w || dw;
      const changed = v.s || v.w || v.c;
      return `<div class="tx-row"><div class="tx-hd"><b>${t(k)}</b>${changed ? `<button class="tx-reset" data-act="txReset" data-arg="${id}">${ic('arrow-counter-clockwise', 'ic-16')}${t('tx/reset')}</button>` : ''}</div>
        <div class="tx-bar"><span class="tx-size"><button data-act="txSize" data-arg="${id}|-1" ${size <= 8 ? 'disabled' : ''} aria-label="-">${ic('minus', 'ic-16')}</button><em title="${esc(t('tx/size-tip', { n: size * 2 }))}">${size * 2}</em><button data-act="txSize" data-arg="${id}|1" ${size >= mx ? 'disabled' : ''} aria-label="+">${ic('plus', 'ic-16')}</button></span>
        <span class="tx-w">${TX_W.map((x) => `<button class="${w === x ? 'is-on' : ''}" style="font-weight:${x}" data-act="txWeight" data-arg="${id}|${x}">${t('tx/w-' + x)}</button>`).join('')}</span></div>
        ${txColors(id)}</div>`;
    }).join('');
    return `<div class="p-sec tx-sec"><div class="lab">${t('tx/title')}</div>${rows}<div class="p-note">${t('tx/note')}</div></div>`;
  }
  const txSet = (id, k, v) => {
    if (TX_EC[id] && k === 'c') {
      // 选到的色块正好是某个基础 Key 就存 Key 引用（颜色页签能对上同一个色块）；等于默认 Key 就回到「默认」
      const th = liveTheme().th, key = v && KEYS.find((x) => String(th[x]).toLowerCase() === v.toLowerCase());
      const eid = TX_EC[id], def = ((window.MP.EL[eid.split('.')[0]] || []).find((r) => r[0] === eid) || [])[1];
      const val = !v || key === def ? null : key ? 'key:' + key : v;
      commit(() => { E.D.ec = E.D.ec || {}; if (val) E.D.ec[eid] = val; else delete E.D.ec[eid]; }); return;
    }
    commit(() => { E.D.txt = E.D.txt || {}; const o = Object.assign({}, E.D.txt[id]); if (v == null || v === '') delete o[k]; else o[k] = v; if (Object.keys(o).length) E.D.txt[id] = o; else delete E.D.txt[id]; }); };
  const txDef = (id) => TX_ALL.find((x) => x[0] === id);
  A.txSize = (arg) => { const [id, d] = arg.split('|'); const df = txDef(id); if (!df) return false; const cur = txOf(id).s || df[4]; const n = Math.max(8, Math.min(df[6] || 24, cur + (+d))); txSet(id, 's', n === df[4] ? null : n); };
  A.txWeight = (arg) => { const [id, w] = arg.split('|'); const df = txDef(id); if (!df) return false; txSet(id, 'w', +w === df[5] ? null : +w); };
  A.txColor = (arg) => { const i = arg.indexOf('|'); txSet(arg.slice(0, i), 'c', arg.slice(i + 1) || null); };
  A.txReset = (id) => { commit(() => { if (E.D.txt) delete E.D.txt[id]; if (TX_EC[id] && E.D.ec) delete E.D.ec[TX_EC[id]]; }); };
  document.addEventListener('change', (e) => { const el = e.target; if (el.matches && el.matches('[data-txcolor]') && /^#[0-9a-f]{6}$/i.test(el.value)) { txSet(el.dataset.txcolor, 'c', el.value.toLowerCase()); window.render(); } });
  // 布局「恢复默认」（Waydon 2026-11-26）：只恢复布局页签里的参数，内容和颜色不动
  const LAYOUT_KEYS = { banner: ['size', 'margin', 'corner'], topbar: ['h', 'pad', 'gap'], notice: ['speed'], jackpot: ['layout', 'margin', 'corner'], midnav: ['layout', 'per', 'size'], gamemenu: ['style', 'shape'], gamecards: ['cols', 'corner', 'gap'], footer: ['align'], sidebar: ['style', 'width'], bottomnav: ['style', 'h'] };
  const layoutObj = (D, b) => (b === 'banner' ? D.banner : b === 'topbar' ? D.tb : (D.m || {})[b]);
  function layoutDirty(b) {
    const ks = LAYOUT_KEYS[b]; if (!ks) return false;
    const cur = layoutObj(E.D, b), def = layoutObj(defaultDesign(E.D.template), b);
    return !!(cur && def) && ks.some((k) => String(cur[k]) !== String(def[k]));
  }
  function layoutResetBtn(b) {
    if (!LAYOUT_KEYS[b]) return '';
    const dirty = layoutDirty(b);
    return `<button class="btn btn-secondary btn-sm btn-block layout-reset" data-act="layoutReset" data-arg="${b}" ${dirty ? '' : 'disabled'}>${ic('arrow-counter-clockwise', 'ic-16')}${t(dirty ? 'ed/layout-reset' : 'ed/layout-is-default')}</button>`;
  }
  // 颜色「恢复默认」（壳层整理）：清掉这个模块的元素颜色（E.D.ec['<模块>.*']，含与文字样式共用的文字颜色）；
  // 顶部栏另有 tb.colors 和文字样式里的颜色。全站基础色 / 68 Key 不动
  function colorDirty(b) {
    const ec = E.D.ec || {};
    if (Object.keys(ec).some((k) => k.startsWith(b + '.'))) return true;
    if (b === 'topbar') { const tx = E.D.txt || {}; return Object.values(E.D.tb.colors || {}).some(Boolean) || (TXT.topbar || []).some(([id]) => tx[id] && tx[id].c); }
    return false;
  }
  function colorResetBtn(b) {
    const dirty = colorDirty(b);
    return `<button class="btn btn-secondary btn-sm btn-block layout-reset" data-act="colorReset" data-arg="${b}" ${dirty ? '' : 'disabled'}>${ic('arrow-counter-clockwise', 'ic-16')}${t(dirty ? 'ed/color-reset' : 'ed/color-is-default')}</button>`;
  }
  A.colorReset = (b) => {
    if (!colorDirty(b)) return false;
    E.picker = null;
    commit(() => {
      const ec = E.D.ec || {}; Object.keys(ec).forEach((k) => { if (k.startsWith(b + '.')) delete ec[k]; });
      if (b === 'topbar') { E.D.tb.colors = { bg: null, side: null }; const tx = E.D.txt || {}; (TXT.topbar || []).forEach(([id]) => { if (tx[id]) { delete tx[id].c; if (!Object.keys(tx[id]).length) delete tx[id]; } }); }
    });
    window.toast(t('ed/color-reset-done'), undoOpt());
  };
  A.layoutReset = (b) => {
    if (!layoutDirty(b)) return false;
    const def = layoutObj(defaultDesign(E.D.template), b);
    commit(() => { const cur = layoutObj(E.D, b); LAYOUT_KEYS[b].forEach((k) => { cur[k] = def[k]; }); });
    window.toast(t('ed/layout-reset-done'), undoOpt());
  };
  function modulePanel(id) {
    const b = baseName(id);
    if (b === 'banner' && E.ai) return aiPanel();
    if (E.iconAi && E.iconAi.b === b) return window.MP.aiPanel();
    // AD-04：侧边栏在电脑画布上没有浮动工具条，「AI 重新生成」放在面板标题右侧（测试修复）
    const adBtn = b === 'sidebar' && window.AD && !mobileEd() ?`<span style="flex:1"></span>${window.AD.toolBtn(id, true)}` : '';
    // 电脑：标题左边「‹」回到整页设置，标题下一行说明这个模块是什么（手机底部面板用右上角关闭返回，不加）
    const back = mobileEd() ? '' : `<button class="ibtn ibtn-sm p-back" data-act="selMod" data-arg="" title="${esc(t('ed/back-page'))}" aria-label="${esc(t('ed/back-page'))}">${ic('caret-left')}</button>`;
    const head = `<h2 class="p-title">${back}<span class="ellipsis">${esc(modName(id))}</span>${adBtn}</h2>${mobileEd() || !window.I18N['ed/desc-' + b] ? '' : `<p class="p-sub">${t('ed/desc-' + b)}</p>`}`;
    const pcN = window.PC && window.PC.panelNote ? window.PC.panelNote(id) : '';
    // 每个模块页签含义一致：内容（文字 / 图片 / 入口 + 文字样式）· 布局（尺寸间距 + 恢复默认布局）· 颜色（元素颜色 + 恢复默认颜色）
    if (b === 'banner') return head + tabs3(E.tab) + (E.tab === 'content' ? bannerContent() : E.tab === 'layout' ? bannerLayout() + layoutResetBtn(b) : bannerColor() + colorResetBtn(b));
    if (b === 'topbar') return head + tabs3(E.tab) + (E.tab === 'content' ? tbContent() + txtSec(b) : E.tab === 'layout' ? tbLayout() + layoutResetBtn(b) : tbColor() + colorResetBtn(b));
    if (window.MP.has(b)) return head + pcN + tabs3(E.tab) + window.MP.panel(b, E.tab) + (E.tab === 'content' ? (b === 'notice' || b === 'midnav' || b === 'gamemenu' || b === 'gamecards' || b === 'bottomnav' ? '' : txtSec(b)) : E.tab === 'layout' ? layoutResetBtn(b) : colorResetBtn(b));
    return head + window.empty('wrench-fill', t('ed/todo-title'), t('ed/todo-desc'));
  }
  // 模块颜色页签里「去修改」打开 68 Key：电脑上也要换成 Key 面板（‹ 返回回到原模块）
  function rightPanel() { if (E.adp && !E.sel && window.AD) return window.AD.edPanel(); if (E.keys && E.sel && !mobileEd()) return pageSettings(); return E.sel ? modulePanel(E.sel) : pageSettings(); }

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
      <div class="caption faint" style="margin-bottom:10px">${t(p.tbRow ? 'ed/pick-sync-tb' : p.elRow && !p.elRow.startsWith('key:') ? 'ed/pick-sync-el' : 'ed/pick-sync')}</div>
      <div class="pk-foot"><button class="btn btn-secondary btn-sm" data-act="pkCancel">${t('confirm/cancel')}</button><button class="btn btn-primary btn-sm" data-act="pkApply">${t('ed/pick-apply')}</button></div></div>`;
  }
  A.pick = (arg) => { const [k, where] = arg.split('|'); const v = E.D.theme[k]; E.picker = { key: k, orig: v, value: v, where: mobileEd() ? 'sheet' : where }; S.menu = null; if (mobileEd()) { E.picker.back = ['colors', 'module'].includes(E.mpanel) ? E.mpanel : null; E.mpanel = 'picker'; } };
  A.pickTb = (k) => { if (E.picker && E.picker.tbRow === k) { E.picker = null; return; } E.picker = null; const { th, tb } = liveTheme(); const cur = tb[k] || keyVal(TB_KEY[k] || 'lead', th) || '#ffffff'; E.picker = { key: k, tbRow: k, orig: cur, value: cur, where: 'tb' }; };
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
    const label = p.elRow ? t('mp/c-' + p.elRow.replace('.', '-')) : p.tbRow ? t({ bg: 'ed/tb-c-bg', side: 'ed/tb-c-side', text: 'ed/tb-c-text', search: 'ed/tb-c-search', reg: 'ed/tb-c-reg' }[p.tbRow] || 'ed/tb-c-bg') : t('ed/key-' + p.key);
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
          if (key === 'tborder') E.D.tb.order = tbOrder().slice();
          const arr = key === 'banner' ? E.D.banner.slides : key === 'tborder' ? E.D.tb.order : E.D.m[key].items; const from = +id; const it = arr.splice(from, 1)[0]; let i = +target.id; if (i > from) i--; if (!target.before) i++; arr.splice(i, 0, it);
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
  // 电脑快捷键（Waydon 2026-11-26）：Ctrl/⌘+Z 回退、Ctrl/⌘+Shift+Z 或 Ctrl+Y 重做、↑/↓ 移动选中模块、Ctrl/⌘+C 复制选中模块
  document.addEventListener('keydown', (e) => {
    if (S.route !== 'editor' || mobileEd() || E.loading || S.dialog || S.sheet) return;
    const tg = e.target; if (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(); let r;
    if (mod && k === 'z') r = e.shiftKey ? A.redo() : A.undo();
    else if (mod && k === 'y') r = A.redo();
    else if (mod && k === 'c') { if (!E.sel || !MODS[baseName(E.sel)] || MODS[baseName(E.sel)].fixed || !E.D.order.includes(E.sel) || (window.getSelection && String(window.getSelection()))) return; r = A.modDup(E.sel); }
    else if (!mod && !e.altKey && (k === 'arrowup' || k === 'arrowdown')) { if (!E.sel || !E.D.order.includes(E.sel)) return; r = A.move(k === 'arrowup' ? -1 : 1); }
    else return;
    e.preventDefault(); if (r !== false) window.render();
  });
  A.move = (d) => { const id = E.sel; const o = E.D.order; const i = o.indexOf(id), j = i + +d; if (i < 0 || j < 0 || j >= o.length) return false; commit(() => { E.D.order.splice(i, 1); E.D.order.splice(j, 0, id); }); window.toast(t(+d < 0 ? 'ed/moved-up' : 'ed/moved-down')); };
  A.modDup = (id) => { commit(() => { const b = baseName(id); let n = 1, nid = b + '~' + n; while (E.D.order.includes(nid)) nid = b + '~' + ++n; E.D.order.splice(E.D.order.indexOf(id) + 1, 0, nid); E.sel = nid; }); S.menu = null; window.toast(t('ed/dup-toast'), undoOpt()); };
  A.modReset = (id) => {
    commit(() => { const d = defaultDesign(E.D.template); const b = baseName(id); if (b === 'topbar') E.D.tb = d.tb; if (b === 'banner') E.D.banner = d.banner; if (d.m[b]) E.D.m[b] = d.m[b]; window.MP.resetColors(b); E.D.hidden[id] = false; });
    fixSlide(); S.menu = null; window.toast(t('ed/reset-toast'), undoOpt());
  };
  // 删除：页面里的流式模块真正移除（可撤销、可从「添加模块」加回来）；顶部栏 / 底部导航 / 侧边栏是固定模块，只能隐藏
  A.modDel = (id) => {
    const inFlow = E.D.order.includes(id);
    // 侧边栏删掉 = 顶部栏一起去掉侧边栏入口（之后可在「添加模块」里再加回来）
    commit(() => { if (inFlow) E.D.order = E.D.order.filter((x) => x !== id); else if (id === 'sidebar') { E.D.tb.items.side = false; E.D.hidden.sidebar = false; E.h5side = false; } else E.D.hidden[id] = true; });
    if (E.sel === id) E.sel = null; S.menu = null; if (E.mpanel === 'module') E.mpanel = null;
    window.toast(t(inFlow || id === 'sidebar' ? 'ed/deleted-toast' : 'ed/hidden-toast', { m: modName(id), name: modName(id) }), undoOpt());
  };
  const ADDABLE = ['banner', 'notice', 'midnav', 'gamemenu', 'gamecards']; // 经典蓝白没有彩金池 / 页脚
  A.addMod = (b) => {
    if (b === 'sidebar') {
      commit(() => { E.D.tb.items.side = true; E.D.hidden.sidebar = false; });
      S.menu = null; E.tab = 'content'; E.ai = null; E.picker = null; E.keys = null;
      if (mobileEd()) { E.mpanel = 'modules'; E.sel = null; } else { E.sel = 'sidebar'; E.h5side = true; }
      window.toast(t('ed/added-toast', { m: modName('sidebar') }), undoOpt()); return;
    }
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
    // 侧边栏（Waydon 2026-11-26）：版式没有侧边栏入口时，要先在这里添加，顶部栏才出现侧边栏入口
    const list = ADDABLE.concat(E.D.tb.items.side ? [] : ['sidebar']);
    return `<div class="add-hd"><div class="t">${t('ed/add-title')}</div><div class="caption faint">${t('ed/add-hint')}</div></div><div class="add-grid">${list.map((b) => {
      const ico = { notice: 'bell-fill', banner: 'image-fill', jackpot: 'sparkle-fill', midnav: 'list', gamemenu: 'squares-four', gamecards: 'squares-four-fill', footer: 'file-image', sidebar: 'sidebar-simple' }[b];
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
    ['jackpot.bg', 'gamecards.fallback', 'gamecards.starOff', 'gamecards.starSel', 'sidebar.head'].forEach((p) => { const [b, f] = p.split('.'); if (D.m[b][f]) assets++; });
    if (D.tb.logoF !== 'none') assets++;
    // 换过的入口图标 + 改过的入口名 / 页脚链接名（名字不在默认名单里即算改过）
    const d0 = window.MP ? window.MP.defaults() : null;
    let icons = 0; ['midnav', 'bottomnav', 'gamemenu', 'sidebar', 'footer'].forEach((b) => { const dn = d0 && d0[b] ? d0[b].items.map((x) => x.n) : []; D.m[b].items.forEach((it) => { if (it.img || it.imgOn || it.imgOut || (it.n && (it.k || (d0 && !dn.includes(it.n))))) icons++; }); });
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
      ['jackpot.bg', 'gamecards.fallback', 'gamecards.starOff', 'gamecards.starSel', 'sidebar.head'].forEach((p) => { const [b, f] = p.split('.'); if (D0.m[b][f]) nd.m[b][f] = D0.m[b][f]; });
      ['midnav', 'bottomnav', 'gamemenu', 'sidebar', 'footer'].forEach((b) => D0.m[b].items.forEach((it, i) => { const t2 = nd.m[b].items[i]; if (!t2) return; ['img', 'imgOn', 'imgOut', 'nOut'].forEach((f) => { if (it[f]) t2[f] = it[f]; }); if (it.n && (it.k || it.n !== t2.n)) t2.n = it.n; }));
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
  // 新加的图先用模板默认图（不再偏色）
  A.addSlide = () => { const sz = BANNER[E.D.banner.size]; commit(() => { E.D.banner.slides.push({ f: tplOf(E.D.template).slides[0] || 'none', w: sz.w, h: sz.h }); }); setSlide(E.D.banner.slides.length - 1); };
  A.tbItem = (k) => { commit(() => { E.D.tb.items[k] = !E.D.tb.items[k]; }); };
  // 顶部栏颜色：c 为空 = 恢复默认（跟绑定的 Key）；'key:<名>' = 跟整页配色的某个 Key
  A.tbColor = (arg) => { const i = arg.indexOf('|'), k = arg.slice(0, i), c = arg.slice(i + 1) || null; E.picker = null; if ((E.D.tb.colors[k] || null) === c) return; commit(() => { E.D.tb.colors = Object.assign({}, E.D.tb.colors, { [k]: c }); }); };
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
  const SLOT_SPEC = { 'mp-gamemenu-btnOff': [150, 70, 'mp/gm-btn-off'], 'mp-gamemenu-btnSel': [150, 70, 'mp/gm-btn-on'], 'mp-jackpot-bg': [702, 160, 'mp/jp-bg'], 'mp-gamecards-fallback': [260, 260, 'mp/gc-fallback'], 'mp-gamecards-starOff': [36, 36, 'mp/gc-star-off'], 'mp-gamecards-starSel': [36, 36, 'mp/gc-star-on'], 'mp-sidebar-head': [540, 200, 'mp/sd-head'], 'tb-logo': [230, 76, null], 'tb-cur': [36, 36, 'ed/tb-cur'], 'tb-search': [56, 49, 'ed/tb-search'], 'tb-side': [48, 48, 'ed/tb-sideicon'] };
  // 顶部栏图标槽：tb-cur / tb-search / tb-side 存在 E.D.tb.icons[k]（AI 图路径 / 'img:' 上传图 / 滤镜模拟值）
  const TB_ICON = /^tb-(cur|search|side)$/;
  function tbIconSet(k, v) { tbFitSet(k, null); const o = Object.assign({}, E.D.tb.icons); if (v) o[k] = v; else delete o[k]; if (Object.keys(o).length) E.D.tb.icons = o; else delete E.D.tb.icons; }
  function slotSpec(slot) { if (slot.startsWith('slide')) { const b = BANNER[E.D.banner.size]; return { w: b.w, h: b.h, name: 'Banner' }; } const s = SLOT_SPEC[slot] || [96, 96, null]; return { w: s[0], h: s[1], name: s[2] ? t(s[2]) : 'Logo' }; }
  function getAsset(slot) { if (slot.startsWith('mp-')) return window.MP.getAsset(slot); if (slot.startsWith('slide')) return Object.assign({}, E.D.banner.slides[+slot.slice(5)]); if (TB_ICON.test(slot)) return (E.D.tb.icons || {})[slot.slice(3)] || null; return E.D.tb.logoF; }
  function setAsset(slot, v) {
    if (slot.startsWith('mp-')) window.MP.setAsset(slot, v && typeof v === 'object' ? v.f : v);
    else if (slot.startsWith('slide')) { const i = +slot.slice(5); const prev = E.D.banner.slides[i] || {}; E.D.banner.slides[i] = v && typeof v === 'object' ? Object.assign({ hid: prev.hid }, v) : { f: v, w: prev.w, h: prev.h, hid: prev.hid }; }
    else if (slot === 'tb-logo') { E.D.tb.logoF = (v && typeof v === 'object' ? v.f : v) || 'none'; tbFitSet('logo', v); }
    else if (TB_ICON.test(slot)) { tbIconSet(slot.slice(3), v && typeof v === 'object' ? v.f : v); tbFitSet(slot.slice(3), v); }
  }
  A.toolReplace = () => { E.tab = 'content'; E.ai = null; S.menu = null; E.fpSlot = 'slide' + E.slide; E.dlg = 'fp'; };
  A.amUpload = (slot) => { S.menu = null; E.fpSlot = slot; E.dlg = 'fp'; };
  A.amReset = (slot) => {
    S.menu = null;
    commit(() => { if (slot.startsWith('slide')) { const i = +slot.slice(5); const sz = BANNER[E.D.banner.size]; E.D.banner.slides[i] = { f: tplOf(E.D.template).slides[i] || 'none', w: sz.w, h: sz.h, hid: E.D.banner.slides[i].hid }; } if (slot === 'tb-logo') { E.D.tb.logoF = 'none'; tbFitSet('logo', null); } if (TB_ICON.test(slot)) tbIconSet(slot.slice(3), null); if (slot.startsWith('mp-')) window.MP.setAsset(slot, null); });
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
  // 从电脑选真实图片（PNG / SVG / APNG / AVIF / WebP）：尺寸对就直接上传，不对先进「调整尺寸」
  A.fpLocal = () => {
    const slot = E.fpSlot; const sp = slotSpec(slot);
    window.pickImage({ accept: window.IMG_ACCEPT, maxMB: 5 }, (src) => {
      const im = new Image(); im.onload = () => { const w = im.naturalWidth || sp.w, h = im.naturalHeight || sp.h; const f = 'img:' + src; if (w !== sp.w || h !== sp.h) { openResize(slot, f, w, h); window.render(); } else uploadTo(slot, f, sp.w, sp.h); };
      im.onerror = () => window.toast(t('mp/icon-bad'), { info: true }); im.src = src;
    });
    return false;
  };
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
      : list.length ? `<div class="lib-grid">${list.map((it, i) => { const bad = it.w !== sp.w || it.h !== sp.h; return `<button class="lib-it ${L.sel === i ? 'is-on' : ''} ${bad ? 'is-bad' : ''}" data-act="libSel" data-arg="${i}"><span class="im" style="${ratio};${window.fxStyle(it.f, L.slot.startsWith('slide') ? BANNER_DEF : '')}"></span><span class="n ellipsis">${esc(it.name)}</span><span class="s">${it.w}×${it.h}</span>${bad ? `<span class="pill-tag is-warn">${t('ed/lib-bad')}</span>` : ''}</button>`; }).join('')}</div>`
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
    commit(() => { setAsset(r.slot, Object.assign({ f: r.f, w: sp.w, h: sp.h, fit: r.mode }, r.mode === 'pad' ? { fill: r.fill } : { x: r.x, y: r.y })); });
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
    if (r.mode === 'crop') stage = `<div class="rs-img" style="width:${g.ow}px;height:${g.oh}px;${window.fxStyle(r.f, r.slot.startsWith('slide') ? BANNER_DEF : '')}"><div class="rs-frame" data-rs-frame style="left:${(g.ow - g.fw) * r.x}px;top:${(g.oh - g.fh) * r.y}px;width:${g.fw}px;height:${g.fh}px"></div></div>`;
    else { const ratio = g.sp.w / g.sp.h; let tw = g.BW, thh = g.BW / ratio; if (thh > g.BH) { thh = g.BH; tw = g.BH * ratio; } const s = Math.min(tw / r.w, thh / r.h); stage = `<div class="rs-pad" style="width:${tw}px;height:${thh}px;background:${th[r.fill]}"><span class="rs-img in" style="width:${r.w * s}px;height:${r.h * s}px;${window.fxStyle(r.f, r.slot.startsWith('slide') ? BANNER_DEF : '')}"></span></div>`; }
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
  // 参考图（跟图标 / 顶部栏 AI 一致）：只收 IMG_ACCEPT 格式，上传后识别主色 / 风格，反推一段 Banner 提示词填进输入框
  const edRefPick = () => {
    const a = E.ai; if (!a || a.stage === 'generating') return false;
    window.pickImage({ accept: window.IMG_ACCEPT, maxMB: 10 }, (src, file) => window.refUpload(a.refSt, src, file ? file.name : '', () => {
      if (E.ai !== a) return;
      a.analyzing = true; window.render();
      window.aiRefRead(src, ['', ''], (res) => {
        if (E.ai !== a) return; a.analyzing = false;
        if (!res) { a.refSt = {}; window.toast(t('ed/bal-img-bad'), { info: true }); window.render(); return; }
        const sz = BANNER[E.D.banner.size];
        a.refStyle = res.style; a.prompt = t('ed/ai-ref-prompt', { w: sz.w, h: sz.h, hex: res.hex, style: t('ed/ai-st-' + (res.style === 'flat' ? 'glossy' : res.style)) });
        if (a.stage === 'cands') a.stage = 'idle'; window.render();
      });
    }));
    return false;
  };
  A.edRefPick = edRefPick;
  A.edRefView = edRefPick;
  A.edRefRm = () => { E.ai.refSt = {}; E.ai.refStyle = null; E.ai.analyzing = false; };
  A.edRefCancel = () => { if (window.refCancel) window.refCancel(E.ai.refSt); E.ai.analyzing = false; };
  A.aiModel = (m) => { E.ai.model = m; S.menu = null; };
  A.aiGen = () => {
    const a = E.ai; if (!a || a.stage === 'generating' || a.analyzing) return false;
    if (!afford(20)) { if (window.lowBalance) window.lowBalance(20); else topup(); return false; }
    a.stage = 'generating'; a.cand = null; const tok = (a.tok = {});
    setTimeout(() => {
      if (E.ai !== a || a.tok !== tok) return;
      if (fail(a.prompt)) { a.stage = 'failed'; notice({ kind: 'failed', cat: 'gen', title: t('ed/ai-title'), body: t('ed/ai-failed') }); }
      else { pay(20, 'banner'); const r = candScore(a); a.order = r.order; a.best = r.best; a.stage = 'cands'; }
      window.render();
    }, 1500);
  };
  A.pickCand = (i) => { E.ai.cand = +i; };
  A.adoptCand = () => {
    const a = E.ai; if (a.cand == null) return false;
    const slot = 'slide' + E.slide; const prev = getAsset(slot); const f = candList()[a.cand];
    const sz = BANNER[E.D.banner.size]; commit(() => { setAsset(slot, { f, w: sz.w, h: sz.h }); }); // AI 图按规格出，尺寸提醒随之消失
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
      <button class="btn btn-primary btn-block fp-local" data-act="fpLocal">${ic('upload-simple', 'ic-16')}${t('ed/fp-local', { w: sp.w, h: sp.h })}</button><div class="caption faint fp-or">${t('ed/fp-recent')}</div>
      <div class="fp-grid">${files.map(([n, w, h, kb, f]) => { const ok = w === sp.w && h === sp.h; return `<button class="fp" data-act="fpPick" data-arg="${f}|${w}|${h}"><span class="im" style="${window.fxStyle(f, (E.fpSlot || 'slide0').startsWith('slide') ? BANNER_DEF : '')};aspect-ratio:${sp.w} / ${sp.h}"></span><span class="n ellipsis">${n}</span><span class="s ${ok ? '' : 'bad'}">${w}×${h} · ${kb}${ok ? '' : ' · ' + t('ed/lib-bad')}</span></button>`; }).join('')}</div>`;
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
    return `<button class="btn btn-sm btn-check ${n ? '' : 'is-ok'} ${cls}" data-act="openChecks">${ic(n ? 'warning-circle-fill' : 'check-circle-fill', 'ic-16')}<span class="ellipsis">${n ? t('ed/check-n', { n }) : t('ed/check-passed')}</span>${n ? `<b class="cn">${n}</b>` : ''}</button>`;
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
        <div class="ed-prev" role="group" aria-label="${esc(t('ed/preview-cap'))}"><span class="cap">${t('ed/preview-cap')}</span><div class="iseg">${[['h5', 'device-mobile', 'ed/device-h5'], ['pc', 'desktop', 'ed/device-pc']].map(([v, i, k]) => `<button class="${E.device === v ? 'is-on' : ''}" data-act="setDevice" data-arg="${v}" title="${esc(t(k))}" aria-label="${esc(t(k))}">${ic(i)}</button>`).join('')}</div>
        <div class="iseg">${[['out', 'ed/signed-out'], ['in', 'ed/signed-in']].map(([v, k]) => `<button class="${(E.D.login ? 'in' : 'out') === v ? 'is-on' : ''}" data-act="setLogin" data-arg="${v}">${t(k)}</button>`).join('')}</div></div>
        <span class="spacer"></span>
        <button class="ibtn ibtn-sm" data-act="undo" ${E.past.length ? '' : 'disabled'} title="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="redo" ${E.future.length ? '' : 'disabled'} title="${esc(t('ed/redo'))}">${ic('arrow-u-up-right')}</button>
        ${checkBtn()}<span class="rel"><button class="ibtn ibtn-sm ${S.menu === 'edmore' ? 'is-on' : ''}" data-act="menu:toggle" data-arg="edmore" title="${esc(t('ed/more'))}" aria-label="${esc(t('ed/more'))}">${ic('dots-three')}</button>${S.menu === 'edmore' ? `<div class="menu ed-more-menu"><button class="menu-item" data-act="pageReset" ${pageDirty() ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}<span class="tx"><span>${t('ed/page-reset-all')}</span><span class="sub">${t(pageDirty() ? 'ed/page-reset-tip' : 'ed/page-is-default')}</span></span></button></div>` : ''}</span><button class="btn btn-primary btn-sm" data-act="openExport">${ic('download-simple', 'ic-16')}${t('ed/export')}</button></header>
      <div class="ed-body"><nav class="ed-left" data-sk="ed-left" style="${paneW('l')}">${tree()}</nav><div class="ed-rz" data-rz="l" title="${esc(t('ed/rz-tip'))}"></div>
        <main class="ed-canvas" data-sk="ed-canvas" data-act="canvasBg">${window.AD ? window.AD.edBar() : ''}${canvas}${E.device === 'pc' && window.PC ? '' : floats()}${busyMask()}</main>
        <div class="ed-rz" data-rz="r" title="${esc(t('ed/rz-tip'))}"></div><aside class="ed-right" data-sk="ed-right" style="${paneW('r')}">${rightPanel()}</aside></div></div>${dialogs()}${window.costConfirmLayer ? window.costConfirmLayer() : ''}`;
  }
  // ---------- 左右侧栏可拖动加宽（Waydon 2026-11-26）：宽度存本机，双击把手恢复默认 ----------
  const PANE = { l: [200, 480], r: [280, 600] };
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 隐私模式 */ } };
  E.paneW = E.paneW || lsGet('ed-pane-w') || {};
  function paneW(side) { const w = E.paneW[side]; return w ? `width:${w}px` : ''; }
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest && e.target.closest('[data-rz]'); if (!h) return;
    e.preventDefault(); const side = h.dataset.rz; const pane = document.querySelector(side === 'l' ? '.ed-left' : '.ed-right'); if (!pane) return;
    const x0 = e.clientX, w0 = pane.getBoundingClientRect().width; const [mn, mx] = PANE[side];
    h.classList.add('is-drag'); document.body.classList.add('is-rz');
    let moved = false;
    const mv = (ev) => { const d = side === 'l' ? ev.clientX - x0 : x0 - ev.clientX; if (!moved && Math.abs(d) < 2) return; moved = true; const w = Math.round(Math.max(mn, Math.min(mx, w0 + d))); pane.style.width = w + 'px'; E.paneW[side] = w; };
    const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); h.classList.remove('is-drag'); document.body.classList.remove('is-rz'); if (moved) { lsSet('ed-pane-w', E.paneW); window.render(); } };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
  });
  document.addEventListener('dblclick', (e) => { const h = e.target.closest && e.target.closest('[data-rz]'); if (!h) return; delete E.paneW[h.dataset.rz]; lsSet('ed-pane-w', E.paneW); window.render(); });

  // ---------- 悬浮工具栏可拖到别处摆放（Waydon 2026-11-26）----------
  // 默认贴在选中模块右侧；拖动把手后变成固定在屏幕上的浮动工具栏（位置存本机，切换模块也不动），双击把手贴回模块
  E.toolPos = E.toolPos || lsGet('ed-tool-pos');
  const clampTool = (el, x, y) => { const r = el.getBoundingClientRect(); return { x: Math.round(Math.max(8, Math.min(window.innerWidth - r.width - 8, x))), y: Math.round(Math.max(56, Math.min(window.innerHeight - Math.min(r.height, 120) - 8, y))) }; };
  function pinTool(el) { if (el.parentElement !== document.body) document.body.appendChild(el); el.classList.add('is-pinned'); const p = clampTool(el, E.toolPos.x, E.toolPos.y); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; }
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('body > .seltool.is-pinned').forEach((n) => n.remove());
    if (!E.toolPos || mobileEd()) return;
    const el = document.querySelector('#app .ed-canvas .seltool'); if (el) pinTool(el);
  });
  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest && e.target.closest('[data-stgrip]'); if (!g) return;
    e.preventDefault(); e.stopPropagation(); const el = g.closest('.seltool'); if (!el) return;
    const r0 = el.getBoundingClientRect(); const dx = e.clientX - r0.left, dy = e.clientY - r0.top; let moved = false;
    const mv = (ev) => {
      if (!moved && Math.abs(ev.clientX - e.clientX) + Math.abs(ev.clientY - e.clientY) < 4) return;
      if (!moved) { moved = true; E.toolPos = { x: r0.left, y: r0.top }; pinTool(el); el.classList.add('is-drag'); }
      const p = clampTool(el, ev.clientX - dx, ev.clientY - dy); E.toolPos = p; el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    };
    const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); el.classList.remove('is-drag'); if (moved) { lsSet('ed-tool-pos', E.toolPos); window.toast(t('ed/tool-pinned'), { info: true }); } };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
  }, true);
  A.toolDock = () => { E.toolPos = null; lsSet('ed-tool-pos', null); S.menu = null; };
  document.addEventListener('dblclick', (e) => { if (e.target.closest && e.target.closest('[data-stgrip]')) { A.toolDock(); window.render(); } });

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
        <button class="ibtn ibtn-sm" data-act="undo" ${E.past.length ? '' : 'disabled'} aria-label="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="redo" ${E.future.length ? '' : 'disabled'} aria-label="${esc(t('ed/redo'))}">${ic('arrow-u-up-right')}</button><button class="ibtn ibtn-sm" data-act="pageReset" ${pageDirty() ? '' : 'disabled'} aria-label="${esc(t('ed/page-reset'))}">${ic('arrow-counter-clockwise')}</button>
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

  window.EDX = { E, tipI: (k, p) => tipI(k, p), txtSec: (b) => txtSec(b), balSec: (m) => balSec(m), balColorRows: () => balColorRows(), balCfg: () => balCfg(), keyVal: (k, th) => keyVal(k, th), slideStyle, commit, save, liveTheme, themeStyle, modWrap, selToolbar, modHtml, pickerHtml, segBtns: (...a) => segBtns(...a), pxSeg: (...a) => pxSeg(...a), pxCustom: (...a) => pxCustom(...a), moreBtn: (...a) => moreBtn(...a), uploadUI: (...a) => uploadUI(...a), mobileEd, baseName, modName, checks, afford, pay, fail, topup, notice, undoOpt, inkOn,
    // AD：AI 首页设计用（按给定设计数据渲染迷你预览 h5For、默认设计、配色工具）
    h5For, defaultDesign, preset, baseOf, customCount, PRESETS, KEYS, SUGGEST, BANNER, MODS, hex2hsv, hsv2hex, fixSlide, persist };
  window.VIEWS.editor = function () { if (E.loading) return loading(); return mobileEd() ? mobile() : desktop(); };
  window.ED = { isOpen: () => S.route === 'editor' && !!(E.dlg || E.picker || E.mpanel || E.preview || E.ai || E.keys || E.iconAi || E.rn || E.nameEdit || E.h5side || E.palOpen || E.adp || E.adMod), escape };
})();
