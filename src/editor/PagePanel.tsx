/** 未选中模块时：品牌配色、版式、定制等级、页面高度、68-Key 总表。 */
import { useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Guess, Modal, Swatch } from '../components/ui.tsx';
import { BaseColorEditor } from './BaseColorEditor.tsx';
import { ColorPanel } from './ColorPanel.tsx';
import { LevelPicker } from '../pages/NewProject.tsx';
import { PALETTES, TEMPLATES } from '../../shared/catalog/templates.ts';
import { PAGE_ELEMENTS } from '../../shared/catalog/home.ts';
import { H5_CANVAS } from '../../shared/catalog/specs.ts';
import { LEVELS, outOfScope, CATEGORIES } from '../../shared/catalog/levels.ts';
import { applyTemplate, resetUnlockedBindings } from '../../shared/project/bindings.ts';
import { layoutHome } from '../../shared/render/layout.ts';
import { ALL_KEYS, isBaseKey, keyUsage, type ExtKey } from '../../shared/theme/keys.ts';
import { describeRule, effectiveRule, resolveKey } from '../../shared/theme/resolve.ts';

export function PagePanel({ advanced, setAdvanced }: { advanced: boolean; setAdvanced: (v: boolean) => void }) {
  const { project, update, notify } = useEditor();
  const p = project!;
  const [levelOpen, setLevelOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const minH = layoutHome(p.pages.home).contentHeight;

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div>
        <div className="section-title">品牌配色</div>
        <div className="palette-row" style={{ marginBottom: 12 }}>
          {PALETTES.map((pl) => (
            <button key={pl.id} className={`palette ${p.paletteId === pl.id ? 'on' : ''}`} style={{ padding: 8 }} title={pl.label} onClick={() => update((d) => { d.theme.base = { ...pl.colors }; d.paletteId = pl.id; })}>
              <div className="dots" style={{ margin: 0 }}>{(['primary', 'accent_1', 'accent_3'] as const).map((k) => <i key={k} style={{ background: pl.colors[k] }} />)}</div>
            </button>
          ))}
        </div>
        <BaseColorEditor colors={p.theme.base} showKeys={advanced} onChange={(k, v) => update((d) => { d.theme.base[k] = v; d.paletteId = undefined; }, { merge: true })} />
        <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setKeysOpen(true)}>查看全部 68 个颜色用途</button>
      </div>

      <div>
        <div className="section-title">页面背景</div>
        <ColorPanel elements={PAGE_ELEMENTS} advanced={advanced} />
      </div>

      <div>
        <div className="section-title">版式 <Guess text="示例版式" /></div>
        <div className="row wrap">
          {TEMPLATES.map((t) => (
            <button key={t.id} className={`chip ${p.templateId === t.id ? 'on' : ''}`} onClick={() => { update((d) => applyTemplate(d, t.id)); notify(`已换成“${t.label}”，素材、文案和锁定的颜色用途都保留了`); }}>{t.label}</button>
          ))}
        </div>
        <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => { update((d) => resetUnlockedBindings(d)); notify('未锁定的元素已恢复默认颜色用途'); }}>恢复默认颜色用途（锁定的不变）</button>
      </div>

      <div>
        <div className="section-title">定制等级</div>
        <div className="row"><span>{LEVELS[p.level].label}</span><span className="spacer" /><button className="btn sm" onClick={() => setLevelOpen(true)}>更换</button></div>
      </div>

      <div>
        <div className="section-title">页面高度</div>
        <div className="row">
          <input className="input" type="number" style={{ width: 110 }} min={H5_CANVAS.defaultHeight} step={2} value={p.pages.home.height} onChange={(e) => update((d) => { d.pages.home.height = Math.max(H5_CANVAS.defaultHeight, Number(e.target.value) || H5_CANVAS.defaultHeight); }, { merge: true })} aria-label="页面高度" />
          <span className="hint">px，宽 {H5_CANVAS.width}，内容需要 {minH}</span>
        </div>
      </div>

      <label className="row hint" style={{ cursor: 'pointer' }}>
        <input type="checkbox" checked={advanced} onChange={(e) => setAdvanced(e.target.checked)} />显示高级信息（Key、规则、引用链）
      </label>

      {levelOpen && (
        <Modal title="更换定制等级" sub="更换不会删除任何设计。降级后范围外的内容保留草稿，但不计入交付。" onClose={() => setLevelOpen(false)} width={860}>
          <LevelPicker value={p.level} onChange={(l) => update((d) => { d.level = l; })} />
          {outOfScope(p.level, 'h5').length > 0 && <div className="hint" style={{ marginTop: 10 }}>当前不在范围内：{outOfScope(p.level, 'h5').map((c) => CATEGORIES[c].label).join('、')}</div>}
          <div className="row" style={{ marginTop: 16 }}><span className="spacer" /><button className="btn primary" onClick={() => setLevelOpen(false)}>完成</button></div>
        </Modal>
      )}
      {keysOpen && <KeysTable onClose={() => setKeysOpen(false)} />}
    </div>
  );
}

function KeysTable({ onClose }: { onClose: () => void }) {
  const { project } = useEditor();
  const p = project!;
  return (
    <Modal title="全部颜色用途（68 个 Key）" sub="基础色改动会沿引用自动更新；单独设置过的用途会标出。" onClose={onClose} width={820}>
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1.2fr 1fr 1.4fr', gap: '6px 10px', alignItems: 'center', fontSize: 13 }}>
        {ALL_KEYS.map((k) => {
          const r = resolveKey(p.theme, k, p.modes);
          const eff = isBaseKey(k) ? null : effectiveRule(p.theme, k as ExtKey);
          return [
            <Swatch key={k + 's'} css={r.ok ? r.css : 'transparent'} size={22} />,
            <span key={k + 'u'}>{keyUsage(k)}</span>,
            <code key={k + 'k'} className="hint">{k}</code>,
            <span key={k + 'r'} className="hint">
              {isBaseKey(k) ? `基础色 ${p.theme.base[k]}` : describeRule(eff!.rule)}
              {eff?.source === 'override' && <span className="badge warn" style={{ marginLeft: 6 }}>已单独设置</span>}
              {eff?.source === 'design' && <span className="badge" style={{ marginLeft: 6 }}>来自版式</span>}
              {!r.ok && <span className="badge err" style={{ marginLeft: 6 }}>未设置</span>}
            </span>,
          ];
        })}
      </div>
    </Modal>
  );
}
