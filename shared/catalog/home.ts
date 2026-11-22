/**
 * 首页九模块、可绑定颜色的元素、区域布局、导航入口清单。
 *
 * ⚠️ 标【推测】的条目是首版占位：真实组件语义、布局与入口清单需按公司模板登记（见 docs/assumptions.md）。
 * 换成真实数据时只改本文件，渲染器和检查器会自动跟随。
 */
import type { ThemeKey } from '../theme/keys.ts';

export type ModuleType = 'topbar' | 'banner' | 'sidebar' | 'gamecards' | 'gamemenu' | 'bottomnav' | 'footer' | 'jackpot' | 'midnav';

/** 九模块，顺序为方案表格顺序，不代表页面排列顺序。 */
export const MODULES: Record<ModuleType, { label: string; placement: 'fixed-top' | 'flow' | 'fixed-bottom' | 'overlay' }> = {
  topbar: { label: '顶部栏', placement: 'fixed-top' },
  banner: { label: 'Banner', placement: 'flow' },
  sidebar: { label: '侧边栏', placement: 'overlay' },
  gamecards: { label: '游戏卡片', placement: 'flow' },
  gamemenu: { label: '游戏菜单', placement: 'flow' },
  bottomnav: { label: '底部导航', placement: 'fixed-bottom' },
  footer: { label: '页脚', placement: 'flow' },
  jackpot: { label: '彩金池', placement: 'flow' },
  midnav: { label: '中部导航', placement: 'flow' },
};

export const MODULE_TYPES = Object.keys(MODULES) as ModuleType[];

export interface ElementDef {
  /** 稳定元素 ID：`模块.元素`，绑定和导出都用它 */
  id: string;
  label: string;
  defaultKey: ThemeKey;
  /** 【推测】标记：默认 Key 为首版推断，未经公司组件登记确认 */
  guess?: boolean;
}

/** 页面级元素（首页背景）。 */
export const PAGE_ELEMENTS: ElementDef[] = [{ id: 'page.bg', label: '首页背景', defaultKey: 'home_bg' }];

export const MODULE_ELEMENTS: Record<ModuleType, ElementDef[]> = {
  topbar: [
    { id: 'topbar.bg', label: '顶部栏背景', defaultKey: 'bs_topnav_bg' },
    { id: 'topbar.icon', label: '入口图标', defaultKey: 'text_primary', guess: true },
    { id: 'topbar.search', label: '搜索图标', defaultKey: 'search_icon' },
    { id: 'topbar.login.bg', label: '登录按钮', defaultKey: 'bg_2', guess: true },
    { id: 'topbar.login.text', label: '登录按钮文字', defaultKey: 'primary', guess: true },
    { id: 'topbar.register.bg', label: '注册按钮', defaultKey: 'accent_3', guess: true },
    { id: 'topbar.register.text', label: '注册按钮文字', defaultKey: 'text_accent3', guess: true },
    { id: 'topbar.balance.bg', label: '余额框', defaultKey: 'bg_2', guess: true },
    { id: 'topbar.balance.text', label: '余额文字', defaultKey: 'lead', guess: true },
  ],
  banner: [
    { id: 'banner.placeholder', label: 'Banner 占位底', defaultKey: 'ddt_bg' },
    { id: 'banner.indicator.active', label: '指示器（选中）', defaultKey: 'primary', guess: true },
    { id: 'banner.indicator.def', label: '指示器（未选中）', defaultKey: 'neutral_3', guess: true },
  ],
  sidebar: [
    { id: 'sidebar.bg', label: '侧边栏底', defaultKey: 'bs_zc_bg' },
    { id: 'sidebar.item', label: '入口按钮', defaultKey: 'bs_zc_an1' },
    { id: 'sidebar.item.active', label: '入口按钮（选中）', defaultKey: 'primary', guess: true },
    { id: 'sidebar.text', label: '入口文字', defaultKey: 'leftnav_def' },
    { id: 'sidebar.text.active', label: '入口文字（选中）', defaultKey: 'leftnav_active' },
  ],
  gamecards: [
    { id: 'gamecards.placeholder', label: '卡片兜底底板', defaultKey: 'ddt_bg' },
    { id: 'gamecards.placeholderIcon', label: '兜底图形', defaultKey: 'ddt_icon' },
    { id: 'gamecards.text', label: '卡片文字', defaultKey: 'cards_text' },
    { id: 'gamecards.label', label: '角标', defaultKey: 'label_accent3' },
    { id: 'gamecards.labelText', label: '角标文字', defaultKey: 'labeltext_accent3' },
  ],
  gamemenu: [
    { id: 'gamemenu.bg', label: '菜单底板', defaultKey: 'home_db' },
    { id: 'gamemenu.text', label: '分类文字', defaultKey: 'neutral_1', guess: true },
    { id: 'gamemenu.active', label: '选中分类', defaultKey: 'primary', guess: true },
    { id: 'gamemenu.activeText', label: '选中分类文字', defaultKey: 'text_primary', guess: true },
  ],
  bottomnav: [
    { id: 'bottomnav.bg', label: '底部导航底色', defaultKey: 'web_btmnav_db' },
    { id: 'bottomnav.def', label: '未选中文字/图标', defaultKey: 'btmnav_def' },
    { id: 'bottomnav.active', label: '选中文字/图标', defaultKey: 'btmnav_active' },
  ],
  footer: [
    { id: 'footer.bg', label: '页脚底', defaultKey: 'web_bs_yj_bg' },
    { id: 'footer.text', label: '页脚文字', defaultKey: 'neutral_2', guess: true },
    { id: 'footer.link', label: '链接文字', defaultKey: 'neutral_1', guess: true },
  ],
  jackpot: [
    { id: 'jackpot.bg', label: '彩金池背景', defaultKey: 'primary', guess: true },
    { id: 'jackpot.title', label: '彩金池标题', defaultKey: 'jackpot_text' },
    { id: 'jackpot.amount', label: '金额文字', defaultKey: 'jackpot_text', guess: true },
  ],
  midnav: [
    { id: 'midnav.bg', label: '中部导航底板', defaultKey: 'home_db' },
    { id: 'midnav.text', label: '入口文字', defaultKey: 'lead', guess: true },
    { id: 'midnav.icon', label: '默认图标颜色', defaultKey: 'icon_1' },
  ],
};

export function elementDef(id: string): ElementDef | undefined {
  return [...PAGE_ELEMENTS, ...Object.values(MODULE_ELEMENTS).flat()].find((e) => e.id === id);
}

// ---------- 区域布局 ----------

export interface LayoutDef {
  id: string;
  label: string;
  /** 【推测】首版占位布局，正式布局需登记 Figma 源节点（方案「区域独立布局选择」） */
  guess: true;
}

export const LAYOUTS: Record<ModuleType, LayoutDef[]> = {
  topbar: [
    { id: 'topbar.regular', label: '常规', guess: true },
    { id: 'topbar.centered', label: 'LOGO 居中', guess: true },
  ],
  banner: [
    { id: 'banner.full', label: '通栏', guess: true },
    { id: 'banner.card', label: '圆角卡片', guess: true },
  ],
  sidebar: [
    { id: 'sidebar.list', label: '列表', guess: true },
    { id: 'sidebar.grid', label: '宫格', guess: true },
  ],
  gamecards: [
    { id: 'gamecards.grid3', label: '三列', guess: true },
    { id: 'gamecards.grid2', label: '两列', guess: true },
    { id: 'gamecards.grid4', label: '四列', guess: true },
  ],
  gamemenu: [
    { id: 'gamemenu.tabs', label: '横向标签', guess: true },
    { id: 'gamemenu.icons', label: '图标分类', guess: true },
  ],
  bottomnav: [
    { id: 'bottomnav.regular', label: '常规', guess: true },
    { id: 'bottomnav.raised', label: '中间凸起', guess: true },
  ],
  footer: [{ id: 'footer.regular', label: '常规（目前仅核实一款）', guess: true }],
  jackpot: [
    { id: 'jackpot.flow', label: '通用', guess: true },
    { id: 'jackpot.compact', label: '紧凑', guess: true },
  ],
  midnav: [
    { id: 'midnav.row', label: '单行', guess: true },
    { id: 'midnav.account', label: '带账户区', guess: true },
  ],
};

// ---------- 导航入口 ----------

export interface NavEntry {
  id: string;
  label: string;
  /** 每个状态需要一张独立图标，例如消息已读/未读 */
  states: string[];
}

export const STATE_LABELS: Record<string, string> = { normal: '常态', active: '选中', default: '未选中', read: '已读', unread: '未读' };

/** 中部导航入口。固定入口模式下 msg/notice/announcement 必交；后台可配置清单【推测】，需与真实后台核对。 */
export const MIDNAV_ENTRIES: NavEntry[] = [
  { id: 'msg', label: '消息', states: ['read', 'unread'] },
  { id: 'notice', label: '通知', states: ['normal'] },
  { id: 'announcement', label: '公告', states: ['normal'] },
  { id: 'deposit', label: '充值', states: ['normal'] },
  { id: 'withdraw', label: '提现', states: ['normal'] },
  { id: 'vip', label: 'VIP', states: ['normal'] },
  { id: 'service', label: '客服', states: ['normal'] },
];
export const MIDNAV_FIXED_REQUIRED = ['msg', 'notice', 'announcement'];

/** 底部导航入口。固定入口模式下 home/mine 必交；后台可配置清单【推测】。 */
export const BOTTOMNAV_ENTRIES: NavEntry[] = [
  { id: 'home', label: '首页', states: ['default', 'active'] },
  { id: 'promo', label: '优惠', states: ['default', 'active'] },
  { id: 'deposit', label: '充值', states: ['default', 'active'] },
  { id: 'service', label: '客服', states: ['default', 'active'] },
  { id: 'mine', label: '我的', states: ['default', 'active'] },
];
export const BOTTOMNAV_FIXED_REQUIRED = ['home', 'mine'];

export type NavMode = 'configurable' | 'fixed';
export const NAV_MODE_LABELS: Record<NavMode, { label: string; help: string }> = {
  configurable: { label: '后台可更换入口', help: '需要提供该版式后台全部入口的图标' },
  fixed: { label: '入口固定', help: '只需提供必交入口，其他入口自行选配' },
};

/** 某导航在某模式下的必交入口。 */
export function requiredNavEntries(kind: 'midnav' | 'bottomnav', mode: NavMode): string[] {
  const all = kind === 'midnav' ? MIDNAV_ENTRIES : BOTTOMNAV_ENTRIES;
  if (mode === 'configurable') return all.map((e) => e.id);
  return kind === 'midnav' ? MIDNAV_FIXED_REQUIRED : BOTTOMNAV_FIXED_REQUIRED;
}
