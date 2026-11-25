/* E · PC 电脑版画布（ED-22）：1920 宽页面、内容区 1200 居中，默认「适应宽度」缩放。
 * 与 H5 共用 E.D（模块、顺序、隐藏、配色、素材、元素色）。必须在 editor.js 之后加载。
 * 编辑器调用：desktop() 里 window.PC.canvas()；手机 mobile() 里 window.PC.canvas({ mobile: true })。
 * 选中框 / 工具条复用 window.EDX.modWrap（C 组导出），没导出时退回到只有选中框 + 名称标签。 */
(function () {
  const A = window.ACT;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const X = () => window.EDX;
  const PAGE_W = 1920, CONTENT_W = 1200;
  const LEVELS = [25, 50, 75, 100];
  // 与 editor.js 的 AI 候选滤镜一致（候选预览时画布实时显示）
  const CAND_F = ['hue-rotate(10deg) saturate(1.4)', 'hue-rotate(-60deg) saturate(1.3)', 'hue-rotate(140deg) saturate(1.1)', 'hue-rotate(200deg) brightness(1.1)'];
  // PC Banner：通栏 1920×564（Waydon 2026-11-25 定），不随 H5 的大 / 一般 / 小规格变化
  const BAN_PC = { w: PAGE_W, h: 564 };
  const SMALL_GAP = (CONTENT_W - 3 * 386) / 2;
  const GAMES = [['星河足球', '热门'], ['百家乐', '新'], ['幸运老虎机', null, true], ['极速赛车'], ['德州扑克'], ['捕鱼达人'], ['龙虎斗'], ['21 点'], ['轮盘'], ['麻将胡了'], ['斗地主'], ['电竞竞猜']];

  // 缩放状态：zoom = 'fit' 或百分比数字；fit / mfit 为最近一次量到的适应比例
  const st = { zoom: 'fit', fit: 0.42, mfit: 0.18, mobile: false };
  // 缩放选择记在本地（刷新后保持）
  try { const v = window.LS && window.LS.get('pcZoom', 'fit'); if (v === 'fit' || LEVELS.includes(+v)) st.zoom = v === 'fit' ? 'fit' : +v; } catch (e) { /* noop */ }
  const isMobile = () => { const x = X(); return x && x.mobileEd ? x.mobileEd() : window.innerWidth < 840; };
  const curZ = () => (st.zoom === 'fit' ? (st.mobile ? st.mfit : st.fit) : st.zoom / 100);

  // ---------- 主题变量（同 editor.js themeStyle） ----------
  function themeStyle() {
    const { th, tb, ec } = X().liveTheme();
    let s = Object.keys(th).map((k) => `--o-${k}:${th[k]}`).join(';') + (window.MP && window.MP.vars ? window.MP.vars(th, ec || {}) : '');
    if (tb) { if (tb.bg) s += `;--tb-bg:${tb.bg}`; if (tb.text) s += `;--tb-text:${tb.text}`; if (tb.search) s += `;--tb-search:${tb.search}`; if (tb.reg) s += `;--tb-reg:${tb.reg}`; if (tb.login) s += `;--tb-login:${tb.login}`; if (tb.regInk) s += `;--tb-regink:${tb.regInk}`; }
    return s;
  }
  const zStyle = (z) => `zoom:${z};--pc-iz:${(1 / z).toFixed(4)}`;

  // ---------- 选中包装 ----------
  function wrap(id, inner, opts = {}) {
    const x = X();
    if (typeof x.modWrap === 'function') return x.modWrap(id, inner, opts);
    const E = x.E, sel = E.sel === id;
    const label = sel && !isMobile() ? `<span class="sel-label ${opts.top ? 'inside' : ''}">${esc(x.modName(id))}</span>` : '';
    return `<div class="mod ${sel ? 'is-sel' : ''}" data-mod="${id}" data-act="selMod" data-arg="${id}">${inner}${label}</div>`;
  }
  const M = (b) => (X().E.D.m || {})[b] || {};
  const vis = (b) => (M(b).items || []).filter((x) => x.on);
  // 入口名：默认按当前语言取 key（游戏菜单 13 类），改过名用原文
  const nm = (it) => (window.MP && window.MP.nm ? window.MP.nm(it) : it.n || '');
  const im = (src) => `<img class="cu" src="${src}" alt="">`;
  const base = (id) => (X().baseName ? X().baseName(id) : id.split('~')[0]);

  // ---------- 各模块 PC 形态 ----------
  function topbar() {
    const D = X().E.D, tb = D.tb || {}, it = tb.items || {};
    const nav = vis('gamemenu').slice(0, 6).map((x, i) => `<span class="${i ? '' : 'on'}">${esc(nm(x))}</span>`).join('');
    const logo = it.logo !== false ? `<span class="lg" style="filter:${tb.logoF || 'none'}"><img src="assets/logo-orb.webp" alt="">星河体育</span>` : '';
    const search = it.search !== false ? `<span class="srch">${ic('magnifying-glass')}<span>搜索游戏</span></span>` : '';
    const auth = it.auth !== false ? (D.login ? `<span class="bal">¥ 1,280.00</span><span class="ava"></span>` : `<span class="login">登录</span><span class="reg">注册</span>`) : '';
    return `<div class="pc-top"><div class="in">${logo}<nav class="nv">${nav}</nav><span class="sp"></span>${search}${auth}</div></div>`;
  }
  function slideF(i) {
    const E = X().E;
    if (E.ai && E.ai.cand != null && i === E.slide) return CAND_F[E.ai.cand] || 'none';
    return (E.D.banner.slides[i] || {}).f || 'none';
  }
  const visIdx = () => X().E.D.banner.slides.map((s, i) => (s.hid ? -1 : i)).filter((i) => i >= 0);
  function bannerShift(n, size, i) {
    if (size !== 'small') return `translateX(${-i * 100}%)`;
    const k = Math.max(0, Math.min(i, n - 3));
    return `translateX(${-k * (386 + SMALL_GAP)}px)`;
  }
  function banner() {
    const E = X().E, B = E.D.banner;
    // 隐藏的轮播图不播放（ED-06），位置按可见序号算
    const v = visIdx(), n = v.length, pos = Math.max(0, v.indexOf(E.slide));
    const slides = v.map((i) => `<div class="slide" style="filter:${slideF(i)}"></div>`).join('');
    const ind = B.ind === 'none' ? '' : `<div class="pc-ind ${B.ind}">${v.map((i, k) => `<i class="${k === pos ? 'on' : ''}" data-act="slideTo" data-arg="${i}" data-stop></i>`).join('')}</div>`;
    return `<div class="pc-banner" style="padding:${B.margin}px 0"><div class="vp" data-swipe style="width:${BAN_PC.w}px;height:${BAN_PC.h}px"><div class="track" data-pc-track data-n="${n}" data-size="pc" style="transform:translateX(${-pos * 100}%)">${slides}</div><span class="pc-spec">${BAN_PC.w}×${BAN_PC.h}</span></div>${ind}</div>`;
  }
  function jackpot() {
    const m = M('jackpot');
    const bg = m.bg && m.bgOn !== false ? `background-image:linear-gradient(135deg,#f6c445,#c9963b);filter:${m.bg};` : '';
    return `<div class="pc-sec" style="padding:${m.margin || 16}px 0"><div class="pc-jack ${m.layout || ''}" style="border-radius:${m.corner || 0}px;${bg}"><span class="tt">${ic('sparkle-fill')}${esc(m.title || '')}</span><b class="${m.anim === 'roll' ? 'roll' : ''}">¥ 88,888,888.88</b><span class="sd"></span></div></div>`;
  }
  function midnav() {
    const m = M('midnav');
    const acct = m.layout === 'account' ? `<div class="acct"><span>¥ 1,280.00</span><span class="sp"></span><span class="a">充值</span><span class="a">提现</span></div>` : '';
    const items = vis('midnav').slice(0, 10).map((it) => `<div class="it"><span class="ib ${it.img ? 'cu' : it.i ? '' : 'ph'}">${it.img ? `<img src="${it.img}" alt="">` : ic(it.i || 'plus')}</span><span class="nm">${esc(nm(it))}</span></div>`).join('');
    return `<div class="pc-mid-wrap"><div class="pc-sec">${acct}<div class="pc-mid">${items}</div></div></div>`;
  }
  function gamemenu() {
    const m = M('gamemenu');
    const icons = m.style === 'icons';
    return `<div class="pc-gm-wrap"><div class="pc-sec"><div class="pc-gm ${icons ? 'icons' : 'tabs'} ${m.shape || 'pill'}">${vis('gamemenu').map((it, i) => { const src = i ? it.img : it.imgOn || it.img; return `<span class="${i ? '' : 'on'}">${icons ? (src ? im(src) : it.i ? ic(it.i) : '') : ''}<em>${esc(nm(it))}</em></span>`; }).join('')}</div></div></div>`;
  }
  function gamecards() {
    const m = M('gamecards');
    return `<div class="pc-sec"><div class="pc-gc" style="gap:${m.gap || 16}px">${GAMES.map(([n, tg, fb]) => `<div class="c"><div class="im ${fb ? 'fb' : ''}" style="border-radius:${m.corner || 0}px;${fb && m.fallback ? `filter:${m.fallback}` : ''}">${fb ? ic('image-fill') : ''}${tg && m.tag ? `<span class="tg">${tg}</span>` : ''}</div>${m.name ? `<span class="nm">${esc(n)}</span>` : ''}</div>`).join('')}</div></div>`;
  }
  function footer() {
    const m = M('footer');
    return `<div class="pc-foot" style="text-align:${m.align || 'center'}"><div class="pc-sec"><div class="ln">${vis('footer').map((x) => `<span>${esc(nm(x))}</span>`).join('')}</div><div class="cp">${esc(m.copy || '')}</div></div></div>`;
  }
  function rail() {
    return `<div class="pc-rail">${vis('sidebar').map((it, i) => `<div class="ri ${i ? '' : 'on'}">${it.img ? im(it.img) : ic(it.i || 'square')}<span>${esc(nm(it))}</span></div>`).join('')}</div>`;
  }
  // 未知模块（别的组新增）：用 H5 渲染放大后居中，至少能看到、能选中
  function fallback(id) {
    const b = base(id);
    const inner = window.MP && window.MP.h5 ? window.MP.h5(b, id) : '';
    return `<div class="pc-sec pc-fb">${inner || ''}</div>`;
  }
  function modHtml(id) {
    switch (base(id)) {
      case 'banner': return banner();
      case 'jackpot': return jackpot();
      case 'midnav': return midnav();
      case 'gamemenu': return gamemenu();
      case 'gamecards': return gamecards();
      case 'footer': return footer();
      case 'menubar': case 'sidebar': case 'bottomnav': case 'topbar': return '';
      default: return fallback(id);
    }
  }

  function page(z) {
    const D = X().E.D;
    const body = D.order.filter((id) => !D.hidden[id] && modHtml(id)).map((id) => wrap(id, modHtml(id))).join('');
    const top = D.hidden.topbar ? '' : wrap('topbar', topbar(), { top: true });
    const side = D.hidden.sidebar ? '' : `<div class="pc-rail-pos ${D.side === 'right' ? 'right' : 'left'}">${wrap('sidebar', rail())}</div>`;
    return `<div class="pc pc-page ${D.iconStyle ? 'ics-' + D.iconStyle : ''}" data-pc-page style="${zStyle(z)};${themeStyle()}">${top}<div class="pc-body">${body}${side}</div></div>`;
  }
  function zoomBar() {
    const z = curZ();
    const btn = (v, label) => `<button class="${st.zoom === v ? 'is-on' : ''}" data-act="pcZoom" data-arg="${v}">${label}</button>`;
    return `<div class="pc-zb"><span class="pct" data-pc-pct>${Math.round(z * 100)}%</span><div class="iseg">${btn('fit', esc(t('ed/zoom-fit')))}${LEVELS.map((v) => btn(v, v + '%')).join('')}</div></div>`;
  }

  // ---------- 对外：画布 ----------
  function canvas(opts = {}) {
    st.mobile = !!opts.mobile;
    const z = curZ();
    if (st.mobile) return `<div class="pc-m" data-pc-host="m">${page(z)}</div><div class="pc-mfloat">${zoomBar()}</div>`;
    return `<div class="ed-stage pc-stage" data-pc-host="d">${page(z)}</div><div class="pc-floats"><div>${zoomBar()}</div></div>`;
  }
  // 底部导航在 PC 不显示：左栏 caption 与右栏提示（C 组可以直接调用；没调用时 AFTER_RENDER 自动补上）
  const rowNote = (id) => (X().E.device === 'pc' && base(id) === 'bottomnav' ? `<span class="st pc-st" title="${esc(t('ed/pc-no-bnav'))}">${t('ed/pc-no-bnav')}</span>` : '');
  const panelNote = (id) => (X().E.device === 'pc' && id && base(id) === 'bottomnav' ? `<div class="notice pc-note">${ic('info-fill')}<div>${t('ed/pc-bnav-note')}</div></div>` : '');

  // ---------- 缩放 ----------
  A.pcZoom = (v) => { st.zoom = v === 'fit' ? 'fit' : +v; try { window.LS.set('pcZoom', st.zoom); } catch (e) { /* noop */ } };
  function applyZoom(z) {
    document.querySelectorAll('[data-pc-page]').forEach((n) => { n.style.zoom = z; n.style.setProperty('--pc-iz', (1 / z).toFixed(4)); });
    document.querySelectorAll('[data-pc-pct]').forEach((n) => { n.textContent = Math.round(z * 100) + '%'; });
  }
  function measure() {
    const host = document.querySelector('[data-pc-host]'); if (!host) return;
    const mob = host.dataset.pcHost === 'm';
    const box = mob ? host.parentElement : host.closest('.ed-canvas') || host;
    const w = box.clientWidth - (mob ? 24 : 48);
    if (w <= 0) return;
    const f = Math.max(0.05, Math.min(1, w / PAGE_W));
    if (mob) st.mfit = f; else st.fit = f;
    if (st.zoom === 'fit') applyZoom(f);
  }

  // 底部导航提示 + 左栏 caption：editor.js 没有直接拼的话在渲染后补上
  function injectNotes() {
    const x = X(); if (!x || !x.E || x.E.device !== 'pc' || window.S.route !== 'editor') return;
    document.querySelectorAll('.row[data-row="bottomnav"]').forEach((r) => {
      if (r.querySelector('.pc-st')) return;
      const eye = r.querySelector('.eye'); const s = document.createElement('span');
      s.innerHTML = rowNote('bottomnav'); const n = s.firstChild; if (!n) return;
      if (eye) r.insertBefore(n, eye); else r.appendChild(n);
    });
    if (x.E.sel && base(x.E.sel) === 'bottomnav') {
      const host = document.querySelector('.ed-right') || document.querySelector('.med-sheet');
      if (host && !host.querySelector('.pc-note')) {
        const anchor = host.querySelector('.sheet-head') || host.querySelector('.p-title');
        const s = document.createElement('div'); s.innerHTML = panelNote(x.E.sel); const n = s.firstChild;
        if (n) { if (anchor) anchor.after(n); else host.prepend(n); }
      }
    }
  }
  window.AFTER_RENDER.push(() => { measure(); injectNotes(); });
  window.addEventListener('resize', () => { measure(); });

  // Banner 轮播：editor.js 的 setSlide 只更新 H5，这里跟随 E.slide；取色时主题变量实时刷新
  let lastSlide = -1, lastTheme = '';
  setInterval(() => {
    const x = X(); if (!x || !x.E || x.E.device !== 'pc' || window.S.route !== 'editor') return;
    const E = x.E;
    if (E.slide !== lastSlide) {
      lastSlide = E.slide;
      const pos = Math.max(0, visIdx().indexOf(E.slide));
      document.querySelectorAll('[data-pc-track]').forEach((n) => { n.style.transform = bannerShift(+n.dataset.n, n.dataset.size, pos); });
      document.querySelectorAll('.pc-ind').forEach((w) => [...w.children].forEach((d, k) => d.classList.toggle('on', k === pos)));
    }
    if (E.picker) {
      const s = themeStyle();
      if (s !== lastTheme) { lastTheme = s; document.querySelectorAll('[data-pc-page]').forEach((n) => { const z = curZ(); n.style.cssText = zStyle(z) + ';' + s; }); }
    } else lastTheme = '';
  }, 120);

  // 手机：双指缩放（横向拖动用画布原生滚动）
  let pinch = null;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2 || !e.target.closest('[data-pc-host="m"]')) return;
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    pinch = { d, z: curZ() };
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const z = Math.max(st.mfit, Math.min(1, pinch.z * d / pinch.d));
    st.zoom = Math.round(z * 1000) / 10; applyZoom(z);
    document.querySelectorAll('.pc-zb .iseg button').forEach((b) => b.classList.remove('is-on'));
  }, { passive: false });
  document.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinch = null; });

  window.PC = { canvas, rowNote, panelNote, zoom: curZ, page }; // page：AD 的放大预览 / 结构预览按给定设计渲染 PC 页
})();
