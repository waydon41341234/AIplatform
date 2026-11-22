/**
 * 首页 SVG 渲染器（唯一渲染源）。
 * 画布预览、SVG 导出、PNG 导出都调用 renderHomeSvg，保证三者一致。
 *
 * 每个上色图形都带 data-element（元素 ID）与 data-key（色值 Key），
 * 导出的 SVG 因此保留 Key 标识，同时写入解析后的颜色可独立打开。
 */
import { BOTTOMNAV_ENTRIES, MIDNAV_ENTRIES } from '../catalog/home.ts';
import { ICON_SPECS, logoDisplaySize } from '../catalog/specs.ts';
import { H5_CANVAS } from '../catalog/specs.ts';
import { bindingOf, colorOf } from '../project/bindings.ts';
import type { Project } from '../project/model.ts';
import { bannerBox, cardGrid, layoutHome, type Box } from './layout.ts';

export interface RenderOptions {
  /** 把素材 URL 换成 data URI（导出时用） */
  resolveAsset?: (url: string) => string;
  /** 预览时给每个模块加可点击的命中区 */
  interactive?: boolean;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function renderHomeSvg(p: Project, opts: RenderOptions = {}): string {
  const page = p.pages.home;
  const W = H5_CANVAS.width;
  const H = page.height;
  const lay = layoutHome(page);
  const assets = new Map(p.assets.map((a) => [a.id, a]));
  const href = (id?: string) => {
    const a = id ? assets.get(id) : undefined;
    if (!a) return undefined;
    return opts.resolveAsset ? opts.resolveAsset(a.url) : a.url;
  };
  const font = `font-family="PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif"`;

  /** 生成绑定了 Key 的 fill 属性 */
  const fill = (el: string) => {
    const c = colorOf(p, el);
    const key = bindingOf(p, el).key;
    return `fill="${c.hex}"${c.alpha < 1 ? ` fill-opacity="${+c.alpha.toFixed(4)}"` : ''} data-element="${el}" data-key="${key}"`;
  };
  const rect = (b: Box, el: string, r = 0) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" ${fill(el)}/>`;
  const text = (x: number, y: number, s: string, el: string, size = 24, anchor = 'start', weight = 400) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="middle" ${font} ${fill(el)}>${esc(s)}</text>`;
  const image = (b: Box, id: string | undefined, clipR = 0, fit: 'slice' | 'meet' = 'slice') => {
    const h = href(id);
    if (!h) return '';
    const clipId = `c${Math.round(b.x)}_${Math.round(b.y)}_${Math.round(b.w)}`;
    const clip = clipR ? `<clipPath id="${clipId}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${clipR}"/></clipPath>` : '';
    return `${clip}<image href="${esc(h)}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" preserveAspectRatio="xMidYMid ${fit}"${clipR ? ` clip-path="url(#${clipId})"` : ''}/>`;
  };
  /** 没有图标素材时的占位图形（用 Key 着色） */
  const iconPlaceholder = (cx: number, cy: number, w: number, h: number, label: string, el: string) =>
    `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${Math.min(w, h) / 4}" ${fill(el)} fill-opacity="0.15"/>` +
    `<text x="${cx}" y="${cy + 1}" font-size="${Math.round(h * 0.42)}" text-anchor="middle" dominant-baseline="middle" ${font} ${fill(el)}>${esc(label.slice(0, 1))}</text>`;

  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${W}" height="${H}" ${fill('page.bg')}/>`);

  const group = (id: string, label: string, inner: string) => `<g id="module-${id}" data-module="${id}" data-label="${esc(label)}">${inner}</g>`;

  // ---- 流式模块 ----
  for (const t of page.flowOrder) {
    const b = lay.boxes[t];
    if (!b) continue;
    const m = page.modules;
    let s = '';
    switch (t) {
      case 'banner': {
        const bb = bannerBox(page);
        const r = m.banner.layoutId === 'banner.full' ? 0 : 16;
        const imgs = m.banner.props.images;
        const n = Math.max(imgs.length, 1);
        const shown = bb.perRow === 2 ? [0, 1] : [Math.min(m.banner.props.active, n - 1)];
        shown.forEach((idx, i) => {
          const slot = { x: b.x + i * (bb.slot.w + 20), y: b.y, w: bb.slot.w, h: bb.slot.h };
          s += rect(slot, 'banner.placeholder', r);
          s += imgs[idx] ? image(slot, imgs[idx], r) : `<text x="${slot.x + slot.w / 2}" y="${slot.y + slot.h / 2}" font-size="26" text-anchor="middle" dominant-baseline="middle" ${font} fill="#999999">Banner</text>`;
        });
        s += renderIndicator(m.banner.props.indicator, n, Math.min(m.banner.props.active, n - 1), W / 2, b.y + bb.slot.h + 14, fill);
        break;
      }
      case 'midnav': {
        s += rect(b, 'midnav.bg', 20);
        const entries = m.midnav.props.mode === 'configurable' ? MIDNAV_ENTRIES.map((e) => e.id) : m.midnav.props.entries;
        const shown = entries.slice(0, 5);
        const top = m.midnav.layoutId === 'midnav.account' ? b.y + 100 : b.y - 5;
        if (m.midnav.layoutId === 'midnav.account') {
          s += text(b.x + 30, b.y + 40, '账户余额', 'midnav.text', 24);
          s += text(b.x + 30, b.y + 78, '¥ 0.00', 'midnav.text', 32, 'start', 600);
        }
        const spec = ICON_SPECS.midnav;
        shown.forEach((id, i) => {
          const e = MIDNAV_ENTRIES.find((x) => x.id === id)!;
          const cx = b.x + (b.w / shown.length) * (i + 0.5);
          const cy = top + 55;
          const st = e.states.includes('unread') ? 'unread' : e.states[0];
          const icon = m.midnav.props.icons[`${id}:${st}`];
          const ib = { x: cx - spec.width / 2, y: cy - spec.height / 2, w: spec.width, h: spec.height };
          s += icon ? image(ib, icon, 0, 'meet') : iconPlaceholder(cx, cy, spec.width, spec.height, e.label, 'midnav.icon');
          s += text(cx, top + 112, e.label, 'midnav.text', 22, 'middle');
        });
        break;
      }
      case 'jackpot': {
        s += rect(b, 'jackpot.bg', 20);
        const compact = m.jackpot.layoutId === 'jackpot.compact';
        s += text(b.x + b.w / 2, b.y + (compact ? 34 : 44), m.jackpot.props.title, 'jackpot.title', compact ? 24 : 30, 'middle', 600);
        s += text(b.x + b.w / 2, b.y + (compact ? 76 : 100), m.jackpot.props.amount, 'jackpot.amount', compact ? 40 : 54, 'middle', 700);
        break;
      }
      case 'gamemenu': {
        s += rect(b, 'gamemenu.bg', 16);
        const cats = m.gamemenu.props.categories;
        const w = b.w / cats.length;
        const icons = m.gamemenu.layoutId === 'gamemenu.icons';
        cats.forEach((c, i) => {
          const cx = b.x + w * (i + 0.5);
          const active = i === m.gamemenu.props.active;
          if (icons) {
            const spec = ICON_SPECS.gametype;
            if (active) s += rect({ x: b.x + w * i + 6, y: b.y + 8, w: w - 12, h: b.h - 16 }, 'gamemenu.active', 14);
            s += iconPlaceholder(cx, b.y + 58, spec.width * 0.8, spec.height * 0.8, c, active ? 'gamemenu.activeText' : 'gamemenu.text');
            s += text(cx, b.y + 118, c, active ? 'gamemenu.activeText' : 'gamemenu.text', 24, 'middle', active ? 600 : 400);
          } else {
            if (active) s += rect({ x: b.x + w * i + 8, y: b.y + 14, w: w - 16, h: b.h - 28 }, 'gamemenu.active', (b.h - 28) / 2);
            s += text(cx, b.y + b.h / 2, c, active ? 'gamemenu.activeText' : 'gamemenu.text', 26, 'middle', active ? 600 : 400);
          }
        });
        break;
      }
      case 'gamecards': {
        const g = cardGrid(page);
        for (let i = 0; i < m.gamecards.props.count; i++) {
          const col = i % g.cols;
          const row = Math.floor(i / g.cols);
          const cb = { x: b.x + col * (g.cw + g.gap), y: b.y + row * (g.ch + g.label + g.gap), w: g.cw, h: g.ch };
          s += rect(cb, 'gamecards.placeholder', 14);
          const img = m.gamecards.props.images[i];
          s += img ? image(cb, img, 14) : `<circle cx="${cb.x + cb.w / 2}" cy="${cb.y + cb.h / 2}" r="${Math.min(cb.w, cb.h) / 6}" ${fill('gamecards.placeholderIcon')}/>`;
          if (m.gamecards.props.showLabel && i < 2) {
            s += rect({ x: cb.x, y: cb.y, w: 64, h: 30 }, 'gamecards.label', 8);
            s += text(cb.x + 32, cb.y + 16, i === 0 ? '热门' : '新', 'gamecards.labelText', 18, 'middle', 600);
          }
          s += text(cb.x + cb.w / 2, cb.y + cb.h + 22, `游戏名称 ${i + 1}`, 'gamecards.text', 22, 'middle');
        }
        break;
      }
      case 'footer': {
        s += rect(b, 'footer.bg', 16);
        const links = m.footer.props.links;
        links.forEach((l, i) => (s += text(b.x + (b.w / links.length) * (i + 0.5), b.y + 48, l, 'footer.link', 22, 'middle')));
        s += text(b.x + b.w / 2, b.y + 96, m.footer.props.text, 'footer.text', 20, 'middle');
        break;
      }
      default:
        break;
    }
    parts.push(group(t, t, s));
  }

  // ---- 顶部栏（固定在上） ----
  if (lay.boxes.topbar) {
    const b = lay.boxes.topbar;
    const tp = page.modules.topbar.props;
    let s = rect(b, 'topbar.bg');
    if (tp.bgMode === 'image' && tp.bgImage) s += image(b, tp.bgImage);
    const cy = b.h / 2;
    // 侧边栏入口
    s += [0, 1, 2].map((i) => `<rect x="24" y="${cy - 12 + i * 10}" width="30" height="4" rx="2" ${fill('topbar.icon')}/>`).join('');
    const logo = tp.logo ? assets.get(tp.logo) : undefined;
    const centered = page.modules.topbar.layoutId === 'topbar.centered';
    const logoH = Math.round(b.h * 0.6); // 在 H/100 比例内进一步等比缩小，留内边距
    if (logo) {
      const d = logoDisplaySize(logo.width, b.h);
      const w = Math.round((d.width * logoH) / d.height);
      s += image({ x: centered ? W / 2 - w / 2 : 76, y: cy - logoH / 2, w, h: logoH }, tp.logo, 0, 'meet');
    } else {
      s += text(centered ? W / 2 : 76, cy, tp.brandText || 'LOGO', 'topbar.icon', 30, centered ? 'middle' : 'start', 700);
    }
    let right = W - 24;
    if (page.preview.loggedIn) {
      const bw = 200;
      s += rect({ x: right - bw, y: cy - 26, w: bw, h: 52 }, 'topbar.balance.bg', 26);
      s += text(right - bw / 2, cy, '¥ 12,345.00', 'topbar.balance.text', 24, 'middle', 600);
      right -= bw + 16;
    } else if (!centered) {
      s += rect({ x: right - 104, y: cy - 26, w: 104, h: 52 }, 'topbar.register.bg', 26);
      s += text(right - 52, cy, '注册', 'topbar.register.text', 24, 'middle', 600);
      s += rect({ x: right - 220, y: cy - 26, w: 104, h: 52 }, 'topbar.login.bg', 26);
      s += text(right - 168, cy, '登录', 'topbar.login.text', 24, 'middle', 600);
      right -= 236;
    } else {
      s += rect({ x: right - 104, y: cy - 26, w: 104, h: 52 }, 'topbar.login.bg', 26);
      s += text(right - 52, cy, '登录', 'topbar.login.text', 24, 'middle', 600);
      right -= 120;
    }
    if (tp.showSearch) {
      s += `<circle cx="${right - 18}" cy="${cy - 3}" r="13" fill="none" stroke-width="4" stroke="${colorOf(p, 'topbar.search').hex}" data-element="topbar.search" data-key="${bindingOf(p, 'topbar.search').key}"/>`;
      s += `<rect x="${right - 8}" y="${cy + 7}" width="12" height="4" rx="2" transform="rotate(45 ${right - 8} ${cy + 7})" ${fill('topbar.search')}/>`;
    }
    parts.push(group('topbar', 'topbar', s));
  }

  // ---- 底部导航（固定在下） ----
  if (lay.boxes.bottomnav) {
    const b = lay.boxes.bottomnav;
    const np = page.modules.bottomnav.props;
    const entries = np.mode === 'configurable' ? BOTTOMNAV_ENTRIES.map((e) => e.id) : np.entries;
    let s = rect(b, 'bottomnav.bg');
    s += `<rect x="0" y="${b.y}" width="${W}" height="1" fill="#000000" fill-opacity="0.06"/>`;
    const w = W / entries.length;
    const spec = ICON_SPECS.bottomnav;
    const raised = page.modules.bottomnav.layoutId === 'bottomnav.raised';
    entries.forEach((id, i) => {
      const e = BOTTOMNAV_ENTRIES.find((x) => x.id === id)!;
      const active = i === np.active;
      const el = active ? 'bottomnav.active' : 'bottomnav.def';
      const cx = w * (i + 0.5);
      const isMid = raised && i === Math.floor(entries.length / 2);
      const cy = b.y + (isMid ? 18 : 40);
      if (isMid) s += `<circle cx="${cx}" cy="${cy}" r="52" ${fill('bottomnav.bg')}/>`;
      const icon = np.icons[`${id}:${active ? 'active' : 'default'}`];
      const sz = isMid ? 1.3 : 0.7;
      const ib = { x: cx - (spec.width * sz) / 2, y: cy - (spec.height * sz) / 2, w: spec.width * sz, h: spec.height * sz };
      s += icon ? image(ib, icon, 0, 'meet') : iconPlaceholder(cx, cy, ib.w, ib.h, e.label, el);
      s += text(cx, b.y + 88, e.label, el, 20, 'middle', active ? 600 : 400);
    });
    parts.push(group('bottomnav', 'bottomnav', s));
  }

  // ---- 侧边栏（浮层） ----
  if (lay.boxes.sidebar) {
    const b = lay.boxes.sidebar;
    const sp = page.modules.sidebar.props;
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#000000" fill-opacity="0.45"/>` + rect(b, 'sidebar.bg');
    const grid = page.modules.sidebar.layoutId === 'sidebar.grid';
    sp.entries.forEach((e, i) => {
      const active = i === sp.active;
      const ib = grid
        ? { x: 24 + (i % 2) * 210, y: 120 + Math.floor(i / 2) * 150, w: 196, h: 130 }
        : { x: 24, y: 120 + i * 96, w: b.w - 48, h: 80 };
      s += rect(ib, active ? 'sidebar.item.active' : 'sidebar.item', 16);
      s += text(ib.x + (grid ? ib.w / 2 : 32), ib.y + ib.h / 2, e, active ? 'sidebar.text.active' : 'sidebar.text', 26, grid ? 'middle' : 'start', active ? 600 : 400);
    });
    parts.push(group('sidebar', 'sidebar', s));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-project="${esc(p.id)}">${parts.join('')}</svg>`;
}

/**
 * 轮播指示器四种默认样式。
 * ⚠️【推测】外形按方案中“五点示例”尺寸近似绘制，正式形状需从皮肤组件库节点登记。
 */
function renderIndicator(style: string, n: number, active: number, cx: number, cy: number, fill: (el: string) => string): string {
  const parts: string[] = [];
  const spec = {
    style1: { dot: 10, activeW: 24, gap: 8, h: 10, r: 5 },
    style2: { dot: 10, activeW: 10, gap: 10, h: 10, r: 5 },
    style3: { dot: 12, activeW: 12, gap: 10, h: 12, r: 3 },
    style4: { dot: 30, activeW: 30, gap: 4, h: 6, r: 3 },
  }[style] ?? { dot: 10, activeW: 24, gap: 8, h: 10, r: 5 };
  const total = (n - 1) * (spec.dot + spec.gap) + spec.activeW;
  let x = cx - total / 2;
  for (let i = 0; i < n; i++) {
    const w = i === active ? spec.activeW : spec.dot;
    parts.push(`<rect x="${x}" y="${cy - spec.h / 2}" width="${w}" height="${spec.h}" rx="${spec.r}" ${fill(i === active ? 'banner.indicator.active' : 'banner.indicator.def')}/>`);
    x += w + spec.gap;
  }
  return parts.join('');
}
