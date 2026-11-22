/**
 * 项目文档：同一份数据驱动画布预览、PNG、SVG（以及后续 Figma 导出）。
 * 修改结构时：提升 SCHEMA_VERSION，并在 migrate() 中写迁移。
 */
import type { LevelId } from '../catalog/levels.ts';
import { MODULE_TYPES, type ModuleType, type NavMode } from '../catalog/home.ts';
import { TOPBAR_HEIGHT, H5_CANVAS, type BannerSpecId, type CardSizeId } from '../catalog/specs.ts';
import { templateById } from '../catalog/templates.ts';
import { defaultTheme, type ThemeState } from '../theme/resolve.ts';
import { layoutHome } from '../render/layout.ts';
import type { ThemeKey } from '../theme/keys.ts';

export const SCHEMA_VERSION = 1;

export type AssetSource = 'upload' | 'ai' | 'library';

export interface Asset {
  id: string;
  name: string;
  /** 服务端可访问地址，例如 /api/assets/xxx.png */
  url: string;
  mime: string;
  width: number;
  height: number;
  source: AssetSource;
  createdAt: string;
  /** AI 生成时的任务 ID（对账用） */
  jobId?: string;
}

export interface Binding {
  key: ThemeKey;
  /** 锁定=保持此颜色用途关联；不是冻结 HEX。 */
  locked: boolean;
}

export interface TopbarProps {
  height: number;
  showSearch: boolean;
  bgMode: 'color' | 'image';
  bgImage?: string;
  logo?: string;
  brandText: string;
}
export interface BannerProps {
  spec: BannerSpecId;
  images: string[];
  indicator: 'style1' | 'style2' | 'style3' | 'style4';
  active: number;
}
export interface SidebarProps {
  entries: string[];
  active: number;
}
export interface GamecardsProps {
  cardSize: CardSizeId;
  count: number;
  images: string[];
  showLabel: boolean;
}
export interface GamemenuProps {
  categories: string[];
  active: number;
}
export interface NavProps {
  mode: NavMode;
  /** 已纳入设计的入口（固定模式下 = 必交 + 选配） */
  entries: string[];
  /** `${entryId}:${state}` → assetId */
  icons: Record<string, string>;
  active: number;
}
export interface FooterProps {
  text: string;
  links: string[];
}
export interface JackpotProps {
  title: string;
  amount: string;
}

export interface ModulePropsMap {
  topbar: TopbarProps;
  banner: BannerProps;
  sidebar: SidebarProps;
  gamecards: GamecardsProps;
  gamemenu: GamemenuProps;
  bottomnav: NavProps;
  footer: FooterProps;
  jackpot: JackpotProps;
  midnav: NavProps;
}

export interface ModuleInstance<T extends ModuleType = ModuleType> {
  type: T;
  visible: boolean;
  layoutId: string;
  props: ModulePropsMap[T];
}

export type HomeModules = { [T in ModuleType]: ModuleInstance<T> };

export interface HomePage {
  height: number;
  /** 流式模块顺序 */
  flowOrder: ModuleType[];
  modules: HomeModules;
  preview: { loggedIn: boolean; sidebarOpen: boolean };
}

export interface Project {
  schemaVersion: number;
  id: string;
  name: string;
  level: LevelId;
  platforms: ('h5' | 'pc')[];
  language: string;
  templateId: string;
  paletteId?: string;
  theme: ThemeState;
  /** 元素 ID → 绑定；没有记录的元素使用 catalog 中的 defaultKey */
  bindings: Record<string, Binding>;
  /** 组件模式（条件规则用），如 cardStyle、iconBase */
  modes: Record<string, string>;
  pages: { home: HomePage };
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface NewProjectInput {
  name: string;
  level: LevelId;
  templateId: string;
  paletteColors?: ThemeState['base'];
  paletteId?: string;
  platforms?: ('h5' | 'pc')[];
}

export function defaultModules(templateId: string): HomeModules {
  const t = templateById(templateId);
  const layout = (m: ModuleType, fallback: string) => t.layouts[m] ?? fallback;
  return {
    topbar: { type: 'topbar', visible: true, layoutId: layout('topbar', 'topbar.regular'), props: { height: TOPBAR_HEIGHT.default, showSearch: false, bgMode: 'color', brandText: '' } },
    banner: { type: 'banner', visible: true, layoutId: layout('banner', 'banner.card'), props: { spec: 'general', images: [], indicator: 'style1', active: 0 } },
    sidebar: { type: 'sidebar', visible: true, layoutId: layout('sidebar', 'sidebar.list'), props: { entries: ['热门', '真人', '电子', '体育', '棋牌', '捕鱼'], active: 0 } },
    gamecards: { type: 'gamecards', visible: true, layoutId: layout('gamecards', 'gamecards.grid3'), props: { cardSize: '180x180', count: 3, images: [], showLabel: true } },
    gamemenu: { type: 'gamemenu', visible: true, layoutId: layout('gamemenu', 'gamemenu.tabs'), props: { categories: ['热门', '真人', '电子', '体育', '棋牌'], active: 0 } },
    bottomnav: { type: 'bottomnav', visible: true, layoutId: layout('bottomnav', 'bottomnav.regular'), props: { mode: 'fixed', entries: ['home', 'promo', 'deposit', 'service', 'mine'], icons: {}, active: 0 } },
    footer: { type: 'footer', visible: true, layoutId: layout('footer', 'footer.regular'), props: { text: '© 品牌名称 版权所有', links: ['关于我们', '帮助中心', '联系客服'] } },
    jackpot: { type: 'jackpot', visible: true, layoutId: layout('jackpot', 'jackpot.flow'), props: { title: '彩金池', amount: '88,888,888.00' } },
    midnav: { type: 'midnav', visible: true, layoutId: layout('midnav', 'midnav.row'), props: { mode: 'fixed', entries: ['msg', 'notice', 'announcement', 'deposit'], icons: {}, active: 0 } },
  };
}

export function createProject(input: NewProjectInput, id: string, now = new Date().toISOString()): Project {
  const t = templateById(input.templateId);
  const theme = defaultTheme();
  if (input.paletteColors) theme.base = { ...input.paletteColors };
  theme.designValues = { ...t.designValues };
  const modules = defaultModules(t.id);
  modules.topbar.props.brandText = input.name;
  modules.footer.props.text = `© ${input.name} 版权所有`;
  const project: Project = {
    schemaVersion: SCHEMA_VERSION,
    id,
    name: input.name,
    level: input.level,
    platforms: input.platforms ?? ['h5'],
    language: 'zh-CN',
    templateId: t.id,
    paletteId: input.paletteId,
    theme,
    bindings: {},
    modes: { cardStyle: t.cardStyle, iconBase: 'with' },
    pages: { home: { height: H5_CANVAS.defaultHeight, flowOrder: [...t.flowOrder], modules, preview: { loggedIn: false, sidebarOpen: false } } },
    assets: [],
    createdAt: now,
    updatedAt: now,
  };
  // 版式自带完整页面：若默认内容超过 1334，初始高度取内容高度（偶数），之后新增内容溢出时再提示
  const need = layoutHome(project.pages.home).contentHeight;
  if (need > project.pages.home.height) project.pages.home.height = Math.ceil(need / 2) * 2;
  return project;
}

/** 读取旧版本项目时调用。目前只有 v1。 */
export function migrate(raw: Project): Project {
  if (raw.schemaVersion !== SCHEMA_VERSION) throw new Error(`不支持的项目版本 ${raw.schemaVersion}`);
  // 补齐新增模块，防止旧项目缺字段
  const defaults = defaultModules(raw.templateId);
  for (const m of MODULE_TYPES) if (!raw.pages.home.modules[m]) (raw.pages.home.modules as Record<string, unknown>)[m] = defaults[m];
  return raw;
}
