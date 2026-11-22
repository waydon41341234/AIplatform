/**
 * 交付检查：结果必须能定位到模块/元素，并用业主看得懂的话描述。
 * severity: error 阻止交付；warn 需要确认；info 仅提示。
 */
import { BOTTOMNAV_ENTRIES, MIDNAV_ENTRIES, MODULES, MODULE_ELEMENTS, PAGE_ELEMENTS, STATE_LABELS, requiredNavEntries, type ModuleType } from '../catalog/home.ts';
import { IMPLEMENTED_CATEGORIES, scopeFor, CATEGORIES } from '../catalog/levels.ts';
import { BANNER_SPECS, ICON_SPECS, TOPBAR_HEIGHT, checkExactSize, checkLogoSize } from '../catalog/specs.ts';
import { DESIGN_KEYS, keyUsage } from '../theme/keys.ts';
import { contrastRatio, resolveKey } from '../theme/resolve.ts';
import { layoutHome } from '../render/layout.ts';
import { bindingOf, colorOf } from './bindings.ts';
import type { Project } from './model.ts';

export interface Issue {
  id: string;
  severity: 'error' | 'warn' | 'info';
  module?: ModuleType | 'page' | 'theme';
  elementId?: string;
  message: string;
  fix?: 'grow-height';
}

/** 文字/背景对，用于对比度检查。 */
const CONTRAST_PAIRS: [string, string][] = [
  ['topbar.login.text', 'topbar.login.bg'],
  ['topbar.register.text', 'topbar.register.bg'],
  ['topbar.balance.text', 'topbar.balance.bg'],
  ['gamemenu.activeText', 'gamemenu.active'],
  ['gamemenu.text', 'gamemenu.bg'],
  ['jackpot.title', 'jackpot.bg'],
  ['bottomnav.active', 'bottomnav.bg'],
  ['bottomnav.def', 'bottomnav.bg'],
  ['midnav.text', 'midnav.bg'],
  ['footer.text', 'footer.bg'],
  ['gamecards.labelText', 'gamecards.label'],
];

export function runChecks(p: Project): Issue[] {
  const out: Issue[] = [];
  const home = p.pages.home;
  const assetById = new Map(p.assets.map((a) => [a.id, a]));

  // 1. 跟设计 Key
  for (const k of DESIGN_KEYS) {
    const r = resolveKey(p.theme, k, p.modes);
    if (!r.ok) out.push({ id: `design:${k}`, severity: 'error', module: 'theme', message: `“${keyUsage(k)}”还没有确定颜色` });
  }

  // 2. 元素颜色可解析
  for (const el of [...PAGE_ELEMENTS, ...Object.values(MODULE_ELEMENTS).flat()]) {
    const r = colorOf(p, el.id);
    if (!r.ok) out.push({ id: `color:${el.id}`, severity: 'error', elementId: el.id, module: el.id.split('.')[0] as ModuleType, message: `“${el.label}”颜色无法确定（${r.error === 'cycle' ? '颜色互相引用形成了循环' : '规则缺失'}）` });
  }

  // 3. 对比度
  for (const [fg, bg] of CONTRAST_PAIRS) {
    const mod = fg.split('.')[0] as ModuleType;
    if (!home.modules[mod]?.visible) continue;
    const a = colorOf(p, fg);
    const b = colorOf(p, bg);
    if (!a.ok || !b.ok || b.alpha < 0.5) continue;
    const ratio = contrastRatio(a.hex, b.hex);
    if (ratio < 2.2) {
      const fl = MODULE_ELEMENTS[mod].find((e) => e.id === fg)?.label ?? fg;
      out.push({ id: `contrast:${fg}`, severity: 'warn', module: mod, elementId: fg, message: `${MODULES[mod].label}：“${fl}”和背景颜色太接近，可能看不清（对比度 ${ratio.toFixed(1)}）` });
    }
  }

  // 4. 顶部栏
  const tb = home.modules.topbar;
  if (tb.visible) {
    if (tb.props.height < TOPBAR_HEIGHT.min || tb.props.height > TOPBAR_HEIGHT.max) out.push({ id: 'topbar:height', severity: 'error', module: 'topbar', message: `顶部栏高度需在 ${TOPBAR_HEIGHT.min}–${TOPBAR_HEIGHT.max}px 之间` });
    const logo = tb.props.logo ? assetById.get(tb.props.logo) : undefined;
    if (!logo) out.push({ id: 'topbar:logo', severity: 'error', module: 'topbar', message: '还没有上传 LOGO' });
    else {
      const c = checkLogoSize(logo);
      if (!c.ok) out.push({ id: 'topbar:logo-size', severity: 'error', module: 'topbar', message: c.message! });
    }
    if (tb.props.bgMode === 'image' && !tb.props.bgImage) out.push({ id: 'topbar:bg', severity: 'warn', module: 'topbar', message: '顶部栏选了图片背景，但还没有选图（目前显示底色）' });
  }

  // 5. Banner（可在后台自行替换，缺图只提示，不阻止交付）
  const bn = home.modules.banner;
  if (bn.visible) {
    const spec = BANNER_SPECS[bn.props.spec];
    if (bn.props.images.length === 0) out.push({ id: 'banner:empty', severity: 'info', module: 'banner', message: 'Banner 还没有图片，可交付后在后台自行替换' });
    bn.props.images.forEach((id, i) => {
      const a = assetById.get(id);
      if (!a) return;
      const c = checkExactSize(a, spec);
      if (!c.ok) out.push({ id: `banner:size:${i}`, severity: 'error', module: 'banner', message: `第 ${i + 1} 张 Banner ${c.message}` });
    });
  }

  // 6. 导航必交图标
  for (const kind of ['midnav', 'bottomnav'] as const) {
    const m = home.modules[kind];
    if (!m.visible) continue;
    const catalog = kind === 'midnav' ? MIDNAV_ENTRIES : BOTTOMNAV_ENTRIES;
    const required = new Set(requiredNavEntries(kind, m.props.mode));
    const designed = m.props.mode === 'configurable' ? catalog.map((e) => e.id) : m.props.entries;
    const spec = ICON_SPECS[kind];
    for (const id of designed) {
      const entry = catalog.find((e) => e.id === id);
      if (!entry) continue;
      for (const st of entry.states) {
        const assetId = m.props.icons[`${id}:${st}`];
        const name = `${entry.label}${entry.states.length > 1 ? '-' + STATE_LABELS[st] : ''}`;
        if (!assetId) {
          out.push({ id: `${kind}:icon:${id}:${st}`, severity: required.has(id) ? 'error' : 'warn', module: kind, message: `${MODULES[kind].label}缺少“${name}”图标${required.has(id) ? '（必交）' : '（已选配）'}` });
          continue;
        }
        const a = assetById.get(assetId);
        if (a && a.mime !== 'image/svg+xml') {
          const c = checkExactSize(a, spec, spec.scale);
          if (!c.ok) out.push({ id: `${kind}:iconsize:${id}:${st}`, severity: 'error', module: kind, message: `“${name}”图标 ${c.message}（@2x）` });
        }
      }
    }
  }

  // 7. 页面溢出
  const lay = layoutHome(home);
  if (lay.overflow > 0) out.push({ id: 'page:overflow', severity: 'warn', module: 'page', message: `内容超出页面 ${lay.overflow}px，可以增加页面高度或隐藏/调整模块`, fix: 'grow-height' });

  // 8. 范围提示
  const scope = scopeFor(p.level, 'h5');
  const pending = scope.filter((c) => !IMPLEMENTED_CATEGORIES.includes(c));
  if (pending.length) out.push({ id: 'scope:pending', severity: 'info', message: `当前等级还包括：${pending.map((c) => CATEGORIES[c].label).join('、')}，这些页面即将开放编辑` });

  // 9. 锁定说明（不是问题，仅在锁定绑定指向跟设计 Key 且未设置时提示）
  for (const [elId, b] of Object.entries(p.bindings)) {
    if (b.locked && !resolveKey(p.theme, bindingOf(p, elId).key, p.modes).ok) out.push({ id: `lock:${elId}`, severity: 'error', elementId: elId, message: `已锁定的颜色用途“${keyUsage(b.key)}”还没有颜色` });
  }
  return out;
}

export function canDeliver(issues: Issue[]): boolean {
  return !issues.some((i) => i.severity === 'error');
}
