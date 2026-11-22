/**
 * 元素颜色绑定与锁定（色值规范第 3 节）。
 * - 锁定绑定：元素保持指定 Key；换模板、智能配色、批量配色都不能替换。
 * - 锁定不冻结颜色：基础色变化仍沿引用联动。
 */
import { elementDef } from '../catalog/home.ts';
import { templateById } from '../catalog/templates.ts';
import type { ThemeKey } from '../theme/keys.ts';
import { resolveKey, type Resolved } from '../theme/resolve.ts';
import type { Binding, Project } from './model.ts';

export function bindingOf(p: Project, elementId: string): Binding & { isDefault: boolean } {
  const b = p.bindings[elementId];
  if (b) return { ...b, isDefault: false };
  const def = elementDef(elementId);
  if (!def) throw new Error(`未登记的元素：${elementId}`);
  const tplKey = templateById(p.templateId).defaultBindings?.[elementId];
  return { key: tplKey ?? def.defaultKey, locked: false, isDefault: true };
}

export function colorOf(p: Project, elementId: string): Resolved {
  return resolveKey(p.theme, bindingOf(p, elementId).key, p.modes);
}

export class LockedBindingError extends Error {
  constructor(public elementId: string) {
    super(`“${elementDef(elementId)?.label ?? elementId}”的颜色用途已锁定，请先解锁再更换`);
  }
}

/** 返回新项目（不可变更新）。锁定的元素需要先 unlock。 */
export function setBinding(p: Project, elementId: string, key: ThemeKey): Project {
  const cur = bindingOf(p, elementId);
  if (cur.locked) throw new LockedBindingError(elementId);
  return { ...p, bindings: { ...p.bindings, [elementId]: { key, locked: false } } };
}

export function setLocked(p: Project, elementId: string, locked: boolean): Project {
  const cur = bindingOf(p, elementId);
  return { ...p, bindings: { ...p.bindings, [elementId]: { key: cur.key, locked } } };
}

/**
 * 换版式模板：更新“跟设计”默认值、版式默认颜色用途与区域布局。
 * 保留：业主覆盖（theme.overrides）、锁定绑定、所有已采用素材与文案。
 * 未锁定的非默认绑定也保留——只有“智能配色”才会重置未锁定绑定。
 */
export function applyTemplate(p: Project, templateId: string): Project {
  const t = templateById(templateId);
  const modules = { ...p.pages.home.modules };
  for (const [m, layoutId] of Object.entries(t.layouts)) {
    const k = m as keyof typeof modules;
    modules[k] = { ...modules[k], layoutId } as never;
  }
  return {
    ...p,
    templateId: t.id,
    modes: { ...p.modes, cardStyle: t.cardStyle },
    theme: { ...p.theme, designValues: { ...t.designValues } },
    pages: { ...p.pages, home: { ...p.pages.home, modules } },
  };
}

/** 恢复全部未锁定元素的默认绑定，锁定的保持不变。 */
export function resetUnlockedBindings(p: Project): Project {
  const kept: Project['bindings'] = {};
  for (const [id, b] of Object.entries(p.bindings)) if (b.locked) kept[id] = b;
  return { ...p, bindings: kept };
}
