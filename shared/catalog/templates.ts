/**
 * 版式模板与推荐配色。
 * 模板提供：“跟设计”七个 Key 的默认值、各区域初始布局、首页初始模块顺序。
 * ⚠️ 全部为【推测】首版占位，正式模板需要从公司 Figma 版式登记。
 */
import type { BaseKey, ColorRule, ExtKey, ThemeKey } from '../theme/keys.ts';
import type { ModuleType } from './home.ts';

export interface TemplateDef {
  id: string;
  label: string;
  description: string;
  designValues: Partial<Record<ExtKey, ColorRule>>;
  layouts: Partial<Record<ModuleType, string>>;
  /** 流式模块的初始顺序（顶部栏/底部导航/侧边栏位置固定，不在此列） */
  flowOrder: ModuleType[];
  cardStyle: 'classic' | 'western';
  /** 版式默认颜色用途（元素 ID → Key），优先于组件目录默认；业主设置或锁定的绑定优先于它 */
  defaultBindings?: Record<string, ThemeKey>;
  guess: true;
}

const r = (key: string): ColorRule => ({ kind: 'ref', key: key as never });
const f = (hex: string): ColorRule => ({ kind: 'fixed', hex });

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic',
    label: '经典浅色',
    description: '浅色背景、主色顶栏，信息清晰',
    designValues: {
      home_bg: r('bg_1'),
      home_db: r('bg_2'),
      btmnav_def: r('neutral_2'),
      btmnav_active: r('primary'),
      bs_topnav_bg: r('primary'),
      web_bs_yj_bg: r('bg_2'),
      web_btmnav_db: r('bg_2'),
    },
    layouts: { topbar: 'topbar.regular', banner: 'banner.card', gamecards: 'gamecards.grid3', gamemenu: 'gamemenu.tabs', midnav: 'midnav.row' },
    flowOrder: ['banner', 'midnav', 'jackpot', 'gamemenu', 'gamecards', 'footer'],
    cardStyle: 'classic',
    guess: true,
  },
  {
    id: 'night',
    label: '深色质感',
    description: '深色底、亮色点缀，适合游戏氛围',
    designValues: {
      home_bg: f('#12141A'),
      home_db: f('#1E222B'),
      btmnav_def: f('#7D8494'),
      btmnav_active: r('primary'),
      bs_topnav_bg: f('#1E222B'),
      web_bs_yj_bg: f('#0C0E12'),
      web_btmnav_db: f('#1E222B'),
    },
    layouts: { topbar: 'topbar.centered', banner: 'banner.full', gamecards: 'gamecards.grid2', gamemenu: 'gamemenu.icons', midnav: 'midnav.account' },
    flowOrder: ['banner', 'jackpot', 'midnav', 'gamemenu', 'gamecards', 'footer'],
    cardStyle: 'western',
    // 深色底上，基础“文字”色通常是深色，这些元素改用浅色用途
    defaultBindings: {
      'midnav.text': 'text_primary',
      'gamemenu.text': 'neutral_2',
      'footer.text': 'neutral_2',
      'footer.link': 'neutral_3',
      'topbar.login.bg': 'primary',
      'topbar.login.text': 'text_primary',
    },
    guess: true,
  },
];

export function templateById(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** 整套推荐配色：业主先选一套，再微调，不需要从零输入 11 个 HEX。 */
export const PALETTES: { id: string; label: string; colors: Record<BaseKey, string> }[] = [
  {
    id: 'blue',
    label: '科技蓝（规范默认）',
    colors: { primary: '#1678FF', lead: '#333333', neutral_1: '#666666', neutral_2: '#999999', neutral_3: '#CCCCCC', border: '#E3E3E3', bg_1: '#F8F8F8', bg_2: '#FFFFFF', accent_1: '#04BE02', accent_2: '#EA4E3D', accent_3: '#FFAA09' },
  },
  {
    id: 'gold',
    label: '尊享金',
    colors: { primary: '#C9963B', lead: '#2B2620', neutral_1: '#6B6256', neutral_2: '#9C9286', neutral_3: '#CFC7BC', border: '#E8E0D4', bg_1: '#F7F3EC', bg_2: '#FFFFFF', accent_1: '#2FA84F', accent_2: '#D9472B', accent_3: '#F2A20C' },
  },
  {
    id: 'green',
    label: '活力绿',
    colors: { primary: '#10B26C', lead: '#1F2A24', neutral_1: '#58665E', neutral_2: '#8E9A93', neutral_3: '#C5CDC8', border: '#DFE6E2', bg_1: '#F4F8F6', bg_2: '#FFFFFF', accent_1: '#3A86FF', accent_2: '#EF4444', accent_3: '#FFAA09' },
  },
  {
    id: 'purple',
    label: '霓虹紫',
    colors: { primary: '#7B4DFF', lead: '#25213A', neutral_1: '#5F5A75', neutral_2: '#948FAA', neutral_3: '#C9C5DA', border: '#E4E1EF', bg_1: '#F6F5FB', bg_2: '#FFFFFF', accent_1: '#12B886', accent_2: '#F03E5E', accent_3: '#FF9F1C' },
  },
];
