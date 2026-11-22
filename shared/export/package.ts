/**
 * 交付包内容（纯函数，不依赖浏览器）：theme.json、manifest.json、delivery-checklist.md 与素材命名。
 * 目录结构见方案第 8 节；浏览器端打包在 src/lib/export.ts。
 */
import { BASE_KEYS, EXT_KEYS, type ExtKey, keyUsage } from '../theme/keys.ts';
import { describeRule, effectiveRule, resolveAll } from '../theme/resolve.ts';
import { BOTTOMNAV_ENTRIES, MIDNAV_ENTRIES, MODULES, MODULE_ELEMENTS, PAGE_ELEMENTS, STATE_LABELS, requiredNavEntries } from '../catalog/home.ts';
import { BANNER_SPECS, ICON_SPECS } from '../catalog/specs.ts';
import { LEVELS, scopeFor, CATEGORIES } from '../catalog/levels.ts';
import { bindingOf } from '../project/bindings.ts';
import type { Asset, Project } from '../project/model.ts';
import type { Issue } from '../project/checks.ts';

export function buildThemeJson(p: Project) {
  const resolved = resolveAll(p.theme, p.modes);
  const keys: Record<string, unknown> = {};
  for (const k of BASE_KEYS) keys[k] = { type: 'base', usage: keyUsage(k), value: p.theme.base[k], resolved: resolved[k].css };
  for (const k of Object.keys(EXT_KEYS) as ExtKey[]) {
    const { rule, source } = effectiveRule(p.theme, k);
    keys[k] = { type: 'rule', usage: EXT_KEYS[k].usage, defaultRule: EXT_KEYS[k].rule, rule, source, description: describeRule(rule), resolved: resolved[k].ok ? resolved[k].css : null };
  }
  const bindings: Record<string, unknown> = {};
  for (const el of [...PAGE_ELEMENTS, ...Object.values(MODULE_ELEMENTS).flat()]) {
    const b = bindingOf(p, el.id);
    bindings[el.id] = { label: el.label, key: b.key, locked: b.locked, isDefault: b.isDefault };
  }
  return { schema: 'theme@1', baseKeys: BASE_KEYS, modes: p.modes, keys, bindings };
}

export interface ManifestFile {
  path: string;
  format: string;
  pixelWidth: number;
  pixelHeight: number;
  logicalWidth?: number;
  logicalHeight?: number;
  scale?: number;
  transparent?: boolean;
  source?: Asset['source'] | 'render';
  slot?: string;
}

export interface AssetExport { asset: Asset; path: string; file: Omit<ManifestFile, 'path'> }

/** 已采用素材 → 交付路径（按用途、端、状态命名）。 */
export function adoptedAssets(p: Project): AssetExport[] {
  const m = p.pages.home.modules;
  const byId = new Map(p.assets.map((a) => [a.id, a]));
  const ext = (a: Asset) => (a.mime === 'image/svg+xml' ? 'svg' : a.mime === 'image/gif' ? 'gif' : a.mime === 'image/jpeg' ? 'jpg' : 'png');
  const out: AssetExport[] = [];
  const add = (id: string | undefined, name: string, slot: string, logical?: { width: number; height: number; scale: number }) => {
    const a = id ? byId.get(id) : undefined;
    if (!a) return;
    const isSvg = a.mime === 'image/svg+xml';
    const suffix = logical && !isSvg ? `@${logical.scale}x` : '';
    out.push({
      asset: a,
      path: `assets/h5/${name}${suffix}.${ext(a)}`,
      file: { format: ext(a), pixelWidth: a.width, pixelHeight: a.height, logicalWidth: logical?.width, logicalHeight: logical?.height, scale: logical && !isSvg ? logical.scale : undefined, source: a.source, slot },
    });
  };
  add(m.topbar.props.logo, 'topbar/logo', 'topbar.logo');
  if (m.topbar.props.bgMode === 'image') add(m.topbar.props.bgImage, 'topbar/background', 'topbar.bg');
  m.banner.props.images.forEach((id, i) => add(id, `banner/${m.banner.props.spec}-${String(i + 1).padStart(2, '0')}`, `banner.${m.banner.props.spec}`));
  m.gamecards.props.images.forEach((id, i) => add(id, `gamecards/${m.gamecards.props.cardSize}-${String(i + 1).padStart(2, '0')}`, 'gamecards'));
  for (const kind of ['midnav', 'bottomnav'] as const) {
    const spec = ICON_SPECS[kind];
    for (const [k, id] of Object.entries(m[kind].props.icons)) {
      const [entry, state] = k.split(':');
      add(id, `${kind}/${entry}-${state}`, `${kind}.${entry}.${state}`, spec);
    }
  }
  return out;
}

export function buildManifest(p: Project, files: ManifestFile[]) {
  const m = p.pages.home.modules;
  const nav = (kind: 'midnav' | 'bottomnav') => {
    const catalog = kind === 'midnav' ? MIDNAV_ENTRIES : BOTTOMNAV_ENTRIES;
    const required = requiredNavEntries(kind, m[kind].props.mode);
    return {
      mode: m[kind].props.mode,
      logicalSize: { width: ICON_SPECS[kind].width, height: ICON_SPECS[kind].height },
      pngScale: 2,
      entries: catalog.map((e) => ({
        id: e.id,
        label: e.label,
        status: required.includes(e.id) ? 'required' : m[kind].props.entries.includes(e.id) ? 'selected' : 'not-selected',
        states: e.states.map((s) => ({ state: s, provided: Boolean(m[kind].props.icons[`${e.id}:${s}`]) })),
      })),
    };
  };
  return {
    schema: 'manifest@1',
    project: { id: p.id, name: p.name, level: p.level, levelLabel: LEVELS[p.level].label, templateId: p.templateId },
    generatedAt: new Date().toISOString(),
    banner: { spec: m.banner.props.spec, ...BANNER_SPECS[m.banner.props.spec], count: m.banner.props.images.length, indicator: m.banner.props.indicator },
    navigation: { midnav: nav('midnav'), bottomnav: nav('bottomnav') },
    files,
  };
}

export function buildChecklist(p: Project, issues: Issue[]): string {
  const lines: string[] = [];
  const scope = scopeFor(p.level, 'h5');
  lines.push(`# ${p.name} · 交付清单`, '', `- 定制等级：${LEVELS[p.level].label}`, `- 设计范围（H5）：${scope.map((c) => CATEGORIES[c].label).join('、')}`, `- 生成时间：${new Date().toLocaleString('zh-CN')}`, '');
  const errs = issues.filter((i) => i.severity === 'error');
  lines.push(errs.length ? `> ⚠️ 仍有 ${errs.length} 项必交问题未解决，本包为**草稿**，不能作为正式交付。` : '> ✅ 自动检查无阻塞问题。仍需人工核对视觉与文案。', '');
  for (const [title, sev] of [['必须处理', 'error'], ['需要确认', 'warn'], ['提示', 'info']] as const) {
    const list = issues.filter((i) => i.severity === sev);
    if (!list.length) continue;
    lines.push(`## ${title}`, '', ...list.map((i) => `- [ ] ${i.message}`), '');
  }
  lines.push('## 首页模块', '');
  for (const t of Object.keys(MODULES) as (keyof typeof MODULES)[]) {
    const mod = p.pages.home.modules[t];
    lines.push(`- ${MODULES[t].label}：${mod.visible ? '显示' : '隐藏'} · 布局 ${mod.layoutId}`);
  }
  lines.push('', '## 导航图标', '');
  for (const kind of ['midnav', 'bottomnav'] as const) {
    const mod = p.pages.home.modules[kind];
    const catalog = kind === 'midnav' ? MIDNAV_ENTRIES : BOTTOMNAV_ENTRIES;
    const req = requiredNavEntries(kind, mod.props.mode);
    lines.push(`### ${MODULES[kind].label}（${mod.props.mode === 'fixed' ? '入口固定' : '后台可更换入口'}）`, '');
    for (const e of catalog) {
      const status = req.includes(e.id) ? '必交' : mod.props.entries.includes(e.id) ? '选配' : null;
      if (!status) continue;
      for (const s of e.states) lines.push(`- [${mod.props.icons[`${e.id}:${s}`] ? 'x' : ' '}] ${e.label}-${STATE_LABELS[s]}（${status}）`);
    }
    lines.push('');
  }
  lines.push('## 尚未包含', '', '- Figma 原生源文件与 .fig 副本：需先完成 Figma 验证样板（方案要求），本版本未生成。', '');
  return lines.join('\n');
}
