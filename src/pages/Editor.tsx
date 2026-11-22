/** 编辑器页面：顶栏 + 左侧页面/模块 + 中间画布 + 右侧属性。 */
import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { go } from '../lib/router.ts';
import { Icon } from '../components/ui.tsx';
import { LEVELS } from '../../shared/catalog/levels.ts';
import { runChecks } from '../../shared/project/checks.ts';
import { PageTree } from '../editor/PageTree.tsx';
import { Canvas } from '../editor/Canvas.tsx';
import { Inspector } from '../editor/Inspector.tsx';
import { ChecksDialog } from '../editor/ChecksDialog.tsx';
import { ExportDialog } from '../editor/ExportDialog.tsx';

const SAVE_TEXT = { saved: '已自动保存', dirty: '有未保存的修改', saving: '正在保存…', error: '保存失败，稍后自动重试', conflict: '项目在其他窗口被修改，请刷新' } as const;

export function EditorPage({ id }: { id: string }) {
  const { project, load, undo, redo, past, future, saveState, toast, flush } = useEditor();
  const [err, setErr] = useState('');
  const [dialog, setDialog] = useState<'checks' | 'export' | null>(null);

  useEffect(() => { load(id).catch((e) => setErr(e.message)); }, [id, load]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [undo, redo]);

  const issues = useMemo(() => (project ? runChecks(project) : []), [project]);
  const errors = issues.filter((i) => i.severity === 'error').length;

  if (err) return <div className="home"><div className="empty">项目打开失败：{err} <br /><br /><button className="btn" onClick={() => go('/')}>返回项目列表</button></div></div>;
  if (!project) return <div className="home"><div className="empty">正在打开项目…</div></div>;

  return (
    <div className="editor">
      <header className="topbar">
        <button className="btn ghost icon" aria-label="返回项目列表" onClick={async () => { await flush(); go('/'); }}><Icon name="back" /></button>
        <span className="title">{project.name}</span>
        <span className="badge">{LEVELS[project.level].label}</span>
        <span className={`save-state`} style={saveState === 'error' || saveState === 'conflict' ? { color: 'var(--err)' } : undefined}>{SAVE_TEXT[saveState]}</span>
        <span className="spacer" />
        <button className="btn ghost icon" title="撤销 (Ctrl+Z)" aria-label="撤销" disabled={!past.length} onClick={undo}><Icon name="undo" /></button>
        <button className="btn ghost icon" title="重做 (Ctrl+Shift+Z)" aria-label="重做" disabled={!future.length} onClick={redo}><Icon name="redo" /></button>
        <button className="btn" onClick={() => setDialog('checks')}>
          {errors ? <span className="dot err" /> : <span className="dot ok" />}检查{errors ? ` · ${errors} 项待完成` : ''}
        </button>
        <button className="btn primary" onClick={() => setDialog('export')}><Icon name="download" />导出</button>
      </header>
      <div className="workspace">
        <aside className="panel"><PageTree issues={issues} /></aside>
        <Canvas />
        <aside className="panel right"><Inspector issues={issues} /></aside>
      </div>
      {dialog === 'checks' && <ChecksDialog issues={issues} onClose={() => setDialog(null)} />}
      {dialog === 'export' && <ExportDialog issues={issues} onClose={() => setDialog(null)} />}
      {toast && <div className={`toast ${toast.err ? 'err' : ''}`} role="status">{toast.text}</div>}
    </div>
  );
}
