/**
 * 主题解析引擎：把 11 个基础色 + 57 条规则 + 业主覆盖解析为最终颜色。
 *
 * 关键约定（见 docs/theme-keys.md）：
 * - 引用是“活的”：改 primary 后所有直接/间接引用它的 Key 自动变化。
 * - 业主覆盖（overrides）优先于默认规则；默认规则保留用于“恢复默认”。
 * - “跟设计”Key 取版式默认（designValues），都没有时为 unset，交付检查会报出。
 * - 透明度保存为 alpha，不与白色混合；ref 的 alpha 与目标自身 alpha 相乘。
 */
import { BASE_KEYS, BASE_KEY_INFO, EXT_KEYS, type BaseKey, type ColorRule, type ExtKey, type ThemeKey, isBaseKey, isThemeKey } from './keys.ts';

export interface ThemeState {
  base: Record<BaseKey, string>;
  /** 业主显式设置的规则（扩展 Key）。 */
  overrides: Partial<Record<ExtKey, ColorRule>>;
  /** 版式模板提供的“跟设计”默认值。 */
  designValues: Partial<Record<ExtKey, ColorRule>>;
}

export type RuleSource = 'base' | 'default' | 'override' | 'design' | 'unset';

export interface Resolved {
  ok: boolean;
  /** #RRGGBB（大写） */
  hex: string;
  /** 0–1 */
  alpha: number;
  /** 可直接用于 CSS / SVG 的颜色 */
  css: string;
  source: RuleSource;
  /** 引用链，例如 ['leftnav_active','text_primary'] */
  chain: ThemeKey[];
  error?: 'cycle' | 'unknown-key' | 'unset' | 'bad-hex' | 'missing-mode';
}

export type ModeContext = Record<string, string>;

export function defaultTheme(): ThemeState {
  const base = {} as Record<BaseKey, string>;
  for (const k of BASE_KEYS) base[k] = BASE_KEY_INFO[k].default;
  return { base, overrides: {}, designValues: {} };
}

export function parseHex(input: string): { hex: string; alpha: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1].toUpperCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { hex: '#' + h.slice(0, 6), alpha };
}

export function toCss(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${+alpha.toFixed(4)})`;
}

/** 当前生效的规则及其来源。基础色返回 null（值在 base 中）。 */
export function effectiveRule(theme: ThemeState, key: ExtKey): { rule: ColorRule | null; source: RuleSource } {
  const o = theme.overrides[key];
  if (o) return { rule: o, source: 'override' };
  const def = EXT_KEYS[key].rule;
  if (def.kind === 'design') {
    const d = theme.designValues[key];
    return d ? { rule: d, source: 'design' } : { rule: null, source: 'unset' };
  }
  return { rule: def, source: 'default' };
}

const fail = (chain: ThemeKey[], error: Resolved['error'], source: RuleSource = 'unset'): Resolved => ({
  ok: false,
  hex: '#FF00FF',
  alpha: 1,
  css: '#FF00FF',
  source,
  chain,
  error,
});

export function resolveKey(theme: ThemeState, key: ThemeKey, ctx: ModeContext = {}, seen: ThemeKey[] = []): Resolved {
  const chain = [...seen, key];
  if (!isThemeKey(key)) return fail(chain, 'unknown-key');
  if (seen.includes(key)) return fail(chain, 'cycle');
  if (isBaseKey(key)) {
    const p = parseHex(theme.base[key] ?? '');
    if (!p) return fail(chain, 'bad-hex', 'base');
    return { ok: true, ...p, css: toCss(p.hex, p.alpha), source: 'base', chain };
  }
  const { rule, source } = effectiveRule(theme, key);
  if (!rule) return fail(chain, 'unset', source);
  const r = resolveRule(theme, rule, ctx, chain);
  return { ...r, source, chain: r.chain };
}

export function resolveRule(theme: ThemeState, rule: ColorRule, ctx: ModeContext, chain: ThemeKey[]): Resolved {
  switch (rule.kind) {
    case 'fixed': {
      const p = parseHex(rule.hex);
      if (!p) return fail(chain, 'bad-hex', 'default');
      return { ok: true, ...p, css: toCss(p.hex, p.alpha), source: 'default', chain };
    }
    case 'ref': {
      const inner = resolveKey(theme, rule.key as ThemeKey, ctx, chain);
      if (!inner.ok) return inner;
      const alpha = inner.alpha * (rule.alpha ?? 1);
      return { ...inner, alpha, css: toCss(inner.hex, alpha) };
    }
    case 'cond': {
      const mode = ctx[rule.prop] ?? Object.keys(rule.cases)[0];
      const c = rule.cases[mode];
      if (!c) return fail(chain, 'missing-mode', 'default');
      return resolveRule(theme, c, ctx, chain);
    }
    case 'design':
      return fail(chain, 'unset');
  }
}

/** 规则直接依赖的 Key（含条件规则所有分支）。 */
export function ruleDeps(rule: ColorRule | null): ThemeKey[] {
  if (!rule) return [];
  if (rule.kind === 'ref') return [rule.key as ThemeKey];
  if (rule.kind === 'cond') return Object.values(rule.cases).flatMap(ruleDeps);
  return [];
}

/** 设置扩展 Key 的规则前检查：不能引用不存在的 Key、不能形成循环（检查条件规则的所有分支）。 */
export function checkRule(theme: ThemeState, key: ExtKey, rule: ColorRule): string | null {
  const shape = (r: ColorRule): string | null => {
    if (r.kind === 'ref') {
      if (!isThemeKey(r.key)) return `不存在的 Key：${r.key}`;
      if (r.alpha !== undefined && (r.alpha < 0 || r.alpha > 1)) return '透明度必须在 0–1 之间';
    }
    if (r.kind === 'fixed' && !parseHex(r.hex)) return `无效颜色：${r.hex}`;
    if (r.kind === 'cond') for (const c of Object.values(r.cases)) { const e = shape(c); if (e) return e; }
    return null;
  };
  const e = shape(rule);
  if (e) return e;
  const trial: ThemeState = { ...theme, overrides: { ...theme.overrides, [key]: rule } };
  // 深度优先找回到 key 的路径
  const path: ThemeKey[] = [];
  const visit = (k: ThemeKey, visited: Set<ThemeKey>): boolean => {
    path.push(k);
    if (!isBaseKey(k)) {
      for (const d of ruleDeps(effectiveRule(trial, k as ExtKey).rule)) {
        if (d === key) { path.push(d); return true; }
        if (!visited.has(d)) { visited.add(d); if (visit(d, visited)) return true; }
      }
    }
    path.pop();
    return false;
  };
  if (visit(key, new Set([key]))) return `循环引用：${path.join(' → ')}`;
  return null;
}

/** 解析整套主题（用于导出 theme.json 和预览）。 */
export function resolveAll(theme: ThemeState, ctx: ModeContext = {}): Record<ThemeKey, Resolved> {
  const out = {} as Record<ThemeKey, Resolved>;
  for (const k of [...BASE_KEYS, ...(Object.keys(EXT_KEYS) as ExtKey[])]) out[k] = resolveKey(theme, k, ctx);
  return out;
}

/** 规则的中文描述，给“高级设置”和交付清单使用。 */
export function describeRule(rule: ColorRule | null): string {
  if (!rule) return '跟设计（未设置）';
  switch (rule.kind) {
    case 'fixed': return `固定 ${rule.hex}`;
    case 'ref': return `引用 ${rule.key}${rule.alpha !== undefined && rule.alpha < 1 ? `，透明度 ${+rule.alpha.toFixed(3)}` : ''}`;
    case 'design': return '跟设计';
    case 'cond': return Object.entries(rule.cases).map(([m, r]) => `${rule.label[m] ?? m}：${describeRule(r)}`).join('；');
  }
}

// ---------- 对比度 ----------

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** WCAG 对比度（忽略 alpha）。 */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
