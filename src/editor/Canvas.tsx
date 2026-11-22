/** 画布：同一个 SVG 渲染器出图，上面叠加可点击的模块命中区。 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Seg } from '../components/ui.tsx';
import { renderHomeSvg } from '../../shared/render/svg.ts';
import { layoutHome } from '../../shared/render/layout.ts';
import { MODULES, type ModuleType } from '../../shared/catalog/home.ts';
import { H5_CANVAS } from '../../shared/catalog/specs.ts';

export function Canvas() {
  const { project, selection, select, update } = useEditor();
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<'fit' | 0.5 | 0.75 | 1>('fit');
  const [stageW, setStageW] = useState(600);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const page = project!.pages.home;
  // 打开侧边栏时回到顶部，侧边栏从页面顶部展开
  useEffect(() => { if (page.preview.sidebarOpen) stageRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [page.preview.sidebarOpen]);
  const lay = useMemo(() => layoutHome(page), [page]);
  // 预览时把画布延长到内容高度，超出部分以斜线标出（不默默裁掉）
  const viewH = Math.max(page.height, lay.contentHeight);
  const svg = useMemo(() => {
    const s = renderHomeSvg(project!);
    return viewH > page.height ? s.replace(/height="(\d+)" viewBox="0 0 (\d+) \d+"/, `height="${viewH}" viewBox="0 0 $2 ${viewH}"`) : s;
  }, [project, viewH, page.height]);

  const scale = zoom === 'fit' ? Math.min(0.62, (stageW - 64) / H5_CANVAS.width) : zoom;
  const W = H5_CANVAS.width * scale;
  const sel = selection.kind === 'module' ? selection.type : null;

  const boxes = Object.entries(lay.boxes) as [ModuleType, NonNullable<(typeof lay.boxes)[ModuleType]>][];
  // 浮层/固定层后画，命中优先
  boxes.sort((a, b) => order(a[0]) - order(b[0]));

  return (
    <div className="stage" ref={stageRef} onClick={(e) => e.target === e.currentTarget && select({ kind: 'page' })}>
      <div className="stage-bar">
        <span className="hint" style={{ padding: '0 6px' }}>预览状态</span>
        <Seg value={page.preview.loggedIn ? 'in' : 'out'} options={[{ value: 'out', label: '未登录' }, { value: 'in', label: '已登录' }]} onChange={(v) => update((d) => { d.pages.home.preview.loggedIn = v === 'in'; })} />
        <Seg value={page.preview.sidebarOpen ? 'open' : 'closed'} options={[{ value: 'closed', label: '首页' }, { value: 'open', label: '打开侧边栏' }]} onChange={(v) => { update((d) => { d.pages.home.preview.sidebarOpen = v === 'open'; }); if (v === 'open') select({ kind: 'module', type: 'sidebar' }); }} />
        <select className="select" style={{ width: 92, padding: '4px 8px', borderRadius: 999 }} value={String(zoom)} onChange={(e) => setZoom(e.target.value === 'fit' ? 'fit' : (Number(e.target.value) as 0.5))} aria-label="缩放">
          <option value="fit">适应</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
        </select>
      </div>

      {lay.overflow > 0 && (
        <div className="notice warn" style={{ width: W }}>
          <span>内容超出页面 {lay.overflow}px</span>
          <span className="spacer" />
          <button className="btn sm" onClick={() => update((d) => { d.pages.home.height = Math.ceil(lay.contentHeight / 2) * 2; })}>增加页面高度</button>
        </div>
      )}

      <div className="canvas-wrap" style={{ width: W, height: viewH * scale }}>
        <div className="svg-host" dangerouslySetInnerHTML={{ __html: svg }} />
        {viewH > page.height && (
          <>
            <div className="overflow-zone" style={{ top: page.height * scale }} />
            <div className="fold-line" style={{ top: page.height * scale }}><span>页面底部 {page.height}px</span></div>
          </>
        )}
        {boxes.map(([t, b]) => (
          <div
            key={t}
            className={`hit ${sel === t ? 'sel' : ''}`}
            style={{ left: b.x * scale, top: b.y * scale, width: b.w * scale, height: b.h * scale, zIndex: order(t) }}
            onClick={(e) => { e.stopPropagation(); select({ kind: 'module', type: t }); }}
            role="button"
            aria-label={`编辑${MODULES[t].label}`}
          >
            <span className="tag">{MODULES[t].label}</span>
          </div>
        ))}
      </div>
      <div className="hint" style={{ marginTop: 12 }}>H5 · {H5_CANVAS.width}×{page.height}px · 点击页面区域开始编辑</div>
    </div>
  );
}

function order(t: ModuleType): number {
  return t === 'sidebar' ? 4 : t === 'topbar' || t === 'bottomnav' ? 3 : 2;
}
