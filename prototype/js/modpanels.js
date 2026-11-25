/* 编辑器：彩金池、中部导航、游戏菜单、游戏卡片、页脚、侧边栏、底部导航的「内容 / 布局 / 颜色」面板与画布渲染。
 * 必须在 editor.js 之前加载（编辑器初始数据用 MP.defaults()）；运行时通过 window.EDX 取编辑器内部状态。
 * 元素颜色清单与默认 Key 对应 shared/catalog/home.ts 的 MODULE_ELEMENTS；布局选项对应 LAYOUTS（尺寸按 750 稿）。 */
(function () {
  const A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const X = () => window.EDX;

  // ---------- 默认数据 ----------
  const MID = [['体育', null], ['真人', null], ['电子', 'game-controller'], ['彩票', 'squares-four-fill'], ['棋牌', 'stack-fill'], ['捕鱼', 'sparkle-fill'], ['电竞', 'toolbox-fill'], ['优惠', 'heart-fill'], ['VIP', 'user-circle'], ['客服', 'bell-fill']];
  const GM = [['热门', 'sparkle-fill'], ['体育', 'trophy-fill'], ['真人', 'user-circle-fill'], ['电子', 'game-controller-fill'], ['彩票', 'ticket-fill'], ['棋牌', 'stack-fill']];
  const GAMES = [['星河足球', '热门'], ['百家乐', '新'], ['幸运老虎机', null, true], ['极速赛车'], ['德州扑克'], ['捕鱼达人']];
  const BN = [['首页', 'house-fill', true], ['优惠', 'sparkle-fill'], ['消息', 'bell-fill'], ['充值', 'credit-card'], ['我的', 'user-circle', true]];
  const SIDE = [['首页', 'house-fill'], ['优惠活动', 'gift-fill'], ['VIP 特权', 'crown-fill'], ['在线客服', 'headset-fill'], ['个人中心', 'user-circle']];
  const FOOT = ['关于我们', '帮助中心', '隐私政策'];
  const items = (arr) => arr.map((x) => ({ n: x[0], i: x[1] || null, req: !!x[2], on: true }));
  const defaults = () => ({
    jackpot: { title: '彩金池', anim: 'roll', layout: 'flow', margin: 16, corner: 16, bg: null, bgOn: true },
    midnav: { mode: 'conf', items: items(MID), layout: 'row', per: 5, size: 96 },
    gamemenu: { items: items(GM), style: 'tabs', shape: 'pill' },
    gamecards: { name: true, tag: true, fallback: null, cols: 3, corner: 16, gap: 16 },
    footer: { items: items(FOOT.map((n) => [n])), copy: '© 2026 星河体育 版权所有', align: 'center' },
    sidebar: { items: items(SIDE), style: 'list', width: 62, head: null, headOn: true },
    bottomnav: { mode: 'fixed', items: items(BN), style: 'regular', h: 110 },
  });

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
  const note = (k) => `<div class="p-note">${t(k)}</div>`;
  const px = (b, k, vals, labels) => sec(labels.title, seg(vals.map((v, i) => ({ v: String(v), label: labels.opts ? labels.opts[i] : v + (labels.unit || ' px') })), M(b)[k], `mpSet_${b}_${k}`), M(b)[k] + (labels.unit || ' px'));
  const toggle = (on, act, arg, label) => `<button class="tg-row" data-act="${act}" data-arg="${arg}"><span>${label}</span><span class="switch ${on ? 'is-on' : ''}"><i></i></span></button>`;
  function list(b, render) {
    return `<div class="mp-list" data-drag-list="${b}">${M(b).items.map((it, i) => `<div class="lrow ${it.on ? '' : 'is-hidden'}" data-row="${i}"><span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span>${render ? render(it, i) : `<span class="nm">${esc(it.n)}</span>`}${it.req && M(b).mode === 'fixed' ? `<span class="req">${t('mp/required')}</span><span class="eye is-off">${ic('lock-fill', 'ic-16')}</span>` : `<button class="eye" data-act="mpItem" data-arg="${b}|${i}">${ic(it.on ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`}</div>`).join('')}</div><div class="p-note">${t('mp/drag-hint')}</div>`;
  }
  function asset(b, field, name, spec, thumb) {
    const slot = `mp-${b}-${field}`; const on = M(b)[field + 'On'] !== false;
    return `<div class="asset ${on ? '' : 'is-off'}"><div class="top">${thumb}<span style="min-width:0"><div class="nm">${name}</div><div class="sp">${spec}</div></span>${X().moreBtn(slot)}</div>
      <div class="acts"><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="${slot}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="soon">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div>${X().uploadUI(slot)}`;
  }
  const modeSeg = (b) => sec(t('mp/nav-mode'), seg([{ v: 'conf', label: t('mp/mode-conf') }, { v: 'fixed', label: t('mp/mode-fixed') }], M(b).mode, `mpSet_${b}_mode`) + `<div class="p-note">${t(M(b).mode === 'conf' ? 'mp/mode-conf-help' : 'mp/mode-fixed-help')}</div>`);
  const iconBtns = `<div class="r2" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-act="soon">${ic('magic-wand', 'ic-16')}${t('mp/ai-icons')}</button><button class="btn btn-secondary btn-sm" data-act="soon">${ic('upload-simple', 'ic-16')}${t('mp/upload-icons')}</button></div>`;
  const ico = (i) => `<span class="thumb sq">${i ? ic(i) : ic('plus')}</span>`;
  // 中部导航 / 底部导航：入口图标可上传替换（缩略图右下角上传角标；画布上点图标也能替换）
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
      content: () => modeSeg('midnav') + sec(t('mp/entries'), list('midnav', (it, i) => `${upThumb('midnav', i, 'img', it.i || 'plus')}<span class="nm">${esc(it.n)}</span>${resetBtn('midnav', i)}`) + note('mp/icon-hint') + iconBtns),
      layout: () => sec(t('mp/style'), seg([{ v: 'row', label: t('mp/mid-row') }, { v: 'account', label: t('mp/mid-account') }], M('midnav').layout, 'mpSet_midnav_layout'))
        + px('midnav', 'per', [4, 5], { title: t('mp/per-row'), unit: '' }) + px('midnav', 'size', [80, 96, 112], { title: t('mp/icon-size') }) + note('ed/unit-750'),
    },
    gamemenu: {
      content: () => sec(t('mp/gm-cats'), list('gamemenu', (it) => `${ico(it.i)}<span class="nm">${esc(it.n)}</span>`)) + note('mp/gm-first'),
      layout: () => sec(t('mp/style'), seg([{ v: 'tabs', label: t('mp/gm-tabs') }, { v: 'icons', label: t('mp/gm-icons') }], M('gamemenu').style, 'mpSet_gamemenu_style'))
        + sec(t('mp/gm-shape'), seg([{ v: 'pill', label: t('mp/shape-pill') }, { v: 'square', label: t('mp/shape-square') }], M('gamemenu').shape, 'mpSet_gamemenu_shape')),
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
          + sec(t('mp/entries'), list('sidebar', (it) => `${ico(it.i)}<span class="nm">${esc(it.n)}</span>`));
      },
      layout: () => sec(t('mp/style'), seg([{ v: 'list', label: t('mp/sd-list') }, { v: 'grid', label: t('mp/sd-grid') }], M('sidebar').style, 'mpSet_sidebar_style'))
        + px('sidebar', 'width', [62, 75], { title: t('mp/width'), unit: '%' }),
    },
    bottomnav: {
      content: () => modeSeg('bottomnav') + sec(t('mp/entries'), list('bottomnav', (it, i) => `${upThumb('bottomnav', i, 'img', it.i, 'st2', t('mp/state-def'))}${upThumb('bottomnav', i, 'imgOn', it.i, 'st2 on', t('mp/state-act'))}<span class="nm">${esc(it.n)}</span>${resetBtn('bottomnav', i)}`) + `<div class="p-note">${t('mp/bn-icons-note')}</div>` + note('mp/icon-hint') + iconBtns),
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
      return `<div class="h5-mid-wrap">${acct}<div class="h5-mid" style="grid-template-columns:repeat(${m.per},1fr)">${vis('midnav').map((it) => { const i = m.items.indexOf(it); return `<div class="it"><span class="ib ${it.img ? 'cu' : it.i ? '' : 'ph'} ${S().menu === 'icon:midnav|' + i ? 'is-focus' : ''}" style="width:${sz + 8}px;height:${sz}px" data-act="mpIconMenu" data-arg="${id || 'midnav'}|midnav|${i}" data-stop>${it.img ? img(it.img) : ic(it.i || 'plus')}</span>${esc(it.n)}${S().menu === 'icon:midnav|' + i ? iconMenu('midnav', i, 'img') : ''}</div>`; }).join('')}</div></div>`;
    }
    if (b === 'gamemenu') return `<div class="h5-gm ${m.style} ${m.shape}">${vis('gamemenu').map((it, i) => `<span class="${i ? '' : 'on'}">${m.style === 'icons' ? ic(it.i) : ''}${esc(it.n)}</span>`).join('')}</div>`;
    if (b === 'gamecards') {
      return `<div class="h5-gc" style="grid-template-columns:repeat(${m.cols},1fr);gap:${m.gap / 2}px">${GAMES.map(([n, tg, fb]) => `<div class="c"><div class="im ${fb ? 'fb' : ''}" style="border-radius:${m.corner / 2}px;${fb && m.fallback ? `filter:${m.fallback}` : ''}">${fb ? ic('image-fill') : ''}${tg && m.tag ? `<span class="tg">${tg}</span>` : ''}</div>${m.name ? esc(n) : ''}</div>`).join('')}</div>`;
    }
    if (b === 'footer') return `<div class="h5-foot" style="text-align:${m.align}"><div class="ln">${vis('footer').map((x) => esc(x.n)).join(' · ')}</div><div>${esc(m.copy)}</div></div>`;
    return '';
  }
  function bnav() {
    const m = M('bottomnav'); const v = vis('bottomnav'); const mid = Math.floor(v.length / 2);
    return v.map((it, k) => { const i = m.items.indexOf(it), f = k ? 'img' : 'imgOn', on = S().menu === 'icon:bottomnav|' + i; return `<span class="it ${k ? '' : 'on'} ${m.style === 'raised' && k === mid ? 'raised' : ''}"><span class="bi ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="bottomnav|bottomnav|${i}|${f}" data-stop>${it[f] ? img(it[f]) : ic(it.i)}</span>${esc(it.n)}${on ? iconMenu('bottomnav', i, f) : ''}</span>`; }).join('');
  }
  const bnavCls = () => `h-${M('bottomnav').h}`;
  function side() {
    const m = M('sidebar');
    const head = m.head && m.headOn ? `<div class="hd" style="filter:${m.head}"></div>` : '';
    return `<div class="pn ${m.style}" style="width:${m.width}%" data-act="selMod" data-arg="sidebar" data-stop>${head}${vis('sidebar').map((it, i) => `<div class="${i ? '' : 'on'}">${ic(it.i)}${esc(it.n)}</div>`).join('')}</div>`;
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
  const typeText = (b, k) => (v) => { const x = X(); if (typing !== b + k) { x.commit(() => {}); typing = b + k; } x.E.D.m[b][k] = v; document.querySelectorAll('.h5').forEach(() => {}); return true; };
  I.mpJpTitle = typeText('jackpot', 'title');
  I.mpFtCopy = typeText('footer', 'copy');
  document.addEventListener('click', () => { typing = null; }, true);

  // ---------- 图标上传替换 ----------
  const S = () => window.S;
  function iconMenu(b, i, f) {
    const has = !!M(b).items[i][f];
    return `<div class="menu icon-menu" data-stop><button class="menu-item" data-act="mpIcon" data-arg="${b}|${i}|${f}" data-stop>${ic('upload-simple')}<span class="tx"><span>${t('mp/icon-replace')}</span><span class="sub">${t('mp/icon-spec')}</span></span></button><button class="menu-item" data-act="mpIconReset" data-arg="${b}|${i}|${f}" data-stop ${has ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('mp/icon-reset')}</button></div>`;
  }
  let fileIn = null, target = null;
  function pickIcon(b, i, f) {
    target = { b, i: +i, f };
    if (!fileIn) {
      fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/png,image/svg+xml,image/webp,image/jpeg'; fileIn.style.display = 'none'; fileIn.setAttribute('data-icon-file', '');
      document.body.appendChild(fileIn);
      fileIn.addEventListener('change', () => {
        const file = fileIn.files[0]; fileIn.value = ''; if (!file || !target) return;
        if (!/^image\//.test(file.type)) { window.toast(t('mp/icon-bad')); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const { b: mb, i: mi, f: mf } = target; const x = X();
          x.commit(() => { x.E.D.m[mb].items[mi][mf] = rd.result; });
          if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
          window.toast(t('mp/icon-replaced', { n: x.E.D.m[mb].items[mi].n }), { action: () => { A.undo(); window.render(); }, actionLabel: t('ed/undo'), ms: 4000 });
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
    x.commit(() => { if (f) delete it[f]; else { delete it.img; delete it.imgOn; } });
    S().menu = null; if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
    window.toast(t('mp/icon-reset-toast'));
  };
  A.mpIconMenu = (arg) => {
    const [id, b, i, f] = arg.split('|'); const x = X(); const E = x.E;
    if (E.sel !== id) { E.tab = 'content'; E.ai = null; E.picker = null; }
    E.sel = id; E.h5side = false; if (E.tab !== 'content') E.tab = 'content';
    if (x.mobileEd()) { E.iconMenu = { b, i: +i, f: f || 'img' }; E.mpanel = 'iconmenu'; S().menu = null; }
    else S().menu = 'icon:' + b + '|' + i;
  };
  function iconSheet() {
    const m = X().E.iconMenu; if (!m) return '';
    const it = M(m.b).items[m.i];
    return `<div class="icon-sheet-hd">${it[m.f] ? img(it[m.f]) : ic(it.i || 'plus')}<b>${esc(it.n)}</b></div>${iconMenu(m.b, m.i, m.f).replace('menu icon-menu', 'icon-sheet-list')}`;
  }
  // 画布里的图标菜单：fixed 定位到图标正下方（底部导航放不下就往上）
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('body > .icon-menu').forEach((n) => n.remove());
    const m = document.querySelector('.icon-menu'); if (!m) return;
    // 画布有缩放（transform），fixed 会相对画布定位，所以把菜单移到 body 下
    const r = m.parentElement.querySelector('.is-focus').getBoundingClientRect();
    document.body.appendChild(m);
    m.style.position = 'fixed'; m.style.left = Math.max(8, Math.min(r.left - 4, window.innerWidth - 248)) + 'px';
    const h = m.offsetHeight; m.style.top = (r.bottom + 6 + h > window.innerHeight - 8 ? r.top - 6 - h : r.bottom + 6) + 'px';
  });

  function slotOf(slot) { const [, b, f] = slot.split('-'); return [b, f]; }
  window.MP = {
    defaults, vars, panel, h5, bnav, bnavCls, side, iconSheet, has: (b) => !!P[b],
    resetColors: (b) => { (EL[b] || []).forEach(([id]) => { delete X().E.D.ec[id]; }); },
    getAsset: (slot) => { const [b, f] = slotOf(slot); return M(b)[f]; },
    setAsset: (slot, v) => { const [b, f] = slotOf(slot); X().E.D.m[b][f] = v; },
    toggleAsset: (slot) => { const [b, f] = slotOf(slot); set(b, f + 'On', M(b)[f + 'On'] === false); },
  };
})();
