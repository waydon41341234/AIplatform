/** 检查结果：每条都能点击定位到对应模块。 */
import { useEditor } from '../state/editor.ts';
import { Modal } from '../components/ui.tsx';
import type { Issue } from '../../shared/project/checks.ts';
import { MODULE_TYPES, type ModuleType } from '../../shared/catalog/home.ts';
import { layoutHome } from '../../shared/render/layout.ts';

const SEV = { error: ['err', '必须处理'], warn: ['warn', '需要确认'], info: ['', '提示'] } as const;

export function ChecksDialog({ issues, onClose }: { issues: Issue[]; onClose: () => void }) {
  const { select, update, project } = useEditor();
  const errors = issues.filter((i) => i.severity === 'error').length;
  const locate = (i: Issue) => {
    if (i.fix === 'grow-height') {
      const h = layoutHome(project!.pages.home).contentHeight;
      update((d) => { d.pages.home.height = Math.ceil(h / 2) * 2; });
    } else if (i.module && MODULE_TYPES.includes(i.module as ModuleType)) select({ kind: 'module', type: i.module as ModuleType });
    else select({ kind: 'page' });
    onClose();
  };
  return (
    <Modal title={errors ? `还有 ${errors} 项需要完成` : '可以交付了'} sub="点击任一项直接去处理" onClose={onClose}>
      {issues.length === 0 && <div className="empty">没有发现问题</div>}
      {(['error', 'warn', 'info'] as const).map((sev) => {
        const list = issues.filter((i) => i.severity === sev);
        if (!list.length) return null;
        return (
          <div key={sev} style={{ marginBottom: 12 }}>
            <div className="hint" style={{ margin: '8px 0 4px' }}>{SEV[sev][1]}（{list.length}）</div>
            {list.map((i) => (
              <div key={i.id} className="issue" onClick={() => locate(i)} role="button" tabIndex={0}>
                <span className={`dot ${SEV[sev][0]}`} style={{ marginTop: 7 }} />
                <span style={{ flex: 1 }}>{i.message}</span>
                <span className="hint">{i.fix === 'grow-height' ? '一键增加高度' : '去处理'}</span>
              </div>
            ))}
          </div>
        );
      })}
    </Modal>
  );
}
