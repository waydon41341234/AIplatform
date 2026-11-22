import { describe, expect, it } from 'vitest';
import { ALL_KEYS, BASE_KEYS, DESIGN_KEYS, EXT_KEYS } from '../shared/theme/keys.ts';
import { checkRule, defaultTheme, resolveKey, resolveAll } from '../shared/theme/resolve.ts';
import { templateById } from '../shared/catalog/templates.ts';

describe('68-Key 规范', () => {
  it('共 68 个 Key：11 基础 + 57 扩展，无重复', () => {
    expect(BASE_KEYS).toHaveLength(11);
    expect(Object.keys(EXT_KEYS)).toHaveLength(57);
    expect(new Set(ALL_KEYS).size).toBe(68);
  });
  it('基础色含 neutral_3，不含 text_primary', () => {
    expect(BASE_KEYS).toContain('neutral_3');
    expect(BASE_KEYS as readonly string[]).not.toContain('text_primary');
  });
  it('七个跟设计 Key', () => {
    expect(DESIGN_KEYS.sort()).toEqual(['bs_topnav_bg', 'btmnav_active', 'btmnav_def', 'home_bg', 'home_db', 'web_bs_yj_bg', 'web_btmnav_db'].sort());
  });
});

describe('解析', () => {
  it('改 primary 时直接与间接引用联动', () => {
    const t = defaultTheme();
    t.base.primary = '#FF0000';
    expect(resolveKey(t, 'icon_1').hex).toBe('#FF0000');
    expect(resolveKey(t, 'btn_color_2').hex).toBe('#FF0000');
    // 间接：leftnav_active → text_primary（固定白）
    expect(resolveKey(t, 'leftnav_active').hex).toBe('#FFFFFF');
    expect(resolveKey(t, 'leftnav_active').chain).toEqual(['leftnav_active', 'text_primary']);
  });
  it('独立覆盖不被基础色改写', () => {
    const t = defaultTheme();
    t.overrides.btmnav_def = { kind: 'fixed', hex: '#999999' };
    t.base.neutral_2 = '#111111';
    expect(resolveKey(t, 'btmnav_def').hex).toBe('#999999');
    expect(resolveKey(t, 'btmnav_def').source).toBe('override');
  });
  it('btmnav_def 引用 neutral_2 时随之更新', () => {
    const t = defaultTheme();
    t.overrides.btmnav_def = { kind: 'ref', key: 'neutral_2' };
    t.base.neutral_2 = '#123456';
    expect(resolveKey(t, 'btmnav_def').hex).toBe('#123456');
  });
  it('border99 = 153/255 透明度；20% 保留 alpha 不混白', () => {
    const t = defaultTheme();
    const r = resolveKey(t, 'web_load_zz');
    expect(r.hex).toBe('#E3E3E3');
    expect(r.alpha).toBeCloseTo(0.6, 5);
    const g = resolveKey(t, 'tg_primary');
    expect(g.hex).toBe('#1678FF');
    expect(g.alpha).toBeCloseTo(0.2);
  });
  it('#RRGGBBAA 阴影色解析 alpha', () => {
    const r = resolveKey(defaultTheme(), 'web_left_bg_shadow');
    expect(r.hex).toBe('#000000');
    expect(r.alpha).toBeCloseTo(0x1f / 255);
  });
  it('跟设计 Key 无版式值时为 unset，不默认 primary', () => {
    const r = resolveKey(defaultTheme(), 'home_bg');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('unset');
  });
  it('套用模板后七个跟设计 Key 全部有值', () => {
    const t = defaultTheme();
    t.designValues = templateById('classic').designValues;
    for (const k of DESIGN_KEYS) expect(resolveKey(t, k).ok).toBe(true);
  });
  it('条件规则：profile_icon 有底/无底；cards_text 欧美/经典', () => {
    const t = defaultTheme();
    expect(resolveKey(t, 'profile_icon_1', { iconBase: 'with' }).hex).toBe('#1678FF');
    expect(resolveKey(t, 'profile_icon_1', { iconBase: 'without' }).hex).toBe('#FFAA09');
    expect(resolveKey(t, 'cards_text', { cardStyle: 'western' }).hex).toBe('#FFFFFF');
    expect(resolveKey(t, 'cards_text', { cardStyle: 'classic' }).hex).toBe('#666666');
  });
  it('拒绝循环引用与不存在的 Key', () => {
    const t = defaultTheme();
    t.overrides.icon_1 = { kind: 'ref', key: 'filter_active' };
    expect(checkRule(t, 'filter_active', { kind: 'ref', key: 'icon_1' })).toMatch(/循环/);
    expect(checkRule(t, 'icon_1', { kind: 'ref', key: 'nope' })).toMatch(/不存在/);
    expect(checkRule(t, 'icon_1', { kind: 'ref', key: 'accent_1' })).toBeNull();
  });
  it('条件规则的非默认分支也检查循环', () => {
    const t = defaultTheme();
    t.overrides.icon_1 = { kind: 'ref', key: 'profile_icon_1' };
    const err = checkRule(t, 'profile_icon_1', { kind: 'cond', prop: 'iconBase', cases: { with: { kind: 'ref', key: 'primary' }, without: { kind: 'ref', key: 'icon_1' } }, label: {} });
    expect(err).toMatch(/循环/);
  });
  it('resolveAll 返回 68 项', () => {
    expect(Object.keys(resolveAll(defaultTheme()))).toHaveLength(68);
  });
});
