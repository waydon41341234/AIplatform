import { useEffect, useMemo, useState } from 'react';
import { api, type ProjectSummary } from '../lib/api.ts';
import { go } from '../lib/router.ts';
import { Icon } from '../components/ui.tsx';
import { LEVELS } from '../../shared/catalog/levels.ts';
import type { Project } from '../../shared/project/model.ts';
import { renderHomeSvg } from '../../shared/render/svg.ts';

function Thumb({ id }: { id: string }) {
  const [p, setP] = useState<Project | null>(null);
  useEffect(() => { api.getProject(id).then(setP).catch(() => {}); }, [id]);
  const svg = useMemo(() => (p ? renderHomeSvg(p) : ''), [p]);
  return <div className="thumb"><div dangerouslySetInnerHTML={{ __html: svg }} /></div>;
}

export function ProjectsPage() {
  const [list, setList] = useState<ProjectSummary[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.listProjects().then(setList).catch((e) => setErr(e.message)); }, []);
  return (
    <div className="home">
      <section className="hero">
        <img className="brand-orb" src="/brand/logo-orb.webp" alt="" />
        <h1>为你的品牌定制一整套页面</h1>
        <p>选一个版式、确认品牌配色，再点哪里改哪里。规范尺寸和交付文件由平台自动处理，不需要懂设计参数。</p>
        <button className="btn primary lg" onClick={() => go('/new')}><Icon name="plus" />新建定制项目</button>
        <div className="steps-inline">
          <span><b>1</b>选等级和版式</span>
          <span><b>2</b>定品牌配色</span>
          <span><b>3</b>点选区域改页面</span>
          <span><b>4</b>检查并导出</span>
        </div>
      </section>
      <div className="row" style={{ marginTop: 36 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>我的项目</h2>
        <span className="spacer" />
      </div>
      {err && <div className="empty">项目列表加载失败：{err}</div>}
      {list && list.length === 0 && <div className="empty">还没有项目，点击上方「新建定制项目」开始。</div>}
      <div className="grid-projects">
        {list?.map((p) => (
          <div key={p.id} className="card pcard" role="button" tabIndex={0} onClick={() => go(`/p/${p.id}`)} onKeyDown={(e) => e.key === 'Enter' && go(`/p/${p.id}`)}>
            <Thumb id={p.id} />
            <div className="meta">
              <b>{p.name}</b>
              <div className="row hint">
                <span>{LEVELS[p.level].label}</span>·<span>{new Date(p.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="spacer" />
                <button className="btn ghost sm icon" title="复制项目" onClick={(e) => { e.stopPropagation(); api.duplicateProject(p.id).then(() => api.listProjects().then(setList)); }}><Icon name="copy" size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
