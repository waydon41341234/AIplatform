import { describe, expect, it } from 'vitest';
import { createProject } from '../shared/project/model.ts';
import { applyTemplate, bindingOf, colorOf, LockedBindingError, setBinding, setLocked, resetUnlockedBindings } from '../shared/project/bindings.ts';
import { runChecks, canDeliver } from '../shared/project/checks.ts';
import { scopeFor, outOfScope } from '../shared/catalog/levels.ts';
import { layoutHome } from '../shared/render/layout.ts';
import { renderHomeSvg } from '../shared/render/svg.ts';
import { logoDisplaySize, checkExactSize, ICON_SPECS } from '../shared/catalog/specs.ts';
import { requiredNavEntries } from '../shared/catalog/home.ts';

const make = () => createProject({ name: '测试品牌', level: 'normal', templateId: 'classic' }, 'p1', '2026-11-22T00:00:00Z');

describe('定制等级', () => {
  it('普通 4 / 高级 9 / 全方位 11；PC 只有前 4 类', () => {
    expect(scopeFor('normal', 'h5')).toHaveLength(4);
    expect(scopeFor('advanced', 'h5')).toHaveLength(9);
    expect(scopeFor('full', 'h5')).toHaveLength(11);
    expect(scopeFor('full', 'pc')).toEqual(['home', 'jackpot', 'footer', 'menubar']);
    expect(outOfScope('normal', 'h5')).toHaveLength(7);
  });
});

describe('绑定与锁定', () => {
  it('锁定后不能换 Key，但基础色仍联动', () => {
    let p = make();
    p = setBinding(p, 'bottomnav.def', 'neutral_2');
    p = setLocked(p, 'bottomnav.def', true);
    expect(() => setBinding(p, 'bottomnav.def', 'primary')).toThrow(LockedBindingError);
    p = { ...p, theme: { ...p.theme, base: { ...p.theme.base, neutral_2: '#ABCDEF' } } };
    expect(colorOf(p, 'bottomnav.def').hex).toBe('#ABCDEF');
  });
  it('换模板保留锁定绑定和业主覆盖', () => {
    let p = make();
    p = setLocked(setBinding(p, 'topbar.bg', 'accent_2'), 'topbar.bg', true);
    p.theme.overrides.icon_1 = { kind: 'fixed', hex: '#010203' };
    p = applyTemplate(p, 'night');
    expect(bindingOf(p, 'topbar.bg').key).toBe('accent_2');
    expect(p.theme.overrides.icon_1).toEqual({ kind: 'fixed', hex: '#010203' });
    expect(p.pages.home.modules.topbar.layoutId).toBe('topbar.centered');
  });
  it('重置只清除未锁定绑定', () => {
    let p = setBinding(make(), 'footer.text', 'lead');
    p = setLocked(setBinding(p, 'footer.bg', 'bg_1'), 'footer.bg', true);
    p = resetUnlockedBindings(p);
    expect(bindingOf(p, 'footer.text').isDefault).toBe(true);
    expect(bindingOf(p, 'footer.bg').key).toBe('bg_1');
  });
});

describe('规范尺寸', () => {
  it('LOGO 显示尺寸按 H/100 缩放', () => {
    expect(logoDisplaySize(600, 70)).toEqual({ width: 420, height: 70 });
    expect(logoDisplaySize(330, 70)).toEqual({ width: 231, height: 70 });
  });
  it('导航图标要求 @2x 像素', () => {
    expect(checkExactSize({ width: 140, height: 140 }, ICON_SPECS.bottomnav, 2).ok).toBe(true);
    expect(checkExactSize({ width: 70, height: 70 }, ICON_SPECS.bottomnav, 2).ok).toBe(false);
    expect(checkExactSize({ width: 160, height: 140 }, ICON_SPECS.midnav, 2).ok).toBe(true);
  });
  it('导航必交清单随模式变化', () => {
    expect(requiredNavEntries('midnav', 'fixed')).toEqual(['msg', 'notice', 'announcement']);
    expect(requiredNavEntries('bottomnav', 'fixed')).toEqual(['home', 'mine']);
    expect(requiredNavEntries('bottomnav', 'configurable').length).toBeGreaterThan(2);
  });
});

describe('检查与渲染', () => {
  it('新项目：缺 LOGO 与必交图标，不能交付；跟设计 Key 已由模板确定', () => {
    const issues = runChecks(make());
    expect(canDeliver(issues)).toBe(false);
    expect(issues.some((i) => i.id === 'topbar:logo')).toBe(true);
    expect(issues.some((i) => i.id === 'midnav:icon:msg:read')).toBe(true);
    expect(issues.some((i) => i.id === 'midnav:icon:msg:unread')).toBe(true);
    expect(issues.some((i) => i.id.startsWith('design:'))).toBe(false);
  });
  it('内容过长时提示溢出，不默默裁掉', () => {
    const p = make();
    p.pages.home.modules.gamecards.props.count = 30;
    expect(layoutHome(p.pages.home).overflow).toBeGreaterThan(0);
    expect(runChecks(p).some((i) => i.fix === 'grow-height')).toBe(true);
  });
  it('经典版式默认画布 750×1334；内容更长的版式初始高度取内容高度', () => {
    expect(make().pages.home.height).toBe(1334);
    const night = createProject({ name: 'n', level: 'normal', templateId: 'night' }, 'p2');
    expect(night.pages.home.height).toBeGreaterThan(1334);
    expect(layoutHome(night.pages.home).overflow).toBe(0);
  });
  it('深色版式的默认文字用途可读', () => {
    const night = createProject({ name: 'n', level: 'normal', templateId: 'night' }, 'p2');
    // 注册按钮“白字配辅助橙”是规范自带的可读性问题（色值规范第 4 节示例），只提示不自动改
    expect(runChecks(night).filter((i) => i.id.startsWith('contrast:')).map((i) => i.id).sort()).toEqual(['contrast:gamecards.labelText', 'contrast:topbar.register.text']);
  });
  it('SVG 保留 Key 标识与解析颜色、画布 750×1334', () => {
    const svg = renderHomeSvg(make());
    expect(svg).toContain('width="750" height="1334"');
    expect(svg).toContain('data-key="bs_topnav_bg"');
    expect(svg).toContain('data-element="bottomnav.def"');
    expect(svg).toContain('#1678FF');
  });
  it('已登录显示余额框，未登录显示登录/注册', () => {
    const p = make();
    expect(renderHomeSvg(p)).toContain('注册');
    p.pages.home.preview.loggedIn = true;
    const s = renderHomeSvg(p);
    expect(s).toContain('topbar.balance.bg');
    expect(s).not.toContain('>注册<');
  });
});
