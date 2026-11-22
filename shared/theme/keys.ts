/**
 * 68-Key 色值规范（来源：色值Key绑定规范.md，2026-11-20）。
 *
 * - 11 个基础色是业主输入（BASE_KEYS）。
 * - 其余 57 个 Key 是“规则”，记录引用关系而不是复制 HEX。
 * - Key 名称必须与规范完全一致，禁止改名、合并（即使当前颜色相同）。
 *
 * 修改这里等于修改公司色值规范，请同步更新 docs/theme-keys.md 和 tests/theme.test.ts。
 */

export const BASE_KEYS = [
  'primary',
  'lead',
  'neutral_1',
  'neutral_2',
  'neutral_3',
  'border',
  'bg_1',
  'bg_2',
  'accent_1',
  'accent_2',
  'accent_3',
] as const;

export type BaseKey = (typeof BASE_KEYS)[number];

/** 基础色用途（给业主看的中文名）与默认值。 */
export const BASE_KEY_INFO: Record<BaseKey, { label: string; group: '主色' | '文字' | '背景' | '辅助色'; default: string }> = {
  primary: { label: '主色', group: '主色', default: '#1678FF' },
  lead: { label: '重要文字', group: '文字', default: '#333333' },
  neutral_1: { label: '次级文字', group: '文字', default: '#666666' },
  neutral_2: { label: '较弱文字', group: '文字', default: '#999999' },
  neutral_3: { label: '未输入 / 禁用', group: '文字', default: '#CCCCCC' },
  border: { label: '描边', group: '背景', default: '#E3E3E3' },
  bg_1: { label: '页面背景', group: '背景', default: '#F8F8F8' },
  bg_2: { label: '底板', group: '背景', default: '#FFFFFF' },
  accent_1: { label: '辅助绿', group: '辅助色', default: '#04BE02' },
  accent_2: { label: '辅助红', group: '辅助色', default: '#EA4E3D' },
  accent_3: { label: '辅助橙', group: '辅助色', default: '#FFAA09' },
};

/**
 * 颜色规则。
 * - ref：引用另一个 Key，可带透明度（0–1）。透明度保留为 alpha，不与白色混合。
 * - fixed：固定 HEX（#RRGGBB 或 #RRGGBBAA）。固定色不是基础色别名。
 * - design：“跟设计”，值必须来自版式默认主题或业主显式配色，不能默认等于 primary。
 * - cond：条件规则，按组件属性（mode）解析，例如 profile_icon 的“有底/无底”。
 */
export type ColorRule =
  | { kind: 'ref'; key: string; alpha?: number } // key 在运行时校验（isThemeKey）
  | { kind: 'fixed'; hex: string }
  | { kind: 'design' }
  | { kind: 'cond'; prop: string; cases: Record<string, ColorRule>; label: Record<string, string> };

export interface ExtKeyDef {
  rule: ColorRule;
  usage: string;
}

const ref = (key: string, alpha?: number): ColorRule => ({ kind: 'ref', key, ...(alpha !== undefined ? { alpha } : {}) });
const fixed = (hex: string): ColorRule => ({ kind: 'fixed', hex });
const design: ColorRule = { kind: 'design' };
const hasBg = (withBg: string, noBg: string): ColorRule => ({
  kind: 'cond',
  prop: 'iconBase',
  cases: { with: ref(withBg), without: ref(noBg) },
  label: { with: '有底', without: '无底' },
});

/** 57 个扩展 Key 的默认规则，顺序与规范表一致。 */
export const EXT_KEYS = {
  leftnav_def: { rule: ref('neutral_2'), usage: '左侧栏未选中文字' },
  leftnav_active: { rule: ref('text_primary'), usage: '左侧栏选中文字' },
  text_primary: { rule: fixed('#FFFFFF'), usage: '主色通用按钮字体' },
  text_accent3: { rule: fixed('#FFFFFF'), usage: '辅助橙通用按钮字体' },
  home_bg: { rule: design, usage: 'H5/APP 首页背景' },
  home_db: { rule: design, usage: '首页背景上的底板' },
  search_icon: { rule: ref('primary'), usage: '首页搜索图标（仅首页，内页不可使用）' },
  label_accent3: { rule: ref('accent_3'), usage: '橙色角标' },
  labeltext_accent3: { rule: ref('text_accent3'), usage: '橙色角标字体' },
  kb_bg: { rule: ref('border'), usage: '数字键盘底色' },
  filter_bg: { rule: ref('bg_1'), usage: '筛选底板' },
  table_bg: { rule: fixed('#FFFFFF'), usage: '通用表格背景' },
  btmnav_def: { rule: design, usage: '底部导航未选中' },
  btmnav_active: { rule: design, usage: '底部导航选中' },
  icon_1: { rule: ref('primary'), usage: '蓝色小图标' },
  filter_active: { rule: ref('primary'), usage: '筛选选中' },
  icon_tg_q: { rule: ref('neutral_1'), usage: '左侧栏图标渐变起点' },
  icon_tg_z: { rule: ref('neutral_1'), usage: '左侧栏图标渐变终点' },
  jackpot_text: { rule: fixed('#FFFFFF'), usage: '彩金池标题' },
  jdd_vip_bjc: { rule: ref('primary'), usage: 'VIP 保级差进度条' },
  bs_zc_an1: { rule: ref('bg_1'), usage: '版式侧边栏按钮' },
  bs_zc_bg: { rule: fixed('#FFFFFF'), usage: '版式侧边栏底' },
  ddt_bg: { rule: ref('border'), usage: '兜底图底板背景' },
  ddt_icon: { rule: ref('bg_2'), usage: '兜底图图形' },
  bs_topnav_bg: { rule: design, usage: '版式顶部导航底' },
  alt_primary: { rule: ref('primary'), usage: '欧美白底特殊主题色' },
  alt_neutral_1: { rule: ref('neutral_1'), usage: '欧美白底特殊次级色' },
  alt_neutral_2: { rule: ref('neutral_2'), usage: '欧美白底特殊较弱色' },
  alt_border: { rule: ref('border'), usage: '欧美白底特殊描边' },
  profile_icon_1: { rule: hasBg('primary', 'accent_3'), usage: '个人中心中部图标 1' },
  profile_icon_2: { rule: hasBg('primary', 'accent_1'), usage: '个人中心中部图标 2' },
  profile_icon_3: { rule: hasBg('primary', 'primary'), usage: '个人中心中部图标 3' },
  profile_icon_4: { rule: hasBg('primary', 'accent_2'), usage: '个人中心中部图标 4' },
  profile_toptext: { rule: fixed('#FFFFFF'), usage: '个人中心顶部内容' },
  web_filter_gou: { rule: ref('text_primary'), usage: '筛选选中勾' },
  web_topbg_1: { rule: fixed('#3C8DFF'), usage: '底色渐变起点' },
  web_topbg_3: { rule: fixed('#1B7AFF'), usage: '底色渐变终点（高款）' },
  web_left_bg_q: { rule: fixed('#FFFFFF'), usage: '侧边栏选中背景渐变起点' },
  web_left_bg_z: { rule: fixed('#FFFFFF'), usage: '侧边栏选中背景渐变终点' },
  web_load_zz: { rule: ref('border', 153 / 255), usage: '加载遮罩（border99）' },
  web_plat_line: { rule: ref('neutral_3'), usage: '平台底板外描边' },
  web_left_bg_shadow: { rule: fixed('#0000001F'), usage: '未选中左侧按钮/平台底板投影颜色' },
  web_bas_zc_an2: { rule: fixed('#FFFFFF'), usage: '版式侧边栏按钮悬停' },
  web_bs_yj_bg: { rule: design, usage: '版式页脚底' },
  web_btmnav_db: { rule: design, usage: 'H5 底部导航底色' },
  alt_text_primary: { rule: ref('text_primary'), usage: '顶部导航主按钮字体' },
  alt_lead: { rule: ref('lead'), usage: '特殊主级色' },
  web_left_bg_shadow_active: { rule: fixed('#0000001F'), usage: '左侧按钮选中投影' },
  tg_accent_1: { rule: ref('accent_1', 0.2), usage: '推广教程绿底板' },
  tg_accent_3: { rule: ref('accent_3', 0.2), usage: '推广教程橙底板' },
  tg_primary: { rule: ref('primary', 0.2), usage: '推广教程主题底板' },
  cards_text: {
    rule: { kind: 'cond', prop: 'cardStyle', cases: { western: fixed('#FFFFFF'), classic: ref('neutral_1') }, label: { western: '欧美卡片', classic: '经典卡片' } },
    usage: '卡片文字',
  },
  btn_color_1: { rule: ref('primary'), usage: '特殊公共按钮渐变中间色' },
  btn_color_2: { rule: ref('primary'), usage: '特殊公共按钮渐变终点' },
  custom_1: { rule: fixed('#FFFFFF'), usage: '首页特殊色 1' },
  custom_2: { rule: fixed('#FFFFFF'), usage: '首页特殊色 2' },
  custom_3: { rule: fixed('#FFFFFF'), usage: '首页特殊色 3' },
} satisfies Record<string, ExtKeyDef>;

export type ExtKey = keyof typeof EXT_KEYS;
export type ThemeKey = BaseKey | ExtKey;

export const ALL_KEYS: ThemeKey[] = [...BASE_KEYS, ...(Object.keys(EXT_KEYS) as ExtKey[])];

/** 七个“跟设计”Key：交付前必须有已确认的值或引用规则。 */
export const DESIGN_KEYS = (Object.keys(EXT_KEYS) as ExtKey[]).filter((k) => EXT_KEYS[k].rule.kind === 'design');

export function isBaseKey(k: string): k is BaseKey {
  return (BASE_KEYS as readonly string[]).includes(k);
}

export function isThemeKey(k: string): k is ThemeKey {
  return isBaseKey(k) || k in EXT_KEYS;
}

export function keyUsage(k: ThemeKey): string {
  return isBaseKey(k) ? BASE_KEY_INFO[k].label : EXT_KEYS[k].usage;
}
