/**
 * 定制等级与设计范围（来源：改造方案「业务主题改为定制版等级」「11 类页面与模块范围」）。
 * 等级只决定设计范围；不是素材行业筛选，也不会写进 AI 提示词。
 */

export type LevelId = 'normal' | 'advanced' | 'full';

export type CategoryId =
  | 'home'
  | 'jackpot'
  | 'footer'
  | 'menubar'
  | 'login'
  | 'downloadBar'
  | 'appDownloadModal'
  | 'gameSecondary'
  | 'mine'
  | 'promo'
  | 'referral';

export const CATEGORIES: Record<CategoryId, { label: string; pc: boolean }> = {
  home: { label: '首页', pc: true },
  jackpot: { label: '彩金池', pc: true },
  footer: { label: '页脚', pc: true },
  menubar: { label: '菜单栏', pc: true },
  login: { label: '登录注册页', pc: false },
  downloadBar: { label: '下载引导条', pc: false },
  appDownloadModal: { label: 'APP 下载弹窗', pc: false },
  gameSecondary: { label: '游戏二级页', pc: false },
  mine: { label: '我的页面', pc: false },
  promo: { label: '优惠中心', pc: false },
  referral: { label: '推广', pc: false },
};

const NORMAL: CategoryId[] = ['home', 'jackpot', 'footer', 'menubar'];
const ADVANCED: CategoryId[] = [...NORMAL, 'login', 'downloadBar', 'appDownloadModal', 'gameSecondary', 'mine'];
const FULL: CategoryId[] = [...ADVANCED, 'promo', 'referral'];

export const LEVELS: Record<LevelId, { label: string; summary: string; categories: CategoryId[] }> = {
  normal: { label: '普通定制', summary: '定制首页与基础公共模块', categories: NORMAL },
  advanced: { label: '高级定制', summary: '增加登录、下载及个人页面', categories: ADVANCED },
  full: { label: '全方位定制', summary: '覆盖完整定制范围', categories: FULL },
};

export const LEVEL_ORDER: LevelId[] = ['normal', 'advanced', 'full'];

/** 某等级在某端可设计的类别。PC 只覆盖前四类，选全方位也不会自动承诺 PC 独立设计。 */
export function scopeFor(level: LevelId, platform: 'h5' | 'pc'): CategoryId[] {
  const cats = LEVELS[level].categories;
  return platform === 'pc' ? cats.filter((c) => CATEGORIES[c].pc) : cats;
}

/** 降级时不在范围内的类别：保留草稿，只是不计入交付。 */
export function outOfScope(level: LevelId, platform: 'h5' | 'pc'): CategoryId[] {
  const inScope = new Set(scopeFor(level, platform));
  return (Object.keys(CATEGORIES) as CategoryId[]).filter((c) => !inScope.has(c));
}

/** 首版实际可编辑的类别（其余显示“即将开放”）。 */
export const IMPLEMENTED_CATEGORIES: CategoryId[] = ['home'];
