/* AI 首页设计（AD-01…AD-05）：首页创作框「首页设计」页签、工作台 design 记录与放大预览、编辑器「AI 一键设计」、
 * 单模块 AI 重新生成、导出 Figma 源文件结构（源文件包含 / 查看结构 / 交付检查两项）。
 * 原则：AI 不画整页图，输出「设计参数 + 素材」套进现有九模块渲染；结果是普通设计数据（可编辑、可撤销、可导出）。
 * 一套设计由 风格预设 + 主色推算 + 种子扰动 确定性算出（记录里只存参数，不存整份设计）。
 * 依赖：core（spend / costConfirm / pushNotice / pickImage / refSlot）、home（composer / openNewProject）、workbench、editor（window.EDX）、pc（window.PC.page）。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP;
  const t = (k, v) => window.t(k, v), esc = (s) => window.esc(s), ic = (n, c) => window.ic(n, c), num = (n) => window.num(n);
  const X = () => window.EDX;
  const AD_COST = 50, AD_MOD_COST = 10; // 暂定：一次 3 套 50 点；单模块重新生成 10 点
  window.AD_COST = AD_COST; window.AD_MOD_COST = AD_MOD_COST;
  const isMob = () => window.isMobile();
  const edMob = () => window.innerWidth < 840;
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- 颜色工具 ----------
  const rgb = (h) => { const n = parseInt(String(h).replace('#', '').slice(0, 6), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, k) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * k)); };
  const lum = (h) => { const L = rgb(h).map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2]; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const best = (bg, cands) => cands.slice().sort((a, b) => contrast(bg, b) - contrast(bg, a))[0];
  const ink = (bg) => (X() && X().inkOn ? X().inkOn(bg) : contrast(bg, '#000') > contrast(bg, '#fff') ? '#000' : '#fff');
  function shift(h, dh, ds = 0, dv = 0) {
    const x = X(); if (!x || !x.hex2hsv) return h;
    const v = x.hex2hsv(h); return x.hsv2hex({ h: (v.h + dh + 360) % 360, s: Math.max(0, Math.min(1, v.s + ds)), v: Math.max(0, Math.min(1, v.v + dv)) });
  }
  // 小随机：同一 seed 结果固定（刷新后 3 套还是那 3 套）
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- 风格定义（规格 §1）----------
  // pal 顺序 = 11 个基础色：primary, lead, neutral_1, neutral_2, neutral_3, border, bg_1, bg_2, accent_1, accent_2, accent_3
  const ST = {
    platinum: { pal: ['#c8a96a', '#2a2620', '#5f584e', '#8f877b', '#c5beb2', '#e8e3d9', '#f7f6f3', '#ffffff', '#3f9b6b', '#c8553d', '#b98a45'], prim: ['#c8a96a', '#b38d4c', '#9aa3ad'], ics: 'metal', tone: 'gold', preset: 'gold', tpl: 'classic-blue', corners: [1, 0, 2], bf: 'grayscale(1) sepia(.45) brightness(1.55) contrast(.82)', thumb: ['#f7f6f3', '#c8a96a', '#9aa3ad'] },
    blackgold: { pal: ['#d4af37', '#f3e7c9', '#cbb98c', '#8f8268', '#5a5244', '#3a332a', '#111111', '#1a1712', '#4caf6e', '#e0533d', '#e8a33a'], prim: ['#d4af37', '#e6c675', '#b8862b'], ics: 'metal', tone: 'gold', preset: 'gold', tpl: 'midnight-gold', corners: [1, 2, 0], bf: 'grayscale(1) sepia(1) saturate(2.4) brightness(.78) contrast(1.15)', thumb: ['#111111', '#d4af37', '#1a1712'] },
    techblue: { pal: ['#1678ff', '#e8f0ff', '#a9bddc', '#7088ad', '#43577a', '#22345a', '#0a1430', '#12204a', '#19c37d', '#ff4d5e', '#ffb020'], prim: ['#1678ff', '#00a8ff', '#4f6bff'], ics: 'duotone', tone: 'blue', preset: 'blue', tpl: 'classic-blue', corners: [2, 1, 0], bf: 'saturate(1.25) brightness(.92)', thumb: ['#0a1430', '#1678ff', '#00a8ff'] },
    fresh: { pal: ['#14b87a', '#1f2d27', '#4f625a', '#82958d', '#b8c7c0', '#dcebe4', '#f2faf6', '#ffffff', '#0aa5b5', '#ef4a4a', '#ffa61a'], prim: ['#14b87a', '#10b3a8', '#3cbf4a'], ics: 'fill', tone: 'green', preset: 'green', tpl: 'fresh-green', corners: [2, 2, 1], bf: 'hue-rotate(-62deg) saturate(1.05) brightness(1.2)', thumb: ['#f2faf6', '#14b87a', '#0aa5b5'] },
    festive: { pal: ['#d9302c', '#3a1210', '#7a3b33', '#a8746b', '#d8b7ae', '#f1d9c8', '#fff6ec', '#ffffff', '#2e9b4f', '#b3121b', '#e9b23c'], prim: ['#d9302c', '#c4161c', '#e8541e'], ics: 'gradient', tone: 'gold', preset: 'gold', tpl: 'festive-red', corners: [2, 1, 0], bf: 'hue-rotate(150deg) saturate(1.9) brightness(1.05)', thumb: ['#fff6ec', '#d9302c', '#e9b23c'] },
    neon: { pal: ['#b14dff', '#f2e9ff', '#bba7d9', '#8a77ab', '#554872', '#2e2547', '#0e0a1a', '#181128', '#22e6c6', '#ff3d8b', '#ffb03b'], prim: ['#b14dff', '#19d3c5', '#ff3d8b'], ics: 'gradient', tone: 'purple', preset: 'purple', tpl: 'classic-blue', corners: [1, 0, 2], bf: 'hue-rotate(62deg) saturate(1.9) contrast(1.15)', thumb: ['#0e0a1a', '#b14dff', '#22e6c6'] },
    minimal: { pal: ['#222222', '#111111', '#555555', '#888888', '#bbbbbb', '#e4e4e4', '#f5f5f5', '#ffffff', '#2fa66a', '#e5484d', '#f59e0b'], prim: ['#222222', '#3b4250', '#5b6270'], ics: 'line', tone: 'blue', preset: 'blue', tpl: 'classic-blue', corners: [0, 0, 1], bf: 'grayscale(1) brightness(1.18) contrast(.92)', thumb: ['#f5f5f5', '#222222', '#bbbbbb'] },
  };
  const STYLES = Object.keys(ST); // 白金、黑金在最前
  const ICS = ['fill', 'line', 'duotone', '3d', 'metal', 'gradient', 'flat'];
  const isDark = (k) => lum(ST[k].pal[6]) < 0.2;
  const stName = (k) => t('ad/st-' + k);
  const icsName = (k) => t('ad/ics-' + k);
  // 三套结果的版式差异（同风格不同主次色 / 圆角 / 菜单形状 / Banner 滤镜）
  const V = [
    { gmShape: 'pill', gmStyle: 'tabs', jp: 'flow', jpBg: 0, bnav: 'regular', bh: 110, foot: 'center', cols: 3, ind: 'bars', tb: 'plain', side: 'list', per: 5, size: 'general' },
    { gmShape: 'square', gmStyle: 'icons', jp: 'compact', jpBg: 1, bnav: 'raised', bh: 120, foot: 'left', cols: 2, ind: 'dots', tb: 'brand', side: 'grid', per: 4, size: 'large' },
    { gmShape: 'pill', gmStyle: 'icons', jp: 'flow', jpBg: 2, bnav: 'regular', bh: 98, foot: 'center', cols: 4, ind: 'bars', tb: 'deep', side: 'list', per: 5, size: 'general' },
  ];
  const SUP = ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer', 'sidebar', 'bottomnav', 'topbar'];

  // 主色：风格默认 / 推荐色 / 自定义 / 从效果图取色
  function primaryOf(p, st, i, seed) {
    const jit = seed ? ((seed * 7) % 21) - 10 : 0;
    let c;
    if (p.colorMode === 'ref' && p.ref && p.ref.length) c = p.ref[i] || shift(p.ref[0], i === 1 ? 16 : -16, 0, i === 1 ? 0.04 : -0.08);
    else if ((p.colorMode === 'hex' || p.colorMode === 'custom') && p.hex) c = i === 0 ? p.hex : shift(p.hex, i === 1 ? 14 : -14, i === 1 ? -0.06 : 0.04, i === 1 ? 0.06 : -0.1);
    else c = st.prim[(i + (seed || 0)) % 3];
    return jit ? shift(c, jit) : c;
  }
  // 按 风格 + 第 i 套 + 种子 生成一份完整设计数据（结构同 E.D）
  function buildDesign(p, i, seed, from) {
    const x = X(); const st = ST[p.style] || ST.platinum; const r = rng(((seed || 0) + 1) * 977 + i * 131 + STYLES.indexOf(p.style) * 17);
    const vi = (i + (seed || 0)) % 3, v = V[vi];
    const D = x.defaultDesign('classic-blue', st.preset);
    const pal = st.pal.slice(); pal[0] = primaryOf(p, st, i, seed);
    const th = {}; x.KEYS.forEach((k, j) => { th[k] = pal[j]; });
    D.theme = th; D.baseTheme = Object.assign({}, th); D.palette = 'ad'; D.basePreset = st.preset; D.template = st.tpl; D.tone = st.tone;
    D.style = p.style; D.iconStyle = p.ics || st.ics; D.aiDesign = { from: from || 'workbench', set: i + 1 };
    const dark = isDark(p.style);
    // 模块样式
    const lv = st.corners[(i + (seed || 0)) % 3];
    const m = D.m;
    m.gamemenu.shape = lv === 0 ? 'square' : v.gmShape; m.gamemenu.style = v.gmStyle;
    m.jackpot.layout = v.jp; m.jackpot.corner = [0, 16, 32][lv]; m.jackpot.margin = [8, 16, 24][Math.floor(r() * 3)];
    m.gamecards.corner = [0, 20, 32][lv]; m.gamecards.cols = v.cols; m.gamecards.gap = [12, 20, 32][Math.floor(r() * 3)];
    m.footer.align = v.foot; m.bottomnav.style = v.bnav; m.bottomnav.h = v.bh; m.sidebar.style = v.side; m.midnav.per = v.per;
    // Banner：当前规格 3 张（滤镜模拟 AI 出图）
    const size = v.size, sz = x.BANNER[size];
    D.banner = Object.assign(D.banner, { size, corner: [0, 8, 16][lv], ind: v.ind, slides: [0, 1, 2].map((j) => ({ f: `${st.bf} hue-rotate(${((i * 14 + j * 9 - 9 + (seed || 0) * 5) % 40) - 10}deg)`, w: sz.w, h: sz.h })) });
    // 顶部栏
    D.tb.colors = tbColors(v.tb, th, dark);
    // 元素颜色（保证色块上的字看得清）
    const jpBg = [th.primary, th.accent_3, th.lead][v.jpBg];
    const ec = {};
    const put = (id, c, def) => { if (c && c.toLowerCase() !== String(def).toLowerCase()) ec[id] = c; };
    put('jackpot.bg', jpBg, th.primary);
    const jpInk = best(jpBg, [th.bg_2, th.lead, '#ffffff', '#111111']); put('jackpot.title', jpInk, th.bg_2); put('jackpot.amount', jpInk, th.bg_2);
    put('gamemenu.activeText', best(th.primary, [th.bg_2, th.lead]), th.bg_2);
    put('sidebar.textActive', best(th.primary, [th.bg_2, th.lead]), th.bg_2);
    put('gamecards.labelText', best(th.accent_3, ['#ffffff', th.lead]), '#ffffff'); // 默认 labeltext_accent3 = 固定白
    const bnOn = vi === 1 ? (dark ? th.primary : mix(th.primary, th.lead, 0.25)) : th.primary;
    put('bottomnav.active', contrast(th.bg_2, bnOn) >= 3 ? bnOn : best(th.bg_2, [mix(th.primary, th.lead, 0.35), mix(th.primary, th.lead, 0.6), th.lead]), th.primary);
    if (contrast(th.bg_1, th.neutral_2) < 3.2) put('footer.text', best(th.bg_1, [th.neutral_1, mix(th.neutral_2, th.lead, 0.5)]), th.neutral_2);
    D.ec = ec; D.baseEc = Object.assign({}, ec);
    return D;
  }
  function tbColors(mode, th, dark) {
    let c;
    if (mode === 'brand') { const k = ink(th.primary); c = { bg: th.primary, text: k, search: k }; }
    else if (mode === 'deep') c = dark ? { bg: mix(th.bg_1, th.primary, 0.14), text: th.lead, search: th.primary } : { bg: th.lead, text: th.bg_2, search: th.primary };
    else c = { bg: null, text: null, search: null };
    // 登录 / 注册：在顶部栏底色上必须看得清（字色按亮度取黑白或主题色）
    const top = c.bg || th.bg_2;
    const okOn = (x, min) => contrast(top, x) >= min;
    const regs = [th.primary, th.accent_3, th.lead, dark ? th.bg_1 : mix(th.primary, th.lead, 0.4)];
    c.reg = regs.find((x) => okOn(x, 1.6)) || best(top, regs);
    c.regInk = best(c.reg, [th.bg_2, th.lead, '#ffffff', '#111111']);
    const logins = mode === 'brand' ? [c.text] : [th.primary, mix(th.primary, dark ? '#ffffff' : th.lead, 0.4), c.text || th.lead];
    c.login = logins.find((x) => okOn(x, 3)) || best(top, logins);
    return c;
  }
  // 编辑器「AI 一键设计」：把候选套到当前项目上——页面模块、内容、素材不变；自己锁定过的颜色不覆盖（ED-14）
  function mergeInto(D0, C) {
    const x = X(); const D = clone(D0); const base = x.baseOf(D0);
    const th = Object.assign({}, C.theme); let kept = 0;
    x.KEYS.forEach((k) => { if (D0.theme[k].toLowerCase() !== base[k].toLowerCase()) { th[k] = D0.theme[k]; kept++; } });
    D.theme = th; D.baseTheme = Object.assign({}, C.theme); D.palette = 'ad'; D.basePreset = C.basePreset;
    const userEc = {}; Object.keys(D0.ec).forEach((id) => { if (!(D0.baseEc && D0.baseEc[id] === D0.ec[id])) { userEc[id] = D0.ec[id]; kept++; } });
    D.ec = Object.assign({}, C.ec, userEc); D.baseEc = Object.assign({}, C.baseEc);
    const userTb = D0.tb.colors && Object.values(D0.tb.colors).some(Boolean) && !D0.aiDesign;
    if (!userTb) D.tb.colors = Object.assign({}, C.tb.colors);
    ['gamemenu.shape', 'gamemenu.style', 'jackpot.layout', 'jackpot.corner', 'jackpot.margin', 'gamecards.corner', 'gamecards.cols', 'gamecards.gap', 'footer.align', 'bottomnav.style', 'bottomnav.h', 'sidebar.style'].forEach((p) => { const [b, f] = p.split('.'); D.m[b][f] = C.m[b][f]; });
    const sz = x.BANNER[D.banner.size];
    D.banner.corner = C.banner.corner; D.banner.ind = C.banner.ind;
    D.banner.slides = D.banner.slides.map((s, j) => Object.assign({}, s, { f: C.banner.slides[j % C.banner.slides.length].f, w: sz.w, h: sz.h, fit: undefined }));
    D.style = C.style; D.iconStyle = C.iconStyle; D.aiDesign = C.aiDesign; D.tone = C.tone;
    return { D, kept };
  }

  // ---------- 迷你预览（真实渲染：编辑器 h5 + 该套参数）----------
  function withD(D, fn) {
    const x = X(), E = x.E;
    const keep = { D: E.D, sel: E.sel, ai: E.ai, picker: E.picker, h5side: E.h5side, slide: E.slide, adMod: E.adMod };
    Object.assign(E, { D, sel: null, ai: null, picker: null, h5side: false, slide: 0, adMod: null });
    try { return fn(); } finally { Object.assign(E, keep); }
  }
  const strip = (h) => h.replace(/ data-act="[^"]*"/g, '').replace(/ data-pc-page/g, '').replace(/ data-swipe/g, '').replace(/ data-sk="[^"]*"/g, '');
  const h5Html = (D) => strip(X().h5For(D));
  const pcHtml = (D, z) => (window.PC && window.PC.page ? strip(withD(D, () => window.PC.page(z))) : '');
  const mini = (D, k, cls = '') => `<div class="ad-mini ${cls}" style="--k:${k}"><div class="ad-mini-in">${h5Html(D)}</div></div>`;
  // 设计缓存（记录只存参数）
  const cache = {};
  function designOf(r, i) {
    const key = r.id + ':' + i + ':' + (r.seed || 0);
    if (!cache[key]) cache[key] = buildDesign(r.p, i, r.seed || 0, 'workbench');
    return cache[key];
  }

  // ---------- 效果图取色（前端本地聚类，原型简化版）----------
  function extract(src, cb) {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 48, 48);
        const d = g.getImageData(0, 0, 48, 48).data; const bins = {};
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          const k = ((d[i] >> 5) << 6) | ((d[i + 1] >> 5) << 3) | (d[i + 2] >> 5);
          const b = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0 }); b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2];
        }
        const list = Object.values(bins).map((b) => { const h = hex([b.r / b.n, b.g / b.n, b.b / b.n]); const v = X().hex2hsv(h); return { h, score: b.n * (0.25 + v.s) * (v.v > 0.15 ? 1 : 0.2) }; }).sort((a, b) => b.score - a.score);
        const out = [];
        for (const q of list) { if (out.every((o) => { const a = rgb(o), b2 = rgb(q.h); return Math.hypot(a[0] - b2[0], a[1] - b2[1], a[2] - b2[2]) > 70; })) out.push(q.h); if (out.length >= 3) break; }
        cb(out);
      } catch (e) { cb([]); }
    };
    img.onerror = () => cb([]);
    img.src = src;
  }

  // ======================================================================
  // AD-01 首页创作框「首页设计」页签
  // ======================================================================
  const newParams = (o) => Object.assign({ style: 'platinum', ics: ST.platinum.ics, follow: true, colorMode: 'style', hex: null, custom: '#c8a96a', ref: [], colorTouched: false, prompt: '', refSt: { src: null, name: '', uploading: false, pct: 0 } }, o || {});
  S.ad = newParams();
  const swatches = (k, n = 4) => { const p = ST[k].pal; return `<span class="ad-sw">${[p[6], p[0], p[10], p[1]].slice(0, n).map((c) => `<i style="background:${c}"></i>`).join('')}</span>`; };
  const curPrimary = (q) => (q.colorMode === 'ref' && q.ref.length ? q.ref[0] : (q.colorMode === 'hex' || q.colorMode === 'custom') && q.hex ? q.hex : ST[q.style].prim[0]);
  const icsDemo = (k, color, glyph = 'crown-fill') => `<span class="ad-icd ics-${k}" style="--o-primary:${color};--o-accent_3:${mix(color, '#ffffff', 0.35)}"><span class="ib">${ic(glyph)}</span></span>`;
  function styleItems(act, q) {
    return STYLES.map((k) => `<button class="menu-item ad-st-item ${q.style === k ? 'is-on' : ''}" data-act="${act}" data-arg="${k}">${swatches(k)}<span class="tx"><b>${esc(stName(k))}</b><small>${esc(t('ad/st-' + k + '-d'))}</small></span></button>`).join('');
  }
  function icsItems(act, q) {
    const c = curPrimary(q);
    return `<button class="menu-item ad-ics-item ${q.follow ? 'is-on' : ''}" data-act="${act}" data-arg="follow">${icsDemo(ST[q.style].ics, c)}<span class="tx"><b>${t('ad/ics-follow')}</b><small>${esc(t('ad/ics-rec', { name: icsName(ST[q.style].ics) }))}</small></span></button><div class="menu-sep"></div>`
      + ICS.map((k) => `<button class="menu-item ad-ics-item ${!q.follow && q.ics === k ? 'is-on' : ''}" data-act="${act}" data-arg="${k}">${icsDemo(k, c)}<span class="tx"><b>${esc(icsName(k))}</b></span></button>`).join('');
  }
  function colorItems(pre, q) {
    const st = ST[q.style];
    const refOk = q.ref && q.ref.length;
    const sug = X().SUGGEST;
    const cur = (q.colorMode === 'hex' || q.colorMode === 'custom') ? (q.hex || '').toLowerCase() : '';
    return `<button class="menu-item ${q.colorMode === 'ref' && refOk ? 'is-on' : ''} ${refOk ? '' : 'is-dis'}" data-act="${pre}Mode" data-arg="ref" ${refOk ? '' : 'aria-disabled="true"'}><span class="ad-dots">${refOk ? q.ref.map((c) => `<i style="background:${c}"></i>`).join('') : `<i class="is-empty"></i>`}</span><span class="tx"><b>${t('ad/c-ref')}</b><small>${t(refOk ? 'ad/c-ref-d' : 'ad/c-ref-none')}</small></span></button>
      <button class="menu-item ${q.colorMode === 'style' ? 'is-on' : ''}" data-act="${pre}Mode" data-arg="style"><span class="ad-dots">${st.prim.map((c) => `<i style="background:${c}"></i>`).join('')}</span><span class="tx"><b>${t('ad/c-style')}</b><small>${esc(t('ad/c-style-d', { style: stName(q.style) }))}</small></span></button>
      <div class="menu-label">${t('ad/c-suggest')}</div><div class="ad-sug">${sug.map((c) => `<button class="ad-sugc ${cur === c ? 'is-on' : ''}" style="background:${c}" data-act="${pre}Hex" data-arg="${c}" title="${c}" aria-label="${c}"></button>`).join('')}</div>
      <div class="menu-sep"></div><label class="menu-item ad-custom ${q.colorMode === 'custom' ? 'is-on' : ''}"><input type="color" value="${esc(q.custom || '#c8a96a')}" data-ad-custom="${pre}"><span class="tx"><b>${t('ad/c-custom')}</b><small>${q.colorMode === 'custom' ? esc(q.hex) : t('ad/c-custom-d')}</small></span></label>`;
  }
  const colorChip = (q) => { const c = curPrimary(q); return `<i class="ad-chipc" style="background:${c}"></i>`; };
  function composer(where, tabsHtml) {
    const q = S.ad, mob = isMob();
    const menu = (id, body, cls) => (!mob && S.menu === id ? `<div class="menu c-menu ad-menu ${cls || ''}">${body}</div>` : '');
    const opt = (id, inner, body, cls, title) => `<div class="rel"><button class="c-opt ${S.menu === id ? 'is-open' : ''}" data-act="${mob ? 'adSheet' : 'menu:toggle'}" data-arg="${id}" title="${esc(title || '')}">${inner}${ic('caret-down', 'chev')}</button>${menu(id, body, cls)}</div>`;
    const modelName = S.c.model === 'gemini' ? 'Gemini' : 'GPT Image';
    const modelBody = ['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${S.c.model === m ? 'is-on' : ''}" data-act="cModel" data-arg="${m}">${window.MODEL_LOGO[m]}<span><div class="nm">${m === 'gemini' ? 'Gemini' : 'GPT Image'}</div><div class="ds">${m === 'gpt' ? 'Sunburst Flare' : 'Nano Banana Pro'} · ${t('model/' + m + '-desc')}</div></span></button>`).join('');
    const ics = q.follow ? ST[q.style].ics : q.ics;
    const opts = [
      opt('adStyle', `${swatches(q.style, 3)}<span class="ellipsis">${esc(stName(q.style))}</span>`, styleItems('adStyle', q), 'ad-st-menu', t('ad/opt-style')),
      opt('adIcs', `${icsDemo(ics, curPrimary(q), 'crown-fill')}<span class="ellipsis">${esc(q.follow ? t('ad/ics-follow-s', { name: icsName(ics) }) : icsName(ics))}</span>`, icsItems('adIcs', q), 'ad-ics-menu', t('ad/opt-ics')),
      opt('adColor', `${colorChip(q)}<span class="ellipsis">${esc(t('ad/opt-color'))}</span>`, colorItems('adC', q), 'ad-color-menu', t('ad/opt-color')),
      `<div class="rel"><button class="c-opt ${S.menu === 'model' ? 'is-open' : ''}" data-act="${mob ? 'sheet' : 'menu:toggle'}" data-arg="model">${window.MODEL_LOGO[S.c.model]}<span class="ellipsis">${modelName}</span>${ic('caret-down', 'chev')}</button>${!mob && S.menu === 'model' ? `<div class="menu c-menu">${modelBody}</div>` : ''}</div>`,
    ];
    const ref = window.refSlot(q.refSt, 'adRef').split(t('composer/ref-slot')).join(t('ad/ref-slot')).split(t('composer/ref-hint')).join(t('ad/ref-hint'));
    const picked = q.refSt.src && q.ref.length ? `<div class="ad-picked">${t('ad/picked')}<span class="ad-dots">${q.ref.map((c) => `<i style="background:${c}"></i>`).join('')}</span></div>` : '';
    return `<div class="composer ad-composer" data-where="${where}">${tabsHtml}
      <div class="c-box no-tl"><div class="c-input">${ref}<textarea rows="3" data-input="adPrompt" data-key="adKey" placeholder="${esc(t('ad/placeholder'))}">${esc(q.prompt)}</textarea></div>${picked}
        <div class="c-tools"><div class="c-opts" data-sk="adopts-${where}">${opts.join('')}</div>
          <button class="send" data-act="adSend" title="${esc(t('confirm/approx', { n: AD_COST }))}">${ic('sparkle-fill')}${AD_COST}${ic('arrow-up')}</button></div></div></div>`;
  }
  I.adPrompt = (v) => { S.ad.prompt = v; return false; };
  A.adKey = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); A.adSend(); return true; } };
  A.adSheet = (id) => { S.sheet = id; S.menu = null; };
  const closeSheet = () => { if (S.sheet && S.sheet.startsWith('ad')) S.sheet = null; S.menu = null; };
  A.adStyle = (k) => { if (!ST[k]) return false; S.ad.style = k; if (S.ad.follow) S.ad.ics = ST[k].ics; closeSheet(); };
  A.adIcs = (k) => { if (k === 'follow') { S.ad.follow = true; S.ad.ics = ST[S.ad.style].ics; } else { S.ad.follow = false; S.ad.ics = k; } closeSheet(); };
  A.adCMode = (m) => { if (m === 'ref' && !(S.ad.ref && S.ad.ref.length)) { window.toast(t('ad/c-ref-none'), { info: true }); return false; } S.ad.colorMode = m; S.ad.colorTouched = true; closeSheet(); };
  A.adCHex = (c) => { S.ad.colorMode = 'hex'; S.ad.hex = c; S.ad.colorTouched = true; closeSheet(); };
  // 自定义取色：取色器关闭（change）时才生效，避免取色过程中重渲染关掉系统取色器
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.matches || !el.matches('[data-ad-custom]')) return;
    const q = el.dataset.adCustom === 'adC' ? S.ad : X().E.adp && X().E.adp.p; if (!q) return;
    q.custom = el.value; q.hex = el.value; q.colorMode = 'custom'; q.colorTouched = true;
    if (el.dataset.adCustom === 'adC') closeSheet();
    window.render();
  });
  // 参考图格 → 效果图（上传后自动取色，没手动选过主色时默认「从效果图取色」）
  function afterRef(q) { extract(q.refSt.src, (cols) => { q.ref = cols; if (cols.length && !q.colorTouched) q.colorMode = 'ref'; window.render(); }); }
  A.adRefPick = () => { S.sheet = null; window.refPick(S.ad.refSt, () => afterRef(S.ad)); return false; };
  A.adRefRm = () => { S.ad.refSt.src = null; S.ad.refSt.name = ''; S.ad.ref = []; if (S.ad.colorMode === 'ref') S.ad.colorMode = 'style'; if (S.sheet === 'adRef') S.sheet = null; };
  A.adRefCancel = () => { window.refCancel(S.ad.refSt); };
  A.adRefView = () => { if (isMob()) S.sheet = 'adRef'; else return false; };
  function params(q) {
    return { style: q.style, ics: q.follow ? ST[q.style].ics : q.ics, follow: q.follow, colorMode: q.colorMode === 'ref' && !(q.ref && q.ref.length) ? 'style' : q.colorMode, hex: q.hex, ref: (q.ref || []).slice(), prompt: (q.prompt || '').trim() };
  }
  A.adSend = () => {
    const q = S.ad; if (q.refSt.uploading) { window.toast(t('ad/wait-upload'), { info: true }); return false; }
    const p = params(q);
    window.costConfirm({ title: t('ad/confirm-title'), body: t('ad/confirm-body', { style: stName(p.style), ics: icsName(p.ics) }), cost: AD_COST, okLabel: t('ad/confirm-ok'), onOk: () => { startRecord(p, null, true); q.prompt = ''; } });
  };

  // ======================================================================
  // AD-02 工作台 design 记录
  // ======================================================================
  const sessOf = (r) => (S.sessions || []).find((s) => s.records.includes(r));
  function findRec(id) { for (const s of S.sessions || []) for (const r of s.records) if (r.id === id) return r; return null; }
  const okIdx = (r) => (r.sets || []).map((s, i) => (s.st === 'ok' ? i : -1)).filter((i) => i >= 0);
  const autoPrompt = (p) => p.prompt || t('ad/auto-prompt', { style: stName(p.style) });
  function failMode(prompt, useFlag) {
    const s = String(prompt || '');
    if (/部分|部份|partial/i.test(s)) return 'part';
    return window.takeFail(useFlag ? s : '') ? 'all' : null;
  }
  function startRecord(p, sess, fromComposer) {
    const r = { id: uid('rad'), kind: 'design', type: 'design', prompt: autoPrompt(p), model: S.c.model, day: 'today', p, seed: p.seed || 0, status: 'adGen', progress: 0, sets: [{ st: 'pend' }, { st: 'pend' }, { st: 'pend' }], fails: [], seeds: {}, at: Date.now() };
    r.fail = failMode(p.prompt, fromComposer);
    let s = sess || (S.route === 'workbench' && S.routeArg !== 'new' ? (S.sessions || []).find((x) => x.id === S.activeSession) : null);
    if (!s) { s = { id: 's' + Date.now(), title: `${t('composer/type-design')} · ${stName(p.style)}`, pinned: false, records: [] }; S.sessions.unshift(s); }
    s.records.push(r); S.activeSession = s.id;
    run(r);
    if (S.route !== 'workbench' || S.routeArg) window.go('workbench'); else window.render();
    setTimeout(() => { const el = document.getElementById('rec-' + r.id); if (el) el.scrollIntoView({ block: 'end', behavior: 'smooth' }); else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 60);
    return r;
  }
  const timers = {};
  const TH = [34, 67, 100]; // 第 1 / 2 / 3 套在这些进度完成
  function run(r) {
    clearInterval(timers[r.id]);
    const start = Date.now(), from = r.progress || 0, ms = 6000 * (1 - from / 100) + 300;
    timers[r.id] = setInterval(() => {
      if (!findRec(r.id) || r.status !== 'adGen') { clearInterval(timers[r.id]); delete timers[r.id]; return; }
      const pr = Math.min(100, Math.round(from + ((Date.now() - start) / ms) * (100 - from)));
      r.progress = pr;
      let changed = false;
      TH.forEach((th, i) => { if (pr >= th && r.sets[i].st === 'pend') { r.sets[i].st = r.fail === 'all' || (r.fail === 'part' && i === 1) ? 'fail' : 'ok'; changed = true; } });
      document.querySelectorAll(`[data-adprog="${r.id}"]`).forEach((n) => { n.textContent = t('ad/gen-ing', { p: pr }); });
      document.querySelectorAll(`[data-adbar="${r.id}"]`).forEach((n) => { n.style.width = pr + '%'; });
      document.querySelectorAll(`[data-adpct="${r.id}"]`).forEach((n) => { n.textContent = pr + '%'; });
      if (pr >= 100) { clearInterval(timers[r.id]); delete timers[r.id]; finish(r); changed = true; }
      if (changed) window.render();
    }, 200);
  }
  // 成功 / 部分失败扣 50；全部失败不扣点（写一条 0 点流水 + 通知）
  function finish(r) {
    const s = sessOf(r), sid = s && s.id, ok = okIdx(r).length, f = 3 - ok;
    const style = { k: 'ad/st-' + r.p.style };
    if (ok) {
      r.status = 'adDone';
      if (!r.charged) { window.spend(AD_COST, 'design', { style, n: ok }, sid, r.id); r.charged = AD_COST; }
      window.pushNotice(f ? { kind: 'partial', cat: 'gen', title: { k: 'ad/n-partial', v: { d: ok, f } }, body: { k: 'ad/n-partial-d' }, sid, rid: r.id } : { kind: 'done', cat: 'gen', title: { k: 'ad/n-done', v: { style } }, body: r.prompt, sid, rid: r.id });
    } else {
      r.status = 'adFailed';
      zeroLedger('design-fail', { style }, sid, r.id);
      window.pushNotice({ kind: 'failed', cat: 'gen', title: { k: 'ad/n-failed' }, body: { k: 'ad/n-failed-d' }, sid, rid: r.id });
    }
  }
  function zeroLedger(kind, vars, sid, rid) { S.ledger.unshift({ id: uid('l'), kind, amount: 0, vars: vars || {}, sid: sid || null, rid: rid || null, at: Date.now() }); window.persistCore(); }
  // 刷新前没跑完的接着跑；单套重试中的直接给结果
  setTimeout(() => {
    for (const s of S.sessions || []) for (const r of s.records) {
      if (r.kind !== 'design') continue;
      (r.sets || []).forEach((x) => { if (x.st === 'gen') x.st = 'ok'; });
      if (r.status === 'adGen') run(r);
    }
  }, 400);

  // 卡片
  function card(r, i) {
    const x = r.sets[i], lab = t('ad/set-n', { i: i + 1 });
    if (x.st === 'ok') {
      const D = designOf(r, i);
      return `<div class="ad-card is-ok"><button class="ad-pv" data-act="adView" data-arg="${r.id}:${i}" aria-label="${esc(t('ad/zoom'))}">${mini(D, 0.5)}<span class="ad-zoom">${ic('arrows-out-simple', 'ic-16')}${t('ad/zoom')}</span><span class="ad-no">${i + 1}</span></button>
        <div class="ad-cap"><b class="ellipsis">${esc(lab)} · ${esc(stName(D.style))}</b><span class="caption faint ellipsis">${esc(icsName(D.iconStyle))}</span></div>
        <button class="btn btn-secondary btn-sm btn-block" data-act="adUse" data-arg="${r.id}:${i}">${ic('plus', 'ic-16')}<span class="ellipsis">${t('ad/use')}</span></button></div>`;
    }
    if (x.st === 'fail') return `<div class="ad-card is-fail"><div class="ad-ph">${ic('x-circle-fill', 'ic-24')}<span>${t('ad/set-failed')}</span></div><div class="ad-cap"><b>${esc(lab)}</b><span class="caption faint">${t('ad/free-retry-d')}</span></div>${r.status === 'adDone' ? `<button class="btn btn-secondary btn-sm btn-block" data-act="adRetrySet" data-arg="${r.id}:${i}">${t('ad/retry-set')}</button>` : ''}</div>`;
    if (x.st === 'gen') return `<div class="ad-card"><div class="ad-ph skeleton"><i class="wb-spin"></i><span>${t('ad/retrying')}</span></div><div class="ad-cap"><b>${esc(lab)}</b></div></div>`;
    if (x.st === 'cancel') return `<div class="ad-card is-void"><div class="ad-ph">${ic('stop-circle-fill', 'ic-24')}<span>${t('ad/set-cancelled')}</span></div><div class="ad-cap"><b>${esc(lab)}</b></div></div>`;
    const first = r.sets.findIndex((s) => s.st === 'pend') === i;
    return `<div class="ad-card is-pend"><div class="ad-ph skeleton">${first ? `<b data-adpct="${r.id}">${r.progress}%</b>` : ''}<span class="ad-skl"><i></i><i></i><i></i><i></i></span></div><div class="ad-cap"><b>${esc(lab)}</b><span class="caption faint">${t('ad/waiting')}</span></div></div>`;
  }
  function recordView(r) {
    const p = r.p, ok = okIdx(r).length;
    const st = ST[p.style] || ST.platinum;
    const note = (icn, txt, cls = '') => `<div class="rec-note ${cls}">${icn ? ic(icn, 'ic-16') : ''}<span>${txt}</span></div>`;
    const btn = (cls, act, label, icn, arg = r.id) => `<button class="btn ${cls} btn-sm" data-act="${act}" data-arg="${arg}">${icn ? ic(icn, 'ic-16') : ''}${label}</button>`;
    const more = `${btn('btn-primary', 'adAgain', t('ad/again', { c: AD_COST }), 'sparkle-fill')}${btn('btn-secondary', 'adRestyle', t('ad/restyle'), 'swatches-fill')}`;
    let foot = '', cancel = '';
    if (r.status === 'adGen') {
      cancel = `<button class="rec-cancel" data-act="adCancel" data-arg="${r.id}">${ic('stop-circle-fill', 'ic-16')}${t('rec/cancel')}</button>`;
      foot = `<div class="rec-note">${ic('clock', 'ic-16')}<span data-adprog="${r.id}">${t('ad/gen-ing', { p: r.progress })}</span></div><div class="progress ad-prog"><i style="width:${r.progress}%" data-adbar="${r.id}"></i></div><div class="caption faint">${t('ad/cancel-rule')}</div>`;
    } else if (r.status === 'adDone') {
      foot = (ok === 3 ? note('check-circle-fill', t('ad/done-n', { c: AD_COST }), 'is-ok') : note('warning-circle-fill', t('ad/partial-n', { d: ok, f: 3 - ok, c: AD_COST }), 'is-warn')) + `<div class="rec-actions">${more}</div>`;
    } else if (r.status === 'adFailed') {
      foot = note('warning-circle-fill', t('ad/failed-all'), 'is-err') + `<div class="rec-actions">${btn('btn-primary', 'adRetryAll', t('rec/retry', { c: AD_COST }))}${btn('btn-secondary', 'adRestyle', t('ad/restyle'), 'swatches-fill')}${btn('btn-secondary is-danger-text', 'recDelete', t('rec/delete'), 'trash')}</div>`;
    } else if (r.status === 'adCancelled') {
      foot = note('stop-circle-fill', r.cancelN ? t('ad/cancelled-paid', { d: r.cancelN, c: AD_COST }) : t('ad/cancelled-free')) + `<div class="rec-actions">${more}</div>`;
    }
    const meta = [t('composer/type-design'), stName(p.style), icsName(p.ics), r.model === 'gemini' ? 'Gemini' : 'GPT Image'].join('  |  ');
    return `<article class="rec ad-rec ${S.flash === r.id ? 'is-flash' : ''}" id="rec-${r.id}"><div class="rec-head"><span class="rec-thumb" style="background:linear-gradient(135deg,${st.thumb[0]} 0 40%,${st.thumb[1]} 40% 75%,${st.thumb[2]} 75%)"></span><span class="rec-prompt">${esc(r.prompt)}</span><span class="rec-meta">${esc(meta)}</span>${cancel}</div>
      <div class="ad-sets" data-sk="adsets-${r.id}">${[0, 1, 2].map((i) => card(r, i)).join('')}</div>${foot}</article>`;
  }
  // 取消：0 套完成不扣点；已完成 ≥1 套先确认，确认后按 50 扣
  A.adCancel = (id) => {
    const r = findRec(id); if (!r || r.status !== 'adGen') return false;
    if (!okIdx(r).length) { cancelNow(r); return; }
    S.adCancelRid = id; S.menu = null; if (isMob()) { S.dialog = null; S.sheet = 'adcancel'; } else { S.sheet = null; S.dialog = 'adcancel'; }
  };
  function cancelNow(r) {
    clearInterval(timers[r.id]); delete timers[r.id];
    const ok = okIdx(r).length; const s = sessOf(r);
    r.sets.forEach((x) => { if (x.st === 'pend') x.st = 'cancel'; });
    r.status = 'adCancelled'; r.cancelN = ok;
    if (ok && !r.charged) { window.spend(AD_COST, 'design-cancel', { style: { k: 'ad/st-' + r.p.style }, n: ok }, s && s.id, r.id); r.charged = AD_COST; }
    window.toast(ok ? t('ad/cancelled-paid', { d: ok, c: AD_COST }) : t('ad/cancelled-free'), { info: true });
  }
  A.adCancelOk = () => { S.dialog = null; S.sheet = null; const r = findRec(S.adCancelRid); if (r && r.status === 'adGen') cancelNow(r); };
  const cancelBody = (act, close, d) => `<h3>${t('ad/cancel-title')}</h3><p class="muted" style="margin:8px 0 0">${t('ad/cancel-body', { d, c: AD_COST })}</p>
    <div class="dialog-foot"><button class="btn btn-secondary" data-act="${close}">${t('rec/cancel-keep')}</button><button class="btn btn-danger" data-act="${act}">${t('rec/cancel-ok')}</button></div>`;
  // 失败的那一套免费重试
  A.adRetrySet = (arg) => {
    const [id, i] = String(arg).split(':'); const r = findRec(id); if (!r || !r.sets[+i] || r.sets[+i].st !== 'fail') return false;
    const willFail = window.takeFail('');
    r.sets[+i].st = 'gen';
    setTimeout(() => { if (!findRec(id) || r.sets[+i].st !== 'gen') return; r.sets[+i].st = willFail ? 'fail' : 'ok'; window.toast(willFail ? t('ad/retry-fail') : t('ad/retry-ok', { i: +i + 1 }), { info: willFail }); window.render(); }, 2200);
  };
  A.adRetryAll = (id) => {
    const r = findRec(id); if (!r) return false;
    window.costConfirm({ title: t('ad/confirm-title'), body: t('ad/confirm-body', { style: stName(r.p.style), ics: icsName(r.p.ics) }), cost: AD_COST, okLabel: t('ad/confirm-ok'), onOk: () => {
      r.status = 'adGen'; r.progress = 0; r.sets = [{ st: 'pend' }, { st: 'pend' }, { st: 'pend' }]; r.fail = failMode('', false); r.charged = 0; r.day = 'today'; run(r); window.render();
    } });
  };
  A.adAgain = (id) => {
    const r = findRec(id); if (!r) return false; const s = sessOf(r);
    const seed = Math.max(0, ...s.records.filter((x) => x.kind === 'design').map((x) => x.seed || 0)) + 1;
    window.costConfirm({ title: t('ad/confirm-title'), body: t('ad/confirm-body', { style: stName(r.p.style), ics: icsName(r.p.ics) }), cost: AD_COST, okLabel: t('ad/confirm-ok'), onOk: () => { S.activeSession = s.id; startRecord(Object.assign({}, r.p, { seed }), s, false); } });
  };
  // 换风格再生成：参数带回创作框并展开「页面风格」
  A.adRestyle = (id) => {
    const r = findRec(id); if (!r) return false; const p = r.p;
    S.ad = newParams({ style: p.style, ics: p.ics, follow: p.follow, colorMode: p.colorMode === 'ref' ? 'style' : p.colorMode, hex: p.hex, custom: p.hex || '#c8a96a', colorTouched: p.colorMode !== 'style', prompt: p.prompt || '' });
    S.c.type = 'design';
    const s = sessOf(r); if (s) S.activeSession = s.id;
    if (S.route !== 'workbench' || S.routeArg) window.go('workbench');
    if (isMob()) { S.sheet = 'adStyle'; } else { S.sheet = null; S.dialog = null; S.menu = 'adStyle'; }
    window.render();
    setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight }); if (!isMob() && S.route === 'workbench') { S.menu = 'adStyle'; window.render(); } }, 30);
    return false;
  };
  // 用这套新建项目 → 新建项目弹窗（名称预填「{风格名}首页」，查重同 HM-01）→ 编辑器
  function uniqueName(base) { const names = new Set((window.PROJECTS || []).map((p) => p.name)); if (!names.has(base)) return base; let n = 2; while (names.has(base + ' ' + n)) n++; return base + ' ' + n; }
  A.adUse = (arg) => {
    const [id, i] = String(arg).split(':'); const r = findRec(id); if (!r || !r.sets[+i] || r.sets[+i].st !== 'ok') return false;
    const D = clone(designOf(r, +i));
    S.adv = null;
    window.openNewProject({ name: uniqueName(t('ad/proj-name', { style: stName(D.style) })), design: D, from: t('ad/np-from', { style: stName(D.style), i: +i + 1, ics: icsName(D.iconStyle) }) });
  };

  // 放大预览（查看器）
  A.adView = (arg) => { const [id, i] = String(arg).split(':'); return openViewer(id, +i, {}); };
  function openViewer(id, idx, opts) {
    const r = findRec(id); if (!r) return false;
    const list = okIdx(r); if (!list.length) return false;
    S.adv = { rid: id, idx: list.includes(+idx) ? +idx : list[0], mode: (S.adv && S.adv.mode) || 'h5', from: (opts && opts.from) || null };
    S.menu = null; S.drawer = false;
    if (isMob()) { S.dialog = null; S.sheet = 'adview'; } else { S.sheet = null; S.dialog = 'adview'; }
    window.render();
    return false;
  }
  const advOpen = () => !!S.adv && (S.dialog === 'adview' || S.sheet === 'adview');
  function vStep(d) { const v = S.adv, r = v && findRec(v.rid); if (!r) return; const l = okIdx(r), p = l.indexOf(v.idx); v.idx = l[Math.max(0, Math.min(l.length - 1, (p < 0 ? 0 : p) + d))]; }
  A.advStep = (d) => { vStep(+d); };
  A.advMode = (m) => { S.adv.mode = m; };
  A.advClose = () => { S.adv = null; S.dialog = null; S.sheet = null; };
  A.advGoChat = () => { const r = S.adv && findRec(S.adv.rid); const s = r && sessOf(r); S.adv = null; if (s) return window.openRecord(s.id, r.id); return false; };
  document.addEventListener('keydown', (e) => {
    if (!advOpen()) return;
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.closest('input,textarea')) { e.preventDefault(); vStep(e.key === 'ArrowLeft' ? -1 : 1); window.render(); }
  }, true);
  let tx0 = null;
  document.addEventListener('touchstart', (e) => { tx0 = e.target.closest && e.target.closest('.ad-vw-swipe') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', (e) => { if (tx0 == null) return; const dx = e.changedTouches[0].clientX - tx0; tx0 = null; if (Math.abs(dx) > 40 && advOpen()) { vStep(dx < 0 ? 1 : -1); window.render(); } });
  function viewerHTML() {
    const v = S.adv, r = findRec(v.rid); if (!r) return '';
    const list = okIdx(r); if (!list.length) return '';
    if (!list.includes(v.idx)) v.idx = list[0];
    const p = list.indexOf(v.idx), n = list.length, D = designOf(r, v.idx), mob = isMob();
    const title = t('ad/vw-title', { i: v.idx + 1, n: 3, style: stName(D.style) });
    const modeSeg = window.seg([{ v: 'h5', label: t('ed/device-h5') }, { v: 'pc', label: t('ed/device-pc') }], v.mode, 'advMode', 'ad-vw-seg');
    const vw = mob ? Math.min(window.innerWidth - 32, 375) : 375;
    const stage = v.mode === 'pc'
      ? `<div class="ad-vw-pc" data-sk="advpc">${pcHtml(D, mob ? (window.innerWidth - 32) / 1920 : 0.42)}</div>`
      : `<div class="ad-vw-h5" data-sk="advh5" style="--k:${(vw / 375).toFixed(4)}"><div class="ad-mini is-long" style="--k:${(vw / 375).toFixed(4)}"><div class="ad-mini-in">${h5Html(D)}</div></div></div>`;
    const nav = (d, icn, dis) => `<button class="vw-nav ${d < 0 ? 'prev' : 'next'}" data-act="advStep" data-arg="${d}" ${dis ? 'disabled' : ''} aria-label="${d < 0 ? 'prev' : 'next'}">${ic(icn)}</button>`;
    const cap = `<div class="ad-vw-cap caption muted">${esc(stName(D.style))} · ${esc(icsName(D.iconStyle))} · ${esc(t('ad/vw-pal'))}<span class="ad-dots">${['primary', 'bg_1', 'accent_3', 'lead'].map((k) => `<i style="background:${D.theme[k]}"></i>`).join('')}</span></div>`;
    const goChat = v.from === 'history' ? `<button class="btn btn-secondary" data-act="advGoChat">${ic('arrow-right', 'ic-16')}${t('hist/go-chat')}</button>` : '';
    const acts = `<div class="ad-vw-acts">${goChat}<button class="btn btn-primary" data-act="adUse" data-arg="${r.id}:${v.idx}">${ic('plus', 'ic-16')}${t('ad/use')}</button></div>`;
    if (!mob) {
      return window.dialog(`<div class="dialog-head"><h3 class="ellipsis">${esc(title)}</h3>${modeSeg}<button class="ibtn ibtn-sm" data-act="advClose" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>
        <div class="ad-vw-stage ${v.mode === 'pc' ? 'is-pc' : ''}">${nav(-1, 'caret-left', p === 0)}${stage}${nav(1, 'caret-right', p >= n - 1)}</div>${cap}${acts}`, 'dialog-wide ad-viewer');
    }
    const dots = n > 1 ? `<div class="vw-dots">${list.map((_, k) => `<i class="${k === p ? 'is-on' : ''}"></i>`).join('')}</div>` : '';
    return `<div class="scrim" data-act="advClose"></div><div class="sheet is-full wb-full ad-viewer" role="dialog">
      <header class="wbf-head"><button class="ibtn" data-act="advClose" aria-label="${esc(t('common/close'))}">${ic('x')}</button><h3 class="ellipsis">${esc(title)}</h3><span class="wbf-sp"></span></header>
      <div class="ad-vw-top">${modeSeg}</div><div class="wbf-body ad-vw-swipe">${stage}</div>${dots}${cap}<div class="wbf-foot">${acts}</div></div>`;
  }
  // 历史生成页的缩略
  function tile(r, i, opts) {
    if (!r.sets || !r.sets[i] || r.sets[i].st !== 'ok') return '';
    return `<div class="tile ad-tile ${opts && opts.sm ? 'is-sm' : ''}">${mini(designOf(r, i), 0.3)}</div>`;
  }

  // 缩略格宽度随页面变化：渲染后按格子实际宽度定缩放，整页横向铺满
  const fitTiles = () => document.querySelectorAll('.ad-tile > .ad-mini').forEach((m) => { const w = m.parentElement.clientWidth; if (w) m.style.setProperty('--k', (w / 375).toFixed(4)); });
  window.AFTER_RENDER.push(fitTiles); window.addEventListener('resize', fitTiles);
  // 下拉菜单靠右时不超出窗口（仍然向下展开）
  window.AFTER_RENDER.push(() => document.querySelectorAll('.ad-menu').forEach((m) => { m.style.transform = ''; const r = m.getBoundingClientRect(); const over = r.right - (window.innerWidth - 8); if (over > 0) m.style.transform = `translateX(${-Math.min(over, Math.max(0, r.left - 8))}px)`; }));
  // 首页 / 工作台 / 历史等外壳页的浮层
  window.adOverlays = function () {
    let h = '';
    const q = S.ad;
    const sh = (title, body, cls = '') => window.sheet(`<div class="sheet-head"><h3>${title}</h3><button class="ibtn ibtn-sm ibtn-secondary" data-act="closeAll" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>${body}`, 'ad-sheet ' + cls);
    if (S.sheet === 'adStyle') h += sh(t('ad/opt-style'), `<div class="ad-st-grid">${STYLES.map((k) => `<button class="ad-scard ${q.style === k ? 'is-on' : ''}" data-act="adStyle" data-arg="${k}">${styleThumb(k)}<b>${esc(stName(k))}</b><small>${esc(t('ad/st-' + k + '-d'))}</small></button>`).join('')}</div>`);
    if (S.sheet === 'adIcs') h += sh(t('ad/opt-ics'), icsItems('adIcs', q));
    if (S.sheet === 'adColor') h += sh(t('ad/opt-color'), colorItems('adC', q));
    if (S.sheet === 'adRef' && q.refSt.src) h += sh(esc(q.refSt.name || t('ad/ref-slot')), `<img class="ref-big" src="${esc(q.refSt.src)}" alt="">${q.ref.length ? `<div class="ad-picked">${t('ad/picked')}<span class="ad-dots">${q.ref.map((c) => `<i style="background:${c}"></i>`).join('')}</span></div>` : ''}<div class="sheet-btns"><button class="btn btn-secondary" data-act="adRefPick">${t('composer/ref-change')}</button><button class="btn btn-outline is-danger-outline" data-act="adRefRm">${t('composer/ref-remove')}</button></div>`, 'is-ref');
    const r = findRec(S.adCancelRid);
    if (S.dialog === 'adcancel' && r) h += window.dialog(cancelBody('adCancelOk', 'closeAll', okIdx(r).length), 'dialog-sm');
    if (S.sheet === 'adcancel' && r) h += window.sheet(cancelBody('adCancelOk', 'closeAll', okIdx(r).length));
    if (advOpen()) h += viewerHTML(); else if (S.adv) S.adv = null; // Esc / 遮罩关掉后清状态
    return h;
  };
  // 风格缩略（切图 slice/style/<key> 的原型版）
  function styleThumb(k) {
    const p = ST[k].pal, c = ST[k].corners[0] * 4;
    return `<span class="ad-sthumb" style="background:${p[6]};--r:${c}px"><i class="t" style="background:${p[7]};border-bottom:1px solid ${p[5]}"><em style="background:${p[0]}"></em></i><i class="b" style="background:linear-gradient(120deg,${p[0]},${mix(p[0], p[6], 0.55)})"></i><i class="j" style="background:${p[0]}"><em style="background:${best(p[0], [p[7], p[1]])}"></em></i><span class="n">${[0, 1, 2, 3].map(() => `<em style="background:${p[0]}"></em>`).join('')}</span><span class="c">${[0, 1, 2].map(() => `<em style="background:${p[7]};border:1px solid ${p[5]}"></em>`).join('')}</span></span>`;
  }

  // ======================================================================
  // AD-03 编辑器「AI 一键设计」
  // ======================================================================
  function entryCard() {
    return `<button class="ad-entry" data-act="adEOpen">${ic('sparkle-fill', 'ad-entry-ic')}<span class="tx"><b>${t('ad/e-title')}</b><small>${t('ad/e-desc')}</small></span>${ic('caret-right', 'ic-16 faint')}</button>`;
  }
  A.adEOpen = () => {
    const x = X(), E = x.E;
    const st = E.D.style && ST[E.D.style] ? E.D.style : 'platinum';
    E.adp = { stage: 'idle', p: newParams({ style: st, ics: E.D.iconStyle || ST[st].ics, follow: !E.D.iconStyle }), sets: [], pick: null, progress: 0, seed: 0, kept: x.customCount() };
    E.sel = null; E.keys = null; E.picker = null; E.ai = null; S.menu = null;
    if (edMob()) E.mpanel = 'ad';
  };
  const P = () => X().E.adp;
  A.adEStyle = (k) => { const q = P().p; if (!ST[k]) return false; q.style = k; if (q.follow) q.ics = ST[k].ics; };
  A.adEIcs = (k) => { const q = P().p; if (k === 'follow') { q.follow = true; q.ics = ST[q.style].ics; } else { q.follow = false; q.ics = k; } };
  A.adEMode = (m) => { const q = P().p; if (m === 'ref' && !(q.ref && q.ref.length)) { window.toast(t('ad/c-ref-none'), { info: true }); return false; } q.colorMode = m; q.colorTouched = true; };
  A.adEHex = (c) => { const q = P().p; q.colorMode = 'hex'; q.hex = c; q.colorTouched = true; };
  I.adEPrompt = (v) => { P().p.prompt = v; return false; };
  A.adERefPick = () => { const q = P().p; window.refPick(q.refSt, () => afterRef(q)); return false; };
  A.adERefRm = () => { const q = P().p; q.refSt = { src: null, name: '', uploading: false, pct: 0 }; q.ref = []; if (q.colorMode === 'ref') q.colorMode = 'style'; };
  A.adERefCancel = () => { window.refCancel(P().p.refSt); };
  A.adERefView = () => A.adERefPick();
  A.adEGen = () => {
    const a = P(); if (!a || a.stage === 'gen') return false;
    if (a.p.refSt.uploading) { window.toast(t('ad/wait-upload'), { info: true }); return false; }
    const p = params(a.p);
    window.costConfirm({ title: t('ad/confirm-title'), body: t('ad/confirm-body-ed', { style: stName(p.style), ics: icsName(p.ics) }), cost: AD_COST, okLabel: t('ad/confirm-ok'), onOk: () => edStart(a, p, true) });
  };
  let edTimer = null;
  function edStart(a, p, useFlag) {
    const x = X(); if (x.E.adp !== a) return;
    a.stage = 'gen'; a.pick = null; a.progress = 0; a.fail = failMode(p.prompt, useFlag); a.seed = (a.seed || 0) + (a.sets.length ? 1 : 0); a.gp = p; a.charged = 0;
    a.sets = [{ st: 'pend' }, { st: 'pend' }, { st: 'pend' }]; a.kept = x.customCount();
    clearInterval(edTimer);
    const start = Date.now();
    edTimer = setInterval(() => {
      if (X().E.adp !== a || a.stage !== 'gen') { clearInterval(edTimer); return; }
      a.progress = Math.min(100, Math.round(((Date.now() - start) / 4500) * 100));
      let ch = false;
      TH.forEach((th, i) => { if (a.progress >= th && a.sets[i].st === 'pend') { ch = true; if (a.fail === 'all' || (a.fail === 'part' && i === 1)) a.sets[i].st = 'fail'; else a.sets[i] = { st: 'ok', D: mergeInto(X().E.D, buildDesign(p, i, a.seed, 'editor')).D }; } });
      document.querySelectorAll('[data-adeprog]').forEach((n) => { n.textContent = t('ad/gen-ing', { p: a.progress }); });
      document.querySelectorAll('[data-adebar]').forEach((n) => { n.style.width = a.progress + '%'; });
      if (a.progress >= 100) { clearInterval(edTimer); edFinish(a); ch = true; }
      if (ch && window.S.route === 'editor') window.render();
    }, 200);
  }
  function edFinish(a) {
    const x = X(); const ok = a.sets.filter((s) => s.st === 'ok').length;
    const style = { k: 'ad/st-' + a.gp.style };
    if (ok) {
      a.stage = 'done';
      if (!a.charged) { x.pay(AD_COST, 'design', { style, n: ok }); a.charged = AD_COST; }
      x.notice({ kind: ok === 3 ? 'done' : 'partial', cat: 'gen', title: ok === 3 ? { k: 'ad/n-done', v: { style } } : { k: 'ad/n-partial', v: { d: ok, f: 3 - ok } }, body: { k: 'ad/n-ed-d', v: { name: x.E.name } } });
    } else {
      a.stage = 'failed';
      zeroLedger('design-fail', { style });
      x.notice({ kind: 'failed', cat: 'gen', title: { k: 'ad/n-failed' }, body: { k: 'ad/n-failed-d' } });
    }
  }
  A.adECancel = () => {
    const a = P(); if (!a || a.stage !== 'gen') return false;
    const ok = a.sets.filter((s) => s.st === 'ok').length;
    if (ok) { X().E.dlg = 'adcancel'; return; }
    edCancelNow(a);
  };
  function edCancelNow(a) {
    clearInterval(edTimer); const ok = a.sets.filter((s) => s.st === 'ok').length;
    a.sets.forEach((s, i) => { if (s.st === 'pend') a.sets[i] = { st: 'cancel' }; });
    a.stage = ok ? 'done' : 'idle'; a.cancelN = ok;
    if (ok && !a.charged) { X().pay(AD_COST, 'design-cancel', { style: { k: 'ad/st-' + a.gp.style }, n: ok }); a.charged = AD_COST; }
    if (!ok) a.sets = [];
    window.toast(ok ? t('ad/cancelled-paid', { d: ok, c: AD_COST }) : t('ad/cancelled-free'), { info: true });
  }
  A.adECancelOk = () => { X().E.dlg = null; const a = P(); if (a && a.stage === 'gen') edCancelNow(a); };
  A.adECancelKeep = () => { X().E.dlg = null; };
  A.adERetry = (i) => {
    const a = P(); if (!a || !a.sets[+i] || a.sets[+i].st !== 'fail') return false;
    const willFail = window.takeFail(''); a.sets[+i] = { st: 'gen' };
    setTimeout(() => { if (P() !== a || a.sets[+i].st !== 'gen') return; a.sets[+i] = willFail ? { st: 'fail' } : { st: 'ok', D: mergeInto(X().E.D, buildDesign(a.gp, +i, a.seed, 'editor')).D }; window.toast(willFail ? t('ad/retry-fail') : t('ad/retry-ok', { i: +i + 1 }), { info: willFail }); window.render(); }, 1800);
  };
  // 点候选 → 画布实时预览（不进撤销）；再点一次取消预览
  A.adEPick = (i) => { const a = P(); if (!a || !a.sets[+i] || a.sets[+i].st !== 'ok') return false; a.pick = a.pick === +i ? null : +i; };
  A.adEPreview = () => { const a = P(); if (!a || a.pick == null) return false; X().E.preview = true; };
  A.adEApply = () => {
    const x = X(), E = x.E, a = E.adp; if (!a || a.pick == null || !a.sets[a.pick] || !a.sets[a.pick].D) return false;
    const nd = clone(a.sets[a.pick].D);
    x.commit(() => { E.D = nd; });
    x.fixSlide(); E.adp = null; E.adBar = { ics: nd.iconStyle }; if (E.mpanel === 'ad') E.mpanel = null;
    clearInterval(edTimer);
    window.toast(t('ad/applied'), x.undoOpt());
  };
  A.adEDiscard = () => { const E = X().E; clearInterval(edTimer); const had = E.adp && E.adp.pick != null; E.adp = null; if (E.mpanel === 'ad') E.mpanel = null; if (had) window.toast(t('ad/discarded'), { info: true }); };
  A.adEClose = () => { const a = P(); if (a && a.stage === 'gen') { const ok = a.sets.filter((s) => s.st === 'ok').length; if (ok) { X().E.dlg = 'adcancel'; return; } edCancelNow(a); } A.adEDiscard(); };
  function edPanel(mobile) {
    const x = X(), a = P(), q = a.p, th = (a.real || x.E.D).theme;
    const gen = a.stage === 'gen', can = window.canAfford(AD_COST);
    const head = mobile ? '' : `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="adEClose" title="${esc(t('ed/tpl-back'))}" aria-label="${esc(t('ed/tpl-back'))}">${ic('caret-left')}</button>${t('ad/e-title')}</h2>`;
    const ref = window.refSlot(q.refSt, 'adERef').split(t('composer/ref-slot')).join(t('ad/ref-slot')).split(t('composer/ref-hint')).join(t('ad/ref-hint'));
    const sec = (lab, body, v) => `<div class="p-sec"><div class="lab">${lab}${v ? `<span class="v">${v}</span>` : ''}</div>${body}</div>`;
    const refSec = sec(t('ad/ref-slot'), `<div class="ad-eref">${ref}<div class="caption muted">${q.ref.length ? `${t('ad/picked')}<span class="ad-dots">${q.ref.map((c) => `<i style="background:${c}"></i>`).join('')}</span>` : t('ad/ref-hint')}</div></div>`);
    const styles = sec(t('ad/opt-style'), `<div class="ad-st-grid">${STYLES.map((k) => `<button class="ad-scard ${q.style === k ? 'is-on' : ''}" data-act="adEStyle" data-arg="${k}" ${gen ? 'disabled' : ''}>${styleThumb(k)}<b>${esc(stName(k))}</b></button>`).join('')}</div>`);
    const c0 = curPrimary(q);
    const icsSec = sec(t('ad/opt-ics'), `<div class="ad-chips"><button class="chip ${q.follow ? 'is-on' : ''}" data-act="adEIcs" data-arg="follow">${esc(t('ad/ics-follow-s', { name: icsName(ST[q.style].ics) }))}</button>${ICS.map((k) => `<button class="chip ad-chip ${!q.follow && q.ics === k ? 'is-on' : ''}" data-act="adEIcs" data-arg="${k}">${icsDemo(k, c0)}${esc(icsName(k))}</button>`).join('')}</div>`);
    const sug = x.SUGGEST, cur = (q.colorMode === 'hex' || q.colorMode === 'custom') ? (q.hex || '').toLowerCase() : '';
    const colorSec = sec(t('ad/opt-color'), `<div class="ad-chips">${q.ref.length ? `<button class="chip ${q.colorMode === 'ref' ? 'is-on' : ''}" data-act="adEMode" data-arg="ref"><span class="ad-dots">${q.ref.map((c) => `<i style="background:${c}"></i>`).join('')}</span>${t('ad/c-ref')}</button>` : ''}<button class="chip ${q.colorMode === 'style' ? 'is-on' : ''}" data-act="adEMode" data-arg="style"><span class="ad-dots"><i style="background:${ST[q.style].prim[0]}"></i></span>${t('ad/c-style')}</button></div>
      <div class="ad-sug">${sug.map((c) => `<button class="ad-sugc ${cur === c ? 'is-on' : ''}" style="background:${c}" data-act="adEHex" data-arg="${c}" title="${c}" aria-label="${c}"></button>`).join('')}<label class="ad-sugc ad-cpick ${q.colorMode === 'custom' ? 'is-on' : ''}" title="${esc(t('ad/c-custom'))}" style="${q.colorMode === 'custom' ? `background:${q.hex}` : ''}"><input type="color" value="${esc(q.custom || '#c8a96a')}" data-ad-custom="adE" aria-label="${esc(t('ad/c-custom'))}"></label></div>`);
    const promptSec = sec(t('ad/e-prompt'), `<textarea class="input ad-eprompt" rows="2" data-input="adEPrompt" placeholder="${esc(t('ad/placeholder'))}">${esc(q.prompt)}</textarea>`);
    const kept = a.kept ? `<div class="p-note">${ic('lock-fill', 'ic-16')}${t('ad/kept', { n: a.kept })}</div>` : '';
    const genBtn = can ? `<button class="btn btn-primary btn-block ${gen ? 'is-disabled' : ''}" data-act="adEGen">${ic('sparkle-fill', 'ic-16')}${t(a.sets.length ? 'ad/e-gen-again' : 'ad/e-gen', { c: AD_COST })}</button>`
      : `<div class="ai-low">${t('ad/low', { c: AD_COST })} · <button data-act="edTopup">${t('confirm/topup')}</button></div>`;
    let res = '';
    if (a.stage !== 'idle' || a.sets.length) {
      const cards = a.sets.map((s, i) => {
        if (s.st === 'ok') return `<button class="ad-cand ${a.pick === i ? 'is-on' : ''}" data-act="adEPick" data-arg="${i}" aria-label="${esc(t('ad/set-n', { i: i + 1 }))}">${mini(s.D, mobile ? 0.28 : 0.24)}<span class="ad-no">${i + 1}</span>${a.pick === i ? `<span class="ad-ck">${ic('eye-fill', 'ic-16')}</span>` : ''}</button>`;
        if (s.st === 'fail') return `<div class="ad-cand is-fail">${ic('x-circle-fill', 'ic-24')}<button class="btn btn-secondary btn-sm" data-act="adERetry" data-arg="${i}">${t('ad/retry-free')}</button></div>`;
        if (s.st === 'cancel') return `<div class="ad-cand is-void">${ic('stop-circle-fill', 'ic-24')}</div>`;
        return `<div class="ad-cand skeleton">${s.st === 'gen' ? '<i class="wb-spin"></i>' : ''}</div>`;
      }).join('');
      const ok = a.sets.filter((s) => s.st === 'ok').length, f = a.sets.filter((s) => s.st === 'fail').length;
      let st = '';
      if (gen) st = `<div class="rec-note">${ic('clock', 'ic-16')}<span data-adeprog>${t('ad/gen-ing', { p: a.progress })}</span></div><div class="progress"><i style="width:${a.progress}%" data-adebar></i></div><button class="btn btn-secondary btn-sm btn-block" style="margin-top:10px" data-act="adECancel">${ic('stop-circle-fill', 'ic-16')}${t('rec/cancel')}</button>`;
      else if (a.stage === 'failed') st = `<div class="notice is-err">${ic('x-circle-fill')}<div>${t('ad/failed-all')}</div></div>`;
      else {
        st = f ? `<div class="notice is-warn">${ic('warning-circle-fill')}<div>${t('ad/partial-n', { d: ok, f, c: AD_COST })}</div></div>` : a.cancelN ? `<div class="notice">${ic('stop-circle-fill')}<div>${t('ad/cancelled-paid', { d: a.cancelN, c: AD_COST })}</div></div>` : '';
        st += `<div class="p-note">${t(a.pick == null ? 'ad/pick-hint' : 'ad/previewing', { i: (a.pick || 0) + 1 })}</div>`;
        st += `<div class="ad-eacts"><button class="btn btn-primary ${a.pick == null ? 'is-disabled' : ''}" data-act="adEApply">${t('ad/apply')}</button>${mobile ? `<button class="btn btn-secondary ${a.pick == null ? 'is-disabled' : ''}" data-act="adEPreview">${ic('eye-fill', 'ic-16')}${t('ad/full-preview')}</button>` : ''}<button class="btn btn-secondary" data-act="adEDiscard">${t('ad/discard')}</button></div>`;
      }
      res = `<div class="p-sec ad-eres"><div class="lab">${t('ad/e-results')}</div><div class="ad-cands">${cards}</div>${st}</div>`;
    }
    return `${head}<div class="ad-epanel">${res}${refSec}${styles}${icsSec}${colorSec}${promptSec}${kept}<div class="ad-egen">${genBtn}<div class="caption faint">${t('ad/e-cost', { c: AD_COST, b: num(S.credits) })}</div></div></div>`;
  }
  function mSheet() {
    return `<div class="scrim" data-act="adEClose"></div><div class="sheet med-sheet is-full ad-msheet" data-sk="admsheet"><div class="sheet-head"><h3>${ic('sparkle-fill', 'ic-16 is-brand')} ${t('ad/e-title')}</h3><button class="ibtn ibtn-sm" data-act="adEClose" aria-label="${esc(t('ed/close'))}">${ic('x')}</button></div><div class="ad-mbody">${edPanel(true)}</div></div>`;
  }
  // 预览候选时：渲染那一刻把画布换成候选（不改 E.D，不进撤销、不保存）
  const view0 = window.VIEWS.editor;
  window.VIEWS.editor = function () {
    const x = X(), E = x.E, a = E.adp;
    if (!E.loading && a && a.pick != null && a.sets[a.pick] && a.sets[a.pick].D) {
      const real = E.D; a.real = real; E.D = a.sets[a.pick].D;
      try { return view0(); } finally { E.D = real; a.real = null; }
    }
    return view0();
  };
  // 预览中先应用或放弃，避免改到看不见的设计
  const guard = (name, allow) => { const f = A[name]; if (!f) return; A[name] = function (arg, el, e) { const E = X().E; if (E.adp && E.adp.pick != null && !(allow && allow(arg))) { window.toast(t('ad/preview-first'), { info: true }); return false; } return f.call(this, arg, el, e); }; };
  ['undo', 'redo', 'pick', 'togglePal', 'setPalette', 'edOpenTpl', 'openKeys', 'setLogin', 'setSide', 'addMenu', 'toggleHide', 'openExport', 'openChecks', 'setDevice', 'mDevice', 'nameEdit'].forEach((n) => guard(n));
  guard('mPanel', (id) => id === 'preview');
  const selMod0 = A.selMod;
  A.selMod = function (id, el, e) {
    const E = X().E;
    if (E.adp && id) { if (E.adp.pick != null || E.adp.stage === 'gen') { window.toast(t('ad/preview-first'), { info: true }); return false; } E.adp = null; if (E.mpanel === 'ad') E.mpanel = null; }
    return selMod0.call(this, id, el, e);
  };
  const mClose0 = A.mClose;
  A.mClose = function () { if (X().E.mpanel === 'ad') return A.adEClose(); return mClose0.apply(this, arguments); };
  const edBack0 = A.edBack;
  A.edBack = function () { const E = X().E; if (E.adp) { clearInterval(edTimer); E.adp = null; } E.adMod = null; return edBack0.apply(this, arguments); };

  // 已应用提示条：生成整套图标（打开 ED-04 面板并预填图标风格）
  function edBar() {
    const E = X().E; if (!E.adBar || E.adp) return '';
    return `<div class="ad-bar" data-stop>${ic('sparkle-fill', 'ic-16')}<span class="tx ellipsis">${t('ad/bar-applied')}</span><button class="ad-bar-go" data-act="adBarGo">${esc(t('ad/bar-icons', { ics: icsName(E.adBar.ics) }))}</button><button class="ibtn ibtn-sm" data-act="adBarX" aria-label="${esc(t('common/close'))}">${ic('x', 'ic-16')}</button></div>`;
  }
  A.adBarX = () => { X().E.adBar = null; };
  A.adBarGo = () => {
    const E = X().E; const ics = E.adBar && E.adBar.ics; E.adBar = null; E.device = 'h5';
    // 打开统一 AI 面板（帐户栏 · 整套入口图标），预选跟 AI 设计同一种图标风格（旧矢量款式映射到统一款式）
    selMod0('midnav'); A.aigOpen('midnav|icons||set');
    const st = { glass: 'glossy', metal: 'blackgold', '3d': 'festive' }[ics] || ics;
    if (st && window.AIG && window.AIG.cur()) A.aigStyle(st);
    if (edMob()) E.mpanel = 'module';
  };

  // ======================================================================
  // AD-04 单模块「AI 重新生成」
  // ======================================================================
  function toolBtn(id, mobile) {
    const x = X(); const b = x.baseName(id); if (!SUP.includes(b)) return '';
    const busy = x.E.adMod && x.E.adMod.id === id;
    // 「换样式」= 整模块重新配样式 / 配色，不是生成图片（生成图片走 ✦ AI 统一面板），图标用 shuffle 区分（docs/ai-unified.md 第 7 节）
    const label = t('ad/mod-regen', { c: AD_MOD_COST });
    if (mobile) return `<button class="m-hbtn ad-mbtn ${busy ? 'is-busy' : ''}" data-act="adMod" data-arg="${id}" title="${esc(label)}">${ic('shuffle')}<span>${t('aig/restyle', { c: AD_MOD_COST })}</span></button>`; // 手机标题栏写出价钱（Figma M-01）
    return `<button class="ad-tool" data-act="adMod" data-arg="${id}" data-stop title="${esc(label)}">${ic('shuffle')}${t('aig/restyle', { c: AD_MOD_COST })}</button>`;
  }
  function modMask(id) {
    const E = X().E; if (!E.adMod || E.adMod.id !== id) return '';
    return `<div class="ad-mask" data-act="adNoop" data-stop><i class="wb-spin"></i><span>${t('ad/mod-ing')}</span><button data-act="adModCancel" data-stop>${t('confirm/cancel')}</button></div>`;
  }
  A.adNoop = () => false;
  // 花点数先说价钱：确认框（余额不足时确认框自己变「去充值」）
  A.adMod = (id) => {
    const x = X(), E = x.E; if (E.adMod) return false;
    window.costConfirm({ title: t('aig/restyle-title'), body: t('aig/restyle-body'), cost: AD_MOD_COST, okLabel: t('aig/restyle-ok'), star: true, icon: 'shuffle', onOk: () => adModRun(id) }); // Figma G1-15 / M-14
  };
  function adModRun(id) {
    const x = X(), E = x.E; if (E.adMod) return;
    if (!window.canAfford(AD_MOD_COST)) { window.lowBalance(AD_MOD_COST); return; }
    S.menu = null; if (edMob() && E.mpanel === 'module') E.mpanel = null; // 手机：收起模块面板，画布上能看到生成中和取消
    const tok = {}; E.adMod = { id, tok };
    const willFail = x.fail();
    setTimeout(() => {
      if (!E.adMod || E.adMod.tok !== tok) return;
      E.adMod = null;
      if (willFail) { window.toast(t('ad/mod-failed'), { info: true }); window.render(); return; }
      const name = x.modName(id);
      x.commit(() => { modVariant(id, E.D); });
      x.fixSlide();
      x.pay(AD_MOD_COST, 'design-mod', { mod: name });
      window.toast(t('ad/mod-done', { m: name, c: AD_MOD_COST }), x.undoOpt());
      window.render();
    }, 1600);
  }
  A.adModCancel = () => { const E = X().E; if (!E.adMod) return false; E.adMod = null; window.toast(t('ad/mod-cancelled'), { info: true }); };
  // 沿用当前设计的风格 / 主色，只改该模块已有的样式 / 颜色参数（保证和原来不同）
  function modVariant(id, D) {
    const x = X(); const b = x.baseName(id); const th = D.theme; const st = ST[D.style] || null; const r = rng(Date.now() & 0xffff);
    const pick = (arr, cur) => { const o = arr.filter((v) => String(v) !== String(cur)); return (o.length ? o : arr)[Math.floor(r() * (o.length || arr.length))]; };
    const setEc = (id2, c) => { D.ec[id2] = c; D.baseEc = Object.assign({}, D.baseEc || {}, { [id2]: c }); };
    const m = D.m;
    if (b === 'banner') {
      const bf = st ? st.bf : 'saturate(1.1)';
      D.banner.slides = D.banner.slides.map((s, j) => Object.assign({}, s, { f: `${bf} hue-rotate(${Math.round(r() * 70 - 35) + j * 9}deg) brightness(${(0.9 + r() * 0.25).toFixed(2)})` }));
      D.banner.corner = pick([0, 8, 16], D.banner.corner); D.banner.ind = pick(['bars', 'dots'], D.banner.ind);
    } else if (b === 'jackpot') {
      m.jackpot.layout = pick(['flow', 'compact'], m.jackpot.layout); m.jackpot.corner = pick([0, 16, 32], m.jackpot.corner);
      const bg = pick([th.primary, th.accent_3, th.lead, mix(th.primary, th.lead, 0.4)], D.ec['jackpot.bg'] || th.primary);
      setEc('jackpot.bg', bg); const k = best(bg, [th.bg_2, th.lead, '#ffffff', '#111111']); setEc('jackpot.title', k); setEc('jackpot.amount', k);
    } else if (b === 'midnav') {
      m.midnav.per = pick([4, 5], m.midnav.per); m.midnav.size = pick([48, 57, 68], m.midnav.size);
      setEc('midnav.icon', pick([th.primary, th.accent_3, th.lead], D.ec['midnav.icon'] || th.primary));
    } else if (b === 'gamemenu') {
      m.gamemenu.style = pick(['tabs', 'icons'], m.gamemenu.style); m.gamemenu.shape = pick(['pill', 'square'], m.gamemenu.shape);
      const a = pick([th.primary, th.accent_3, th.lead], D.ec['gamemenu.active'] || th.primary); setEc('gamemenu.active', a); setEc('gamemenu.activeText', best(a, [th.bg_2, th.lead]));
    } else if (b === 'gamecards') {
      m.gamecards.cols = pick([2, 3, 4], m.gamecards.cols); m.gamecards.corner = pick([0, 20, 32], m.gamecards.corner); m.gamecards.gap = pick([12, 20, 32], m.gamecards.gap);
      const l = pick([th.accent_3, th.accent_2, th.primary], D.ec['gamecards.label'] || th.accent_3); setEc('gamecards.label', l); setEc('gamecards.labelText', best(l, [th.bg_2, th.lead]));
    } else if (b === 'footer') {
      m.footer.align = pick(['center', 'left'], m.footer.align);
      const bg = pick([th.bg_1, th.bg_2, th.lead], D.ec['footer.bg'] || th.bg_1); setEc('footer.bg', bg); setEc('footer.text', best(bg, [th.neutral_2, th.bg_2, th.lead])); setEc('footer.link', best(bg, [th.neutral_1, th.bg_2, th.lead]));
    } else if (b === 'sidebar') {
      m.sidebar.style = pick(['list', 'grid'], m.sidebar.style); m.sidebar.width = pick([62, 75], m.sidebar.width);
      const a = pick([th.primary, th.accent_3, th.lead], D.ec['sidebar.itemActive'] || th.primary); setEc('sidebar.itemActive', a); setEc('sidebar.textActive', best(a, [th.bg_2, th.lead]));
    } else if (b === 'bottomnav') {
      m.bottomnav.style = pick(['regular', 'raised'], m.bottomnav.style); m.bottomnav.h = pick([98, 120, 140], m.bottomnav.h);
      setEc('bottomnav.active', pick([th.primary, th.accent_3, th.lead], D.ec['bottomnav.active'] || th.primary));
    } else if (b === 'topbar') {
      D.tb.h = pick([80, 90, 100], D.tb.h); // 顶部栏高度规范 70–100
      const dark = lum(th.bg_1) < 0.2; const cur = D.tb.colors.bg ? (D.tb.colors.bg === th.primary ? 'brand' : 'deep') : 'plain';
      D.tb.colors = tbColors(pick(['plain', 'brand', 'deep'], cur), th, dark);
    }
  }

  // ======================================================================
  // AD-05 Figma 源文件：源文件包含 / 查看结构 / 交付检查
  // ======================================================================
  const inPg = (D, b) => D.order.some((x) => x.split('~')[0] === b && !D.hidden[x]);
  // 切图清单（数量按当前设计实时算：隐藏的模块不算、Banner 张数按实际）
  function slices(D) {
    const x = X(), out = []; const vis = (b) => D.m[b].items.filter((it) => it.on);
    const add = (grp, name, pw, ph, scale, thumb) => out.push({ grp, name, pw, ph, lw: Math.round(pw / scale), lh: Math.round(ph / scale), scale, thumb });
    if (!D.hidden.topbar) {
      if (D.tb.items.logo) add('topbar', 'Logo', 600, 100, 2, { k: 'logo' });
      if (D.tb.items.side) add('topbar', t('ed/tb-sideicon'), 48, 48, 2, { k: 'glyph', i: 'list' });
      if (D.tb.items.search) add('topbar', t('ed/tb-search'), 48, 48, 2, { k: 'glyph', i: 'magnifying-glass' });
    }
    if (inPg(D, 'banner')) {
      const sz = x.BANNER[D.banner.size];
      const vs = D.banner.slides.filter((s) => !s.hid);
      vs.forEach((s, i) => add('banner', `Banner H5 ${i + 1}`, s.w || sz.w, s.h || sz.h, 2, { k: 'slide', f: s.f, ok: s.w === sz.w && s.h === sz.h }));
      vs.forEach((s, i) => add('banner', `Banner PC ${i + 1}`, 1920, 564, 1, { k: 'slide', f: s.f, pc: true }));
    }
    if (inPg(D, 'jackpot')) add('jackpot', t('mp/jp-bg'), 702, 160, 2, { k: 'jack' });
    if (inPg(D, 'midnav')) vis('midnav').forEach((it) => add('midnav', window.MP.nm(it), 160, 140, 2, { k: 'icon', it, f: 'img' }));
    if (inPg(D, 'gamemenu')) vis('gamemenu').forEach((it) => { add('gamemenu', window.MP.nm(it) + ' · Default', 200, 152, 2, { k: 'icon', it, f: 'img' }); add('gamemenu', window.MP.nm(it) + ' · Active', 200, 152, 2, { k: 'icon', it, f: 'imgOn', on: true }); });
    if (inPg(D, 'gamecards')) add('gamecards', t('mp/gc-fallback'), 260, 260, 2, { k: 'glyph', i: 'game-controller-fill' });
    if (!D.hidden.sidebar) { if (D.m.sidebar.headOn !== false) add('sidebar', t('mp/sd-head'), 540, 200, 2, { k: 'jack' }); vis('sidebar').forEach((it) => add('sidebar', window.MP.nm(it), 120, 120, 2, { k: 'icon', it, f: 'img' })); }
    if (!D.hidden.bottomnav) vis('bottomnav').forEach((it) => { add('bottomnav', window.MP.nm(it) + ' · Default', 140, 140, 2, { k: 'icon', it, f: 'img', off: true }); add('bottomnav', window.MP.nm(it) + ' · Active', 140, 140, 2, { k: 'icon', it, f: 'imgOn', on: true }); });
    return out;
  }
  // 组件：九个模块各一个组件（或组件集），变体按当前设计
  function comps(D) {
    const L = [];
    const c = (b, name, vars) => L.push({ b, name, vars });
    if (!D.hidden.topbar) c('topbar', t('mod/topbar'), [t('ed/signed-out'), t('ed/signed-in')]);
    if (inPg(D, 'banner')) c('banner', 'Banner', ['Size=' + t('ed/banner-large'), 'Size=' + t('ed/banner-general'), 'Size=' + t('ed/banner-small'), 'Indicator=' + D.banner.ind]);
    if (inPg(D, 'jackpot')) c('jackpot', t('cat/jackpot'), [t('mp/lay-flow'), t('mp/lay-compact')]);
    if (inPg(D, 'midnav')) c('midnav', t('mod/midnav'), [t('ad/v-item'), t('ad/v-whole')]);
    if (inPg(D, 'gamemenu')) c('gamemenu', t('mod/gamemenu'), [t('ad/v-item') + ' · Default', t('ad/v-item') + ' · Active', t('ad/v-whole')]);
    if (inPg(D, 'gamecards')) c('gamecards', t('mod/gamecards'), [t('ad/v-card'), t('ad/v-card-tag')]);
    if (inPg(D, 'footer')) c('footer', t('cat/footer'), [t('ad/v-whole')]);
    if (!D.hidden.sidebar) c('sidebar', t('mod/sidebar'), [t('ad/v-item') + ' · Default', t('ad/v-item') + ' · Active', t('ad/v-whole')]);
    if (!D.hidden.bottomnav) c('bottomnav', t('mod/bottomnav'), [t('ad/v-item') + ' · Default', t('ad/v-item') + ' · Active', t('ad/v-whole')].concat(D.m.bottomnav.style === 'raised' ? [t('mp/bn-raised')] : []));
    return L;
  }
  function allKeys(D) {
    const MP = window.MP, x = X(); const base = x.baseOf(D);
    const rows = MP.KEYS68.base.map(([k]) => ({ k, base: true, v: MP.resolveKey(k, D.theme, D.ec), use: t('ed/key-' + k), lock: D.theme[k].toLowerCase() !== base[k].toLowerCase() }))
      .concat(MP.KEYS68.ext.map((e) => ({ k: e[0], base: false, v: MP.resolveKey(e[0], D.theme, D.ec), use: e[3], lock: !!D.ec['key:' + e[0]] })));
    return rows;
  }
  const PAGES = ['cover', 'colors', 'slices', 'comps', 'pages'];
  function counts(D) {
    const sl = slices(D), cp = comps(D);
    return { slices: sl.length, keys: 68, comps: cp.length, vars: cp.reduce((a, c) => a + c.vars.length, 0), pages: 3 };
  }
  function figIncl() {
    const E = X().E, D = E.D, n = counts(D), open = !!E.adFig;
    const rows = [['cover', t('ad/fp-cover-n', { n: n.slices })], ['colors', t('ad/fp-colors-n', { n: n.keys })], ['slices', t('ad/fp-slices-n', { n: n.slices })], ['comps', t('ad/fp-comps-n', { n: n.comps, m: n.vars })], ['pages', t('ad/fp-pages-n')]];
    return `<div class="ad-incl"><button class="ad-incl-hd" data-act="adFigToggle" aria-expanded="${open}">${ic('tree-structure-fill', 'ic-16')}<span class="grow">${t('ad/fp-incl')}</span><span class="caption faint">${t('ad/fp-incl-sum', { s: n.slices, c: n.comps })}</span>${ic(open ? 'caret-up' : 'caret-down', 'ic-16')}</button>
      ${open ? `<ol class="ad-incl-list">${rows.map(([k, v], i) => `<li><span class="no">0${i}</span><b>${t('ad/fp-' + k)}</b><span class="caption muted">${esc(v)}</span></li>`).join('')}<li class="note caption faint">${t('ad/fp-incl-note')}</li></ol>` : ''}</div>`;
  }
  A.adFigToggle = () => { const E = X().E; E.adFig = !E.adFig; };
  const figViewBtn = () => `<button class="btn btn-ghost btn-sm ad-figv" data-act="adFigOpen">${ic('tree-structure-fill', 'ic-16')}<span>${t('ad/fp-view')}</span></button>`;
  A.adFigOpen = () => { const E = X().E; E.adFigPg = E.adFigPg || 'cover'; E.adFigAt = E.adFigAt || Date.now(); E.dlg = 'adfig'; };
  A.adFigPg = (k) => { X().E.adFigPg = k; };
  function slThumb(s, D) {
    const th = s.thumb;
    if (th.k === 'logo') return `<span class="ad-slt is-logo"><img src="assets/logo-orb.webp" alt="" style="filter:${D.tb.logoF || 'none'}">星河体育</span>`;
    if (th.k === 'slide') return `<span class="ad-slt is-slide ${th.pc ? 'is-pc' : ''}" style="${window.fxStyle(th.f)}"></span>`;
    if (th.k === 'jack') return `<span class="ad-slt is-jack" style="background:linear-gradient(135deg,${D.ec['jackpot.bg'] || D.theme.primary},${mix(D.ec['jackpot.bg'] || D.theme.primary, D.theme.bg_1, 0.5)})"></span>`;
    if (th.k === 'icon') { const src = th.it[th.f] || (th.f === 'imgOn' ? th.it.img : null); return `<span class="ad-slt is-icon ics-${D.iconStyle || 'fill'}" style="--o-primary:${th.off ? D.theme.neutral_2 : D.theme.primary};--o-accent_3:${D.theme.accent_3}"><span class="ib">${src ? `<img src="${src}" alt="">` : ic(th.it.i || 'sparkle-fill')}</span></span>`; }
    return `<span class="ad-slt is-glyph">${ic(th.i)}</span>`;
  }
  function figBody(mobile) {
    const x = X(), E = x.E, D = E.D, pg = E.adFigPg || 'cover', n = counts(D);
    const file = E.name.replace(/\s*·\s*/g, '-') + '.fig';
    const nav = PAGES.map((k, i) => { const cnt = { cover: '', colors: n.keys, slices: n.slices, comps: n.comps, pages: n.pages }[k]; return `<button class="ad-fnav ${pg === k ? 'is-on' : ''}" data-act="adFigPg" data-arg="${k}"><span class="no">0${i}</span><span class="grow ellipsis">${t('ad/fp-' + k)}</span>${cnt !== '' ? `<span class="n">${cnt}</span>` : ''}</button>`; }).join('');
    let body = '';
    if (pg === 'cover') {
      const sl = slices(D);
      const heroB = mix(D.theme.primary, D.theme.bg_1, 0.45); const heroInk = ['#111111', '#ffffff'].sort((p1, p2) => Math.min(contrast(heroB, p2), contrast(D.theme.primary, p2)) - Math.min(contrast(heroB, p1), contrast(D.theme.primary, p1)))[0];
      const info = [[t('ad/fc-project'), E.name], [t('ad/fc-level'), t('level/standard-title')], [t('ad/fc-style'), D.style ? stName(D.style) : t('template/' + D.template)], [t('ad/fc-ics'), icsName(D.iconStyle || 'fill')], [t('ad/fc-version'), 'v1.' + Math.max(0, (E.past || []).length)], [t('ad/fc-time'), window.fmtTime({ at: E.adFigAt || Date.now() })]];
      body = `<div class="ad-fcover" style="${x.themeStyle()}"><div class="ad-fc-hero" style="background:linear-gradient(135deg,${heroB},${D.theme.primary})"><b style="color:${heroInk}">${esc(E.name)}</b><span style="color:${heroInk}">Figma · ${esc(file)}</span></div>
        <dl class="ad-fc-info">${info.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
        <div class="ad-fh">${t('ad/fc-manifest')} <span class="caption faint">${t('ad/fc-manifest-n', { n: sl.length })}</span></div>
        <div class="ad-mf" data-sk="admf"><table><thead><tr><th>${t('ad/fc-name')}</th><th>logicalW×H</th><th>pixelW×H</th><th>scale</th></tr></thead><tbody>${sl.map((s) => `<tr class="${s.thumb.ok === false ? 'is-bad' : ''}"><td class="ellipsis">${esc(s.name)}</td><td>${s.lw}×${s.lh}</td><td>${s.pw}×${s.ph}</td><td>@${s.scale}x</td></tr>`).join('')}</tbody></table></div>`;
    } else if (pg === 'colors') {
      const rows = allKeys(D); const locked = rows.filter((r) => r.lock).length;
      const grp = (title, list) => `<div class="ad-fh">${title} <span class="caption faint">${list.length}</span></div><div class="ad-keys">${list.map((r) => `<div class="ad-key ${r.lock ? 'is-lock' : ''}"><i style="background:${r.v}"></i><span class="k ellipsis">${esc(r.base ? 'base/' + r.k : 'ext/' + r.k)}</span><span class="v">${esc(String(r.v).toUpperCase())}${r.lock ? ` ${ic('lock-fill', 'ic-12')}` : ''}</span><small class="ellipsis" title="${esc(r.use)}">${esc(r.use)}</small></div>`).join('')}</div>`;
      body = `<p class="caption muted ad-fp-sub">${t('ad/fk-sub', { n: rows.length, l: locked })}</p>${grp(t('ad/fk-base'), rows.filter((r) => r.base))}${grp(t('ad/fk-ext'), rows.filter((r) => !r.base))}`;
    } else if (pg === 'slices') {
      const sl = slices(D); const groups = [...new Set(sl.map((s) => s.grp))];
      const gname = (g) => (g === 'banner' ? 'Banner' : g === 'jackpot' ? t('cat/jackpot') : g === 'footer' ? t('cat/footer') : t('mod/' + g));
      body = `<p class="caption muted ad-fp-sub">${t('ad/fs-sub', { n: sl.length })}</p>` + groups.map((g) => `<div class="ad-fh">${esc(gname(g))} <span class="caption faint">${sl.filter((s) => s.grp === g).length}</span></div><div class="ad-slices ${g === 'banner' ? 'is-wide' : ''}">${sl.filter((s) => s.grp === g).map((s) => `<div class="ad-sl ${s.thumb.ok === false ? 'is-bad' : ''}">${slThumb(s, D)}<span class="nm ellipsis" title="${esc(s.name)}">${esc(s.name)}</span><span class="sz">${s.lw}×${s.lh} · @${s.scale}x ${s.pw}×${s.ph}</span></div>`).join('')}</div>`).join('');
    } else if (pg === 'comps') {
      const cp = comps(D);
      const prev = (b) => { if (['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer'].includes(b)) { const id = D.order.find((o) => o.split('~')[0] === b && !D.hidden[o]); return `<div class="ad-cprev"><div class="h5 ${D.iconStyle ? 'ics-' + D.iconStyle : ''}" style="${x.themeStyle()}">${strip(withD(D, () => x.modHtml(id)))}</div></div>`; } return `<div class="ad-cprev is-ic">${ic({ topbar: 'list', sidebar: 'sidebar-simple', bottomnav: 'squares-four-fill' }[b] || 'diamonds-four-fill', 'ic-24')}</div>`; };
      body = `<p class="caption muted ad-fp-sub">${t('ad/fm-sub', { n: cp.length, m: n.vars })}</p><div class="ad-comps">${cp.map((c) => `<div class="ad-comp">${prev(c.b)}<div class="tx"><b>${ic('diamonds-four-fill', 'ic-16')}${esc(c.name)}</b><div class="ad-vars">${c.vars.map((v) => `<span class="pill-tag is-gray">${esc(v)}</span>`).join('')}</div></div></div>`).join('')}</div>`;
    } else {
      const Din = clone(D); Din.login = true; const Dout = clone(D); Dout.login = false;
      const shot = (title, sub, html, cls) => `<div class="ad-fpage ${cls}"><div class="ad-fpage-v">${html}</div><b>${esc(title)}</b><span class="caption faint">${esc(sub)}</span></div>`;
      body = `<p class="caption muted ad-fp-sub">${t('ad/fpg-sub')}</p><div class="ad-fpages">${shot(t('ad/fpg-h5-out'), `750×${D.height}`, mini(Dout, 0.42, 'is-long'), '')}${shot(t('ad/fpg-h5-in'), `750×${D.height}`, mini(Din, 0.42, 'is-long'), '')}${shot(t('ad/fpg-pc'), '1920 × auto', `<div class="ad-fpc">${pcHtml(D, mobile ? 0.17 : 0.2)}</div>`, 'is-pc')}</div>`;
    }
    const x2 = `<button class="ibtn ibtn-sm" data-act="closeDlg" aria-label="${esc(t('ed/close'))}">${ic('x')}</button>`;
    if (mobile) return `<div class="dialog-head ad-fhead"><h3 class="ellipsis">${ic('tree-structure-fill', 'ic-16')} ${esc(file)}</h3>${x2}</div><div class="ad-fnavs scroll-x" data-sk="adfnav">${nav}</div><div class="ad-fbody" data-sk="adfbody">${body}</div>`;
    return `<div class="dialog-head ad-fhead"><h3 class="ellipsis">${ic('tree-structure-fill', 'ic-16')} ${t('ad/fp-title')} · ${esc(file)}</h3>${x2}</div><div class="ad-fwrap"><nav class="ad-fnavs">${nav}<div class="caption faint ad-fnote">${t('ad/fp-note')}</div></nav><div class="ad-fbody" data-sk="adfbody">${body}</div></div>`;
  }
  // 交付检查补两项：切图尺寸都合规、68 个 Key 都有值（不合规的定位到对应模块）
  function checks(D, req, sug, ok) {
    if (!window.MP || !window.MP.resolveKey || !D.m || !D.m.midnav) return;
    const sl = slices(D); const bad = sl.filter((s) => s.thumb.ok === false).length;
    if (!bad) ok.push({ id: 'adslices', mod: 'banner', name: t('ad/chk-slices'), text: t('ad/chk-slices-ok', { n: sl.length }) });
    else req.forEach((x) => { if (/^banner\d+$/.test(x.id)) x.name = t('ad/chk-slices') + ' · Banner'; });
    const rows = allKeys(D); const miss = rows.filter((r) => !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(String(r.v || '')));
    if (miss.length) req.push({ id: 'adkeys', mod: null, act: 'openKeys', name: t('ad/chk-keys'), text: t('ad/chk-keys-bad', { n: miss.length, names: miss.slice(0, 4).map((r) => r.k).join('、') }) });
    else ok.push({ id: 'adkeys', mod: null, act: 'openKeys', name: t('ad/chk-keys'), text: t('ad/chk-keys-ok', { n: rows.length }) });
  }
  const edCancelBody = () => { const a = P(); const d = a ? a.sets.filter((s) => s.st === 'ok').length : 0; return `<div class="ad-ecancel">${cancelBody('adECancelOk', 'adECancelKeep', d)}</div>`; };

  window.AD = {
    composer, recordView, doneIdx: okIdx, tile, openViewer, entryCard, edPanel: () => edPanel(false), mSheet, edBar, toolBtn, modMask,
    figIncl, figViewBtn, checks, dlgs: { adfig: figBody, adcancel: edCancelBody }, ST, buildDesign, mergeInto, slices, comps, counts,
  };
})();
