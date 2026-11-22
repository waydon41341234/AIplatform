/**
 * 首页布局计算（纯函数，不依赖 DOM）：画布、PNG、SVG、溢出检查共用。
 * 单位均为 H5 逻辑像素（750 宽画布）。
 */
import { BANNER_SPECS, CARD_SPECS, H5_CANVAS } from '../catalog/specs.ts';
import type { ModuleType } from '../catalog/home.ts';
import type { HomePage } from '../project/model.ts';

export const GAP = 16;
export const SIDE = (H5_CANVAS.width - H5_CANVAS.contentWidth) / 2; // 20
export const BOTTOMNAV_HEIGHT = 110;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function bannerBox(page: HomePage): { w: number; h: number; perRow: number; slot: { w: number; h: number } } {
  const m = page.modules.banner;
  const spec = BANNER_SPECS[m.props.spec];
  const full = m.layoutId === 'banner.full';
  if (m.props.spec === 'small') {
    const slotW = (H5_CANVAS.contentWidth - GAP) / 2;
    const slotH = Math.round((slotW * spec.height) / spec.width);
    return { w: H5_CANVAS.contentWidth, h: slotH + 28, perRow: 2, slot: { w: slotW, h: slotH } };
  }
  const w = full ? H5_CANVAS.width : H5_CANVAS.contentWidth;
  const h = Math.round((w * spec.height) / spec.width);
  return { w, h: h + 28, perRow: 1, slot: { w, h } };
}

export function cardColumns(layoutId: string): number {
  return layoutId === 'gamecards.grid2' ? 2 : layoutId === 'gamecards.grid4' ? 4 : 3;
}

export function cardGrid(page: HomePage) {
  const m = page.modules.gamecards;
  const cols = cardColumns(m.layoutId);
  const gap = 16;
  const cw = (H5_CANVAS.contentWidth - gap * (cols - 1)) / cols;
  const spec = CARD_SPECS[m.props.cardSize];
  const ch = Math.round((cw * spec.height) / spec.width);
  const label = 40;
  const rows = Math.ceil(m.props.count / cols);
  return { cols, gap, cw, ch, label, rows, h: rows * (ch + label) + (rows - 1) * gap };
}

export function moduleHeight(page: HomePage, t: ModuleType): number {
  const m = page.modules[t];
  switch (t) {
    case 'topbar': return page.modules.topbar.props.height;
    case 'banner': return bannerBox(page).h;
    case 'midnav': return m.layoutId === 'midnav.account' ? 240 : 140;
    case 'jackpot': return m.layoutId === 'jackpot.compact' ? 110 : 150;
    case 'gamemenu': return m.layoutId === 'gamemenu.icons' ? 150 : 84;
    case 'gamecards': return cardGrid(page).h;
    case 'footer': return 140;
    case 'bottomnav': return BOTTOMNAV_HEIGHT;
    case 'sidebar': return 0;
  }
}

export interface PageLayout {
  boxes: Partial<Record<ModuleType, Box>>;
  contentHeight: number;
  overflow: number;
}

/** 顶部栏固定在上，底部导航固定在下，流式模块按 flowOrder 排列。 */
export function layoutHome(page: HomePage): PageLayout {
  const boxes: PageLayout['boxes'] = {};
  const top = page.modules.topbar.visible ? page.modules.topbar.props.height : 0;
  if (page.modules.topbar.visible) boxes.topbar = { x: 0, y: 0, w: H5_CANVAS.width, h: top };
  let y = top + GAP;
  for (const t of page.flowOrder) {
    const m = page.modules[t];
    if (!m.visible) continue;
    const h = moduleHeight(page, t);
    const full = t === 'banner' && m.layoutId === 'banner.full';
    boxes[t] = { x: full ? 0 : SIDE, y, w: full ? H5_CANVAS.width : H5_CANVAS.contentWidth, h };
    y += h + GAP;
  }
  const bottom = page.modules.bottomnav.visible ? BOTTOMNAV_HEIGHT : 0;
  const contentHeight = y + bottom;
  if (page.modules.bottomnav.visible) boxes.bottomnav = { x: 0, y: page.height - bottom, w: H5_CANVAS.width, h: bottom };
  if (page.modules.sidebar.visible && page.preview.sidebarOpen) boxes.sidebar = { x: 0, y: 0, w: 460, h: page.height };
  return { boxes, contentHeight, overflow: Math.max(0, contentHeight - page.height) };
}
