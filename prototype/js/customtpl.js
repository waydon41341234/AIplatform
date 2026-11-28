/* 自定义模版（#/custom）：起始线框 → 灰阶线框排版 → AI 一键生成（风格标签 + 提示词 + 规范包）→ 扣点确认 → 生成中 → 结果 → 采用进编辑器。
 * Figma 设计稿1127「11-27 自定义模版」01 线框组件 / 02 编辑器 / 03 AI 生成流程；11-28 简化版（选风格卡 + 自定义配色 → 风格标签 + 提示词框）见 03 页 66114:81676。
 * 文案 js/i18n-custom.js（ct/*），样式 css/customtpl.css（线框灰阶 --wf-*），规范包 js/ct-specpack.js（window.CT_SPEC）。
 * 对外：window.CT = { entry(where), pseg(...), match(doc, style), lastRequest, ... }；动作名统一 ct 前缀。
 * 结果选择规则（已和 Waydon 确认）：当前画布（顶部栏 + 可见内容区块 + 底部导航 + 悬浮层）的布局选项序列
 *   与 4 套起始线框比较：选项一致 1 分 / 个（多重集交集）+ 顺序一致再加 0.5 分 / 个（最长公共子序列），最高者胜；
 *   平分时看风格标签对应的配色（巴西绿 = A、白金 = B、暗夜绿 = C、清爽蓝 = D；不选标签按 A），再平分取靠前的。 */
(function () {
  const S = window.S, A = window.ACT, I = window.INP, t = window.t, esc = window.esc, ic = window.ic, num = window.num;
  const COST = 50, GEN_MS = 3200;
  const STEPS = ['analyze', 'match', 'assets', 'assemble'];

  // ---------- 模块与布局选项（规格表 14 模块；游戏分区 C1 有 4×3 / 3×3 两个选项）----------
  const MODS = {
    topbar: { ic: 'frame-corners-fill', fixed: true, opts: ['T1', 'T2', 'T3', 'T4'] },
    bottomnav: { ic: 'list', fixed: true, opts: ['BN1', 'BN2'] },
    float: { ic: 'arrow-up', fixed: true, opts: ['X1', 'X2'] },
    banner: { ic: 'image-fill', opts: ['B1', 'B2', 'B3'] },
    notice: { ic: 'bell-fill', opts: ['N1', 'N2', 'N3', 'N4'] },
    account: { ic: 'user-circle-fill', opts: ['M1', 'M2', 'M3'] },
    gamemenu: { ic: 'diamonds-four-fill', opts: ['G1', 'G2', 'G3', 'G4'] },
    zone: { ic: 'squares-four-fill', opts: ['C1a', 'C1b', 'C2', 'C3', 'C4', 'C5', 'C6'] },
    promo: { ic: 'stack-fill', opts: ['P1'] },
    jackpot: { ic: 'sparkle-fill', opts: ['J1', 'J2'] },
    search: { ic: 'magnifying-glass', opts: ['S1'] },
    rank: { ic: 'trophy-fill', opts: ['R1'] },
    app: { ic: 'download-simple', opts: ['D1', 'D2'] },
    footer: { ic: 'shapes-fill', opts: ['F1', 'F2', 'F3'] },
  };
  const ADDABLE = ['zone', 'promo', 'search', 'rank', 'jackpot', 'banner', 'notice', 'account', 'gamemenu', 'app', 'footer'];
  const FIXED = ['topbar', 'bottomnav', 'float'];
  const OPT_P = { C1a: { cols: 4, rows: 3 }, C1b: { cols: 3, rows: 3 }, C2: { cols: 4 }, C5: { rows: 3 }, C6: { rows: 3 } };
  const PV = { cols: [3, 4, 5], rows: [2, 3, 4], r: ['sm', 'md', 'lg'], g: ['tight', 'std', 'loose'], h: ['H1', 'H2', 'H3', 'H4'] };
  const RPX = { sm: 6, md: 14, lg: 26 }, GPX = { tight: 12, std: 20, loose: 30 };
  const code = (o) => o.replace(/[ab]$/, '');
  const modName = (m) => t('ct/m-' + m);
  const optName = (o) => t('ct/o-' + o);
  const tag = (b) => code(b.o) + (/^C1/.test(b.o) ? ` ${b.p.cols}×${b.p.rows}` : '');
  function paramKeys(b) {
    if (MODS[b.m].fixed) return [];
    const k = [];
    if (b.m === 'zone') { if (/^C1|^C2/.test(b.o)) k.push('cols'); if (/^C1|^C5|^C6/.test(b.o)) k.push('rows'); }
    k.push('r', 'g');
    if (b.m === 'zone') k.push('h');
    return k;
  }
  const pvLabel = (k, v) => (k === 'cols' || k === 'rows' ? String(v) : t('ct/pv-' + k + '-' + v));

  // ---------- 配色版本（演示结果用现成整页图：4 版式 × 4 配色，Figma 04 配色版本页；生成中画布按它逐块上色）----------
  const STYLES = {
    green: { x: 'A', bg: '#0f1a14', hero: '#1e7a52', a: '#d9b45c' },
    gold: { x: 'B', bg: '#fbf3e8', hero: '#b5835a', a: '#8a4a12' },
    night: { x: 'C', bg: '#111111', hero: '#22c55e', a: '#14b8a6' },
    blue: { x: 'D', bg: '#eef4ff', hero: '#0a7cff', a: '#bcd8ff' },
  };
  const STYLE_OF = { A: 'green', B: 'gold', C: 'night', D: 'blue' }; // 效果图本身的配色
  const resKey = (x, cs) => (!cs || cs === STYLE_OF[x] ? x : x + '-' + cs);
  // ---------- 风格标签（11-28 简化版，Figma 组件 AIF/StyleTag 66109:81570；默认提示词见 docs/ai-prompts.md）----------
  // 标签 → 演示结果的配色版本：白金 = 香槟金版（B 原稿配色）、巴西绿 = 墨绿金版（A）、暗夜绿 = C、清爽蓝 = D；
  // 不选标签只写提示词（tag = null）→ 匹配到的版式用自己的原稿配色（resKey(x, null) = x）
  const TAGS = { platinum: 'gold', 'brazil-green': 'green', 'night-green': 'night', 'fresh-blue': 'blue' };
  const TAG_OF = { gold: 'platinum', green: 'brazil-green', night: 'night-green', blue: 'fresh-blue' };
  const TAG_SW = { platinum: ['#faf2e8', '#b78458'], 'brazil-green': ['#157754', '#d9b66a'], 'night-green': ['#101010', '#1fcb5c'], 'fresh-blue': ['#ebf2fa', '#007eff'] }; // 色点：16 圆底 + 8 圆点（Figma style/* 变量）
  const PMAX = 300; // 提示词上限
  const PROMPT_VER = 'ct-style-v1';
  const okTag = (k) => (TAGS[k] ? k : null);
  const tagName = (k) => t(k ? 'ct/tag-' + k : 'ct/tag-none');
  const defPrompt = (k) => (k ? t('ct/prompt-' + k) : '');
  const tagDot = (k) => { const c = TAG_SW[k] || TAG_SW.platinum; return `<span class="ct-tdot" style="--a:${c[0]};--b:${c[1]}" aria-hidden="true"></span>`; };
  // 结果 / 编辑器里的色点：有标签用标签，没有按结果的配色
  const resDot = (tag, cs) => tagDot(tag || TAG_OF[cs]);

  // ---------- 起始线框（Figma 01 页 WF 起始 · 空白 / 综合版1 / A / B / C / D）----------
  // 综合版1（11-28，原名经典蓝白）：由通用版式「综合版1」首页反推，Figma WF 起始 夜 66145:11544 / 日 66145:11821，组件 66149:93634
  const ST = {
    blank: { top: 'T2', bn: 'BN1', fl: null, c: [] },
    classic: { top: 'T4', bn: 'BN1', fl: null, c: [['banner', 'B3'], ['notice', 'N1'], ['account', 'M3'], ['gamemenu', 'G4'], ['zone', 'C1b', 'H1']] },
    A: { top: 'T1', bn: 'BN1', fl: 'X1', c: [['banner', 'B1'], ['notice', 'N1'], ['account', 'M1'], ['gamemenu', 'G1'], ['zone', 'C1a', 'H1'], ['promo', 'P1'], ['zone', 'C5', 'H1'], ['jackpot', 'J2'], ['zone', 'C3', 'H1'], ['zone', 'C1b', 'H1'], ['rank', 'R1'], ['app', 'D1'], ['footer', 'F1']] },
    B: { top: 'T3', bn: 'BN1', fl: null, c: [['banner', 'B3'], ['promo', 'P1'], ['jackpot', 'J1'], ['notice', 'N2'], ['gamemenu', 'G3'], ['zone', 'C1a', 'H2'], ['footer', 'F2']] },
    C: { top: 'T2', bn: 'BN2', fl: 'X1', c: [['banner', 'B2'], ['notice', 'N3'], ['search', 'S1'], ['gamemenu', 'G2'], ['zone', 'C2', 'H3'], ['zone', 'C2', 'H3'], ['zone', 'C1b', 'H3'], ['zone', 'C2', 'H3'], ['app', 'D2'], ['footer', 'F3']] },
    D: { top: 'T4', bn: 'BN2', fl: 'X2', c: [['banner', 'B3'], ['notice', 'N4'], ['account', 'M3'], ['gamemenu', 'G4'], ['zone', 'C6', 'H4'], ['zone', 'C6', 'H4'], ['footer', 'F2']] },
  };
  const START_KEYS = ['blank', 'classic', 'A', 'B', 'C', 'D']; // 综合版1 = 第 2 张卡（Figma D1 65829:5185 / M1 65830:7300）
  let seq = 0;
  const nid = () => 'b' + Date.now().toString(36) + (++seq).toString(36);
  function mk(m, o, h, glob) { return { id: nid(), m, o, p: Object.assign({ r: glob.r, g: glob.g, h: h || glob.h }, OPT_P[o] || {}), hid: false }; }
  function fromStart(k) {
    const s = ST[k], z = s.c.find((x) => x[0] === 'zone');
    const g = { r: 'md', g: 'std', h: z ? z[2] : 'H1' };
    return {
      start: k, glob: g,
      fixed: { topbar: mk('topbar', s.top, null, g), bottomnav: mk('bottomnav', s.bn, null, g), float: Object.assign(mk('float', s.fl || 'X1', null, g), { hid: !s.fl }) },
      blocks: s.c.map((x) => mk(x[0], x[1], x[2], g)),
    };
  }
  const startDocs = {};
  const startDoc = (k) => startDocs[k] || (startDocs[k] = fromStart(k));
  const modCount = (d) => d.blocks.filter((b) => !b.hid).length + FIXED.filter((k) => !d.fixed[k].hid).length;

  // ---------- 按布局匹配结果 ----------
  const sig = (d) => [d.fixed.topbar.o].concat(d.blocks.filter((b) => !b.hid).map((b) => b.o), [d.fixed.bottomnav.o], d.fixed.float.hid ? [] : [d.fixed.float.o]);
  function lcs(a, b) {
    const dp = Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) { let prev = 0; for (let j = 1; j <= b.length; j++) { const tmp = dp[j]; dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]); prev = tmp; } }
    return dp[b.length];
  }
  function inter(a, b) { const m = {}; a.forEach((x) => { m[x] = (m[x] || 0) + 1; }); let n = 0; b.forEach((x) => { if (m[x]) { m[x]--; n++; } }); return n; }
  function match(doc, style) {
    const cur = sig(doc);
    const rows = ['A', 'B', 'C', 'D'].map((x) => { const ref = sig(startDoc(x)); const sc = inter(cur, ref) + 0.5 * lcs(cur, ref); return { x, sc, pct: Math.round((100 * sc) / (1.5 * Math.max(cur.length, ref.length))) }; });
    const best = Math.max.apply(null, rows.map((r) => r.sc));
    const ties = rows.filter((r) => r.sc === best);
    const pref = STYLES[style] ? STYLES[style].x : 'A';
    const win = ties.find((r) => r.x === pref) || ties[0];
    return { x: win.x, pct: win.pct, rows };
  }

  // ---------- 状态 ----------
  const LS = window.LS;
  const saved = LS.get('ct', null) || {};
  const okDoc = (d) => d && d.fixed && d.fixed.topbar && Array.isArray(d.blocks);
  // 11-28 简化版迁移（旧存档 { style: green|gold|night|blue|custom, cp } → { tag, prompt, auto }）：
  // 旧风格换成对应标签，提示词跟着标签默认（随语言）；'custom'（自定义配色，已删）没有对应标签 → 不选标签、空提示词
  function migCmp(sv) {
    if ('tag' in sv) { const tag = okTag(sv.tag); return { tag, prompt: typeof sv.prompt === 'string' ? sv.prompt.slice(0, PMAX) : '', auto: !!(tag && sv.auto) }; }
    const tag = sv.style && sv.style !== 'custom' ? TAG_OF[sv.style] || null : null;
    return { tag, prompt: '', auto: !!tag };
  }
  // 上次生成：旧的 { style, cs } → { tag, cs }（cs = 结果用的配色版本）
  function migLast(l) {
    if (!l || typeof l !== 'object' || !STYLE_OF[l.x]) return null;
    if (!('tag' in l)) l.tag = l.style && l.style !== 'custom' ? TAG_OF[l.style] || null : null;
    l.tag = okTag(l.tag);
    if (!STYLES[l.cs]) l.cs = l.tag ? TAGS[l.tag] : STYLE_OF[l.x];
    delete l.style;
    return l;
  }
  // 余额流水里旧的「自定义模版 AI 生成 · 墨绿金 / 自定义配色」→ 标签名 / 按提示词
  const OLD_LK = { 'ct/s-green': 'ct/tag-brazil-green', 'ct/s-gold': 'ct/tag-platinum', 'ct/s-night': 'ct/tag-night-green', 'ct/s-blue': 'ct/tag-fresh-blue', 'ct/s-custom': 'ct/tag-none' };
  (S.ledger || []).forEach((l) => { const v = l && l.kind === 'customtpl' && l.vars && l.vars.style; if (v && OLD_LK[v.k]) v.k = OLD_LK[v.k]; });
  const C = (window.CT_S = Object.assign({
    doc: okDoc(saved.doc) ? saved.doc : null, last: migLast(saved.last),
    sel: null, pane: null, orig: null, picker: false, pick: 'A', stage: 'edit', gen: null, res: null, past: [], future: [],
    zoom: 55, msheet: null, preview: false, rtab: 'ai', dlg: null, spec: false,
  }, migCmp(saved))); // tag：选中的风格标签（null = 不选）；prompt：提示词；auto：提示词是标签默认、没改过（切语言跟着换）
  // 没改过的默认提示词跟着当前语言
  const syncAuto = () => { if (C.auto && C.tag) C.prompt = defPrompt(C.tag); };
  const edited = () => C.prompt.trim() !== '' && C.prompt !== defPrompt(C.tag); // 有字且和当前标签默认不同（没标签时有字就算）
  const canGo = () => !!C.tag || C.prompt.trim() !== '';
  let savedSnap = '';
  window.AFTER_RENDER.push(() => {
    if (!C.doc) return;
    const s = JSON.stringify({ doc: C.doc, tag: C.tag, prompt: C.prompt, auto: C.auto, last: C.last });
    if (s !== savedSnap) { savedSnap = s; LS.set('ct', JSON.parse(s)); }
  });
  const mob = () => window.innerWidth < 840;
  const allBlocks = () => FIXED.map((k) => C.doc.fixed[k]).concat(C.doc.blocks);
  const findB = (id) => (C.doc && id ? allBlocks().find((b) => b.id === id) : null);
  const selB = () => findB(C.sel);
  function commit(fn) {
    C.past.push(JSON.stringify(C.doc)); if (C.past.length > 60) C.past.shift();
    C.future = [];
    fn();
  }
  function restore(snap) {
    C.doc = JSON.parse(snap);
    if (!findB(C.sel)) { C.sel = null; C.pane = null; }
    if (C.msheet === 'layout' && !selB()) C.msheet = null;
  }

  // ======================================================================
  // 线框渲染（750 宽，灰阶；每个布局选项一个函数）
  // ======================================================================
  const px = (v) => (typeof v === 'number' ? v + 'px' : v);
  const IM = (w, h, st = '') => `<i class="wf-img" style="width:${px(w)};height:${px(h)};${st}"></i>`;
  const LN = (w, h = 14, st = '') => `<i class="wf-ln" style="width:${px(w)};height:${h}px;${st}"></i>`;
  const DT = (d, st = '') => `<i class="wf-dot" style="width:${d}px;height:${d}px;${st}"></i>`;
  const BT = (txt, o, st = '') => `<span class="wf-btn ${o ? 'is-o' : ''}" style="${st}">${esc(txt)}</span>`;
  const ICO = (d, lw, lh = 10) => `<span class="wf-ico">${DT(d)}${LN(lw, lh)}</span>`;
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const dots = (cls = '') => `<span class="wf-dots ${cls}"><b class="on"></b><b></b><b></b><b></b></span>`;
  const pad = (inner, st = '') => `<div class="wf-pad" style="${st}">${inner}</div>`;
  const W = {
    // 顶部栏
    T1: () => `<div class="wf-tb">${IM(200, 56, 'border-radius:6px')}<span class="grow"></span><i class="wf-burger"><b></b><b></b><b></b></i></div>`,
    T2: () => `<div class="wf-tb">${IM(200, 56, 'border-radius:6px')}<span class="grow"></span>${BT(t('ct/wf-login'), true)}${BT(t('ct/wf-register'))}</div>`,
    T3: () => `<div class="wf-tb">${IM(180, 56, 'border-radius:6px')}<span class="grow"></span>${ICO(38, 40, 8)}${ICO(38, 40, 8)}${BT(t('ct/wf-login'), true)}${BT(t('ct/wf-register'))}</div>`,
    T4: () => `<div class="wf-tb">${IM(200, 56, 'border-radius:6px')}<span class="grow"></span>${DT(46)}${DT(46)}${DT(46)}</div>`,
    // Banner
    B1: () => `<div class="rel">${IM('100%', 340, 'border-radius:0')}${dots('is-in')}</div>`,
    B2: () => pad(`${IM('100%', 320)}${dots()}`),
    B3: () => pad(`<div class="rel">${IM('100%', 320)}${dots('is-in')}</div>`),
    // 公告栏
    N1: () => pad(`<div class="wf-ntc">${DT(26)}${LN('auto', 14, 'flex:1')}<i class="wf-sq"></i></div>`),
    N2: () => pad(`<div class="wf-ntc">${DT(26)}${LN('auto', 14, 'flex:1')}<i class="wf-sq"></i>${BT(t('ct/wf-more'), false, 'height:36px;font-size:20px;padding:0 16px')}</div>`),
    N3: () => pad(`<div class="wf-ntc">${DT(26)}${LN('auto', 14, 'flex:1')}<i class="wf-sq wf-badge"></i></div>`),
    N4: () => pad(`<div class="wf-ntc">${DT(26)}${LN('auto', 14, 'flex:1')}<i class="wf-sq"></i><span class="wf-pl">${LN(110, 10)}</span></div>`),
    // 账户栏
    M1: () => pad(`<div class="wf-row" style="gap:var(--g);align-items:stretch"><div class="wf-card wf-acct" style="width:440px"><div class="wf-row" style="gap:16px">${DT(60)}<span class="wf-col">${LN(160, 18)}</span></div><div class="wf-row" style="gap:12px">${BT(t('ct/wf-login'), true)}${BT(t('ct/wf-register'))}</div></div><div class="wf-row" style="flex:1;justify-content:space-around">${rep(3, () => ICO(76, 56))}</div></div>`),
    M2: () => pad(`<div class="wf-card wf-grid" style="grid-template-columns:repeat(6,1fr);padding:22px 10px;gap:var(--g)">${rep(6, () => ICO(64, 56))}</div>`),
    M3: () => pad(`<div class="wf-card wf-row" style="height:124px;padding:0 22px;gap:16px"><span class="wf-col" style="flex:1">${LN(200, 22)}${LN(150, 12)}</span>${rep(5, () => ICO(54, 44, 8))}</div>`),
    // 彩金池
    J1: () => pad(`<div class="wf-card wf-row" style="height:90px;padding:0 16px;gap:14px">${DT(60)}<span class="wf-col">${LN(110, 18)}${LN(70, 10)}</span><span class="wf-well" style="flex:1">${rep(8, () => '<i class="wf-dg"></i>')}</span></div>`),
    J2: () => `<div class="rel">${IM('100%', 420, 'border-radius:0')}<div class="wf-ov is-c">${LN(240, 44, 'background:var(--wf-block-strong)')}<span class="wf-well" style="width:380px;margin-top:22px">${rep(9, () => '<i class="wf-dg"></i>')}</span></div></div>`,
    // 游戏菜单
    G1: () => pad(`<div class="wf-grid" style="grid-template-columns:repeat(5,1fr);gap:var(--g)">${rep(5, (i) => `<span class="wf-card wf-tile ${i ? '' : 'is-on'}" style="height:122px">${IM(64, 54, 'border-radius:6px')}${LN(56, 10)}</span>`)}</div>`),
    G2: () => pad(`<div class="wf-hs" style="gap:14px">${rep(5, (i) => `<span class="wf-chip ${i ? '' : 'is-on'}">${DT(30)}${LN(70, 12)}</span>`)}</div>`),
    G3: () => pad(`<div class="wf-grid" style="grid-template-columns:repeat(5,1fr);gap:var(--g)">${rep(5, () => `<span class="wf-card wf-tile" style="height:140px">${IM(84, 80, 'border-radius:6px')}${LN(60, 10)}</span>`)}</div><div class="wf-grid" style="grid-template-columns:repeat(3,1fr);gap:var(--g);margin-top:var(--g)">${rep(3, () => `<span class="wf-card wf-row" style="height:104px;padding:0 14px;gap:12px">${IM(80, 70, 'border-radius:6px')}<span class="wf-col">${LN(80, 14)}${LN(56, 10)}</span></span>`)}</div>`),
    G4: () => `<div class="wf-rail">${rep(8, (i) => `<span class="wf-card wf-tile ${i ? '' : 'is-on'}" style="height:104px">${DT(46)}${LN(46, 8)}</span>`)}</div>`,
    // 推广横幅
    P1: () => pad(`<div class="rel">${IM('100%', 180)}<div class="wf-ov">${LN(300, 28, 'background:var(--wf-block-strong)')}${LN(200, 12)}${BT(t('ct/wf-join'), false, 'margin-top:6px')}</div></div>`),
    // 排行榜
    R1: () => pad(`<div class="wf-grid" style="grid-template-columns:1fr 1fr;gap:var(--g)">${rep(2, () => `<div class="wf-card" style="padding:18px">${LN(120, 18)}${rep(3, () => `<div class="wf-row" style="gap:10px;margin-top:18px">${DT(24)}${IM(50, 50, 'border-radius:6px')}<span class="wf-col" style="flex:1">${LN('80%', 12)}${LN('50%', 8)}</span>${LN(56, 22)}</div>`)}</div>`)}</div>`),
    // APP 下载
    D1: () => pad(`<div class="wf-col is-c" style="gap:var(--g)">${LN(240, 30)}${IM('100%', 300)}<div class="wf-row" style="gap:var(--g);width:100%">${BT(t('ct/wf-android'), false, 'flex:1;height:60px')}${BT(t('ct/wf-ios'), false, 'flex:1;height:60px')}</div></div>`),
    D2: () => pad(`<div class="wf-card wf-col is-c" style="padding:28px 22px;gap:18px">${LN(280, 30)}${LN(420, 12)}<div class="wf-row" style="gap:16px">${rep(2, () => `<span class="wf-store">${DT(30)}<span class="wf-col">${LN(60, 8)}${LN(90, 12)}</span></span>`)}</div>${LN(240, 14)}<div class="wf-row" style="gap:14px">${rep(8, () => DT(46))}</div></div>`),
    // 页脚
    F1: () => pad(`<div class="wf-col" style="gap:14px">${LN(140, 22)}${LN('100%', 12)}${LN('100%', 12)}${LN('60%', 12)}${LN(140, 20, 'margin-top:14px')}<div class="wf-grid" style="grid-template-columns:repeat(4,1fr);gap:12px">${rep(8, () => '<i class="wf-rect" style="height:56px"></i>')}</div></div>`),
    F2: () => pad(`<div class="wf-grid" style="grid-template-columns:repeat(3,1fr);gap:20px">${rep(3, () => `<span class="wf-col" style="gap:14px">${LN(90, 18)}${rep(4, (i) => LN([80, 64, 96, 70][i], 10))}</span>`)}</div>
      <div class="wf-col" style="gap:14px;margin-top:28px">${LN(130, 18)}<div class="wf-row" style="gap:18px"><i class="wf-rect" style="width:130px;height:76px"></i>${DT(76)}${DT(76)}</div>${LN(130, 18)}<div class="wf-row" style="gap:18px">${rep(4, () => DT(66))}</div>${LN('100%', 10)}${LN('60%', 10)}<div class="wf-grid" style="grid-template-columns:repeat(5,1fr);gap:12px">${rep(5, () => '<i class="wf-rect" style="height:44px"></i>')}</div></div>`),
    F3: () => pad(`<div class="wf-col" style="gap:14px">${rep(3, () => `<span class="wf-card wf-row" style="height:76px;padding:0 22px">${LN(140, 16)}<span class="grow"></span>${DT(26)}</span>`)}<span class="wf-col is-c" style="gap:14px;margin-top:10px">${IM(180, 64, 'border-radius:6px')}</span>${LN('100%', 10)}${LN('100%', 10)}${LN('60%', 10)}<div class="wf-row" style="gap:18px;justify-content:center;margin-top:6px"><i class="wf-rect" style="width:150px;height:52px"></i><i class="wf-rect" style="width:150px;height:52px"></i></div></div>`),
    // 底部导航
    BN1: () => `<div class="wf-bn">${rep(5, (i) => (i === 2 ? `<span class="wf-ico is-up">${DT(100, 'border:8px solid var(--wf-page)')}${LN(56, 10)}</span>` : ICO(44, 56)))}</div>`,
    BN2: () => `<div class="wf-bn">${rep(5, () => ICO(44, 56))}</div>`,
    // 悬浮层
    X1: () => '<i class="wf-fab"></i>',
    X2: () => `<span class="wf-col" style="align-items:flex-end;gap:16px"><span class="wf-quick">${DT(30)}<span>${esc(t('ct/wf-quick'))}</span></span><i class="wf-fab"></i></span>`,
  };
  function zoneHead(h) {
    if (h === 'H4') return '';
    if (h === 'H1') return `<div class="wf-zh">${DT(40)}<span class="wf-col">${LN(150, 18)}${LN(60, 5)}</span><span class="grow"></span>${BT(t('ct/wf-more'), true, 'height:40px;font-size:20px;padding:0 18px')}</div>`;
    if (h === 'H2') return `<div class="wf-zh"><i class="wf-bar"></i>${LN(130, 22)}${LN(80, 12)}</div>`;
    return `<div class="wf-zh">${LN(150, 22)}<span class="grow"></span><span class="wf-txt">${esc(t('ct/wf-all'))}</span>${DT(32)}${DT(32)}</div>`;
  }
  const cell = () => `<span class="wf-cell">${IM('100%', 'auto', 'aspect-ratio:1')}${LN('60%', 12, 'margin-top:10px')}</span>`;
  function zoneBody(b) {
    const p = b.p;
    switch (b.o) {
      case 'C1a': case 'C1b': return `<div class="wf-grid" style="grid-template-columns:repeat(${p.cols},1fr);gap:var(--g)">${rep(p.cols * p.rows, cell)}</div>`;
      case 'C2': return `<div class="wf-hs" style="gap:var(--g)">${rep(p.cols + 1, () => `<span class="wf-cell" style="flex:0 0 calc((100% - ${p.cols} * var(--g)) / ${p.cols + 0.3})">${IM('100%', 'auto', 'aspect-ratio:1')}${LN('60%', 12, 'margin-top:10px')}</span>`)}</div>`;
      case 'C3': return `<div class="wf-grid" style="grid-template-columns:2fr 1fr;gap:var(--g)">${IM('100%', 'calc(280px + var(--g))', 'grid-row:span 2')}${IM('100%', 140)}${IM('100%', 140)}</div>`;
      case 'C4': return `${IM('100%', 200)}<div class="wf-grid" style="grid-template-columns:2fr 1fr;gap:var(--g);margin-top:var(--g)">${IM('100%', 'calc(240px + var(--g))', 'grid-row:span 2')}${IM('100%', 120)}${IM('100%', 120)}</div>`;
      case 'C5': return `<div class="wf-grid" style="grid-template-columns:1fr 1fr;gap:var(--g)">${rep(2 * p.rows, () => `<span class="wf-card wf-row" style="padding:16px;gap:14px">${IM(104, 104, 'border-radius:8px')}<span class="wf-col" style="flex:1;gap:12px">${LN('85%', 16)}${LN('55%', 10)}${LN(84, 28, 'background:var(--wf-block-strong)')}</span></span>`)}</div>`;
      case 'C6': return `<div class="wf-col" style="gap:var(--g)">${rep(p.rows, () => `<div class="rel">${IM('100%', 220)}<div class="wf-ov">${LN(210, 26, 'background:var(--wf-block-strong)')}${LN(140, 12)}<span class="grow"></span>${LN(116, 40, 'background:var(--wf-block-strong)')}</div></div>`)}</div>`;
      default: return '';
    }
  }
  const blockInner = (b) => (b.m === 'zone' ? pad(zoneHead(b.p.h) + zoneBody(b)) : (W[b.o] ? W[b.o](b) : ''));

  // pageHtml(doc, {act: 可点选, tags: 显示编号, lit: 生成中已上色块数, onlyIds})
  function pageHtml(doc, o = {}) {
    let i = 0;
    const lit = o.lit == null ? -1 : o.lit;
    const wrap = (b, inner, cls = '') => {
      const idx = i++;
      const lc = lit < 0 ? '' : idx < lit ? 'is-lit' : idx === lit ? 'is-cur' : '';
      const sel = o.act && C.sel === b.id ? 'is-sel' : '';
      return `<div class="wf-m wf-${b.m} ${MODS[b.m].fixed ? '' : 'wf-c'} ${cls} ${sel} ${lc}" data-bid="${b.id}" ${o.act ? `data-act="ctSel" data-arg="${b.id}"` : ''} style="--r:${RPX[b.p.r] || 14}px;--g:${GPX[b.p.g] || 20}px">${o.tags !== false ? `<span class="wf-tag">${esc(tag(b))}</span>` : ''}${inner}</div>`;
    };
    const vis = doc.blocks.filter((b) => !b.hid);
    let body = '';
    for (let k = 0; k < vis.length; k++) {
      const b = vis[k];
      if (b.m === 'gamemenu' && b.o === 'G4') { // 左侧竖向分类栏：后面紧挨的游戏分区放到右侧
        let j = k + 1; const right = [];
        while (j < vis.length && vis[j].m === 'zone') { right.push(vis[j]); j++; }
        const rail = wrap(b, W.G4(b), 'is-rail');
        body += `<div class="wf-g4">${rail}<div class="wf-g4r">${right.length ? right.map((z) => wrap(z, blockInner(z))).join('') : `<div class="wf-g4-empty">${esc(t('ct/g4-empty'))}</div>`}</div></div>`;
        k = j - 1; continue;
      }
      body += wrap(b, blockInner(b));
    }
    if (!vis.length) body = `<div class="wf-empty">${ic('plus')}<span>${esc(t('ct/canvas-empty'))}</span></div>`;
    const f = doc.fixed;
    return wrap(f.topbar, blockInner(f.topbar)) + `<div class="wf-body">${body}</div>` + wrap(f.bottomnav, blockInner(f.bottomnav)) + (f.float.hid ? '' : wrap(f.float, blockInner(f.float), 'is-float'));
  }
  const litTotal = (d) => 2 + d.blocks.filter((b) => !b.hid).length + (d.fixed.float.hid ? 0 : 1);
  const miniPage = (d, w) => `<div class="wf-page is-mini" style="zoom:${w / 750}">${pageHtml(d, { tags: false })}</div>`;
  // 单个布局选项的缩略图：同一模块换成该选项后渲染
  function optThumb(b, o) {
    const fake = { id: 'thumb', m: b.m, o, p: Object.assign({}, b.p, OPT_P[o] || {}), hid: false };
    if (o === 'G4') return `<div class="wf-page is-mini is-one" style="zoom:.18"><div class="wf-g4">${`<div class="wf-m is-rail" style="--r:14px;--g:20px">${W.G4()}</div>`}<div class="wf-g4r"><div class="wf-m" style="--r:14px;--g:20px">${pad(zoneBody({ o: 'C6', p: { rows: 3 } }))}</div></div></div></div>`;
    return `<div class="wf-page is-mini is-one ${b.m === 'float' ? 'is-fl' : ''}" style="zoom:.18"><div class="wf-m wf-${b.m}" style="--r:${RPX[fake.p.r]}px;--g:${GPX[fake.p.g]}px">${blockInner(fake)}</div></div>`;
  }

  // ======================================================================
  // 通用片段
  // ======================================================================
  // 参数分段控件（Figma ED 自定义/参数分段项 65879:17955）：左侧标签 56 宽 + 等宽分段轨道；样式只在 customtpl.css「参数分段控件」一处
  function pseg(label, vals, cur, act, keyArg, fmt) {
    return `<div class="ct-pseg-row"><span class="ct-pseg-lab">${esc(label)}</span><div class="ct-pseg" role="radiogroup" aria-label="${esc(label)}">${vals.map((v) => { const on = String(v) === String(cur); return `<button class="${on ? 'is-on' : ''}" role="radio" aria-checked="${on}" data-act="${act}" data-arg="${keyArg}|${v}">${esc(fmt(v))}</button>`; }).join('')}</div></div>`;
  }
  function paramsHtml(b) {
    const ks = paramKeys(b);
    if (!ks.length) return `<p class="caption muted">${esc(t('ct/no-params'))}</p>`;
    return `<div class="ct-psegs">${ks.map((k) => pseg(t('ct/p-' + k), PV[k], b.p[k], 'ctParam', k, (v) => pvLabel(k, v))).join('')}</div>`;
  }
  function globHtml() {
    const g = C.doc.glob;
    return `<div class="ct-psegs">${['r', 'g', 'h'].map((k) => pseg(t('ct/p-' + k), PV[k], g[k], 'ctGlob', k, (v) => pvLabel(k, v))).join('')}</div>`;
  }
  const stName = (k) => (k === 'classic' ? t('template/classic-blue') : t(k === 'blank' ? 'ct/start-blank' : 'ct/start-x', { x: k })); // 综合版1 与通用版式同名
  const xBtn = (act) => `<button class="ibtn ibtn-sm" data-act="${act}" aria-label="${esc(t('common/close'))}">${ic('x')}</button>`;
  // 弹层只在第一次出现时播放进场动画；之后每次重渲染（点卡片、调参数、生成进度）都加 is-still，不再闪
  let layerPrev = new Set(), layerCur = new Set();
  const still = (k) => { layerCur.add(k); return layerPrev.has(k) ? ' is-still' : ''; };
  window.AFTER_RENDER.push(() => { layerPrev = layerCur; layerCur = new Set(); });
  const ctSheet = (inner, cls = '', closeAct = 'ctClose') => { const st = still('s:' + cls); return `<div class="scrim${st}" data-act="${closeAct}"></div><div class="sheet ct-sheet ${cls}${st}" role="dialog"><div class="sheet-grab"></div>${inner}</div>`; };
  const ctDialog = (inner, cls = '', closeAct = 'ctClose') => { const st = still('d:' + cls); return `<div class="scrim${st}" data-act="${closeAct}"></div><div class="dialog ct-dlg ${cls}${st}" role="dialog">${inner}</div>`; };
  const pcLocked = () => !window.PC_OPEN;
  function devSeg() {
    return `<div class="iseg" role="group">${[['h5', 'device-mobile', 'ed/device-h5'], ['pc', 'desktop', 'ed/device-pc']].map(([v, i, k]) => { const lk = v === 'pc' && pcLocked(); return `<button class="${v === 'h5' ? 'is-on' : ''}${lk ? ' is-locked' : ''}" data-act="ctDevice" data-arg="${v}" title="${esc(t(k))}" aria-label="${esc(t(k))}"${lk ? ' aria-disabled="true"' : ''}>${ic(i)}${lk ? `<span class="pc-lock" aria-hidden="true">${ic('lock-fill')}</span>` : ''}</button>`; }).join('')}</div>`;
  }
  const undoRedo = () => `<button class="ibtn ibtn-sm" data-act="ctUndo" ${C.past.length && C.stage === 'edit' ? '' : 'disabled'} title="${esc(t('ed/undo'))}" aria-label="${esc(t('ed/undo'))}">${ic('arrow-u-up-left')}</button><button class="ibtn ibtn-sm" data-act="ctRedo" ${C.future.length && C.stage === 'edit' ? '' : 'disabled'} title="${esc(t('ed/redo'))}" aria-label="${esc(t('ed/redo'))}">${ic('arrow-u-up-right')}</button>`;
  const genBtn = () => (C.stage === 'gen'
    ? `<button class="btn btn-primary btn-sm is-disabled ct-genbtn" disabled>${ic('circle-notch', 'ic-16 spin')}${esc(t('ct/generating-btn'))}</button>`
    : `<button class="btn btn-primary btn-sm ct-genbtn" data-act="ctGenOpen" aria-label="${esc(t('ct/gen-btn'))}">${ic('sparkle-fill', 'ic-16')}<span data-ct-gl>${esc(t('ct/gen-btn'))}</span></button>`); // 手机同 Figma S-M-00 / M2 也写全「AI 一键生成」；标题放不下时换短的「生成」（渲染后量，见 AFTER_RENDER）

  // ---------- 左栏：模块库 ----------
  function rowHtml(b, fixed, idx) {
    const name = modName(b.m), on = C.sel === b.id;
    const eye = fixed ? (b.m === 'float' ? `<button class="ct-eye" data-act="ctEye" data-arg="${b.id}" data-stop aria-label="${esc(t(b.hid ? 'ct/show' : 'ct/hide'))}">${ic(b.hid ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button>` : '<span class="ct-eye is-ph"></span>')
      : `<button class="ct-eye" data-act="ctEye" data-arg="${b.id}" data-stop aria-label="${esc(t(b.hid ? 'ct/show' : 'ct/hide'))}">${ic(b.hid ? 'eye-slash-fill' : 'eye-fill', 'ic-16')}</button>`;
    return `<div class="ct-row ${on ? 'is-on' : ''} ${b.hid ? 'is-hid' : ''} ${fixed ? 'is-fixed' : ''}" ${fixed ? '' : `data-ct-row="${idx}"`} data-act="ctSel" data-arg="${b.id}" role="button" tabindex="0">
      ${fixed ? '' : `<span class="ct-hdl" data-ct-h aria-hidden="true">${ic('dots-six-vertical', 'ic-16')}</span>`}<i class="ct-live ${b.hid ? 'is-off' : ''}"></i>${ic(MODS[b.m].ic, 'ic-16 ct-row-ic')}<span class="ct-row-n ellipsis">${esc(name)}</span><span class="ct-row-c">${esc(b.m === 'float' ? optName(b.o) : tag(b))}</span>${eye}</div>`;
  }
  function libHtml(opts = {}) {
    const d = C.doc, n = d.blocks.length;
    const fixed = FIXED.map((k) => rowHtml(d.fixed[k], true)).join('');
    const content = n ? d.blocks.map((b, i) => rowHtml(b, false, i)).join('') : `<p class="caption faint ct-lib-empty">${esc(t('ct/lib-empty'))}</p>`;
    const adds = ADDABLE.map((m) => `<button class="ct-add" data-ct-lib="${m}" data-act="ctAdd" data-arg="${m}">${ic(MODS[m].ic)}<span class="ellipsis">${esc(modName(m))}</span></button>`).join('');
    return `${opts.head === false ? '' : `<div class="ct-lib-h"><h3>${esc(t('ct/lib'))}</h3><p class="caption faint">${esc(t('ct/lib-sub'))}</p></div>`}
      <div class="ct-grp">${esc(t('ct/grp-fixed'))}</div>${fixed}
      <div class="ct-grp">${esc(t(mob() ? 'ct/grp-content-m' : 'ct/grp-content', { n }))}</div><div class="ct-rows" data-ct-rows>${content}</div>
      ${opts.adds === false ? '' : `<div class="ct-grp">${esc(t(mob() ? 'ct/grp-add-m' : 'ct/grp-add'))}</div><div class="ct-adds">${adds}</div>`}`;
  }

  // ---------- 右栏 ----------
  function startCard() {
    const k = C.doc.start || 'blank';
    return `<div class="ct-stcard"><div class="ct-stthumb">${miniPage(startDoc(k), 48)}</div><div class="grow"><b>${esc(stName(k))}</b><p class="caption muted">${esc(t('ct/start-d-' + k))}</p></div><button class="btn btn-secondary btn-sm" data-act="ctRepick">${esc(t('ct/repick'))}</button></div>`;
  }
  function pagePanel() {
    const d = C.doc, vis = d.blocks.filter((b) => !b.hid).length, fx = FIXED.filter((k) => !d.fixed[k].hid).length;
    const last = C.last ? `<div class="ct-sec"><div class="ct-lab">${esc(t('ct/last'))}</div><button class="ct-last" data-act="ctShowLast"><img src="assets/custom-tpl/result-${resKey(C.last.x, C.last.cs)}.jpg" alt=""><span class="grow"><b>${esc(t('ct/plan', { x: C.last.x }))} · ${esc(tagName(C.last.tag))}</b><span class="caption muted">${esc(t('ct/match-n', { n: C.last.pct }))}</span></span>${ic('caret-right', 'ic-16')}</button></div>` : '';
    return `<div class="ct-ph"><h3>${esc(t('ct/page-title'))}</h3><p class="caption faint">${esc(t('ct/page-sub'))}</p></div>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/start'))}</div>${startCard()}</div>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/glob'))}</div>${globHtml()}</div>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/page'))}</div><p class="ct-stat">${esc(t('ct/stat-mods', { n: vis + fx, f: fx, c: vis }))}</p><p class="ct-stat">${esc(t('ct/stat-h'))} <span data-ct-ph>—</span> px</p></div>
      ${last}<div class="ct-tip">${ic('sparkle-fill', 'ic-16')}<span>${esc(t('ct/tip'))}</span></div>`;
  }
  function modPanel(b) {
    const fixed = MODS[b.m].fixed, idx = C.doc.blocks.indexOf(b) + 1;
    const sub = fixed ? t('ct/sub-fixed', { o: tag(b) }) : t('ct/sub-content', { n: idx, o: tag(b) + ' ' + optName(b.o) });
    return `<div class="ct-ph"><h3>${esc(modName(b.m))}</h3><p class="caption faint">${esc(sub)}</p></div>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/cur-layout'))}</div><div class="ct-lcard is-cur"><div class="ct-lthumb">${optThumb(b, b.o)}</div><div class="ct-lname"><span class="ellipsis">${esc(tag(b))} · ${esc(optName(b.o))}</span><span class="ct-adopt">${esc(t('ct/adopted-tag'))}</span></div></div>
      <button class="btn btn-primary btn-block ct-swap" data-act="ctLayout">${ic('layout-fill', 'ic-16')}${esc(t('ct/swap'))}</button></div>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/params'))}</div>${paramsHtml(b)}</div>
      ${fixed ? `<p class="caption faint">${esc(t('ct/fixed-note'))}</p>` : ''}`;
  }
  function layoutCards(b) {
    return MODS[b.m].opts.map((o) => `<button class="ct-lcard ${b.o === o ? 'is-on' : ''}" data-act="ctOpt" data-arg="${o}" aria-pressed="${b.o === o}"><div class="ct-lthumb">${optThumb(b, o)}</div><div class="ct-lname"><span class="ellipsis">${esc(code(o))} · ${esc(optName(o))}</span>${C.orig === o ? `<span class="ct-adopt">${esc(t('ct/adopted-tag'))}</span>` : ''}</div></button>`).join('');
  }
  function layoutPanel(b) {
    return `<div class="ct-ph is-back"><button class="ibtn ibtn-sm" data-act="ctPaneBack" aria-label="${esc(t('ct/back'))}">${ic('caret-left')}</button><div><h3>${esc(t('ct/swap-title', { m: modName(b.m) }))}</h3><p class="caption faint">${esc(t('ct/swap-sub'))}</p></div></div>
      <div class="ct-lgrid">${layoutCards(b)}</div><p class="caption faint ct-lcount">${esc(t('ct/n-layouts', { n: MODS[b.m].opts.length }))}</p>
      <div class="ct-sec"><div class="ct-lab">${esc(t('ct/params'))}</div>${paramsHtml(b)}</div>`;
  }
  function genSteps() {
    const g = C.gen || { p: 0, step: 0 };
    const st = Math.min(3, Math.floor(g.p * 4)), done = g.p >= 1;
    return `<div class="ct-prog"><div class="ct-prog-h"><span>${esc(t('ct/gen-progress', { n: Math.min(4, st + (done ? 1 : 1)), m: 4 }))}</span>${ic('circle-notch', 'ic-16 spin is-brand')}</div><div class="ct-bar"><i style="width:${Math.round(g.p * 100)}%"></i></div></div>
      <ul class="ct-steps">${STEPS.map((k, i) => { const s = done || i < st ? 'done' : i === st ? 'run' : 'wait'; return `<li class="is-${s}">${s === 'done' ? ic('check-circle-fill', 'ic-20') : s === 'run' ? ic('circle-notch', 'ic-20 spin') : '<i class="ct-o"></i>'}<span class="grow">${esc(t('ct/step-' + k))}</span><span class="caption">${esc(t('ct/st-' + s))}</span></li>`; }).join('')}</ul>`;
  }
  function genPanel() {
    return `<div class="ct-gen"><div class="ct-ph"><h3>${esc(t('ct/gen-title'))}</h3><p class="caption muted">${esc(t('ct/gen-desc', { n: COST }))}</p></div>${genSteps()}<span class="grow"></span><button class="btn btn-secondary btn-block" data-act="ctGenCancel">${esc(t('ct/gen-cancel'))}</button></div>`;
  }

  // ---------- 画布 ----------
  const zoomVal = () => (mob() ? Math.max(0.3, (window.innerWidth - 30) / 750) : C.zoom / 100);
  function canvasHtml() {
    const z = zoomVal(), gen = C.stage === 'gen', d = C.doc;
    const lit = gen && C.gen ? Math.min(litTotal(d), Math.floor(C.gen.p * (litTotal(d) + 1))) : null;
    const st = STYLES[(C.gen && C.gen.cs) || 'green'];
    const pg = `<div class="wf-page ${gen ? 'is-gen' : ''} ${C.preview ? 'is-prev' : ''}" style="zoom:${z};--ow:${(2 / z).toFixed(2)}px;--st1:${st.hero};--st2:${st.a};--st0:${st.bg}">${pageHtml(d, { act: !gen && !C.preview, tags: !C.preview, lit })}</div>`;
    const genPill = gen ? `<div class="ct-genpill">${ic('sparkle-fill', 'ic-16')}${esc(t('ct/gen-pill', { s: t('ct/step-' + STEPS[Math.min(3, Math.floor(C.gen.p * 4))]) }))}</div>` : '';
    return `<div class="ct-stage">${pg}</div>${toolHtml()}<div class="ct-drop" hidden><span></span></div>${genPill}`;
  }
  function toolHtml() {
    const b = selB(); if (!b || C.stage !== 'edit' || C.preview) return '';
    const fixed = MODS[b.m].fixed, i = C.doc.blocks.indexOf(b), n = C.doc.blocks.length;
    const tb = (act, icn, k, dis) => `<button class="ct-tb" data-act="${act}" title="${esc(t(k))}" aria-label="${esc(t(k))}" ${dis ? 'disabled' : ''}>${ic(icn, 'ic-16')}</button>`;
    return `<div class="ct-tool" data-ct-tool style="visibility:hidden"><span class="ct-tool-n ellipsis">${esc(modName(b.m))} · ${esc(tag(b))}</span>
      ${tb('ctUp', 'arrow-up', 'ct/t-up', fixed || i <= 0)}${tb('ctDown', 'arrow-down', 'ct/t-down', fixed || i >= n - 1)}${tb('ctDup', 'copy', 'ct/t-dup', fixed)}${tb('ctHide', 'eye-slash-fill', 'ct/t-hide', fixed && b.m !== 'float')}${tb('ctDel', 'trash', 'ct/t-del', fixed)}
      <button class="btn btn-primary btn-sm ct-tool-sw" data-act="ctLayout">${ic('layout-fill', 'ic-16')}${esc(t('ct/swap'))}</button></div>`;
  }
  const zoomCtl = () => `<div class="ct-zoom"><button class="ibtn ibtn-sm" data-act="ctZoom" data-arg="-1" aria-label="${esc(t('ct/zoom-out'))}" ${C.zoom <= ZOOMS[0] ? 'disabled' : ''}>${ic('minus', 'ic-16')}</button><span>${C.zoom}%</span><button class="ibtn ibtn-sm" data-act="ctZoom" data-arg="1" aria-label="${esc(t('ct/zoom-in'))}" ${C.zoom >= ZOOMS[ZOOMS.length - 1] ? 'disabled' : ''}>${ic('plus', 'ic-16')}</button></div>`;
  const ZOOMS = [40, 50, 55, 65, 75, 100];

  // ---------- 弹层：起始线框 / 选风格 / 手机抽屉 ----------
  function pickerBody(m) {
    const cards = START_KEYS.map((k) => `<button class="ct-pcard ${C.pick === k ? 'is-on' : ''}" data-act="ctPick" data-arg="${k}" aria-pressed="${C.pick === k}"><div class="ct-pthumb">${miniPage(startDoc(k), m ? 132 : 174)}</div><div class="ct-pname"><b>${esc(stName(k))}</b>${m ? '' : `<span class="caption">${esc(t('ct/start-d-' + k))}</span>`}</div></button>`).join('');
    const head = `<div class="dialog-head"><div><h3>${esc(t('ct/pick-title'))}</h3><p class="caption muted">${esc(t(m ? 'ct/pick-sub-m' : 'ct/pick-sub'))}</p></div>${xBtn('ctPickClose')}</div>`;
    if (m) return `${head}<div class="ct-pcards is-m" data-sk="ct-pcards">${cards}</div><button class="btn btn-primary btn-block ct-pgo" data-act="ctStart">${esc(t('ct/pick-go'))}</button>`;
    return `${head}<div class="ct-pcards">${cards}</div><div class="ct-pfoot"><span class="caption muted">${esc(t('ct/pick-sel', { s: stName(C.pick), n: modCount(startDoc(C.pick)) }))}</span><span class="grow"></span><button class="btn btn-secondary" data-act="ctPickClose">${esc(t('confirm/cancel'))}</button><button class="btn btn-primary" data-act="ctStart">${esc(t('ct/pick-go'))}</button></div>`;
  }
  // ---------- AI 一键生成弹窗（11-28 简化版，Figma 组件 AIF/PromptComposer 66112:81908 · StyleTag 66109:81570 · SpecPackChip 66109:81583 · SpecPackPanel 66110:81628）----------
  // 电脑：680 宽弹窗（S-D-01~05）；手机：底部面板（S-M-01~05）。规范包：电脑 = 芯片下方弹层（630 宽、最高 232、内部滚动），手机 = 叠在上面的底部面板
  const SPEC_ROWS = ['pages', 'canvas', 'logo', 'banner', 'icons', 'colors', 'fonts', 'lang'];
  const specRows = () => `<div class="ct-spec-rows">${SPEC_ROWS.map((k) => `<div class="ct-spec-row"><span class="k">${esc(t('ct/spec-k-' + k))}</span><span class="v">${esc(t('ct/spec-v-' + k))}</span></div>`).join('')}</div>`;
  const roBadge = () => `<span class="ct-ro">${ic('lock-fill')}${esc(t('ct/spec-readonly'))}</span>`;
  const specPop = () => `<div class="ct-spec-pop" role="dialog" aria-label="${esc(t('ct/spec-title'))}"><div class="ct-spec-h">${ic('cube-fill', 'ct-spec-ic')}<b>${esc(t('ct/spec-title'))}</b>${roBadge()}<span class="ct-spec-sub">${esc(t('ct/spec-sub'))}</span>${xBtn('ctSpecClose')}</div>${specRows()}<p class="ct-spec-src">${esc(t('ct/spec-source'))}</p></div>`;
  function specSheet() {
    const st = still('s:spec');
    return `<div class="scrim ct-spec-scrim${st}" data-act="ctSpecClose"></div><div class="sheet ct-sheet is-spec${st}" role="dialog" aria-label="${esc(t('ct/spec-title'))}"><div class="sheet-grab"></div>
      <div class="ct-spec-h">${ic('cube-fill', 'ct-spec-ic')}<h3>${esc(t('ct/spec-title'))}</h3>${roBadge()}<span class="grow"></span>${xBtn('ctSpecClose')}</div><p class="ct-spec-sub">${esc(t('ct/spec-sub'))}</p>
      ${specRows()}<p class="ct-spec-src">${esc(t('ct/spec-source'))}</p><button class="btn btn-secondary btn-block" data-act="ctSpecClose">${esc(t('ct/spec-ok'))}</button></div>`;
  }
  const showRestore = () => !!C.tag && C.prompt !== defPrompt(C.tag);
  function cmpBody(m) {
    syncAuto();
    const n = C.prompt.length, ok = window.canAfford(COST), go = canGo();
    const tags = `<div class="ct-cmp-sec"><div class="ct-cmp-lh"><span class="ct-cmp-lab">${esc(t('ct/cmp-tags'))}</span><span class="ct-cmp-hint">${esc(t('ct/cmp-tags-hint'))}</span></div>
      <div class="ct-tags" role="group" aria-label="${esc(t('ct/cmp-tags'))}">${Object.keys(TAGS).map((k) => `<button class="ct-tag ${C.tag === k ? 'is-on' : ''}" data-act="ctTag" data-arg="${k}" aria-pressed="${C.tag === k}">${tagDot(k)}<span>${esc(tagName(k))}</span></button>`).join('')}</div></div>`;
    const prompt = `<div class="ct-cmp-sec ct-cmp-pr"><div class="ct-cmp-ph"><label class="ct-cmp-lab" for="ct-prompt">${esc(t('ct/cmp-prompt'))}</label>
      <button class="ct-chip ${C.spec ? 'is-on' : ''}" data-act="ctSpec" aria-expanded="${C.spec}" aria-haspopup="dialog">${ic('cube-fill')}<span class="ellipsis">${esc(t('ct/spec-chip'))}</span>${ic('caret-down', 'ct-chev')}</button></div>
      <div class="ct-ta"><textarea id="ct-prompt" data-input="ctPrompt" maxlength="${PMAX}" placeholder="${esc(t('ct/cmp-prompt-ph'))}">${esc(C.prompt)}</textarea>
        <div class="ct-ta-bar"><button class="ct-restore" data-act="ctRestore" data-ct-restore ${showRestore() ? '' : 'hidden'}>${ic('arrow-counter-clockwise')}${esc(t('ct/cmp-restore'))}</button><span class="grow"></span><span class="ct-cnt ${n >= PMAX ? 'is-max' : ''}" data-ct-cnt>${n}/${PMAX}</span></div></div>
      ${C.spec && !m ? specPop() : ''}</div>`;
    const goBtn = `<button class="btn btn-primary ct-go ${m ? 'btn-block' : ''} ${go ? '' : 'is-disabled'}" data-act="ctGenGo" data-ct-go ${go ? '' : 'disabled'}>${ic('sparkle-fill')}${esc(t('ct/gen-go', { n: COST }))}</button>`;
    const cost = `<b class="${ok ? '' : 'err-text'}">${esc(t('ct/cost-n', { n: COST }))}</b>`;
    if (m) {
      return `<div class="ct-cmp is-m"><div class="ct-cmp-h"><h3 class="grow">${esc(t('ct/cmp-title'))}</h3>${xBtn('ctClose')}</div><p class="ct-cmp-sub">${esc(t('ct/cmp-sub-m'))}</p>
        ${tags}${prompt}<div class="ct-cmp-cost">${cost}<span>${esc(t('ct/balance-eta-m', { n: num(S.credits) }))}</span></div>${goBtn}</div>`;
    }
    return `<div class="ct-cmp"><div class="ct-cmp-h"><div class="grow"><h3>${esc(t('ct/cmp-title'))}</h3><p class="ct-cmp-sub">${esc(t('ct/cmp-sub'))}</p></div>${xBtn('ctClose')}</div>
      ${tags}${prompt}<hr class="ct-cmp-hr"><div class="ct-cmp-foot"><div class="ct-cmp-cost">${cost}<span>${esc(t('ct/balance-eta', { n: num(S.credits) }))}</span></div><span class="grow"></span><button class="btn btn-secondary" data-act="ctClose">${esc(t('confirm/cancel'))}</button>${goBtn}</div></div>`;
  }
  // 打字时不整页重渲染：只更新计数（到 300 变红）、「恢复默认提示词」、生成按钮可不可点
  function cmpSync() {
    const n = C.prompt.length;
    const c = document.querySelector('[data-ct-cnt]'); if (c) { c.textContent = n + '/' + PMAX; c.classList.toggle('is-max', n >= PMAX); }
    const r = document.querySelector('[data-ct-restore]'); if (r) r.hidden = !showRestore();
    const g = document.querySelector('[data-ct-go]'); if (g) { const ok = canGo(); g.disabled = !ok; g.classList.toggle('is-disabled', !ok); }
  }
  function layers() {
    let h = '';
    const m = mob();
    if (C.picker) h += m ? ctSheet(pickerBody(true), 'is-pick', 'ctPickClose') : ctDialog(pickerBody(false), 'is-pick', 'ctPickClose');
    else if (C.dlg === 'cmp') { h += m ? ctSheet(cmpBody(true), 'is-cmp') : ctDialog(cmpBody(false), 'is-cmp'); if (m && C.spec) h += specSheet(); }
    if (m && C.stage === 'gen') h += `<div class="sheet ct-sheet is-gen${still('gen')}" role="status"><div class="sheet-grab"></div><div class="ct-mgen-h"><h3>${esc(t('ct/gen-title'))}</h3><span class="caption muted">${esc(t('ct/gen-charged', { n: COST }))}</span></div>${genSteps()}<button class="btn btn-secondary btn-block" data-act="ctGenCancel" style="margin-top:16px">${esc(t('ct/gen-cancel'))}</button></div>`;
    if (m && C.msheet && C.stage === 'edit' && !C.picker && !C.dlg) h += mSheet();
    h += window.costConfirmLayer ? window.costConfirmLayer() : '';
    return h;
  }
  function mSheet() {
    const b = selB();
    if (C.msheet === 'lib' || C.msheet === 'layers') return ctSheet(`<div class="sheet-head"><div><h3>${esc(t(C.msheet === 'lib' ? 'ct/lib' : 'ct/layers'))}</h3><p class="caption faint">${esc(t(C.msheet === 'lib' ? 'ct/lib-sub-m' : 'ct/layers-sub'))}</p></div>${xBtn('ctClose')}</div><div class="ct-mlib">${libHtml({ head: false, adds: C.msheet === 'lib' })}</div>`, 'is-lib');
    if (C.msheet === 'layout' && b) return ctSheet(`<div class="sheet-head"><div><h3>${esc(t('ct/swap-title', { m: modName(b.m) }))}</h3><p class="caption faint">${esc(t('ct/swap-sub'))}</p></div>${xBtn('ctClose')}</div><div class="ct-lgrid is-m" data-sk="ct-mlg">${layoutCards(b)}</div><div class="ct-sec">${paramsHtml(b)}</div>`, 'is-layout', 'ctClose');
    if (C.msheet === 'glob') return ctSheet(`<div class="sheet-head"><div><h3>${esc(t('ct/page-title'))}</h3><p class="caption faint">${esc(t('ct/glob-sub-m'))}</p></div>${xBtn('ctClose')}</div><div class="ct-sec">${startCard()}</div><div class="ct-sec"><div class="ct-lab">${esc(t('ct/glob'))}</div>${globHtml()}</div>`, 'is-glob');
    return '';
  }

  // ======================================================================
  // 视图
  // ======================================================================
  function deskView() {
    const gen = C.stage === 'gen', b = selB();
    const right = gen ? genPanel() : b ? (C.pane === 'layout' ? layoutPanel(b) : modPanel(b)) : pagePanel();
    return `<div class="ct ${gen ? 'is-gen' : ''}">
      <header class="ct-top"><button class="ibtn ibtn-sm" data-act="ctBack" title="${esc(t('nav/home'))}" aria-label="${esc(t('nav/home'))}">${ic('caret-left')}</button><b class="ct-name ellipsis">${esc(t('ct/title'))}</b><span class="ct-saved">${ic('check-circle-fill', 'ic-16')}${esc(t('ct/saved'))}</span>${window.demoTag ? window.demoTag() : ''}${devSeg()}
        <span class="spacer"></span>${undoRedo()}${genBtn()}</header>
      <div class="ct-body"><nav class="ct-left" data-sk="ct-left">${libHtml()}</nav>
        <div class="ct-cwrap"><main class="ct-canvas" data-sk="ct-canvas" data-act="ctBg">${canvasHtml()}</main><div class="ct-cvtag">${esc(t('ct/cv-tag'))}</div>${zoomCtl()}</div>
        <aside class="ct-right" data-sk="ct-right">${right}</aside></div></div>${layers()}`;
  }
  function mobileView() {
    const b = selB();
    const tools = [['lib', 'squares-four-fill', 'ct/mt-lib'], ['layers', 'stack-fill', 'ct/mt-layers'], ['layout', 'layout-fill', 'ct/mt-layout'], ['preview', 'eye-fill', 'ct/mt-preview']];
    return `<div class="ct ct-m ${C.stage === 'gen' ? 'is-gen' : ''}">
      <header class="ct-mtop"><button class="ibtn ibtn-sm" data-act="ctBack" aria-label="${esc(t('nav/home'))}">${ic('caret-left')}</button><div class="ct-mt grow"><b class="ellipsis">${esc(t('ct/title'))}</b><span class="caption faint">${esc(t('ct/saved'))}</span></div>${undoRedo()}${genBtn()}</header>
      <main class="ct-canvas is-m" data-sk="ct-mcanvas" data-act="ctBg">${canvasHtml()}</main>
      ${C.preview ? `<button class="btn btn-primary ct-prevx" data-act="ctPreview">${ic('x', 'ic-16')}${esc(t('ct/exit-preview'))}</button>` : ''}
      <nav class="ct-mbar">${tools.map(([k, i, l]) => `<button class="${(C.msheet === k || (k === 'layout' && C.msheet === 'glob') || (k === 'preview' && C.preview)) ? 'is-on' : ''}" data-act="ctMTool" data-arg="${k}" ${C.stage === 'gen' ? 'disabled' : ''}>${ic(i)}<span>${esc(t(l))}</span></button>`).join('')}</nav></div>${layers()}${b ? '' : ''}`;
  }
  function resultView() {
    const r = C.res, m = mob(), rs = r.cs || STYLE_OF[r.x];
    const img = `<img src="assets/custom-tpl/result-${resKey(r.x, rs)}.jpg" alt="${esc(t('ct/res-ai', { s: tagName(r.tag) }))}">`;
    const wf = `<div class="wf-page" style="zoom:${m ? (window.innerWidth - 34) / 750 : 0.5}">${pageHtml(r.doc || C.doc, { tags: true })}</div>`;
    const info = [['ct/i-style', `${resDot(r.tag, rs)}<b>${esc(tagName(r.tag))}</b>`], ['ct/i-match', `<b>${esc(t('ct/plan', { x: r.x }))} · ${esc(t('ct/match-n', { n: r.pct }))}</b>`], ['ct/i-cost', `<b>${esc(t('ct/pts', { n: r.cost }))}</b>`], ['ct/i-time', `<b>${esc(t('ct/secs', { n: r.sec }))}</b>`]];
    const pill = `<span class="pill-tag ct-rpill">${esc(t('ct/plan', { x: r.x }))} · ${esc(tagName(r.tag))}</span>`;
    if (m) {
      return `<div class="ct ct-m ct-res is-m"><header class="ct-mtop"><button class="ibtn ibtn-sm" data-act="ctResBack" aria-label="${esc(t('ct/back-wf'))}">${ic('caret-left')}</button><b class="grow ellipsis">${esc(t('ct/res-title'))}</b>${pill}</header>
        <div class="ct-res-m" data-sk="ct-resm"><div class="seg ct-rseg">${[['ai', 'ct/res-tab-ai'], ['wf', 'ct/res-tab-wf']].map(([v, k]) => `<button class="seg-opt ${C.rtab === v ? 'is-on' : ''}" data-act="ctRTab" data-arg="${v}">${esc(t(k))}</button>`).join('')}</div>
        <div class="ct-rframe ${C.rtab === 'ai' ? 'is-img' : ''}" data-sk="ct-rframe-${C.rtab}">${C.rtab === 'ai' ? img : wf}</div>
        <div class="ct-rinfo caption muted">${resDot(r.tag, rs)}<span>${esc(t('ct/res-line', { n: r.pct, c: r.cost, s: r.sec }))}</span></div></div>
        <div class="ct-rbar"><button class="btn btn-secondary" data-act="ctRegen">${ic('magic-wand', 'ic-16')}${esc(t('ct/regen'))}</button><button class="btn btn-primary" data-act="ctAdopt">${esc(t('ct/adopt'))}</button></div></div>${layers()}`;
    }
    return `<div class="ct ct-res"><header class="ct-top"><button class="ibtn ibtn-sm" data-act="ctResBack" title="${esc(t('ct/back-wf'))}" aria-label="${esc(t('ct/back-wf'))}">${ic('caret-left')}</button><b class="ct-name">${esc(t('ct/res-title'))}</b>${pill}<span class="spacer"></span>
        <button class="btn btn-secondary btn-sm" data-act="ctResBack">${ic('arrow-u-up-left', 'ic-16')}${esc(t('ct/back-wf'))}</button><button class="btn btn-secondary btn-sm" data-act="ctRegen">${ic('magic-wand', 'ic-16')}${esc(t('ct/regen'))}</button><button class="btn btn-primary btn-sm" data-act="ctAdopt">${esc(t('ct/adopt'))}</button></header>
      <div class="ct-res-body">
        <section class="ct-rcol"><div class="ct-rh"><b>${esc(t('ct/res-wf'))}</b><span class="caption faint">${esc(t('ct/res-wf-sub'))}</span></div><div class="ct-rframe" data-sk="ct-rwf">${wf}</div></section>
        <div class="ct-rarrow">${ic('arrow-right')}</div>
        <section class="ct-rcol"><div class="ct-rh"><b>${esc(t('ct/res-ai', { s: tagName(r.tag) }))}</b><span class="caption faint">${esc(t('ct/res-ai-sub'))}</span></div><div class="ct-rframe is-img is-on" data-sk="ct-rimg">${img}</div></section>
        <aside class="ct-rcard"><h3>${esc(t('ct/res-card'))}</h3>${info.map(([k, v]) => `<div class="ct-rrow"><span class="muted">${esc(t(k))}</span><span class="ct-rv">${v}</span></div>`).join('')}
          <p class="caption muted ct-rnote">${esc(t('ct/res-note'))}</p><button class="btn btn-primary btn-block" data-act="ctAdopt">${esc(t('ct/adopt'))}</button><button class="btn btn-secondary btn-block" data-act="ctRegen">${ic('magic-wand', 'ic-16')}${esc(t('ct/regen-n', { n: COST }))}</button>
          <p class="caption faint">${esc(t('ct/res-foot'))}</p></aside></div></div>${layers()}`;
  }
  window.VIEWS.custom = function () {
    if (!C.doc) { C.doc = fromStart('blank'); C.picker = true; C.pickSeen = false; C.pick = 'A'; }
    if (C.stage === 'result' && C.res) return resultView();
    if (C.stage === 'result') C.stage = 'edit';
    return mob() ? mobileView() : deskView();
  };

  // ---------- 入口（首页「模板」区 / 模板页）----------
  function entry() {
    const art = `<div class="ct-entry-art" aria-hidden="true"><i></i><i class="b"></i><span><i></i><i></i><i></i><i></i></span><span><i></i><i></i><i></i><i></i></span></div>`;
    return `<div class="ct-entry">${art}<div class="ct-entry-t"><h3>${esc(t('ct/entry-title'))}<span class="pill-tag">${esc(t('ct/new'))}</span></h3><p class="muted">${esc(t('ct/entry-desc'))}</p></div><button class="btn btn-primary btn-sm" data-act="ctOpen">${ic('layout-fill', 'ic-16')}${esc(t('ct/entry-btn'))}</button></div>`;
  }
  // ---------- 采用后纳入编辑器（Figma 03 页 D-05 / D-06 / M-05 / M-06，2026-11-27 晚）----------
  // 成品按模块切片（750 稿 y 坐标）：画布显示的就是采用的那张成品，左栏按成品模块列出，可选中 / 隐藏 / 排序；
  // 第 4 项 = 分区名（游戏分区 · 热门…），第 5 项 = [x0, x1] 横向切（D 左侧竖向分类栏 + 右侧游戏）
  const BANDS = {
    A: { top: [0, 90], bn: [6110, 6299], m: [['banner', 90, 378], ['notice', 378, 456], ['midnav', 456, 636], ['gamemenu', 636, 796], ['gamecards', 796, 1400, 'hot'], ['promo', 1400, 1620], ['gamecards~1', 1620, 2215, 'fish'], ['gamecards~2', 2215, 3050, 'live'], ['gamecards~3', 3050, 3590, 'chess'], ['jackpot', 3590, 4040], ['rank', 4040, 4600], ['footer', 4600, 6110]] },
    B: { top: [0, 90], bn: [3370, 3572], m: [['banner', 90, 440], ['midnav', 440, 600], ['jackpot', 600, 700], ['notice', 700, 765], ['gamemenu', 765, 1100], ['gamecards', 1100, 1600, 'rec'], ['footer', 1600, 3370]] },
    C: { top: [0, 90], bn: [5590, 5779], m: [['banner', 90, 455], ['notice', 455, 525], ['search', 525, 610], ['gamemenu', 610, 700], ['gamecards', 700, 1110, '=Hot'], ['gamecards~1', 1110, 1520, '=Nổ Hũ'], ['gamecards~2', 1520, 1910, '=Game Bài'], ['gamecards~3', 1910, 2300, '=Bàn Cá'], ['gamecards~4', 2300, 3020, '=Casino'], ['gamecards~5', 3020, 3410, '=Thể Thao'], ['gamecards~6', 3410, 3810, '=Blockchain'], ['footer', 3810, 5590]] },
    D: { top: [0, 90], bn: [4040, 4235], m: [['banner', 90, 420], ['notice', 420, 490], ['midnav', 490, 610], ['gamemenu', 610, 2005, 'side', [0, 122]], ['gamecards', 610, 2005, null, [122, 750]], ['footer', 2005, 4040]] },
  };
  // 采用：在编辑器默认设计上挂成品（D.ct），模块顺序 = 成品模块
  // tag：风格标签（null = 不选标签、按提示词）；旧调用没传时按配色反推
  function ctDesign(D, x, cs, tag) {
    const bd = BANDS[x]; if (!bd) return D;
    cs = STYLES[cs] ? cs : STYLE_OF[x];
    D.ct = { x, s: cs, tag: tag === undefined ? TAG_OF[cs] : okTag(tag), k: resKey(x, cs), b: {} };
    bd.m.forEach((r) => { D.ct.b[r[0]] = { y: [r[1], r[2]], sub: r[3] || null, xr: r[4] || null }; });
    D.ct.b.topbar = { y: bd.top }; D.ct.b.bottomnav = { y: bd.bn };
    D.order = bd.m.map((r) => r[0]); D.hidden = {};
    D.tb.items.side = false; D.tb.h = bd.top[1] - bd.top[0];
    // Banner 面板里的轮播图 = 成品自己的 Banner（换图 / AI 生成后画布改用编辑器的 Banner 组件显示新图）
    const bf = 'img:assets/custom-tpl/banner-' + D.ct.k + '.jpg';
    D.banner.size = 'medium'; D.banner.slides = [0, 1, 2].map(() => ({ f: bf, w: 1020, h: 300 }));
    D.ct.bf = bf;
    return D;
  }
  // 模块名：游戏分区带分区名
  function ctName(D, id) {
    const c = D && D.ct && D.ct.b[id]; if (!c) return null;
    const b = id.split('~')[0];
    const base = t({ banner: 'mod/banner', notice: 'mod/notice', jackpot: 'cat/jackpot', midnav: 'mod/account', gamemenu: 'mod/gamemenu', gamecards: 'mod/gamecards', footer: 'cat/footer', topbar: 'mod/topbar', bottomnav: 'mod/bottomnav', search: 'ct/m-search', promo: 'ct/m-promo', rank: 'ct/m-rank' }[b] || 'mod/banner');
    if (!c.sub) return base;
    return base + ' · ' + (c.sub[0] === '=' ? c.sub.slice(1) : t('ct/sub-' + c.sub));
  }
  // 成品大图只在根节点挂一次（CSS 变量），切片引用变量：单文件版不用每次渲染都把 1MB 的内嵌图写进 DOM
  // 16 张：原稿 result-X（内嵌），配色版本 result-X-风格（太大不内嵌，发布时作为附带文件）
  ['A', 'B', 'C', 'D'].forEach((x) => Object.keys(STYLES).forEach((st) => { const id = resKey(x, st), k = 'custom-tpl/result-' + id + '.jpg'; document.documentElement.style.setProperty('--ct-res-' + id, `url(${(window.A_ && window.A_[k]) || 'assets/' + k})`); }));
  // 画布切片：750 稿 → 画布 375（÷2）
  function ctSlice(D, id) {
    const c = D.ct && D.ct.b[id]; if (!c) return null;
    const [y0, y1] = c.y, [x0, x1] = c.xr || [0, 750];
    return `<div class="ct-slice" style="width:${(x1 - x0) / 2}px;height:${(y1 - y0) / 2}px;background-image:var(--ct-res-${D.ct.k || D.ct.x});background-position:${-x0 / 2}px ${-y0 / 2}px"></div>`;
  }
  // 右栏「页面」：AI 成品已纳入编辑器（Figma D-05 panel-right · 已采用）
  function edPanel(D) {
    const tg = 'tag' in D.ct ? okTag(D.ct.tag) : TAG_OF[D.ct.s]; // 11-28 前采用的成品没有 tag：按配色反推
    return `<h2 class="p-title"><span class="ellipsis">${esc(t('ct/ed-title'))}</span></h2>
      <div class="ct-edcard"><div class="row"><b>${esc(tagName(tg))} · ${esc(t('ct/ed-adopted'))}</b>${resDot(tg, D.ct.s)}</div><span class="caption muted">${esc(t('ct/plan', { x: D.ct.x }))} · ${esc(t('ct/ed-cost', { n: COST }))}</span></div>
      <p class="caption muted ct-eddesc">${esc(t('ct/ed-desc', { n: Object.keys(D.ct.b).filter((x) => x !== 'topbar' && x !== 'bottomnav').length }))}</p>
      <button class="btn btn-secondary btn-block" data-act="ctEdBack">${ic('palette-fill', 'ic-16')}${esc(t('ct/ed-back'))}</button>
      <button class="btn btn-outline btn-block" data-act="ctEdUndo">${esc(t('ct/ed-undo'))}</button>`;
  }
  A.ctEdBack = () => { C.stage = 'edit'; C.sel = null; C.pane = null; C.dlg = null; window.go('custom'); return false; };
  A.ctEdUndo = () => { if (C.res) { C.stage = 'result'; C.dlg = null; } window.go('custom'); return false; };
  // lastRequest：最近一次确认扣点的整页生成请求（docs/spec-pack/request-example.md 的形状），给网关开发对照；演示版不发出去
  window.CT = { entry, pseg, match: (d, s) => match(d || C.doc, s || null), startDoc, fromTpl, ctDesign, ctName, ctSlice, edPanel, buildRequest: () => (C.doc ? buildReq() : null), get lastRequest() { return lastReq; } };

  // ======================================================================
  // 动作
  // ======================================================================
  const dragged = () => !!C.__drag;
  A.ctOpen = () => { C.picker = true; C.pickSeen = false; C.pick = C.doc ? (C.doc.start === 'blank' ? 'A' : C.doc.start || 'A') : 'A'; if (C.stage !== 'gen') C.stage = 'edit'; C.sel = null; C.pane = null; C.dlg = null; C.msheet = null; C.preview = false; window.go('custom'); return false; };
  // 通用版式「用这个模板新建」（11-28，Figma 04-6 注 66149:140067 ②）：综合版1 → 直接带着综合版1起始线框进 #/custom 的排版画布
  // （不弹起始线框、不弹新建项目名）；经 commit() 载入，撤销回到之前的画布；之前画布有内容时提示上带「撤销」。生成中不打断，只跳过去。
  const TPL_START = { 'classic-blue': 'classic' };
  const shape = (d) => JSON.stringify(d, (k, v) => (k === 'id' ? undefined : v)); // 比较结构，不比 id
  function fromTpl(tk) {
    const k = TPL_START[tk]; if (!k) return false;
    if (C.stage === 'gen') { window.go('custom'); return true; }
    const prev = C.doc, fresh = fromStart(k);
    const had = !!prev && shape(prev) !== shape(startDoc('blank')) && shape(prev) !== shape(fresh);
    if (prev) commit(() => { C.doc = fresh; }); else C.doc = fresh;
    C.stage = 'edit'; C.picker = false; C.sel = null; C.pane = null; C.dlg = null; C.msheet = null; C.preview = false;
    window.go('custom');
    window.toast(t('ct/started', { s: stName(k) }), had ? Object.assign({ ms: 5000 }, undoOpt()) : {});
    return true;
  }
  A.ctBack = () => { window.go('home'); return false; };
  A.ctPick = (k) => { C.pick = k; };
  A.ctStart = () => { const k = C.pick; commit(() => { C.doc = JSON.parse(JSON.stringify(fromStart(k))); }); C.picker = false; C.sel = null; C.pane = null; C.msheet = null; window.toast(t('ct/started', { s: stName(k) })); };
  A.ctPickClose = () => { C.picker = false; };
  A.ctRepick = () => { C.pick = C.doc.start && C.doc.start !== 'blank' ? C.doc.start : 'A'; C.picker = true; C.pickSeen = false; C.msheet = null; };
  A.ctClose = () => { if (C.dlg) { C.dlg = null; C.spec = false; } else if (C.msheet) { if (C.msheet === 'layout') C.pane = null; C.msheet = null; } };
  A.ctBg = () => { if (dragged()) return false; if (!C.sel && !C.pane) return false; C.sel = null; C.pane = null; };
  A.ctSel = (id) => {
    if (dragged() || C.stage !== 'edit') return false;
    if (C.sel !== id) { C.pane = null; C.orig = null; }
    C.sel = id;
    if (mob() && C.msheet && C.msheet !== 'layout') C.msheet = null;
    if (mob() && C.msheet === 'layout') { const b = selB(); C.orig = b ? b.o : null; }
    C.scrollSel = 'list';
  };
  A.ctPaneBack = () => { C.pane = null; };
  A.ctLayout = () => { const b = selB(); if (!b) return false; C.orig = b.o; if (mob()) { C.msheet = 'layout'; C.scrollSel = 'top'; } else C.pane = 'layout'; };
  A.ctOpt = (o) => { const b = selB(); if (!b || b.o === o) return false; commit(() => { b.o = o; Object.assign(b.p, OPT_P[o] || {}); }); };
  A.ctParam = (arg) => { const b = selB(); if (!b) return false; const [k, v] = arg.split('|'); const val = k === 'cols' || k === 'rows' ? +v : v; if (b.p[k] === val) return false; commit(() => { b.p[k] = val; }); };
  A.ctGlob = (arg) => {
    const [k, v] = arg.split('|'); if (C.doc.glob[k] === v) return false;
    commit(() => { C.doc.glob[k] = v; C.doc.blocks.forEach((b) => { if (k !== 'h' || b.m === 'zone') b.p[k] = v; }); });
  };
  A.ctEye = (id) => { const b = findB(id); if (!b || (MODS[b.m].fixed && b.m !== 'float')) return false; commit(() => { b.hid = !b.hid; }); if (b.hid && C.sel === id) { C.sel = null; C.pane = null; } };
  const move = (d) => { const b = selB(); const L = C.doc.blocks, i = L.indexOf(b), j = i + d; if (i < 0 || j < 0 || j >= L.length) return false; commit(() => { L.splice(i, 1); L.splice(j, 0, b); }); };
  A.ctUp = () => move(-1);
  A.ctDown = () => move(1);
  A.ctDup = () => { const b = selB(); const L = C.doc.blocks, i = L.indexOf(b); if (i < 0) return false; const c = JSON.parse(JSON.stringify(b)); c.id = nid(); commit(() => { L.splice(i + 1, 0, c); }); C.sel = c.id; C.pane = null; window.toast(t('ct/dup-toast', { m: modName(b.m) })); };
  const undoOpt = () => ({ action: () => { A.ctUndo(); window.render(); }, actionLabel: t('ed/undo') });
  A.ctHide = () => { const b = selB(); if (!b || (MODS[b.m].fixed && b.m !== 'float')) return false; commit(() => { b.hid = true; }); C.sel = null; C.pane = null; if (C.msheet === 'layout') C.msheet = null; window.toast(t('ct/hid-toast', { m: modName(b.m) }), undoOpt()); };
  A.ctDel = () => { const b = selB(); const L = C.doc.blocks, i = L.indexOf(b); if (i < 0) return false; commit(() => { L.splice(i, 1); }); C.sel = null; C.pane = null; if (C.msheet === 'layout') C.msheet = null; window.toast(t('ct/del-toast', { m: modName(b.m) }), undoOpt()); };
  A.ctUndo = () => { if (!C.past.length || C.stage !== 'edit') return false; C.future.push(JSON.stringify(C.doc)); restore(C.past.pop()); };
  A.ctRedo = () => { if (!C.future.length || C.stage !== 'edit') return false; C.past.push(JSON.stringify(C.doc)); restore(C.future.pop()); };
  function insertAt(m, idx) {
    const g = C.doc.glob, o = MODS[m].opts[0];
    const b = mk(m, o, null, g);
    commit(() => { C.doc.blocks.splice(idx, 0, b); });
    C.sel = b.id; C.pane = null; C.scrollSel = 'canvas';
    window.toast(t('ct/added', { m: modName(m) }));
    return b;
  }
  A.ctAdd = (m) => {
    if (dragged() || C.stage !== 'edit') return false;
    const L = C.doc.blocks, s = selB();
    let idx = s && L.indexOf(s) >= 0 ? L.indexOf(s) + 1 : L.length;
    if (!(s && L.indexOf(s) >= 0)) { const f = L.findIndex((b) => b.m === 'footer'); if (f >= 0 && m !== 'footer') idx = f; }
    insertAt(m, idx);
    if (mob()) C.msheet = null;
  };
  A.ctZoom = (d) => { const i = ZOOMS.indexOf(C.zoom) + +d; if (i < 0 || i >= ZOOMS.length) return false; C.zoom = ZOOMS[i]; };
  A.ctDevice = (v) => { if (v !== 'pc') return false; const msg = t('level/coming-soon'); S.toasts = S.toasts.filter((x) => x.msg !== msg); window.toast(msg, { info: true }); return false; };
  A.ctMTool = (k) => {
    if (C.stage !== 'edit') return false;
    if (k === 'preview') { C.preview = !C.preview; C.msheet = null; C.sel = null; return; }
    C.preview = false;
    if (k === 'layout') { const b = selB(); if (b) { C.orig = b.o; C.msheet = C.msheet === 'layout' ? null : 'layout'; C.scrollSel = 'top'; } else C.msheet = C.msheet === 'glob' ? null : 'glob'; return; }
    C.msheet = C.msheet === k ? null : k;
  };
  A.ctPreview = () => { C.preview = false; };
  A.ctShowLast = () => { if (!C.last) return false; C.res = C.last; C.stage = 'result'; C.rtab = 'ai'; };

  // ---------- 生成 ----------
  // 打开 AI 一键生成弹窗：沿用上次的标签和提示词（同一会话第一次打开 = 未选标签、空提示词，Figma S1）
  A.ctGenOpen = () => {
    if (C.stage === 'gen') return false;
    const open = () => { C.dlg = 'cmp'; C.spec = false; C.picker = false; C.msheet = null; C.preview = false; };
    if (window.requireLogin) { if (!window.requireLogin(open)) return; } else open();
  };
  // 点标签：填入该标签当前语言的默认提示词并选中；之前改过的文字被换掉时给提示，可撤销（回到之前的标签 + 文字）。
  // 再点已选标签 = 取消选中，文字保留（之后按提示词、用版式原稿配色生成）；双击（第二下 detail > 1，或选中后 500ms 内）不算再点，免得选了又取消
  // 换标签的「撤销」只属于这个弹窗：弹窗关着（扣点确认、生成中、关掉了）先收起、点不到（hold），确认生成后直接收掉
  let tagAt = 0, swapT = null;
  const dropSwap = () => { if (swapT) window.toastDrop(swapT); swapT = null; };
  A.ctTag = (k, el, e) => {
    if (!TAGS[k]) return false;
    syncAuto();
    if (C.tag === k) { if ((e && e.detail > 1) || Date.now() - tagAt < 500) return false; C.tag = null; C.auto = false; return; }
    const prev = { tag: C.tag, prompt: C.prompt, auto: C.auto }, swap = edited();
    C.tag = k; C.prompt = defPrompt(k); C.auto = true; tagAt = Date.now();
    if (!swap) return;
    dropSwap(); // 同一时间只留最近一次换标签的撤销
    swapT = window.toast(t('ct/tag-swapped', { s: tagName(k) }), { ms: 5000, hold: () => S.route !== 'custom' || C.dlg !== 'cmp' || C.stage === 'gen', action: () => { swapT = null; Object.assign(C, prev); syncAuto(); if (S.route === 'custom') window.render(); }, actionLabel: t('ed/undo') });
  };
  A.ctRestore = () => { if (!C.tag) return false; C.prompt = defPrompt(C.tag); C.auto = true; };
  I.ctPrompt = (v, el, e) => {
    const comp = !!(e && e.isComposing); // 输入法拼写中：不改 el.value（会打断输入法，拼音字母留在框里、汉字进不去），拼写结束（compositionend）再截
    const s = !comp && v.length > PMAX ? v.slice(0, PMAX) : v;
    if (s !== v) el.value = s;
    C.prompt = s; C.auto = !!C.tag && s === defPrompt(C.tag);
    cmpSync();
    return false;
  };
  document.addEventListener('compositionend', (e) => { const el = e.target; if (el && el.id === 'ct-prompt') I.ctPrompt(el.value, el, null); });
  A.ctSpec = () => { C.spec = !C.spec; };
  A.ctSpecClose = () => { C.spec = false; };
  A.ctGenGo = () => {
    syncAuto();
    if (!canGo()) return false;
    const req = buildReq();
    C.dlg = null; C.spec = false;
    // ct: true → 本页的 Esc / 点空白也按「取消」处理：回到弹窗，标签和提示词不变
    window.costConfirm({ title: t('ct/cc-title'), body: t('ct/cc-desc-prompt'), cost: COST, okLabel: t('ct/cc-ok'), ct: true, onOk: () => startGen(req), onCancel: () => { C.dlg = 'cmp'; } });
  };
  // ---------- 生成请求（docs/spec-pack/request-example.md：前端 → 平台 POST /api/ai/page-jobs；规范包永远附带）----------
  // 演示版不发出去：挂在生成 / 结果状态（C.gen.req / C.res.req）和 window.CT.lastRequest 上，给网关开发对照
  let lastReq = null;
  function buildReq() {
    const d = C.doc, sp = window.CT_SPEC || {}, vis = d.blocks.filter((b) => !b.hid), src = sp.source || {};
    const prm = (b) => { const o = {}; paramKeys(b).forEach((k) => { o[k] = b.p[k]; }); return o; };
    const has = (m) => vis.some((b) => b.m === m);
    const set = (id) => (sp.iconSets || []).find((x) => x.id === id);
    const icon = (id, names, more) => { const x = set(id); return x ? Object.assign({ set: id, width: x.width, height: x.height, format: 'png', names: names || x.names }, more) : null; };
    const bn = ((sp.banners && sp.banners.sizes) || []).find((x) => x.id === 'general') || { width: 1020, height: 300 };
    const blank = C.prompt.trim() === '';
    return {
      projectId: null, // 原型没有后端项目；正式版填当前项目 id
      idempotencyKey: 'ct-page-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), // 防重复点击，同 key 只扣一次
      kind: 'page', locale: S.lang,
      layout: {
        platform: 'h5', starter: d.start || 'blank',
        fixed: { topbar: d.fixed.topbar.o, bottomnav: d.fixed.bottomnav.o, float: d.fixed.float.hid ? null : d.fixed.float.o },
        blocks: vis.map((b) => ({ id: b.id, module: b.m, option: b.o, params: prm(b) })),
        hidden: d.blocks.filter((b) => b.hid).map((b) => b.id),
        sequence: sig(d), // 结果匹配用的布局选项序列
      },
      styleTag: C.tag, stylePromptVersion: PROMPT_VER, promptEdited: !blank && C.prompt !== defPrompt(C.tag),
      prompt: blank ? defPrompt(C.tag) : C.prompt.slice(0, PMAX), // 标签选中、文字清空（或只有空格）→ 用标签默认提示词
      specPack: { version: sp.version, source: 'figma:' + src.figmaFile + '/' + src.node, inline: sp },
      outputs: { // 由排版 + 规范包算出来，业主不选
        theme: { keys: ['primary', 'lead', 'neutral_1', 'neutral_2', 'border', 'bg_1', 'bg_2', 'accent_1', 'accent_2', 'accent_3', 'text_primary'], max: 11 },
        banners: has('banner') ? [{ slot: 'banner:general', width: bn.width, height: bn.height, format: 'png', count: 3 }] : [],
        icons: [has('gamemenu') && icon('gameType'), has('account') && icon('midNav.message'), icon('bottomNav', ((set('bottomNav') || {}).names || []).slice(0, 5), { states: ['default', 'active'] })].filter(Boolean),
        logo: false, gameCards: false,
      },
      cost: COST,
    };
  }
  let genTok = 0, genTimer = null;
  function startGen(req) {
    const tag = req.styleTag;
    window.spend(COST, 'customtpl', { style: { k: 'ct/tag-' + (tag || 'none') } });
    const lid = S.ledger[0] && S.ledger[0].kind === 'customtpl' ? S.ledger[0].id : null;
    const tok = ++genTok, doc = JSON.parse(JSON.stringify(C.doc));
    lastReq = req; dropSwap();
    C.stage = 'gen'; C.sel = null; C.pane = null; C.msheet = null; C.preview = false; C.dlg = null; C.spec = false;
    // 有标签用标签对应的配色版本；没标签用匹配到的版式自己的原稿配色
    const pick = () => { const mr = match(doc, tag ? TAGS[tag] : null); return { mr, cs: tag ? TAGS[tag] : STYLE_OF[mr.x] }; };
    C.gen = { t0: Date.now(), p: 0, tag, cs: pick().cs, lid, tok, doc, req };
    const tick = () => {
      if (tok !== genTok || C.stage !== 'gen') return;
      C.gen.p = Math.min(1, (Date.now() - C.gen.t0) / GEN_MS);
      if (C.gen.p >= 1) {
        const { mr, cs } = pick();
        const r = { x: mr.x, pct: mr.pct, tag, cs, prompt: req.prompt, cost: COST, sec: Math.max(1, Math.round((Date.now() - C.gen.t0) / 1000)), doc, at: Date.now() };
        C.res = Object.assign({ req }, r);
        C.last = r; // 存本地的不带请求（规范包全文），请求看 CT.lastRequest
        C.gen = null; C.stage = 'result'; C.rtab = 'ai';
        if (S.route === 'custom') { window.render(); const sc = document.querySelector('.ct-res-body'); if (sc) sc.scrollTop = 0; }
        else window.toast(t('ct/done-away'), { action: () => { window.go('custom'); }, actionLabel: t('ct/view'), ms: 5000 });
        return;
      }
      if (S.route === 'custom') window.render();
      genTimer = setTimeout(tick, 120);
    };
    genTimer = setTimeout(tick, 60);
  }
  A.ctGenCancel = () => {
    if (C.stage !== 'gen' || !C.gen) return false;
    genTok++; clearTimeout(genTimer);
    // 未完成不扣点：退回刚才扣的点数并去掉那条流水
    S.credits += COST; S.monthUsed = Math.max(0, S.monthUsed - COST); S.monthRuns = Math.max(0, S.monthRuns - 1);
    if (C.gen.lid) S.ledger = S.ledger.filter((l) => l.id !== C.gen.lid);
    if (window.persistCore) window.persistCore();
    C.gen = null; C.stage = 'edit';
    window.toast(t('ct/gen-cancelled'), { info: true });
  };
  A.ctResBack = () => { C.stage = 'edit'; C.sel = null; C.pane = null; };
  A.ctRegen = () => { C.dlg = 'cmp'; C.spec = false; }; // 带着上次的标签和提示词
  A.ctRTab = (v) => { C.rtab = v; };
  A.ctAdopt = () => {
    const r = C.res; if (!r) return false;
    const cs = r.cs || STYLE_OF[r.x], pal = { green: 'green', gold: 'gold', night: 'green', blue: 'blue' }[cs];
    const base = t('ct/proj-name', { x: r.x });
    const P = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    let name = base, i = 2;
    while (P.some((p) => p.name === name)) name = `${base} (${i++})`;
    const go = () => {
      if (Array.isArray(window.PROJECTS)) window.PROJECTS.unshift({ name, st: 'designing', time: 'time/just', tone: pal, template: 'classic-blue' });
      C.stage = 'edit'; C.dlg = null;
      try { ['ed.d.', 'ed.st.', 'ed.x.'].forEach((k) => localStorage.removeItem('proto.' + k + name)); } catch (e) { /* 隐私模式 */ }
      window.openEditor({ name, template: 'classic-blue', palette: pal, status: 'designing', ct: r.x, cs, tag: r.tag || null });
      // 编辑器先显示约 1.5 秒加载步骤，加载完再提示
      const t0 = Date.now();
      const wait = () => { if (window.E && window.E.loading && Date.now() - t0 < 8000) { setTimeout(wait, 150); return; } window.toast(t('ct/adopted', { s: tagName(r.tag) }), { ms: 5000, action: () => { window.go('custom'); }, actionLabel: t('ct/back-wf') }); };
      setTimeout(wait, 200);
    };
    go();
    return false;
  };

  // Esc：关掉本页弹层（core 的 Esc 只管 S.*）；顺序：规范包 → 生成弹窗 → …
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || S.route !== 'custom' || S.dialog || S.sheet) return;
    if (C.spec && C.dlg) C.spec = false; else if (C.picker) C.picker = false; else if (C.dlg) C.dlg = null; else if (C.msheet) C.msheet = null; else if (C.preview) C.preview = false; else if (C.pane) C.pane = null; else if (C.sel) C.sel = null; else return;
    window.render();
  });

  // 扣点确认（本页发起的）上按 Esc / 点空白 = 点「取消」：回到 AI 一键生成弹窗，标签和提示词不变（core 的 Esc / 点空白只关弹窗，不走 onCancel）
  const ctCost = () => S.route === 'custom' && S.cost && S.cost.ct && (S.dialog === 'cost' || S.sheet === 'cost');
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !ctCost()) return;
    e.stopPropagation(); e.preventDefault();
    A.costCancel(); window.render();
  }, true);
  // 电脑规范包弹层：点弹层外面（含弹窗其他地方）只关弹层，不触发点到的东西（Figma S-D-OV「点空白关闭」）
  document.addEventListener('click', (e) => {
    if (S.route !== 'custom') return;
    if (ctCost() && e.target.matches('.scrim[data-act="closeAll"]')) { e.stopPropagation(); A.costCancel(); window.render(); return; }
    if (!C.spec || C.dlg !== 'cmp' || mob()) return;
    if (e.target.closest('.ct-spec-pop') || e.target.closest('[data-act="ctSpec"]') || e.target.closest('.toast-wrap')) return; // 提示（换标签的撤销）照常点
    e.stopPropagation(); e.preventDefault(); C.spec = false; window.render();
  }, true);
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'custom') return;
    // 手机：提示（换标签的撤销）放在底部面板上方，不盖住面板（同编辑器 --toast-b）
    // 规范包面板叠在生成面板上、比它高：取最高的那个
    const hs = window.innerWidth < 600 ? [...document.querySelectorAll('.ct-sheet.is-spec, .ct-sheet.is-cmp')].map((n) => n.offsetHeight) : [];
    if (hs.length) document.documentElement.style.setProperty('--toast-b', Math.max.apply(null, hs) + 12 + 'px');
    // 手机顶栏：全称「AI 一键生成」把标题挤成省略号时换短的「生成」（en / vi、375 以下）
    const tb = mob() && document.querySelector('.ct-mtop .ct-mt b'), gl = tb && document.querySelector('.ct-mtop [data-ct-gl]');
    if (gl && tb.scrollWidth > tb.clientWidth + 1) gl.textContent = t('ct/gen-short');
  });

  // ======================================================================
  // 渲染后：工具条定位、页面高度、滚动跟随
  // ======================================================================
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'custom') return;
    const cv = document.querySelector('.ct-canvas');
    const page = cv && cv.querySelector('.wf-page');
    const hEl = document.querySelector('[data-ct-ph]');
    if (hEl && page) { const z = zoomVal(); hEl.textContent = num(Math.round(page.getBoundingClientRect().height / z)); }
    if (!cv) return;
    const cr = cv.getBoundingClientRect();
    const sel = C.sel && cv.querySelector(`.wf-m[data-bid="${C.sel}"]`);
    if (sel && C.scrollSel) {
      const r = sel.getBoundingClientRect();
      if (C.scrollSel === 'top') cv.scrollTop += r.top - cr.top - 56;
      else if (r.top < cr.top + 56 || r.bottom > cr.bottom - 20) cv.scrollTop += r.top - cr.top - Math.max(64, (cr.height - Math.min(r.height, cr.height * 0.6)) / 3);
    }
    if (C.scrollSel === 'list') { const row = document.querySelector('.ct-left .ct-row.is-on'); if (row && row.scrollIntoViewIfNeeded) row.scrollIntoViewIfNeeded(); }
    C.scrollSel = null;
    const tool = cv.querySelector('[data-ct-tool]');
    if (tool && sel) {
      const r = sel.getBoundingClientRect(), pr = page.getBoundingClientRect();
      const th = tool.offsetHeight, tw = tool.offsetWidth;
      let top = r.top - cr.top + cv.scrollTop - th - 8;
      if (r.top - cr.top - th - 8 < 4) top = Math.max(r.top - cr.top + cv.scrollTop + 8, cv.scrollTop + 8);
      let left = pr.left - cr.left + cv.scrollLeft + (pr.width - tw) / 2;
      left = Math.max(cv.scrollLeft + 8, Math.min(cv.scrollLeft + cv.clientWidth - tw - 8, left));
      tool.style.top = top + 'px'; tool.style.left = left + 'px'; tool.style.visibility = 'visible';
    }
    if (C.stage === 'gen') { // 生成中跟随正在上色的模块
      const cur = cv.querySelector('.wf-m.is-cur');
      if (cur) { const r = cur.getBoundingClientRect(); const want = cv.scrollTop + r.top - cr.top - cr.height * 0.35; if (Math.abs(want - cv.scrollTop) > 4) cv.scrollTop = want; }
    }
  });
  // 起始线框卡：电脑 6 张一行，缩略图按卡宽缩放（1440 时 176 宽 = Figma D1）；刚打开时把选中卡滚进可视范围（手机横滑，Figma M1）
  window.AFTER_RENDER.push(() => {
    if (S.route !== 'custom' || !C.picker) return;
    document.querySelectorAll('.ct-pcards:not(.is-m) .ct-pthumb > .wf-page').forEach((n) => { const w = n.parentNode.clientWidth; if (w) n.style.zoom = w / 750; });
    if (C.pickSeen) return;
    C.pickSeen = true;
    const box = document.querySelector('.ct-pcards.is-m'), on = box && box.querySelector('.ct-pcard.is-on');
    if (!on) return;
    const br = box.getBoundingClientRect(), r = on.getBoundingClientRect();
    if (r.right > br.right - 16) box.scrollLeft += r.right - br.right + 16; else if (r.left < br.left + 16) box.scrollLeft -= br.left + 16 - r.left;
  });
  window.addEventListener('resize', () => { if (S.route === 'custom' && (C.sel || C.picker)) window.render(); });

  // ======================================================================
  // 拖拽：左栏内容区块排序 / 新增模块拖入画布（pointer 事件，鼠标整行可拖，触屏用把手）
  // ======================================================================
  let drag = null;
  function canvasTarget(x, y) {
    const cv = document.querySelector('.ct-canvas'); if (!cv) return null;
    const cr = cv.getBoundingClientRect();
    if (x < cr.left || x > cr.right || y < cr.top || y > cr.bottom) return null;
    const els = Array.from(cv.querySelectorAll('.wf-m.wf-c'));
    const L = C.doc.blocks;
    if (!els.length) { const e = cv.querySelector('.wf-empty') || cv.querySelector('.wf-body'); const r = e.getBoundingClientRect(); return { idx: L.length, y: r.top + 4, x: r.left, w: r.width, after: null }; }
    let k = els.findIndex((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 > y; });
    if (k < 0) { const e = els[els.length - 1], r = e.getBoundingClientRect(); const b = findB(e.dataset.bid); return { idx: L.indexOf(b) + 1, y: r.bottom + 2, x: r.left, w: r.width, after: b }; }
    const e = els[k], r = e.getBoundingClientRect(), b = findB(e.dataset.bid);
    const prev = k > 0 ? findB(els[k - 1].dataset.bid) : null;
    return { idx: L.indexOf(b), y: r.top - 2, x: r.left, w: r.width, after: prev };
  }
  function rowTarget(y) {
    const rows = Array.from(document.querySelectorAll('[data-ct-row]'));
    if (!rows.length) return null;
    let k = rows.findIndex((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 > y; });
    if (k < 0) k = rows.length;
    const ref = rows[Math.min(k, rows.length - 1)].getBoundingClientRect();
    return { idx: k, y: k < rows.length ? ref.top : ref.bottom, x: ref.left, w: ref.width };
  }
  document.addEventListener('pointerdown', (e) => {
    if (S.route !== 'custom' || C.stage !== 'edit' || e.button !== 0) return;
    const lib = e.target.closest('[data-ct-lib]');
    const row = e.target.closest('[data-ct-row]');
    if (!lib && !row) return;
    if (e.target.closest('.ct-eye')) return;
    const touch = e.pointerType !== 'mouse';
    if (row && touch && !e.target.closest('[data-ct-h]')) return;
    if (lib && touch) return; // 触屏：点一下加到画布
    if (row && touch) e.preventDefault();
    drag = { kind: lib ? 'lib' : 'row', m: lib && lib.dataset.ctLib, from: row ? +row.dataset.ctRow : -1, x0: e.clientX, y0: e.clientY, on: false, el: lib || row };
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.on) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
      drag.on = true;
      const g = document.createElement('div'); g.className = 'ct-ghost';
      const m = drag.kind === 'lib' ? drag.m : C.doc.blocks[drag.from].m;
      g.innerHTML = `${ic(MODS[m].ic, 'ic-16')}<span>${esc(modName(m))}</span>${ic('dots-six-vertical', 'ic-16')}`;
      document.body.appendChild(g); drag.ghost = g; document.body.classList.add('ct-dragging');
      drag.el.classList.add('is-drag');
    }
    e.preventDefault();
    drag.ghost.style.left = e.clientX + 12 + 'px'; drag.ghost.style.top = e.clientY - 18 + 'px';
    const line = document.querySelector('.ct-drop');
    if (drag.kind === 'lib') {
      const tg = canvasTarget(e.clientX, e.clientY); drag.tg = tg;
      if (!line) return;
      if (!tg) { line.hidden = true; return; }
      const cv = document.querySelector('.ct-canvas'), cr = cv.getBoundingClientRect();
      line.hidden = false;
      line.style.top = tg.y - cr.top + cv.scrollTop + 'px'; line.style.left = tg.x - cr.left + cv.scrollLeft + 'px'; line.style.width = tg.w + 'px';
      line.querySelector('span').textContent = tg.after ? t('ct/drop-after', { m: modName(tg.after.m) + ' ' + tag(tg.after) }) : t('ct/drop-top');
    } else {
      const tg = rowTarget(e.clientY); drag.tg = tg;
      let rl = document.querySelector('.ct-rowline');
      if (!rl) { rl = document.createElement('div'); rl.className = 'ct-rowline'; document.body.appendChild(rl); }
      if (!tg) { rl.hidden = true; return; }
      rl.hidden = false; rl.style.top = tg.y - 1 + 'px'; rl.style.left = tg.x + 'px'; rl.style.width = tg.w + 'px';
    }
  }, { passive: false });
  function endDrag(e) {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.on) return;
    d.ghost.remove(); document.body.classList.remove('ct-dragging'); d.el.classList.remove('is-drag');
    const rl = document.querySelector('.ct-rowline'); if (rl) rl.remove();
    const line = document.querySelector('.ct-drop'); if (line) line.hidden = true;
    C.__drag = true; setTimeout(() => { C.__drag = false; }, 0);
    if (e.type === 'pointercancel' || !d.tg) { window.render(); return; }
    if (d.kind === 'lib') insertAt(d.m, d.tg.idx);
    else {
      const L = C.doc.blocks; let to = d.tg.idx; const from = d.from;
      if (to > from) to--;
      if (to !== from) { const b = L[from]; commit(() => { L.splice(from, 1); L.splice(to, 0, b); }); C.sel = b.id; C.scrollSel = 'canvas'; }
    }
    window.render();
  }
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
})();
