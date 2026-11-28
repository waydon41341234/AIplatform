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
  // 经典蓝白（Waydon 2026-11-26 真实 UI，Figma 03 组件 317:55525）：默认素材放 assets/classic/，存在 def / defOn / defOut 里，
  // 业主上传的图仍写 img / imgOn（重置 = 清掉 img 回到默认素材），所以「改过几个图标」的计数不受默认素材影响。
  const CL = 'assets/classic/';
  // 帐户栏入口：名称按当前语言取 mp/mn-n-*（改名后存原文到 n），跟底部导航 / 游戏菜单一样
  const MID = [['dep', 'wallet-fill', 'mid0'], ['vip', 'crown-fill', 'mid1', '12'], ['share', 'gift-fill', 'mid2', '1,888.8'], ['more', 'squares-four-fill', 'mid3']];
  const MID_OLD = { mid0: '利息宝', mid1: 'VIP', mid2: '分享赚钱', mid3: '更多' }; // 旧存档写死的中文默认名
  // 游戏菜单 = 游戏类型菜单，13 个类型（名称按当前语言取 mp/gm-n-*，改名后存原文）；经典蓝白显示前 9 个
  const GM = ['sparkle-fill', 'stack-fill', 'fish-fill', 'game-controller-fill', 'cube-fill', 'user-circle-fill', 'trophy-fill', 'ticket-fill', 'headset-fill', 'bird-fill', 'clock-counter-clockwise', 'heart-fill', 'play-circle-fill'];
  const GM_ORDER = [1, 2, 3, 6, 4, 7, 9, 8, 10, 5, 11, 12, 13]; // 热门 棋牌 捕鱼 真人 电子 体育 电竞 彩票 斗鸡 | 区块链 最近 收藏 试玩（后 4 个默认关）
  const GAMES = [['炸金花', 0], ['通比牛牛', 1], ['龙虎斗', 2], ['百人牛牛', 3], ['奔驰宝马', 4], ['水浒传', 5], ['百家乐', 7], ['飞禽走兽', 8], ['红黑大战', 6]];
  // 底部导航：第 4 个未登录显示「注册」，登录后显示「存款」；中间「分享赚钱」凸起大图标
  // 名称按当前语言取 mp/bn-n-*（改名后存原文到 n / 未登录名称 nOut）
  const BN = [['home', 'house-fill', true, 'bi0'], ['promo', 'gift-fill', false, 'bi1', 'bo1'], ['share', 'gift-fill', false, 'bi2', 'bo2'], ['dep', 'wallet-fill', false, 'bi3', 'bo3', 'reg'], ['mine', 'user-circle', true, 'bi4', 'bo4']];
  const SIDE = [['首页', 'house-fill'], ['优惠活动', 'gift-fill'], ['VIP 特权', 'crown-fill'], ['在线客服', 'headset-fill'], ['个人中心', 'user-circle']];
  const FOOT = ['关于我们', '帮助中心', '隐私政策'];
  const items = (arr) => arr.map((x) => ({ n: x[0], i: x[1] || null, req: !!x[2], on: true }));
  // 公告内容富文本（Waydon 2026-11-27 第 5 条，Figma 442:37665 ⑦）：存纯文本 text + spans [{ s, e, c }]（c = 'key:<名>' 或 #hex），
  // 选中部分文字可单独改色；默认 “龙虎斗”（含引号）→ accent_2、中级场 → accent_1、数字 → accent_3（Figma 317:55675 原样配色）
  const NOTICE = '恭喜玩家在“龙虎斗”游戏中级场房间赢得18888元彩金，祝您好运连连！';
  const NT_MAX = 80;
  // spans 整理：去掉空段 / 越界，按起点排序，相邻同色合并（spans 之间不重叠，spPaint 保证）
  const spNorm = (sp, len) => {
    const o = [];
    (sp || []).filter((x) => x && x.c).map((x) => ({ s: Math.max(0, x.s), e: Math.min(len, x.e), c: x.c })).filter((x) => x.e > x.s).sort((p, q) => p.s - q.s)
      .forEach((x) => { const l = o[o.length - 1]; if (l && l.c === x.c && l.e >= x.s) l.e = Math.max(l.e, x.e); else o.push(x); });
    return o;
  };
  // 给 [s, e) 上色（c 为空 = 清除，回到正文色）：先把这一段从原有 spans 里挖掉再加新段
  const spPaint = (sp, s, e, c) => {
    const o = [];
    (sp || []).forEach((x) => { if (x.e <= s || x.s >= e) o.push(Object.assign({}, x)); else { if (x.s < s) o.push({ s: x.s, e: s, c: x.c }); if (x.e > e) o.push({ s: e, e: x.e, c: x.c }); } });
    if (c) o.push({ s, e, c });
    return spNorm(o, Infinity);
  };
  // 旧存档（11-27 之前）：【方括号】里的字绿色（括号不显示）、“引号”红、数字橙，都是渲染时按规则算的；读的时候转成 spans 并去掉括号。
  // 颜色页签里单独改过的这三种颜色（E.D.ec['notice.g' / 'notice.hl' / 'notice.num']）带进对应的 span
  function ntFromOld(raw, ec) {
    let text = '', last = 0, mm; const g = []; const re = /【([^】]*)】/g;
    while ((mm = re.exec(raw))) { text += raw.slice(last, mm.index); g.push([text.length, text.length + mm[1].length]); text += mm[1]; last = re.lastIndex; }
    text += raw.slice(last); text = text.slice(0, NT_MAX);
    const col = (id, k) => (ec && ec[id]) || 'key:' + k;
    let sp = [];
    g.forEach(([s, e]) => { sp = spPaint(sp, s, e, col('notice.g', 'accent_1')); });
    for (const x of text.matchAll(/“[^”]*”/g)) sp = spPaint(sp, x.index, x.index + x[0].length, col('notice.hl', 'accent_2'));
    for (const x of text.matchAll(/\d[\d,.]*/g)) sp = spPaint(sp, x.index, x.index + x[0].length, col('notice.num', 'accent_3'));
    return { text, spans: spNorm(sp, text.length) };
  }
  const ntDef = () => ntFromOld(NOTICE.replace('中级场', '【中级场】'), null);
  // 补齐公告栏数据：旧存档转 spans；「显示消息气泡」（Waydon 11-27 第 3 条）默认开
  function ntNorm(m, ec) {
    if (!m) return m;
    if (!Array.isArray(m.spans)) { const r = ntFromOld(String(m.text || ''), ec); m.text = r.text; m.spans = r.spans; if (ec) ['notice.hl', 'notice.g', 'notice.num'].forEach((k) => { delete ec[k]; }); }
    if (m.badge == null) m.badge = true;
    return m;
  }
  const defaults = () => {
    const bn = BN.map(([k, i, req, def, defOut, outK]) => Object.assign({ n: '', k: 'mp/bn-n-' + k, i, req, on: true, def: CL + def + '.png' }, defOut ? { defOut: CL + defOut + '.png' } : {}, outK ? { outK: 'mp/bn-n-' + outK } : {}));
    bn[0].onBuiltin = true; bn[0].defOn = CL + 'bi0.png'; // 首页选中态图标内置
    // 凸起样式落在「分享赚钱」上（Figma 存款动效 120×120），不再按显示个数取中间；未登录「优惠」是 100×100 动效礼盒（bigOut）
    bn[2].raised = true; bn[1].bigOut = true;
    return {
      jackpot: { title: '彩金池', anim: 'roll', layout: 'flow', margin: 16, corner: 16, bg: null, bgOn: true },
      notice: Object.assign(ntDef(), { mail: true, badge: true, speed: 'normal' }, { items:[{ k: 'mp/nt-i-spk', i: 'speaker-high-fill', on: true, def: CL + 'speaker.png' }, { k: 'mp/nt-i-mail', i: 'envelope-simple-fill', on: true, def: CL + 'mail.png', defOn: CL + 'mail-on.png' }] }),
      midnav: { mode: 'conf', items: MID.map(([k, i, def, badge]) => ({ n: '', k: 'mp/mn-n-' + k, i, req: false, on: true, def: CL + def + '.png', badge: badge || null })), layout: 'account', per: 4, size: 57 },
      // active = 选中的分类（下标，不再固定第一个）；btnOff / btnSel = 业主上传 / AI 的按钮底图（空 = 效果图默认底图）
      // style = 菜单位置（11-28 游戏卡片 6 样式）：'side' 左侧（竖排，卡片在右）/ 'tabs' 中部（横向分类在卡片上方）
      gamemenu: { items: GM_ORDER.map((k, j) => ({ n: '', k: 'mp/gm-n-' + k, i: GM[k - 1], req: false, on: j < 9, def: j < 9 ? CL + 'cat' + j + '.png' : null })), style: 'side', active: 0, btnOff: null, btnSel: null },
      // 游戏卡片（Figma 317:55739）：rec = 角标（热门 / 新，第 1 张）；tag = 平台角标 WG、fav = 收藏星、title = 下一分类标题行（11-28 起固定显示，面板不再有开关）；
      // fallback = 兜底封面；starOff / starSel = 收藏星（未收藏 / 已收藏）
      // style = 卡片样式（11-28，Figma H5/GameCard 65974:81179）：classic 经典 / western 欧美 / portrait 竖版 / square 方形 / round 圆版 / landscape 横版；
      // cols = 每行张数：非横版 3 / 4（4 张时菜单固定在中部），横版 2 / 3。圆角、间距由样式决定（不再单独设置）
      gamecards: { style: 'classic', name: true, tag: true, fav: true, rec: true, title: true, fallback: null, starOff: null, starSel: null, cols: 3 },
      footer: { items: items(FOOT.map((n) => [n])), copy: '© 2026 星河体育 版权所有', align: 'center' },
      sidebar: { items: items(SIDE), style: 'list', width: 62, head: null, headOn: true },
      bottomnav: { mode: 'fixed', items: bn, style: 'raised', h: 140 }, // Figma 底栏 750×140
    };
  };
  const nm = (it) => it.n || (it.k ? t(it.k) : '');
  // 入口图标规格（逻辑尺寸，PNG 交付 @2x）
  // 帐户栏入口图标 Figma 317:55709：57×50（750 稿）
  const ICON_SPEC = { notice: [57, 50], midnav: [57, 50], bottomnav: [50, 50], gamemenu: [100, 76], sidebar: [60, 60] };
  // 公告栏两个图标尺寸不同（Figma 317:55673）：喇叭 36×32、消息 57×50
  const NT_SPEC = { 'mp/nt-i-spk': [36, 32], 'mp/nt-i-mail': [57, 50] };
  // 游戏菜单竖排图标位 Figma 317:55796：58×58 框内 58×44；中部横向分类（11-28）用同一套分类图标，规格相同（旧「图标分类」已并入中部）
  const GM_SPEC = { side: [58, 44], icons: [58, 44], tabs: [58, 44] };
  // 底部导航（Figma 317:55538）：普通图标位 50×50、中间凸起 120×120、未登录「优惠」动效礼盒 100×100
  const specOf = (b, i, f) => (b === 'bottomnav' ? bnSpec(i, f) : null) || (b === 'notice' && M(b).items[i] && NT_SPEC[M(b).items[i].k]) || (b === 'gamemenu' && GM_SPEC[M(b).style]) || ICON_SPEC[b] || [96, 96];

  // 元素颜色：[元素 ID, 默认取的基础色 Key]
  const EL = {
    // Banner（Figma 317:55531）：占位底 = ddt_bg（兜底图底板），指示器选中 / 未选中 = text_primary（Figma 固定 #FFFFFF，未选中叠 50% 透明度）
    banner: [['banner.placeholder', 'ddt_bg'], ['banner.indActive', 'text_primary'], ['banner.indDef', 'text_primary']],
    jackpot: [['jackpot.bg', 'primary'], ['jackpot.title', 'bg_2'], ['jackpot.amount', 'bg_2']],
    // 公告栏（Figma 317:55673）：自身无填充 = 透出首页底 home_bg；喇叭和正文 neutral_1；消息气泡（未读数）底 accent_2（数字固定白，在「文字样式」里改）。
    // 部分文字的颜色（原来的“引号”accent_2、【中级场】accent_1、数字 accent_3）11-27 起存在公告内容的 spans 里（选中文字改色），不再是颜色页签的三行
    notice: [['notice.bg', 'home_bg'], ['notice.icon', 'neutral_1'], ['notice.text', 'neutral_1'], ['notice.badge', 'accent_2']],
    // 帐户栏（Figma 317:55705）：自身无填充 = 透出首页底 home_bg；入口名 neutral_1、用户名 lead；登录框 / 注册底 primary、注册字 text_primary；
    // 入口图标是位图（颜色在图里），midnav.icon 只给没有图片的入口兜底线性图标用
    midnav: [['midnav.bg', 'home_bg'], ['midnav.text', 'neutral_1'], ['midnav.user', 'lead'], ['midnav.btn', 'primary'], ['midnav.btnText', 'text_primary'], ['midnav.icon', 'primary']],
    // 游戏菜单（Figma 317:55764）：未选中文字 leftnav_def、选中文字 leftnav_active（固定白）；按钮底默认是效果图位图（btn_zc1_1/2），
    // 选了颜色才换成 bg_2 / primary 纯色；投影 Figma 写死 #729FFF 15%（规范 Key web_left_bg_shadow = #0000001F，待设计确认，可在颜色页签切过去）；
    // 分类图标是位图（Figma icon_tg_q→icon_tg_z 渐变画在图里），gamemenu.icon 只给没有图片的分类兜底线性图标用
    // 菜单在中部（11-28）：选中文字 + 下划线单独一行 gamemenu.tabActive（默认 primary），不跟左侧的「选中按钮底」gamemenu.active 共用（11-28 QA：改中部下划线会把左侧按钮图换成纯色）
    gamemenu: [['gamemenu.bg', 'bg_2'], ['gamemenu.text', 'leftnav_def'], ['gamemenu.active', 'primary'], ['gamemenu.activeText', 'leftnav_active'], ['gamemenu.shadow', '#729FFF26'], ['gamemenu.icon', 'icon_tg_z'], ['gamemenu.tabActive', 'primary']],
    // 游戏卡片（Figma 317:55739）：未选中页签 lead；游戏名称 cards_text（经典卡片分支 = neutral_1，cards_text 第一分支是欧美卡片白字，所以默认直接写 neutral_1）；
    // 兜底封面底板 ddt_bg、图形 ddt_icon；推荐角标 label_accent3 / labeltext_accent3（Figma 角标是位图未绑定，取最近的扩展 Key）
    gamecards: [['gamecards.tab', 'lead'], ['gamecards.text', 'neutral_1'], ['gamecards.placeholder', 'ddt_bg'], ['gamecards.placeholderIcon', 'ddt_icon'], ['gamecards.label', 'label_accent3'], ['gamecards.labelText', 'labeltext_accent3']],
    footer: [['footer.bg', 'bg_1'], ['footer.text', 'neutral_2'], ['footer.link', 'neutral_1']],
    sidebar: [['sidebar.bg', 'bg_2'], ['sidebar.item', 'bg_1'], ['sidebar.itemActive', 'primary'], ['sidebar.text', 'lead'], ['sidebar.textActive', 'bg_2']],
    // 底部导航（Figma 317:55538）：底色 web_btmnav_db、未选中文字 / 图标 btmnav_def、选中文字 btmnav_active（都是「跟设计」Key）；
    // 默认图标是位图（颜色在图里），bottomnav.def / active 只给文字和没有图片时的兜底线性图标用
    bottomnav: [['bottomnav.bg', 'web_btmnav_db'], ['bottomnav.def', 'btmnav_def'], ['bottomnav.active', 'btmnav_active']],
  };
  const ALT = ['primary', 'lead', 'bg_2', 'accent_3', 'bg_1', 'neutral_2', 'accent_1'];
  const cssVar = (id) => '--e-' + id.replace('.', '-');
  // 元素色的默认 Key（颜色行第一个色块、文字样式的默认色、取色器「当前」）：游戏名称 = cards_text，欧美卡片分支是固定白 #FFFFFF、
  // 其它样式 = neutral_1（11-28 QA：欧美名称压在暗红渐变上是白字，色块 / 色值胶囊要显示白色，不是 #666666）
  const elDef = (id) => { if (id === 'gamecards.text' && X().E.D.m && gcStyleOf(M('gamecards')) === 'western') return '#FFFFFF'; for (const b in EL) for (const [i, k] of EL[b]) if (i === id) return k; return null; };
  function vars(th, ec) {
    let s = '';
    // 元素色可存十六进制，或 'key:<名>' 引用 68 Key（换整页配色时跟着变）；默认 Key 也可以是扩展 Key（如 ddt_bg）
    const kv = (k) => (k[0] === '#' ? k : th[k] != null ? th[k] : resolveKey(k, th, ec)); // 默认值也可以直接是 Figma 写死的色值
    for (const b in EL) for (const [id, k] of EL[b]) { const v = ec[id]; s += `;${cssVar(id)}:${v && v.startsWith('key:') ? kv(v.slice(4)) : v || kv(k)}`; }
    // H5 首页整页底色 = home_bg（Figma 317:55529 / 变量 ext/home_bg VariableID:2:65；Waydon 2026-11-27「首页背景色home_bg」）
    s += `;--o-home_bg:${resolveKey('home_bg', th, ec)}`;
    return s;
  }
  const M = (b) => X().E.D.m[b];
  // 公告栏图标（喇叭 / 消息）可替换或 AI 生成（Waydon 2026-11-26）；旧存档没有 items 时补上
  // 消息两张图：img = 已读（左，未登录预览显示）、imgOn = 未读（右，已登录预览显示，Figma 317:55690 主色渐变），旧存档补上默认图
  const ntItems = () => { const m = M('notice'); if (!m.items) m.items = defaults().notice.items; const ml = m.items.find((x) => x.k === 'mp/nt-i-mail'); if (ml && !ml.defOn) ml.defOn = CL + 'mail-on.png'; return m.items; };
  const ntM = () => ntNorm(M('notice'), X().E.D.ec);
  const set = (b, k, v) => { const x = X(); x.commit(() => { x.E.D.m[b][k] = v; }); };

  // ---------- 面板零件 ----------
  const seg = (opts, cur, act) => X().segBtns(opts, String(cur), act);
  const sec = (lab, body, v) => `<div class="p-sec"><div class="lab">${lab}${v != null ? `<span class="v">${v}</span>` : ''}</div>${body}</div>`;
  const note = (k, p) => `<div class="p-note">${t(k, p)}</div>`;
  // 列表标题右侧显示「显示中 / 总数」（壳层整理）
  const cnt = (b) => { const its = (M(b) && M(b).items) || []; return `${its.filter((x) => x.on).length} / ${its.length}`; };
  // 每个档位参数都带「自定义」输入（范围按参数）
  const PX_RNG = { margin: [0, 64], corner: [0, 60], per: [3, 6], size: [40, 80], gap: [0, 64], width: [40, 90], h: [80, 160], cols: [2, 5] };
  const px = (b, k, vals, labels) => { const u = labels.unit == null ? 'px' : labels.unit.trim(); const r = PX_RNG[k] || [0, 200]; return sec(labels.title, seg(vals.map((v, i) => ({ v: String(v), label: labels.opts ? labels.opts[i] : v + (labels.unit || ' px') })), M(b)[k], `mpSet_${b}_${k}`) + X().pxCustom(vals, M(b)[k], `mpSet_${b}_${k}`, [r[0], r[1], u]), M(b)[k] + (labels.unit || ' px')); };
  const toggle = (on, act, arg, label) => `<button class="tg-row" data-act="${act}" data-arg="${arg}"><span>${label}</span><span class="switch ${on ? 'is-on' : ''}"><i></i></span></button>`;
  function list(b, render) {
    const R = X().E.rn;
    return `<div class="mp-list" data-drag-list="${b}">${M(b).items.map((it, i) => `<div class="lrow ${it.on ? '' : 'is-hidden'} ${R && R.b === b && R.i === i ? 'is-editing' : ''}" data-row="${i}"><span class="grip" data-grip="${i}">${ic('dots-six-vertical', 'ic-16')}</span>${render ? render(it, i) : nameCell(b, i)}${it.req && M(b).mode === 'fixed' ? `${b === 'bottomnav' ? '' : `<span class="req">${t('mp/required')}</span>`}<span class="eye is-off" title="${esc(t('mp/bn-locked'))}" aria-label="${esc(t('mp/bn-locked'))}">${ic('lock-fill', 'ic-16')}</span>` : `<button class="eye" data-act="mpItem" data-arg="${b}|${i}">${ic(it.on ? 'eye-fill' : 'eye-slash-fill', 'ic-16')}</button>`}</div>`).join('')}</div>`;
  }
  // 入口名：点铅笔或双击名称改名（ED-19）
  function nameCell(b, i) {
    const it = M(b).items[i]; const R = X().E.rn;
    if (R && R.b === b && R.i === i) return `<span class="rn-wrap"><input class="input rn-in ${R.err ? 'is-err' : ''}" data-input="rnIn" data-key="rnKey" value="${esc(R.v)}" data-autofocus aria-label="${esc(t('mp/rename'))}">${R.err ? `<span class="rn-err">${t('mp/name-max')}</span>` : ''}</span>`;
    const lab = b === 'bottomnav' ? bnName(it) : nm(it); // 底部导航未登录「注册」单独存名称（nOut）
    return `<span class="nm" data-rn="${b}|${i}" title="${esc(lab)}">${esc(lab)}</span><button class="ib-s rn-btn" data-act="rnStart" data-arg="${b}|${i}" title="${esc(t('mp/rename'))}">${ic('pencil-simple', 'ic-16')}</button>`;
  }
  function asset(b, field, name, spec, thumb) {
    const slot = `mp-${b}-${field}`; const on = M(b)[field + 'On'] !== false;
    return `<div class="asset ${on ? '' : 'is-off'}"><div class="top">${thumb}<span style="min-width:0"><div class="nm">${name}</div><div class="sp">${spec}</div></span>${X().moreBtn(slot)}</div>
      <div class="acts"><div class="r2"><button class="btn btn-secondary btn-sm" data-act="amUpload" data-arg="${slot}">${ic('upload-simple', 'ic-16')}${t('ed/upload')}</button><button class="btn btn-outline btn-sm" data-act="openLib" data-arg="${slot}">${ic('stack-fill', 'ic-16')}${t('ed/library')}</button></div></div></div>${X().uploadUI(slot)}`;
  }
  const modeSeg = (b) => sec(t('mp/nav-mode'), seg([{ v: 'conf', label: t('mp/mode-conf') }, { v: 'fixed', label: t('mp/mode-fixed') }], M(b).mode, `mpSet_${b}_mode`) + `<div class="p-note">${t(M(b).mode === 'conf' ? 'mp/mode-conf-help' : 'mp/mode-fixed-help')}</div>`);
  // 入口图标：每行末尾 ✦ = 统一 AI 面板（只这一个 / 整套），工具条 ✦ AI 默认整套；这里只留批量上传（Figma G3-01：「用 AI 生成一套图标」大按钮删除）
  const iconBtns = (b) => `<div class="r2" style="margin-top:10px"><button class="btn btn-secondary btn-sm" data-act="bxOpen" data-arg="${b}">${ic('upload-simple', 'ic-16')}${t('mp/upload-icons')}</button></div>`;
  const aiBtn = (arg, tip = 'aig/entry-tip') => `<button class="ib-s tb-ai" data-act="aigOpen" data-arg="${arg}" data-stop title="${esc(t(tip))}" aria-label="${esc(t(tip))}">${ic('sparkle-fill', 'ic-16')}</button>`;
  const icAi = (b, i) => aiBtn(b + '|icons|' + i, b === 'gamemenu' ? 'aig/entry-tip-ic' : b === 'bottomnav' || b === 'sidebar' ? 'aig/entry-tip-ent' : 'aig/entry-tip');
  // 入口图标可上传替换（缩略图右下角上传角标；画布上点图标也能替换）
  const img = (src) => `<img class="cu" src="${src}" alt="">`;
  const defSrc = (it, f, b) => (f === 'imgOn' ? it.defOn || (b === 'gamemenu' ? it.img || it.def : null) : it.def) || null; // 游戏菜单没有选中图时用未选中图
  const upThumb = (b, i, f, icon, cls = '', title = '') => { const it0 = M(b).items[i]; const src = it0[f] || defSrc(it0, f, b); return `<button class="thumb sq up ${cls} ${src ? 'is-cu' : ''}" data-act="mpIcon" data-arg="${b}|${i}|${f}" title="${esc((title ? title + ' · ' : '') + t('mp/icon-replace'))}">${src ? img(src) : ic(icon)}<span class="ub">${ic('upload-simple')}</span></button>`; };
  const resetBtn = (b, i) => { const it = M(b).items[i]; return it.img || it.imgOn ? `<button class="ib-s" data-act="mpIconReset" data-arg="${b}|${i}" title="${esc(t('mp/icon-reset'))}">${ic('arrow-counter-clockwise', 'ic-16')}</button>` : ''; };

  // ---------- 色值胶囊（Waydon 11-27 09:20「颜色看不出也复制不了 hex」→ 09:30 选方案 A；Figma G6/HexChip 460:31190） ----------
  // hexOf：#rgb / #rgba / #rrggbb / #rrggbbaa / rgb() / rgba() → { hex: '#RRGGBB', a: null | 0–100（透明度 %）, css: 带透明度的 8 位色值 }
  function hexOf(col) {
    const s = String(col || '').trim(); let m = /^#?([0-9a-f]{3,8})$/i.exec(s), r, g, b, a = null;
    if (m) {
      let h = m[1]; if (h.length === 3 || h.length === 4) h = h.replace(/./g, (c) => c + c); if (h.length !== 6 && h.length !== 8) return null;
      [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); if (h.length === 8) a = parseInt(h.slice(6), 16) / 255;
    } else if ((m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(s))) {
      [r, g, b] = [+m[1], +m[2], +m[3]]; if (m[4] != null) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    } else return null;
    const x = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    const hex = ('#' + x(r) + x(g) + x(b)).toUpperCase(), pct = a == null || a >= 0.995 ? null : Math.round(a * 100);
    return { hex, a: pct, css: pct == null ? hex : hex + x(a * 255).toUpperCase() };
  }
  // 当前生效的颜色：v = 业主的覆盖值（'key:<名>' / 十六进制 / 空），key = 默认 Key，kv = Key → 色值
  const curCol = (v, key, kv) => (v ? (v.startsWith('key:') ? kv(v.slice(4)) : v) : key ? kv(key) : null);
  // Key → 色值（默认值也可以直接是 Figma 写死的色值，如游戏菜单投影 #729FFF26）
  const kvOf = (th, ec) => (k) => (k[0] === '#' ? k : th[k] != null ? th[k] : resolveKey(k, th, ec));
  // 胶囊上写什么就复制什么：大写 6 位 #RRGGBB；有透明度的另外灰字显示「40%」，复制仍是 6 位。live = 取色中那一行（取色器拖动时实时改）
  const hexChip = (col, live) => {
    const h = hexOf(col); if (!h) return '';
    const tip = t('ed/hex-copy', { hex: h.hex + (h.a != null ? ` · ${h.a}%` : '') });
    return `<button type="button" class="hex-chip ${h.a != null ? 'has-a' : ''}" data-act="copyHex" data-arg="${h.hex}${h.a != null ? '|' + h.a : ''}" title="${esc(tip)}" aria-label="${esc(tip)}"${live ? ' data-pk-chip' : ''}><i class="hc-dot" style="--c:${h.css}"></i><span class="hc-hex">${h.hex}</span>${h.a != null ? `<span class="hc-a">${h.a}%</span>` : ''}${ic('copy', 'hc-ic hc-cp')}${ic('check', 'hc-ic hc-ok')}</button>`;
  };
  // 隐形占位（68 Key 行按钮里）：跟胶囊同样内容 → 同样宽高，真胶囊绝对定位盖在它上面
  const hexGhost = (col) => { const h = hexOf(col); return h ? `<span class="hex-chip hc-ghost ${h.a != null ? 'has-a' : ''}" aria-hidden="true"><i class="hc-dot"></i><span class="hc-hex">${h.hex}</span>${h.a != null ? `<span class="hc-a">${h.a}%</span>` : ''}${ic('copy', 'hc-ic hc-cp')}</span>` : ''; };
  // 色块提示：「Key 名 · #HEX」（没选的色块也看得到色值）
  const swTip = (lab, col) => { const h = hexOf(col); return h ? `${lab} · ${h.hex}${h.a != null ? ` ${h.a}%` : ''}` : lab; };
  // 颜色行（Figma G6/ColorRow 424:548184）：标题行 = 名称（太长先截名称）+ 右侧色值胶囊；下面一行色块（swRow）；after = 展开的取色器
  // o 同 swRow，另加 col = 当前生效颜色（liveTheme 里取，取色中 = 实时值；默认是图片、没有颜色时不给，不显示胶囊）
  // is-live = 取色中、色值已经改了（画布在实时预览）：这一行显示成「自定义」（彩虹带圈），还没改时照常显示这一行现在的 Key（Figma 第 1 / 2 步）
  const colorRow = (lab, o, after = '') => `<div class="crow ${o.pk ? 'is-pk' : ''} ${o.pk && X().pkLive && X().pkLive() ? 'is-live' : ''}"><div class="k"><span class="ellipsis">${lab}</span>${o.col ? hexChip(o.col, o.pk) : ''}</div>${swRow(o)}${after}</div>`;
  // 跟 Key 走、不单独设置的颜色行：标题行胶囊显示被跟随的 Key 的色值；点「去改」打开整页配色
  const linkRow = (lab, key, col) => `<div class="crow tb-link"><div class="k"><span class="ellipsis">${lab}</span>${hexChip(col)}</div><div class="tb-link-r"><span class="sw-dot" style="background:${col}"></span><span class="ellipsis">${t('ed/tb-c-follow')}</span>${keyTag(null, key)}<button class="tb-goto" data-act="openKeys">${t('ed/tb-c-goto')}</button></div></div>`;
  // 复制色值：先 navigator.clipboard，不行再用隐藏 textarea + execCommand；都失败提示长按手动复制（色值可整段选取）。
  // 不改设计、不记撤销；arg = '#RRGGBB[|透明度]'，'picker' = 取色器当前值
  function copyText(s) {
    const legacy = () => { try { const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, s.length); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; } };
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(s).then(() => true, () => legacy()); } catch (e) { /* 走旧方法 */ }
    return Promise.resolve(legacy());
  }
  A.copyHex = (arg, el) => {
    let hex, a = null;
    if (arg === 'picker') { const p = X().E.picker, h = p && hexOf(p.value); if (!h) return false; hex = h.hex; } else { const [h0, a0] = String(arg || '').split('|'); const h = hexOf(h0); if (!h) return false; hex = h.hex; a = a0 ? +a0 : null; }
    copyText(hex).then((ok) => {
      if (!ok) { if (el) el.classList.add('is-sel'); window.toast(t('ed/hex-copy-fail'), { info: true }); return; }
      if (el) { el.classList.add('is-copied'); clearTimeout(el.__hcT); el.__hcT = setTimeout(() => el.classList.remove('is-copied'), 1200); }
      window.toast(t(a != null ? 'ed/hex-copied-a' : 'ed/hex-copied', { hex, a }), { ms: 1600 });
    });
    return window.__prevMenu ? undefined : false; // 只复制：不重渲染（开着菜单时分发已把菜单关掉，才需要重渲染一次）
  };
  // 色块行右侧的 Key 标签（同文字样式 .tx-key，Waydon 2026-11-27）：默认 = 绑定的 Key，选了色块 = 那个 Key，自定义色 = 「自定义」
  // defLab：默认值不是颜色（游戏菜单侧边样式的底色默认是按钮图）时，没覆盖就显示这个文字
  const keyTag = (v, key, defLab) => {
    if (!v && defLab) return `<span class="tx-key is-custom" title="${esc(defLab)}">${esc(defLab)}</span>`;
    const kn = v ? (v.startsWith('key:') ? v.slice(4) : null) : key || null; // 默认值是 Figma 写死的色值（如游戏菜单投影）时直接显示色值
    return `<span class="tx-key ${kn ? '' : 'is-custom'}" title="${esc(kn ? keyLabel(kn) : t('tx/c-custom'))}">${kn ? esc(kn) : t('tx/key-custom')}</span>`;
  };
  // 颜色行色块（Figma G6/ColorRow 424:548184；Waydon 11-27「默认选中默认的颜色，不是默认按钮」）：
  // [默认色块][其它色块][彩虹 = 自定义][Key 标签]。第一个色块 = 这一行绑定的默认 Key 的颜色，没有覆盖时选中；
  // 点别的色块选中圈移过去，再点回第一个 = 恢复默认（去掉覆盖）。其它色块里和默认 Key 相同的不重复列。
  // o = { act, id, v, key, sws, kv, pk, pickAct, pickArg, rainbow, tag, defCss, defTip, defLab }
  //   act/id：点色块 data-act / data-arg 前缀（data-arg = id|key:<名>，默认色块 = id|）
  //   rainbow：自带的彩虹（余额框用 <input type=color>），不给就用 pickAct / pickArg 的按钮
  //   defCss / defTip / defLab：默认值不是 Key 颜色（游戏菜单按钮图）时色块里那张图的样式（滤镜只加在图上，不染选中圈）、提示和 Key 标签文字
  // 正在用彩虹取色：取色器刚打开、色值还没改时照常显示（第一个色块 / 当前 Key 带圈，Key 标签 = 现在的 Key，Figma 04-11-28 第 1 / 2 步）；
  // 色值改了（画布已实时预览，.crow.is-live）同「自定义」：只有彩虹带圈，Key 标签写「自定义」。两种样子都先画好，拖色盘时 editor.js livePicker 只切 is-live，不用整页重画
  // 色块提示 = 「Key 名 · #HEX」；选了自定义色时彩虹中间填上那个颜色（.has-val，外圈留细彩虹看得出是自定义）
  // 取色器切 Key 范围（11-28，Figma 04-11-28 65966:104739 第 3 / 5b 步）：行在取色器 Key 菜单里改跟另一个 Key（E.D.ecf[行] = Key 名，值仍存 'key:<名>'）
  // → 第一个色块显示那个 Key 的颜色并带选中圈，其它色块不带圈，Key 标签换成 G6/FollowTag「跟随 <key>」（淡蓝底蓝字）。
  // 取色中刚切了 Key（E.picker.follow）同样显示，第一个色块 = 实时颜色。色块点了 / 自定义色 / 恢复默认都会去掉跟随
  const followOf = (o) => {
    const r = o.act === 'bnColor' ? o.id : o.act === 'tbColor' ? 'tb:' + o.id : null; if (!r) return null;
    const x = X(); if (o.pk) return (x.E.picker && x.E.picker.follow) || null;
    const f = (x.E.D.ecf || {})[r]; return f && o.v === 'key:' + f ? f : null;
  };
  const followTag = (k) => { const s = t('ed/keyscope/tag', { key: k }); return `<span class="tx-key is-follow" title="${esc(s + ' · ' + keyLabel(k))}">${esc(s)}</span>`; };
  const swRow = (o) => {
    const fk = followOf(o);
    const v = o.v || null, img = !!o.defCss, onDef = !fk && (!v || (!img && v === 'key:' + o.key));
    const liveTag = o.pk && !fk ? `<span class="tx-key is-custom pk-live-tag" title="${esc(t('tx/c-custom'))}">${t('tx/key-custom')}</span>` : '';
    const sws = (img ? o.sws : o.sws.filter((k) => k !== o.key));
    const defTip = o.defTip || swTip(o.key[0] === '#' ? t('mp/c-default') : `${t('mp/c-default')} · ${keyLabel(o.key)}`, o.kv(o.key));
    const btn = (on, style, tip, arg, cls = '', inner = '') => `<button class="sw-btn ${cls} ${on ? 'is-on' : ''}" style="${style}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${on}" data-act="${o.act}" data-arg="${o.id}|${arg}">${inner}</button>`;
    const cu = !fk && v && !v.startsWith('key:') ? hexOf(v) : null, rbTip = cu ? `${t('tx/c-custom')} · ${cu.hex}` : t('tx/c-custom');
    const rb = o.rainbow || `<button class="rainbow ${cu ? 'is-on' : ''} ${cu ? 'has-val' : ''}" ${cu ? `style="--c:${cu.css}"` : ''} data-act="${o.pickAct || 'bnPick'}" data-arg="${o.pickArg}" title="${esc(rbTip)}" aria-label="${esc(rbTip)}"></button>`;
    const fc = fk ? (o.pk ? X().E.picker.value : o.kv(fk)) : null;
    const first = fk ? btn(true, `background:${fc}`, swTip(`${t('ed/keyscope/tag', { key: fk })} · ${keyLabel(fk)}`, fc), 'key:' + fk, 'sw-def')
      : img ? btn(onDef, '', defTip, '', 'sw-def sw-img', `<i style="${o.defCss}"></i>`) : btn(onDef, `background:${o.kv(o.key)}`, defTip, '', 'sw-def');
    return `<div class="tx-colors cr-sw">${first}${sws.map((k) => btn(!fk && v === 'key:' + k, `background:${o.kv(k)}`, swTip(keyLabel(k), o.kv(k)), 'key:' + k)).join('')}${rb}${fk ? followTag(fk) : keyTag(onDef && !img ? null : v, o.tag || o.key, o.defLab)}${liveTag}</div>`;
  };
  function colors(b) {
    const x = X(); const { th, ec } = x.liveTheme(); const P = x.E.picker;
    return EL[b].map(([id, k]) => {
      // 同其它模块的颜色行：第一个色块 = 绑定的 Key（默认选中），色块存 'key:<名>'，彩虹 = 自定义，右侧 Key 标签
      const v = x.E.D.ec[id] || null, lab = t('mp/c-' + id.replace('.', '-')), pk = P && P.elRow === id, kv = kvOf(th, ec);
      return colorRow(lab, { act: 'bnColor', id, v, key: k, sws: ALT.filter((a) => a !== k).slice(0, 4), kv, pk, pickArg: `${id}|${k}`, col: curCol(ec[id], k, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    }).join('');
  }

  // ---------- 各模块面板 ----------
  const P = {
    jackpot: {
      content: () => sec(t('mp/jp-title'), `<input class="input" data-input="mpJpTitle" value="${esc(M('jackpot').title)}" maxlength="12">`)
        + sec(t('mp/jp-amount'), seg([{ v: 'roll', label: t('mp/jp-roll') }, { v: 'static', label: t('mp/jp-static') }], M('jackpot').anim, 'mpSet_jackpot_anim'))
        + sec(t('mp/jp-bg'), asset('jackpot', 'bg', t('mp/jp-bg'), t('mp/jp-bg-spec'), `<span class="thumb" style="background:${M('jackpot').bg ? 'linear-gradient(135deg,#f6c445,#c9963b)' : 'var(--e-jackpot-bg, #1678ff)'};filter:${M('jackpot').bg || 'none'}"></span>`)),
      layout: () => sec(t('mp/style-jackpot'), seg([{ v: 'flow', label: t('mp/lay-flow') }, { v: 'compact', label: t('mp/lay-compact') }], M('jackpot').layout, 'mpSet_jackpot_layout'))
        + px('jackpot', 'margin', [8, 16, 24], { title: t('ed/margin') }) + px('jackpot', 'corner', [0, 16, 32], { title: t('ed/corner') }),
    },
    notice: {
      // 顺序（Waydon 2026-11-27 第 1 条，Figma 440:635497 NT-01）：图标（置顶）→ 公告内容（富文本）→ 文字样式（整段默认 / 消息气泡）
      content: () => {
        const m = ntM(), its = ntItems(), x = X(), badge = m.badge !== false;
        const sp = (i) => specOf('notice', i).join('×');
        const spk = `<div class="nt-card"><div class="nt-ic-row">${upThumb('notice', 0, 'img', its[0].i)}<span class="tx"><b>${esc(nm(its[0]))}</b><small>${sp(0)}</small></span>${resetBtn('notice', 0)}${icAi('notice', 0)}</div></div>`;
        // 消息卡片（第 2–4 条）：开关「显示消息入口」→ 消息行（左 已读 = img、右 未读 = imgOn，各带 12 号说明）→ 开关「显示消息气泡」+ 说明；
        // 关掉消息入口：卡片只剩开关，下方说明 mp/nt-mail-off（气泡一起隐藏）
        const slot = (f, k) => `<span class="nt-slot">${upThumb('notice', 1, f, its[1].i, 'st2', t(k))}<small>${t(k)}</small></span>`;
        const mailRow = `<div class="nt-ic-row nt-mail-row">${slot('img', 'mp/nt-st-read')}${slot('imgOn', 'mp/nt-st-unread')}<span class="tx"><b>${esc(nm(its[1]))}</b><small>${sp(1)} · ${t('mp/nt-two')}</small></span>${resetBtn('notice', 1)}${icAi('notice', 1)}</div>`;
        const mail = `<div class="nt-card">${toggle(m.mail, 'mpFlag', 'notice|mail', t('mp/nt-mail'))}${m.mail ? `<i class="nt-hr"></i>${mailRow}<i class="nt-hr"></i><div class="nt-badge">${toggle(badge, 'mpFlag', 'notice|badge', t('mp/nt-badge'))}<div class="nt-tg-note">${t(badge ? 'mp/nt-badge-note' : 'mp/nt-badge-off')}</div></div>` : ''}</div>${m.mail ? '' : note('mp/nt-mail-off')}`;
        return sec(t('mp/nt-icons'), `<div class="nt-cards">${spk}${mail}</div>`) + ntTextSec(m) + (x.txtSec ? x.txtSec('notice') : '');
      },
      layout: () => sec(t('mp/nt-speed'), seg(['slow', 'normal', 'fast'].map((v) => ({ v, label: t('mp/nt-' + v) })), M('notice').speed, 'mpSet_notice_speed')) + note('mp/nt-speed-note') + note('mp/nt-size'),
      color: () => ntColor(),
    },
    midnav: {
      // 顺序（2026-11-26 整理）：登录态 → 入口（图标上传 / AI）→ 入口角标 → 帐户区（登录注册 / 余额框）→ 文字样式 → 入口模式（后台概念，放最后）
      content: () => {
        const x = X(), D = x.E.D, m = M('midnav'), acct = m.layout === 'account';
        const state = sec(t('ed/tb-state2'), seg([{ v: 'out', label: t('ed/signed-out') }, { v: 'in', label: t('ed/signed-in') }], D.login ? 'in' : 'out', 'setLogin') + note(D.login ? 'mp/mn-note-in' : 'mp/mn-note-out'));
        const ents = sec(t('mp/entries'), list('midnav', (it, i) => `${upThumb('midnav', i, 'img', it.i || 'plus')}${nameCell('midnav', i)}${resetBtn('midnav', i)}${icAi('midnav', i)}`) + note('mp/mn-icon-spec', { s: specOf('midnav').join('×') }) + iconBtns('midnav'), cnt('midnav'));
        const bds = sec(t('mp/mn-badges'), `<div class="mn-bds">${m.items.map((it, i) => `<label class="mn-bd ${it.on ? '' : 'is-hidden'}"><span class="ellipsis">${esc(nm(it))}</span><input class="input" data-input="mpMidBadge" data-i="${i}" value="${esc(it.badge || '')}" maxlength="9" placeholder="${esc(t('mp/mn-badge-ph'))}"></label>`).join('')}</div>` + note('mp/mn-badge-note'));
        const area = !acct ? sec(t('mp/mn-acct'), note('mp/mn-acct-row') + `<button class="btn btn-secondary btn-sm" data-act="mpSet_midnav_layout" data-arg="account">${t('mp/mn-acct-on')}</button>`)
          : D.login ? (x.balSec ? x.balSec(true) : '') : sec(t('mp/mn-acct'), note('mp/mn-btn-note'));
        return state + ents + bds + area + (x.txtSec ? x.txtSec('midnav') : '') + modeSeg('midnav');
      },
      // 每行个数只在「单行」样式生效（带账户区时入口全部排在右侧一行）；图标大小 = 图标宽度（750 稿，Figma 57）
      layout: () => {
        const m = M('midnav');
        return sec(t('mp/style-midnav'), seg([{ v: 'row', label: t('mp/mid-row') }, { v: 'account', label: t('mp/mid-account') }], m.layout, 'mpSet_midnav_layout'))
          + (m.layout === 'row' ? px('midnav', 'per', [4, 5], { title: t('mp/per-row'), unit: '' }) : note('mp/mn-per-acct'))
          + px('midnav', 'size', [48, 57, 68], { title: t('mp/mn-icon-w') });
      },
      color: () => mnColor(),
    },
    // 游戏菜单与游戏卡片（11-28，Figma「04-11-28 游戏卡片 · 6 样式」65976:10，Waydon 已确认）：两个模块合成一个面板，
    // 画布或左栏选中任一个都打开它（标题「游戏菜单与游戏卡片」），页签 内容 / 布局 / 颜色；手机底部弹层同样三个页签
    gamemenu: { content: () => gamesContent(), layout: () => gamesLayout(), color: () => gamesColor() },
    gamecards: { content: () => gamesContent(), layout: () => gamesLayout(), color: () => gamesColor() },
    footer: {
      content: () => sec(t('mp/ft-links'), list('footer')) + sec(t('mp/ft-copy'), `<input class="input" data-input="mpFtCopy" value="${esc(M('footer').copy)}" maxlength="40">`),
      layout: () => sec(t('mp/align'), seg([{ v: 'center', label: t('mp/align-center') }, { v: 'left', label: t('mp/align-left') }], M('footer').align, 'mpSet_footer_align')) + note('mp/ft-one'),
    },
    sidebar: {
      content: () => {
        const D = X().E.D;
        return sec(t('mp/sd-head'), asset('sidebar', 'head', t('mp/sd-head'), t('mp/sd-head-spec'), `<span class="thumb" style="filter:${M('sidebar').head || 'none'}"></span>`))
          + sec(t('mp/entries'), list('sidebar', (it, i) => `${upThumb('sidebar', i, 'img', it.i)}${nameCell('sidebar', i)}${resetBtn('sidebar', i)}${icAi('sidebar', i)}`) + `<div class="p-note">${ic('frame-corners', 'ic-16')}${t('mp/sd-icon-spec')}</div>`, cnt('sidebar'));
      },
      layout: () => sec(t('ed/side-pos'), seg([{ v: 'left', label: t('ed/side-left') }, { v: 'right', label: t('ed/side-right') }], X().E.D.side, 'setSide'))
        + sec(t('mp/style-sidebar'), seg([{ v: 'list', label: t('mp/sd-list') }, { v: 'grid', label: t('mp/sd-grid') }], M('sidebar').style, 'mpSet_sidebar_style'))
        + px('sidebar', 'width', [62, 75], { title: t('mp/width'), unit: '%' }),
    },
    bottomnav: {
      // 顺序（2026-11-26 整理）：登录态（未登录「优惠」「注册」图和名称不同）→ 入口（未选中 / 选中图标：上传 · AI · 恢复）→ 文字样式；
      // 去掉「入口模式」：底部导航固定 5 个入口，首页 / 我的必交（锁），其它可隐藏
      content: () => {
        const x = X(), login = !!x.E.D.login;
        const state = sec(t('ed/tb-state2'), seg([{ v: 'out', label: t('ed/signed-out') }, { v: 'in', label: t('ed/signed-in') }], login ? 'in' : 'out', 'setLogin') + note(login ? 'mp/bn-note-in' : 'mp/bn-note-out'));
        const hd = `<div class="gm-hd bn-hd"><span class="c1" title="${esc(t('mp/state-def'))}">${t('mp/gm-h-off')}</span><span class="c1" title="${esc(t('mp/state-act'))}">${t('mp/gm-h-on')}</span><span class="c2">${t('mp/gm-h-name')}</span></div>`;
        const rows = list('bottomnav', (it, i) => `${bnThumb(i, bnOffF(it, login))}${bnThumb(i, 'imgOn')}${nameCell('bottomnav', i)}${icAi('bottomnav', i)}`);
        const r = M('bottomnav').style === 'raised';
        // 画布预览哪个入口是选中态：面板里直接点选（手机上导航文字小、紧挨图标，不好点）
        const ai = bnAct(), pv = `<div class="p-sec"><div class="lab">${t('mp/bn-pv')}</div><div class="bn-pv">${vis('bottomnav').map((it) => { const i = M('bottomnav').items.indexOf(it); return `<button class="chip ${i === ai ? 'is-on' : ''}" data-act="bnAct" data-arg="${i}">${esc(bnName(it, login))}</button>`; }).join('')}</div></div>`;
        const spec = `<div class="p-note">${ic('frame-corners', 'ic-16')}${t(r ? 'mp/bn-spec-r' : 'mp/bn-spec')}${login ? '' : ' · ' + t('mp/bn-spec-out')}</div>`;
        return state + sec(t('mp/entries'), hd + rows + spec + note('mp/bn-hint') + iconBtns('bottomnav'), cnt('bottomnav')) + pv + (x.txtSec ? x.txtSec('bottomnav') : '');
      },
      layout: () => sec(t('mp/style-bottomnav'), seg([{ v: 'regular', label: t('mp/bn-regular') }, { v: 'raised', label: t('mp/bn-raised') }], M('bottomnav').style, 'mpSet_bottomnav_style') + note(M('bottomnav').style === 'raised' ? 'mp/bn-raised-note' : 'mp/bn-regular-note'))
        + px('bottomnav', 'h', [98, 120, 140], { title: t('mp/height') }),
      color: () => bnColor(),
    },
  };
  // 公告栏颜色：同 Banner 的做法，色块存 'key:<名>' 引用 68 Key（换整页配色跟着变），「默认」= Figma 绑定的 Key，彩虹 = 自定义
  const NT_SW = { 'notice.bg': ['bg_1', 'border', 'primary', 'lead'], 'notice.icon': ['neutral_1', 'lead', 'neutral_2', 'primary'], 'notice.text': ['neutral_1', 'lead', 'neutral_2', 'primary'], 'notice.badge': ['accent_2', 'accent_3', 'primary', 'lead'] };
  function ntColor() {
    const x = X(), E = x.E, { th, ec } = x.liveTheme(), D = E.D, m = ntM(), its = ntItems();
    const kv = kvOf(th, ec);
    const row = (id) => {
      const key = EL.notice.find((r) => r[0] === id)[1], v = D.ec[id] || null, lab = t('mp/c-' + id.replace('.', '-')), pk = E.picker && E.picker.elRow === id;
      return colorRow(lab, { act: 'bnColor', id, v, key, sws: NT_SW[id], kv, pk, pickArg: `${id}|${key}`, col: curCol(ec[id], key, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    };
    // 消息气泡底色（Figma 442:37665 ⑧）：消息入口开、气泡开、预览已登录才显示这一行，否则说明为什么改不了
    const spkUp = !!its[0].img, bd = !m.mail ? 'mp/nt-c-badge-nomail' : m.badge === false ? 'mp/nt-c-badge-off' : !D.login ? 'mp/nt-c-badge-out' : null;
    // 部分文字的颜色在「内容 › 公告内容」里选中文字改（11-27 富文本），颜色页签只留整段正文色
    return `<div class="p-sec">${row('notice.bg')}</div>
      <div class="p-sec"><div class="lab">${t('mp/nt-c-text')}</div>${row('notice.text')}${note('mp/nt-c-spans')}</div>
      <div class="p-sec"><div class="lab">${t('mp/nt-icons')}</div>${spkUp ? note('mp/nt-c-spk-up') : row('notice.icon')}${bd ? note(bd) : row('notice.badge')}</div>`;
  }
  // 帐户栏颜色：同公告栏做法（'key:<名>' 引用 68 Key）；余额框颜色（顶部栏共用）和固定跟 Key 的小图标也放这里
  const MN_SW = { 'midnav.bg': ['bg_1', 'bg_2', 'border', 'primary'], 'midnav.text': ['neutral_1', 'lead', 'neutral_2', 'primary'], 'midnav.user': ['lead', 'neutral_1', 'neutral_2', 'primary'], 'midnav.btn': ['primary', 'lead', 'accent_3', 'accent_1'], 'midnav.btnText': ['text_primary', 'bg_2', 'lead', 'primary'], 'midnav.icon': ['primary', 'lead', 'neutral_1', 'accent_3'] };
  const BD_SW = ['accent_2', 'accent_1', 'accent_3', 'primary'];
  const bdId = (it, i) => 'midnav.bd-' + (baseOf(it.def) || 'mid' + i);
  const bdKey = (it) => ({ mid2: 'accent_1' })[baseOf(it.def)] || 'accent_2'; // Figma：VIP 角标 accent_2、分享赚钱角标 accent_1
  function mnColor() {
    const x = X(), E = x.E, { th, ec } = x.liveTheme(), D = E.D, m = M('midnav'), acct = m.layout === 'account';
    const kv = kvOf(th, ec);
    const row = (id, key, sws, lab) => {
      const v = D.ec[id] || null, pk = E.picker && E.picker.elRow === id;
      return colorRow(lab, { act: 'bnColor', id, v, key, sws, kv, pk, pickArg: `${id}|${key}`, col: curCol(ec[id], key, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    };
    const elRow = (id) => row(id, EL.midnav.find((r) => r[0] === id)[1], MN_SW[id], t('mp/c-' + id.replace('.', '-')));
    // 跟 Key 走、不单独设置的颜色：点「去改」打开整页配色
    const link = (lab, key) => linkRow(lab, key, kv(key));
    const toIn = `<button class="warn-link" data-act="setLogin" data-arg="in">${t('ed/signed-in')}</button>`;
    const vis0 = m.items.filter((it) => it.on), fallback = vis0.some((it) => !it.img && !it.def);
    const bdItems = vis0.filter((it) => it.badge);
    const cfg = x.balCfg ? x.balCfg() : {};
    let h = `<div class="p-sec">${elRow('midnav.bg')}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/mn-c-text')}</div>${elRow('midnav.text')}${acct && D.login ? elRow('midnav.user') : ''}</div>`;
    if (acct && !D.login) h += `<div class="p-sec"><div class="lab">${t('mp/mn-c-btns')}</div>${elRow('midnav.btn')}${elRow('midnav.btnText')}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/mn-badges')}</div>${D.login ? (bdItems.length ? bdItems.map((it) => { const i = m.items.indexOf(it); return row(bdId(it, i), bdKey(it), BD_SW, t('mp/mn-c-bd', { n: esc(nm(it)) })); }).join('') : note('mp/mn-c-bd-none')) : `<div class="p-note">${t('mp/mn-c-out')} ${toIn}</div>`}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/entries')}</div>${fallback ? elRow('midnav.icon') : ''}${note('mp/mn-c-icons')}</div>`;
    if (acct && D.login) {
      h += `<div class="p-sec bx-sec"><div class="lab">${t('ed/bal-title')}</div>${x.balColorRows ? x.balColorRows() : ''}
        ${cfg.caretImg ? '' : link(t('ed/bal-i-caret'), 'neutral_2')}${cfg.act !== 'none' && !cfg[cfg.act === 'copy' ? 'copyImg' : 'swImg'] ? link(t('ed/bal-act-' + cfg.act), 'primary') : ''}${cfg.mode === 'switch' && !cfg.curImg ? link(t('ed/bal-i-cur'), 'accent_3') : ''}</div>`;
    } else if (acct) h += `<div class="p-note">${t('mp/mn-c-bal-out')} ${toIn}</div>`;
    return h;
  }
  // ---------- 游戏菜单：选中分类、按钮底图、颜色 ----------
  // 选中的分类：m.active（下标）；它被隐藏了就退回第一个显示的分类
  const gmAct = () => { const m = M('gamemenu'), its = m.items, a = its[m.active | 0]; return a && a.on ? m.active | 0 : its.findIndex((x) => x.on); };
  A.mpGmActive = (i) => { const x = X(), m = M('gamemenu'); if (!m.items[+i] || !m.items[+i].on || gmAct() === +i) return false; x.commit(() => { x.E.D.m.gamemenu.active = +i; }); };
  // 按钮底图：业主上传 / AI 的图（'img:' 开头或滤镜模拟值）> 效果图默认底图；颜色页签选了底色就换纯色（不删图，点「按钮图」回来）
  const GM_BTN = { btnOff: 'assets/cl-catbtn.png', btnSel: 'assets/cl-catbtn-on.png' };
  const GM_BTN_EC = { btnOff: 'gamemenu.bg', btnSel: 'gamemenu.active' };
  const GM_BTN_EC_R = { 'gamemenu.bg': 'btnOff', 'gamemenu.active': 'btnSel' };
  const gmBtnCss = (f) => window.fxStyle(M('gamemenu')[f] || 'none', GM_BTN[f]);
  // AI 生成按钮底图（原型：按款式画两张 SVG，未选中 + 选中一套；正式版按提示词出图）
  const GMB_ST = ['glossy', 'flat', 'blackgold', 'festive', 'neon'];
  function gmBtnSvg(st, on, pc) {
    const P = {
      glossy: on ? [lighten(pc, 0.3), pc, '#ffffff66'] : ['#ffffff', '#eef4ff', '#ffffff'],
      flat: on ? [pc, pc, null] : ['#f5f7fa', '#f5f7fa', '#e3e8f0'],
      blackgold: on ? ['#f6dc96', '#b8892f', '#fff3c4'] : ['#3a3a3a', '#1c1c1c', '#c9a55a'],
      festive: on ? ['#ff6a50', '#d81e1e', '#ffd37a'] : ['#fff8ea', '#ffeccc', '#f2b55a'],
      neon: on ? ['#a27bff', '#5a2dff', '#e0d0ff'] : ['#241c4f', '#16112f', '#8a5cff'],
    }[st];
    const [c1, c2, line] = P;
    const hl = st === 'glossy' || st === 'blackgold' ? `<path d="M6 4h138a4 4 0 0 1 4 4v14Q75 34 2 22V8a4 4 0 0 1 4-4z" fill="#fff" fill-opacity="${on ? 0.22 : 0.6}"/>` : '';
    const glow = st === 'neon' ? `<rect x="2.5" y="2.5" width="145" height="65" rx="11" fill="none" stroke="${line}" stroke-opacity=".45" stroke-width="5"/>` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 70" width="300" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect x="1" y="1" width="148" height="68" rx="12" fill="url(#g)"/>${hl}${glow}${line ? `<rect x="1.5" y="1.5" width="147" height="67" rx="11.5" fill="none" stroke="${line}" stroke-width="${st === 'festive' || st === 'blackgold' ? 2 : 1}"/>` : ''}</svg>`;
    return 'img:data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29'); // 括号也转义，放进 CSS url() 才不会断
  }
  // 按钮底图两行：缩略图（点一下上传）· 名称 / 规格 · ✦ AI · 恢复 · ⋯
  function gmBtnSec() {
    const x = X(), m = M('gamemenu'), ec = x.E.D.ec || {};
    const row = (f) => {
      const slot = 'mp-gamemenu-' + f, own = !!m[f], col = !!ec[GM_BTN_EC[f]];
      const sub = col ? t('mp/gm-btn-col') : own ? t('ed/tb-own') : t('mp/gm-btn-def');
      return `<div class="tb-item"><button class="thumb gm-bthumb" data-act="amUpload" data-arg="${slot}" title="${esc(t('ed/am-upload'))}" aria-label="${esc(t('ed/am-upload'))}"><i style="${gmBtnCss(f)}"></i></button><span class="tx"><b class="ellipsis">${t(f === 'btnOff' ? 'mp/gm-btn-off' : 'mp/gm-btn-on')}</b><small class="ellipsis">150×70 · ${sub}</small></span>${aiBtn('gamemenu|btn')}${own ? `<button class="ib-s" data-act="amReset" data-arg="${slot}" title="${esc(t('ed/am-reset'))}" aria-label="${esc(t('ed/am-reset'))}">${ic('arrow-counter-clockwise', 'ic-16')}</button>` : ''}${x.moreBtn(slot)}</div>`;
    };
    const anyCol = ec['gamemenu.bg'] || ec['gamemenu.active'];
    return `<div class="p-sec"><div class="lab">${t('mp/gm-btn')}${m.btnOff || m.btnSel ? `<span class="tbai-hd"><button class="tx-reset" data-act="gmBtnReset">${ic('arrow-counter-clockwise', 'ic-16')}${t('tx/reset')}</button></span>` : ''}</div><div class="tb-group">${row('btnOff')}${row('btnSel')}</div>${x.uploadUI('mp-gamemenu-btnOff')}${x.uploadUI('mp-gamemenu-btnSel')}
      <div class="p-note">${t(anyCol ? 'mp/gm-btn-colnote' : 'mp/gm-btn-note')}</div></div>`;
  }
  const GM_SW = { 'gamemenu.bg': ['bg_2', 'bg_1', 'border', 'primary'], 'gamemenu.active': ['primary', 'accent_3', 'accent_1', 'lead'], 'gamemenu.text': ['leftnav_def', 'neutral_1', 'lead', 'primary'], 'gamemenu.activeText': ['leftnav_active', 'bg_2', 'lead', 'primary'], 'gamemenu.shadow': ['web_left_bg_shadow'], 'gamemenu.icon': ['icon_tg_z', 'neutral_2', 'lead', 'primary'], 'gamemenu.tabActive': ['primary', 'accent_3', 'accent_1', 'lead'] };
  function gmColor() {
    const x = X(), E = x.E, { th, ec } = x.liveTheme(), D = E.D, m = M('gamemenu'), side = m.style === 'side';
    const kv = kvOf(th, ec);
    // 第一个色块 = 默认：底色两行（侧边样式）默认是按钮图，色块显示按钮图、Key 标签写「按钮图」，Key 色块单独列在后面；其它是 Figma 绑定的 Key
    const row = (id, imgF, labK) => {
      const key = EL.gamemenu.find((r) => r[0] === id)[1], v = D.ec[id] || null, lab = t(labK || 'mp/c-' + id.replace('.', '-')), pk = E.picker && E.picker.elRow === id;
      const sws = GM_SW[id].filter((k) => k !== key);
      if (imgF) sws.unshift(key); // 底色行：默认 = 图，Key 色块单独列出
      const img = imgF ? { defCss: gmBtnCss(imgF), defTip: `${t('mp/c-default')} · ${t('mp/gm-c-img-tip')}`, defLab: t('mp/gm-c-img') } : {};
      // 底色行没覆盖时生效的是按钮图（不是颜色），不显示色值胶囊
      return colorRow(lab, { act: 'bnColor', id, v, key, sws, kv, pk, pickArg: `${id}|${key[0] === '#' ? 'primary' : key}`, ...img, col: imgF && !ec[id] ? null : curCol(ec[id], key, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    };
    const fallback = vis('gamemenu').some((it) => !it.img && !it.imgOn && !it.def);
    let h = '';
    // 中部（11-28）：横向分类没有按钮底，选中 = 文字 + 下划线同一个颜色（gamemenu.tabActive，跟左侧「选中按钮底」分开存），未选中文字 gamemenu.text
    if (side) h += `<div class="p-sec"><div class="lab">${t('mp/gm-btn')}</div>${row('gamemenu.bg', 'btnOff')}${row('gamemenu.active', 'btnSel')}${row('gamemenu.shadow')}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/gm-c-text')}</div>${row('gamemenu.text')}${side ? row('gamemenu.activeText') : row('gamemenu.tabActive', null, 'mp/c-gamemenu-active-c')}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/gm-c-icons')}</div>${fallback ? row('gamemenu.icon') : note('mp/gm-c-icons-note')}</div>`;
    return h;
  }
  // ---------- 游戏卡片（经典蓝白 Figma 317:55739 / 317:55742）：兜底封面、收藏星、推荐角标、颜色 ----------
  const GC_STAR = { starOff: CL + 'star.png', starSel: CL + 'star-on.png' };
  const GC_FB = 7; // 画布第 8 张示意兜底封面（Figma 已登录变体同一位置）
  // 卡片是否紧挨竖排游戏菜单（editor.js 把两者并排放进 .cl-games）
  const gcSide = (id) => {
    const D = X().E.D; if (!D.m.gamemenu || D.m.gamemenu.style !== 'side') return false;
    const v = D.order.filter((o) => !D.hidden[o]), me = id || v.find((o) => o.split('~')[0] === 'gamecards'), i = v.indexOf(me);
    return i > 0 && v[i - 1].split('~')[0] === 'gamemenu';
  };
  // ---------- 卡片样式 6 种 · 菜单位置 · 每行张数（11-28，Figma「04-11-28 游戏卡片 · 6 样式」65976:10，Waydon 已确认；
  //            组件 H5/GameCard 65974:81179、ED/CardStyleChip 66014:114002；切图 slice/game-cover/<样式> 65975:30419–30424） ----------
  // 序号 = 文案 game-card/style-name/<序号>、game-card/upload-size/<序号>；尺寸 = 后台上传尺寸（单卡换图的裁切比例跟它走）
  const GC_STYLES = ['classic', 'western', 'portrait', 'square', 'round', 'landscape'];
  const GC_SIZES = { classic: [180, 180], western: [300, 400], portrait: [300, 400], square: [300, 300], round: [300, 300], landscape: [400, 250] };
  const gcStyleOf = (m) => (m && GC_SIZES[m.style] ? m.style : 'classic');
  const gcLand = (m) => gcStyleOf(m) === 'landscape';
  const gcColOpts = (m) => (gcLand(m) ? [2, 3] : [3, 4]); // 横版 2 / 3，其它 3 / 4（Figma：没有非横版 2 张）
  const gmLeft = (gm) => ((gm || M('gamemenu') || {}).style === 'side'); // 菜单位置：左侧（竖排）/ 中部（横向）
  // 每行张数（生效值）：不在可选范围的旧值按 3；非横版 4 张只在菜单中部时成立（菜单在左侧就按 3 张）
  const gcColsOf = (m, gm) => { const c = +m.cols, n = gcColOpts(m).includes(c) ? c : 3; return n === 4 && gmLeft(gm) ? 3 : n; };
  const gcSz = () => GC_SIZES[gcStyleOf(M('gamecards'))];
  // 游戏菜单在页面上（没隐藏、没删掉）：菜单位置、「每行 4 张时，菜单固定在中部」只在这时有意义（11-28 QA）
  const gmOnPage = () => { const D = X().E.D; return D.order.some((o) => o.split('~')[0] === 'gamemenu' && !D.hidden[o]); };
  // 卡片上方「热门 / 最近 / 收藏」页签：确认稿左侧 / 中部都没有（卡片直接从分类旁边 / 下面开始，11-28 QA），只在页面上没有游戏菜单时显示（不然没有分类可点）
  const gcTabsOn = () => !gmOnPage();
  // 推荐角标（热门 / 新）：H5/GameCard 欧美、竖版两种样式里隐藏（只有经典 / 方形 / 圆版 / 横版显示）
  const gcRecOk = (s) => s !== 'western' && s !== 'portrait';
  const gcStyleIdx = () => GC_STYLES.indexOf(gcStyleOf(M('gamecards')));
  // 游戏名称的默认字号（CSS px）= 卡片宽 × 样式比例（同 editor.css .gcd > .nm 的 cqw：欧美 11.25%、横版 8.46%、其它 12.94%）。
  // 卡片宽按画布排版算：左侧 = 375 − 左右 10×2（.cl-games）− 菜单 76 − 间距 10 = 269、列间距 7；中部 / 单独 = 375 − 12×2 = 351、列间距 8
  // （经典 左侧 · 3 张 = 85 宽 → 11；中部 · 3 张 = 111.7 宽 → 14.45，Figma C3 113 宽 14.62）。文字样式面板显示 / 加减的是这个值 × 业主设的倍数
  const GC_NM_R = { western: 0.1125, landscape: 0.0846 };
  function gcNameBase(id) {
    const m = M('gamecards'); if (!m) return 11;
    const side = gcSide(id && String(id).split('~')[0] === 'gamecards' ? id : undefined), n = gcColsOf(m), [w, g] = side ? [269, 7] : [351, 8];
    return ((w - g * (n - 1)) / n) * (GC_NM_R[gcStyleOf(m)] || 0.1294);
  }
  // 旧存档 / AI 设计迁移（面板 11-28 起只剩 菜单位置 + 每行张数 + 卡片样式）：
  //   分类样式 竖排 → 左侧、横向标签 / 图标分类 → 中部；标签形状、卡片圆角、卡片间距去掉（由卡片样式决定）；
  //   非横版 2 张 → 3、左侧 + 4 张 → 3；去掉开关的元素（平台角标、收藏星、分类标题行）回到显示
  function gcNorm(D) {
    const mm = D && D.m; if (!mm) return D;
    const gm = mm.gamemenu, gc = mm.gamecards;
    if (gm) { if (gm.style !== 'side') gm.style = 'tabs'; delete gm.shape; }
    if (gc) {
      gc.style = gcStyleOf(gc);
      gc.cols = gcColsOf(gc, gm || {});
      delete gc.corner; delete gc.gap;
      ['tag', 'fav', 'title'].forEach((k) => { if (gc[k] === false) gc[k] = true; });
    }
    // 文字样式「游戏名称」：旧存档存的是固定字号 s（默认 11），11-28 起存倍数 k（画布名称跟卡片宽等比），按 s ÷ 11 换算
    const tn = D.txt && D.txt['gamecards.name'];
    if (tn && tn.s != null) { if (tn.k == null && +tn.s !== 11) tn.k = +(tn.s / 11).toFixed(4); delete tn.s; if (!Object.keys(tn).length) delete D.txt['gamecards.name']; }
    return D;
  }
  // 元素色当前值（面板缩略图用；画布用 CSS 变量）
  const gcCol = (id) => { const { th, ec } = X().liveTheme(), v = ec[id], k = v && v.startsWith('key:') ? v.slice(4) : v ? null : EL.gamecards.find((r) => r[0] === id)[1]; return k ? (th[k] != null ? th[k] : resolveKey(k, th, ec)) : v; };
  // 兜底封面里层：上传 / AI 图（'img:'）铺满；默认 = 手柄图形（ddt_icon）；素材库模拟值 = 滤镜；隐藏 = 只剩底板
  const gcFbInner = (m) => { const v = m.fallback; if (m.fallbackOn === false) return ''; return v && v.startsWith('img:') ? `<i class="fbimg" style="${window.fxStyle(v)}"></i>` : `<span class="fbg" style="filter:${v || 'none'}">${ic('game-controller-fill')}</span>`; };
  // 收藏星：上传 / AI 图（'img:'）> 效果图默认 PNG
  const gcStarSrc = (m, f) => { const v = m[f]; return v && v.startsWith('img:') ? v.slice(4) : GC_STAR[f]; };
  const gcStarImg = (m, f, cls = '') => { const v = m[f]; return `<img class="${cls}" src="${gcStarSrc(m, f)}" style="${v && !v.startsWith('img:') ? 'filter:' + v : ''}" alt="">`; }; // 素材库模拟值 = 滤镜
  A.gcCvMenu = (arg) => {
    const [id, f, j] = arg.split('|'), x = X(), E = x.E, key = 'gccv:' + id + '|' + f + '|' + j;
    if (E.sel !== id) E.ai = null;
    E.picker = null; // 兜底图 / 收藏星菜单同换图菜单：先关掉行内取色器（11-28 整合测试）
    if (E.gcSel) { E.gcSel = null; if (E.ai && E.ai.mod === 'gcimg') E.ai = null; } // 单卡换图：点兜底图 / 收藏星 = 取消卡片选中
    E.sel = id; E.tab = 'content';
    if (x.mobileEd()) { S().menu = 'am:mp-gamecards-' + f; return; } // 手机：底部菜单（amSheet）
    S().menu = S().menu === key ? null : key;
  };
  // ---------- 单卡换图（11-28，Figma「04-11-28 单卡换图」65983:30427；菜单 ED/CardImageMenu 65987:30447） ----------
  // 画布上点某张游戏卡片 → 选中这张卡（蓝框，模块工具条收起）+ 换图菜单（电脑：卡片右侧浮层；手机：底部弹层）：上传图片 / AI 生成图片 / 恢复原图。
  // 只换这一张的图，名称、角标、维护状态不变。换的图存 E.D.m.gamecards.imgs[卡片序号] = { f: 'img:…', x, y }（裁切位置）或 { f, fit: 'pad', fill }（留边）；
  // 原图 = 游戏平台给的封面（GAMES），一直不改，所以每张卡都记得原图，「恢复原图」= 删掉这一项。换图 / 恢复都走 commit（撤销 / 重做）。
  // 画布第 8 张是兜底图示意（不是真的游戏封面），点它照旧出兜底图菜单。
  const GC_AI_COST = 10; // 上传尺寸 / 裁切比例跟卡片样式走（gcSz()：经典 180×180 1:1、欧美 / 竖版 300×400 3:4、方形 / 圆版 300×300 1:1、横版 400×250 8:5）
  const gcOrig = (j) => CL + 'game' + GAMES[j][1] + '.webp';
  const gcOwn = (m, j) => (m && m.imgs && m.imgs[j]) || null;
  function gcCover(m, j) {
    const o = gcOwn(m, j); if (!o) return `<img src="${gcOrig(j)}" alt="">`;
    const st = o.fit === 'pad' ? `object-fit:contain;background:var(--o-${o.fill || 'bg_1'})` : `object-position:${(o.x ?? 0.5) * 100}% ${(o.y ?? 0.5) * 100}%`;
    return `<img src="${esc(o.f.replace(/^img:/, ''))}" style="${st}" alt="">`;
  }
  // 选中的卡（编辑器状态，不进设计数据）：只在它所在的模块还选着时算数
  const gcSelJ = (mid) => { const E = X().E, s = E.gcSel; return s && s.id === mid && E.sel === mid && GAMES[s.j] && s.j !== GC_FB ? s.j : null; };
  const gcMenuOpen = (mid, j) => S().menu === 'gcimg:' + mid + '|' + j && !X().mobileEd();
  function gcMenuBody(m, j) {
    const own = !!gcOwn(m, j);
    // Figma：菜单项没有图标，主文字 14 + 说明 12；没换过图时「恢复原图」整行灰（不可点）
    const it = (act, lab, sub, dis) => `<button class="menu-item gim-it" data-act="${act}" role="menuitem" ${dis ? 'disabled aria-disabled="true" data-keep' : ''} data-stop><span class="tx"><span class="lb">${lab}</span><span class="sub">${sub}</span></span></button>`;
    return `<div class="gim-hd"><span class="th">${gcCover(m, j)}</span><span class="tx"><b class="ellipsis">${esc(GAMES[j][0])}</b><small class="ellipsis">${t('game-card/style-name/' + gcStyleIdx())} · ${gcSz()[0]}×${gcSz()[1]}</small></span></div><div class="gim-sep"></div>`
      + it('gcImgUpload', t('game-card/image-flow/upload'), t('game-card/image-flow/upload-sub'))
      + it('gcImgAi', t('game-card/image-flow/ai'), t('game-card/image-flow/ai-sub', { x: GC_AI_COST }))
      + it('gcImgRestore', t('game-card/image-flow/restore'), t(own ? 'game-card/image-flow/restore-sub' : 'game-card/image-flow/restore-hint'), !own);
  }
  const gcMenu = (mid, m, j) => (gcMenuOpen(mid, j) ? `<div class="menu gc-img-menu" role="menu" aria-label="${esc(GAMES[j][0])}" data-stop>${gcMenuBody(m, j)}</div>` : '');
  // 手机：底部弹层（Figma M 1 / 5：画布不压暗，盖住底部工具栏）
  function gcImgSheet() {
    const E = X().E, s = E.gcSel;
    if (!s || !GAMES[s.j] || s.j === GC_FB || E.sel !== s.id) { E.mpanel = null; return ''; }
    // 不放全屏遮罩（同模块弹层）：弹层开着时点画布上露出来的别的卡片直接换到那一张，顶栏撤销 / 重做也能直接点（QA 11-28）
    return `<div class="sheet med-sheet gim-sheet" role="dialog" aria-label="${esc(GAMES[s.j][0])}" data-sk="msheet"><div class="sheet-grab"></div><div class="gim-list">${gcMenuBody(M('gamecards'), s.j)}</div></div>`;
  }
  A.gcCard = (arg) => {
    const [id, j0] = arg.split('|'), j = +j0, x = X(), E = x.E, mob = x.mobileEd();
    if (!GAMES[j] || j === GC_FB || E.preview) return false; // 预览是只读的：点卡片不选中、不出菜单（QA 11-28）
    const same = E.gcSel && E.gcSel.id === id && E.gcSel.j === j;
    if (E.sel !== id) { if (!/^game(menu|cards)(~|$)/.test(E.sel || '')) E.tab = 'content'; E.rn = null; } // 从游戏菜单过来：同一个面板，页签不变
    E.picker = null; // 同一个模块里点卡片也先关掉行内取色器（还没应用的预览收回），换图菜单不会和取色器叠在一起（11-28 整合测试，同选别的模块）
    if (E.ai && !(E.ai.mod === 'gcimg' && same && !mob)) E.ai = null; // 换了一张卡（或手机）：上一张的 AI 面板收起（状态留在本次会话，再打开接着看）
    E.sel = id; E.keys = null; E.h5side = false; E.gcSel = { id, j, mob };
    if (mob) { E.mpanel = 'gcimg'; S().menu = null; return; }
    const k = 'gcimg:' + id + '|' + j;
    S().menu = window.__prevMenu === k ? null : k; // 再点同一张：收起菜单，卡片仍选中
  };
  A.gcImgClose = () => { const E = X().E; if (E.mpanel === 'gcimg') E.mpanel = null; };
  // 上传图片：选图 → 现有「调整尺寸」弹窗（裁切，比例 = 卡片上传尺寸 1:1）→ 采用（editor.js rsApply → gcRsApply）
  A.gcImgUpload = (again) => {
    const x = X(), E = x.E, s = E.gcSel; if (!s) return false;
    if (E.mpanel === 'gcimg') E.mpanel = null;
    const slot = 'gc:' + s.id + '|' + s.j;
    window.pickImage({ maxMB: 5 }, (src) => {
      const im = new Image();
      im.onload = () => {
        const w = im.naturalWidth || gcSz()[0], h = im.naturalHeight || gcSz()[1];
        if (again && E.rs && E.rs.slot === slot) Object.assign(E.rs, { f: 'img:' + src, w, h, x: 0.5, y: 0.5 }); // 弹窗里「重新上传」：换图，留在弹窗
        else x.openResize(slot, 'img:' + src, w, h);
        window.render();
      };
      im.onerror = () => window.toast(t('mp/icon-bad'), { info: true });
      im.src = src;
    });
    if (again) return false;
  };
  A.gcImgAi = () => { const E = X().E, s = E.gcSel; if (!s || !window.AIG) return false; if (E.mpanel === 'gcimg') E.mpanel = null; window.AIG.open('gcimg', 'card', { idx: s.j }); };
  A.gcImgRestore = () => { const s = X().E.gcSel; if (!s || !gcOwn(M('gamecards'), s.j)) return false; gcSet(s.j, null, 'game-card/image-flow/restored'); };
  // 写入这一张的图（null = 恢复原图）+ 画布 Toast「图片已应用 / 已恢复原图 · 撤销换图」
  function gcSet(j, v, msg) {
    const x = X(), prev = gcOwn(M('gamecards'), j);
    x.commit(() => { gcPut(x.E.D.m.gamecards, j, v); });
    gcDone(j, prev, msg);
  }
  function gcPut(m, j, v) { const o = Object.assign({}, m.imgs); if (v) o[j] = v; else delete o[j]; if (Object.keys(o).length) m.imgs = o; else delete m.imgs; }
  // Toast 的「撤销换图」只撤这一次：还是最后一步就正常撤销（可重做）；之后又改了别的，就只把这张卡的图改回去、另记一步。
  // 同一时间只有一条「撤销换图」Toast（Figma 2b / 4 / 6 都是一条）：再换图 / 恢复就把上一条换掉；这张卡的图被后来的操作（顶栏撤销、再换）改过了，Toast 也一起收掉，不留点了没反应的按钮（QA 11-28）
  // 样式照 Figma Toast：「撤销换图」是淡蓝胶囊；电脑放在手机画布底部导航上（Figma 稍微压到底部导航）
  let gcT = null;
  function gcDone(j, prev, msg) {
    const x = X(), E = x.E, after = JSON.stringify(E.D), depth = E.past.length, now = JSON.stringify(gcOwn(M('gamecards'), j));
    if (x.mobileEd() && E.mpanel === 'gcimg') E.mpanel = null;
    if (gcT) window.toastDrop(gcT.id);
    const id = x.canvasToast(t(msg), { action: () => {
      const E2 = X().E; gcT = null;
      if (E2.past.length === depth && JSON.stringify(E2.D) === after) { A.undo(); window.render(); return; }
      if (JSON.stringify(gcOwn(M('gamecards'), j)) !== now) return;
      X().commit(() => { gcPut(X().E.D.m.gamecards, j, prev); });
      window.toast(t('ed/undo-toast')); window.render();
    }, actionLabel: t('game-card/image-flow/undo'), ms: 5000, cls: 'gc-toast', onNav: true });
    gcT = { id, j, now };
  }
  function gcToastCheck() {
    if (!gcT) return;
    if (!window.S.toasts.some((q) => q.id === gcT.id)) { gcT = null; return; }
    if (JSON.stringify(gcOwn(M('gamecards'), gcT.j)) !== gcT.now) { window.toastDrop(gcT.id); gcT = null; }
  }
  // 「调整尺寸」采用：裁切存位置，留边存底色 Key
  function gcRsApply(r) { const j = +r.slot.slice(3).split('|')[1]; gcSet(j, r.mode === 'pad' ? { f: r.f, fit: 'pad', fill: r.fill } : { f: r.f, x: r.x, y: r.y }, 'game-card/image-flow/applied'); }
  const gcSpec = (slot) => { const j = +slot.slice(3).split('|')[1], sz = gcSz(); return { w: sz[0], h: sz[1], name: GAMES[j] ? GAMES[j][0] : '' }; };
  // 电脑菜单：浮在选中卡片右侧（Figma 1：卡片右边 + 3、顶边对齐）；右边放不下就放左边；不超出画布上下
  function gcPlaceMenu(m) {
    const c = document.querySelector('#app .cl-gc .c.is-csel'); if (!c) { m.remove(); return; }
    const r = c.getBoundingClientRect(), cv = (c.closest('.ed-canvas') || document.body).getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
    let left = r.right + 3; if (left + mw > Math.min(window.innerWidth, cv.right) - 8) left = Math.max(8, r.left - 3 - mw);
    const top = Math.max(cv.top + 8, Math.min(r.top + 3, Math.min(window.innerHeight, cv.bottom) - 8 - mh));
    m.style.left = left + 'px'; m.style.top = top + 'px';
  }
  // 跨过 840（转屏 / 拉窗口）：电脑浮层和手机底部弹层互换，卡片选中和菜单开着的状态都留着（QA 11-28；同取色器切 Key 范围）。
  // 在 editor.js 渲染前调用；s.mob / s.open 是上一次渲染时的样子（core 跨断点时会先清掉 S.menu，所以开没开要自己记）
  function gcSync() {
    const x = X(), E = x.E, s = E.gcSel; if (!s) return;
    if (E.sel !== s.id) { E.gcSel = null; if (E.mpanel === 'gcimg') E.mpanel = null; return; } // 模块已经不选了（切面板 / 预览等）：卡片选中一起清掉
    const mob = x.mobileEd(); if (s.mob == null) { s.mob = mob; return; }
    if (s.mob === mob) return;
    s.mob = mob;
    if (mob) { if (s.open && !E.ai && !E.dlg) { E.mpanel = 'gcimg'; S().menu = null; } else if (E.ai && E.ai.mod === 'gcimg' && !E.mpanel) E.mpanel = 'module'; } // 这张卡的 AI 面板开着：手机放进底部弹层
    else { if (E.mpanel === 'gcimg') { E.mpanel = null; if (s.open) S().menu = 'gcimg:' + s.id + '|' + s.j; } }
  }
  // 画布有缩放（transform），fixed 会相对画布定位，所以每次渲染后把菜单移到 body 下（上一次的先删掉）
  window.AFTER_RENDER.push(() => {
    const E = X().E, s = E.gcSel;
    if (s && S().route === 'editor') { s.mob = X().mobileEd(); s.open = s.mob ? E.mpanel === 'gcimg' : S().menu === 'gcimg:' + s.id + '|' + s.j; }
    gcToastCheck(); gcAutoCheck();
    document.querySelectorAll('body > .gc-img-menu').forEach((n) => n.remove());
    const m = document.querySelector('#app .gc-img-menu'); if (!m) return;
    document.body.appendChild(m); gcPlaceMenu(m);
  });
  const gcFollow = () => { const m = document.querySelector('body > .gc-img-menu'); if (m) gcPlaceMenu(m); }; // 画布滚动 / 窗口变化：菜单跟着卡片
  document.addEventListener('scroll', gcFollow, true);
  window.addEventListener('resize', gcFollow);
  A.gcFlag = (k) => { const x = X(); x.commit(() => { const m = x.E.D.m.gamecards; m[k] = m[k] === false; }); };
  A.gcStarReset = () => { const x = X(), m = M('gamecards'); if (!m.starOff && !m.starSel) return false; x.commit(() => { const g = x.E.D.m.gamecards; g.starOff = null; g.starSel = null; }); window.toast(t('ed/reset-toast'), x.undoOpt()); };
  // AI 生成（原型：按款式画 SVG；正式版按提示词出图）。target = fallback（兜底封面 260×260）| star（收藏星两张 36×36）
  const GC_ST = ['glossy', 'flat', 'blackgold', 'festive', 'neon'];
  const svgUrl = (svg) => 'img:data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29');
  function gcFbSvg(st, pc) {
    const [c1, c2, g, line] = { glossy: [lighten(pc, 0.86), lighten(pc, 0.7), '#ffffff', null], flat: ['#e3e3e3', '#e3e3e3', '#f1f1f1', null], blackgold: ['#2e2a24', '#121212', '#c9a55a', '#c9a55a'], festive: ['#ff6a50', '#c81e1e', '#ffd37a', '#ffd37a'], neon: ['#2a1f5c', '#120c2e', '#a27bff', '#8a5cff'] }[st];
    const glow = st === 'neon' ? `<g transform="translate(66 66) scale(.5)" fill="none" stroke="${g}" stroke-opacity=".5" stroke-width="18">${window.PH['game-controller-fill']}</g>` : '';
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="260" height="260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="260" height="260" fill="url(#g)"/>${line ? `<rect x="6" y="6" width="248" height="248" rx="18" fill="none" stroke="${line}" stroke-opacity=".55" stroke-width="3"/>` : ''}${glow}<g transform="translate(66 66) scale(.5)" fill="${g}">${window.PH['game-controller-fill']}</g>${st === 'glossy' ? '<path d="M0 0h260v90Q130 130 0 90z" fill="#fff" fill-opacity=".35"/>' : ''}</svg>`);
  }
  function gcStarSvg(st, on, pc) {
    const [bg, off, onc, edge] = { glossy: ['#ffffff80', '#0000004d', '#ffe227', '#ffd427'], flat: ['#00000033', '#ffffff', pc, null], blackgold: ['#1c1c1cb3', '#8a7440', '#f6dc96', '#b8892f'], festive: ['#d81e1e99', '#ffd9c0', '#ffd37a', '#fff3c4'], neon: ['#16112fb3', '#6b5ab0', '#e0d0ff', '#a27bff'] }[st];
    const c = on ? onc : off;
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="72" height="72"><circle cx="18" cy="18" r="17" fill="${bg}"/><g transform="translate(7 6.5) scale(.0859)" fill="${c}" ${on && edge ? `stroke="${edge}" stroke-width="14"` : ''}>${window.PH['star-fill']}</g></svg>`);
  }
  // 兜底图（Figma section · 兜底图：素材卡 = 缩略图 · 名称 · 「封面加载失败时显示 · 尺寸 · PNG」· ⋯，下面 上传 / 素材库）；
  // ⋯ 菜单里有 AI 生成 / 恢复 / 隐藏。收藏星图片不再放在面板里：画布上点收藏星照旧可以上传 / AI / 恢复（上传进度仍显示在这里）
  function gcImgSec() {
    const x = X(), m = M('gamecards'), fbOwn = !!m.fallback, fbOn = m.fallbackOn !== false, sp = x.slotSpec ? x.slotSpec('mp-gamecards-fallback') : { w: 260, h: 260 };
    const thumb = `<span class="thumb gc-fthumb" style="background:${gcCol('gamecards.placeholder')};color:${gcCol('gamecards.placeholderIcon')}">${gcFbInner(m)}</span>`;
    const spec = t('mp/gc-fallback-spec', { w: sp.w, h: sp.h }) + (!fbOn ? ' · ' + t('mp/gc-fb-off') : fbOwn ? ' · ' + t('ed/tb-own') : '');
    // Figma：素材卡下面「上传」「素材库」是两个按内容宽的灰色胶囊（左对齐），不是两等分的整行按钮（.gc-fb 只改这一处）
    return sec(t('mp/gc-fallback'), `<div class="gc-fb">${asset('gamecards', 'fallback', t('mp/gc-fallback'), spec, thumb)}</div>` + x.uploadUI('mp-gamecards-fallback') + x.uploadUI('mp-gamecards-starOff') + x.uploadUI('mp-gamecards-starSel'));
  }
  // 一张卡片（画布与样式缩图共用，Figma H5/GameCard）：卡片宽 = 容器宽（CSS 容器查询，尺寸按 Figma 85 宽的比例），
  // o = { cover 封面 HTML, name 名称（空 = 不显示）, rec 角标, star 收藏星 HTML, logo 平台角标, fb 兜底示意, cls, attrs, imAttrs, extra }
  function gcCardHtml(s, o) {
    const nm1 = o.name ? `<span class="nm">${esc(o.name)}</span>` : '', ov = s === 'western'; // 欧美：名称压在图片底部（暖红渐变上）
    return `<div class="c gcd s-${s} ${o.cls || ''}" ${o.attrs || ''}><div class="im ${o.fb ? 'fb' : ''}" ${o.imAttrs || ''}>${o.cover}${ov ? '<i class="shade"></i>' : ''}${o.rec ? `<span class="rec">${ic('thumbs-up-fill')}</span>` : ''}${o.star || ''}${o.logo ? `<img class="wg" src="${CL}wg.png" alt="">` : ''}${ov ? nm1 : ''}</div>${ov ? '' : nm1}${o.extra || ''}</div>`;
  }
  // 样式缩图（ED/CardStyleChip）：同一张示意游戏卡，按样式画
  const gcMini = (s) => gcCardHtml(s, { cover: `<img src="${CL}game6.webp" alt="">`, name: GAMES[6][0], rec: gcRecOk(s), star: `<span class="star">${gcStarImg(M('gamecards'), 'starOff')}</span>`, logo: true, cls: 'is-mini' });
  // 游戏分类（游戏菜单原有内容：未选中 / 选中图标 · 名称 · 选中哪个 · 批量上传）——确认稿的面板没画这一段，保留在显示内容 / 兜底图下面
  function gmCats() {
    const x = X(), ai = gmAct(), sp = specOf('gamemenu');
    const hd = `<div class="gm-hd"><span class="c1" title="${esc(t('mp/state-def'))}">${t('mp/gm-h-off')}</span><span class="c1" title="${esc(t('mp/state-act'))}">${t('mp/gm-h-on')}</span><span class="c2">${t('mp/gm-h-name')}</span><span class="c3">${t('mp/gm-h-sel')}</span></div>`;
    const rows = list('gamemenu', (it, i) => {
      const on = i === ai, same = !it.imgOn && !it.defOn; // 没有单独的选中图 = 跟未选中同一张（虚线框提示）
      return `${upThumb('gamemenu', i, 'img', it.i, 'st2', t('mp/state-def'))}${upThumb('gamemenu', i, 'imgOn', it.i, 'st2 on' + (same ? ' is-same' : ''), t('mp/state-act') + (same ? ' · ' + t('mp/gm-same') : ''))}${nameCell('gamemenu', i)}${resetBtn('gamemenu', i)}${icAi('gamemenu', i)}<button class="gm-rad ${on ? 'is-on' : ''}" data-act="mpGmActive" data-arg="${i}" ${it.on ? '' : 'disabled'} role="radio" aria-checked="${on}" title="${esc(t(on ? 'mp/gm-is-sel' : 'mp/gm-set-sel'))}" aria-label="${esc(t(on ? 'mp/gm-is-sel' : 'mp/gm-set-sel'))}"><i></i></button>`;
    });
    return sec(t('mp/gm-cats') + x.tipI('mp/gm-first2'), hd + rows + `<div class="p-note">${ic('frame-corners', 'ic-16')}${t('mp/gm-icon-spec2', { w: sp[0], h: sp[1], w2: sp[0] * 2, h2: sp[1] * 2 })}</div>` + iconBtns('gamemenu'), cnt('gamemenu'));
  }
  // 内容页签（Figma 内容页签）：卡片样式 3×2（缩图 + 名称 + 尺寸，选中淡蓝底蓝字）→ 显示内容（游戏名称、角标（热门 / 新））→ 兜底图；
  // 再往下是 HTML 原有、确认稿没画的：游戏分类、按钮底图（左侧时）、文字样式（两个模块合在一起）
  function gamesContent() {
    const x = X(), m = M('gamecards'), cur = gcStyleOf(m);
    const chips = GC_STYLES.map((s, i) => { const on = s === cur; return `<button class="gcs-chip ${on ? 'is-on' : ''}" data-act="gcStyle" data-arg="${s}" role="radio" aria-checked="${on}"><span class="th">${gcMini(s)}</span><b class="ellipsis">${t('game-card/style-name/' + i)}</b><small class="ellipsis">${t('game-card/upload-size/' + i)}</small></button>`; }).join('');
    const style = sec(t('mp/game-card-style'), `<div class="gcs-grid" role="radiogroup" aria-label="${esc(t('mp/game-card-style'))}">${chips}</div>`);
    const show = sec(t('mp/gc-show'), toggle(m.name, 'mpFlag', 'gamecards|name', t('mp/gc-name')) + toggle(m.rec !== false, 'gcFlag', 'rec', t('mp/gc-tag')));
    return style + show + gcImgSec() + gmCats() + (gmLeft() ? gmBtnSec() : '') + (x.txtSec ? x.txtSec(['gamemenu', 'gamecards']) : '');
  }
  // 布局页签（Figma 布局页签）：只有 菜单位置（左侧 / 中部）和 每行张数（非横版 3 / 4 + 说明「每行 4 张时，菜单固定在中部」；横版 2 / 3 没有说明）。
  // 每行 4 张时「左侧」变灰（透明度 0.4，点了提示原因）；左侧时选 4 张 → 菜单自动移到中部 + 画布 Toast「菜单已移到中部 · 撤销」
  // 游戏菜单隐藏 / 删掉时：不显示菜单位置，每行张数也不写「菜单固定在中部」（页面上没有菜单）
  function gamesLayout() {
    const gm = M('gamemenu'), m = M('gamecards'), land = gcLand(m), cols = gcColsOf(m, gm), left = gmLeft(gm), lock = !land && cols === 4, menu = gmOnPage();
    const pos = `<div class="seg">${[['side', t('ed/side-left')], ['tabs', t('mp/game-menu-center')]].map(([v, lab]) => { const on = (v === 'side') === left, dis = v === 'side' && lock; return `<button class="seg-opt ${on ? 'is-on' : ''} ${dis ? 'is-dis' : ''}" data-act="gmPos" data-arg="${v}" aria-pressed="${on}" ${dis ? `aria-disabled="true" title="${esc(t('game-card/cols-note'))}"` : ''}>${esc(lab)}</button>`; }).join('')}</div>`;
    const cs = seg(gcColOpts(m).map((n) => ({ v: String(n), label: t('mp/game-cols-' + n) })), cols, 'gcCols');
    return `<div class="gc-lay">${menu ? sec(t('mp/game-menu-position'), pos) : ''}${sec(t('mp/game-card-cols'), `<div class="gc-cc">${cs}${land || !menu ? '' : note('game-card/cols-note')}</div>`)}</div>`;
  }
  // 颜色页签：两个模块原有的颜色行，按模块分两组
  const gamesColor = () => `<div class="gc-cgrp"><div class="gc-cgrp-h">${t('mod/gamemenu')}</div>${gmColor()}</div><div class="gc-cgrp"><div class="gc-cgrp-h">${t('mod/gamecards')}</div>${gcColor()}</div>`;
  A.gcStyle = (s) => {
    const x = X(); if (!GC_SIZES[s] || gcStyleOf(M('gamecards')) === s) return false;
    // 换样式时每行张数按新样式对应：横版 ← 4 张 → 3；非横版 ← 2 张 → 3；3 张不变
    x.commit(() => { const g = x.E.D.m.gamecards, gm = x.E.D.m.gamemenu, c = gcColsOf(g, gm); g.style = s; g.cols = gcColOpts(g).includes(c) ? c : 3; });
  };
  A.gmPos = (v) => {
    const x = X(), gm = M('gamemenu'), m = M('gamecards'), left = v === 'side';
    if (left === gmLeft(gm)) return false;
    if (left && !gcLand(m) && gcColsOf(m, gm) === 4) { window.toast(t('game-card/cols-note'), { info: true }); return false; } // 每行 4 张：菜单固定在中部
    x.commit(() => { x.E.D.m.gamemenu.style = left ? 'side' : 'tabs'; });
  };
  A.gcCols = (n0) => {
    const x = X(), gm = M('gamemenu'), m = M('gamecards'), n = +n0;
    if (!gcColOpts(m).includes(n) || gcColsOf(m, gm) === n) return false;
    // Figma §8 #14 65977:38750 / 38899：左侧时选 4 张 → 菜单移到中部 + Toast。菜单不在页面上（隐藏 / 删掉）就不提示，只把位置记成中部（再显示菜单时在中部，不会出现左侧 + 4 张）
    if (n === 4 && gmLeft(gm)) { x.commit(() => { x.E.D.m.gamemenu.style = 'tabs'; x.E.D.m.gamecards.cols = 4; }); if (gmOnPage()) gcAutoToast(); return; }
    x.commit(() => { x.E.D.m.gamecards.cols = n; });
  };
  // 「菜单已移到中部 · 撤销」：还是最后一步就正常撤销（可重做）；之后又改了别的（菜单位置、张数都没动），只撤这次自动移动、另记一步：菜单移回左侧、张数改回 3 张。
  // 后来的改动动了菜单位置或张数（顶栏撤销 / Ctrl+Z 撤掉了这一步、自己移回左侧、改了张数、换横版、套用 AI 模版…）：要撤的已经不是这次的结果，Toast 一起收掉（gcAutoCheck，同「撤销换图」），
  // 不留点了没反应、或会把后来的排版改掉的按钮（11-28 整合测试）
  let gcAT = null;
  const gcAutoNow = () => { const gm = M('gamemenu'), m = M('gamecards'); return (gmLeft(gm) ? 'side' : 'tabs') + '|' + gcColsOf(m, gm); };
  function gcAutoToast() {
    const x = X(), after = JSON.stringify(x.E.D), depth = x.E.past.length, now = gcAutoNow();
    if (gcAT) window.toastDrop(gcAT.id);
    const id = x.canvasToast(t('game-card/auto-center-toast'), { ms: 5000, cls: 'is-pill-act', actionLabel: t('ed/am-undo'), action: () => {
      const E2 = X().E; gcAT = null;
      if (E2.past.length === depth && JSON.stringify(E2.D) === after) { A.undo(); window.render(); return; }
      if (gcAutoNow() !== now) return; // 菜单位置 / 张数已经被后来的操作改过：不再动
      X().commit(() => { const g = E2.D.m.gamecards; E2.D.m.gamemenu.style = 'side'; if (!gcLand(g) && +g.cols === 4) g.cols = 3; });
      window.toast(t('ed/undo-toast')); window.render();
    } });
    gcAT = { id, now };
  }
  function gcAutoCheck() {
    if (!gcAT) return;
    if (!window.S.toasts.some((q) => q.id === gcAT.id)) { gcAT = null; return; }
    if (gcAutoNow() !== gcAT.now) { window.toastDrop(gcAT.id); gcAT = null; }
  }
  // 颜色：同游戏菜单做法（'key:<名>' 引用 68 Key），「默认」= Figma 绑定的 Key；选中页签 / 分隔线 / 展开 固定跟 Key，点「去改」进整页配色
  const GC_SW = { 'gamecards.tab': ['lead', 'neutral_1', 'neutral_2', 'primary'], 'gamecards.text': ['neutral_1', 'lead', 'neutral_2', 'primary'], 'gamecards.placeholder': ['ddt_bg', 'bg_1', 'neutral_3', 'primary'], 'gamecards.placeholderIcon': ['ddt_icon', 'bg_1', 'neutral_3', 'neutral_2'], 'gamecards.label': ['label_accent3', 'accent_2', 'accent_1', 'primary'], 'gamecards.labelText': ['labeltext_accent3', 'lead', 'accent_3', 'primary'] };
  const GC_CAP = { 'gamecards.text': 'cards_text' }; // Key 标签显示的 Key 名（游戏名称 = cards_text：欧美卡片分支固定白，其它 = neutral_1）
  function gcColor() {
    const x = X(), E = x.E, { th, ec } = x.liveTheme(), D = E.D, m = M('gamecards');
    const kv = kvOf(th, ec);
    const row = (id) => {
      const key = elDef(id), v = D.ec[id] || null, lab = t('mp/c-' + id.replace('.', '-')), pk = E.picker && E.picker.elRow === id;
      return colorRow(lab, { act: 'bnColor', id, v, key, sws: GC_SW[id], kv, pk, pickArg: `${id}|${key[0] === '#' ? 'neutral_1' : key}`, tag: GC_CAP[id], col: curCol(ec[id], key, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    };
    const link = (lab, key) => linkRow(lab, key, kv(key));
    const fbImg = m.fallback && m.fallback.startsWith('img:');
    const tabs = gcTabsOn();
    let h = `<div class="p-sec"><div class="lab">${t('mp/gc-c-text')}</div>${tabs ? row('gamecards.tab') : ''}${m.name ? row('gamecards.text') : ''}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('mp/gc-fallback')}</div>${m.fallbackOn === false ? note('mp/gc-c-fb-off') : row('gamecards.placeholder') + (fbImg ? note('mp/gc-c-fb-img') : row('gamecards.placeholderIcon'))}</div>`;
    // 欧美 / 竖版卡片没有推荐角标（H5/GameCard，画布不画）：不显示角标颜色这一组（改了画布也没有变化，「N 处」也不算它们，11-28 整合测试）
    if (gcRecOk(gcStyleOf(m))) h += `<div class="p-sec"><div class="lab">${t('mp/gc-rec')}</div>${m.rec !== false ? row('gamecards.label') + row('gamecards.labelText') : note('mp/gc-c-rec-off')}</div>`;
    h += `<div class="p-sec"><div class="lab">${t('ed/tb-c-linked')}</div>${link(t(tabs ? 'mp/gc-c-on' : 'mp/gc-expand'), 'primary')}${link(t('mp/gc-c-line'), 'border')}</div>`; // 没有页签时主色只用在「展开」
    return h;
  }
  function panel(b, tab) { if (tab === 'color') return P[b].color ? P[b].color() : colors(b); return (P[b][tab] || P[b].content)(); }

  // ---------- 画布 ----------
  const vis = (b) => M(b).items.filter((x) => x.on);
  function h5(b, id) {
    const m = M(b);
    if (b === 'jackpot') {
      const amt = `<b class="${m.anim === 'roll' ? 'roll' : ''}">¥ 88,888,888.88</b>`;
      const bg = m.bg && m.bgOn ? `background-image:linear-gradient(135deg,#f6c445,#c9963b);filter:${m.bg}` : '';
      return `<div class="h5-jack ${m.layout}" style="margin:${m.margin / 2}px 12px;border-radius:${m.corner / 2}px;${bg}"><span class="tt">${esc(m.title)}</span>${amt}</div>`;
    }
    if (b === 'notice') {
      // 消息（Waydon 11-27，Figma 442:37665 ④）：未登录预览 = 已读图标（img）、无气泡；已登录预览 = 未读图标（imgOn）+ 未读数气泡
      // （「显示消息气泡」开才显示，底色 notice.badge = accent_2）；消息入口关 = 右侧整个不显示
      // 喇叭默认图用遮罩着色（跟 notice.icon = neutral_1）；上传 / AI 的图按原图显示
      ntNorm(m, X().E.D.ec);
      const its = ntItems(), login = X().E.D.login;
      const gi = (i, cls) => {
        const it = its[i], f = i === 1 && login ? 'imgOn' : 'img', up = it[f], src = up || (f === 'imgOn' ? it.defOn || it.def : it.def), on = S().menu === 'icon:notice|' + i;
        const pic = i === 0 && !up ? `<i class="spk-def" style="-webkit-mask-image:url(${it.def});mask-image:url(${it.def})"></i>` : `<img src="${src}" alt="">`;
        return `<span class="${cls} ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="${id || 'notice'}|notice|${i}|${f}" data-stop>${pic}${i === 1 && login && m.badge !== false ? '<i class="bd">99</i>' : ''}</span>${on ? iconMenu('notice', i, f) : ''}`;
      };
      // 跑马灯文字按 spans 分段上色：Key 色用画布上的 --o-<Key>（换配色 / 取色器预览跟着变），自定义色直接写色值；没上色的跟「公告文字」默认色
      const tx = ntSegs(m.text || '', m.spans).map(([str, c]) => (c ? `<em style="color:${c.startsWith('key:') ? `var(--o-${c.slice(4)}, ${ntCol(c)})` : esc(c)}">${esc(str)}</em>` : esc(str))).join('');
      // 滚动一圈的时间按文字长度算（字越多越久），速度档位只改每秒移动的距离
      const w = [...(m.text || '')].reduce((a, c) => a + (/[\u0000-ɏ]/.test(c) ? 0.55 : 1), 0) * 13 + 40;
      const dur = Math.max(4, w / ({ slow: 28, normal: 42, fast: 64 }[m.speed] || 42)).toFixed(1);
      return `<div class="cl-notice sp-${m.speed || 'normal'}">${gi(0, 'spk')}<div class="mq"><span style="animation-duration:${dur}s">${tx}</span></div>${m.mail ? gi(1, 'mail') : ''}</div>`;
    }
    if (b === 'midnav') {
      // 帐户栏（经典蓝白）：左边 未登录=登录/注册，已登录=VIP·用户名·余额；右边 4 个入口
      const login = X().E.D.login; const v = vis('midnav');
      const acct = m.layout === 'account' ? (login
        ? `<div class="cl-user">${window.balUser ? window.balUser() : ''}${window.balBox ? window.balBox() : ''}</div>`
        : `<div class="cl-user out"><span class="lg">${t('mp/acct-login')}</span><span class="rg">${t('mp/acct-reg')}</span></div>`) : '';
      // 图标宽 = size（750 稿）÷ 2，高按 57:50；旧存档的 80/96/112 档位回到 57
      const sz = m.size >= 40 && m.size <= 80 ? m.size : 57, ibs = `width:${sz / 2}px;height:${(sz / 2 * 50 / 57).toFixed(1)}px`;
      // 角标底色按入口存（'midnav.bd-<默认图名>'，可是 'key:<名>' 或十六进制），不再按位置写死
      const { th, ec } = X().liveTheme();
      const bdc = (it, i) => { const v = ec[bdId(it, i)]; const k = v && v.startsWith('key:') ? v.slice(4) : v ? null : bdKey(it); return k ? (th[k] != null ? th[k] : resolveKey(k, th, ec)) : v; };
      return `<div class="cl-acct ${acct ? '' : 'no-acct'}">${acct}<div class="cl-ent" style="grid-template-columns:repeat(${acct ? v.length : m.per},1fr)">${v.map((it) => { const i = m.items.indexOf(it); const src = it.img || it.def; const focus = S().menu === 'icon:midnav|' + i; return `<div class="it"><span class="ib ${src ? 'cu' : it.i ? '' : 'ph'} ${focus ? 'is-focus' : ''}" style="${ibs}" data-act="mpIconMenu" data-arg="${id || 'midnav'}|midnav|${i}" data-stop>${src ? img(src) : ic(it.i || 'plus')}${login && it.badge ? `<i class="bd" style="background:${bdc(it, i)}">${esc(it.badge)}</i>` : ''}</span><span class="nm">${esc(nm(it))}</span>${focus ? iconMenu('midnav', i, 'img') : ''}</div>`; }).join('')}</div></div>`;
    }
    if (b === 'gamemenu') {
      const v = vis('gamemenu'), ai = gmAct();
      // 选中的分类按 m.active（不再固定第一个）；选中态图标 imgOn → 默认选中图 defOn → 未选中图
      const gi = (it, i, on) => { const f = on ? 'imgOn' : 'img', fo = S().menu === 'icon:gamemenu|' + i; const src = on ? it.imgOn || it.defOn || it.img || it.def : it.img || it.def; return [f, fo, src]; };
      if (m.style === 'side') {
        // 竖排分类（经典蓝白 Figma 317:55764）：放在游戏卡片左侧；按钮底默认是效果图底图（可上传 / AI），颜色页签选了底色才换纯色
        const ec = X().E.D.ec || {};
        return `<div class="cl-gm">${v.map((it) => {
          const i = m.items.indexOf(it), on = i === ai, [f, fo, src] = gi(it, i, on);
          const bg = ec[on ? 'gamemenu.active' : 'gamemenu.bg'] ? '' : `<i class="bgi" style="${gmBtnCss(on ? 'btnSel' : 'btnOff')}"></i>`;
          return `<span class="${on ? 'on' : ''} ${bg ? 'has-img' : ''}">${bg}<span class="gi ${fo ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="${id || 'gamemenu'}|gamemenu|${i}|${f}" data-stop>${src ? img(src) : ic(it.i)}</span><b>${esc(nm(it))}</b>${fo ? iconMenu('gamemenu', i, f) : ''}</span>`;
        }).join('')}</div>`;
      }
      // 中部（11-28，Figma 65750:31407）：卡片上方一排横向分类 = 图标 + 名称，选中 = 主色文字 + 下划线（gamemenu.tabActive）；
      // 13 个入口放不下时横向滚动，右侧渐隐提示可滑
      return `<div class="h5-gm-wrap"><div class="h5-gm center" data-sk="gm-${id || b}">${v.map((it) => { const i = m.items.indexOf(it), on = i === ai, [f, fo, src] = gi(it, i, on); return `<span class="${on ? 'on' : ''}"><span class="gi ${fo ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="${id || 'gamemenu'}|gamemenu|${i}|${f}" data-stop>${src ? img(src) : ic(it.i)}</span><b>${esc(nm(it))}</b>${fo ? iconMenu('gamemenu', i, f) : ''}</span>`; }).join('')}</div></div>`;
    }
    if (b === 'gamecards') {
      // 游戏卡片（经典蓝白 Figma 317:55739）：上方 热门/最近/收藏 页签；卡片 = 封面 + 收藏星 + 平台角标 + 名称；第 1 张角标（热门 / 新）、第 8 张示意兜底封面；
      // 底部「另有 N 款游戏 展开」+ 分隔线 + 下一个分类的标题行（图标 · 名称 · 全部）。
      // 卡片外观按卡片样式（11-28，Figma H5/GameCard 65974:81179）：比例、名称在图下 / 压在图上、圆角、角标位置；每行张数 = 生效值（菜单左侧时非横版最多 3）
      const side = gcSide(id), cols = gcColsOf(m), st = gcStyleOf(m);
      // 热门 / 最近 / 收藏 页签：确认稿（左侧 / 中部）都没有，只在页面上没有游戏菜单时显示（gcTabsOn）
      const tabs = gcTabsOn() ? `<div class="tabs">${[1, 11, 12].map((k, j) => `<span class="${j ? '' : 'on'}">${t('mp/gm-n-' + k)}</span>`).join('')}</div>` : '';
      // 只显示整行（2 / 4 列显示 8 张、3 列 9 张），最后一行不会剩一张孤零零的卡；剩下的算进「另有 N 款」
      const shown = Math.max(cols, Math.floor(GAMES.length / cols) * cols), mid = id || b;
      // 画布上点兜底封面 / 收藏星：出 上传 / AI / 恢复 菜单（同面板「⋯」）
      const cvm = (f, j) => (S().menu === 'gccv:' + mid + '|' + f + '|' + j && !X().mobileEd() && X().assetMenuItems ? `<div class="menu icon-menu am-menu gc-cv-menu ${j % cols >= cols / 2 ? 'r' : ''}" data-stop>${X().assetMenuItems('mp-gamecards-' + f)}</div>` : '');
      // 单卡换图：点卡片（图或名称）= 选中这张卡 + 换图菜单；收藏星、第 8 张兜底图示意照旧出各自的菜单
      let cs = gcSelJ(mid);
      if (cs != null && cs >= shown) { X().E.gcSel = null; cs = null; } // 改了每行张数后这张卡不显示了：回到选中整个模块（工具条回来）
      const cards = GAMES.slice(0, shown).map(([n], j) => {
        const fb = j === GC_FB, sf = j ? 'starOff' : 'starSel';
        return gcCardHtml(st, {
          cover: fb ? gcFbInner(m) : gcCover(m, j), name: m.name ? n : '', rec: m.rec !== false && j === 0 && gcRecOk(st), logo: !fb, fb,
          star: `<span class="star" data-act="gcCvMenu" data-arg="${mid}|${sf}|${j}" data-stop>${gcStarImg(m, sf)}</span>`,
          cls: `${fb ? '' : 'gc-pick'} ${cs === j ? 'is-csel' : ''}`, attrs: fb ? '' : `data-act="gcCard" data-arg="${mid}|${j}" data-stop`,
          imAttrs: fb ? `data-act="gcCvMenu" data-arg="${mid}|fallback|${j}" data-stop` : '',
          extra: `${cvm('fallback', j)}${cvm(sf, j)}${cs === j ? gcMenu(mid, m, j) : ''}`,
        });
      }).join('');
      // 标题行 = 当前选中分类的下一个分类（Figma「棋牌游戏」），图标跟游戏菜单的未选中图
      let hd = '';
      const gv = vis('gamemenu'), ai = gmAct(), cur = gv.indexOf(M('gamemenu').items[ai]), nx = gv[(cur + 1) % Math.max(gv.length, 1)];
      if (nx) { const src = nx.img || nx.def; hd = `<div class="hd"><span class="hi">${src ? img(src) : ic(nx.i)}</span><b>${esc(t('mp/gc-cat-title', { n: nm(nx) }))}</b><small>${t('mp/gc-all')}</small></div>`; }
      // 欧美卡片名称默认固定白字（cards_text 欧美分支）；业主改了「游戏名称」颜色（含取色中实时预览）才跟 --e-gamecards-text（tc-own）
      const tcOwn = !!X().liveTheme().ec['gamecards.text'];
      return `<div class="cl-gc st-${st} ${side ? 'is-side' : 'is-solo'} ${tcOwn ? 'tc-own' : ''}">${tabs}<div class="grid c${cols}" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${cards}</div><div class="more">${t('mp/gc-more-n', { n: `<em>${14 + GAMES.length - shown}</em>` })} <b>${t('mp/gc-expand')}${ic('caret-down')}</b></div>${hd}</div>`;
    }
    if (b === 'footer') return `<div class="h5-foot" style="text-align:${m.align}"><div class="ln">${vis('footer').map((x) => esc(nm(x))).join(' · ')}</div><div>${esc(m.copy)}</div></div>`;
    return '';
  }
  // ---------- 底部导航（经典蓝白 Figma 317:55538）：未登录图 / 名称、凸起项、预览选中、颜色 ----------
  // 凸起样式只落在「分享赚钱」（raised），未登录「优惠」是 100×100 动效礼盒（bigOut）；旧存档没有标记时按默认图名认
  const bnRaised = (it) => !!(it.raised || (it.raised == null && baseOf(it.def) === 'bi2'));
  const bnBig = (it) => !!(it.bigOut || (it.bigOut == null && baseOf(it.defOut) === 'bo1'));
  // 未登录跟已登录图不一样的入口（「优惠」礼盒、「注册」）：未登录图单独存 imgOut，上传已登录图不会把它换掉
  const bnHasOut = (it) => !!(it.defOut && (it.outN || it.outK || bnBig(it)));
  const bnLogin = () => !!X().E.D.login;
  const bnOffF = (it, login = bnLogin()) => (!login && bnHasOut(it) ? 'imgOut' : 'img'); // 当前登录态下「未选中」图存哪个字段
  const bnName = (it, login = bnLogin()) => (!login && (it.outN || it.outK) ? it.nOut || it.outN || t(it.outK) : nm(it)); // outN = 旧存档写死的中文
  // 某个字段当前显示的图：未选中 = 上传图 > 默认图（未登录用未登录默认图）；选中 = 上传选中图 > 默认选中图 > 沿用未选中图
  function bnSrc(it, f, login = bnLogin()) {
    if (f === 'imgOn') return it.imgOn || it.defOn || bnSrc(it, bnOffF(it, login), login);
    if (f === 'imgOut') return it.imgOut || it.defOut || it.img || it.def;
    return it.img || (!login && it.defOut) || it.def || null;
  }
  function bnSpec(i, f) { const it = M('bottomnav').items[i]; if (!it) return null; if (f === 'imgOut' && bnBig(it)) return [100, 100]; return bnRaised(it) && M('bottomnav').style === 'raised' ? [120, 120] : [50, 50]; }
  // 画布预览哪个入口是选中态（编辑器状态，不进设计数据）：点画布上的导航名称切换；隐藏了就退回第一个
  const bnAct = () => { const E = X().E, its = M('bottomnav').items, a = its[E.bnAct | 0]; return a && a.on ? E.bnAct | 0 : its.findIndex((x) => x.on); };
  A.bnAct = (i) => { const E = X().E; if (E.sel !== 'bottomnav') A.selMod('bottomnav'); E.bnAct = +i; S().menu = null; };
  // 面板缩略图：点一下上传；有上传图时右上角小按钮恢复这一张（跟画布图标菜单一样按状态恢复）
  function bnThumb(i, f) {
    const it = M('bottomnav').items[i], src = bnSrc(it, f), same = f === 'imgOn' && !it.imgOn && !it.defOn;
    const lab = t(f === 'imgOn' ? 'mp/state-act' : 'mp/state-def') + (f === 'imgOut' ? ' · ' + t('ed/signed-out') : '') + (same ? ' · ' + t('mp/gm-same') : '');
    const rb = it[f] ? `<button class="rb" data-act="mpIconReset" data-arg="bottomnav|${i}|${f}" title="${esc(t('mp/icon-reset'))}" aria-label="${esc(t('mp/icon-reset'))}">${ic('arrow-counter-clockwise')}</button>` : '';
    return `<span class="bn-th"><button class="thumb sq up st2 ${f === 'imgOn' ? 'on' : ''} ${same ? 'is-same' : ''} ${src ? 'is-cu' : ''}" data-act="mpIcon" data-arg="bottomnav|${i}|${f}" title="${esc(lab + ' · ' + t('mp/icon-replace'))}" aria-label="${esc(lab)}">${src ? img(src) : ic(it.i)}<span class="ub">${ic('upload-simple')}</span></button>${rb}</span>`;
  }
  function bnav() {
    // 第 4 个未登录=注册、已登录=存款；优惠未登录用动效礼盒；「分享赚钱」凸起大图标
    const m = M('bottomnav'), v = vis('bottomnav'), login = bnLogin(), ai = bnAct();
    return v.map((it) => {
      const i = m.items.indexOf(it), act = i === ai, off = bnOffF(it, login), f = act ? 'imgOn' : off, foc = S().menu === 'icon:bottomnav|' + i;
      const src = bnSrc(it, f, login), big = off === 'imgOut' && bnBig(it) && src === bnSrc(it, off, login) ? 'big' : '';
      return `<span class="it ${act ? 'on' : ''} ${m.style === 'raised' && bnRaised(it) ? 'raised' : ''}" data-act="bnAct" data-arg="${i}"><span class="bi ${big} ${foc ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="bottomnav|bottomnav|${i}|${f}" data-stop>${src ? img(src) : ic(it.i)}</span><span class="lb">${esc(bnName(it, login))}</span>${foc ? iconMenu('bottomnav', i, f) : ''}</span>`;
    }).join('');
  }
  // 颜色：同游戏菜单做法（'key:<名>' 引用 68 Key），「默认」= Figma 绑定的 Key（跟设计：web_btmnav_db / btmnav_def / btmnav_active）
  const BN_SW = { 'bottomnav.bg': ['web_btmnav_db', 'bg_2', 'bg_1', 'lead'], 'bottomnav.def': ['btmnav_def', 'neutral_2', 'neutral_1', 'lead'], 'bottomnav.active': ['btmnav_active', 'primary', 'accent_3', 'lead'] };
  function bnColor() {
    const x = X(), E = x.E, { th, ec } = x.liveTheme(), D = E.D;
    const kv = kvOf(th, ec);
    const row = (id) => {
      const key = EL.bottomnav.find((r) => r[0] === id)[1], v = D.ec[id] || null, lab = t('mp/c-' + id.replace('.', '-')), pk = E.picker && E.picker.elRow === id;
      return colorRow(lab, { act: 'bnColor', id, v, key, sws: BN_SW[id], kv, pk, pickArg: `${id}|${key}`, col: curCol(ec[id], key, kv) }, pk ? x.pickerHtml('in-panel', lab) : '');
    };
    const fallback = vis('bottomnav').some((it) => !bnSrc(it, bnOffF(it)));
    return `<div class="p-sec">${row('bottomnav.bg')}</div>
      <div class="p-sec"><div class="lab">${t('mp/bn-c-text')}</div>${row('bottomnav.def')}${row('bottomnav.active')}</div>
      <div class="p-sec"><div class="lab">${t('mp/entries')}</div>${note(fallback ? 'mp/bn-c-icons-fb' : 'mp/bn-c-icons')}</div>`;
  }
  const bnavCls = () => `h-${M('bottomnav').h}`;
  // 导航文字放不下（字号调大 / 越南文长名 / 98 矮栏）时不掉出导航栏：改成一行，字号在画布上最多缩到设定的 75%（不小于 8px），
  // 还放不下就省略号；鼠标悬停看全名。只改画布显示，面板里的字号设定不变
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('.h5-bnav').forEach((bar) => {
      const bb = bar.getBoundingClientRect(); if (!bb.height) return;
      const s = bb.height / bar.offsetHeight || 1;
      bar.querySelectorAll('.lb').forEach((lb) => {
        lb.removeAttribute('style'); lb.removeAttribute('title');
        const over = () => lb.getBoundingClientRect().bottom > bb.bottom + 0.5 * s;
        if (!over()) return;
        Object.assign(lb.style, { display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }); lb.title = lb.textContent;
        const fs0 = parseFloat(getComputedStyle(lb).fontSize), min = Math.max(8, Math.floor(fs0 * 0.75)); let fs = fs0;
        while ((over() || lb.scrollWidth > lb.clientWidth) && fs > min) { fs -= 1; lb.style.fontSize = fs + 'px'; }
        while (over() && fs > 8) { fs -= 1; lb.style.fontSize = fs + 'px'; }
      });
    });
  });
  function side() {
    const m = M('sidebar');
    const head = m.head && m.headOn ? `<div class="hd" style="filter:${m.head}"></div>` : '';
    return `<div class="pn ${m.style}" style="width:${m.width}%" data-act="selMod" data-arg="sidebar" data-stop>${head}${vis('sidebar').map((it, k) => { const i = m.items.indexOf(it), on = S().menu === 'icon:sidebar|' + i; return `<div class="${k ? '' : 'on'}"><span class="si ${on ? 'is-focus' : ''}" data-act="mpIconMenu" data-arg="sidebar|sidebar|${i}" data-stop>${it.img ? img(it.img) : ic(it.i)}</span>${esc(nm(it))}${on ? iconMenu('sidebar', i, 'img') : ''}</div>`; }).join('')}</div>`;
  }

  // ---------- 动作 ----------
  for (const [b, keys] of Object.entries({ notice: ['speed'], jackpot: ['anim', 'layout', 'margin', 'corner'], midnav: ['mode', 'layout', 'per', 'size'], footer: ['align'], sidebar: ['style', 'width'], bottomnav: ['mode', 'style', 'h'] })) {
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
  // 帐户栏入口角标文字（空 = 不显示角标）
  I.mpMidBadge = (v, el) => { const x = X(), i = +el.dataset.i; if (typing !== 'midbd' + i) { x.commit(() => {}); typing = 'midbd' + i; } x.E.D.m.midnav.items[i].badge = v.trim() ? v.slice(0, 9) : null; x.save(); return true; };
  document.addEventListener('click', () => { typing = null; }, true);

  // ---------- 公告内容富文本（Waydon 2026-11-27 第 5 条；Figma 440:635497 NT-01 / NT-02 / NT-M02，规格 442:37665 ⑤⑥⑦） ----------
  // contenteditable 输入框：没单独上色的字用面板正文色显示，上过色的段落直接用它的 Key / 自定义色。选中 ≥1 个字出颜色条（NT/RichColorBar）：
  // 电脑浮在选区上方 8px、水平居中、夹在面板内容区里；手机贴在输入框正下方（不挡系统复制 / 粘贴菜单）。点色块立即上色，一次 = 一步撤销。
  // 输入不换行（跑马灯一行）、粘贴只取纯文本、上限 80 字；输入法组字过程中不重渲染。
  const NT_KEYS = ['neutral_1', 'neutral_2', 'primary', 'lead', 'accent_1', 'accent_2', 'accent_3'];
  function ntCol(c) { if (!c) return ''; if (!c.startsWith('key:')) return c; const { th, ec } = X().liveTheme(); const k = c.slice(4); return th[k] != null ? th[k] : resolveKey(k, th, ec); }
  function ntSegs(text, spans) { const o = []; let p = 0; spNorm(spans, text.length).forEach((x) => { if (x.s > p) o.push([text.slice(p, x.s), null]); o.push([text.slice(x.s, x.e), x.c]); p = x.e; }); if (p < text.length) o.push([text.slice(p), null]); return o; }
  const ntRich = (m) => ntSegs(m.text || '', m.spans).map(([str, c]) => (c ? `<span data-c="${esc(c)}" style="color:${esc(ntCol(c))}">${esc(str)}</span>` : esc(str))).join('');
  function ntTextSec(m) {
    const x = X(), P = x.E.picker, pk = P && P.ntSpan;
    const sw = NT_KEYS.map((k) => { const c = ntCol('key:' + k), tip = swTip(keyLabel(k), c); return `<button class="sw-btn" data-act="ntColor" data-arg="key:${k}" data-c="key:${k}" style="background:${c}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="false"></button>`; }).join('');
    const bar = `<div class="nt-cbar ${x.mobileEd() ? 'is-inline' : ''}" data-ntbar role="toolbar" aria-label="${esc(t('mp/nt-text'))}" hidden>${sw}<button class="rainbow" data-act="ntPick" data-c="custom" title="${esc(t('tx/c-custom'))}" aria-label="${esc(t('tx/c-custom'))}" aria-pressed="false"></button><i class="nt-div"></i><button class="nt-clear" data-act="ntColor" data-arg="" title="${esc(t('mp/nt-clear'))}" aria-label="${esc(t('mp/nt-clear'))}"></button><i class="nt-ptr"></i></div>`;
    return `<div class="p-sec nt-text-sec" data-ntsec><div class="lab">${t('mp/nt-text')}<span class="nt-cnt">${(m.text || '').length}/${NT_MAX}</span></div>`
      + `<div class="nt-rich" contenteditable="true" role="textbox" aria-multiline="false" spellcheck="false" aria-label="${esc(t('mp/nt-text'))}" data-ntrich>${ntRich(m)}</div>${bar}`
      + `<div class="p-note nt-hint" data-nthint>${t('mp/nt-hl')}</div>${pk ? x.pickerHtml('in-panel', t('tx/c-custom')) : ''}</div>`;
  }
  let ntLive = null; // 输入框里的选区（字符下标 { s, e }）；重渲染后按它恢复焦点和选区，失焦时清掉
  let ntComp = false, ntTyping = false; // 输入法组字中；一段连续输入只记一步撤销
  const ntEd = () => document.querySelector('#app [data-ntrich]');
  const inNt = (n) => { const el = n && (n.nodeType === 1 ? n : n.parentElement); return el && el.closest ? el.closest('[data-ntrich]') : null; };
  const inBar = (n) => !!(n && n.nodeType === 1 && n.closest && n.closest('[data-ntbar]')); // 键盘 Tab 进颜色条：焦点在色块上也算「选区还在」
  const spEq = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);
  const ntOff = (root, node, off) => { const r = document.createRange(); r.selectNodeContents(root); try { r.setEnd(node, off); } catch (e) { return 0; } return r.toString().length; };
  function ntGetSel(root) {
    const s = window.getSelection(); if (!s || !s.rangeCount) return null; const r = s.getRangeAt(0);
    if (!root.contains(r.startContainer) || !root.contains(r.endContainer)) return null;
    return { s: ntOff(root, r.startContainer, r.startOffset), e: ntOff(root, r.endContainer, r.endOffset) };
  }
  function ntSetSel(root, s, e) {
    const at = (n) => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let tn, acc = 0, last = null; while ((tn = w.nextNode())) { if (n <= acc + tn.data.length) return [tn, n - acc]; acc += tn.data.length; last = tn; } return last ? [last, last.data.length] : [root, 0]; };
    const [a, ao] = at(s), [b, bo] = at(e); const r = document.createRange(); r.setStart(a, ao); r.setEnd(b, bo);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  // DOM → 纯文本 + spans（颜色看最近的 data-c；浏览器自己插的标签只取文字）
  function ntParse(root) {
    let text = ''; const sp = [];
    const walk = (n, c) => n.childNodes.forEach((k) => {
      if (k.nodeType === 3) { const v = k.data.replace(/[\r\n\t ]/g, ' '); if (c && v) sp.push({ s: text.length, e: text.length + v.length, c }); text += v; }
      else if (k.nodeType === 1 && k.tagName !== 'BR') walk(k, (k.dataset && k.dataset.c) || c);
    });
    walk(root, null);
    return { text, spans: spNorm(sp, text.length) };
  }
  function ntInput(ed) {
    const x = X(), m = ntM(), r = ntParse(ed); let sel = ntGetSel(ed) || { s: r.text.length, e: r.text.length };
    const cut = r.text.length > NT_MAX;
    if (cut) { r.text = r.text.slice(0, NT_MAX); r.spans = spNorm(r.spans, NT_MAX); sel = { s: Math.min(sel.s, NT_MAX), e: Math.min(sel.e, NT_MAX) }; }
    ntLive = sel;
    if (r.text === m.text && spEq(r.spans, m.spans)) { if (cut) window.render(); return; }
    if (!ntTyping) { x.commit(() => {}); ntTyping = true; }
    m.text = r.text; m.spans = r.spans; x.save(); window.render();
  }
  // 选区现在的颜色：整段同一个颜色才算（色块带选中圈），混色 = 'mixed'
  const ntSelC = (r) => { const sp = ntM().spans; let c0 = null; for (let i = r.s; i < r.e; i++) { const q = sp.find((y) => y.s <= i && i < y.e); const c = q ? q.c : null; if (i === r.s) c0 = c; else if (c !== c0) return 'mixed'; } return c0; };
  function ntSync() {
    const ed = ntEd(); if (!ed) return;
    const sec = ed.closest('[data-ntsec]'), bar = sec && sec.querySelector('[data-ntbar]'), hint = sec && sec.querySelector('[data-nthint]'); if (!bar) return;
    const a0 = document.activeElement, r = (a0 === ed || inBar(a0)) && ntLive && ntLive.e > ntLive.s ? ntLive : null;
    sec.classList.toggle('is-sel', !!r);
    const h = r ? t('mp/nt-sel', { n: r.e - r.s }) : t('mp/nt-hl'); if (hint && hint.textContent !== h) hint.textContent = h;
    if (!r) { bar.hidden = true; return; }
    const cur = ntSelC(r);
    bar.querySelectorAll('[data-c]').forEach((b) => { const on = b.dataset.c === cur || (b.dataset.c === 'custom' && !!cur && cur[0] === '#'); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    // 选中的字是自定义色：彩虹中间填上那个颜色（同颜色行 .rainbow.has-val）
    const rb = bar.querySelector('.rainbow'), cu = cur && cur[0] === '#' ? hexOf(cur) : null;
    if (rb) { rb.classList.toggle('has-val', !!cu); if (cu) rb.style.setProperty('--c', cu.css); else rb.style.removeProperty('--c'); }
    bar.hidden = false;
    if (bar.classList.contains('is-inline')) return;
    const s = window.getSelection(); if (!s || !s.rangeCount) return;
    const rg = s.getRangeAt(0), q = [...rg.getClientRects()].find((z) => z.width > 0) || rg.getBoundingClientRect();
    const sr = sec.getBoundingClientRect(), bw = bar.offsetWidth, bh = bar.offsetHeight, cx = q.left + q.width / 2 - sr.left;
    const left = Math.max(0, Math.min(sr.width - bw, cx - bw / 2));
    bar.style.left = left + 'px'; bar.style.top = (q.top - sr.top - 8 - bh) + 'px';
    bar.style.setProperty('--ptr', Math.max(14, Math.min(bw - 14, cx - left)) + 'px');
  }
  A.ntColor = (c) => {
    const x = X(), m = ntM(), r = ntLive; if (!r || r.e <= r.s) return false;
    const sp = spNorm(spPaint(m.spans, r.s, r.e, c || null), m.text.length); if (spEq(sp, m.spans)) return false;
    ntTyping = false; x.E.picker = null;
    x.commit(() => { M('notice').spans = sp; });
  };
  // 彩虹 = 自定义：打开编辑器自带的取色器（面板内，跟颜色行一样），应用时给记下的选区上色
  A.ntPick = () => {
    const x = X(), r = ntLive; if (!r || r.e <= r.s) return false;
    if (x.E.picker && x.E.picker.ntSpan) { x.E.picker = null; return; }
    const c = ntSelC(r), cur = (ntCol(c && c !== 'mixed' ? c : x.E.D.ec['notice.text'] || 'key:neutral_1') || '#333333').slice(0, 7);
    const span = { s: r.s, e: r.e }; ntTyping = false; ntLive = null;
    x.E.picker = { key: 'primary', elRow: 'nt.span', label: t('tx/c-custom'), orig: cur, value: cur, where: 'el', ntSpan: span, onApply: (v) => { ntLive = span; A.ntColor(v.toLowerCase()); } };
  };
  document.addEventListener('input', (e) => { const ed = inNt(e.target); if (!ed || e.isComposing || ntComp) return; ntInput(ed); });
  document.addEventListener('compositionstart', (e) => { if (inNt(e.target)) ntComp = true; });
  document.addEventListener('compositionend', (e) => { const ed = inNt(e.target); ntComp = false; if (ed) ntInput(ed); });
  // 捕获阶段先拦：Enter 不换行；Esc 只收起颜色条（不关面板）；Ctrl/⌘+Z / Y 走编辑器的撤销（不用浏览器自带的）
  document.addEventListener('keydown', (e) => {
    // 焦点在颜色条色块上按 Esc：收起颜色条，光标回到输入框（选区末尾），不关面板
    if (e.key === 'Escape' && inBar(e.target)) { e.preventDefault(); e.stopPropagation(); const ed0 = ntEd(), s0 = ntLive; if (ed0 && s0) { ntLive = { s: s0.e, e: s0.e }; ed0.focus({ preventScroll: true }); ntSetSel(ed0, s0.e, s0.e); } ntSync(); return; }
    const ed = inNt(e.target); if (!ed || e.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') { e.preventDefault(); return; }
    if (e.key === 'Escape') { const s = ntLive; if (s && s.e > s.s) { e.preventDefault(); e.stopPropagation(); ntLive = { s: s.e, e: s.e }; ntSetSel(ed, s.e, s.e); ntSync(); } return; }
    const k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'y')) {
      e.preventDefault(); e.stopPropagation(); ntTyping = false;
      if ((k === 'y' || e.shiftKey ? A.redo() : A.undo()) !== false) { const L = (ntM().text || '').length; if (ntLive) ntLive = { s: Math.min(ntLive.s, L), e: Math.min(ntLive.e, L) }; window.render(); }
    }
  }, true);
  document.addEventListener('paste', (e) => {
    const ed = inNt(e.target); if (!ed) return; e.preventDefault();
    const s = ntGetSel(ed) || { s: 0, e: 0 }, room = NT_MAX - ((ntM().text || '').length - (s.e - s.s));
    const v = ((e.clipboardData && e.clipboardData.getData('text/plain')) || '').replace(/[\r\n\t]+/g, ' ').slice(0, Math.max(0, room));
    if (v) document.execCommand('insertText', false, v);
  });
  document.addEventListener('drop', (e) => { if (inNt(e.target)) e.preventDefault(); });
  // 点颜色条不抢输入框焦点（选区保持）
  document.addEventListener('mousedown', (e) => { if (e.target.closest && e.target.closest('[data-ntbar]')) e.preventDefault(); });
  document.addEventListener('selectionchange', () => { const ed = ntEd(); if (!ed) return; const s = document.activeElement === ed ? ntGetSel(ed) : null; if (s) ntLive = s; ntSync(); });
  // 失焦：等这一轮渲染完再看焦点在不在新的输入框里（点色块会重渲染，输入框换了一个）
  // 键盘 Tab 从输入框进到颜色条（或在色块之间切换）不算失焦，颜色条留着；离开颜色条 / 输入框才收起
  document.addEventListener('focusout', (e) => {
    if (!inNt(e.target) && !inBar(e.target)) return;
    setTimeout(() => { const ed = ntEd(), a = document.activeElement; if (ed && a && (ed.contains(a) || inBar(a))) { ntSync(); return; } ntLive = null; ntTyping = false; ntSync(); }, 0);
  });
  // 键盘焦点在颜色条哪个按钮上（data-c / 清除）：重渲染（上色、自动保存）后放回同一个按钮，不跳回输入框
  let ntBarK = null;
  document.addEventListener('focusin', (e) => { const n = e.target; ntBarK = inBar(n) ? (n.dataset && n.dataset.c) || (n.classList.contains('nt-clear') ? 'clear' : null) : null; });
  window.AFTER_RENDER.push(() => {
    const ed = ntEd(), k = ntBarK; if (!ed) { ntLive = null; return; }
    if (ntLive) { const L = (ntM().text || '').length; ed.focus({ preventScroll: true }); ntSetSel(ed, Math.min(ntLive.s, L), Math.min(ntLive.e, L)); }
    ntSync();
    const bar = ntLive && k && (ed.closest('[data-ntsec]') || document).querySelector('[data-ntbar]');
    const btn = bar && !bar.hidden && bar.querySelector(k === 'clear' ? '.nt-clear' : `[data-c="${k}"]`); if (btn) btn.focus({ preventScroll: true });
  });

  // ---------- 改名（ED-19）：上限中文 6 字 / 12 个字符 ----------
  const wlen = (s) => [...s].reduce((a, c) => a + (/[\u0000-ɏ]/.test(c) ? 1 : 2), 0);
  // 底部导航未登录时改「注册」改的是未登录名称 nOut（已登录「存款」不受影响）
  A.rnStart = (arg) => { const [b, i] = arg.split('|'); const it = M(b).items[+i]; const out = b === 'bottomnav' && !bnLogin() && (it.outN || it.outK); X().E.rn = { b, i: +i, v: out ? bnName(it) : nm(it), f: out ? 'nOut' : 'n', err: false }; S().menu = null; };
  I.rnIn = (v) => { const R = X().E.rn; if (!R) return; R.v = v; const err = wlen(v.trim()) > 12; if (err !== R.err) { R.err = err; return true; } };
  function rnSave() {
    const x = X(); const R = x.E.rn; if (!R) return;
    const v = R.v.trim();
    if (R.err) return; // 超长阻止保存
    const it = x.E.D.m[R.b].items[R.i];
    x.E.rn = null;
    if (!v || v === (R.f === 'nOut' ? bnName(it) : nm(it))) return;
    x.commit(() => { x.E.D.m[R.b].items[R.i][R.f || 'n'] = v; });
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
    const [w, h] = specOf(b, i, f);
    // 「✦ AI 生成」排第一（跟素材 ⋯ 菜单一致），打开统一面板「只这一个」
    const ai = b !== 'footer' && window.AIG && window.AIG.can(b) ? `<button class="menu-item" data-act="aigOpen" data-arg="${b}|icons|${i}" data-stop>${ic('sparkle-fill')}${t('aig/menu')}</button>` : '';
    // 素材库（Waydon 11-27 第 2 条）：有昨天生成的风格图的入口才出，只列这个入口的 5 种风格
    const lib = libIcons(b, i, f) ? `<button class="menu-item" data-act="openLib" data-arg="ic:${b}|${i}|${f}" data-stop>${ic('stack-fill')}${t('ed/library')}</button>` : '';
    return `<div class="menu icon-menu" data-stop>${ai}<button class="menu-item" data-act="mpIcon" data-arg="${b}|${i}|${f}" data-stop>${ic('upload-simple')}<span class="tx"><span>${t('mp/icon-replace')}</span><span class="sub">${t('mp/icon-spec')} · ${w}×${h}</span></span></button>${lib}<button class="menu-item" data-act="mpIconReset" data-arg="${b}|${i}|${f}" data-stop ${has ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('mp/icon-reset')}</button></div>`;
  }
  let fileIn = null, target = null;
  function pickIcon(b, i, f) {
    target = { b, i: +i, f };
    if (!fileIn) {
      fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = window.IMG_ACCEPT; fileIn.style.display = 'none'; fileIn.setAttribute('data-icon-file', '');
      document.body.appendChild(fileIn);
      fileIn.addEventListener('change', () => {
        const file = fileIn.files[0]; fileIn.value = ''; if (!file || !target) return;
        if (!window.imgOk(file)) { window.toast(t('mp/icon-bad'), { info: true }); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const { b: mb, i: mi, f: mf } = target; const x = X();
          x.commit(() => { x.E.D.m[mb].items[mi][mf] = rd.result; });
          if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
          const mit = x.E.D.m[mb].items[mi];
          window.toast(t('mp/icon-replaced', { n: mb === 'bottomnav' ? bnName(mit, mf === 'imgOut' ? false : bnLogin()) : nm(mit) }), x.undoOpt(4000));
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
    if (f ? !it[f] : !(it.img || it.imgOn || it.imgOut)) return false;
    x.commit(() => { const it2 = x.E.D.m[b].items[+i]; if (f) delete it2[f]; else { delete it2.img; delete it2.imgOn; delete it2.imgOut; } });
    S().menu = null; if (x.E.mpanel === 'iconmenu') x.E.mpanel = 'module';
    window.toast(t('mp/icon-reset-toast'), x.undoOpt(4000));
  };
  A.mpIconMenu = (arg) => {
    const [id, b, i, f] = arg.split('|'); const x = X(); const E = x.E;
    if (E.sel !== id) { E.tab = 'content'; E.ai = null; E.picker = null; }
    E.sel = id; E.h5side = b === 'sidebar'; if (E.tab !== 'content') E.tab = 'content';
    if (x.mobileEd()) { E.iconMenu = { b, i: +i, f: f || 'img' }; E.mpanel = 'iconmenu'; S().menu = null; }
    else S().menu = S().menu === 'icon:' + b + '|' + i ? null : 'icon:' + b + '|' + i;
  };
  function iconSheet() {
    const m = X().E.iconMenu; if (!m) return '';
    const it = M(m.b).items[m.i];
    const src = m.b === 'bottomnav' ? bnSrc(it, m.f) : it[m.f] || defSrc(it, m.f, m.b);
    return `<div class="icon-sheet-hd">${src ? img(src) : ic(it.i || 'plus')}<b>${esc(m.b === 'bottomnav' ? bnName(it) : nm(it))}</b></div>${iconMenu(m.b, m.i, m.f).replace('menu icon-menu', 'icon-sheet-list')}`;
  }
  // 画布里的图标菜单：fixed 定位到图标正下方（放不下就往上）
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('body > .icon-menu, body > .tb-ic-menu').forEach((n) => n.remove());
    const m = document.querySelector('#app .icon-menu'); if (!m) return;
    const f = m.parentElement.querySelector('.is-focus'); if (!f) return;
    // 画布有缩放（transform），fixed 会相对画布定位，所以把菜单移到 body 下
    const r = f.getBoundingClientRect();
    document.body.appendChild(m);
    // 菜单不超出手机画布边框（Waydon 2026-11-26 19:13）：左右、上下都限制在 .h5 范围内；画布比菜单窄时靠画布左边
    const fr = (f.closest('.h5') || document.querySelector('.ed-canvas .h5') || document.body).getBoundingClientRect();
    m.style.position = 'fixed'; m.style.width = Math.min(240, Math.floor(fr.width - 8)) + 'px';
    const mw = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.max(fr.left + 4, Math.min(r.left - 4, fr.right - 4 - mw)) + 'px';
    const below = r.bottom + 6, above = r.top - 6 - h;
    m.style.top = (below + h <= fr.bottom - 4 ? below : Math.max(fr.top + 4, above)) + 'px';
  });

  // 画布里其它锚定菜单（游戏卡片封面、顶部栏图标）：同样移到 body、限制在手机画布边框内
  window.AFTER_RENDER.push(() => {
    document.querySelectorAll('#app .ed-canvas .gc-cv-menu, #app .ed-canvas .tb-ic-menu').forEach((m) => {
      const anc = m.parentElement; const fr = (anc.closest('.h5') || document.body).getBoundingClientRect(); const r = anc.getBoundingClientRect();
      document.body.appendChild(m); m.classList.remove('r');
      m.style.position = 'fixed'; m.style.right = 'auto'; m.style.margin = '0'; m.style.zIndex = '60'; m.style.width = Math.min(240, Math.floor(fr.width - 8)) + 'px';
      const mw = m.offsetWidth, h = m.offsetHeight;
      m.style.left = Math.max(fr.left + 4, Math.min(r.left, fr.right - 4 - mw)) + 'px';
      const below = r.bottom + 4, above = r.top - 4 - h;
      m.style.top = (below + h <= fr.bottom - 4 ? below : Math.max(fr.top + 4, above)) + 'px';
    });
  });

  // ---------- AI 生成一套图标（ED-04） ----------
  const VSTYLES = ['glass', 'flat', '3d', 'line', 'fill', 'duotone', 'metal', 'gradient']; // 矢量款式（AI 首页设计 AD 也用）
  // 默认款式（Waydon 2026-11-26）：用 Figma generate image 生成的 5 种真实风格图，放 assets/ai-*/；面板只显示这 5 种 + 4 种矢量款式
  const RSTY = ['glossy', 'flat', 'blackgold', 'festive', 'neon'];
  const R_FALL = { glossy: ['glass', null], flat: ['flat', null], blackgold: ['metal', '#C9A55A'], festive: ['3d', '#E83A30'], neon: ['line', '#8A5CFF'] };
  const baseOf = (p) => (p ? String(p).split('/').pop().replace(/\.\w+$/, '') : '');
  const RMAP = {
    notice: (it) => ({ 'mp/nt-i-spk': 'ai-notice/spk', 'mp/nt-i-mail': 'ai-notice/mail' })[it.k],
    midnav: (it) => ({ mid0: 'ai-acct/dep', mid1: 'ai-acct/vip', mid2: 'ai-acct/share', mid3: 'ai-acct/more' })[baseOf(it.def)],
    bottomnav: (it, f) => (baseOf(it.def) === 'bi3' && f !== 'imgOut' && (f === 'img' || bnLogin()) ? null : { bi0: 'ai-bnav/home', bi1: 'ai-bnav/promo', bi2: 'ai-bnav/bonus', bi3: 'ai-bnav/invite', bi4: 'ai-bnav/mine' }[baseOf(it.def)]),
    gamemenu: (it) => { const m = /^mp\/gm-n-(\d+)$/.exec(it.k || ''); return m ? 'ai-gm/g' + m[1] : null; },
  };
  // 某个入口在某款式下的图：有真实风格图就用图（底部导航默认态用 -off 灰图），没有就用对应矢量款式画
  function styleSrc(b, it, style, color, f) {
    if (/^r-/.test(style)) {
      const st = style.slice(2); const r = RMAP[b] && RMAP[b](it, f);
      if (r) { const src = 'assets/' + r + '-' + st + (b === 'bottomnav' && (f === 'img' || (f === 'imgOut' && !bnBig(it))) ? '-off' : '') + '.webp'; return b === 'notice' ? tintSrc(src, color) : src; }
      const [vs, c] = R_FALL[st]; return aiSvg(it.i || 'sparkle-fill', vs, b === 'notice' ? color : c || color);
    }
    // 公告栏矢量款式照 Figma G3 公告栏（线性 / 面性 / 双色 / 渐变缩略图）用铃铛图形、主色画（图标集里没有喇叭 / 信封）
    return aiSvg(b === 'notice' && !(window.PH || {})[it.i] ? 'bell-fill' : it.i || 'sparkle-fill', style, color);
  }
  // 公告栏 AI 图标统一主色（Waydon 2026-11-27 第 1 条；Figma G3 公告栏位图候选调向主色）：实物款式的样图按主色色相重新着色
  // （保留明暗和透明度，接近灰白的高光不动），结果缓存成 dataURL；第一次用时先给原图，着色好了再刷新一次
  const TINT = {}; let tintRr = 0;
  function rgbHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; }
  function hslRgb(h, s, l) { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
  function tintSrc(src, hex) {
    if (!/^#[0-9a-f]{6}/i.test(hex || '')) return src;
    const k = src + '|' + hex.slice(0, 7).toLowerCase(), v = TINT[k]; if (v) return v === 1 ? src : v;
    TINT[k] = 1;
    const im = new Image();
    im.onload = () => {
      try {
        const sc = Math.min(1, 160 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc));
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, w, h);
        const d = g.getImageData(0, 0, w, h), px = d.data, n = parseInt(hex.slice(1, 7), 16), [ph, ps] = rgbHsl(n >> 16, (n >> 8) & 255, n & 255);
        for (let i = 0; i < px.length; i += 4) { if (!px[i + 3]) continue; const [, s0, l0] = rgbHsl(px[i], px[i + 1], px[i + 2]); if (s0 < 0.08) continue; const [r, gg, b] = hslRgb(ph, Math.min(1, (s0 + ps) / 2), l0); px[i] = r; px[i + 1] = gg; px[i + 2] = b; }
        g.putImageData(d, 0, 0); TINT[k] = cv.toDataURL('image/webp', 0.9);
      } catch (e) { TINT[k] = src; } // file:// 直接打开源码时画布被污染，退回原图
      clearTimeout(tintRr); tintRr = setTimeout(() => { if (S().route === 'editor') window.render(); }, 40);
    };
    im.onerror = () => { TINT[k] = src; };
    im.src = (window.A_ && src.startsWith('assets/') && window.A_[src.slice(7)]) || src;
    return src;
  }
  const tType = (b) => (b === 'gamemenu' ? 'gametype' : b); // 流水里的类型名
  function lighten(hex, k) { const n = parseInt(hex.slice(1, 7), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k)); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); }
  // 模拟 AI 结果：按款式把 Phosphor 图标画成 SVG dataURL
  function aiSvg(icon, style, color) {
    const PH = window.PH; const reg = icon.replace(/-fill$/, '');
    const path = style === 'line' && PH[reg] ? PH[reg] : PH[icon] || PH['sparkle-fill'];
    if (style === 'fill') return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g transform="translate(12 12) scale(.28)" fill="${color}">${path}</g></svg>`);
    let bg = '', fg = '#fff';
    if (style === 'glass') bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".95"/><stop offset="1" stop-color="${color}" stop-opacity=".45"/></linearGradient></defs><rect x="4" y="4" width="88" height="88" rx="24" fill="url(#g)"/><rect x="4.5" y="4.5" width="87" height="87" rx="23.5" fill="none" stroke="#fff" stroke-opacity=".6"/><path d="M12 32Q48 8 84 32V14Q84 6 76 6H20Q12 6 12 14Z" fill="#fff" fill-opacity=".22"/>`;
    else if (style === 'flat') bg = `<rect x="4" y="4" width="88" height="88" rx="20" fill="${color}"/>`;
    else if (style === '3d') bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(color, 0.35)}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><rect x="6" y="10" width="84" height="82" rx="22" fill="#000" fill-opacity=".22"/><rect x="4" y="4" width="88" height="84" rx="22" fill="url(#g)"/>`;
    else if (style === 'duotone') { bg = `<rect x="4" y="4" width="88" height="88" rx="24" fill="${color}" fill-opacity=".18"/>`; fg = color; }
    else if (style === 'metal') bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(color, 0.65)}"/><stop offset=".45" stop-color="${color}"/><stop offset=".7" stop-color="${lighten(color, 0.3)}"/><stop offset="1" stop-color="${color}" stop-opacity=".8"/></linearGradient></defs><rect x="4" y="4" width="88" height="88" rx="22" fill="url(#g)"/><rect x="5" y="5" width="86" height="86" rx="21" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>`;
    else if (style === 'gradient') bg = `<defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${lighten(color, 0.5)}"/></linearGradient></defs><circle cx="48" cy="48" r="44" fill="url(#g)"/>`;
    else fg = color;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${bg}<g transform="translate(24 22) scale(.1875)" fill="${fg}">${path}</g></svg>`);
  }
  // 游戏菜单：每个分类出未选中图，选中的那个分类再多出一张选中图（其它分类选中时沿用未选中图）
  // 底部导航：当前登录态下的未选中图（未登录「优惠」「注册」= imgOut）+ 选中图
  const perEntry = (b, i) => (b === 'bottomnav' ? [bnOffF(M(b).items[i]), 'imgOn'] : b === 'gamemenu' && i === gmAct() ? ['img', 'imgOn'] : ['img']);
  const isReq = (b, it) => (b === 'notice' ? it.k !== 'mp/nt-i-mail' || M(b).mail : b === 'midnav' ? M(b).mode === 'conf' || it.req : b === 'bottomnav' ? it.req : false);
  const modTitle = (b) => t({ notice: 'mod/notice', midnav: 'mod/midnav', bottomnav: 'mod/bottomnav', gamemenu: 'mod/gamemenu', sidebar: 'mod/sidebar' }[b]);
  // 矢量款式的颜色：底部导航未选中 btmnav_def、选中第一次 btmnav_active；游戏菜单未选中 = 左侧栏图标 Key icon_tg_z（Figma 317:52363 等）；其余按 k 换色
  function candColor(b, f, k) {
    const x = X(), th = x.E.D.theme, lt = x.liveTheme(); const pal = [th.primary, th.accent_3, th.accent_1, th.accent_2, '#7b4dff'];
    if (b === 'notice') return th.primary; // 公告栏图标统一主色（Waydon 11-27），候选不再轮换辅助色
    if (f === 'img' && b === 'gamemenu') return resolveKey('icon_tg_z', lt.th, lt.ec).slice(0, 7);
    if (b === 'bottomnav') { if (f !== 'imgOn') return resolveKey('btmnav_def', lt.th, lt.ec).slice(0, 7); if (!k) return resolveKey('btmnav_active', lt.th, lt.ec).slice(0, 7); }
    return pal[(k || 0) % pal.length];
  }
  // 底部导航：名称和缩略图跟当前登录态走（未登录第 4 个是「注册」、优惠是动效礼盒）
  const iaNm = (b, it) => (b === 'bottomnav' ? bnName(it) : nm(it));
  // 素材库里某个入口图标槽可选的图：昨天生成的 5 种风格原图（不着色）；底部导航默认态用 -off 灰图（中间凸起的「分享赚钱」大图标除外，未选中也是彩色）；没有风格图的入口 = null
  function libIcons(b, i, f) {
    const mm = M(b), it = mm && mm.items && mm.items[+i]; const r = it && RMAP[b] && RMAP[b](it, f); if (!r) return null;
    const big = b === 'bottomnav' && f === 'img' && mm.style === 'raised' && bnRaised(it);
    const off = b === 'bottomnav' && !big && (f === 'img' || (f === 'imgOut' && !bnBig(it))) ? '-off' : '';
    return { name: iaNm(b, it), list: RSTY.map((st) => ({ st, src: 'assets/' + r + '-' + st + off + '.webp' })) };
  }
  const iaTh = (b, it) => (b === 'bottomnav' ? bnSrc(it, bnOffF(it)) : it.img || it.def);
  const thHtml = (b, it) => { const s0 = iaTh(b, it); return s0 ? img(s0) : ic(it.i || 'plus'); };

  // ---------- AI 生成统一面板：模块图标 / 按钮底图 / 卡片图片适配器（docs/ai-unified.md 第 6 节；Figma 04-AI 统一生成 G3 / G4） ----------
  // 面板、扣点、状态机都在 aigen.js；这里只管「有哪些图、怎么出候选、怎么写进 E.D」。editor.js 调 MP.aigReg(余额框目标) 注册。
  // 款式 id 跟顶部栏同一套（glossy… 实物 5 种 + line… 矢量 4 种），styleSrc 用的 'r-' 前缀在这里转换
  const STY = RSTY.concat(['line', 'fill', 'duotone', 'gradient']);
  const sOf = (st) => (RSTY.includes(st) ? 'r-' + st : st);
  // 一个入口的一组图（未选 / 选中一起生成；公告栏消息 = 已读 / 未读）：候选 c = { st, k }，k = 换色序号
  // 游戏菜单分类图标 AI 只出一张（Figma G4-02「4 张 · 58×44」「候选 · 挑一张」），选中态图在使用时按同款式一起换
  const perAi = (b, i) => { const it = M(b).items[+i]; return b === 'notice' && it && it.defOn ? ['img', 'imgOn'] : b === 'gamemenu' ? ['img'] : perEntry(b, +i); };
  const entSrcs = (b, i, c) => { const it = M(b).items[+i]; return perAi(b, i).map((f) => [f, styleSrc(b, it, sOf(c.st), candColor(b, f, c.k), f)]); };
  const pairHtml = (srcs) => (srcs.length > 1 ? `<span class="aig-two">${srcs.map(([, src]) => `<img src="${src}" alt="">`).join('')}</span>` : `<img src="${srcs[0][1]}" alt="">`);
  // 帐户栏 / 公告栏 / 游戏菜单 / 底部导航 / 侧边栏：名字、提示词、整套名（Figma 标题「AI 生成 · 利息宝图标」「整套帐户栏图标」「分类图标 · 热门」「底部导航 · 优惠」）
  const IC_NAME = { notice: 'aig/n-ic', midnav: 'aig/n-ic', gamemenu: 'aig/n-gm', bottomnav: 'aig/n-bn', sidebar: 'aig/n-sd' };
  const IC_USED = { bottomnav: 'aig/u-bn', sidebar: 'aig/u-sd' };
  const IC_UNIT = { notice: 'aig/unit-notice', midnav: 'aig/unit-midnav', gamemenu: 'aig/unit-gamemenu', bottomnav: 'aig/unit-bottomnav', sidebar: 'aig/unit-sidebar' };
  const icPrompt = (b, st, a) => {
    const one = a && a.scope === 'one' && M(b).items[+a.idx], it = one;
    const what = it ? t(IC_NAME[b], { n: iaNm(b, it) }) : t(IC_UNIT[b]);
    const pr = it ? perAi(b, +a.idx) : null;
    // 公告栏（Waydon 11-27）：消息光泽款默认提示词照 Figma G3-16C「光泽质感的消息图标：主色玻璃信封…；同时出已读 / 未读两张」；
    // 其它实物款式加一句「使用主色 #xxxxxx」（矢量款式本来就按主色画）
    if (b === 'notice' && it && it.k === 'mp/nt-i-mail' && st === 'glossy') return t('mp/nt-ai-p-mail');
    const pc0 = b === 'notice' && RSTY.includes(st) ? t('aig/p-primary', { hex: String(X().E.D.theme.primary || '').toUpperCase() }) : '';
    return t('aig/ic-p2', { adj: t('aig/adj-' + st), name: what, look: t('aig/look-' + st) }) + pc0 + (pr && pr.length > 1 ? t('aig/p-pair', pairLab(b)) : '');
  };
  // 一组两张的说明：公告栏消息 = 「已读 / 未读」（左 img、右 imgOn，Waydon 11-27 第 4 条）；其它 = 「未选 / 选中」（Figma G4-07 / G4-09）
  const pairLab = (b) => (b === 'notice' ? { a: t('mp/nt-st-read'), b: t('mp/nt-st-unread') } : { a: t('aig/s-off'), b: t('aig/s-on') });
  // 整套里哪些入口必交：帐户栏只有样板「利息宝」（M-11），公告栏喇叭 + 消息都必交（G3-15a），底部导航 / 游戏菜单没有（G4-13 / G4-14）
  const aiReq = (b, it, i) => (b === 'notice' ? isReq(b, it) : b === 'midnav' ? i === 0 : false);
  const ICON_AI = (b) => ({
    // 游戏菜单只算显示着的分类（Figma「整套 · 9 个」，隐藏的区块链 / 最近 / 收藏 / 试玩不在里面）
    entries: () => M(b).items.map((it, i) => ({ i, name: iaNm(b, it), label: b === 'notice' && perAi(b, i).length > 1 ? iaNm(b, it) + t('aig/pair-note', { name: '', a: pairLab(b).a, b: pairLab(b).b }) : '', thumb: thHtml(b, it), req: aiReq(b, it, i), def: isReq(b, it) || ((b === 'gamemenu' || b === 'sidebar') && !!it.on) || (b === 'midnav' && M(b).mode === 'conf') || b === 'bottomnav', pics: perAi(b, i).length, cost: b === 'notice' && perAi(b, i).length > 1 ? 40 : 0, on: b !== 'gamemenu' || !!it.on })).filter((e) => (b !== 'notice' || e.i !== 1 || M(b).mail) && e.on),
    // 底部导航整套的样板默认「优惠」（首页是内置图标，Figma G4-14C）
    sample: () => (b === 'bottomnav' ? 1 : 0),
    // 公告栏：打开面板时把两个图标 × 5 种实物款式的主色着色一次算好（后面出候选 / 列表直接用缓存，不再中途重渲染）
    styles: (tg, a) => { const its = M(b).items, pv = (a && a.scope === 'one' && its[+a.idx]) || its[0]; if (b === 'notice') its.forEach((it) => RSTY.forEach((st) => styleSrc(b, it, 'r-' + st, X().E.D.theme.primary, 'img'))); return STY.map((st) => ({ id: st, label: t('aig/st-' + st), html: `<img src="${styleSrc(b, pv, sOf(st), X().E.D.theme.primary, 'imgOn')}" alt="">` })); },
    preset: (tg, st, a) => icPrompt(b, st, a),
    where: () => [0, 1].map(() => t('mp/ai-where', { m: modTitle(b) })),
    refPrompt: (tg, res, a) => ({ style: res.style, prompt: icPrompt(b, res.style, a) + t('mp/gm-bai-ref-c', { hex: res.hex }) }),
    // 4 张候选：实物款式 = 选中的款式 + 相邻 3 种；矢量款式 = 同款式 4 种配色。整套的其余入口按样板（base）出 1 张
    // 公告栏矢量款式只用主色（不换色），4 张候选改成 4 种矢量款式（选中的在前）
    gen: (a, tg, i, n, base) => (base ? [{ st: base.st, k: base.redo ? base.redo % 5 : base.k }] : RSTY.includes(a.style) ? window.AIG.rot(RSTY, a.style, n).map((st) => ({ st, k: 0 })) : b === 'notice' ? window.AIG.rot(STY.slice(RSTY.length), a.style, n).map((st) => ({ st, k: 0 })) : Array.from({ length: n }, (v, k) => ({ st: a.style, k: (k + a.round) % 5 }))),
    tile: (a, tg, i, c) => pairHtml(entSrcs(b, i, c)),
    old: (a, tg, i) => thHtml(b, M(b).items[+i]),
    lib: (a, tg, i, c) => 'img:' + entSrcs(b, i, c).slice(-1)[0][1],
    name: (a) => t(IC_NAME[b], { n: iaNm(b, M(b).items[+a.idx] || {}) }),
    usedName: (a) => t(IC_USED[b] || IC_NAME[b], { n: iaNm(b, M(b).items[+a.idx] || {}) }),
    apply: (a, tg, i, c) => { const it = X().E.D.m[b].items[+i]; entSrcs(b, i, c).forEach(([f, src]) => { it[f] = src; }); if (b === 'gamemenu' && perEntry(b, +i).includes('imgOn')) it.imgOn = styleSrc(b, it, sOf(c.st), candColor(b, 'imgOn', c.k), 'imgOn'); },
    pay: () => ['iconset', { type: tType(b) }],
  });
  const icTarget = (b) => ({
    id: 'icons', label: t(b === 'gamemenu' ? 'aig/t-gm-icons' : b === 'midnav' ? 'aig/t-mn-icons' : 'aig/t-icons'), kind: 'icon', spec: (i) => specOf(b, +(i || 0), 'img'), count: 4, cost: 20, ratio: 1, cols: 4,
    scopeable: b !== 'sidebar', unit: t(IC_UNIT[b]), setName: t('aig/n-set', { name: t(IC_UNIT[b]) }),
    pair: (i) => (i != null && M(b).items[+i] && perAi(b, +i).length > 1 ? [pairLab(b).a, pairLab(b).b] : null), lr: b === 'notice',
  });
  // 游戏菜单按钮底图（竖排才有）：未选中 + 选中两张一起出
  const pc = () => X().liveTheme().th.primary;
  const btnPair = (st) => `<span class="aig-two is-btn"><i style="${window.fxStyle(gmBtnSvg(st, false, pc()))}"></i><i style="${window.fxStyle(gmBtnSvg(st, true, pc()))}"></i></span>`;
  const GM_BTN_AI = {
    styles: () => GMB_ST.map((st) => ({ id: st, label: t('aig/st-' + st), html: btnPair(st) })),
    preset: (tg, st) => t('mp/gm-bai-p-' + st),
    refPrompt: (tg, res) => { const st = GMB_ST.includes(res.style) ? res.style : 'glossy'; return { style: st, prompt: t('mp/gm-bai-p-' + st) + t('mp/gm-bai-ref-c', { hex: res.hex }) }; },
    gen: (a, tg, i, n) => window.AIG.rot(GMB_ST, a.style, n).map((st) => ({ st })),
    tile: (a, tg, i, c) => btnPair(c.st),
    name: () => t('mp/gm-btn'),
    apply: (a, tg, i, c) => { const x = X(), m = x.E.D.m.gamemenu, p0 = pc(); m.btnOff = gmBtnSvg(c.st, false, p0); m.btnSel = gmBtnSvg(c.st, true, p0); delete x.E.D.ec['gamemenu.bg']; delete x.E.D.ec['gamemenu.active']; },
    lib: (a, tg, i, c) => gmBtnSvg(c.st, true, pc()),
    pay: () => ['iconset', { type: t('mp/gm-btn') }],
  };
  // 游戏卡片：兜底封面 260×260 / 收藏星（未收藏 + 已收藏两张 36×36）；✦10（业主定：保持现价）
  const gcP = (tg, st) => t('mp/gc-ai-p-' + (tg.id === 'star' ? 'star' : 'fb'), { s: t('aig/st-' + st) });
  const starPair = (st) => `<span class="aig-two"><i style="${window.fxStyle(gcStarSvg(st, false, pc()))}"></i><i style="${window.fxStyle(gcStarSvg(st, true, pc()))}"></i></span>`;
  const GC_AI = {
    styles: (tg) => GC_ST.map((st) => ({ id: st, label: t('aig/st-' + st), html: tg.id === 'star' ? starPair(st) : `<i class="aig-pvimg" style="${window.fxStyle(gcFbSvg(st, pc()))}"></i>` })),
    preset: gcP,
    refPrompt: (tg, res) => { const st = GC_ST.includes(res.style) ? res.style : 'glossy'; return { style: st, prompt: gcP(tg, st) + t('mp/gm-bai-ref-c', { hex: res.hex }) }; },
    gen: (a, tg, i, n) => window.AIG.rot(GC_ST, a.style, n).map((st) => ({ st })),
    tile: (a, tg, i, c) => (tg.id === 'star' ? starPair(c.st) : `<i class="aig-img" style="${window.fxStyle(gcFbSvg(c.st, pc()))}"></i>`),
    name: (a, tg) => tg.label,
    lib: (a, tg, i, c) => (tg.id === 'star' ? null : gcFbSvg(c.st, pc())),
    apply: (a, tg, i, c) => { const m = X().E.D.m.gamecards, p0 = pc(); if (tg.id === 'star') { m.starOff = gcStarSvg(c.st, false, p0); m.starSel = gcStarSvg(c.st, true, p0); m.fav = true; } else { m.fallback = gcFbSvg(c.st, p0); m.fallbackOn = true; } },
    pay: (tg) => ['iconset', { type: t(tg.id === 'star' ? 'mp/gc-fav' : 'mp/gc-fallback') }],
  };
  // bal = { target(), impl }：帐户栏（带帐户区、已登录、余额框开着）多一个目标「余额框币种」，跟顶部栏同一个实现
  function aigReg(bal) {
    const AIG = window.AIG; if (!AIG) return;
    ['notice', 'midnav', 'gamemenu', 'bottomnav', 'sidebar'].forEach((b) => {
      const IC = ICON_AI(b);
      AIG.reg(b, {
        targets: () => {
          const o = [icTarget(b)];
          if (b === 'gamemenu' && M('gamemenu').style === 'side') o.push({ id: 'btn', label: t('mp/gm-btn'), kind: 'image', spec: [150, 70], count: 4, cost: 20, ratio: 1, cols: 4, pair: () => [t('aig/s-off'), t('aig/s-on')], lr: true });
          if (b === 'midnav' && M('midnav').layout === 'account' && bal) { const bt = bal.target(); if (bt) o.push(bt); }
          return o;
        },
        defaultTarget: () => 'icons',
        cntSample: b !== 'midnav' && b !== 'notice', // G3 只算其余（已生成 3/3 · 样板 1 + 其余 3）；G4 连样板一起算（9/9）
        rowTags: b === 'notice', // 「喇叭（样板）」「消息 ×2」（Figma G3-15e）
        impl: (tg) => (tg.id === 'btn' ? GM_BTN_AI : tg.id === 'bal' ? bal.impl : IC),
      });
    });
    AIG.reg('gamecards', {
      targets: () => [{ id: 'fallback', label: t('aig/t-fb'), kind: 'image', spec: [260, 260], count: 4, cost: 10, ratio: 1, cols: 4 }].concat(M('gamecards').fav !== false ? [{ id: 'star', label: t('mp/gc-fav'), kind: 'image', spec: [36, 36], count: 4, cost: 10, ratio: 1, cols: 4, pair: () => [t('aig/s-off'), t('aig/s-on')] }] : []),
      defaultTarget: () => 'fallback',
      impl: () => GC_AI,
    });
    // 单卡换图 · AI（Figma 3：标题「AI 生成 · 游戏图片」、生成哪张「只这一张 · 炸金花」、提示词预填、规格「4 张 · 180×180」、不显示款式行；✦10 跟其它面板一样直接扣）
    // 面板显示在游戏卡片模块的位置（host）；候选暂借其它游戏的封面示意（同 Figma 页说明）
    AIG.reg('gcimg', {
      host: 'gamecards', tool: false, oneTarget: true, livePreset: true, // 提示词构图跟当前卡片样式（11-28 QA）
      targets: () => { const sz = gcSz(); return [{ id: 'card', label: t('game-card/image-flow/entry'), kind: 'image', spec: sz, count: 4, cost: GC_AI_COST, ratio: sz[0] / sz[1], cols: 4 }]; },
      defaultTarget: () => 'card',
      impl: () => GC_CARD_AI,
    });
  }
  const gcName = (a) => (GAMES[+a.idx] || [''])[0];
  // 提示词的构图跟卡片样式：1:1（经典 / 方形 / 圆版）用 Figma 原文「方形构图」，欧美 / 竖版 3:4 竖版构图，横版 8:5 横版构图
  const gcPrompt = (name) => { const sz = gcSz(); return t(sz[0] === sz[1] ? 'game-card/image-flow/ai-prompt' : sz[0] > sz[1] ? 'game-card/image-flow/ai-prompt-land' : 'game-card/image-flow/ai-prompt-port', { name }); };
  const gcCand = (g) => 'img:' + CL + 'game' + g + '.webp';
  const GC_CARD_AI = {
    entries: () => GAMES.map(([n], j) => ({ i: j, name: n })).filter((e) => e.i !== GC_FB),
    title: () => t('game-card/image-flow/ai-title'),
    tgLabel: (a) => t('game-card/image-flow/ai-scope', { name: gcName(a) }),
    specTxt: (a, tg, sp) => t('game-card/image-flow/ai-spec', { n: tg.count, w: sp[0], h: sp[1] }),
    noStyle: true,
    styles: () => [{ id: 'cover', label: '', html: '' }],
    preset: (tg, st, a) => gcPrompt(a ? gcName(a) : ''),
    refPrompt: (tg, res, a) => ({ style: 'cover', prompt: gcPrompt(gcName(a)) + t('mp/gm-bai-ref-c', { hex: res.hex }) }),
    // 4 张候选：其它游戏的封面（不含这张卡自己的原图），再生成换下一组
    gen: (a, tg, i, n) => { const own = GAMES[+i][1], pool = GAMES.map((q) => q[1]).filter((g) => g !== own), k0 = (a.round * n) % pool.length; return Array.from({ length: n }, (v, k) => ({ g: pool[(k0 + k) % pool.length] })); },
    tile: (a, tg, i, c) => `<i class="aig-img" style="${window.fxStyle(gcCand(c.g))}"></i>`,
    name: (a) => gcName(a),
    lib: (a, tg, i, c) => gcCand(c.g),
    // AIG 外面包 commit；换图前的值记下来给 Toast 的「撤销换图」。用了以后：卡片仍选中，手机回到画布（Figma M 4）
    apply: (a, tg, i, c) => { const m = X().E.D.m.gamecards; a.gcPrev = gcOwn(m, +i); gcPut(m, +i, { f: gcCand(c.g) }); },
    onUsed: (a) => { const E = X().E; E.gcSel = { id: a.id, j: +a.idx, mob: X().mobileEd() }; if (X().mobileEd()) E.mpanel = null; gcDone(+a.idx, a.gcPrev || null, 'game-card/image-flow/applied'); },
    pay: () => ['one', { type: t('game-card/image-flow/entry') }],
  };


  // ---------- 批量上传图标（ED-05） ----------
  let bxIn = null, bxB = null;
  A.bxOpen = (b) => {
    bxB = b; S().menu = null;
    if (!bxIn) {
      bxIn = document.createElement('input'); bxIn.type = 'file'; bxIn.multiple = true; bxIn.accept = window.IMG_ACCEPT; bxIn.style.display = 'none'; bxIn.setAttribute('data-batch-file', '');
      document.body.appendChild(bxIn);
      bxIn.addEventListener('change', () => { const files = [...bxIn.files]; bxIn.value = ''; if (files.length) bxRead(bxB, files); });
    }
    bxIn.click(); return false;
  };
  function bxMatch(b, base, names = M(b).items.map(nm)) {
    let i = names.indexOf(base);
    if (i < 0) i = names.findIndex((n) => n.toLowerCase() === base.toLowerCase());
    if (i < 0) i = names.findIndex((n) => n && (base.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(base.toLowerCase())));
    return i;
  }
  function bxRead(b, files) {
    const rows = []; let left = files.length;
    const doneOne = () => { if (--left === 0) { X().E.bx = { b, rows, ing: null, pick: null }; X().E.dlg = 'batch'; window.render(); } };
    files.forEach((file, k) => {
      const row = { name: file.name, src: '', w: 0, h: 0, bad: !window.imgOk(file), target: -1, f: 'img' };
      rows[k] = row;
      let base = file.name.replace(/\.[^.]+$/, '');
      const on = /(_选中|_active|_on)$/i.test(base); base = base.replace(/(_选中|_active|_on)$/i, '');
      if (on && (b === 'bottomnav' || b === 'gamemenu')) row.f = 'imgOn';
      if (row.bad) { doneOne(); return; }
      row.target = bxMatch(b, base);
      if (b === 'bottomnav') {
        // 底部导航：先按当前登录态的名称配（未登录「注册」→ 未登录图 imgOut），再按另一种状态的名称配
        const its = M(b).items, login = bnLogin(), outNm = (it) => (bnHasOut(it) && (it.outN || it.outK) ? bnName(it, false) : '');
        const first = login ? its.map(nm) : its.map((it) => outNm(it) || nm(it)), other = login ? its.map(outNm) : its.map((it) => (outNm(it) ? nm(it) : ''));
        let i = bxMatch(b, base, first), out = !login && i >= 0 && bnOffF(its[i], false) === 'imgOut';
        if (i < 0) { i = bxMatch(b, base, other); out = login && i >= 0; }
        row.target = i; if (i >= 0 && out && row.f === 'img') row.f = 'imgOut';
      }
      const rd = new FileReader();
      rd.onload = () => { row.src = rd.result; const im = new Image(); im.onload = () => { row.w = im.naturalWidth; row.h = im.naturalHeight; doneOne(); }; im.onerror = () => { row.bad = true; row.target = -1; doneOne(); }; im.src = rd.result; };
      rd.onerror = () => { row.bad = true; doneOne(); };
      rd.readAsDataURL(file);
    });
  }
  const bxPad = (b, r) => { const [tw, th] = specOf(b, r.target >= 0 ? r.target : 0); return r.w && r.h && Math.abs(r.w / r.h - tw / th) > 0.03; };
  function bxSum(bx) { const n = bx.rows.filter((r) => !r.bad && r.target >= 0).length, u = bx.rows.filter((r) => !r.bad && r.target < 0).length, bad = bx.rows.filter((r) => r.bad).length; return { n, u, b: bad }; }
  function bxTargetLabel(bx, r) { if (r.target < 0) return t('mp/batch-skip'); const it = M(bx.b).items[r.target]; return (r.f === 'imgOut' ? bnName(it, false) : nm(it)) + (r.f === 'imgOn' ? ' · ' + t('mp/state-act') : r.f === 'imgOut' ? ' · ' + t('ed/signed-out') : ''); }
  function bxOptions(bx, k) {
    const its = M(bx.b).items; const two = bx.b === 'bottomnav' || bx.b === 'gamemenu';
    const opts = [];
    its.forEach((it, i) => { opts.push([i + '|img', nm(it) + (two ? ' · ' + t('mp/state-def') : '')]); if (two) opts.push([i + '|imgOn', nm(it) + ' · ' + t('mp/state-act')]); if (bx.b === 'bottomnav' && bnHasOut(it)) opts.push([i + '|imgOut', bnName(it, false) + ' · ' + t('ed/signed-out')]); });
    opts.push(['-1|img', t('mp/batch-skip')]);
    const r = bx.rows[k]; const cur = r.target + '|' + (r.target < 0 ? 'img' : r.f);
    return opts.map(([v, l]) => `<button class="menu-item ${v === cur ? 'is-on' : ''}" data-act="bxSet" data-arg="${k}|${v}">${esc(l)}</button>`).join('');
  }
  function batchBody(mobile) {
    const bx = X().E.bx; const [tw, th] = specOf(bx.b, 0); const s = bxSum(bx);
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
  // home_bg：Figma 经典蓝白首页底 = #FFFFFF（317:55529，公告栏透出的就是它）
  const DESIGN_DEF = { home_bg: '#FFFFFF', home_db: '#FFFFFF', btmnav_def: '#999999', btmnav_active: '#1678FF', bs_topnav_bg: '#FFFFFF', web_bs_yj_bg: '#1C2033', web_btmnav_db: '#FFFFFF' };
  const EXT = Object.fromEntries(KEYS68.ext.map((e) => [e[0], e]));
  const BASE = Object.fromEntries(KEYS68.base);
  // 扩展 Key 有翻译就用翻译（i18n-editor.js 的 ed/key-<名>），没有才用规范表里的中文说明
  const keyLabel = (k) => (BASE[k] || window.I18N['ed/key-' + k] ? t('ed/key-' + k) : EXT[k] ? EXT[k][3] : k);
  function resolveKey(k, th, ec, d = 0) {
    if (d > 8) return '#000000';
    const own = ec['key:' + k];
    if (own) return own.startsWith('key:') ? resolveKey(own.slice(4), th, ec, d + 1) : own; // 业主改绑另一个 Key（如首页背景 → bg_1）或自定义色
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
    // 搜索也能直接打色值（「0a84」「#0A84FF」）：只比对显示色值胶囊的行（基础 / 引用 / 固定 / 已单独设置），跟设计待确认、条件规则没有胶囊不比对
    const qh = /^#?[0-9a-f]+$/.test(q) && q.replace('#', '').length >= (q[0] === '#' ? 1 : 3) ? q.replace('#', '') : '';
    const hexHit = (e) => qh && hasHc(e[1], e[0], ec) && (hexOf(resolveKey(e[0], th, ec)) || { hex: '' }).hex.toLowerCase().includes(qh);
    const rowsOf = (g) => (g === 'base' ? KEYS68.base.map(([k, l]) => [k, 'base', null, l]) : KEYS68.ext.filter((e) => e[1] === g))
      .filter((e) => !q || e[0].toLowerCase().includes(q) || e[3].toLowerCase().includes(q) || keyLabel(e[0]).toLowerCase().includes(q) || hexHit(e));
    let total = 0;
    const groups = GROUPS.map(([g, lk]) => {
      const rows = rowsOf(g); total += rows.length; if (!rows.length) return '';
      const closed = K.closed[g] && !q;
      return `<div class="kg"><button class="kg-hd" data-act="keysGrp" data-arg="${g}">${ic(closed ? 'caret-right' : 'caret-down', 'ic-16')}<span>${t(lk)}</span><span class="n">${rows.length}</span></button>${closed ? '' : rows.map((e) => keyRow(e, th, ec, P, K, mobile)).join('')}</div>`;
    }).join('');
    const tools = `<div class="kt"><label class="kt-s">${ic('magnifying-glass', 'ic-16')}<input data-input="keysQ" value="${esc(K.q || '')}" placeholder="${esc(t('ed/keys-search'))}"></label></div>`;
    return `${tools}<div class="klist">${total ? groups : `<div class="empty is-sm"><div class="ico">${ic('magnifying-glass', 'ic-24')}</div><h3>${esc(t('ed/keys-none', { q: K.q }))}</h3></div>`}</div>`;
  }
  const HC_KIND = { base: 1, ref: 1, fixed: 1 }; // 68 Key 清单里显示色值胶囊的行（Figma KeyRow 229:115018；跟设计待确认、条件规则不显示）
  // 跟设计的 Key 业主单独设置过 = Figma KeyRow「State=已单独设置」（229:115009，带胶囊）：不再是待确认，也显示色值胶囊
  const hasHc = (kind, k, ec) => !!HC_KIND[kind] || (kind !== 'base' && kind !== 'cond' && !!ec['key:' + k]);
  function keyRow(e, th, ec, P, K, mobile) {
    const [k, kind, arg, usage] = e;
    const col = resolveKey(k, th, ec); const custom = kind !== 'base' && !!ec['key:' + k];
    let cap = '';
    if (kind === 'base') cap = t('ed/keys-base-cap'); // 色值改在右侧胶囊里显示，说明行写「基础色 · 点击取色」
    else if (custom && ec['key:' + k].startsWith('key:')) cap = t('ed/keys-follow', { name: keyLabel(ec['key:' + k].slice(4)) });
    else if (custom) cap = `<span class="kc-custom">${t('ed/keys-custom')}</span>`;
    else if (kind === 'ref') { const [tk, al] = Array.isArray(arg) ? arg : [arg, null]; cap = t('ed/keys-follow', { name: keyLabel(tk) }) + (al != null ? ` · ${Math.round(al * 100)}%` : ''); }
    else if (kind === 'fixed') cap = t('ed/keys-fixed', { hex: arg });
    else if (kind === 'design') cap = `<i class="kdot"></i>${t('ed/keys-pending')}`;
    else cap = arg.map(([l, , v]) => `${l}：${v[0] === '#' ? v : keyLabel(v)}`).join(' · ');
    const label = kind === 'base' ? t('ed/key-' + k) : usage;
    const open = S().menu === 'km:' + k;
    const menu = open && kind !== 'base' && kind !== 'cond' ? `<div class="menu km-menu"><button class="menu-item" data-act="keyDetach" data-arg="${k}">${ic('paint-brush-fill')}${t('ed/keys-detach')}</button><button class="menu-item" data-act="keyRestore" data-arg="${k}" ${custom ? '' : 'disabled'}>${ic('arrow-counter-clockwise')}${t('ed/keys-restore')}</button></div>` : '';
    const showPick = !mobile && P && P.where === 'keys' && (kind === 'base' ? !P.elRow && P.key === k : P.elRow === 'key:' + k);
    // 右侧一列：上 = 色值胶囊，下 = Key 标签。胶囊是按钮，不能套在行按钮里：放在行外（绝对定位到行右上），行里留出同高的空位
    const hc = hasHc(kind, k, ec) ? hexChip(col, showPick) : '';
    return `<div class="krow-w ${hc ? 'has-hc' : ''}"><button class="krow ${open ? 'is-open' : ''}" data-act="keyRow" data-arg="${k}|${kind}"><span class="ksw" style="background:${col}"></span><span class="kt2"><span class="ku">${esc(label)}</span><span class="kcap">${cap}</span></span><span class="kr-r">${hc ? hexGhost(col) : ''}<span class="kk">${k}</span></span>${ic('caret-right', 'kchev')}</button>${hc}${menu}${showPick ? X().pickerHtml('in-panel', label) : ''}</div>`;
  }
  A.keysGrp = (g) => { const K = X().E.keys; K.closed[g] = !K.closed[g]; };
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
  window.AFTER_RENDER.push(() => { const m = document.querySelector('.km-menu, .bx-menu, .ed-right .am-menu'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'nearest' }); });

  // ---------- 页面设置 · 首页背景（Figma 04-2 面板 424:433220）：KeyRow（home_bg）+ 快捷选项 跟设计 / 同页面背景 / 同卡片底 / 自定义 ----------
  // 存在 E.D.ec['key:home_bg']：空 = 跟设计（经典蓝白 #FFFFFF）；'key:bg_1' / 'key:bg_2' = 引用该 Key；十六进制 = 自定义
  const HB = 'key:home_bg';
  function homeBgSec(mobile) {
    const x = X(); const { th, ec } = x.liveTheme(); const P = x.E.picker; const v = x.E.D.ec[HB] || null;
    const col = resolveKey('home_bg', th, ec); const pk = P && P.elRow === HB && P.where === 'home';
    const src = !v ? t('ed/hb-src-design', { hex: DESIGN_DEF.home_bg }) : v.startsWith('key:') ? t('ed/keys-follow', { name: keyLabel(v.slice(4)) }) : `${t('tx/c-custom')} · <span class="mono">${esc(v.toUpperCase())}</span>`;
    // 快捷选项照 Figma 424:433232：左侧 72 标签列「快捷选项」+ 28 色块（色盘统一圆形），自定义 = 虚线空色块；名字放 title / aria-label
    // 第一个 = 跟设计（默认，没覆盖时选中，同颜色行默认色块）；提示「名称 · #HEX」
    const opt = (val, c, lab) => { const on = (v || '') === val, tip = swTip(lab, c); return `<button class="sw-btn ${on ? 'is-on' : ''}" style="background:${c}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${on}" data-act="homeBg" data-arg="${val}"></button>`; };
    const cuTip = v && !v.startsWith('key:') ? swTip(t('ed/hb-custom'), v) : t('ed/hb-custom');
    const custom = `<button class="sw-btn hb-custom ${pk || (v && !v.startsWith('key:')) ? 'is-on' : ''}" ${v && !v.startsWith('key:') ? `style="background:${esc(v)}"` : ''} title="${esc(cuTip)}" aria-label="${esc(cuTip)}" data-act="homeBgPick"></button>`;
    const own = v && !(x.E.D.baseEc && x.E.D.baseEc[HB] === v); // AI 风格给的不算业主自改
    return `<div class="p-sec hb-sec" data-sec="home_bg"><div class="lab">${t('ed/home-bg')}</div>
      <div class="krow-w"><button class="krow hb-row" data-act="homeBgPick"><span class="ksw" style="background:${col}"></span><span class="kt2"><span class="ku">${t('ed/home-bg')}</span><span class="kcap">${src}</span><span class="kk mono">home_bg</span></span>${own ? `<span class="pill-tag">${t('ed/keys-custom')}</span>` : ''}${ic('caret-right', 'ic-16')}</button></div>
      <div class="bc-row hb-opts"><span class="k">${t('ed/hb-quick')}</span><div class="sws">${opt('', DESIGN_DEF.home_bg, t('ed/hb-design'))}${opt('key:bg_1', th.bg_1, t('ed/hb-bg1'))}${opt('key:bg_2', th.bg_2, t('ed/hb-bg2'))}${custom}</div></div>
      ${pk && !mobile ? x.pickerHtml('in-panel', t('ed/home-bg')) : ''}</div>`;
  }
  A.homeBg = (val) => {
    const x = X(); const v = val || null; x.E.picker = null;
    if ((x.E.D.ec[HB] || null) === v) return false;
    x.commit(() => { if (v) x.E.D.ec[HB] = v; else delete x.E.D.ec[HB]; });
    window.toast(t('ed/toast-color', { k: t('ed/home-bg') }), x.undoOpt(4000));
  };
  A.homeBgPick = () => {
    const x = X(); if (x.E.picker && x.E.picker.elRow === HB) { x.E.picker = null; return; }
    const { th, ec } = x.liveTheme(); const cur = resolveKey('home_bg', th, ec).slice(0, 7);
    x.E.picker = { key: 'primary', elRow: HB, label: t('ed/home-bg'), orig: cur, value: cur, where: 'home' };
    if (x.mobileEd()) { x.E.picker.back = x.E.mpanel || null; x.E.mpanel = 'picker'; }
  };

  function slotOf(slot) { const [, b, f] = slot.split('-'); return [b, f]; }
  window.MP = {
    defaults, vars, panel, h5, bnav, bnavCls, side, iconSheet, aigReg, batchBody, batchPickSheet, keysPanel, nm, ICON_SPEC, KEYS68, has: (b) => !!P[b], libIcons,
    resolveKey, EL, aiSvg, homeBgSec, // AD：导出结构预览 / AI 首页设计用
    keyTag, swRow, keyLabel, hexOf, curCol, hexChip, swTip, colorRow, linkRow, // 色值胶囊（Figma G6/HexChip 460:31190）：editor.js 的颜色行、文字样式卡、取色器共用
    elKey: (id) => elDef(id), elCap: (id) => GC_CAP[id] || null, // elCap：颜色行 Key 标签另写的 Key 名（游戏名称 = cards_text），取色器标题右侧 / Key 菜单跟它一致
    // 游戏名称（11-28 QA）：文字样式的默认字号 / 粗细跟卡片样式和排版走（editor.js TX_SCALE / TX_DW）
    gcStyle: () => gcStyleOf(M('gamecards')), gcNameBase,
    // 取色器切 Key 范围「N 处」用（editor.js keyUses）：画布上正显示的帐户栏入口角标颜色行 [行 ID, 默认 Key]（已登录、入口显示、有角标）
    bdRows: () => (X().E.D.login ? M('midnav').items.map((it, i) => [it, i]).filter(([it]) => it.on && it.badge).map(([it, i]) => [bdId(it, i), bdKey(it)]) : []),
    // 这一行现在显示的是按钮图（游戏菜单竖排的按钮底，没选颜色）：不是 Key 颜色
    imgDef: (id) => !!(GM_BTN_EC_R[id] && M('gamemenu').style === 'side' && !(X().E.D.ec || {})[id]),
    resetColors: (b) => { const D = X().E.D; (EL[b] || []).forEach(([id]) => { delete D.ec[id]; if (D.ecf) delete D.ecf[id]; }); if (D.ecf && !Object.keys(D.ecf).length) delete D.ecf; },
    getAsset: (slot) => { const [b, f] = slotOf(slot); return M(b)[f]; },
    // 游戏菜单按钮底图：上传 / 换图后回到「按钮图」显示（清掉颜色页签里对应的纯色底）
    setAsset: (slot, v) => { const [b, f] = slotOf(slot); const D = X().E.D; D.m[b][f] = v; if (b === 'gamemenu' && v && GM_BTN_EC[f] && D.ec) delete D.ec[GM_BTN_EC[f]]; },
    gcFbInner: (m) => gcFbInner(m),
    gcCover: (m, j) => gcCover(m, j), gcImgSheet, gcRsApply, gcSpec, gcSync, // 单卡换图：PC 卡片封面、手机底部弹层、「调整尺寸」采用 / 规格
    gcStarImg: (m, f, cls) => gcStarImg(m, f, cls), // PC 卡片也显示收藏星（含上传 / AI 图）
    // 旧存档迁移：帐户栏入口补上 i18n 名称 Key，没改过名（仍是写死的中文默认名）的清掉 n，按当前语言显示
    // 公告栏 11-27：旧的「【方括号】/“引号”/ 数字」规则上色转成 spans（括号去掉），补上「显示消息气泡」
    migrate: (D) => { const m = D && D.m && D.m.midnav; (m && m.items || []).forEach((it) => { const b = baseOf(it.def); const k = { mid0: 'dep', mid1: 'vip', mid2: 'share', mid3: 'more' }[b]; if (!k || it.k) return; it.k = 'mp/mn-n-' + k; if (it.n === MID_OLD[b]) it.n = ''; }); if (D && D.m && D.m.notice) ntNorm(D.m.notice, D.ec || (D.ec = {})); gcNorm(D); },
    // 游戏卡片 6 样式（11-28）：旧数据 / AI 设计写入后整理成 菜单位置 + 每行张数 + 卡片样式（aidesign 用）
    gcNorm, GC_STYLES, GC_SIZES, gcTabsOn,
    toggleAsset: (slot) => { const [b, f] = slotOf(slot); set(b, f + 'On', M(b)[f + 'On'] === false); },
  };
})();
