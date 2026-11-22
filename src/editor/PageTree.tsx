/** 左栏：本等级的页面清单 + 首页九模块（拖动排序、显示/隐藏、状态点）。 */
import { useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Icon } from '../components/ui.tsx';
import { CATEGORIES, IMPLEMENTED_CATEGORIES, scopeFor, type CategoryId } from '../../shared/catalog/levels.ts';
import { MODULES, MODULE_TYPES, type ModuleType } from '../../shared/catalog/home.ts';
import type { Issue } from '../../shared/project/checks.ts';

const SHARED_WITH_HOME: Partial<Record<CategoryId, ModuleType>> = { jackpot: 'jackpot', footer: 'footer' };

export function moduleStatus(issues: Issue[], t: ModuleType): 'err' | 'warn' | 'ok' {
  const mine = issues.filter((i) => i.module === t);
  return mine.some((i) => i.severity === 'error') ? 'err' : mine.some((i) => i.severity === 'warn') ? 'warn' : 'ok';
}

export function PageTree({ issues }: { issues: Issue[] }) {
  const { project, selection, select, update } = useEditor();
  const [drag, setDrag] = useState<ModuleType | null>(null);
  const [over, setOver] = useState<ModuleType | null>(null);
  const page = project!.pages.home;
  const scope = scopeFor(project!.level, 'h5');
  const fixed = MODULE_TYPES.filter((t) => MODULES[t].placement !== 'flow');

  const move = (from: ModuleType, to: ModuleType) => {
    if (from === to) return;
    update((d) => {
      const o = d.pages.home.flowOrder.filter((x) => x !== from);
      o.splice(o.indexOf(to), 0, from);
      d.pages.home.flowOrder = o;
    });
  };
  const step = (t: ModuleType, dir: -1 | 1) => update((d) => {
    const o = d.pages.home.flowOrder;
    const i = o.indexOf(t);
    const j = i + dir;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
  });

  const item = (t: ModuleType, draggable: boolean) => {
    const m = page.modules[t];
    const on = selection.kind === 'module' && selection.type === t;
    return (
      <div
        key={t}
        className={`mod-item ${on ? 'on' : ''} ${drag === t ? 'dragging' : ''} ${over === t && drag && drag !== t ? 'drop' : ''} ${m.visible ? '' : 'hidden-mod'}`}
        onClick={() => select({ kind: 'module', type: t })}
        draggable={draggable}
        onDragStart={() => setDrag(t)}
        onDragEnd={() => { setDrag(null); setOver(null); }}
        onDragOver={(e) => { if (draggable && drag) { e.preventDefault(); setOver(t); } }}
        onDrop={() => { if (drag) move(drag, t); setDrag(null); setOver(null); }}
      >
        <span className="grip" aria-hidden>{draggable ? '⋮⋮' : ''}</span>
        <span className={`dot ${moduleStatus(issues, t)}`} />
        <span className="name" style={{ flex: 1 }}>{MODULES[t].label}</span>
        {draggable && on && (
          <>
            <button className="btn ghost sm icon" aria-label="上移" onClick={(e) => { e.stopPropagation(); step(t, -1); }}><Icon name="up" size={14} /></button>
            <button className="btn ghost sm icon" aria-label="下移" onClick={(e) => { e.stopPropagation(); step(t, 1); }}><Icon name="down" size={14} /></button>
          </>
        )}
        <button className="btn ghost sm icon eye" aria-label={m.visible ? '隐藏模块' : '显示模块'} title={m.visible ? '隐藏（设计会保留）' : '显示'} onClick={(e) => { e.stopPropagation(); update((d) => { d.pages.home.modules[t].visible = !m.visible; }); }}>
          <Icon name={m.visible ? 'eye' : 'eyeOff'} size={15} />
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="group-label" style={{ marginTop: 4 }}>页面</div>
      {scope.map((c) => {
        // 彩金池、页脚与首页内模块共用同一组件定义，点击即编辑首页中的该模块
        const alias = SHARED_WITH_HOME[c];
        const ready = IMPLEMENTED_CATEGORIES.includes(c) || Boolean(alias);
        const on = c === 'home' ? selection.kind === 'page' : alias && selection.kind === 'module' && selection.type === alias;
        return (
          <div key={c} className={`page-item ${on ? 'on' : ''} ${ready ? '' : 'disabled'}`} onClick={() => ready && select(alias ? { kind: 'module', type: alias } : { kind: 'page' })} title={alias ? '与首页中的同名模块共用同一份设计' : ready ? '' : '即将开放'}>
            <Icon name={c === 'home' ? 'home' : 'grid'} size={16} />
            <span style={{ flex: 1 }}>{CATEGORIES[c].label}</span>
            {!ready && <span className="hint">即将开放</span>}
            {alias && <span className="hint">与首页共用</span>}
          </div>
        );
      })}
      <div className="group-label">首页模块 · 拖动排序</div>
      {page.flowOrder.map((t) => item(t, true))}
      <div className="group-label">固定位置</div>
      {fixed.map((t) => item(t, false))}
    </div>
  );
}
