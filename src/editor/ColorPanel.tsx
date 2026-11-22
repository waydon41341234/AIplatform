/**
 * 元素颜色面板（色值规范第 3 节）：
 * - “换颜色用途”= 修改当前元素绑定的 Key（锁定时需先解锁）
 * - “改这个用途的颜色”= 修改整个项目里该 Key 的值，影响所有用到它的元素
 * - “保持此颜色用途关联”= 锁定绑定；不是冻结颜色
 */
import { useMemo, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Guess, Icon, Swatch } from '../components/ui.tsx';
import { HexInput } from './BaseColorEditor.tsx';
import { BASE_KEYS, BASE_KEY_INFO, EXT_KEYS, isBaseKey, keyUsage, type ExtKey, type ThemeKey } from '../../shared/theme/keys.ts';
import { checkRule, describeRule, effectiveRule, resolveKey } from '../../shared/theme/resolve.ts';
import { bindingOf, colorOf, setBinding, setLocked, LockedBindingError } from '../../shared/project/bindings.ts';
import { MODULE_ELEMENTS, PAGE_ELEMENTS, type ElementDef } from '../../shared/catalog/home.ts';
import type { Project } from '../../shared/project/model.ts';

const ALL_ELEMENTS = [...PAGE_ELEMENTS, ...Object.values(MODULE_ELEMENTS).flat()];

/** 有多少元素的颜色经过这个 Key（直接绑定或间接引用）。 */
function impactOf(p: Project, key: ThemeKey): ElementDef[] {
  return ALL_ELEMENTS.filter((el) => colorOf(p, el.id).chain.includes(key));
}

export function ColorPanel({ elements, advanced }: { elements: ElementDef[]; advanced: boolean }) {
  const { project } = useEditor();
  const [open, setOpen] = useState<string | null>(elements[0]?.id ?? null);
  return (
    <div className="stack" style={{ gap: 2 }}>
      {elements.map((el) => {
        const b = bindingOf(project!, el.id);
        const c = colorOf(project!, el.id);
        const isOpen = open === el.id;
        return (
          <div key={el.id}>
            <div className={`color-row ${isOpen ? 'on' : ''}`} onClick={() => setOpen(isOpen ? null : el.id)}>
              <Swatch css={c.ok ? c.css : 'transparent'} />
              <div className="t">
                <b>{el.label}</b>
                <small>{c.ok ? keyUsage(b.key) : '还没有颜色'}{advanced && ` · ${b.key}`}</small>
              </div>
              {el.guess && advanced && <Guess text="默认用途待核定" />}
              <span className={`lock ${b.locked ? 'on' : ''}`} title={b.locked ? '已保持颜色用途关联' : ''}><Icon name={b.locked ? 'lock' : 'unlock'} size={15} /></span>
            </div>
            {isOpen && <ElementEditor el={el} advanced={advanced} />}
          </div>
        );
      })}
    </div>
  );
}

function ElementEditor({ el, advanced }: { el: ElementDef; advanced: boolean }) {
  const { project, update, notify } = useEditor();
  const p = project!;
  const b = bindingOf(p, el.id);
  const r = resolveKey(p.theme, b.key, p.modes);
  const impact = useMemo(() => impactOf(p, b.key), [p, b.key]);
  const [showAll, setShowAll] = useState(!isBaseKey(b.key));

  const rebind = (key: ThemeKey) => {
    try {
      update((d) => setBinding(d, el.id, key));
    } catch (e) {
      if (e instanceof LockedBindingError) notify(e.message, true);
      else throw e;
    }
  };

  const setRule = (key: ExtKey, rule: Parameters<typeof checkRule>[2] | null) => {
    if (rule) {
      const err = checkRule(p.theme, key, rule);
      if (err) return notify(err, true);
    }
    update((d) => {
      if (rule) d.theme.overrides[key] = rule;
      else delete d.theme.overrides[key];
    }, { merge: true });
  };

  const ext = !isBaseKey(b.key) ? (b.key as ExtKey) : null;
  const eff = ext ? effectiveRule(p.theme, ext) : null;
  const followBase = eff?.rule?.kind === 'ref' && isBaseKey(eff.rule.key) && eff.rule.alpha === undefined ? eff.rule.key : '';

  return (
    <div className="card" style={{ padding: 14, margin: '4px 0 10px' }}>
      <div className="field">
        <label className="label">颜色用途</label>
        <select className="select" value={b.key} disabled={b.locked} onChange={(e) => rebind(e.target.value as ThemeKey)}>
          <optgroup label="基础色">
            {BASE_KEYS.map((k) => <option key={k} value={k}>{BASE_KEY_INFO[k].label}{advanced ? ` (${k})` : ''}</option>)}
          </optgroup>
          {(showAll || advanced) && (
            <optgroup label="专用颜色">
              {(Object.keys(EXT_KEYS) as ExtKey[]).map((k) => <option key={k} value={k}>{EXT_KEYS[k].usage}{advanced ? ` (${k})` : ''}</option>)}
            </optgroup>
          )}
        </select>
        {!showAll && !advanced && <button className="btn ghost sm" style={{ marginTop: 6 }} onClick={() => setShowAll(true)}>显示更多专用颜色</button>}
        {b.locked && <div className="hint" style={{ marginTop: 6 }}>已保持关联，解锁后才能换用途。</div>}
      </div>

      <div className="field">
        <label className="label">改这个用途的颜色 <span className="hint">（会影响 {impact.length} 处）</span></label>
        {isBaseKey(b.key) ? (
          <HexInput value={p.theme.base[b.key]} ariaLabel={keyUsage(b.key)} onChange={(hex) => update((d) => { d.theme.base[b.key as keyof typeof d.theme.base] = hex; }, { merge: true })} />
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            <div className="row wrap">
              <span className="hint" style={{ width: 60 }}>跟随</span>
              <select className="select" style={{ flex: 1 }} value={followBase} onChange={(e) => e.target.value && setRule(ext!, { kind: 'ref', key: e.target.value })}>
                <option value="">—</option>
                {BASE_KEYS.map((k) => <option key={k} value={k}>{BASE_KEY_INFO[k].label}</option>)}
              </select>
            </div>
            <div className="row">
              <span className="hint" style={{ width: 60 }}>单独颜色</span>
              <HexInput value={r.ok ? r.hex : '#FFFFFF'} ariaLabel={keyUsage(b.key)} onChange={(hex) => setRule(ext!, { kind: 'fixed', hex })} />
            </div>
            {eff?.source === 'override' && <div className="row"><span className="hint">已单独设置，基础色变化不再影响它。</span><span className="spacer" /><button className="btn ghost sm" onClick={() => setRule(ext!, null)}>恢复默认</button></div>}
            {eff?.source === 'unset' && <div className="notice warn" style={{ margin: 0 }}>这个用途需要跟随版式设定颜色，请选一个</div>}
          </div>
        )}
      </div>

      <label className="row" style={{ cursor: 'pointer' }}>
        <input type="checkbox" checked={b.locked} onChange={(e) => update((d) => setLocked(d, el.id, e.target.checked))} />
        <span>保持此颜色用途关联</span>
      </label>
      <div className="hint" style={{ marginLeft: 24 }}>换版式或批量配色时不会被替换；基础色调整后仍会跟着变。</div>

      {advanced && (
        <div className="hint" style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10, fontFamily: 'monospace' }}>
          <div>元素：{el.id}</div>
          <div>Key：{b.key}{b.isDefault ? '（默认绑定）' : ''}</div>
          {ext && <div>规则：{describeRule(eff!.rule)}（{eff!.source}）</div>}
          {ext && <div>默认：{describeRule(EXT_KEYS[ext].rule)}</div>}
          <div>引用链：{r.chain.join(' → ')}</div>
          <div>结果：{r.ok ? r.css : r.error}</div>
        </div>
      )}
    </div>
  );
}
