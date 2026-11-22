/** 右栏：没选模块时是“整页与主题”，选中模块时是 内容 / 布局 / 颜色。 */
import { useEffect, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { ModuleContent } from './ModuleContent.tsx';
import { LayoutPicker } from './LayoutPicker.tsx';
import { ColorPanel } from './ColorPanel.tsx';
import { PagePanel } from './PagePanel.tsx';
import { MODULES, MODULE_ELEMENTS } from '../../shared/catalog/home.ts';
import type { Issue } from '../../shared/project/checks.ts';
import { Icon } from '../components/ui.tsx';

type Tab = 'content' | 'layout' | 'color';

export function Inspector({ issues }: { issues: Issue[] }) {
  const { selection, project, update } = useEditor();
  const [tab, setTab] = useState<Tab>('content');
  const [advanced, setAdvanced] = useState(false);
  const key = selection.kind === 'module' ? selection.type : 'page';
  useEffect(() => setTab('content'), [key]);

  if (selection.kind === 'page') return <PagePanel advanced={advanced} setAdvanced={setAdvanced} />;

  const t = selection.type;
  const m = project!.pages.home.modules[t];
  const mine = issues.filter((i) => i.module === t && i.severity !== 'info');
  return (
    <div>
      <div className="tabs" role="tablist">
        {([['content', '内容'], ['layout', '布局'], ['color', '颜色']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{MODULES[t].label}</h3>
        <span className="spacer" />
        {!m.visible && <button className="btn sm" onClick={() => update((d) => { d.pages.home.modules[t].visible = true; })}><Icon name="eye" size={14} />显示</button>}
      </div>
      {mine.length > 0 && (
        <div className="notice warn" style={{ display: 'block' }}>
          {mine.slice(0, 3).map((i) => <div key={i.id}>· {i.message}</div>)}
          {mine.length > 3 && <div className="hint" style={{ marginTop: 4 }}>还有 {mine.length - 3} 项，点右上角「检查」查看全部</div>}
        </div>
      )}
      {tab === 'content' && <ModuleContent type={t} />}
      {tab === 'layout' && <LayoutPicker type={t} />}
      {tab === 'color' && (
        <>
          <ColorPanel elements={MODULE_ELEMENTS[t]} advanced={advanced} />
          <label className="row hint" style={{ marginTop: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={advanced} onChange={(e) => setAdvanced(e.target.checked)} />显示高级信息（Key、规则、引用链）
          </label>
        </>
      )}
    </div>
  );
}
