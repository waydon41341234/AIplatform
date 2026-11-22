/** 导出：PNG（1x/2x）、SVG、素材与数据文件打成一个 zip。Figma 源文件待验证样板通过后开放。 */
import { useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Icon, Modal } from '../components/ui.tsx';
import { buildZip, type ExportOptions } from '../lib/export.ts';
import { download } from '../lib/image.ts';
import type { Issue } from '../../shared/project/checks.ts';

export function ExportDialog({ issues, onClose }: { issues: Issue[]; onClose: () => void }) {
  const { project, flush, notify } = useEditor();
  const [o, setO] = useState<ExportOptions>({ png1x: true, png2x: true, svg: true, assets: true, data: true, states: ['loggedOut', 'loggedIn'] });
  const [busy, setBusy] = useState(false);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const box = (k: keyof Omit<ExportOptions, 'states'>, label: string, hint: string) => (
    <label className="row" style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
      <input type="checkbox" checked={o[k]} onChange={(e) => setO({ ...o, [k]: e.target.checked })} style={{ marginTop: 4 }} />
      <span><b style={{ fontWeight: 500 }}>{label}</b><br /><span className="hint">{hint}</span></span>
    </label>
  );
  const state = (s: 'loggedOut' | 'loggedIn', label: string) => (
    <label className="chip" style={{ cursor: 'pointer' }}>
      <input type="checkbox" checked={o.states.includes(s)} onChange={(e) => setO({ ...o, states: e.target.checked ? [...o.states, s] : o.states.filter((x) => x !== s) })} />{label}
    </label>
  );
  const run = async () => {
    setBusy(true);
    try {
      await flush();
      const { blob, draft } = await buildZip(project!, o);
      download(blob, `${project!.name}-首页${draft ? '-草稿' : ''}.zip`);
      notify(draft ? '已导出草稿包，交付清单里列出了未完成项' : '交付包已导出');
      onClose();
    } catch (e) {
      notify(`导出失败：${(e as Error).message}`, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="导出设计" sub="首页 H5 · 750 宽" onClose={onClose}>
      {errors > 0 && <div className="notice warn"><Icon name="alert" />还有 {errors} 项必交问题，导出的将是草稿包。</div>}
      <div className="stack">
        {box('png1x', 'PNG 整页 1x', '750 宽，用于预览和确认')}
        {box('png2x', 'PNG 整页 2x', '1500 宽，高清预览')}
        {box('svg', 'SVG 整页', '保留文字、形状和颜色用途标识，图片会内嵌')}
        {box('assets', '独立素材', '按规范尺寸命名，导航图标为 @2x')}
        {box('data', '配色与项目数据', 'theme.json（68 个颜色用途）和 project.json')}
        <div className="row wrap"><span className="hint">页面状态</span>{state('loggedOut', '未登录')}{state('loggedIn', '已登录')}</div>
        <label className="row" style={{ opacity: 0.5, alignItems: 'flex-start' }}>
          <input type="checkbox" disabled style={{ marginTop: 4 }} />
          <span><b style={{ fontWeight: 500 }}>Figma 源文件</b><br /><span className="hint">需先完成 Figma 验证样板，验证通过后开放</span></span>
        </label>
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        <span className="hint">交付清单和 manifest.json 总会包含在内</span>
        <span className="spacer" />
        <button className="btn primary" disabled={busy || o.states.length === 0} onClick={run}>{busy ? '正在打包…' : '导出 zip'}</button>
      </div>
    </Modal>
  );
}
