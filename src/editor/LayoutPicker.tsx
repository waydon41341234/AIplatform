/**
 * 区域布局选择：缩略图用业主自己的配色、文字和素材实时渲染，而不是静态参考图。
 * 选择即预览，「采用布局」后才写入；关闭不改变当前设计。
 */
import { useMemo, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Guess } from '../components/ui.tsx';
import { LAYOUTS, type ModuleType } from '../../shared/catalog/home.ts';
import { renderHomeSvg } from '../../shared/render/svg.ts';
import { layoutHome } from '../../shared/render/layout.ts';
import { cropSvg } from './svgCrop.ts';

export function LayoutPicker({ type }: { type: ModuleType }) {
  const { project, update } = useEditor();
  const cur = project!.pages.home.modules[type].layoutId;
  const [pending, setPending] = useState(cur);
  const options = LAYOUTS[type];

  const thumbs = useMemo(() => options.map((l) => {
    const p = structuredClone(project!);
    p.pages.home.modules[type].layoutId = l.id;
    p.pages.home.modules[type].visible = true;
    if (type === 'sidebar') p.pages.home.preview.sidebarOpen = true;
    const box = layoutHome(p.pages.home).boxes[type];
    const svg = renderHomeSvg(p);
    return { l, svg: box ? cropSvg(svg, type === 'sidebar' ? { ...box, h: 700 } : box) : svg };
  }), [project, type, options]);

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="hint">用你的配色和素材预览</span>
        <span className="spacer" />
        <Guess text="示例布局" />
      </div>
      <div className="layout-grid">
        {thumbs.map(({ l, svg }) => (
          <div key={l.id} className={`layout-opt ${pending === l.id ? 'on' : ''}`} onClick={() => setPending(l.id)} role="radio" aria-checked={pending === l.id} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setPending(l.id)}>
            <div className="mini" dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="row" style={{ fontSize: 13 }}>{l.label}{cur === l.id && <span className="badge ok">使用中</span>}</div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <span className="spacer" />
        {pending !== cur && <button className="btn ghost sm" onClick={() => setPending(cur)}>取消</button>}
        <button className="btn primary sm" disabled={pending === cur} onClick={() => update((d) => { d.pages.home.modules[type].layoutId = pending; })}>采用布局</button>
      </div>
      <div className="hint" style={{ marginTop: 10 }}>换布局不会丢失已采用的素材、文案和配色，也不收费。可随时撤销。</div>
    </div>
  );
}
