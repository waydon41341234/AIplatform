/* 编辑器：彩金池、中部导航、游戏菜单、游戏卡片、页脚、侧边栏、底部导航的「内容 / 布局 / 颜色」面板与画布渲染。
 * 必须在 editor.js 之前加载（编辑器初始数据用 MP.defaults()）；运行时通过 window.EDX 取编辑器内部状态。
 * 元素颜色清单与默认 Key 对应 shared/catalog/home.ts 的 MODULE_ELEMENTS；布局选项对应 LAYOUTS（尺寸按 750 稿）。
 * 第五轮：游戏菜单 13 类型（ED-21）、入口改名与侧边栏 / 游戏菜单换图标（ED-19）、AI 生成一套图标（ED-04）、批量上传（ED-05）、全部 68 个颜色用途（ED-02）。 */
(function () {
  const A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const X = () => window.EDX;
  const S = () => window.S;

  // ---------- 默认数据 ----------
  const MID = [['体育', null], ['真人', null], ['电子', 'game-controller'], ['彩票', 'squares-four-fill'], ['棋牌', 'stack-fill'], ['捕鱼', 'sparkle-fill'], ['电竞', 'toolbox-fill'], ['优惠', 'heart-fill'], ['VIP', 'user-circle'], ['客服', 'bell-fill']];
  // 游戏菜单 = 游戏类型菜单，13 个类型（名称按当前语言取 mp/gm-n-*，改名后存原文）
  const GM = ['sparkle-fill', 'stack-fill', 'fish-fill', 'game-controller-fill', 'cube-fill', 'user-circle-fill', 'trophy-fill', 'ticket-fill', 'headset-fill', 'bird-fill', 'clock-counter-clockwise', 'heart-fill', 'play-circle-fill'];
  const GAMES = [['星河足球', '热门'], ['百家乐', '新'], ['幸运老虎机', null, true], ['极速赛车'], ['德州扑克'], ['捕鱼达人']];
  const BN = [['首页', 'house-fill', true], ['优惠', 'sparkle-fill'], ['消息', 'bell-fill'], ['充值', 'credit-card'], ['我的', 'user-circle', true]];
  const SIDE = [['首页', 'house-fill'], ['优惠活动', 'gift-fill'], ['VIP 特权', 'crown-fill'], ['在线客服', 'headset-fill'], ['个人中心', 'user-circle']];
  const FOOT = ['关于我们', '帮助中心', '隐私政策'];
  const items = (arr) => arr.map((x) => ({ n: x[0], i: x[1] || null, req: !!x[2], on: true }));
  const defaults = () => {
    const bn = items(BN); bn[0].onBuiltin = true; // 首页选中态图标内置
    return {
      jackpot: { title: '彩金池', anim: 'roll', layout: 'flow', margin: 16, corner: 16, bg: null, bgOn: true },
      midnav: { mode: 'conf', items: items(MID), layout: 'row', per: 5, size: 96 },
      gamemenu: { items: GM.map((i, k) => ({ n: '', k: 'mp/gm-n-' + (k + 1), i, req: false, on: true })), style: 'tabs', shape: 'pill' },
      gamecards: { name: true, tag: true, fallback: null, cols: 3, corner: 16, gap: 16 },
      footer: { items: items(FOOT.map((n) => [n])), copy: '© 2026 星河体育 版权所有', align: 'center' },
      sidebar: { items: items(SIDE), style: 'list', width: 62, head: null, headOn: true },
      bottomnav: { mode: 'fixed', items: bn, style: 'regular', h: 110 },
    };
  };
  const nm = (it) => it.n || (it.k ? t(it.k) : '');
  // 入口图标规格（逻辑尺寸，PNG 交付 @2x）
  const ICON_SPEC = { midnav: [80, 70], bottomnav: [70, 70], gamemenu: [100, 76], sidebar: [60, 60] };

  // 元素颜色：[元素 ID, 默认取的基础色 Key]
  const EL = {
    jackpot: [['jackpot.bg', 'primary'], ['jackpot.title', 'bg_2'], ['jackpot.amount', 'bg_2']],
    midnav: [['midnav.bg', 'bg_2'], ['midnav.text', 'lead'], ['midnav.icon', 'primary']],
    gamemenu: [['gamemenu.bg', 'bg_2'], ['gamemenu.text', 'neutral_1'], ['gamemenu.active', 'primary'], ['gamemenu.activeText', 'bg_2']],
    gamecards: [['gamecards.placeholder', 'border'], ['gamecards.placeholderIcon', 'neutral_3'], ['gamecards.text', 'lead'], ['gamecards.label', 'accent_3'], ['gamecards.labelText', 'bg_2']],
    footer: [['footer.bg', 'bg_1'], ['footer.text', 'neutral_2'], ['footer.link', 'neutral_1']],
    sidebar: [['sidebar.bg', 'bg_2'], ['sidebar.item', 'bg_1'], ['sidebar.itemActive', 'primary'], ['sidebar.text', 'lead'], ['sidebar.textActive', 'bg_2']],
    bottomnav: [['bottomnav.bg', 'bg_2'], ['bottomnav.def', 'neutral_2'], ['bottomnav.active', 'primary']],
  };
  const ALT = ['primary', 'lead', 'bg_2', 'accent_3', 'bg_1', 'neutral_2', 'accent_1'];
  const cssVar = (id) => '--e-' + id.replace('.', '-');
  function vars(th, ec) {
    let s = '';
    for (const b in EL) for (const [id, k] of EL[b]) s += `;${cssVar(id)}:${ec[id] || th[k]}`;
    return s;
  }
  const M = (b) => X().E.D.m[b];
  const set = (b, k, v) => { const x = X(); x.commit(() => { x.E.D.m[b][k] = v; }); };

  // ---------- 面板零件 ----------
  const seg = (opts, cur, act) => X().segBtns(opts, String(cur), act);
  const sec = (lab, body, v) => `<div class="p-sec"><div class="lab">${lab}${v != null ? `<span class="v">${v}</span>` : ''}</div>${body}</div>`;
  const note = (k, p) => `<div class="p-note">${t(k, p)}</div>`;
  const px = (b, k, vals, labels) => sec(labels.title, seg(vals.map((v, i) => ({ v: String(v), label: labels.opts ? labels.opts[i] : v + (labels.unit || ' px') })), M(b)[k], `mpSet_${b}_${k}`), M(b)[k] + (labels.unit || ' px'));
  const toggle = (on, act, arg, label) => `<button class="tg-row" data-act="${act}" data-arg="${arg}"><span>${label}</span><span class="switch ${on ? 'is-on' : ''}"><i></i></span></button>`;
  function list(b, render) {
    const R = X().E.rn;
    return `<div class="mp-list" data-drag-list="${b}">${M(b).items.map((it, i) => `<div class="lrow ${it.on ? '' : 'is-hidden'} ${R && R.b === b && R.i === i ? 'is-editing' : ''}" data-row="${i}"><span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span>${render ? render(it, i) : nameCell(b, i)}${it.req && M(b).mode === 'fixed' ? `<span class="req">${t('mp/required')}</span><span class="eye is-off">${ic('lock-fill', 'ic-16')}</span>` : `<button class="eye" data-act="mpItem" data-arg="${b}|${i}">${ic(it.on ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`}</div>`).join('')}</div><div class="p-note">${t('mp/drag-hint')}</div>`;
  }
  // 入口名：点铅笔或双击名称改名（ED-19）
  function nameCell(b, i) {
    const it = M(b).items[i]; const R = X().E.rn;
    if (R && R.b === b && R.i === i) return `<span class="rn-wrap"><input class="input rn-in ${R.err ? 'is-err' : ''}" data-input="rnIn" data-key="rnKey" value="${esc(R.v)}" data-autofocus aria-label="${esc(t('mp/rename'))}">${R.err ? `<span class="rn-err">${t('mp/name-max')}</span>` : ''}</span>`;
    return `<span class="nm" data-rn="${b}|${i}" title="${esc(nm(it))}">${esc(nm(it))}</span><button class="ib-s rn-btn" data-act="rnStart" data-arg="${b}|${i}" title="${esc(t('mp/rename'))}">${ic('pencil-simple', 'ic-16')}</button>`;
  }
  function asset(b, field, name, spec, thumb) {
    const slot = `mp-${b}-${field}`; const on = M(b)[field + 'On'] !== false;
    return `<div class="asset ${on ? '' : 'is-off'}"><div class="top">${thumb}<span style="min-width:0"><div class="nm">${name}</div><div class="sp">${spec}</div></span>${X().moreBtn(slot)}</div>
      <div class="acts"><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="${slot}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="openLib" data-arg="${slot}">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div>${X().uploadUI(slot)}`;
  }
  const modeSeg = (b) => sec(t('mp/nav-mode'), seg([{ v: 'conf', label: t('mp/mode-conf') }, { v: 'fixed', label: t('mp/mode-fixed') }], M(b).mode, `mpSet_${b}_mode`) + `<div class="p-note">${t(M(b).mode === 'conf' ? 'mp/mode-conf-help' : 'mp/mode-fixed-help')}</div>`);
  const iconBtns = (b) => `<div class="r2" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-act="iaOpen" data-arg="${b}">${ic('magic-wand', 'ic-16')}${t('mp/ai-icons')}</button><button class="btn btn-secondary btn-sm" data-act="bxOpen" data-arg="${b}">${ic('upload-simple', 'ic-16')}${t('mp/upload-icons')}</button></div>`;
  // 入口图标可上传替换（缩略图右下角上传角标；画布上点图标也能替换）
  const img = (src) => `<img class="cu" src="${src}" alt="">`;
  const upThumb = (b, i, f, icon, cls = '', title = '') => { const src = M(b).items[i][f]; return `<button class="thumb sq up ${cls} ${src ? 'is-cu' : ''}" data-act="mpIcon" data-arg="${b}|${i}|${f}" title="${esc((title ? title + ' · ' : '') + t('mp/icon-replace'))}">${src ? img(src) : ic(icon)}<span class="ub">${ic('upload-simple')}</span></button>`; };
  const resetBtn = (b, i) => { const it = M(b).items[i]; return it.img || it.imgOn ? `<button class="ib-s" data-act="mpIconReset" data-arg="${b}|${i}" title="${esc(t('mp/icon-reset'))}">${ic('arrow-counter-clockwise', 'ic-16')}</button>` : ''; };

  function colors(b) {
    const x = X(); const { th, ec } = x.liveTheme(); const P = x.E.picker;
    return EL[b].map(([id, k]) => {
      const cur = (ec[id] || th[k]).toLowerCase();
      const sw = [th[k], ...ALT.filter((a) => a !== k).map((a) => th[a])].map((c) => c.toLowerCase()).filter((c, i, a) => a.indexOf(c) === i).slice(0, 4);
      return `<div class="crow"><div class="k">${t('mp/c-' + id.replace('.', '-'))}${ec[id] ? '' : ` · <span class="faint">${t('mp/c-default')}</span>`}</div><div class="sws">${sw.map((c) => `<button class="sw-btn ${cur === c ? 'is-on' : ''}" style="background:${c}" data-act="mpColor" data-arg="${id}|${c}"></button>`).join('')}<button class="rainbow ${P && P.elRow === id ? 'is-on' : ''}" data-act="mpPick" data-arg="${id}|${k}"></button></div>${P && P.elRow === id ? x.pickerHtml('in-panel', t('mp/c-' + id.replace('.', '-'))) : ''}</div>`;
    }).join('') + note('mp/c-note');
  }

  // ---------- 各模块面板 ----------
  const P = {
    jackpot: {
      content: () => sec(t('mp/jp-title'), `<input class="input" data-input="mpJpTitle" value="${esc(M('jackpot').title)}" maxlength="12">`)
        + sec(t('mp/jp-amount'), seg([{ v: 'roll', label: t('mp/jp-roll') }, { v: 'static', label: t('mp/jp-static') }], M('jackpot').anim, 'mpSet_jackpot_anim'))
        + sec(t('mp/jp-bg'), asset('jackpot', 'bg', t('mp/jp-bg'), t('mp/jp-bg-spec'), `<span class="thumb" style="background:${M('jackpot').bg ? 'linear-gradient(135deg,#f6c445,#c9963b)' : 'var(--e-jackpot-bg, #1678ff)'};filter:${M('jackpot').bg || 'none'}"></span>`)),
      layout: () => sec(t('mp/style'), seg([{ v: 'flow', label: t('mp/lay-flow') }, { v: 'compact', label: t('mp/lay-compact') }], M('jackpot').layout, 'mpSet_jackpot_layout'))
        + px('jackpot', 'margin', [8, 16, 24], { title: t('ed/margin') }) + px('jackpot', 'corner', [0, 16, 32], { title: t('ed/corner') }) + note('ed/unit-750'),
    },
    midnav: {
      content: () => modeSeg('midnav') + sec(t('mp/entries'), list('midnav', (it, i) => `${upThumb('midnav', i, 'img', it.i || 'plus')}${nameCell('midnav', i)}${resetBtn('midnav', i)}`) + note('mp/icon-hint') + iconBtns('midnav')),
      layout: () => sec(t('mp/style'), seg([{ v: 'row', label: t('mp/mid-row') }, { v: 'account', label: t('mp/mid-account') }], M('midnav').layout, 'mpSet_midnav_layout'))
        + px('midnav', 'per', [4, 5], { title: t('mp/per-row'), unit: '' }) + px('midnav', 'size', [80, 96, 112], { title: t('mp/icon-size') }) + note('ed/unit-750'),
    },
    gamemenu: {
      content: () => sec(t('mp/gm-cats'), list('gamemenu', (it, i) => `${upThumb('gamemenu', i, 'img', it.i, 'st2', t('mp/state-def'))}${upThumb('gamemenu', i, 'imgOn', it.i, 'st2 on', t('mp/state-act'))}${nameCell('gamemenu', i)}${resetBtn('gamemenu', i)}`)
        + `<div class="p-note">${ic('frame-corners', 'ic-16')}${t('mp/gm-icon-spec')}</div>` + note('mp/gm-scroll') + note('mp/gm-first') + iconBtns('gamemenu')),
      layout: () => sec(t('mp/style'), seg([{ v: 'tabs', label: t('mp/gm-tabs') }, { v: 'icons', label: t('mp/gm-icons') }], M('gamemenu').style, 'mpSet_gamemenu_style'))
        + sec(t('mp/gm-shape'), seg([{ v: 'pill', label: t('mp/shape-pill') }, { v: 'square', label: t('mp/shape-square') }], M('gamemenu').shape, 'mpSet_gamemenu_shape')) + note('mp/gm-scroll'),
    },
    gamecards: {
      content: () => sec(t('mp/gc-show'), toggle(M('gamecards').name, 'mpFlag', 'gamecards|name', t('mp/gc-name')) + toggle(M('gamecards').tag, 'mpFlag', 'gamecards|tag', t('mp/gc-tag')))
        + sec(t('mp/gc-fallback'), asset('gamecards', 'fallback', t('mp/gc-fallback'), t('mp/gc-fallback-spec'), `<span class="thumb fb" style="filter:${M('gamecards').fallback || 'none'}">${ic('image-fill')}</span>`)),
      layout: () => sec(t('mp/cols'), seg([2, 3, 4].map((n) => ({ v: String(n), label: t('mp/cols-n', { n }) })), M('gamecards').cols, 'mpSet_gamecards_cols'))
        + px('gamecards', 'corner', [0, 16, 32], { title: t('ed/corner') }) + px('gamecards', 'gap', [16, 24, 32], { title: t('mp/gap') }) + note('ed/unit-750'),
    },
    footer: {
      content: () => sec(t('mp/ft-links'), list('footer')) + sec(t('mp/ft-copy'), `<input class="input" data-input="mpFtCopy" value="${esc(M('footer').copy)}" maxlength="40">`),
      layout: () => sec(t('mp/align'), seg([{ v: 'center', label: t('mp/align-center') }, { v: 'left', label: t('mp/align-left') }], M('footer').align, 'mpSet_footer_align')) + note('mp/ft-one'),
    },
    sidebar: {
      content: () => {
        const D = X().E.D;
        return sec(t('ed/side-pos'), seg([{ v: 'left', label: t('ed/side-left') }, { v: 'right', label: t('ed/side-right') }], D.side, 'setSide'))
          + sec(t('mp/sd-head'), asset('sidebar', 'head', t('mp/sd-head'), t('mp/sd-head-spec'), `<span class="thumb" style="filter:${M('sidebar').head || 'none'}"></span>`))
          + sec(t('mp/entries'), list('sidebar', (it, i) => `${upThumb('sidebar', i, 'img', it.i)}${nameCell('sidebar', i)}${resetBtn('sidebar', i)}`) + `<div class="p-note">${ic('frame-corners', 'ic-16')}${t('mp/sd-icon-spec')}</div>`);
      },
      layout: () => sec(t('mp/style'), seg([{ v: 'list', label: t('mp/sd-list') }, { v: 'grid', label: t('mp/sd-grid') }], M('sidebar').style, 'mpSet_sidebar_style'))
        + px('sidebar', 'width', [62, 75], { title: t('mp/width'), unit: '%' }),
    },
    bottomnav: {
      content: () => modeSeg('bottomnav') + sec(t('mp/entries'), list('bottomnav', (it, i) => `${upThumb('bottomnav', i, 'img', it.i, 'st2', t('mp/state-def'))}${upThumb('bottomnav', i, 'imgOn', it.i, 'st2 on', t('mp/state-act'))}${nameCell('bottomnav', i)}${resetBtn('bottomnav', i)}`) + `<div class="p-note">${t('mp/bn-icons-note')}</div>` + note('mp/icon-hint') + iconBtns('bottomnav')),
      layout: () => sec(t('mp/style'), seg([{ v: 'regular', label: t('mp/bn-regular') }, { v: 'raised', label: t('mp/bn-raised') }], M('bottomnav').style, 'mpSet_bottomnav_style'))
        + px('bottomnav', 'h', [98, 110, 120], { title: t('mp/height') }) + note('ed/unit-750'),
    },
  };
  function panel(b, tab) { if (tab === 'color') return colors(b); return (P[b][tab] || P[b].content)(); }

  // ---------- 画布 ----------
  const vis = (b) => M(b).items.filter((x) => x.on);
  function h5(b, id) {
    const m = M(b);
    if (b === 'jackpot') {
      const amt = `<b class="${m.anim === 'roll' ? 'roll' : ''}">¥ 88,888,888.88</b>`;
      const bg = m.bg && m.bgOn ? `background-image:linear-gradient(135deg,#f6c445,#c9963b);filter:${m.bg}` : '';
      return `<div class="h5-jack ${m.layout}" style="margin:${m.margin / 2}px 12px;border-radius:${m.corner / 2}px;${bg}"><span class="tt">${esc(m.title)}</span>${amt}</div>`;
    }
    if (b === 'midnav') {
      const sz = m.size / 2.4;
      const acct = m.layout === 'account' ? `<div class="acct"><span>¥ 1,280.00</span><span class="sp"></span><span class="a">充值</span><span class="a">提现</span></div>` : '';
      return `<div class="h5-mid-wrap">${acct}<div class="h5-mid" style="grid-template-columns:repeat(${m.per},1fr)">${vis('midnav').map((it) => { const i = m.items.indexOf(it); return `<div class="it"><span class="ib ${it.img ? 'cu' : it.i ? '' : 'ph'} ${S().menu === 'icon:midnav|' + i ? 'is-focus' : ''}" style="width:${sz + 8}px;height:${sz}px" data-act="mpIconMenu" data-arg="${id || 'midnav'}|midnav|${i}" data-stop>${it.img ? img(it.img) : ic(it.i || 'plus')}</span>${esc(nm(it))}${S().menu === 'icon:midnav|' + i ? iconMenu('midnav', i, 'img') : ''}</div>`; }).join('')}</div></div>`;
    }
    if (b === 'gamemenu') {
      // 13 个入口放不下时横向滚动，右侧渐隐提示可滑
      const v = vis('gamemenu');
      return `<div class="h5-gm-wrap"><div class="h5-gm ${m.style} ${m.shape}" data-sk="gm-${id || b}">${v.map((it, k) => { const i = m.items.indexOf(it), f = k ? 'img' : 'imgOn', on = S().menu === 'icon:gamemenu|' + i; const icon = m.style === 'icons' ? `<span class="gi ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="${id || 'gamemenu'}|gamemenu|${i}|${f}" data-stop>${it[f] || (k === 0 && it.img) ? img(it[f] || it.img) : ic(it.i)}</span>` : ''; return `<span class="${k ? '' : 'on'}">${icon}${esc(nm(it))}${on ? iconMenu('gamemenu', i, f) : ''}</span>`; }).join('')}</div></div>`;
    }
    if (b === 'gamecards') {
      return `<div class="h5-gc" style="grid-template-columns:repeat(${m.cols},1fr);gap:${m.gap / 2}px">${GAMES.map(([n, tg, fb]) => `<div class="c"><div class="im ${fb ? 'fb' : ''}" style="border-radius:${m.corner / 2}px;${fb && m.fallback ? `filter:${m.fallback}` : ''}">${fb ? ic('image-fill') : ''}${tg && m.tag ? `<span class="tg">${tg}</span>` : ''}</div>${m.name ? esc(n) : ''}</div>`).join('')}</div>`;
    }
    if (b === 'footer') return `<div class="h5-foot" style="text-align:${m.align}"><div class="ln">${vis('footer').map((x) => esc(nm(x))).join(' · ')}</div><div>${esc(m.copy)}</div></div>`;
    return '';
  }
  function bnav() {
    const m = M('bottomnav'); const v = vis('bottomnav'); const mid = Math.floor(v.length / 2);
    return v.map((it, k) => { const i = m.items.indexOf(it), f = k ? 'img' : 'imgOn', on = S().menu === 'icon:bottomnav|' + i; return `<span class="it ${k ? '' : 'on'} ${m.style === 'raised' && k === mid ? 'raised' : ''}"><span class="bi ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="bottomnav|bottomnav|${i}|${f}" data-stop>${it[f] ? img(it[f]) : ic(it.i)}</span>${esc(nm(it))}${on ? iconMenu('bottomnav', i, f) : ''}</span>`; }).join('');
  }
  const bnavCls = () => `h-${M('bottomnav').h}`;
  function side() {
    const m = M('sidebar');
    const head = m.head && m.headOn ? `<div class="hd" style="filter:${m.head}"></div>` : '';
    return `<div class="pn ${m.style}" style="width:${m.width}%" data-act="selMod" data-arg="sidebar" data-stop>${head}${vis('sidebar').map((it, k) => { const i = m.items.indexOf(it), on = S().menu === 'icon:sidebar|' + i; return `<div class="${k ? '' : 'on'}"><span class="si ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="sidebar|sidebar|${i}" data-stop>${it.img ? img(it.img) : ic(it.i)}</span>${esc(nm(it))}${on ? iconMenu('sidebar', i, 'img') : ''}</div>`; }).join('')}</div>`;
  }

  // ---------- 动作 ----------
  for (const [b, keys] of Object.entries({ jackpot: ['anim', 'layout', 'margin', 'corner'], midnav: ['mode', 'layout', 'per', 'size'], gamemenu: ['style', 'shape'], gamecards: ['cols', 'corner', 'gap'], footer: ['align'], sidebar: ['style', 'width'], bottomnav: ['mode', 'style', 'h'] })) {
    for (const k of keys) A[`mpSet_${b}_${k}`] = (v) => { const cur = M(b)[k]; set(b, k, typeof cur === 'number' ? +v : v); };
  }
  A.mpItem = (arg) => { const [b, i] = arg.split('|'); const x = X(); x.commit(() => { const it = x.E.D.m[b].items[+i]; it.on = !it.on; }); };
  A.mpFlag = (arg) => { const [b, k] = arg.split('|'); set(b, k, !M(b)[k]); };
  A.mpColor = (arg) => { const [id, c] = arg.split('|'); const x = X(); x.commit(() => { x.E.D.ec[id] = c; }); x.E.picker = null; };
  A.mpPick = (arg) => {
    const [id, k] = arg.split('|'); const x = X(); const { th, ec } = x.liveTheme();
    if (x.E.picker && x.E.picker.elRow === id) { x.E.picker = null; return; }
    const cur = ec[id] || th[k]; x.E.picker = { key: k, elRow: id, orig: cur, value: cur, where: 'el' };
  };
  let typing = null;
  const typeText = (b, k) => (v) => { const x = X(); if (typing !== b + k) { x.commit(() => {}); typing = b + k; } x.E.D.m[b][k] = v; x.save(); return true; };
  I.mpJpTitle = typeText('jackpot', 'title');
  I.mpFtCopy = typeText('footer', 'copy');
  document.addEventListener('click', () => { typing = null; }, true);

  // ---------- 改名（ED-19）：上限中文 6 字 / 12 个字符 ----------
  const wlen = (s) => [...s].reduce((a, c) => a + (/[\u0000-ɏ]/.test(c) ? 1 : 2), 0);
  A.rnStart = (arg) => { const [b, i] = arg.split('|'); const it = M(b).items[+i]; X().E.rn = { b, i: +i, v: nm(it), err: false }; S().menu = null; };
  I.rnIn = (v) => { const R = X().E.rn; if (!R) return; R.v = v; const err = wlen(v.trim()) > 12; if (err !== R.err) { R.err = err; return true; } };
  function rnSave() {
    const x = X(); const R = x.E.rn; if (!R) return;
    const v = R.v.trim();
    if (R.err) return; // 超长阻止保存
    const it = x.E.D.m[R.b].items[R.i];
    x.E.rn = null;
    if (!v || v === nm(it)) return;
    x.commit(() => { x.E.D.m[R.b].items[R.i].n = v; });
    window.toast(t('toast/renamed'), x.undoOpt());
  }
  A.rnKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); rnSave(); return true; }
    if (e.key === 'Escape') { X().E.rn = null; e.stopPropagation(); return true; }
  };
  // 失焦保存（重渲染时焦点会被还原，所以延后判断）
  document.addEventListener('focusout', (e) => {
    if (!e.target.matches || !e.target.matches('[data-input="rnIn"]')) return;
    setTimeout(() => { const ae = document.activeElement; if (X().E.rn && !(ae && ae.dataset && ae.dataset.input === 'rnIn')) { rnSave(); if (X().E.rn) X().E.rn = null; window.render(); } }, 0);
  });
  document.addEventListener('dblclick', (e) => { const n = e.target.closest('[data-rn]'); if (!n) return; A.rnStart(n.dataset.rn); window.render(); });

  // ---------- 图标上传替换 ----------
  function iconMenu(b, i, f) {
    const has = !!M(b).items[i][f];
    const [w, h] = ICON_SPEC[b] || [96, 96];
    return `<div class="menu icon-menu" data-stop><button class="menu-item" data-act="mpIcon" data-arg="${b}|${i}|${f}" data-stop>${ic('upload-simple')}<span class="tx"><span>${t('mp/icon-replace')}</span><span class="sub">${t('mp/icon-spec')} · ${w}×${h}</span></span></button><button class="menu-item" data-act="mpIconReset" data-arg="${b}|${i}|${f}" data-stop ${has ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('mp/icon-reset')}</button></div>`;
  }
  let fileIn = null, target = null;
  function pickIcon(b, i, f) {
    target = { b, i: +i, f };
    if (!fileIn) {
      fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/png,image/svg+xml,image/webp,image/jpeg'; fileIn.style.display = 'none'; fileIn.setAttribute('data-icon-file', '');
      document.body.appendChild(fileIn);
      fileIn.addEventListener('change', () => {
        const file = fileIn.files[0]; fileIn.value = ''; if (!file || !target) return;
        if (!/^image\//.test(file.type)) { window.toast(t('mp/icon-bad'), { info: true }); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const { b: mb, i: mi, f: mf } = target; const x = X();
          x.commit(() => { x.E.D.m[mb].items[mi][mf] = rd.result; });
          if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
          window.toast(t('mp/icon-replaced', { n: nm(x.E.D.m[mb].items[mi]) }), x.undoOpt(4000));
          window.render();
        };
        rd.readAsDataURL(file);
      });
    }
    fileIn.click();
  }
  A.mpIcon = (arg) => { const [b, i, f] = arg.split('|'); S().menu = null; pickIcon(b, i, f || 'img'); window.render(); return false; };
  A.mpIconReset = (arg) => {
    const [b, i, f] = arg.split('|'); const x = X(); const it = x.E.D.m[b].items[+i];
    if (f ? !it[f] : !(it.img || it.imgOn)) return false;
    x.commit(() => { const it2 = x.E.D.m[b].items[+i]; if (f) delete it2[f]; else { delete it2.img; delete it2.imgOn; } });
    S().menu = null; if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
    window.toast(t('mp/icon-reset-toast'), x.undoOpt(4000));
  };
  A.mpIconMenu = (arg) => {
    const [id, b, i, f] = arg.split('|'); const x = X(); const E = x.E;
    if (E.sel !== id) { E.tab = 'content'; E.ai = null; E.picker = null; E.iconAi = null; }
    E.sel = id; E.h5side = b === 'sidebar'; if (E.tab !== 'content') E.tab = 'content';
    if (x.mobileEd()) { E.iconMenu = { b, i: +i, f: f || 'img' }; E.mpanel = 'iconmenu'; S().menu = null; }
    else S().menu = S().menu === 'icon:' + b + '|' + i ? null : 'icon:' + b + '|' + i;
  };
  function iconSheet() {
    const m = X().E.iconMenu; if (!m) return '';
    const it = M(m.b).items[m.i];
    return `<div class="icon-sheet-hd">${it[m.f] ? img(it[m.f]) : ic(it.i || 'plus')}<b>${esc(nm(it))}</b></div>${iconMenu(m.b, m.i, m.f).replace('menu icon-menu', 'icon-sheet-list')}`;
  }
  // 画布里的图标菜单：fixed 定位到图标正下方（放不下就往上）
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('body > .icon-menu').forEach((n) => n.remove());
    const m = document.querySelector('#app .icon-menu'); if (!m) return;
    const f = m.parentElement.querySelector('.is-focus'); if (!f) return;
    // 画布有缩放（transform），fixed 会相对画布定位，所以把菜单移到 body 下
    const r = f.getBoundingClientRect();
    document.body.appendChild(m);
    m.style.position = 'fixed'; m.style.left = Math.max(8, Math.min(r.left - 4, window.innerWidth - 248)) + 'px';
    const h = m.offsetHeight; m.style.top = (r.bottom + 6 + h > window.innerHeight - 8 ? r.top - 6 - h : r.bottom + 6) + 'px';
  });

  // ---------- AI 生成一套图标（ED-04） ----------
  const STYLES = ['glass', 'flat', '3d', 'line'];
  function lighten(hex, k) { const n = parseInt(hex.slice(1, 7), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k)); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); }
  // 模拟 AI 结果：按款式把 Phosphor 图标画成 SVG dataURL
  function aiSvg(icon, style, color) {
    const PH = window.PH; const reg = icon.replace(/-fill$/, '');
    const path = style === 'line' && PH[reg] ? PH[reg] : PH[icon] || PH['sparkle-fill'];
    let bg = '', fg = '#fff';
    if (style === 'glass') bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".95"/><stop offset="1" stop-color="${color}" stop-opacity=".45"/></linearGradient></defs><rect x="4" y="4" width="88" height="88" rx="24" fill="url(#g)"/><rect x="4.5" y="4.5" width="87" height="87" rx="23.5" fill="none" stroke="#fff" stroke-opacity=".6"/><path d="M12 32Q48 8 84 32V14Q84 6 76 6H20Q12 6 12 14Z" fill="#fff" fill-opacity=".22"/>`;
    else if (style === 'flat') bg = `<rect x="4" y="4" width="88" height="88" rx="20" fill="${color}"/>`;
    else if (style === '3d') bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(color, 0.35)}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><rect x="6" y="10" width="84" height="82" rx="22" fill="#000" fill-opacity=".22"/><rect x="4" y="4" width="88" height="84" rx="22" fill="url(#g)"/>`;
    else fg = color;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${bg}<g transform="translate(24 22) scale(.1875)" fill="${fg}">${path}</g></svg>`);
  }
  const perEntry = (b) => (b === 'bottomnav' || b === 'gamemenu' ? ['img', 'imgOn'] : ['img']).slice(0, b === 'bottomnav' ? 2 : 1);
  const isReq = (b, it) => (b === 'midnav' ? M(b).mode === 'conf' || it.req : b === 'bottomnav' ? it.req : false);
  const jobs = (ia) => { const out = []; M(ia.b).items.forEach((it, i) => { if (ia.picks[i]) perEntry(ia.b).forEach((f) => out.push(i + '|' + f)); }); return out; };
  const modTitle = (b) => t({ midnav: 'mod/midnav', bottomnav: 'mod/bottomnav', gamemenu: 'mod/gamemenu' }[b]);
  function candColor(ia, f) { const th = X().E.D.theme; const pal = [th.primary, th.accent_3, th.accent_1, th.accent_2, '#7b4dff']; return f === 'img' && ia.b === 'bottomnav' ? th.neutral_2 : pal[ia.attempt % pal.length]; }
  function candSrc(ia, key) { const c = ia.cands[key]; if (!c) return ''; const [i] = key.split('|'); return aiSvg(M(ia.b).items[+i].i || 'sparkle-fill', c.style, c.color); }
  A.iaOpen = (b) => {
    const x = X(); const its = M(b).items;
    x.E.iconAi = { b, style: 'glass', extra: '', picks: its.map((it) => isReq(b, it) || b === 'gamemenu' || (b === 'midnav' && M(b).mode === 'conf')), stage: 'setup', pct: 0, cands: {}, failed: {}, busy: {}, done: 0, attempt: 0 };
    x.E.picker = null; S().menu = null; if (x.mobileEd()) x.E.mpanel = 'module';
  };
  const iaStop = () => { const ia = X().E.iconAi; if (ia && ia.timer) { clearInterval(ia.timer); clearTimeout(ia.timer); ia.timer = null; } };
  A.iaClose = () => { iaStop(); X().E.iconAi = null; };
  A.iaStyle = (s) => { X().E.iconAi.style = s; };
  I.iaExtra = (v) => { X().E.iconAi.extra = v; };
  A.iaPick = (i) => { const ia = X().E.iconAi; const it = M(ia.b).items[+i]; if (isReq(ia.b, it)) return false; ia.picks[+i] = !ia.picks[+i]; };
  A.iaSample = () => {
    const x = X(); const ia = x.E.iconAi; if (!ia) return false;
    if (!jobs(ia).length) return false;
    if (!x.afford(20)) { x.topup(); return false; }
    iaStop(); ia.stage = 'sample'; ia.pct = 0; ia.attempt++;
    ia.timer = setInterval(() => {
      if (X().E.iconAi !== ia) { clearInterval(ia.timer); return; }
      ia.pct = Math.min(100, ia.pct + 8);
      const n = document.querySelector('[data-ia-pct]'); if (n) n.textContent = ia.pct + '%';
      if (ia.pct >= 100) {
        clearInterval(ia.timer); ia.timer = null;
        if (x.fail()) { ia.stage = 'failed'; x.notice({ kind: 'failed', cat: 'editor', title: t('mp/ai-title', { mod: modTitle(ia.b) }), body: t('mp/ai-failed') }); }
        else { x.pay(20, 'icons'); const k0 = jobs(ia)[0]; ia.cands = { [k0]: { style: ia.style, color: candColor(ia, k0.split('|')[1]) } }; ia.failed = {}; ia.stage = 'sampleOk'; }
        window.render();
      }
    }, 120);
  };
  function runJobs(ia, list) {
    iaStop(); ia.stage = 'rest'; ia.run = list.slice(); ia.done = 0; ia.okN = 0;
    const failSet = X().fail() ? new Set([list[Math.min(1, list.length - 1)], list[Math.min(4, list.length - 1)]]) : new Set();
    list.forEach((k) => { delete ia.cands[k]; delete ia.failed[k]; });
    ia.timer = setInterval(() => {
      if (X().E.iconAi !== ia) { clearInterval(ia.timer); return; }
      const k = list[ia.done];
      if (failSet.has(k)) ia.failed[k] = true; else { ia.cands[k] = { style: ia.style, color: candColor(ia, k.split('|')[1]) }; ia.okN++; }
      ia.done++;
      if (ia.done >= list.length) iaFinish(ia);
      window.render();
    }, 320);
  }
  function iaFinish(ia) {
    const x = X(); clearInterval(ia.timer); ia.timer = null;
    if (ia.okN) x.pay(ia.okN * 20, 'icons');
    ia.stage = 'adopt';
    const nf = Object.keys(ia.failed).length;
    x.notice({ kind: nf ? 'partial' : 'done', cat: 'editor', title: t('mp/ai-title', { mod: modTitle(ia.b) }), body: nf ? t('rec/partial', { d: jobs(ia).length - nf, n: jobs(ia).length, f: nf }) : t('mp/ai-adopted', { n: Object.keys(ia.cands).length }) });
  }
  A.iaRest = () => {
    const x = X(); const ia = x.E.iconAi; const rest = jobs(ia).slice(1); const m = rest.length;
    if (!m) { ia.stage = 'adopt'; return; }
    const go = () => { if (X().E.iconAi === ia) { runJobs(ia, rest); window.render(); } };
    if (window.costConfirm) window.costConfirm({ title: t('rec/approve-title', { m }), body: t('rec/approve-body'), cost: m * 20, okLabel: t('rec/approve-ok', { m }), onOk: go });
    else if (x.afford(m * 20)) go(); else x.topup();
  };
  A.iaCancel = () => {
    const x = X(); const ia = x.E.iconAi; if (!ia) return;
    if (ia.stage === 'sample') { iaStop(); ia.stage = 'setup'; return; }
    if (ia.stage === 'rest') { iaStop(); ia.run.slice(ia.done).forEach((k) => { ia.failed[k] = true; }); if (ia.okN) x.pay(ia.okN * 20, 'icons'); ia.stage = 'adopt'; window.toast(t('ed/ia-cancelled'), { info: true }); }
  };
  A.iaFill = () => { const x = X(); const ia = x.E.iconAi; const list = Object.keys(ia.failed); if (!list.length) return false; if (!x.afford(list.length * 20)) { x.topup(); return false; } runJobs(ia, list); };
  A.iaRedo = (key) => {
    const x = X(); const ia = x.E.iconAi; if (ia.busy[key]) return false;
    if (!x.afford(20)) { x.topup(); return false; }
    ia.busy[key] = true;
    setTimeout(() => { if (X().E.iconAi !== ia) return; delete ia.busy[key]; if (x.fail()) { window.toast(t('mp/ai-failed'), { info: true }); } else { ia.attempt++; ia.cands[key] = { style: ia.style, color: candColor(ia, key.split('|')[1]) }; delete ia.failed[key]; x.pay(20, 'icons'); } window.render(); }, 900);
  };
  A.iaAdopt = () => {
    const x = X(); const ia = x.E.iconAi; const keys = Object.keys(ia.cands); if (!keys.length) return false;
    const srcs = keys.map((k) => [k, candSrc(ia, k)]);
    x.commit(() => { srcs.forEach(([k, src]) => { const [i, f] = k.split('|'); x.E.D.m[ia.b].items[+i][f] = src; }); });
    const n = new Set(keys.map((k) => k.split('|')[0])).size;
    iaStop(); x.E.iconAi = null; x.E.tab = 'content';
    window.toast(t('mp/ai-adopted', { n }), x.undoOpt());
  };
  const failTile = (cls = '') => `<div class="ia-fail ${cls}">${ic('x-circle-fill')}</div>`;
  function aiPanel() {
    const x = X(); const ia = x.E.iconAi; const b = ia.b; const its = M(b).items; const all = jobs(ia); const m = Math.max(0, all.length - 1);
    const head = `<h2 class="p-title"><button class="ibtn ibtn-sm" data-act="iaClose" title="${esc(t('ed/tpl-back'))}">${ic('caret-left')}</button><span class="ellipsis">${t('mp/ai-title', { mod: modTitle(b) })}</span></h2>`;
    const credits = `<div class="ia-bal">${t('confirm/balance-label')} · ${t('confirm/points', { n: window.num(S().credits || 0) })}</div>`;
    let body = '', foot = '';
    if (ia.stage === 'setup') {
      const r = its.filter((it) => isReq(b, it)).length, o = its.filter((it, i) => !isReq(b, it) && ia.picks[i]).length;
      body = sec(t('mp/ai-style'), `<div class="ia-styles">${STYLES.map((s) => `<button class="ia-st ${ia.style === s ? 'is-on' : ''}" data-act="iaStyle" data-arg="${s}"><img src="${aiSvg(its[0].i || 'sparkle-fill', s, x.E.D.theme.primary)}" alt=""><span>${t('mp/ai-st-' + s)}</span></button>`).join('')}</div>`)
        + sec(t('mp/ai-extra'), `<input class="input" data-input="iaExtra" value="${esc(ia.extra)}" placeholder="${esc(t('mp/ai-extra-ph'))}" maxlength="60">`)
        + `<div class="p-sec"><div class="lab">${t('mp/ai-entries')}<span class="v">${t('mp/ai-count', { r, o })}</span></div><div class="ia-list">${its.map((it, i) => { const req = isReq(b, it); return `<button class="ia-row ${req ? 'is-req' : ''}" data-act="iaPick" data-arg="${i}"><span class="check ${ia.picks[i] ? 'is-on' : ''}">${ia.picks[i] ? ic('check', 'ic-16') : ''}</span><span class="thumb sq">${it.img ? img(it.img) : ic(it.i || 'plus')}</span><span class="nm">${esc(nm(it))}</span>${req ? `<span class="req">${t('mp/required')}</span>` : ''}</button>`; }).join('')}</div></div>`
        + `<div class="ia-cost">${ic('sparkle-fill', 'ic-16')}<div>${t('mp/ai-cost', { m, c: m * 20 })}${credits}</div></div>`;
      foot = x.afford(20) ? `<button class="btn btn-primary btn-block ${all.length ? '' : 'is-disabled'}" data-act="iaSample">${ic('sparkle-fill', 'ic-16')}${t('mp/ai-gen-sample')}</button>`
        : `<div class="ia-low">${t('ed/ai-low')}</div><button class="btn btn-primary btn-block" data-act="edTopup">${ic('credit-card', 'ic-16')}${t('confirm/topup')}</button>`;
    } else if (ia.stage === 'sample') {
      body = `<div class="ia-big"><div class="ia-sample skeleton"><b data-ia-pct>${ia.pct}%</b></div><div class="p-note" style="justify-content:center">${t('mp/ai-sample-ing')}</div></div>`;
      foot = `<button class="btn btn-ghost btn-block" data-act="iaCancel">${t('confirm/cancel')}</button>`;
    } else if (ia.stage === 'failed') {
      body = `<div class="ia-big">${failTile('ia-sample')}<div class="ia-msg is-err">${ic('warning-circle-fill', 'ic-16')}${t('mp/ai-failed')}</div></div>`;
      foot = `<button class="btn btn-primary btn-block" data-act="iaSample">${t('rec/retry', { c: 20 })}</button><button class="btn btn-secondary btn-block" data-act="iaClose">${t('ed/tpl-back')}</button>`;
    } else if (ia.stage === 'sampleOk') {
      const k0 = all[0]; const it0 = its[+k0.split('|')[0]];
      body = `<div class="ia-big"><img class="ia-sample" src="${candSrc(ia, k0)}" alt=""><b>${esc(nm(it0))}</b><span class="caption faint">${t('rec/sample-tag', { n: all.length })}</span></div><div class="p-note">${t('rec/sample-ready', { m, c: m * 20 })}</div>${credits}`;
      foot = `<button class="btn btn-primary btn-block" data-act="iaRest">${t('rec/continue', { m })}</button><button class="btn btn-secondary btn-block" data-act="iaSample">${t('rec/redo-sample-cost', { c: 20 })}</button>`;
    } else {
      const rows = [...new Set(all.map((k) => k.split('|')[0]))].map((i) => {
        const it = its[+i]; const ks = all.filter((k) => k.split('|')[0] === i);
        const cell = (k) => ia.cands[k] ? `<span class="ia-c ${ia.busy[k] ? 'skeleton' : ''}">${ia.busy[k] ? '' : `<img src="${candSrc(ia, k)}" alt="">`}</span>` : ia.failed[k] ? `<span class="ia-c is-fail">${ic('x-circle-fill')}</span>` : `<span class="ia-c skeleton"></span>`;
        const redo = ia.stage === 'adopt' ? ks.filter((k) => ia.cands[k] || ia.failed[k]).map((k) => `<button class="btn btn-ghost btn-sm" data-act="iaRedo" data-arg="${k}">${t('mp/ai-redo')}</button>`).slice(0, 1).join('') : '';
        return `<div class="ia-res"><span class="nm">${esc(nm(it))}</span><span class="thumb sq">${it.img ? img(it.img) : ic(it.i || 'plus')}</span>${ic('arrow-right', 'ic-16 faint')}${ks.map(cell).join('')}${redo}</div>`;
      }).join('');
      const nf = Object.keys(ia.failed).length;
      if (ia.stage === 'rest') {
        const tot = ia.run.length;
        body = `<div class="ia-prog"><div class="r">${t('mp/ai-rest-ing', { m: tot, d: ia.done })}</div><div class="progress"><i style="width:${(ia.done / tot) * 100}%"></i></div></div><div class="ia-list">${rows}</div>`;
        foot = `<button class="btn btn-secondary btn-block" data-act="iaCancel">${ic('x', 'ic-16')}${t('confirm/cancel')}</button>`;
      } else {
        body = `${nf ? `<div class="notice is-err" style="margin-bottom:10px">${ic('x-circle-fill')}<div>${t('rec/partial', { d: all.length - nf, n: all.length, f: nf })}</div></div>` : ''}<div class="ia-list">${rows}</div>${credits}`;
        foot = `${nf ? `<button class="btn btn-secondary btn-block" data-act="iaFill">${t('rec/fill-missing', { f: nf, c: nf * 20 })}</button>` : ''}<button class="btn btn-primary btn-block ${Object.keys(ia.cands).length ? '' : 'is-disabled'}" data-act="iaAdopt">${t('mp/ai-adopt-all')}</button><button class="btn btn-ghost btn-block" data-act="iaClose">${t('mp/ai-skip')}</button>`;
      }
    }
    return `${head}<div class="ia-body">${body}</div><div class="ia-foot">${foot}</div>`;
  }

  // ---------- 批量上传图标（ED-05） ----------
  let bxIn = null, bxB = null;
  A.bxOpen = (b) => {
    bxB = b; S().menu = null;
    if (!bxIn) {
      bxIn = document.createElement('input'); bxIn.type = 'file'; bxIn.multiple = true; bxIn.accept = 'image/png,image/svg+xml,image/webp'; bxIn.style.display = 'none'; bxIn.setAttribute('data-batch-file', '');
      document.body.appendChild(bxIn);
      bxIn.addEventListener('change', () => { const files = [...bxIn.files]; bxIn.value = ''; if (files.length) bxRead(bxB, files); });
    }
    bxIn.click(); return false;
  };
  function bxMatch(b, base) {
    const its = M(b).items; const names = its.map(nm);
    let i = names.indexOf(base);
    if (i < 0) i = names.findIndex((n) => n.toLowerCase() === base.toLowerCase());
    if (i < 0) i = names.findIndex((n) => n && (base.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(base.toLowerCase())));
    return i;
  }
  function bxRead(b, files) {
    const rows = []; let left = files.length;
    const doneOne = () => { if (--left === 0) { X().E.bx = { b, rows, ing: null, pick: null }; X().E.dlg = 'batch'; window.render(); } };
    files.forEach((file, k) => {
      const row = { name: file.name, src: '', w: 0, h: 0, bad: !/^image\/(png|svg\+xml|webp)$/.test(file.type), target: -1, f: 'img' };
      rows[k] = row;
      let base = file.name.replace(/\.[^.]+$/, '');
      const on = /(_选中|_active|_on)$/i.test(base); base = base.replace(/(_选中|_active|_on)$/i, '');
      if (on && (b === 'bottomnav' || b === 'gamemenu')) row.f = 'imgOn';
      if (row.bad) { doneOne(); return; }
      row.target = bxMatch(b, base);
      const rd = new FileReader();
      rd.onload = () => { row.src = rd.result; const im = new Image(); im.onload = () => { row.w = im.naturalWidth; row.h = im.naturalHeight; doneOne(); }; im.onerror = () => { row.bad = true; row.target = -1; doneOne(); }; im.src = rd.result; };
      rd.onerror = () => { row.bad = true; doneOne(); };
      rd.readAsDataURL(file);
    });
  }
  const bxPad = (b, r) => { const [tw, th] = ICON_SPEC[b]; return r.w && r.h && Math.abs(r.w / r.h - tw / th) > 0.03; };
  function bxSum(bx) { const n = bx.rows.filter((r) => !r.bad && r.target >= 0).length, u = bx.rows.filter((r) => !r.bad && r.target < 0).length, bad = bx.rows.filter((r) => r.bad).length; return { n, u, b: bad }; }
  function bxTargetLabel(bx, r) { if (r.target < 0) return t('mp/batch-skip'); const it = M(bx.b).items[r.target]; return nm(it) + (r.f === 'imgOn' ? ' · ' + t('mp/state-act') : ''); }
  function bxOptions(bx, k) {
    const its = M(bx.b).items; const two = bx.b === 'bottomnav' || bx.b === 'gamemenu';
    const opts = [];
    its.forEach((it, i) => { opts.push([i + '|img', nm(it) + (two ? ' · ' + t('mp/state-def') : '')]); if (two) opts.push([i + '|imgOn', nm(it) + ' · ' + t('mp/state-act')]); });
    opts.push(['-1|img', t('mp/batch-skip')]);
    const r = bx.rows[k]; const cur = r.target + '|' + (r.target < 0 ? 'img' : r.f);
    return opts.map(([v, l]) => `<button class="menu-item ${v === cur ? 'is-on' : ''}" data-act="bxSet" data-arg="${k}|${v}">${esc(l)}</button>`).join('');
  }
  function batchBody(mobile) {
    const bx = X().E.bx; const [tw, th] = ICON_SPEC[bx.b]; const s = bxSum(bx);
    const rows = bx.rows.map((r, k) => {
      let st;
      if (r.bad) st = `<span class="pill-tag is-err">${t('mp/batch-bad')}</span>`;
      else if (r.target < 0) st = `<span class="bx-none">${t('mp/batch-none')}</span>`;
      else if (bxPad(bx.b, r)) st = `<span class="pill-tag is-warn">${t('mp/batch-pad', { w: r.w, h: r.h, tw, th })}</span>`;
      else st = `<span class="bx-ok">${ic('check-circle-fill', 'ic-16')}</span>`;
      const dd = r.bad ? `<button class="bx-dd" disabled>${t('mp/batch-skip')}${ic('caret-down', 'ic-16')}</button>`
        : `<span class="rel"><button class="bx-dd ${r.target < 0 ? 'is-none' : ''}" data-act="bxDd" data-arg="${k}">${esc(bxTargetLabel(bx, r))}${ic('caret-down', 'ic-16')}</button>${!mobile && S().menu === 'bx:' + k ? `<div class="menu bx-menu">${bxOptions(bx, k)}</div>` : ''}</span>`;
      return `<div class="bx-row ${r.bad ? 'is-bad' : ''}"><span class="bx-th">${r.src ? `<img src="${r.src}" alt="">` : ic('file-image')}</span><div class="bx-mid"><div class="bx-fn ellipsis" title="${esc(r.name)}">${esc(r.name)}</div><div class="bx-st">${st}</div></div>${ic('arrow-right', 'ic-16 faint')}${dd}</div>`;
    }).join('');
    const foot = bx.ing != null
      ? `<div class="bx-ing"><div class="r">${t('mp/batch-ing', { d: bx.ing, n: s.n })}</div><div class="progress"><i style="width:${(bx.ing / Math.max(1, s.n)) * 100}%"></i></div></div>`
      : `<div class="dialog-foot bx-foot"><span class="caption muted">${t('mp/batch-sum', s)}</span><button class="btn btn-secondary" data-act="closeDlg">${t('confirm/cancel')}</button><button class="btn btn-primary ${s.n ? '' : 'is-disabled'}" data-act="bxGo">${t('mp/batch-go')}</button></div>`;
    return `<div class="dialog-head"><h3>${t('mp/batch-title', { mod: modTitle(bx.b) })}</h3><button class="ibtn ibtn-sm" data-act="closeDlg">${ic('x')}</button></div><div class="bx-list" data-sk="bx">${rows}</div>${foot}`;
  }
  function batchPickSheet() {
    const bx = X().E.bx; if (!bx || bx.pick == null) return '';
    return `<div class="scrim" data-act="bxPickClose" style="z-index:95"></div><div class="sheet med-sheet bx-pick" style="z-index:96"><div class="sheet-grab"></div><div class="sheet-head"><h3 class="ellipsis">${esc(bx.rows[bx.pick].name)}</h3><button class="ibtn ibtn-sm" data-act="bxPickClose">${ic('x')}</button></div><div class="icon-sheet-list">${bxOptions(bx, bx.pick)}</div></div>`;
  }
  A.bxDd = (k) => { const x = X(); if (x.mobileEd()) { x.E.bx.pick = +k; S().menu = null; } else S().menu = S().menu === 'bx:' + k ? null : 'bx:' + k; };
  A.bxPickClose = () => { X().E.bx.pick = null; };
  A.bxSet = (arg) => { const [k, i, f] = arg.split('|'); const r = X().E.bx.rows[+k]; r.target = +i; r.f = f; X().E.bx.pick = null; S().menu = null; };
  A.bxGo = () => {
    const x = X(); const bx = x.E.bx; const list = bx.rows.filter((r) => !r.bad && r.target >= 0); if (!list.length || bx.ing != null) return false;
    bx.ing = 0;
    const tm = setInterval(() => {
      if (x.E.bx !== bx || x.E.dlg !== 'batch') { clearInterval(tm); return; }
      bx.ing++;
      if (bx.ing >= list.length) {
        clearInterval(tm);
        x.commit(() => { list.forEach((r) => { x.E.D.m[bx.b].items[r.target][r.f] = r.src; }); });
        x.E.dlg = null; x.E.bx = null;
        window.toast(t('mp/batch-done', { n: list.length }), x.undoOpt());
      }
      window.render();
    }, 180);
  };

  // ---------- 全部 68 个颜色用途（ED-02），数据 = shared/theme/keys.ts ----------
  const KEYS68 = {
    base: [['primary', '主色'], ['lead', '重要文字'], ['neutral_1', '次级文字'], ['neutral_2', '较弱文字'], ['neutral_3', '未输入 / 禁用'], ['border', '描边'], ['bg_1', '页面背景'], ['bg_2', '底板'], ['accent_1', '辅助绿'], ['accent_2', '辅助红'], ['accent_3', '辅助橙']],
    ext: [
      ['leftnav_def','ref','neutral_2','左侧栏未选中文字'],
      ['leftnav_active','ref','text_primary','左侧栏选中文字'],
      ['text_primary','fixed','#FFFFFF','主色通用按钮字体'],
      ['text_accent3','fixed','#FFFFFF','辅助橙通用按钮字体'],
      ['home_bg','design',null,'H5/APP 首页背景'],
      ['home_db','design',null,'首页背景上的底板'],
      ['search_icon','ref','primary','首页搜索图标（仅首页，内页不可使用）'],
      ['label_accent3','ref','accent_3','橙色角标'],
      ['labeltext_accent3','ref','text_accent3','橙色角标字体'],
      ['kb_bg','ref','border','数字键盘底色'],
      ['filter_bg','ref','bg_1','筛选底板'],
      ['table_bg','fixed','#FFFFFF','通用表格背景'],
      ['btmnav_def','design',null,'底部导航未选中'],
      ['btmnav_active','design',null,'底部导航选中'],
      ['icon_1','ref','primary','蓝色小图标'],
      ['filter_active','ref','primary','筛选选中'],
      ['icon_tg_q','ref','neutral_1','左侧栏图标渐变起点'],
      ['icon_tg_z','ref','neutral_1','左侧栏图标渐变终点'],
      ['jackpot_text','fixed','#FFFFFF','彩金池标题'],
      ['jdd_vip_bjc','ref','primary','VIP 保级差进度条'],
      ['bs_zc_an1','ref','bg_1','版式侧边栏按钮'],
      ['bs_zc_bg','fixed','#FFFFFF','版式侧边栏底'],
      ['ddt_bg','ref','border','兜底图底板背景'],
      ['ddt_icon','ref','bg_2','兜底图图形'],
      ['bs_topnav_bg','design',null,'版式顶部导航底'],
      ['alt_primary','ref','primary','欧美白底特殊主题色'],
      ['alt_neutral_1','ref','neutral_1','欧美白底特殊次级色'],
      ['alt_neutral_2','ref','neutral_2','欧美白底特殊较弱色'],
      ['alt_border','ref','border','欧美白底特殊描边'],
      ['profile_icon_1','cond',[['有底','ref','primary'],['无底','ref','accent_3']],'个人中心中部图标 1'],
      ['profile_icon_2','cond',[['有底','ref','primary'],['无底','ref','accent_1']],'个人中心中部图标 2'],
      ['profile_icon_3','cond',[['有底','ref','primary'],['无底','ref','primary']],'个人中心中部图标 3'],
      ['profile_icon_4','cond',[['有底','ref','primary'],['无底','ref','accent_2']],'个人中心中部图标 4'],
      ['profile_toptext','fixed','#FFFFFF','个人中心顶部内容'],
      ['web_filter_gou','ref','text_primary','筛选选中勾'],
      ['web_topbg_1','fixed','#3C8DFF','底色渐变起点'],
      ['web_topbg_3','fixed','#1B7AFF','底色渐变终点（高款）'],
      ['web_left_bg_q','fixed','#FFFFFF','侧边栏选中背景渐变起点'],
      ['web_left_bg_z','fixed','#FFFFFF','侧边栏选中背景渐变终点'],
      ['web_load_zz','ref',['border',0.6],'加载遮罩（border99）'],
      ['web_plat_line','ref','neutral_3','平台底板外描边'],
      ['web_left_bg_shadow','fixed','#0000001F','未选中左侧按钮/平台底板投影颜色'],
      ['web_bas_zc_an2','fixed','#FFFFFF','版式侧边栏按钮悬停'],
      ['web_bs_yj_bg','design',null,'版式页脚底'],
      ['web_btmnav_db','design',null,'H5 底部导航底色'],
      ['alt_text_primary','ref','text_primary','顶部导航主按钮字体'],
      ['alt_lead','ref','lead','特殊主级色'],
      ['web_left_bg_shadow_active','fixed','#0000001F','左侧按钮选中投影'],
      ['tg_accent_1','ref',['accent_1',0.2],'推广教程绿底板'],
      ['tg_accent_3','ref',['accent_3',0.2],'推广教程橙底板'],
      ['tg_primary','ref',['primary',0.2],'推广教程主题底板'],
      ['cards_text','cond',[['欧美卡片','fixed','#FFFFFF'],['经典卡片','ref','neutral_1']],'卡片文字'],
      ['btn_color_1','ref','primary','特殊公共按钮渐变中间色'],
      ['btn_color_2','ref','primary','特殊公共按钮渐变终点'],
      ['custom_1','fixed','#FFFFFF','首页特殊色 1'],
      ['custom_2','fixed','#FFFFFF','首页特殊色 2'],
      ['custom_3','fixed','#FFFFFF','首页特殊色 3'],
    ],
  };
  // 「跟设计」Key 的值来自版式模板（不默认等于 primary）
  const DESIGN_DEF = { home_bg: '#F4F6FA', home_db: '#FFFFFF', btmnav_def: '#8A8F99', btmnav_active: '#0F6FFF', bs_topnav_bg: '#FFFFFF', web_bs_yj_bg: '#1C2033', web_btmnav_db: '#FFFFFF' };
  const EXT = Object.fromEntries(KEYS68.ext.map((e) => [e[0], e]));
  const BASE = Object.fromEntries(KEYS68.base);
  const keyLabel = (k) => (BASE[k] ? t('ed/key-' + k) : EXT[k] ? EXT[k][3] : k);
  function resolveKey(k, th, ec, d = 0) {
    if (d > 8) return '#000000';
    if (ec['key:' + k]) return ec['key:' + k];
    if (BASE[k]) return th[k];
    const e = EXT[k]; if (!e) return '#000000';
    if (e[1] === 'fixed') return e[2];
    if (e[1] === 'design') return DESIGN_DEF[k] || '#cccccc';
    if (e[1] === 'cond') { const c = e[2][0]; return c[1] === 'fixed' ? c[2] : resolveKey(c[2], th, ec, d + 1); }
    const [tk, al] = Array.isArray(e[2]) ? e[2] : [e[2], null];
    const hex = resolveKey(tk, th, ec, d + 1);
    return al != null ? hex.slice(0, 7) + Math.round(al * 255).toString(16).padStart(2, '0') : hex;
  }
  const GROUPS = [['base', 'ed/keys-g-base'], ['ref', 'ed/keys-g-ref'], ['fixed', 'ed/keys-g-fixed'], ['design', 'ed/keys-g-design'], ['cond', 'ed/keys-g-cond']];
  function keysPanel(mobile) {
    const x = X(); const K = x.E.keys; const { th, ec } = x.liveTheme(); const P = x.E.picker; const q = (K.q || '').trim().toLowerCase();
    const rowsOf = (g) => (g === 'base' ? KEYS68.base.map(([k, l]) => [k, 'base', null, l]) : KEYS68.ext.filter((e) => e[1] === g))
      .filter((e) => !q || e[0].toLowerCase().includes(q) || e[3].toLowerCase().includes(q) || keyLabel(e[0]).toLowerCase().includes(q));
    let total = 0;
    const groups = GROUPS.map(([g, lk]) => {
      const rows = rowsOf(g); total += rows.length; if (!rows.length) return '';
      const closed = K.closed[g] && !q;
      return `<div class="kg"><button class="kg-hd" data-act="keysGrp" data-arg="${g}">${ic(closed ? 'caret-right' : 'caret-down', 'ic-16')}<span>${t(lk)}</span><span class="n">${rows.length}</span></button>${closed ? '' : rows.map((e) => keyRow(e, th, ec, P, K, mobile)).join('')}</div>`;
    }).join('');
    const tools = `<div class="kt"><label class="kt-s">${ic('magnifying-glass', 'ic-16')}<input data-input="keysQ" value="${esc(K.q || '')}" placeholder="${esc(t('ed/keys-search'))}"></label>${toggle(K.showKey, 'keysShowKey', '', t('ed/keys-show-key'))}</div>`;
    return `${tools}<div class="klist">${total ? groups : `<div class="empty is-sm"><div class="ico">${ic('magnifying-glass', 'ic-24')}</div><h3>${esc(t('ed/keys-none', { q: K.q }))}</h3></div>`}</div>`;
  }
  function keyRow(e, th, ec, P, K, mobile) {
    const [k, kind, arg, usage] = e;
    const col = resolveKey(k, th, ec); const custom = kind !== 'base' && !!ec['key:' + k];
    let cap = '';
    if (kind === 'base') cap = `<span class="mono">${col.toUpperCase()}</span>`;
    else if (custom) cap = `<span class="kc-custom">${t('ed/keys-custom')}</span>`;
    else if (kind === 'ref') { const [tk, al] = Array.isArray(arg) ? arg : [arg, null]; cap = t('ed/keys-follow', { name: keyLabel(tk) }) + (al != null ? ` · ${Math.round(al * 100)}%` : ''); }
    else if (kind === 'fixed') cap = t('ed/keys-fixed', { hex: arg });
    else if (kind === 'design') cap = `<i class="kdot"></i>${t('ed/keys-pending')}`;
    else cap = arg.map(([l, , v]) => `${l}：${v[0] === '#' ? v : keyLabel(v)}`).join(' · ');
    const label = kind === 'base' ? t('ed/key-' + k) : usage;
    const open = S().menu === 'km:' + k;
    const menu = open && kind !== 'base' && kind !== 'cond' ? `<div class="menu km-menu"><button class="menu-item" data-act="keyDetach" data-arg="${k}">${ic('paint-brush-fill')}${t('ed/keys-detach')}</button><button class="menu-item" data-act="keyRestore" data-arg="${k}" ${custom ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('ed/keys-restore')}</button></div>` : '';
    const showPick = !mobile && P && P.where === 'keys' && (kind === 'base' ? !P.elRow && P.key === k : P.elRow === 'key:' + k);
    return `<div class="krow-w"><button class="krow ${open ? 'is-open' : ''}" data-act="keyRow" data-arg="${k}|${kind}"><span class="ksw" style="background:${col}"></span><span class="kt2"><span class="ku">${esc(label)}</span><span class="kcap">${cap}</span></span>${K.showKey ? `<span class="kk mono">${k}</span>` : ''}${custom ? `<span class="pill-tag">${t('ed/keys-custom')}</span>` : ''}</button>${menu}${showPick ? X().pickerHtml('in-panel', label) : ''}</div>`;
  }
  A.keysGrp = (g) => { const K = X().E.keys; K.closed[g] = !K.closed[g]; };
  A.keysShowKey = () => { const K = X().E.keys; K.showKey = !K.showKey; };
  I.keysQ = (v) => { X().E.keys.q = v; return true; };
  A.keyRow = (arg) => {
    const [k, kind] = arg.split('|'); const x = X();
    if (kind === 'cond') { window.toast(t('ed/keys-cond-tip'), { info: true }); return false; }
    if (kind === 'base') { const v = x.E.D.theme[k]; x.E.picker = { key: k, orig: v, value: v, where: 'keys' }; if (x.mobileEd()) { x.E.picker.back = 'keys'; x.E.mpanel = 'picker'; } return; }
    S().menu = S().menu === 'km:' + k ? null : 'km:' + k;
  };
  A.keyDetach = (k) => {
    const x = X(); const { th, ec } = x.liveTheme(); const v = resolveKey(k, th, ec).slice(0, 7); S().menu = null;
    x.E.picker = { key: 'primary', elRow: 'key:' + k, label: EXT[k][3], orig: v, value: v, where: 'keys' };
    if (x.mobileEd()) { x.E.picker.back = 'keys'; x.E.mpanel = 'picker'; }
  };
  A.keyRestore = (k) => { const x = X(); if (!x.E.D.ec['key:' + k]) return false; x.commit(() => { delete x.E.D.ec['key:' + k]; }); S().menu = null; window.toast(t('ed/changed-undo'), x.undoOpt()); };
  // 菜单往下弹；面板可滚动，保证菜单可见
  window.AFTER_RENDER.push(() => { const m = document.querySelector('.km-menu'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'nearest' }); });

  function slotOf(slot) { const [, b, f] = slot.split('-'); return [b, f]; }
  window.MP = {
    defaults, vars, panel, h5, bnav, bnavCls, side, iconSheet, aiPanel, batchBody, batchPickSheet, keysPanel, nm, ICON_SPEC, KEYS68, has: (b) => !!P[b],
    resetColors: (b) => { (EL[b] || []).forEach(([id]) => { delete X().E.D.ec[id]; }); },
    getAsset: (slot) => { const [b, f] = slotOf(slot); return M(b)[f]; },
    setAsset: (slot, v) => { const [b, f] = slotOf(slot); X().E.D.m[b][f] = v; },
    toggleAsset: (slot) => { const [b, f] = slotOf(slot); set(b, f + 'On', M(b)[f + 'On'] === false); },
  };
})();
